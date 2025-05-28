import { Request, Response } from 'express'
import { prisma } from '../prisma/client'

export const createCategory = async (req: Request, res: Response) => {
  const { name, description } = req.body

  try {
    const category = await prisma.category.create({
      data: { name, description },
    })
    return res.status(201).json(category)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao criar categoria' })
  }
}

export const listCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
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
  const { name, description } = req.body

  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name, description },
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