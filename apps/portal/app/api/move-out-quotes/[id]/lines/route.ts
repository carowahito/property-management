import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createQuoteLineSchema } from '@/lib/validations/move-out-quote'
import { recomputeTotals } from '@/lib/services/move-out-quote'

// POST — add a line to a draft Statement of Repair Costs.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role === 'TENANT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const quote = await prisma.moveOutQuote.findUnique({
    where: { id },
    select: { status: true, lines: { select: { sortOrder: true } } },
  })
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  if (quote.status !== 'DRAFT') {
    return NextResponse.json({ error: 'Only a draft quote can be edited' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const data = createQuoteLineSchema.parse(body)
    const nextOrder =
      data.sortOrder ??
      (quote.lines.reduce((max, l) => Math.max(max, l.sortOrder), -1) + 1)

    await prisma.moveOutQuoteLine.create({
      data: {
        quoteId: id,
        description: data.description,
        room: data.room ?? null,
        action: data.action,
        responsibility: data.responsibility,
        contractorId: data.contractorId ?? null,
        contractorName: data.contractorName ?? null,
        contractorContact: data.contractorContact ?? null,
        unitCost: data.unitCost,
        quantity: data.quantity,
        tenantCharge: data.responsibility === 'SHARED' ? (data.tenantCharge ?? 0) : 0,
        evidenceUrl: data.evidenceUrl ?? null,
        sortOrder: nextOrder,
      },
    })

    await recomputeTotals(id)
    const updated = await prisma.moveOutQuote.findUnique({
      where: { id },
      include: { lines: { orderBy: { sortOrder: 'asc' } } },
    })
    return NextResponse.json(updated, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error adding move-out quote line:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
