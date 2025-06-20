import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { createAccountPayableSchema, updateAccountPayableSchema } from '../validations/accountPayable.validation'
import { ensureDailyCashOpen } from './cash.controller'
import { uploadFileToSupabase } from '../utils/uploadFile'

export const listAccountsPayable = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const {
      startDate,
      endDate,
      categoryId,
      paid,
      recurrence,
      page = 1,
      perPage = 10
    } = req.query

    const filters: any = {
      createdById: req.userId,
    }

    if (startDate && endDate) {
      filters.dueDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      }
    }

    if (categoryId) {
      filters.categoryId = categoryId
    }

    if (paid === 'true') {
      filters.paid = true
    } else if (paid === 'false') {
      filters.paid = false
    }

    if (recurrence === 'true') {
      filters.recurrenceId = { not: null }
    } else if (recurrence === 'false') {
      filters.recurrenceId = null
    }

    const skip = (Number(page) - 1) * Number(perPage)

    const [accounts, total] = await Promise.all([
      prisma.accountPayable.findMany({
        where: filters,
        include: {
          category: true,
          recurrence: true,
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
        skip,
        take: Number(perPage),
      }),
      prisma.accountPayable.count({ where: filters }),
    ])

    return res.json({
      data: accounts,
      total,
      page: Number(page),
      perPage: Number(perPage),
      totalPages: Math.ceil(total / Number(perPage)),
    })
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar contas a pagar' })
  }
}

export const createAccountPayable = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const validatedData = createAccountPayableSchema.parse(req.body)

    // 🔎 Valida a categoria como EXPENSE
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId }
      })

      if (!category) {
        return res.status(400).json({ error: 'Categoria não encontrada' })
      }

      if (category.type !== 'EXPENSE') {
        return res.status(400).json({ error: 'Categoria deve ser do tipo "Saída"' })
      }
    }

    const newAccount = await prisma.accountPayable.create({
      data: {
        ...validatedData,
        dueDate: new Date(validatedData.dueDate),
        createdById: req.userId,
      },
    })

    if (newAccount.recurrenceId) {
      await prisma.recurrence.update({
        where: { id: newAccount.recurrenceId },
        data: { status: 'active' }
      })
    }

    return res.status(201).json(newAccount)
  } catch (error: any) {
    console.error(error)
    return res.status(400).json({ error: error.message })
  }
}

export const markAccountAsPaid = async (req: Request, res: Response) => {
  try {
    const accountId = req.params.id
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const account = await prisma.accountPayable.findUnique({
      where: { id: accountId },
      include: { category: true },
    })

    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada' })
    }

    if (account.paid) {
      return res.status(400).json({ error: 'Conta já está marcada como paga' })
    }

    // 📅 Garante que há caixa aberto hoje (automaticamente)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dailyCash = await ensureDailyCashOpen(userId)

    if (!dailyCash) {
      return res.status(400).json({
        error: 'Caixa do dia não está disponível. Tente novamente mais tarde ou contate o administrador.',
      })
    }

    // 💰 Busca todas as transações do caixa do dia (independente do usuário)
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: dailyCash.date,
          lt: new Date(dailyCash.date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })

    const saldoAtual = dailyCash.openingAmount + transactions
      .filter(tx => tx.type === 'INCOME')
      .reduce((acc, tx) => acc + tx.amount, 0) -
      transactions
        .filter(tx => tx.type === 'EXPENSE')
        .reduce((acc, tx) => acc + tx.amount, 0)

    if (account.amount > saldoAtual) {
      return res.status(400).json({
        error: 'Saldo insuficiente no caixa para pagar esta conta. Faça uma entrada de valor antes ou ajuste o caixa.',
      })
    }

    // ✅ Marca como paga
    const now = new Date()
    await prisma.accountPayable.update({
      where: { id: accountId },
      data: {
        paid: true,
        paidAt: now,
      },
    })

    // 💳 Cria transação vinculada
    await prisma.transaction.create({
      data: {
        amount: account.amount,
        date: now,
        type: 'EXPENSE',
        description: `Pagamento de conta: ${account.description}`,
        categoryId: account.categoryId ?? undefined,
        createdById: userId,
      },
    })

    // 🧾 Log da operação
    await prisma.logEntry.create({
      data: {
        action: 'UPDATE',
        entity: 'AccountPayable',
        entityId: accountId,
        userId,
        description: `Conta ${account.description} marcada como paga.`,
      },
    })

    if (account.recurrenceId) {
      const unpaidCount = await prisma.accountPayable.count({
        where: {
          recurrenceId: account.recurrenceId,
          paid: false
        }
      })

      const recurrence = await prisma.recurrence.findUnique({
        where: { id: account.recurrenceId }
      })

      const now = new Date()
      const isExpired = recurrence?.endDate && recurrence.endDate < now

      const newStatus = unpaidCount === 0
        ? 'completed'
        : isExpired
          ? 'expired'
          : 'active'

      await prisma.recurrence.update({
        where: { id: account.recurrenceId },
        data: { status: newStatus }
      })
    }

    return res.status(200).json({ message: 'Conta marcada como paga com sucesso' })

  } catch (error) {
    console.error('Erro ao marcar conta como paga:', error)
    return res.status(500).json({ error: 'Erro ao processar o pagamento da conta' })
  }
}

export const updateAccountPayable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const validatedData = updateAccountPayableSchema.parse(req.body)

    const updated = await prisma.accountPayable.update({
      where: { id },
      data: validatedData,
    })

    return res.json(updated)
  } catch (error: any) {
    console.error(error)
    return res.status(400).json({ error: error.message || 'Erro ao atualizar conta' })
  }
}

export const deleteAccountPayable = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const existing = await prisma.accountPayable.findUnique({ where: { id } })

    if (!existing) {
      return res.status(404).json({ error: 'Conta a pagar não encontrada' })
    }

    await prisma.accountPayable.delete({ where: { id } })

    await prisma.logEntry.create({
      data: {
        action: 'DELETE',
        entity: 'AccountPayable',
        entityId: id,
        userId: req.userId,
        description: `Conta a pagar '${existing.description}' excluída`,
      }
    })

    return res.status(204).send()
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao excluir conta a pagar' })
  }
}


export const uploadAccountPayableAttachment = async (req: Request, res: Response) => {
  try {
    const { accountPayableId } = req.params

    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não enviado' })
    }

    const upload = await uploadFileToSupabase(req.file, 'account-payable')

    const updated = await prisma.accountPayable.update({
      where: { id: accountPayableId },
      data: {
        attachmentUrl: upload.publicUrl,
        fileName: req.file.originalname
      }
    })

    return res.status(200).json({
      message: 'Anexo salvo com sucesso',
      attachmentUrl: updated.attachmentUrl
    })
  } catch (error: any) {
    console.error('[uploadAccountPayableAttachment] ERRO:', error)
    return res.status(500).json({ error: 'Erro ao anexar comprovante' })
  }
}