import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateDepositSchema } from '@/lib/validations/deposit'

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

    const deposit = await prisma.deposit.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            unit: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        lease: {
          select: {
            id: true,
            unit: true,
            monthlyRent: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    })

    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
    }

    return NextResponse.json(deposit)
  } catch (error) {
    console.error('Error fetching deposit:', error)
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
    const validatedData = updateDepositSchema.parse(body)

    const updateData: any = { ...validatedData }

    if (validatedData.paymentDate) {
      updateData.paymentDate = new Date(validatedData.paymentDate)
    }

    const deposit = await prisma.deposit.update({
      where: { id },
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
          },
        },
        lease: {
          select: {
            id: true,
            unit: true,
          },
        },
      },
    })

    return NextResponse.json(deposit)
  } catch (error: any) {
    console.error('Error updating deposit:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
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
