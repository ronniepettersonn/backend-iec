import { prisma } from '../prisma/client'
import { RecurrenceStatus } from '@prisma/client'

// Helper: transforma resultado do groupBy em Map<string, number> seguro
function buildCountMap(
  rows: { recurrenceId: string | null; _count: { _all: number } }[]
): Map<string, number> {
  const entries = rows
    .filter(
      (r): r is { recurrenceId: string; _count: { _all: number } } =>
        r.recurrenceId !== null
    )
    .map((r) => [r.recurrenceId, r._count._all] as const)

  // entries agora é ReadonlyArray<readonly [string, number]>
  return new Map<string, number>(entries)
}

export const updateRecurrenceStatuses = async (): Promise<number> => {
  const now = new Date()

  const recurrences = await prisma.recurrence.findMany({
    where: {
      status: { in: [RecurrenceStatus.active, RecurrenceStatus.overdue] },
    },
    select: {
      id: true,
      endDate: true,
      status: true,
      totalInstallments: true,
      churchId: true, // se quiser filtrar por igreja depois
    },
  })

  if (recurrences.length === 0) return 0
  const ids = recurrences.map(r => r.id)

  const totals = await prisma.accountPayable.groupBy({
    by: ['recurrenceId'],
    where: { recurrenceId: { in: ids } },
    _count: { _all: true },
  })
  const paids = await prisma.accountPayable.groupBy({
    by: ['recurrenceId'],
    where: { recurrenceId: { in: ids }, paid: true },
    _count: { _all: true },
  })

  const totalMap = buildCountMap(totals)
  const paidMap  = buildCountMap(paids)

  const ops = recurrences.map((r) => {
    const totalGeradas = totalMap.get(r.id) ?? 0
    const pagas        = paidMap.get(r.id) ?? 0

    // Se houver "totalInstallments" previsto, usa; senão derive do que já foi gerado (ou null se nada gerado)
    const totalPrevistas =
      r.totalInstallments ?? (totalGeradas > 0 ? totalGeradas : null)

    const todasPagas =
      (totalPrevistas != null && pagas >= totalPrevistas) ||
      (totalPrevistas == null && totalGeradas > 0 && pagas >= totalGeradas)

    let nextStatus: RecurrenceStatus
    if (todasPagas) nextStatus = RecurrenceStatus.finished
    else if (r.endDate && r.endDate < now) nextStatus = RecurrenceStatus.overdue
    else nextStatus = RecurrenceStatus.active

    return prisma.recurrence.update({
      where: { id: r.id },
      data: {
        paidInstallments: pagas,
        totalInstallments: totalPrevistas,
        status: { set: nextStatus }, // evita conflito com EnumUpdateOperationsInput
      },
    })
  })

  await prisma.$transaction(ops)
  return ops.length
}
