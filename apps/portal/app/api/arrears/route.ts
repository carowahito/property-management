import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createArrearsSchema } from '@/lib/validations/arrears'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const isActive = searchParams.get('isActive')
    const currentStep = searchParams.get('currentStep')
    const sortBy = searchParams.get('sortBy') || 'daysOverdue'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (isActive !== null && isActive !== 'all') {
      where.isActive = isActive === 'true'
    } else {
      where.isActive = true
    }

    if (currentStep && currentStep !== 'all') {
      where.currentStep = currentStep
    }

    const orderBy: any = {}
    if (sortBy === 'daysOverdue') {
      orderBy.daysOverdue = sortOrder
    } else if (sortBy === 'amountOwed') {
      orderBy.amountOwed = sortOrder
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder
    } else {
      orderBy.daysOverdue = 'desc'
    }

    const [arrears, total] = await Promise.all([
      prisma.arrearsEscalation.findMany({
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
              monthlyRent: true,
              startDate: true,
              endDate: true,
              unitRef: {
                select: {
                  id: true,
                  unitNumber: true,
                },
              },
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.arrearsEscalation.count({ where }),
    ])

    // Compute summary stats
    const allActive = await prisma.arrearsEscalation.findMany({
      where: { isActive: true },
      select: {
        amountOwed: true,
        daysOverdue: true,
        currentStep: true,
      },
    })

    const totalOverdue = allActive.length
    const amountAtRisk = allActive.reduce(
      (sum, a) => sum + Number(a.amountOwed),
      0
    )
    const avgDaysOverdue =
      totalOverdue > 0
        ? Math.round(
            allActive.reduce((sum, a) => sum + a.daysOverdue, 0) / totalOverdue
          )
        : 0
    const legalCases = allActive.filter(
      (a) => a.currentStep === 'LEGAL_REFERRAL'
    ).length

    // Pipeline counts
    const pipeline = {
      REMINDER_SENT: allActive.filter((a) => a.currentStep === 'REMINDER_SENT')
        .length,
      OVERDUE_NOTICE_1: allActive.filter(
        (a) => a.currentStep === 'OVERDUE_NOTICE_1'
      ).length,
      PHONE_CALL: allActive.filter((a) => a.currentStep === 'PHONE_CALL')
        .length,
      OVERDUE_NOTICE_2: allActive.filter(
        (a) => a.currentStep === 'OVERDUE_NOTICE_2'
      ).length,
      FORMAL_NOTICE: allActive.filter((a) => a.currentStep === 'FORMAL_NOTICE')
        .length,
      LEGAL_REFERRAL: allActive.filter(
        (a) => a.currentStep === 'LEGAL_REFERRAL'
      ).length,
    }

    return NextResponse.json({
      arrears,
      summary: {
        totalOverdue,
        amountAtRisk,
        avgDaysOverdue,
        legalCases,
      },
      pipeline,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching arrears:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createArrearsSchema.parse(body)

    // Check if lease exists
    const lease = await prisma.lease.findUnique({
      where: { id: validatedData.leaseId },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: validatedData.tenantId },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Check for existing active arrears for same lease
    const existing = await prisma.arrearsEscalation.findFirst({
      where: {
        leaseId: validatedData.leaseId,
        isActive: true,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An active arrears escalation already exists for this lease' },
        { status: 409 }
      )
    }

    const arrears = await prisma.arrearsEscalation.create({
      data: {
        ...validatedData,
        reminderSentAt: new Date(),
      },
      include: {
        tenant: {
          select: { id: true, name: true, email: true, phone: true },
        },
        property: {
          select: { id: true, name: true, address: true },
        },
        lease: {
          select: {
            id: true,
            monthlyRent: true,
            unitRef: { select: { id: true, unitNumber: true } },
          },
        },
      },
    })

    return NextResponse.json(arrears, { status: 201 })
  } catch (error: any) {
    console.error('Error creating arrears:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
