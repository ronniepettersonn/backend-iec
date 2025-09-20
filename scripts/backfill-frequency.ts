// scripts/backfill-frequency.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const mapFreq = (raw?: string) => {
  const s = (raw ?? '').trim().toLowerCase()
  if (['daily','diaria','diária'].includes(s)) return 'DAILY'
  if (['weekly','semanal'].includes(s)) return 'WEEKLY'
  if (['bimonthly','bimensal'].includes(s)) return 'BIMONTHLY'
  if (['quarterly','trimestral'].includes(s)) return 'QUARTERLY'
  if (['semiannual','semestral'].includes(s)) return 'SEMIANNUAL'
  if (['annual','anual'].includes(s)) return 'ANNUAL'
  // default comum:
  if (['monthly','mensal','mes','mês'].includes(s)) return 'MONTHLY'
  return null
}

async function main() {
  const recs = await prisma.recurrence.findMany({ select: { id: true, frequency: true } })
  const ops: any[] = []

  for (const r of recs) {
    const v = mapFreq(r.frequency)
    if (!v) {
      console.warn(`⚠️ Recurrence ${r.id} com frequency desconhecida: "${r.frequency}"`)
      continue
    }
    ops.push(prisma.recurrence.update({
      where: { id: r.id },
      data: { frequencyNew: v as any }
    }))
  }
  // evita transação gigante
  const chunk = 200
  for (let i=0; i<ops.length; i+=chunk) {
    await prisma.$transaction(ops.slice(i, i+chunk))
  }
}
main().finally(() => prisma.$disconnect())
