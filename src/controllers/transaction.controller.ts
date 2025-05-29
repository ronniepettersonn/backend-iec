import { Request, Response } from 'express'
import { createTransactionSchema } from '../validations/transaction.validation'
import { prisma } from '../prisma/client'
import { ensureDailyCashOpen } from './cash.controller'
import { Category, TransactionType } from '@prisma/client'

export const createTransaction = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const userId = req.userId
    const validatedData = createTransactionSchema.parse(req.body)

    await ensureDailyCashOpen(userId)

    const newTransaction = await prisma.transaction.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        createdById: userId
      }
    })

    return res.status(201).json(newTransaction)
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export const listTransactions = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { page = '1', limit = '10', type, category, startDate, endDate } = req.query
    const pageNumber = parseInt(page as string)
    const pageSize = parseInt(limit as string)
    const skip = (pageNumber - 1) * pageSize

    const where: any = {
      createdById: req.userId,
      ...(type ? { type: type as TransactionType } : {}),
      ...(category ? { category: category as string } : {})
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(new Date(endDate as string).setHours(23, 59, 59, 999))
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { date: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    const totalCount = await prisma.transaction.count({ where })

    return res.json({
      data: transactions,
      meta: {
        total: totalCount,
        page: pageNumber,
        perPage: pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar transações' })
  }
}
