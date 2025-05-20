import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { createMessageSchema } from '../validations/message.validation'

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = req.userId! // vem do middleware de autenticação
    const { receiverId, content } = createMessageSchema.parse(req.body)

    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content
      }
    })

    return res.status(201).json(newMessage)
  } catch (error) {
    console.error(error)
    return res.status(400).json({ error: 'Erro ao enviar mensagem.' })
  }
}