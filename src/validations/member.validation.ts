import { z } from 'zod'

export const updateMemberSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().optional(),
  active: z.boolean().optional(),
  joinDate: z.string().datetime().optional(),  
  status: z.enum(['ATIVO', 'INATIVO', 'AUSENTE']).optional(),
  notes: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  baptismDate: z.string().datetime().optional(),
  conversionDate: z.string().datetime().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional()
})