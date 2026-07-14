import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/services/email'
import { sendPaymentConfirmationWhatsApp } from '@/lib/services/whatsapp'
import { brandHeaderTable } from '@/lib/services/brand'

// ============================================================================
// Receipt service (SOP 004 / BR-9)
// A receipt is auto-generated for every recorded payment, on all methods, and
// is sent to the tenant via email (durable written record) + WhatsApp/SMS.
// No payment reaches an allocated/paid state without a receipt being generated.
// ============================================================================


function fmtDate(d: Date | string | null) {
  if (!d) return '-'
  const dd = new Date(d)
  return `${dd.getDate()} ${['January','February','March','April','May','June','July','August','September','October','November','December'][dd.getMonth()]} ${dd.getFullYear()}`
}

function fmtMoney(n: number | string) {
  return Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function threeDigitsToWords(n: number): string {
  let str = ''
  if (n >= 100) {
    str += `${ONES[Math.floor(n / 100)]} Hundred`
    n %= 100
    if (n > 0) str += ' '
  }
  if (n >= 20) {
    str += TENS[Math.floor(n / 10)]
    if (n % 10 > 0) str += `-${ONES[n % 10]}`
  } else if (n > 0) {
    str += ONES[n]
  }
  return str
}

function numberToWords(num: number): string {
  if (num === 0) return 'Zero'
  const units = ['', 'Thousand', 'Million', 'Billion']
  let unitIndex = 0
  let n = Math.floor(num)
  const words: string[] = []
  while (n > 0) {
    const chunk = n % 1000
    if (chunk > 0) {
      words.unshift(`${threeDigitsToWords(chunk)}${units[unitIndex] ? ` ${units[unitIndex]}` : ''}`)
    }
    n = Math.floor(n / 1000)
    unitIndex++
  }
  return words.join(' ')
}

function amountInWords(amount: number): string {
  const wholePart = Math.floor(amount)
  const cents = Math.round((amount - wholePart) * 100)
  let result = `${numberToWords(wholePart)} Kenyan Shillings`
  if (cents > 0) {
    result += ` and ${numberToWords(cents)} Cents`
  }
  return `${result} Only`
}

function monthRange(d: Date) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return { start, end }
}

const landlordSelect = {
  select: {
    id: true,
    name: true,
    type: true,
    members: { select: { id: true, name: true }, orderBy: { createdAt: 'asc' as const } },
  },
}

function formatLandlord(landlord: { name: string; type: string; members: { name: string }[] } | null | undefined): string {
  if (!landlord) return 'Tochi Property (Managing Agent on behalf of Owner)'
  if (landlord.type === 'JOINT_OWNERSHIP' && landlord.members?.length) {
    return `${landlord.name} & ${landlord.members.map(m => m.name).join(' & ')}`
  }
  return landlord.name
}

export type PaymentWithRelations = Awaited<ReturnType<typeof fetchPayment>>

export async function fetchPayment(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      tenant: { select: { id: true, name: true, email: true, phone: true, idNumber: true } },
      lease: {
        select: {
          id: true,
          monthlyRent: true,
          startDate: true,
          endDate: true,
          property: { select: { id: true, name: true, address: true, landlord: landlordSelect } },
          unitRef: { select: { id: true, unitNumber: true, landlord: landlordSelect } },
        },
      },
      property: { select: { id: true, name: true, address: true, landlord: landlordSelect } },
      unit: { select: { id: true, unitNumber: true, landlord: landlordSelect } },
      landlord: landlordSelect,
      ledgerEntries: { select: { balance: true } },
    },
  })
}

export function receiptNumberFor(payment: { id: string }): string {
  return `RCP-${payment.id.slice(-8).toUpperCase()}`
}

export function buildReceiptHtml(payment: NonNullable<PaymentWithRelations>, receiptNumber: string): string {
  const propertyAddress = payment.lease?.property?.address || payment.property?.address || '-'
  const propertyName = payment.lease?.property?.name || payment.property?.name || ''
  const unitNumber = payment.lease?.unitRef?.unitNumber || payment.unit?.unitNumber || ''
  const unitLine = [unitNumber ? `Unit ${unitNumber}` : '', propertyName, propertyAddress].filter(Boolean).join(', ')

  const landlord = payment.lease?.unitRef?.landlord
    || payment.lease?.property?.landlord
    || payment.unit?.landlord
    || payment.property?.landlord
    || payment.landlord
  const landlordDisplay = formatLandlord(landlord as any)

  const leaseRef = payment.lease ? `LSE-${payment.lease.id.slice(-6).toUpperCase()}` : 'Pending Lease Signing'

  const methodLabels: Record<string, string> = {
    BANK_TRANSFER: 'Bank Transfer',
    MPESA: 'M-Pesa',
    CASH: 'Cash',
    CHEQUE: 'Cheque',
    CARD: 'Card',
  }
  const methodLabel = methodLabels[payment.method] || payment.method
  const isPaid = payment.status === 'PAID'
  const typeLabels: Record<string, string> = {
    RENT: 'Rent',
    DEPOSIT: 'Deposit',
    LATE_FEE: 'Late Fee',
    UTILITY: 'Utility',
    MAINTENANCE: 'Maintenance',
    OTHER: 'Other',
  }
  const typeLabel = typeLabels[payment.type] || payment.type
  const docTitle = `${typeLabel.toUpperCase()} PAYMENT ${isPaid ? 'RECEIPT' : 'INVOICE'}`

  const amount = Number(payment.amount)
  const { start: periodStart, end: periodEnd } = monthRange(new Date(payment.dueDate))
  const periodLabel = payment.type === 'RENT' ? 'Rent Period Covered' : 'Billing Period'
  const periodText = `${fmtDate(periodStart)} to ${fmtDate(periodEnd)}`

  const ledgerEntry = payment.ledgerEntries?.[0]
  const balanceCarriedForward = ledgerEntry ? Number(ledgerEntry.balance) : null
  const previousBalance = ledgerEntry ? balanceCarriedForward! + amount : null

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
  <title>${docTitle} - ${receiptNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Open Sans', Arial, sans-serif; color: #1a1a1a; font-size: 13px; background: #f4f6f8; }
    .page { max-width: 720px; margin: 24px auto; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.1); padding: 32px; }
    .header-row { display: flex; justify-content: space-between; align-items: center; }
    .brand-block { display: flex; align-items: center; gap: 10px; }
    .brand-title { font-family: 'Montserrat', Arial, sans-serif; font-weight: 700; font-size: 22px; color: #1A3A5C; letter-spacing: 0.5px; }
    .doc-title { font-family: 'Montserrat', Arial, sans-serif; font-weight: 700; font-size: 16px; color: #1A3A5C; text-align: right; }
    .status-badge { display: block; margin-top: 4px; text-align: right; }
    .status-badge span { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-pending { background: #fef9c3; color: #854d0e; }
    .brand-tag { font-size: 11px; color: #6b7280; font-style: italic; margin-top: 4px; }
    .contact-line { font-size: 11px; color: #6b7280; margin-top: 2px; }
    .brand-divider { border: none; border-top: 3px solid #1A3A5C; margin: 14px 0 18px; }
    .meta-row { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: #1A3A5C; margin-bottom: 22px; }
    .section { margin-bottom: 22px; }
    .section-title { font-family: 'Montserrat', Arial, sans-serif; font-size: 12px; font-weight: 700; color: #1A3A5C; text-transform: uppercase; letter-spacing: 0.6px; padding-bottom: 6px; border-bottom: 2px solid #1A3A5C; margin-bottom: 10px; }
    table.kv-table { width: 100%; border-collapse: collapse; border: 1px solid #E5E7EB; }
    table.kv-table tr:not(:last-child) td { border-bottom: 1px solid #E5E7EB; }
    table.kv-table td { padding: 9px 14px; font-size: 13px; vertical-align: top; }
    table.kv-table td.k { width: 34%; background: #F2F4F7; color: #374151; font-weight: 600; }
    table.kv-table td.v { color: #111827; }
    table.summary-table { width: 100%; border-collapse: collapse; border: 1px solid #E5E7EB; }
    table.summary-table thead th { background: #1A3A5C; color: white; text-align: left; padding: 9px 14px; font-size: 12px; font-family: 'Montserrat', Arial, sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
    table.summary-table thead th:last-child { text-align: right; }
    table.summary-table tbody td { padding: 9px 14px; font-size: 13px; border-bottom: 1px solid #E5E7EB; }
    table.summary-table tbody td.amt { text-align: right; font-family: 'Courier New', monospace; }
    table.summary-table tbody tr:last-child td { border-bottom: none; border-top: 2px solid #1A3A5C; font-weight: 700; }
    .notes-text { font-size: 12px; color: #4b5563; line-height: 1.6; }
    .print-btn { display: block; margin: 20px auto 0; padding: 10px 28px; background: #1A3A5C; color: white; border: none; border-radius: 4px; font-size: 13px; font-family: 'Montserrat', Arial, sans-serif; font-weight: 600; cursor: pointer; }
    @media print {
      body { background: white; }
      .page { box-shadow: none; margin: 0; border-radius: 0; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    ${brandHeaderTable(`<div style="font-family:'Montserrat',Arial,sans-serif;font-weight:700;font-size:16px;color:#1A3A5C;">${docTitle}</div><div style="margin-top:4px;"><span style="display:inline-block;padding:2px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:0.5px;background:${isPaid ? '#dcfce7' : '#fef9c3'};color:${isPaid ? '#166534' : '#854d0e'};">${isPaid ? 'PAID' : payment.status}</span></div>`)}
    <table role="presentation" width="100%" style="border-collapse:collapse;margin-bottom:22px;">
      <tr>
        <td style="font-size:13px;font-weight:600;color:#1A3A5C;">Receipt No.: ${receiptNumber}</td>
        <td style="font-size:13px;font-weight:600;color:#1A3A5C;text-align:right;">Date Issued: ${fmtDate(new Date())}</td>
      </tr>
    </table>

    <div class="section">
      <div class="section-title">Tenant &amp; Property Details</div>
      <table class="kv-table">
        <tr><td class="k">Tenant Name</td><td class="v">${payment.tenant.name}</td></tr>
        <tr><td class="k">Property Address</td><td class="v">${unitLine || '-'}</td></tr>
        <tr><td class="k">Landlord / Owner</td><td class="v">${landlordDisplay}</td></tr>
        <tr><td class="k">Lease Reference No.</td><td class="v">${leaseRef}</td></tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Payment Details</div>
      <table class="kv-table">
        <tr><td class="k">Amount ${isPaid ? 'Received' : 'Due'}</td><td class="v">KES ${fmtMoney(amount)}</td></tr>
        <tr><td class="k">Amount in Words</td><td class="v">${amountInWords(amount)}</td></tr>
        <tr><td class="k">${periodLabel}</td><td class="v">${periodText}</td></tr>
        <tr><td class="k">Payment Method</td><td class="v">${methodLabel}</td></tr>
        <tr><td class="k">Transaction / Reference No.</td><td class="v">${payment.reference || '-'}</td></tr>
        <tr><td class="k">Date Received</td><td class="v">${fmtDate(payment.paidDate)}</td></tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Account Summary</div>
      <table class="summary-table">
        <thead><tr><th>Description</th><th>Amount (KES)</th></tr></thead>
        <tbody>
          ${payment.lease?.monthlyRent ? `<tr><td>Monthly Rent Due</td><td class="amt">${fmtMoney(Number(payment.lease.monthlyRent))}</td></tr>` : ''}
          ${previousBalance !== null ? `<tr><td>Outstanding Balance (Previous)</td><td class="amt">${fmtMoney(previousBalance)}</td></tr>` : ''}
          <tr><td>Amount Paid (This Receipt)</td><td class="amt">${fmtMoney(amount)}</td></tr>
          ${balanceCarriedForward !== null ? `<tr><td>Balance Carried Forward</td><td class="amt">${fmtMoney(balanceCarriedForward)}</td></tr>` : ''}
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Notes</div>
      <p class="notes-text">This receipt confirms payment received for the period stated above. Please retain this document for your records. For any discrepancies, contact Tochi Property within 7 days of issue.</p>
    </div>

  </div>

  <button class="print-btn" onclick="window.print()">🖨️ Print Receipt</button>
</body>
</html>`
}

export interface ReceiptDeliveryResult {
  receiptNumber: string
  emailed: boolean
  whatsapped: boolean
  skippedReason?: string
}

/**
 * BR-9: Auto-generate and send a receipt for a recorded payment.
 * Best-effort delivery — never throws, so it can be safely fired from the
 * payment allocation path without rolling back the payment. Delivery outcomes
 * are returned for logging.
 */
export async function generateAndSendReceipt(paymentId: string): Promise<ReceiptDeliveryResult | null> {
  const payment = await fetchPayment(paymentId)
  if (!payment) return null

  const receiptNumber = receiptNumberFor(payment)
  const html = buildReceiptHtml(payment, receiptNumber)

  const result: ReceiptDeliveryResult = { receiptNumber, emailed: false, whatsapped: false }

  // Email — the durable written record.
  if (payment.tenant.email) {
    try {
      result.emailed = await sendEmail({
        to: payment.tenant.email,
        subject: `Payment Receipt - ${receiptNumber}`,
        html,
      })
    } catch (err) {
      console.error(`[receipt] email failed for payment ${paymentId}:`, err)
    }
  } else {
    result.skippedReason = 'no tenant email on file'
  }

  // WhatsApp/SMS — parallel channel confirmation (best-effort).
  if (payment.tenant.phone) {
    try {
      result.whatsapped = await sendPaymentConfirmationWhatsApp({
        phone: payment.tenant.phone,
        tenantName: payment.tenant.name,
        amount: Number(payment.amount),
        reference: payment.reference || receiptNumber,
        date: fmtDate(payment.paidDate || new Date()),
        type: payment.type,
      })
    } catch (err) {
      console.error(`[receipt] whatsapp failed for payment ${paymentId}:`, err)
    }
  }

  return result
}
