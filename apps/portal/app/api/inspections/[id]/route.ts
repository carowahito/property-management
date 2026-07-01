import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateInspectionSchema } from '@/lib/validations/inspection'
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

async function notifyReassignedAgent(inspectionId: string, agentName: string, currentUserEmail: string | null | undefined) {
  try {
    const agent = await prisma.user.findFirst({
      where: { name: agentName, active: true },
      select: { name: true, email: true },
    })
    if (!agent || !agent.email) return
    if (currentUserEmail && agent.email.toLowerCase() === currentUserEmail.toLowerCase()) return

    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
      include: {
        property: { select: { name: true, landlordId: true } },
        unit: { select: { unitNumber: true } },
        tenant: { select: { name: true } },
      },
    })
    if (!inspection) return

    let attendeeLine = ''
    if (inspection.tenant) {
      attendeeLine = `<p><strong>Expected to be present:</strong> ${inspection.tenant.name} (Tenant)</p>`
    } else if (inspection.property?.landlordId) {
      const landlord = await prisma.landlord.findUnique({
        where: { id: inspection.property.landlordId },
        select: { name: true },
      })
      if (landlord) {
        attendeeLine = `<p><strong>Expected to be present:</strong> ${landlord.name} (Landlord)</p>`
      }
    }

    const typeLabel = INSPECTION_TYPE_LABELS[inspection.type] || inspection.type
    const unitStr = inspection.unit ? ` — Unit ${inspection.unit.unitNumber}` : ''

    await sendEmail({
      to: agent.email,
      subject: `Inspection Assignment — ${inspection.property?.name || 'Property'}${unitStr}`,
      html: `<p>Hi ${agent.name},</p>
<p>You've been assigned to conduct an inspection.</p>
<p><strong>Property:</strong> ${inspection.property?.name || ''}${unitStr}<br/>
<strong>Type:</strong> ${typeLabel}<br/>
<strong>Date:</strong> ${new Date(inspection.scheduledDate).toLocaleDateString()}</p>
${attendeeLine}`,
    })
  } catch (error) {
    console.error('Error notifying reassigned agent:', error)
  }
}

async function notifyCancellation(inspection: {
  type: string
  scheduledDate: Date
  inspector: string | null
  referenceCode: string | null
  property: { name: string; landlordId: string | null } | null
  unit: { unitNumber: string } | null
  tenant: { name: string; email: string | null } | null
}) {
  try {
    const typeLabel = INSPECTION_TYPE_LABELS[inspection.type] || inspection.type
    const unitStr = inspection.unit ? ` — Unit ${inspection.unit.unitNumber}` : ''
    const refStr = inspection.referenceCode ? ` (${inspection.referenceCode})` : ''
    const subject = `Inspection Cancelled — ${inspection.property?.name || 'Property'}${unitStr}`
    const detailsHtml = `<p><strong>Property:</strong> ${inspection.property?.name || ''}${unitStr}<br/>
<strong>Type:</strong> ${typeLabel}<br/>
<strong>Date:</strong> ${new Date(inspection.scheduledDate).toLocaleDateString()}</p>`

    const recipients: { name: string; email: string }[] = []

    if (inspection.inspector) {
      const agent = await prisma.user.findFirst({
        where: { name: inspection.inspector, active: true },
        select: { name: true, email: true },
      })
      if (agent?.email) recipients.push({ name: agent.name || agent.email, email: agent.email })
    }

    if (inspection.tenant?.email) {
      recipients.push({ name: inspection.tenant.name, email: inspection.tenant.email })
    } else if (inspection.property?.landlordId) {
      const landlord = await prisma.landlord.findUnique({
        where: { id: inspection.property.landlordId },
        select: { name: true, email: true },
      })
      if (landlord?.email) recipients.push({ name: landlord.name, email: landlord.email })
    }

    for (const recipient of recipients) {
      await sendEmail({
        to: recipient.email,
        subject,
        html: `<p>Hi ${recipient.name},</p>
<p>The following inspection${refStr} has been cancelled and removed from the schedule.</p>
${detailsHtml}`,
      })
    }
  } catch (error) {
    console.error('Error sending cancellation notifications:', error)
  }
}

export async function GET(
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
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            type: true,
            landlord: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            floor: true,
            bedrooms: true,
            bathrooms: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        lease: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            monthlyRent: true,
          },
        },
      },
    })

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    return NextResponse.json(inspection)
  } catch (error) {
    console.error('Error fetching inspection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateInspectionSchema.parse(body)

    const previous = await prisma.inspection.findUnique({ where: { id }, select: { inspector: true } })

    const updateData: any = { ...validatedData }

    // Convert date strings to Date objects
    if (validatedData.scheduledDate) {
      updateData.scheduledDate = new Date(validatedData.scheduledDate)
    }
    if (validatedData.completedDate) {
      updateData.completedDate = new Date(validatedData.completedDate)
    }
    if (validatedData.tenantSignedAt) {
      updateData.tenantSignedAt = new Date(validatedData.tenantSignedAt)
    }
    if (validatedData.inspectorSignedAt) {
      updateData.inspectorSignedAt = new Date(validatedData.inspectorSignedAt)
    }
    if (validatedData.landlordSignedAt) {
      updateData.landlordSignedAt = new Date(validatedData.landlordSignedAt)
    }

    const inspection = await prisma.inspection.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const newInspector = typeof validatedData.inspector === 'string' ? validatedData.inspector.trim() : ''
    const oldInspector = (previous?.inspector || '').trim()
    if (newInspector && newInspector !== oldInspector) {
      await notifyReassignedAgent(id, newInspector, session.user?.email)
    }

    return NextResponse.json(inspection)
  } catch (error: any) {
    console.error('Error updating inspection:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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
        property: { select: { name: true, landlordId: true } },
        unit: { select: { unitNumber: true } },
        tenant: { select: { name: true, email: true } },
      },
    })

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    await prisma.inspection.delete({
      where: { id },
    })

    await notifyCancellation(inspection)

    return NextResponse.json({ message: 'Inspection deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting inspection:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
