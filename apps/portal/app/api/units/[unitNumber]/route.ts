import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateUnitSchema = z.object({
  monthlyRent: z.number().min(0).optional(),
  serviceCharge: z.number().min(0).optional(),
  serviceChargeType: z.enum(['FIXED', 'PERCENTAGE']).optional(),
  managementFee: z.number().min(0).optional(),
  managementFeeType: z.enum(['FIXED', 'PERCENTAGE']).optional(),
  status: z.enum(['VACANT', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'ARCHIVED']).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  floor: z.number().int().optional(),
  sizeSqm: z.number().min(0).optional(),
  description: z.string().optional(),
  landlordId: z.string().nullable().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ unitNumber: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { unitNumber } = await params
    const body = await req.json()
    const data = updateUnitSchema.parse(body)

    const unit = await prisma.unit.findUnique({ where: { unitNumber } })
    if (!unit) return NextResponse.json({ error: 'Unit not found' }, { status: 404 })

    const { landlordId, ...rest } = data

    if (landlordId) {
      const landlord = await prisma.landlord.findUnique({ where: { id: landlordId } })
      if (!landlord) return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
    }

    const prismaData: Record<string, unknown> = { ...rest }
    if (landlordId !== undefined) prismaData.landlordId = landlordId

    const updated = await prisma.unit.update({
      where: { unitNumber },
      data: prismaData as any,
      include: {
        property: { select: { id: true, name: true, address: true } },
        landlord: {
          select: { id: true, name: true, email: true, phone: true, type: true },
          include: { members: { orderBy: { createdAt: 'asc' } } },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error updating unit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ unitNumber: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { unitNumber } = await params
    const unit = await prisma.unit.findUnique({
      where: { unitNumber },
      include: {
        property: { select: { id: true, name: true, address: true } },
        landlord: {
          select: { id: true, name: true, email: true, phone: true, type: true },
          include: { members: { orderBy: { createdAt: 'asc' } } },
        },
      },
    })

    if (!unit) return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    return NextResponse.json(unit)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ unitNumber: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { unitNumber } = await params
    const unit = await prisma.unit.findUnique({ where: { unitNumber } })
    if (!unit) return NextResponse.json({ error: 'Unit not found' }, { status: 404 })

    // Block deletion if unit has an active tenant or open lease
    const activeTenant = await prisma.tenant.findFirst({ where: { unitId: unit.id, status: 'ACTIVE' } })
    if (activeTenant) {
      return NextResponse.json({ error: 'Cannot delete a unit with an active tenant. Move out the tenant first.' }, { status: 409 })
    }

    await prisma.unit.delete({ where: { unitNumber } })
    return NextResponse.json({ message: 'Unit deleted' })
  } catch (error: any) {
    console.error('Error deleting unit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
