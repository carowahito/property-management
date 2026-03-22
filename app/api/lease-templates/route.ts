import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const activeOnly = searchParams.get('activeOnly') !== 'false'

    const where: any = {}
    if (type) where.type = type
    if (activeOnly) where.isActive = true

    const templates = await prisma.leaseTemplate.findMany({
      where,
      include: {
        _count: { select: { leases: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching lease templates:', error)
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

    // If setting as default, unset other defaults of same type
    if (body.isDefault) {
      await prisma.leaseTemplate.updateMany({
        where: { type: body.type, isDefault: true },
        data: { isDefault: false },
      })
    }

    const template = await prisma.leaseTemplate.create({
      data: {
        name: body.name,
        type: body.type,
        content: body.content,
        clauses: body.clauses || null,
        isDefault: body.isDefault || false,
        isActive: body.isActive !== false,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating lease template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
