/**
 * Anomaly Detection Module
 * Detect unusual patterns and alert on potential issues
 */

import { getLLMService } from './llm-service';
import { SYSTEM_PROMPTS, ANOMALY_PROMPTS } from './prompts';
import { DataAnalyzer } from './data-analyzer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Anomaly {
  id: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  metric: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;
  description: string;
  possibleCauses: string[];
  businessImpact: string;
  recommendedActions: string[];
  detectedAt: Date;
  propertyId?: string;
  propertyName?: string;
}

export interface AnomalyReport {
  critical: Anomaly[];
  high: Anomaly[];
  medium: Anomaly[];
  low: Anomaly[];
  summary: string;
}

export class AnomalyDetector {
  private llm = getLLMService();

  /**
   * Detect all anomalies across the portfolio
   */
  async detectAnomalies(): Promise<AnomalyReport> {
    try {
      const anomalies = await Promise.all([
        this.detectRevenueAnomalies(),
        this.detectPaymentAnomalies(),
        this.detectMaintenanceAnomalies(),
        this.detectOccupancyAnomalies(),
      ]);

      const flatAnomalies = anomalies.flat();

      const report: AnomalyReport = {
        critical: flatAnomalies.filter((a) => a.severity === 'CRITICAL'),
        high: flatAnomalies.filter((a) => a.severity === 'HIGH'),
        medium: flatAnomalies.filter((a) => a.severity === 'MEDIUM'),
        low: flatAnomalies.filter((a) => a.severity === 'LOW'),
        summary: '',
      };

      report.summary = this.generateSummary(report);

      return report;
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return {
        critical: [],
        high: [],
        medium: [],
        low: [],
        summary: 'Anomaly detection unavailable',
      };
    }
  }

  /**
   * Detect revenue anomalies
   */
  private async detectRevenueAnomalies(): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    try {
      const timeSeriesData = await DataAnalyzer.getTimeSeriesData(12);
      const revenueValues = timeSeriesData.map((d) => d.revenue);

      const currentRevenue = revenueValues[revenueValues.length - 1];
      const historicalRevenues = revenueValues.slice(0, -1);

      const { mean, stdDev } = DataAnalyzer.calculateStats(historicalRevenues);
      const deviation = Math.abs(currentRevenue - mean) / (stdDev || 1);

      if (deviation > 2) {
        const severity = deviation > 3 ? 'CRITICAL' : 'HIGH';

        anomalies.push({
          id: `revenue-anomaly-${Date.now()}`,
          type: 'REVENUE',
          severity,
          metric: 'Monthly Revenue',
          currentValue: currentRevenue,
          expectedValue: mean,
          deviation: Number(deviation.toFixed(2)),
          description:
            currentRevenue < mean
              ? `Revenue is ${Math.round(((mean - currentRevenue) / mean) * 100)}% below expected level`
              : `Revenue is ${Math.round(((currentRevenue - mean) / mean) * 100)}% above expected level`,
          possibleCauses:
            currentRevenue < mean
              ? [
                  'Increased vacancy rates',
                  'Late or missed rent payments',
                  'Lease terminations',
                  'Seasonal downturn',
                ]
              : [
                  'New leases signed',
                  'Rent increases implemented',
                  'Seasonal upturn',
                  'One-time payments received',
                ],
          businessImpact:
            currentRevenue < mean
              ? 'Significant impact on cash flow and profitability'
              : 'Positive impact - verify sustainability',
          recommendedActions:
            currentRevenue < mean
              ? [
                  'Review payment collection status',
                  'Analyze vacancy trends',
                  'Investigate any recent lease changes',
                  'Compare to market trends',
                ]
              : [
                  'Verify all payments are correctly recorded',
                  'Assess if increase is sustainable',
                  'Document factors driving growth',
                ],
          detectedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error detecting revenue anomalies:', error);
    }

    return anomalies;
  }

  /**
   * Detect payment pattern anomalies
   */
  private async detectPaymentAnomalies(): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const currentPayments = await prisma.payment.findMany({
        where: {
          dueDate: { gte: startOfMonth },
          type: 'RENT',
        },
      });

      const onTime = currentPayments.filter(
        (p) => p.status === 'PAID' && p.paidDate && p.paidDate <= p.dueDate
      ).length;

      const late = currentPayments.filter(
        (p) => p.status === 'OVERDUE' || (p.status === 'PAID' && p.paidDate && p.paidDate > p.dueDate)
      ).length;

      const onTimeRate = currentPayments.length > 0 ? (onTime / currentPayments.length) * 100 : 100;

      // Historical average (simplified - would need stored historical data)
      const historicalOnTimeRate = 95; // Assume 95% historical on-time rate

      if (onTimeRate < historicalOnTimeRate - 10) {
        anomalies.push({
          id: `payment-anomaly-${Date.now()}`,
          type: 'PAYMENT',
          severity: onTimeRate < 70 ? 'CRITICAL' : 'HIGH',
          metric: 'Payment On-Time Rate',
          currentValue: Number(onTimeRate.toFixed(1)),
          expectedValue: historicalOnTimeRate,
          deviation: Number((historicalOnTimeRate - onTimeRate).toFixed(1)),
          description: `Payment on-time rate dropped to ${onTimeRate.toFixed(1)}% (normally ${historicalOnTimeRate}%)`,
          possibleCauses: [
            'Economic factors affecting tenants',
            'Seasonal payment patterns',
            'Property-specific issues',
            'Communication gaps',
          ],
          businessImpact: 'Cash flow risk, potential collection issues',
          recommendedActions: [
            'Review payment reminder processes',
            'Identify tenants with changed patterns',
            'Assess if property-specific or portfolio-wide',
            'Consider payment plan options for affected tenants',
          ],
          detectedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error detecting payment anomalies:', error);
    }

    return anomalies;
  }

  /**
   * Detect maintenance anomalies
   */
  private async detectMaintenanceAnomalies(): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    try {
      const properties = await DataAnalyzer.getPropertyPerformance();

      for (const property of properties) {
        // Check if maintenance costs are unusually high
        const avgMaintenanceCost = properties.reduce((sum, p) => sum + p.maintenanceCost, 0) / properties.length;

        if (property.maintenanceCost > avgMaintenanceCost * 2) {
          anomalies.push({
            id: `maintenance-anomaly-${property.id}`,
            type: 'MAINTENANCE',
            severity: property.maintenanceCost > avgMaintenanceCost * 3 ? 'HIGH' : 'MEDIUM',
            metric: 'Maintenance Cost',
            currentValue: property.maintenanceCost,
            expectedValue: avgMaintenanceCost,
            deviation: Number((property.maintenanceCost / avgMaintenanceCost).toFixed(2)),
            description: `Maintenance costs at ${property.name} are ${Math.round((property.maintenanceCost / avgMaintenanceCost) * 100)}% of portfolio average`,
            possibleCauses: [
              'Aging infrastructure',
              'Multiple work orders for same issue',
              'Preventive maintenance gap',
              'Tenant-related damages',
            ],
            businessImpact: 'Reduced profitability, potential systemic issues',
            recommendedActions: [
              'Review work order history',
              'Identify recurring issues',
              'Consider comprehensive inspection',
              'Evaluate preventive maintenance program',
            ],
            detectedAt: new Date(),
            propertyId: property.id,
            propertyName: property.name,
          });
        }

        // Check for high maintenance request frequency
        if (property.maintenanceCount > 10) {
          anomalies.push({
            id: `maintenance-frequency-${property.id}`,
            type: 'MAINTENANCE',
            severity: 'MEDIUM',
            metric: 'Maintenance Request Count',
            currentValue: property.maintenanceCount,
            expectedValue: 5,
            deviation: property.maintenanceCount / 5,
            description: `${property.name} has ${property.maintenanceCount} maintenance requests this month`,
            possibleCauses: [
              'Property condition issues',
              'Aging equipment',
              'Tenant expectations',
              'Deferred maintenance',
            ],
            businessImpact: 'Tenant satisfaction risk, operational strain',
            recommendedActions: [
              'Categorize request types',
              'Identify root causes',
              'Plan preventive actions',
              'Monitor tenant satisfaction',
            ],
            detectedAt: new Date(),
            propertyId: property.id,
            propertyName: property.name,
          });
        }
      }
    } catch (error) {
      console.error('Error detecting maintenance anomalies:', error);
    }

    return anomalies;
  }

  /**
   * Detect occupancy anomalies
   */
  private async detectOccupancyAnomalies(): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    try {
      const properties = await DataAnalyzer.getPropertyPerformance();
      const avgOccupancy = properties.reduce((sum, p) => sum + p.occupancy, 0) / properties.length;

      for (const property of properties) {
        if (property.occupancy < avgOccupancy - 15) {
          anomalies.push({
            id: `occupancy-anomaly-${property.id}`,
            type: 'OCCUPANCY',
            severity: property.occupancy < 70 ? 'HIGH' : 'MEDIUM',
            metric: 'Occupancy Rate',
            currentValue: property.occupancy,
            expectedValue: avgOccupancy,
            deviation: Number((avgOccupancy - property.occupancy).toFixed(1)),
            description: `${property.name} occupancy at ${property.occupancy}% (portfolio avg: ${avgOccupancy.toFixed(1)}%)`,
            possibleCauses: [
              'Market conditions',
              'Pricing not competitive',
              'Property condition concerns',
              'Limited marketing',
              'Recent tenant turnover',
            ],
            businessImpact: 'Revenue loss, reduced portfolio performance',
            recommendedActions: [
              'Review pricing strategy',
              'Enhance marketing efforts',
              'Assess property condition',
              'Gather market intelligence',
              'Expedite showing process',
            ],
            detectedAt: new Date(),
            propertyId: property.id,
            propertyName: property.name,
          });
        }
      }
    } catch (error) {
      console.error('Error detecting occupancy anomalies:', error);
    }

    return anomalies;
  }

  /**
   * Generate summary of anomalies
   */
  private generateSummary(report: AnomalyReport): string {
    const total = report.critical.length + report.high.length + report.medium.length + report.low.length;

    if (total === 0) {
      return 'No significant anomalies detected. All metrics within expected ranges.';
    }

    const parts: string[] = [];

    if (report.critical.length > 0) {
      parts.push(`${report.critical.length} CRITICAL alert${report.critical.length > 1 ? 's' : ''}`);
    }

    if (report.high.length > 0) {
      parts.push(`${report.high.length} HIGH priority alert${report.high.length > 1 ? 's' : ''}`);
    }

    if (report.medium.length > 0) {
      parts.push(`${report.medium.length} MEDIUM priority alert${report.medium.length > 1 ? 's' : ''}`);
    }

    const summary = `Detected ${total} anomal${total > 1 ? 'ies' : 'y'}: ${parts.join(', ')}.`;

    if (report.critical.length > 0) {
      return `⚠️ ${summary} Immediate attention required for critical issues.`;
    } else if (report.high.length > 0) {
      return `⚡ ${summary} Priority attention needed.`;
    }

    return `ℹ️ ${summary} Review when possible.`;
  }
}

// Singleton instance
let anomalyDetectorInstance: AnomalyDetector | null = null;

export function getAnomalyDetector(): AnomalyDetector {
  if (!anomalyDetectorInstance) {
    anomalyDetectorInstance = new AnomalyDetector();
  }
  return anomalyDetectorInstance;
}
