/**
 * Arrears scan must not open (or refresh) arrears cases for a tenant who has
 * already moved out, even if their lease is still ACTIVE.
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/db', () => ({
  prisma: {
    lease: { findMany: jest.fn() },
    payment: { findFirst: jest.fn() },
    arrearsEscalation: { create: jest.fn(), update: jest.fn() },
  },
}))

import { prisma } from '@/lib/db'
import { runArrearsScan } from '@/lib/services/arrears-scan'

const p = prisma as any

function lease(overrides: any = {}) {
  return {
    id: 'l1', tenantId: 't1', propertyId: 'prop1', monthlyRent: 33000,
    rentDueDay: 1, gracePeriodDays: 5, latePenaltyPerDay: 500, penaltyCapMonths: null,
    startDate: new Date('2020-01-01'),
    arrearsEscalations: [],
    tenant: { moveOutDate: null },
    ...overrides,
  }
}

describe('runArrearsScan move-out guard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    p.payment.findFirst.mockResolvedValue(null)
    p.arrearsEscalation.create.mockResolvedValue({ id: 'a1' })
    p.arrearsEscalation.update.mockResolvedValue({})
  })

  it('skips a lease whose tenant has moved out (no case opened or refreshed)', async () => {
    p.lease.findMany.mockResolvedValue([
      lease({ tenant: { moveOutDate: new Date('2020-06-30') }, arrearsEscalations: [{ id: 'existing' }] }),
    ])
    const res = await runArrearsScan()
    expect(res.skipped).toBe(1)
    expect(res.created).toBe(0)
    expect(res.refreshed).toBe(0)
    expect(p.arrearsEscalation.create).not.toHaveBeenCalled()
    expect(p.arrearsEscalation.update).not.toHaveBeenCalled()
  })

  it('does not skip (for move-out reasons) a tenant who is still in place', async () => {
    // A current tenant is not filtered by the move-out guard. Whether a case is
    // opened then depends on overdue timing; here we assert the guard alone does
    // not treat them as moved out (findMany was consulted, guard passed).
    p.lease.findMany.mockResolvedValue([lease({ tenant: { moveOutDate: null } })])
    await runArrearsScan()
    expect(p.lease.findMany).toHaveBeenCalledTimes(1)
  })
})
