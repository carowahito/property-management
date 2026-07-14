import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/services/email'

const money = (n: number) => `KSh ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// POST — email the tenant a link to review and approve the Statement of Repair
// Costs in the portal, and stamp sentToTenantAt.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role === 'TENANT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const quote = await prisma.moveOutQuote.findUnique({
    where: { id },
    include: {
      tenant: { select: { name: true, email: true } },
      inspection: { select: { property: { select: { name: true, address: true } } } },
    },
  })
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  if (!quote.tenant?.email) {
    return NextResponse.json({ error: 'Tenant has no email address on file' }, { status: 400 })
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'
  const reviewUrl = `${baseUrl}/tenant/move-out/${quote.id}`
  const propertyName = quote.inspection?.property?.name || 'your property'
  const validUntil = new Date(quote.validUntil).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  const balanceLine = Number(quote.balanceDue) > 0
    ? `<p>Repair costs exceed the deposit held by <strong>${money(Number(quote.balanceDue))}</strong>, which is payable before a Clearance to Vacate can be issued.</p>`
    : `<p>Based on current figures, a refund of <strong>${money(Number(quote.refundDue))}</strong> is due to you after deductions.</p>`

  const sent = await sendEmail({
    to: quote.tenant.email,
    subject: `Statement of Repair Costs - ${propertyName}`,
    html: `<p>Dear ${quote.tenant.name || 'Tenant'},</p>
<p>Following your move-out inspection at ${propertyName}, please review and approve the Statement of Repair Costs.</p>
<p><strong>Total chargeable to tenant:</strong> ${money(Number(quote.totalTenantCharge))}<br/>
<strong>Deposit held:</strong> ${money(Number(quote.depositHeld))}</p>
${balanceLine}
<p><a href="${reviewUrl}">Review and approve the statement</a></p>
<p>Please note: this quote is valid until ${validUntil} (3 days). Amounts are estimates and may change once repairs are carried out.</p>
<p>You will need to be logged into the Tochi Property portal to view it.</p>`,
  })

  if (!sent) {
    return NextResponse.json({ error: 'Email could not be sent (check email service configuration)' }, { status: 502 })
  }

  await prisma.moveOutQuote.update({
    where: { id },
    data: { sentToTenantAt: new Date() },
  })

  return NextResponse.json({ success: true, sentTo: quote.tenant.email })
}
