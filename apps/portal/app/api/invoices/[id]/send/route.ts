import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { sendInvoice } from '@/lib/services/invoice-send'

// POST /api/invoices/[id]/send — manually (re)send an invoice. Respects the
// BR-1a suppression rule (won't send an already-settled invoice).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const outcome = await sendInvoice(id)
  if (outcome.status === 'skipped') {
    return NextResponse.json({ error: outcome.reason }, { status: 404 })
  }
  return NextResponse.json(outcome)
}
