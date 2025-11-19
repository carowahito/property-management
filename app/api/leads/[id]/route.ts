import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateLeadSchema } from '@/lib/validations/lead'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lead = await prisma.lead.findUnique({
      where: { id: id },
      include: {
        tasks: {
          include: {
            assignedTo: {
              select: { name: true, email: true },
            },
          },
          orderBy: { dueDate: 'desc' },
        },
        communications: {
          orderBy: { sentAt: 'desc' },
        },
        notes_rel: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error fetching lead:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateLeadSchema.parse(body)

    const updateData: any = { ...validatedData }

    if (validatedData.moveInDate) {
      updateData.moveInDate = new Date(validatedData.moveInDate)
    }

    // Update lastContact when status changes
    updateData.lastContact = new Date()

    if (validatedData.status === 'CONVERTED') {
      updateData.convertedAt = new Date()
    }

    const lead = await prisma.lead.update({
      where: { id: id },
      data: updateData,
    })

    return NextResponse.json(lead)
  } catch (error: any) {
    console.error('Error updating lead:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
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

    const { id } = await params

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.lead.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'Lead deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting lead:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
