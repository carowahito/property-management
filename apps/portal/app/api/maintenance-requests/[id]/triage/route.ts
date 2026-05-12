import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { triageSchema } from '@/lib/validations/maintenance-triage'

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    const dayOfWeek = result.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++
    }
  }
  return result
}

function calculateSlaDeadline(
  category: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'PREVENTIVE',
  now: Date,
  scheduledDate?: string
): Date {
  switch (category) {
    case 'EMERGENCY':
      return new Date(now.getTime() + 2 * 60 * 60 * 1000) // +2 hours
    case 'URGENT':
      return addBusinessDays(now, 1)
    case 'ROUTINE':
      return addBusinessDays(now, 5)
    case 'PREVENTIVE':
      return scheduledDate ? new Date(scheduledDate) : addBusinessDays(now, 30)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = triageSchema.parse(body)

    // Check if maintenance request exists
    const existing = await prisma.maintenanceRequest.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })
    }

    const now = new Date()
    const slaDeadline = calculateSlaDeadline(
      validatedData.triageCategory,
      now,
      validatedData.scheduledDate
    )

    const estimatedCost = validatedData.estimatedCost ?? null
    const approvalRequired = estimatedCost !== null && estimatedCost > 5000
    const isEmergency = validatedData.triageCategory === 'EMERGENCY'

    const updateData: any = {
      triageCategory: validatedData.triageCategory,
      slaDeadline,
      slaBreached: false,
      status: existing.status === 'PENDING' ? 'IN_PROGRESS' : existing.status,
    }

    if (estimatedCost !== null) {
      updateData.estimatedCost = estimatedCost
    }

    if (isEmergency) {
      // Emergency bypasses approval
      updateData.approvalRequired = false
      updateData.landlordNotified = true
      updateData.landlordNotifiedAt = now
    } else {
      updateData.approvalRequired = approvalRequired
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error triaging maintenance request:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
