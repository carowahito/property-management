import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateTenantSchema } from '@/lib/validations/tenant'

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

    // Auto-expire leases whose end date has passed
    await prisma.lease.updateMany({
      where: { tenantId: id, status: 'ACTIVE', endDate: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    })

    const tenant = await prisma.tenant.findUnique({
      where: { id: id },
      include: {
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
                bankName: true,
                bankAccount: true,
              },
            },
          },
        },
        unitRef: {
          select: {
            id: true,
            unitNumber: true,
            monthlyRent: true,
            serviceCharge: true,
            status: true,
            bedrooms: true,
            bathrooms: true,
            floor: true,
            landlord: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                type: true,
                bankName: true,
                bankAccount: true,
                members: { orderBy: { createdAt: 'asc' } },
              },
            },
          },
        },
        leases: {
          select: {
            id: true,
            refNumber: true,
            startDate: true,
            endDate: true,
            monthlyRent: true,
            securityDeposit: true,
            status: true,
            documentUrl: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { startDate: 'desc' },
        },
        payments: {
          select: {
            id: true,
            refNumber: true,
            amount: true,
            paidDate: true,
            method: true,
            status: true,
            type: true,
            reference: true,
          },
          orderBy: { paidDate: 'desc' },
          take: 10,
        },
        maintenanceRequests: {
          select: {
            id: true,
            refNumber: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            category: true,
            createdAt: true,
            resolvedAt: true,
            responsibleParty: true,
            assignedContractor: {
              select: { id: true, name: true, trade: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        messages: {
          select: {
            id: true,
            type: true,
            category: true,
            subject: true,
            content: true,
            status: true,
            sentAt: true,
          },
          orderBy: { sentAt: 'desc' },
          take: 50,
        },
        _count: {
          select: {
            leases: true,
            payments: true,
            maintenanceRequests: true,
            messages: true,
          },
        },
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    return NextResponse.json(tenant)
  } catch (error) {
    console.error('Error fetching tenant:', error)
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
    const validatedData = updateTenantSchema.parse(body)

    // If propertyId is being updated, check if property exists
    if (validatedData.propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: validatedData.propertyId },
      })

      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }
    }

    const updateData: any = { ...validatedData }

    // Convert date strings to Date objects
    if (validatedData.moveInDate) {
      updateData.moveInDate = new Date(validatedData.moveInDate)
    }

    if (validatedData.moveOutDate) {
      updateData.moveOutDate = new Date(validatedData.moveOutDate)
    }

    const tenant = await prisma.tenant.update({
      where: { id: id },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    })

    return NextResponse.json(tenant)
  } catch (error: any) {
    console.error('Error updating tenant:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email or ID number already exists' },
        { status: 400 }
      )
    }

    if (error.name === 'ZodError') {
      const first = error.errors?.[0]
      const field = first?.path?.join('.') || 'field'
      return NextResponse.json(
        { error: first ? `${field}: ${first.message}` : 'Validation error', details: error.errors },
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

    // Check if tenant has active leases
    const activeLeases = await prisma.lease.count({
      where: {
        tenantId: id,
        status: 'ACTIVE',
      },
    })

    if (activeLeases > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tenant with active leases' },
        { status: 400 }
      )
    }

    await prisma.tenant.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'Tenant deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting tenant:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
