import { z } from 'zod'

export const createRecurrenceSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().nullable(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  amount: z.number().positive(),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional()
})

export const updateRecurrenceSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().nullable(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  amount: z.number().positive(),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional()
})
