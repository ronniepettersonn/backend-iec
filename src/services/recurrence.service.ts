import { Recurrence } from '@prisma/client'
import { prisma } from '../prisma/client'
import { addMonths, setDate } from 'date-fns'

export async function generateAccountsFromRecurrence(recurrence: Recurrence, userId: string) {
  const accounts: any[] = []

  const maxMonths = 12
  const start = new Date(recurrence.startDate)
  const end = recurrence.endDate ?? addMonths(start, maxMonths)

  let currentDate = new Date(start)

while (true) {
  const dueDate = setDate(new Date(currentDate), recurrence.dueDay || 1)

  if (dueDate > end) break

  accounts.push({
    dueDate,
    amount: recurrence.amount,
    description: recurrence.description || '',
    recurrenceId: recurrence.id,
    categoryId: recurrence.categoryId,
    createdById: userId,
  })

  currentDate = addMonths(currentDate, 1)
}

  await prisma.accountPayable.createMany({ data: accounts })
}
