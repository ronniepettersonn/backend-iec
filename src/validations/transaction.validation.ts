import { z } from 'zod'

export const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  paymentMethod: z.enum(['BANK', 'CASH']),
  description: z.string().min(3),
  bankAccountId: z.string().optional().nullable(),
  amount: z.number().positive(),
  date: z.string().datetime(),
  categoryId: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.paymentMethod === 'BANK' && !data.bankAccountId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'bankAccountId é obrigatório quando o método de pagamento é BANK',
      path: ['bankAccountId'],
    })
  }

  if (data.paymentMethod === 'CASH' && data.bankAccountId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'bankAccountId deve ser nulo quando o método de pagamento é CASH',
      path: ['bankAccountId'],
    })
  }
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>