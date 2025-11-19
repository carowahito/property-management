/**
 * AI Anomaly Detection API Route
 * Detect and report anomalies across portfolio metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAnomalyDetector } from '@/lib/ai/anomaly';

export async function GET(request: NextRequest) {
  try {
    const anomalyDetector = getAnomalyDetector();
    const report = await anomalyDetector.detectAnomalies();

    return NextResponse.json(report);
  } catch (error) {
    console.error('Anomaly detection API error:', error);
    return NextResponse.json(
      { error: 'Failed to detect anomalies' },
      { status: 500 }
    );
  }
}
