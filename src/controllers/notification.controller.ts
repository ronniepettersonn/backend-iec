import { Request, Response } from 'express'
import { prisma } from '../prisma/client'

export const getNotifications = async (req: Request, res: Response) => {
    const userId = req.userId!
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    })
    res.json(notifications)
}

export const markAsRead = async (req: Request, res: Response) => {
    const { id } = req.params
    const userId = req.userId!

    const notification = await prisma.notification.findFirst({
        where: { id, userId }
    })

    if (!notification) return res.status(404).json({ error: 'Notificação não encontrada' })

    await prisma.notification.update({
        where: { id },
        data: { read: true }
    })

    res.json({ message: 'Notificação marcada como lida' })
}