import { NextRequest, NextResponse } from 'next/server';
import { tenantStatementGenerator } from '@/lib/services/tenant-statement-generator';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: tenantId } = await params;
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const unitId = searchParams.get('unitId') || undefined;
    const format = searchParams.get('format') || 'json';

    // Default: last 12 months
    const now = new Date();
    const periodEnd = endDate ? new Date(endDate) : now;
    const periodStart = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const statement = await tenantStatementGenerator.generateStatement(
      tenantId,
      periodStart,
      periodEnd,
      unitId
    );

    if (format === 'html') {
      const html = tenantStatementGenerator.generateHTML(statement);
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return NextResponse.json({ statement, success: true });
  } catch (error) {
    console.error('Error generating tenant statement:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate statement',
      },
      { status: 500 }
    );
  }
}
