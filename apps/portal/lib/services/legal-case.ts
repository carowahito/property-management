import { prisma } from '@/lib/db'

// ============================================================================
// Legal/Dispute case (SOP 004 / BR-7)
// When an arrears case is referred to legal (Day 35+), open a Legal/Dispute
// record with the full document bundle (notices, comms log, payment history,
// statement of account) so the handoff to the SOP 014 track is self-contained.
// Penalties are carried as the AGENT's claim, never the landlord's (BR-2).
// ============================================================================

export async function openLegalCaseForArrears(arrearsId: string, openedBy?: string) {
  const arrears = await prisma.arrearsEscalation.findUnique({
    where: { id: arrearsId },
    include: {
      tenant: { select: { id: true, name: true, companyId: true, email: true, phone: true } },
      lease: { select: { id: true, monthlyRent: true } },
      property: { select: { id: true, name: true } },
    },
  })
  if (!arrears) throw new Error('Arrears record not found')

  // One legal case per arrears record — return the existing one if already open.
  const existing = await prisma.legalCase.findUnique({ where: { arrearsEscalationId: arrearsId } })
  if (existing) return existing

  // Payment history for the lease (bounded snapshot for the bundle).
  const payments = await prisma.payment.findMany({
    where: { leaseId: arrears.leaseId },
    orderBy: { dueDate: 'desc' },
    take: 100,
    select: {
      id: true, amount: true, type: true, status: true,
      dueDate: true, paidDate: true, reference: true, method: true,
    },
  })

  const rentOutstanding = Number(arrears.amountOwed)
  const penaltyAccrued = Number(arrears.penaltyAccrued)

  const documentBundle = {
    generatedAt: new Date().toISOString(),
    tenant: { id: arrears.tenant.id, name: arrears.tenant.name, email: arrears.tenant.email, phone: arrears.tenant.phone },
    property: { id: arrears.property.id, name: arrears.property.name },
    statementOfAccount: {
      rentOutstanding,
      penaltyAccrued, // the agent's claim (BR-2)
      totalDue: rentOutstanding + penaltyAccrued,
      daysOverdue: arrears.daysOverdue,
    },
    notices: {
      reminderSentAt: arrears.reminderSentAt,
      notice1SentAt: arrears.notice1SentAt,
      notice2SentAt: arrears.notice2SentAt,
      formalNoticeAt: arrears.formalNoticeAt,
      recordedDeliveryRef: arrears.recordedDeliveryRef,
      consultationConfirmed: arrears.consultationConfirmed,
      directorApprovedBy: arrears.directorApprovedBy,
      directorApprovedAt: arrears.directorApprovedAt,
    },
    commsLog: arrears.contactAttempts ?? [],
    paymentHistory: payments,
  }

  return prisma.legalCase.create({
    data: {
      companyId: arrears.tenant.companyId,
      leaseId: arrears.leaseId,
      tenantId: arrears.tenantId,
      propertyId: arrears.propertyId,
      arrearsEscalationId: arrears.id,
      status: 'OPEN',
      amountClaimed: rentOutstanding,
      penaltyClaimed: penaltyAccrued,
      documentBundle,
      openedBy: openedBy ?? null,
    },
  })
}
