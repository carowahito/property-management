/**
 * Clearance to Vacate gate (lease clause 8.4): conditions must all be met, with
 * arrears auto-filled from the tenant ledger and keys/meters derived from the
 * inspection checklist (agent confirmations can only force a condition true).
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/db', () => ({
  prisma: {
    inspection: { findFirst: jest.fn() },
    clearanceToVacate: { findUnique: jest.fn() },
    tenantLedger: { findFirst: jest.fn() },
  },
}))

import { prisma } from '@/lib/db'
import { evaluateClearance } from '@/lib/services/clearance'

const p = prisma as any

const met = (state: any, key: string) => state.conditions.find((c: any) => c.key === key)?.met

function setup({
  inspection,
  record = null,
  ledgerBalance = 0,
}: {
  inspection: any
  record?: any
  ledgerBalance?: number
}) {
  p.inspection.findFirst.mockResolvedValue(inspection)
  p.clearanceToVacate.findUnique.mockResolvedValue(record)
  p.tenantLedger.findFirst.mockResolvedValue(ledgerBalance === null ? null : { balance: ledgerBalance })
}

const readyInspection = {
  id: 'i1',
  tenantSignedAt: new Date('2026-07-10'),
  rooms: { _v: 2, keys: [{ returned: 'Yes' }], meters: [{ reading: '1234' }] },
  moveOutQuote: { id: 'q1', tenantApprovedAt: new Date('2026-07-12'), balanceDue: 0 },
}

describe('evaluateClearance', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('is READY when every condition is met', async () => {
    setup({ inspection: readyInspection, ledgerBalance: 0 })
    const state = await evaluateClearance('l1')
    expect(state.ready).toBe(true)
    expect(state.conditions.every((c: any) => c.met)).toBe(true)
  })

  it('blocks and surfaces unmet conditions + arrears', async () => {
    setup({
      inspection: {
        id: 'i1',
        tenantSignedAt: null,
        rooms: { _v: 2, keys: [{ returned: '' }], meters: [] },
        moveOutQuote: { id: 'q1', tenantApprovedAt: null, balanceDue: 500 },
      },
      ledgerBalance: 1000,
    })
    const state = await evaluateClearance('l1')
    expect(state.ready).toBe(false)
    expect(state.arrearsAmount).toBe(1000)
    expect(met(state, 'inspectionApproved')).toBe(false)
    expect(met(state, 'statementApproved')).toBe(false)
    expect(met(state, 'balanceSettled')).toBe(false)
    expect(met(state, 'keysReturned')).toBe(false)
    expect(met(state, 'metersRecorded')).toBe(false)
    expect(met(state, 'rentCleared')).toBe(false)
  })

  it('lets agent confirmations force keys/meters/rent/balance true', async () => {
    setup({
      inspection: {
        id: 'i1',
        tenantSignedAt: new Date('2026-07-10'),
        rooms: { _v: 2, keys: [{ returned: '' }], meters: [] },
        moveOutQuote: { id: 'q1', tenantApprovedAt: new Date('2026-07-12'), balanceDue: 800 },
      },
      record: { keysReturned: true, metersRecorded: true, rentCleared: true, balanceSettled: true },
      ledgerBalance: 1000,
    })
    const state = await evaluateClearance('l1')
    expect(state.ready).toBe(true)
  })

  it('treats a positive ledger balance as unpaid rent', async () => {
    setup({ inspection: readyInspection, ledgerBalance: 250 })
    const state = await evaluateClearance('l1')
    expect(met(state, 'rentCleared')).toBe(false)
    expect(state.arrearsAmount).toBe(250)
  })

  it('is not ready when there is no move-out inspection', async () => {
    setup({ inspection: null })
    const state = await evaluateClearance('l1')
    expect(state.ready).toBe(false)
    expect(state.inspectionId).toBeNull()
  })
})
