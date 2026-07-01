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
              type: true,
              members: { select: { id: true, name: true }, orderBy: { createdAt: 'asc' as const } },
            },
          },
          propertyUnits: {
            select: {
              landlord: {
                select: { id: true, name: true, type: true, members: { select: { id: true, name: true }, orderBy: { createdAt: 'asc' as const } } },
              },
            },
            orderBy: { unitNumber: 'asc' },
          },
          _count: {
            select: {
              tenants: true,
              leases: true,
              maintenanceRequests: true,
              propertyUnits: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.property.count({ where }),
    ])

    // Enrich with unique landlords from units
    const enriched = properties.map((p: any) => {
      const unitLandlords = p.propertyUnits
        ?.map((u: any) => u.landlord)
        .filter((l: any) => l)
        .filter((l: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === l.id) === i) || []
      return { ...p, propertyUnits: undefined, unitLandlords }
    })

    return NextResponse.json({
      properties: enriched,
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
    const { units: incomingUnits, ...propertyBody } = body
    const validatedData = createPropertySchema.parse(propertyBody)

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

    // Create individual units configured on the Add Property form
    const unitWarnings: string[] = []
    let unitsCreated = 0
    if (Array.isArray(incomingUnits) && incomingUnits.length > 0) {
      const statusMap: Record<string, string> = {
        vacant: 'VACANT',
        occupied: 'OCCUPIED',
        maintenance: 'MAINTENANCE',
        reserved: 'RESERVED',
      }
      for (const u of incomingUnits) {
        const unitNumber = (u.unitNumber ?? '').toString().trim()
        if (!unitNumber) {
          unitWarnings.push('Skipped a unit with no unit number')
          continue
        }
        try {
          await prisma.unit.create({
            data: {
              unitNumber,
              propertyId: property.id,
              landlordId: u.landlordId || validatedData.landlordId || null,
              floor: u.floor ? parseInt(u.floor) : null,
              bedrooms: u.bedrooms ? parseInt(u.bedrooms) : null,
              bathrooms: u.bathrooms ? parseFloat(u.bathrooms) : null,
              sizeSqm: u.squareFootage ? parseFloat(u.squareFootage) : null,
              monthlyRent: u.monthlyRent ? parseFloat(u.monthlyRent) : null,
              status: (statusMap[(u.status ?? '').toLowerCase()] ?? 'VACANT') as any,
              description: u.description?.trim() || null,
            },
          })
          unitsCreated++
        } catch (e: any) {
          if (e.code === 'P2002') {
            unitWarnings.push(`Unit number "${unitNumber}" already exists and was skipped`)
          } else {
            unitWarnings.push(`Failed to create unit "${unitNumber}": ${String(e.message || e)}`)
          }
        }
      }
    }

    return NextResponse.json({ ...property, unitsCreated, unitWarnings }, { status: 201 })
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
