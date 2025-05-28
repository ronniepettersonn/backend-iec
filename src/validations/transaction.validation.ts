import { z } from 'zod'

export const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().min(3),
  amount: z.number().positive(),
  date: z.string().datetime(), // ou z.coerce.date() se preferir
  categoryId: z.string().optional()
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>