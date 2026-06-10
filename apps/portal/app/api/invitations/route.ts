import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminUser = await prisma.user.findFirst({
    where: { email: session.user.email!, active: true },
  })
  if (!adminUser) return NextResponse.json({ error: 'Admin user not found' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const role   = searchParams.get('role')?.toUpperCase()
  const status = searchParams.get('status')?.toUpperCase()

  const where: any = { companyId: adminUser.companyId }
  if (role   && ['TENANT', 'LANDLORD', 'VENDOR'].includes(role))             where.role   = role
  if (status && ['PENDING', 'ACCEPTED', 'EXPIRED'].includes(status)) where.status = status

  // Auto-expire invitations whose expiresAt has passed
  await prisma.invitation.updateMany({
    where: { companyId: adminUser.companyId, status: 'PENDING', expiresAt: { lt: new Date() } },
    data: { status: 'EXPIRED' },
  })

  const [invitations, pendingTenantCount] = await Promise.all([
    prisma.invitation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: { select: { id: true, name: true, unit: true } },
      },
    }),
    prisma.invitation.count({
      where: { companyId: adminUser.companyId, role: 'TENANT', status: 'PENDING' },
    }),
  ])

  return NextResponse.json({ invitations, pendingTenantCount })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, name, role, tenantId, landlordId, vendorId, leaseStartDate, leaseEndDate } = await req.json()

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

  // Validate that referenced records belong to the admin's company
  if (role === 'TENANT' && tenantId) {
    const t = await prisma.tenant.findFirst({ where: { id: tenantId, companyId: adminUser.companyId } })
    if (!t) return NextResponse.json({ error: 'Tenant not found in your company' }, { status: 403 })
    if (t.email !== email) return NextResponse.json({ error: 'Email does not match tenant record' }, { status: 400 })
  }
  if (role === 'LANDLORD' && landlordId) {
    const l = await prisma.landlord.findFirst({ where: { id: landlordId, companyId: adminUser.companyId } })
    if (!l) return NextResponse.json({ error: 'Landlord not found in your company' }, { status: 403 })
    if (l.email !== email) return NextResponse.json({ error: 'Email does not match landlord record' }, { status: 400 })
  }
  if (role === 'VENDOR' && vendorId) {
    const v = await prisma.vendor.findFirst({ where: { id: vendorId, companyId: adminUser.companyId } })
    if (!v) return NextResponse.json({ error: 'Vendor not found in your company' }, { status: 403 })
    if (v.email !== email) return NextResponse.json({ error: 'Email does not match vendor record' }, { status: 400 })
  }

  // Upsert: reuse existing pending invitation or create new one
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const existing = await prisma.invitation.findFirst({
    where: { email, companyId: adminUser.companyId, status: 'PENDING' },
  })

  const leaseDates = {
    leaseStartDate: leaseStartDate ? new Date(leaseStartDate) : null,
    leaseEndDate: leaseEndDate ? new Date(leaseEndDate) : null,
  }

  const invitation = existing
    ? await prisma.invitation.update({
        where: { id: existing.id },
        data: { token, expiresAt, name, role, ...leaseDates },
      })
    : await prisma.invitation.create({
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
          ...leaseDates,
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

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const adminUser = await prisma.user.findFirst({
    where: { email: session.user.email!, active: true },
  })
  if (!adminUser) return NextResponse.json({ error: 'Admin user not found' }, { status: 403 })

  const inv = await prisma.invitation.findFirst({ where: { id, companyId: adminUser.companyId } })
  if (!inv) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })

  await prisma.invitation.update({ where: { id }, data: { status: 'EXPIRED' } })
  return NextResponse.json({ success: true })
}
