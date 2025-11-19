/**
 * Team Workload Analysis API Route
 * AI-powered workload analysis and insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTeamWorkloadAnalyzer } from '@/lib/ai/team-workload';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'workloads';
    const userId = searchParams.get('userId');

    const analyzer = getTeamWorkloadAnalyzer();

    if (type === 'workloads') {
      const workloads = await analyzer.getTeamWorkloads();
      return NextResponse.json({ workloads });
    } else if (type === 'insights') {
      const insights = await analyzer.generateWorkloadInsights();
      return NextResponse.json(insights);
    } else if (type === 'leaderboard') {
      const period = (searchParams.get('period') as 'week' | 'month' | 'quarter') || 'month';
      const leaderboard = await analyzer.generateLeaderboard(period);
      return NextResponse.json({ leaderboard, period });
    } else if (type === 'member' && userId) {
      const analysis = await analyzer.analyzeMember(userId);
      return NextResponse.json(analysis);
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('Team workload API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze team workload' },
      { status: 500 }
    );
  }
}
