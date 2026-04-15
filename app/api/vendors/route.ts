import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createVendorSchema } from '@/lib/validations/vendor'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const specialization = searchParams.get('specialization')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (status && status !== 'all') where.status = status
    if (specialization && specialization !== 'all')
      where.specialization = { contains: specialization, mode: 'insensitive' }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          _count: {
            select: {
              workOrders: true,
              messages: true,
            },
          },
        },
        orderBy: { rating: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vendor.count({ where }),
    ])

    return NextResponse.json({
      vendors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createVendorSchema.parse(body)

    const company = await prisma.company.findFirst({ where: { status: 'ACTIVE' } })
    if (!company) {
      return NextResponse.json({ error: 'No active company' }, { status: 500 })
    }

    // Check if email is already in use within this company
    const existingVendor = await prisma.vendor.findFirst({
      where: { companyId: company.id, email: validatedData.email },
    })

    if (existingVendor) {
      return NextResponse.json(
        { error: 'Email already registered to another vendor' },
        { status: 400 }
      )
    }

    const vendor = await prisma.vendor.create({
      data: { ...validatedData, companyId: company.id },
    })

    return NextResponse.json(vendor, { status: 201 })
  } catch (error: any) {
    console.error('Error creating vendor:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
