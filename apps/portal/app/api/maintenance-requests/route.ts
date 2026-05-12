import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createMaintenanceRequestSchema } from '@/lib/validations/maintenance'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const tenantId = searchParams.get('tenantId')
    const propertyId = searchParams.get('propertyId')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (status && status !== 'all') where.status = status
    if (priority && priority !== 'all') where.priority = priority
    if (tenantId && tenantId !== 'all') where.tenantId = tenantId
    if (propertyId && propertyId !== 'all') where.propertyId = propertyId
    if (category && category !== 'all')
      where.category = { contains: category, mode: 'insensitive' }

    const [maintenanceRequests, total] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where,
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          property: {
            select: {
              id: true,
              name: true,
              address: true,
              landlord: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              workOrders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.maintenanceRequest.count({ where }),
    ])

    return NextResponse.json({
      maintenanceRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching maintenance requests:', error)
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
    const validatedData = createMaintenanceRequestSchema.parse(body)

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: validatedData.tenantId },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const maintenanceData: any = { ...validatedData }

    if (validatedData.resolvedAt) {
      maintenanceData.resolvedAt = new Date(validatedData.resolvedAt)
    }

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: maintenanceData,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    })

    return NextResponse.json(maintenanceRequest, { status: 201 })
  } catch (error: any) {
    console.error('Error creating maintenance request:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
