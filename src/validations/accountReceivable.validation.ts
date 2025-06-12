import { z } from 'zod'

export const createAccountReceivableSchema = z.object({
  dueDate: z.string().datetime({ message: 'Data de vencimento inválida' }),
  amount: z.number().positive({ message: 'Valor deve ser positivo' }),
  description: z.string().min(3, 'Descrição muito curta'),
  memberId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional()
})

export const markAccountReceivableAsReceivedSchema = z.object({
  receivedAt: z.string().datetime({ message: 'Data de recebimento inválida' }).optional()
})
