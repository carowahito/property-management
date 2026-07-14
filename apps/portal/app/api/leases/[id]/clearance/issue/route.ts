import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { syncClearance } from '@/lib/services/clearance'
import { buildClearanceHtml } from '@/lib/services/clearance-document'
import { sendEmail } from '@/lib/services/email'

const issueSchema = z.object({
  toTenant: z.boolean().optional().default(false),
  toLandlord: z.boolean().optional().default(false),
  extraEmails: z.array(z.string().email()).optional().default([]),
})

// POST — clear the tenant to vacate (clause 8.4) and issue the Clearance notice
// to the selected recipients (tenant, landlord and/or manually entered emails).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role === 'TENANT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  // Re-evaluate the gate at issue time — never trust a stale client state.
  const state = await syncClearance(id)
  if (!state.clearance) {
    return NextResponse.json({ error: 'No move-out inspection / statement for this lease yet' }, { status: 400 })
  }
  if (state.clearance.status === 'ISSUED') {
    return NextResponse.json({ error: 'Clearance has already been issued' }, { status: 400 })
  }
  if (!state.ready) {
    const unmet = state.conditions.filter((c) => !c.met).map((c) => c.label)
    return NextResponse.json(
      { error: 'Clearance conditions not yet met', unmet },
      { status: 400 }
    )
  }

  try {
    const data = issueSchema.parse(await request.json().catch(() => ({})))

    const lease = await prisma.lease.findUnique({
      where: { id },
      select: {
        unit: true,
        tenant: { select: { name: true, email: true } },
        property: { select: { name: true, landlordId: true } },
      },
    })
    if (!lease) return NextResponse.json({ error: 'Lease not found' }, { status: 404 })

    // Resolve recipients.
    const recipients = new Set<string>(data.extraEmails)
    if (data.toTenant && lease.tenant?.email) recipients.add(lease.tenant.email)
    let landlordEmail: string | null = null
    if (data.toLandlord && lease.property?.landlordId) {
      const landlord = await prisma.landlord.findUnique({
        where: { id: lease.property.landlordId },
        select: { email: true },
      })
      landlordEmail = landlord?.email ?? null
      if (landlordEmail) recipients.add(landlordEmail)
    }
    if (recipients.size === 0) {
      return NextResponse.json({ error: 'Select at least one recipient for the clearance notice' }, { status: 400 })
    }

    const issuedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const unitLabel = lease.unit ? ` - Unit ${lease.unit}` : ''
    const html = buildClearanceHtml(
      {
        tenantName: lease.tenant?.name || 'Tenant',
        propertyName: lease.property?.name || 'Property',
        unitLabel,
        issuedDate,
      },
      state
    )

    const sent = await sendEmail({
      to: Array.from(recipients),
      subject: `Clearance to Vacate - ${lease.property?.name || 'Property'}${unitLabel}`,
      html,
    })
    if (!sent) {
      return NextResponse.json({ error: 'Clearance email could not be sent (check email service configuration)' }, { status: 502 })
    }

    const documentUrl = `/api/leases/${id}/clearance/document`
    const now = new Date()
    await prisma.clearanceToVacate.update({
      where: { leaseId: id },
      data: {
        status: 'ISSUED',
        issuedAt: now,
        issuedToOfficeAt: now,
        officeEmail: Array.from(recipients).join(', '),
        documentUrl,
      },
    })

    // File the notice against the tenant and landlord.
    const docCreates: Promise<any>[] = []
    if (state.quoteId) {
      const quote = await prisma.moveOutQuote.findUnique({ where: { id: state.quoteId }, select: { tenantId: true } })
      if (quote?.tenantId) {
        docCreates.push(
          prisma.tenantDocument.create({
            data: { tenantId: quote.tenantId, name: 'Clearance to Vacate', fileType: 'CLEARANCE', fileSize: 0, storagePath: '', url: documentUrl },
          })
        )
      }
    }
    if (lease.property?.landlordId) {
      docCreates.push(
        prisma.landlordDocument.create({
          data: { landlordId: lease.property.landlordId, name: 'Clearance to Vacate', fileType: 'CLEARANCE', fileSize: 0, storagePath: '', url: documentUrl },
        })
      )
    }
    if (docCreates.length) await Promise.allSettled(docCreates)

    return NextResponse.json({ success: true, sentTo: Array.from(recipients), state: await syncClearance(id) })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error issuing clearance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
