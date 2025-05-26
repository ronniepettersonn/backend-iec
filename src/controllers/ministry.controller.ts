import { Request, Response } from 'express'
import { createMinistrySchema, updateMinistrySchema } from '../validations/ministry.validation'
import { prisma } from '../prisma/client'

export const createMinistry = async (req: Request, res: Response) => {
  try {
    const { name, description, leaderId, memberIds } = createMinistrySchema.parse(req.body)

    const ministry = await prisma.ministry.create({
      data: {
        name,
        description,
        leader: {
          connect: { id: leaderId },
        },
        members: memberIds
          ? {
              connect: memberIds.map(id => ({ id })),
            }
          : undefined,
      },
      include: {
        leader: true,
        members: true,
      },
    })

    return res.status(201).json(ministry)
  } catch (error: any) {
    console.error(error)
    return res.status(400).json({ error: error.message || 'Erro ao criar ministério' })
  }
}

export const getAllMinistries = async (req: Request, res: Response) => {
  const { page = '1', limit = '10' } = req.query

  const pageNumber = parseInt(page as string, 10) || 1
  const limitNumber = parseInt(limit as string, 10) || 10
  const skip = (pageNumber - 1) * limitNumber

  try {
    const [ministries, total] = await Promise.all([
      prisma.ministry.findMany({
        include: {
          leader: true,
          members: true,
        },
        orderBy: {
          name: 'asc',
        },
        skip,
        take: limitNumber,
      }),
      prisma.ministry.count(),
    ])

    return res.status(200).json({
      data: ministries,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    })
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar ministérios' })
  }
}

export const getMinistryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const ministry = await prisma.ministry.findUnique({
      where: { id },
      include: { leader: true, members: true },
    })
    if (!ministry) return res.status(404).json({ error: 'Ministério não encontrado' })
    return res.status(200).json(ministry)
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao buscar ministério' })
  }
}

export const updateMinistry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const data = updateMinistrySchema.parse(req.body)

    // Prepara os dados para update (trata members e leader)
    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.leaderId) updateData.leader = { connect: { id: data.leaderId } }
    if (data.memberIds) {
      updateData.members = {
        set: data.memberIds.map((id: string) => ({ id })), // substitui lista
      }
    }

    const updatedMinistry = await prisma.ministry.update({
      where: { id },
      data: updateData,
      include: { leader: true, members: true },
    })

    return res.status(200).json(updatedMinistry)
  } catch (error: any) {
    console.error(error)
    if (error.code === 'P2025') return res.status(404).json({ error: 'Ministério não encontrado' })
    return res.status(400).json({ error: error.message || 'Erro ao atualizar ministério' })
  }
}

export const deleteMinistry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Aqui fazemos soft delete — vamos supor que você tenha um campo active:boolean
    // Se não tiver, pode usar prisma.ministry.delete({ where: { id } })

    const deleted = await prisma.ministry.update({
      where: { id },
      data: { active: false },
    })

    return res.status(200).json({ message: 'Ministério desativado com sucesso', ministry: deleted })
  } catch (error: any) {
    console.error(error)
    if (error.code === 'P2025') return res.status(404).json({ error: 'Ministério não encontrado' })
    return res.status(400).json({ error: error.message || 'Erro ao deletar ministério' })
  }
}