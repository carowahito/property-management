/**
 * Landlord Statement Generator
 * Generates detailed rent statements showing gross rent, deductions, and net payout
 * NOTE: Late fees are excluded as they are property manager income
 */

import { prisma } from '@/lib/db';

export interface StatementSummary {
  landlordId: string;
  landlordName: string;
  period: string;
  startDate: Date;
  endDate: Date;
  
  // Financial Summary
  totalGrossRent: number;
  totalServiceCharges: number;
  totalManagementFees: number;
  totalMaintenanceFees: number;
  totalOtherDeductions: number;
  totalDeductions: number;
  totalNetAmount: number;
  
  // Transactions
  transactionCount: number;
  transactions: StatementTransaction[];
  
  // Property Breakdown
  propertyBreakdown: PropertyBreakdown[];
}

export interface StatementTransaction {
  id: string;
  propertyName: string;
  unitId: string | null;
  tenantName: string;
  rentPeriod: string;
  grossRent: number;
  deductions: {
    serviceCharge: number;
    managementFee: number;
    maintenanceFees: number;
    otherDeductions: number;
    total: number;
  };
  netAmount: number;
  paidDate: Date | null;
  payoutStatus: string;
  payoutDate: Date | null;
  payoutReference: string | null;
  payoutMethod: string | null;
  fundingSource: 'TENANT' | 'AGENT';
}

export interface PropertyBreakdown {
  propertyId: string;
  propertyName: string;
  unitCount: number;
  grossRent: number;
  deductions: number;
  netAmount: number;
}

export class LandlordStatementGenerator {
  /**
   * Generate statement for a specific period
   */
  async generateStatement(
    landlordId: string,
    startDate: Date,
    endDate: Date,
    propertyId?: string
  ): Promise<StatementSummary> {
    try {
      // Get landlord details
      const landlord = await prisma.landlord.findUnique({
        where: { id: landlordId },
      });

      if (!landlord) {
        throw new Error('Landlord not found');
      }

      // Build query filter — use dueDate (always set) rather than paidDate
      // (which is null for agent-funded months where tenant hasn't paid)
      const where: any = {
        landlordId,
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (propertyId) {
        where.propertyId = propertyId;
      }

      // Get all rent transactions for the period
      const rentTransactions = await prisma.rentTransaction.findMany({
        where,
        include: {
          payment: true,
          lease: {
            include: {
              property: true,
              tenant: true,
            },
          },
          property: true,
          tenant: true,
          payout: true,
        },
        orderBy: {
          dueDate: 'asc',
        },
      });

      // Calculate totals
      const totals = rentTransactions.reduce(
        (acc, txn) => ({
          grossRent: acc.grossRent + Number(txn.grossRent),
          serviceCharges: acc.serviceCharges + Number(txn.serviceCharge),
          managementFees: acc.managementFees + Number(txn.managementFee),
          maintenanceFees: acc.maintenanceFees + Number(txn.maintenanceFees),
          otherDeductions: acc.otherDeductions + Number(txn.otherDeductions),
          netAmount: acc.netAmount + Number(txn.netAmount),
        }),
        {
          grossRent: 0,
          serviceCharges: 0,
          managementFees: 0,
          maintenanceFees: 0,
          otherDeductions: 0,
          netAmount: 0,
        }
      );

      const totalDeductions =
        totals.serviceCharges +
        totals.managementFees +
        totals.maintenanceFees +
        totals.otherDeductions;

      // Format transactions
      const transactions: StatementTransaction[] = rentTransactions.map((txn) => ({
        id: txn.id,
        propertyName: txn.property.name,
        unitId: txn.unitId,
        tenantName: txn.tenant.name,
        rentPeriod: txn.rentPeriod,
        grossRent: Number(txn.grossRent),
        deductions: {
          serviceCharge: Number(txn.serviceCharge),
          managementFee: Number(txn.managementFee),
          maintenanceFees: Number(txn.maintenanceFees),
          otherDeductions: Number(txn.otherDeductions),
          total: Number(txn.totalDeductions),
        },
        netAmount: Number(txn.netAmount),
        paidDate: txn.paidDate,
        payoutStatus: txn.payoutStatus,
        payoutDate: txn.payoutDate,
        payoutReference: txn.payoutReference,
        payoutMethod: txn.payoutMethod,
        fundingSource: txn.paymentId ? 'TENANT' : 'AGENT',
      }));

      // Property breakdown
      const propertyMap = new Map<string, PropertyBreakdown>();
      
      rentTransactions.forEach((txn) => {
        const propId = txn.propertyId;
        if (!propertyMap.has(propId)) {
          propertyMap.set(propId, {
            propertyId: propId,
            propertyName: txn.property.name,
            unitCount: 0,
            grossRent: 0,
            deductions: 0,
            netAmount: 0,
          });
        }
        
        const prop = propertyMap.get(propId)!;
        prop.unitCount += 1;
        prop.grossRent += Number(txn.grossRent);
        prop.deductions += Number(txn.totalDeductions);
        prop.netAmount += Number(txn.netAmount);
      });

      const propertyBreakdown = Array.from(propertyMap.values());

      // Create the statement summary
      const statement: StatementSummary = {
        landlordId,
        landlordName: landlord.name,
        period: this.formatPeriod(startDate, endDate),
        startDate,
        endDate,
        
        totalGrossRent: totals.grossRent,
        totalServiceCharges: totals.serviceCharges,
        totalManagementFees: totals.managementFees,
        totalMaintenanceFees: totals.maintenanceFees,
        totalOtherDeductions: totals.otherDeductions,
        totalDeductions,
        totalNetAmount: totals.netAmount,
        
        transactionCount: rentTransactions.length,
        transactions,
        propertyBreakdown,
      };

      // Save statement to database
      await this.saveStatementToDatabase(statement);

      return statement;
    } catch (error) {
      console.error('Error generating statement:', error);
      throw error;
    }
  }

  /**
   * Generate monthly statement (convenience method)
   */
  async generateMonthlyStatement(
    landlordId: string,
    year: number,
    month: number, // 1-12
    propertyId?: string
  ): Promise<StatementSummary> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    return this.generateStatement(landlordId, startDate, endDate, propertyId);
  }

  /**
   * Get existing statement from database
   */
  async getStatement(
    landlordId: string,
    period: string,
    propertyId?: string
  ) {
    return prisma.landlordStatement.findFirst({
      where: {
        landlordId,
        period,
        propertyId: propertyId || null,
      },
    });
  }

  /**
   * Get all statements for a landlord
   */
  async getStatementHistory(
    landlordId: string,
    limit: number = 12
  ) {
    return prisma.landlordStatement.findMany({
      where: { landlordId },
      orderBy: { startDate: 'desc' },
      take: limit,
      include: {
        property: true,
      },
    });
  }

  /**
   * Save statement to database
   */
  private async saveStatementToDatabase(statement: StatementSummary) {
    try {
      const propertyId = statement.propertyBreakdown[0]?.propertyId || null;
      const financials = {
        totalGrossRent: statement.totalGrossRent,
        totalServiceCharges: statement.totalServiceCharges,
        totalManagementFees: statement.totalManagementFees,
        totalMaintenanceFees: statement.totalMaintenanceFees,
        totalOtherDeductions: statement.totalOtherDeductions,
        totalDeductions: statement.totalDeductions,
        totalNetAmount: statement.totalNetAmount,
        transactionCount: statement.transactionCount,
        generated: true,
        generatedAt: new Date(),
      };

      const existing = await prisma.landlordStatement.findFirst({
        where: { landlordId: statement.landlordId, period: statement.period, propertyId },
      });

      if (existing) {
        await prisma.landlordStatement.update({ where: { id: existing.id }, data: financials });
      } else {
        await prisma.landlordStatement.create({
          data: {
            landlordId: statement.landlordId,
            propertyId,
            period: statement.period,
            startDate: statement.startDate,
            endDate: statement.endDate,
            ...financials,
          },
        });
      }
    } catch (error) {
      console.error('Error saving statement:', error);
      // Don't throw - statement generation can succeed even if save fails
    }
  }

  /**
   * Format period string
   */
  private formatPeriod(startDate: Date, endDate: Date): string {
    const start = startDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    const end = endDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    
    if (start === end) {
      return start;
    }
    
    return `${start} - ${end}`;
  }

  /**
   * Generate statement in HTML format for PDF export
   */
  generateHTML(statement: StatementSummary, companyName = 'Tochi Property', logoUrl?: string): string {
    const fmtDate = (d: Date) => {
      const dd = new Date(d);
      return `${String(dd.getDate()).padStart(2, '0')}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dd.getMonth()]}-${dd.getFullYear()}`;
    };
    const fmtMoney = (n: number) => n.toLocaleString('en-KE');

    const logoHtml = logoUrl
      ? `<img src="${logoUrl}" alt="${companyName}" style="max-height: 52px; max-width: 200px; object-fit: contain;" />`
      : `<div style="text-align:right;"><div style="font-family:'Montserrat',Arial,sans-serif; font-weight:700; font-size:20px; color:white; letter-spacing:1px;">TOCHI PROPERTY</div><div style="font-size:10px; color:rgba(255,255,255,0.7); letter-spacing:0.5px; margin-top:2px;">Your Property. Our Pride.</div></div>`;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
  <title>Landlord Statement — ${statement.landlordName} — ${statement.period}</title>
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

    .summary { border: 1px solid #e5e7eb; border-radius: 4px; margin: 16px 0; }
    .summary-row { display: flex; justify-content: space-between; padding: 9px 14px; border-bottom: 1px solid #e5e7eb; }
    .summary-row:last-child { border-bottom: none; }
    .summary-row.total { font-weight: 700; border-top: 2px solid #1A3A5C; background: #EEF2F7; }
    .summary-row .amount { font-family: 'Courier New', monospace; }
    .deduction { color: #B33A2A; }
    .income { color: #2A6B3C; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #1A3A5C; color: white; padding: 8px 10px; text-align: left; font-family: 'Montserrat', Arial, sans-serif; font-weight: 600; font-size: 11px; letter-spacing: 0.4px; }
    th.amount { text-align: right; }
    td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    td.amount { text-align: right; font-family: 'Courier New', monospace; }
    tr:nth-child(even) { background: #f9fafb; }
    .totals-row td { font-weight: 700; border-top: 2px solid #1A3A5C; background: #EEF2F7; }

    .net-box { background: #1A3A5C; border-left: 6px solid #E8960C; color: white; display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; margin: 16px 0; border-radius: 4px; }
    .net-box .label { font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; }
    .net-box .amount { font-size: 24px; font-weight: 700; font-family: 'Courier New', monospace; color: #E8960C; }

    .footer { margin: 24px 32px 20px; padding-top: 12px; border-top: 2px solid #E8960C; color: #6b7280; font-size: 11px; display: flex; justify-content: space-between; align-items: flex-start; }
    .footer .brand { font-family: 'Montserrat', Arial, sans-serif; font-weight: 700; color: #1A3A5C; font-size: 12px; }
    .footer .tagline { color: #8B5A00; font-style: italic; font-size: 11px; margin-top: 2px; }

    @media print { body { } .brand-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="brand-header">
    <div class="doc-title">
      <h1>LANDLORD STATEMENT</h1>
      <div class="subtitle">Rent Income &amp; Deductions Summary</div>
    </div>
    <div>${logoHtml}</div>
  </div>

  <div class="content">
    <div class="meta-grid">
      <div class="meta-cell"><span class="meta-label">Landlord:</span><span class="meta-value">${statement.landlordName}</span></div>
      <div class="meta-cell"><span class="meta-label">Statement Date:</span><span class="meta-value">${fmtDate(new Date())}</span></div>
      <div class="meta-cell"><span class="meta-label">Period:</span><span class="meta-value">${statement.period}</span></div>
      <div class="meta-cell"><span class="meta-label">Transactions:</span><span class="meta-value">${statement.transactionCount} months</span></div>
    </div>

    <div class="section-title">FINANCIAL SUMMARY</div>
    <div class="summary">
      <div class="summary-row">
        <span>Total Gross Rent</span>
        <span class="amount">KES ${fmtMoney(statement.totalGrossRent)}</span>
      </div>
      <div class="summary-row">
        <span>Less: Service Charges</span>
        <span class="amount deduction">- KES ${fmtMoney(statement.totalServiceCharges)}</span>
      </div>
      <div class="summary-row">
        <span>Less: Management Fees</span>
        <span class="amount deduction">- KES ${fmtMoney(statement.totalManagementFees)}</span>
      </div>
      <div class="summary-row">
        <span>Less: Maintenance &amp; Repairs</span>
        <span class="amount deduction">- KES ${fmtMoney(statement.totalMaintenanceFees)}</span>
      </div>
      ${statement.totalOtherDeductions > 0 ? `
      <div class="summary-row">
        <span>Less: Other Deductions</span>
        <span class="amount deduction">- KES ${fmtMoney(statement.totalOtherDeductions)}</span>
      </div>` : ''}
      <div class="summary-row total">
        <span>Net Amount Paid to You</span>
        <span class="amount income">KES ${fmtMoney(statement.totalNetAmount)}</span>
      </div>
    </div>

    <div class="net-box">
      <span class="label">TOTAL NET DISBURSEMENT</span>
      <span class="amount">KES ${fmtMoney(statement.totalNetAmount)}</span>
    </div>

    <div class="section-title">TRANSACTION DETAILS</div>
    <table>
      <thead>
        <tr>
          <th>Rent Period</th>
          <th>Tenant</th>
          <th class="amount">Gross Rent</th>
          <th class="amount">Service Chg</th>
          <th class="amount">Mgmt Fee</th>
          <th class="amount">Repairs</th>
          <th class="amount">Net Paid</th>
          <th>Date Paid</th>
          <th>Method</th>
          <th>Payment Ref</th>
        </tr>
      </thead>
      <tbody>
        ${statement.transactions.map(txn => {
          const methodLabel = txn.payoutMethod === 'BANK_TRANSFER' ? 'Bank'
            : txn.payoutMethod === 'MPESA' ? 'M-Pesa'
            : txn.payoutMethod === 'CHEQUE' ? 'Cheque'
            : txn.payoutMethod || '—';
          return `
        <tr>
          <td>${txn.rentPeriod}</td>
          <td>${txn.tenantName}</td>
          <td class="amount">${fmtMoney(txn.grossRent)}</td>
          <td class="amount deduction">${fmtMoney(txn.deductions.serviceCharge)}</td>
          <td class="amount deduction">${fmtMoney(txn.deductions.managementFee)}</td>
          <td class="amount">${txn.deductions.maintenanceFees + txn.deductions.otherDeductions > 0 ? fmtMoney(txn.deductions.maintenanceFees + txn.deductions.otherDeductions) : '—'}</td>
          <td class="amount income">${fmtMoney(txn.netAmount)}</td>
          <td>${txn.payoutDate ? fmtDate(new Date(txn.payoutDate)) : '—'}</td>
          <td>${methodLabel}</td>
          <td style="font-family:'Courier New',monospace; font-size:10px;">${txn.payoutReference || '—'}</td>
        </tr>`;
        }).join('')}
        <tr class="totals-row">
          <td colspan="2">TOTALS (${statement.transactionCount} months)</td>
          <td class="amount">${fmtMoney(statement.totalGrossRent)}</td>
          <td class="amount deduction">${fmtMoney(statement.totalServiceCharges)}</td>
          <td class="amount deduction">${fmtMoney(statement.totalManagementFees)}</td>
          <td class="amount">${statement.totalMaintenanceFees + statement.totalOtherDeductions > 0 ? fmtMoney(statement.totalMaintenanceFees + statement.totalOtherDeductions) : '—'}</td>
          <td class="amount income">${fmtMoney(statement.totalNetAmount)}</td>
          <td colspan="3"></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div>
      <p>Note: Late payment penalties collected from tenants are retained by the management company and are not reflected in this statement.</p>
      <p style="margin-top: 6px;">Generated ${fmtDate(new Date())} · tochiproperty.com · info@tochiproperty.com</p>
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

export const statementGenerator = new LandlordStatementGenerator();
