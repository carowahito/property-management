import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createTaskSchema } from '@/lib/validations/task'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedToId = searchParams.get('assignedTo')
    const stakeholderType = searchParams.get('stakeholderType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (status && status !== 'all') where.status = status
    if (priority && priority !== 'all') where.priority = priority
    if (assignedToId && assignedToId !== 'all') where.assignedToId = assignedToId
    if (stakeholderType && stakeholderType !== 'all')
      where.stakeholderType = stakeholderType

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedBy: {
            select: {
              id: true,
              name: true,
            },
          },
          lead: {
            select: {
              id: true,
              name: true,
            },
          },
          enquiry: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ])

    return NextResponse.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
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
    const validatedData = createTaskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        assignedById: session.user.id,
        dueDate: new Date(validatedData.dueDate),
        reminderDate: validatedData.reminderDate
          ? new Date(validatedData.reminderDate)
          : undefined,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error: any) {
    console.error('Error creating task:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
