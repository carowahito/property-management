import { prisma } from '@/lib/db'

// ============================================================================
// Arrears snapshot (SOP 004 / BR-1b)
// The live arrears position for a lease, presented on the invoice and on
// arrears notices as ONE consistent set of figures:
//   (a) current month's rent, (b) unpaid rent brought forward (itemised by
//   period), (c) penalties accrued to date, and the total due.
// This is a PRESENTATION of amounts already owned by their original invoices
// and the arrears case — it is not a re-bill, so there is no double-counting.
// ============================================================================

export interface ArrearsSnapshot {
  currentRent: number
  broughtForward: { period: string; amount: number }[]
  broughtForwardTotal: number
  penaltyAccrued: number
  totalDue: number
  /** true when there is anything beyond the current month's rent to show. */
  hasArrears: boolean
}

function balanceOf(inv: { rentAmount: any; allocations: { amount: any }[] }): number {
  const allocated = inv.allocations.reduce((s, a) => s + Number(a.amount), 0)
  return Number(inv.rentAmount) - allocated
}

/**
 * Compute the arrears snapshot for a lease as at a given invoice (the current
 * period). `currentRent` is that invoice's outstanding balance; brought-forward
 * lists earlier unpaid invoices; penalty comes from the active arrears case.
 */
export async function computeArrearsSnapshot(leaseId: string, currentInvoiceId: string): Promise<ArrearsSnapshot> {
  const current = await prisma.rentInvoice.findUnique({
    where: { id: currentInvoiceId },
    select: { period: true, rentAmount: true, allocations: { where: { target: 'RENT' }, select: { amount: true } } },
  })
  const currentRent = current ? balanceOf(current) : 0

  const priors = current
    ? await prisma.rentInvoice.findMany({
        where: {
          leaseId,
          period: { lt: current.period },
          status: { notIn: ['PAID', 'WRITTEN_OFF'] },
        },
        orderBy: { period: 'asc' },
        select: { period: true, rentAmount: true, allocations: { where: { target: 'RENT' }, select: { amount: true } } },
      })
    : []

  const broughtForward = priors
    .map((inv) => ({ period: inv.period, amount: balanceOf(inv) }))
    .filter((b) => b.amount > 0)
  const broughtForwardTotal = broughtForward.reduce((s, b) => s + b.amount, 0)

  // Penalty accrued to date — from the active arrears case (agent income; BR-2).
  const activeCase = await prisma.arrearsEscalation.findFirst({
    where: { leaseId, isActive: true },
    select: { penaltyAccrued: true },
  })
  const penaltyAccrued = activeCase ? Number(activeCase.penaltyAccrued) : 0

  const totalDue = currentRent + broughtForwardTotal + penaltyAccrued

  return {
    currentRent,
    broughtForward,
    broughtForwardTotal,
    penaltyAccrued,
    totalDue,
    hasArrears: broughtForwardTotal > 0 || penaltyAccrued > 0,
  }
}
