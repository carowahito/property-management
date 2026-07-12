/**
 * BR-2 — Agent income ledger segregation (SOP 004).
 *
 * Late-payment penalties (and management fees) are agent income and are
 * recorded in a dedicated, segregated ledger. These tests verify that
 * recognition writes a correctly-scoped, idempotent ledger entry, and that
 * the recording is best-effort (never throws into the payment path).
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/db', () => ({
  prisma: {
    tenant: { findUnique: jest.fn() },
    agentIncomeLedger: { upsert: jest.fn(), create: jest.fn() },
  },
}))

import { prisma } from '@/lib/db'
import { recordAgentIncome } from '@/lib/services/agent-income'

const mockPrisma = prisma as unknown as {
  tenant: { findUnique: jest.Mock }
  agentIncomeLedger: { upsert: jest.Mock; create: jest.Mock }
}

describe('BR-2: agent income ledger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPrisma.tenant.findUnique.mockResolvedValue({ companyId: 'co-1' })
    mockPrisma.agentIncomeLedger.upsert.mockResolvedValue({ id: 'aile-1' })
    mockPrisma.agentIncomeLedger.create.mockResolvedValue({ id: 'aile-1' })
  })

  it('records a penalty keyed on the originating payment (idempotent)', async () => {
    await recordAgentIncome({
      source: 'PENALTY',
      amount: 2500,
      tenantId: 'ten-1',
      leaseId: 'lease-1',
      paymentId: 'pay-late-1',
      period: new Date('2026-01-15'),
      description: 'Late payment penalty',
    })

    // companyId resolved from the tenant.
    expect(mockPrisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { id: 'ten-1' },
      select: { companyId: true },
    })

    expect(mockPrisma.agentIncomeLedger.upsert).toHaveBeenCalledTimes(1)
    const arg = mockPrisma.agentIncomeLedger.upsert.mock.calls[0][0]
    // Idempotency key is (paymentId, source).
    expect(arg.where).toEqual({ paymentId_source: { paymentId: 'pay-late-1', source: 'PENALTY' } })
    expect(arg.create).toMatchObject({
      companyId: 'co-1',
      source: 'PENALTY',
      amount: 2500,
      period: '2026-01', // Date normalised to YYYY-MM
    })
  })

  it('records a management fee keyed on the rent transaction', async () => {
    await recordAgentIncome({
      source: 'MANAGEMENT_FEE',
      amount: 5000,
      companyId: 'co-1',
      tenantId: 'ten-1',
      rentTransactionId: 'rt-1',
      description: 'Management fee',
    })

    const arg = mockPrisma.agentIncomeLedger.upsert.mock.calls[0][0]
    expect(arg.where).toEqual({
      rentTransactionId_source: { rentTransactionId: 'rt-1', source: 'MANAGEMENT_FEE' },
    })
    expect(arg.create).toMatchObject({ source: 'MANAGEMENT_FEE', amount: 5000 })
  })

  it('does not write for a zero or negative amount', async () => {
    await recordAgentIncome({ source: 'PENALTY', amount: 0, tenantId: 'ten-1', paymentId: 'p' })
    expect(mockPrisma.agentIncomeLedger.upsert).not.toHaveBeenCalled()
    expect(mockPrisma.agentIncomeLedger.create).not.toHaveBeenCalled()
  })

  it('does not write when no company can be resolved', async () => {
    mockPrisma.tenant.findUnique.mockResolvedValue(null)
    await recordAgentIncome({ source: 'PENALTY', amount: 100, tenantId: 'ten-x', paymentId: 'p' })
    expect(mockPrisma.agentIncomeLedger.upsert).not.toHaveBeenCalled()
  })

  it('is best-effort — a DB error never propagates', async () => {
    mockPrisma.agentIncomeLedger.upsert.mockRejectedValue(new Error('db down'))
    await expect(
      recordAgentIncome({ source: 'PENALTY', amount: 100, companyId: 'co-1', paymentId: 'p' })
    ).resolves.toBeUndefined()
  })
})
