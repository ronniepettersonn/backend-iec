import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
//import { registerUserSchema } from '../validations/auth.validation'
import bcrypt, { compare, hash } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { loginUserSchema } from '../validations/auth.validation'
//import { addMinutes } from 'date-fns'
//import crypto from 'crypto'
import { createPasswordResetToken } from '../services/token.service'
import { sendEmail } from '../services/email.service'
import { sendNotification } from '../utils/sendNotification'
import { OAuth2Client } from 'google-auth-library'

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret' // ideal usar variável de ambiente

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

/* export const register = async (req: Request, res:Response) => {
  try {
    const { name, email, password } = req.body

    // Verifica se já existe o email
    const userExists = await prisma.user.findUnique({ where: { email } })
    if (userExists) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' })
    }

    // Criar o avatar default
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&fontFamily=Helvetica&fontSize=36`

    // Cria o membro
    const member = await prisma.member.create({
      data: {
        fullName: name,
        email,
        avatarUrl
      }
    })

    // Cria o usuário vinculado ao membro
    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'MEMBER',
        memberId: member.id,
        avatar: avatarUrl
      }
    })

    return res.status(201).json({ message: 'Usuário cadastrado com sucesso.', user })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro ao registrar usuário.' })
  }
} */

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginUserSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    const isPasswordValid = await compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    // Geração do token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        churchId: user.churchId, 
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    )

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        firstLogin: user.firstLogin,
        authority: [user.role],
        avatar: user.avatar
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(400).json({ error: 'Erro ao fazer login' })
  }
}

export const changePassword = async (req: Request, res: Response) => {
  const { newPassword } = req.body

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Senha muito curta' })
  }

  const userId = req.userId

  try {
    const passwordHash = await hash(newPassword, 10)

    const user = await prisma.user.findUnique({where: {id: userId}})

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        firstLogin: false,
      }
    })

    await sendNotification({
      userId: userId!,
      content: 'Sua senha foi redefinida com sucesso!',
      target: user?.name,
      image: 'https://avatar.iran.liara.run/username?username=' + user?.name,
      type: 2,
      status: 'succeed',
      churchId: req.churchId!
    })

    return res.status(200).json({ message: 'Senha alterada com sucesso' })
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao alterar senha' })
  }
}

export const loginWithGoogle = async (req: Request, res: Response) => {
  const { idToken } = req.body

  if (!idToken) {
    return res.status(400).json({ error: 'Token não fornecido' })
  }

  try {
    // Valida o idToken com o Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Token inválido' })
    }

    // Busca o usuário no banco
    const user = await prisma.user.findUnique({
      where: { email: payload.email }
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '1d' }
    )

    return res.status(200).json({ token, user })
  } catch (error) {
    console.error(error)
    return res.status(400).json({ error: 'Erro ao autenticar com Google' })
  }
}

/* export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body

  if (!email) return res.status(400).json({ error: 'Email obrigatório' })

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = addMinutes(new Date(), 30) // expira em 30 minutos

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    }
  })

  // Aqui você pode enviar o token por e-mail
  // Por enquanto, apenas exibe no retorno:
  const resetLink = `https://seusite.com/reset-password?token=${token}`

  return res.json({ message: 'Token enviado com sucesso', resetLink })
} */

  export const definirSenha = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido ou expirado.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        firstLogin: false,
      },
    });

    return res.json({ message: 'Senha definida com sucesso. Você já pode fazer login.' });
  } catch (error) {
    console.error('[definirSenha]', error);
    return res.status(500).json({ error: 'Erro ao definir senha.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Token inválido ou expirado' })
  }

  const passwordHash = await hash(newPassword, 10)

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash }
  })

  await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })

  return res.json({ message: 'Senha redefinida com sucesso' })
}

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' })
  }

  const token = await createPasswordResetToken(user.id)

  const resetLink = `http://localhost:5173/reset-password?token=${token}`

  await sendEmail({
    to: user.email,
    subject: 'Redefinição de senha',
    html: `
      <p>Olá ${user.name},</p>
      <p>Recebemos um pedido para redefinir sua senha. Clique no link abaixo:</p>
      <p><a href="${resetLink}">Redefinir senha</a></p>
      <p>Se não foi você, ignore este e-mail.</p>
    `
  })

  return res.json({ message: 'E-mail de redefinição enviado' })
}