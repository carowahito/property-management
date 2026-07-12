import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/services/email'
import { sendWhatsApp } from '@/lib/services/whatsapp'
import { buildInvoiceHtml } from '@/lib/services/invoice-document'

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

export async function sendInvoice(invoiceId: string): Promise<InvoiceSendOutcome> {
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
    balanceDue
  )

  const channels: string[] = []
  if (inv.tenant.email) {
    try {
      const ok = await sendEmail({
        to: inv.tenant.email,
        subject: `Rent Invoice — ${inv.period} (INV-${inv.invoiceNumber})`,
        html,
      })
      if (ok) channels.push('email')
    } catch (err) {
      console.error(`[invoice-send] email failed for ${invoiceId}:`, err)
    }
  }
  if (inv.tenant.phone) {
    try {
      const ok = await sendWhatsApp({
        to: inv.tenant.phone,
        message: `🏠 *Rent Invoice — ${inv.period}*\n\nHi ${inv.tenant.name}, your rent invoice (INV-${inv.invoiceNumber}) is ready.\n\n💰 Amount due: KES ${Number(balanceDue).toLocaleString()}\n📅 Due: ${new Date(inv.dueDate).toLocaleDateString()}\n\nPlease pay by the due date to avoid penalties.`,
      })
      if (ok) channels.push('whatsapp')
    } catch (err) {
      console.error(`[invoice-send] whatsapp failed for ${invoiceId}:`, err)
    }
  }

  await appendEvent(
    invoiceId,
    inv.events,
    { at: new Date().toISOString(), type: 'sent', channels },
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
