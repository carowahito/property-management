import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createPayoutSchema } from '@/lib/validations/payout'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const landlordId = searchParams.get('landlordId')
    const period = searchParams.get('period')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (status && status !== 'all') where.status = status
    if (landlordId && landlordId !== 'all') where.landlordId = landlordId
    if (period) where.period = { contains: period, mode: 'insensitive' }

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where,
        include: {
          landlord: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              bankName: true,
              bankAccount: true,
            },
          },
          unit: {
            select: {
              id: true,
              unitNumber: true,
              property: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payout.count({ where }),
    ])

    return NextResponse.json({
      payouts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching payouts:', error)
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
    const validatedData = createPayoutSchema.parse(body)

    // Check if landlord exists
    const landlord = await prisma.landlord.findUnique({
      where: { id: validatedData.landlordId },
    })

    if (!landlord) {
      return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
    }

    const payoutData: any = { ...validatedData }

    if (validatedData.paidDate) {
      payoutData.paidDate = new Date(validatedData.paidDate)
    }

    const payout = await prisma.payout.create({
      data: payoutData,
      include: {
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
            bankName: true,
            bankAccount: true,
          },
        },
      },
    })

    return NextResponse.json(payout, { status: 201 })
  } catch (error: any) {
    console.error('Error creating payout:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
