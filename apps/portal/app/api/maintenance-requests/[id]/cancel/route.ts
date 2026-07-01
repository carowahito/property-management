import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { appendAudit } from '@/lib/services/repair-workflow'

const CANNOT_CANCEL = new Set([
  'IN_PROGRESS', 'COMPLETED_PENDING_CONFIRMATION', 'COMPLETED', 'CLOSED',
])

const bodySchema = z.object({
  reason: z.string().min(1, 'Please provide a reason for cancellation'),
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
    const { reason } = bodySchema.parse(body)

    const req = await prisma.maintenanceRequest.findUnique({ where: { id } })
    if (!req) return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })

    if (req.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Request is already cancelled' }, { status: 400 })
    }

    if (CANNOT_CANCEL.has(req.status as string)) {
      return NextResponse.json(
        { error: `Cannot cancel a request that is ${req.status.replace(/_/g, ' ').toLowerCase()}. Please contact your property manager.` },
        { status: 400 }
      )
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED' as any,
        resolvedAt: new Date(),
      },
    })

    await appendAudit(
      id,
      session.user.id,
      session.user.name,
      req.status,
      'CANCELLED',
      `Cancelled by tenant. Reason: ${reason}`
    )

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error cancelling maintenance request:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
