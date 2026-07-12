/**
 * SOP 004 edge case 2 / OQ-3 — overpayment held as tenant credit.
 * Credit = unallocated rent-payment remainders, auto-applied to an invoice
 * (oldest payment first), capped at the invoice balance.
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/db', () => ({
  prisma: {
    payment: { findMany: jest.fn() },
    rentInvoice: { findUnique: jest.fn() },
    paymentAllocation: { create: jest.fn() },
  },
}))
jest.mock('@/lib/services/invoice-generator', () => ({ refreshInvoiceStatusFor: jest.fn().mockResolvedValue('PAID') }))

import { prisma } from '@/lib/db'
import { refreshInvoiceStatusFor } from '@/lib/services/invoice-generator'
import { applyCreditToInvoice, availableCredit } from '@/lib/services/tenant-credit'

const p = prisma as any
const mockRefresh = refreshInvoiceStatusFor as jest.Mock

// payment with a given amount and total already-allocated.
function payment(id: string, amount: number, allocated = 0) {
  return { id, amount, allocations: allocated ? [{ amount: allocated }] : [] }
}

describe('availableCredit (OQ-3)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sums unallocated remainders across paid rent payments', async () => {
    p.payment.findMany.mockResolvedValue([
      payment('pay-1', 60000, 50000), // 10000 remainder
      payment('pay-2', 50000, 50000), // fully allocated → 0
      payment('pay-3', 20000, 0), //     20000 remainder
    ])
    expect(await availableCredit('lease-1')).toBe(30000)
  })
})

describe('applyCreditToInvoice (OQ-3)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    p.paymentAllocation.create.mockResolvedValue({ id: 'alloc' })
  })

  it('applies a prepayment remainder to a new invoice and refreshes status', async () => {
    p.rentInvoice.findUnique.mockResolvedValue({ leaseId: 'lease-1', rentAmount: 50000, status: 'ISSUED', allocations: [] })
    p.payment.findMany.mockResolvedValue([payment('pay-1', 60000, 50000)]) // 10000 credit

    const applied = await applyCreditToInvoice('inv-2')
    expect(applied).toBe(10000)
    expect(p.paymentAllocation.create.mock.calls[0][0].data).toMatchObject({ paymentId: 'pay-1', invoiceId: 'inv-2', amount: 10000 })
    expect(mockRefresh).toHaveBeenCalledWith('inv-2')
  })

  it('caps applied credit at the invoice balance', async () => {
    p.rentInvoice.findUnique.mockResolvedValue({ leaseId: 'lease-1', rentAmount: 50000, status: 'ISSUED', allocations: [{ amount: 30000 }] }) // balance 20000
    p.payment.findMany.mockResolvedValue([payment('pay-1', 100000, 0)]) // 100000 credit available

    const applied = await applyCreditToInvoice('inv-2')
    expect(applied).toBe(20000)
    expect(p.paymentAllocation.create.mock.calls[0][0].data.amount).toBe(20000)
  })

  it('does nothing when there is no credit', async () => {
    p.rentInvoice.findUnique.mockResolvedValue({ leaseId: 'lease-1', rentAmount: 50000, status: 'ISSUED', allocations: [] })
    p.payment.findMany.mockResolvedValue([payment('pay-1', 50000, 50000)])

    const applied = await applyCreditToInvoice('inv-2')
    expect(applied).toBe(0)
    expect(p.paymentAllocation.create).not.toHaveBeenCalled()
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('does nothing for an already-paid invoice', async () => {
    p.rentInvoice.findUnique.mockResolvedValue({ leaseId: 'lease-1', rentAmount: 50000, status: 'PAID', allocations: [{ amount: 50000 }] })
    expect(await applyCreditToInvoice('inv-2')).toBe(0)
    expect(p.payment.findMany).not.toHaveBeenCalled()
  })
})
