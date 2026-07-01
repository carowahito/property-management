import { prisma } from '@/lib/db'

// Generates the next root reference code, e.g. "Inspection-0001".
// Root inspections are any inspection that is not itself a reassessment
// (rootInspectionId is null).
export async function generateRootReferenceCode(): Promise<string> {
  const count = await prisma.inspection.count({ where: { rootInspectionId: null } })
  return `Inspection-${String(count + 1).padStart(4, '0')}`
}

// Generates the next reassessment reference code for a given source inspection,
// e.g. reassessing "Inspection-0001" (or any reassessment in that lineage)
// produces "Inspection-0001-1", then "Inspection-0001-2", etc.
export async function generateReassessmentReferenceCode(sourceInspection: {
  id: string
  rootInspectionId: string | null
  referenceCode: string | null
}): Promise<{ referenceCode: string; rootInspectionId: string; reassessmentNumber: number }> {
  const rootId = sourceInspection.rootInspectionId || sourceInspection.id

  const root = sourceInspection.rootInspectionId
    ? await prisma.inspection.findUnique({ where: { id: rootId }, select: { referenceCode: true } })
    : { referenceCode: sourceInspection.referenceCode }

  const baseCode = root?.referenceCode || `Inspection-${String(1).padStart(4, '0')}`

  const existingReassessments = await prisma.inspection.count({ where: { rootInspectionId: rootId } })
  const reassessmentNumber = existingReassessments + 1

  return {
    referenceCode: `${baseCode}-${reassessmentNumber}`,
    rootInspectionId: rootId,
    reassessmentNumber,
  }
}
