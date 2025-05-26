import { z } from 'zod'

export const updateMemberSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().optional(),
  active: z.boolean().optional(),
})