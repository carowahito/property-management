import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

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

    const lease = await prisma.lease.findUnique({ where: { id } })
    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    if (!lease.documentHtml) {
      return NextResponse.json({ error: 'Generate the lease document first' }, { status: 400 })
    }

    const updated = await prisma.lease.update({
      where: { id },
      data: {
        sentForSigning: true,
        sentAt: new Date(),
        status: 'PENDING',
      },
      include: {
        tenant: { select: { name: true, email: true, phone: true } },
        property: { select: { name: true, address: true } },
      },
    })

    return NextResponse.json({
      message: `Lease sent to ${updated.tenant.name} for signing`,
      lease: updated,
    })
  } catch (error) {
    console.error('Error sending lease for signing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
