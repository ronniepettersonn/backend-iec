import { Request, Response } from 'express'
import {prisma} from '../prisma/client'

export const getFinancialDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    // Busca todas as transações do usuário
    const transactions = await prisma.transaction.findMany({
      where: { createdById: req.userId },
      orderBy: { date: 'asc' },
    })

    // Soma total de INCOME e EXPENSE
    const totalIncome = transactions
      .filter(tx => tx.type === 'INCOME')
      .reduce((acc, tx) => acc + tx.amount, 0)

    const totalExpense = transactions
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((acc, tx) => acc + tx.amount, 0)

    const balance = totalIncome - totalExpense

    // Agrupamento por mês (ano-mês)
    const monthlySummaryMap = transactions.reduce((acc, tx) => {
      const yearMonth = tx.date.toISOString().slice(0, 7) // "2025-05"
      const key = `${tx.type}_${yearMonth}`
      acc[key] = (acc[key] || 0) + tx.amount
      return acc
    }, {} as Record<string, number>)

    const monthlySummary = Object.entries(monthlySummaryMap).map(([key, amount]) => {
      const [type, yearMonth] = key.split('_')
      return { type, yearMonth, amount }
    })

    // Agrupamento por categoria
    const categorySummaryMap = transactions.reduce((acc, tx) => {
      if (!tx.category) return acc
      const key = `${tx.type}_${tx.category}`
      acc[key] = (acc[key] || 0) + tx.amount
      return acc
    }, {} as Record<string, number>)

    const categorySummary = Object.entries(categorySummaryMap).map(([key, amount]) => {
      const [type, category] = key.split('_')
      return { type, category, amount }
    })

    return res.json({
      totalIncome,
      totalExpense,
      balance,
      monthlySummary,
      categorySummary,
    })
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao carregar dashboard financeiro' })
  }
}