import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { appendAudit } from '@/lib/services/repair-workflow'

const bodySchema = z.object({
  completionMedia: z.array(z.string()).optional(),
  invoiceRef: z.string().optional(),
  balanceSettledAt: z.string().optional(),
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
    const { completionMedia, invoiceRef, balanceSettledAt } = bodySchema.parse(body)

    const req = await prisma.maintenanceRequest.findUnique({ where: { id } })
    if (!req) return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })

    if (req.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: `Cannot mark complete — current status is ${req.status}` },
        { status: 400 }
      )
    }

    const now = new Date()

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: 'COMPLETED_PENDING_CONFIRMATION' as any,
        completedAt: now,
        completionMedia: completionMedia ?? [],
        invoiceRef,
        balanceSettledAt: balanceSettledAt ? new Date(balanceSettledAt) : undefined,
      },
    })

    await appendAudit(
      id,
      session.user.id,
      session.user.name,
      'IN_PROGRESS',
      'COMPLETED_PENDING_CONFIRMATION',
      `Work marked complete by ${session.user.name ?? session.user.id}. Awaiting occupant confirmation.`
    )

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error marking complete:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
