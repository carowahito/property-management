import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { generateInvoicesForPeriod } from '@/lib/services/invoice-generator'

// POST /api/invoices/generate?period=YYYY-MM
// Generates rent invoices for every active lease for the period (default: this
// month). System/agent triggered; the scheduled equivalent is the monthly cron.
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const period = request.nextUrl.searchParams.get('period') || undefined
    if (period && !/^\d{4}-\d{2}$/.test(period)) {
      return NextResponse.json({ error: 'period must be YYYY-MM' }, { status: 400 })
    }

    const result = await generateInvoicesForPeriod(period)
    return NextResponse.json({
      message: `Generated ${result.created} invoice(s) for ${result.period} (${result.existing} already existed).`,
      ...result,
    })
  } catch (error) {
    console.error('Error generating invoices:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
