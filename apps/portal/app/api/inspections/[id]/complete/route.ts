import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { completeInspectionSchema } from '@/lib/validations/inspection'

export async function POST(
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
    const validatedData = completeInspectionSchema.parse(body)

    // Check inspection exists and is not already completed
    const existing = await prisma.inspection.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    if (existing.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Inspection is already completed' }, { status: 400 })
    }

    if (existing.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Cannot complete a cancelled inspection' }, { status: 400 })
    }

    // Auto-flag followUpRequired if any room is POOR condition
    let followUpRequired = false
    const rooms = validatedData.rooms as any[] | null | undefined
    if (rooms && rooms.length > 0) {
      followUpRequired = rooms.some(
        (room: any) => room.condition === 'POOR'
      )
    }

    // Extract maintenance items from rooms with POOR/FAIR conditions if not explicitly provided
    let maintenanceItems = validatedData.maintenanceItems || []
    if (rooms && rooms.length > 0 && maintenanceItems.length === 0) {
      const autoItems = rooms
        .filter((room: any) => room.condition === 'POOR' || room.condition === 'FAIR')
        .filter((room: any) => room.notes && room.notes.trim().length > 0)
        .map((room: any) => ({
          description: room.notes as string,
          priority: (room.condition === 'POOR' ? 'HIGH' : 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
          room: room.room as string | undefined,
        }))
      if (autoItems.length > 0) {
        maintenanceItems = autoItems
      }
    }

    const inspection = await prisma.inspection.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedDate: new Date(),
        overallCondition: validatedData.overallCondition,
        summary: validatedData.summary || undefined,
        rooms: validatedData.rooms || undefined,
        followUpRequired,
        maintenanceItems: maintenanceItems.length > 0 ? maintenanceItems : undefined,
        violations: validatedData.violations || undefined,
        inspectorSignature: validatedData.inspectorSignature || undefined,
        tenantSignature: validatedData.tenantSignature || undefined,
        tenantSignedAt: validatedData.tenantSignature ? new Date() : undefined,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(inspection)
  } catch (error: any) {
    console.error('Error completing inspection:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
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
