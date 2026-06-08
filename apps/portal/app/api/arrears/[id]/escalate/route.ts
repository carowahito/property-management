import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { escalateArrearsSchema } from '@/lib/validations/arrears'

const STEP_ORDER = [
  'REMINDER_SENT',
  'OVERDUE_NOTICE_1',
  'PHONE_CALL',
  'OVERDUE_NOTICE_2',
  'FORMAL_NOTICE',
  'LEGAL_REFERRAL',
] as const

const STEP_TIMESTAMP_FIELD: Record<string, string> = {
  OVERDUE_NOTICE_1: 'notice1SentAt',
  PHONE_CALL: 'phoneCallAt',
  OVERDUE_NOTICE_2: 'notice2SentAt',
  FORMAL_NOTICE: 'formalNoticeAt',
  LEGAL_REFERRAL: 'legalReferralAt',
}

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

    const body = await request.json().catch(() => ({}))
    const validatedData = escalateArrearsSchema.parse(body)

    const existing = await prisma.arrearsEscalation.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Arrears record not found' },
        { status: 404 }
      )
    }

    if (!existing.isActive) {
      return NextResponse.json(
        { error: 'Cannot escalate a resolved arrears case' },
        { status: 400 }
      )
    }

    const currentIndex = STEP_ORDER.indexOf(
      existing.currentStep as (typeof STEP_ORDER)[number]
    )

    if (currentIndex === -1 || currentIndex >= STEP_ORDER.length - 1) {
      return NextResponse.json(
        { error: 'Already at the highest escalation level' },
        { status: 400 }
      )
    }

    const nextStep = STEP_ORDER[currentIndex + 1]
    const timestampField = STEP_TIMESTAMP_FIELD[nextStep]

    const updateData: any = {
      currentStep: nextStep,
    }

    if (timestampField) {
      updateData[timestampField] = new Date()
    }

    // Day 6: Arrears Notice #1 — notify landlord (rent overdue, no penalty amounts)
    if (nextStep === 'OVERDUE_NOTICE_1') {
      updateData.landlordNotifiedDay6At = new Date()
    }

    // Day 14: Arrears Notice #2 — notify landlord (arrears amount only, no penalties)
    if (nextStep === 'OVERDUE_NOTICE_2') {
      updateData.landlordNotifiedAt = new Date()
    }

    // Recalculate accrued penalty on every escalation
    const penaltyPerDay = Number(existing.penaltyPerDay ?? 500)
    updateData.penaltyAccrued = existing.daysOverdue * penaltyPerDay

    if (validatedData.notes) {
      updateData.notes = existing.notes
        ? `${existing.notes}\n\n[Escalated to ${nextStep}] ${validatedData.notes}`
        : `[Escalated to ${nextStep}] ${validatedData.notes}`
    }

    const arrears = await prisma.arrearsEscalation.update({
      where: { id },
      data: updateData,
      include: {
        tenant: {
          select: { id: true, name: true, email: true, phone: true },
        },
        property: {
          select: { id: true, name: true, address: true },
        },
        lease: {
          select: {
            id: true,
            monthlyRent: true,
            unitRef: { select: { id: true, unitNumber: true } },
          },
        },
      },
    })

    return NextResponse.json(arrears)
  } catch (error: any) {
    console.error('Error escalating arrears:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
