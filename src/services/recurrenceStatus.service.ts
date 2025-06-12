// src/services/recurrenceStatus.service.ts
import { prisma } from '../prisma/client'

export const updateRecurrenceStatuses = async () => {
  const now = new Date()

  const recurrences = await prisma.recurrence.findMany({
    where: {
      status: 'active',
      endDate: { not: null, lt: now }
    },
    include: {
      AccountPayable: true
    }
  })

  for (const recurrence of recurrences) {
    const allPaid = recurrence.AccountPayable.every(acc => acc.paid)

    await prisma.recurrence.update({
      where: { id: recurrence.id },
      data: {
        status: allPaid ? 'completed' : 'expired'
      }
    })
  }

  console.log(`[RecurrenceStatus] Atualização concluída: ${recurrences.length} recorrências analisadas`)
}