import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { appendAudit, isQuoteExpired } from '@/lib/services/repair-workflow'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; quoteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, quoteId } = await params

    const req = await prisma.maintenanceRequest.findUnique({ where: { id } })
    if (!req) return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })

    if (req.status !== 'QUOTING') {
      return NextResponse.json(
        { error: `Cannot select quote — current status is ${req.status}` },
        { status: 400 }
      )
    }

    const quote = await prisma.maintenanceQuote.findUnique({
      where: { id: quoteId },
      include: { contractor: { select: { name: true } } },
    })
    if (!quote || quote.maintenanceRequestId !== id) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    if (isQuoteExpired(quote.validUntil)) {
      return NextResponse.json(
        { error: 'This quote has expired. Ask the contractor to re-submit.' },
        { status: 400 }
      )
    }

    // Deselect all other quotes, select this one
    await prisma.$transaction([
      prisma.maintenanceQuote.updateMany({
        where: { maintenanceRequestId: id },
        data: { isSelected: false },
      }),
      prisma.maintenanceQuote.update({
        where: { id: quoteId },
        data: { isSelected: true },
      }),
      prisma.maintenanceRequest.update({
        where: { id },
        data: { status: 'AWAITING_APPROVAL' as any },
      }),
    ])

    await appendAudit(
      id,
      session.user.id,
      session.user.name,
      'QUOTING',
      'AWAITING_APPROVAL',
      `Quote from ${quote.contractor?.name ?? quoteId} selected — KSh ${Number(quote.amount).toLocaleString()}. Awaiting approval.`
    )

    const updated = await prisma.maintenanceRequest.findUnique({ where: { id } })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error selecting quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
