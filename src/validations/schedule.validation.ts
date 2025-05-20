import { z } from 'zod'

export const createScheduleSchema = z.object({
  date: z.coerce.date(), // aceita string ou Date
  ministryId: z.string().uuid(),
location: z.string().min(1),
  memberIds: z.array(z.string().uuid()).min(1, 'Informe pelo menos um membro'),
})