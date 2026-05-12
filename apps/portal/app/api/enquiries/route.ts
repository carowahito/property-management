import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createEnquirySchema } from '@/lib/validations/enquiry'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const propertyId = searchParams.get('propertyId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (status && status !== 'all') where.status = status
    if (priority && priority !== 'all') where.priority = priority
    if (assignedTo && assignedTo !== 'all') where.assignedTo = assignedTo
    if (propertyId && propertyId !== 'all') where.propertyId = propertyId

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [enquiries, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        include: {
          _count: {
            select: {
              tasks: true,
              communications: true,
              notes_rel: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.enquiry.count({ where }),
    ])

    return NextResponse.json({
      enquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching enquiries:', error)
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
    const validatedData = createEnquirySchema.parse(body)

    // If propertyId is provided, check if it exists
    if (validatedData.propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: validatedData.propertyId },
      })

      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }
    }

    const enquiryData: any = { ...validatedData }

    if (validatedData.resolvedAt) {
      enquiryData.resolvedAt = new Date(validatedData.resolvedAt)
    }

    const enquiry = await prisma.enquiry.create({
      data: enquiryData,
    })

    return NextResponse.json(enquiry, { status: 201 })
  } catch (error: any) {
    console.error('Error creating enquiry:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
