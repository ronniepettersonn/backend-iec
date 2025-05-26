import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import bcrypt from 'bcryptjs'
import { updateUserSchema } from '../validations/auth.validation'
import { Role } from '../@types/roles'
import { sendNotification } from '../utils/sendNotification'
import { supabase } from '../services/supabaseClient.service'


export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const validatedData = updateUserSchema.parse(req.body)

    // Se a senha estiver sendo atualizada, já faz o hash
    if (validatedData.passwordHash) {
      validatedData.passwordHash = await bcrypt.hash(validatedData.passwordHash, 10)
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: validatedData,
    })

    return res.json(updatedUser)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    if (!user.active) {
      return res.status(400).json({ error: 'Usuário já está inativo' })
    }

    await prisma.user.update({
      where: { id },
      data: { active: false }
    })

    return res.status(200).json({ message: 'Usuário inativado com sucesso' })
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}
export const listUsers = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10', search = '' } = req.query

    const pageNumber = parseInt(page as string)
    const pageSize = parseInt(limit as string)
    const skip = (pageNumber - 1) * pageSize

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } }
        ]
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        avatar: true,
        member: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    })

    const totalCount = await prisma.user.count({
      where: {
        active: true,
        OR: [
          { name: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } }
        ]
      }
    })

    return res.json({ users, totalCount, page: pageNumber, limit: pageSize })
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params
  const { role } = req.body

  if (!Object.values(Role).includes(role)) {
    return res.status(400).json({ error: 'Role inválido.' })
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role }
    })

    await sendNotification({
      userId: id,
      content: `Seu papel no sistema foi alterado para "${role}".`,
      target: user.name,
      image: 'https://avatar.iran.liara.run/username?username=' + user.name,
      type: 2,
      status: 'succeed'
    })

    return res.json({ message: 'Papel atualizado com sucesso.', user })
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao atualizar papel do usuário.' })
  }
}

export const updateProfilePicture = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Nenhuma imagem enviada' });
  }

  try {
    // Verifique se o usuário já tem avatar
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Se existir avatar, delete do Supabase
    if (user?.avatar) {
      // O Supabase espera o caminho relativo (sem a URL completa)
      const pathParts = user.avatar.split('/storage/v1/object/public/uploads/');
      const filePath = pathParts[1];

      if (filePath) {
        const { error: deleteError } = await supabase.storage
          .from('uploads')
          .remove([filePath]);

        if (deleteError) {
          console.error('Erro ao deletar avatar antigo:', deleteError.message);
          // Podemos seguir mesmo assim, pois não é um erro crítico
        }
      }
    }

    // Gere um nome único para o novo arquivo
    const fileName = `${userId}-${Date.now()}-${file.originalname}`;

    // Upload no Supabase
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true, // sobrescreve se já existir (opcional)
      });

    if (uploadError) {
      console.error(uploadError);
      return res.status(500).json({ error: 'Erro ao fazer upload da foto' });
    }

    const { data: publicUrl } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    // Atualiza o avatar no banco
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: publicUrl.publicUrl },
    });

    return res.status(200).json({
      message: 'Foto de perfil atualizada com sucesso!',
      avatar: publicUrl.publicUrl,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno ao atualizar foto de perfil' });
  }
};