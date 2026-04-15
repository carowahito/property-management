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
  fundingSource: 'TENANT' | 'AGENT';  // whether tenant paid or agent fronted
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
  generateHTML(statement: StatementSummary): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Landlord Statement - ${statement.period}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; color: #1e40af; }
    .header p { margin: 5px 0; color: #64748b; }
    .summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .summary-row { display: flex; justify-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .summary-row.total { font-weight: bold; font-size: 1.1em; border-top: 2px solid #2563eb; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #1e40af; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    tr:hover { background: #f8fafc; }
    .amount { text-align: right; font-family: 'Courier New', monospace; }
    .positive { color: #059669; }
    .negative { color: #dc2626; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #64748b; font-size: 0.9em; }
    .note { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Landlord Statement</h1>
    <p><strong>Landlord:</strong> ${statement.landlordName}</p>
    <p><strong>Period:</strong> ${statement.period}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
  </div>

  <div class="summary">
    <h2>Financial Summary</h2>
    <div class="summary-row">
      <span>Total Gross Rent</span>
      <span class="amount positive">KES ${statement.totalGrossRent.toLocaleString()}</span>
    </div>
    <div class="summary-row">
      <span>Service Charges</span>
      <span class="amount negative">-KES ${statement.totalServiceCharges.toLocaleString()}</span>
    </div>
    <div class="summary-row">
      <span>Management Fees</span>
      <span class="amount negative">-KES ${statement.totalManagementFees.toLocaleString()}</span>
    </div>
    <div class="summary-row">
      <span>Maintenance & Repairs</span>
      <span class="amount negative">-KES ${statement.totalMaintenanceFees.toLocaleString()}</span>
    </div>
    ${statement.totalOtherDeductions > 0 ? `
    <div class="summary-row">
      <span>Other Deductions</span>
      <span class="amount negative">-KES ${statement.totalOtherDeductions.toLocaleString()}</span>
    </div>
    ` : ''}
    <div class="summary-row total">
      <span>Net Amount Payable</span>
      <span class="amount positive">KES ${statement.totalNetAmount.toLocaleString()}</span>
    </div>
  </div>

  <div class="note">
    <strong>Note:</strong> Late payment fees collected from tenants are not included in this statement 
    as they represent additional income retained by the property management company.
  </div>

  <h2>Transaction Details</h2>
  <table>
    <thead>
      <tr>
        <th>Property</th>
        <th>Unit</th>
        <th>Tenant</th>
        <th>Period</th>
        <th class="amount">Gross Rent</th>
        <th class="amount">Deductions</th>
        <th class="amount">Net Amount</th>
        <th>Source</th>
      </tr>
    </thead>
    <tbody>
      ${statement.transactions.map(txn => `
      <tr>
        <td>${txn.propertyName}</td>
        <td>${txn.unitId || '-'}</td>
        <td>${txn.tenantName}</td>
        <td>${txn.rentPeriod}</td>
        <td class="amount">KES ${txn.grossRent.toLocaleString()}</td>
        <td class="amount negative">-KES ${txn.deductions.total.toLocaleString()}</td>
        <td class="amount positive">KES ${txn.netAmount.toLocaleString()}</td>
        <td style="color: ${txn.fundingSource === 'AGENT' ? '#dc2626' : '#059669'}; font-weight: 600;">${txn.fundingSource === 'AGENT' ? 'Agent-Funded' : 'Tenant'}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  ${statement.propertyBreakdown.length > 1 ? `
  <h2>Property Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Property</th>
        <th class="amount">Units</th>
        <th class="amount">Gross Rent</th>
        <th class="amount">Deductions</th>
        <th class="amount">Net Amount</th>
      </tr>
    </thead>
    <tbody>
      ${statement.propertyBreakdown.map(prop => `
      <tr>
        <td>${prop.propertyName}</td>
        <td class="amount">${prop.unitCount}</td>
        <td class="amount">KES ${prop.grossRent.toLocaleString()}</td>
        <td class="amount negative">-KES ${prop.deductions.toLocaleString()}</td>
        <td class="amount positive">KES ${prop.netAmount.toLocaleString()}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <div class="footer">
    <p>This statement has been generated automatically by the Property Management System.</p>
    <p>For any queries, please contact your property manager.</p>
  </div>
</body>
</html>
    `;
  }
}

export const statementGenerator = new LandlordStatementGenerator();
