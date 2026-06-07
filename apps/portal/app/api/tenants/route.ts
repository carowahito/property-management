import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createTenantSchema } from '@/lib/validations/tenant'
import { z } from 'zod'

const leaseSchema = z.object({
  leaseStartDate: z.string().optional(),
  leaseEndDate: z.string().optional(),
  monthlyRent: z.number().min(0).optional(),
  securityDeposit: z.number().min(0).optional(),
}).optional()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const propertyId = searchParams.get('propertyId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (status && status !== 'all') where.status = status
    if (propertyId && propertyId !== 'all') where.propertyId = propertyId

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        include: {
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
              leases: true,
              payments: true,
              maintenanceRequests: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tenant.count({ where }),
    ])

    return NextResponse.json({
      tenants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching tenants:', error)
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
    const { leaseStartDate, leaseEndDate, monthlyRent, securityDeposit, ...tenantBody } = body
    const validatedData = createTenantSchema.parse(tenantBody)

    // Check if property exists (if provided)
    if (validatedData.propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: validatedData.propertyId },
      })
      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }
    }

    // Resolve company
    const company = await prisma.company.findFirst({ where: { status: 'ACTIVE' } })
    if (!company) {
      return NextResponse.json({ error: 'No active company' }, { status: 500 })
    }

    // Check if email is already in use within this company
    const existingTenant = await prisma.tenant.findFirst({
      where: { companyId: company.id, email: validatedData.email },
    })

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Email already registered to another tenant' },
        { status: 400 }
      )
    }

    const tenantData: any = { ...validatedData, companyId: company.id }

    // Convert date strings to Date objects
    if (validatedData.moveInDate) {
      tenantData.moveInDate = new Date(validatedData.moveInDate)
    }

    if (validatedData.moveOutDate) {
      tenantData.moveOutDate = new Date(validatedData.moveOutDate)
    }

    const tenant = await prisma.tenant.create({
      data: tenantData,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    })

    // Create a lease if lease fields were provided
    if (leaseStartDate && leaseEndDate && monthlyRent && validatedData.propertyId) {
      try {
        await prisma.lease.create({
          data: {
            tenantId: tenant.id,
            propertyId: validatedData.propertyId,
            unitId: tenant.unitId ?? undefined,
            unit: validatedData.unit ?? undefined,
            startDate: new Date(leaseStartDate),
            endDate: new Date(leaseEndDate),
            monthlyRent,
            securityDeposit: securityDeposit ?? 0,
            status: 'ACTIVE',
          },
        })
      } catch (leaseErr) {
        console.error('Lease creation failed (tenant still created):', leaseErr)
      }
    }

    return NextResponse.json(tenant, { status: 201 })
  } catch (error: any) {
    console.error('Error creating tenant:', error)

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
