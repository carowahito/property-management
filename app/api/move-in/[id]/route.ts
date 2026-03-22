import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateMoveInChecklistSchema } from '@/lib/validations/move-in'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const checklist = await prisma.moveInChecklist.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            unit: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        lease: {
          select: {
            id: true,
            unit: true,
            unitId: true,
            startDate: true,
            endDate: true,
            status: true,
            monthlyRent: true,
          },
        },
      },
    })

    if (!checklist) {
      return NextResponse.json({ error: 'Move-in checklist not found' }, { status: 404 })
    }

    return NextResponse.json(checklist)
  } catch (error) {
    console.error('Error fetching move-in checklist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const CHECKLIST_ITEMS = [
  'agreementSigned',
  'depositCleared',
  'firstMonthCleared',
  'inspectionDone',
  'metersLogged',
  'inventorySigned',
  'profileActive',
  'welcomePackSent',
  'keysHandedOver',
] as const

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateMoveInChecklistSchema.parse(body)

    // Fetch current checklist to apply business rules
    const current = await prisma.moveInChecklist.findUnique({
      where: { id },
    })

    if (!current) {
      return NextResponse.json({ error: 'Move-in checklist not found' }, { status: 404 })
    }

    // Block keysHandedOver unless prerequisites are met
    if (validatedData.keysHandedOver === true) {
      const agreementSigned = validatedData.agreementSigned ?? current.agreementSigned
      const depositCleared = validatedData.depositCleared ?? current.depositCleared
      const firstMonthCleared = validatedData.firstMonthCleared ?? current.firstMonthCleared

      if (!agreementSigned || !depositCleared || !firstMonthCleared) {
        return NextResponse.json(
          {
            error:
              'Cannot hand over keys until agreement is signed, deposit is cleared, and first month rent is cleared',
          },
          { status: 400 }
        )
      }
    }

    // Build update data
    const updateData: any = { ...validatedData }

    // Merge current + incoming to compute new item states
    const merged: Record<string, boolean> = {}
    for (const item of CHECKLIST_ITEMS) {
      merged[item] = validatedData[item] ?? (current as any)[item]
    }

    const checkedCount = CHECKLIST_ITEMS.filter((item) => merged[item]).length
    const allChecked = checkedCount === CHECKLIST_ITEMS.length

    // Auto-set status
    if (!validatedData.status) {
      if (allChecked) {
        updateData.status = 'COMPLETED'
        updateData.completedAt = new Date()
      } else if (checkedCount > 0 && current.status === 'PENDING') {
        updateData.status = 'IN_PROGRESS'
      }
    }

    const checklist = await prisma.moveInChecklist.update({
      where: { id },
      data: updateData,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            unit: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        lease: {
          select: {
            id: true,
            unit: true,
            unitId: true,
            startDate: true,
            endDate: true,
            status: true,
            monthlyRent: true,
          },
        },
      },
    })

    return NextResponse.json(checklist)
  } catch (error: any) {
    console.error('Error updating move-in checklist:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Move-in checklist not found' }, { status: 404 })
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
