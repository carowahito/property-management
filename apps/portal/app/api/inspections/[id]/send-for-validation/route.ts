import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/services/email'

const INSPECTION_TYPE_LABELS: Record<string, string> = {
  MOVE_IN: 'Move-In',
  POST_MOVE_IN: 'Post-Move-In Confirmation',
  THREE_MONTH: '3-Month (New Tenancy)',
  ROUTINE_6_MONTH: '6-Month Routine',
  PRE_MOVE_OUT: 'Pre-Move-Out',
  MOVE_OUT: 'Move-Out',
  ANNUAL: 'Annual Condition Report',
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        property: { select: { id: true, name: true, address: true, landlordId: true } },
        unit: { select: { unitNumber: true } },
        tenant: { select: { id: true, name: true, email: true, password: true } },
      },
    })

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    if (inspection.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Inspection must be completed before it can be sent for validation' }, { status: 400 })
    }

    let recipientName: string
    let recipientEmail: string
    let signPath: string

    if (inspection.tenant) {
      if (!inspection.tenant.email || !inspection.tenant.password) {
        return NextResponse.json({ error: 'Tenant does not have an active portal login to receive this' }, { status: 400 })
      }
      recipientName = inspection.tenant.name
      recipientEmail = inspection.tenant.email
      signPath = `/tenant/inspections/${id}/sign`
    } else if (inspection.property?.landlordId) {
      const landlord = await prisma.landlord.findUnique({
        where: { id: inspection.property.landlordId },
        select: { name: true, email: true, password: true },
      })
      if (!landlord || !landlord.email || !landlord.password) {
        return NextResponse.json({ error: 'Landlord does not have an active portal login to receive this' }, { status: 400 })
      }
      recipientName = landlord.name
      recipientEmail = landlord.email
      signPath = `/landlord/inspections/${id}/sign`
    } else {
      return NextResponse.json({ error: 'No tenant or landlord found for this inspection to send to' }, { status: 400 })
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'
    const signUrl = `${baseUrl}${signPath}`
    const typeLabel = INSPECTION_TYPE_LABELS[inspection.type] || inspection.type
    const unitStr = inspection.unit ? ` — Unit ${inspection.unit.unitNumber}` : ''

    const sent = await sendEmail({
      to: recipientEmail,
      subject: `Please Review & Sign — Inspection Report — ${inspection.property?.name || 'Property'}${unitStr}`,
      html: `<p>Hi ${recipientName},</p>
<p>An inspection report is ready for your review and signature.</p>
<p><strong>Property:</strong> ${inspection.property?.name || ''}${unitStr}<br/>
<strong>Type:</strong> ${typeLabel}</p>
<p><a href="${signUrl}">Review & Sign the Report</a></p>
<p>You'll need to log in to your Tochi Property portal account to sign.</p>`,
    })

    if (!sent) {
      return NextResponse.json({ error: 'Email could not be sent (check email service configuration)' }, { status: 502 })
    }

    return NextResponse.json({ success: true, sentTo: recipientEmail })
  } catch (error) {
    console.error('Error sending inspection for validation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
