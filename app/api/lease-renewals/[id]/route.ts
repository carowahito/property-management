import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateLeaseRenewalSchema } from '@/lib/validations/lease-renewal'

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

    const renewal = await prisma.leaseRenewal.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
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
        lease: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            monthlyRent: true,
            status: true,
            unit: true,
            unitRef: {
              select: {
                id: true,
                unitNumber: true,
              },
            },
          },
        },
      },
    })

    if (!renewal) {
      return NextResponse.json({ error: 'Lease renewal not found' }, { status: 404 })
    }

    return NextResponse.json(renewal)
  } catch (error) {
    console.error('Error fetching lease renewal:', error)
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
    const validatedData = updateLeaseRenewalSchema.parse(body)

    const updateData: any = { ...validatedData }

    // Set timestamps based on actions
    if (validatedData.landlordIntent) {
      updateData.landlordDecisionAt = new Date()
      if (!updateData.status) {
        if (validatedData.landlordIntent === 'NOT_RENEWING') {
          updateData.status = 'DECLINED'
        } else if (validatedData.landlordIntent === 'RENEW_NEW_RENT') {
          updateData.status = 'RENT_REVIEW'
        } else {
          updateData.status = 'TENANT_NOTIFIED'
        }
      }
      updateData.agentActionAt = updateData.agentActionAt || new Date()
    }

    if (validatedData.tenantResponse) {
      updateData.tenantResponseAt = new Date()
      if (validatedData.tenantResponse === 'ACCEPTED') {
        updateData.status = 'ACCEPTED'
      } else if (validatedData.tenantResponse === 'DECLINED') {
        updateData.status = 'DECLINED'
      }
    }

    if (validatedData.status === 'TENANT_NOTIFIED') {
      updateData.tenantNotifiedAt = new Date()
    }

    // Calculate rent increase percent if proposed rent is set
    if (validatedData.proposedRent) {
      const renewal = await prisma.leaseRenewal.findUnique({
        where: { id },
        select: { currentRent: true },
      })
      if (renewal) {
        const currentRent = Number(renewal.currentRent)
        const increasePercent =
          ((validatedData.proposedRent - currentRent) / currentRent) * 100
        updateData.rentIncreasePercent = Math.round(increasePercent * 100) / 100
      }
    }

    const updated = await prisma.leaseRenewal.update({
      where: { id },
      data: updateData,
      include: {
        tenant: {
          select: { id: true, name: true, email: true },
        },
        property: {
          select: { id: true, name: true, address: true },
        },
        lease: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            monthlyRent: true,
            unit: true,
            unitRef: {
              select: { id: true, unitNumber: true },
            },
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating lease renewal:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Lease renewal not found' }, { status: 404 })
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
