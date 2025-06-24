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

    const userId = req.userId
    const churchId = req.churchId

    if (!userId || !churchId) {
      return res.status(401).json({ error: 'Usuário ou igreja não autenticados' })
    }

    const newRecurrence = await prisma.recurrence.create({
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate,
        status,
        churchId
      }
    })

    await generateAccountsFromRecurrence(newRecurrence, userId, churchId)

    return res.status(201).json(newRecurrence)
  } catch (error: any) {
    console.error(error)
    return res.status(400).json({ error: error.message })
  }
}


export const listRecurrences = async (req: Request, res: Response) => {
  try {
    const churchId = req.churchId

    if (!churchId) {
      return res.status(401).json({ error: 'Igreja não autenticada' })
    }

    const { page = '1', limit = '10' } = req.query

    const pageNumber = parseInt(page as string, 10)
    const limitNumber = parseInt(limit as string, 10)
    const skip = (pageNumber - 1) * limitNumber

    const [recurrences, total] = await Promise.all([
      prisma.recurrence.findMany({
        where: { churchId },
        include: { category: true },
        orderBy: { startDate: 'desc' },
        skip,
        take: limitNumber,
      }),
      prisma.recurrence.count({ where: { churchId } }),
    ])

    return res.json({
      data: recurrences,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    })
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
