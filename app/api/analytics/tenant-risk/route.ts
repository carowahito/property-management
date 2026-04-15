import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/analytics/tenant-risk
 *
 * Analyses the tenant_ledger to compute per-tenant risk scores.
 * Returns tenants sorted by risk (worst first) with:
 *   - current balance (arrears or credit)
 *   - days since last payment
 *   - payment pattern score (on-time %, late %, missed %)
 *   - risk level (CRITICAL / HIGH / MEDIUM / LOW)
 *   - recommended action
 */
export async function GET() {
  try {
    // ── 1. Pull every tenant with their latest ledger balance ────────────
    const tenants = await prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
      include: {
        property: { select: { name: true } },
        unitRef: { select: { unitNumber: true, monthlyRent: true } },
        leases: {
          where: { status: 'ACTIVE' },
          select: { id: true, startDate: true, endDate: true, monthlyRent: true, terms: true },
          take: 1,
        },
      },
    });

    const results = await Promise.all(
      tenants.map(async (tenant) => {
        // All ledger entries for this tenant, ordered chronologically
        const ledger = await prisma.tenantLedger.findMany({
          where: { tenantId: tenant.id },
          orderBy: [{ date: 'asc' }, { type: 'asc' }],
        });

        if (ledger.length === 0) {
          return {
            tenantId: tenant.id,
            tenantName: tenant.name,
            unit: tenant.unitRef?.unitNumber ?? tenant.unit ?? '—',
            property: tenant.property.name,
            monthlyRent: Number(tenant.unitRef?.monthlyRent ?? 0),
            currentBalance: 0,
            daysSinceLastPayment: null,
            lastPaymentDate: null,
            lastPaymentAmount: null,
            totalCharged: 0,
            totalPaid: 0,
            monthsCharged: 0,
            monthsPaidOnTime: 0,
            monthsPaidLate: 0,
            monthsMissed: 0,
            averageDaysLate: 0,
            riskScore: 0,
            riskLevel: 'LOW' as const,
            riskFactors: [] as string[],
            recommendedAction: 'No action needed',
          };
        }

        // Current balance = last entry's balance
        const currentBalance = Number(ledger[ledger.length - 1].balance);

        // Payment entries
        const payments = ledger.filter((e) => e.type === 'PAYMENT');
        const charges = ledger.filter((e) => e.type === 'CHARGE');

        // Last payment info
        const lastPayment = payments.length > 0 ? payments[payments.length - 1] : null;
        const daysSinceLastPayment = lastPayment
          ? Math.floor((Date.now() - new Date(lastPayment.date).getTime()) / 86400000)
          : null;

        // Totals
        const totalCharged = charges.reduce((s, e) => s + Number(e.debit), 0);
        const totalPaid = payments.reduce((s, e) => s + Number(e.credit), 0);
        const monthsCharged = charges.length;

        // Analyse payment pattern per rent month:
        // For each CHARGE, check if it was covered (balance went to 0 or negative)
        // by looking at the balance after the next entries within the same month window
        const monthlyRent = Number(tenant.unitRef?.monthlyRent ?? 0);
        let monthsPaidOnTime = 0;
        let monthsPaidLate = 0;
        let monthsMissed = 0;
        let totalDaysLate = 0;
        let lateCount = 0;

        for (const charge of charges) {
          const chargeDate = new Date(charge.date);
          const dueDay = chargeDate.getDate(); // typically 5th
          const monthEnd = new Date(chargeDate.getFullYear(), chargeDate.getMonth() + 1, 0);

          // Find the next payment after this charge that brought balance <= 0
          const coveringPayment = payments.find((p) => {
            const pDate = new Date(p.date);
            return pDate >= chargeDate && Number(p.balance) <= 0;
          });

          if (!coveringPayment) {
            // Check if a later charge absorbed credit (balance stayed 0)
            const nextEntry = ledger.find(
              (e) => new Date(e.date) > chargeDate && e.id !== charge.id
            );
            if (nextEntry && Number(charge.balance) <= 0) {
              monthsPaidOnTime++;
            } else if (currentBalance > 0 && new Date(charge.date) < new Date()) {
              // Still unpaid
              monthsMissed++;
            }
          } else {
            const paidDate = new Date(coveringPayment.date);
            const daysAfterDue = Math.floor(
              (paidDate.getTime() - chargeDate.getTime()) / 86400000
            );

            if (daysAfterDue <= 5) {
              monthsPaidOnTime++;
            } else {
              monthsPaidLate++;
              totalDaysLate += daysAfterDue;
              lateCount++;
            }
          }
        }

        const averageDaysLate = lateCount > 0 ? Math.round(totalDaysLate / lateCount) : 0;

        // ── Risk scoring (0-100, higher = worse) ──────────────────────────
        let riskScore = 0;
        const riskFactors: string[] = [];

        // Factor 1: Current arrears (0-40 points)
        if (currentBalance > 0 && monthlyRent > 0) {
          const monthsOwed = currentBalance / monthlyRent;
          const arrearsPoints = Math.min(40, monthsOwed * 13);
          riskScore += arrearsPoints;
          if (monthsOwed >= 3) riskFactors.push(`${monthsOwed.toFixed(1)} months arrears (KES ${currentBalance.toLocaleString()})`);
          else if (monthsOwed >= 1) riskFactors.push(`${monthsOwed.toFixed(1)} months arrears`);
        }

        // Factor 2: Days since last payment (0-25 points)
        if (daysSinceLastPayment !== null) {
          if (daysSinceLastPayment > 90) {
            riskScore += 25;
            riskFactors.push(`No payment in ${daysSinceLastPayment} days`);
          } else if (daysSinceLastPayment > 60) {
            riskScore += 18;
            riskFactors.push(`Last payment ${daysSinceLastPayment} days ago`);
          } else if (daysSinceLastPayment > 35) {
            riskScore += 10;
            riskFactors.push(`Last payment ${daysSinceLastPayment} days ago`);
          }
        }

        // Factor 3: Payment pattern (0-20 points)
        if (monthsCharged > 0) {
          const missedRate = monthsMissed / monthsCharged;
          const lateRate = monthsPaidLate / monthsCharged;
          riskScore += Math.min(20, missedRate * 30 + lateRate * 10);
          if (missedRate > 0.3) riskFactors.push(`${Math.round(missedRate * 100)}% of months missed`);
          if (lateRate > 0.5) riskFactors.push(`${Math.round(lateRate * 100)}% of payments late`);
        }

        // Factor 4: Worsening trend (0-15 points)
        // Check if the last 3 charges have all gone unpaid
        const recentCharges = charges.slice(-3);
        const recentUnpaid = recentCharges.filter((c) => Number(c.balance) > 0).length;
        if (recentUnpaid >= 3) {
          riskScore += 15;
          riskFactors.push('Declining pattern: last 3+ months unpaid');
        } else if (recentUnpaid >= 2) {
          riskScore += 8;
          riskFactors.push('2 of last 3 months unpaid');
        }

        // Risk level
        let riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
        if (riskScore >= 60) riskLevel = 'CRITICAL';
        else if (riskScore >= 40) riskLevel = 'HIGH';
        else if (riskScore >= 20) riskLevel = 'MEDIUM';
        else riskLevel = 'LOW';

        // Recommended action
        let recommendedAction: string;
        if (riskLevel === 'CRITICAL') {
          recommendedAction = 'Issue formal demand notice. Consider legal referral.';
        } else if (riskLevel === 'HIGH') {
          recommendedAction = 'Escalate: phone call + written notice. Notify landlord.';
        } else if (riskLevel === 'MEDIUM') {
          recommendedAction = 'Send payment reminder. Schedule follow-up.';
        } else {
          recommendedAction = 'No action needed';
        }

        return {
          tenantId: tenant.id,
          tenantName: tenant.name,
          unit: tenant.unitRef?.unitNumber ?? tenant.unit ?? '—',
          property: tenant.property.name,
          monthlyRent,
          currentBalance,
          daysSinceLastPayment,
          lastPaymentDate: lastPayment ? lastPayment.date : null,
          lastPaymentAmount: lastPayment ? Number(lastPayment.credit) : null,
          totalCharged,
          totalPaid,
          monthsCharged,
          monthsPaidOnTime,
          monthsPaidLate,
          monthsMissed,
          averageDaysLate,
          riskScore: Math.round(riskScore),
          riskLevel,
          riskFactors,
          recommendedAction,
        };
      })
    );

    // Sort by risk score descending
    results.sort((a, b) => b.riskScore - a.riskScore);

    // Summary stats
    const summary = {
      totalTenants: results.length,
      critical: results.filter((r) => r.riskLevel === 'CRITICAL').length,
      high: results.filter((r) => r.riskLevel === 'HIGH').length,
      medium: results.filter((r) => r.riskLevel === 'MEDIUM').length,
      low: results.filter((r) => r.riskLevel === 'LOW').length,
      totalArrears: results.reduce((s, r) => s + Math.max(0, r.currentBalance), 0),
      totalCollected: results.reduce((s, r) => s + r.totalPaid, 0),
      averageCollectionRate:
        results.length > 0
          ? Math.round(
              (results.reduce((s, r) => s + (r.totalCharged > 0 ? r.totalPaid / r.totalCharged : 1), 0) /
                results.length) *
                100
            )
          : 100,
    };

    return NextResponse.json({ summary, tenants: results, success: true });
  } catch (error) {
    console.error('Error computing tenant risk:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to compute risk' },
      { status: 500 }
    );
  }
}
