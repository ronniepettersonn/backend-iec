import { z } from 'zod'

const baseVisitorSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  phone: z.string(),
  email: z.string().email('E-mail inválido').optional(),
  notes: z.string().optional(),
  visitDate: z.union([z.string(), z.date()]).optional(),
  cultId: z.string().uuid('Culto inválido').optional(),
})

export const createVisitorSchema = baseVisitorSchema.refine((data) => {
  return data.visitDate || data.cultId
}, {
  message: 'Informe uma data de visita ou associe a um culto.',
  path: ['visitDate']
})

export const updateVisitorSchema = baseVisitorSchema.partial()

export const contactVisitorSchema = z.object({
  wasContacted: z.boolean(),
  contactedAt: z.coerce.date().optional(),
  contactNotes: z.string().optional(),
})

export const markContactedSchema = z.object({
  contactedById: z.string().uuid(),
  contactNotes: z.string().optional(),
})