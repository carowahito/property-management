import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateLeaseSchema } from '@/lib/validations/lease'

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

    const lease = await prisma.lease.findUnique({
      where: { id: id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            idNumber: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            type: true,
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
        payments: {
          select: {
            id: true,
            amount: true,
            type: true,
            method: true,
            status: true,
            dueDate: true,
            paidDate: true,
          },
          orderBy: { dueDate: 'desc' },
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    return NextResponse.json(lease)
  } catch (error) {
    console.error('Error fetching lease:', error)
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
    const validatedData = updateLeaseSchema.parse(body)

    const updateData: any = { ...validatedData }

    // Convert date strings to Date objects
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate)
    }

    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate)
    }

    // If updating tenant or property, check they exist
    if (validatedData.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: validatedData.tenantId },
      })
      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
      }
    }

    if (validatedData.propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: validatedData.propertyId },
      })
      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }
    }

    const lease = await prisma.lease.update({
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

    return NextResponse.json(lease)
  } catch (error: any) {
    console.error('Error updating lease:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
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

    // Check if lease has payments
    const paymentsCount = await prisma.payment.count({
      where: { leaseId: id },
    })

    if (paymentsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete lease with associated payments. Consider terminating instead.' },
        { status: 400 }
      )
    }

    await prisma.lease.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'Lease deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting lease:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
