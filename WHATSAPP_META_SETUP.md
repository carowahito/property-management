# WhatsApp Meta Cloud API Setup Guide (Direct Integration)

## 🎯 Why Use Meta Cloud API Directly?

### **Pros:**
- ✅ **No middleman fees** - Pay Meta directly, no Twilio markup
- ✅ **Official API** - Direct from Meta/Facebook/WhatsApp
- ✅ **Lower costs** - Cheaper per message in most regions
- ✅ **Full control** - Access to all WhatsApp Business features
- ✅ **Better reliability** - No third-party dependency

### **Cons:**
- ⚠️ **More complex setup** - Requires Meta Business verification
- ⚠️ **Longer approval time** - 1-2 weeks for business verification
- ⚠️ **More technical** - Need to handle webhooks, tokens, etc.
- ⚠️ **No sandbox** - Must verify business to test

### **When to Use:**
- 📊 **High volume** - Sending 1000+ messages/month
- 💰 **Cost-sensitive** - Every cent matters
- 🏢 **Enterprise** - Want full control and customization
- 🌍 **Global** - Operating in multiple countries

---

## 📋 Prerequisites

Before starting, ensure you have:

1. ✅ **Verified Business** - Legal business with registration documents
2. ✅ **Facebook Account** - Personal account (will become admin)
3. ✅ **Facebook Business Manager** - Created and verified
4. ✅ **WhatsApp Business Account** - Active business phone number
5. ✅ **Domain** - For webhook URL (required for production)

---

## 🚀 Step-by-Step Setup

### **Step 1: Create Meta Developer Account** (5 minutes)

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click **Get Started**
3. Complete account setup
4. Verify your email

### **Step 2: Create Facebook Business Manager** (10 minutes)

1. Go to [business.facebook.com](https://business.facebook.com)
2. Click **Create Account**
3. Fill in business details:
   - Business name
   - Your name
   - Business email
4. Complete setup wizard

### **Step 3: Create App in Meta Developer Console** (5 minutes)

1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps)
2. Click **Create App**
3. Select **Business** as app type
4. Fill in app details:
   - Display name: "Property Management System"
   - App contact email: your-email@company.com
   - Business Manager: Select your business
5. Click **Create App**

### **Step 4: Add WhatsApp Product** (5 minutes)

1. In your app dashboard, find **WhatsApp** product
2. Click **Set Up**
3. Select your Business Manager account
4. Create or link WhatsApp Business Account
5. You'll see **Getting Started** page with temporary access token

### **Step 5: Get Phone Number** (10 minutes)

#### **Option A: Use Existing Business Number**

1. In WhatsApp Settings → Phone Numbers
2. Click **Add Phone Number**
3. Enter your business number
4. Verify via SMS/Voice call
5. ⚠️ **Warning:** Number will be removed from any existing WhatsApp account

#### **Option B: Get Test Number (Recommended for Testing)**

1. Meta provides a test number automatically
2. Number format: `+1 555 XXX XXXX`
3. Can send messages to 5 pre-registered numbers
4. Free for testing

### **Step 6: Get Phone Number ID** (2 minutes)

1. In WhatsApp Settings → Phone Numbers
2. Find your number in the list
3. Copy **Phone Number ID** (looks like: `123456789012345`)
4. Save this - you'll need it for `.env` file

### **Step 7: Generate Permanent Access Token** (5 minutes)

The temporary token expires in 24 hours. Create a permanent one:

1. In left sidebar, click **Settings** → **Basic**
2. Copy **App ID** and **App Secret**
3. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer)
4. Select your app
5. Click **Generate Access Token**
6. Select permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
7. Copy the generated token
8. ⚠️ **Important:** This token expires. For permanent token, use System User (see below)

#### **Create System User (Recommended for Production)**

1. In Business Manager → **Business Settings**
2. Click **Users** → **System Users**
3. Click **Add** → Create system user
4. Give permissions: **WhatsApp**
5. Click **Generate New Token**
6. Select assets:
   - WhatsApp Business Account
   - Your app
7. Select permissions: `whatsapp_business_messaging`, `whatsapp_business_management`
8. Copy **Permanent Token** ✅
9. Save securely - this won't be shown again

### **Step 8: Configure Environment Variables** (2 minutes)

Add to `.env`:

```env
# WhatsApp Meta Cloud API
META_WHATSAPP_PHONE_NUMBER_ID="123456789012345"
META_WHATSAPP_ACCESS_TOKEN="EAAxxxxxxxxxxxxxxxxxxxxxxx"
WHATSAPP_PROVIDER="meta"
```

### **Step 9: Test the Integration** (5 minutes)

```bash
npm run dev
```

Send a test message:

```typescript
import { sendWhatsAppMeta } from '@/lib/services/whatsapp-meta'

// Test phone number must be added to whitelist first
await sendWhatsAppMeta({
  to: '254712345678', // Your phone (no +)
  message: 'Hello from Property Management System! 🏠'
})
```

#### **Add Test Recipient Numbers:**

1. In WhatsApp Settings → **Phone Numbers**
2. Click **To** field under your number
3. Click **Add phone number**
4. Enter phone number to whitelist
5. Send verification code to that number
6. Enter code to verify

### **Step 10: Create Message Templates** (30 minutes)

For production, you need approved templates for first messages.

1. In WhatsApp Manager → **Message Templates**
2. Click **Create Template**

#### **Example: Rent Reminder Template**

```
Template Name: rent_reminder
Category: Utility
Language: English

Message:
Hi {{1}},

Your rent payment of KES {{2}} is due on {{3}}.

Property: {{4}}

Please pay on time to avoid late fees.

- Property Management Team
```

3. Click **Submit**
4. Wait for approval (usually 24-48 hours)
5. You'll receive email notification

### **Step 11: Set Up Webhooks** (15 minutes)

To receive messages from users, set up webhooks:

1. **Create Webhook Endpoint** in your app:

```typescript
// app/api/webhooks/whatsapp-meta/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Webhook verification
  const mode = request.nextUrl.searchParams.get('hub.mode')
  const token = request.nextUrl.searchParams.get('hub.verify_token')
  const challenge = request.nextUrl.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge)
  }

  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Process incoming message
  if (body.object === 'whatsapp_business_account') {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages') {
          const message = change.value.messages?.[0]
          if (message) {
            console.log('Received message:', message)
            // Process message, create ticket, auto-reply, etc.
          }
        }
      }
    }
  }

  return NextResponse.json({ status: 'ok' })
}
```

2. **Deploy your app** (webhooks need public URL)

3. **Configure Webhook in Meta:**
   - In WhatsApp Settings → **Configuration**
   - Click **Edit** next to Webhook
   - Callback URL: `https://yourdomain.com/api/webhooks/whatsapp-meta`
   - Verify token: Create random string, add to `.env` as `META_WEBHOOK_VERIFY_TOKEN`
   - Click **Verify and Save**

4. **Subscribe to Webhook Fields:**
   - Check: `messages`
   - Check: `message_status`
   - Click **Subscribe**

---

## 💡 Using Approved Templates

Once templates are approved, use them:

```typescript
import { sendWhatsAppMetaTemplate } from '@/lib/services/whatsapp-meta'

await sendWhatsAppMetaTemplate({
  to: '254712345678',
  templateName: 'rent_reminder',
  components: [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: 'John Smith' },      // {{1}}
        { type: 'text', text: '50,000' },          // {{2}}
        { type: 'text', text: '01/12/2024' },      // {{3}}
        { type: 'text', text: 'Sunset Apartments' }, // {{4}}
      ],
    },
  ],
})
```

---

## 📊 Cost Comparison

### **Meta Cloud API vs Twilio**

| Region | Meta Cloud API | Twilio | Savings |
|--------|---------------|--------|---------|
| Kenya (Business-initiated) | $0.0142 | $0.02-0.04 | 29-65% |
| Kenya (User-initiated) | $0.0047 | $0.005 | 6% |
| US (Business-initiated) | $0.0125 | $0.02-0.04 | 38-69% |
| US (User-initiated) | $0.0025 | $0.005 | 50% |

**Example: 1000 messages/month in Kenya:**
- Meta Cloud API: ~$14
- Twilio: ~$20-40
- **Savings: $6-26/month** (or $72-312/year)

For high volume (10,000+ messages), savings can be **hundreds or thousands of dollars**.

---

## 🔐 Security Best Practices

### **1. Protect Access Token**
```env
# Never commit to git
# Use environment variables only
META_WHATSAPP_ACCESS_TOKEN="secret-token"
```

### **2. Verify Webhook Signatures**

```typescript
import crypto from 'crypto'

function verifyWebhookSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha256', process.env.META_APP_SECRET!)
    .update(body)
    .digest('hex')

  return `sha256=${hash}` === signature
}
```

### **3. Rate Limiting**
- Meta allows 80 messages/second per phone number
- Implement queue for bulk sending

### **4. Token Rotation**
- Rotate system user tokens every 60 days
- Set up monitoring for token expiry

---

## 🎯 Production Checklist

Before going live:

- [ ] Business verified in Facebook Business Manager
- [ ] WhatsApp Business Account verified
- [ ] Phone number verified and active
- [ ] Permanent access token generated (system user)
- [ ] All message templates approved
- [ ] Webhooks configured and tested
- [ ] Error handling implemented
- [ ] Rate limiting in place
- [ ] Monitoring and logging set up
- [ ] Backup phone number ready
- [ ] Team trained on Meta Business Suite

---

## 🐛 Troubleshooting

### **Error: "Invalid OAuth access token"**

**Solution:**
1. Check token hasn't expired
2. Regenerate token using system user
3. Verify token has correct permissions

### **Error: "Phone number not registered"**

**Solution:**
1. Verify phone number in Meta Business Manager
2. Check number is approved for messaging
3. Try different number format (remove +, spaces)

### **Error: "Template not found"**

**Solution:**
1. Check template is approved (green checkmark)
2. Verify template name spelling
3. Ensure language code matches template

### **Messages not sending**

**Solution:**
1. Check Meta API Dashboard for errors
2. Verify recipient number is valid
3. Check you're not rate limited (80/sec)
4. Verify Business Account has active status

### **Webhooks not working**

**Solution:**
1. Verify callback URL is publicly accessible (not localhost)
2. Check verify token matches
3. Look at webhook logs in Meta dashboard
4. Test with Meta's Webhook Tester tool

---

## 📚 Additional Resources

- [Meta Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Message Templates Guide](https://developers.facebook.com/docs/whatsapp/message-templates)
- [Webhook Setup Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Rate Limits & Throttling](https://developers.facebook.com/docs/whatsapp/cloud-api/rate-limits)
- [Business Verification](https://www.facebook.com/business/help/2058515294227817)

---

## 🆚 Twilio vs Meta: Which Should You Choose?

### **Choose Twilio if:**
- ✅ You need to start immediately (5-minute setup)
- ✅ You're prototyping/testing
- ✅ Low message volume (<1000/month)
- ✅ You want simpler integration
- ✅ You use other Twilio services (SMS, Voice)
- ✅ You need sandbox environment

### **Choose Meta Cloud API if:**
- ✅ High message volume (1000+ messages/month)
- ✅ Cost is a major concern
- ✅ You have technical resources
- ✅ Your business is already verified
- ✅ You want full control
- ✅ Long-term production use

### **Best Approach:**
1. **Start with Twilio** - Get up and running quickly
2. **Test your use case** - Validate messaging works
3. **Switch to Meta** - Once you need scale/lower costs

Our system supports **both**, so you can start with Twilio and migrate to Meta later **without changing any code**!

Just update `.env`:
```env
WHATSAPP_PROVIDER="meta"  # Switch from "twilio" to "meta"
```

---

## 🎉 You're Ready!

Once setup is complete, you can send WhatsApp messages directly through Meta's infrastructure with:

- ✅ **Lower costs** than Twilio
- ✅ **Official API** from Meta
- ✅ **Full control** over features
- ✅ **Same templates** as Twilio version

**Happy messaging! 💚**

For support, check [Meta's Developer Community](https://developers.facebook.com/community/) or your Business Manager support.
