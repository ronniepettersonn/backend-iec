import { Request, Response } from 'express'
import {prisma} from '../prisma/client'

export const getFinancialDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    // 🔹 Pega as transações reais do usuário
    const transactions = await prisma.transaction.findMany({
      where: { createdById: req.userId },
      orderBy: { date: 'asc' },
      include: { category: true }
    })

    // 🔹 Pega as recorrências ativas (sem endDate ou endDate futura)
    const today = new Date()
    const recurrences = await prisma.recurrence.findMany({
      where: {
        OR: [
          { endDate: null },
          { endDate: { gte: today } }
        ],
        //startDate: { lte: today }
      },
      include: { category: true }
    })

    // 🔹 Calcula totais reais
    const totalIncome = transactions
      .filter(tx => tx.type === 'INCOME')
      .reduce((acc, tx) => acc + tx.amount, 0)

    const totalExpense = transactions
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((acc, tx) => acc + tx.amount, 0)

    const balance = totalIncome - totalExpense

    // 🔹 Calcula previsão de saldo futuro
    const futureIncome = recurrences
      .filter(rec => rec.amount > 0)
      .reduce((acc, rec) => acc + rec.amount, 0)

    const futureExpense = recurrences
      .filter(rec => rec.amount < 0)
      .reduce((acc, rec) => acc + Math.abs(rec.amount), 0)

    const projectedBalance = balance + futureIncome - futureExpense

    // 🔹 Agrupamento por mês
    const monthlySummaryMap = transactions.reduce((acc, tx) => {
      const yearMonth = tx.date.toISOString().slice(0, 7)
      const key = `${tx.type}_${yearMonth}`
      acc[key] = (acc[key] || 0) + tx.amount
      return acc
    }, {} as Record<string, number>)

    const monthlySummary = Object.entries(monthlySummaryMap).map(([key, amount]) => {
      const [type, yearMonth] = key.split('_')
      return { type, yearMonth, amount }
    })

    // 🔹 Agrupamento por categoria
    const categorySummaryMap = transactions.reduce((acc, tx) => {
      if (!tx.category) return acc
      const key = `${tx.type}_${tx.category.name}`
      acc[key] = (acc[key] || 0) + tx.amount
      return acc
    }, {} as Record<string, number>)

    const categorySummary = Object.entries(categorySummaryMap).map(([key, amount]) => {
      const [type, category] = key.split('_')
      return { type, category, amount }
    })

    // 🔹 Resumo das recorrências futuras
    const futureRecurrences = recurrences.map((rec) => ({
      id: rec.id,
      startDate: rec.startDate,
      endDate: rec.endDate,
      frequency: rec.frequency,
      amount: rec.amount,
      description: rec.description,
      category: rec.category ? rec.category.name : null
    }))

    return res.json({
      real: {
        totalIncome,
        totalExpense,
        balance
      },
      future: {
        futureIncome,
        futureExpense,
        projectedBalance,
        recurrences: futureRecurrences
      },
      monthlySummary,
      categorySummary
    })
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao carregar dashboard financeiro' })
  }
}

export const getFinancialChartData = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { startDate, endDate } = req.query

    // Ajusta as datas para o filtro
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1) // Ano atual
    const end = endDate ? new Date(endDate as string) : new Date() // Agora

    // Busca todas as transações no período
    const transactions = await prisma.transaction.findMany({
      where: {
        createdById: req.userId,
        date: {
          gte: start,
          lte: end
        }
      },
      include: { category: true },
      orderBy: { date: 'asc' }
    })

    // Agrupa entradas e saídas por mês
    const monthlySummary: Record<string, { income: number, expense: number }> = {}

    transactions.forEach(tx => {
      const yearMonth = tx.date.toISOString().slice(0, 7) // Ex: "2025-05"

      if (!monthlySummary[yearMonth]) {
        monthlySummary[yearMonth] = { income: 0, expense: 0 }
      }

      if (tx.type === 'INCOME') {
        monthlySummary[yearMonth].income += tx.amount
      } else {
        monthlySummary[yearMonth].expense += tx.amount
      }
    })

    // Converte em array ordenado
    const chartData = Object.entries(monthlySummary)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, { income, expense }]) => ({
        month,
        income,
        expense
      }))

    // Gráfico de pizza por categoria (no período)
    const categorySummary: Record<string, number> = {}

    transactions.forEach(tx => {
      const key = tx.category ? tx.category.name : 'Sem Categoria'
      categorySummary[key] = (categorySummary[key] || 0) + tx.amount
    })

    const categoryChartData = Object.entries(categorySummary).map(([category, amount]) => ({
      category,
      amount
    }))

    return res.json({
      chartData,
      categoryChartData
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao buscar dados do gráfico' })
  }
}