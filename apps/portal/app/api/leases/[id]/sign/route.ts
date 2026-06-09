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

    const updateData: Record<string, unknown> = {}
    if (role === 'tenant') {
      updateData.tenantSignedAt = new Date()
      // Only set signature if provided or no existing URL signature
      const existing = lease.tenantSignature
      if (signature) {
        updateData.tenantSignature = signature
      } else if (!existing || !existing.startsWith('http')) {
        updateData.tenantSignature = 'DIGITALLY_SIGNED'
      }
    } else {
      updateData.landlordSignedAt = new Date()
      const existing = lease.landlordSignature
      if (signature) {
        updateData.landlordSignature = signature
      } else if (!existing || !existing.startsWith('http')) {
        updateData.landlordSignature = 'DIGITALLY_SIGNED'
      }
    }

    // Just record the signature — no status change.
    // PENDING leases auto-promote to ACTIVE only when the previous
    // lease lapses (handled by the auto-expire + promote logic in
    // the leases list/detail GET routes).
    const updated = await prisma.lease.update({
      where: { id },
      data: updateData,
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, name: true, address: true } },
      },
    })

    const tenantSigned = role === 'tenant' || !!lease.tenantSignedAt
    const landlordSigned = role === 'landlord' || !!lease.landlordSignedAt

    return NextResponse.json({
      message: `Lease signed by ${role} successfully`,
      bothSigned: tenantSigned && landlordSigned,
      lease: updated,
    })
  } catch (error) {
    console.error('Error signing lease:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
