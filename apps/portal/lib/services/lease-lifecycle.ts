import { prisma } from '@/lib/db'

/**
 * Runs two lifecycle transitions that keep lease statuses current:
 *
 * 1. **Auto-expire** — any ACTIVE lease whose endDate has passed → EXPIRED.
 * 2. **Auto-promote** — any PENDING lease that is fully signed AND whose
 *    startDate has arrived AND whose predecessor (same tenant + unit) was
 *    already EXPIRED *before* this cycle ran → promoted to ACTIVE.
 *
 * Critically, a PENDING lease will never promote in the same cycle that
 * expires its predecessor. The active lease must have been expired in a
 * prior request. This prevents an active lease from being overwritten
 * in a single pass.
 *
 * Call this at the top of any lease-reading endpoint so the UI always
 * reflects the true state without a cron job.
 */
export async function runLeaseLifecycle() {
  const now = new Date()

  // ── Step 1: Identify which ACTIVE leases are about to expire ──
  // We record their IDs so Step 2 can exclude them.
  const aboutToExpire = await prisma.lease.findMany({
    where: {
      status: 'ACTIVE',
      endDate: { lt: now },
    },
    select: { id: true },
  })
  const expiringIds = aboutToExpire.map((l) => l.id)

  // Expire them
  if (expiringIds.length > 0) {
    await prisma.lease.updateMany({
      where: { id: { in: expiringIds } },
      data: { status: 'EXPIRED' },
    })
  }

  // ── Step 2: Promote signed PENDING leases ──
  // Only if no ACTIVE lease exists for the same tenant+unit
  // AND the predecessor was NOT just expired in Step 1 above.
  const readyToPromote = await prisma.lease.findMany({
    where: {
      status: 'PENDING',
      startDate: { lte: now },
      tenantSignedAt: { not: null },
      landlordSignedAt: { not: null },
    },
    select: {
      id: true,
      tenantId: true,
      unitId: true,
    },
  })

  for (const lease of readyToPromote) {
    if (!lease.unitId) continue

    // Block promotion if the predecessor was just expired this cycle
    const justExpiredPredecessor = await prisma.lease.count({
      where: {
        id: { in: expiringIds },
        tenantId: lease.tenantId,
        unitId: lease.unitId,
      },
    })
    if (justExpiredPredecessor > 0) continue

    // Block promotion if there is still an ACTIVE lease for this tenant+unit
    const activeCount = await prisma.lease.count({
      where: {
        id: { not: lease.id },
        tenantId: lease.tenantId,
        unitId: lease.unitId,
        status: 'ACTIVE',
      },
    })
    if (activeCount > 0) continue

    await prisma.$transaction([
      prisma.lease.update({
        where: { id: lease.id },
        data: { status: 'ACTIVE' },
      }),
      prisma.tenant.update({
        where: { id: lease.tenantId },
        data: { status: 'ACTIVE' },
      }),
      prisma.leaseRenewal.updateMany({
        where: {
          newLeaseId: lease.id,
          status: { not: 'RENEWED' },
        },
        data: { status: 'RENEWED' },
      }),
    ])
  }
}
