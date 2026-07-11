import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { escalateArrearsSchema } from '@/lib/validations/arrears'
import { openLegalCaseForArrears } from '@/lib/services/legal-case'

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

// SOP 004 / BR-5 — escalation ladder is time-locked. A stage cannot fire before
// its day threshold (measured from the oldest unpaid invoice's due date).
const STEP_DAY_THRESHOLD: Record<string, number> = {
  OVERDUE_NOTICE_1: 6,
  PHONE_CALL: 10,
  OVERDUE_NOTICE_2: 14,
  FORMAL_NOTICE: 21,
  LEGAL_REFERRAL: 35,
}

// Director-equivalent role. This platform has no dedicated DIRECTOR role;
// ADMIN is the highest-privilege role and stands in for the SOP's Director.
const DIRECTOR_ROLE = 'ADMIN'

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
    const role = (session.user as any)?.role as string | undefined

    // BR-5: time-lock — cannot advance to a stage before its day threshold.
    const threshold = STEP_DAY_THRESHOLD[nextStep]
    if (threshold != null && existing.daysOverdue < threshold) {
      return NextResponse.json(
        {
          error: `Cannot escalate to ${nextStep} before day ${threshold} — the case is ${existing.daysOverdue} day(s) overdue.`,
        },
        { status: 400 }
      )
    }

    // BR-6: Notice to Remedy (Day 21) requires a Director + landlord/legal
    // consultation confirmation + a recorded-delivery reference.
    if (nextStep === 'FORMAL_NOTICE') {
      if (role !== DIRECTOR_ROLE) {
        return NextResponse.json(
          { error: 'Notice to Remedy requires Director (ADMIN) approval.' },
          { status: 403 }
        )
      }
      if (!validatedData.consultationConfirmed) {
        return NextResponse.json(
          { error: 'Confirm the landlord and legal advisor were consulted before issuing a Notice to Remedy.' },
          { status: 400 }
        )
      }
      if (!validatedData.recordedDeliveryRef?.trim()) {
        return NextResponse.json(
          { error: 'A recorded-delivery reference is required to issue a Notice to Remedy.' },
          { status: 400 }
        )
      }
    }

    // BR-7: Legal referral (Day 35) requires Director approval.
    if (nextStep === 'LEGAL_REFERRAL' && role !== DIRECTOR_ROLE) {
      return NextResponse.json(
        { error: 'Legal referral requires Director (ADMIN) approval.' },
        { status: 403 }
      )
    }

    const updateData: any = {
      currentStep: nextStep,
    }

    if (timestampField) {
      updateData[timestampField] = new Date()
    }

    // BR-6: capture the Day-21 gate evidence on the record.
    if (nextStep === 'FORMAL_NOTICE') {
      updateData.consultationConfirmed = true
      updateData.recordedDeliveryRef = validatedData.recordedDeliveryRef!.trim()
      updateData.directorApprovedBy = (session.user as any)?.id ?? null
      updateData.directorApprovedAt = new Date()
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

    // BR-7: legal referral closes the arrears case (the legal record takes over).
    if (nextStep === 'LEGAL_REFERRAL') {
      updateData.isActive = false
      updateData.resolvedAt = new Date()
      updateData.resolution = 'LEGAL_REFERRAL'
    }

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

    // BR-7: open the Legal/Dispute record with the full document bundle.
    let legalCase = null
    if (nextStep === 'LEGAL_REFERRAL') {
      legalCase = await openLegalCaseForArrears(id, (session.user as any)?.id)
    }

    return NextResponse.json({ ...arrears, legalCase })
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
