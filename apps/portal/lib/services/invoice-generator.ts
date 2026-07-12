import { prisma } from '@/lib/db'

// ============================================================================
// Rent invoice generation & lifecycle (SOP 004 / BR-1)
// The financial record always exists — an invoice is generated for every active
// lease each period, snapshotting rent + grace (never a live lease reference).
// Sending is conditional and handled separately (BR-1a/1c/1d).
// ============================================================================

// Statuses that are terminal or externally-owned — never recomputed here.
const FROZEN_STATUSES = new Set(['WRITTEN_OFF', 'LEGAL_REFERRAL'])

export function currentPeriod(today = new Date()): string {
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

/** Parse a YYYY-MM period into its year (full) and 1-based month. */
function parsePeriod(period: string): { year: number; month: number } {
  const [y, m] = period.split('-').map((n) => parseInt(n, 10))
  return { year: y, month: m }
}

export interface InvoiceStatusInput {
  rentAmount: number
  gracePeriodDays: number
  dueDate: Date
  currentStatus: string
}

/**
 * Derive an invoice's status from its allocated rent and the date.
 * Precedence: frozen > paid > overdue > partially paid > issued.
 * BR-1: an unpaid invoice flips to OVERDUE at 00:00 on the day after the grace
 * period ends (due date + graceDays).
 */
export function deriveInvoiceStatus(
  input: InvoiceStatusInput,
  allocatedRent: number,
  today = new Date()
): string {
  if (FROZEN_STATUSES.has(input.currentStatus)) return input.currentStatus

  const balance = input.rentAmount - allocatedRent
  if (balance <= 0) return 'PAID'

  const overdueThreshold = new Date(input.dueDate)
  overdueThreshold.setDate(overdueThreshold.getDate() + input.gracePeriodDays)

  if (today > overdueThreshold) return 'OVERDUE'
  if (allocatedRent > 0) return 'PARTIALLY_PAID'
  return 'ISSUED'
}

/** Rent still owed on an invoice = snapshot rent − rent allocated to it. */
export async function computeInvoiceBalance(invoiceId: string): Promise<number> {
  const [invoice, agg] = await Promise.all([
    prisma.rentInvoice.findUnique({ where: { id: invoiceId }, select: { rentAmount: true } }),
    prisma.paymentAllocation.aggregate({
      where: { invoiceId, target: 'RENT' },
      _sum: { amount: true },
    }),
  ])
  if (!invoice) throw new Error('Invoice not found')
  return Number(invoice.rentAmount) - Number(agg._sum.amount ?? 0)
}

export interface GenerateInvoicesResult {
  period: string
  created: number
  existing: number
  totalActiveLeases: number
}

/**
 * Generate a rent invoice for every active lease for the given period
 * (defaults to the current month). Idempotent: at most one invoice per
 * lease+period; the rent/grace snapshot is never overwritten.
 */
export async function generateInvoicesForPeriod(period?: string): Promise<GenerateInvoicesResult> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetPeriod = period ?? currentPeriod(today)
  const { year, month } = parsePeriod(targetPeriod)

  const leases = await prisma.lease.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      tenantId: true,
      propertyId: true,
      unitId: true,
      monthlyRent: true,
      rentDueDay: true,
      gracePeriodDays: true,
      startDate: true,
      property: { select: { companyId: true } },
    },
  })

  let created = 0
  let existing = 0

  for (const lease of leases) {
    const dueDay = lease.rentDueDay ?? 1
    const dueDate = new Date(year, month - 1, dueDay)

    // Don't invoice a period that ends before the lease even started.
    const periodEnd = new Date(year, month, 0)
    if (lease.startDate > periodEnd) continue

    const existingInvoice = await prisma.rentInvoice.findUnique({
      where: { leaseId_period: { leaseId: lease.id, period: targetPeriod } },
      select: { id: true },
    })
    if (existingInvoice) {
      existing++
      continue
    }

    await prisma.rentInvoice.create({
      data: {
        companyId: lease.property.companyId,
        leaseId: lease.id,
        tenantId: lease.tenantId,
        propertyId: lease.propertyId,
        unitId: lease.unitId ?? null,
        period: targetPeriod,
        dueDate,
        rentAmount: lease.monthlyRent, // snapshot
        gracePeriodDays: lease.gracePeriodDays ?? 5, // snapshot
        status: 'ISSUED',
        issuedAt: new Date(),
      },
    })
    created++
  }

  return { period: targetPeriod, created, existing, totalActiveLeases: leases.length }
}

/**
 * Recompute and persist a single invoice's status from its current rent
 * allocations. Used after an allocation lands. Returns the resulting status.
 */
export async function refreshInvoiceStatusFor(invoiceId: string, today = new Date()): Promise<string | null> {
  const inv = await prisma.rentInvoice.findUnique({
    where: { id: invoiceId },
    select: {
      rentAmount: true,
      gracePeriodDays: true,
      dueDate: true,
      status: true,
      allocations: { where: { target: 'RENT' }, select: { amount: true } },
    },
  })
  if (!inv) return null

  const allocatedRent = inv.allocations.reduce((s, a) => s + Number(a.amount), 0)
  const next = deriveInvoiceStatus(
    {
      rentAmount: Number(inv.rentAmount),
      gracePeriodDays: inv.gracePeriodDays,
      dueDate: inv.dueDate,
      currentStatus: inv.status,
    },
    allocatedRent,
    today
  )
  if (next !== inv.status) {
    await prisma.rentInvoice.update({ where: { id: invoiceId }, data: { status: next as any } })
  }
  return next
}

/**
 * BR-1: refresh the status of live invoices (e.g. flip ISSUED → OVERDUE once
 * the grace period lapses, or → PARTIALLY_PAID/PAID as allocations land).
 * Runs daily via the cron. Skips frozen statuses. Returns the number changed.
 */
export async function refreshInvoiceStatuses(today = new Date()): Promise<{ updated: number }> {
  const invoices = await prisma.rentInvoice.findMany({
    where: { status: { in: ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'OVERDUE', 'IN_ARREARS'] } },
    select: {
      id: true,
      rentAmount: true,
      gracePeriodDays: true,
      dueDate: true,
      status: true,
      allocations: { where: { target: 'RENT' }, select: { amount: true } },
    },
  })

  let updated = 0
  for (const inv of invoices) {
    const allocatedRent = inv.allocations.reduce((s, a) => s + Number(a.amount), 0)
    const next = deriveInvoiceStatus(
      {
        rentAmount: Number(inv.rentAmount),
        gracePeriodDays: inv.gracePeriodDays,
        dueDate: inv.dueDate,
        currentStatus: inv.status,
      },
      allocatedRent,
      today
    )
    if (next !== inv.status) {
      await prisma.rentInvoice.update({ where: { id: inv.id }, data: { status: next as any } })
      updated++
    }
  }
  return { updated }
}
