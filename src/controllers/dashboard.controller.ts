import { Request, Response } from 'express'
import {prisma} from '../prisma/client'

export const getFinancialDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const transactions = await prisma.transaction.findMany({
      where: { createdById: req.userId },
      orderBy: { date: 'asc' },
    })

    const cash = await prisma.dailyCash.findUnique({
      where: { date: today }
    })

    const totalIncome = transactions
      .filter(tx => tx.type === 'INCOME')
      .reduce((acc, tx) => acc + tx.amount, 0)

    const totalExpense = transactions
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((acc, tx) => acc + tx.amount, 0)

    const balance = totalIncome - totalExpense

    // 🔄 Novo agrupamento consolidado por mês
    const monthlyMap = new Map<string, { income: number, expense: number }>()

    for (const tx of transactions) {
      const yearMonth = tx.date.toISOString().slice(0, 7)
      const entry = monthlyMap.get(yearMonth) || { income: 0, expense: 0 }

      if (tx.type === 'INCOME') entry.income += tx.amount
      else if (tx.type === 'EXPENSE') entry.expense += tx.amount

      monthlyMap.set(yearMonth, entry)
    }

    const monthlySummary = Array.from(monthlyMap.entries()).map(([month, { income, expense }]) => ({
      month,
      income,
      expense,
      balance: income - expense
    }))

    // ✅ Mantém agrupamento por categoria
    const categorySummaryMap = transactions.reduce((acc, tx) => {
      if (!tx.categoryId) return acc
      const key = `${tx.type}_${tx.categoryId}`
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
      cash: cash
        ? {
            date: cash.date.toISOString().split('T')[0],
            openingAmount: cash.openingAmount,
            closingAmount: cash.closingAmount,
            status: cash.closingAmount ? 'Fechado' : 'Aberto'
          }
        : null
    })
  } catch (error) {
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
        //createdById: req.userId,
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

export const getFinancialAlerts = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const alerts: string[] = []

    // 1️⃣ Verifica se o caixa de hoje está fechado
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const cash = await prisma.dailyCash.findUnique({
      where: { date: today }
    })

    if (!cash || !cash.closingAmount) {
      alerts.push('O caixa de hoje ainda não foi fechado.')
    }

    // 2️⃣ Verifica transações recorrentes vencendo hoje
    const todayStr = today.toISOString().split('T')[0]
    const recurringPayments = await prisma.recurrence.findMany({
      where: {
        startDate: today
      }
    })

    if (recurringPayments.length > 0) {
      alerts.push(`Existem ${recurringPayments.length} pagamento(s) recorrente(s) vencendo hoje.`)
    }

    // 3️⃣ Verifica saldo geral
    const transactions = await prisma.transaction.findMany({
      where: { createdById: req.userId }
    })

    const totalIncome = transactions
      .filter(tx => tx.type === 'INCOME')
      .reduce((acc, tx) => acc + tx.amount, 0)

    const totalExpense = transactions
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((acc, tx) => acc + tx.amount, 0)

    const balance = totalIncome - totalExpense

    const minBalance = 0 // ou configurable
    if (balance < minBalance) {
      alerts.push('O saldo geral está negativo!')
    }

    return res.json({ alerts })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao buscar alertas financeiros' })
  }
}

export const getFinancialSummaryByPeriod = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate e endDate são obrigatórios' })
    }

    const start = new Date(startDate as string)
    const end = new Date(endDate as string)
    end.setHours(23, 59, 59, 999) // para pegar o dia todo

    const transactions = await prisma.transaction.findMany({
      where: {
        //createdById: req.userId,
        date: {
          gte: start,
          lte: end
        }
      }
    })

    const totalIncome = transactions
      .filter(tx => tx.type === 'INCOME')
      .reduce((acc, tx) => acc + tx.amount, 0)

    const totalExpense = transactions
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((acc, tx) => acc + tx.amount, 0)

    const balance = totalIncome - totalExpense

    return res.json({
      startDate,
      endDate,
      totalIncome,
      totalExpense,
      balance
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao calcular resumo financeiro' })
  }
}

export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    // 👤 Total de membros
    const totalMembers = await prisma.member.count()

    // 👤 Novos membros no último mês
    const newMembers = await prisma.member.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
        }
      }
    })

    // 👥 Visitantes no último mês
    const visitorsLastMonth = await prisma.visitor.count({
      where: {
        visitDate: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
        }
      }
    })

    // 💬 Total de mensagens
    const totalMessages = await prisma.message.count()

    // 📅 Próximos eventos
    const upcomingEvents = await prisma.event.findMany({
      where: {
        date: {
          gte: new Date()
        }
      },
      orderBy: { date: 'asc' },
      take: 5
    })

    // 💰 Saldo financeiro geral
    const transactions = await prisma.transaction.findMany()
    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0)
    const balance = totalIncome - totalExpense

    // 💵 Caixa diário (último caixa aberto, se existir)
    const lastCash = await prisma.dailyCash.findFirst({
      where: { closingAmount: null },
      orderBy: { date: 'desc' }
    })

    return res.json({
      members: {
        total: totalMembers,
        new: newMembers
      },
      visitors: visitorsLastMonth,
      messages: totalMessages,
      events: upcomingEvents,
      financial: {
        totalIncome,
        totalExpense,
        balance
      },
      dailyCash: lastCash ? {
        id: lastCash.id,
        balance: lastCash.closingAmount ? lastCash.closingAmount - lastCash.openingAmount : 0,
        openedAt: lastCash.date
      } : null
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao carregar o dashboard geral' })
  }
}