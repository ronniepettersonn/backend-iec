import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import bcrypt from 'bcryptjs'
import { updateUserSchema } from '../validations/auth.validation'
import { Role } from '../@types/roles'
import { sendNotification } from '../utils/sendNotification'
import { supabase } from '../services/supabaseClient.service'
import crypto from 'crypto';
import { sendEmail } from '../services/email.service';


export const createUserByAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, role } = req.body;
    const churchId = req.user?.churchId;

    console.log(req.user)

    if (!churchId) {
      return res.status(403).json({ error: 'Admin sem igreja vinculada' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'E-mail já está em uso' });
    }

    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&fontFamily=Helvetica&fontSize=36`

    const hashedPassword = await bcrypt.hash('temp1234', 10); // senha temporária

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        churchId,
        avatar: avatarUrl,
        passwordHash: hashedPassword,
        firstLogin: true, // campo boolean no model User (se ainda não tiver, podemos adicionar)
      },
    });

    // TODO: enviar e-mail com instruções, se desejar

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1h de validade

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    // Crie aqui a URL de definição de senha — ajuste para o seu frontend
    const url = `https://app.igrejaiec.com.br/define-password/${token}`;

    await sendEmail({
      to: email,
      subject: 'Defina sua senha no sistema da igreja',
      html: `
        <p>Olá, ${name}!</p>
        <p>Você foi cadastrado no sistema da igreja. Para definir sua senha, clique no link abaixo:</p>
        <p><a href="${url}">Definir minha senha</a></p>
        <p>Este link expira em 1 hora.</p>
      `,
    });

    res.status(201).json({ message: 'Usuário criado com sucesso', userId: user.id });
  } catch (error) {
    console.error('[createUserByAdmin]', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

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
      status: 'succeed',
      churchId: req.churchId!
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

      console.log('CHEGA AQUI', uploadError)

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