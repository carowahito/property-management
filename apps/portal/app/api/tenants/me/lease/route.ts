import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find the tenant record for the logged-in user
  const tenant = await prisma.tenant.findFirst({
    where: { email: session.user.email!, status: 'ACTIVE' },
  })

  if (!tenant) {
    return NextResponse.json(null)
  }

  // Find active lease that's been sent for signing but not yet signed by tenant
  const lease = await prisma.lease.findFirst({
    where: {
      tenantId: tenant.id,
      status: 'ACTIVE',
      sentForSigning: true,
      tenantSignedAt: null,
    },
    include: {
      property: {
        select: { id: true, name: true, address: true, type: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!lease) {
    // Fall back to any active lease sent for signing
    const anyLease = await prisma.lease.findFirst({
      where: { tenantId: tenant.id, sentForSigning: true, tenantSignedAt: null },
      include: {
        property: {
          select: { id: true, name: true, address: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(anyLease)
  }

  return NextResponse.json(lease)
}
