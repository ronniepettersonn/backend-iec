// src/bootstrap/express-augment.ts
import type { Role } from '../@types/roles' // <- usa seu enum existente

export {} // mantém como módulo

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string
    churchId?: string
    user?: {
      id: string
      churchId: string
      roles?: Role[]
      role?: Role
    }
    file?: Express.Multer.File
    files?: Express.Multer.File[]
  }
}
