import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateQuoteSchema } from '@/lib/validations/move-out-quote'

const quoteInclude = {
  lines: { orderBy: { sortOrder: 'asc' as const } },
  inspection: {
    select: {
      id: true,
      type: true,
      completedDate: true,
      property: { select: { id: true, name: true, address: true } },
      unit: { select: { id: true, unitNumber: true } },
    },
  },
  tenant: { select: { id: true, name: true, email: true } },
}

// GET — full Statement of Repair Costs with lines and context.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const quote = await prisma.moveOutQuote.findUnique({ where: { id }, include: quoteInclude })
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

  // Tenants may only read their own statement.
  if (session.user.role === 'TENANT' && quote.tenantId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return NextResponse.json(quote)
}

// PATCH — agent notes / agent signature. Only while the quote is still a DRAFT.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role === 'TENANT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const existing = await prisma.moveOutQuote.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  if (existing.status !== 'DRAFT') {
    return NextResponse.json({ error: 'Only a draft quote can be edited' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const data = updateQuoteSchema.parse(body)
    const quote = await prisma.moveOutQuote.update({
      where: { id },
      data: {
        ...(data.agentNotes !== undefined ? { agentNotes: data.agentNotes } : {}),
        ...(data.agentSignature !== undefined
          ? { agentSignature: data.agentSignature, agentSignedAt: data.agentSignature ? new Date() : null }
          : {}),
      },
      include: quoteInclude,
    })
    return NextResponse.json(quote)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error updating move-out quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
