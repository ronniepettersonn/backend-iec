// controllers/email.controller.ts
import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { Mail } from '../@types/mail'
import { sendNotification } from '../utils/sendNotification'

export const sendEmail = async (req: Request, res: Response) => {
  try {
    const senderId = req.userId!
    const { subject, content, recipientIds, attachments } = req.body

    const user = await prisma.user.findUnique({ where: { id: senderId } })

    const email = await prisma.email.create({
      data: {
        senderId,
        subject,
        group: 'sentItem',
        recipients: {
          create: recipientIds.map((userId: string) => ({
            userId,
            group: 'inbox'
          }))
        },
        messages: {
          create: {
            senderId,
            content,
            attachments: {
              create: attachments?.map((file: any) => ({
                file: file.file,
                type: file.type,
                size: file.size
              })) || []
            }
          }
        }
      },
      include: {
        recipients: true,
        messages: {
          include: { attachments: true }
        }
      }
    })

    recipientIds.map(async (item: string) => {
        await sendNotification({
              userId: item,
              content: `Enviou um email para você.`,
              target: user?.name,
              image: 'https://avatar.iran.liara.run/username?username=' + user?.name,
              type: 0
            })
    })
    

    return res.status(201).json(email)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao enviar e-mail.' })
  }
}


export const updateEmailGroup = async (req: Request, res: Response) => {
  const { id } = req.params
  const { group } = req.body

  const validGroups = ['inbox', 'sentItem', 'starred', 'draft', 'deleted']

  if (!validGroups.includes(group)) {
    return res.status(400).json({ error: 'Grupo inválido.' })
  }

  try {
    const email = await prisma.email.update({
      where: { id },
      data: { group,
        starred: group === 'starred'
       }
    })

    return res.status(200).json(email)
  } catch (error) {
    console.error(error)
    return res.status(404).json({ error: 'E-mail não encontrado.' })
  }
}

export const listMails = async (req: Request, res: Response) => {
  const userId = req.userId!
  const { category, label } = req.query

  try {
    const isSentItem = category === 'sentItem'

    const emails = await prisma.email.findMany({
  where: {
    ...(isSentItem
      ? {
          senderId: userId
        }
      : category === 'starred'
        ? {
            recipients: {
              some: {
                userId,
                starred: true
              }
            }
          }
        : {
            recipients: {
              some: {
                userId,
                ...(category ? { group: category as string } : {}),
                ...(label ? { label: label as string } : {})
              }
            }
          })
  },
  include: {
    sender: true,
    recipients: {
      include: {
        user: true
      }
    },
    messages: {
      include: {
        sender: true,
        attachments: true
      },
      orderBy: { createdAt: 'asc' }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
})

    const formatted = emails.map((email) => ({
      id: email.id,
      name: email.sender.name,
      label: email.recipients.find((r) => r.userId === userId)?.label || '',
      group:
        email.senderId === userId
          ? 'sentItem'
          : email.recipients.find((r) => r.userId === userId)?.group || 'inbox',
      flagged: email.recipients.find(r => r.userId === userId)?.flagged ?? false,
      starred: email.recipients.find(r => r.userId === userId)?.starred ?? false,
      sender: email.sender.email,
      avatar: email.sender.avatar,
      subject: email.subject,
      mail: email.recipients.map((r) => r.user.email),
      checked: false,
      messages: email.messages.map((msg) => ({
        id: msg.id,
        name: msg.sender.name,
        senderId: msg.sender.id,
        mail: [msg.sender.email],
        avatar: msg.sender.avatar,
        createdAt: msg.createdAt.toISOString(),
        content: msg.content,
        attachment: msg.attachments.map((att) => ({
          file: att.file,
          size: att.size,
          type: att.type
        }))
      }))
    }))

    return res.status(200).json(formatted)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao buscar e-mails' })
  }
}


export const getMailById = async (req: Request, res: Response) => {
  const userId = req.userId!
  const { id } = req.params

  try {
    const email = await prisma.email.findFirst({
      where: {
        id,
        OR: [
          { senderId: userId },
          { recipients: { some: { userId } } }
        ]
      },
      include: {
        sender: true,
        recipients: {
          include: { user: true }
        },
        messages: {
          include: {
            sender: true,
            attachments: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!email) return res.status(404).json({ error: 'Email não encontrado' })

    const formatted = {
      id: email.id,
      name: email.sender.name,
      label: '', // Atualizar depois se usar
      group:
        email.senderId === userId
          ? 'sentItem'
          : email.recipients.find((r) => r.userId === userId)?.group || 'inbox',
      flagged: email.flagged,
      starred: email.starred,
      sender: email.sender.email,
      avatar: email.sender.avatar,
      subject: email.subject,
      mail: email.recipients.map((r) => r.user.email),
      checked: false,
      messages: email.messages.map((msg) => ({
        id: msg.id,
        name: msg.sender.name,
        senderId: msg.sender.id,
        mail: [msg.sender.email],
        avatar: msg.sender.avatar,
        createdAt: msg.createdAt.toISOString(),
        content: msg.content,
        attachment: msg.attachments.map((att) => ({
          file: att.file,
          size: att.size,
          type: att.type
        }))
      }))
    }

    return res.status(200).json(formatted)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao buscar e-mail' })
  }
}

export const updateEmailLabel = async (req: Request, res: Response) => {
  const userId = req.userId!
  const { emailId } = req.params
  const { label } = req.body

  try {
    const updated = await prisma.emailRecipient.updateMany({
      where: {
        emailId,
        userId
      },
      data: {
        label
      }
    })

    return res.status(200).json({ message: 'Label atualizado com sucesso', updated })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao atualizar label' })
  }
}

export const toggleStarred = async (req: Request, res: Response) => {
  const userId = req.userId!
  const { emailId } = req.params

  try {
    const recipient = await prisma.emailRecipient.findUnique({
      where: {
        emailId_userId: {
          emailId,
          userId
        }
      }
    })

    if (!recipient) {
      return res.status(404).json({ error: 'Email não encontrado para este usuário' })
    }

    const updated = await prisma.emailRecipient.update({
      where: {
        emailId_userId: {
          emailId,
          userId
        }
      },
      data: {
        starred: !recipient.starred
      }
    })

    return res.status(200).json(updated)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao alternar starred' })
  }
}

export const toggleFlagged = async (req: Request, res: Response) => {
  const userId = req.userId!
  const { emailId } = req.params

  try {
    const recipient = await prisma.emailRecipient.findFirst({
      where: {
        emailId,
        userId
      }
    })

    if (!recipient) {
      return res.status(404).json({ error: 'E-mail não encontrado para o usuário.' })
    }

    const updated = await prisma.emailRecipient.update({
      where: {
        id: recipient.id
      },
      data: {
        flagged: !recipient.flagged
      }
    })

    return res.status(200).json({ success: true, flagged: updated.flagged })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao marcar como flagged.' })
  }
}

export const moveToTrash = async (req: Request, res: Response) => {
  const userId = req.userId!
  const { emailIds } = req.body

  if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
    return res.status(400).json({ error: 'Nenhum ID de e-mail fornecido.' })
  }

  try {
    const result = await prisma.emailRecipient.updateMany({
      where: {
        userId,
        emailId: { in: emailIds }
      },
      data: {
        group: 'deleted'
      }
    })

    return res.status(200).json({ success: true, updatedCount: result.count })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao mover e-mails para a lixeira.' })
  }
}

export const updateLabels = async (req: Request, res: Response) => {
  const userId = req.userId!
  const { emailIds, label } = req.body

  if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
    return res.status(400).json({ error: 'Nenhum ID de e-mail fornecido.' })
  }

  try {
    const result = await prisma.emailRecipient.updateMany({
      where: {
        userId,
        emailId: { in: emailIds }
      },
      data: { label }
    })

    return res.status(200).json({ success: true, updatedCount: result.count })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao atualizar labels dos e-mails.' })
  }
}

/* const listEmailsByGroup = async (req: Request, res: Response, group: string) => {
  const userId = req.userId!

  try {
    let emails

    if (group === 'sentItem') {
      // Emails que o usuário enviou
      emails = await prisma.email.findMany({
        where: {
          senderId: userId,
          group: 'sentItem'
        },
        include: {
          sender: true,
          recipients: {
            include: { user: true }
          },
          messages: {
            include: {
              sender: true,
              attachments: true
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Emails que o usuário recebeu
      emails = await prisma.email.findMany({
        where: {
          recipients: {
            some: {
              userId,
              group
            }
          }
        },
        include: {
          sender: true,
          recipients: {
            include: { user: true }
          },
          messages: {
            include: {
              sender: true,
              attachments: true
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    const formatted = emails.map((email) => ({
      id: email.id,
      name: email.sender.name,
      label: '',
      group: group,
      flagged: email.flagged,
      starred: email.starred,
      sender: email.sender.email,
      avatar: email.sender.avatar,
      subject: email.subject,
      mail: email.recipients.map((r) => r.user.email),
      checked: false,
      messages: email.messages.map((msg) => ({
        id: msg.id,
        name: msg.sender.name,
        senderId: msg.sender.id,
        mail: [msg.sender.email],
        avatar: msg.sender.avatar,
        createdAt: msg.createdAt.toISOString(),
        content: msg.content,
        attachment: msg.attachments.map((att) => ({
          file: att.file,
          size: att.size,
          type: att.type
        }))
      }))
    }))

    return res.status(200).json(formatted)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao buscar e-mails' })
  }
}

// Rotas específicas
export const getInbox = (req: Request, res: Response) => listEmailsByGroup(req, res, 'inbox')
export const getSent = (req: Request, res: Response) => listEmailsByGroup(req, res, 'sentItem')
export const getStarred = (req: Request, res: Response) => listEmailsByGroup(req, res, 'starred')
export const getDrafts = (req: Request, res: Response) => listEmailsByGroup(req, res, 'draft')
export const getDeleted = (req: Request, res: Response) => listEmailsByGroup(req, res, 'deleted') */