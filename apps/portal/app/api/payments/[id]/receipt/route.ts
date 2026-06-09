import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

const tochiIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="145 75 1210 1350" style="height:44px;width:auto;display:block;flex-shrink:0;"><path fill="#e8960c" d="M 1253.820312 663.828125 C 1209.265625 708.382812 1154.863281 739.253906 1095.15625 754.324219 L 1095.15625 1080.085938 C 1095.15625 1172.246094 1059.222656 1258.882812 994.050781 1324.027344 C 928.875 1389.203125 842.210938 1425.082031 750.054688 1425.082031 C 657.894531 1425.082031 571.261719 1389.203125 506.085938 1324.027344 C 440.910156 1258.855469 405.007812 1172.246094 405.007812 1080.085938 L 405.007812 359.390625 L 1034.199219 359.390625 C 1067.820312 359.390625 1095.074219 386.425781 1095.074219 420.046875 C 1095.074219 453.667969 1067.820312 480.707031 1034.199219 480.707031 L 527.304688 480.707031 L 527.304688 1080.085938 C 527.304688 1203.390625 627.320312 1303.65625 750.707031 1303.328125 C 874.09375 1302.976562 972.859375 1201.324219 972.859375 1077.9375 L 972.859375 765.152344 L 810.742188 765.152344 L 810.742188 1100.378906 C 810.742188 1134 783.703125 1161.257812 750.082031 1161.257812 C 716.460938 1161.257812 689.421875 1134 689.421875 1100.378906 L 689.421875 642.855469 L 1009.855469 642.855469 C 1133.15625 642.855469 1233.421875 542.34375 1233.09375 418.960938 C 1232.742188 295.574219 1131.089844 196.34375 1007.703125 196.34375 L 490.335938 196.34375 C 367.058594 196.34375 267.558594 296.582031 267.558594 419.859375 L 267.558594 682.894531 C 259.96875 676.828125 253.304688 670.492188 246.613281 663.828125 C 181.4375 598.679688 145.316406 512.042969 145.316406 419.886719 C 145.316406 327.726562 181.195312 241.117188 246.367188 175.972656 C 311.515625 110.824219 398.152344 75 490.308594 75 L 1009.828125 75 C 1101.984375 75 1188.621094 110.824219 1253.769531 175.972656 C 1318.941406 241.144531 1354.820312 327.699219 1354.820312 419.859375 C 1354.820312 512.015625 1318.96875 598.652344 1253.820312 663.828125 Z"/></svg>`

function fmtDate(d: Date | string | null) {
  if (!d) return '—'
  const dd = new Date(d)
  return `${String(dd.getDate()).padStart(2, '0')} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dd.getMonth()]} ${dd.getFullYear()}`
}

function fmtMoney(n: number | string) {
  return Number(n).toLocaleString('en-KE')
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

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      tenant: { select: { id: true, name: true, email: true, phone: true, idNumber: true } },
      lease: {
        select: {
          id: true,
          monthlyRent: true,
          startDate: true,
          endDate: true,
          property: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          unitRef: { select: { id: true, unitNumber: true } },
        },
      },
    },
  })

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  const receiptNumber = payment.reference || `RCP-${payment.id.slice(-8).toUpperCase()}`
  const propertyName = payment.lease?.property?.name || '—'
  const unitNumber = payment.lease?.unitRef?.unitNumber || '—'
  const methodLabels: Record<string, string> = {
    BANK_TRANSFER: 'Bank Transfer',
    MPESA: 'M-Pesa',
    CASH: 'Cash',
    CHEQUE: 'Cheque',
    CARD: 'Card',
  }
  const methodLabel = methodLabels[payment.method] || payment.method
  const isPaid = payment.status === 'PAID'

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
  <title>Payment Receipt — ${receiptNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Open Sans', Arial, sans-serif; color: #1a1a1a; font-size: 13px; background: #f4f6f8; }
    .page { max-width: 680px; margin: 24px auto; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
    .brand-header { background: #1A3A5C; border-bottom: 4px solid #E8960C; padding: 20px 32px; display: flex; align-items: center; gap: 14px; }
    .brand-title { font-family: 'Montserrat', Arial, sans-serif; font-weight: 700; font-size: 20px; color: white; letter-spacing: 1px; }
    .brand-tag { font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 2px; font-style: italic; }
    .receipt-header { padding: 24px 32px 0; display: flex; justify-content: space-between; align-items: flex-start; }
    .receipt-title { font-family: 'Montserrat', Arial, sans-serif; font-size: 22px; font-weight: 700; color: #1A3A5C; }
    .receipt-meta { text-align: right; }
    .receipt-meta .number { font-family: 'Montserrat', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #1A3A5C; }
    .receipt-meta .date { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 700; font-family: 'Montserrat', Arial, sans-serif; letter-spacing: 0.5px; margin-top: 8px; }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-pending { background: #fef9c3; color: #854d0e; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 32px; }
    .section { padding: 0 32px 20px; }
    .section-title { font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .detail-item .label { font-size: 11px; color: #9ca3af; margin-bottom: 3px; }
    .detail-item .value { font-size: 13px; color: #111827; font-weight: 600; }
    .amount-box { margin: 0 32px 24px; background: #1A3A5C; border-left: 6px solid #E8960C; padding: 16px 24px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; }
    .amount-box .label { font-size: 12px; color: rgba(255,255,255,0.7); font-family: 'Montserrat', Arial, sans-serif; }
    .amount-box .value { font-size: 26px; font-weight: 700; color: #E8960C; font-family: 'Courier New', monospace; }
    .reference-box { margin: 0 32px 24px; background: #EEF2F7; border-left: 4px solid #E8960C; padding: 12px 20px; border-radius: 4px; }
    .reference-box .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .reference-box .value { font-size: 15px; font-weight: 700; color: #1A3A5C; font-family: 'Courier New', monospace; margin-top: 2px; }
    .footer { padding: 16px 32px; border-top: 2px solid #E8960C; display: flex; justify-content: space-between; align-items: center; background: #f9fafb; }
    .footer .left { font-size: 11px; color: #6b7280; }
    .footer .right { font-size: 10px; color: #8B5A00; font-style: italic; }
    .print-btn { display: block; margin: 20px auto; padding: 10px 28px; background: #1A3A5C; color: white; border: none; border-radius: 4px; font-size: 13px; font-family: 'Montserrat', Arial, sans-serif; font-weight: 600; cursor: pointer; }
    @media print {
      body { background: white; }
      .page { box-shadow: none; margin: 0; border-radius: 0; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="brand-header">
      ${tochiIconSvg}
      <div>
        <div class="brand-title">TOCHI PROPERTY</div>
        <div class="brand-tag">Your Property. Our Pride.</div>
      </div>
    </div>

    <div class="receipt-header">
      <div>
        <div class="receipt-title">Payment Receipt</div>
        <span class="status-badge ${isPaid ? 'status-paid' : 'status-pending'}">${isPaid ? 'PAID' : payment.status}</span>
      </div>
      <div class="receipt-meta">
        <div class="number">${receiptNumber}</div>
        <div class="date">Issued: ${fmtDate(new Date())}</div>
      </div>
    </div>

    <hr class="divider">

    <div class="amount-box">
      <div class="label">AMOUNT ${isPaid ? 'RECEIVED' : 'DUE'}</div>
      <div class="value">KES ${fmtMoney(payment.amount)}</div>
    </div>

    ${payment.reference ? `
    <div class="reference-box">
      <div class="label">Transaction Reference</div>
      <div class="value">${payment.reference}</div>
    </div>` : ''}

    <div class="section">
      <div class="section-title">Tenant Details</div>
      <div class="detail-grid">
        <div class="detail-item"><div class="label">Name</div><div class="value">${payment.tenant.name}</div></div>
        <div class="detail-item"><div class="label">ID / Passport</div><div class="value">${payment.tenant.idNumber || '—'}</div></div>
        <div class="detail-item"><div class="label">Email</div><div class="value">${payment.tenant.email || '—'}</div></div>
        <div class="detail-item"><div class="label">Phone</div><div class="value">${payment.tenant.phone || '—'}</div></div>
      </div>
    </div>

    <hr class="divider" style="margin-top:0;">

    <div class="section">
      <div class="section-title">Property Details</div>
      <div class="detail-grid">
        <div class="detail-item"><div class="label">Property</div><div class="value">${propertyName}</div></div>
        <div class="detail-item"><div class="label">Unit</div><div class="value">${unitNumber}</div></div>
      </div>
    </div>

    <hr class="divider" style="margin-top:0;">

    <div class="section">
      <div class="section-title">Payment Details</div>
      <div class="detail-grid">
        <div class="detail-item"><div class="label">Payment Type</div><div class="value">${payment.type}</div></div>
        <div class="detail-item"><div class="label">Payment Method</div><div class="value">${methodLabel}</div></div>
        <div class="detail-item"><div class="label">Due Date</div><div class="value">${fmtDate(payment.dueDate)}</div></div>
        <div class="detail-item"><div class="label">Paid On</div><div class="value">${fmtDate(payment.paidDate)}</div></div>
        ${payment.notes ? `<div class="detail-item" style="grid-column:span 2;"><div class="label">Notes</div><div class="value">${payment.notes}</div></div>` : ''}
      </div>
    </div>

    <div class="footer">
      <div class="left">
        <strong style="color:#1A3A5C;font-family:'Montserrat',Arial,sans-serif;">Tochi Property</strong><br>
        Generated ${fmtDate(new Date())} · tochiproperty.com · info@tochiproperty.com
      </div>
      <div class="right">Your Property. Our Pride.</div>
    </div>
  </div>

  <button class="print-btn" onclick="window.print()">🖨️ Print Receipt</button>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
