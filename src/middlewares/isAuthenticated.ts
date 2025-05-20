import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret'

interface JwtPayload {
  id: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
        userId?: string
      user?: JwtPayload
    }
  }
}

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    const { id } = decoded as { id: string }

    req.userId = id
    req.user = decoded

    return next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}