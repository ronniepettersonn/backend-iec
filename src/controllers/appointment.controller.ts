import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { createAppointmentSchema } from '../validations/appointment.validation'

export const createAppointment = async (req: Request, res: Response) => {
    try {
        const { title, description, date, location, attendeesIds } = createAppointmentSchema.parse(req.body)

        const appointment = await prisma.appointment.create({
            data: {
                title,
                description,
                date,
                location,
                createdById: req.userId!, // já vem do middleware
                attendees: attendeesIds ? {
                    connect: attendeesIds.map(id => ({ id })),
                } : undefined,
            },
            include: {
                attendees: true,
            },
        })

        return res.status(201).json(appointment)
    } catch (error) {
        console.error(error)
        return res.status(400).json({ error: 'Erro ao criar compromisso' })
    }
}

export const listAppointments = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, search, page = 1, limit = 10 } = req.query

        const take = Number(limit)
        const skip = (Number(page) - 1) * take

        const filters: any = {
            createdById: req.userId,
        }

        if (startDate || endDate) {
            filters.date = {}
            if (startDate) filters.date.gte = new Date(startDate as string)
            if (endDate) filters.date.lte = new Date(endDate as string)
        }

        if (search) {
            filters.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
            ]
        }

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where: filters,
                include: { attendees: true },
                orderBy: { date: 'asc' },
                take,
                skip,
            }),
            prisma.appointment.count({ where: filters }),
        ])

        return res.json({
            data: appointments,
            meta: {
                total,
                page: Number(page),
                lastPage: Math.ceil(total / take),
            },
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Erro ao listar compromissos' })
    }
}