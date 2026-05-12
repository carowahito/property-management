import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

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
    const template = await prisma.leaseTemplate.findUnique({
      where: { id },
      include: {
        _count: { select: { leases: true } },
      },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching template:', error)
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

    if (body.isDefault) {
      const existing = await prisma.leaseTemplate.findUnique({ where: { id } })
      if (existing) {
        await prisma.leaseTemplate.updateMany({
          where: { type: existing.type, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        })
      }
    }

    const template = await prisma.leaseTemplate.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(template)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    console.error('Error updating template:', error)
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

    const leasesCount = await prisma.lease.count({ where: { templateId: id } })
    if (leasesCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete template with associated leases. Deactivate instead.' },
        { status: 400 }
      )
    }

    await prisma.leaseTemplate.delete({ where: { id } })
    return NextResponse.json({ message: 'Template deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    console.error('Error deleting template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
