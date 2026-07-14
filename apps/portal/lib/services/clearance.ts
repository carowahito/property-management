import { prisma } from '@/lib/db'

// ============================================================================
// Clearance to Vacate (lease clause 8.4). A Clearance is only READY to issue to
// the estate management office once every condition below is met:
//   1. Inspection report approved (tenant signed)
//   2. Statement of Repair Costs approved (tenant signed) - clause 8.3
//   3. Any repair balance over the deposit settled
//   4. Keys returned and meters recorded
//   5. Rent and outstanding charges cleared
//
// Conditions 1-2 are derived live; 3 is derived (balanceDue == 0) OR agent
// confirmed; 4-5 default to a derived suggestion but are agent-confirmable. Agent
// confirmations are stored as booleans on the ClearanceToVacate row and can only
// force a condition true (never false).
// ============================================================================

const MOVE_OUT_TYPES: ('MOVE_OUT' | 'PRE_MOVE_OUT')[] = ['MOVE_OUT', 'PRE_MOVE_OUT']

export interface ClearanceCondition {
  key: string
  label: string
  met: boolean
  detail?: string
}

export interface ClearanceState {
  leaseId: string
  inspectionId: string | null
  quoteId: string | null
  arrearsAmount: number
  balanceDue: number
  ready: boolean
  conditions: ClearanceCondition[]
  clearance: {
    id: string
    status: string
    issuedAt: Date | null
    issuedToOfficeAt: Date | null
    officeEmail: string | null
    documentUrl: string | null
  } | null
}

function trimmed(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

/** Latest running ledger balance for a lease (positive = arrears owed). */
async function outstandingArrears(leaseId: string): Promise<number> {
  const last = await prisma.tenantLedger.findFirst({
    where: { leaseId },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    select: { balance: true },
  })
  return last ? Math.max(0, Number(last.balance)) : 0
}

/**
 * Evaluate the clearance conditions for a lease. Reads the most recent completed
 * move-out inspection, its Statement of Repair Costs, the tenant ledger, and any
 * existing ClearanceToVacate row (for agent confirmations).
 */
export async function evaluateClearance(leaseId: string): Promise<ClearanceState> {
  const inspection = await prisma.inspection.findFirst({
    where: { leaseId, type: { in: MOVE_OUT_TYPES }, status: 'COMPLETED' },
    orderBy: { completedDate: 'desc' },
    include: { moveOutQuote: true },
  })

  const record = await prisma.clearanceToVacate.findUnique({ where: { leaseId } })
  const arrearsAmount = await outstandingArrears(leaseId)

  const quote = inspection?.moveOutQuote ?? null
  const balanceDue = quote ? Number(quote.balanceDue) : 0

  // Derived key/meter suggestions from the v2 checklist.
  const rooms = inspection?.rooms as any
  const isV2 = rooms && typeof rooms === 'object' && rooms._v === 2
  const keys: any[] = isV2 && Array.isArray(rooms.keys) ? rooms.keys : []
  const meters: any[] = isV2 && Array.isArray(rooms.meters) ? rooms.meters : []
  const derivedKeysReturned = keys.length > 0 && keys.every((k) => trimmed(k.returned))
  const derivedMetersRecorded = meters.length > 0 && meters.some((m) => trimmed(m.reading))

  const inspectionApproved = !!inspection?.tenantSignedAt
  const statementApproved = !!quote?.tenantApprovedAt
  const balanceSettled = balanceDue === 0 || !!record?.balanceSettled
  const keysReturned = derivedKeysReturned || !!record?.keysReturned
  const metersRecorded = derivedMetersRecorded || !!record?.metersRecorded
  const rentCleared = arrearsAmount <= 0 || !!record?.rentCleared

  const conditions: ClearanceCondition[] = [
    { key: 'inspectionApproved', label: 'Inspection report approved by tenant', met: inspectionApproved },
    { key: 'statementApproved', label: 'Statement of Repair Costs approved by tenant', met: statementApproved && !!quote },
    {
      key: 'balanceSettled',
      label: 'Repair costs over the deposit settled',
      met: balanceSettled,
      detail: balanceDue > 0 ? `Balance outstanding: KSh ${balanceDue.toLocaleString('en-KE')}` : undefined,
    },
    { key: 'keysReturned', label: 'Keys returned', met: keysReturned },
    { key: 'metersRecorded', label: 'Meter readings recorded', met: metersRecorded },
    {
      key: 'rentCleared',
      label: 'Rent and outstanding charges paid',
      met: rentCleared,
      detail: arrearsAmount > 0 ? `Arrears outstanding: KSh ${arrearsAmount.toLocaleString('en-KE')}` : undefined,
    },
  ]

  const ready = !!inspection && !!quote && conditions.every((c) => c.met)

  return {
    leaseId,
    inspectionId: inspection?.id ?? null,
    quoteId: quote?.id ?? null,
    arrearsAmount,
    balanceDue,
    ready,
    conditions,
    clearance: record
      ? {
          id: record.id,
          status: record.status,
          issuedAt: record.issuedAt,
          issuedToOfficeAt: record.issuedToOfficeAt,
          officeEmail: record.officeEmail,
          documentUrl: record.documentUrl,
        }
      : null,
  }
}

/**
 * Persist the current clearance state to a ClearanceToVacate row (creating it if
 * needed), refreshing derived flags, arrears, and BLOCKED/READY status. Returns
 * the fresh evaluation. No-op-safe once ISSUED.
 */
export async function syncClearance(leaseId: string): Promise<ClearanceState> {
  const state = await evaluateClearance(leaseId)
  if (!state.inspectionId || !state.quoteId) return state

  const byKey = Object.fromEntries(state.conditions.map((c) => [c.key, c.met]))
  const status = state.clearance?.status === 'ISSUED' ? 'ISSUED' : state.ready ? 'READY' : 'BLOCKED'

  const record = await prisma.clearanceToVacate.upsert({
    where: { leaseId },
    create: {
      leaseId,
      inspectionId: state.inspectionId,
      quoteId: state.quoteId,
      status,
      statementSigned: byKey.statementApproved,
      balanceSettled: byKey.balanceSettled,
      keysReturned: byKey.keysReturned,
      metersRecorded: byKey.metersRecorded,
      rentCleared: byKey.rentCleared,
      rentArrearsAmount: state.arrearsAmount,
    },
    update: {
      status,
      statementSigned: byKey.statementApproved,
      balanceSettled: byKey.balanceSettled,
      keysReturned: byKey.keysReturned,
      metersRecorded: byKey.metersRecorded,
      rentCleared: byKey.rentCleared,
      rentArrearsAmount: state.arrearsAmount,
    },
  })

  return { ...state, clearance: { id: record.id, status: record.status, issuedAt: record.issuedAt, issuedToOfficeAt: record.issuedToOfficeAt, officeEmail: record.officeEmail, documentUrl: record.documentUrl } }
}
