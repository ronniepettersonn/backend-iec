import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import bcrypt from 'bcryptjs'
import { updateUserSchema } from '../validations/auth.validation'

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const validatedData = updateUserSchema.parse(req.body)

    // Se a senha estiver sendo atualizada, já faz o hash
    if (validatedData.passwordHash) {
      validatedData.passwordHash = await bcrypt.hash(validatedData.passwordHash, 10)
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: validatedData,
    })

    return res.json(updatedUser)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    if (!user.active) {
      return res.status(400).json({ error: 'Usuário já está inativo' })
    }

    await prisma.user.update({
      where: { id },
      data: { active: false }
    })

    return res.status(200).json({ message: 'Usuário inativado com sucesso' })
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

export const listUsers = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10', search = '' } = req.query

    const pageNumber = parseInt(page as string)
    const pageSize = parseInt(limit as string)
    const skip = (pageNumber - 1) * pageSize

    // Busca com filtro pelo nome ou email, e só ativos
    const users = await prisma.user.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } }
        ]
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    // Opcional: total para paginação
    const totalCount = await prisma.user.count({
      where: {
        active: true,
        OR: [
          { name: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } }
        ]
      }
    })

    return res.json({ users, totalCount, page: pageNumber, limit: pageSize })
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}