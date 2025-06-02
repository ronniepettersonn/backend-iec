import { Request, Response } from 'express'
import { createMemberSchema } from '../dtos/createMember.dto'
import { prisma } from '../prisma/client'
import { updateMemberSchema } from '../validations/member.validation'
import bcrypt from 'bcryptjs'
import { sendNotification } from '../utils/sendNotification'
import { uploadFileToSupabase } from '../utils/uploadFile'

export const createMember = async (req: Request, res: Response) => {
  try {
    const validatedData = createMemberSchema.parse(req.body)

    const data = {
      ...validatedData,
      joinDate: validatedData.joinDate ? new Date(validatedData.joinDate) : new Date(),
      birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : undefined,
      baptismDate: validatedData.baptismDate ? new Date(validatedData.baptismDate) : undefined,
      conversionDate: validatedData.conversionDate ? new Date(validatedData.conversionDate) : undefined,
      status: validatedData.status || 'ATIVO',
      notes: validatedData.notes,
      emergencyContactName: validatedData.emergencyContactName,
      emergencyContactPhone: validatedData.emergencyContactPhone
    }

    // Criação do membro
    const member = await prisma.member.create({
      data: {
        ...data,
      }
    })

    // Criação do usuário vinculado ao membro
    const passwordHash = await bcrypt.hash('senha123', 10) // senha padrão
    const createdUser = await prisma.user.create({
      data: {
        name: data.fullName,
        email: data.email!,
        passwordHash,
        memberId: member.id,
        role: 'MEMBER'
      }
    })

    await sendNotification({
      userId: createdUser.id,
      content: 'Sua conta foi criada com sucesso! Faça login para acessar o sistema.',
      target: createdUser.name,
      image: 'https://avatar.iran.liara.run/username?username=' + createdUser.name,
      type: 2,
      status: 'succeed'
    })

    return res.status(201).json({ message: 'Membro e usuário criados com sucesso.' })
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