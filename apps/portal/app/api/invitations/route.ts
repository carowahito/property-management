import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, name, role, tenantId, landlordId, vendorId } = await req.json()

  if (!email || !name || !role) {
    return NextResponse.json({ error: 'Email, name, and role are required' }, { status: 400 })
  }

  if (!['TENANT', 'LANDLORD', 'VENDOR'].includes(role)) {
    return NextResponse.json({ error: 'Role must be TENANT, LANDLORD, or VENDOR' }, { status: 400 })
  }

  // Get company from the admin's user record
  const adminUser = await prisma.user.findFirst({
    where: { email: session.user.email!, active: true },
  })

  if (!adminUser) {
    return NextResponse.json({ error: 'Admin user not found' }, { status: 403 })
  }

  // Check for existing pending invitation
  const existing = await prisma.invitation.findFirst({
    where: { email, companyId: adminUser.companyId, status: 'PENDING' },
  })

  if (existing) {
    return NextResponse.json({ error: 'A pending invitation already exists for this email' }, { status: 409 })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const invitation = await prisma.invitation.create({
    data: {
      companyId: adminUser.companyId,
      email,
      name,
      role,
      token,
      expiresAt,
      tenantId: role === 'TENANT' ? tenantId : null,
      landlordId: role === 'LANDLORD' ? landlordId : null,
      vendorId: role === 'VENDOR' ? vendorId : null,
    },
  })

  const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/invite?token=${token}`

  // TODO: Send email with inviteUrl via SendGrid/Resend
  // For now, return the URL so the admin can share it manually
  return NextResponse.json({
    message: 'Invitation created',
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    },
    inviteUrl,
  })
}
