import { z } from 'zod'

export const createAppointmentSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    date: z.coerce.date(),
    location: z.string().min(3),
    attendeesIds: z.array(z.string().uuid()).optional(),
})

export const rescheduleAppointmentSchema = z.object({
  newDate: z.string().datetime('Data/hora inválida')
})

export const confirmAttendanceSchema = z.object({
  userId: z.string().uuid()
})