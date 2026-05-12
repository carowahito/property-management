import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { approveSchema } from '@/lib/validations/maintenance-triage'

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
    const body = await request.json()
    const validatedData = approveSchema.parse(body)

    const existing = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        workOrders: {
          select: { id: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })
    }

    if (!existing.approvalRequired) {
      return NextResponse.json(
        { error: 'This request does not require approval' },
        { status: 400 }
      )
    }

    if (existing.approvedAt) {
      return NextResponse.json(
        { error: 'This request has already been approved' },
        { status: 400 }
      )
    }

    // For costs > 15000, require at least 3 quotes (work orders)
    const cost = existing.estimatedCost ? Number(existing.estimatedCost) : 0
    if (cost > 15000) {
      const quoteCount = existing.workOrders.length
      if (quoteCount < 3) {
        return NextResponse.json(
          {
            error: `Requests over KSh 15,000 require at least 3 quotes. Currently ${quoteCount} attached.`,
          },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        approvedBy: validatedData.approvedBy,
        approvedAt: new Date(),
        landlordNotified: true,
        landlordNotifiedAt: new Date(),
      },
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        property: {
          select: {
            id: true, name: true, address: true,
            landlord: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error approving maintenance request:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
