import { Request, Response } from 'express'
import { prisma } from '../prisma/client'

export const createPostComment = async (req: Request, res: Response) => {
  try {
    const { postId, content, userId, author, email } = req.body
    const churchId = req.churchId

    if (!churchId) {
      return res.status(401).json({ error: 'Igreja não identificada' })
    }

    if (!postId || !content) {
      return res.status(400).json({ error: 'postId e content são obrigatórios' })
    }

    const comment = await prisma.postComment.create({
      data: {
        postId,
        content,
        userId: userId || undefined,
        author: author || undefined,
        email: email || undefined,
        churchId
      },
    })

    return res.status(201).json(comment)
  } catch (error: any) {
    console.error('[createPostComment]', error)
    return res.status(500).json({ error: 'Erro ao criar comentário' })
  }
}

export const listPostComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params

    if (!postId) {
      return res.status(400).json({ error: 'postId é obrigatório' })
    }

    const comments = await prisma.postComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
    })

    return res.json(comments)
  } catch (error: any) {
    console.error('[listPostCommentsByPost]', error)
    return res.status(500).json({ error: 'Erro ao buscar comentários' })
  }
}