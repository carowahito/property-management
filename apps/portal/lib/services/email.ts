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
          email: options.from || process.env.SENDGRID_FROM_EMAIL || 'info@tochiproperty.com',
          name: 'Tochi Property',
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

// ── Shared brand HTML blocks ─────────────────────────────────────────────────

const emailHeader = (title: string) => `
  <div style="background:#1A3A5C; border-bottom:4px solid #E8960C; padding:20px 32px;">
    <div style="font-family:'Montserrat',Arial,sans-serif; font-weight:700; font-size:20px; color:white; letter-spacing:1px;">TOCHI PROPERTY</div>
    <div style="font-size:11px; color:rgba(255,255,255,0.7); margin-top:2px; font-style:italic;">Your Property. Our Pride.</div>
  </div>
  <div style="padding:28px 32px 0;">
    <h2 style="font-family:'Montserrat',Arial,sans-serif; font-size:18px; font-weight:700; color:#1A3A5C; margin:0 0 16px;">${title}</h2>`

const emailFooter = `
  </div>
  <div style="margin:32px 32px 0; padding:16px 0; border-top:2px solid #E8960C; display:flex; justify-content:space-between; align-items:center;">
    <div style="font-size:11px; color:#6b7280;">
      <strong style="color:#1A3A5C; font-family:'Montserrat',Arial,sans-serif;">Tochi Property</strong><br>
      tochiproperty.com · info@tochiproperty.com
    </div>
    <div style="font-size:10px; color:#8B5A00; font-style:italic;">Your Property. Our Pride.</div>
  </div>
  <div style="height:16px; background:#1A3A5C; margin-top:16px;"></div>`

const infoBox = (content: string) =>
  `<div style="background:#EEF2F7; border-left:4px solid #E8960C; padding:16px 20px; border-radius:4px; margin:16px 0;">${content}</div>`

const bodyText = (text: string) =>
  `<p style="font-family:'Open Sans',Arial,sans-serif; font-size:14px; color:#374151; line-height:1.6; margin:8px 0;">${text}</p>`

// ── Email Templates ──────────────────────────────────────────────────────────

export async function sendRentReminder(params: {
  tenantName: string
  tenantEmail: string
  amount: number
  dueDate: string
  propertyName: string
}) {
  const subject = `Rent Payment Reminder — ${params.propertyName}`

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#f4f6f8; font-family:'Open Sans',Arial,sans-serif;">
  <div style="max-width:600px; margin:24px auto; background:white; border-radius:6px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    ${emailHeader('Rent Payment Reminder')}
    ${bodyText(`Dear ${params.tenantName},`)}
    ${bodyText('This is a friendly reminder that your rent payment is due. Please arrange payment at your earliest convenience to avoid any late fees.')}
    ${infoBox(`
      <p style="margin:0 0 8px; font-family:'Montserrat',Arial,sans-serif; font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:0.8px;">Payment Details</p>
      <p style="margin:4px 0; font-size:14px; color:#1A3A5C;"><strong>Property:</strong> ${params.propertyName}</p>
      <p style="margin:4px 0; font-size:14px; color:#1A3A5C;"><strong>Amount Due:</strong> KES ${params.amount.toLocaleString()}</p>
      <p style="margin:4px 0; font-size:14px; color:#1A3A5C;"><strong>Due Date:</strong> ${params.dueDate}</p>
    `)}
    ${bodyText('If you have already made this payment, please disregard this reminder. Contact us with any questions.')}
    ${bodyText('Thank you for your continued tenancy.')}
    ${emailFooter}
  </div>
</body>
</html>`

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
  const subject = `Lease Renewal Offer — ${params.propertyName}`

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#f4f6f8; font-family:'Open Sans',Arial,sans-serif;">
  <div style="max-width:600px; margin:24px auto; background:white; border-radius:6px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    ${emailHeader('Lease Renewal Offer')}
    ${bodyText(`Dear ${params.tenantName},`)}
    ${bodyText(`Your current lease expires on <strong>${params.expiryDate}</strong>. We would love to have you stay — here are the terms for renewal.`)}
    ${infoBox(`
      <p style="margin:0 0 8px; font-family:'Montserrat',Arial,sans-serif; font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:0.8px;">Renewal Terms</p>
      <p style="margin:4px 0; font-size:14px; color:#1A3A5C;"><strong>Property:</strong> ${params.propertyName}, ${params.unit}</p>
      <p style="margin:4px 0; font-size:14px; color:#1A3A5C;"><strong>Current Rent:</strong> KES ${params.currentRent.toLocaleString()}</p>
      <p style="margin:4px 0; font-size:14px; color:#1A3A5C;"><strong>New Rent:</strong> KES ${params.newRent.toLocaleString()}</p>
      <p style="margin:4px 0; font-size:14px; color:#1A3A5C;"><strong>Term:</strong> 12 months</p>
    `)}
    ${bodyText(`Please let us know your decision by <strong>${params.responseDeadline}</strong>. We value you as a tenant and look forward to continuing our relationship.`)}
    ${emailFooter}
  </div>
</body>
</html>`

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
  const subject = `Maintenance Update #${params.requestId}`

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#f4f6f8; font-family:'Open Sans',Arial,sans-serif;">
  <div style="max-width:600px; margin:24px auto; background:white; border-radius:6px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    ${emailHeader('Maintenance Request Update')}
    ${bodyText(`Dear ${params.tenantName},`)}
    ${bodyText(`Your maintenance request <strong>#${params.requestId}</strong> has been updated.`)}
    ${infoBox(`
      <p style="margin:0 0 8px; font-family:'Montserrat',Arial,sans-serif; font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:0.8px;">Request Update</p>
      <p style="margin:4px 0; font-size:14px; color:#1A3A5C;"><strong>Status:</strong> ${params.status}</p>
      <p style="margin:4px 0; font-size:14px; color:#1A3A5C;"><strong>Update:</strong> ${params.message}</p>
    `)}
    ${bodyText('Thank you for your patience. Contact us if you have any questions.')}
    ${emailFooter}
  </div>
</body>
</html>`

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
  const subject = `Payout Processed — ${params.period}`

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#f4f6f8; font-family:'Open Sans',Arial,sans-serif;">
  <div style="max-width:600px; margin:24px auto; background:white; border-radius:6px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    ${emailHeader('Payout Confirmation')}
    ${bodyText(`Dear ${params.landlordName},`)}
    ${bodyText('Your payout has been processed. The funds should appear in your account within 1–2 business days.')}
    ${infoBox(`
      <p style="margin:0 0 8px; font-family:'Montserrat',Arial,sans-serif; font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:0.8px;">Payout Details</p>
      <p style="margin:4px 0; font-size:14px; color:#1A3A5C;"><strong>Period:</strong> ${params.period}</p>
      <p style="margin:4px 0; font-size:20px; color:#2A6B3C; font-family:'Courier New',monospace; font-weight:700;">KES ${params.amount.toLocaleString()}</p>
      <p style="margin:4px 0; font-size:14px; color:#1A3A5C;"><strong>Reference:</strong> ${params.reference}</p>
    `)}
    ${bodyText('Contact us if you have any questions about this payout. We appreciate your trust in Tochi Property.')}
    ${emailFooter}
  </div>
</body>
</html>`

  return sendEmail({
    to: params.landlordEmail,
    subject,
    html,
  })
}
