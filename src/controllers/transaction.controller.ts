import { Request, Response } from 'express'
import { createTransactionSchema } from '../validations/transaction.validation'
import { prisma } from '../prisma/client'
import { ensureDailyCashOpen } from './cash.controller'
import { Category, TransactionType } from '@prisma/client'

export const createTransaction = async (req: Request, res: Response) => {
  try {
    if (!req.userId || !req.churchId) {
      return res.status(401).json({ error: 'Usuário ou igreja não autenticados' })
    }

    const userId = req.userId
    const churchId = req.churchId

    const validatedData = createTransactionSchema.parse(req.body)

    // ⚙️ Validação extra: se for BANK, precisa ter bankAccountId
    if (validatedData.paymentMethod === 'BANK' && !validatedData.bankAccountId) {
      return res.status(400).json({ error: 'Conta bancária obrigatória para transações via banco.' })
    }

    // ⚙️ Se for CASH, limpa qualquer bankAccountId que venha por engano
    if (validatedData.paymentMethod === 'CASH') {
      validatedData.bankAccountId = undefined
    }

    // ✅ Cria a transação
    const newTransaction = await prisma.transaction.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        createdById: userId,
        churchId,
      },
    })

    // 🧾 Log de criação
    await prisma.logEntry.create({
      data: {
        action: 'CREATE',
        entity: 'Transaction',
        entityId: newTransaction.id,
        userId,
        churchId,
        description: `Transação ${validatedData.type} de R$ ${validatedData.amount} via ${validatedData.paymentMethod}`,
      },
    })

    return res.status(201).json(newTransaction)
  } catch (error: any) {
    console.error('Erro ao criar transação:', error)
    return res.status(400).json({ error: error.message || 'Erro ao criar transação' })
  }
}

export const listTransactions = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const userId = req.userId
    const {
      startDate,
      endDate,
      type,
      page = 1,
      perPage = 10
    } = req.query

    const filters: any = {
      //createdById: userId,
    }

    if (type && (type === 'INCOME' || type === 'EXPENSE')) {
      filters.type = type
    }

    if (startDate || endDate) {
      filters.date = {}
      if (startDate) filters.date.gte = new Date(startDate as string)
      if (endDate) filters.date.lte = new Date(endDate as string)
    }

    const skip = (Number(page) - 1) * Number(perPage)

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: filters,
        orderBy: { date: 'desc' },
        include: {
          category: true,
          createdBy: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        skip,
        take: Number(perPage)
      }),
      prisma.transaction.count({ where: filters })
    ])

    return res.json({
      data: transactions,
      total,
      page: Number(page),
      perPage: Number(perPage),
      totalPages: Math.ceil(total / Number(perPage))
    })
  } catch (error: any) {
    console.error('[listTransactions] ERRO:', error)
    return res.status(500).json({ error: 'Erro ao buscar transações financeiras' })
  }
}
