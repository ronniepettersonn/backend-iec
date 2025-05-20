import { z } from 'zod'

export const createVisitorSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional(),
  notes: z.string().optional(),
  visitDate: z.union([z.string(), z.date()]).optional(),
})

export const updateVisitorSchema = createVisitorSchema.partial()

export const contactVisitorSchema = z.object({
  wasContacted: z.boolean(),
  contactedAt: z.coerce.date().optional(),
  contactNotes: z.string().optional(),
})

export const markContactedSchema = z.object({
  contactedById: z.string().uuid(),
  contactNotes: z.string().optional(),
})