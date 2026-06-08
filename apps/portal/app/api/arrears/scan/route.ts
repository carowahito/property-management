import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find all active leases
    const activeLeases = await prisma.lease.findMany({
      where: { status: 'ACTIVE' },
      include: {
        tenant: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
        // Check for existing active arrears
        arrearsEscalations: {
          where: { isActive: true },
          select: { id: true },
        },
      },
    })

    const created: string[] = []
    const skipped: string[] = []

    for (const lease of activeLeases) {
      // Skip if already has an active arrears escalation
      if (lease.arrearsEscalations.length > 0) {
        skipped.push(lease.id)
        continue
      }

      // Calculate this period's due date
      const dueDay = (lease as any).rentDueDay ?? 1
      const graceDays = (lease as any).gracePeriodDays ?? 5
      const penaltyPerDay = Number((lease as any).latePenaltyPerDay ?? 500)

      // Build due date for current month
      const dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay)

      // If due date is in the future, try previous month
      let effectiveDueDate = dueDate
      if (dueDate > today) {
        effectiveDueDate = new Date(today.getFullYear(), today.getMonth() - 1, dueDay)
      }

      // Overdue threshold = due date + grace period
      const overdueThreshold = new Date(effectiveDueDate)
      overdueThreshold.setDate(overdueThreshold.getDate() + graceDays)

      // Not overdue yet
      if (today <= overdueThreshold) continue

      // Check if rent was paid for this period (paid payment after the effective due date)
      const paidPayment = await prisma.payment.findFirst({
        where: {
          leaseId: lease.id,
          type: 'RENT',
          status: 'PAID',
          dueDate: {
            gte: effectiveDueDate,
            lte: new Date(effectiveDueDate.getFullYear(), effectiveDueDate.getMonth() + 1, dueDay),
          },
        },
      })

      if (paidPayment) continue

      // Also check if the lease started after the effective due date (new tenant, not yet due)
      if (lease.startDate > effectiveDueDate) continue

      const daysOverdue = Math.floor(
        (today.getTime() - overdueThreshold.getTime()) / 86400000
      )

      // Penalty only applies from Day 6 (after grace period ends)
      const penaltyDays = Math.max(0, daysOverdue)
      const penaltyAccrued = penaltyDays * penaltyPerDay

      await prisma.arrearsEscalation.create({
        data: {
          leaseId: lease.id,
          tenantId: lease.tenantId,
          propertyId: lease.propertyId,
          rentAmount: lease.monthlyRent,
          amountOwed: lease.monthlyRent,
          daysOverdue,
          penaltyPerDay,
          penaltyAccrued,
          reminderSentAt: new Date(),
          currentStep: daysOverdue >= 35
            ? 'LEGAL_REFERRAL'
            : daysOverdue >= 21
            ? 'FORMAL_NOTICE'
            : daysOverdue >= 14
            ? 'OVERDUE_NOTICE_2'
            : daysOverdue >= 10
            ? 'PHONE_CALL'
            : daysOverdue >= 6
            ? 'OVERDUE_NOTICE_1'
            : 'REMINDER_SENT',
        },
      })

      created.push(lease.id)
    }

    return NextResponse.json({
      message: `Scan complete. ${created.length} new arrears records created.`,
      created: created.length,
      skipped: skipped.length,
      totalActiveLeases: activeLeases.length,
    })
  } catch (error) {
    console.error('Error scanning for arrears:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
