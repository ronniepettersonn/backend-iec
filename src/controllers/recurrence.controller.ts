import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { createRecurrenceSchema, updateRecurrenceSchema } from '../validations/recurrence.validation'
import { generateAccountsFromRecurrence } from '../services/recurrence.service'

export const createRecurrence = async (req: Request, res: Response) => {
  try {
    const validatedData = createRecurrenceSchema.parse(req.body)

    const now = new Date()
    const endDate = validatedData.endDate ? new Date(validatedData.endDate) : undefined

    // 📌 Define status baseado na data final
    let status: 'active' | 'completed' | 'expired' = 'active'

    if (endDate && endDate < now) {
      status = 'expired'
    }

    const newRecurrence = await prisma.recurrence.create({
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate,
        status,
      }
    })

    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    await generateAccountsFromRecurrence(newRecurrence, req.userId)

    return res.status(201).json(newRecurrence)
  } catch (error: any) {
    console.error(error)
    return res.status(400).json({ error: error.message })
  }
}

export const listRecurrences = async (_req: Request, res: Response) => {
  try {
    const recurrences = await prisma.recurrence.findMany({
      include: { category: true },
      orderBy: { startDate: 'desc' }
    })
    return res.json(recurrences)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar recorrências' })
  }
}

export const updateRecurrence = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const validatedData = updateRecurrenceSchema.parse(req.body)

    const recurrence = await prisma.recurrence.update({
      where: { id },
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined
      }
    })

    return res.json(recurrence)
  } catch (error: any) {
    console.error(error)
    return res.status(400).json({ error: error.message })
  }
}


export const deleteRecurrence = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await prisma.recurrence.delete({
      where: { id }
    })
    return res.status(204).send()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao deletar recorrência' })
  }
}
