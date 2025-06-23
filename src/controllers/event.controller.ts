import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { createEventSchema } from '../validations/event.validation'


export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, date, location } = createEventSchema.parse(req.body)

    const createdById = req.userId as string
    const churchId = req.churchId

    if (!churchId) {
      return res.status(403).json({ error: 'Igreja não identificada para este usuário' })
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        createdById,
        churchId,
      },
    })

    return res.status(201).json(event)
  } catch (error: any) {
    console.error(error)
    return res.status(400).json({ error: error.message })
  }
}

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const {
      date,
      location,
      page = 1,
      limit = 10,
    } = req.query as {
      date?: string
      location?: string
      page?: string
      limit?: string
    }

    const pageNumber = parseInt(page as string)
    const limitNumber = parseInt(limit as string)
    const skip = (pageNumber - 1) * limitNumber

    const filters: any = {}

    if (date) {
      filters.date = new Date(date)
    }

    if (location) {
      filters.location = {
        contains: location,
        mode: 'insensitive',
      }
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: filters,
        skip,
        take: limitNumber,
        orderBy: {
          date: 'asc',
        },
      }),
      prisma.event.count({ where: filters }),
    ])

    return res.json({
      data: events,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
    })
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao buscar eventos' })
  }
}

export const getEventById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const event = await prisma.event.findUnique({
      where: { id },
    })

    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    return res.json(event)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao buscar o evento' })
  }
}

export const updateEvent = async (req: Request, res: Response) => {
  const { id } = req.params
  const { title, description, date, location } = req.body

  try {
    const event = await prisma.event.findUnique({ where: { id } })

    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        date: new Date(date),
        location,
      },
    })

    return res.json(updatedEvent)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao atualizar o evento' })
  }
}

export const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const event = await prisma.event.findUnique({ where: { id } })

    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    await prisma.event.delete({ where: { id } })

    return res.json({ message: 'Evento removido com sucesso' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao remover o evento' })
  }
}