import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret'

interface JwtPayload {
  id: string
  role: string
  churchId: string;
}

declare global {
  namespace Express {
    interface Request {
        userId?: string
      user?: JwtPayload
      churchId?: string
    }
  }
}

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded?.id) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.userId = decoded.id;
    req.user = {
      id: decoded.id,
      role: decoded.role,
      churchId: decoded.churchId,
    };
    req.churchId = decoded.churchId; // 🔹 Facilita nos controllers

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
