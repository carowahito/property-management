import { prisma } from '@/lib/db'
import { hasMovedOutBy } from '@/lib/services/move-out'

// ============================================================================
// Arrears scan (SOP 004 / BR-5)
// Drives the time-based arrears timeline. Run on a schedule (Vercel Cron) and
// on demand. It:
//   1. Opens an ArrearsCase for any active lease that is overdue and unpaid.
//   2. Refreshes daysOverdue + penaltyAccrued on existing active cases so the
//      timeline (and the day-threshold gates) stay live.
// It does NOT auto-advance human-gated stages (Notice #1/#2, phone call,
// Notice to Remedy, legal referral) — those require the agent/Director.
// ============================================================================

export interface ArrearsScanResult {
  created: number
  refreshed: number
  skipped: number
  totalActiveLeases: number
}

interface OverdueComputation {
  overdue: boolean
  daysOverdue: number
  penaltyPerDay: number
  penaltyAccrued: number
  penaltyCap: number | null
}

// OQ-4: penalty accrues daily but never exceeds the cap (if one is configured).
export function penaltyAccruedFor(daysOverdue: number, penaltyPerDay: number, cap?: number | null): number {
  const raw = Math.max(0, daysOverdue) * penaltyPerDay
  return cap != null && cap > 0 ? Math.min(raw, cap) : raw
}

// OQ-4: absolute cap for a lease = penaltyCapMonths × monthly rent (null = uncapped).
function penaltyCapFor(lease: any): number | null {
  const months = lease.penaltyCapMonths == null ? null : Number(lease.penaltyCapMonths)
  if (months == null || months <= 0) return null
  return months * Number(lease.monthlyRent ?? 0)
}

// OQ-2 (resolved): escalation timers run on CALENDAR days. Days overdue is a
// plain calendar-day count from (due date + grace); weekends and public
// holidays are NOT skipped or adjusted. If Day 6 lands on a holiday, the
// invoice still flips to overdue that day. All day math here is intentionally
// calendar-based (setDate(+n) / ms division), matching SOP 004.
function computeOverdue(lease: any, today: Date): OverdueComputation {
  const dueDay = lease.rentDueDay ?? 1
  const graceDays = lease.gracePeriodDays ?? 5
  const penaltyPerDay = Number(lease.latePenaltyPerDay ?? 500)
  const penaltyCap = penaltyCapFor(lease)

  const dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay)
  let effectiveDueDate = dueDate
  if (dueDate > today) {
    effectiveDueDate = new Date(today.getFullYear(), today.getMonth() - 1, dueDay)
  }

  const overdueThreshold = new Date(effectiveDueDate)
  overdueThreshold.setDate(overdueThreshold.getDate() + graceDays)

  if (today <= overdueThreshold || lease.startDate > effectiveDueDate) {
    return { overdue: false, daysOverdue: 0, penaltyPerDay, penaltyAccrued: 0, penaltyCap }
  }

  const daysOverdue = Math.floor((today.getTime() - overdueThreshold.getTime()) / 86400000)
  return {
    overdue: true,
    daysOverdue,
    penaltyPerDay,
    penaltyAccrued: penaltyAccruedFor(daysOverdue, penaltyPerDay, penaltyCap),
    penaltyCap,
    effectiveDueDate,
    dueDay,
  } as OverdueComputation & { effectiveDueDate: Date; dueDay: number }
}

function stepForDays(daysOverdue: number): string {
  return daysOverdue >= 35 ? 'LEGAL_REFERRAL'
    : daysOverdue >= 21 ? 'FORMAL_NOTICE'
    : daysOverdue >= 14 ? 'OVERDUE_NOTICE_2'
    : daysOverdue >= 10 ? 'PHONE_CALL'
    : daysOverdue >= 6 ? 'OVERDUE_NOTICE_1'
    : 'REMINDER_SENT'
}

export async function runArrearsScan(): Promise<ArrearsScanResult> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const activeLeases = await prisma.lease.findMany({
    where: { status: 'ACTIVE' },
    include: {
      arrearsEscalations: { where: { isActive: true }, select: { id: true } },
      tenant: { select: { moveOutDate: true } },
    },
  })

  let created = 0
  let refreshed = 0
  let skipped = 0

  for (const lease of activeLeases) {
    // Do not chase a tenant who has moved out. Their remaining balance is
    // handled by move-out settlement, not the ongoing rent-arrears cron.
    if (hasMovedOutBy(lease.tenant?.moveOutDate, today)) {
      skipped++
      continue
    }

    const comp = computeOverdue(lease, today) as OverdueComputation & { effectiveDueDate?: Date; dueDay?: number }
    const hasActiveCase = lease.arrearsEscalations.length > 0

    if (!comp.overdue) {
      skipped++
      continue
    }

    // Refresh an existing active case so the timeline stays live.
    if (hasActiveCase) {
      await prisma.arrearsEscalation.update({
        where: { id: lease.arrearsEscalations[0].id },
        data: { daysOverdue: comp.daysOverdue, penaltyAccrued: comp.penaltyAccrued },
      })
      refreshed++
      continue
    }

    // Otherwise, only open a case if the period is genuinely unpaid.
    const paidPayment = await prisma.payment.findFirst({
      where: {
        leaseId: lease.id,
        type: 'RENT',
        status: 'PAID',
        dueDate: {
          gte: comp.effectiveDueDate,
          lte: new Date(comp.effectiveDueDate!.getFullYear(), comp.effectiveDueDate!.getMonth() + 1, comp.dueDay!),
        },
      },
    })
    if (paidPayment) {
      skipped++
      continue
    }

    await prisma.arrearsEscalation.create({
      data: {
        leaseId: lease.id,
        tenantId: lease.tenantId,
        propertyId: lease.propertyId,
        rentAmount: lease.monthlyRent,
        amountOwed: lease.monthlyRent,
        daysOverdue: comp.daysOverdue,
        penaltyPerDay: comp.penaltyPerDay,
        penaltyAccrued: comp.penaltyAccrued,
        penaltyCap: comp.penaltyCap, // OQ-4 snapshot
        reminderSentAt: new Date(),
        currentStep: stepForDays(comp.daysOverdue) as any,
      },
    })
    created++
  }

  return { created, refreshed, skipped, totalActiveLeases: activeLeases.length }
}
