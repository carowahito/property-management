import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateLandlordSchema } from '@/lib/validations/landlord'

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

    const landlord = await prisma.landlord.findUnique({
      where: { id: id },
      include: {
        properties: {
          select: {
            id: true,
            name: true,
            address: true,
            type: true,
            totalUnits: true,
            status: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        payouts: {
          select: {
            id: true,
            amount: true,
            period: true,
            status: true,
            paidDate: true,
            method: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        units: {
          select: {
            id: true,
            unitNumber: true,
            propertyId: true,
            status: true,
            monthlyRent: true,
            bedrooms: true,
            bathrooms: true,
            property: { select: { id: true, name: true } },
            tenants: {
              where: { status: 'ACTIVE' },
              select: { id: true, name: true, email: true, phone: true, status: true },
            },
          },
          orderBy: { unitNumber: 'asc' },
        },
        _count: {
          select: {
            properties: true,
            units: true,
            payouts: true,
            messages: true,
          },
        },
      },
    })

    if (!landlord) {
      return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
    }

    // Compute distinct properties via the landlord's units (unit.propertyId)
    // A landlord may own units in a property without being the property's primary landlord
    const unitPropertyIds = [...new Set(landlord.units.map(u => u.propertyId))]
    const propertiesViaUnits = unitPropertyIds.length > 0
      ? await prisma.property.findMany({
          where: { id: { in: unitPropertyIds } },
          select: { id: true, name: true, address: true, type: true, totalUnits: true, status: true },
          orderBy: { name: 'asc' },
        })
      : []

    return NextResponse.json({ ...landlord, propertiesViaUnits })
  } catch (error) {
    console.error('Error fetching landlord:', error)
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
    const validatedData = updateLandlordSchema.parse(body)

    const landlord = await prisma.landlord.update({
      where: { id: id },
      data: validatedData,
    })

    return NextResponse.json(landlord)
  } catch (error: any) {
    console.error('Error updating landlord:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email or ID number already exists' },
        { status: 400 }
      )
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

    // Check if landlord has properties
    const propertiesCount = await prisma.property.count({
      where: { landlordId: id },
    })

    if (propertiesCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete landlord with associated properties' },
        { status: 400 }
      )
    }

    await prisma.landlord.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'Landlord deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting landlord:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
