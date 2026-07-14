/**
 * SOP 004 / BR-1a — invoice auto-send + prepaid suppression.
 * An invoice already fully settled at send time is suppressed (and logged);
 * an unpaid/partial invoice is sent, showing the remaining balance.
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/db', () => ({
  prisma: { rentInvoice: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() } },
}))
jest.mock('@/lib/services/email', () => ({ sendEmail: jest.fn().mockResolvedValue(true) }))
jest.mock('@/lib/services/whatsapp', () => ({ sendWhatsApp: jest.fn().mockResolvedValue(true) }))
// sendInvoice consults the arrears snapshot — stub it as "no arrears" so these
// BR-1a tests exercise the plain-invoice path (BR-1b is tested separately).
jest.mock('@/lib/services/arrears-snapshot', () => ({
  computeArrearsSnapshot: jest.fn().mockResolvedValue({
    currentRent: 0, broughtForward: [], broughtForwardTotal: 0, penaltyAccrued: 0, totalDue: 0, hasArrears: false,
  }),
}))

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/services/email'
import { sendInvoice } from '@/lib/services/invoice-send'

const p = prisma as any
const mockEmail = sendEmail as jest.Mock

function inv(overrides: any = {}) {
  return {
    id: 'inv-1',
    invoiceNumber: 42,
    period: '2026-02',
    dueDate: new Date('2026-02-01'),
    rentAmount: 50000,
    events: null,
    tenant: { name: 'Test Tenant', email: 't@example.com', phone: '+254700000000' },
    property: { name: 'Test Property', address: 'Nairobi' },
    lease: { mpesaTill: 'Till 123', bankDetails: null, unitRef: { unitNumber: 'A1' } },
    allocations: [],
    ...overrides,
  }
}

describe('sendInvoice (BR-1a)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    p.rentInvoice.update.mockResolvedValue({})
    mockEmail.mockResolvedValue(true)
  })

  it('suppresses the send when the invoice is fully prepaid, and logs it', async () => {
    p.rentInvoice.findUnique.mockResolvedValue(inv({ allocations: [{ amount: 50000 }] }))
    const res = await sendInvoice('inv-1')
    expect(res).toEqual({ status: 'suppressed', reason: 'prepaid' })
    expect(mockEmail).not.toHaveBeenCalled()
    // A suppression event is appended to the audit trail.
    const data = p.rentInvoice.update.mock.calls[0][0].data
    expect(data.events[0]).toMatchObject({ type: 'send_suppressed', reason: 'prepaid' })
    expect(data.lastSentAt).toBeUndefined()
  })

  it('sends an unpaid invoice and records channels + lastSentAt', async () => {
    p.rentInvoice.findUnique.mockResolvedValue(inv())
    const res = await sendInvoice('inv-1')
    expect(res.status).toBe('sent')
    if (res.status === 'sent') {
      expect(res.balanceDue).toBe(50000)
      expect(res.channels).toEqual(['email', 'whatsapp'])
    }
    expect(mockEmail).toHaveBeenCalledTimes(1)
    const data = p.rentInvoice.update.mock.calls[0][0].data
    expect(data.events[0]).toMatchObject({ type: 'sent', channels: ['email', 'whatsapp'] })
    expect(data.lastSentAt).toBeInstanceOf(Date)
  })

  it('still sends a partially-paid invoice, for the remaining balance', async () => {
    p.rentInvoice.findUnique.mockResolvedValue(inv({ allocations: [{ amount: 20000 }] }))
    const res = await sendInvoice('inv-1')
    expect(res.status).toBe('sent')
    if (res.status === 'sent') expect(res.balanceDue).toBe(30000)
  })

  it('skips a missing invoice', async () => {
    p.rentInvoice.findUnique.mockResolvedValue(null)
    expect(await sendInvoice('nope')).toEqual({ status: 'skipped', reason: 'invoice not found' })
  })
})
