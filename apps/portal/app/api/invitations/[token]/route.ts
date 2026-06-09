import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const invitation = await prisma.invitation.findUnique({
    where: { token },
  })

  if (!invitation) {
    return NextResponse.json({ error: 'Invalid invitation link' }, { status: 404 })
  }

  if (invitation.status === 'ACCEPTED') {
    return NextResponse.json({ error: 'This invitation has already been used' }, { status: 410 })
  }

  if (invitation.status === 'EXPIRED' || invitation.expiresAt < new Date()) {
    if (invitation.status !== 'EXPIRED') {
      await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'EXPIRED' } })
    }
    return NextResponse.json({ error: 'This invitation has expired' }, { status: 410 })
  }

  return NextResponse.json({
    email: invitation.email,
    name: invitation.name,
    role: invitation.role,
    leaseStartDate: invitation.leaseStartDate,
    leaseEndDate: invitation.leaseEndDate,
  })
}
