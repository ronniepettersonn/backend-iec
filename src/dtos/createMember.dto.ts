import { z } from 'zod'

export const createMemberSchema = z.object({
  fullName: z.string().min(3, 'O nome completo é obrigatório'),
  email: z.string().email('E-mail inválido').optional(),
  phone: z.string().optional(),
  birthDate: z.coerce.date().optional(), // converte string em Date
  baptismDate: z.string().datetime().optional(),
  conversionDate: z.string().datetime().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  role: z.string().optional(),
  maritalStatus: z.string().optional(),
  joinDate: z.string().datetime().optional(),
  status: z.enum(['ATIVO', 'INATIVO', 'AUSENTE']).optional(),
  notes: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional()
})

export type CreateMemberDTO = z.infer<typeof createMemberSchema>