import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { companyStatementGenerator } from '@/lib/services/company-statement-generator';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: companyId } = await params;
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'json';

    const now = new Date();
    const periodEnd = endDate ? new Date(endDate) : now;
    const periodStart = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const statement = await companyStatementGenerator.generateStatement(
      companyId,
      periodStart,
      periodEnd
    );

    if (format === 'html') {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { logo: true },
      });
      const html = companyStatementGenerator.generateHTML(statement, company?.logo ?? undefined);
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return NextResponse.json({ statement, success: true });
  } catch (error) {
    console.error('Error generating company statement:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to generate statement' },
      { status: 500 }
    );
  }
}
