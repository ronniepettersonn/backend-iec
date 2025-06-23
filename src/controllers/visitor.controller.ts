import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { contactVisitorSchema, createVisitorSchema, markContactedSchema, updateVisitorSchema } from '../validations/visitor.validation'
import { ZodError } from 'zod'

export const createVisitor = async (req: Request, res: Response) => {
  try {
    if (!req.churchId) {
      return res.status(400).json({ error: 'ID da igreja não informado' })
    }

    const validated = createVisitorSchema.parse(req.body)

    const visitor = await prisma.visitor.create({
      data: {
        ...validated,
        churchId: req.churchId,
        visitDate: validated.visitDate ? new Date(validated.visitDate) : new Date(),
      },
    })

    return res.status(201).json(visitor)
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    return res.status(500).json({ error: 'Erro ao cadastrar visitante' })
  }
}

export const updateVisitor = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const validated = updateVisitorSchema.parse(req.body)

    const visitor = await prisma.visitor.update({
      where: { id },
      data: {
        ...validated,
        visitDate: validated.visitDate ? new Date(validated.visitDate) : undefined,
      },
    })

    return res.json(visitor)
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    return res.status(500).json({ error: 'Erro ao atualizar visitante' })
  }
}

export const getVisitors = async (req: Request, res: Response) => {
  const { name, page = '1', limit = '10' } = req.query

  const pageNumber = parseInt(page as string, 10) || 1
  const limitNumber = parseInt(limit as string, 10) || 10
  const skip = (pageNumber - 1) * limitNumber

  try {
    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        where: {
          name: name ? { contains: String(name), mode: 'insensitive' } : undefined,
        },
        orderBy: { visitDate: 'desc' },
        skip,
        take: limitNumber,
      }),
      prisma.visitor.count({
        where: {
          name: name ? { contains: String(name), mode: 'insensitive' } : undefined,
        },
      }),
    ])

    return res.json({
      data: visitors,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar visitantes' })
  }
}

export const getVisitorById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const visitor = await prisma.visitor.findUnique({ where: { id } })

    if (!visitor) {
      return res.status(404).json({ error: 'Visitante não encontrado' })
    }

    return res.json(visitor)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar visitante' })
  }
}

export const deleteVisitor = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const visitor = await prisma.visitor.update({
      where: { id },
      data: { active: false },
    })

    return res.json({ message: 'Visitante inativado com sucesso', visitor })
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao inativar visitante' })
  }
}

export const contactVisitor = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const validatedData = contactVisitorSchema.parse(req.body)

    const visitor = await prisma.visitor.findUnique({ where: { id } })
    if (!visitor) {
      return res.status(404).json({ error: 'Visitante não encontrado' })
    }

    const updatedVisitor = await prisma.visitor.update({
      where: { id },
      data: {
        ...validatedData,
        contactedById: req.userId,
        contactedAt: validatedData.contactedAt ?? new Date(),
      },
    })

    return res.status(200).json(updatedVisitor)
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Erro ao registrar contato' })
  }
}

export const getUncontactedVisitors = async (req: Request, res: Response) => {
  try {
    const visitors = await prisma.visitor.findMany({
      where: {
        wasContacted:false,
        active: true
      },
      orderBy: {
        visitDate: 'desc'
      }
    })


    return res.json(visitors)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao buscar visitantes não contactados' })
  }
}

export const markContacted = async (req: Request, res: Response) => {
  const { id } = req.params
  
  try {
    const validatedData = markContactedSchema.parse(req.body)

    const visitor = await prisma.visitor.update({
      where: { id },
      data: {
        wasContacted: true,
        contactedById: validatedData.contactedById,
        contactNotes: validatedData.contactNotes,
        contactedAt: new Date(),
      },
    })

    return res.json(visitor)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar visitante' })
  }
}