import { Request, Response } from 'express'
import { prisma } from '../prisma/client'

// GET /notifications
export const listNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    const formatted = notifications.map(n => ({
      id: n.id,
      target: n.target || '',
      description: n.content,
      date: n.createdAt.toISOString(),
      image: n.image || '',
      type: n.type, // Se quiser categorizar
      location: n.location || '',
      locationLabel: n.locationLabel || '',
      status: n.status || '',
      readed: n.read
    }))

    res.json(formatted)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao buscar notificações' })
  }
}

// GET /notifications/count
export const getNotificationCount = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!

    const count = await prisma.notification.count({
      where: { userId, read: false }
    })

    res.json({ count })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao contar notificações' })
  }
}

// POST /notifications/read
export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.body
    await prisma.notification.update({
      where: { id },
      data: { read: true }
    })

    res.status(200).json({ message: 'Notificação marcada como lida' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao marcar notificação' })
  }
}

// POST /notifications/mark-all-read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    })

    res.status(200).json({ message: 'Todas notificações marcadas como lidas' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao marcar todas' })
  }
}