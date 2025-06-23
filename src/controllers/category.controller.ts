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
  const { type } = req.query

  try {
    const categories = await prisma.category.findMany({
      where: type && type !== 'ALL'
        ? { type: type as 'INCOME' | 'EXPENSE' }
        : undefined,
      orderBy: { name: 'asc' },
    })

    return res.json(categories)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar categorias' })
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