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
    const body = await request.json()
    const { role, signature } = body // role: 'tenant' | 'landlord'

    if (!role || !['tenant', 'landlord'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be tenant or landlord.' }, { status: 400 })
    }

    const lease = await prisma.lease.findUnique({ where: { id } })
    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    if (!lease.documentHtml) {
      return NextResponse.json({ error: 'Lease document has not been generated yet' }, { status: 400 })
    }

    const updateData: any = {}
    if (role === 'tenant') {
      updateData.tenantSignedAt = new Date()
      updateData.tenantSignature = signature || 'DIGITALLY_SIGNED'
    } else {
      updateData.landlordSignedAt = new Date()
      updateData.landlordSignature = signature || 'DIGITALLY_SIGNED'
    }

    const updated = await prisma.lease.update({
      where: { id },
      data: updateData,
      include: {
        tenant: { select: { name: true, email: true } },
        property: { select: { name: true, address: true } },
      },
    })

    return NextResponse.json({
      message: `Lease signed by ${role} successfully`,
      lease: updated,
    })
  } catch (error) {
    console.error('Error signing lease:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
