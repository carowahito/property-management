import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createLandlordSchema } from '@/lib/validations/landlord'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log('[GET /api/landlords] session:', session?.user?.email ?? 'null')

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (status && status !== 'all') where.status = status

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [landlords, total] = await Promise.all([
      prisma.landlord.findMany({
        where,
        include: {
          units: {
            select: { propertyId: true },
          },
          _count: {
            select: {
              properties: true,
              units: true,
              payouts: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.landlord.count({ where }),
    ])

    // Compute unique property count from units (not just properties.landlordId)
    const enriched = landlords.map((l: any) => {
      const uniquePropertyIds = new Set(l.units?.map((u: any) => u.propertyId) || [])
      // Also include directly owned properties
      const totalProperties = Math.max(l._count.properties, uniquePropertyIds.size)
      return {
        ...l,
        units: undefined, // remove raw units from response
        _count: { ...l._count, properties: totalProperties },
      }
    })

    console.log('[GET /api/landlords] found:', enriched.length)
    return NextResponse.json({
      landlords: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('[GET /api/landlords] error:', error?.message, error?.code)
    return NextResponse.json({ error: 'Internal server error', detail: error?.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createLandlordSchema.parse(body)

    // Resolve company — TODO: derive from session.user.companyId
    const company = await prisma.company.findFirst({ where: { status: 'ACTIVE' } })
    if (!company) {
      return NextResponse.json({ error: 'No active company' }, { status: 500 })
    }

    // Check if email is already in use within this company
    const existingLandlord = await prisma.landlord.findFirst({
      where: { companyId: company.id, email: validatedData.email },
    })

    if (existingLandlord) {
      return NextResponse.json(
        { error: 'Email already registered to another landlord' },
        { status: 400 }
      )
    }

    const landlord = await prisma.landlord.create({
      data: { ...validatedData, companyId: company.id },
    })

    return NextResponse.json(landlord, { status: 201 })
  } catch (error: any) {
    console.error('Error creating landlord:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email or ID number already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
