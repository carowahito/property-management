import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { appendAudit, quoteValidUntil } from '@/lib/services/repair-workflow'

const uploadQuoteSchema = z.object({
  contractorId: z.string().min(1),
  amount: z.number().positive(),
  fileRef: z.string().optional(),
  notes: z.string().optional(),
})

// GET — list all quotes for a request
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const quotes = await prisma.maintenanceQuote.findMany({
      where: { maintenanceRequestId: id },
      include: { contractor: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { issuedAt: 'asc' },
    })

    return NextResponse.json(quotes)
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — upload a new contractor quote → QUOTING
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { contractorId, amount, fileRef, notes } = uploadQuoteSchema.parse(body)

    const req = await prisma.maintenanceRequest.findUnique({ where: { id } })
    if (!req) return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })

    const allowedStatuses = ['RESPONSIBILITY_ASSIGNED', 'QUOTING']
    if (!allowedStatuses.includes(req.status as string)) {
      return NextResponse.json(
        { error: `Cannot add quote — current status is ${req.status}` },
        { status: 400 }
      )
    }

    const now = new Date()

    const quote = await prisma.maintenanceQuote.create({
      data: {
        maintenanceRequestId: id,
        contractorId,
        amount,
        fileRef,
        notes,
        issuedAt: now,
        validUntil: quoteValidUntil(now),
        isSelected: false,
      },
      include: { contractor: { select: { id: true, name: true } } },
    })

    // Move to QUOTING if not already there
    if (req.status !== 'QUOTING') {
      await prisma.maintenanceRequest.update({
        where: { id },
        data: { status: 'QUOTING' as any },
      })
      await appendAudit(
        id,
        session.user.id,
        session.user.name,
        req.status,
        'QUOTING',
        `First quote uploaded from ${quote.contractor?.name ?? contractorId} — KSh ${amount.toLocaleString()}`
      )
    } else {
      await appendAudit(
        id,
        session.user.id,
        session.user.name,
        'QUOTING',
        'QUOTING',
        `Quote added from ${quote.contractor?.name ?? contractorId} — KSh ${amount.toLocaleString()}`
      )
    }

    return NextResponse.json(quote, { status: 201 })
  } catch (error: any) {
    console.error('Error uploading quote:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
