import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE'], {
    required_error: 'Tipo é obrigatório e deve ser INCOME ou EXPENSE'
  })
})