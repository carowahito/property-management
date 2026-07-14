import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/services/email'
import { sendWhatsApp } from '@/lib/services/whatsapp'
import { brandedNoticeHtml } from '@/lib/services/brand'

// ============================================================================
// End-of-Day-5 Penalty Activation Notice (SOP 004 / BR-1c)
// On the last grace day, for every still-unpaid invoice, auto-send a notice
// (email + WhatsApp) warning that penalties take effect from Day 6 and accrue
// daily until cleared. This is a system communication (no human gate), distinct
// from the formal Arrears Notice #1 (Day 6). Logged to the invoice audit trail.
// ============================================================================

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export interface PenaltyActivationResult {
  notified: number
}

export async function sendPenaltyActivationNotices(today = new Date()): Promise<PenaltyActivationResult> {
  const t = startOfDay(today)

  // Still within grace (not yet overdue) and unpaid.
  const invoices = await prisma.rentInvoice.findMany({
    where: { status: { in: ['ISSUED', 'PARTIALLY_PAID'] } },
    include: {
      tenant: { select: { name: true, email: true, phone: true } },
      lease: { select: { latePenaltyPerDay: true, mpesaTill: true, bankDetails: true, unitRef: { select: { unitNumber: true } } } },
      allocations: { where: { target: 'RENT' }, select: { amount: true } },
    },
  })

  let notified = 0
  for (const inv of invoices) {
    const balance = Number(inv.rentAmount) - inv.allocations.reduce((s, a) => s + Number(a.amount), 0)
    if (balance <= 0) continue

    // Last grace day = dueDate + (grace − 1). Overdue flips the next day (Day 6).
    const lastGraceDay = new Date(inv.dueDate)
    lastGraceDay.setDate(lastGraceDay.getDate() + inv.gracePeriodDays - 1)
    if (!sameDay(startOfDay(lastGraceDay), t)) continue

    const penaltyPerDay = Number(inv.lease?.latePenaltyPerDay ?? 0)
    const terms = penaltyPerDay > 0 ? `KES ${penaltyPerDay.toLocaleString()} per day` : 'the late-payment penalty in your lease'
    const acctRef = inv.lease?.unitRef?.unitNumber || ''
    const payInstr = [inv.lease?.mpesaTill ? `M-Pesa: ${inv.lease.mpesaTill}` : '', inv.lease?.bankDetails ? `Bank: ${inv.lease.bankDetails}` : '', acctRef ? `Account Ref: ${acctRef}` : '']
      .filter(Boolean)
      .join(' • ')

    const channels: string[] = []
    if (inv.tenant.email) {
      try {
        const ok = await sendEmail({
          to: inv.tenant.email,
          subject: `Payment Reminder - penalties begin tomorrow (${inv.period})`,
          html: brandedNoticeHtml(
            'Payment Reminder',
            `<p>Hi ${inv.tenant.name},</p>
<p>Your rent for <strong>${inv.period}</strong> shows an outstanding balance of <strong>KES ${balance.toLocaleString()}</strong>.</p>
<p>Please note that a late-payment penalty of <strong>${terms}</strong> will take effect from tomorrow and will continue to accrue daily until the full balance is cleared.</p>
<p>To avoid penalties, please pay today.${payInstr ? `<br>${payInstr}` : ''}</p>`
          ),
        })
        if (ok) channels.push('email')
      } catch (err) {
        console.error(`[penalty-activation] email failed for ${inv.id}:`, err)
      }
    }
    if (inv.tenant.phone) {
      try {
        const ok = await sendWhatsApp({
          to: inv.tenant.phone,
          message: `⚠️ *Payment Reminder - ${inv.period}*\n\nHi ${inv.tenant.name}, your outstanding balance is KES ${balance.toLocaleString()}. A late-payment penalty of ${terms} begins tomorrow and accrues daily until cleared. Please pay today to avoid penalties.${payInstr ? `\n\n${payInstr}` : ''}`,
        })
        if (ok) channels.push('whatsapp')
      } catch (err) {
        console.error(`[penalty-activation] whatsapp failed for ${inv.id}:`, err)
      }
    }

    const events = Array.isArray(inv.events) ? (inv.events as any[]) : []
    events.push({ at: new Date().toISOString(), type: 'penalty_activation', channels })
    await prisma.rentInvoice.update({ where: { id: inv.id }, data: { events: events as any } })
    notified++
  }

  return { notified }
}
