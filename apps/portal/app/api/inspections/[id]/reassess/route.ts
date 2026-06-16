import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { generateReassessmentReferenceCode } from '@/lib/services/inspection-reference'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const source = await prisma.inspection.findUnique({ where: { id } })
    if (!source) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    if (source.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Inspection must be completed before it can be reassessed' }, { status: 400 })
    }

    if (!source.inspectorSignature) {
      return NextResponse.json({ error: 'You can only reassess an inspection after the current inspection has been validated' }, { status: 400 })
    }

    const { referenceCode, rootInspectionId, reassessmentNumber } = await generateReassessmentReferenceCode(source)

    const [, newInspection] = await prisma.$transaction([
      prisma.inspection.update({
        where: { id: source.id },
        data: { status: 'ARCHIVED' },
      }),
      prisma.inspection.create({
        data: {
          propertyId: source.propertyId,
          unitId: source.unitId,
          tenantId: source.tenantId,
          leaseId: source.leaseId,
          type: source.type,
          propertyCategory: source.propertyCategory,
          scheduledDate: new Date(),
          inspector: source.inspector,
          status: 'SCHEDULED',
          referenceCode,
          rootInspectionId,
          reassessmentNumber,
        },
        include: {
          property: { select: { id: true, name: true, address: true } },
          unit: { select: { id: true, unitNumber: true } },
          tenant: { select: { id: true, name: true } },
        },
      }),
    ])

    return NextResponse.json(newInspection, { status: 201 })
  } catch (error) {
    console.error('Error reassessing inspection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
