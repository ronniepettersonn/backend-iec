import { z } from "zod";

export const updateAccountPayableSchema = z.object({
  dueDate: z.coerce.date(),
  amount: z.number().positive(),
  description: z.string().min(3),
  categoryId: z.string().uuid().optional(),
  paid: z.boolean().optional(),
  paidAt: z.coerce.date().optional(),
})

export const createAccountPayableSchema = z.object({
  dueDate: z.coerce.date({
    required_error: 'A data de vencimento é obrigatória',
    invalid_type_error: 'Data inválida',
  }),
  amount: z.coerce.number().positive({ message: 'O valor deve ser positivo' }),
  description: z.string().min(3, { message: 'Descrição muito curta' }),
  categoryId: z.string().uuid().optional(),
})