import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateContractorSchema } from '@/lib/validations/contractor'

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

    const contractor = await prisma.contractor.findUnique({
      where: { id },
      include: {
        workOrders: {
          select: {
            id: true,
            title: true,
            status: true,
            completedDate: true,
            actualCost: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { workOrders: true } },
      },
    })

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
    }

    return NextResponse.json(contractor)
  } catch (error) {
    console.error('Error fetching contractor:', error)
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
    const validatedData = updateContractorSchema.parse(body)

    const updateData: any = { ...validatedData }
    if (updateData.email === '') {
      updateData.email = null
    }

    const contractor = await prisma.contractor.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(contractor)
  } catch (error: any) {
    console.error('Error updating contractor:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
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

    // Soft delete by setting isActive = false
    const contractor = await prisma.contractor.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Contractor deactivated successfully', contractor })
  } catch (error: any) {
    console.error('Error deleting contractor:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
