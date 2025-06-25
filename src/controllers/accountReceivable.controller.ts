import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { z } from 'zod'
import { ensureDailyCashOpen } from './cash.controller'

const createAccountReceivableSchema = z.object({
  dueDate: z.string().datetime(),
  amount: z.number().positive(),
  description: z.string().min(3),
  categoryId: z.string().optional(),
  memberId: z.string().optional(),
  received: z.boolean().optional()
})

export const createAccountReceivable = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    const churchId = req.user?.churchId

    if (!userId || !churchId) {
      return res.status(401).json({ error: 'Usuário não autenticado ou sem igreja vinculada' })
    }

    const validated = createAccountReceivableSchema.parse(req.body)

    // 🔍 Validação do tipo de categoria
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

      // ⚠️ Confere se a categoria pertence à igreja
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

    // 💰 Se já recebido, cria a transação
    if (account.received) {
      await ensureDailyCashOpen(userId, churchId)
      await prisma.transaction.create({
        data: {
          amount: account.amount,
          date: new Date(),
          type: 'INCOME',
          description: account.description,
          categoryId: account.categoryId,
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
}

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

    await ensureDailyCashOpen(userId, churchId)

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
