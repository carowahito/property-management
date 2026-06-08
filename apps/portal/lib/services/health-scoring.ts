/**
 * SOP 015 — Monthly Portfolio Health Review
 * Exact scoring matrix as defined in the Jabin Master SOP Manual v1.1
 */
import { prisma } from '@/lib/db'

type RiskScore = 'GREEN' | 'AMBER' | 'RED'

interface DimensionResult {
  score: RiskScore
  notes: string
  rawValue?: number
}

interface TenancyHealthResult {
  tenantId: string
  leaseId: string
  propertyId: string
  monthlyRent: number
  payment: DimensionResult
  arrears: DimensionResult
  contact: DimensionResult
  inspection: DimensionResult
  overallRisk: RiskScore
  redCount: number
  flaggedForDirector: boolean
  recommendedAction: string
  // Snapshot data
  latePaymentCount: number
  currentBalance: number
  daysSinceContact: number | null
  daysSinceInspection: number | null
}

// ─── Dimension 1: Payment record (12 months) ───────────────────────────────
async function scorePayments(
  tenantId: string,
  leaseId: string,
  monthlyRent: number
): Promise<DimensionResult & { latePaymentCount: number }> {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

  // Count LATE_FEE entries in ledger = late payment events
  const lateFees = await prisma.tenantLedger.count({
    where: {
      tenantId,
      leaseId,
      type: 'LATE_FEE',
      date: { gte: twelveMonthsAgo },
    },
  })

  // Check for any current arrears (positive balance on most recent ledger entry)
  const latestEntry = await prisma.tenantLedger.findFirst({
    where: { tenantId, leaseId },
    orderBy: { date: 'desc' },
    select: { balance: true },
  })
  const currentBalance = Number(latestEntry?.balance ?? 0)
  const hasCurrentArrears = currentBalance > 0

  let score: RiskScore
  let notes: string

  if (hasCurrentArrears || lateFees >= 4) {
    score = 'RED'
    notes = hasCurrentArrears
      ? `Current arrears present + ${lateFees} late payment(s) in 12 months`
      : `${lateFees} late payments in 12 months (threshold: 4+)`
  } else if (lateFees >= 2) {
    score = 'AMBER'
    notes = `${lateFees} late payments in 12 months (threshold: 2–3)`
  } else {
    score = 'GREEN'
    notes = lateFees === 0 ? 'No late payments in 12 months' : '1 late payment in 12 months'
  }

  return { score, notes, latePaymentCount: lateFees, rawValue: lateFees }
}

// ─── Dimension 2: Current arrears balance ─────────────────────────────────
async function scoreArrears(
  tenantId: string,
  leaseId: string,
  monthlyRent: number
): Promise<DimensionResult & { currentBalance: number }> {
  const latestEntry = await prisma.tenantLedger.findFirst({
    where: { tenantId, leaseId },
    orderBy: { date: 'desc' },
    select: { balance: true },
  })
  const balance = Math.max(0, Number(latestEntry?.balance ?? 0))

  // Also check active arrears escalation
  const activeArrears = await prisma.arrearsEscalation.findFirst({
    where: { tenantId, leaseId, isActive: true },
    select: { amountOwed: true },
  })
  const arrearsAmount = activeArrears ? Number(activeArrears.amountOwed) : balance

  let score: RiskScore
  let notes: string

  if (arrearsAmount > monthlyRent) {
    score = 'RED'
    notes = `KES ${arrearsAmount.toLocaleString()} outstanding — exceeds 1 month's rent`
  } else if (arrearsAmount > 0) {
    score = 'AMBER'
    notes = `KES ${arrearsAmount.toLocaleString()} outstanding — within 1 month's rent`
  } else {
    score = 'GREEN'
    notes = 'No outstanding arrears'
  }

  return { score, notes, currentBalance: arrearsAmount, rawValue: arrearsAmount }
}

// ─── Dimension 3: Last confirmed contact ──────────────────────────────────
async function scoreContact(
  tenantId: string
): Promise<DimensionResult & { daysSinceContact: number | null }> {
  // Check most recent message
  const latestMessage = await prisma.message.findFirst({
    where: {
      stakeholderId: tenantId,
      stakeholderType: 'TENANT',
    },
    orderBy: { sentAt: 'desc' },
    select: { sentAt: true },
  })

  // Also check arrears escalation lastContactAt
  const arrearsContact = await prisma.arrearsEscalation.findFirst({
    where: { tenantId, isActive: true },
    orderBy: { lastContactAt: 'desc' },
    select: { lastContactAt: true },
  })

  const dates = [
    latestMessage?.sentAt,
    arrearsContact?.lastContactAt,
  ].filter(Boolean) as Date[]

  const mostRecent = dates.length > 0
    ? new Date(Math.max(...dates.map((d) => d.getTime())))
    : null

  const daysSince = mostRecent
    ? Math.floor((Date.now() - mostRecent.getTime()) / 86400000)
    : null

  let score: RiskScore
  let notes: string

  if (daysSince === null) {
    score = 'RED'
    notes = 'No contact on record'
  } else if (daysSince > 60) {
    score = 'RED'
    notes = `${daysSince} days since last contact (threshold: 60+)`
  } else if (daysSince > 30) {
    score = 'AMBER'
    notes = `${daysSince} days since last contact (threshold: 31–60)`
  } else {
    score = 'GREEN'
    notes = `Last contact ${daysSince} day(s) ago`
  }

  return { score, notes, daysSinceContact: daysSince, rawValue: daysSince ?? 999 }
}

// ─── Dimension 4: Last physical inspection ────────────────────────────────
async function scoreInspection(
  tenantId: string,
  propertyId: string
): Promise<DimensionResult & { daysSinceInspection: number | null }> {
  const latestInspection = await prisma.inspection.findFirst({
    where: {
      tenantId,
      propertyId,
      status: 'COMPLETED',
    },
    orderBy: { completedDate: 'desc' },
    select: { completedDate: true },
  })

  const daysSince = latestInspection?.completedDate
    ? Math.floor((Date.now() - latestInspection.completedDate.getTime()) / 86400000)
    : null

  let score: RiskScore
  let notes: string

  if (daysSince === null) {
    score = 'RED'
    notes = 'No completed inspection on record'
  } else if (daysSince > 120) {
    score = 'RED'
    notes = `${daysSince} days since last inspection (threshold: 120+)`
  } else if (daysSince > 90) {
    score = 'AMBER'
    notes = `${daysSince} days since last inspection (threshold: 91–120)`
  } else {
    score = 'GREEN'
    notes = `Last inspection ${daysSince} day(s) ago`
  }

  return { score, notes, daysSinceInspection: daysSince, rawValue: daysSince ?? 999 }
}

// ─── Full tenancy scoring ──────────────────────────────────────────────────
export async function scoreTenancy(
  tenantId: string,
  leaseId: string,
  propertyId: string,
  monthlyRent: number
): Promise<TenancyHealthResult> {
  const [payment, arrears, contact, inspection] = await Promise.all([
    scorePayments(tenantId, leaseId, monthlyRent),
    scoreArrears(tenantId, leaseId, monthlyRent),
    scoreContact(tenantId),
    scoreInspection(tenantId, propertyId),
  ])

  const scores = [payment.score, arrears.score, contact.score, inspection.score]
  const redCount = scores.filter((s) => s === 'RED').length
  const amberCount = scores.filter((s) => s === 'AMBER').length

  const overallRisk: RiskScore =
    redCount >= 2 ? 'RED' : redCount === 1 || amberCount >= 2 ? 'AMBER' : 'GREEN'

  const flaggedForDirector = redCount >= 2

  // Build recommended action
  const actions: string[] = []
  if (payment.score === 'RED') actions.push('Issue arrears notice and notify landlord')
  if (arrears.score === 'RED') actions.push('Escalate arrears — consider legal referral')
  if (contact.score === 'RED') actions.push('Attempt immediate contact; flag unreachable if no response in 7 days')
  if (inspection.score === 'RED') actions.push('Schedule urgent inspection')
  if (payment.score === 'AMBER') actions.push('Send payment reminder')
  if (contact.score === 'AMBER') actions.push('Schedule follow-up contact')
  if (inspection.score === 'AMBER') actions.push('Schedule routine inspection')
  if (flaggedForDirector) actions.unshift('Director review required — renewal offer blocked')

  return {
    tenantId,
    leaseId,
    propertyId,
    monthlyRent,
    payment,
    arrears,
    contact,
    inspection,
    overallRisk,
    redCount,
    flaggedForDirector,
    recommendedAction: actions.join('. ') || 'No action required',
    latePaymentCount: payment.latePaymentCount,
    currentBalance: arrears.currentBalance,
    daysSinceContact: contact.daysSinceContact,
    daysSinceInspection: inspection.daysSinceInspection,
  }
}
