import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createWorkOrderSchema } from '@/lib/validations/work-order'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const vendorId = searchParams.get('vendorId')
    const maintenanceRequestId = searchParams.get('maintenanceRequestId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (status && status !== 'all') where.status = status
    if (priority && priority !== 'all') where.priority = priority
    if (vendorId && vendorId !== 'all') where.vendorId = vendorId
    if (maintenanceRequestId && maintenanceRequestId !== 'all')
      where.maintenanceRequestId = maintenanceRequestId

    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              specialization: true,
            },
          },
          maintenanceRequest: {
            select: {
              id: true,
              title: true,
              property: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                },
              },
              tenant: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.workOrder.count({ where }),
    ])

    return NextResponse.json({
      workOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching work orders:', error)
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
    const validatedData = createWorkOrderSchema.parse(body)

    // If maintenanceRequestId is provided, check if it exists
    if (validatedData.maintenanceRequestId) {
      const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
        where: { id: validatedData.maintenanceRequestId },
      })

      if (!maintenanceRequest) {
        return NextResponse.json(
          { error: 'Maintenance request not found' },
          { status: 404 }
        )
      }
    }

    // If vendorId is provided, check if it exists
    if (validatedData.vendorId) {
      const vendor = await prisma.vendor.findUnique({
        where: { id: validatedData.vendorId },
      })

      if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
      }
    }

    const workOrderData: any = { ...validatedData }

    if (validatedData.scheduledDate) {
      workOrderData.scheduledDate = new Date(validatedData.scheduledDate)
    }

    if (validatedData.completedDate) {
      workOrderData.completedDate = new Date(validatedData.completedDate)
    }

    const workOrder = await prisma.workOrder.create({
      data: workOrderData,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        maintenanceRequest: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json(workOrder, { status: 201 })
  } catch (error: any) {
    console.error('Error creating work order:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
