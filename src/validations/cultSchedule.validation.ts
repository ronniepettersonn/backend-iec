import { z } from 'zod'

export const createCultScheduleSchema = z.object({
  cultId: z.string().uuid({ message: 'cultId inválido' }),
  preacherId: z.string().uuid({ message: 'preacherId inválido' }),
  directorId: z.string().uuid({ message: 'directorId inválido' }),
  notes: z.string()
})

export const updateCultScheduleSchema = z.object({
  cultId: z.string().uuid().optional(),
  preacherId: z.string().uuid().optional(),
  directorId: z.string().uuid().optional(),
  notes: z.string()
})