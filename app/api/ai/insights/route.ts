/**
 * AI Insights API Route
 * Generate executive insights and property-specific insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { getInsightsGenerator } from '@/lib/ai/insights';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'executive';
    const propertyId = searchParams.get('propertyId');

    const insightsGenerator = getInsightsGenerator();

    if (type === 'executive') {
      const insights = await insightsGenerator.generateExecutiveInsights();
      return NextResponse.json(insights);
    } else if (type === 'property' && propertyId) {
      const insights = await insightsGenerator.generatePropertyInsights(propertyId);
      return NextResponse.json(insights);
    } else if (type === 'trends') {
      const months = parseInt(searchParams.get('months') || '6');
      const insights = await insightsGenerator.generateTrendInsights(months);
      return NextResponse.json({ analysis: insights });
    } else if (type === 'comparative') {
      const insights = await insightsGenerator.generateComparativeAnalysis();
      return NextResponse.json({ analysis: insights });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
