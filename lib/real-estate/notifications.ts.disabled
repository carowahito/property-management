/**
 * Real Estate Notification and Reminder Service
 *
 * This service handles:
 * - Rent payment reminders
 * - Lease renewal notifications
 * - Maintenance request updates
 * - Payment receipts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface NotificationChannel {
  email: boolean
  sms: boolean
  push: boolean
}

export interface RentReminderData {
  renterName: string
  renterEmail: string
  renterPhone: string
  propertyName: string
  propertyAddress: string
  amountDue: number
  dueDate: Date
  lateFee?: number
  paymentNumber: string
  leaseNumber: string
}

export interface LeaseRenewalNotificationData {
  landlordName: string
  landlordEmail: string
  renterName: string
  renterEmail: string
  propertyName: string
  leaseEndDate: Date
  monthlyRent: number
  leaseNumber: string
}

export interface MaintenanceUpdateData {
  renterName: string
  renterEmail: string
  ticketNumber: string
  propertyName: string
  status: string
  resolution?: string
}

export interface PaymentReceiptData {
  renterName: string
  renterEmail: string
  paymentNumber: string
  amount: number
  paymentDate: Date
  paymentMethod: string
  propertyName: string
  periodStart: Date
  periodEnd: Date
  transactionId?: string
}

/**
 * Send rent payment reminder
 */
export async function sendRentReminder(
  paymentId: string,
  channels: NotificationChannel = { email: true, sms: false, push: false }
): Promise<boolean> {
  // TODO: Implement once Prisma schema is updated with rentPayment model
  console.warn('sendRentReminder not yet implemented - Prisma schema needs rentPayment model')
  return false
  /*
  const payment = await prisma.rentPayment.findUnique({
    where: { id: paymentId },
    include: {
      lease: {
        include: {
          property: true,
          renter: true,
        },
      },
    },
  })

  if (!payment) {
    throw new Error('Payment not found')
  }

  const reminderData: RentReminderData = {
    renterName: `${payment.lease.renter.firstName} ${payment.lease.renter.lastName}`,
    renterEmail: payment.lease.renter.email,
    renterPhone: payment.lease.renter.phone,
    propertyName: payment.lease.property.name,
    propertyAddress: payment.lease.property.address,
    amountDue: payment.amount + payment.lateFee,
    dueDate: payment.dueDate,
    lateFee: payment.lateFee > 0 ? payment.lateFee : undefined,
    paymentNumber: payment.paymentNumber,
    leaseNumber: payment.lease.leaseNumber,
  }

  // Send via configured channels
  if (channels.email) {
    await sendRentReminderEmail(reminderData)
  }

  if (channels.sms) {
    await sendRentReminderSMS(reminderData)
  }

  if (channels.push) {
    await sendRentReminderPush(reminderData)
  }

  // Mark reminder as sent
  await prisma.rentPayment.update({
    where: { id: paymentId },
    data: {
      reminderSent: true,
      reminderSentAt: new Date(),
    },
  })

  return true
  */
}

/**
 * Send payment receipt
 */
export async function sendPaymentReceipt(
  paymentId: string,
  channels: NotificationChannel = { email: true, sms: false, push: false }
): Promise<boolean> {
  const payment = await prisma.rentPayment.findUnique({
    where: { id: paymentId },
    include: {
      lease: {
        include: {
          property: true,
          renter: true,
        },
      },
    },
  })

  if (!payment || payment.status !== 'PAID') {
    throw new Error('Payment not found or not paid')
  }

  const receiptData: PaymentReceiptData = {
    renterName: `${payment.lease.renter.firstName} ${payment.lease.renter.lastName}`,
    renterEmail: payment.lease.renter.email,
    paymentNumber: payment.paymentNumber,
    amount: payment.totalPaid,
    paymentDate: payment.paidDate!,
    paymentMethod: payment.paymentMethod || 'Unknown',
    propertyName: payment.lease.property.name,
    periodStart: payment.periodStart,
    periodEnd: payment.periodEnd,
    transactionId: payment.transactionId || undefined,
  }

  // Send via configured channels
  if (channels.email) {
    await sendPaymentReceiptEmail(receiptData)
  }

  if (channels.sms) {
    await sendPaymentReceiptSMS(receiptData)
  }

  // Mark receipt as sent
  await prisma.rentPayment.update({
    where: { id: paymentId },
    data: {
      receiptSent: true,
    },
  })

  return true
}

/**
 * Send lease renewal notifications
 */
export async function sendLeaseRenewalNotifications(
  tenantId: string,
  daysBeforeExpiry: number = 30
): Promise<number> {
  const today = new Date()
  const notificationDate = new Date()
  notificationDate.setDate(notificationDate.getDate() + daysBeforeExpiry)

  // Find leases expiring soon
  const expiringLeases = await prisma.lease.findMany({
    where: {
      tenantId,
      status: 'ACTIVE',
      endDate: {
        gte: today,
        lte: notificationDate,
      },
    },
    include: {
      property: {
        include: {
          landlord: true,
        },
      },
      renter: true,
    },
  })

  let notificationsSent = 0

  for (const lease of expiringLeases) {
    if (!lease.endDate) continue

    const notificationData: LeaseRenewalNotificationData = {
      landlordName: lease.property.landlord
        ? lease.property.landlord.type === 'COMPANY'
          ? lease.property.landlord.companyName!
          : `${lease.property.landlord.firstName} ${lease.property.landlord.lastName}`
        : 'Property Owner',
      landlordEmail: lease.property.landlord?.email || '',
      renterName: `${lease.renter.firstName} ${lease.renter.lastName}`,
      renterEmail: lease.renter.email,
      propertyName: lease.property.name,
      leaseEndDate: lease.endDate,
      monthlyRent: lease.monthlyRent,
      leaseNumber: lease.leaseNumber,
    }

    // Send to renter
    await sendLeaseRenewalEmailToRenter(notificationData)

    // Send to landlord
    if (lease.property.landlord) {
      await sendLeaseRenewalEmailToLandlord(notificationData)
    }

    notificationsSent++
  }

  return notificationsSent
}

/**
 * Send maintenance status update
 */
export async function sendMaintenanceUpdate(
  ticketId: string,
  channels: NotificationChannel = { email: true, sms: false, push: false }
): Promise<boolean> {
  const ticket = await prisma.propertyMaintenance.findUnique({
    where: { id: ticketId },
    include: {
      property: true,
      renter: true,
    },
  })

  if (!ticket || !ticket.renter) {
    throw new Error('Ticket not found or no renter associated')
  }

  const updateData: MaintenanceUpdateData = {
    renterName: `${ticket.renter.firstName} ${ticket.renter.lastName}`,
    renterEmail: ticket.renter.email,
    ticketNumber: ticket.ticketNumber,
    propertyName: ticket.property.name,
    status: ticket.status,
    resolution: ticket.resolution || undefined,
  }

  // Send via configured channels
  if (channels.email) {
    await sendMaintenanceUpdateEmail(updateData)
  }

  if (channels.sms) {
    await sendMaintenanceUpdateSMS(updateData)
  }

  return true
}

// ============================================
// Email Sending Functions (Templates)
// ============================================

async function sendRentReminderEmail(data: RentReminderData): Promise<void> {
  const subject = data.lateFee
    ? `OVERDUE: Rent Payment Reminder - ${data.propertyName}`
    : `Rent Payment Reminder - ${data.propertyName}`

  const body = `
    Dear ${data.renterName},

    This is a ${data.lateFee ? 'OVERDUE payment' : 'friendly'} reminder that your rent payment is ${data.lateFee ? 'overdue' : 'due'}.

    Payment Details:
    - Property: ${data.propertyName}
    - Address: ${data.propertyAddress}
    - Payment Number: ${data.paymentNumber}
    - Amount Due: KES ${data.amountDue.toLocaleString()}
    ${data.lateFee ? `- Late Fee: KES ${data.lateFee.toLocaleString()}` : ''}
    - Due Date: ${data.dueDate.toLocaleDateString()}

    Please make your payment at your earliest convenience to avoid additional late fees.

    Payment Methods:
    - M-Pesa: [Paybill/Till Number]
    - Bank Transfer: [Bank Details]
    - Online Portal: [Payment Link]

    If you have already made this payment, please disregard this notice.

    Best regards,
    Property Management Team
  `

  // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  console.log(`[EMAIL] To: ${data.renterEmail}`)
  console.log(`[EMAIL] Subject: ${subject}`)
  console.log(`[EMAIL] Body: ${body}`)
}

async function sendPaymentReceiptEmail(data: PaymentReceiptData): Promise<void> {
  const subject = `Payment Receipt - ${data.paymentNumber}`

  const body = `
    Dear ${data.renterName},

    Thank you for your payment! This email confirms that we have received your rent payment.

    Receipt Details:
    - Receipt Number: ${data.paymentNumber}
    - Property: ${data.propertyName}
    - Amount Paid: KES ${data.amount.toLocaleString()}
    - Payment Date: ${data.paymentDate.toLocaleDateString()}
    - Payment Method: ${data.paymentMethod}
    ${data.transactionId ? `- Transaction ID: ${data.transactionId}` : ''}
    - Period: ${data.periodStart.toLocaleDateString()} - ${data.periodEnd.toLocaleDateString()}

    This receipt serves as proof of payment. Please keep it for your records.

    Best regards,
    Property Management Team
  `

  // TODO: Integrate with email service
  console.log(`[EMAIL] To: ${data.renterEmail}`)
  console.log(`[EMAIL] Subject: ${subject}`)
  console.log(`[EMAIL] Body: ${body}`)
}

async function sendLeaseRenewalEmailToRenter(
  data: LeaseRenewalNotificationData
): Promise<void> {
  const subject = `Lease Renewal Reminder - ${data.propertyName}`

  const body = `
    Dear ${data.renterName},

    Your lease for ${data.propertyName} is approaching its end date.

    Lease Details:
    - Lease Number: ${data.leaseNumber}
    - End Date: ${data.leaseEndDate.toLocaleDateString()}
    - Current Monthly Rent: KES ${data.monthlyRent.toLocaleString()}

    If you wish to renew your lease, please contact us at your earliest convenience to discuss renewal terms.

    If you do not plan to renew, please ensure you provide proper notice as per your lease agreement.

    Best regards,
    Property Management Team
  `

  // TODO: Integrate with email service
  console.log(`[EMAIL] To: ${data.renterEmail}`)
  console.log(`[EMAIL] Subject: ${subject}`)
  console.log(`[EMAIL] Body: ${body}`)
}

async function sendLeaseRenewalEmailToLandlord(
  data: LeaseRenewalNotificationData
): Promise<void> {
  const subject = `Lease Expiring Soon - ${data.propertyName}`

  const body = `
    Dear ${data.landlordName},

    This is to notify you that a lease for your property is expiring soon.

    Property: ${data.propertyName}
    Tenant: ${data.renterName}
    Lease End Date: ${data.leaseEndDate.toLocaleDateString()}
    Current Monthly Rent: KES ${data.monthlyRent.toLocaleString()}

    Please let us know if you would like to offer a renewal to the current tenant or if you have other plans for the property.

    Best regards,
    Property Management Team
  `

  // TODO: Integrate with email service
  console.log(`[EMAIL] To: ${data.landlordEmail}`)
  console.log(`[EMAIL] Subject: ${subject}`)
  console.log(`[EMAIL] Body: ${body}`)
}

async function sendMaintenanceUpdateEmail(data: MaintenanceUpdateData): Promise<void> {
  const subject = `Maintenance Request Update - ${data.ticketNumber}`

  const body = `
    Dear ${data.renterName},

    Your maintenance request has been updated.

    Ticket Details:
    - Ticket Number: ${data.ticketNumber}
    - Property: ${data.propertyName}
    - Status: ${data.status}
    ${data.resolution ? `- Resolution: ${data.resolution}` : ''}

    ${data.status === 'COMPLETED' ? 'Thank you for your patience. The issue has been resolved.' : 'We will keep you updated on the progress.'}

    Best regards,
    Property Management Team
  `

  // TODO: Integrate with email service
  console.log(`[EMAIL] To: ${data.renterEmail}`)
  console.log(`[EMAIL] Subject: ${subject}`)
  console.log(`[EMAIL] Body: ${body}`)
}

// ============================================
// SMS Sending Functions
// ============================================

async function sendRentReminderSMS(data: RentReminderData): Promise<void> {
  const message = `Rent Reminder: Your rent of KES ${data.amountDue.toLocaleString()} for ${
    data.propertyName
  } is ${data.lateFee ? 'OVERDUE' : `due on ${data.dueDate.toLocaleDateString()}`}. Payment #${
    data.paymentNumber
  }`

  // TODO: Integrate with SMS service (Twilio, Africa's Talking, etc.)
  console.log(`[SMS] To: ${data.renterPhone}`)
  console.log(`[SMS] Message: ${message}`)
}

async function sendPaymentReceiptSMS(data: PaymentReceiptData): Promise<void> {
  const message = `Payment Received: KES ${data.amount.toLocaleString()} for ${
    data.propertyName
  }. Receipt #${data.paymentNumber}. Thank you!`

  // TODO: Integrate with SMS service
  console.log(`[SMS] To: (renter phone)`)
  console.log(`[SMS] Message: ${message}`)
}

async function sendMaintenanceUpdateSMS(data: MaintenanceUpdateData): Promise<void> {
  const message = `Maintenance Update: Ticket ${data.ticketNumber} status is now ${data.status}. ${
    data.resolution ? `Resolution: ${data.resolution}` : ''
  }`

  // TODO: Integrate with SMS service
  console.log(`[SMS] To: (renter phone)`)
  console.log(`[SMS] Message: ${message}`)
}

// ============================================
// Push Notification Functions
// ============================================

async function sendRentReminderPush(data: RentReminderData): Promise<void> {
  // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
  console.log(`[PUSH] Rent Reminder to ${data.renterName}`)
}

/**
 * Batch send reminders for all payments requiring reminders
 */
export async function sendBatchRentReminders(
  tenantId: string,
  daysBeforeDue: number[] = [7, 3, 1],
  daysAfterDue: number[] = [1, 3, 7]
): Promise<number> {
  const today = new Date()
  let remindersSent = 0

  // Get all pending payments
  const payments = await prisma.rentPayment.findMany({
    where: {
      tenantId,
      status: {
        in: ['PENDING', 'PARTIAL', 'OVERDUE'],
      },
    },
  })

  for (const payment of payments) {
    const dueDate = new Date(payment.dueDate)
    const daysDifference = Math.floor(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Check if we should send a reminder
    const shouldSend =
      (daysDifference >= 0 && daysBeforeDue.includes(daysDifference)) ||
      (daysDifference < 0 && daysAfterDue.includes(Math.abs(daysDifference)))

    if (shouldSend && !payment.reminderSent) {
      await sendRentReminder(payment.id)
      remindersSent++
    }
  }

  return remindersSent
}
