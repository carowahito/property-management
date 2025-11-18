# WhatsApp Business API Integration Guide

This guide will help you set up WhatsApp messaging for the Property Management System using Twilio's WhatsApp Business API.

## Why WhatsApp?

WhatsApp is the preferred communication channel in many markets, especially in Kenya and Africa:
- ✅ **Higher engagement rates** (98% open rate vs 20% for email)
- ✅ **Rich media support** (images, PDFs, location sharing)
- ✅ **Two-way communication** (customers can reply)
- ✅ **Read receipts and delivery confirmation**
- ✅ **Cost-effective** compared to SMS
- ✅ **Built-in formatting** (bold, italic, lists)

## Setup Options

### Option 1: Twilio Sandbox (Quick Start - Development Only)

The Twilio Sandbox is perfect for testing. It's free and takes 5 minutes to set up.

#### Steps:

1. **Sign up for Twilio**
   - Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
   - Create a free account

2. **Enable WhatsApp Sandbox**
   - Login to Twilio Console
   - Navigate to: **Messaging** → **Try it out** → **Send a WhatsApp message**
   - You'll see a sandbox number like: `+1 415 523 8886`
   - Follow the instructions to join the sandbox from your WhatsApp

3. **Get Your Credentials**
   - **Account SID**: Found on your Twilio Dashboard
   - **Auth Token**: Also on the Dashboard (click to reveal)
   - **WhatsApp Number**: `whatsapp:+14155238886` (or your sandbox number)

4. **Add to `.env` file**
   ```env
   TWILIO_ACCOUNT_SID="AC1234567890abcdef..."
   TWILIO_AUTH_TOKEN="your-auth-token-here"
   TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
   ENABLE_WHATSAPP_NOTIFICATIONS=true
   ```

5. **Test the Integration**
   ```bash
   npm run dev
   ```

   Send a test message from the admin portal Communications page.

#### Sandbox Limitations:
- ⚠️ Only works for numbers that have joined the sandbox (send "join <code>" to the sandbox number)
- ⚠️ Messages have "Sandbox:" prefix
- ⚠️ Not suitable for production
- ⚠️ Limited to 100 messages per day

---

### Option 2: Production WhatsApp Business API (Recommended for Production)

For production use, you need an approved WhatsApp Business Account.

#### Steps:

1. **Apply for WhatsApp Business API Access**
   - Go to Twilio Console → Messaging → WhatsApp → Get Started
   - Click "Request Access"
   - Provide business details:
     - Business name
     - Business website
     - Business category
     - Facebook Business Manager ID

2. **Facebook Business Verification**
   - Create a Facebook Business Manager account if you don't have one
   - Verify your business with Facebook (may take 1-2 weeks)
   - Link your WhatsApp Business Account

3. **Get Your WhatsApp Number**
   - Options:
     - **Use existing business number** (recommended)
     - **Get a new number from Twilio**
   - Number will be verified via SMS/voice call

4. **Create Message Templates**

   WhatsApp requires pre-approved templates for initial messages. Create templates in Twilio Console:

   **Example Rent Reminder Template:**
   ```
   Name: rent_reminder
   Category: Account Update

   Message:
   Hi {{1}},

   Your rent payment of KES {{2}} is due on {{3}}.

   Please pay on time to avoid late fees.

   - Property Management Team
   ```

   **Example Lease Renewal Template:**
   ```
   Name: lease_renewal_offer
   Category: Marketing

   Message:
   Hi {{1}},

   Your lease expires on {{2}}. We'd like to offer renewal:
   - New Rent: KES {{3}}
   - Term: 12 months

   Reply by {{4}} to accept.

   - Property Management Team
   ```

5. **Wait for Template Approval**
   - Templates are usually approved within 24-48 hours
   - You'll receive email notification when approved

6. **Update Environment Variables**
   ```env
   TWILIO_ACCOUNT_SID="AC1234567890abcdef..."
   TWILIO_AUTH_TOKEN="your-auth-token-here"
   TWILIO_WHATSAPP_NUMBER="whatsapp:+254712345678"  # Your approved number
   ENABLE_WHATSAPP_NOTIFICATIONS=true
   ```

7. **Update Code to Use Templates**

   For production, you need to use approved templates for the first message:

   ```typescript
   // Example: Using template
   await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/x-www-form-urlencoded',
       Authorization: `Basic ${auth}`,
     },
     body: new URLSearchParams({
       To: 'whatsapp:+254712345678',
       From: 'whatsapp:+254700000000',
       Body: '', // Leave empty when using template
       ContentSid: 'HX1234...', // Template SID from Twilio
       ContentVariables: JSON.stringify({
         1: 'John Doe',
         2: '50,000',
         3: '01/12/2024',
       }),
     }),
   })
   ```

---

## Usage Examples

### 1. Send Rent Reminder

```typescript
import { sendRentReminderWhatsApp } from '@/lib/services/whatsapp'

await sendRentReminderWhatsApp({
  phone: '+254712345678',
  tenantName: 'John Smith',
  amount: 50000,
  dueDate: '01/12/2024',
  propertyName: 'Sunset Apartments',
})
```

### 2. Send Lease Renewal Offer

```typescript
import { sendLeaseRenewalWhatsApp } from '@/lib/services/whatsapp'

await sendLeaseRenewalWhatsApp({
  phone: '+254712345678',
  tenantName: 'Sarah Johnson',
  propertyName: 'Vista Plaza',
  unit: 'Unit 3B',
  currentRent: 45000,
  newRent: 47000,
  expiryDate: '31/01/2025',
  responseDeadline: '15/12/2024',
})
```

### 3. Send Maintenance Update

```typescript
import { sendMaintenanceUpdateWhatsApp } from '@/lib/services/whatsapp'

await sendMaintenanceUpdateWhatsApp({
  phone: '+254712345678',
  tenantName: 'John Smith',
  requestId: 'MR-789',
  status: 'IN_PROGRESS',
  message: 'Technician dispatched. Will arrive today between 2-4 PM.',
  estimatedCompletion: 'Today, 4:00 PM',
})
```

### 4. Send Payment Confirmation

```typescript
import { sendPaymentConfirmationWhatsApp } from '@/lib/services/whatsapp'

await sendPaymentConfirmationWhatsApp({
  phone: '+254712345678',
  tenantName: 'John Smith',
  amount: 50000,
  reference: 'MPESA-REF-123456',
  date: '01/12/2024',
  type: 'Rent Payment',
})
```

### 5. Send Property Listing with Image

```typescript
import { sendPropertyListingWhatsApp } from '@/lib/services/whatsapp'

await sendPropertyListingWhatsApp({
  phone: '+254712345678',
  visitorName: 'Sarah Mitchell',
  propertyName: 'Sunset Apartments - 2BR',
  rent: 55000,
  bedrooms: 2,
  bathrooms: 2,
  imageUrl: 'https://yourserver.com/images/property1.jpg',
  viewingLink: 'https://yoursite.com/schedule-viewing/123',
})
```

### 6. Broadcast to Multiple Recipients

```typescript
import { broadcastWhatsAppMessage } from '@/lib/services/whatsapp'

const recipients = ['+254712345678', '+254723456789', '+254734567890']

const message = `🏠 *Community Update*

Dear Residents,

Water supply will be interrupted tomorrow from 9 AM to 2 PM for maintenance.

Please store enough water.

Sorry for the inconvenience.

- Management`

const { sent, failed } = await broadcastWhatsAppMessage(recipients, message)
console.log(`Sent: ${sent}, Failed: ${failed}`)
```

---

## WhatsApp Formatting

WhatsApp supports rich text formatting:

```
*Bold text*
_Italic text_
~Strikethrough~
```Code```

• Bullet point
1. Numbered list

--- (Horizontal line - use sparingly)
```

**Example with formatting:**
```typescript
const message = `*Payment Received* ✅

Hi *John*,

Your payment has been received:
• Amount: *KES 50,000*
• Reference: _MPESA-123456_
• Date: 01/12/2024

Thank you! 🙏`
```

---

## Best Practices

### 1. **Message Timing**
- Send during business hours (8 AM - 8 PM)
- Don't send late at night
- Respect time zones

### 2. **Message Frequency**
- Don't spam users
- Implement rate limiting
- Allow users to opt-out

### 3. **Message Content**
- Keep messages concise
- Use emojis sparingly (but they help!)
- Include clear call-to-action
- Always identify your business

### 4. **Two-Way Communication**
- Monitor incoming messages
- Respond promptly (within 24 hours)
- Set up auto-replies for common questions

### 5. **Compliance**
- Get user consent before sending messages
- Provide opt-out option
- Respect WhatsApp's commerce policies
- Follow GDPR/local data protection laws

---

## Handling Incoming Messages (Webhooks)

To receive messages from users, set up a webhook:

### 1. Create Webhook Endpoint

```typescript
// app/api/webhooks/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.formData()

  const from = body.get('From') // Sender's WhatsApp number
  const message = body.get('Body') // Message content
  const messageId = body.get('MessageSid')

  // Process the message
  console.log(`Received from ${from}: ${message}`)

  // Auto-reply based on keywords
  if (message?.toString().toLowerCase().includes('maintenance')) {
    // Create maintenance request
    // Send confirmation
  }

  if (message?.toString().toLowerCase() === 'accept') {
    // Process lease renewal acceptance
  }

  return NextResponse.json({ success: true })
}
```

### 2. Configure Webhook in Twilio

1. Go to Twilio Console → Messaging → Settings → WhatsApp Sandbox Settings
2. Set "WHEN A MESSAGE COMES IN" to: `https://yourdomain.com/api/webhooks/whatsapp`
3. Set method to `POST`
4. Save

### 3. Test Incoming Messages

Send a message to your WhatsApp number:
```
MAINTENANCE: Leaking faucet in kitchen
```

Your system will receive and process it automatically.

---

## Pricing

### Twilio WhatsApp Pricing (As of 2024)

**Conversation-based pricing:**
- **User-initiated**: $0.005 per conversation
- **Business-initiated**: $0.01 - $0.04 per conversation (varies by country)
- **Conversation**: 24-hour window from first message

**Example costs for Kenya:**
- Rent reminder to 100 tenants: ~$2-4
- Much cheaper than SMS ($0.05-0.10 each)

**Free tier:**
- Twilio gives $15 credit on signup
- Enough for ~1,500 WhatsApp conversations

---

## Troubleshooting

### Error: "Sandbox number not joined"
**Solution:** Send "join <your-code>" to the sandbox number from your WhatsApp

### Error: "Authentication failed"
**Solution:** Check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in `.env`

### Error: "Template not approved"
**Solution:** Use sandbox for testing, or wait for template approval

### Messages not sending
**Solution:**
1. Check Twilio logs in Console → Monitor → Logs → Messaging
2. Verify phone number format: `+254712345678` (no spaces)
3. Check that ENABLE_WHATSAPP_NOTIFICATIONS=true

### "Failed to send message"
**Solution:**
1. Verify credentials are correct
2. Check Twilio account balance
3. Ensure recipient number is valid
4. Check Twilio error logs

---

## Alternative: Meta Cloud API (Direct)

If you prefer to use Meta's official WhatsApp Business API directly (without Twilio):

### Setup:
1. Create Meta Developer Account
2. Create a Business App
3. Add WhatsApp product
4. Get Access Token
5. Verify your business

### Implementation:
```typescript
async function sendWhatsAppMeta(params: { to: string; message: string }) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: params.to,
        type: 'text',
        text: { body: params.message },
      }),
    }
  )

  return response.ok
}
```

**Pros:**
- No middleman fees
- Direct integration with Meta

**Cons:**
- More complex setup
- Requires business verification
- Less developer-friendly

---

## Resources

- [Twilio WhatsApp Quickstart](https://www.twilio.com/docs/whatsapp/quickstart)
- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)
- [Twilio Pricing](https://www.twilio.com/whatsapp/pricing)

---

## Next Steps

1. ✅ **Set up Twilio account** (5 minutes)
2. ✅ **Test with sandbox** (5 minutes)
3. ✅ **Send your first message** (1 minute)
4. 📝 **Apply for production access** (when ready)
5. 📋 **Create message templates** (30 minutes)
6. 🚀 **Go live!**

---

**Happy messaging! 💚**

For support, check the Twilio Console or contact support@yourcompany.com
