// src/middlewares/isAuthenticated.ts
import { Request, Response, NextFunction } from 'express'
import jwt, { TokenExpiredError, JsonWebTokenError, NotBeforeError } from 'jsonwebtoken'
import { Role } from '../@types/roles'

const JWT_ALG = (process.env.JWT_ALG || 'HS256') as jwt.Algorithm
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret'
const VERIFY_OPTS: jwt.VerifyOptions =
  JWT_ALG === 'RS256' ? { algorithms: ['RS256'] } : { algorithms: ['HS256'] }

interface JwtPayload {
  id?: string
  sub?: string
  churchId?: string
  church_id?: string
  roles?: Array<Role | string>          // ex: ['ADMIN','PASTOR']
  role?: Role | string | Array<string>  // ⚠️ pode ser string OU array (seu caso)
}

const toUpper = (s?: string) => (s ?? '').trim().toUpperCase()

function toRoleEnum(value?: string): Role | null {
  const v = toUpper(value)
  return (Object.values(Role) as string[]).includes(v) ? (v as Role) : null
}

function normalizeRoles(p: JwtPayload): Role[] {
  // ✅ cobre todas as variantes: roles[], role string[], role string
  const base =
    Array.isArray(p.roles) && p.roles.length
      ? p.roles
      : Array.isArray(p.role) && p.role.length
      ? p.role
      : p.role
      ? [p.role]
      : []

  return base
    .map((r) => (typeof r === 'string' ? toRoleEnum(r) : r))
    .filter((r): r is Role => !!r)
}

function firstNonEmpty<T>(...vals: (T | undefined)[]) {
  return vals.find(
    (v) => v !== undefined && v !== null && (typeof v !== 'string' || v.trim() !== '')
  ) as T | undefined
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authHeader = (req.headers.authorization || req.headers.Authorization || '') as string
  const [scheme, token] = authHeader.split(' ').map((s) => (s || '').trim())

  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  try {
    const key = JWT_ALG === 'RS256'
      ? (process.env.JWT_PUBLIC_KEY || '').replace(/\\n/g, '\n')
      : JWT_SECRET

    if (!key) return res.status(500).json({ error: 'Configuração JWT ausente (chave/segredo)' })

    const decoded = jwt.verify(token, key, VERIFY_OPTS) as JwtPayload

    const userId = firstNonEmpty(decoded.id, decoded.sub)
    const churchId = firstNonEmpty(decoded.churchId, decoded.church_id)

    if (!userId || !churchId) return res.status(401).json({ error: 'Token inválido' })

    const roles = normalizeRoles(decoded)

    req.userId = userId
    req.churchId = churchId
    req.user = {
      id: userId,
      churchId,
      roles,            // agora sempre preenche com ['ADMIN','PASTOR'] no seu caso
      role: roles[0],   // legado, opcional
    }
    return next()
  } catch (err) {
    if (err instanceof TokenExpiredError) return res.status(401).json({ error: 'Token expirado' })
    if (err instanceof JsonWebTokenError) return res.status(401).json({ error: 'Token inválido' })
    return res.status(401).json({ error: 'Falha na autenticação' })
  }
}
