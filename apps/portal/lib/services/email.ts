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

const tochiIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="145 75 1210 1350" style="height:40px;width:auto;display:block;flex-shrink:0;"><path fill="#e8960c" d="M 1253.820312 663.828125 C 1209.265625 708.382812 1154.863281 739.253906 1095.15625 754.324219 L 1095.15625 1080.085938 C 1095.15625 1172.246094 1059.222656 1258.882812 994.050781 1324.027344 C 928.875 1389.203125 842.210938 1425.082031 750.054688 1425.082031 C 657.894531 1425.082031 571.261719 1389.203125 506.085938 1324.027344 C 440.910156 1258.855469 405.007812 1172.246094 405.007812 1080.085938 L 405.007812 359.390625 L 1034.199219 359.390625 C 1067.820312 359.390625 1095.074219 386.425781 1095.074219 420.046875 C 1095.074219 453.667969 1067.820312 480.707031 1034.199219 480.707031 L 527.304688 480.707031 L 527.304688 1080.085938 C 527.304688 1203.390625 627.320312 1303.65625 750.707031 1303.328125 C 874.09375 1302.976562 972.859375 1201.324219 972.859375 1077.9375 L 972.859375 765.152344 L 810.742188 765.152344 L 810.742188 1100.378906 C 810.742188 1134 783.703125 1161.257812 750.082031 1161.257812 C 716.460938 1161.257812 689.421875 1134 689.421875 1100.378906 L 689.421875 642.855469 L 1009.855469 642.855469 C 1133.15625 642.855469 1233.421875 542.34375 1233.09375 418.960938 C 1232.742188 295.574219 1131.089844 196.34375 1007.703125 196.34375 L 490.335938 196.34375 C 367.058594 196.34375 267.558594 296.582031 267.558594 419.859375 L 267.558594 682.894531 C 259.96875 676.828125 253.304688 670.492188 246.613281 663.828125 C 181.4375 598.679688 145.316406 512.042969 145.316406 419.886719 C 145.316406 327.726562 181.195312 241.117188 246.367188 175.972656 C 311.515625 110.824219 398.152344 75 490.308594 75 L 1009.828125 75 C 1101.984375 75 1188.621094 110.824219 1253.769531 175.972656 C 1318.941406 241.144531 1354.820312 327.699219 1354.820312 419.859375 C 1354.820312 512.015625 1318.96875 598.652344 1253.820312 663.828125 Z"/></svg>`

const emailHeader = (title: string) => `
  <div style="background:#1A3A5C; border-bottom:4px solid #E8960C; padding:20px 32px; display:flex; align-items:center; gap:14px;">
    ${tochiIconSvg}
    <div>
      <div style="font-family:'Montserrat',Arial,sans-serif; font-weight:700; font-size:20px; color:white; letter-spacing:1px;">TOCHI PROPERTY</div>
      <div style="font-size:11px; color:rgba(255,255,255,0.7); margin-top:2px; font-style:italic;">Your Property. Our Pride.</div>
    </div>
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
