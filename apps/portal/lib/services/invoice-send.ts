import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/services/email'
import { sendWhatsApp } from '@/lib/services/whatsapp'
import { buildInvoiceHtml } from '@/lib/services/invoice-document'
import { computeArrearsSnapshot } from '@/lib/services/arrears-snapshot'

// ============================================================================
// Invoice sending (SOP 004 / BR-1a)
// Auto-send the rent invoice, UNLESS it is already fully settled by prepayment
// or credit at send time (suppressed, and the suppression is logged so the
// audit trail shows why nothing went out). Partially-paid invoices are still
// sent, showing the remaining balance. Invoice *generation* is unconditional
// (the financial record always exists); only the *send* is conditional.
// ============================================================================

export type InvoiceSendOutcome =
  | { status: 'sent'; channels: string[]; balanceDue: number }
  | { status: 'suppressed'; reason: string }
  | { status: 'skipped'; reason: string }

interface InvoiceEvent {
  at: string
  type: 'sent' | 'send_suppressed'
  channels?: string[]
  reason?: string
}

async function appendEvent(invoiceId: string, current: unknown, event: InvoiceEvent, extra: Record<string, unknown> = {}) {
  const events = Array.isArray(current) ? current : []
  events.push(event)
  await prisma.rentInvoice.update({ where: { id: invoiceId }, data: { events: events as any, ...extra } })
}

export interface SendInvoiceOptions {
  /** BR-1d / OQ-6: restrict daily re-issue to email (WhatsApp reserved). */
  emailOnly?: boolean
  /** Label the audit event (e.g. 'reissue') instead of the default 'sent'. */
  reason?: string
}

export async function sendInvoice(invoiceId: string, opts: SendInvoiceOptions = {}): Promise<InvoiceSendOutcome> {
  const inv = await prisma.rentInvoice.findUnique({
    where: { id: invoiceId },
    include: {
      tenant: { select: { name: true, email: true, phone: true } },
      property: { select: { name: true, address: true } },
      lease: { select: { mpesaTill: true, bankDetails: true, unitRef: { select: { unitNumber: true } } } },
      allocations: { where: { target: 'RENT' }, select: { amount: true } },
    },
  })
  if (!inv) return { status: 'skipped', reason: 'invoice not found' }

  const allocatedRent = inv.allocations.reduce((s, a) => s + Number(a.amount), 0)
  const balanceDue = Number(inv.rentAmount) - allocatedRent

  // BR-1a: suppress the send when already fully settled by prepayment/credit.
  if (balanceDue <= 0) {
    await appendEvent(invoiceId, inv.events, { at: new Date().toISOString(), type: 'send_suppressed', reason: 'prepaid' })
    return { status: 'suppressed', reason: 'prepaid' }
  }

  // BR-1b: present the full live arrears position when the tenant is behind.
  const arrears = await computeArrearsSnapshot(inv.leaseId, invoiceId)
  const displayedDue = arrears.hasArrears ? arrears.totalDue : balanceDue

  const html = buildInvoiceHtml(
    {
      invoiceNumber: inv.invoiceNumber,
      period: inv.period,
      dueDate: inv.dueDate,
      rentAmount: inv.rentAmount,
      tenant: { name: inv.tenant.name },
      property: inv.property,
      unitNumber: inv.lease?.unitRef?.unitNumber ?? null,
      lease: inv.lease,
    },
    balanceDue,
    arrears
  )

  const channels: string[] = []
  if (inv.tenant.email) {
    try {
      const ok = await sendEmail({
        to: inv.tenant.email,
        subject: `Rent Invoice - ${inv.period} (INV-${inv.invoiceNumber})`,
        html,
      })
      if (ok) channels.push('email')
    } catch (err) {
      console.error(`[invoice-send] email failed for ${invoiceId}:`, err)
    }
  }
  if (inv.tenant.phone && !opts.emailOnly) {
    try {
      const ok = await sendWhatsApp({
        to: inv.tenant.phone,
        message: `🏠 *Rent Invoice - ${inv.period}*\n\nHi ${inv.tenant.name}, your rent invoice (INV-${inv.invoiceNumber}) is ready.\n\n💰 Amount due: KES ${Number(displayedDue).toLocaleString()}\n📅 Due: ${new Date(inv.dueDate).toLocaleDateString()}\n\nPlease pay by the due date to avoid penalties.`,
      })
      if (ok) channels.push('whatsapp')
    } catch (err) {
      console.error(`[invoice-send] whatsapp failed for ${invoiceId}:`, err)
    }
  }

  await appendEvent(
    invoiceId,
    inv.events,
    { at: new Date().toISOString(), type: 'sent', channels, reason: opts.reason },
    { lastSentAt: new Date() }
  )

  return { status: 'sent', channels, balanceDue }
}

export interface SendInvoicesResult {
  period: string
  sent: number
  suppressed: number
  skipped: number
}

/** BR-1a: send (or suppress) every invoice for a period. */
export async function sendInvoicesForPeriod(period: string): Promise<SendInvoicesResult> {
  const invoices = await prisma.rentInvoice.findMany({ where: { period }, select: { id: true } })
  let sent = 0
  let suppressed = 0
  let skipped = 0
  for (const { id } of invoices) {
    const outcome = await sendInvoice(id)
    if (outcome.status === 'sent') sent++
    else if (outcome.status === 'suppressed') suppressed++
    else skipped++
  }
  return { period, sent, suppressed, skipped }
}

export interface ReissueResult {
  reissued: number
  stopped: number
}

/**
 * BR-1d: while an invoice is in arrears (from Day 6), re-issue it daily with the
 * updated arrears snapshot. Email-only per OQ-6 (WhatsApp reserved for the Day-1
 * invoice, penalty-activation notice and formal notices). Daily sends STOP when:
 * the balance clears, an active promise-to-pay hold is set, or a Notice to
 * Remedy has been issued (Day 21+, comms then controlled by the legal track).
 */
export async function reissueOverdueInvoices(today = new Date()): Promise<ReissueResult> {
  const invoices = await prisma.rentInvoice.findMany({
    where: { status: { in: ['OVERDUE', 'IN_ARREARS'] } },
    select: {
      id: true,
      leaseId: true,
      rentAmount: true,
      allocations: { where: { target: 'RENT' }, select: { amount: true } },
    },
  })

  let reissued = 0
  let stopped = 0
  for (const inv of invoices) {
    const balance = Number(inv.rentAmount) - inv.allocations.reduce((s, a) => s + Number(a.amount), 0)
    if (balance <= 0) {
      stopped++
      continue
    }

    const activeCase = await prisma.arrearsEscalation.findFirst({
      where: { leaseId: inv.leaseId, isActive: true },
      select: { currentStep: true, paymentPromisedDate: true },
    })
    if (activeCase) {
      if (activeCase.currentStep === 'FORMAL_NOTICE' || activeCase.currentStep === 'LEGAL_REFERRAL') {
        stopped++
        continue
      }
      if (activeCase.paymentPromisedDate && new Date(activeCase.paymentPromisedDate) >= startOfToday(today)) {
        stopped++
        continue
      }
    }

    const outcome = await sendInvoice(inv.id, { emailOnly: true, reason: 'reissue' })
    if (outcome.status === 'sent') reissued++
    else stopped++
  }
  return { reissued, stopped }
}

function startOfToday(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
