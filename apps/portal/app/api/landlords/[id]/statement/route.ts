import { NextRequest, NextResponse } from 'next/server';
import { statementGenerator } from '@/lib/services/statement-generator';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: landlordId } = await params;
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type') || 'generate';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const period = searchParams.get('period');
    const propertyId = searchParams.get('propertyId') || undefined;
    const format = searchParams.get('format') || 'json';

    // Get statement history
    if (type === 'history') {
      const limit = parseInt(searchParams.get('limit') || '12');
      const statements = await statementGenerator.getStatementHistory(landlordId, limit);
      return NextResponse.json({ statements, success: true });
    }

    // Get existing statement by period
    if (type === 'existing' && period) {
      const statement = await statementGenerator.getStatement(landlordId, period, propertyId);
      
      if (!statement) {
        return NextResponse.json(
          { success: false, message: 'Statement not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ statement, success: true });
    }

    // Generate new statement
    let statement;

    if (year && month) {
      // Generate monthly statement
      statement = await statementGenerator.generateMonthlyStatement(
        landlordId,
        parseInt(year),
        parseInt(month),
        propertyId
      );
    } else if (startDate && endDate) {
      // Generate custom period statement
      statement = await statementGenerator.generateStatement(
        landlordId,
        new Date(startDate),
        new Date(endDate),
        propertyId
      );
    } else {
      // Default: current month
      const now = new Date();
      statement = await statementGenerator.generateMonthlyStatement(
        landlordId,
        now.getFullYear(),
        now.getMonth() + 1,
        propertyId
      );
    }

    // Return HTML format for PDF export
    if (format === 'html') {
      // Look up company name and logo via landlord
      const landlord = await prisma.landlord.findUnique({
        where: { id: landlordId },
        include: { company: { select: { name: true, logo: true } } },
      });
      const companyName = landlord?.company?.name ?? 'Property Management';
      const companyLogo = landlord?.company?.logo ?? undefined;

      const html = statementGenerator.generateHTML(statement, companyName, companyLogo);
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    return NextResponse.json({ statement, success: true });
  } catch (error) {
    console.error('Error generating statement:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to generate statement' },
      { status: 500 }
    );
  }
}
