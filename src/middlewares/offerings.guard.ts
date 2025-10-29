import { Request, Response, NextFunction } from "express"
import { prisma } from '../prisma/client';

export async function loadOffering(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params
  if (!id) return res.status(400).json({ error: "id ausente" })

  const off = await prisma.offeringCount.findFirst({
    where: { id, churchId: req.churchId },
  })
  if (!off) return res.status(404).json({ error: "Registro não encontrado" })

  // @ts-ignore
  req.offering = off
  next()
}

export function ensureEditable(req: Request, res: Response, next: NextFunction) {
  // @ts-ignore
  const off = req.offering as { status: string }
  if (!off) return res.status(500).json({ error: "Offering não carregado" })

  if (off.status === "finalized") {
    return res.status(409).json({ error: "Registro finalizado: alterações bloqueadas" })
  }
  next()
}
