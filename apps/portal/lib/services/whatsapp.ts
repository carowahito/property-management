/**
 * WhatsApp Service using Twilio WhatsApp Business API
 *
 * Setup Instructions:
 * 1. Sign up for Twilio (https://twilio.com)
 * 2. Activate WhatsApp in your Twilio Console
 * 3. Connect your WhatsApp Business Account or use Twilio Sandbox
 * 4. Add credentials to .env file
 */

interface WhatsAppOptions {
  to: string // Must be in format: whatsapp:+1234567890
  message: string
  mediaUrl?: string // Optional image, PDF, or other media
}

export async function sendWhatsApp(options: WhatsAppOptions): Promise<boolean> {
  if (process.env.ENABLE_WHATSAPP_NOTIFICATIONS === 'false') {
    console.warn('WhatsApp notifications disabled. Message not sent.')
    return false
  }

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_ACCOUNT_SID.startsWith('your-')) {
    console.warn('Twilio credentials not configured. WhatsApp message not sent.')
    return false
  }

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886' // Twilio Sandbox

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

    const body: any = {
      To: options.to.startsWith('whatsapp:') ? options.to : `whatsapp:${options.to}`,
      From: fromNumber,
      Body: options.message,
    }

    if (options.mediaUrl) {
      body.MediaUrl = options.mediaUrl
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${auth}`,
        },
        body: new URLSearchParams(body),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Twilio WhatsApp error:', error)
      return false
    }

    const result = await response.json()
    console.log('WhatsApp message sent:', result.sid)
    return true
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return false
  }
}

// WhatsApp Templates with Rich Formatting

export async function sendRentReminderWhatsApp(params: {
  phone: string
  tenantName: string
  amount: number
  dueDate: string
  propertyName: string
}) {
  const message = `🏠 *Rent Payment Reminder*

Hi ${params.tenantName},

This is a friendly reminder that your rent payment is due.

📋 *Property:* ${params.propertyName}
💰 *Amount Due:* KES ${params.amount.toLocaleString()}
📅 *Due Date:* ${params.dueDate}

Please ensure timely payment to avoid late fees.

If you have any questions, reply to this message.

_Property Management Team_`

  return sendWhatsApp({
    to: params.phone,
    message,
  })
}

export async function sendLeaseRenewalWhatsApp(params: {
  phone: string
  tenantName: string
  propertyName: string
  unit: string
  currentRent: number
  newRent: number
  expiryDate: string
  responseDeadline: string
}) {
  const increase = params.newRent - params.currentRent
  const percentIncrease = ((increase / params.currentRent) * 100).toFixed(1)

  const message = `📝 *Lease Renewal Offer*

Hi ${params.tenantName},

Your lease is expiring on *${params.expiryDate}*. We'd like to offer you a renewal.

🏢 *Property:* ${params.propertyName}, ${params.unit}
💵 *Current Rent:* KES ${params.currentRent.toLocaleString()}
💰 *New Rent:* KES ${params.newRent.toLocaleString()} _(+${percentIncrease}%)_
⏰ *Term:* 12 months

Please let us know by *${params.responseDeadline}*.

Reply with:
✅ *ACCEPT* - to renew
ℹ️ *MORE INFO* - for questions
❌ *DECLINE* - if not renewing

We value you as a tenant! 🙏

_Property Management Team_`

  return sendWhatsApp({
    to: params.phone,
    message,
  })
}

export async function sendMaintenanceUpdateWhatsApp(params: {
  phone: string
  tenantName: string
  requestId: string
  status: string
  message: string
  estimatedCompletion?: string
}) {
  const statusEmoji = {
    PENDING: '⏳',
    IN_PROGRESS: '🔧',
    COMPLETED: '✅',
    CANCELLED: '❌',
  }[status] || '📋'

  const message = `${statusEmoji} *Maintenance Request Update*

Hi ${params.tenantName},

Your request *#${params.requestId}* has been updated.

*Status:* ${status}
*Update:* ${params.message}
${params.estimatedCompletion ? `*Estimated Completion:* ${params.estimatedCompletion}` : ''}

You can track your request in the tenant portal.

_Property Management Team_`

  return sendWhatsApp({
    to: params.phone,
    message,
  })
}

export async function sendPaymentConfirmationWhatsApp(params: {
  phone: string
  tenantName: string
  amount: number
  reference: string
  date: string
  type: string
}) {
  const message = `✅ *Payment Received*

Hi ${params.tenantName},

We've received your payment. Thank you!

💰 *Amount:* KES ${params.amount.toLocaleString()}
📋 *Type:* ${params.type}
🔖 *Reference:* ${params.reference}
📅 *Date:* ${params.date}

Your account has been updated.

_Property Management Team_`

  return sendWhatsApp({
    to: params.phone,
    message,
  })
}

export async function sendLandlordPayoutWhatsApp(params: {
  phone: string
  landlordName: string
  amount: number
  period: string
  reference: string
  propertyName: string
}) {
  const message = `💸 *Payout Processed*

Hi ${params.landlordName},

Your payout has been processed successfully.

🏢 *Property:* ${params.propertyName}
📅 *Period:* ${params.period}
💰 *Amount:* KES ${params.amount.toLocaleString()}
🔖 *Reference:* ${params.reference}

Funds will arrive in 1-2 business days.

_Property Management Team_`

  return sendWhatsApp({
    to: params.phone,
    message,
  })
}

export async function sendViewingReminderWhatsApp(params: {
  phone: string
  visitorName: string
  propertyName: string
  address: string
  date: string
  time: string
  agentName: string
  agentPhone: string
}) {
  const message = `👁️ *Property Viewing Reminder*

Hi ${params.visitorName},

Reminder of your upcoming property viewing:

🏠 *Property:* ${params.propertyName}
📍 *Address:* ${params.address}
📅 *Date:* ${params.date}
⏰ *Time:* ${params.time}

👤 *Agent:* ${params.agentName}
📞 *Contact:* ${params.agentPhone}

See you there! Reply if you need to reschedule.

_Property Management Team_`

  return sendWhatsApp({
    to: params.phone,
    message,
  })
}

export async function sendMaintenanceScheduledWhatsApp(params: {
  phone: string
  tenantName: string
  requestId: string
  issue: string
  scheduledDate: string
  scheduledTime: string
  vendorName: string
}) {
  const message = `🔧 *Maintenance Scheduled*

Hi ${params.tenantName},

We've scheduled your maintenance request.

📋 *Request:* #${params.requestId}
🛠️ *Issue:* ${params.issue}
📅 *Date:* ${params.scheduledDate}
⏰ *Time:* ${params.scheduledTime}
👷 *Technician:* ${params.vendorName}

Please ensure someone is available to provide access.

_Property Management Team_`

  return sendWhatsApp({
    to: params.phone,
    message,
  })
}

export async function sendWelcomeMessageWhatsApp(params: {
  phone: string
  tenantName: string
  propertyName: string
  unit: string
  moveInDate: string
}) {
  const message = `🎉 *Welcome to Your New Home!*

Hi ${params.tenantName},

Welcome to ${params.propertyName}!

🏠 *Your Unit:* ${params.unit}
📅 *Move-in Date:* ${params.moveInDate}

*Quick Links:*
• Tenant Portal: [link]
• Emergency Contact: [phone]
• Submit Maintenance Request: Reply with "MAINTENANCE"

We're here to help! Feel free to reach out anytime.

_Property Management Team_`

  return sendWhatsApp({
    to: params.phone,
    message,
  })
}

export async function sendLatePaymentNoticeWhatsApp(params: {
  phone: string
  tenantName: string
  amount: number
  daysPastDue: number
  lateFee: number
  totalDue: number
}) {
  const message = `⚠️ *Late Payment Notice*

Hi ${params.tenantName},

Your rent payment is ${params.daysPastDue} day(s) overdue.

💰 *Original Amount:* KES ${params.amount.toLocaleString()}
⚠️ *Late Fee:* KES ${params.lateFee.toLocaleString()}
📊 *Total Due:* KES ${params.totalDue.toLocaleString()}

Please pay immediately to avoid further penalties.

*Payment Methods:*
• M-Pesa: [paybill]
• Bank Transfer: [account]
• Tenant Portal: [link]

_Property Management Team_`

  return sendWhatsApp({
    to: params.phone,
    message,
  })
}

// Interactive WhatsApp with Media
export async function sendPropertyListingWhatsApp(params: {
  phone: string
  visitorName: string
  propertyName: string
  rent: number
  bedrooms: number
  bathrooms: number
  imageUrl: string
  viewingLink: string
}) {
  const message = `🏘️ *Property Available*

Hi ${params.visitorName},

Check out this great property:

*${params.propertyName}*
💰 KES ${params.rent.toLocaleString()}/month
🛏️ ${params.bedrooms} Bedrooms
🚿 ${params.bathrooms} Bathrooms

Schedule a viewing: ${params.viewingLink}

Reply with *MORE INFO* for details.

_Property Management Team_`

  return sendWhatsApp({
    to: params.phone,
    message,
    mediaUrl: params.imageUrl, // Property image
  })
}

// Broadcast message to multiple recipients
export async function broadcastWhatsAppMessage(
  recipients: string[],
  message: string,
  mediaUrl?: string
): Promise<{ sent: number; failed: number }> {
  const results = await Promise.allSettled(
    recipients.map((phone) =>
      sendWhatsApp({
        to: phone,
        message,
        mediaUrl,
      })
    )
  )

  const sent = results.filter((r) => r.status === 'fulfilled' && r.value).length
  const failed = results.length - sent

  return { sent, failed }
}
