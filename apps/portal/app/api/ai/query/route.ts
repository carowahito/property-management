/**
 * AI Natural Language Query API Route
 * Answer natural language questions about portfolio data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLLMService } from '@/lib/ai/llm-service';
import { SYSTEM_PROMPTS, QUERY_PROMPTS } from '@/lib/ai/prompts';
import { DataAnalyzer } from '@/lib/ai/data-analyzer';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Gather relevant context based on query
    const context: any = {};

    // Check what data the query might need
    const lowerQuery = query.toLowerCase();

    if (
      lowerQuery.includes('revenue') ||
      lowerQuery.includes('income') ||
      lowerQuery.includes('money')
    ) {
      const stats = await DataAnalyzer.getPortfolioStats();
      context.revenue = stats.totalRevenue;
      context.revenueChange = stats.revenueChange;
    }

    if (
      lowerQuery.includes('occupancy') ||
      lowerQuery.includes('vacant') ||
      lowerQuery.includes('occupied')
    ) {
      const stats = await DataAnalyzer.getPortfolioStats();
      context.occupancy = stats.occupancyRate;
      context.totalUnits = stats.totalUnits;
      context.occupiedUnits = Math.round((stats.totalUnits * stats.occupancyRate) / 100);
    }

    if (
      lowerQuery.includes('property') ||
      lowerQuery.includes('properties') ||
      lowerQuery.includes('building')
    ) {
      const properties = await DataAnalyzer.getPropertyPerformance();
      context.properties = properties.slice(0, 10); // Top 10
    }

    if (
      lowerQuery.includes('maintenance') ||
      lowerQuery.includes('repair') ||
      lowerQuery.includes('issue')
    ) {
      const stats = await DataAnalyzer.getPortfolioStats();
      context.maintenanceCost = stats.maintenanceCost;
      context.pendingMaintenance = stats.pendingMaintenance;
    }

    if (lowerQuery.includes('tenant') || lowerQuery.includes('lease')) {
      const stats = await DataAnalyzer.getPortfolioStats();
      context.activeLeases = stats.activeLeases;
    }

    if (lowerQuery.includes('trend') || lowerQuery.includes('over time')) {
      const trendData = await DataAnalyzer.getTimeSeriesData(6);
      context.trends = trendData;
    }

    // Generate response using LLM
    const llm = getLLMService();
    const prompt = QUERY_PROMPTS.NATURAL_LANGUAGE_QUERY(query, context);
    const response = await llm.generateCompletion(prompt, SYSTEM_PROMPTS.PROPERTY_ANALYST);

    return NextResponse.json({
      query,
      answer: response.content,
      context: Object.keys(context),
    });
  } catch (error) {
    console.error('Query API error:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
