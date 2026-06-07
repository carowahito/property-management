import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const { password } = await req.json()

  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

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
    await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'EXPIRED' } })
    return NextResponse.json({ error: 'This invitation has expired' }, { status: 410 })
  }

  // Create Supabase Auth account
  const { error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      return NextResponse.json({ error: 'An account with this email already exists. Try signing in instead.' }, { status: 409 })
    }
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Ensure the app record exists so the user can log in
  try {
    await ensureAppRecord(invitation)
  } catch (e) {
    console.error('Failed to create app record (non-blocking):', e)
  }

  // Mark invitation as accepted
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: 'ACCEPTED', acceptedAt: new Date() },
  })

  return NextResponse.json({
    message: 'Account created successfully. You can now sign in.',
    role: invitation.role,
  })
}

async function ensureAppRecord(invitation: {
  role: string
  email: string
  name: string
  companyId: string
  tenantId: string | null
  landlordId: string | null
  vendorId: string | null
}) {
  const { role, email, name, companyId } = invitation

  if (role === 'TENANT') {
    if (invitation.tenantId) return // already linked to existing record
    const existing = await prisma.tenant.findFirst({ where: { companyId, email } })
    if (existing) return
    // Find or create a default property for the tenant
    let property = await prisma.property.findFirst({ where: { companyId, status: 'ACTIVE' } })
    if (!property) {
      const landlord = await prisma.landlord.findFirst({ where: { companyId } })
      if (!landlord) return // can't create tenant without a property and landlord
      property = await prisma.property.create({
        data: { companyId, name: 'Unassigned', address: 'TBD', type: 'APARTMENT', totalUnits: 0, landlordId: landlord.id, status: 'ACTIVE' },
      })
    }
    await prisma.tenant.create({
      data: {
        companyId,
        name,
        email,
        phone: '',
        propertyId: property.id,
        status: 'ACTIVE',
      },
    })
  } else if (role === 'LANDLORD') {
    if (invitation.landlordId) return
    const existing = await prisma.landlord.findFirst({ where: { companyId, email } })
    if (existing) return
    await prisma.landlord.create({
      data: { companyId, name, email, phone: '', status: 'ACTIVE' },
    })
  } else if (role === 'VENDOR') {
    if (invitation.vendorId) return
    const existing = await prisma.vendor.findFirst({ where: { companyId, email } })
    if (existing) return
    await prisma.vendor.create({
      data: { companyId, name, email, phone: '', specialization: 'general', status: 'ACTIVE' },
    })
  }
}
