import { prisma } from '../prisma/client'

type SendNotificationInput = {
  userId: string
  content: string
  target?: string
  image?: string
  type: 0 | 1 | 2
  status?: 'succeed' | 'failed'
  churchId: string // ← obrigatório agora
}

export const sendNotification = async ({
  userId,
  content,
  target,
  image,
  type,
  status,
  churchId
}: SendNotificationInput) => {
  return await prisma.notification.create({
    data: {
      userId,
      content,
      target,
      image,
      type,
      status,
      churchId
    }
  })
}