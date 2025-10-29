// src/@types/express/index.d.ts
import type { Role } from '../../types/roles'

export {} // mantém o arquivo como módulo

declare global {
  namespace Express {
    interface UserPayload {
      id: string
      churchId: string
      roles?: Role[]
      role?: Role
    }


  }
}
