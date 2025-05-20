import { z } from 'zod'

export const updateMemberSchema = z.object({
  fullName: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  active: z.boolean().optional(),
})