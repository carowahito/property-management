import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateQuoteLineSchema } from '@/lib/validations/move-out-quote'
import { recomputeTotals } from '@/lib/services/move-out-quote'

async function loadDraftLine(quoteId: string, lineId: string) {
  const line = await prisma.moveOutQuoteLine.findUnique({
    where: { id: lineId },
    include: { quote: { select: { id: true, status: true } } },
  })
  if (!line || line.quoteId !== quoteId) return { error: 'Line not found', status: 404 as const }
  if (line.quote.status !== 'DRAFT') return { error: 'Only a draft quote can be edited', status: 400 as const }
  return { line }
}

// PATCH — edit a line (cost, responsibility, contractor, etc.), then recompute.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role === 'TENANT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, lineId } = await params
  const loaded = await loadDraftLine(id, lineId)
  if ('error' in loaded) return NextResponse.json({ error: loaded.error }, { status: loaded.status })

  try {
    const body = await request.json()
    const data = updateQuoteLineSchema.parse(body)

    // Resolve the effective responsibility to keep tenantCharge consistent.
    const responsibility = data.responsibility ?? loaded.line.responsibility
    let tenantCharge: number | undefined
    if (data.responsibility !== undefined || data.tenantCharge !== undefined) {
      tenantCharge = responsibility === 'SHARED' ? (data.tenantCharge ?? Number(loaded.line.tenantCharge)) : undefined
    }

    await prisma.moveOutQuoteLine.update({
      where: { id: lineId },
      data: {
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.room !== undefined ? { room: data.room } : {}),
        ...(data.action !== undefined ? { action: data.action } : {}),
        ...(data.responsibility !== undefined ? { responsibility: data.responsibility } : {}),
        ...(data.contractorId !== undefined ? { contractorId: data.contractorId } : {}),
        ...(data.contractorName !== undefined ? { contractorName: data.contractorName } : {}),
        ...(data.contractorContact !== undefined ? { contractorContact: data.contractorContact } : {}),
        ...(data.unitCost !== undefined ? { unitCost: data.unitCost } : {}),
        ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
        ...(tenantCharge !== undefined ? { tenantCharge } : {}),
        ...(data.evidenceUrl !== undefined ? { evidenceUrl: data.evidenceUrl } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      },
    })

    await recomputeTotals(id)
    const updated = await prisma.moveOutQuote.findUnique({
      where: { id },
      include: { lines: { orderBy: { sortOrder: 'asc' } } },
    })
    return NextResponse.json(updated)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error updating move-out quote line:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — remove a line, then recompute.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role === 'TENANT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, lineId } = await params
  const loaded = await loadDraftLine(id, lineId)
  if ('error' in loaded) return NextResponse.json({ error: loaded.error }, { status: loaded.status })

  await prisma.moveOutQuoteLine.delete({ where: { id: lineId } })
  await recomputeTotals(id)
  const updated = await prisma.moveOutQuote.findUnique({
    where: { id },
    include: { lines: { orderBy: { sortOrder: 'asc' } } },
  })
  return NextResponse.json(updated)
}
