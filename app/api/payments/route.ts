import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createPaymentSchema } from '@/lib/validations/payment'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const tenantId = searchParams.get('tenantId')
    const leaseId = searchParams.get('leaseId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (status && status !== 'all') where.status = status
    if (type && type !== 'all') where.type = type
    if (tenantId && tenantId !== 'all') where.tenantId = tenantId
    if (leaseId && leaseId !== 'all') where.leaseId = leaseId

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
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
          lease: {
            select: {
              id: true,
              property: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                },
              },
            },
          },
        },
        orderBy: { dueDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ])

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
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
    const validatedData = createPaymentSchema.parse(body)

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

    const paymentData: any = {
      ...validatedData,
      dueDate: new Date(validatedData.dueDate),
    }

    if (validatedData.paidDate) {
      paymentData.paidDate = new Date(validatedData.paidDate)
    }

    const payment = await prisma.payment.create({
      data: paymentData,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lease: {
          select: {
            id: true,
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error: any) {
    console.error('Error creating payment:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
