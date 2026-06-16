import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createLeaseSchema } from '@/lib/validations/lease'
import { runLeaseLifecycle } from '@/lib/services/lease-lifecycle'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const tenantId = searchParams.get('tenantId')
    const propertyId = searchParams.get('propertyId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Auto-expire lapsed leases and promote signed PENDING leases
    await runLeaseLifecycle()

    const where: any = {}

    if (status && status !== 'all') where.status = status

    // Tenants are scoped to their own leases only
    if (session.user.role === 'TENANT') {
      where.tenantId = session.user.id
    } else {
      if (tenantId && tenantId !== 'all') where.tenantId = tenantId
      if (propertyId && propertyId !== 'all') where.propertyId = propertyId
    }

    const [leases, total] = await Promise.all([
      prisma.lease.findMany({
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
                  type: true,
                  members: { select: { id: true, name: true }, orderBy: { createdAt: 'asc' as const } },
                },
              },
            },
          },
          unitRef: {
            select: {
              id: true,
              unitNumber: true,
              landlord: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  members: { select: { id: true, name: true }, orderBy: { createdAt: 'asc' as const } },
                },
              },
            },
          },
          _count: {
            select: {
              payments: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lease.count({ where }),
    ])

    return NextResponse.json({
      leases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching leases:', error)
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
    const validatedData = createLeaseSchema.parse(body)

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

    // Block any lease that overlaps an existing ACTIVE or PENDING lease for the
    // same unit or same tenant.  Exception: a new PENDING lease may overlap an
    // existing ACTIVE lease for the same unit (renewal workflow).
    const newStart = new Date(validatedData.startDate)
    const newEnd   = new Date(validatedData.endDate)
    const periodOverlap = {
      startDate: { lte: newEnd },
      endDate:   { gte: newStart },
    }

    // Same-unit overlap check (blocks any status that would double-book the unit)
    if (validatedData.unitId) {
      const unitConflict = await prisma.lease.findFirst({
        where: {
          unitId: validatedData.unitId,
          status: { in: ['ACTIVE', 'PENDING'] },
          // Allow a new PENDING to coexist with the current ACTIVE (renewal)
          NOT: validatedData.status === 'PENDING' ? { status: 'ACTIVE' } : undefined,
          ...periodOverlap,
        },
      })
      if (unitConflict) {
        return NextResponse.json(
          { error: `Unit already has a ${unitConflict.status.toLowerCase()} lease covering this period` },
          { status: 400 }
        )
      }
    }

    // Same-tenant overlap check (prevents the same tenant appearing on two
    // simultaneous leases even across different units)
    const tenantConflict = await prisma.lease.findFirst({
      where: {
        tenantId: validatedData.tenantId,
        status: { in: ['ACTIVE', 'PENDING'] },
        NOT: validatedData.status === 'PENDING' ? { status: 'ACTIVE' } : undefined,
        ...periodOverlap,
      },
    })
    if (tenantConflict) {
      return NextResponse.json(
        { error: `Tenant already has a ${tenantConflict.status.toLowerCase()} lease covering this period` },
        { status: 400 }
      )
    }

    const lease = await prisma.lease.create({
      data: {
        ...validatedData,
        // New leases always start as PENDING regardless of what was sent.
        // The lifecycle (or upload route) will promote to ACTIVE once both
        // parties have signed and the start date has arrived.
        status: 'PENDING',
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      },
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

    return NextResponse.json(lease, { status: 201 })
  } catch (error: any) {
    console.error('Error creating lease:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
