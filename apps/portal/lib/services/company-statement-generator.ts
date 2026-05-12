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
      ? `<img src="${logoUrl}" alt="${stmt.companyName}" style="max-height: 48px; max-width: 180px; object-fit: contain;" />`
      : `<span style="font-weight: 700; font-size: 16px; color: #374151; letter-spacing: 0.5px;">${stmt.companyName.toUpperCase()}</span>`;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Company Statement - ${stmt.companyName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px 40px; color: #1a1a1a; font-size: 13px; }

    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .header h1 { font-size: 22px; color: #1f2937; }
    .header .subtitle { color: #6b7280; font-size: 13px; margin-top: 2px; }

    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #d1d5db; margin-bottom: 24px; }
    .meta-cell { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; display: flex; }
    .meta-cell:nth-child(odd) { border-right: 1px solid #e5e7eb; }
    .meta-label { color: #6b7280; min-width: 150px; }
    .meta-value { font-weight: 500; }

    .section-title { background: #4b5563; color: white; padding: 8px 12px; font-weight: 600; font-size: 13px; letter-spacing: 0.5px; margin-top: 20px; }

    /* Income summary */
    .income-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin: 16px 0; }
    .income-card { border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px; }
    .income-card .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .income-card .value { font-size: 20px; font-weight: 700; margin-top: 4px; font-family: 'Courier New', monospace; }
    .income-card .value.green { color: #047857; }
    .income-card .value.red { color: #b91c1c; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #4b5563; color: white; padding: 7px 10px; text-align: left; font-weight: 600; font-size: 11px; }
    th.amount { text-align: right; }
    td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
    td.amount { text-align: right; font-family: 'Courier New', monospace; }
    tr:nth-child(even) { background: #f9fafb; }
    tr.agent-funded { background: #fef2f2; }
    .totals-row td { font-weight: 700; border-top: 2px solid #374151; background: #f3f4f6; font-size: 12px; }

    .tag { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 600; }
    .tag-tenant { background: #d1fae5; color: #065f46; }
    .tag-agent { background: #fee2e2; color: #991b1b; }
    .tag-pending { background: #fef3c7; color: #92400e; }

    .exposure-box { background: #374151; color: white; display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; margin: 16px 0; font-size: 14px; border-radius: 4px; }
    .exposure-box .amount { font-size: 22px; font-weight: 700; }

    .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #d1d5db; color: #9ca3af; font-size: 11px; }

    @media print { body { margin: 15px 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>COMPANY INCOME STATEMENT</h1>
      <div class="subtitle">Management Fees, Service Charges &amp; Payout Summary</div>
    </div>
    <div>${logoHtml}</div>
  </div>

  <div class="meta-grid">
    <div class="meta-cell"><span class="meta-label">Company:</span><span class="meta-value">${stmt.companyName}</span></div>
    <div class="meta-cell"><span class="meta-label">Statement Date:</span><span class="meta-value">${fmtDate(stmt.statementDate)}</span></div>
    <div class="meta-cell"><span class="meta-label">Period:</span><span class="meta-value">${fmtPeriod(stmt.periodStart, stmt.periodEnd)}</span></div>
    <div class="meta-cell"><span class="meta-label">Units Managed:</span><span class="meta-value">${stmt.unitCount}</span></div>
  </div>

  <!-- Income Summary Cards -->
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
    <div class="income-card">
      <div class="label">Total Company Income</div>
      <div class="value green">KES ${fmtMoney(stmt.totalCompanyIncome)}</div>
    </div>
    <div class="income-card">
      <div class="label">Paid to Landlords</div>
      <div class="value">KES ${fmtMoney(stmt.totalPaidToLandlords)}</div>
    </div>
    <div class="income-card">
      <div class="label">Agent-Funded (Exposure)</div>
      <div class="value red">KES ${fmtMoney(stmt.totalAgentFunded)}</div>
    </div>
  </div>

  <!-- Transaction Detail -->
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
      }).join('\n      ')}
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
    <span>AGENT EXPOSURE (paid to landlords without tenant payment)</span>
    <span class="amount">KES ${fmtMoney(stmt.totalAgentFunded)}</span>
  </div>` : ''}

  <div class="footer">
    <p>This is an internal company statement. Management fees and service charges represent company revenue retained from gross rent before landlord payouts.</p>
    <p style="margin-top: 8px;">Generated by ${stmt.companyName} · ${fmtDate(stmt.statementDate)}</p>
  </div>
</body>
</html>`;
  }
}

export const companyStatementGenerator = new CompanyStatementGenerator();
