import { Request, Response, NextFunction } from 'express'

export const hasRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' })
    }

    return next()
  }
}