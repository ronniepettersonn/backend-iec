// roles.ts
import { Request, Response, NextFunction } from 'express'

export type Role = 'ADMIN' | 'LEADER' | 'MEMBER' | 'PASTOR' | 'FINANCE' | 'DIACON'
/**
 * Autoriza se o usuário tiver PELO MENOS um dos roles permitidos.
 * ADMIN passa direto (bypass) por padrão.
 */
const norm = (v: unknown) => String(v ?? '').trim().toUpperCase()

export const hasRole =
  (...allowed: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const raw = req.user?.roles?.length
      ? req.user.roles
      : req.user?.role
      ? [req.user.role]
      : []

    const userSet = new Set(raw.map(norm))
    if (userSet.size === 0) {
      return res.status(403).json({ error: 'Acesso negado. Usuário sem papéis atribuídos.' })
    }
    if (userSet.has('ADMIN')) return next()

    const allowedSet = new Set(allowed.map(norm))
    if (allowedSet.size === 0) return next()

    const ok = [...allowedSet].some((r) => userSet.has(r))
    if (!ok) return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' })

    return next()
  }

/**
 * Variante: exige TODOS os roles (geralmente incomum, mas às vezes útil).
 */
export const hasAllRoles =
  (...required: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const userRoles: Role[] = (req.user?.roles && req.user.roles.length
      ? req.user.roles
      : req.user?.role
      ? [req.user.role]
      : []) as Role[]

    if (!userRoles.length) {
      return res
        .status(403)
        .json({ error: 'Acesso negado. Usuário sem papéis atribuídos.' })
    }

    if (userRoles.includes('ADMIN')) return next()

    const ok = required.every(r => userRoles.includes(r))
    if (!ok) {
      return res
        .status(403)
        .json({ error: 'Acesso negado. Permissão insuficiente.' })
    }

    return next()
  }
