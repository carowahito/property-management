/**
 * Move-out guards: former tenants must not be chased or billed for periods
 * after they moved out.
 */

import { describe, it, expect } from '@jest/globals'
import { hasMovedOutBy, movedOutBeforePeriodMonth } from '@/lib/services/move-out'

describe('hasMovedOutBy', () => {
  const today = new Date('2026-07-14')
  it('is false when there is no move-out date', () => {
    expect(hasMovedOutBy(null, today)).toBe(false)
    expect(hasMovedOutBy(undefined, today)).toBe(false)
  })
  it('is true when the tenant moved out before today', () => {
    expect(hasMovedOutBy(new Date('2026-05-31'), today)).toBe(true)
  })
  it('is false when the move-out is in the future', () => {
    expect(hasMovedOutBy(new Date('2026-08-01'), today)).toBe(false)
  })
})

describe('movedOutBeforePeriodMonth', () => {
  // Tenant moved out 31 May 2026.
  const moveOut = new Date('2026-05-31')
  it('is false when there is no move-out date', () => {
    expect(movedOutBeforePeriodMonth(null, 2026, 7)).toBe(false)
  })
  it('still bills the move-out month itself', () => {
    expect(movedOutBeforePeriodMonth(moveOut, 2026, 5)).toBe(false)
  })
  it('skips periods after the move-out month', () => {
    expect(movedOutBeforePeriodMonth(moveOut, 2026, 6)).toBe(true)
    expect(movedOutBeforePeriodMonth(moveOut, 2026, 7)).toBe(true)
  })
  it('still bills periods before the move-out month', () => {
    expect(movedOutBeforePeriodMonth(moveOut, 2026, 4)).toBe(false)
  })
})
