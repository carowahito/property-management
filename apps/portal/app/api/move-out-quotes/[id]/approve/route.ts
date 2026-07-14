import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { approveQuoteSchema } from '@/lib/validations/move-out-quote'
import { reconcileDepositForQuote } from '@/lib/services/move-out-quote'

// POST — tenant approves the Statement of Repair Costs (clause 8.3). Callable
// by the tenant in-app/by email, or by staff for on-the-day in-person approval.
// On first approval the deposit is reconciled and the quote moves to AGREED.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const quote = await prisma.moveOutQuote.findUnique({ where: { id } })
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

  const isTenant = session.user.role === 'TENANT'
  if (isTenant && quote.tenantId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (quote.status === 'DISPUTED') {
    return NextResponse.json({ error: 'This statement is under dispute and cannot be approved' }, { status: 400 })
  }
  if (quote.tenantApprovedAt) {
    return NextResponse.json({ error: 'This statement has already been approved' }, { status: 400 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const data = approveQuoteSchema.parse(body)
    // Tenants approving in-app default to IN_APP; staff record IN_PERSON.
    const via = isTenant ? (data.via === 'EMAIL' ? 'EMAIL' : 'IN_APP') : 'IN_PERSON'

    const updated = await prisma.moveOutQuote.update({
      where: { id },
      data: {
        status: 'AGREED',
        tenantApprovedAt: new Date(),
        tenantApprovalVia: via,
        ...(data.tenantSignature ? { tenantSignature: data.tenantSignature } : {}),
      },
    })

    // Apply the agreed deductions to the deposit (clause 8.3).
    await reconcileDepositForQuote(id)

    return NextResponse.json(updated)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error approving move-out quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
