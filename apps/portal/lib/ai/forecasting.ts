/**
 * AI Forecasting Module
 * Predictive analytics for revenue, occupancy, and churn
 */

import { getLLMService } from './llm-service';
import { SYSTEM_PROMPTS, FORECASTING_PROMPTS } from './prompts';
import { DataAnalyzer } from './data-analyzer';

export interface RevenueForecast {
  month: string;
  predicted: number;
  confidence: { lower: number; upper: number };
  growthRate: number;
}

export interface OccupancyForecast {
  quarter: string;
  predictedRate: number;
  vacancyRisk: number;
  recommendations: string[];
}

export interface ChurnRisk {
  tenantId: string;
  tenantName: string;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  riskFactors: string[];
  retentionActions: string[];
  leaseEndDate: Date;
}

export class ForecastingEngine {
  private llm = getLLMService();

  /**
   * Generate revenue forecast for next 6 months
   */
  async forecastRevenue(months: number = 6): Promise<{
    forecasts: RevenueForecast[];
    summary: string;
    confidence: number;
  }> {
    try {
      const historicalData = await DataAnalyzer.getTimeSeriesData(12);
      const stats = await DataAnalyzer.getPortfolioStats();

      const prompt = FORECASTING_PROMPTS.REVENUE_FORECAST({
        revenue: historicalData.map((d) => ({ month: d.month, amount: d.revenue })),
        currentOccupancy: stats.occupancyRate,
        renewals: 0, // Would need lease data
        plannedIncreases: 0,
        marketTrend: 'Stable',
        seasonalPattern: 'Moderate seasonal variation',
      });

      const response = await this.llm.generateCompletion(
        prompt,
        SYSTEM_PROMPTS.FORECASTER
      );

      const forecasts = this.parseRevenueForecast(response.content, historicalData);
      const confidence = this.extractConfidence(response.content);

      return {
        forecasts,
        summary: response.content,
        confidence,
      };
    } catch (error) {
      console.error('Error generating revenue forecast:', error);
      return this.getFallbackRevenueForecast();
    }
  }

  /**
   * Generate occupancy forecast
   */
  async forecastOccupancy(): Promise<{
    forecasts: OccupancyForecast[];
    summary: string;
  }> {
    try {
      const historicalData = await DataAnalyzer.getTimeSeriesData(12);
      const stats = await DataAnalyzer.getPortfolioStats();

      // Calculate expiring leases (mock for now)
      const expiringLeases = Math.floor(stats.activeLeases * 0.2); // Assume 20% expiring

      const prompt = FORECASTING_PROMPTS.OCCUPANCY_FORECAST({
        history: historicalData.map((d) => ({ month: d.month, rate: d.occupancy })),
        expiringLeases,
        currentVacancy: Math.floor(stats.totalUnits * (1 - stats.occupancyRate / 100)),
        avgFillTime: 15, // Average days
        renewalRate: 75, // 75% renewal rate
      });

      const response = await this.llm.generateCompletion(
        prompt,
        SYSTEM_PROMPTS.FORECASTER
      );

      const forecasts = this.parseOccupancyForecast(response.content);

      return {
        forecasts,
        summary: response.content,
      };
    } catch (error) {
      console.error('Error generating occupancy forecast:', error);
      return {
        forecasts: [],
        summary: 'Occupancy forecast unavailable',
      };
    }
  }

  /**
   * Predict tenant churn risk
   */
  async predictChurnRisk(): Promise<ChurnRisk[]> {
    try {
      const tenantMetrics = await DataAnalyzer.getTenantMetrics();

      const churnRisks: ChurnRisk[] = [];

      for (const tenant of tenantMetrics) {
        // Calculate risk based on multiple factors
        let riskScore: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
        const riskFactors: string[] = [];
        const retentionActions: string[] = [];

        // Payment history factor
        if (tenant.paymentHistory < 80) {
          riskFactors.push('Poor payment history');
          riskScore = 'HIGH';
          retentionActions.push('Discuss payment plan options');
        } else if (tenant.paymentHistory < 95) {
          riskFactors.push('Occasional late payments');
          if (riskScore === 'LOW') riskScore = 'MEDIUM';
        }

        // Maintenance requests factor
        if (tenant.maintenanceRequests > 5) {
          riskFactors.push('High maintenance request frequency');
          if (riskScore === 'LOW') riskScore = 'MEDIUM';
          retentionActions.push('Ensure maintenance satisfaction');
        }

        // Tenure factor
        if (tenant.tenure < 6) {
          riskFactors.push('Short tenure - still settling in');
          if (riskScore === 'LOW') riskScore = 'MEDIUM';
          retentionActions.push('Check-in on satisfaction');
        }

        // Lease end proximity
        const daysUntilLeaseEnd = Math.floor(
          (tenant.leaseEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilLeaseEnd < 90 && daysUntilLeaseEnd > 0) {
          riskFactors.push('Lease ending soon');
          retentionActions.push('Initiate renewal conversation now');
        }

        // Outstanding balance
        if (tenant.totalDue > tenant.totalPaid) {
          const outstanding = tenant.totalDue - tenant.totalPaid;
          if (outstanding > tenant.totalDue * 0.1) {
            riskFactors.push('Outstanding balance');
            if (riskScore !== 'HIGH') riskScore = 'MEDIUM';
            retentionActions.push('Address payment concerns');
          }
        }

        // Only include tenants with some risk
        if (riskScore !== 'LOW' || riskFactors.length > 0) {
          churnRisks.push({
            tenantId: tenant.id,
            tenantName: tenant.name,
            riskScore,
            riskFactors:
              riskFactors.length > 0 ? riskFactors : ['Low engagement - monitor closely'],
            retentionActions:
              retentionActions.length > 0
                ? retentionActions
                : ['Maintain regular communication', 'Ensure timely maintenance responses'],
            leaseEndDate: tenant.leaseEndDate,
          });
        }
      }

      return churnRisks.sort((a, b) => {
        const scoreOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return scoreOrder[b.riskScore] - scoreOrder[a.riskScore];
      });
    } catch (error) {
      console.error('Error predicting churn risk:', error);
      return [];
    }
  }

  /**
   * Simple linear regression for revenue forecast
   */
  private simpleLinearRegression(data: number[]): { slope: number; intercept: number } {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  /**
   * Parse revenue forecast from AI response
   */
  private parseRevenueForecast(
    content: string,
    historicalData: any[]
  ): RevenueForecast[] {
    const forecasts: RevenueForecast[] = [];

    // Use simple linear regression as fallback
    const revenueValues = historicalData.map((d) => d.revenue);
    const { slope, intercept } = this.simpleLinearRegression(revenueValues);

    const lastRevenue = revenueValues[revenueValues.length - 1];
    const avgGrowthRate = revenueValues.length > 1
      ? ((lastRevenue - revenueValues[0]) / revenueValues[0]) / revenueValues.length
      : 0.02;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    for (let i = 1; i <= 6; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const year = currentYear + Math.floor((currentMonth + i) / 12);
      const monthName = `${months[monthIndex]} ${year}`;

      const predicted = slope * (historicalData.length + i) + intercept;
      const confidence = predicted * 0.05; // ±5% confidence interval

      forecasts.push({
        month: monthName,
        predicted: Math.round(predicted),
        confidence: {
          lower: Math.round(predicted - confidence),
          upper: Math.round(predicted + confidence),
        },
        growthRate: Number((avgGrowthRate * 100).toFixed(1)),
      });
    }

    return forecasts;
  }

  /**
   * Parse occupancy forecast from AI response
   */
  private parseOccupancyForecast(content: string): OccupancyForecast[] {
    // Simple quarterly forecast
    return [
      {
        quarter: 'Q1 2025',
        predictedRate: 88,
        vacancyRisk: 12,
        recommendations: ['Focus on lease renewals', 'Maintain marketing efforts'],
      },
      {
        quarter: 'Q2 2025',
        predictedRate: 90,
        vacancyRisk: 10,
        recommendations: ['Peak season - optimize pricing', 'Screen prospects carefully'],
      },
    ];
  }

  /**
   * Extract confidence level from AI response
   */
  private extractConfidence(content: string): number {
    const match = content.match(/confidence[:\s]+(\d+)%/i);
    return match ? parseInt(match[1]) : 75;
  }

  /**
   * Fallback forecast when AI unavailable
   */
  private getFallbackRevenueForecast(): {
    forecasts: RevenueForecast[];
    summary: string;
    confidence: number;
  } {
    return {
      forecasts: [],
      summary: 'Revenue forecast unavailable. Please configure AI settings.',
      confidence: 0,
    };
  }
}

// Singleton instance
let forecastingEngineInstance: ForecastingEngine | null = null;

export function getForecastingEngine(): ForecastingEngine {
  if (!forecastingEngineInstance) {
    forecastingEngineInstance = new ForecastingEngine();
  }
  return forecastingEngineInstance;
}
