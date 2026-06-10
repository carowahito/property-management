import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { generateStatementSchema } from '@/lib/validations/owner-statement'
import { Decimal } from '@prisma/client/runtime/library'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const landlordId = searchParams.get('landlordId')
    const propertyId = searchParams.get('propertyId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (landlordId) where.landlordId = landlordId
    if (propertyId) where.propertyId = propertyId
    if (month) where.month = parseInt(month)
    if (year) where.year = parseInt(year)
    if (status && status !== 'all') where.status = status

    const [statements, total] = await Promise.all([
      prisma.ownerStatement.findMany({
        where,
        include: {
          landlord: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              type: true,
              members: { select: { id: true, name: true }, orderBy: { createdAt: 'asc' as const } },
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
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ownerStatement.count({ where }),
    ])

    return NextResponse.json({
      statements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching owner statements:', error)
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
    const validatedData = generateStatementSchema.parse(body)

    const { landlordId, propertyId, month, year, managementFeeRate } = validatedData

    // Check if statement already exists
    const existing = await prisma.ownerStatement.findFirst({
      where: {
        landlordId,
        propertyId: propertyId || null,
        month,
        year,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Statement already exists for this landlord, property and period' },
        { status: 409 }
      )
    }

    // Verify landlord exists
    const landlord = await prisma.landlord.findUnique({
      where: { id: landlordId },
    })
    if (!landlord) {
      return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
    }

    // Get the landlord's units (optionally filtered by property)
    const unitWhere: any = { landlordId }
    if (propertyId) {
      unitWhere.propertyId = propertyId
    }
    const units = await prisma.unit.findMany({
      where: unitWhere,
      include: {
        property: { select: { id: true, name: true } },
      },
    })

    if (units.length === 0) {
      return NextResponse.json(
        { error: 'No units found for this landlord' + (propertyId ? ' and property' : '') },
        { status: 404 }
      )
    }

    const unitIds = units.map((u) => u.id)

    // Calculate period date range
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    // Get active leases for these units during this period
    const leases = await prisma.lease.findMany({
      where: {
        unitId: { in: unitIds },
        status: { in: ['ACTIVE', 'EXPIRED'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      include: {
        tenant: { select: { id: true, name: true } },
        unitRef: { select: { id: true, unitNumber: true } },
      },
    })

    // Calculate rent due from active leases
    let rentDue = new Decimal(0)
    const incomeLineItems: any[] = []

    for (const lease of leases) {
      const leaseRent = lease.monthlyRent
      rentDue = rentDue.plus(leaseRent)
      incomeLineItems.push({
        description: `Rent - ${lease.unitRef?.unitNumber || 'Unit'} (${lease.tenant.name})`,
        amount: Number(leaseRent),
        type: 'income',
        category: 'rent_due',
      })
    }

    // Get payments received in this month for these leases
    const leaseIds = leases.map((l) => l.id)
    const payments = await prisma.payment.findMany({
      where: {
        leaseId: { in: leaseIds },
        status: 'PAID',
        type: 'RENT',
        paidDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        tenant: { select: { name: true } },
        lease: {
          select: {
            unitRef: { select: { unitNumber: true } },
          },
        },
      },
    })

    let rentReceived = new Decimal(0)
    for (const payment of payments) {
      rentReceived = rentReceived.plus(payment.amount)
    }

    // Calculate management fee
    const managementFee = rentReceived.times(managementFeeRate).dividedBy(100)

    // Get maintenance/work order costs for this period
    const workOrders = await prisma.workOrder.findMany({
      where: {
        lease: {
          unitId: { in: unitIds },
        },
        status: 'COMPLETED',
        completedDate: {
          gte: startDate,
          lte: endDate,
        },
        actualCost: { not: null },
      },
      include: {
        lease: {
          select: {
            unitRef: { select: { unitNumber: true } },
          },
        },
      },
    })

    let maintenanceCosts = new Decimal(0)
    const deductionLineItems: any[] = []

    for (const wo of workOrders) {
      const cost = wo.actualCost || wo.cost || new Decimal(0)
      maintenanceCosts = maintenanceCosts.plus(cost)
      deductionLineItems.push({
        description: `Maintenance - ${wo.title} (${wo.lease?.unitRef?.unitNumber || 'Unit'})`,
        amount: Number(cost),
        type: 'deduction',
        category: 'maintenance',
      })
    }

    // Add management fee line item
    deductionLineItems.unshift({
      description: `Management Fee (${managementFeeRate}% of rent received)`,
      amount: Number(managementFee),
      type: 'deduction',
      category: 'management_fee',
    })

    // Get deposits held
    const deposits = await prisma.deposit.findMany({
      where: {
        propertyId: propertyId ? propertyId : { in: units.map((u) => u.propertyId) },
        status: 'HELD',
      },
    })

    let depositsHeld = new Decimal(0)
    for (const d of deposits) {
      depositsHeld = depositsHeld.plus(d.amount)
    }

    const totalDeductions = managementFee.plus(maintenanceCosts)
    const netDisbursement = rentReceived.minus(totalDeductions)

    const lineItems = [...incomeLineItems, ...deductionLineItems]

    const statement = await prisma.ownerStatement.create({
      data: {
        landlordId,
        propertyId: propertyId || null,
        month,
        year,
        rentDue,
        rentReceived,
        managementFee,
        managementFeeRate,
        maintenanceCosts,
        otherDeductions: 0,
        netDisbursement,
        depositsHeld,
        lineItems,
        status: 'DRAFT',
      },
      include: {
        landlord: {
          select: { id: true, name: true, email: true, phone: true },
        },
        property: {
          select: { id: true, name: true, address: true },
        },
      },
    })

    return NextResponse.json(statement, { status: 201 })
  } catch (error: any) {
    console.error('Error generating owner statement:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
