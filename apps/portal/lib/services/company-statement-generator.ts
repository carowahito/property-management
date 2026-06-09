/**
 * Company / Agent Statement Generator
 * Shows the property management company's income statement:
 *   - Rent collected from tenants
 *   - Payouts to landlords
 *   - Management fees (commissions) retained
 *   - Service charges retained
 *   - Late fees earned
 *   - Agent exposure (money fronted when tenant didn't pay)
 */

import { prisma } from '@/lib/db';

// ── Types ───────────────────────────────────────────────────────────────────

export interface CompanyStatementEntry {
  period: string;
  unitNumber: string;
  propertyName: string;
  tenantName: string;
  landlordName: string;
  grossRent: number;
  tenantPaid: boolean;      // did the tenant actually pay?
  serviceCharge: number;
  managementFee: number;
  lateFees: number;
  maintenanceFees: number;
  otherDeductions: number;
  netToLandlord: number;
  payoutDate: string | null;
  payoutReference: string | null;
  agentFunded: boolean;     // agent paid landlord from own pocket
}

export interface CompanyStatementSummary {
  companyId: string;
  companyName: string;
  statementDate: Date;
  periodStart: Date;
  periodEnd: Date;

  // Revenue
  totalGrossRent: number;
  totalCollectedFromTenants: number;
  totalServiceCharges: number;
  totalManagementFees: number;
  totalLateFees: number;
  totalCompanyIncome: number;  // service charges + mgmt fees + late fees

  // Payouts
  totalPaidToLandlords: number;
  totalAgentFunded: number;    // paid to landlord without tenant payment

  // Summary
  entries: CompanyStatementEntry[];
  unitCount: number;
  monthCount: number;
}

// ── Generator ───────────────────────────────────────────────────────────────

export class CompanyStatementGenerator {
  async generateStatement(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CompanyStatementSummary> {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new Error('Company not found');

    const transactions = await prisma.rentTransaction.findMany({
      where: {
        dueDate: { gte: startDate, lte: endDate },
        property: { companyId },
      },
      include: {
        tenant: { select: { name: true } },
        landlord: { select: { name: true } },
        property: { select: { name: true } },
        unit: { select: { unitNumber: true } },
        payout: { select: { paidDate: true, reference: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    const entries: CompanyStatementEntry[] = transactions.map((txn) => ({
      period: txn.rentPeriod,
      unitNumber: txn.unit.unitNumber,
      propertyName: txn.property.name,
      tenantName: txn.tenant.name,
      landlordName: txn.landlord.name,
      grossRent: Number(txn.grossRent),
      tenantPaid: txn.paymentId !== null,
      serviceCharge: Number(txn.serviceCharge),
      managementFee: Number(txn.managementFee),
      lateFees: Number(txn.lateFees),
      maintenanceFees: Number(txn.maintenanceFees),
      otherDeductions: Number(txn.otherDeductions),
      netToLandlord: Number(txn.netAmount),
      payoutDate: txn.payout?.paidDate?.toISOString() ?? null,
      payoutReference: txn.payout?.reference ?? null,
      agentFunded: txn.paymentId === null && txn.payoutStatus === 'PAID',
    }));

    // Collected from tenants (sum credits from tenant_ledger for this period)
    const ledgerPayments = await prisma.tenantLedger.aggregate({
      where: {
        type: 'PAYMENT',
        date: { gte: startDate, lte: endDate },
        tenant: { companyId },
      },
      _sum: { credit: true },
    });

    const totalCollectedFromTenants = Number(ledgerPayments._sum.credit ?? 0);
    const totalGrossRent = entries.reduce((s, e) => s + e.grossRent, 0);
    const totalServiceCharges = entries.reduce((s, e) => s + e.serviceCharge, 0);
    const totalManagementFees = entries.reduce((s, e) => s + e.managementFee, 0);
    const totalLateFees = entries.reduce((s, e) => s + e.lateFees, 0);
    const totalPaidToLandlords = entries
      .filter((e) => e.payoutDate !== null)
      .reduce((s, e) => s + e.netToLandlord, 0);
    const totalAgentFunded = entries
      .filter((e) => e.agentFunded)
      .reduce((s, e) => s + e.netToLandlord, 0);

    const uniqueUnits = new Set(entries.map((e) => e.unitNumber));

    return {
      companyId,
      companyName: company.name,
      statementDate: new Date(),
      periodStart: startDate,
      periodEnd: endDate,
      totalGrossRent,
      totalCollectedFromTenants,
      totalServiceCharges,
      totalManagementFees,
      totalLateFees,
      totalCompanyIncome: totalServiceCharges + totalManagementFees + totalLateFees,
      totalPaidToLandlords,
      totalAgentFunded,
      entries,
      unitCount: uniqueUnits.size,
      monthCount: entries.length,
    };
  }

  // ── HTML ────────────────────────────────────────────────────────────────

  generateHTML(stmt: CompanyStatementSummary, logoUrl?: string): string {
    const fmtDate = (d: Date) => {
      const dd = new Date(d);
      return `${String(dd.getDate()).padStart(2, '0')}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dd.getMonth()]}-${dd.getFullYear()}`;
    };
    const fmtMoney = (n: number) => n.toLocaleString('en-KE');
    const fmtPeriod = (s: Date, e: Date) => {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[s.getMonth()]} ${s.getFullYear()} – ${months[e.getMonth()]} ${e.getFullYear()}`;
    };

    const logoHtml = logoUrl
      ? `<img src="${logoUrl}" alt="${stmt.companyName}" style="max-height: 52px; max-width: 200px; object-fit: contain;" />`
      : `<div style="text-align:right;"><div style="font-family:'Montserrat',Arial,sans-serif; font-weight:700; font-size:20px; color:white; letter-spacing:1px;">TOCHI PROPERTY</div><div style="font-size:10px; color:rgba(255,255,255,0.7); letter-spacing:0.5px; margin-top:2px;">Your Property. Our Pride.</div></div>`;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
  <title>Company Income Statement — ${stmt.companyName}</title>
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
    .meta-label { color: #6b7280; min-width: 150px; }
    .meta-value { font-weight: 600; }

    .section-title { background: #1A3A5C; color: white; padding: 8px 12px; font-family: 'Montserrat', Arial, sans-serif; font-weight: 600; font-size: 12px; letter-spacing: 0.8px; border-left: 4px solid #E8960C; margin-top: 20px; }

    .income-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin: 16px 0; }
    .income-card { border: 1px solid #D0DAEA; border-radius: 6px; padding: 14px; border-top: 3px solid #1A3A5C; }
    .income-card .label { font-family: 'Montserrat', Arial, sans-serif; font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.8px; }
    .income-card .value { font-size: 18px; font-weight: 700; margin-top: 6px; font-family: 'Courier New', monospace; color: #1A3A5C; }
    .income-card .value.green { color: #2A6B3C; }
    .income-card .value.red { color: #B33A2A; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #1A3A5C; color: white; padding: 7px 10px; text-align: left; font-family: 'Montserrat', Arial, sans-serif; font-weight: 600; font-size: 11px; letter-spacing: 0.4px; }
    th.amount { text-align: right; }
    td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
    td.amount { text-align: right; font-family: 'Courier New', monospace; }
    tr:nth-child(even) { background: #f9fafb; }
    tr.agent-funded { background: #FAF0EE; }
    .totals-row td { font-weight: 700; border-top: 2px solid #1A3A5C; background: #EEF2F7; font-size: 12px; }

    .tag { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 600; }
    .tag-tenant { background: #d1fae5; color: #2A6B3C; }
    .tag-agent { background: #FAF0EE; color: #B33A2A; }
    .tag-pending { background: #fef3c7; color: #92400e; }

    .exposure-box { background: #B33A2A; border-left: 6px solid #E8960C; color: white; display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; margin: 16px 0; }
    .exposure-box .label { font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; font-weight: 600; }
    .exposure-box .amount { font-size: 22px; font-weight: 700; font-family: 'Courier New', monospace; }

    .footer { margin: 24px 32px 20px; padding-top: 12px; border-top: 2px solid #E8960C; color: #6b7280; font-size: 11px; display: flex; justify-content: space-between; align-items: flex-start; }
    .footer .brand { font-family: 'Montserrat', Arial, sans-serif; font-weight: 700; color: #1A3A5C; font-size: 12px; }
    .footer .tagline { color: #8B5A00; font-style: italic; font-size: 11px; margin-top: 2px; }

    @media print { .brand-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="brand-header">
    <div class="doc-title">
      <h1>COMPANY INCOME STATEMENT</h1>
      <div class="subtitle">Management Fees, Service Charges &amp; Payout Summary</div>
    </div>
    <div>${logoHtml}</div>
  </div>

  <div class="content">
    <div class="meta-grid">
      <div class="meta-cell"><span class="meta-label">Company:</span><span class="meta-value">${stmt.companyName}</span></div>
      <div class="meta-cell"><span class="meta-label">Statement Date:</span><span class="meta-value">${fmtDate(stmt.statementDate)}</span></div>
      <div class="meta-cell"><span class="meta-label">Period:</span><span class="meta-value">${fmtPeriod(stmt.periodStart, stmt.periodEnd)}</span></div>
      <div class="meta-cell"><span class="meta-label">Units Managed:</span><span class="meta-value">${stmt.unitCount}</span></div>
    </div>

    <div class="income-grid">
      <div class="income-card">
        <div class="label">Collected from Tenants</div>
        <div class="value">KES ${fmtMoney(stmt.totalCollectedFromTenants)}</div>
      </div>
      <div class="income-card">
        <div class="label">Management Fees</div>
        <div class="value green">KES ${fmtMoney(stmt.totalManagementFees)}</div>
      </div>
      <div class="income-card">
        <div class="label">Service Charges</div>
        <div class="value green">KES ${fmtMoney(stmt.totalServiceCharges)}</div>
      </div>
      <div class="income-card">
        <div class="label">Late Fees</div>
        <div class="value green">KES ${fmtMoney(stmt.totalLateFees)}</div>
      </div>
    </div>

    <div class="income-grid" style="grid-template-columns: 1fr 1fr 1fr;">
      <div class="income-card" style="border-top-color:#E8960C;">
        <div class="label">Total Company Income</div>
        <div class="value green">KES ${fmtMoney(stmt.totalCompanyIncome)}</div>
      </div>
      <div class="income-card">
        <div class="label">Paid to Landlords</div>
        <div class="value">KES ${fmtMoney(stmt.totalPaidToLandlords)}</div>
      </div>
      <div class="income-card" style="border-top-color:#B33A2A;">
        <div class="label">Agent-Funded (Exposure)</div>
        <div class="value red">KES ${fmtMoney(stmt.totalAgentFunded)}</div>
      </div>
    </div>

    <div class="section-title">MONTHLY BREAKDOWN</div>
    <table>
      <thead>
        <tr>
          <th>Period</th>
          <th>Unit</th>
          <th>Tenant</th>
          <th>Landlord</th>
          <th class="amount">Gross Rent</th>
          <th class="amount">Service Chg</th>
          <th class="amount">Mgmt Fee</th>
          <th class="amount">Late Fees</th>
          <th class="amount">Net to Landlord</th>
          <th>Source</th>
          <th>Payout Ref</th>
        </tr>
      </thead>
      <tbody>
        ${stmt.entries.map((e) => {
          const rowClass = e.agentFunded ? 'agent-funded' : '';
          const tag = e.agentFunded
            ? '<span class="tag tag-agent">AGENT</span>'
            : e.tenantPaid
            ? '<span class="tag tag-tenant">TENANT</span>'
            : '<span class="tag tag-pending">PENDING</span>';
          return `<tr class="${rowClass}">
            <td>${e.period}</td>
            <td>${e.unitNumber}</td>
            <td>${e.tenantName}</td>
            <td>${e.landlordName}</td>
            <td class="amount">${fmtMoney(e.grossRent)}</td>
            <td class="amount">${fmtMoney(e.serviceCharge)}</td>
            <td class="amount">${fmtMoney(e.managementFee)}</td>
            <td class="amount">${e.lateFees > 0 ? fmtMoney(e.lateFees) : ''}</td>
            <td class="amount">${fmtMoney(e.netToLandlord)}</td>
            <td>${tag}</td>
            <td style="font-size:10px;">${e.payoutReference || ''}</td>
          </tr>`;
        }).join('\n        ')}
        <tr class="totals-row">
          <td colspan="4">TOTALS (${stmt.monthCount} months)</td>
          <td class="amount">${fmtMoney(stmt.totalGrossRent)}</td>
          <td class="amount">${fmtMoney(stmt.totalServiceCharges)}</td>
          <td class="amount">${fmtMoney(stmt.totalManagementFees)}</td>
          <td class="amount">${fmtMoney(stmt.totalLateFees)}</td>
          <td class="amount">${fmtMoney(stmt.totalPaidToLandlords)}</td>
          <td colspan="2"></td>
        </tr>
      </tbody>
    </table>

    ${stmt.totalAgentFunded > 0 ? `
    <div class="exposure-box">
      <span class="label">AGENT EXPOSURE — paid to landlords without tenant payment</span>
      <span class="amount">KES ${fmtMoney(stmt.totalAgentFunded)}</span>
    </div>` : ''}
  </div>

  <div class="footer">
    <div>
      <p>Internal statement. Management fees and service charges represent company revenue retained before landlord payouts.</p>
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

export const companyStatementGenerator = new CompanyStatementGenerator();
