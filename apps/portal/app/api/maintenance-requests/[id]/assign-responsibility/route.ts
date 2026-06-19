import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { appendAudit } from '@/lib/services/repair-workflow'

const bodySchema = z.object({
  responsibleParty: z.enum(['LANDLORD', 'TENANT', 'SHARED']),
  responsibilityReason: z.string().min(1, 'Reason is required'),
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
    const { responsibleParty, responsibilityReason } = bodySchema.parse(body)

    const req = await prisma.maintenanceRequest.findUnique({ where: { id } })
    if (!req) return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })

    if (req.status !== 'UNDER_REVIEW') {
      return NextResponse.json(
        { error: `Cannot assign responsibility — current status is ${req.status}` },
        { status: 400 }
      )
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: 'RESPONSIBILITY_ASSIGNED' as any,
        responsibleParty: responsibleParty as any,
        responsibilityReason,
        responsibilitySetAt: new Date(),
        responsibilitySetBy: session.user.id,
      },
    })

    await appendAudit(
      id,
      session.user.id,
      session.user.name,
      'UNDER_REVIEW',
      'RESPONSIBILITY_ASSIGNED',
      `Responsibility assigned to ${responsibleParty}. Reason: ${responsibilityReason}`
    )

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error assigning responsibility:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
