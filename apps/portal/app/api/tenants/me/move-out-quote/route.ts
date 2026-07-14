import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

// GET — the tenant's Statement of Repair Costs awaiting their approval, if any.
// Drives the "action required" banner on the tenant dashboard.
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenant = await prisma.tenant.findFirst({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!tenant) return NextResponse.json({ quote: null })

  const quote = await prisma.moveOutQuote.findFirst({
    where: {
      tenantId: tenant.id,
      status: 'DRAFT',
      sentToTenantAt: { not: null },
      tenantApprovedAt: null,
    },
    orderBy: { sentToTenantAt: 'desc' },
    select: {
      id: true,
      totalTenantCharge: true,
      balanceDue: true,
      validUntil: true,
      inspection: { select: { property: { select: { name: true } } } },
    },
  })

  return NextResponse.json({ quote })
}
