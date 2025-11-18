import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updatePayoutSchema } from '@/lib/validations/payout'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payout = await prisma.payout.findUnique({
      where: { id: params.id },
      include: {
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            bankName: true,
            bankAccount: true,
            properties: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
      },
    })

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
    }

    return NextResponse.json(payout)
  } catch (error) {
    console.error('Error fetching payout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updatePayoutSchema.parse(body)

    const updateData: any = { ...validatedData }

    // Convert date strings to Date objects
    if (validatedData.paidDate) {
      updateData.paidDate = new Date(validatedData.paidDate)
    }

    // If status is being updated to PAID and no paidDate, set it to now
    if (validatedData.status === 'PAID' && !validatedData.paidDate) {
      updateData.paidDate = new Date()
    }

    const payout = await prisma.payout.update({
      where: { id: params.id },
      data: updateData,
      include: {
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(payout)
  } catch (error: any) {
    console.error('Error updating payout:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow deletion of PENDING or FAILED payouts
    const payout = await prisma.payout.findUnique({
      where: { id: params.id },
    })

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
    }

    if (payout.status === 'PAID' || payout.status === 'PROCESSING') {
      return NextResponse.json(
        { error: 'Cannot delete paid or processing payouts' },
        { status: 400 }
      )
    }

    await prisma.payout.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Payout deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting payout:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
