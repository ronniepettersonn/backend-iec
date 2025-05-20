import { z } from 'zod'

export const createNoticeSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    content: z.string().min(1, 'Conteúdo é obrigatório'),
})

export const updateNoticeSchema = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
})