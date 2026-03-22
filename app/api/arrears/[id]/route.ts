import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateArrearsSchema } from '@/lib/validations/arrears'

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

    const arrears = await prisma.arrearsEscalation.findUnique({
      where: { id },
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
        lease: {
          select: {
            id: true,
            monthlyRent: true,
            startDate: true,
            endDate: true,
            unitRef: {
              select: {
                id: true,
                unitNumber: true,
              },
            },
          },
        },
      },
    })

    if (!arrears) {
      return NextResponse.json(
        { error: 'Arrears record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(arrears)
  } catch (error) {
    console.error('Error fetching arrears:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
    const validatedData = updateArrearsSchema.parse(body)

    const arrears = await prisma.arrearsEscalation.update({
      where: { id },
      data: {
        ...validatedData,
        ...(validatedData.phoneCallNotes
          ? { phoneCallAt: new Date() }
          : {}),
      },
      include: {
        tenant: {
          select: { id: true, name: true, email: true },
        },
        property: {
          select: { id: true, name: true },
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
    console.error('Error updating arrears:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Arrears record not found' },
        { status: 404 }
      )
    }

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
