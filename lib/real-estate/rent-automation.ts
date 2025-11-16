/**
 * Rent Payment Automation and Recurring Billing Service
 *
 * This service handles:
 * - Automatic generation of monthly rent payment records
 * - Rent payment reconciliation
 * - Late fee calculation
 * - Payment reminders
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface RentPaymentSchedule {
  leaseId: string
  amount: number
  dueDay: number
  startDate: Date
  endDate: Date | null
  lateFeeAmount: number
  lateFeeGraceDays: number
}

export interface PaymentReminderConfig {
  daysBeforeDue: number[]  // e.g., [7, 3, 1] - send reminders 7, 3, and 1 day before due
  daysAfterDue: number[]   // e.g., [1, 3, 7] - send reminders 1, 3, and 7 days after due
}

/**
 * Generate rent payment records for active leases
 * This should be run monthly via a cron job
 */
export async function generateMonthlyRentPayments(tenantId: string): Promise<number> {
  const activeLeases = await prisma.lease.findMany({
    where: {
      tenantId,
      status: 'ACTIVE',
    },
    include: {
      property: true,
      renter: true,
    },
  })

  let generatedCount = 0
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  for (const lease of activeLeases) {
    // Calculate due date for this month
    const dueDate = new Date(currentYear, currentMonth, lease.rentDueDay)

    // Check if payment record already exists for this period
    const existingPayment = await prisma.rentPayment.findFirst({
      where: {
        leaseId: lease.id,
        periodStart: {
          gte: new Date(currentYear, currentMonth, 1),
        },
        periodEnd: {
          lte: new Date(currentYear, currentMonth + 1, 0),
        },
      },
    })

    if (!existingPayment) {
      // Generate payment number
      const paymentNumber = await generatePaymentNumber(tenantId)

      // Create rent payment record
      await prisma.rentPayment.create({
        data: {
          tenantId,
          leaseId: lease.id,
          paymentNumber,
          dueDate,
          amount: lease.monthlyRent,
          lateFee: 0,
          currency: lease.currency,
          status: 'PENDING',
          periodStart: new Date(currentYear, currentMonth, 1),
          periodEnd: new Date(currentYear, currentMonth + 1, 0),
        },
      })

      generatedCount++
    }
  }

  return generatedCount
}

/**
 * Calculate and apply late fees to overdue payments
 */
export async function applyLateFees(tenantId: string): Promise<number> {
  const today = new Date()

  // Find all pending payments past their due date + grace period
  const overduePayments = await prisma.rentPayment.findMany({
    where: {
      tenantId,
      status: {
        in: ['PENDING', 'PARTIAL'],
      },
    },
    include: {
      lease: true,
    },
  })

  let feesApplied = 0

  for (const payment of overduePayments) {
    const dueDate = new Date(payment.dueDate)
    const gracePeriodEnd = new Date(dueDate)
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + payment.lease.lateFeeGraceDays)

    // Check if we're past the grace period and late fee hasn't been applied
    if (today > gracePeriodEnd && payment.lateFee === 0) {
      const lateFeeAmount = payment.lease.lateFeeAmount || 0

      await prisma.rentPayment.update({
        where: { id: payment.id },
        data: {
          lateFee: lateFeeAmount,
          status: 'OVERDUE',
        },
      })

      feesApplied++
    }
  }

  return feesApplied
}

/**
 * Reconcile a rent payment
 */
export async function reconcilePayment(
  paymentId: string,
  reconciledBy: string,
  notes?: string
): Promise<boolean> {
  const payment = await prisma.rentPayment.findUnique({
    where: { id: paymentId },
  })

  if (!payment) {
    throw new Error('Payment not found')
  }

  if (payment.status !== 'PAID') {
    throw new Error('Can only reconcile paid payments')
  }

  await prisma.rentPayment.update({
    where: { id: paymentId },
    data: {
      reconciled: true,
      reconciledBy,
      reconciledAt: new Date(),
      notes: notes || payment.notes,
    },
  })

  return true
}

/**
 * Record a rent payment
 */
export async function recordPayment(
  paymentId: string,
  amount: number,
  paymentMethod: string,
  transactionId?: string
): Promise<void> {
  const payment = await prisma.rentPayment.findUnique({
    where: { id: paymentId },
  })

  if (!payment) {
    throw new Error('Payment not found')
  }

  const totalAmount = payment.amount + payment.lateFee
  const newTotalPaid = payment.totalPaid + amount

  let status: string
  if (newTotalPaid >= totalAmount) {
    status = 'PAID'
  } else if (newTotalPaid > 0) {
    status = 'PARTIAL'
  } else {
    status = 'PENDING'
  }

  await prisma.rentPayment.update({
    where: { id: paymentId },
    data: {
      totalPaid: newTotalPaid,
      paidDate: status === 'PAID' ? new Date() : payment.paidDate,
      paymentMethod,
      transactionId,
      status,
    },
  })
}

/**
 * Get payments requiring reminders
 */
export async function getPaymentsRequiringReminders(
  tenantId: string,
  config: PaymentReminderConfig
): Promise<any[]> {
  const today = new Date()
  const paymentsToRemind: any[] = []

  // Get all pending/partial payments
  const payments = await prisma.rentPayment.findMany({
    where: {
      tenantId,
      status: {
        in: ['PENDING', 'PARTIAL', 'OVERDUE'],
      },
    },
    include: {
      lease: {
        include: {
          property: true,
          renter: true,
        },
      },
    },
  })

  for (const payment of payments) {
    const dueDate = new Date(payment.dueDate)
    const daysDifference = Math.floor(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Check if payment is due soon
    if (daysDifference >= 0 && config.daysBeforeDue.includes(daysDifference)) {
      paymentsToRemind.push({
        ...payment,
        reminderType: 'BEFORE_DUE',
        daysUntilDue: daysDifference,
      })
    }

    // Check if payment is overdue
    if (daysDifference < 0 && config.daysAfterDue.includes(Math.abs(daysDifference))) {
      paymentsToRemind.push({
        ...payment,
        reminderType: 'OVERDUE',
        daysOverdue: Math.abs(daysDifference),
      })
    }
  }

  return paymentsToRemind
}

/**
 * Mark reminder as sent
 */
export async function markReminderSent(paymentId: string): Promise<void> {
  await prisma.rentPayment.update({
    where: { id: paymentId },
    data: {
      reminderSent: true,
      reminderSentAt: new Date(),
    },
  })
}

/**
 * Generate unique payment number
 */
async function generatePaymentNumber(tenantId: string): Promise<string> {
  const count = await prisma.rentPayment.count({
    where: { tenantId },
  })

  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const sequence = String(count + 1).padStart(4, '0')

  return `PAY-${year}${month}-${sequence}`
}

/**
 * Get rent collection summary for a period
 */
export async function getRentCollectionSummary(
  tenantId: string,
  startDate: Date,
  endDate: Date
) {
  const payments = await prisma.rentPayment.findMany({
    where: {
      tenantId,
      dueDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  })

  const summary = {
    totalExpected: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    totalLateFees: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    collectionRate: 0,
  }

  for (const payment of payments) {
    const totalDue = payment.amount + payment.lateFee
    summary.totalExpected += totalDue
    summary.totalCollected += payment.totalPaid
    summary.totalOutstanding += totalDue - payment.totalPaid
    summary.totalLateFees += payment.lateFee

    if (payment.status === 'PAID') {
      summary.paidCount++
    } else if (payment.status === 'OVERDUE') {
      summary.overdueCount++
    } else {
      summary.pendingCount++
    }
  }

  summary.collectionRate =
    summary.totalExpected > 0
      ? (summary.totalCollected / summary.totalExpected) * 100
      : 0

  return summary
}

/**
 * Process landlord payouts
 */
export async function generateLandlordPayouts(
  tenantId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<number> {
  // Get all landlords with properties
  const landlords = await prisma.landlord.findMany({
    where: {
      tenantId,
      status: 'ACTIVE',
    },
    include: {
      properties: {
        include: {
          leases: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              rentPayments: {
                where: {
                  status: 'PAID',
                  reconciled: true,
                  paidDate: {
                    gte: periodStart,
                    lte: periodEnd,
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  let payoutsGenerated = 0

  for (const landlord of landlords) {
    let totalRentCollected = 0

    // Calculate total rent collected for this landlord's properties
    for (const property of landlord.properties) {
      for (const lease of property.leases) {
        for (const payment of lease.rentPayments) {
          totalRentCollected += payment.totalPaid
        }
      }
    }

    if (totalRentCollected > 0) {
      // Calculate management fee (e.g., 10% of rent collected)
      const managementFeeRate = 0.1 // 10% - should be configurable
      const managementFee = totalRentCollected * managementFeeRate
      const payoutAmount = totalRentCollected - managementFee

      // Generate payout number
      const payoutCount = await prisma.landlordPayout.count({
        where: { tenantId },
      })
      const payoutNumber = `PAYOUT-${new Date().getFullYear()}-${String(
        payoutCount + 1
      ).padStart(4, '0')}`

      // Create payout record
      await prisma.landlordPayout.create({
        data: {
          tenantId,
          landlordId: landlord.id,
          payoutNumber,
          amount: payoutAmount,
          currency: 'KES',
          payoutDate: new Date(),
          periodStart,
          periodEnd,
          paymentMethod: landlord.preferredPaymentMethod || 'BANK_TRANSFER',
          status: 'PENDING',
          totalRentCollected,
          managementFee,
        },
      })

      payoutsGenerated++
    }
  }

  return payoutsGenerated
}
