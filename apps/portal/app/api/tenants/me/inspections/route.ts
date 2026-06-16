import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenant = await prisma.tenant.findFirst({
    where: { email: session.user.email!, status: 'ACTIVE' },
  })

  if (!tenant) {
    return NextResponse.json({ inspections: [] })
  }

  const inspections = await prisma.inspection.findMany({
    where: { tenantId: tenant.id, status: 'COMPLETED' },
    select: {
      id: true,
      type: true,
      completedDate: true,
      overallCondition: true,
      inspectorSignature: true,
      inspectorSignedAt: true,
      tenantSignature: true,
      tenantSignedAt: true,
      property: { select: { id: true, name: true, address: true } },
      unit: { select: { id: true, unitNumber: true } },
    },
    orderBy: { completedDate: 'desc' },
  })

  return NextResponse.json({ inspections })
}
