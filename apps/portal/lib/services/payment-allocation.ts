import { prisma } from '@/lib/db'
import { refreshInvoiceStatusFor } from '@/lib/services/invoice-generator'

// ============================================================================
// Payment → invoice allocation (SOP 004 §4.4)
// Allocates a rent payment across the tenant's unpaid invoices, oldest first.
// This is OQ-1's default policy: clear oldest rent first (penalties, which are
// separate LATE_FEE payments / agent income, are handled elsewhere and are not
// touched here). Idempotent and best-effort.
// ============================================================================

export interface AllocationResult {
  allocated: number
  leftover: number
  invoicesTouched: string[]
}

const NIL: AllocationResult = { allocated: 0, leftover: 0, invoicesTouched: [] }

/**
 * Allocate a RENT payment to the lease's unpaid invoices, oldest first.
 * Only acts on paid rent payments. Never throws — returns what it did so the
 * caller can log it without risking the payment write.
 */
export async function allocatePaymentToInvoices(paymentId: string): Promise<AllocationResult> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { id: true, amount: true, type: true, status: true, leaseId: true },
    })
    if (!payment) return NIL
    // Only paid rent payments allocate to rent invoices.
    if (payment.type !== 'RENT' || payment.status !== 'PAID' || !payment.leaseId) return NIL

    // Idempotency: if this payment was already allocated, do nothing.
    const already = await prisma.paymentAllocation.count({ where: { paymentId } })
    if (already > 0) return NIL

    // Unpaid invoices for the lease, oldest first (OQ-1).
    const invoices = await prisma.rentInvoice.findMany({
      where: { leaseId: payment.leaseId, status: { notIn: ['PAID', 'WRITTEN_OFF'] } },
      orderBy: [{ dueDate: 'asc' }, { period: 'asc' }],
      select: {
        id: true,
        rentAmount: true,
        allocations: { where: { target: 'RENT' }, select: { amount: true } },
      },
    })

    let remaining = Number(payment.amount)
    let allocatedTotal = 0
    let order = 0
    const invoicesTouched: string[] = []

    for (const inv of invoices) {
      if (remaining <= 0) break
      const allocatedRent = inv.allocations.reduce((s, a) => s + Number(a.amount), 0)
      const balance = Number(inv.rentAmount) - allocatedRent
      if (balance <= 0) continue

      const applied = Math.min(balance, remaining)
      await prisma.paymentAllocation.create({
        data: {
          paymentId,
          invoiceId: inv.id,
          target: 'RENT',
          amount: applied,
          allocationOrder: order++,
        },
      })
      remaining -= applied
      allocatedTotal += applied
      invoicesTouched.push(inv.id)
      await refreshInvoiceStatusFor(inv.id)
    }

    // OQ-3: `remaining` is overpayment / prepayment. It stays as an unallocated
    // remainder on the payment and is held as tenant credit — auto-applied to
    // the next invoice at generation time (see tenant-credit.applyCreditToInvoice).
    return { allocated: allocatedTotal, leftover: remaining, invoicesTouched }
  } catch (err) {
    console.error(`[allocation] failed for payment ${paymentId}:`, err)
    return NIL
  }
}
