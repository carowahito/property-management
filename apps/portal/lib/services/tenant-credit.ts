import { prisma } from '@/lib/db'
import { refreshInvoiceStatusFor } from '@/lib/services/invoice-generator'

// ============================================================================
// Tenant credit (SOP 004 edge case 2 / OQ-3)
// Overpayment / prepayment is held as tenant credit and auto-applied to the
// next invoice — not refunded. Credit is not a stored balance: it is derived as
// the pool of unallocated rent-payment remainders (payment.amount − amounts
// already allocated to invoices). Applying credit creates PaymentAllocation
// rows from those payments onto the invoice, so the ledger stays consistent.
// ============================================================================

function remainderOf(payment: { amount: any; allocations: { amount: any }[] }): number {
  const allocated = payment.allocations.reduce((s, a) => s + Number(a.amount), 0)
  return Number(payment.amount) - allocated
}

/** Total unapplied credit available on a lease. */
export async function availableCredit(leaseId: string): Promise<number> {
  const payments = await prisma.payment.findMany({
    where: { leaseId, type: 'RENT', status: 'PAID' },
    select: { amount: true, allocations: { select: { amount: true } } },
  })
  return payments.reduce((s, p) => s + Math.max(0, remainderOf(p)), 0)
}

/**
 * Apply available tenant credit (unallocated rent-payment remainders, oldest
 * first) to a single invoice, up to its outstanding balance. Returns the amount
 * applied. Refreshes the invoice status if anything was applied.
 */
export async function applyCreditToInvoice(invoiceId: string): Promise<number> {
  const inv = await prisma.rentInvoice.findUnique({
    where: { id: invoiceId },
    select: {
      leaseId: true,
      rentAmount: true,
      status: true,
      allocations: { where: { target: 'RENT' }, select: { amount: true } },
    },
  })
  if (!inv || inv.status === 'PAID' || inv.status === 'WRITTEN_OFF') return 0

  let balance = Number(inv.rentAmount) - inv.allocations.reduce((s, a) => s + Number(a.amount), 0)
  if (balance <= 0) return 0

  const payments = await prisma.payment.findMany({
    where: { leaseId: inv.leaseId, type: 'RENT', status: 'PAID' },
    orderBy: [{ paidDate: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, amount: true, allocations: { select: { amount: true } } },
  })

  let applied = 0
  let order = 0
  for (const pay of payments) {
    if (balance <= 0) break
    const remainder = remainderOf(pay)
    if (remainder <= 0) continue

    const amt = Math.min(remainder, balance)
    await prisma.paymentAllocation.create({
      data: { paymentId: pay.id, invoiceId, target: 'RENT', amount: amt, allocationOrder: order++ },
    })
    balance -= amt
    applied += amt
  }

  if (applied > 0) await refreshInvoiceStatusFor(invoiceId)
  return applied
}
