import { prisma } from '@/lib/db'

// ============================================================================
// Agent income ledger (SOP 004 / BR-2)
// Records agent income — late-payment penalties and management fees — in a
// dedicated ledger, segregated from landlord income. Entries here must never
// be surfaced on landlord-facing statements, disbursements, or communications.
// ============================================================================

export type AgentIncomeSource = 'PENALTY' | 'MANAGEMENT_FEE'

interface RecordAgentIncomeParams {
  source: AgentIncomeSource
  amount: number
  companyId?: string
  tenantId?: string
  leaseId?: string
  /** The originating payment (e.g. the late-fee payment). Idempotency key with source. */
  paymentId?: string
  /** The originating rent transaction (e.g. management fee). Idempotency key with source. */
  rentTransactionId?: string
  /** Period in YYYY-MM. Accepts a Date or string; a Date is normalised to YYYY-MM. */
  period?: string | Date
  description?: string
}

function toPeriod(period?: string | Date): string | undefined {
  if (!period) return undefined
  if (period instanceof Date) return period.toISOString().slice(0, 7)
  return period
}

/**
 * Record a single agent-income entry. Best-effort: never throws, so it can be
 * safely fired from a payment/allocation path without rolling back the payment.
 * Idempotent — re-recognising the same payment/transaction updates the existing
 * entry rather than duplicating it.
 */
export async function recordAgentIncome(params: RecordAgentIncomeParams): Promise<void> {
  try {
    if (!params.amount || params.amount <= 0) return

    // Resolve the owning company (agency) — required to scope the ledger entry.
    let companyId = params.companyId
    if (!companyId && params.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: params.tenantId },
        select: { companyId: true },
      })
      companyId = tenant?.companyId
    }
    if (!companyId) {
      console.error('[agent-income] no companyId resolved; skipping', params.source)
      return
    }

    const data = {
      companyId,
      source: params.source,
      amount: params.amount,
      tenantId: params.tenantId ?? null,
      leaseId: params.leaseId ?? null,
      paymentId: params.paymentId ?? null,
      rentTransactionId: params.rentTransactionId ?? null,
      period: toPeriod(params.period) ?? null,
      description: params.description ?? null,
    }

    // Idempotent upsert keyed on the originating record + source.
    if (params.paymentId) {
      await prisma.agentIncomeLedger.upsert({
        where: { paymentId_source: { paymentId: params.paymentId, source: params.source } },
        create: data,
        update: { amount: data.amount, period: data.period, description: data.description },
      })
    } else if (params.rentTransactionId) {
      await prisma.agentIncomeLedger.upsert({
        where: { rentTransactionId_source: { rentTransactionId: params.rentTransactionId, source: params.source } },
        create: data,
        update: { amount: data.amount, period: data.period, description: data.description },
      })
    } else {
      await prisma.agentIncomeLedger.create({ data })
    }
  } catch (err) {
    console.error('[agent-income] failed to record entry:', err)
  }
}
