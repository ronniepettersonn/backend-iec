import { Request, Response } from "express"
import { prisma } from '../prisma/client'
import { signOffering, computeOfferingHash } from "../services/offeringsSignature.service"

export async function postSignOffering(req: Request, res: Response) {
  try {
    if (!req.userId || !req.churchId) {
      return res.status(401).json({ error: "Auth/Tenant inválidos" })
    }
    const { id } = req.params
    if (!id) return res.status(400).json({ error: "id ausente" })

    try {
      const { signature, signaturesCount } = await signOffering(req, id, req.userId)
      return res.json({
        message: "Assinado com sucesso",
        signature,
        signaturesCount,
        readyForPdf: signaturesCount >= 2 // convenção: 2 assinaturas liberam PDF
      })
    } catch (e: any) {
      // Trata duplicidade (unique constraint)
      if (String(e.message).includes("Unique constraint") || String(e.code) === "P2002") {
        return res.status(409).json({ error: "Usuário já assinou este registro" })
      }
      return res.status(400).json({ error: e.message || "Falha ao assinar" })
    }
  } catch (err) {
    return res.status(500).json({ error: "Erro interno" })
  }
}

export async function getOfferingSignatures(req: Request, res: Response) {
  const { id } = req.params
  const off = await prisma.offeringCount.findFirst({
    where: { id, churchId: req.churchId },
    select: { id: true }
  })
  if (!off) return res.status(404).json({ error: "Registro não encontrado" })

  const signatures = await prisma.offeringSignature.findMany({
    where: { offeringCountId: id },
    include: { /* se quiser incluir user: { select: { name: true, email: true } } */ }
  })

  return res.json({
    count: signatures.length,
    signatures
  })
}

/**
 * Checa integridade:
 * - Recalcula hash do conteúdo finalizado
 * - Compara com os hashes gravados nas assinaturas
 */
export async function getOfferingIntegrity(req: Request, res: Response) {
  const { id } = req.params
  const off = await prisma.offeringCount.findFirst({
    where: { id, churchId: req.churchId },
    include: { signatures: true }
  })
  if (!off) return res.status(404).json({ error: "Registro não encontrado" })

  const { hash, payload } = await computeOfferingHash(id)

  const allMatch = off.signatures.length > 0 && off.signatures.every(s => s.hash === hash)

  return res.json({
    signedBy: off.signatures.map(s => ({ userId: s.userId, signedAt: s.signedAt, ip: s.ipAddress })),
    signaturesCount: off.signatures.length,
    currentHash: hash,
    integrity: allMatch, // true quando todos os hashes conferem
    payload // útil para auditoria/depuração (pode ocultar em prod)
  })
}
