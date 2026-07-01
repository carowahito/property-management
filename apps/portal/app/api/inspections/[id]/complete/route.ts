import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { completeInspectionSchema } from '@/lib/validations/inspection'

const INSPECTION_TYPE_LABELS: Record<string, string> = {
  MOVE_IN: 'Move-In',
  POST_MOVE_IN: 'Post-Move-In Confirmation (5+ days)',
  THREE_MONTH: '3-Month (New Tenancy)',
  ROUTINE_6_MONTH: '6-Month Routine',
  PRE_MOVE_OUT: 'Pre-Move-Out (2+ weeks before)',
  MOVE_OUT: 'Move-Out',
  ANNUAL: 'Annual Condition Report',
}

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

    // Auto-flag followUpRequired — client sends it explicitly; legacy: derive from room conditions
    const rooms = validatedData.rooms as any
    const isLegacyRooms = Array.isArray(rooms)
    let followUpRequired = validatedData.followUpRequired ?? false
    if (isLegacyRooms && rooms.length > 0 && validatedData.followUpRequired === undefined) {
      followUpRequired = rooms.some((room: any) => room.condition === 'POOR')
    }

    // Extract maintenance items from rooms with POOR/FAIR conditions if not explicitly provided
    let maintenanceItems = validatedData.maintenanceItems || []
    if (isLegacyRooms && rooms.length > 0 && maintenanceItems.length === 0) {
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
        inspectorSignature: validatedData.inspectorSignature,
        inspectorSignedAt: new Date(),
        tenantSignature: validatedData.tenantSignature || undefined,
        tenantSignedAt: validatedData.tenantSignature ? new Date() : undefined,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            landlordId: true,
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

    // Auto-create inspection report documents if checklist data exists
    const completedRooms = inspection.rooms as any
    if (completedRooms && completedRooms._v === 2) {
      const typeLabel = INSPECTION_TYPE_LABELS[inspection.type] || inspection.type
      const completedDate = inspection.completedDate
        ? new Date(inspection.completedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      const docName = `Inspection Report — ${typeLabel} — ${completedDate}`
      const reportUrl = `/api/inspections/${id}/report`

      const docCreates: Promise<any>[] = []

      if (inspection.tenantId) {
        docCreates.push(
          prisma.tenantDocument.create({
            data: {
              tenantId: inspection.tenantId,
              name: docName,
              fileType: 'INSPECTION_REPORT',
              fileSize: 0,
              storagePath: '',
              url: reportUrl,
            },
          })
        )
      }

      const landlordId = (inspection.property as any)?.landlordId
      if (landlordId) {
        docCreates.push(
          prisma.landlordDocument.create({
            data: {
              landlordId,
              name: docName,
              fileType: 'INSPECTION_REPORT',
              fileSize: 0,
              storagePath: '',
              url: reportUrl,
            },
          })
        )
      }

      if (docCreates.length > 0) {
        await Promise.allSettled(docCreates)
      }
    }

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
