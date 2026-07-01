import { prisma } from '@/lib/db'

const typeLabels: Record<string, string> = {
  RENT: 'Rent',
  DEPOSIT: 'Deposit',
  LATE_FEE: 'Late Fee',
  UTILITY: 'Utility',
  MAINTENANCE: 'Maintenance',
  OTHER: 'Other',
}

/**
 * Ensures a PAID payment has a corresponding TenantLedger PAYMENT entry,
 * mirroring the entry created by the M-Pesa reconciliation flow, so manually
 * recorded payments also appear on the tenant's Statement of Account.
 * No-ops for non-PAID payments or payments without a resolvable lease+unit
 * (e.g. a deposit recorded before a lease exists), since TenantLedger rows
 * are inherently lease/unit-scoped.
 */
export async function syncPaymentToLedger(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      tenantId: true,
      leaseId: true,
      unitId: true,
      amount: true,
      type: true,
      status: true,
      dueDate: true,
      paidDate: true,
      reference: true,
      lease: { select: { unitId: true } },
    },
  })

  if (!payment || payment.status !== 'PAID') return null

  const leaseId = payment.leaseId
  const unitId = payment.unitId || payment.lease?.unitId

  if (!leaseId || !unitId) return null

  const existing = await prisma.tenantLedger.findFirst({
    where: { paymentId: payment.id },
    select: { id: true },
  })
  if (existing) return existing

  const lastEntry = await prisma.tenantLedger.findFirst({
    where: { tenantId: payment.tenantId },
    orderBy: [{ date: 'desc' }, { type: 'desc' }],
    select: { balance: true },
  })

  const amount = Number(payment.amount)
  const currentBalance = Number(lastEntry?.balance ?? 0)
  const newBalance = currentBalance - amount

  const typeLabel = typeLabels[payment.type] || payment.type
  const monthYear = payment.dueDate
    ? new Date(payment.dueDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null
  const description = payment.reference
    ? `${typeLabel}${monthYear ? ` - ${monthYear}` : ''} (${payment.reference})`
    : `${typeLabel}${monthYear ? ` - ${monthYear}` : ''}`

  return prisma.tenantLedger.create({
    data: {
      tenantId: payment.tenantId,
      leaseId,
      unitId,
      date: payment.paidDate || payment.dueDate,
      type: 'PAYMENT',
      description,
      reference: payment.reference || undefined,
      debit: 0,
      credit: amount,
      balance: newBalance,
      paymentId: payment.id,
    },
  })
}
