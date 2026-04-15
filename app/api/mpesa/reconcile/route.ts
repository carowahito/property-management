import { NextRequest, NextResponse } from 'next/server';
import { runReconciliation } from '@/lib/services/mpesa/reconciliation';

/**
 * POST /api/mpesa/reconcile
 * Triggers a reconciliation run for a company + date range.
 *
 * Body: { companyId, startDate, endDate }
 *
 * GET /api/mpesa/reconcile?companyId=xxx
 * Returns reconciliation history.
 */
export async function POST(request: NextRequest) {
  try {
    const { companyId, startDate, endDate } = await request.json();

    if (!companyId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'companyId, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    const result = await runReconciliation(
      companyId,
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({ success: true, reconciliation: result });
  } catch (error) {
    console.error('Reconciliation error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Reconciliation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { success: false, message: 'companyId is required' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/db');
    const runs = await prisma.reconciliationRun.findMany({
      where: { companyId },
      orderBy: { runDate: 'desc' },
      take: 20,
    });

    return NextResponse.json({ success: true, runs });
  } catch (error) {
    console.error('Reconciliation history error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reconciliation history' },
      { status: 500 }
    );
  }
}
