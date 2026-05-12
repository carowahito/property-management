import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const propertyId = searchParams.get('propertyId')
  const landlordId = searchParams.get('landlordId')

  const units = await prisma.unit.findMany({
    where: {
      ...(propertyId ? { propertyId } : {}),
      ...(landlordId ? { landlordId } : {}),
    },
    include: {
      property: { select: { id: true, name: true } },
      landlord: { select: { id: true, name: true, email: true } },
      tenants: { where: { status: 'ACTIVE' }, select: { id: true, name: true, email: true } },
      _count: { select: { leases: true, payouts: true } },
    },
    orderBy: { unitNumber: 'asc' },
  })

  return NextResponse.json({ units })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      unitNumber, propertyId, landlordId,
      floor, bedrooms, bathrooms, sizeSqm,
      monthlyRent, serviceCharge, serviceChargeType,
      managementFee, managementFeeType,
      status, description,
    } = body

    if (!unitNumber?.trim()) {
      return NextResponse.json({ error: 'Unit number is required' }, { status: 400 })
    }
    if (!propertyId) {
      return NextResponse.json({ error: 'Property is required' }, { status: 400 })
    }
    if (!landlordId) {
      return NextResponse.json({ error: 'Landlord is required' }, { status: 400 })
    }
    if (!monthlyRent || isNaN(Number(monthlyRent))) {
      return NextResponse.json({ error: 'Monthly rent is required' }, { status: 400 })
    }

    // Check unitNumber is globally unique
    const existing = await prisma.unit.findUnique({ where: { unitNumber: unitNumber.trim() } })
    if (existing) {
      return NextResponse.json({ error: `Unit number "${unitNumber}" already exists` }, { status: 409 })
    }

    // Map status from form values to schema enum
    const statusMap: Record<string, string> = {
      vacant: 'VACANT',
      occupied: 'OCCUPIED',
      maintenance: 'MAINTENANCE',
      reserved: 'RESERVED',
    }

    const unit = await prisma.unit.create({
      data: {
        unitNumber: unitNumber.trim(),
        propertyId,
        landlordId,
        floor: floor ? parseInt(floor) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseFloat(bathrooms) : null,
        sizeSqm: sizeSqm ? parseFloat(sizeSqm) : null,
        monthlyRent: parseFloat(monthlyRent),
        serviceCharge: serviceCharge ? parseFloat(serviceCharge) : null,
        serviceChargeType: serviceChargeType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED',
        managementFee: managementFee ? parseFloat(managementFee) : null,
        managementFeeType: managementFeeType === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
        status: (statusMap[status] ?? 'VACANT') as any,
        description: description?.trim() || null,
      },
      include: {
        property: { select: { id: true, name: true } },
        landlord: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(unit, { status: 201 })
  } catch (error: any) {
    console.error('Error creating unit:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Unit number already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
