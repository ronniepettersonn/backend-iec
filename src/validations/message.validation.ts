import { z } from 'zod'

export const createMessageSchema = z.object({
  receiverId: z.string().uuid(),
  content: z.string().min(1, 'Mensagem não pode ser vazia')
})

