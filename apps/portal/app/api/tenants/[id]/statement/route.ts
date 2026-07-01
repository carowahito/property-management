import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { tenantStatementGenerator } from '@/lib/services/tenant-statement-generator';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

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

    if (!tenantId || tenantId === 'undefined') {
      return NextResponse.json({ success: false, message: 'Tenant ID required' }, { status: 400 });
    }

    // TENANT role may only access their own statement
    if (session.user.role === 'TENANT' && session.user.id !== tenantId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const statement = await tenantStatementGenerator.generateStatement(
      tenantId,
      periodStart,
      periodEnd,
      unitId
    );

    if (format === 'html') {
      // Look up company name and logo
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { company: { select: { name: true, logo: true } } },
      });
      const companyName = tenant?.company?.name ?? 'Property Management';
      const companyLogo = tenant?.company?.logo ?? undefined;

      const html = tenantStatementGenerator.generateHTML(statement, companyName, companyLogo);
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return NextResponse.json({ statement, success: true });
  } catch (error) {
    const { id: tenantId } = await params.catch(() => ({ id: 'unknown' }));
    console.error(`Error generating tenant statement for ${tenantId}:`, error);
    const message = error instanceof Error ? error.message : 'Failed to generate statement';
    const status = message === 'Tenant not found' ? 404 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
