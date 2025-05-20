import { z } from 'zod'

export const createMinistrySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  leaderId: z.string().uuid(),
  memberIds: z.array(z.string().uuid()).optional(),
})

export const updateMinistrySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  leaderId: z.string().uuid().optional(),
  memberIds: z.array(z.string().uuid()).optional(),
})