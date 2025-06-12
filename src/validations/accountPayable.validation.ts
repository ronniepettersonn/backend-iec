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
  dueDate: z.string().datetime(),
  amount: z.number().positive(),
  description: z.string().min(3),
  categoryId: z.string().uuid().optional(),
})