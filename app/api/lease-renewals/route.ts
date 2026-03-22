import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createLeaseRenewalSchema } from '@/lib/validations/lease-renewal'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const propertyId = searchParams.get('propertyId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (status && status !== 'all') where.status = status
    if (propertyId && propertyId !== 'all') where.propertyId = propertyId

    const [renewals, total] = await Promise.all([
      prisma.leaseRenewal.findMany({
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
            },
          },
          lease: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              monthlyRent: true,
              status: true,
              unit: true,
              unitRef: {
                select: {
                  id: true,
                  unitNumber: true,
                },
              },
            },
          },
        },
        orderBy: { leaseEndDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.leaseRenewal.count({ where }),
    ])

    return NextResponse.json({
      renewals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching lease renewals:', error)
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
    const validatedData = createLeaseRenewalSchema.parse(body)

    // Check lease exists
    const lease = await prisma.lease.findUnique({
      where: { id: validatedData.leaseId },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    // Check for existing renewal for this lease
    const existingRenewal = await prisma.leaseRenewal.findFirst({
      where: {
        leaseId: validatedData.leaseId,
        status: {
          notIn: ['RENEWED', 'EXPIRED', 'DECLINED'],
        },
      },
    })

    if (existingRenewal) {
      return NextResponse.json(
        { error: 'An active renewal already exists for this lease' },
        { status: 400 }
      )
    }

    // Calculate alert date (90 days before lease end)
    const leaseEndDate = new Date(validatedData.leaseEndDate)
    const alertDate = new Date(leaseEndDate)
    alertDate.setDate(alertDate.getDate() - 90)

    const renewal = await prisma.leaseRenewal.create({
      data: {
        leaseId: validatedData.leaseId,
        tenantId: validatedData.tenantId,
        propertyId: validatedData.propertyId,
        currentRent: validatedData.currentRent,
        leaseEndDate,
        alertDate,
        renewalNotes: validatedData.renewalNotes,
      },
      include: {
        tenant: {
          select: { id: true, name: true, email: true },
        },
        property: {
          select: { id: true, name: true, address: true },
        },
        lease: {
          select: { id: true, startDate: true, endDate: true, monthlyRent: true },
        },
      },
    })

    return NextResponse.json(renewal, { status: 201 })
  } catch (error: any) {
    console.error('Error creating lease renewal:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
