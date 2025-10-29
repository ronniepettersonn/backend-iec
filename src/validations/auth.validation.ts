import { z } from 'zod'

/* 
ADMIN
  LEADER
  MEMBER
  PASTOR
  FINANCE
*/

const ROLES = ['ADMIN', 'LEADER', 'MEMBER', 'PASTOR', 'FINANCE'] as const;
const RoleEnum = z.enum(ROLES);

export const registerUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  roles: z.array(RoleEnum)
         .min(1, "Informe ao menos um papel")
         .refine(arr => new Set(arr).size === arr.length, "Papéis repetidos")
         .optional(),
})

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const updateUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  passwordHash: z.string().min(6).optional(),
  roles: z.array(RoleEnum)
         .min(1, "Informe ao menos um papel")
         .refine(arr => new Set(arr).size === arr.length, "Papéis repetidos")
         .optional(),
  active: z.boolean().optional()
})