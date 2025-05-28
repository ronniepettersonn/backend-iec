import { Request, Response } from 'express'
import { createTransactionSchema } from '../validations/transaction.validation'
import { prisma } from '../prisma/client'

export const createTransaction = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const userId = req.userId
    const validatedData = createTransactionSchema.parse(req.body)

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