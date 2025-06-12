import { Request, Response } from "express"
import { prisma } from '../prisma/client'

export const createCult = async (req: Request, res: Response) => {
  const {
    date,
    typeId,
    theme,
    preacher,
    location,
    totalPeople,
    visitors,
    children,
    saved,
    healed,
    holySpiritBaptisms,
    tithesAmount,
    tithesCount,
    offeringsAmount,
    offeringsCount,
    designatedOfferings,
    notes,
    preacherId,
    directorId
  } = req.body

  try {
    const createdCult = await prisma.cult.create({
      data: {
        date: new Date(date),
        typeId,
        theme,
        preacher,
        location,
        totalPeople,
        visitors,
        children,
        saved,
        healed,
        holySpiritBaptisms,
        tithesAmount,
        tithesCount,
        offeringsAmount,
        offeringsCount,
        designatedOfferings,
        notes,
      }
    })

    if (preacherId && directorId) {
  const existingSchedule = await prisma.cultSchedule.findFirst({
    where: { cultId: createdCult.id }
  })

  

    if (preacherId && directorId) {

      if (!existingSchedule) {
        await prisma.cultSchedule.create({
          data: {
            cultId: createdCult.id,
            preacherId,
            directorId,
            notes: `Escala criada automaticamente junto ao culto`
          }
        })
      } else {
        console.warn('Culto já possui uma escala, não foi criada uma nova.')
      }
    }

      // Enviar notificações
      const [preacherUser, directorUser] = await Promise.all([
        prisma.user.findUnique({ where: { id: preacherId } }),
        prisma.user.findUnique({ where: { id: directorId } })
      ])

      const dateFormatted = new Date(date).toLocaleDateString()

      await prisma.notification.createMany({
        data: [
          {
            userId: preacherId,
            content: `Você foi escalado para pregar no culto do dia ${dateFormatted}`,
            target: 'Escala de Culto',
            image: `https://avatar.iran.liara.run/username?username=${preacherUser?.name}`,
            type: 1,
            location: `/cultos`,
            locationLabel: 'Cultos',
            status: 'info',
            read: false
          },
          {
            userId: directorId,
            content: `Você foi escalado para dirigir o culto do dia ${dateFormatted}`,
            target: 'Escala de Culto',
            image: `https://avatar.iran.liara.run/username?username=${directorUser?.name}`,
            type: 1,
            location: `/cultos`,
            locationLabel: 'Cultos',
            status: 'info',
            read: false
          }
        ]
      })
    }

    return res.status(201).json(createdCult)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao criar culto' })
  }
}

export const updateCult = async (req: Request, res: Response) => {
  const { id } = req.params
  const {
    theme,
    preacher,
    location,
    totalPeople,
    visitors,
    children,
    saved,
    healed,
    holySpiritBaptisms,
    tithesAmount,
    tithesCount,
    offeringsAmount,
    offeringsCount,
    designatedOfferings,
    notes,
  } = req.body

  try {
    const existingCult = await prisma.cult.findUnique({ where: { id } })

    if (!existingCult) {
      return res.status(404).json({ error: 'Culto não encontrado.' })
    }

    const updatedCult = await prisma.cult.update({
      where: { id },
      data: {
        theme,
        preacher,
        location,
        totalPeople,
        visitors,
        children,
        saved,
        healed,
        holySpiritBaptisms,
        tithesAmount,
        tithesCount,
        offeringsAmount,
        offeringsCount,
        designatedOfferings,
        notes,
      },
    })

    return res.status(200).json(updatedCult)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao atualizar culto.' })
  }
}

export const listCults = async (req: Request, res: Response) => {
  const { page = 1, perPage = 10, type } = req.query

  const skip = (Number(page) - 1) * Number(perPage)

  const where = {
    deletedAt: null,
    ...(type ? { typeId: String(type) } : {})
  }

  try {
    const cults = await prisma.cult.findMany({
      where,
      skip,
      take: Number(perPage),
      orderBy: { date: 'desc' },
      include: { type: true },
    })

    const total = await prisma.cult.count({
      where
    })

    return res.json({
      data: cults,
      meta: {
        total,
        page: Number(page),
        perPage: Number(perPage),
        totalPages: Math.ceil(total / Number(perPage)),
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar cultos' })
  }
}

export const getCultById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const cult = await prisma.cult.findUnique({
      where: { id },
      include: { type: true },
    })

    if (!cult) {
      return res.status(404).json({ error: 'Culto não encontrado' })
    }

    return res.json(cult)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao buscar culto' })
  }
}

// Cultos futuros
export const getUpcomingCults = async (req: Request, res: Response) => {
  try {
    const upcomingCults = await prisma.cult.findMany({
      where: { date: { gte: new Date() }, deletedAt: null },
      orderBy: { date: 'asc' },
      include: { type: true }
    })

    return res.json(upcomingCults)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar cultos futuros' })
  }
}

// Cultos passados
export const getPastCults = async (req: Request, res: Response) => {
  try {
    const pastCults = await prisma.cult.findMany({
      where: { date: { lt: new Date() }, deletedAt: null },
      orderBy: { date: 'desc' },
      include: { type: true }
    })

    return res.json(pastCults)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar cultos passados' })
  }
}


export const deleteCult = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const cult = await prisma.cult.findUnique({ where: { id } })

    if (!cult) {
      return res.status(404).json({ error: 'Culto não encontrado' })
    }

    const isFilled =
      (cult.totalPeople ?? 0) > 0 ||
      (cult.visitors ?? 0) > 0 ||
      (cult.children ?? 0) > 0 ||
      (cult.saved ?? 0) > 0 ||
      (cult.healed ?? 0) > 0 ||
      (cult.holySpiritBaptisms ?? 0) > 0 ||
      (cult.tithesAmount ?? 0) > 0 ||
      (cult.offeringsAmount ?? 0) > 0 ||
      (cult.tithesCount ?? 0) > 0 ||
      (cult.offeringsCount ?? 0) > 0

    if (isFilled) {
      await prisma.cult.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
    } else {
      await prisma.cult.delete({ where: { id } })
    }

    return res.status(204).send()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao deletar culto' })
  }
}



export const updateCultType = async (req: Request, res: Response) => {
  const { id } = req.params
  const { name } = req.body

  try {
    const existing = await prisma.cultType.findUnique({ where: { id } })

    if (!existing) {
      return res.status(404).json({ error: 'Tipo de culto não encontrado' })
    }

    const updated = await prisma.cultType.update({
      where: { id },
      data: {
        name,
      },
    })

    return res.status(200).json(updated)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao atualizar tipo de culto' })
  }
}

export const createCultType = async (req: Request, res: Response) => {
  const { name } = req.body

  try {
    const cultType = await prisma.cultType.create({
      data: {
        name,
      },
    })

    return res.status(201).json(cultType)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao criar tipo de culto' })
  }
}

export const listCultTypes = async (_req: Request, res: Response) => {
  try {
    const types = await prisma.cultType.findMany({
      orderBy: { name: 'asc' },
    })

    return res.json(types)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar tipos de culto' })
  }
}

