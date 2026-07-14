import { prisma } from '@/lib/db'

// ============================================================================
// Move-Out Statement of Repair Costs (lease clause 8.3).
// Auto-drafted when a MOVE_OUT / PRE_MOVE_OUT inspection is completed: turns the
// remedial items flagged during the inspection into costed lines the agent
// prices on-site, then feeds deposit reconciliation and the Clearance to Vacate.
// ============================================================================

/** Days a move-out repairs quote remains valid before amounts may change. */
export const MOVE_OUT_QUOTE_VALIDITY_DAYS = 3

export type LineAction = 'REPAIR' | 'REPLACE' | 'CLEAN'
export type LineResponsibility = 'TENANT' | 'LANDLORD' | 'SHARED'

export interface DraftLineInput {
  sourceRef: string
  description: string
  room: string | null
  action: LineAction
  responsibility: LineResponsibility
  evidenceUrl: string | null
  sortOrder: number
}

// Inspection checklist codes → remedial action. `condition`: N/G/F/P/D/M/NA,
// `action`: OK/CL/RP/RC/TC (see inspection-checklists.ts CONDITION/ACTION_CODES).
function actionFromCodes(actionCode?: string, condition?: string): LineAction {
  if (actionCode === 'RC') return 'REPLACE'
  if (actionCode === 'CL') return 'CLEAN'
  if (actionCode === 'RP') return 'REPAIR'
  // No explicit remedial code — infer from condition (M = missing → replace).
  if (condition === 'M') return 'REPLACE'
  return 'REPAIR'
}

// Default responsibility before the agent confirms on-site. Tenant charge (TC),
// damage (D), missing (M) and cleaning (CL) default to the tenant; plain
// repair/replace of worn items defaults to the landlord (fair wear and tear).
function responsibilityFromCodes(actionCode?: string, condition?: string): LineResponsibility {
  if (actionCode === 'TC') return 'TENANT'
  if (condition === 'D' || condition === 'M') return 'TENANT'
  if (actionCode === 'CL') return 'TENANT'
  return 'LANDLORD'
}

/** True if a checklist item warrants a remedial (and therefore costable) line. */
function isRemedial(actionCode?: string, condition?: string): boolean {
  return (
    actionCode === 'CL' ||
    actionCode === 'RP' ||
    actionCode === 'RC' ||
    actionCode === 'TC' ||
    condition === 'D' ||
    condition === 'M'
  )
}

function withComment(item: string, comment?: string): string {
  const c = (comment || '').trim()
  return c ? `${item}: ${c}` : item
}

/**
 * Pure: derive draft repair lines from a completed inspection. Reads the v2
 * ChecklistData held in `rooms` plus the inspection's `maintenanceItems`.
 * Returns [] for legacy (v1 array) or empty inspections.
 */
export function draftLinesFromInspection(inspection: {
  rooms?: unknown
  maintenanceItems?: unknown
}): DraftLineInput[] {
  const lines: DraftLineInput[] = []
  let order = 0
  const push = (l: Omit<DraftLineInput, 'sortOrder'>) => {
    lines.push({ ...l, sortOrder: order++ })
  }

  const rooms = inspection.rooms as any
  const isV2 = rooms && typeof rooms === 'object' && !Array.isArray(rooms) && rooms._v === 2

  if (isV2) {
    // Standard + additional checklist rows.
    const checklistRows: any[] = [
      ...(Array.isArray(rooms.items) ? rooms.items : []),
      ...(Array.isArray(rooms.additionalItems) ? rooms.additionalItems : []),
    ]
    for (const row of checklistRows) {
      if (!row || !row.item) continue
      if (!isRemedial(row.action, row.condition)) continue
      push({
        sourceRef: `checklist:${row.section || ''}/${row.item}`,
        description: withComment(row.item, row.comments),
        room: row.section || null,
        action: actionFromCodes(row.action, row.condition),
        responsibility: responsibilityFromCodes(row.action, row.condition),
        evidenceUrl: Array.isArray(row.photos) && row.photos.length > 0 ? row.photos[0] : null,
      })
    }

    // Bedroom / bathroom matrices: one condition per column (Bed/WC 1..n).
    const matrices: { rows: any[]; label: string; key: string }[] = [
      { rows: Array.isArray(rooms.bedroomMatrix) ? rooms.bedroomMatrix : [], label: 'Bed', key: 'bedroom' },
      { rows: Array.isArray(rooms.bathroomMatrix) ? rooms.bathroomMatrix : [], label: 'WC', key: 'bathroom' },
    ]
    for (const m of matrices) {
      for (const row of m.rows) {
        if (!row || !row.item || !Array.isArray(row.cond)) continue
        row.cond.forEach((condition: string, i: number) => {
          if (condition !== 'D' && condition !== 'M') return
          push({
            sourceRef: `matrix:${m.key}:${row.item}:${i}`,
            description: withComment(`${row.item} (${m.label} ${i + 1})`, row.comments),
            room: m.key === 'bedroom' ? 'Bedrooms' : 'Bathrooms',
            action: actionFromCodes(undefined, condition),
            responsibility: 'TENANT',
            evidenceUrl: null,
          })
        })
      }
    }

    // Explicit defects table — carries its own responsibility.
    const defects: any[] = Array.isArray(rooms.defects) ? rooms.defects : []
    defects.forEach((d: any, i: number) => {
      if (!d || !d.item) return
      push({
        sourceRef: `defect:${i}`,
        description: withComment(d.item, d.notes),
        room: null,
        action: 'REPAIR',
        responsibility: d.responsibility === 'TENANT' ? 'TENANT' : 'LANDLORD',
        evidenceUrl: null,
      })
    })
  }

  // Inspection maintenance items (present for both v1 and v2 flows).
  const maintenanceItems = inspection.maintenanceItems as any
  if (Array.isArray(maintenanceItems)) {
    maintenanceItems.forEach((mi: any, i: number) => {
      if (!mi || !mi.description) return
      push({
        sourceRef: `maintenance:${i}`,
        description: mi.description,
        room: mi.room || null,
        action: 'REPAIR',
        responsibility: 'LANDLORD',
        evidenceUrl: null,
      })
    })
  }

  return lines
}

/** issuedAt + MOVE_OUT_QUOTE_VALIDITY_DAYS. */
export function quoteValidUntil(issuedAt = new Date()): Date {
  const d = new Date(issuedAt)
  d.setDate(d.getDate() + MOVE_OUT_QUOTE_VALIDITY_DAYS)
  return d
}

/**
 * Recompute per-line totals and the quote's money summary from its current
 * lines. Called after any line create/update/delete.
 *   lineTotal    = unitCost * quantity
 *   tenantCharge = lineTotal (TENANT) | 0 (LANDLORD) | agent-set (SHARED)
 */
export async function recomputeTotals(quoteId: string): Promise<void> {
  const quote = await prisma.moveOutQuote.findUnique({
    where: { id: quoteId },
    select: { depositHeld: true, lines: true },
  })
  if (!quote) return

  let totalTenantCharge = 0
  let totalLine = 0

  for (const line of quote.lines) {
    const lineTotal = Number(line.unitCost) * Number(line.quantity)
    let tenantCharge = Number(line.tenantCharge)
    if (line.responsibility === 'TENANT') tenantCharge = lineTotal
    else if (line.responsibility === 'LANDLORD') tenantCharge = 0
    else tenantCharge = Math.min(tenantCharge, lineTotal) // SHARED: agent-set, capped at lineTotal

    totalLine += lineTotal
    totalTenantCharge += tenantCharge

    if (lineTotal !== Number(line.lineTotal) || tenantCharge !== Number(line.tenantCharge)) {
      await prisma.moveOutQuoteLine.update({
        where: { id: line.id },
        data: { lineTotal, tenantCharge },
      })
    }
  }

  const depositHeld = Number(quote.depositHeld)
  const totalLandlordCost = totalLine - totalTenantCharge
  const balanceDue = Math.max(0, totalTenantCharge - depositHeld)
  const refundDue = Math.max(0, depositHeld - totalTenantCharge)

  await prisma.moveOutQuote.update({
    where: { id: quoteId },
    data: { totalTenantCharge, totalLandlordCost, balanceDue, refundDue },
  })
}

const MOVE_OUT_TYPES = new Set(['MOVE_OUT', 'PRE_MOVE_OUT'])

/**
 * Idempotently create the Statement of Repair Costs for a completed move-out
 * inspection. Returns the existing quote if one already exists, or null when the
 * inspection is not a move-out type or lacks the lease/tenant context needed.
 */
export async function generateMoveOutQuote(inspectionId: string) {
  const inspection = await prisma.inspection.findUnique({
    where: { id: inspectionId },
    include: { lease: { select: { id: true, securityDeposit: true } } },
  })

  if (!inspection) return null
  if (!MOVE_OUT_TYPES.has(inspection.type)) return null
  if (!inspection.leaseId || !inspection.tenantId) return null

  const existing = await prisma.moveOutQuote.findUnique({
    where: { inspectionId },
  })
  if (existing) return existing

  // Resolve the deposit held: prefer an active Deposit row, fall back to the
  // amount recorded on the lease.
  const deposit = await prisma.deposit.findFirst({
    where: { leaseId: inspection.leaseId, status: { in: ['HELD', 'UNDER_REVIEW'] } },
    orderBy: { paymentDate: 'desc' },
    select: { id: true, amount: true },
  })
  const depositHeld = deposit
    ? Number(deposit.amount)
    : Number(inspection.lease?.securityDeposit ?? 0)

  const draftLines = draftLinesFromInspection(inspection)
  const issuedAt = new Date()

  const quote = await prisma.moveOutQuote.create({
    data: {
      inspectionId,
      leaseId: inspection.leaseId,
      tenantId: inspection.tenantId,
      depositId: deposit?.id ?? null,
      depositHeld,
      issuedAt,
      validUntil: quoteValidUntil(issuedAt),
      lines: {
        create: draftLines.map((l) => ({
          sourceRef: l.sourceRef,
          description: l.description,
          room: l.room,
          action: l.action,
          responsibility: l.responsibility,
          evidenceUrl: l.evidenceUrl,
          sortOrder: l.sortOrder,
        })),
      },
    },
  })

  await recomputeTotals(quote.id)
  return prisma.moveOutQuote.findUnique({ where: { id: quote.id }, include: { lines: true } })
}

/**
 * Apply an approved Statement of Repair Costs to the tenant's deposit (clause
 * 8.3: "This statement forms the basis for any deposit deductions").
 *
 * Deductions are the tenant-charge lines, capped so their sum never exceeds the
 * deposit held (the over-deposit remainder is `balanceDue`, collected
 * separately). Idempotent-safe to call once at approval. No-op when there is no
 * linked Deposit row.
 */
export async function reconcileDepositForQuote(quoteId: string): Promise<void> {
  const quote = await prisma.moveOutQuote.findUnique({
    where: { id: quoteId },
    include: { lines: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!quote || !quote.depositId) return

  const depositHeld = Number(quote.depositHeld)

  // Walk tenant-charge lines, capping the running total at the deposit held.
  const deductions: { description: string; amount: number; evidenceUrl?: string }[] = []
  let applied = 0
  for (const line of quote.lines) {
    const charge = Number(line.tenantCharge)
    if (charge <= 0) continue
    const room = line.room ? `${line.room} - ` : ''
    let amount = charge
    if (applied + amount > depositHeld) amount = depositHeld - applied
    if (amount <= 0) break
    deductions.push({
      description: `${room}${line.description}`,
      amount,
      ...(line.evidenceUrl ? { evidenceUrl: line.evidenceUrl } : {}),
    })
    applied += amount
    if (applied >= depositHeld) break
  }

  const refundAmount = Math.max(0, depositHeld - applied)
  let status: 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'FORFEITED'
  if (applied === 0) status = 'REFUNDED'
  else if (refundAmount === 0) status = 'FORFEITED'
  else status = 'PARTIALLY_REFUNDED'

  await prisma.deposit.update({
    where: { id: quote.depositId },
    data: {
      status,
      deductions,
      refundAmount,
      refundDate: new Date(),
      settlementNotes: `Move-out Statement of Repair Costs ${quote.id}`,
    },
  })
}
