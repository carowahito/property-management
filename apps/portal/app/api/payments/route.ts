import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createPaymentSchema } from '@/lib/validations/payment'
import { syncPaymentToLedger } from '@/lib/services/tenant-ledger'
import { generateAndSendReceipt } from '@/lib/services/receipt'

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
    if (leaseId && leaseId !== 'all') where.leaseId = leaseId

    // Tenants are scoped to their own payments only
    if (session.user.role === 'TENANT') {
      where.tenantId = session.user.id
    } else {
      if (tenantId && tenantId !== 'all') where.tenantId = tenantId
    }

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
              unitRef: {
                select: {
                  id: true,
                  unitNumber: true,
                  landlord: {
                    select: { id: true, name: true, type: true, members: { select: { id: true, name: true }, orderBy: { createdAt: 'asc' as const } } },
                  },
                },
              },
            },
          },
          property: {
            select: { id: true, name: true, address: true },
          },
          unit: {
            select: {
              id: true,
              unitNumber: true,
              landlord: {
                select: { id: true, name: true, type: true, members: { select: { id: true, name: true }, orderBy: { createdAt: 'asc' as const } } },
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

    // Lease is optional — a payment (e.g. a deposit) can be recorded before a lease is signed
    let lease = null
    if (validatedData.leaseId) {
      lease = await prisma.lease.findUnique({
        where: { id: validatedData.leaseId },
      })

      if (!lease) {
        return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
      }
    }

    const paymentData: any = {
      ...validatedData,
      dueDate: new Date(validatedData.dueDate),
      propertyId: validatedData.propertyId || lease?.propertyId || undefined,
      unitId: validatedData.unitId || lease?.unitId || undefined,
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
        property: {
          select: { id: true, name: true },
        },
        unit: {
          select: { id: true, unitNumber: true },
        },
      },
    })

    if (payment.status === 'PAID') {
      await syncPaymentToLedger(payment.id)
      // BR-9: every allocated payment auto-generates a receipt (all methods).
      // Best-effort delivery — must not fail the payment if comms are down.
      await generateAndSendReceipt(payment.id)
    }

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
