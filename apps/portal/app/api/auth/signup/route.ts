import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase'

const VALID_ACCOUNT_TYPES = ['admin', 'tenant', 'landlord'] as const
type AccountType = typeof VALID_ACCOUNT_TYPES[number]

export async function POST(req: NextRequest) {
  const { name, email, password, phone, accountType = 'admin' } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  if (!VALID_ACCOUNT_TYPES.includes(accountType)) {
    return NextResponse.json({ error: 'Invalid account type' }, { status: 400 })
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

  // Find or create a default company
  let company = await prisma.company.findFirst({ where: { status: 'ACTIVE' } })
  if (!company) {
    company = await prisma.company.create({
      data: { name: 'Default Company', slug: 'default', status: 'ACTIVE' },
    })
  }

  try {
    await createAppRecord(accountType as AccountType, { name, email, phone, companyId: company.id })
  } catch (e: any) {
    // Roll back Supabase Auth user on failure
    if (authData.user) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    }
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }

  const role = accountType === 'tenant' ? 'TENANT' : accountType === 'landlord' ? 'LANDLORD' : 'ADMIN'
  return NextResponse.json({ message: 'Account created successfully', role })
}

async function createAppRecord(
  type: AccountType,
  data: { name: string; email: string; phone?: string; companyId: string }
) {
  switch (type) {
    case 'tenant':
      // Tenants need a property — find first available or leave unassigned
      const property = await prisma.property.findFirst({ where: { companyId: data.companyId, status: 'ACTIVE' } })
      return prisma.tenant.create({
        data: {
          companyId: data.companyId,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          propertyId: property?.id || '',
          status: 'PENDING',
        },
      })

    case 'landlord':
      return prisma.landlord.create({
        data: {
          companyId: data.companyId,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          status: 'ACTIVE',
        },
      })

    case 'admin':
    default:
      return prisma.user.create({
        data: {
          companyId: data.companyId,
          email: data.email,
          name: data.name,
          password: 'MANAGED_BY_SUPABASE',
          role: 'ADMIN',
          active: true,
        },
      })
  }
}
