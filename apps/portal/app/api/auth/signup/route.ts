import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Find or create a default company for new signups
  let company = await prisma.company.findFirst({ where: { status: 'ACTIVE' } })
  if (!company) {
    company = await prisma.company.create({
      data: { name: 'Default Company', slug: 'default', status: 'ACTIVE' },
    })
  }

  // Create matching record in Prisma users table
  try {
    await prisma.user.create({
      data: {
        companyId: company.id,
        email,
        name,
        password: 'MANAGED_BY_SUPABASE',
        role: 'ADMIN',
        active: true,
      },
    })
  } catch (e: any) {
    // If Prisma user creation fails, clean up the Supabase Auth user
    if (authData.user) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    }
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Account created successfully' })
}
