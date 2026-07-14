/**
 * BR-2 regression test (SOP 004) — "Penalty is agent income."
 *
 * Late-payment penalties must NEVER appear on a landlord-facing statement,
 * disbursement report, or landlord communication, and are never disbursed to
 * the landlord. This test feeds the landlord statement generator a rent
 * transaction that carries a penalty (`lateFees`) and asserts the penalty
 * never surfaces in any landlord-facing artifact — the summary object, the
 * per-transaction deductions, or the rendered HTML.
 *
 * If a future change starts summing `lateFees` into landlord totals or renders
 * it on the statement, this test fails.
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

// A deliberately distinctive penalty amount that collides with no other figure
// in the fixture, so we can assert it appears nowhere in the output.
const PENALTY = 7777

// ── Mock the DB layer the generator depends on ──────────────────────────────
// Defined inside the factory so it survives jest.mock hoisting.
jest.mock('@/lib/db', () => ({
  prisma: {
    landlord: { findUnique: jest.fn() },
    rentTransaction: { findMany: jest.fn() },
    landlordStatement: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

// Import AFTER the mock is registered.
import { prisma } from '@/lib/db'
import { statementGenerator } from '@/lib/services/statement-generator'

const mockPrisma = prisma as unknown as {
  landlord: { findUnique: jest.Mock }
  rentTransaction: { findMany: jest.Mock }
  landlordStatement: {
    findFirst: jest.Mock
    create: jest.Mock
    update: jest.Mock
    findMany: jest.Mock
  }
}

function makeRentTransaction() {
  // A landlord-owned rent transaction that ALSO carries a late-payment penalty.
  // The penalty (`lateFees`) is agent income and must be ignored by the
  // landlord statement generator.
  return {
    id: 'txn-1',
    propertyId: 'prop-1',
    unitId: 'unit-1',
    paymentId: 'pay-1',
    rentPeriod: 'Jan 2026',
    grossRent: 50000,
    serviceCharge: 2000,
    managementFee: 5000,
    maintenanceFees: 1000,
    otherDeductions: 0,
    totalDeductions: 8000,
    netAmount: 42000,
    lateFees: PENALTY, // <-- penalty / agent income — must never surface
    paidDate: new Date('2026-01-03'),
    payoutStatus: 'PENDING',
    payoutDate: null,
    payoutReference: null,
    payoutMethod: null,
    property: { id: 'prop-1', name: 'Test Property' },
    tenant: { id: 'ten-1', name: 'Test Tenant' },
    lease: { property: { name: 'Test Property' }, tenant: { name: 'Test Tenant' } },
    payout: null,
  }
}

describe('BR-2: penalties never appear on landlord-facing statements', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPrisma.landlord.findUnique.mockResolvedValue({ id: 'll-1', name: 'Test Landlord' })
    mockPrisma.rentTransaction.findMany.mockResolvedValue([makeRentTransaction()])
    mockPrisma.landlordStatement.findFirst.mockResolvedValue(null)
    mockPrisma.landlordStatement.create.mockResolvedValue({ id: 'stmt-1' })
  })

  it('excludes the penalty from landlord deduction totals and net amount', async () => {
    const statement = await statementGenerator.generateStatement(
      'll-1',
      new Date('2026-01-01'),
      new Date('2026-01-31')
    )

    // Deductions are only the four approved categories — NOT the penalty.
    expect(statement.totalDeductions).toBe(8000)
    expect(statement.totalServiceCharges).toBe(2000)
    expect(statement.totalManagementFees).toBe(5000)
    expect(statement.totalMaintenanceFees).toBe(1000)
    expect(statement.totalOtherDeductions).toBe(0)

    // Net payout to the landlord is unaffected by the penalty.
    expect(statement.totalNetAmount).toBe(42000)
  })

  it('does not expose any penalty field or value in the summary object', () => {
    return statementGenerator
      .generateStatement('ll-1', new Date('2026-01-01'), new Date('2026-01-31'))
      .then((statement) => {
        // No penalty amount anywhere in the serialized landlord artifact.
        const serialized = JSON.stringify(statement)
        expect(serialized).not.toContain(String(PENALTY))
        expect(serialized.toLowerCase()).not.toContain('latefee')
        expect(serialized.toLowerCase()).not.toContain('penalt')

        // Per-transaction deductions expose only approved categories.
        const deductionKeys = Object.keys(statement.transactions[0].deductions)
        expect(deductionKeys.sort()).toEqual(
          ['managementFee', 'maintenanceFees', 'otherDeductions', 'serviceCharge', 'total'].sort()
        )
      })
  })

  it('renders no penalty on the landlord statement HTML', async () => {
    const statement = await statementGenerator.generateStatement(
      'll-1',
      new Date('2026-01-01'),
      new Date('2026-01-31')
    )

    const html = statementGenerator.generateHTML(statement).toLowerCase()

    expect(html).not.toContain(String(PENALTY))
    expect(html).not.toContain('penalt')
    expect(html).not.toContain('late fee')
    expect(html).not.toContain('latefee')
  })
})
