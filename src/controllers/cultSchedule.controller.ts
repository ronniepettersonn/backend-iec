import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { createCultScheduleSchema, updateCultScheduleSchema } from '../validations/cultSchedule.validation'

// Criar uma nova escala de culto
export const createCultSchedule = async (req: Request, res: Response) => {
    const result = createCultScheduleSchema.safeParse(req.body)

    if (!result.success) {
    return res.status(400).json({ error: result.error.format() })
  }

  const { cultId, preacherId, directorId, notes } = result.data

  try {
    const newSchedule = await prisma.cultSchedule.create({
      data: {
        cultId,
        preacherId,
        directorId,
        notes
      },
      include: {
        preacher: true,
        director: true,
        cult: true
      }
    })

    return res.status(201).json(newSchedule)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao criar escala de culto' })
  }
}

// Listar escalas de culto com paginação
export const listCultSchedules = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query

  try {
    const skip = (Number(page) - 1) * Number(limit)

    const [schedules, total] = await Promise.all([
      prisma.cultSchedule.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          preacher: true,
          director: true,
          cult: true
        }
      }),
      prisma.cultSchedule.count()
    ])

    return res.status(200).json({ schedules, total })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar escalas de culto' })
  }
}

// Atualizar uma escala de culto
export const updateCultSchedule = async (req: Request, res: Response) => {
    const result = updateCultScheduleSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({ error: result.error.format() })
  }

  const { id } = req.params
  const { preacherId, directorId, notes } = result.data

  try {
    const updated = await prisma.cultSchedule.update({
      where: { id },
      data: {
        preacherId,
        directorId,
        notes
      }
    })

    return res.status(200).json(updated)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao atualizar escala de culto' })
  }
}

// Deletar uma escala de culto
export const deleteCultSchedule = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await prisma.cultSchedule.delete({ where: { id } })
    return res.status(204).send()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao deletar escala de culto' })
  }
}