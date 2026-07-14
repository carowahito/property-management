import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { generateMoveOutQuote } from '@/lib/services/move-out-quote'

const quoteInclude = {
  lines: { orderBy: { sortOrder: 'asc' as const } },
}

// GET — fetch the Statement of Repair Costs for an inspection (if any).
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const quote = await prisma.moveOutQuote.findUnique({
    where: { inspectionId: id },
    include: quoteInclude,
  })
  if (!quote) return NextResponse.json({ error: 'No quote for this inspection' }, { status: 404 })
  return NextResponse.json(quote)
}

// POST — generate the draft Statement (idempotent; returns the existing one if
// already present). Used as a manual fallback to the auto-draft on completion.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const quote = await generateMoveOutQuote(id)
    if (!quote) {
      return NextResponse.json(
        { error: 'A move-out quote can only be generated for a MOVE_OUT / PRE_MOVE_OUT inspection with a lease and tenant.' },
        { status: 400 }
      )
    }
    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    console.error('Error generating move-out quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
