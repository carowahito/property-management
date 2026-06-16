import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createInspectionSchema } from '@/lib/validations/inspection'
import { generateRootReferenceCode } from '@/lib/services/inspection-reference'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const propertyId = searchParams.get('propertyId')
    const tenantId = searchParams.get('tenantId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (status && status !== 'all') where.status = status
    if (type && type !== 'all') where.type = type
    if (propertyId && propertyId !== 'all') where.propertyId = propertyId
    if (tenantId && tenantId !== 'all') where.tenantId = tenantId

    if (dateFrom || dateTo) {
      where.scheduledDate = {}
      if (dateFrom) where.scheduledDate.gte = new Date(dateFrom)
      if (dateTo) where.scheduledDate.lte = new Date(dateTo)
    }

    const [inspections, total] = await Promise.all([
      prisma.inspection.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          unit: {
            select: {
              id: true,
              unitNumber: true,
              bedrooms: true,
              bathrooms: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          lease: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          },
        },
        orderBy: { scheduledDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inspection.count({ where }),
    ])

    return NextResponse.json({
      inspections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching inspections:', error)
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
    const validatedData = createInspectionSchema.parse(body)

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const referenceCode = await generateRootReferenceCode()

    const inspection = await prisma.inspection.create({
      data: {
        propertyId: validatedData.propertyId,
        unitId: validatedData.unitId || undefined,
        tenantId: validatedData.tenantId || undefined,
        leaseId: validatedData.leaseId || undefined,
        type: validatedData.type,
        propertyCategory: validatedData.propertyCategory || undefined,
        scheduledDate: new Date(validatedData.scheduledDate),
        inspector: validatedData.inspector || undefined,
        status: validatedData.status,
        referenceCode,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(inspection, { status: 201 })
  } catch (error: any) {
    console.error('Error creating inspection:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
