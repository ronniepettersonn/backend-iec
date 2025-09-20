import { Request, Response } from 'express'
import { prisma } from '../prisma/client'

export const createBankAccount = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const churchId = req.churchId;

    if (!churchId) {
      return res.status(403).json({ error: 'Igreja não identificada.' });
    }

    const bank = await prisma.bankAccount.create({
      data: {
        name,
        description,
        churchId,
      },
    });

    return res.status(201).json(bank);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar conta bancária.' });
  }
}

export const getBankStatement = async (req: Request, res: Response) => {
  try {
    const bankAccountId = req.params.id;
    const { startDate, endDate } = req.query;

    const churchId = req.churchId;

    if (!churchId) {
      return res.status(403).json({ error: 'Igreja não identificada.' });
    }

    if (!bankAccountId) {
      return res.status(400).json({ error: 'ID do banco não informado.' });
    }

    const start = startDate
      ? new Date(startDate as string)
      : new Date(new Date().getFullYear(), 0, 1); // 1º Jan do ano atual

    const end = endDate
      ? new Date(endDate as string)
      : new Date(); // Hoje

    const bankAccount = await prisma.bankAccount.findUnique({
      where: {
        id: bankAccountId,
      },
    });

    if (!bankAccount) {
      return res.status(404).json({ error: 'Banco não encontrado.' });
    }

    // 🔹 Transações dentro do período
    const transactions = await prisma.transaction.findMany({
      where: {
        bankAccountId,
        churchId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        createdBy: true,
      },
      orderBy: { date: 'asc' },
    });

    // 🔹 Transações ANTES do período → saldo inicial
    const previousTransactions = await prisma.transaction.findMany({
      where: {
        bankAccountId,
        churchId,
        date: {
          lt: start,
        },
      },
    });

    // 🔹 Todas as transações → saldo atual real
    const allTransactions = [...previousTransactions, ...transactions];

    const initialBalance = previousTransactions.reduce((acc, tx) => {
      if (tx.type === 'INCOME') return acc + tx.amount;
      if (tx.type === 'EXPENSE') return acc - tx.amount;
      return acc;
    }, 0);

    const periodBalance = transactions.reduce((acc, tx) => {
      if (tx.type === 'INCOME') return acc + tx.amount;
      if (tx.type === 'EXPENSE') return acc - tx.amount;
      return acc;
    }, 0);

    const finalBalance = initialBalance + periodBalance;

    const currentBalance = allTransactions.reduce((acc, tx) => {
      if (tx.type === 'INCOME') return acc + tx.amount;
      if (tx.type === 'EXPENSE') return acc - tx.amount;
      return acc;
    }, 0);

    // 🔹 Aplica saldo progressivo nas transações do período
    let runningBalance = initialBalance;

    const transactionsWithBalance = transactions.map((tx) => {
      if (tx.type === 'INCOME') {
        runningBalance += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        runningBalance -= tx.amount;
      }

      return {
        ...tx,
        balanceAfter: runningBalance,
      };
    });

    return res.json({
      bankAccount: {
        id: bankAccount.id,
        name: bankAccount.name,
      },
      period: {
        start,
        end,
      },
      balances: {
        initialBalance,
        periodBalance,
        finalBalance,
        currentBalance,
      },
      transactions: transactionsWithBalance,
    });
  } catch (error) {
    console.error('[getBankStatement]', error);
    return res.status(500).json({ error: 'Erro ao buscar extrato bancário.' });
  }
};



export const listBankAccounts = async (req: Request, res: Response) => {
  try {
    const churchId = req.churchId

    if (!churchId) {
      return res.status(403).json({ error: 'Igreja não identificada.' })
    }

    const banks = await prisma.bankAccount.findMany({
      where: { churchId },
      orderBy: { name: 'asc' },
    })

    return res.json(banks)
  } catch (error) {
    console.error('[listBankAccounts]', error)
    return res.status(500).json({ error: 'Erro ao listar contas bancárias.' })
  }
}

export const updateBankAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name } = req.body
    const churchId = req.churchId

    if (!churchId) {
      return res.status(403).json({ error: 'Igreja não identificada.' })
    }

    // Valida se existe e pertence à igreja
    const bank = await prisma.bankAccount.findUnique({
      where: { id },
    })

    if (!bank) {
      return res.status(404).json({ error: 'Banco não encontrado.' })
    }

    if (bank.churchId !== churchId) {
      return res.status(403).json({ error: 'Acesso negado a este banco.' })
    }

    const updated = await prisma.bankAccount.update({
      where: { id },
      data: {
        name,
      },
    })

    return res.json(updated)
  } catch (error) {
    console.error('[updateBankAccount]', error)
    return res.status(500).json({ error: 'Erro ao atualizar banco.' })
  }
}

export const deleteBankAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const churchId = req.churchId

    if (!churchId) {
      return res.status(403).json({ error: 'Igreja não identificada.' })
    }

    // Valida se existe e pertence à igreja
    const bank = await prisma.bankAccount.findUnique({
      where: { id },
    })

    if (!bank) {
      return res.status(404).json({ error: 'Banco não encontrado.' })
    }

    if (bank.churchId !== churchId) {
      return res.status(403).json({ error: 'Acesso negado a este banco.' })
    }

    await prisma.bankAccount.delete({
      where: { id },
    })

    return res.status(204).send()
  } catch (error) {
    console.error('[deleteBankAccount]', error)
    return res.status(500).json({ error: 'Erro ao excluir banco.' })
  }
}
