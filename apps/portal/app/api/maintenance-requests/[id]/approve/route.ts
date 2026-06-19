import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import {
  appendAudit,
  calcDeposit,
  isQuoteExpired,
  MULTI_QUOTE_THRESHOLD,
} from '@/lib/services/repair-workflow'

const approveBodySchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { decision, rejectionReason } = approveBodySchema.parse(body)

    const req = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        quotes: { where: { isSelected: true }, take: 1 },
        _count: { select: { quotes: true } },
      },
    })
    if (!req) return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })

    // Guard: must be in AWAITING_APPROVAL
    if (req.status !== 'AWAITING_APPROVAL') {
      return NextResponse.json(
        { error: `Cannot approve — current status is ${req.status}` },
        { status: 400 }
      )
    }

    const selectedQuote = req.quotes[0]
    if (!selectedQuote) {
      return NextResponse.json({ error: 'No selected quote found' }, { status: 400 })
    }

    // Guard: quote must not be expired (brief §6)
    if (isQuoteExpired(selectedQuote.validUntil)) {
      // Auto-revert to QUOTING so contractor can re-confirm (brief §6)
      await prisma.maintenanceRequest.update({
        where: { id },
        data: { status: 'QUOTING' as any },
      })
      await appendAudit(id, 'system', 'System', 'AWAITING_APPROVAL', 'QUOTING',
        'Quote expired after 7 days — reverted to Quoting. Contractor must re-confirm or re-quote.')
      return NextResponse.json(
        { error: 'Quote has expired. Request returned to Quoting — contractor must re-confirm.' },
        { status: 400 }
      )
    }

    const quoteAmount = Number(selectedQuote.amount)

    // Guard: ≥ KSh 15,000 requires at least 3 quotes (brief §6)
    if (quoteAmount >= MULTI_QUOTE_THRESHOLD && req._count.quotes < 3) {
      return NextResponse.json(
        { error: `Works ≥ KSh ${MULTI_QUOTE_THRESHOLD.toLocaleString()} require at least 3 quotes. ${req._count.quotes} attached.` },
        { status: 400 }
      )
    }

    const now = new Date()

    if (decision === 'REJECTED') {
      const updated = await prisma.maintenanceRequest.update({
        where: { id },
        data: { status: 'QUOTING' as any, approvalDecision: 'REJECTED' },
      })
      await appendAudit(id, session.user.id, session.user.name, 'AWAITING_APPROVAL', 'QUOTING',
        `Quote rejected${rejectionReason ? `: ${rejectionReason}` : ''}. Returned to Quoting for re-quote.`)
      return NextResponse.json(updated)
    }

    // APPROVED — determine next status based on deposit threshold (brief §6)
    const { required, depositAmount, balanceAmount } = calcDeposit(quoteAmount)
    const nextStatus = required ? 'AWAITING_FUNDS' : 'IN_PROGRESS'

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: nextStatus as any,
        approvedBy: session.user.id,
        approvedAt: now,
        approvalDecision: 'APPROVED',
        selectedQuoteAmount: quoteAmount,
        depositRequired: required,
        depositAmount: required ? depositAmount : null,
        balanceAmount,
        landlordNotified: true,
        landlordNotifiedAt: now,
      },
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        property: {
          select: {
            id: true, name: true, address: true,
            landlord: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    await appendAudit(
      id, session.user.id, session.user.name, 'AWAITING_APPROVAL', nextStatus,
      required
        ? `Approved KSh ${quoteAmount.toLocaleString()}. Deposit of KSh ${depositAmount.toLocaleString()} (50%) required before dispatch.`
        : `Approved KSh ${quoteAmount.toLocaleString()}. No deposit required — proceeding to In Progress.`
    )

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error approving maintenance request:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
