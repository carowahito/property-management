import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createMoveInChecklistSchema } from '@/lib/validations/move-in'

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

    const [checklists, total] = await Promise.all([
      prisma.moveInChecklist.findMany({
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
              unitId: true,
              startDate: true,
              endDate: true,
              status: true,
              monthlyRent: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.moveInChecklist.count({ where }),
    ])

    return NextResponse.json({
      checklists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching move-in checklists:', error)
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
    const validatedData = createMoveInChecklistSchema.parse(body)

    // Check if lease exists
    const lease = await prisma.lease.findUnique({
      where: { id: validatedData.leaseId },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    // Check for duplicate checklist on the same lease
    const existing = await prisma.moveInChecklist.findUnique({
      where: { leaseId: validatedData.leaseId },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A move-in checklist already exists for this lease' },
        { status: 409 }
      )
    }

    const checklist = await prisma.moveInChecklist.create({
      data: {
        leaseId: validatedData.leaseId,
        tenantId: validatedData.tenantId,
        propertyId: validatedData.propertyId,
        unitId: validatedData.unitId || null,
        notes: validatedData.notes || null,
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

    return NextResponse.json(checklist, { status: 201 })
  } catch (error: any) {
    console.error('Error creating move-in checklist:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
