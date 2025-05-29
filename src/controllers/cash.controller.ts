import { Request, Response } from 'express'
import { prisma } from '../prisma/client'

// Abre caixa automaticamente ao fazer o primeiro lançamento do dia
export const ensureDailyCashOpen = async (userId: string): Promise<void> => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existingCash = await prisma.dailyCash.findUnique({
    where: { date: today }
  })

  if (!existingCash) {
    await prisma.dailyCash.create({
      data: {
        date: today,
        openingAmount: 0, // ou algum valor inicial se quiser
        createdById: userId
      }
    })
  }
}

// Fechamento manual
export const closeDailyCash = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { closingAmount, notes } = req.body

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dailyCash = await prisma.dailyCash.findUnique({
      where: { date: today }
    })

    if (!dailyCash) {
      return res.status(404).json({ error: 'Caixa de hoje não encontrado' })
    }

    const updatedCash = await prisma.dailyCash.update({
      where: { date: today },
      data: {
        closingAmount,
        notes
      }
    })

    return res.json(updatedCash)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao fechar o caixa' })
  }
}

// Ver status do caixa do dia
export const getTodayCash = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const cash = await prisma.dailyCash.findUnique({
      where: { date: today }
    })

    return res.json(cash)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao buscar caixa do dia' })
  }
}
