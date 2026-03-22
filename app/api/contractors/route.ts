import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createContractorSchema } from '@/lib/validations/contractor'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const trade = searchParams.get('trade')
    const isVetted = searchParams.get('isVetted')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (trade && trade !== 'all') where.trade = trade
    if (isVetted !== null && isVetted !== 'all') {
      if (isVetted === 'true') where.isVetted = true
      if (isVetted === 'false') where.isVetted = false
    }
    if (isActive !== null && isActive !== 'all') {
      if (isActive === 'true') where.isActive = true
      if (isActive === 'false') where.isActive = false
    }

    const [contractors, total] = await Promise.all([
      prisma.contractor.findMany({
        where,
        include: {
          _count: {
            select: { workOrders: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contractor.count({ where }),
    ])

    return NextResponse.json({
      contractors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching contractors:', error)
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
    const validatedData = createContractorSchema.parse(body)

    const contractorData: any = { ...validatedData }
    // Normalize empty email to null
    if (!contractorData.email) {
      contractorData.email = null
    }

    const contractor = await prisma.contractor.create({
      data: contractorData,
    })

    return NextResponse.json(contractor, { status: 201 })
  } catch (error: any) {
    console.error('Error creating contractor:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
