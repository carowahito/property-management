/**
 * AI Report Generation API Route
 * Generate comprehensive reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLLMService } from '@/lib/ai/llm-service';
import { SYSTEM_PROMPTS, REPORT_PROMPTS } from '@/lib/ai/prompts';
import { DataAnalyzer } from '@/lib/ai/data-analyzer';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'executive';
    const period = searchParams.get('period') || 'monthly';

    const stats = await DataAnalyzer.getPortfolioStats();
    const properties = await DataAnalyzer.getPropertyPerformance();
    const trends = await DataAnalyzer.getTimeSeriesData(6);

    const llm = getLLMService();

    if (type === 'executive') {
      const reportData = {
        period: period === 'monthly' ? 'Monthly Report' : 'Quarterly Report',
        portfolioName: 'Property Portfolio',
        financial: {
          revenue: stats.totalRevenue,
          revenueChange: stats.revenueChange,
          maintenanceCost: stats.maintenanceCost,
          costChange: stats.costChange,
          netIncome: stats.totalRevenue - stats.maintenanceCost,
        },
        operational: {
          occupancyRate: stats.occupancyRate,
          totalProperties: stats.totalProperties,
          totalUnits: stats.totalUnits,
          activeLeases: stats.activeLeases,
          pendingMaintenance: stats.pendingMaintenance,
        },
        properties: properties.slice(0, 5).map((p) => ({
          name: p.name,
          occupancy: p.occupancy,
          revenue: p.revenue,
          units: p.units,
        })),
      };

      const prompt = REPORT_PROMPTS.EXECUTIVE_REPORT(reportData);
      const response = await llm.generateCompletion(prompt, SYSTEM_PROMPTS.REPORT_WRITER);

      return NextResponse.json({
        type: 'executive',
        period: reportData.period,
        content: response.content,
        data: reportData,
        generated: new Date().toISOString(),
      });
    } else if (type === 'monthly') {
      const currentMonth = new Date().toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      const monthData = {
        month: currentMonth,
        revenue: stats.totalRevenue,
        revenueChange: stats.revenueChange,
        occupancy: stats.occupancyRate,
        maintenanceCost: stats.maintenanceCost,
        activeLeases: stats.activeLeases,
        topProperties: properties.slice(0, 3),
        trends: trends.slice(-3), // Last 3 months
      };

      const prompt = REPORT_PROMPTS.MONTHLY_SUMMARY(monthData);
      const response = await llm.generateCompletion(prompt, SYSTEM_PROMPTS.REPORT_WRITER);

      return NextResponse.json({
        type: 'monthly',
        month: currentMonth,
        content: response.content,
        data: monthData,
        generated: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  } catch (error) {
    console.error('Report generation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
