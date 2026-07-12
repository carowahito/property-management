/**
 * SOP 004 / BR-1b — arrears carry-forward snapshot.
 * Presents current rent + brought-forward unpaid rent (by period) + penalties
 * accrued, with a consistent total and no double-counting.
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/db', () => ({
  prisma: {
    rentInvoice: { findUnique: jest.fn(), findMany: jest.fn() },
    arrearsEscalation: { findFirst: jest.fn() },
  },
}))

import { prisma } from '@/lib/db'
import { computeArrearsSnapshot } from '@/lib/services/arrears-snapshot'

const p = prisma as any

describe('computeArrearsSnapshot (BR-1b)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sums current rent + brought-forward + penalty into a consistent total', async () => {
    p.rentInvoice.findUnique.mockResolvedValue({ period: '2026-02', rentAmount: 50000, allocations: [] })
    p.rentInvoice.findMany.mockResolvedValue([
      { period: '2026-01', rentAmount: 50000, allocations: [{ amount: 20000 }] }, // balance 30000
      { period: '2025-12', rentAmount: 50000, allocations: [{ amount: 50000 }] }, // fully paid → excluded
    ])
    p.arrearsEscalation.findFirst.mockResolvedValue({ penaltyAccrued: 1500 })

    const s = await computeArrearsSnapshot('lease-1', 'inv-2')
    expect(s.currentRent).toBe(50000)
    expect(s.broughtForward).toEqual([{ period: '2026-01', amount: 30000 }])
    expect(s.broughtForwardTotal).toBe(30000)
    expect(s.penaltyAccrued).toBe(1500)
    expect(s.totalDue).toBe(81500)
    expect(s.hasArrears).toBe(true)
  })

  it('reports no arrears when nothing is brought forward and no penalty', async () => {
    p.rentInvoice.findUnique.mockResolvedValue({ period: '2026-02', rentAmount: 50000, allocations: [] })
    p.rentInvoice.findMany.mockResolvedValue([])
    p.arrearsEscalation.findFirst.mockResolvedValue(null)

    const s = await computeArrearsSnapshot('lease-1', 'inv-2')
    expect(s.hasArrears).toBe(false)
    expect(s.totalDue).toBe(50000)
    expect(s.broughtForward).toEqual([])
    expect(s.penaltyAccrued).toBe(0)
  })
})
