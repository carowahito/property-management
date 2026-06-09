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

    const logoHtml = companyLogoUrl
      ? `<img src="${companyLogoUrl}" alt="${companyName}" style="max-height: 52px; max-width: 200px; object-fit: contain;" />`
      : `<div style="text-align:right;"><div style="font-family:'Montserrat',Arial,sans-serif; font-weight:700; font-size:20px; color:white; letter-spacing:1px;">TOCHI PROPERTY</div><div style="font-size:10px; color:rgba(255,255,255,0.7); letter-spacing:0.5px; margin-top:2px;">Your Property. Our Pride.</div></div>`;

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
