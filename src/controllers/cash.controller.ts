import { Request, Response } from 'express'
import { prisma } from '../prisma/client'

export const ensureDailyCashOpen = async (userId: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Verifica se o caixa de hoje já está aberto
  const existingCash = await prisma.dailyCash.findUnique({
    where: { date: today },
  })

  if (existingCash) return existingCash

  // Calcula o saldo total do sistema (entradas - saídas)
  const allTransactions = await prisma.transaction.findMany()

  const totalIncome = allTransactions
    .filter(tx => tx.type === 'INCOME')
    .reduce((acc, tx) => acc + tx.amount, 0)

  const totalExpense = allTransactions
    .filter(tx => tx.type === 'EXPENSE')
    .reduce((acc, tx) => acc + tx.amount, 0)

  const openingAmount = totalIncome - totalExpense

  // Cria novo caixa com saldo real acumulado
  const newCash = await prisma.dailyCash.create({
    data: {
      date: today,
      openingAmount,
      createdById: userId
    },
  })

  // 📝 Cria log de abertura
  await prisma.logEntry.create({
    data: {
      action: 'CREATE',
      entity: 'DailyCash',
      entityId: newCash.id,
      userId,
      description: `Abertura automática do caixa com saldo acumulado de R$ ${openingAmount.toFixed(2)}.`,
    },
  })

  return newCash
}


export const closeDailyCash = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { date, closingAmount, notes } = req.body

    if (!date || typeof closingAmount !== 'number') {
      return res.status(400).json({ error: 'Data e valor de fechamento são obrigatórios' })
    }

    const closingDate = new Date(date)
    closingDate.setHours(0, 0, 0, 0)

    const dailyCash = await prisma.dailyCash.findUnique({
      where: { date: closingDate }
    })

    if (!dailyCash) {
      return res.status(404).json({ error: 'Caixa para a data informada não encontrado' })
    }

    if (dailyCash.closingAmount !== null) {
      return res.status(400).json({ error: 'Este caixa já está fechado' })
    }

    const updatedCash = await prisma.dailyCash.update({
      where: { date: closingDate },
      data: {
        closingAmount,
        notes
      }
    })

    await prisma.logEntry.create({
      data: {
        action: 'UPDATE',
        entity: 'DailyCash',
        entityId: updatedCash.id,
        userId,
        description: `Fechamento manual do caixa do dia ${closingDate.toLocaleDateString('pt-BR')} com valor de R$ ${closingAmount.toFixed(2)}.`,
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

export const getCashStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Verifica se o caixa de hoje existe
    const todayCash = await prisma.dailyCash.findUnique({
      where: { date: today },
    })

    // Busca o último caixa fechado
    const lastClosedCash = await prisma.dailyCash.findFirst({
      where: { closingAmount: { not: null } },
      orderBy: { date: 'desc' },
    })

    // Calcula saldo geral
    const transactions = await prisma.transaction.findMany({})
    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0)
    const overallBalance = totalIncome - totalExpense

    const status = !todayCash
      ? 'Caixa não aberto'
      : todayCash.closingAmount !== null
        ? 'Caixa fechado'
        : 'Caixa aberto'

    return res.json({
      status,
      today: todayCash
        ? {
            openingAmount: todayCash.openingAmount,
            closingAmount: todayCash.closingAmount,
          }
        : null,
      lastClosedDate: lastClosedCash?.date ?? null,
      overallBalance,
    })

  } catch (error: any) {
    console.error('[getCashStatus] Erro:', error)
    return res.status(500).json({ error: 'Erro ao obter status do caixa' })
  }
}