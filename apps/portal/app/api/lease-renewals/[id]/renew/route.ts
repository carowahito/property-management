import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { renewLeaseSchema } from '@/lib/validations/lease-renewal'

export async function POST(
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
    const validatedData = renewLeaseSchema.parse(body)

    // Fetch the renewal record
    const renewal = await prisma.leaseRenewal.findUnique({
      where: { id },
      include: {
        lease: true,
      },
    })

    if (!renewal) {
      return NextResponse.json({ error: 'Lease renewal not found' }, { status: 404 })
    }

    if (renewal.status === 'RENEWED') {
      return NextResponse.json(
        { error: 'This renewal has already been executed' },
        { status: 400 }
      )
    }

    if (renewal.directorEscalated) {
      return NextResponse.json(
        { error: 'This tenancy is escalated to the Director. Renewal cannot be executed until the Director approves (SOP 016 Step 1).' },
        { status: 400 }
      )
    }

    if (!renewal.landlordIntent) {
      return NextResponse.json(
        { error: 'Landlord instruction must be recorded before executing a renewal (SOP 016 Step 2).' },
        { status: 400 }
      )
    }

    const newStartDate = new Date(validatedData.newStartDate)
    const newEndDate = new Date(validatedData.newEndDate)

    if (newEndDate <= newStartDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Create new lease as PENDING — it only becomes ACTIVE once signed.
    // The old lease stays ACTIVE until the new one is signed and takes over.
    const result = await prisma.$transaction(async (tx) => {
      // Create the new lease in PENDING status (awaiting signatures)
      const newLease = await tx.lease.create({
        data: {
          tenantId: renewal.tenantId,
          propertyId: renewal.propertyId,
          unitId: renewal.lease.unitId,
          unit: renewal.lease.unit,
          startDate: newStartDate,
          endDate: newEndDate,
          monthlyRent: validatedData.newMonthlyRent,
          securityDeposit: validatedData.securityDeposit ?? renewal.lease.securityDeposit,
          status: 'PENDING',
          terms: validatedData.terms ?? renewal.lease.terms,
          templateId: renewal.lease.templateId,
          noticePeriod: renewal.lease.noticePeriod,
          rentEscalation: renewal.lease.rentEscalation,
          rentDueDay: renewal.lease.rentDueDay,
          gracePeriodDays: renewal.lease.gracePeriodDays,
          latePenaltyPerDay: renewal.lease.latePenaltyPerDay,
          petPolicy: renewal.lease.petPolicy,
          specialConditions: renewal.lease.specialConditions,
        },
        include: {
          tenant: {
            select: { id: true, name: true, email: true },
          },
          property: {
            select: { id: true, name: true, address: true },
          },
        },
      })

      // Link renewal to the new lease but keep status as ACCEPTED
      // (RENEWED only after the new lease is actually signed)
      const updatedRenewal = await tx.leaseRenewal.update({
        where: { id },
        data: {
          newLeaseId: newLease.id,
        },
      })

      return { newLease, updatedRenewal }
    })

    return NextResponse.json({
      message: 'New lease created as PENDING — it will become active once signed by both parties.',
      newLease: result.newLease,
      renewal: result.updatedRenewal,
    })
  } catch (error: any) {
    console.error('Error executing lease renewal:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
