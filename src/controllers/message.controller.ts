import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { createMessageSchema } from '../validations/message.validation'

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = req.userId! // vem do middleware de autenticação

    const user = await prisma.user.findUnique({ where: { id: senderId } })

    const { receiverId, content } = createMessageSchema.parse(req.body)

    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content
      }
    })

    await prisma.notification.create({
      data: {
        userId: receiverId,
        content: `Você recebeu uma nova mensagem de ${user?.name}`
      }
    })

    return res.status(201).json(newMessage)
  } catch (error) {
    console.error(error)
    return res.status(400).json({ error: 'Erro ao enviar mensagem.' })
  }
}

export const getInboxMessages = async (req: Request, res: Response) => {
  const userId = req.userId
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  try {
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { receiverId: userId },
        include: {
          sender: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.message.count({ where: { receiverId: userId } })
    ])

    return res.json({
      data: messages,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar mensagens recebidas.' })
  }
}

export const getSentMessages = async (req: Request, res: Response) => {
  const userId = req.userId
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  try {
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { senderId: userId },
        include: {
          receiver: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.message.count({ where: { senderId: userId } })
    ])

    return res.json({
      data: messages,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar mensagens enviadas.' })
  }
}

export const getMessageById = async (req: Request, res: Response) => {
  const userId = req.userId
  const { id } = req.params

  try {
    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      }
    })

    if (!message || (message.receiverId !== userId && message.senderId !== userId)) {
      return res.status(404).json({ error: 'Mensagem não encontrada ou acesso negado.' })
    }

    return res.json(message)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar a mensagem.' })
  }
}

export const deleteMessage = async (req: Request, res: Response) => {
  const userId = req.userId
  const { id } = req.params

  try {
    const message = await prisma.message.findUnique({ where: { id } })

    if (!message || (message.senderId !== userId && message.receiverId !== userId)) {
      return res.status(404).json({ error: 'Mensagem não encontrada ou acesso negado.' })
    }

    await prisma.message.delete({ where: { id } })
    return res.status(204).send()
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao deletar a mensagem.' })
  }
}

export const markMessageAsRead = async (req: Request, res: Response) => {
  const userId = req.userId
  const { id } = req.params

  try {
    const message = await prisma.message.findUnique({ where: { id } })

    if (!message || message.receiverId !== userId) {
      return res.status(404).json({ error: 'Mensagem não encontrada ou acesso negado.' })
    }

    if (message.read) {
      return res.status(400).json({ error: "Mensagem já foi lida" })
    }

    const updated = await prisma.message.update({
      where: { id },
      data: { readAt: new Date(), read: true }
    })

    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao marcar mensagem como lida.' })
  }
}