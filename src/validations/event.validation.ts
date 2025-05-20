import { z } from 'zod'

export const createEventSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.string(),
  location: z.string(),
})