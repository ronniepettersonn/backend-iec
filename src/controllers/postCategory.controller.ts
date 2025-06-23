// src/controllers/postCategory.controller.ts

import { Request, Response } from 'express'
import { prisma } from '../prisma/client'

export const createPostCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, description } = req.body
    const churchId = req.churchId

    if (!churchId) {
      return res.status(401).json({ error: 'Igreja não identificada' })
    }

    const category = await prisma.postCategory.create({
      data: {
        name,
        slug,
        description,
        churchId
      }
    })

    return res.status(201).json(category)
  } catch (error: any) {
    console.error('Erro ao criar categoria de post:', error)
    return res.status(500).json({ error: 'Erro ao criar categoria de post' })
  }
}
export const listPostCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.postCategory.findMany({
      orderBy: { name: 'asc' }
    })

    return res.json(categories)
  } catch (error: any) {
    console.error('Erro ao listar categorias de post:', error)
    return res.status(500).json({ error: 'Erro ao listar categorias de post' })
  }
}

export const updatePostCategory = async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, slug, description } = req.body

  try {
    const category = await prisma.postCategory.update({
      where: { id },
      data: { name, slug, description }
    })

    return res.json(category)
  } catch (error: any) {
    console.error('Erro ao atualizar categoria de post:', error)
    return res.status(500).json({ error: 'Erro ao atualizar categoria de post' })
  }
}

export const deletePostCategory = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await prisma.postCategory.delete({ where: { id } })
    return res.status(204).send()
  } catch (error: any) {
    console.error('Erro ao deletar categoria de post:', error)
    return res.status(500).json({ error: 'Erro ao deletar categoria de post' })
  }
}

export const getPostCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const category = await prisma.postCategory.findUnique({ where: { id } })
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada' })

    return res.json(category)
  } catch (error: any) {
    console.error('Erro ao buscar categoria de post:', error)
    return res.status(500).json({ error: 'Erro ao buscar categoria de post' })
  }
}