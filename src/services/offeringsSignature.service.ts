import { prisma } from '../prisma/client'
import crypto from "crypto"
import type { Request } from "express"
import { getClientIp } from "../utils/ip"

type CanonItem = {
  kind: "NOTE" | "COIN"
  value: string   // como string para não perder precisão (Decimal)
  quantity: number
}

type CanonPayload = {
  id: string
  churchId: string
  serviceType: string
  serviceDate: string // ISO normalizado
  sealNumber: string | null
  envelopes: number
  items: CanonItem[]  // ordenado por kind, depois value numérico
  totals: {
    notesTotal: string
    coinsTotal: string
    grandTotal: string
    titheShare15: string
  }
}

/**
 * Converte Prisma.Decimal/number para string com padronização (2 casas).
 * Para moedas, manter sempre 2 casas decimais ajuda a evitar inconsistências.
 */
function moneyToString(v: any): string {
  // Prisma.Decimal tem toString(); number também.
  const n = Number(v)
  return n.toFixed(2) // "123.45"
}

export async function loadOfferingForHash(offeringId: string) {
  const off = await prisma.offeringCount.findUnique({
    where: { id: offeringId },
    include: {
      items: true, // precisamos de itens
    }
  })
  return off
}

export function buildCanonicalPayload(off: NonNullable<Awaited<ReturnType<typeof loadOfferingForHash>>>): CanonPayload {
  const items: CanonItem[] = off.items.map(i => ({
    kind: i.kind as "NOTE" | "COIN",
    value: moneyToString(i.value),      // "2.00" | "0.50" etc
    quantity: i.quantity
  }))
  // ordena: kind (COIN antes de NOTE? tanto faz, mas padronize) e por value numérico crescente
  items.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind < b.kind ? -1 : 1
    return Number(a.value) - Number(b.value)
  })

  return {
    id: off.id,
    churchId: off.churchId,
    serviceType: String(off.serviceType),
    serviceDate: new Date(off.serviceDate).toISOString(),
    sealNumber: off.sealNumber ?? null,
    envelopes: off.envelopes ?? 0,
    items,
    totals: {
      notesTotal: moneyToString(off.notesTotal),
      coinsTotal: moneyToString(off.coinsTotal),
      grandTotal: moneyToString(off.grandTotal),
      titheShare15: moneyToString(off.titheShare15),
    }
  }
}

export function sha256Of(obj: any): string {
  const json = JSON.stringify(obj) // já está canônico/ordenado
  return crypto.createHash("sha256").update(json).digest("hex")
}

/**
 * Recalcula o hash do conteúdo finalizado.
 * Recomendado chamar sempre que for assinar ou verificar.
 */
export async function computeOfferingHash(offeringId: string): Promise<{ hash: string, payload: CanonPayload }> {
  const off = await loadOfferingForHash(offeringId)
  if (!off) throw new Error("Offering não encontrado")

  const payload = buildCanonicalPayload(off)
  const hash = sha256Of(payload)
  return { hash, payload }
}

export async function canSign(offeringId: string, churchId: string) {
  const off = await prisma.offeringCount.findFirst({
    where: { id: offeringId, churchId }
  })
  if (!off) return { ok: false, reason: "Registro não encontrado" }
  if (off.status !== "finalized") return { ok: false, reason: "Registro não está finalizado" }
  return { ok: true }
}

export async function signOffering(req: Request, offeringId: string, userId: string) {
  const churchId = req.churchId!
  const check = await canSign(offeringId, churchId)
  if (!check.ok) {
    throw new Error(check.reason)
  }

  // Recalcula hash para garantir integridade no momento da assinatura
  const { hash } = await computeOfferingHash(offeringId)
  const ip = getClientIp(req)

  // Cria assinatura (1 por usuário)
  const signature = await prisma.offeringSignature.create({
    data: {
      offeringCountId: offeringId,
      userId,
      ipAddress: ip,
      hash
    }
  })

  // Retorna também o total de assinaturas após inserir
  const count = await prisma.offeringSignature.count({ where: { offeringCountId: offeringId } })

  return { signature, signaturesCount: count }
}
