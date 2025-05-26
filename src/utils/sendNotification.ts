import { prisma } from '../prisma/client'

type SendNotificationParams = {
  userId: string
  content: string
  target?: string
  image?: string
  type: 0 | 1| 2
  status?: 'succeed' | 'failed'
}

export const sendNotification = async ({
  userId,
  content,
  target,
  type,
  image,
  status
}: SendNotificationParams) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        content,
        type,
        target,
        image,
        status
      }
    })
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
  }
}