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

  // Totals
  totalCharged: number;
  totalPaid: number;
  closingBalance: number; // positive = owes, negative = credit

  // Entries
  entries: TenantStatementEntry[];
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

    const entries: TenantStatementEntry[] = ledger.map((row: { date: Date; type: string; description: string; reference: string | null; debit: unknown; credit: unknown; balance: unknown }) => ({
      date: row.date,
      type: row.type,
      description: row.description,
      reference: row.reference,
      debit: Number(row.debit),
      credit: Number(row.credit),
      balance: Number(row.balance),
    }));

    const totalCharged = entries.reduce((s, e) => s + e.debit, 0);
    const totalPaid = entries.reduce((s, e) => s + e.credit, 0);
    const closingBalance = entries.length > 0 ? entries[entries.length - 1].balance : 0;

    // Try to find the property manager (agent) for this company
    let propertyManager = 'Property Manager';
    if (tenant.companyId) {
      const agent = await prisma.user.findFirst({
        where: { companyId: tenant.companyId, role: 'AGENT', active: true },
      });
      if (agent?.name) propertyManager = agent.name;
    }

    return {
      tenantId,
      tenantName: tenant.name,
      tenantPhone: tenant.phone,
      tenantEmail: tenant.email,
      unitNumber: tenant.unitRef?.unitNumber ?? tenant.unit ?? '—',
      propertyName: tenant.property.name,
      propertyManager,
      monthlyRent: Number(tenant.unitRef?.monthlyRent ?? 0),
      statementDate: new Date(),
      periodStart: startDate,
      periodEnd: endDate,
      totalCharged,
      totalPaid,
      closingBalance,
      entries,
    };
  }

  // ── HTML export (print-to-PDF from browser) ─────────────────────────────

  generateHTML(stmt: TenantStatementSummary, companyName = 'Tochi Property', companyLogoUrl?: string): string {
    const fmtDate = (d: Date) => {
      const dd = new Date(d);
      return `${String(dd.getDate()).padStart(2, '0')}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dd.getMonth()]}-${dd.getFullYear()}`;
    };
    const fmtMoney = (n: number) => `KES ${Math.abs(n).toLocaleString('en-KE')}`;
    const fmtBalance = (n: number) => {
      if (n === 0) return '—';
      if (n < 0) return `(${fmtMoney(n)})`;  // credit in parentheses
      return fmtMoney(n);
    };
    const fmtPeriod = (s: Date, e: Date) => {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[s.getMonth()]} ${s.getFullYear()} – ${months[e.getMonth()]} ${e.getFullYear()}`;
    };

    const tochiIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="145 75 1210 1350" style="height:44px;width:auto;display:block;flex-shrink:0;"><path fill="#e8960c" d="M 1253.820312 663.828125 C 1209.265625 708.382812 1154.863281 739.253906 1095.15625 754.324219 L 1095.15625 1080.085938 C 1095.15625 1172.246094 1059.222656 1258.882812 994.050781 1324.027344 C 928.875 1389.203125 842.210938 1425.082031 750.054688 1425.082031 C 657.894531 1425.082031 571.261719 1389.203125 506.085938 1324.027344 C 440.910156 1258.855469 405.007812 1172.246094 405.007812 1080.085938 L 405.007812 359.390625 L 1034.199219 359.390625 C 1067.820312 359.390625 1095.074219 386.425781 1095.074219 420.046875 C 1095.074219 453.667969 1067.820312 480.707031 1034.199219 480.707031 L 527.304688 480.707031 L 527.304688 1080.085938 C 527.304688 1203.390625 627.320312 1303.65625 750.707031 1303.328125 C 874.09375 1302.976562 972.859375 1201.324219 972.859375 1077.9375 L 972.859375 765.152344 L 810.742188 765.152344 L 810.742188 1100.378906 C 810.742188 1134 783.703125 1161.257812 750.082031 1161.257812 C 716.460938 1161.257812 689.421875 1134 689.421875 1100.378906 L 689.421875 642.855469 L 1009.855469 642.855469 C 1133.15625 642.855469 1233.421875 542.34375 1233.09375 418.960938 C 1232.742188 295.574219 1131.089844 196.34375 1007.703125 196.34375 L 490.335938 196.34375 C 367.058594 196.34375 267.558594 296.582031 267.558594 419.859375 L 267.558594 682.894531 C 259.96875 676.828125 253.304688 670.492188 246.613281 663.828125 C 181.4375 598.679688 145.316406 512.042969 145.316406 419.886719 C 145.316406 327.726562 181.195312 241.117188 246.367188 175.972656 C 311.515625 110.824219 398.152344 75 490.308594 75 L 1009.828125 75 C 1101.984375 75 1188.621094 110.824219 1253.769531 175.972656 C 1318.941406 241.144531 1354.820312 327.699219 1354.820312 419.859375 C 1354.820312 512.015625 1318.96875 598.652344 1253.820312 663.828125 Z"/></svg>`;
    const logoHtml = companyLogoUrl
      ? `<img src="${companyLogoUrl}" alt="${companyName}" style="max-height: 52px; max-width: 200px; object-fit: contain;" />`
      : `<div style="display:flex;align-items:center;gap:12px;">${tochiIconSvg}<div><div style="font-family:'Montserrat',Arial,sans-serif; font-weight:700; font-size:20px; color:white; letter-spacing:1px;">TOCHI PROPERTY</div><div style="font-size:10px; color:rgba(255,255,255,0.7); letter-spacing:0.5px; margin-top:2px;">Your Property. Our Pride.</div></div></div>`;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
  <title>Statement of Account — ${stmt.tenantName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Open Sans', 'Segoe UI', Arial, sans-serif; color: #1a1a1a; font-size: 13px; }

    .brand-header { background: #1A3A5C; border-bottom: 4px solid #E8960C; padding: 18px 32px; display: flex; justify-content: space-between; align-items: center; }
    .brand-header .doc-title h1 { font-family: 'Montserrat', Arial, sans-serif; font-size: 20px; font-weight: 700; color: white; letter-spacing: 0.5px; }
    .brand-header .doc-title .subtitle { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 3px; }

    .content { margin: 24px 32px; }

    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #d1d5db; margin-bottom: 24px; }
    .meta-cell { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; display: flex; }
    .meta-cell:nth-child(odd) { border-right: 1px solid #e5e7eb; }
    .meta-label { color: #6b7280; min-width: 130px; }
    .meta-value { font-weight: 600; }

    .section-title { background: #1A3A5C; color: white; padding: 8px 12px; font-family: 'Montserrat', Arial, sans-serif; font-weight: 600; font-size: 12px; letter-spacing: 0.8px; border-left: 4px solid #E8960C; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #1A3A5C; color: white; padding: 8px 12px; text-align: left; font-family: 'Montserrat', Arial, sans-serif; font-weight: 600; font-size: 11px; letter-spacing: 0.4px; }
    th.amount { text-align: right; }
    td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    td.amount { text-align: right; font-family: 'Courier New', monospace; font-size: 12px; }
    tr:nth-child(even) { background: #f9fafb; }
    tr.payment td { color: #2A6B3C; }
    tr.charge td.desc { font-weight: 600; }

    .balance-positive { color: #B33A2A; font-weight: 600; }
    .balance-negative { color: #2A6B3C; font-weight: 600; }
    .balance-zero { color: #6b7280; }

    .totals-row td { font-weight: 700; border-top: 2px solid #1A3A5C; background: #EEF2F7; }

    .arrears-box { background: #B33A2A; border-left: 6px solid #E8960C; color: white; display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; margin: 16px 0; }
    .arrears-box .label { font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; }
    .arrears-box .amount { font-size: 22px; font-weight: 700; font-family: 'Courier New', monospace; }
    .credit-box { background: #2A6B3C; }

    .footer { margin: 24px 32px 20px; padding-top: 12px; border-top: 2px solid #E8960C; color: #6b7280; font-size: 11px; display: flex; justify-content: space-between; align-items: flex-start; }
    .footer .brand { font-family: 'Montserrat', Arial, sans-serif; font-weight: 700; color: #1A3A5C; font-size: 12px; }
    .footer .tagline { color: #8B5A00; font-style: italic; font-size: 11px; margin-top: 2px; }

    @media print {
      .brand-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
    <div>${logoHtml}</div>
  </div>

  <div class="content">
    <div class="meta-grid">
      <div class="meta-cell"><span class="meta-label">Tenant Name:</span><span class="meta-value">${stmt.tenantName}</span></div>
      <div class="meta-cell"><span class="meta-label">Statement Date:</span><span class="meta-value">${fmtDate(stmt.statementDate)}</span></div>
      <div class="meta-cell"><span class="meta-label">Contact:</span><span class="meta-value">${stmt.tenantPhone}</span></div>
      <div class="meta-cell"><span class="meta-label">Statement Period:</span><span class="meta-value">${fmtPeriod(stmt.periodStart, stmt.periodEnd)}</span></div>
      <div class="meta-cell"><span class="meta-label">Email:</span><span class="meta-value">${stmt.tenantEmail || '—'}</span></div>
      <div class="meta-cell"><span class="meta-label">Monthly Rent (KES):</span><span class="meta-value">${stmt.monthlyRent.toLocaleString('en-KE')}</span></div>
      <div class="meta-cell"><span class="meta-label">Unit:</span><span class="meta-value">${stmt.unitNumber}</span></div>
      <div class="meta-cell"><span class="meta-label">Property Manager:</span><span class="meta-value">${stmt.propertyManager} · Tochi Property</span></div>
    </div>

    <div class="section-title">STATEMENT OF ACCOUNT</div>
    <table>
      <thead>
        <tr>
          <th style="width:100px">Date</th>
          <th>Description</th>
          <th style="width:110px">Reference</th>
          <th class="amount" style="width:110px">Debit (KES)</th>
          <th class="amount" style="width:110px">Credit (KES)</th>
          <th class="amount" style="width:120px">Balance (KES)</th>
        </tr>
      </thead>
      <tbody>
        ${stmt.entries.map((e) => {
          const balClass = e.balance > 0 ? 'balance-positive' : e.balance < 0 ? 'balance-negative' : 'balance-zero';
          const rowClass = e.type === 'PAYMENT' ? 'payment' : 'charge';
          return `<tr class="${rowClass}">
            <td>${fmtDate(e.date)}</td>
            <td class="desc">${e.description}</td>
            <td>${e.reference || ''}</td>
            <td class="amount">${e.debit > 0 ? e.debit.toLocaleString('en-KE') : ''}</td>
            <td class="amount">${e.credit > 0 ? e.credit.toLocaleString('en-KE') : ''}</td>
            <td class="amount ${balClass}">${fmtBalance(e.balance)}</td>
          </tr>`;
        }).join('\n        ')}
        <tr class="totals-row">
          <td colspan="3">TOTALS</td>
          <td class="amount">${stmt.totalCharged.toLocaleString('en-KE')}</td>
          <td class="amount">${stmt.totalPaid.toLocaleString('en-KE')}</td>
          <td class="amount ${stmt.closingBalance > 0 ? 'balance-positive' : stmt.closingBalance < 0 ? 'balance-negative' : ''}">${fmtBalance(stmt.closingBalance)}</td>
        </tr>
      </tbody>
    </table>

    ${stmt.closingBalance > 0 ? `
    <div class="arrears-box">
      <span class="label">TOTAL ARREARS AS AT ${fmtDate(stmt.statementDate)}</span>
      <span class="amount">${fmtMoney(stmt.closingBalance)}</span>
    </div>` : stmt.closingBalance < 0 ? `
    <div class="arrears-box credit-box">
      <span class="label">CREDIT BALANCE AS AT ${fmtDate(stmt.statementDate)}</span>
      <span class="amount">${fmtMoney(stmt.closingBalance)}</span>
    </div>` : ''}
  </div>

  <div class="footer">
    <div>
      <p>This statement covers ${fmtPeriod(stmt.periodStart, stmt.periodEnd)}. Contact your property manager with any queries.</p>
      <p style="margin-top: 6px;">Generated ${fmtDate(stmt.statementDate)} · tochiproperty.com · info@tochiproperty.com</p>
    </div>
    <div style="text-align:right;">
      <div class="brand">TOCHI PROPERTY</div>
      <div class="tagline">Your Property. Our Pride.</div>
    </div>
  </div>
</body>
</html>`;
  }
}

export const tenantStatementGenerator = new TenantStatementGenerator();
