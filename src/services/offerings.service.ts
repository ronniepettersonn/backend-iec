import { prisma } from '../prisma/client'

export async function recalcTotals(offeringId: string) {
  const items = await prisma.offeringItem.findMany({
    where: { offeringCountId: offeringId }
  })

  const sum = (kind: "NOTE" | "COIN") =>
    items.filter(i => i.kind === kind)
         .reduce((acc, i) => acc + Number(i.lineTotal), 0)

  const notesTotal = +sum("NOTE").toFixed(2)
  const coinsTotal = +sum("COIN").toFixed(2)
  const grandTotal = +(notesTotal + coinsTotal).toFixed(2)
  const titheShare15 = +(grandTotal * 0.15).toFixed(2)

  await prisma.offeringCount.update({
    where: { id: offeringId },
    data: { notesTotal, coinsTotal, grandTotal, titheShare15 }
  })

  return { notesTotal, coinsTotal, grandTotal, titheShare15 }
}
