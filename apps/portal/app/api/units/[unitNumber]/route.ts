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
  status: z.enum(['VACANT', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  floor: z.number().int().optional(),
  sizeSqm: z.number().min(0).optional(),
  description: z.string().optional(),
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

    const updated = await prisma.unit.update({
      where: { unitNumber },
      data,
      include: {
        property: { select: { id: true, name: true, address: true } },
        landlord: { select: { id: true, name: true, email: true } },
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
        landlord: { select: { id: true, name: true, email: true } },
      },
    })

    if (!unit) return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    return NextResponse.json(unit)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
