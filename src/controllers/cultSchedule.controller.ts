import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { createCultScheduleSchema, updateCultScheduleSchema } from '../validations/cultSchedule.validation'

// Criar uma nova escala de culto
export const createCultSchedule = async (req: Request, res: Response) => {
  const result = createCultScheduleSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({ error: result.error.format() })
  }

  const churchId = req.churchId
  if (!churchId) {
    return res.status(403).json({ error: 'Igreja não identificada para este usuário' })
  }

  const { cultId, preacherId, directorId, notes } = result.data

  const existingSchedule = await prisma.cultSchedule.findFirst({
    where: { cultId }
  })

  if (existingSchedule) {
    return res.status(400).json({ error: 'Este culto já possui uma escala cadastrada.' })
  }

  try {
    // Cria a escala
    const newSchedule = await prisma.cultSchedule.create({
      data: {
        cultId,
        preacherId,
        directorId,
        notes,
        churchId
      },
      include: {
        preacher: true,
        director: true,
        cult: true
      }
    })

    const preacherMember = await prisma.member.findUnique({
      where: { id: preacherId },
      include: { user: true }
    })

    const directorMember = await prisma.member.findUnique({
      where: { id: directorId },
      include: { user: true }
    })

    const preacherUser = preacherMember?.user
    const directorUser = directorMember?.user

    if (!preacherUser || !directorUser) {
      return res.status(400).json({ error: 'Usuário não encontrado para o membro escalado' })
    }

    const notifications = []

    if (preacherUser) {
      notifications.push(prisma.notification.create({
        data: {
          userId: preacherUser.id,
          content: `Você foi escalado para pregar no culto do dia ${new Date(newSchedule.cult.date).toLocaleDateString()}`,
          target: 'Escala de Culto',
          image: `https://avatar.iran.liara.run/username?username=${preacherUser?.name}`,
          type: 1,
          location: `/cult-schedule`,
          locationLabel: 'Escala de Pregação',
          status: 'info',
          read: false,
          churchId
        }
      }))
    }

    if (directorUser) {
      notifications.push(prisma.notification.create({
        data: {
          userId: directorUser.id,
          content: `Você foi escalado para dirigir o culto do dia ${new Date(newSchedule.cult.date).toLocaleDateString()}`,
          target: 'Escala de Culto',
          image: `https://avatar.iran.liara.run/username?username=${directorUser?.name}`,
          type: 1,
          location: `/cult-schedule`,
          locationLabel: 'Escala de Pregação',
          status: 'info',
          read: false,
          churchId
        }
      }))
    }

    await Promise.all(notifications)

    // Atualiza o culto com os IDs
    await prisma.cult.update({
      where: { id: cultId },
      data: {
        preacherId,
        directorId
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