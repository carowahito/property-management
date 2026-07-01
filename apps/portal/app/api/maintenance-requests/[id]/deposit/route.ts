import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { appendAudit } from '@/lib/services/repair-workflow'

const bodySchema = z.object({
  depositRef: z.string().min(1, 'Payment reference is required'),
  depositPaidAt: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { depositRef, depositPaidAt } = bodySchema.parse(body)

    const req = await prisma.maintenanceRequest.findUnique({ where: { id } })
    if (!req) return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })

    if (req.status !== 'AWAITING_FUNDS') {
      return NextResponse.json(
        { error: `Cannot record deposit — current status is ${req.status}` },
        { status: 400 }
      )
    }

    const paidAt = depositPaidAt ? new Date(depositPaidAt) : new Date()

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS' as any,
        depositPaidAt: paidAt,
        depositRef,
      },
    })

    await appendAudit(
      id,
      session.user.id,
      session.user.name,
      'AWAITING_FUNDS',
      'IN_PROGRESS',
      `Deposit received (ref: ${depositRef}). Contractor dispatched.`
    )

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error recording deposit:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
