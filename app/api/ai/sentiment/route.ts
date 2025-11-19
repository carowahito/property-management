/**
 * AI Sentiment Analysis API Route
 * Analyze communications and tenant satisfaction
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSentimentAnalyzer } from '@/lib/ai/sentiment';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'portfolio';
    const messageId = searchParams.get('messageId');
    const tenantId = searchParams.get('tenantId');

    const sentimentAnalyzer = getSentimentAnalyzer();

    if (type === 'portfolio') {
      const sentiment = await sentimentAnalyzer.analyzePortfolioSentiment();
      return NextResponse.json(sentiment);
    } else if (type === 'message' && messageId) {
      const sentiment = await sentimentAnalyzer.analyzeMessage(messageId);
      return NextResponse.json(sentiment);
    } else if (type === 'tenant' && tenantId) {
      const satisfaction = await sentimentAnalyzer.analyzeTenantSatisfaction(tenantId);
      return NextResponse.json(satisfaction);
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('Sentiment API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    );
  }
}
