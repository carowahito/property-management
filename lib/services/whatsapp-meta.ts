/**
 * WhatsApp Service using Meta Cloud API (Direct Integration)
 *
 * This is a direct integration with Meta's WhatsApp Business API
 * No middleman (Twilio) required - connects directly to Meta/Facebook
 *
 * Setup Instructions:
 * 1. Create Meta Developer Account (https://developers.facebook.com)
 * 2. Create Business App
 * 3. Add WhatsApp product
 * 4. Get Phone Number ID and Access Token
 * 5. Add credentials to .env file
 */

interface WhatsAppMetaOptions {
  to: string // Phone number in format: 254712345678 (no + or spaces)
  message: string
  mediaUrl?: string
  mediaType?: 'image' | 'document' | 'video'
}

interface WhatsAppMetaTemplateOptions {
  to: string
  templateName: string
  languageCode?: string
  components?: Array<{
    type: 'body' | 'header' | 'button'
    parameters: Array<{
      type: 'text' | 'image' | 'document'
      text?: string
      image?: { link: string }
      document?: { link: string; filename: string }
    }>
  }>
}

const META_API_VERSION = 'v18.0'
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`

/**
 * Send a text message via WhatsApp using Meta Cloud API
 */
export async function sendWhatsAppMeta(options: WhatsAppMetaOptions): Promise<boolean> {
  if (!process.env.META_WHATSAPP_PHONE_NUMBER_ID || !process.env.META_WHATSAPP_ACCESS_TOKEN) {
    console.warn('Meta WhatsApp credentials not configured. Message not sent.')
    return false
  }

  try {
    const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN

    // Remove + and spaces from phone number
    const cleanPhone = options.to.replace(/[\s+]/g, '')

    const body: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
    }

    // Text message
    if (!options.mediaUrl) {
      body.type = 'text'
      body.text = { body: options.message }
    }
    // Image message
    else if (options.mediaType === 'image') {
      body.type = 'image'
      body.image = {
        link: options.mediaUrl,
        caption: options.message,
      }
    }
    // Document message
    else if (options.mediaType === 'document') {
      body.type = 'document'
      body.document = {
        link: options.mediaUrl,
        caption: options.message,
        filename: options.mediaUrl.split('/').pop() || 'document.pdf',
      }
    }
    // Video message
    else if (options.mediaType === 'video') {
      body.type = 'video'
      body.video = {
        link: options.mediaUrl,
        caption: options.message,
      }
    }

    const response = await fetch(`${META_API_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Meta WhatsApp error:', error)
      return false
    }

    const result = await response.json()
    console.log('WhatsApp message sent via Meta:', result.messages?.[0]?.id)
    return true
  } catch (error) {
    console.error('Error sending WhatsApp message via Meta:', error)
    return false
  }
}

/**
 * Send a template message (required for first message to user)
 * Templates must be pre-approved in Meta Business Manager
 */
export async function sendWhatsAppMetaTemplate(
  options: WhatsAppMetaTemplateOptions
): Promise<boolean> {
  if (!process.env.META_WHATSAPP_PHONE_NUMBER_ID || !process.env.META_WHATSAPP_ACCESS_TOKEN) {
    console.warn('Meta WhatsApp credentials not configured. Template not sent.')
    return false
  }

  try {
    const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN
    const cleanPhone = options.to.replace(/[\s+]/g, '')

    const body = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: {
        name: options.templateName,
        language: {
          code: options.languageCode || 'en',
        },
        components: options.components || [],
      },
    }

    const response = await fetch(`${META_API_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Meta WhatsApp template error:', error)
      return false
    }

    const result = await response.json()
    console.log('WhatsApp template sent via Meta:', result.messages?.[0]?.id)
    return true
  } catch (error) {
    console.error('Error sending WhatsApp template via Meta:', error)
    return false
  }
}

// Message Templates using Meta Cloud API

export async function sendRentReminderWhatsAppMeta(params: {
  phone: string
  tenantName: string
  amount: number
  dueDate: string
  propertyName: string
}) {
  // For production, use approved template:
  // return sendWhatsAppMetaTemplate({
  //   to: params.phone,
  //   templateName: 'rent_reminder',
  //   components: [{
  //     type: 'body',
  //     parameters: [
  //       { type: 'text', text: params.tenantName },
  //       { type: 'text', text: params.amount.toLocaleString() },
  //       { type: 'text', text: params.dueDate },
  //       { type: 'text', text: params.propertyName },
  //     ],
  //   }],
  // })

  // For testing/sandbox, use direct message:
  const message = `🏠 *Rent Payment Reminder*

Hi ${params.tenantName},

This is a friendly reminder that your rent payment is due.

📋 *Property:* ${params.propertyName}
💰 *Amount Due:* KES ${params.amount.toLocaleString()}
📅 *Due Date:* ${params.dueDate}

Please ensure timely payment to avoid late fees.

_Property Management Team_`

  return sendWhatsAppMeta({
    to: params.phone,
    message,
  })
}

export async function sendLeaseRenewalWhatsAppMeta(params: {
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

  return sendWhatsAppMeta({
    to: params.phone,
    message,
  })
}

export async function sendPaymentConfirmationWhatsAppMeta(params: {
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

  return sendWhatsAppMeta({
    to: params.phone,
    message,
  })
}

export async function sendMaintenanceUpdateWhatsAppMeta(params: {
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

*Status:* ${params.status}
*Update:* ${params.message}
${params.estimatedCompletion ? `*Estimated Completion:* ${params.estimatedCompletion}` : ''}

You can track your request in the tenant portal.

_Property Management Team_`

  return sendWhatsAppMeta({
    to: params.phone,
    message,
  })
}

export async function sendPropertyListingWhatsAppMeta(params: {
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

  return sendWhatsAppMeta({
    to: params.phone,
    message,
    mediaUrl: params.imageUrl,
    mediaType: 'image',
  })
}

export async function sendDocumentWhatsAppMeta(params: {
  phone: string
  recipientName: string
  documentUrl: string
  documentName: string
  caption: string
}) {
  const message = `📄 *Document Shared*

Hi ${params.recipientName},

${params.caption}

Please find the attached document.

_Property Management Team_`

  return sendWhatsAppMeta({
    to: params.phone,
    message,
    mediaUrl: params.documentUrl,
    mediaType: 'document',
  })
}

// Broadcast message to multiple recipients
export async function broadcastWhatsAppMetaMessage(
  recipients: string[],
  message: string,
  mediaUrl?: string,
  mediaType?: 'image' | 'document' | 'video'
): Promise<{ sent: number; failed: number }> {
  const results = await Promise.allSettled(
    recipients.map((phone) =>
      sendWhatsAppMeta({
        to: phone,
        message,
        mediaUrl,
        mediaType,
      })
    )
  )

  const sent = results.filter((r) => r.status === 'fulfilled' && r.value).length
  const failed = results.length - sent

  return { sent, failed }
}

/**
 * Mark message as read (optional - shows blue checkmarks)
 */
export async function markWhatsAppMessageAsRead(messageId: string): Promise<boolean> {
  if (!process.env.META_WHATSAPP_PHONE_NUMBER_ID || !process.env.META_WHATSAPP_ACCESS_TOKEN) {
    return false
  }

  try {
    const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN

    const response = await fetch(`${META_API_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Error marking message as read:', error)
    return false
  }
}
