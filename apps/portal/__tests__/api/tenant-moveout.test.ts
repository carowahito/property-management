/**
 * @jest-environment node
 */

/**
 * Recording a move-out date must terminate the tenant's active lease(s), so
 * every "active lease" query (invoicing, arrears scan) excludes the former
 * tenant automatically.
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth-config', () => ({ authOptions: {} }))
jest.mock('@/lib/db', () => ({
  prisma: {
    tenant: { update: jest.fn() },
    lease: { updateMany: jest.fn() },
    property: { findUnique: jest.fn() },
  },
}))

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { PATCH } from '@/app/api/tenants/[id]/route'

const mockSession = getServerSession as jest.Mock
const p = prisma as any

function call(body: any, id = 'ten-1') {
  return PATCH({ json: async () => body } as any, { params: Promise.resolve({ id }) } as any)
}

describe('PATCH /api/tenants/[id] move-out handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSession.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN' } })
    p.tenant.update.mockResolvedValue({ id: 'ten-1', name: 'Jane' })
    p.lease.updateMany.mockResolvedValue({ count: 1 })
  })

  it('terminates active leases when a move-out date is recorded', async () => {
    const res = await call({ moveOutDate: '2026-05-31' })
    expect(res.status).toBe(200)
    expect(p.lease.updateMany).toHaveBeenCalledTimes(1)
    const arg = p.lease.updateMany.mock.calls[0][0]
    expect(arg.where).toMatchObject({ tenantId: 'ten-1', status: 'ACTIVE' })
    expect(arg.data.status).toBe('TERMINATED')
    expect(arg.data.endDate).toBeInstanceOf(Date)
  })

  it('does not terminate leases when no move-out date is set', async () => {
    const res = await call({ name: 'New Name' })
    expect(res.status).toBe(200)
    expect(p.lease.updateMany).not.toHaveBeenCalled()
  })

  it('does not terminate leases when the move-out date is cleared (null)', async () => {
    const res = await call({ moveOutDate: null })
    expect(res.status).toBe(200)
    expect(p.lease.updateMany).not.toHaveBeenCalled()
  })
})
