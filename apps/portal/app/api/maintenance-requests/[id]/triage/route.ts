import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { triageSchema } from '@/lib/validations/maintenance-triage'
import { appendAudit } from '@/lib/services/repair-workflow'

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    const dow = result.getDay()
    if (dow !== 0 && dow !== 6) added++
  }
  return result
}

function calcSlaDeadline(
  category: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'PREVENTIVE',
  now: Date,
  scheduledDate?: string
): Date {
  switch (category) {
    case 'EMERGENCY': return new Date(now.getTime() + 2 * 60 * 60 * 1000)
    case 'URGENT':    return addBusinessDays(now, 1)
    case 'ROUTINE':   return addBusinessDays(now, 5)
    case 'PREVENTIVE': return scheduledDate ? new Date(scheduledDate) : addBusinessDays(now, 30)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const data = triageSchema.parse(body)

    const existing = await prisma.maintenanceRequest.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })

    const now = new Date()
    const isEmergency = data.triageCategory === 'EMERGENCY'
    const slaDeadline = calcSlaDeadline(data.triageCategory, now, data.scheduledDate)

    // Emergency bypasses quote/approval/funds → straight to IN_PROGRESS (brief §5)
    const nextStatus = isEmergency ? 'IN_PROGRESS' : 'UNDER_REVIEW'

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        triageCategory: data.triageCategory,
        slaDeadline,
        slaBreached: false,
        status: nextStatus as any,
        estimatedCost: data.estimatedCost ?? undefined,
        landlordNotified: isEmergency ? true : existing.landlordNotified,
        landlordNotifiedAt: isEmergency ? now : existing.landlordNotifiedAt,
      },
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        property: {
          select: {
            id: true, name: true, address: true,
            landlord: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    await appendAudit(
      id,
      session.user.id,
      session.user.name,
      existing.status,
      nextStatus,
      isEmergency
        ? `Emergency — dispatching immediately. Category: ${data.triageCategory}`
        : `Triaged as ${data.triageCategory}. SLA due ${slaDeadline.toISOString()}`
    )

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error triaging maintenance request:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
