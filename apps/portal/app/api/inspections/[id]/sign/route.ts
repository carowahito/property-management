import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

type SignerRole = 'TENANT' | 'LANDLORD'

async function getOwnedInspection(email: string, role: string | undefined, id: string) {
  if (role === 'LANDLORD') {
    const landlord = await prisma.landlord.findFirst({ where: { email } })
    if (!landlord) return { role: null, inspection: null }

    const inspection = await prisma.inspection.findFirst({
      where: { id, tenantId: null, property: { landlordId: landlord.id } },
      include: {
        property: { select: { id: true, name: true, address: true } },
        unit: { select: { id: true, unitNumber: true } },
      },
    })
    return { role: 'LANDLORD' as SignerRole, inspection }
  }

  const tenant = await prisma.tenant.findFirst({
    where: { email, status: 'ACTIVE' },
  })
  if (!tenant) return { role: null, inspection: null }

  const inspection = await prisma.inspection.findFirst({
    where: { id, tenantId: tenant.id },
    include: {
      property: { select: { id: true, name: true, address: true } },
      unit: { select: { id: true, unitNumber: true } },
    },
  })
  return { role: 'TENANT' as SignerRole, inspection }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { inspection } = await getOwnedInspection(session.user.email!, session.user.role, id)

  if (!inspection) {
    return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
  }

  return NextResponse.json(inspection)
}

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
    const { signature } = body

    if (!signature || typeof signature !== 'string') {
      return NextResponse.json({ error: 'Signature is required' }, { status: 400 })
    }

    const { role, inspection } = await getOwnedInspection(session.user.email!, session.user.role, id)

    if (!inspection || !role) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    if (inspection.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Inspection is not yet completed and ready for signing' }, { status: 400 })
    }

    const existingSignature = role === 'LANDLORD' ? inspection.landlordSignature : inspection.tenantSignature
    if (existingSignature) {
      return NextResponse.json({ error: 'Inspection has already been signed' }, { status: 400 })
    }

    const updated = await prisma.inspection.update({
      where: { id },
      data: role === 'LANDLORD'
        ? { landlordSignature: signature, landlordSignedAt: new Date() }
        : { tenantSignature: signature, tenantSignedAt: new Date() },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error signing inspection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
