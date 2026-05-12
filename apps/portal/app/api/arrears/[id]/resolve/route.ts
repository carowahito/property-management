import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { resolveArrearsSchema } from '@/lib/validations/arrears'

export async function POST(
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
    const validatedData = resolveArrearsSchema.parse(body)

    const existing = await prisma.arrearsEscalation.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Arrears record not found' },
        { status: 404 }
      )
    }

    if (!existing.isActive) {
      return NextResponse.json(
        { error: 'Arrears case is already resolved' },
        { status: 400 }
      )
    }

    const arrears = await prisma.arrearsEscalation.update({
      where: { id },
      data: {
        currentStep: 'RESOLVED',
        isActive: false,
        resolvedAt: new Date(),
        resolution: validatedData.resolution,
        notes: validatedData.notes
          ? existing.notes
            ? `${existing.notes}\n\n[Resolved: ${validatedData.resolution}] ${validatedData.notes}`
            : `[Resolved: ${validatedData.resolution}] ${validatedData.notes}`
          : existing.notes,
      },
      include: {
        tenant: {
          select: { id: true, name: true, email: true, phone: true },
        },
        property: {
          select: { id: true, name: true, address: true },
        },
        lease: {
          select: {
            id: true,
            monthlyRent: true,
            unitRef: { select: { id: true, unitNumber: true } },
          },
        },
      },
    })

    return NextResponse.json(arrears)
  } catch (error: any) {
    console.error('Error resolving arrears:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
