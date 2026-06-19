import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateMaintenanceRequestSchema } from '@/lib/validations/maintenance'

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

    const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            landlord: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        assignedContractor: {
          select: { id: true, name: true, phone: true, trade: true },
        },
        quotes: {
          orderBy: { issuedAt: 'asc' as const },
          select: {
            id: true, amount: true, isSelected: true, notes: true,
            issuedAt: true, validUntil: true,
            contractor: { select: { id: true, name: true } },
          },
        },
        auditLogs: {
          orderBy: { createdAt: 'asc' as const },
          select: {
            id: true, actor: true, actorName: true,
            fromStatus: true, toStatus: true, note: true, createdAt: true,
          },
        },
        workOrders: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            estimatedCost: true,
            actualCost: true,
            vendor: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
    })

    if (!maintenanceRequest) {
      return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })
    }

    return NextResponse.json(maintenanceRequest)
  } catch (error) {
    console.error('Error fetching maintenance request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const validatedData = updateMaintenanceRequestSchema.parse(body)

    const updateData: any = { ...validatedData }

    // Convert date strings to Date objects
    if (validatedData.resolvedAt) {
      updateData.resolvedAt = new Date(validatedData.resolvedAt)
    }

    // If status is being updated to COMPLETED and no resolvedAt, set it to now
    if (validatedData.status === 'COMPLETED' && !validatedData.resolvedAt) {
      updateData.resolvedAt = new Date()
    }

    const maintenanceRequest = await prisma.maintenanceRequest.update({
      where: { id: id },
      data: updateData,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    })

    return NextResponse.json(maintenanceRequest)
  } catch (error: any) {
    console.error('Error updating maintenance request:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.maintenanceRequest.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'Maintenance request deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting maintenance request:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
