import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createPropertySchema } from '@/lib/validations/property'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const landlordId = searchParams.get('landlordId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (status && status !== 'all') where.status = status
    if (type && type !== 'all') where.type = type
    if (landlordId && landlordId !== 'all') where.landlordId = landlordId

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          landlord: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          propertyUnits: {
            select: {
              id: true,
              unitNumber: true,
              status: true,
              monthlyRent: true,
              bedrooms: true,
              bathrooms: true,
              floor: true,
            },
            orderBy: { unitNumber: 'asc' },
          },
          _count: {
            select: {
              tenants: true,
              leases: true,
              maintenanceRequests: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.property.count({ where }),
    ])

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching properties:', error)
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
    console.log('[POST /api/properties] body:', JSON.stringify(body))
    const validatedData = createPropertySchema.parse(body)

    // Check if landlord exists (if provided)
    if (validatedData.landlordId) {
      const landlord = await prisma.landlord.findUnique({
        where: { id: validatedData.landlordId },
      })
      if (!landlord) {
        return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
      }
    }

    const company = await prisma.company.findFirst({ where: { status: 'ACTIVE' } })
    if (!company) {
      return NextResponse.json({ error: 'No active company' }, { status: 500 })
    }

    const property = await prisma.property.create({
      data: { ...validatedData, companyId: company.id },
      include: {
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error: any) {
    console.error('Error creating property:', error)

    if (error.name === 'ZodError') {
      console.log('[POST /api/properties] ZodError:', JSON.stringify(error.errors))
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
