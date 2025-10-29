import { Request, Response } from "express"
import { prisma } from '../prisma/client'
import { createOfferingSchema, updateMetaSchema, upsertItemsSchema, listOfferingsSchema } from "../validations/offerings.validation"
import { recalcTotals } from "../services/offerings.service"

export async function createOffering(req: Request, res: Response) {
  if (!req.churchId || !req.userId) return res.status(401).json({ error: "Auth/Tenant inválidos" })
  const parsed = createOfferingSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const data = parsed.data
  const created = await prisma.offeringCount.create({
    data: {
      churchId: req.churchId,
      serviceType: data.serviceType,
      serviceDate: data.serviceDate,
      createdById: req.userId
    }
  })
  res.status(201).json(created)
}

export async function updateOfferingMeta(req: Request, res: Response) {
  const { id } = req.params
  const parsed = updateMetaSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const off = await prisma.offeringCount.findFirst({ where: { id, churchId: req.churchId } })
  if (!off) return res.status(404).json({ error: "Registro não encontrado" })
  if (off.status === "finalized") return res.status(409).json({ error: "Registro finalizado" })

  const updated = await prisma.offeringCount.update({
    where: { id },
    data: parsed.data
  })
  res.json(updated)
}

export async function upsertOfferingItems(req: Request, res: Response) {
  const { id } = req.params
  const parsed = upsertItemsSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const off = await prisma.offeringCount.findFirst({ where: { id, churchId: req.churchId } })
  if (!off) return res.status(404).json({ error: "Registro não encontrado" })
  if (off.status === "finalized") return res.status(409).json({ error: "Registro finalizado" })

  // upsert por chave composta (offeringCountId, kind, value)
  for (const it of parsed.data.items) {
    const lineTotal = +(it.value * it.quantity).toFixed(2)
    await prisma.offeringItem.upsert({
      where: {
        offeringCountId_kind_value: {
          offeringCountId: id,
          kind: it.kind,
          value: it.value
        }
      },
      update: { quantity: it.quantity, lineTotal },
      create: {
        offeringCountId: id,
        kind: it.kind,
        value: it.value,
        quantity: it.quantity,
        lineTotal
      }
    })
  }

  const totals = await recalcTotals(id)
  const full = await prisma.offeringCount.findUnique({
    where: { id },
    include: { items: true }
  })
  res.json({ ...full, totals })
}

export async function getOffering(req: Request, res: Response) {
  const { id } = req.params
  const off = await prisma.offeringCount.findFirst({
    where: { id, churchId: req.churchId },
    include: { items: true, signatures: true }
  })
  if (!off) return res.status(404).json({ error: "Registro não encontrado" })
  res.json(off)
}

export async function listOfferings(req: Request, res: Response) {
  const parsed = listOfferingsSchema.safeParse(req.query)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { page, limit, status, dateFrom, dateTo } = parsed.data
  const where: any = { churchId: req.churchId }
  if (status) where.status = status
  if (dateFrom || dateTo) {
    where.serviceDate = {}
    if (dateFrom) where.serviceDate.gte = dateFrom
    if (dateTo)   where.serviceDate.lte = dateTo
  }

  const [rows, total] = await Promise.all([
    prisma.offeringCount.findMany({
      where, orderBy: { serviceDate: "desc" },
      skip: (page - 1) * limit, take: limit,
      select: { id: true, serviceDate: true, serviceType: true, grandTotal: true, status: true, envelopes: true }
    }),
    prisma.offeringCount.count({ where })
  ])

  res.json({ page, limit, total, rows })
}

export async function finalizeOffering(req: Request, res: Response) {
  // @ts-ignore
  const off = req.offering as { id: string; churchId: string; status: string }
  if (!off) return res.status(404).json({ error: "Registro não encontrado" })

  if (off.status === "finalized") {
    // Idempotente: já finalizado → retorna 200 com o próprio registro
    const full = await prisma.offeringCount.findUnique({
      where: { id: off.id },
      include: { items: true, signatures: true }
    })
    return res.json({ message: "Já finalizado", offering: full })
  }

  // precisa ter itens
  const itemsCount = await prisma.offeringItem.count({ where: { offeringCountId: off.id } })
  if (itemsCount === 0) {
    return res.status(400).json({ error: "Não é possível finalizar sem itens (notas/moedas)" })
  }

  // Recalcula totais antes de fechar:
  await recalcTotals(off.id)

  const updated = await prisma.offeringCount.update({
    where: { id: off.id },
    data: { status: "finalized" },
    include: { items: true, signatures: true }
  })

  return res.json({ message: "Finalizado com sucesso", offering: updated })
}

/**
 * Opcional: reabrir em caso de erro operacional.
 * Proteja com RBAC forte (apenas finance_admin / pastor / dono da igreja).
 */
export async function reopenOffering(req: Request, res: Response) {
  // @ts-ignore
  const off = req.offering as { id: string; status: string }
  if (!off) return res.status(404).json({ error: "Registro não encontrado" })

  if (off.status !== "finalized") {
    return res.status(400).json({ error: "Somente registros finalizados podem ser reabertos" })
  }

  const updated = await prisma.offeringCount.update({
    where: { id: off.id },
    data: { status: "draft" },
    include: { items: true, signatures: true }
  })

  return res.json({ message: "Reaberto para edição", offering: updated })
}