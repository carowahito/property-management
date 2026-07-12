/**
 * @jest-environment node
 */

/**
 * SOP 004 — Arrears escalation gates (BR-5, BR-6, BR-7).
 *
 * Verifies the escalate route enforces:
 *  - the day-threshold time-lock (a stage can't fire before its day),
 *  - the Day-21 Notice to Remedy human gate (Director + consultation + delivery ref),
 *  - Director approval for legal referral, which opens a legal case and closes
 *    the arrears record.
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth-config', () => ({ authOptions: {} }))
jest.mock('@/lib/db', () => ({
  prisma: { arrearsEscalation: { findUnique: jest.fn(), update: jest.fn() } },
}))
jest.mock('@/lib/services/legal-case', () => ({ openLegalCaseForArrears: jest.fn() }))

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { openLegalCaseForArrears } from '@/lib/services/legal-case'
import { POST } from '@/app/api/arrears/[id]/escalate/route'

const mockSession = getServerSession as jest.Mock
const mockFindUnique = (prisma as any).arrearsEscalation.findUnique as jest.Mock
const mockUpdate = (prisma as any).arrearsEscalation.update as jest.Mock
const mockOpenLegal = openLegalCaseForArrears as jest.Mock

function call(body: any, id = 'arr-1') {
  return POST({ json: async () => body } as any, { params: Promise.resolve({ id }) } as any)
}

const baseCase = {
  id: 'arr-1',
  isActive: true,
  penaltyPerDay: 500,
  notes: null,
  daysOverdue: 0,
  currentStep: 'REMINDER_SENT',
}

describe('arrears escalate gates', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdate.mockResolvedValue({ id: 'arr-1' })
    mockOpenLegal.mockResolvedValue({ id: 'lc-1' })
    mockSession.mockResolvedValue({ user: { id: 'u-1', role: 'MANAGER' } })
  })

  it('BR-5: blocks escalation before the day threshold', async () => {
    mockFindUnique.mockResolvedValue({ ...baseCase, currentStep: 'REMINDER_SENT', daysOverdue: 3 })
    const res = await call({})
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/before day 6/)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('BR-6: Notice to Remedy requires Director (ADMIN)', async () => {
    mockFindUnique.mockResolvedValue({ ...baseCase, currentStep: 'OVERDUE_NOTICE_2', daysOverdue: 21 })
    mockSession.mockResolvedValue({ user: { id: 'u-1', role: 'MANAGER' } })
    const res = await call({ consultationConfirmed: true, recordedDeliveryRef: 'RD-1' })
    expect(res.status).toBe(403)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('BR-6: Notice to Remedy requires consultation + recorded delivery ref', async () => {
    mockFindUnique.mockResolvedValue({ ...baseCase, currentStep: 'OVERDUE_NOTICE_2', daysOverdue: 21 })
    mockSession.mockResolvedValue({ user: { id: 'dir-1', role: 'ADMIN' } })

    const noConsult = await call({ recordedDeliveryRef: 'RD-1' })
    expect(noConsult.status).toBe(400)

    const noRef = await call({ consultationConfirmed: true })
    expect(noRef.status).toBe(400)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('BR-6: Notice to Remedy succeeds with Director + consultation + ref, recording the evidence', async () => {
    mockFindUnique.mockResolvedValue({ ...baseCase, currentStep: 'OVERDUE_NOTICE_2', daysOverdue: 22 })
    mockSession.mockResolvedValue({ user: { id: 'dir-1', role: 'ADMIN' } })

    const res = await call({ consultationConfirmed: true, recordedDeliveryRef: 'RD-999' })
    expect(res.status).toBe(200)

    const data = mockUpdate.mock.calls[0][0].data
    expect(data.currentStep).toBe('FORMAL_NOTICE')
    expect(data.consultationConfirmed).toBe(true)
    expect(data.recordedDeliveryRef).toBe('RD-999')
    expect(data.directorApprovedBy).toBe('dir-1')
    expect(data.directorApprovedAt).toBeInstanceOf(Date)
  })

  it('BR-7: legal referral (Director) opens a legal case and closes the arrears record', async () => {
    mockFindUnique.mockResolvedValue({ ...baseCase, currentStep: 'FORMAL_NOTICE', daysOverdue: 36 })
    mockSession.mockResolvedValue({ user: { id: 'dir-1', role: 'ADMIN' } })

    const res = await call({})
    expect(res.status).toBe(200)

    const data = mockUpdate.mock.calls[0][0].data
    expect(data.currentStep).toBe('LEGAL_REFERRAL')
    expect(data.isActive).toBe(false)
    expect(data.resolution).toBe('LEGAL_REFERRAL')
    expect(mockOpenLegal).toHaveBeenCalledWith('arr-1', 'dir-1')
  })

  it('BR-7: legal referral is rejected without Director approval', async () => {
    mockFindUnique.mockResolvedValue({ ...baseCase, currentStep: 'FORMAL_NOTICE', daysOverdue: 36 })
    mockSession.mockResolvedValue({ user: { id: 'u-1', role: 'MANAGER' } })
    const res = await call({})
    expect(res.status).toBe(403)
    expect(mockOpenLegal).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
