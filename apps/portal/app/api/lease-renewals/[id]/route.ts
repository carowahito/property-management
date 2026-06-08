import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateLeaseRenewalSchema } from '@/lib/validations/lease-renewal'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const renewal = await prisma.leaseRenewal.findUnique({
      where: { id },
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
            landlord: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        lease: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            monthlyRent: true,
            status: true,
            unit: true,
            unitRef: {
              select: {
                id: true,
                unitNumber: true,
              },
            },
          },
        },
      },
    })

    if (!renewal) {
      return NextResponse.json({ error: 'Lease renewal not found' }, { status: 404 })
    }

    return NextResponse.json(renewal)
  } catch (error) {
    console.error('Error fetching lease renewal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateLeaseRenewalSchema.parse(body)

    const existing = await prisma.leaseRenewal.findUnique({
      where: { id },
      select: {
        currentRent: true,
        landlordIntent: true,
        directorEscalated: true,
        healthCheckOutcome: true,
        rentReviewBasis: true,
        landlordWrittenAuthority: true,
        tenantNotifiedAt: true,
        agentActionAt: true,
        proposedRent: true,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Lease renewal not found' }, { status: 404 })
    }

    const updateData: any = {}

    // --- Step 1: Health check ---
    if (validatedData.healthCheckOutcome !== undefined) {
      updateData.healthCheckOutcome = validatedData.healthCheckOutcome
      updateData.healthCheckCompletedAt = new Date()
      // Auto-flag for Director if Red on 2+ dimensions
      const redCount = validatedData.healthCheckOutcome.redCount
      if (redCount >= 2) {
        updateData.directorEscalated = true
        updateData.directorEscalatedAt = new Date()
      }
    }

    if (validatedData.directorEscalated !== undefined) {
      updateData.directorEscalated = validatedData.directorEscalated
      if (validatedData.directorEscalated) {
        updateData.directorEscalatedAt = new Date()
      }
    }

    // --- Step 2: Landlord consultation ---
    if (validatedData.landlordIntent !== undefined) {
      updateData.landlordIntent = validatedData.landlordIntent
      updateData.landlordDecisionAt = new Date()
      updateData.agentActionAt = existing.agentActionAt || new Date()

      if (!validatedData.status) {
        if (validatedData.landlordIntent === 'NOT_RENEWING') {
          updateData.status = 'DECLINED'
        } else if (validatedData.landlordIntent === 'RENEW_NEW_RENT') {
          updateData.status = 'RENT_REVIEW'
        } else {
          updateData.status = 'LANDLORD_REVIEW'
        }
      }
    }

    if (validatedData.rentReviewBasis !== undefined) {
      updateData.rentReviewBasis = validatedData.rentReviewBasis
    }
    if (validatedData.rentReviewFormula !== undefined) {
      updateData.rentReviewFormula = validatedData.rentReviewFormula
    }
    if (validatedData.landlordWrittenAuthority !== undefined) {
      updateData.landlordWrittenAuthority = validatedData.landlordWrittenAuthority
    }

    // --- Step 3: Rent review calculation ---
    if (validatedData.cpiReference !== undefined) {
      updateData.cpiReference = validatedData.cpiReference
    }

    if (validatedData.proposedRent !== undefined) {
      updateData.proposedRent = validatedData.proposedRent
      const currentRent = Number(existing.currentRent)
      const increasePercent =
        ((validatedData.proposedRent - currentRent) / currentRent) * 100
      updateData.rentIncreasePercent = Math.round(increasePercent * 100) / 100
    }

    if (validatedData.marketComparables !== undefined) {
      updateData.marketComparables = validatedData.marketComparables
    }

    // --- Step 4: Notify tenant — enforce business rules ---
    if (
      validatedData.status === 'TENANT_NOTIFIED' ||
      (updateData.status === undefined && body.status === 'TENANT_NOTIFIED')
    ) {
      const effectiveLandlordIntent =
        validatedData.landlordIntent ?? existing.landlordIntent
      if (!effectiveLandlordIntent) {
        return NextResponse.json(
          { error: 'Landlord instruction must be recorded before notifying the tenant (SOP 016 Step 2).' },
          { status: 400 }
        )
      }

      // Director-escalated block
      const escalated =
        validatedData.directorEscalated !== undefined
          ? validatedData.directorEscalated
          : existing.directorEscalated
      if (escalated) {
        return NextResponse.json(
          { error: 'This tenancy is escalated to the Director. Renewal offer cannot be generated until Director approves (SOP 016 Step 1).' },
          { status: 400 }
        )
      }

      // NEGOTIATED basis requires written authority
      const basis = validatedData.rentReviewBasis ?? existing.rentReviewBasis
      const authority =
        validatedData.landlordWrittenAuthority !== undefined
          ? validatedData.landlordWrittenAuthority
          : existing.landlordWrittenAuthority
      if (basis === 'NEGOTIATED' && !authority) {
        return NextResponse.json(
          { error: 'Written landlord authority is required for a negotiated rent review before notifying the tenant (SOP 016 Step 3).' },
          { status: 400 }
        )
      }

      // Calculate response deadline (minimum 21 days from today)
      const notifyDate = new Date()
      const minResponseDeadline = new Date(notifyDate)
      minResponseDeadline.setDate(minResponseDeadline.getDate() + 21)

      if (validatedData.responseDeadline) {
        const supplied = new Date(validatedData.responseDeadline)
        if (supplied < minResponseDeadline) {
          return NextResponse.json(
            { error: 'Response deadline must be at least 21 days from today (SOP 016 Step 4).' },
            { status: 400 }
          )
        }
        updateData.responseDeadline = supplied
      } else {
        updateData.responseDeadline = minResponseDeadline
      }

      // Validate 60-day minimum before rent increase takes effect
      const proposedRentValue =
        validatedData.proposedRent !== undefined
          ? validatedData.proposedRent
          : existing.proposedRent
          ? Number(existing.proposedRent)
          : null

      if (proposedRentValue && proposedRentValue > Number(existing.currentRent)) {
        const minEffectiveDate = new Date(notifyDate)
        minEffectiveDate.setDate(minEffectiveDate.getDate() + 60)

        if (validatedData.rentEffectiveDate) {
          const supplied = new Date(validatedData.rentEffectiveDate)
          if (supplied < minEffectiveDate) {
            return NextResponse.json(
              { error: 'Rent increase cannot take effect less than 60 days from today (SOP 016 Step 4).' },
              { status: 400 }
            )
          }
          updateData.rentEffectiveDate = supplied
        } else {
          updateData.rentEffectiveDate = minEffectiveDate
        }
      }

      updateData.tenantNotifiedAt = notifyDate
      updateData.status = 'TENANT_NOTIFIED'
    }

    // Apply explicit status override (for non-TENANT_NOTIFIED transitions)
    if (
      validatedData.status !== undefined &&
      validatedData.status !== 'TENANT_NOTIFIED'
    ) {
      updateData.status = validatedData.status
    }

    // --- Tenant response ---
    if (validatedData.tenantResponse !== undefined) {
      updateData.tenantResponse = validatedData.tenantResponse
      updateData.tenantResponseAt = new Date()
      if (validatedData.tenantResponse === 'ACCEPTED') {
        updateData.status = 'ACCEPTED'
      } else if (validatedData.tenantResponse === 'DECLINED') {
        updateData.status = 'DECLINED'
      }
    }

    // --- Step 6: No-response tracking ---
    if (validatedData.contactAttempts !== undefined) {
      updateData.contactAttempts = validatedData.contactAttempts
    }
    if (validatedData.noResponseNoticeAt !== undefined) {
      updateData.noResponseNoticeAt = new Date(validatedData.noResponseNoticeAt)
    }

    // --- Step 7: Periodic continuation ---
    if (validatedData.periodicAuthorisedAt !== undefined) {
      updateData.periodicAuthorisedAt = new Date(validatedData.periodicAuthorisedAt)
    }
    if (validatedData.periodicTerms !== undefined) {
      updateData.periodicTerms = validatedData.periodicTerms
    }
    if (validatedData.periodicReviewReminderAt !== undefined) {
      updateData.periodicReviewReminderAt = new Date(validatedData.periodicReviewReminderAt)
    }

    // Month-to-month sets periodic dates
    if (validatedData.status === 'MONTH_TO_MONTH' || updateData.status === 'MONTH_TO_MONTH') {
      if (!updateData.periodicAuthorisedAt) {
        updateData.periodicAuthorisedAt = new Date()
      }
      // 3-month review reminder
      if (!updateData.periodicReviewReminderAt) {
        const reminder = new Date()
        reminder.setMonth(reminder.getMonth() + 3)
        updateData.periodicReviewReminderAt = reminder
      }
    }

    // Misc
    if (validatedData.renewalNotes !== undefined) {
      updateData.renewalNotes = validatedData.renewalNotes
    }
    if (validatedData.responseDeadline !== undefined && !updateData.responseDeadline) {
      updateData.responseDeadline = new Date(validatedData.responseDeadline)
    }
    if (validatedData.rentEffectiveDate !== undefined && !updateData.rentEffectiveDate) {
      updateData.rentEffectiveDate = new Date(validatedData.rentEffectiveDate)
    }

    const updated = await prisma.leaseRenewal.update({
      where: { id },
      data: updateData,
      include: {
        tenant: {
          select: { id: true, name: true, email: true },
        },
        property: {
          select: { id: true, name: true, address: true },
        },
        lease: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            monthlyRent: true,
            unit: true,
            unitRef: {
              select: { id: true, unitNumber: true },
            },
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating lease renewal:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Lease renewal not found' }, { status: 404 })
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
