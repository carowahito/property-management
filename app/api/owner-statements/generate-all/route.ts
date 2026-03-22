import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { generateAllStatementsSchema } from '@/lib/validations/owner-statement'
import { Decimal } from '@prisma/client/runtime/library'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { month, year, managementFeeRate } = generateAllStatementsSchema.parse(body)

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    // Get all active landlords
    const landlords = await prisma.landlord.findMany({
      where: { status: 'ACTIVE' },
      include: {
        units: {
          include: {
            property: { select: { id: true, name: true } },
          },
        },
      },
    })

    const results: { created: number; skipped: number; errors: string[] } = {
      created: 0,
      skipped: 0,
      errors: [],
    }

    for (const landlord of landlords) {
      // Group units by property
      const propertiesMap = new Map<string, typeof landlord.units>()
      for (const unit of landlord.units) {
        const propId = unit.propertyId
        if (!propertiesMap.has(propId)) {
          propertiesMap.set(propId, [])
        }
        propertiesMap.get(propId)!.push(unit)
      }

      for (const [propertyId, propertyUnits] of propertiesMap) {
        // Skip if statement already exists
        const existing = await prisma.ownerStatement.findUnique({
          where: {
            landlordId_propertyId_month_year: {
              landlordId: landlord.id,
              propertyId,
              month,
              year,
            },
          },
        })

        if (existing) {
          results.skipped++
          continue
        }

        try {
          const unitIds = propertyUnits.map((u) => u.id)

          // Get active leases
          const leases = await prisma.lease.findMany({
            where: {
              unitId: { in: unitIds },
              status: { in: ['ACTIVE', 'EXPIRED'] },
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
            include: {
              tenant: { select: { id: true, name: true } },
              unitRef: { select: { id: true, unitNumber: true } },
            },
          })

          let rentDue = new Decimal(0)
          const incomeLineItems: any[] = []

          for (const lease of leases) {
            rentDue = rentDue.plus(lease.monthlyRent)
            incomeLineItems.push({
              description: `Rent - ${lease.unitRef?.unitNumber || 'Unit'} (${lease.tenant.name})`,
              amount: Number(lease.monthlyRent),
              type: 'income',
              category: 'rent_due',
            })
          }

          // Get payments
          const leaseIds = leases.map((l) => l.id)
          let rentReceived = new Decimal(0)

          if (leaseIds.length > 0) {
            const payments = await prisma.payment.findMany({
              where: {
                leaseId: { in: leaseIds },
                status: 'PAID',
                type: 'RENT',
                paidDate: { gte: startDate, lte: endDate },
              },
            })
            for (const p of payments) {
              rentReceived = rentReceived.plus(p.amount)
            }
          }

          // Calculate management fee
          const mgmtFee = rentReceived.times(managementFeeRate).dividedBy(100)

          // Get maintenance costs
          let maintenanceCosts = new Decimal(0)
          const deductionLineItems: any[] = []

          const workOrders = await prisma.workOrder.findMany({
            where: {
              lease: { unitId: { in: unitIds } },
              status: 'COMPLETED',
              completedDate: { gte: startDate, lte: endDate },
              actualCost: { not: null },
            },
            include: {
              lease: {
                select: { unitRef: { select: { unitNumber: true } } },
              },
            },
          })

          for (const wo of workOrders) {
            const cost = wo.actualCost || wo.cost || new Decimal(0)
            maintenanceCosts = maintenanceCosts.plus(cost)
            deductionLineItems.push({
              description: `Maintenance - ${wo.title} (${wo.lease?.unitRef?.unitNumber || 'Unit'})`,
              amount: Number(cost),
              type: 'deduction',
              category: 'maintenance',
            })
          }

          deductionLineItems.unshift({
            description: `Management Fee (${managementFeeRate}% of rent received)`,
            amount: Number(mgmtFee),
            type: 'deduction',
            category: 'management_fee',
          })

          // Get deposits held
          const deposits = await prisma.deposit.findMany({
            where: { propertyId, status: 'HELD' },
          })
          let depositsHeld = new Decimal(0)
          for (const d of deposits) {
            depositsHeld = depositsHeld.plus(d.amount)
          }

          const netDisbursement = rentReceived.minus(mgmtFee).minus(maintenanceCosts)

          await prisma.ownerStatement.create({
            data: {
              landlordId: landlord.id,
              propertyId,
              month,
              year,
              rentDue,
              rentReceived,
              managementFee: mgmtFee,
              managementFeeRate,
              maintenanceCosts,
              otherDeductions: 0,
              netDisbursement,
              depositsHeld,
              lineItems: [...incomeLineItems, ...deductionLineItems],
              status: 'DRAFT',
            },
          })

          results.created++
        } catch (err: any) {
          results.errors.push(
            `Failed for landlord ${landlord.name} / property ${propertyUnits[0]?.property?.name}: ${err.message}`
          )
        }
      }
    }

    return NextResponse.json({
      message: `Generated ${results.created} statements, skipped ${results.skipped} existing`,
      ...results,
    })
  } catch (error: any) {
    console.error('Error generating all statements:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
