import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createDepositSchema } from '@/lib/validations/deposit'

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

    const where: any = {}

    if (status && status !== 'all') where.status = status
    if (tenantId && tenantId !== 'all') where.tenantId = tenantId
    if (propertyId && propertyId !== 'all') where.propertyId = propertyId

    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
        where,
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              unit: true,
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
              unit: true,
              monthlyRent: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.deposit.count({ where }),
    ])

    return NextResponse.json({
      deposits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching deposits:', error)
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
    const validatedData = createDepositSchema.parse(body)

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: validatedData.tenantId },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Check if lease exists
    const lease = await prisma.lease.findUnique({
      where: { id: validatedData.leaseId },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    const deposit = await prisma.deposit.create({
      data: {
        ...validatedData,
        paymentDate: new Date(validatedData.paymentDate),
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
          },
        },
        lease: {
          select: {
            id: true,
            unit: true,
          },
        },
      },
    })

    return NextResponse.json(deposit, { status: 201 })
  } catch (error: any) {
    console.error('Error creating deposit:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
