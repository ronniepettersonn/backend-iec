import { Request, Response } from 'express'
import { prisma } from '../prisma/client'

export const createPostTag = async (req: Request, res: Response) => {
  const { name } = req.body
  const churchId = req.churchId

  try {
    if (!churchId) {
      return res.status(401).json({ error: 'Igreja não identificada' })
    }

    const tag = await prisma.postTag.create({
      data: {
        name,
        churchId
      }
    })

    return res.status(201).json(tag)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao criar tag' })
  }
}


export const listPostTags = async (_req: Request, res: Response) => {
  try {
    const tags = await prisma.postTag.findMany({ orderBy: { name: 'asc' } })
    return res.json(tags)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar tags' })
  }
}