/**
 * Rent Distribution Processor
 * Handles rent collection, deduction calculations, and distribution to landlords.
 *
 * Split configurations (service charge, management fee) are stored per Unit in the
 * database — set during onboarding and applied automatically each month.
 * All writes run inside a Prisma $transaction for atomicity.
 */

import { PrismaClient, FeeType, PaymentType, PayoutStatus, PaymentMethod, Prisma } from '@prisma/client';
import { recordAgentIncome } from '@/lib/services/agent-income';

const prisma = new PrismaClient();

export interface ProcessRentResult {
  rentTransactionId: string;
  grossRent: number;
  deductions: {
    serviceCharge: number;
    managementFee: number;
    maintenanceFees: number;
    otherDeductions: number;
    total: number;
  };
  netAmount: number;
  lateFees: number;
  success: boolean;
  message: string;
}

export class RentProcessor {
  /**
   * Process a rent payment atomically:
   *  1. Validate payment
   *  2. Read split config from Unit record
   *  3. Calculate deductions
   *  4. Create RentTransaction + RentDistributionItems + Payout — all in one transaction
   */
  async processRentPayment(paymentId: string): Promise<ProcessRentResult> {
    try {
      // Read payment + related data (outside transaction — read-only)
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          lease: {
            include: {
              property: { include: { landlord: true } },
              tenant: true,
              unitRef: true,
            },
          },
          tenant: true,
          rentTransactions: true,
        },
      });

      if (!payment) throw new Error('Payment not found');
      if (payment.type !== PaymentType.RENT) throw new Error('Payment is not a rent payment');
      if (payment.rentTransactions.length > 0) throw new Error('Payment already processed');
      if (!payment.lease?.unitRef) throw new Error('Payment has no associated unit');

      const { lease } = payment;
      const unit = lease.unitRef!;
      const grossRent = Number(payment.amount);

      // Read split config from Unit record
      const serviceCharge = this.calculateFee(
        grossRent,
        Number(unit.serviceCharge ?? 0),
        unit.serviceChargeType
      );
      const managementFee = this.calculateFee(
        grossRent,
        Number(unit.managementFee ?? 0),
        unit.managementFeeType
      );

      // Late fees (separate payment record on the same date)
      const lateFeePayment = await prisma.payment.findFirst({
        where: {
          tenantId: payment.tenantId,
          leaseId: payment.leaseId,
          type: PaymentType.LATE_FEE,
          paidDate: payment.paidDate,
        },
      });
      const lateFees = lateFeePayment ? Number(lateFeePayment.amount) : 0;

      // Maintenance costs for the period
      const maintenanceFees = await this.calculateMaintenanceFees(lease.id, payment.dueDate);
      const otherDeductions = 0;

      const totalDeductions = serviceCharge + managementFee + maintenanceFees + otherDeductions;
      const netAmount = grossRent - totalDeductions;

      const landlordId = lease.property.landlordId!;
      const landlordName = lease.property.landlord?.name ?? '';
      const unitId = unit.id;
      const rentPeriod = this.formatRentPeriod(payment.dueDate);

      // --- Atomic transaction: create RentTransaction + DistributionItems + Payout ---
      const rentTransaction = await prisma.$transaction(async (tx) => {
        // 1. Create rent transaction
        const rt = await tx.rentTransaction.create({
          data: {
            paymentId: payment.id,
            leaseId: lease.id,
            landlordId,
            propertyId: lease.propertyId,
            unitId,
            tenantId: payment.tenantId,
            grossRent,
            rentPeriod,
            dueDate: payment.dueDate,
            paidDate: payment.paidDate || new Date(),
            serviceCharge,
            managementFee,
            maintenanceFees,
            otherDeductions,
            totalDeductions,
            netAmount,
            lateFees,
            payoutStatus: PayoutStatus.PENDING,
            processed: true,
            processedAt: new Date(),
          },
        });

        // 2. Create distribution items (audit trail)
        const items: Prisma.RentDistributionItemCreateManyInput[] = [
          {
            rentTransactionId: rt.id,
            unitId,
            type: 'GROSS_RENT',
            description: 'Gross rent payment received from tenant',
            amount: grossRent,
            recipientType: 'LANDLORD',
            recipientId: landlordId,
            recipientName: landlordName,
          },
          {
            rentTransactionId: rt.id,
            unitId,
            type: 'SERVICE_CHARGE',
            description: `Service charge (${unit.serviceChargeType === 'PERCENTAGE' ? `${unit.serviceCharge}%` : `KES ${unit.serviceCharge}`})`,
            amount: -serviceCharge,
            recipientType: 'SERVICE_PROVIDER',
            recipientName: 'Property Management Company',
          },
          {
            rentTransactionId: rt.id,
            unitId,
            type: 'MANAGEMENT_FEE',
            description: `Management fee (${unit.managementFeeType === 'PERCENTAGE' ? `${unit.managementFee}%` : `KES ${unit.managementFee}`})`,
            amount: -managementFee,
            recipientType: 'MANAGER',
            recipientName: 'Property Manager',
          },
        ];

        if (maintenanceFees > 0) {
          items.push({
            rentTransactionId: rt.id,
            unitId,
            type: 'MAINTENANCE_FEE',
            description: 'Approved maintenance and repair costs',
            amount: -maintenanceFees,
            recipientType: 'SERVICE_PROVIDER',
            recipientName: 'Maintenance Services',
          });
        }

        items.push({
          rentTransactionId: rt.id,
          unitId,
          type: 'NET_PAYOUT',
          description: 'Net amount to be paid to landlord',
          amount: netAmount,
          recipientType: 'LANDLORD',
          recipientId: landlordId,
          recipientName: landlordName,
        });

        await tx.rentDistributionItem.createMany({ data: items });

        // 3. Create pending payout for landlord
        const payout = await tx.payout.create({
          data: {
            landlordId,
            unitId,
            amount: netAmount,
            period: rentPeriod,
            status: PayoutStatus.PENDING,
            method: PaymentMethod.BANK_TRANSFER,
          },
        });

        // 4. Link payout to the rent transaction
        await tx.rentTransaction.update({
          where: { id: rt.id },
          data: { payoutId: payout.id, payoutStatus: PayoutStatus.PROCESSING },
        });

        return rt;
      });

      // BR-2: management fee is agent income — record it in the segregated
      // agent-income ledger. Best-effort; never fails the rent processing.
      if (managementFee > 0) {
        await recordAgentIncome({
          source: 'MANAGEMENT_FEE',
          amount: managementFee,
          companyId: payment.tenant.companyId,
          tenantId: payment.tenantId,
          leaseId: lease.id,
          rentTransactionId: rentTransaction.id,
          period: payment.dueDate,
          description: 'Management fee',
        });
      }

      return {
        rentTransactionId: rentTransaction.id,
        grossRent,
        deductions: { serviceCharge, managementFee, maintenanceFees, otherDeductions, total: totalDeductions },
        netAmount,
        lateFees,
        success: true,
        message: 'Rent payment processed successfully',
      };
    } catch (error) {
      console.error('Error processing rent payment:', error);
      return {
        rentTransactionId: '',
        grossRent: 0,
        deductions: { serviceCharge: 0, managementFee: 0, maintenanceFees: 0, otherDeductions: 0, total: 0 },
        netAmount: 0,
        lateFees: 0,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process rent payment',
      };
    }
  }

  /**
   * Process multiple rent payments in batch
   */
  async processBatchRentPayments(paymentIds: string[]): Promise<ProcessRentResult[]> {
    const results: ProcessRentResult[] = [];
    for (const paymentId of paymentIds) {
      results.push(await this.processRentPayment(paymentId));
    }
    return results;
  }

  /**
   * Mark payout as paid and update all related transactions (atomic)
   */
  async markPayoutAsPaid(payoutId: string, paidDate: Date, reference: string) {
    return prisma.$transaction(async (tx) => {
      const payout = await tx.payout.update({
        where: { id: payoutId },
        data: { status: PayoutStatus.PAID, paidDate, reference },
      });

      await tx.rentTransaction.updateMany({
        where: { payoutId },
        data: { payoutStatus: PayoutStatus.PAID, payoutDate: paidDate, payoutReference: reference },
      });

      return { success: true, payout };
    });
  }

  /**
   * Calculate a fee based on its type (FIXED or PERCENTAGE)
   */
  private calculateFee(grossRent: number, value: number, type: FeeType): number {
    if (value === 0) return 0;
    return type === FeeType.PERCENTAGE ? (grossRent * value) / 100 : value;
  }

  /**
   * Calculate maintenance fees for the rent period
   */
  private async calculateMaintenanceFees(leaseId: string, dueDate: Date): Promise<number> {
    const startDate = new Date(dueDate);
    startDate.setMonth(startDate.getMonth() - 1);

    const workOrders = await prisma.workOrder.findMany({
      where: {
        lease: { id: leaseId },
        completedDate: { gte: startDate, lte: dueDate },
        status: 'COMPLETED',
        landlordApproved: true,
      },
    });

    return workOrders.reduce((sum, wo) => sum + Number(wo.cost || 0), 0);
  }

  private formatRentPeriod(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  /**
   * Get rent transactions for a period
   */
  async getRentTransactionsForPeriod(landlordId: string, startDate: Date, endDate: Date) {
    return prisma.rentTransaction.findMany({
      where: { landlordId, paidDate: { gte: startDate, lte: endDate } },
      include: {
        payment: true,
        lease: { include: { property: true, tenant: true } },
        distributionItems: true,
        payout: true,
      },
      orderBy: { paidDate: 'asc' },
    });
  }
}

export const rentProcessor = new RentProcessor();
