/**
 * Email Service using SendGrid
 */

interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  from?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'false') {
    console.warn('Email notifications disabled. Email not sent.')
    return false
  }

  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.startsWith('your-')) {
    console.warn('SendGrid API key not configured. Email not sent.')
    return false
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: Array.isArray(options.to)
              ? options.to.map((email) => ({ email }))
              : [{ email: options.to }],
          },
        ],
        from: {
          email: options.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
        },
        subject: options.subject,
        content: [
          {
            type: options.html ? 'text/html' : 'text/plain',
            value: options.html || options.text || '',
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('SendGrid error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

// Email Templates

export async function sendRentReminder(params: {
  tenantName: string
  tenantEmail: string
  amount: number
  dueDate: string
  propertyName: string
}) {
  const subject = `Rent Payment Reminder - ${params.propertyName}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Rent Payment Reminder</h2>
      <p>Dear ${params.tenantName},</p>
      <p>This is a friendly reminder that your rent payment is due.</p>

      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Property:</strong> ${params.propertyName}</p>
        <p><strong>Amount Due:</strong> KES ${params.amount.toLocaleString()}</p>
        <p><strong>Due Date:</strong> ${params.dueDate}</p>
      </div>

      <p>Please ensure timely payment to avoid late fees.</p>

      <p>If you have any questions, please don't hesitate to contact us.</p>

      <p>Best regards,<br>Property Management Team</p>
    </div>
  `

  return sendEmail({
    to: params.tenantEmail,
    subject,
    html,
  })
}

export async function sendLeaseRenewalOffer(params: {
  tenantName: string
  tenantEmail: string
  propertyName: string
  unit: string
  currentRent: number
  newRent: number
  expiryDate: string
  responseDeadline: string
}) {
  const subject = `Lease Renewal Offer - ${params.propertyName}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Lease Renewal Offer</h2>
      <p>Dear ${params.tenantName},</p>
      <p>Your current lease is expiring on <strong>${params.expiryDate}</strong>. We would like to offer you a lease renewal.</p>

      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Property:</strong> ${params.propertyName}, ${params.unit}</p>
        <p><strong>Current Rent:</strong> KES ${params.currentRent.toLocaleString()}</p>
        <p><strong>New Rent:</strong> KES ${params.newRent.toLocaleString()}</p>
        <p><strong>Term:</strong> 12 months</p>
      </div>

      <p>Please let us know your decision by <strong>${params.responseDeadline}</strong>.</p>

      <p>We value you as a tenant and look forward to continuing our relationship.</p>

      <p>Best regards,<br>Property Management Team</p>
    </div>
  `

  return sendEmail({
    to: params.tenantEmail,
    subject,
    html,
  })
}

export async function sendMaintenanceUpdate(params: {
  tenantName: string
  tenantEmail: string
  requestId: string
  status: string
  message: string
}) {
  const subject = `Maintenance Request Update #${params.requestId}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Maintenance Request Update</h2>
      <p>Dear ${params.tenantName},</p>
      <p>Your maintenance request <strong>#${params.requestId}</strong> has been updated.</p>

      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Status:</strong> ${params.status}</p>
        <p><strong>Update:</strong> ${params.message}</p>
      </div>

      <p>Thank you for your patience.</p>

      <p>Best regards,<br>Property Management Team</p>
    </div>
  `

  return sendEmail({
    to: params.tenantEmail,
    subject,
    html,
  })
}

export async function sendLandlordPayout(params: {
  landlordName: string
  landlordEmail: string
  amount: number
  period: string
  reference: string
}) {
  const subject = `Payout Processed - ${params.period}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Payout Confirmation</h2>
      <p>Dear ${params.landlordName},</p>
      <p>Your payout has been processed successfully.</p>

      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Period:</strong> ${params.period}</p>
        <p><strong>Amount:</strong> KES ${params.amount.toLocaleString()}</p>
        <p><strong>Reference:</strong> ${params.reference}</p>
      </div>

      <p>The funds should appear in your account within 1-2 business days.</p>

      <p>Best regards,<br>Property Management Team</p>
    </div>
  `

  return sendEmail({
    to: params.landlordEmail,
    subject,
    html,
  })
}
