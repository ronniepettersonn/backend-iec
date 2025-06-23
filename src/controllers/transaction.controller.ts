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

    // Garante que o caixa de hoje está aberto
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dailyCash = await ensureDailyCashOpen(userId, churchId)

    if (!dailyCash) {
      return res.status(400).json({
        error: 'Caixa do dia não está disponível. Tente novamente mais tarde ou contate o administrador.',
      })
    }

    // Só permite lançamento para o dia do caixa
    const transactionDate = new Date(validatedData.date)
    transactionDate.setHours(0, 0, 0, 0)

    if (transactionDate.getTime() !== today.getTime()) {
      return res.status(400).json({
        error: 'As transações só podem ser lançadas na data atual com o caixa aberto.',
      })
    }

    // Se for EXPENSE, verifica saldo disponível
    if (validatedData.type === 'EXPENSE') {
      const transactions = await prisma.transaction.findMany({
        where: {
          churchId,
          date: {
            gte: dailyCash.date,
            lt: new Date(dailyCash.date.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      })

      const saldoAtual = dailyCash.openingAmount +
        transactions.filter(tx => tx.type === 'INCOME').reduce((acc, tx) => acc + tx.amount, 0) -
        transactions.filter(tx => tx.type === 'EXPENSE').reduce((acc, tx) => acc + tx.amount, 0)

      if (validatedData.amount > saldoAtual) {
        return res.status(400).json({ error: 'Saldo insuficiente no caixa para realizar esta transação' })
      }
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        createdById: userId,
        churchId,
      },
    })

    await prisma.logEntry.create({
      data: {
        action: 'CREATE',
        entity: 'Transaction',
        entityId: newTransaction.id,
        userId,
        churchId,
        description: `Transação de ${validatedData.type} no valor de R$ ${validatedData.amount}`,
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
      createdById: userId,
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
