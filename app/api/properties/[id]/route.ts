import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updatePropertySchema } from '@/lib/validations/property'

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

    const property = await prisma.property.findUnique({
      where: { id: id },
      include: {
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            bankName: true,
            bankAccount: true,
          },
        },
        tenants: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        leases: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            monthlyRent: true,
            status: true,
            tenant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { startDate: 'desc' },
        },
        maintenanceRequests: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            tenants: true,
            leases: true,
            maintenanceRequests: true,
            inspections: true,
            viewings: true,
          },
        },
      },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error fetching property:', error)
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
    const validatedData = updatePropertySchema.parse(body)

    // If landlordId is being updated, check if landlord exists
    if (validatedData.landlordId) {
      const landlord = await prisma.landlord.findUnique({
        where: { id: validatedData.landlordId },
      })

      if (!landlord) {
        return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
      }
    }

    const property = await prisma.property.update({
      where: { id: id },
      data: validatedData,
      include: {
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    return NextResponse.json(property)
  } catch (error: any) {
    console.error('Error updating property:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
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

    // Check if property has active leases
    const activeLeases = await prisma.lease.count({
      where: {
        propertyId: id,
        status: 'ACTIVE',
      },
    })

    if (activeLeases > 0) {
      return NextResponse.json(
        { error: 'Cannot delete property with active leases' },
        { status: 400 }
      )
    }

    await prisma.property.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting property:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
