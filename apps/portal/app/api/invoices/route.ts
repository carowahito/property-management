import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

// GET /api/invoices?leaseId=&tenantId=&period=&status=
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sp = request.nextUrl.searchParams
    const where: any = {}
    if (sp.get('leaseId')) where.leaseId = sp.get('leaseId')
    if (sp.get('period')) where.period = sp.get('period')
    if (sp.get('status')) where.status = sp.get('status')

    // Tenants only ever see their own invoices.
    if (session.user.role === 'TENANT') {
      where.tenantId = session.user.id
    } else if (sp.get('tenantId')) {
      where.tenantId = sp.get('tenantId')
    }

    const invoices = await prisma.rentInvoice.findMany({
      where,
      orderBy: [{ period: 'desc' }, { createdAt: 'desc' }],
      take: 200,
      include: {
        tenant: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
        allocations: { select: { amount: true, target: true } },
      },
    })

    const withBalance = invoices.map((inv) => {
      const allocatedRent = inv.allocations
        .filter((a) => a.target === 'RENT')
        .reduce((s, a) => s + Number(a.amount), 0)
      return { ...inv, balance: Number(inv.rentAmount) - allocatedRent }
    })

    return NextResponse.json({ invoices: withBalance })
  } catch (error) {
    console.error('Error listing invoices:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
