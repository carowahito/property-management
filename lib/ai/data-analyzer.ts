/**
 * Data Analyzer - Utilities for aggregating and analyzing property management data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PortfolioStats {
  totalRevenue: number;
  revenueChange: number;
  occupancyRate: number;
  occupancyChange: number;
  avgRentPrice: number;
  priceChange: number;
  maintenanceCost: number;
  costChange: number;
  totalProperties: number;
  totalUnits: number;
  activeLeases: number;
  pendingMaintenance: number;
}

export interface PropertyPerformance {
  id: string;
  name: string;
  units: number;
  occupancy: number;
  revenue: number;
  revenuePerUnit: number;
  maintenanceCost: number;
  maintenanceCostPerUnit: number;
  maintenanceCount: number;
  avgTenure: number;
  collectionRate: number;
  tenantCount: number;
}

export interface TimeSeriesData {
  month: string;
  revenue: number;
  expenses: number;
  occupancy: number;
  maintenanceCount: number;
  paymentCollectionRate: number;
}

export interface TenantMetrics {
  id: string;
  name: string;
  property: string;
  unit: string;
  tenure: number;
  paymentHistory: number;
  maintenanceRequests: number;
  leaseEndDate: Date;
  lastPaymentDate?: Date;
  totalPaid: number;
  totalDue: number;
}

export class DataAnalyzer {
  /**
   * Get comprehensive portfolio statistics
   */
  static async getPortfolioStats(): Promise<PortfolioStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all properties
    const properties = await prisma.property.findMany({
      where: { status: 'ACTIVE' },
      include: {
        tenants: { where: { status: 'ACTIVE' } },
        leases: { where: { status: 'ACTIVE' } },
      },
    });

    const totalProperties = properties.length;
    const totalUnits = properties.reduce((sum, p) => sum + (p.totalUnits ?? 0), 0);
    const occupiedUnits = properties.reduce((sum, p) => sum + p.tenants.length, 0);

    // Calculate current month metrics
    const currentMonthPayments = await prisma.payment.findMany({
      where: {
        dueDate: { gte: startOfMonth, lte: now },
        type: 'RENT',
      },
      include: { lease: true },
    });

    const totalRevenue = currentMonthPayments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Calculate last month metrics for comparison
    const lastMonthPayments = await prisma.payment.findMany({
      where: {
        dueDate: { gte: startOfLastMonth, lte: endOfLastMonth },
        type: 'RENT',
      },
    });

    const lastMonthRevenue = lastMonthPayments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const revenueChange = lastMonthRevenue > 0
      ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    // Calculate occupancy
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    // Calculate average rent (from active leases)
    const activeLeases = await prisma.lease.findMany({
      where: { status: 'ACTIVE' },
    });

    const avgRentPrice = activeLeases.length > 0
      ? activeLeases.reduce((sum, l) => sum + Number(l.monthlyRent), 0) / activeLeases.length
      : 0;

    // Calculate maintenance costs
    const maintenanceWorkOrders = await prisma.workOrder.findMany({
      where: {
        completedDate: { gte: startOfMonth, lte: now },
      },
    });

    const maintenanceCost = maintenanceWorkOrders.reduce(
      (sum, wo) => sum + Number(wo.actualCost || 0),
      0
    );

    const lastMonthWorkOrders = await prisma.workOrder.findMany({
      where: {
        completedDate: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    });

    const lastMonthMaintenance = lastMonthWorkOrders.reduce(
      (sum, wo) => sum + Number(wo.actualCost || 0),
      0
    );

    const costChange = lastMonthMaintenance > 0
      ? ((maintenanceCost - lastMonthMaintenance) / lastMonthMaintenance) * 100
      : 0;

    // Pending maintenance requests
    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
    });

    return {
      totalRevenue,
      revenueChange: Number(revenueChange.toFixed(1)),
      occupancyRate: Number(occupancyRate.toFixed(1)),
      occupancyChange: 0, // Would need historical tracking
      avgRentPrice,
      priceChange: 0, // Would need historical tracking
      maintenanceCost,
      costChange: Number(costChange.toFixed(1)),
      totalProperties,
      totalUnits,
      activeLeases: activeLeases.length,
      pendingMaintenance,
    };
  }

  /**
   * Get property performance metrics
   */
  static async getPropertyPerformance(): Promise<PropertyPerformance[]> {
    const properties = await prisma.property.findMany({
      where: { status: 'ACTIVE' },
      include: {
        tenants: { where: { status: 'ACTIVE' } },
        leases: { where: { status: 'ACTIVE' } },
        maintenanceRequests: {
          where: {
            createdAt: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            },
          },
        },
      },
    });

    const performanceData: PropertyPerformance[] = [];

    for (const property of properties) {
      const occupiedUnits = property.tenants.length;
      const occupancy = property.totalUnits > 0 ? (occupiedUnits / property.totalUnits) * 100 : 0;

      // Calculate revenue from active leases
      const revenue = property.leases.reduce((sum, l) => sum + Number(l.monthlyRent), 0);
      const revenuePerUnit = property.totalUnits > 0 ? revenue / property.totalUnits : 0;

      // Calculate maintenance costs
      const workOrders = await prisma.workOrder.findMany({
        where: {
          maintenanceRequest: {
            propertyId: property.id,
          },
          completedDate: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
      });

      const maintenanceCost = workOrders.reduce((sum, wo) => sum + Number(wo.actualCost || 0), 0);
      const maintenanceCostPerUnit = property.totalUnits > 0 ? maintenanceCost / property.totalUnits : 0;

      // Calculate average tenant tenure
      const tenantsWithMoveIn = property.tenants.filter((t) => t.moveInDate);
      const avgTenure = tenantsWithMoveIn.length > 0
        ? tenantsWithMoveIn.reduce((sum, t) => {
            const months = t.moveInDate
              ? (new Date().getTime() - new Date(t.moveInDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
              : 0;
            return sum + months;
          }, 0) / tenantsWithMoveIn.length
        : 0;

      // Calculate payment collection rate
      const propertyPayments = await prisma.payment.findMany({
        where: {
          lease: { propertyId: property.id },
          dueDate: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
      });

      const paidPayments = propertyPayments.filter((p) => p.status === 'PAID').length;
      const collectionRate = propertyPayments.length > 0
        ? (paidPayments / propertyPayments.length) * 100
        : 100;

      performanceData.push({
        id: property.id,
        name: property.name,
        units: property.totalUnits,
        occupancy: Number(occupancy.toFixed(1)),
        revenue,
        revenuePerUnit,
        maintenanceCost,
        maintenanceCostPerUnit,
        maintenanceCount: property.maintenanceRequests.length,
        avgTenure: Number(avgTenure.toFixed(1)),
        collectionRate: Number(collectionRate.toFixed(1)),
        tenantCount: property.tenants.length,
      });
    }

    return performanceData.sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Get time series data for trends
   */
  static async getTimeSeriesData(months: number = 6): Promise<TimeSeriesData[]> {
    const data: TimeSeriesData[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      // Revenue
      const payments = await prisma.payment.findMany({
        where: {
          dueDate: { gte: monthStart, lte: monthEnd },
          type: 'RENT',
          status: 'PAID',
        },
      });

      const revenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

      // Expenses (maintenance)
      const workOrders = await prisma.workOrder.findMany({
        where: {
          completedDate: { gte: monthStart, lte: monthEnd },
        },
      });

      const expenses = workOrders.reduce((sum, wo) => sum + Number(wo.actualCost || 0), 0);

      // Maintenance count
      const maintenanceCount = await prisma.maintenanceRequest.count({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      });

      // Payment collection rate
      const allPayments = await prisma.payment.findMany({
        where: {
          dueDate: { gte: monthStart, lte: monthEnd },
          type: 'RENT',
        },
      });

      const paidCount = allPayments.filter((p) => p.status === 'PAID').length;
      const paymentCollectionRate = allPayments.length > 0
        ? (paidCount / allPayments.length) * 100
        : 100;

      // Occupancy (snapshot at end of month)
      const properties = await prisma.property.findMany({
        where: { status: 'ACTIVE' },
        include: {
          tenants: {
            where: {
              status: 'ACTIVE',
              moveInDate: { lte: monthEnd },
              OR: [
                { moveOutDate: null },
                { moveOutDate: { gte: monthEnd } },
              ],
            },
          },
        },
      });

      const totalUnits = properties.reduce((sum, p) => sum + (p.totalUnits ?? 0), 0);
      const occupiedUnits = properties.reduce((sum, p) => sum + p.tenants.length, 0);
      const occupancy = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      data.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue,
        expenses,
        occupancy: Number(occupancy.toFixed(1)),
        maintenanceCount,
        paymentCollectionRate: Number(paymentCollectionRate.toFixed(1)),
      });
    }

    return data;
  }

  /**
   * Get tenant metrics for churn prediction
   */
  static async getTenantMetrics(): Promise<TenantMetrics[]> {
    const tenants = await prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
      include: {
        property: true,
        leases: { where: { status: 'ACTIVE' } },
        payments: {
          where: {
            dueDate: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
            },
          },
        },
        maintenanceRequests: {
          where: {
            createdAt: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
            },
          },
        },
      },
    });

    return tenants.map((tenant) => {
      const activeLease = tenant.leases[0];
      const tenure = tenant.moveInDate
        ? (new Date().getTime() - new Date(tenant.moveInDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
        : 0;

      const totalPayments = tenant.payments.length;
      const paidOnTime = tenant.payments.filter(
        (p) => p.status === 'PAID' && p.paidDate && p.paidDate <= p.dueDate
      ).length;

      const paymentHistory = totalPayments > 0 ? (paidOnTime / totalPayments) * 100 : 100;

      const totalDue = tenant.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalPaid = tenant.payments
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const lastPayment = tenant.payments
        .filter((p) => p.status === 'PAID' && p.paidDate)
        .sort((a, b) => b.paidDate!.getTime() - a.paidDate!.getTime())[0];

      return {
        id: tenant.id,
        name: tenant.name,
        property: tenant.property.name,
        unit: tenant.unit || '',
        tenure: Number(tenure.toFixed(1)),
        paymentHistory: Number(paymentHistory.toFixed(1)),
        maintenanceRequests: tenant.maintenanceRequests.length,
        leaseEndDate: activeLease?.endDate || new Date(),
        lastPaymentDate: lastPayment?.paidDate || undefined,
        totalPaid,
        totalDue,
      };
    });
  }

  /**
   * Calculate statistics for anomaly detection
   */
  static calculateStats(values: number[]): { mean: number; stdDev: number } {
    if (values.length === 0) return { mean: 0, stdDev: 0 };

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev };
  }

  /**
   * Detect anomalies in metrics
   */
  static detectAnomalies(
    current: number,
    historical: number[],
    threshold: number = 2
  ): { isAnomaly: boolean; severity: string; deviation: number } {
    const { mean, stdDev } = this.calculateStats(historical);
    const deviation = Math.abs(current - mean) / (stdDev || 1);

    let isAnomaly = false;
    let severity = 'NORMAL';

    if (deviation > threshold) {
      isAnomaly = true;
      if (deviation > 3) severity = 'CRITICAL';
      else if (deviation > 2.5) severity = 'HIGH';
      else severity = 'MEDIUM';
    }

    return { isAnomaly, severity, deviation: Number(deviation.toFixed(2)) };
  }
}
