import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateWorkOrderSchema } from '@/lib/validations/work-order'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: params.id },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            specialization: true,
            rating: true,
          },
        },
        maintenanceRequest: {
          select: {
            id: true,
            title: true,
            description: true,
            priority: true,
            status: true,
            property: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
            tenant: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    })

    if (!workOrder) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 })
    }

    return NextResponse.json(workOrder)
  } catch (error) {
    console.error('Error fetching work order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateWorkOrderSchema.parse(body)

    const updateData: any = { ...validatedData }

    // Convert date strings to Date objects
    if (validatedData.scheduledDate) {
      updateData.scheduledDate = new Date(validatedData.scheduledDate)
    }

    if (validatedData.completedDate) {
      updateData.completedDate = new Date(validatedData.completedDate)
    }

    // If status is being updated to COMPLETED and no completedDate, set it to now
    if (validatedData.status === 'COMPLETED' && !validatedData.completedDate) {
      updateData.completedDate = new Date()
    }

    // If vendorId is being updated, check if vendor exists
    if (validatedData.vendorId) {
      const vendor = await prisma.vendor.findUnique({
        where: { id: validatedData.vendorId },
      })

      if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
      }

      // Update status to ASSIGNED when vendor is assigned
      if (!updateData.status) {
        updateData.status = 'ASSIGNED'
      }
    }

    const workOrder = await prisma.workOrder.update({
      where: { id: params.id },
      data: updateData,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    })

    return NextResponse.json(workOrder)
  } catch (error: any) {
    console.error('Error updating work order:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 })
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.workOrder.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Work order deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting work order:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
