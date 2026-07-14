/**
 * Tenant Statement of Account Generator
 * Produces a bank-statement-style ledger from the tenant_ledger table.
 * Shows every charge and payment with running balance — exactly like
 * the PDF statement Jabin/Rose Chege generates manually today.
 */

import { prisma } from '@/lib/db';

// ── Types ───────────────────────────────────────────────────────────────────

export interface TenantStatementEntry {
  date: Date;
  type: string;
  description: string;
  reference: string | null;
  debit: number;
  credit: number;
  balance: number;
}

export interface DirectPayment {
  dueDate: Date;
  paidDate: Date | null;
  amount: number;
  reference: string | null;
  type: string;
}

export interface TenantStatementSummary {
  // Header
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  unitNumber: string;
  propertyName: string;
  propertyManager: string;
  monthlyRent: number;

  // Period
  statementDate: Date;
  periodStart: Date;
  periodEnd: Date;
  leaseStartDate: Date | null;
  moveOutDate: Date | null;
  // Last month rent is charged for (inclusive): the move-out month, capped by
  // the period end. No rent is charged after the tenant has moved out.
  chargeEndDate: Date;

  // Totals
  totalCharged: number;
  totalPaid: number;
  closingBalance: number; // positive = owes, negative = credit

  // Ledger entries (raw)
  entries: TenantStatementEntry[];
  // Payment records — source of truth for what has actually been received
  directPayments: DirectPayment[];
}

// ── Generator ───────────────────────────────────────────────────────────────

export class TenantStatementGenerator {
  /**
   * Generate a statement of account for a tenant + unit over a date range.
   */
  async generateStatement(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    unitId?: string
  ): Promise<TenantStatementSummary> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        property: true,
        unitRef: true,
      },
    });

    if (!tenant) throw new Error('Tenant not found');

    const where: Record<string, unknown> = {
      tenantId,
      date: { gte: startDate, lte: endDate },
    };
    if (unitId) where.unitId = unitId;

    const ledger = await prisma.tenantLedger.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        // CHARGE before PAYMENT on the same date
        { type: 'asc' },
      ],
    });

    let entries: TenantStatementEntry[] = ledger.map((row: { date: Date; type: string; description: string; reference: string | null; debit: unknown; credit: unknown; balance: unknown }) => ({
      date: row.date,
      type: row.type,
      description: row.description,
      reference: row.reference,
      debit: Number(row.debit),
      credit: Number(row.credit),
      balance: Number(row.balance),
    }));

    // Fetch PAID payment records directly — source of truth for what was received.
    // Use paidDate range (not dueDate) so payments made in the period are captured
    // regardless of which month's rent they cover.
    const rawPayments = await prisma.payment.findMany({
      where: {
        tenantId,
        status: 'PAID',
        OR: [
          { paidDate: { gte: startDate, lte: endDate } },
          { paidDate: null, dueDate: { gte: startDate, lte: endDate } },
        ],
      },
      orderBy: { dueDate: 'asc' },
      select: { amount: true, dueDate: true, paidDate: true, reference: true, type: true },
    });

    const directPayments: DirectPayment[] = rawPayments.map(p => ({
      dueDate: p.dueDate,
      paidDate: p.paidDate,
      amount: Number(p.amount),
      reference: p.reference,
      type: p.type,
    }));

    // Try to find the property manager (agent) for this company
    let propertyManager = 'Property Manager';
    if (tenant.companyId) {
      const agent = await prisma.user.findFirst({
        where: { companyId: tenant.companyId, role: 'AGENT', active: true },
      });
      if (agent?.name) propertyManager = agent.name;
    }

    const totalDirectPaid = directPayments.reduce((s, p) => s + p.amount, 0);

    // Fetch the active/most-recent lease to know when charges should start
    const lease = await prisma.lease.findFirst({
      where: { tenantId, status: { in: ['ACTIVE', 'PENDING'] } },
      orderBy: { startDate: 'asc' },
      select: { startDate: true },
    });

    const monthlyRent = Number(tenant.unitRef?.monthlyRent ?? 0);
    const leaseStartDate = lease?.startDate ?? null;
    const effectiveStart = leaseStartDate && leaseStartDate > startDate ? leaseStartDate : startDate;

    // Stop charging rent once the tenant has moved out. Charging ends at the
    // move-out month (inclusive), bounded by the statement period end.
    const moveOutDate = tenant.moveOutDate ? new Date(tenant.moveOutDate) : null;

    // Build credit map by dueDate month for totals calculation
    const creditsByMonth = new Map<string, number>();
    for (const p of directPayments) {
      const d = new Date(p.dueDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      creditsByMonth.set(key, (creditsByMonth.get(key) || 0) + p.amount);
    }

    const cur = new Date(effectiveStart);
    cur.setDate(1);
    const endM = new Date(endDate);
    endM.setDate(1);
    // Cap the charging window at the move-out month (inclusive). Build the
    // month boundary the same way as cur/endM (setDate(1)) so the comparison
    // is timezone-consistent.
    const chargeEndM = new Date(endM);
    if (moveOutDate) {
      const moM = new Date(moveOutDate);
      moM.setDate(1);
      if (moM < chargeEndM) chargeEndM.setTime(moM.getTime());
    }
    let totalCharged = 0;
    let runningBalance = 0;
    while (cur <= chargeEndM) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
      totalCharged += monthlyRent;
      runningBalance += monthlyRent - (creditsByMonth.get(key) || 0);
      cur.setMonth(cur.getMonth() + 1);
    }
    const closingBalance = runningBalance;

    // If tenantLedger is empty, synthesize entries from monthly rent + actual payments
    // so the web statement table always shows meaningful data.
    if (entries.length === 0 && monthlyRent > 0) {
      const synthetic: TenantStatementEntry[] = [];
      let balance = 0;
      const chargeDate = new Date(effectiveStart);
      chargeDate.setDate(1);

      // Build a sorted list of payment entries keyed by dueDate month
      const paymentsByMonth = new Map<string, DirectPayment[]>();
      for (const p of directPayments) {
        const d = new Date(p.dueDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!paymentsByMonth.has(key)) paymentsByMonth.set(key, []);
        paymentsByMonth.get(key)!.push(p);
      }

      while (chargeDate <= chargeEndM) {
        const key = `${chargeDate.getFullYear()}-${String(chargeDate.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = chargeDate.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });

        // CHARGE entry
        balance += monthlyRent;
        synthetic.push({
          date: new Date(chargeDate),
          type: 'CHARGE',
          description: `Rent — ${monthLabel}`,
          reference: null,
          debit: monthlyRent,
          credit: 0,
          balance,
        });

        // PAYMENT entries for this month
        for (const p of paymentsByMonth.get(key) ?? []) {
          balance -= p.amount;
          synthetic.push({
            date: p.paidDate ? new Date(p.paidDate) : new Date(p.dueDate),
            type: 'PAYMENT',
            description: `Payment received — ${monthLabel}`,
            reference: p.reference,
            debit: 0,
            credit: p.amount,
            balance,
          });
        }

        chargeDate.setMonth(chargeDate.getMonth() + 1);
      }

      entries = synthetic;
    }

    return {
      tenantId,
      tenantName: tenant.name,
      tenantPhone: tenant.phone,
      tenantEmail: tenant.email,
      unitNumber: tenant.unitRef?.unitNumber ?? tenant.unit ?? '—',
      propertyName: tenant.property?.name ?? '—',
      propertyManager,
      monthlyRent,
      statementDate: new Date(),
      periodStart: startDate,
      periodEnd: endDate,
      leaseStartDate,
      moveOutDate,
      chargeEndDate: chargeEndM,
      totalCharged,
      totalPaid: totalDirectPaid,
      closingBalance,
      entries,
      directPayments,
    };
  }

  // ── HTML export (print-to-PDF from browser) ─────────────────────────────

  generateHTML(stmt: TenantStatementSummary, companyName = 'Tochi Property', companyLogoUrl?: string): string {
    const MA = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const fmtDate = (d: Date) => {
      const dd = new Date(d);
      return `${String(dd.getDate()).padStart(2,'0')}-${MA[dd.getMonth()]}-${dd.getFullYear()}`;
    };
    const fmtNum  = (n: number) => Math.abs(n).toLocaleString('en-KE');
    const fmtBal  = (n: number) => n === 0 ? '–' : n < 0 ? `(${fmtNum(n)})` : fmtNum(n);
    const fmtPeriod = (s: Date, e: Date) => `${MA[s.getMonth()]} ${s.getFullYear()} – ${MA[e.getMonth()]} ${e.getFullYear()}`;

    const tochiIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="145 75 1210 1350" style="height:48px;width:auto;display:block;flex-shrink:0;"><path fill="#e8960c" d="M 1253.820312 663.828125 C 1209.265625 708.382812 1154.863281 739.253906 1095.15625 754.324219 L 1095.15625 1080.085938 C 1095.15625 1172.246094 1059.222656 1258.882812 994.050781 1324.027344 C 928.875 1389.203125 842.210938 1425.082031 750.054688 1425.082031 C 657.894531 1425.082031 571.261719 1389.203125 506.085938 1324.027344 C 440.910156 1258.855469 405.007812 1172.246094 405.007812 1080.085938 L 405.007812 359.390625 L 1034.199219 359.390625 C 1067.820312 359.390625 1095.074219 386.425781 1095.074219 420.046875 C 1095.074219 453.667969 1067.820312 480.707031 1034.199219 480.707031 L 527.304688 480.707031 L 527.304688 1080.085938 C 527.304688 1203.390625 627.320312 1303.65625 750.707031 1303.328125 C 874.09375 1302.976562 972.859375 1201.324219 972.859375 1077.9375 L 972.859375 765.152344 L 810.742188 765.152344 L 810.742188 1100.378906 C 810.742188 1134 783.703125 1161.257812 750.082031 1161.257812 C 716.460938 1161.257812 689.421875 1134 689.421875 1100.378906 L 689.421875 642.855469 L 1009.855469 642.855469 C 1133.15625 642.855469 1233.421875 542.34375 1233.09375 418.960938 C 1232.742188 295.574219 1131.089844 196.34375 1007.703125 196.34375 L 490.335938 196.34375 C 367.058594 196.34375 267.558594 296.582031 267.558594 419.859375 L 267.558594 682.894531 C 259.96875 676.828125 253.304688 670.492188 246.613281 663.828125 C 181.4375 598.679688 145.316406 512.042969 145.316406 419.886719 C 145.316406 327.726562 181.195312 241.117188 246.367188 175.972656 C 311.515625 110.824219 398.152344 75 490.308594 75 L 1009.828125 75 C 1101.984375 75 1188.621094 110.824219 1253.769531 175.972656 C 1318.941406 241.144531 1354.820312 327.699219 1354.820312 419.859375 C 1354.820312 512.015625 1318.96875 598.652344 1253.820312 663.828125 Z"/></svg>`;
    const logoHtml = companyLogoUrl
      ? `<img src="${companyLogoUrl}" alt="${companyName}" style="max-height:52px;max-width:200px;object-fit:contain;" />`
      : `<div style="display:flex;align-items:center;gap:10px;">${tochiIconSvg}<div><div style="font-family:'Montserrat',Arial,sans-serif;font-weight:700;font-size:18px;color:white;letter-spacing:1px;">TOCHI PROPERTY</div><div style="font-size:10px;color:rgba(255,255,255,0.7);letter-spacing:0.5px;margin-top:2px;">Your Property. Our Pride.</div></div></div>`;

    // ── Build monthly summary from Payment records (source of truth) ─────
    // Group by dueDate month — i.e. which month's rent was paid
    const creditsByMonth = new Map<string, number>();
    const lateFeeTotal = stmt.entries
      .filter(e => e.type === 'LATE_FEE' && e.debit > 0)
      .reduce((s, e) => s + e.debit, 0);

    // Use directPayments (PAID Payment records) — more accurate than ledger entries
    // since not all payments may have been synced to the ledger
    const paymentSource = stmt.directPayments.length > 0 ? stmt.directPayments : [];

    for (const p of paymentSource) {
      const d = new Date(p.dueDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      creditsByMonth.set(key, (creditsByMonth.get(key) || 0) + p.amount);
    }

    // Iterate every month in the statement period, starting from lease start if later
    interface MonthRow { label: string; key: string; opening: number; charged: number; received: number; closing: number; }
    const monthRows: MonthRow[] = [];
    const effectiveStart = stmt.leaseStartDate && stmt.leaseStartDate > stmt.periodStart
      ? stmt.leaseStartDate
      : stmt.periodStart;
    const cur = new Date(effectiveStart);
    cur.setDate(1);
    // Charging stops at the move-out month (chargeEndDate), not the period end.
    const endM = new Date(stmt.chargeEndDate);
    endM.setDate(1);
    let running = 0; // opening balance starts at 0 (full tenancy history)

    while (cur <= endM) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
      const opening  = running;
      const charged  = stmt.monthlyRent > 0 ? stmt.monthlyRent : 0;
      const received = creditsByMonth.get(key) || 0;
      const closing  = opening + charged - received;
      monthRows.push({ label: `${MA[cur.getMonth()]} ${cur.getFullYear()}`, key, opening, charged, received, closing });
      running = closing;
      cur.setMonth(cur.getMonth() + 1);
    }

    const mTotalCharged  = monthRows.reduce((s, r) => s + r.charged, 0);
    const mTotalReceived = paymentSource.reduce((s, p) => s + p.amount, 0);
    const finalBalance   = monthRows.length > 0 ? monthRows[monthRows.length - 1].closing : 0;
    const totalOutstanding = finalBalance + lateFeeTotal;

    // ── Monthly summary rows HTML ─────────────────────────────────────────
    const monthRowsHtml = monthRows.map(r => {
      const isOwed = r.closing > 0;
      return `<tr>
          <td>${r.label}</td>
          <td class="num">${r.opening === 0 ? '–' : fmtBal(r.opening)}</td>
          <td class="num">${r.charged > 0 ? fmtNum(r.charged) : '–'}</td>
          <td class="num">${r.received > 0 ? fmtNum(r.received) : '–'}</td>
          <td class="num${isOwed ? ' bal-owed' : r.closing < 0 ? ' bal-credit' : ''}">${fmtBal(r.closing)}</td>
        </tr>`;
    }).join('\n        ');

    // ── Outstanding balance section ───────────────────────────────────────
    let outstandingHtml = '';
    if (totalOutstanding > 0) {
      const dateStr = fmtDate(stmt.statementDate).toUpperCase();
      let outRows = '';

      if (monthRows.length > 1) {
        const priorBal  = monthRows[monthRows.length - 2].closing;
        const lastRow   = monthRows[monthRows.length - 1];
        const lastOwed  = lastRow.charged - lastRow.received;

        if (priorBal > 0) {
          const from = monthRows[0].label;
          const to   = monthRows[monthRows.length - 2].label;
          outRows += `<tr><td>Rent arrears (${from} – ${to})</td><td class="out-amt">${fmtNum(priorBal)}</td></tr>`;
        }
        if (lastOwed > 0) {
          const partial = lastRow.received > 0 ? 'partial' : 'unpaid';
          outRows += `<tr><td>${lastRow.label} rent (${partial})</td><td class="out-amt">${fmtNum(lastOwed)}</td></tr>`;
        }
        if (priorBal > 0 && lastOwed > 0) {
          outRows += `<tr class="out-sub"><td>Total rent arrears</td><td class="out-amt">${fmtNum(finalBalance)}</td></tr>`;
        }
      } else if (finalBalance > 0) {
        outRows += `<tr><td>Rent arrears</td><td class="out-amt">${fmtNum(finalBalance)}</td></tr>`;
      }

      if (lateFeeTotal > 0) {
        outRows += `<tr><td>Late payment penalties</td><td class="out-amt">${fmtNum(lateFeeTotal)}</td></tr>`;
      }

      outstandingHtml = `
    <div class="section-banner">OUTSTANDING BALANCE AS AT ${dateStr}</div>
    <table class="out-table">
      <tbody>
        ${outRows}
        <tr class="out-total">
          <td>TOTAL OUTSTANDING AS AT ${dateStr}</td>
          <td class="out-amt">KShs ${fmtNum(totalOutstanding)}</td>
        </tr>
      </tbody>
    </table>
    ${lateFeeTotal > 0 ? `<p class="penalty-note">The outstanding balance increases by any accruing late payment penalties as per the tenancy agreement.</p>` : ''}`;
    } else if (finalBalance < 0) {
      outstandingHtml = `
    <div class="credit-box">
      <span>CREDIT BALANCE AS AT ${fmtDate(stmt.statementDate).toUpperCase()}</span>
      <span class="credit-amt">KShs ${fmtNum(finalBalance)}</span>
    </div>`;
    }

    // ── Payment transaction detail rows ───────────────────────────────────
    const txRowsHtml = paymentSource.map((p, i) => {
      const displayDate = p.paidDate ?? p.dueDate;
      const typeLabel = p.type === 'RENT' ? 'Rent Payment' : p.type === 'DEPOSIT' ? 'Security Deposit' : p.type.replace(/_/g, ' ');
      return `<tr>
          <td>${i + 1}</td>
          <td>${fmtDate(new Date(displayDate))}</td>
          <td>${typeLabel} (Tenant)</td>
          <td>${p.reference || '—'}</td>
          <td class="num">${fmtNum(p.amount)}</td>
        </tr>`;
    }).join('\n        ');

    // ── Footer notes ──────────────────────────────────────────────────────
    const lastPmt = paymentSource.length > 0 ? paymentSource[paymentSource.length - 1] : null;
    let notesText = `This statement covers ${fmtPeriod(stmt.periodStart, stmt.periodEnd)} as captured in payment records.`;
    if (lastPmt && finalBalance > 0) {
      const lastPmtDate = lastPmt.paidDate ?? lastPmt.dueDate;
      notesText += ` <strong>No payments have been received since ${fmtDate(new Date(lastPmtDate))}.</strong>`;
    }
    if (lateFeeTotal > 0) {
      notesText += ` Late payment penalties are accruing on all outstanding balances.`;
    }
    notesText += ` Please contact your property manager with any queries.`;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
  <title>Statement of Account — ${stmt.tenantName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Open Sans', 'Segoe UI', Arial, sans-serif; color: #1a1a1a; font-size: 13px; background: #fff; }

    /* ── Header ── */
    .brand-header { background: #1A3A5C; border-bottom: 4px solid #E8960C; padding: 20px 32px; display: flex; justify-content: space-between; align-items: center; }
    .doc-title h1 { font-family: 'Montserrat', Arial, sans-serif; font-size: 22px; font-weight: 700; color: white; letter-spacing: 0.5px; }
    .doc-title .subtitle { font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 4px; }

    /* ── Meta info grid ── */
    .content { margin: 24px 32px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #d1d5db; margin-bottom: 24px; }
    .meta-cell { padding: 8px 14px; border-bottom: 1px solid #e5e7eb; display: flex; gap: 8px; }
    .meta-cell:nth-child(odd) { border-right: 1px solid #e5e7eb; }
    .meta-label { color: #6b7280; font-weight: 600; min-width: 140px; font-size: 12px; }
    .meta-value { font-weight: 600; font-size: 12px; }

    /* ── Section banners ── */
    .section-banner { background: #1A3A5C; color: white; padding: 8px 14px; font-family: 'Montserrat', Arial, sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.8px; border-left: 4px solid #E8960C; margin-bottom: 0; }

    /* ── Tables (shared) ── */
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
    td { padding: 7px 12px; border: 1px solid #e5e7eb; }
    td.num { text-align: right; font-family: 'Courier New', monospace; white-space: nowrap; }
    td.bal-owed { color: #7f1d1d; font-weight: 700; }
    td.bal-credit { color: #166534; font-weight: 600; }

    /* ── Monthly summary table ── */
    .summary-table th { background: #1A3A5C; color: white; padding: 8px 12px; text-align: center; font-family: 'Montserrat', Arial, sans-serif; font-weight: 600; font-size: 11px; letter-spacing: 0.3px; border: 1px solid #1A3A5C; }
    .summary-table th.num { text-align: center; }
    .summary-table tr:nth-child(even) td { background: #f9fafb; }
    .summary-table .totals td { font-weight: 700; border-top: 2px solid #1A3A5C; background: #EEF2F7; }

    /* ── Outstanding balance table ── */
    .out-table { margin-bottom: 8px; }
    .out-table td { border: none; border-bottom: 1px solid #e5e7eb; padding: 8px 14px; }
    .out-table td.out-amt { text-align: right; font-family: 'Courier New', monospace; font-weight: 600; }
    .out-table tr.out-sub td { font-weight: 700; border-top: 1px solid #d1d5db; }
    .out-table tr.out-total td { background: #991b1b; color: white; font-family: 'Montserrat', Arial, sans-serif; font-weight: 700; font-size: 13px; border: none; }
    .out-table tr.out-total td.out-amt { font-size: 15px; }
    .penalty-note { font-size: 11px; color: #4b5563; margin-bottom: 24px; line-height: 1.5; }

    /* ── Credit balance box ── */
    .credit-box { background: #166534; color: white; display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; margin-bottom: 24px; font-family: 'Montserrat', Arial, sans-serif; font-weight: 700; font-size: 13px; }
    .credit-amt { font-size: 18px; font-family: 'Courier New', monospace; }

    /* ── Payment transaction table ── */
    .tx-table th { background: #1A3A5C; color: white; padding: 8px 12px; text-align: left; font-family: 'Montserrat', Arial, sans-serif; font-weight: 600; font-size: 11px; letter-spacing: 0.3px; border: 1px solid #1A3A5C; }
    .tx-table th.num { text-align: right; }
    .tx-table tr:nth-child(even) td { background: #f9fafb; }
    .tx-table .tx-total td { font-weight: 700; border-top: 2px solid #1A3A5C; background: #EEF2F7; }
    .tx-table .tx-total td:first-child { text-align: right; font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; letter-spacing: 0.3px; }

    /* ── Notes & footer ── */
    .notes { font-size: 11.5px; color: #374151; line-height: 1.6; margin-bottom: 20px; }
    .doc-footer { text-align: center; font-size: 11px; color: #6b7280; padding-top: 12px; border-top: 2px solid #E8960C; font-style: italic; }

    @media print {
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>

  <div class="brand-header">
    <div class="doc-title">
      <h1>STATEMENT OF ACCOUNT</h1>
      <div class="subtitle">${stmt.propertyName} · Unit ${stmt.unitNumber}</div>
    </div>
    ${logoHtml}
  </div>

  <div class="content">

    <div class="meta-grid">
      <div class="meta-cell"><span class="meta-label">Tenant Name:</span><span class="meta-value">${stmt.tenantName}</span></div>
      <div class="meta-cell"><span class="meta-label">Statement Date:</span><span class="meta-value">${fmtDate(stmt.statementDate)}</span></div>
      <div class="meta-cell"><span class="meta-label">Contact:</span><span class="meta-value">${stmt.tenantPhone || '—'}</span></div>
      <div class="meta-cell"><span class="meta-label">Statement Period:</span><span class="meta-value">${fmtPeriod(stmt.periodStart, stmt.periodEnd)}</span></div>
      <div class="meta-cell"><span class="meta-label">Email:</span><span class="meta-value">${stmt.tenantEmail || '—'}</span></div>
      <div class="meta-cell"><span class="meta-label">Monthly Rent (KShs):</span><span class="meta-value">${stmt.monthlyRent.toLocaleString('en-KE')}</span></div>
      <div class="meta-cell"><span class="meta-label">Unit:</span><span class="meta-value">${stmt.unitNumber}</span></div>
      <div class="meta-cell"><span class="meta-label">Property Manager:</span><span class="meta-value">${stmt.propertyManager} · Tochi Property</span></div>
    </div>

    <div class="section-banner">MONTHLY ACCOUNT SUMMARY</div>
    <table class="summary-table">
      <thead>
        <tr>
          <th style="width:90px;text-align:left;">Month</th>
          <th class="num" style="width:130px;">Opening Balance<br>(KShs)</th>
          <th class="num" style="width:130px;">Rent Charged<br>(KShs)</th>
          <th class="num" style="width:150px;">Payments Received<br>(KShs)</th>
          <th class="num" style="width:130px;">Closing Balance<br>(KShs)</th>
        </tr>
      </thead>
      <tbody>
        ${monthRowsHtml}
        <tr class="totals">
          <td><strong>TOTALS</strong></td>
          <td class="num">–</td>
          <td class="num"><strong>${fmtNum(mTotalCharged)}</strong></td>
          <td class="num"><strong>${mTotalReceived > 0 ? fmtNum(mTotalReceived) : '–'}</strong></td>
          <td class="num${finalBalance > 0 ? ' bal-owed' : finalBalance < 0 ? ' bal-credit' : ''}"><strong>${fmtBal(finalBalance)}</strong></td>
        </tr>
      </tbody>
    </table>

    ${outstandingHtml}

    <div class="section-banner">PAYMENT TRANSACTION DETAIL</div>
    <table class="tx-table">
      <thead>
        <tr>
          <th style="width:30px;">#</th>
          <th style="width:90px;">Date</th>
          <th>Description / Paid By</th>
          <th style="width:140px;">M-PESA Receipt No.</th>
          <th class="num" style="width:110px;">Amount (KShs)</th>
        </tr>
      </thead>
      <tbody>
        ${txRowsHtml || `<tr><td colspan="5" style="text-align:center;color:#6b7280;padding:16px;">No payments recorded in this period</td></tr>`}
        ${paymentSource.length > 0 ? `<tr class="tx-total">
          <td colspan="4">TOTAL PAYMENTS RECEIVED</td>
          <td class="num">${fmtNum(mTotalReceived)}</td>
        </tr>` : ''}
      </tbody>
    </table>

    <p class="notes">${notesText}</p>

  </div>

  <div class="doc-footer">
    Generated by Tochi Property &middot; ${stmt.propertyManager}, Agent &middot; ${fmtDate(stmt.statementDate)}
  </div>

</body>
</html>`;
  }
}

export const tenantStatementGenerator = new TenantStatementGenerator();
