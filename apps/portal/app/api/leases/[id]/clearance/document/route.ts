import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { evaluateClearance } from '@/lib/services/clearance'
import { buildClearanceHtml } from '@/lib/services/clearance-document'

// GET — render the Clearance to Vacate document (branded HTML).
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const lease = await prisma.lease.findUnique({
    where: { id },
    select: {
      unit: true,
      tenantId: true,
      tenant: { select: { name: true } },
      property: { select: { name: true } },
    },
  })
  if (!lease) return NextResponse.json({ error: 'Lease not found' }, { status: 404 })

  // Tenants may only view their own clearance.
  if (session.user.role === 'TENANT' && lease.tenantId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const state = await evaluateClearance(id)
  const record = await prisma.clearanceToVacate.findUnique({ where: { leaseId: id }, select: { issuedAt: true } })
  const issuedDate = (record?.issuedAt ?? new Date()).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  const html = buildClearanceHtml(
    {
      tenantName: lease.tenant?.name || 'Tenant',
      propertyName: lease.property?.name || 'Property',
      unitLabel: lease.unit ? ` - Unit ${lease.unit}` : '',
      issuedDate,
    },
    state
  )

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
