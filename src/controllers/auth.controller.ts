import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { registerUserSchema } from '../validations/auth.validation'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { loginUserSchema } from '../validations/auth.validation'

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret' // ideal usar variável de ambiente

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role } = registerUserSchema.parse(req.body)

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'Email já está em uso' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'MEMBER',
      },
    })

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = loginUserSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.active) {
        return res.status(401).json({ error: 'Credenciais inválidas ou usuário inativo' })
    }

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Senha inválida' })
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    )

    return res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}