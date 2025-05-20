import { Request, Response } from 'express'
import { createMemberSchema } from '../dtos/createMember.dto'
import { prisma } from '../prisma/client'
import { updateMemberSchema } from '../validations/member.validation'

export async function createMember(req:Request, res:Response) {
  try {
    const validatedData = createMemberSchema.parse(req.body)
    
    const existingMember = await prisma.member.findUnique({
      where: { email: validatedData.email },
    })

    if (existingMember) {
      return res.status(400).json({ error: 'Email já cadastrado para outro membro.' })
    }
    const newMember = await prisma.member.create({
      data: validatedData,
    })

    return res.status(201).json(newMember)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

export async function getMembers (req: Request, res: Response) {
  try {
    // pegar query params e garantir tipos
    const {
      name = '',
      page = '1',
      limit = '10',
    } = req.query

    const pageNumber = parseInt(page as string, 10)
    const limitNumber = parseInt(limit as string, 10)
    const skip = (pageNumber - 1) * limitNumber

    // buscar no banco com filtro e paginação
    const where = {
      fullName: {
        contains: name as string,
        mode: 'insensitive' as const,
      },
      active: true
    }

    const [total, members] = await Promise.all([
      prisma.member.count({ where }),
      prisma.member.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { fullName: 'asc' },
      }),
    ])

    const totalPages = Math.ceil(total / limitNumber)

    return res.json({
      total,
      totalPages,
      page: pageNumber,
      limit: limitNumber,
      data: members,
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

export async function getMemberById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const member = await prisma.member.findUnique({
      where: { id },
    })

    if (!member) {
      return res.status(404).json({ error: 'Membro não encontrado' })
    }

    return res.json(member)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

export async function updateMember(req: Request, res: Response) {
  try {
    const { id } = req.params

    // Validação com Zod
    const validatedData = updateMemberSchema.parse(req.body)

    const member = await prisma.member.findUnique({ where: { id } })

    if (!member) {
      return res.status(404).json({ error: 'Membro não encontrado' })
    }

    const updated = await prisma.member.update({
      where: { id },
      data: validatedData,
    })

    return res.json(updated)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

export async function deleteMember(req: Request, res: Response) {
  try {
    const { id } = req.params

    const member = await prisma.member.findUnique({ where: { id } })

    if (!member) {
      return res.status(404).json({ error: 'Membro não encontrado' })
    }

    if (!member.active) {
      return res.status(400).json({ error: 'Membro já está inativo' })
    }

    await prisma.member.update({
      where: { id },
      data: { active: false },
    })

    return res.json({ message: 'Membro inativado com sucesso' })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}