import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const ninetyDaysOut = new Date(now)
    ninetyDaysOut.setDate(ninetyDaysOut.getDate() + 90)

    // Find active leases expiring within 90 days
    const expiringLeases = await prisma.lease.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lte: ninetyDaysOut,
        },
      },
      include: {
        tenant: {
          select: { id: true, name: true },
        },
        property: {
          select: { id: true, name: true },
        },
        renewals: {
          where: {
            status: {
              notIn: ['RENEWED', 'EXPIRED', 'DECLINED'],
            },
          },
        },
      },
    })

    // Filter out leases that already have an active renewal
    const leasesNeedingRenewal = expiringLeases.filter(
      (lease) => lease.renewals.length === 0
    )

    // Create renewal records
    const createdRenewals = await Promise.all(
      leasesNeedingRenewal.map((lease) => {
        const alertDate = new Date(lease.endDate)
        alertDate.setDate(alertDate.getDate() - 90)

        return prisma.leaseRenewal.create({
          data: {
            leaseId: lease.id,
            tenantId: lease.tenantId,
            propertyId: lease.propertyId,
            currentRent: lease.monthlyRent,
            leaseEndDate: lease.endDate,
            alertDate,
            alertSentAt: new Date(),
          },
        })
      })
    )

    return NextResponse.json({
      message: `Scan complete. ${createdRenewals.length} new renewal records created.`,
      count: createdRenewals.length,
      total_expiring: expiringLeases.length,
      already_tracked: expiringLeases.length - leasesNeedingRenewal.length,
    })
  } catch (error) {
    console.error('Error scanning for renewals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
