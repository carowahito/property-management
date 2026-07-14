/**
 * Move-Out Statement of Repair Costs: draft extraction from inspection findings,
 * total recomputation, and deposit reconciliation (capped at the deposit held).
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/db', () => ({
  prisma: {
    moveOutQuote: { findUnique: jest.fn(), update: jest.fn() },
    moveOutQuoteLine: { update: jest.fn() },
    deposit: { update: jest.fn() },
  },
}))

import { prisma } from '@/lib/db'
import {
  draftLinesFromInspection,
  quoteValidUntil,
  recomputeTotals,
  reconcileDepositForQuote,
  MOVE_OUT_QUOTE_VALIDITY_DAYS,
} from '@/lib/services/move-out-quote'

const p = prisma as any

// ── draftLinesFromInspection ──────────────────────────────────────────────────

describe('draftLinesFromInspection', () => {
  it('returns [] for a legacy (v1 array) inspection', () => {
    expect(draftLinesFromInspection({ rooms: [{ room: 'Kitchen', condition: 'POOR' }] })).toEqual([])
  })

  it('excludes good/OK items and includes remedial ones', () => {
    const lines = draftLinesFromInspection({
      rooms: {
        _v: 2,
        items: [
          { section: '3.1', item: 'Main door', condition: 'G', action: 'OK', comments: '' },
          { section: '3.3', item: 'Cooker', condition: 'D', action: 'RP', comments: 'burnt', photos: ['img'] },
          { section: '3.2', item: 'Carpet', condition: 'F', action: 'CL', comments: '' },
          { section: '3.4', item: 'Curtain rail', condition: 'M', action: '', comments: '' },
        ],
      },
    })
    expect(lines.map((l) => l.description)).toEqual(['Cooker: burnt', 'Carpet', 'Curtain rail'])
  })

  it('maps action/condition codes to action + responsibility defaults', () => {
    const lines = draftLinesFromInspection({
      rooms: {
        _v: 2,
        items: [
          { section: 'a', item: 'Damaged', condition: 'D', action: 'RP' },   // damage → tenant, repair
          { section: 'a', item: 'Missing', condition: 'M', action: '' },      // missing → tenant, replace
          { section: 'a', item: 'Dirty', condition: 'F', action: 'CL' },      // clean → tenant, clean
          { section: 'a', item: 'Worn', condition: 'F', action: 'RP' },       // plain repair → landlord
          { section: 'a', item: 'Charge', condition: 'G', action: 'TC' },     // tenant charge → tenant
        ],
      },
    })
    const by = (d: string) => lines.find((l) => l.description === d)!
    expect(by('Damaged')).toMatchObject({ action: 'REPAIR', responsibility: 'TENANT' })
    expect(by('Missing')).toMatchObject({ action: 'REPLACE', responsibility: 'TENANT' })
    expect(by('Dirty')).toMatchObject({ action: 'CLEAN', responsibility: 'TENANT' })
    expect(by('Worn')).toMatchObject({ action: 'REPAIR', responsibility: 'LANDLORD' })
    expect(by('Charge')).toMatchObject({ responsibility: 'TENANT' })
  })

  it('expands matrix cells (only D/M columns) with column labels', () => {
    const lines = draftLinesFromInspection({
      rooms: {
        _v: 2,
        bedroomMatrix: [{ item: 'Wardrobe', cond: ['G', 'D', 'M'], comments: 'doors' }],
      },
    })
    expect(lines.map((l) => l.description)).toEqual([
      'Wardrobe (Bed 2): doors',
      'Wardrobe (Bed 3): doors',
    ])
    expect(lines[0]).toMatchObject({ action: 'REPAIR', room: 'Bedrooms' })
    expect(lines[1]).toMatchObject({ action: 'REPLACE' })
  })

  it('honours explicit defect responsibility and includes maintenance items', () => {
    const lines = draftLinesFromInspection({
      rooms: {
        _v: 2,
        defects: [
          { item: 'Latch', responsibility: 'TENANT', notes: 'lounge' },
          { item: 'Boiler', responsibility: 'LANDLORD', notes: '' },
        ],
      },
      maintenanceItems: [{ description: 'Repaint hallway', priority: 'MEDIUM', room: 'Hallway' }],
    })
    expect(lines.find((l) => l.description === 'Latch: lounge')).toMatchObject({ responsibility: 'TENANT' })
    expect(lines.find((l) => l.description === 'Boiler')).toMatchObject({ responsibility: 'LANDLORD' })
    expect(lines.find((l) => l.description === 'Repaint hallway')).toMatchObject({ responsibility: 'LANDLORD', room: 'Hallway' })
  })
})

// ── quoteValidUntil ───────────────────────────────────────────────────────────

describe('quoteValidUntil', () => {
  it('is exactly issuedAt + 3 days', () => {
    expect(MOVE_OUT_QUOTE_VALIDITY_DAYS).toBe(3)
    const issued = new Date('2026-07-14T09:00:00Z')
    expect(quoteValidUntil(issued).toISOString()).toBe('2026-07-17T09:00:00.000Z')
  })
})

// ── recomputeTotals ───────────────────────────────────────────────────────────

describe('recomputeTotals', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    p.moveOutQuoteLine.update.mockResolvedValue({})
    p.moveOutQuote.update.mockResolvedValue({})
  })

  it('computes per-line totals, tenant/landlord split, balance and refund', async () => {
    p.moveOutQuote.findUnique.mockResolvedValue({
      depositHeld: 5000,
      lines: [
        { id: 'L1', responsibility: 'TENANT', unitCost: 1000, quantity: 2, lineTotal: 0, tenantCharge: 0 },
        { id: 'L2', responsibility: 'LANDLORD', unitCost: 500, quantity: 1, lineTotal: 0, tenantCharge: 0 },
        { id: 'L3', responsibility: 'SHARED', unitCost: 1000, quantity: 1, lineTotal: 0, tenantCharge: 400 },
      ],
    })

    await recomputeTotals('q1')

    const data = p.moveOutQuote.update.mock.calls[0][0].data
    expect(data).toEqual({
      totalTenantCharge: 2400, // 2000 (TENANT) + 0 (LANDLORD) + 400 (SHARED)
      totalLandlordCost: 1100, // 3500 total line - 2400 tenant
      balanceDue: 0,
      refundDue: 2600,
    })
  })

  it('reports a positive balance when charges exceed the deposit', async () => {
    p.moveOutQuote.findUnique.mockResolvedValue({
      depositHeld: 1000,
      lines: [{ id: 'L1', responsibility: 'TENANT', unitCost: 3000, quantity: 1, lineTotal: 0, tenantCharge: 0 }],
    })
    await recomputeTotals('q1')
    const data = p.moveOutQuote.update.mock.calls[0][0].data
    expect(data.balanceDue).toBe(2000)
    expect(data.refundDue).toBe(0)
  })
})

// ── reconcileDepositForQuote ──────────────────────────────────────────────────

describe('reconcileDepositForQuote', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    p.deposit.update.mockResolvedValue({})
  })

  it('is a no-op when there is no linked deposit', async () => {
    p.moveOutQuote.findUnique.mockResolvedValue({ depositId: null, depositHeld: 0, lines: [] })
    await reconcileDepositForQuote('q1')
    expect(p.deposit.update).not.toHaveBeenCalled()
  })

  it('caps deductions at the deposit held and forfeits when fully consumed', async () => {
    p.moveOutQuote.findUnique.mockResolvedValue({
      depositId: 'd1',
      depositHeld: 3000,
      lines: [
        { tenantCharge: 2000, room: 'Kitchen', description: 'Cooker', evidenceUrl: 'u1' },
        { tenantCharge: 2000, room: null, description: 'Wall', evidenceUrl: null },
      ],
    })
    await reconcileDepositForQuote('q1')
    const data = p.deposit.update.mock.calls[0][0].data
    expect(data.deductions).toEqual([
      { description: 'Kitchen - Cooker', amount: 2000, evidenceUrl: 'u1' },
      { description: 'Wall', amount: 1000 },
    ])
    expect(data.refundAmount).toBe(0)
    expect(data.status).toBe('FORFEITED')
  })

  it('partially refunds when charges are below the deposit', async () => {
    p.moveOutQuote.findUnique.mockResolvedValue({
      depositId: 'd1',
      depositHeld: 5000,
      lines: [{ tenantCharge: 2000, room: null, description: 'Paint', evidenceUrl: null }],
    })
    await reconcileDepositForQuote('q1')
    const data = p.deposit.update.mock.calls[0][0].data
    expect(data.refundAmount).toBe(3000)
    expect(data.status).toBe('PARTIALLY_REFUNDED')
  })

  it('fully refunds when there are no tenant charges', async () => {
    p.moveOutQuote.findUnique.mockResolvedValue({
      depositId: 'd1',
      depositHeld: 5000,
      lines: [{ tenantCharge: 0, room: null, description: 'Landlord repair', evidenceUrl: null }],
    })
    await reconcileDepositForQuote('q1')
    const data = p.deposit.update.mock.calls[0][0].data
    expect(data.deductions).toEqual([])
    expect(data.refundAmount).toBe(5000)
    expect(data.status).toBe('REFUNDED')
  })
})
