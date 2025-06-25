import { z } from 'zod'

/* 
ADMIN
  LEADER
  MEMBER
  PASTOR
  FINANCE
*/

export const registerUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'LEADER', 'MEMBER', 'PASTOR', 'FINANCE']).optional(),
})

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const updateUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  passwordHash: z.string().min(6).optional(),
  role: z.enum(['ADMIN', 'LEADER', 'MEMBER', 'PASTOR', 'FINANCE']).optional(),
  active: z.boolean().optional()
})