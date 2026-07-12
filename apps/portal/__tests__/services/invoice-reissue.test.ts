/**
 * SOP 004 — BR-1c (Day-5 penalty activation notice) and BR-1d (daily re-issue
 * while in arrears, email-only, with stop conditions).
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/db', () => ({
  prisma: {
    rentInvoice: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    arrearsEscalation: { findFirst: jest.fn() },
  },
}))
jest.mock('@/lib/services/email', () => ({ sendEmail: jest.fn().mockResolvedValue(true) }))
jest.mock('@/lib/services/whatsapp', () => ({ sendWhatsApp: jest.fn().mockResolvedValue(true) }))
jest.mock('@/lib/services/arrears-snapshot', () => ({
  computeArrearsSnapshot: jest.fn().mockResolvedValue({
    currentRent: 50000, broughtForward: [], broughtForwardTotal: 0, penaltyAccrued: 0, totalDue: 50000, hasArrears: false,
  }),
}))

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/services/email'
import { sendWhatsApp } from '@/lib/services/whatsapp'
import { sendPenaltyActivationNotices } from '@/lib/services/penalty-activation'
import { reissueOverdueInvoices } from '@/lib/services/invoice-send'

const p = prisma as any
const mockEmail = sendEmail as jest.Mock
const mockWa = sendWhatsApp as jest.Mock

describe('sendPenaltyActivationNotices (BR-1c)', () => {
  const invoice = {
    id: 'inv-1', period: '2026-02', dueDate: new Date('2026-02-01'), gracePeriodDays: 5,
    rentAmount: 50000, events: null,
    tenant: { name: 'Tenant', email: 't@x.com', phone: '+254700000000' },
    lease: { latePenaltyPerDay: 500, mpesaTill: 'Till 1', bankDetails: null, unitRef: { unitNumber: 'A1' } },
    allocations: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    p.rentInvoice.update.mockResolvedValue({})
  })

  it('sends on the last grace day and logs a penalty_activation event', async () => {
    p.rentInvoice.findMany.mockResolvedValue([invoice])
    // due 1 Feb + grace 5 → last grace day 5 Feb.
    const res = await sendPenaltyActivationNotices(new Date('2026-02-05'))
    expect(res.notified).toBe(1)
    expect(mockEmail).toHaveBeenCalledTimes(1)
    expect(p.rentInvoice.update.mock.calls[0][0].data.events[0]).toMatchObject({ type: 'penalty_activation' })
  })

  it('does not send before the last grace day', async () => {
    p.rentInvoice.findMany.mockResolvedValue([invoice])
    const res = await sendPenaltyActivationNotices(new Date('2026-02-03'))
    expect(res.notified).toBe(0)
    expect(mockEmail).not.toHaveBeenCalled()
  })

  it('skips an already-paid invoice', async () => {
    p.rentInvoice.findMany.mockResolvedValue([{ ...invoice, allocations: [{ amount: 50000 }] }])
    const res = await sendPenaltyActivationNotices(new Date('2026-02-05'))
    expect(res.notified).toBe(0)
  })
})

describe('reissueOverdueInvoices (BR-1d)', () => {
  const overdue = { id: 'inv-1', leaseId: 'lease-1', rentAmount: 50000, allocations: [] }
  // Full invoice for the sendInvoice() path.
  const full = {
    id: 'inv-1', leaseId: 'lease-1', invoiceNumber: 7, period: '2026-01',
    dueDate: new Date('2026-01-01'), rentAmount: 50000, events: null,
    tenant: { name: 'Tenant', email: 't@x.com', phone: '+254700000000' },
    property: { name: 'P', address: 'A' },
    lease: { mpesaTill: 'Till 1', bankDetails: null, unitRef: { unitNumber: 'A1' } },
    allocations: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    p.rentInvoice.update.mockResolvedValue({})
    p.rentInvoice.findUnique.mockResolvedValue(full)
    mockEmail.mockResolvedValue(true)
  })

  it('re-issues an overdue invoice email-only (no WhatsApp)', async () => {
    p.rentInvoice.findMany.mockResolvedValue([overdue])
    p.arrearsEscalation.findFirst.mockResolvedValue(null)

    const res = await reissueOverdueInvoices(new Date('2026-01-20'))
    expect(res.reissued).toBe(1)
    expect(mockEmail).toHaveBeenCalledTimes(1)
    expect(mockWa).not.toHaveBeenCalled()
    // logged as a re-issue send.
    expect(p.rentInvoice.update.mock.calls[0][0].data.events[0]).toMatchObject({ type: 'sent', reason: 'reissue' })
  })

  it('stops once a Notice to Remedy has been issued (Day 21+)', async () => {
    p.rentInvoice.findMany.mockResolvedValue([overdue])
    p.arrearsEscalation.findFirst.mockResolvedValue({ currentStep: 'FORMAL_NOTICE', paymentPromisedDate: null })

    const res = await reissueOverdueInvoices(new Date('2026-01-25'))
    expect(res).toEqual({ reissued: 0, stopped: 1 })
    expect(mockEmail).not.toHaveBeenCalled()
  })

  it('stops while an active promise-to-pay hold is in place', async () => {
    p.rentInvoice.findMany.mockResolvedValue([overdue])
    p.arrearsEscalation.findFirst.mockResolvedValue({ currentStep: 'OVERDUE_NOTICE_1', paymentPromisedDate: new Date('2026-01-30') })

    const res = await reissueOverdueInvoices(new Date('2026-01-20'))
    expect(res.stopped).toBe(1)
    expect(mockEmail).not.toHaveBeenCalled()
  })

  it('stops when the balance has cleared', async () => {
    p.rentInvoice.findMany.mockResolvedValue([{ ...overdue, allocations: [{ amount: 50000 }] }])
    const res = await reissueOverdueInvoices(new Date('2026-01-20'))
    expect(res).toEqual({ reissued: 0, stopped: 1 })
    expect(mockEmail).not.toHaveBeenCalled()
  })
})
