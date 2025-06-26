import { Request, Response } from 'express'
import { createMemberSchema } from '../dtos/createMember.dto'
import { prisma } from '../prisma/client'
import { updateMemberSchema } from '../validations/member.validation'
import bcrypt from 'bcryptjs'
import { sendNotification } from '../utils/sendNotification'
import { uploadFileToSupabase } from '../utils/uploadFile'
import crypto from 'crypto';
import { sendTemplatedEmail } from '../services/sendTemplateEmail.service'

export const createMember = async (req: Request, res: Response) => {
  try {
    const churchId = req.churchId
    const validatedData = createMemberSchema.parse(req.body)

    if (!churchId) {
      return res.status(403).json({ error: 'Igreja não identificada para este usuário' })
    }

    if (!validatedData.email) {
      return res.status(400).json({ error: 'O campo email é obrigatório.' })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    // Define avatar com base no nome (sem espaços)
    let avatarUrl = validatedData.avatarUrl
      ? validatedData.avatarUrl
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(validatedData.fullName.replace(/\s+/g, ''))}&fontFamily=Helvetica&fontSize=36`

    // Se já existe usuário com esse email E ainda não tem member vinculado
    if (existingUser && !existingUser.memberId) {
      // Se o usuário já tem avatar, usa ele
      avatarUrl = existingUser.avatar || avatarUrl
    }

    // Criação do membro
    const member = await prisma.member.create({
      data: {
        ...validatedData,
        joinDate: validatedData.joinDate ? new Date(validatedData.joinDate) : new Date(),
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : undefined,
        baptismDate: validatedData.baptismDate ? new Date(validatedData.baptismDate) : undefined,
        conversionDate: validatedData.conversionDate ? new Date(validatedData.conversionDate) : undefined,
        status: validatedData.status || 'ATIVO',
        avatarUrl,
        churchId
      }
    })

    // Caso o usuário já exista e ainda não esteja vinculado
    if (existingUser) {
      if (existingUser.memberId) {
        return res.status(400).json({ error: 'Já existe um usuário com este e-mail vinculado a outro membro.' })
      }

      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          memberId: member.id
        }
      })

      return res.status(201).json({
        message: 'Membro criado e vinculado a usuário existente com sucesso.',
        userStatus: 'vinculado'
      })
    }

    // Criação do usuário (novo)
    const token = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 1000 * 60 * 60)
    const hashedPassword = await bcrypt.hash('temp1234', 10)

    const createdUser = await prisma.user.create({
      data: {
        name: validatedData.fullName,
        email: validatedData.email,
        passwordHash: hashedPassword,
        memberId: member.id,
        role: 'MEMBER',
        avatar: avatarUrl,
        churchId,
        firstLogin: true,
        resetToken: token,
        resetTokenExpiry: expiry
      }
    })

    const url = `https://app.igrejaiec.com.br/define-password/${token}`

    await sendTemplatedEmail({
      to: validatedData.email,
      subject: 'Defina sua senha no sistema da igreja',
      templateName: 'define-password',
      variables: {
        logoUrl: 'https://www.igrejaiec.com.br/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.481d02bd.png&w=750&q=75',
        title: 'Defina sua senha',
        message: `Olá ${validatedData.fullName}, seja bem-vindo(a) à IEC. Para definir sua senha e acessar o sistema, clique no botão abaixo:`,
        buttonUrl: url,
        buttonText: 'Definir minha senha'
      }
    })

    await sendNotification({
      userId: createdUser.id,
      content: 'Sua conta foi criada com sucesso! Faça login para acessar o sistema.',
      target: createdUser.name,
      image: avatarUrl,
      type: 2,
      status: 'succeed',
      churchId
    })

    return res.status(201).json({
      message: 'Membro e usuário criados com sucesso.',
      userStatus: 'criado'
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao criar membro e usuário.' })
  }
}


export async function getMembers (req: Request, res: Response) {
  try {
    // pegar query params e garantir tipos
    const {
      name = '',
      page = '1',
      limit = '10',
    } = req.query

    const pageNumber = parseInt(page as string, 10)
    const limitNumber = parseInt(limit as string, 10)
    const skip = (pageNumber - 1) * limitNumber

    // buscar no banco com filtro e paginação
    const where = {
      fullName: {
        contains: name as string,
        mode: 'insensitive' as const,
      },
    }

    const [total, members] = await Promise.all([
      prisma.member.count({ where }),
      prisma.member.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { fullName: 'asc' },
      }),
    ])

    const totalPages = Math.ceil(total / limitNumber)

    return res.json({
      total,
      totalPages,
      page: pageNumber,
      limit: limitNumber,
      data: members,
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

export async function getMemberById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        roles: true
      }
    })

    if (!member) {
      return res.status(404).json({ error: 'Membro não encontrado' })
    }

    return res.json(member)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

export async function updateMember(req: Request, res: Response) {
  try {
    const { id } = req.params

    // Validação com Zod
    const validatedData = updateMemberSchema.parse(req.body)

    const member = await prisma.member.findUnique({ where: { id } })

    if (!member) {
      return res.status(404).json({ error: 'Membro não encontrado' })
    }

    const updated = await prisma.member.update({
      where: { id },
      data: {
        ...validatedData,
        joinDate: validatedData.joinDate ? new Date(validatedData.joinDate) : undefined,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : undefined,
        baptismDate: validatedData.baptismDate ? new Date(validatedData.baptismDate) : undefined,
        conversionDate: validatedData.conversionDate ? new Date(validatedData.conversionDate) : undefined,
        status: validatedData.status,
        notes: validatedData.notes,
        emergencyContactName: validatedData.emergencyContactName,
        emergencyContactPhone: validatedData.emergencyContactPhone
      }
    })

    return res.json(updated)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

export async function deleteMember(req: Request, res: Response) {
  try {
    const { id } = req.params

    const member = await prisma.member.findUnique({ where: { id } })

    if (!member) {
      return res.status(404).json({ error: 'Membro não encontrado' })
    }

    if (!member.active) {
      return res.status(400).json({ error: 'Membro já está inativo' })
    }

    await prisma.member.update({
      where: { id },
      data: { active: false },
    })

    return res.json({ message: 'Membro inativado com sucesso' })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

export const updateAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não enviado' })
    }

    const memberId = req.params.id

    // Upload do arquivo pro Supabase
    const { publicUrl } = await uploadFileToSupabase(req.file, 'members')

    // Atualiza o membro com a URL da imagem
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: { avatarUrl: publicUrl }
    })

    return res.status(200).json(updatedMember)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao atualizar a foto do perfil' })
  }
}

export const createMemberRole = async (req: Request, res: Response) => {
  try {
    const { name, label } = req.body

    const role = await prisma.memberRole.create({
      data: { name, label }
    })

    return res.status(201).json(role)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao criar papel de membro' })
  }
}

export const assignRolesToMember = async (req: Request, res: Response) => {
  const { memberId, roleIds } = req.body

  try {
    const updated = await prisma.member.update({
      where: { id: memberId },
      data: {
        roles: {
          set: [], // limpa os anteriores se quiser sobrescrever
          connect: roleIds.map((id: string) => ({ id }))
        }
      },
      include: { roles: true }
    })

    return res.json(updated)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao atribuir papéis ao membro' })
  }
}

export const listMemberRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await prisma.memberRole.findMany({ orderBy: { label: 'asc' } })
    return res.json(roles)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar papéis de membros' })
  }
}