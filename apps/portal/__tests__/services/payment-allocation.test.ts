/**
 * SOP 004 §4.4 / OQ-1 — payment → invoice allocation.
 * A rent payment clears the oldest unpaid invoices first; balances and statuses
 * follow. Allocation is idempotent and only acts on paid rent payments.
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/db', () => ({
  prisma: {
    payment: { findUnique: jest.fn() },
    paymentAllocation: { count: jest.fn(), create: jest.fn() },
    rentInvoice: { findMany: jest.fn() },
  },
}))
// Stub the status refresh — asserted separately in invoice-generator tests.
jest.mock('@/lib/services/invoice-generator', () => ({
  refreshInvoiceStatusFor: jest.fn().mockResolvedValue('PAID'),
}))

import { prisma } from '@/lib/db'
import { allocatePaymentToInvoices } from '@/lib/services/payment-allocation'

const p = prisma as any

function invoice(id: string, rentAmount: number, allocated = 0) {
  return { id, rentAmount, allocations: allocated ? [{ amount: allocated }] : [] }
}

describe('allocatePaymentToInvoices (OQ-1: oldest first)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    p.paymentAllocation.count.mockResolvedValue(0)
    p.paymentAllocation.create.mockResolvedValue({ id: 'alloc' })
  })

  it('fully clears a single invoice', async () => {
    p.payment.findUnique.mockResolvedValue({ id: 'pay-1', amount: 50000, type: 'RENT', status: 'PAID', leaseId: 'lease-1' })
    p.rentInvoice.findMany.mockResolvedValue([invoice('inv-1', 50000)])

    const res = await allocatePaymentToInvoices('pay-1')
    expect(res).toEqual({ allocated: 50000, leftover: 0, invoicesTouched: ['inv-1'] })
    expect(p.paymentAllocation.create).toHaveBeenCalledTimes(1)
    expect(p.paymentAllocation.create.mock.calls[0][0].data).toMatchObject({
      paymentId: 'pay-1', invoiceId: 'inv-1', target: 'RENT', amount: 50000, allocationOrder: 0,
    })
  })

  it('applies a partial payment to the oldest invoice only', async () => {
    p.payment.findUnique.mockResolvedValue({ id: 'pay-1', amount: 20000, type: 'RENT', status: 'PAID', leaseId: 'lease-1' })
    p.rentInvoice.findMany.mockResolvedValue([invoice('inv-1', 50000), invoice('inv-2', 50000)])

    const res = await allocatePaymentToInvoices('pay-1')
    expect(res.allocated).toBe(20000)
    expect(res.leftover).toBe(0)
    expect(p.paymentAllocation.create).toHaveBeenCalledTimes(1)
    expect(p.paymentAllocation.create.mock.calls[0][0].data.amount).toBe(20000)
  })

  it('spreads a payment across invoices oldest-first, respecting each balance', async () => {
    // 70k pays off inv-1 (50k) then part of inv-2 (20k of 50k).
    p.payment.findUnique.mockResolvedValue({ id: 'pay-1', amount: 70000, type: 'RENT', status: 'PAID', leaseId: 'lease-1' })
    p.rentInvoice.findMany.mockResolvedValue([invoice('inv-1', 50000), invoice('inv-2', 50000)])

    const res = await allocatePaymentToInvoices('pay-1')
    expect(res.allocated).toBe(70000)
    expect(res.leftover).toBe(0)
    expect(res.invoicesTouched).toEqual(['inv-1', 'inv-2'])
    const calls = p.paymentAllocation.create.mock.calls.map((c: any) => c[0].data)
    expect(calls[0]).toMatchObject({ invoiceId: 'inv-1', amount: 50000, allocationOrder: 0 })
    expect(calls[1]).toMatchObject({ invoiceId: 'inv-2', amount: 20000, allocationOrder: 1 })
  })

  it('returns leftover for an overpayment', async () => {
    p.payment.findUnique.mockResolvedValue({ id: 'pay-1', amount: 60000, type: 'RENT', status: 'PAID', leaseId: 'lease-1' })
    p.rentInvoice.findMany.mockResolvedValue([invoice('inv-1', 50000)])

    const res = await allocatePaymentToInvoices('pay-1')
    expect(res.allocated).toBe(50000)
    expect(res.leftover).toBe(10000)
  })

  it('skips an invoice already fully allocated', async () => {
    p.payment.findUnique.mockResolvedValue({ id: 'pay-1', amount: 50000, type: 'RENT', status: 'PAID', leaseId: 'lease-1' })
    p.rentInvoice.findMany.mockResolvedValue([invoice('inv-1', 50000, 50000), invoice('inv-2', 50000)])

    const res = await allocatePaymentToInvoices('pay-1')
    expect(res.invoicesTouched).toEqual(['inv-2'])
    expect(p.paymentAllocation.create.mock.calls[0][0].data.invoiceId).toBe('inv-2')
  })

  it('is idempotent — does nothing if the payment was already allocated', async () => {
    p.payment.findUnique.mockResolvedValue({ id: 'pay-1', amount: 50000, type: 'RENT', status: 'PAID', leaseId: 'lease-1' })
    p.paymentAllocation.count.mockResolvedValue(1)

    const res = await allocatePaymentToInvoices('pay-1')
    expect(res.allocated).toBe(0)
    expect(p.paymentAllocation.create).not.toHaveBeenCalled()
    expect(p.rentInvoice.findMany).not.toHaveBeenCalled()
  })

  it('ignores non-rent or unpaid payments', async () => {
    p.payment.findUnique.mockResolvedValue({ id: 'pay-1', amount: 5000, type: 'LATE_FEE', status: 'PAID', leaseId: 'lease-1' })
    expect((await allocatePaymentToInvoices('pay-1')).allocated).toBe(0)

    p.payment.findUnique.mockResolvedValue({ id: 'pay-2', amount: 5000, type: 'RENT', status: 'PENDING', leaseId: 'lease-1' })
    expect((await allocatePaymentToInvoices('pay-2')).allocated).toBe(0)

    expect(p.paymentAllocation.create).not.toHaveBeenCalled()
  })
})
