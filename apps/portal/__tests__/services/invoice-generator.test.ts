/**
 * SOP 004 / BR-1 — rent invoice generation & lifecycle.
 * Covers status derivation (incl. the Day-6 overdue flip), generation
 * idempotency (one invoice per lease+period), and the daily status refresh.
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/db', () => ({
  prisma: {
    lease: { findMany: jest.fn() },
    rentInvoice: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    paymentAllocation: { aggregate: jest.fn() },
  },
}))

import { prisma } from '@/lib/db'
import {
  deriveInvoiceStatus,
  currentPeriod,
  generateInvoicesForPeriod,
  refreshInvoiceStatuses,
} from '@/lib/services/invoice-generator'

const p = prisma as any

const base = {
  rentAmount: 50000,
  gracePeriodDays: 5,
  dueDate: new Date('2026-01-01'),
  currentStatus: 'ISSUED',
}

describe('deriveInvoiceStatus (BR-1)', () => {
  it('is PAID when fully allocated, regardless of date', () => {
    expect(deriveInvoiceStatus(base, 50000, new Date('2026-02-01'))).toBe('PAID')
  })

  it('stays ISSUED within the grace period when unpaid', () => {
    expect(deriveInvoiceStatus(base, 0, new Date('2026-01-03'))).toBe('ISSUED')
  })

  it('is PARTIALLY_PAID within grace when part-allocated', () => {
    expect(deriveInvoiceStatus(base, 20000, new Date('2026-01-03'))).toBe('PARTIALLY_PAID')
  })

  it('flips to OVERDUE only after grace lapses (Day 6 boundary)', () => {
    // due 1 Jan + 5 grace → threshold 6 Jan. Not overdue on/at the 6th…
    expect(deriveInvoiceStatus(base, 0, new Date('2026-01-06'))).toBe('ISSUED')
    // …overdue from the 7th.
    expect(deriveInvoiceStatus(base, 0, new Date('2026-01-07'))).toBe('OVERDUE')
  })

  it('never overrides frozen statuses', () => {
    expect(deriveInvoiceStatus({ ...base, currentStatus: 'WRITTEN_OFF' }, 0, new Date('2026-03-01'))).toBe('WRITTEN_OFF')
    expect(deriveInvoiceStatus({ ...base, currentStatus: 'LEGAL_REFERRAL' }, 0, new Date('2026-03-01'))).toBe('LEGAL_REFERRAL')
  })
})

describe('currentPeriod', () => {
  it('formats as YYYY-MM', () => {
    expect(currentPeriod(new Date('2026-07-09'))).toBe('2026-07')
    expect(currentPeriod(new Date('2026-12-31'))).toBe('2026-12')
  })
})

describe('generateInvoicesForPeriod (idempotency)', () => {
  const lease = {
    id: 'lease-1', tenantId: 'ten-1', propertyId: 'prop-1', unitId: 'unit-1',
    monthlyRent: 50000, rentDueDay: 1, gracePeriodDays: 5,
    startDate: new Date('2025-01-01'), property: { companyId: 'co-1' },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    p.lease.findMany.mockResolvedValue([lease])
    p.rentInvoice.create.mockResolvedValue({ id: 'inv-1' })
  })

  it('creates an invoice when none exists for the period', async () => {
    p.rentInvoice.findUnique.mockResolvedValue(null)
    const res = await generateInvoicesForPeriod('2026-02')
    expect(res).toMatchObject({ period: '2026-02', created: 1, existing: 0 })
    expect(p.rentInvoice.create).toHaveBeenCalledTimes(1)
    const data = p.rentInvoice.create.mock.calls[0][0].data
    expect(data).toMatchObject({ leaseId: 'lease-1', period: '2026-02', rentAmount: 50000, gracePeriodDays: 5, status: 'ISSUED' })
  })

  it('does not duplicate when an invoice already exists', async () => {
    p.rentInvoice.findUnique.mockResolvedValue({ id: 'inv-existing' })
    const res = await generateInvoicesForPeriod('2026-02')
    expect(res).toMatchObject({ created: 0, existing: 1 })
    expect(p.rentInvoice.create).not.toHaveBeenCalled()
  })

  it('skips a lease that started after the period', async () => {
    p.lease.findMany.mockResolvedValue([{ ...lease, startDate: new Date('2026-06-01') }])
    p.rentInvoice.findUnique.mockResolvedValue(null)
    const res = await generateInvoicesForPeriod('2026-02')
    expect(res.created).toBe(0)
    expect(p.rentInvoice.create).not.toHaveBeenCalled()
  })
})

describe('refreshInvoiceStatuses (BR-1)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('flips an unpaid past-grace invoice to OVERDUE', async () => {
    p.rentInvoice.findMany.mockResolvedValue([
      { id: 'inv-1', rentAmount: 50000, gracePeriodDays: 5, dueDate: new Date('2026-01-01'), status: 'ISSUED', allocations: [] },
    ])
    p.rentInvoice.update.mockResolvedValue({})
    const res = await refreshInvoiceStatuses(new Date('2026-01-20'))
    expect(res.updated).toBe(1)
    expect(p.rentInvoice.update.mock.calls[0][0].data.status).toBe('OVERDUE')
  })

  it('leaves an unchanged status alone', async () => {
    p.rentInvoice.findMany.mockResolvedValue([
      { id: 'inv-1', rentAmount: 50000, gracePeriodDays: 5, dueDate: new Date('2026-01-01'), status: 'ISSUED', allocations: [] },
    ])
    const res = await refreshInvoiceStatuses(new Date('2026-01-03'))
    expect(res.updated).toBe(0)
    expect(p.rentInvoice.update).not.toHaveBeenCalled()
  })
})
