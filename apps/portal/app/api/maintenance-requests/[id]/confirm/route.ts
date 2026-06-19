import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { appendAudit } from '@/lib/services/repair-workflow'

const bodySchema = z.object({
  satisfied: z.boolean(),
  disputeReason: z.string().optional(),
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
    const { satisfied, disputeReason } = bodySchema.parse(body)

    const req = await prisma.maintenanceRequest.findUnique({ where: { id } })
    if (!req) return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })

    if (req.status !== 'COMPLETED_PENDING_CONFIRMATION') {
      return NextResponse.json(
        { error: `Cannot confirm — current status is ${req.status}` },
        { status: 400 }
      )
    }

    const now = new Date()
    const nextStatus = satisfied ? 'CLOSED' : 'DISPUTED'

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: nextStatus as any,
        occupantConfirmedAt: satisfied ? now : undefined,
        resolvedAt: satisfied ? now : undefined,
      },
    })

    await appendAudit(
      id,
      session.user.id,
      session.user.name,
      'COMPLETED_PENDING_CONFIRMATION',
      nextStatus,
      satisfied
        ? 'Occupant confirmed work is satisfactory. Request closed.'
        : `Occupant raised a dispute${disputeReason ? `: ${disputeReason}` : ''}. Reopened for review.`
    )

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error confirming completion:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
