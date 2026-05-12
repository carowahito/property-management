import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateStatementStatusSchema } from '@/lib/validations/owner-statement'

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

    const statement = await prisma.ownerStatement.findUnique({
      where: { id },
      include: {
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            bankName: true,
            bankAccount: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
      },
    })

    if (!statement) {
      return NextResponse.json({ error: 'Statement not found' }, { status: 404 })
    }

    return NextResponse.json(statement)
  } catch (error) {
    console.error('Error fetching owner statement:', error)
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
    const validatedData = updateStatementStatusSchema.parse(body)

    const existing = await prisma.ownerStatement.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Statement not found' }, { status: 404 })
    }

    const updateData: any = { status: validatedData.status }

    if (validatedData.status === 'SENT') {
      updateData.sentAt = new Date()
    }

    const statement = await prisma.ownerStatement.update({
      where: { id },
      data: updateData,
      include: {
        landlord: {
          select: { id: true, name: true, email: true },
        },
        property: {
          select: { id: true, name: true, address: true },
        },
      },
    })

    return NextResponse.json(statement)
  } catch (error: any) {
    console.error('Error updating owner statement:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
