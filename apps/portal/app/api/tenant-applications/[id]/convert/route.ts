import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

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

    // Get the application
    const application = await prisma.tenantApplication.findUnique({
      where: { id },
      include: {
        unit: {
          select: {
            id: true,
            unitNumber: true,
            monthlyRent: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved applications can be converted to tenants' },
        { status: 400 }
      )
    }

    if (application.convertedTenantId) {
      return NextResponse.json(
        { error: 'Application has already been converted' },
        { status: 400 }
      )
    }

    // Parse optional lease details from request body
    const body = await request.json().catch(() => ({}))
    const leaseStartDate = body.leaseStartDate ? new Date(body.leaseStartDate) : new Date()
    const leaseEndDate = body.leaseEndDate
      ? new Date(body.leaseEndDate)
      : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    const securityDeposit = body.securityDeposit
      ? Number(body.securityDeposit)
      : (application.unit?.monthlyRent ? Number(application.unit.monthlyRent) : 0)
    const monthlyRent = application.unit?.monthlyRent
      ? Number(application.unit.monthlyRent)
      : 0

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the tenant
      // Resolve company from the property
      const prop = await tx.property.findUnique({ where: { id: application.propertyId }, select: { companyId: true } })

      const tenant = await tx.tenant.create({
        data: {
          companyId: prop!.companyId,
          name: application.fullName,
          email: application.email,
          phone: application.phone,
          idNumber: application.idNumber,
          propertyId: application.propertyId,
          unitId: application.unitId,
          unit: application.unit?.unitNumber || null,
          moveInDate: leaseStartDate,
          status: 'ACTIVE',
        },
      })

      // 2. Create a lease
      const lease = await tx.lease.create({
        data: {
          tenantId: tenant.id,
          propertyId: application.propertyId,
          unitId: application.unitId,
          unit: application.unit?.unitNumber || null,
          startDate: leaseStartDate,
          endDate: leaseEndDate,
          monthlyRent,
          securityDeposit,
          status: 'ACTIVE',
        },
      })

      // 3. Update the unit status to OCCUPIED if unitId present
      if (application.unitId) {
        await tx.unit.update({
          where: { id: application.unitId },
          data: { status: 'OCCUPIED' },
        })
      }

      // 4. Update the application
      const updatedApplication = await tx.tenantApplication.update({
        where: { id },
        data: {
          status: 'CONVERTED',
          convertedTenantId: tenant.id,
        },
      })

      return { tenant, lease, application: updatedApplication }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Error converting application to tenant:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email or ID number already exists for another tenant' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
