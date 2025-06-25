import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { createCategorySchema } from '../validations/category.validation'

export const createCategory = async (req: Request, res: Response) => {
  try {
    const validated = createCategorySchema.parse(req.body)

    const churchId = req.churchId
    if (!churchId) {
      return res.status(403).json({ error: 'Igreja não identificada para este usuário' })
    }

    const category = await prisma.category.create({
      data: {
        ...validated,
        churchId
      }
    })

    return res.status(201).json(category)
  } catch (error: any) {
    console.error(error)
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors })
    }
    return res.status(500).json({ error: 'Erro ao criar categoria' })
  }
}

export const listCategories = async (req: Request, res: Response) => {
  const { type, page = '1', limit = '10' } = req.query
   const churchId = req.churchId
  if (!churchId) {
    return res.status(401).json({ error: 'Igreja não autenticada' })
  }

  const pageNumber = parseInt(page as string, 10)
  const limitNumber = parseInt(limit as string, 10)
  const skip = (pageNumber - 1) * limitNumber

  try {
    const whereClause =
      type && type !== 'ALL'
        ? { type: type as 'INCOME' | 'EXPENSE', churchId }
        : undefined

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where: whereClause,
        orderBy: { name: 'asc' },
        skip,
        take: limitNumber,
      }),
      prisma.category.count({ where: whereClause }),
    ])

    return res.json({
      data: categories,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar categorias' })
  }
}

export const listCategoriesSelect = async (req: Request, res: Response) => {
  const { type } = req.query
  const churchId = req.churchId

  if (!churchId) {
    return res.status(401).json({ error: 'Igreja não autenticada' })
  }

  try {
    const whereClause: any = { churchId }

    if (type && type !== 'ALL') {
      whereClause.type = type as 'INCOME' | 'EXPENSE'
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true
      },
      orderBy: { name: 'asc' }
    })

    return res.json(categories)
  } catch (error) {
    console.error('[listCategoriesSelect]', error)
    return res.status(500).json({ error: 'Erro ao listar categorias para select' })
  }
}

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, description, type } = req.body

  try {
    if (type !== 'INCOME' && type !== 'EXPENSE') {
      return res.status(400).json({ error: 'Tipo inválido. Use INCOME ou EXPENSE.' })
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, description, type },
    })

    return res.json(category)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao atualizar categoria' })
  }
}

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await prisma.category.delete({
      where: { id },
    })
    return res.status(204).send()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao deletar categoria' })
  }
}