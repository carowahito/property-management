import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { settleDepositSchema } from '@/lib/validations/deposit'

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

    // Fetch the deposit
    const deposit = await prisma.deposit.findUnique({
      where: { id },
    })

    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
    }

    if (deposit.status !== 'HELD' && deposit.status !== 'UNDER_REVIEW') {
      return NextResponse.json(
        { error: 'Deposit can only be settled when status is HELD or UNDER_REVIEW' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = settleDepositSchema.parse(body)

    // Calculate total deductions and refund amount
    const totalDeductions = validatedData.deductions.reduce(
      (sum, d) => sum + d.amount,
      0
    )

    const depositAmount = Number(deposit.amount)

    if (totalDeductions > depositAmount) {
      return NextResponse.json(
        { error: 'Total deductions cannot exceed deposit amount' },
        { status: 400 }
      )
    }

    const refundAmount = depositAmount - totalDeductions

    // Determine status based on deductions
    let status: 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'FORFEITED'
    if (totalDeductions === 0) {
      status = 'REFUNDED'
    } else if (refundAmount === 0) {
      status = 'FORFEITED'
    } else {
      status = 'PARTIALLY_REFUNDED'
    }

    const updatedDeposit = await prisma.deposit.update({
      where: { id },
      data: {
        status,
        deductions: validatedData.deductions,
        refundAmount,
        refundDate: new Date(),
        refundReference: validatedData.refundReference || null,
        settlementNotes: validatedData.settlementNotes || null,
      },
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
          },
        },
        lease: {
          select: {
            id: true,
            unit: true,
            monthlyRent: true,
          },
        },
      },
    })

    return NextResponse.json(updatedDeposit)
  } catch (error: any) {
    console.error('Error settling deposit:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
