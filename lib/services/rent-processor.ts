/**
 * Rent Distribution Processor
 * Handles rent collection, deduction calculations, and distribution to landlords
 */

import { PrismaClient, PaymentType, PayoutStatus, PaymentMethod, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface RentProcessingConfig {
  // Default percentages/amounts for a property or landlord
  serviceChargePercentage?: number; // e.g., 10% of rent
  serviceChargeFixed?: number; // or fixed amount
  managementFeePercentage?: number; // e.g., 8% of rent
  managementFeeFixed?: number;
  includeMaintenanceCosts?: boolean;
}

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
   * Process a rent payment and create rent distribution
   */
  async processRentPayment(
    paymentId: string,
    config: RentProcessingConfig = {}
  ): Promise<ProcessRentResult> {
    try {
      // Get the payment with related data
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          lease: {
            include: {
              property: {
                include: {
                  landlord: true,
                },
              },
              tenant: true,
            },
          },
          tenant: true,
          rentTransaction: true,
        },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.type !== PaymentType.RENT) {
        throw new Error('Payment is not a rent payment');
      }

      if (payment.rentTransaction) {
        throw new Error('Payment already processed');
      }

      const { lease } = payment;
      const grossRent = Number(payment.amount);

      // Check for late fees on this payment
      const lateFeePayment = await prisma.payment.findFirst({
        where: {
          tenantId: payment.tenantId,
          leaseId: payment.leaseId,
          type: PaymentType.LATE_FEE,
          paidDate: payment.paidDate,
        },
      });

      const lateFees = lateFeePayment ? Number(lateFeePayment.amount) : 0;

      // Calculate deductions
      const serviceCharge = this.calculateServiceCharge(grossRent, config);
      const managementFee = this.calculateManagementFee(grossRent, config);
      const maintenanceFees = config.includeMaintenanceCosts
        ? await this.calculateMaintenanceFees(lease.id, payment.dueDate)
        : 0;
      const otherDeductions = 0; // Can be extended for other agreed deductions

      const totalDeductions =
        serviceCharge + managementFee + maintenanceFees + otherDeductions;
      const netAmount = grossRent - totalDeductions;

      // Create rent transaction
      const rentTransaction = await prisma.rentTransaction.create({
        data: {
          paymentId: payment.id,
          leaseId: lease.id,
          landlordId: lease.property.landlordId,
          propertyId: lease.propertyId,
          unitId: lease.unit || null,
          tenantId: payment.tenantId,

          grossRent,
          rentPeriod: this.formatRentPeriod(payment.dueDate),
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

      // Create distribution items for transparency
      await this.createDistributionItems(rentTransaction.id, {
        grossRent,
        serviceCharge,
        managementFee,
        maintenanceFees,
        otherDeductions,
        netAmount,
        landlordId: lease.property.landlordId,
        landlordName: lease.property.landlord.name,
      });

      return {
        rentTransactionId: rentTransaction.id,
        grossRent,
        deductions: {
          serviceCharge,
          managementFee,
          maintenanceFees,
          otherDeductions,
          total: totalDeductions,
        },
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
        deductions: {
          serviceCharge: 0,
          managementFee: 0,
          maintenanceFees: 0,
          otherDeductions: 0,
          total: 0,
        },
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
  async processBatchRentPayments(
    paymentIds: string[],
    config: RentProcessingConfig = {}
  ): Promise<ProcessRentResult[]> {
    const results: ProcessRentResult[] = [];

    for (const paymentId of paymentIds) {
      const result = await this.processRentPayment(paymentId, config);
      results.push(result);
    }

    return results;
  }

  /**
   * Create payout for landlord from processed rent transactions
   */
  async createLandlordPayout(
    landlordId: string,
    transactionIds: string[],
    paymentMethod: PaymentMethod,
    reference?: string
  ) {
    try {
      // Get all rent transactions
      const transactions = await prisma.rentTransaction.findMany({
        where: {
          id: { in: transactionIds },
          landlordId,
          payoutStatus: PayoutStatus.PENDING,
        },
      });

      if (transactions.length === 0) {
        throw new Error('No pending transactions found');
      }

      const totalAmount = transactions.reduce(
        (sum, t) => sum + Number(t.netAmount),
        0
      );

      // Get rent period from first transaction
      const period = transactions[0].rentPeriod;

      // Create payout
      const payout = await prisma.payout.create({
        data: {
          landlordId,
          amount: totalAmount,
          period,
          status: PayoutStatus.PENDING,
          method: paymentMethod,
          reference,
        },
      });

      // Update rent transactions with payout ID
      await prisma.rentTransaction.updateMany({
        where: { id: { in: transactionIds } },
        data: {
          payoutId: payout.id,
          payoutStatus: PayoutStatus.PROCESSING,
        },
      });

      return {
        success: true,
        payoutId: payout.id,
        amount: totalAmount,
        transactionCount: transactions.length,
      };
    } catch (error) {
      console.error('Error creating payout:', error);
      throw error;
    }
  }

  /**
   * Mark payout as paid and update all related transactions
   */
  async markPayoutAsPaid(
    payoutId: string,
    paidDate: Date,
    reference: string
  ) {
    try {
      // Update payout
      const payout = await prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.PAID,
          paidDate,
          reference,
        },
      });

      // Update all related rent transactions
      await prisma.rentTransaction.updateMany({
        where: { payoutId },
        data: {
          payoutStatus: PayoutStatus.PAID,
          payoutDate: paidDate,
          payoutReference: reference,
        },
      });

      return { success: true, payout };
    } catch (error) {
      console.error('Error marking payout as paid:', error);
      throw error;
    }
  }

  /**
   * Calculate service charge
   */
  private calculateServiceCharge(
    grossRent: number,
    config: RentProcessingConfig
  ): number {
    if (config.serviceChargeFixed !== undefined) {
      return config.serviceChargeFixed;
    }

    if (config.serviceChargePercentage !== undefined) {
      return (grossRent * config.serviceChargePercentage) / 100;
    }

    // Default: 10% of rent
    return (grossRent * 10) / 100;
  }

  /**
   * Calculate management fee (commission)
   */
  private calculateManagementFee(
    grossRent: number,
    config: RentProcessingConfig
  ): number {
    if (config.managementFeeFixed !== undefined) {
      return config.managementFeeFixed;
    }

    if (config.managementFeePercentage !== undefined) {
      return (grossRent * config.managementFeePercentage) / 100;
    }

    // Default: 8% of rent
    return (grossRent * 8) / 100;
  }

  /**
   * Calculate maintenance fees for the period
   */
  private async calculateMaintenanceFees(
    leaseId: string,
    dueDate: Date
  ): Promise<number> {
    // Calculate start and end of the rent period
    const startDate = new Date(dueDate);
    startDate.setMonth(startDate.getMonth() - 1);

    const workOrders = await prisma.workOrder.findMany({
      where: {
        lease: { id: leaseId },
        completedDate: {
          gte: startDate,
          lte: dueDate,
        },
        status: 'COMPLETED',
        landlordApproved: true, // Only approved maintenance costs
      },
    });

    return workOrders.reduce((sum, wo) => sum + Number(wo.cost || 0), 0);
  }

  /**
   * Format rent period (e.g., "November 2025")
   */
  private formatRentPeriod(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  /**
   * Create detailed distribution items
   */
  private async createDistributionItems(
    rentTransactionId: string,
    data: {
      grossRent: number;
      serviceCharge: number;
      managementFee: number;
      maintenanceFees: number;
      otherDeductions: number;
      netAmount: number;
      landlordId: string;
      landlordName: string;
    }
  ) {
    const items: Prisma.RentDistributionItemCreateManyInput[] = [
      {
        rentTransactionId,
        type: 'GROSS_RENT' as const,
        description: 'Gross rent payment received from tenant',
        amount: data.grossRent,
        recipientType: 'LANDLORD' as const,
        recipientId: data.landlordId,
        recipientName: data.landlordName,
      },
      {
        rentTransactionId,
        type: 'SERVICE_CHARGE' as const,
        description: 'Monthly service charge for property management company',
        amount: -data.serviceCharge,
        recipientType: 'SERVICE_PROVIDER' as const,
        recipientName: 'Property Management Company',
      },
      {
        rentTransactionId,
        type: 'MANAGEMENT_FEE' as const,
        description: 'Property management commission',
        amount: -data.managementFee,
        recipientType: 'MANAGER' as const,
        recipientName: 'Property Manager',
      },
    ];

    if (data.maintenanceFees > 0) {
      items.push({
        rentTransactionId,
        type: 'MAINTENANCE_FEE' as const,
        description: 'Approved maintenance and repair costs',
        amount: -data.maintenanceFees,
        recipientType: 'SERVICE_PROVIDER' as const,
        recipientName: 'Maintenance Services',
      });
    }

    if (data.otherDeductions > 0) {
      items.push({
        rentTransactionId,
        type: 'OTHER_DEDUCTION' as const,
        description: 'Other agreed deductions',
        amount: -data.otherDeductions,
        recipientType: 'OTHER' as const,
        recipientName: 'Various',
      });
    }

    items.push({
      rentTransactionId,
      type: 'NET_PAYOUT' as const,
      description: 'Net amount to be paid to landlord',
      amount: data.netAmount,
      recipientType: 'LANDLORD' as const,
      recipientId: data.landlordId,
      recipientName: data.landlordName,
    });

    await prisma.rentDistributionItem.createMany({
      data: items,
    });
  }

  /**
   * Get rent transactions for a period
   */
  async getRentTransactionsForPeriod(
    landlordId: string,
    startDate: Date,
    endDate: Date
  ) {
    return prisma.rentTransaction.findMany({
      where: {
        landlordId,
        paidDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        payment: true,
        lease: {
          include: {
            property: true,
            tenant: true,
          },
        },
        distributionItems: true,
        payout: true,
      },
      orderBy: {
        paidDate: 'asc',
      },
    });
  }
}

export const rentProcessor = new RentProcessor();
