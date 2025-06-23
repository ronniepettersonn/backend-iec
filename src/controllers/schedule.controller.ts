import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { createScheduleSchema } from '../validations/schedule.validation'

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const { date, ministryId, memberIds, location } = createScheduleSchema.parse(req.body)
    const churchId = req.churchId

    if (!churchId) {
      return res.status(401).json({ error: 'Igreja não autenticada' })
    }

    const schedule = await prisma.schedule.create({
      data: {
        date,
        ministryId,
        location,
        churchId,
        members: {
          connect: memberIds.map(id => ({ id })),
        },
      },
      include: {
        members: true,
        ministry: true,
      },
    })

    return res.status(201).json(schedule)
  } catch (err: any) {
    console.error(err)
    return res.status(400).json({ error: err.message || 'Erro ao criar escala' })
  }
}


export const listSchedules = async (req: Request, res: Response) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        ministry: true,
        members: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    return res.json(schedules)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar escalas' })
  }
}

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const scheduleId = req.params.id
    const { date, location, ministryId, memberIds } = req.body

    // Verifica se a escala existe
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id: scheduleId }
    })

    if (!existingSchedule) {
      return res.status(404).json({ error: 'Escala não encontrada' })
    }

    // Atualiza a escala com novos dados
    const updatedSchedule = await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        date: date ? new Date(date) : existingSchedule.date,
        location: location ?? existingSchedule.location,
        ministry: ministryId ? { connect: { id: ministryId } } : undefined,
        // Atualiza os membros escalados: desconecta todos e conecta os novos
        members: memberIds ? {
          set: [], // remove todos os membros atuais
          connect: memberIds.map((id: string) => ({ id }))
        } : undefined
      },
      include: {
        ministry: true,
        members: true
      }
    })

    return res.json(updatedSchedule)

  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao atualizar escala' })
  }
}