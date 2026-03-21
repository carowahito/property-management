import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createLandlordSchema } from '@/lib/validations/landlord'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (status && status !== 'all') where.status = status

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [landlords, total] = await Promise.all([
      prisma.landlord.findMany({
        where,
        include: {
          _count: {
            select: {
              properties: true,
              payouts: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.landlord.count({ where }),
    ])

    return NextResponse.json({
      landlords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching landlords:', error)
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
    const validatedData = createLandlordSchema.parse(body)

    // Check if email is already in use
    const existingLandlord = await prisma.landlord.findUnique({
      where: { email: validatedData.email },
    })

    if (existingLandlord) {
      return NextResponse.json(
        { error: 'Email already registered to another landlord' },
        { status: 400 }
      )
    }

    const landlord = await prisma.landlord.create({
      data: validatedData,
    })

    return NextResponse.json(landlord, { status: 201 })
  } catch (error: any) {
    console.error('Error creating landlord:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email or ID number already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
