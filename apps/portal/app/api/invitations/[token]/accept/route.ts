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
