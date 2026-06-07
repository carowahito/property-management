/**
 * SMS Service using Twilio
 */

interface SMSOptions {
  to: string
  message: string
}

export async function sendSMS(options: SMSOptions): Promise<boolean> {
  if (process.env.ENABLE_SMS_NOTIFICATIONS === 'false') {
    console.warn('SMS notifications disabled. SMS not sent.')
    return false
  }

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_ACCOUNT_SID.startsWith('your-')) {
    console.warn('Twilio credentials not configured. SMS not sent.')
    return false
  }

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${auth}`,
        },
        body: new URLSearchParams({
          To: options.to,
          From: fromNumber || '',
          Body: options.message,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Twilio error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending SMS:', error)
    return false
  }
}

// SMS Templates (Keep messages under 160 characters when possible)

export async function sendRentReminderSMS(params: {
  phone: string
  tenantName: string
  amount: number
  dueDate: string
}) {
  const message = `Hi ${params.tenantName}, rent payment of KES ${params.amount.toLocaleString()} is due on ${params.dueDate}. Please pay on time to avoid late fees. - PropManage`

  return sendSMS({
    to: params.phone,
    message,
  })
}

export async function sendMaintenanceUpdateSMS(params: {
  phone: string
  requestId: string
  status: string
}) {
  const message = `Maintenance request #${params.requestId} is now ${status}. Check your email for details. - PropManage`

  return sendSMS({
    to: params.phone,
    message,
  })
}

export async function sendPaymentConfirmationSMS(params: {
  phone: string
  amount: number
  reference: string
}) {
  const message = `Payment of KES ${params.amount.toLocaleString()} received. Ref: ${params.reference}. Thank you! - PropManage`

  return sendSMS({
    to: params.phone,
    message,
  })
}

export async function sendViewingReminderSMS(params: {
  phone: string
  propertyName: string
  date: string
  time: string
}) {
  const message = `Reminder: Property viewing at ${params.propertyName} on ${params.date} at ${params.time}. - PropManage`

  return sendSMS({
    to: params.phone,
    message,
  })
}
