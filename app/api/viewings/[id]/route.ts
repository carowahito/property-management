import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateViewingSchema } from '@/lib/validations/viewing'

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

    const viewing = await prisma.viewing.findUnique({
      where: { id: id },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            type: true,
            totalUnits: true,
            description: true,
            landlord: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    })

    if (!viewing) {
      return NextResponse.json({ error: 'Viewing not found' }, { status: 404 })
    }

    return NextResponse.json(viewing)
  } catch (error) {
    console.error('Error fetching viewing:', error)
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
    const validatedData = updateViewingSchema.parse(body)

    const updateData: any = { ...validatedData }

    // Convert date strings to Date objects
    if (validatedData.scheduledDate) {
      updateData.scheduledDate = new Date(validatedData.scheduledDate)
    }

    const viewing = await prisma.viewing.update({
      where: { id: id },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    })

    return NextResponse.json(viewing)
  } catch (error: any) {
    console.error('Error updating viewing:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Viewing not found' }, { status: 404 })
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

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.viewing.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'Viewing deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting viewing:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Viewing not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
