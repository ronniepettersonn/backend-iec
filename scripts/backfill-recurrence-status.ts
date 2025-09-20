// scripts/backfill-recurrence-status.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

function mapStatus(raw?: string) {
  const s = (raw ?? '').trim().toLowerCase()
  if (['active','ativo','ativado'].includes(s)) return 'active'
  if (['finished','finalizado','concluido','concluído'].includes(s)) return 'finished'
  if (['overdue','atrasado','vencido'].includes(s)) return 'overdue'
  if (['paused','pausado','suspenso'].includes(s)) return 'paused'
  // padrão seguro
  return 'active'
}

async function main() {
  const recs = await prisma.recurrence.findMany({ select: { id: true, status: true } })
  const ops = recs.map(r =>
    prisma.recurrence.update({
      where: { id: r.id },
      data: { statusNew: mapStatus(r.status) as any },
    })
  )
  // em lotes pra não estourar a transação
  for (let i = 0; i < ops.length; i += 200) {
    await prisma.$transaction(ops.slice(i, i + 200))
  }
}
main().finally(() => prisma.$disconnect())
