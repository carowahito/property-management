import { prisma } from '../lib/db'

async function main() {
  const inspections = await prisma.inspection.findMany({
    where: { referenceCode: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  })

  let seq = await prisma.inspection.count({ where: { referenceCode: { not: null }, rootInspectionId: null } })

  for (const inspection of inspections) {
    seq += 1
    const referenceCode = `Inspection-${String(seq).padStart(4, '0')}`
    await prisma.inspection.update({
      where: { id: inspection.id },
      data: { referenceCode },
    })
    console.log(`${inspection.id} -> ${referenceCode}`)
  }

  console.log(`Backfilled ${inspections.length} inspection(s).`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
