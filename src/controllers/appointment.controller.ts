import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { confirmAttendanceSchema, createAppointmentSchema, rescheduleAppointmentSchema } from '../validations/appointment.validation'

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

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        attendees: {
          select: { id: true, member: true }
        },
        createdBy: {
          select: { id: true, name: true }
        }
      }
    })

    if (!appointment || !appointment.active) {
      return res.status(404).json({ error: 'Agendamento não encontrado' })
    }

    return res.json(appointment)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar agendamento' })
  }
}

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, description, date, location } = req.body

    const appointment = await prisma.appointment.findUnique({ where: { id } })
    if (!appointment || !appointment.active) {
      return res.status(404).json({ error: 'Agendamento não encontrado' })
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        title,
        description,
        date: new Date(date),
        location
      }
    })

    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar agendamento' })
  }
}

export const softDeleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const appointment = await prisma.appointment.findUnique({ where: { id } })
    if (!appointment || !appointment.active) {
      return res.status(404).json({ error: 'Agendamento não encontrado' })
    }

    await prisma.appointment.update({
      where: { id },
      data: { active: false }
    })

    return res.status(204).send()
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao excluir agendamento' })
  }
}

export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { active: true },
      orderBy: { date: 'asc' },
      include: {
        attendees: {
          select: { id: true, member: true }
        },
        createdBy: {
          select: { id: true, name: true }
        }
      }
    })

    return res.json(appointments)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar agendamentos' })
  }
}

export const getMyAppointments = async (req: Request, res: Response) => {
  try {
    const userId = req.userId

    const appointments = await prisma.appointment.findMany({
      where: {
        active: true,
        OR: [
          { createdById: userId },
          { attendees: { some: { id: userId } } }
        ]
      },
      orderBy: { date: 'asc' },
      include: {
        attendees: {
          select: { id: true, member: true }
        },
        createdBy: {
          select: { id: true, name: true }
        }
      }
    })

    return res.json(appointments)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar seus agendamentos' })
  }
}

export const rescheduleAppointment = async (req: Request, res: Response) => {
  try {
    const { newDate } = rescheduleAppointmentSchema.parse(req.body)
    const appointmentId = req.params.id

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        date: new Date(newDate)
      }
    })

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Não foi possível remarcar o compromisso' })
  }
}

export const confirmAttendance = async (req: Request, res: Response) => {
  try {
    const { appointmentId, memberId } = req.params

    const appointmentMember = await prisma.appointmentMember.update({
      where: {
        appointmentId_memberId: {
          appointmentId,
          memberId
        }
      },
      data: {
        confirmed: true,
        confirmedAt: new Date()
      }
    })

    return res.status(200).json(appointmentMember)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao confirmar presença' })
  }
}

export async function getAttendees(req: Request, res: Response) {
  const appointmentId = req.params.appointmentId

  try {
    const attendees = await prisma.appointmentMember.findMany({
      where: { appointmentId },
      include: {
        member: {
          select: {
            id: true,
            fullName: true,
            email: true, // opcional, se quiser mostrar
          },
        },
      },
    })

    // Formatando um pouco a resposta para facilitar uso no front
    const formattedAttendees = attendees.map(att => ({
      memberId: att.member.id,
      fullName: att.member.fullName,
      email: att.member.email,
      confirmed: att.confirmed,
      confirmedAt: att.confirmedAt, // supondo que exista esse campo
    }))

    return res.json(formattedAttendees)
  } catch (error) {
    console.error('Erro ao buscar attendees:', error)
    return res.status(500).json({ error: 'Erro interno ao buscar convidados' })
  }
}