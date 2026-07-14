import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { disputeQuoteSchema } from '@/lib/validations/move-out-quote'

// POST — tenant (or staff on their behalf) declines the Statement of Repair
// Costs, recording a reason. Blocks approval and the Clearance to Vacate.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const quote = await prisma.moveOutQuote.findUnique({ where: { id } })
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

  if (session.user.role === 'TENANT' && quote.tenantId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (quote.tenantApprovedAt) {
    return NextResponse.json({ error: 'An approved statement cannot be disputed' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const data = disputeQuoteSchema.parse(body)
    const updated = await prisma.moveOutQuote.update({
      where: { id },
      data: { status: 'DISPUTED', disputeReason: data.reason },
    })
    return NextResponse.json(updated)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error disputing move-out quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
