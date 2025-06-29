import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { createNoticeSchema, updateNoticeSchema } from '../validations/notice.validation'

export const createNotice = async (req: Request, res: Response) => {
  try {
    const data = createNoticeSchema.parse(req.body)
    const createdById = req.userId! // já vem do middleware de autenticação
    const churchId = req.churchId

    if (!createdById || !churchId) {
      return res.status(400).json({ error: 'Usuário ou igreja não identificados' })
    }

    const notice = await prisma.notice.create({
      data: {
        ...data,
        createdById,
        churchId,
      },
    })

    return res.status(201).json(notice)
  } catch (err: any) {
    console.error(err)
    return res.status(400).json({ error: err.message || 'Erro ao criar aviso' })
  }
}

export const getAllNotices = async (req: Request, res: Response) => {
    const notices = await prisma.notice.findMany({
        where: {
            deletedAt: null
        },
        orderBy: { createdAt: 'desc' },
        include: {
            createdBy: { select: { id: true, name: true } },
        },
    })

    return res.json(notices)
}

export const updateNotice = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const data = updateNoticeSchema.parse(req.body)

        const notice = await prisma.notice.update({
            where: { id },
            data,
        })

        return res.json(notice)
    } catch (err: any) {
        return res.status(400).json({ error: err.message })
    }
}

export const deleteNotice = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        await prisma.notice.update({
            where: { id },
            data: { deletedAt: new Date() }
        })

        return res.status(204).json({ message: 'Aviso inativado com sucesso' })
    } catch (err) {
        return res.status(400).json({ error: 'Erro ao deletar aviso' })
    }
}