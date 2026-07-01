import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/services/email'

const tochiIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="145 75 1210 1350" style="height:44px;width:auto;display:block;flex-shrink:0;"><path fill="#e8960c" d="M 1253.820312 663.828125 C 1209.265625 708.382812 1154.863281 739.253906 1095.15625 754.324219 L 1095.15625 1080.085938 C 1095.15625 1172.246094 1059.222656 1258.882812 994.050781 1324.027344 C 928.875 1389.203125 842.210938 1425.082031 750.054688 1425.082031 C 657.894531 1425.082031 571.261719 1389.203125 506.085938 1324.027344 C 440.910156 1258.855469 405.007812 1172.246094 405.007812 1080.085938 L 405.007812 359.390625 L 1034.199219 359.390625 C 1067.820312 359.390625 1095.074219 386.425781 1095.074219 420.046875 C 1095.074219 453.667969 1067.820312 480.707031 1034.199219 480.707031 L 527.304688 480.707031 L 527.304688 1080.085938 C 527.304688 1203.390625 627.320312 1303.65625 750.707031 1303.328125 C 874.09375 1302.976562 972.859375 1201.324219 972.859375 1077.9375 L 972.859375 765.152344 L 810.742188 765.152344 L 810.742188 1100.378906 C 810.742188 1134 783.703125 1161.257812 750.082031 1161.257812 C 716.460938 1161.257812 689.421875 1134 689.421875 1100.378906 L 689.421875 642.855469 L 1009.855469 642.855469 C 1133.15625 642.855469 1233.421875 542.34375 1233.09375 418.960938 C 1232.742188 295.574219 1131.089844 196.34375 1007.703125 196.34375 L 490.335938 196.34375 C 367.058594 196.34375 267.558594 296.582031 267.558594 419.859375 L 267.558594 682.894531 C 259.96875 676.828125 253.304688 670.492188 246.613281 663.828125 C 181.4375 598.679688 145.316406 512.042969 145.316406 419.886719 C 145.316406 327.726562 181.195312 241.117188 246.367188 175.972656 C 311.515625 110.824219 398.152344 75 490.308594 75 L 1009.828125 75 C 1101.984375 75 1188.621094 110.824219 1253.769531 175.972656 C 1318.941406 241.144531 1354.820312 327.699219 1354.820312 419.859375 C 1354.820312 512.015625 1318.96875 598.652344 1253.820312 663.828125 Z"/></svg>`

function fmtDate(d: Date | string | null) {
  if (!d) return '—'
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

type PaymentWithRelations = Awaited<ReturnType<typeof fetchPayment>>

async function fetchPayment(id: string) {
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

function buildReceiptHtml(payment: NonNullable<PaymentWithRelations>, receiptNumber: string): string {
  const propertyAddress = payment.lease?.property?.address || payment.property?.address || '—'
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
  const periodText = `${fmtDate(periodStart)} – ${fmtDate(periodEnd)}`

  const ledgerEntry = payment.ledgerEntries?.[0]
  const balanceCarriedForward = ledgerEntry ? Number(ledgerEntry.balance) : null
  const previousBalance = ledgerEntry ? balanceCarriedForward! + amount : null

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
  <title>${docTitle} — ${receiptNumber}</title>
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
    <div class="header-row">
      <div class="brand-block">
        ${tochiIconSvg}
        <div class="brand-title">TOCHI PROPERTY</div>
      </div>
      <div>
        <div class="doc-title">${docTitle}</div>
        <div class="status-badge"><span class="${isPaid ? 'status-paid' : 'status-pending'}">${isPaid ? 'PAID' : payment.status}</span></div>
      </div>
    </div>
    <div class="brand-tag">Your Property. Our Pride.</div>
    <div class="contact-line">info@tochiproperty.com&nbsp;&nbsp;|&nbsp;&nbsp;tochiproperty.com&nbsp;&nbsp;|&nbsp;&nbsp;+254 721 998 499</div>

    <hr class="brand-divider">

    <div class="meta-row">
      <div>Receipt No.: ${receiptNumber}</div>
      <div>Date Issued: ${fmtDate(new Date())}</div>
    </div>

    <div class="section">
      <div class="section-title">Tenant &amp; Property Details</div>
      <table class="kv-table">
        <tr><td class="k">Tenant Name</td><td class="v">${payment.tenant.name}</td></tr>
        <tr><td class="k">Property Address</td><td class="v">${unitLine || '—'}</td></tr>
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
        <tr><td class="k">Transaction / Reference No.</td><td class="v">${payment.reference || '—'}</td></tr>
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const payment = await fetchPayment(id)

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  const receiptNumber = `RCP-${payment.id.slice(-8).toUpperCase()}`
  const html = buildReceiptHtml(payment, receiptNumber)

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const payment = await fetchPayment(id)

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  if (!payment.tenant.email) {
    return NextResponse.json({ error: 'Tenant has no email address on file' }, { status: 422 })
  }

  const receiptNumber = `RCP-${payment.id.slice(-8).toUpperCase()}`
  const html = buildReceiptHtml(payment, receiptNumber)

  const sent = await sendEmail({
    to: payment.tenant.email,
    subject: `Payment Receipt — ${receiptNumber}`,
    html,
  })

  if (!sent) {
    return NextResponse.json({ error: 'Email could not be sent. Check email configuration.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, sentTo: payment.tenant.email })
}
