import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { createObjectCsvStringifier } from 'csv-writer'
import PDFDocument from 'pdfkit'
import { PassThrough } from 'stream'

export const exportTransactionsCsv = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    // Busca as transações
    const transactions = await prisma.transaction.findMany({
      where: { createdById: req.userId },
      include: { category: true },
      orderBy: { date: 'asc' }
    })

    if (transactions.length === 0) {
      return res.status(404).json({ error: 'Nenhuma transação encontrada' })
    }

    // Configura o CSV Stringifier
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'date', title: 'Data' },
        { id: 'type', title: 'Tipo' },
        { id: 'description', title: 'Descrição' },
        { id: 'amount', title: 'Valor' },
        { id: 'category', title: 'Categoria' }
      ]
    })

    const data = transactions.map(tx => ({
      date: tx.date.toISOString().split('T')[0],
      type: tx.type,
      description: tx.description,
      amount: tx.amount.toFixed(2),
      category: tx.category ? tx.category.name : ''
    }))

    // Converte para CSV
    const header = csvStringifier.getHeaderString()
    const records = csvStringifier.stringifyRecords(data)

    const csv = header + records

    // Envia como stream de resposta
    res.setHeader('Content-disposition', 'attachment; filename=transactions-report.csv')
    res.set('Content-Type', 'text/csv')

    const stream = new PassThrough()
    stream.end(csv)
    stream.pipe(res)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao gerar relatório' })
  }
}

export const exportTransactionsPdf = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const transactions = await prisma.transaction.findMany({
      where: { createdById: req.userId },
      include: { category: true },
      orderBy: { date: 'asc' }
    })

    if (transactions.length === 0) {
      return res.status(404).json({ error: 'Nenhuma transação encontrada' })
    }

    const doc = new PDFDocument({ margin: 30, size: 'A4' })

    res.setHeader('Content-disposition', 'attachment; filename=transactions-report.pdf')
    res.setHeader('Content-type', 'application/pdf')

    const stream = new PassThrough()
    doc.pipe(stream)
    stream.pipe(res)

    // Título
    doc.fontSize(16).text('Relatório de Transações', { align: 'center' })
    doc.moveDown()

    // Cabeçalho
    doc.fontSize(12)
    .text('Data', 30, doc.y, { continued: true })
    .text('Tipo', 90, doc.y, { continued: true })
    .text('Descrição', 140, doc.y, { continued: true })
    .text('Valor', 320, doc.y, { continued: true })
    .text('Categoria', 400, doc.y)
    doc.moveDown()

    // Lista de transações
    transactions.forEach((tx) => {
    doc.fontSize(10)
        .text(tx.date.toISOString().split('T')[0], 30, doc.y, { continued: true })
        .text(tx.type, 90, doc.y, { continued: true })
        .text(tx.description, 140, doc.y, { continued: true, width: 160, ellipsis: true })
        .text(tx.amount.toFixed(2), 320, doc.y, { continued: true })
        .text(tx.category ? tx.category.name : '', 400, doc.y, { width: 160, ellipsis: true })
    doc.moveDown()
    })

    doc.end()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao gerar relatório PDF' })
  }
}