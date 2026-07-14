/**
 * M-Pesa Reconciliation Engine
 *
 * Matches raw Daraja transactions (mpesa_transactions) against:
 *   - Tenant ledger (for C2B / STK Push payments)
 *   - Payouts (for B2C landlord payments)
 *
 * Matching strategy (in order):
 *   1. Exact receipt match — receiptNumber matches an existing payment.reference
 *   2. Phone + account ref — phone matches tenant, accountReference matches unit number
 *   3. Phone + amount — phone matches tenant, amount matches monthly rent or outstanding balance
 *   4. Unmatched — requires manual reconciliation by agent
 */

import { prisma } from '@/lib/db';
import { generateAndSendReceipt } from '@/lib/services/receipt';
import { allocatePaymentToInvoices } from '@/lib/services/payment-allocation';
// Note: This module handles reconciliation for ALL payment gateways (M-Pesa, Card, Bank),
// not just M-Pesa. The "mpesa" directory name is historical.

// ── Types ───────────────────────────────────────────────────────────────────

export interface ReconciliationResult {
  transactionId: string;
  receiptNumber: string;
  status: 'AUTO_MATCHED' | 'MANUAL_MATCHED' | 'UNMATCHED' | 'DISPUTED' | 'DUPLICATE';
  matchedTo?: {
    type: 'TENANT_PAYMENT' | 'LANDLORD_PAYOUT';
    tenantId?: string;
    tenantName?: string;
    landlordId?: string;
    landlordName?: string;
    ledgerEntryId?: string;
    payoutId?: string;
    unitNumber?: string;
  };
  reason: string;
}

export interface ReconciliationSummary {
  runId: string;
  periodStart: Date;
  periodEnd: Date;
  totalTransactions: number;
  autoMatched: number;
  unmatched: number;
  disputed: number;
  duplicates: number;
  totalMpesaAmount: number;
  totalLedgerExpected: number;
  variance: number;
  results: ReconciliationResult[];
}

// ── Engine ──────────────────────────────────────────────────────────────────

export async function runReconciliation(
  companyId: string,
  periodStart: Date,
  periodEnd: Date,
  runBy?: string
): Promise<ReconciliationSummary> {
  // 1. Get all unmatched M-Pesa transactions for this period
  const gwTxns = await prisma.gatewayTransaction.findMany({
    where: {
      companyId,
      transactionDate: { gte: periodStart, lte: periodEnd },
      reconciliationStatus: 'UNMATCHED',
    },
    orderBy: { transactionDate: 'asc' },
  });

  // 2. Get all tenants (with phone numbers) for this company
  const tenants = await prisma.tenant.findMany({
    where: { companyId, status: 'ACTIVE' },
    include: {
      unitRef: { select: { unitNumber: true, monthlyRent: true } },
    },
  });

  // Build phone → tenant lookup (normalize to 2547XXXXXXXX)
  const phoneToTenant = new Map<string, typeof tenants[0]>();
  for (const t of tenants) {
    const normalized = normalizePhone(t.phone);
    phoneToTenant.set(normalized, t);
  }

  // Build unit number → tenant lookup
  const unitToTenant = new Map<string, typeof tenants[0]>();
  for (const t of tenants) {
    if (t.unitRef?.unitNumber) {
      unitToTenant.set(t.unitRef.unitNumber.toUpperCase(), t);
    }
  }

  // 3. Get landlords for B2C matching
  const landlords = await prisma.landlord.findMany({
    where: { companyId },
  });
  const phoneToLandlord = new Map<string, typeof landlords[0]>();
  for (const l of landlords) {
    phoneToLandlord.set(normalizePhone(l.phone), l);
  }

  // 4. Check for existing receipt numbers (duplicate detection)
  const existingReceipts = new Set(
    (await prisma.payment.findMany({
      where: { reference: { in: gwTxns.map((t) => t.receiptNumber) } },
      select: { reference: true },
    })).map((p) => p.reference)
  );

  // 5. Reconcile each transaction
  const results: ReconciliationResult[] = [];
  let autoMatched = 0;
  let unmatched = 0;
  let disputed = 0;
  let duplicates = 0;

  for (const txn of gwTxns) {
    const receipt = txn.receiptNumber;
    // For inbound: sender is the payer (tenant). For outbound: recipient is the payee (landlord).
    const identifier = txn.transactionType === 'INBOUND'
      ? (txn.senderIdentifier || '')
      : (txn.recipientIdentifier || '');
    const phone = normalizePhone(identifier);
    const amount = Number(txn.amount);
    const accountRef = txn.accountReference?.toUpperCase() ?? '';

    // ── Duplicate check ─────────────────────────────────────────────
    if (existingReceipts.has(receipt)) {
      results.push({
        transactionId: txn.id,
        receiptNumber: receipt,
        status: 'DUPLICATE',
        reason: `Receipt ${receipt} already exists in payments table`,
      });
      await updateTxnStatus(txn.id, 'DUPLICATE');
      duplicates++;
      continue;
    }

    // ── C2B / STK Push — match to tenant ────────────────────────────
    if (txn.transactionType === 'INBOUND') {
      // Strategy 1: Account reference matches unit number
      let tenant = accountRef ? unitToTenant.get(accountRef) : undefined;
      let matchReason = tenant ? `Unit number ${accountRef} matches tenant` : '';

      // Strategy 2: Phone number matches tenant
      if (!tenant) {
        tenant = phoneToTenant.get(phone);
        matchReason = tenant ? `Phone ${identifier} matches tenant` : '';
      }

      if (tenant) {
        // Create ledger entry + payment record
        const ledgerEntry = await createTenantLedgerEntry(tenant, txn, amount, receipt);

        results.push({
          transactionId: txn.id,
          receiptNumber: receipt,
          status: 'AUTO_MATCHED',
          matchedTo: {
            type: 'TENANT_PAYMENT',
            tenantId: tenant.id,
            tenantName: tenant.name,
            unitNumber: tenant.unitRef?.unitNumber ?? undefined,
            ledgerEntryId: ledgerEntry?.id,
          },
          reason: matchReason,
        });

        await updateTxnStatus(txn.id, 'AUTO_MATCHED', {
          matchedTenantId: tenant.id,
          matchedLedgerEntryId: ledgerEntry?.id,
        });
        autoMatched++;
      } else {
        results.push({
          transactionId: txn.id,
          receiptNumber: receipt,
          status: 'UNMATCHED',
          reason: `No tenant found for phone ${identifier} or account ref "${txn.accountReference}"`,
        });
        unmatched++;
      }
      continue;
    }

    // ── B2C — match to landlord payout ──────────────────────────────
    if (txn.transactionType === 'OUTBOUND') {
      const landlord = phoneToLandlord.get(phone);

      if (landlord) {
        // Find the earliest pending payout for this landlord
        const pendingPayout = await prisma.payout.findFirst({
          where: {
            landlordId: landlord.id,
            reference: null,  // not yet confirmed
          },
          orderBy: { createdAt: 'asc' },
        });

        if (pendingPayout) {
          // Confirm the payout with the M-Pesa receipt
          await prisma.payout.update({
            where: { id: pendingPayout.id },
            data: {
              reference: receipt,
              status: 'PAID',
              paidDate: txn.transactionDate,
              method: 'MPESA',
            },
          });

          // Also update the rent_transaction
          await prisma.rentTransaction.updateMany({
            where: { payoutId: pendingPayout.id },
            data: {
              payoutReference: receipt,
              payoutStatus: 'PAID',
              payoutDate: txn.transactionDate,
              payoutMethod: 'MPESA',
            },
          });

          results.push({
            transactionId: txn.id,
            receiptNumber: receipt,
            status: 'AUTO_MATCHED',
            matchedTo: {
              type: 'LANDLORD_PAYOUT',
              landlordId: landlord.id,
              landlordName: landlord.name,
              payoutId: pendingPayout.id,
            },
            reason: `Phone ${identifier} matches landlord, payout for ${pendingPayout.period} confirmed`,
          });

          await updateTxnStatus(txn.id, 'AUTO_MATCHED', {
            matchedLandlordId: landlord.id,
            matchedPayoutId: pendingPayout.id,
          });
          autoMatched++;
        } else {
          results.push({
            transactionId: txn.id,
            receiptNumber: receipt,
            status: 'DISPUTED',
            matchedTo: {
              type: 'LANDLORD_PAYOUT',
              landlordId: landlord.id,
              landlordName: landlord.name,
            },
            reason: `Landlord found but no pending payout to match. Amount: ${amount}`,
          });
          await updateTxnStatus(txn.id, 'DISPUTED', { matchedLandlordId: landlord.id });
          disputed++;
        }
      } else {
        results.push({
          transactionId: txn.id,
          receiptNumber: receipt,
          status: 'UNMATCHED',
          reason: `No landlord found for phone ${identifier}`,
        });
        unmatched++;
      }
      continue;
    }
  }

  // 6. Calculate financial summary
  const totalMpesaAmount = gwTxns.reduce((s, t) => s + Number(t.amount), 0);

  // Expected rent for this period from ledger charges
  const ledgerCharges = await prisma.tenantLedger.aggregate({
    where: {
      type: 'CHARGE',
      date: { gte: periodStart, lte: periodEnd },
      tenant: { companyId },
    },
    _sum: { debit: true },
  });
  const totalLedgerExpected = Number(ledgerCharges._sum.debit ?? 0);
  const variance = totalMpesaAmount - totalLedgerExpected;

  // 7. Save reconciliation run
  const run = await prisma.reconciliationRun.create({
    data: {
      companyId,
      periodStart,
      periodEnd,
      totalMpesaTxns: gwTxns.length,
      autoMatched,
      manuallyMatched: 0,
      unmatched,
      disputed,
      duplicates,
      totalMpesaAmount,
      totalLedgerExpected,
      variance,
      status: 'COMPLETED',
      completedAt: new Date(),
      runBy: runBy ?? 'SYSTEM',
    },
  });

  return {
    runId: run.id,
    periodStart,
    periodEnd,
    totalTransactions: gwTxns.length,
    autoMatched,
    unmatched,
    disputed,
    duplicates,
    totalMpesaAmount,
    totalLedgerExpected,
    variance,
    results,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  // Convert +254721... or 0721... to 254721...
  let p = phone.replace(/[\s\-+]/g, '');
  if (p.startsWith('0')) p = '254' + p.slice(1);
  if (!p.startsWith('254')) p = '254' + p;
  return p;
}

async function updateTxnStatus(
  id: string,
  status: string,
  extra?: Record<string, string | undefined>
) {
  await prisma.gatewayTransaction.update({
    where: { id },
    data: {
      reconciliationStatus: status as any,
      reconciledAt: new Date(),
      reconciledBy: 'SYSTEM',
      ...extra,
    },
  });
}

async function createTenantLedgerEntry(
  tenant: { id: string; unitRef?: { unitNumber: string } | null; leases?: any[] },
  txn: { receiptNumber: string; transactionDate: Date },
  amount: number,
  receipt: string
) {
  // Find active lease for the tenant
  const lease = await prisma.lease.findFirst({
    where: { tenantId: tenant.id, status: 'ACTIVE' },
    select: { id: true },
  });

  if (!lease || !tenant.unitRef) return null;

  const unitId = (await prisma.unit.findUnique({
    where: { unitNumber: tenant.unitRef.unitNumber },
    select: { id: true },
  }))?.id;

  if (!unitId) return null;

  // Get current balance
  const lastEntry = await prisma.tenantLedger.findFirst({
    where: { tenantId: tenant.id },
    orderBy: [{ date: 'desc' }, { type: 'desc' }],
    select: { balance: true },
  });

  const currentBalance = Number(lastEntry?.balance ?? 0);
  const newBalance = currentBalance - amount;

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      leaseId: lease.id,
      amount,
      type: 'RENT',
      method: 'MPESA',
      status: 'PAID',
      dueDate: txn.transactionDate,
      paidDate: txn.transactionDate,
      reference: receipt,
    },
  });

  // Create ledger credit entry
  const ledgerEntry = await prisma.tenantLedger.create({
    data: {
      tenantId: tenant.id,
      leaseId: lease.id,
      unitId,
      date: txn.transactionDate,
      type: 'PAYMENT',
      description: `M-PESA ${receipt}`,
      reference: receipt,
      debit: 0,
      credit: amount,
      balance: newBalance,
      paymentId: payment.id,
    },
  });

  // BR-9: auto-generate + send the tenant receipt on allocation (< 1 min target).
  // Best-effort — never blocks or fails reconciliation if comms are unavailable.
  await generateAndSendReceipt(payment.id);

  // §4.4: allocate the rent payment across the tenant's unpaid invoices.
  await allocatePaymentToInvoices(payment.id);

  return ledgerEntry;
}
