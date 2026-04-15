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

  generateHTML(stmt: TenantStatementSummary, companyName = 'Tochi Property Ltd'): string {
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

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Statement of Account - ${stmt.tenantName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px 40px; color: #1a1a1a; font-size: 13px; }

    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .header h1 { font-size: 22px; color: #1a1a1a; }
    .header .subtitle { color: #666; font-size: 13px; margin-top: 2px; }
    .company-logo { font-weight: 700; font-size: 16px; color: #b91c1c; }

    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #d1d5db; margin-bottom: 24px; }
    .meta-cell { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; display: flex; }
    .meta-cell:nth-child(odd) { border-right: 1px solid #e5e7eb; }
    .meta-label { color: #6b7280; min-width: 130px; }
    .meta-value { font-weight: 500; }

    .section-title { background: #b91c1c; color: white; padding: 8px 12px; font-weight: 600; font-size: 13px; letter-spacing: 0.5px; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #b91c1c; color: white; padding: 8px 12px; text-align: left; font-weight: 600; font-size: 12px; }
    th.amount { text-align: right; }
    td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    td.amount { text-align: right; font-family: 'Courier New', monospace; font-size: 12px; }
    tr:nth-child(even) { background: #f9fafb; }
    tr.payment td { color: #059669; }
    tr.charge td.desc { font-weight: 500; }

    .balance-positive { color: #dc2626; font-weight: 600; }
    .balance-negative { color: #059669; font-weight: 600; }
    .balance-zero { color: #6b7280; }

    .totals-row td { font-weight: 700; border-top: 2px solid #1a1a1a; background: #f3f4f6; }

    .arrears-box { background: #b91c1c; color: white; display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; margin: 16px 0; font-size: 14px; }
    .arrears-box .amount { font-size: 22px; font-weight: 700; }
    .credit-box { background: #059669; }

    .payment-detail { margin-top: 20px; }

    .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #d1d5db; color: #6b7280; font-size: 11px; }

    @media print {
      body { margin: 15px 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>STATEMENT OF ACCOUNT</h1>
      <div class="subtitle">${stmt.propertyName} · Unit ${stmt.unitNumber}</div>
    </div>
    <div class="company-logo">${companyName.toUpperCase()}</div>
  </div>

  <div class="meta-grid">
    <div class="meta-cell"><span class="meta-label">Tenant Name:</span><span class="meta-value">${stmt.tenantName}</span></div>
    <div class="meta-cell"><span class="meta-label">Statement Date:</span><span class="meta-value">${fmtDate(stmt.statementDate)}</span></div>
    <div class="meta-cell"><span class="meta-label">Contact:</span><span class="meta-value">${stmt.tenantPhone}</span></div>
    <div class="meta-cell"><span class="meta-label">Statement Period:</span><span class="meta-value">${fmtPeriod(stmt.periodStart, stmt.periodEnd)}</span></div>
    <div class="meta-cell"><span class="meta-label">Email:</span><span class="meta-value">${stmt.tenantEmail || '—'}</span></div>
    <div class="meta-cell"><span class="meta-label">Monthly Rent (KES):</span><span class="meta-value">${stmt.monthlyRent.toLocaleString('en-KE')}</span></div>
    <div class="meta-cell"><span class="meta-label">Unit:</span><span class="meta-value">${stmt.unitNumber}</span></div>
    <div class="meta-cell"><span class="meta-label">Property Manager:</span><span class="meta-value">${stmt.propertyManager}</span></div>
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
      }).join('\n      ')}
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
    <span>TOTAL ARREARS AS AT ${fmtDate(stmt.statementDate)}</span>
    <span class="amount">${fmtMoney(stmt.closingBalance)}</span>
  </div>` : stmt.closingBalance < 0 ? `
  <div class="arrears-box credit-box">
    <span>CREDIT BALANCE AS AT ${fmtDate(stmt.statementDate)}</span>
    <span class="amount">${fmtMoney(stmt.closingBalance)}</span>
  </div>` : ''}

  <div class="payment-detail">
    <div class="section-title">PAYMENT TRANSACTION DETAIL</div>
    <table>
      <thead>
        <tr>
          <th style="width:30px">#</th>
          <th style="width:100px">Date</th>
          <th>Description / Paid By</th>
          <th style="width:150px">Receipt No.</th>
          <th class="amount" style="width:120px">Amount (KES)</th>
        </tr>
      </thead>
      <tbody>
        ${stmt.entries.filter(e => e.type === 'PAYMENT').map((e, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${fmtDate(e.date)}</td>
          <td>${stmt.tenantName} (Tenant)</td>
          <td>${e.reference || '—'}</td>
          <td class="amount">${e.credit.toLocaleString('en-KE')}</td>
        </tr>`).join('\n        ')}
        <tr class="totals-row">
          <td colspan="4"></td>
          <td class="amount">${stmt.totalPaid.toLocaleString('en-KE')}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Note: This statement covers ${fmtPeriod(stmt.periodStart, stmt.periodEnd)} as captured in transaction records. Please contact your property manager with any queries.</p>
    <p style="margin-top: 8px;">Generated by ${companyName} · ${stmt.propertyManager}, Agent · ${fmtDate(stmt.statementDate)}</p>
  </div>
</body>
</html>`;
  }
}

export const tenantStatementGenerator = new TenantStatementGenerator();
