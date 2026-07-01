import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/services/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: { property: { select: { name: true, address: true } } },
    })
    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'
    const resumeUrl = `${baseUrl}/admin/inspections?id=${id}`

    const sent = await sendEmail({
      to: session.user.email,
      subject: `Resume Inspection — ${inspection.property?.name || 'Property'}`,
      html: `<p>Here is your link to continue this inspection where you left off:</p>
<p><a href="${resumeUrl}">${resumeUrl}</a></p>
<p><strong>Property:</strong> ${inspection.property?.name || ''}${inspection.property?.address ? ` — ${inspection.property.address}` : ''}</p>
<p>You'll need to be logged into the Tochi Property portal to access it.</p>`,
    })

    if (!sent) {
      return NextResponse.json({ error: 'Email could not be sent (check email service configuration)' }, { status: 502 })
    }

    return NextResponse.json({ success: true, sentTo: session.user.email })
  } catch (error) {
    console.error('Error sending resume link email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
