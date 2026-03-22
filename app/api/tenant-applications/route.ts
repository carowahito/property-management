import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createTenantApplicationSchema } from '@/lib/validations/tenant-application'

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
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { idNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [applications, total] = await Promise.all([
      prisma.tenantApplication.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          unit: {
            select: {
              id: true,
              unitNumber: true,
              monthlyRent: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tenantApplication.count({ where }),
    ])

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching tenant applications:', error)
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
    const validatedData = createTenantApplicationSchema.parse(body)

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // If unitId provided, check unit exists and get its rent
    let unitRent: number | null = null
    if (validatedData.unitId) {
      const unit = await prisma.unit.findUnique({
        where: { id: validatedData.unitId },
      })

      if (!unit) {
        return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
      }

      unitRent = unit.monthlyRent ? Number(unit.monthlyRent) : null
    }

    // Auto-check income >= 3x rent
    let incomeCheckPassed: boolean | null = null
    const income = validatedData.monthlyIncome ? Number(validatedData.monthlyIncome) : null

    if (income !== null && unitRent !== null) {
      incomeCheckPassed = income >= unitRent * 3
    }

    const application = await prisma.tenantApplication.create({
      data: {
        ...validatedData,
        monthlyIncome: validatedData.monthlyIncome ? Number(validatedData.monthlyIncome) : null,
        incomeCheckPassed,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            monthlyRent: true,
          },
        },
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error: any) {
    console.error('Error creating tenant application:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
