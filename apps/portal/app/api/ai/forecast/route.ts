/**
 * AI Forecast API Route
 * Generate revenue and occupancy forecasts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getForecastingEngine } from '@/lib/ai/forecasting';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'revenue';

    const forecastingEngine = getForecastingEngine();

    if (type === 'revenue') {
      const months = parseInt(searchParams.get('months') || '6');
      const forecast = await forecastingEngine.forecastRevenue(months);
      return NextResponse.json(forecast);
    } else if (type === 'occupancy') {
      const forecast = await forecastingEngine.forecastOccupancy();
      return NextResponse.json(forecast);
    } else if (type === 'churn') {
      const churnRisks = await forecastingEngine.predictChurnRisk();
      return NextResponse.json({ risks: churnRisks });
    }

    return NextResponse.json({ error: 'Invalid forecast type' }, { status: 400 });
  } catch (error) {
    console.error('Forecast API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate forecast' },
      { status: 500 }
    );
  }
}
