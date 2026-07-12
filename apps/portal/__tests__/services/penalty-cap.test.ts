/**
 * SOP 004 / OQ-4 — configurable penalty cap.
 * Late penalty accrues daily but never exceeds the configured cap.
 */

import { describe, it, expect } from '@jest/globals'

jest.mock('@/lib/db', () => ({ prisma: {} }))

import { penaltyAccruedFor } from '@/lib/services/arrears-scan'

describe('penaltyAccruedFor (OQ-4)', () => {
  it('accrues daily when uncapped', () => {
    expect(penaltyAccruedFor(10, 500, null)).toBe(5000)
    expect(penaltyAccruedFor(10, 500, undefined)).toBe(5000)
  })

  it('returns the raw amount while below the cap', () => {
    expect(penaltyAccruedFor(10, 500, 50000)).toBe(5000)
  })

  it('caps the penalty once the cap is reached', () => {
    // 200 days × 500 = 100000, capped at one month's rent (50000).
    expect(penaltyAccruedFor(200, 500, 50000)).toBe(50000)
  })

  it('treats a zero/negative cap as uncapped', () => {
    expect(penaltyAccruedFor(10, 500, 0)).toBe(5000)
  })

  it('never goes negative', () => {
    expect(penaltyAccruedFor(-3, 500, null)).toBe(0)
  })
})
