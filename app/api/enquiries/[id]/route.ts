import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateEnquirySchema } from '@/lib/validations/enquiry'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        communications: {
          select: {
            id: true,
            type: true,
            subject: true,
            sentAt: true,
            status: true,
          },
          orderBy: { sentAt: 'desc' },
        },
        notes_rel: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            tasks: true,
            communications: true,
            notes_rel: true,
          },
        },
      },
    })

    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })
    }

    return NextResponse.json(enquiry)
  } catch (error) {
    console.error('Error fetching enquiry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateEnquirySchema.parse(body)

    const updateData: any = { ...validatedData }

    // Convert date strings to Date objects
    if (validatedData.resolvedAt) {
      updateData.resolvedAt = new Date(validatedData.resolvedAt)
    }

    // If status is being updated to RESOLVED and no resolvedAt, set it to now
    if (validatedData.status === 'RESOLVED' && !validatedData.resolvedAt) {
      updateData.resolvedAt = new Date()
    }

    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(enquiry)
  } catch (error: any) {
    console.error('Error updating enquiry:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.enquiry.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Enquiry deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting enquiry:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
