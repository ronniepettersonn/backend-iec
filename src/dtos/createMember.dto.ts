import { z } from 'zod'

export const createMemberSchema = z.object({
  fullName: z.string().min(3, 'O nome completo é obrigatório'),
  email: z.string().email('E-mail inválido').optional(),
  phone: z.string().optional(),
  birthDate: z.coerce.date().optional(), // converte string em Date
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  role: z.string().optional(),
  maritalStatus: z.string().optional(),
})

export type CreateMemberDTO = z.infer<typeof createMemberSchema>