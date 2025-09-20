import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { z } from 'zod'
import { ensureDailyCashOpen } from './cash.controller'

export const createAccountReceivableSchema = z.object({
  dueDate: z.string().datetime(),                 // pode trocar por z.coerce.date() se preferir
  amount: z.number().positive(),
  description: z.string().min(3),
  categoryId: z.string().uuid().optional(),
  received: z.boolean().optional(),
  memberId: z.string().uuid().optional(),
  // usados só para criar o lançamento quando received=true:
  paymentMethod: z.enum(['BANK', 'CASH']).optional(),
  bankAccountId: z.string().uuid().optional(),
}).superRefine((d, ctx) => {
  if (d.received) {
    if (!d.paymentMethod) {
      ctx.addIssue({ code: 'custom', message: 'Informe o método de pagamento (BANK ou CASH)', path: ['paymentMethod'] })
    }
    if (d.paymentMethod === 'BANK' && !d.bankAccountId) {
      ctx.addIssue({ code: 'custom', message: 'bankAccountId é obrigatório quando paymentMethod = BANK', path: ['bankAccountId'] })
    }
  }
})

export const createAccountReceivable = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    const churchId = req.user?.churchId
    if (!userId || !churchId) {
      return res.status(401).json({ error: 'Usuário não autenticado ou sem igreja vinculada' })
    }

    const validated = createAccountReceivableSchema.parse(req.body)

    // validações de integridade
    if (validated.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: validated.categoryId } })
      if (!category) return res.status(400).json({ error: 'Categoria não encontrada' })
      if (category.type !== 'INCOME') return res.status(400).json({ error: 'Categoria deve ser do tipo "Entrada"' })
      if (category.churchId !== churchId) return res.status(403).json({ error: 'Categoria não pertence à sua igreja' })
    }
    if (validated.memberId) {
      const member = await prisma.member.findUnique({ where: { id: validated.memberId } })
      if (!member || member.churchId !== churchId) {
        return res.status(403).json({ error: 'Membro não pertence à sua igreja' })
      }
    }
    if (validated.received && validated.paymentMethod === 'BANK' && validated.bankAccountId) {
      const bank = await prisma.bankAccount.findUnique({ where: { id: validated.bankAccountId } })
      if (!bank || bank.churchId !== churchId) {
        return res.status(403).json({ error: 'Conta bancária não pertence à sua igreja' })
      }
    }

    // ❗ Remover campos que NÃO existem no modelo de AccountReceivable
    const {
      paymentMethod,   // só pro lançamento
      bankAccountId,   // só pro lançamento
      ...rest
    } = validated

    // Monta dados da conta
    const accountData = {
      ...rest,
      dueDate: new Date(validated.dueDate),
      receivedAt: validated.received ? new Date() : undefined,
      received: validated.received ?? false,
      createdById: userId,
      memberId: validated.memberId || null,
      churchId,
    }

    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.accountReceivable.create({ data: accountData })

      if (account.received) {
        await tx.transaction.create({
          data: {
            amount: account.amount,
            date: new Date(),
            type: 'INCOME',
            description: account.description,
            categoryId: account.categoryId ?? undefined,
            paymentMethod: paymentMethod!,                 // existe por causa do refine
            bankAccountId: paymentMethod === 'BANK' ? bankAccountId! : null,
            createdById: userId,
            churchId,
            // bom ter a referência:
            accountReceivableId: account.id,              // adicione este campo no seu modelo Transaction
          }
        })
      }

      return account
    })

    return res.status(201).json(result)
  } catch (error: any) {
    console.error(error)
    return res.status(400).json({ error: error.message })
  }
}

/* export const createAccountReceivable = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    const churchId = req.user?.churchId

    if (!userId || !churchId) {
      return res.status(401).json({ error: 'Usuário não autenticado ou sem igreja vinculada' })
    }

    const validated = createAccountReceivableSchema.parse(req.body)

    if (validated.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validated.categoryId }
      })

      if (!category) {
        return res.status(400).json({ error: 'Categoria não encontrada' })
      }

      if (category.type !== 'INCOME') {
        return res.status(400).json({ error: 'Categoria deve ser do tipo "Entrada"' })
      }

      if (category.churchId !== churchId) {
        return res.status(403).json({ error: 'Categoria não pertence à sua igreja' })
      }
    }

    const data = {
      ...validated,
      dueDate: new Date(validated.dueDate),
      receivedAt: validated.received ? new Date() : undefined,
      received: validated.received ?? false,
      createdById: userId,
      memberId: validated.memberId || null,
      churchId,
    }

    const account = await prisma.accountReceivable.create({ data })

    if (account.received) {
      // ⚠️ Novo: exige `paymentMethod`
      const paymentMethod = validated.paymentMethod
      const bankAccountId = validated.bankAccountId ?? null

      if (!paymentMethod) {
        return res.status(400).json({ error: 'Informe o método de pagamento (BANK ou CASH)' })
      }

      await prisma.transaction.create({
        data: {
          amount: account.amount,
          date: new Date(),
          type: 'INCOME',
          description: account.description,
          categoryId: account.categoryId ?? undefined,
          paymentMethod,
          bankAccountId: paymentMethod === 'BANK' ? bankAccountId : null,
          createdById: userId,
          churchId,
        }
      })
    }

    return res.status(201).json(account)
  } catch (error: any) {
    console.error(error)
    return res.status(400).json({ error: error.message })
  }
} */

export const markAsReceived = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    const churchId = req.user?.churchId

    if (!userId || !churchId) {
      return res.status(401).json({ error: 'Usuário não autenticado ou sem igreja vinculada' })
    }

    const accountId = req.params.id

    const account = await prisma.accountReceivable.findUnique({
      where: { id: accountId }
    })

    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada' })
    }

    if (account.churchId !== churchId) {
      return res.status(403).json({ error: 'Conta não pertence à sua igreja' })
    }

    if (account.received) {
      return res.status(400).json({ error: 'Conta já recebida' })
    }

    // ⚠️ Novo: precisa do método de pagamento na marcação
    const { paymentMethod, bankAccountId } = req.body

    if (!paymentMethod || !['BANK', 'CASH'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Método de pagamento obrigatório: BANK ou CASH' })
    }

    const now = new Date()

    const updated = await prisma.accountReceivable.update({
      where: { id: accountId },
      data: {
        received: true,
        receivedAt: now
      }
    })

    await prisma.transaction.create({
      data: {
        amount: updated.amount,
        date: now,
        type: 'INCOME',
        description: updated.description,
        categoryId: updated.categoryId ?? undefined,
        paymentMethod,
        bankAccountId: paymentMethod === 'BANK' ? bankAccountId : null,
        createdById: userId,
        churchId,
      }
    })

    return res.status(200).json(updated)
  } catch (error: any) {
    console.error(error)
    return res.status(400).json({ error: error.message })
  }
}

export const listAccountsReceivable = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

    const {
      startDate,
      endDate,
      categoryId,
      paid,
      memberId,
      page = 1,
      perPage = 10
    } = req.query

    const filters: any = {
      //createdById: userId,
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

    if (memberId) {
      filters.memberId = memberId
    }

    const skip = (Number(page) - 1) * Number(perPage)

    const [accounts, total] = await Promise.all([
      prisma.accountReceivable.findMany({
        where: filters,
        include: {
          category: true,
          member: true,
          createdBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: { dueDate: 'asc' },
        skip,
        take: Number(perPage),
      }),
      prisma.accountReceivable.count({ where: filters }),
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
    return res.status(500).json({ error: 'Erro ao listar contas a receber' })
  }
}

export const deleteAccountReceivable = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    const churchId = req.user?.churchId

    if (!userId || !churchId) {
      return res.status(401).json({ error: 'Usuário não autenticado ou sem igreja vinculada' })
    }

    const accountId = req.params.id

    const account = await prisma.accountReceivable.findUnique({
      where: { id: accountId }
    })

    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada' })
    }

    if (account.churchId !== churchId) {
      return res.status(403).json({ error: 'Conta não pertence à sua igreja' })
    }

    await prisma.accountReceivable.delete({ where: { id: accountId } })

    await prisma.logEntry.create({
      data: {
        action: 'DELETE',
        entity: 'AccountReceivable',
        entityId: accountId,
        userId,
        churchId,
        description: `Conta a receber de R$ ${account.amount} excluída`
      }
    })

    return res.status(204).send()
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}
