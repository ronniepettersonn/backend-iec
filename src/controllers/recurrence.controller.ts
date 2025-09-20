import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { createRecurrenceSchema, updateRecurrenceSchema } from '../validations/recurrence.validation'
import { generateAccountsFromRecurrence } from '../services/recurrence.service'
import { Prisma, RecurrenceStatus } from '@prisma/client'

export const createRecurrence = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    const churchId = req.churchId
    if (!userId || !churchId) {
      return res.status(401).json({ error: 'Usuário ou igreja não autenticados' })
    }

    const validated = createRecurrenceSchema.parse(req.body)

    // Datas normalizadas
    const startDate = new Date(validated.startDate)
    const endDate   = validated.endDate ? new Date(validated.endDate) : null
    const now = new Date()

    // Status inicial (enum do Prisma)
    let nextStatus: RecurrenceStatus = RecurrenceStatus.active
    if (endDate && endDate < now) {
      nextStatus = RecurrenceStatus.overdue
    }

    // (opcional) validar categoria pertencer à igreja
    if (validated.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: validated.categoryId } })
      if (!cat) return res.status(400).json({ error: 'Categoria não encontrada' })
      if (cat.churchId !== churchId) {
        return res.status(403).json({ error: 'Categoria não pertence à sua igreja' })
      }
    }

    // amount é Decimal no BD: enviar como string/Decimal evita imprecisão
    const amountDecimal =
      typeof validated.amount === 'number'
        ? new Prisma.Decimal(validated.amount.toFixed(2))
        : new Prisma.Decimal(validated.amount)

    // Cria a recorrência já com contadores zerados
    const created = await prisma.recurrence.create({
      data: {
        ...validated,
        amount: amountDecimal,
        startDate,
        endDate,
        status: nextStatus,           // enum
        paidInstallments: 0,
        // se totalInstallments vier no body, será usado; se não, derivamos depois
        churchId,
      },
    })

    // Gera as parcelas (seu helper atual)
    // OBS: idealmente isso deveria aceitar um tx (TransactionClient) para tudo ser atômico.
    await generateAccountsFromRecurrence(created, userId, churchId)

    // Reconta parcelas geradas/pagas para preencher os campos e ajustar status
    const [totalGeradas, pagas] = await Promise.all([
      prisma.accountPayable.count({ where: { recurrenceId: created.id } }),
      prisma.accountPayable.count({ where: { recurrenceId: created.id, paid: true } }),
    ])

    // Se o usuário informou totalInstallments, use-o. Senão derive do que foi gerado (ou mantenha null se nada foi gerado ainda)
    const totalPrevistas =
      created.totalInstallments ?? (totalGeradas > 0 ? totalGeradas : null)

    const todasPagas =
      (totalPrevistas != null && pagas >= totalPrevistas) ||
      (totalPrevistas == null && totalGeradas > 0 && pagas >= totalGeradas)

    if (todasPagas) {
      nextStatus = RecurrenceStatus.finished
    } else if (endDate && endDate < now) {
      nextStatus = RecurrenceStatus.overdue
    } else {
      nextStatus = RecurrenceStatus.active
    }

    const updated = await prisma.recurrence.update({
      where: { id: created.id },
      data: {
        paidInstallments: pagas,
        totalInstallments: totalPrevistas,      // mantém null quando não houver previsão/geradas
        status: { set: nextStatus },            // forma segura p/ EnumUpdateOperationsInput
      },
    })

    return res.status(201).json(updated)
  } catch (error: any) {
    console.error(error)
    return res.status(400).json({ error: error.message })
  }
}

export const listRecurrences = async (req: Request, res: Response) => {
  try {
    const churchId = req.churchId
    if (!churchId) {
      return res.status(401).json({ error: 'Igreja não autenticada' })
    }

    const {
      page = '1',
      limit = '10',
      categoryId,
      status,
      frequency,
      startDate,
      endDate,
      description,
    } = req.query as Record<string, string | string[]>

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1)
    const limitNumber = Math.min(Math.max(parseInt(limit as string, 10) || 10, 1), 100)
    const skip = (pageNumber - 1) * limitNumber

    // 🔹 Construção dinâmica dos filtros
    const filters: any = { churchId }

    if (categoryId) filters.categoryId = categoryId
    if (frequency) filters.frequency = frequency

    // 🔹 status pode ser string, array ou separado por vírgula
    if (status) {
      let statusList: string[] = []

      if (Array.isArray(status)) {
        statusList = status
      } else if (typeof status === 'string') {
        statusList = status.split(',').map(s => s.trim())
      }

      if (statusList.length > 0) {
        filters.status = { in: statusList }
      }
    }

    if (startDate || endDate) {
      filters.startDate = {}
      if (startDate) filters.startDate.gte = new Date(startDate as string)
      if (endDate) filters.startDate.lte = new Date(endDate as string)
    }

    if (description) {
      filters.description = { contains: description as string, mode: 'insensitive' }
    }

    const [recurrences, total] = await Promise.all([
      prisma.recurrence.findMany({
        where: filters,
        include: { category: true },
        orderBy: { startDate: 'desc' },
        skip,
        take: limitNumber,
      }),
      prisma.recurrence.count({ where: filters }),
    ])

    if (recurrences.length === 0) {
      return res.json({
        data: [],
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      })
    }

    const ids = recurrences.map(r => r.id)

    // 🔹 Contagem total de parcelas geradas
    const totals = await prisma.accountPayable.groupBy({
      by: ['recurrenceId'],
      where: { recurrenceId: { in: ids } },
      _count: { _all: true },
    })

    // 🔹 Contagem de parcelas pagas
    const paids = await prisma.accountPayable.groupBy({
      by: ['recurrenceId'],
      where: { recurrenceId: { in: ids }, paid: true },
      _count: { _all: true },
    })

    const totalDict: Record<string, number> = Object.create(null)
    for (const t of totals) if (t.recurrenceId) totalDict[t.recurrenceId] = t._count._all

    const paidDict: Record<string, number> = Object.create(null)
    for (const p of paids) if (p.recurrenceId) paidDict[p.recurrenceId] = p._count._all

    const data = recurrences.map(r => {
      const generated = totalDict[r.id] ?? 0
      const paid = paidDict[r.id] ?? 0
      const totalResolved = r.totalInstallments ?? (generated > 0 ? generated : null)
      const remaining = totalResolved != null ? Math.max(totalResolved - paid, 0) : null

      return {
        ...r,
        installments: {
          planned: r.totalInstallments,
          generated,
          total: totalResolved,
          paid,
          remaining,
        },
      }
    })

    return res.json({
      data,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar recorrências' })
  }
}



export const updateRecurrence = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const validatedData = updateRecurrenceSchema.parse(req.body)

    const recurrence = await prisma.recurrence.update({
      where: { id },
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined
      }
    })

    return res.json(recurrence)
  } catch (error: any) {
    console.error(error)
    return res.status(400).json({ error: error.message })
  }
}

export const deleteRecurrence = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await prisma.recurrence.delete({
      where: { id }
    })
    return res.status(204).send()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao deletar recorrência' })
  }
}
