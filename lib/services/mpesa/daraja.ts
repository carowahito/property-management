/**
 * Safaricom Daraja API Client
 *
 * Handles:
 *   - OAuth token generation
 *   - STK Push (Lipa Na M-Pesa Online) — collect rent from tenants
 *   - B2C — pay landlords
 *   - C2B registration — register callback URLs for paybill payments
 *   - Transaction status query
 *
 * Env vars required:
 *   MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET
 *   MPESA_SHORTCODE (paybill number)
 *   MPESA_PASSKEY (for STK Push)
 *   MPESA_B2C_INITIATOR, MPESA_B2C_PASSWORD (for B2C payouts)
 *   MPESA_CALLBACK_BASE_URL (public URL for callbacks)
 *   MPESA_ENV=sandbox|production
 */

const SANDBOX_URL = 'https://sandbox.safaricom.co.ke';
const PRODUCTION_URL = 'https://api.safaricom.co.ke';

function getBaseUrl(): string {
  return process.env.MPESA_ENV === 'production' ? PRODUCTION_URL : SANDBOX_URL;
}

// ── OAuth ─────────────────────────────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const key = process.env.MPESA_CONSUMER_KEY!;
  const secret = process.env.MPESA_CONSUMER_SECRET!;
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');

  const res = await fetch(`${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!res.ok) throw new Error(`Daraja OAuth failed: ${res.status}`);

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (Number(data.expires_in) - 60) * 1000, // refresh 60s early
  };

  return cachedToken.token;
}

// ── STK Push (Collect rent from tenant) ───────────────────────────────────

export interface StkPushRequest {
  phoneNumber: string;       // 2547XXXXXXXX
  amount: number;
  accountReference: string;  // e.g. "GWG2-A55" (unit number)
  description?: string;
}

export interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export async function stkPush(req: StkPushRequest): Promise<StkPushResponse> {
  const token = await getAccessToken();
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const callbackUrl = `${process.env.MPESA_CALLBACK_BASE_URL}/api/mpesa/callback/stk`;

  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, '')
    .slice(0, 14); // YYYYMMDDHHmmss

  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

  const res = await fetch(`${getBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(req.amount),
      PartyA: req.phoneNumber,
      PartyB: shortcode,
      PhoneNumber: req.phoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: req.accountReference,
      TransactionDesc: req.description || `Rent payment for ${req.accountReference}`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`STK Push failed: ${err}`);
  }

  return res.json();
}

// ── B2C (Pay landlord) ────────────────────────────────────────────────────

export interface B2CRequest {
  phoneNumber: string;       // landlord's M-Pesa number
  amount: number;
  remarks?: string;
  occasion?: string;         // e.g. "Rent payout July 2025 - GWG2-A55"
}

export interface B2CResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

export async function b2cPayout(req: B2CRequest): Promise<B2CResponse> {
  const token = await getAccessToken();
  const callbackUrl = `${process.env.MPESA_CALLBACK_BASE_URL}/api/mpesa/callback/b2c`;

  const res = await fetch(`${getBaseUrl()}/mpesa/b2c/v3/paymentrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      OriginatorConversationID: `payout_${Date.now()}`,
      InitiatorName: process.env.MPESA_B2C_INITIATOR,
      SecurityCredential: process.env.MPESA_B2C_PASSWORD,
      CommandID: 'BusinessPayment',
      Amount: Math.round(req.amount),
      PartyA: process.env.MPESA_SHORTCODE,
      PartyB: req.phoneNumber,
      Remarks: req.remarks || 'Rent payout',
      QueueTimeOutURL: `${callbackUrl}/timeout`,
      ResultURL: callbackUrl,
      Occasion: req.occasion || '',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`B2C payout failed: ${err}`);
  }

  return res.json();
}

// ── C2B Registration (Register paybill callback URLs) ─────────────────────

export async function registerC2BUrls(): Promise<void> {
  const token = await getAccessToken();

  const res = await fetch(`${getBaseUrl()}/mpesa/c2b/v1/registerurl`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ShortCode: process.env.MPESA_SHORTCODE,
      ResponseType: 'Completed',
      ConfirmationURL: `${process.env.MPESA_CALLBACK_BASE_URL}/api/mpesa/callback/c2b/confirm`,
      ValidationURL: `${process.env.MPESA_CALLBACK_BASE_URL}/api/mpesa/callback/c2b/validate`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`C2B registration failed: ${err}`);
  }
}

// ── Transaction Status Query ──────────────────────────────────────────────

export async function queryTransactionStatus(mpesaReceiptNumber: string): Promise<any> {
  const token = await getAccessToken();

  const res = await fetch(`${getBaseUrl()}/mpesa/transactionstatus/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Initiator: process.env.MPESA_B2C_INITIATOR,
      SecurityCredential: process.env.MPESA_B2C_PASSWORD,
      CommandID: 'TransactionStatusQuery',
      TransactionID: mpesaReceiptNumber,
      PartA: process.env.MPESA_SHORTCODE,
      IdentifierType: '4',
      ResultURL: `${process.env.MPESA_CALLBACK_BASE_URL}/api/mpesa/callback/status`,
      QueueTimeOutURL: `${process.env.MPESA_CALLBACK_BASE_URL}/api/mpesa/callback/status/timeout`,
      Remarks: 'Status check',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Transaction status query failed: ${err}`);
  }

  return res.json();
}
