// SOP 004 — rent invoice document (BR-1a). Brand-styled HTML sent to the
// tenant with the amount due and payment instructions. A full arrears
// carry-forward presentation is BR-1b (a later phase); this shows the current
// month's rent and the live balance due.

import { brandTagline, brandContactLine } from '@/lib/services/brand'

const tochiIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="145 75 1210 1350" style="height:40px;width:auto;display:block;"><path fill="#e8960c" d="M 1253.820312 663.828125 C 1209.265625 708.382812 1154.863281 739.253906 1095.15625 754.324219 L 1095.15625 1080.085938 C 1095.15625 1172.246094 1059.222656 1258.882812 994.050781 1324.027344 C 928.875 1389.203125 842.210938 1425.082031 750.054688 1425.082031 C 657.894531 1425.082031 571.261719 1389.203125 506.085938 1324.027344 C 440.910156 1258.855469 405.007812 1172.246094 405.007812 1080.085938 L 405.007812 359.390625 L 1034.199219 359.390625 C 1067.820312 359.390625 1095.074219 386.425781 1095.074219 420.046875 C 1095.074219 453.667969 1067.820312 480.707031 1034.199219 480.707031 L 527.304688 480.707031 L 527.304688 1080.085938 C 527.304688 1203.390625 627.320312 1303.65625 750.707031 1303.328125 C 874.09375 1302.976562 972.859375 1201.324219 972.859375 1077.9375 L 972.859375 765.152344 L 810.742188 765.152344 L 810.742188 1100.378906 C 810.742188 1134 783.703125 1161.257812 750.082031 1161.257812 C 716.460938 1161.257812 689.421875 1134 689.421875 1100.378906 L 689.421875 642.855469 L 1009.855469 642.855469 C 1133.15625 642.855469 1233.421875 542.34375 1233.09375 418.960938 C 1232.742188 295.574219 1131.089844 196.34375 1007.703125 196.34375 L 490.335938 196.34375 C 367.058594 196.34375 267.558594 296.582031 267.558594 419.859375 L 267.558594 682.894531 C 259.96875 676.828125 253.304688 670.492188 246.613281 663.828125 C 181.4375 598.679688 145.316406 512.042969 145.316406 419.886719 C 145.316406 327.726562 181.195312 241.117188 246.367188 175.972656 C 311.515625 110.824219 398.152344 75 490.308594 75 L 1009.828125 75 C 1101.984375 75 1188.621094 110.824219 1253.769531 175.972656 C 1318.941406 241.144531 1354.820312 327.699219 1354.820312 419.859375 C 1354.820312 512.015625 1318.96875 598.652344 1253.820312 663.828125 Z"/></svg>`

function fmtDate(d: Date | string | null) {
  if (!d) return '—'
  const dd = new Date(d)
  return `${dd.getDate()} ${['January','February','March','April','May','June','July','August','September','October','November','December'][dd.getMonth()]} ${dd.getFullYear()}`
}
function fmtMoney(n: number) {
  return Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export interface InvoiceForDocument {
  invoiceNumber: number
  period: string
  dueDate: Date
  rentAmount: any
  tenant: { name: string }
  property?: { name: string | null; address?: string | null } | null
  unitNumber?: string | null
  lease?: { mpesaTill?: string | null; bankDetails?: string | null } | null
}

// BR-1b: optional live arrears position rendered on the invoice.
export interface InvoiceArrears {
  currentRent: number
  broughtForward: { period: string; amount: number }[]
  penaltyAccrued: number
  totalDue: number
  hasArrears: boolean
}

export function buildInvoiceHtml(inv: InvoiceForDocument, balanceDue: number, arrears?: InvoiceArrears): string {
  const rent = Number(inv.rentAmount)
  const unitLine = [inv.unitNumber ? `Unit ${inv.unitNumber}` : '', inv.property?.name, inv.property?.address].filter(Boolean).join(', ')
  const accountRef = inv.unitNumber || '—'
  const mpesa = inv.lease?.mpesaTill
  const bank = inv.lease?.bankDetails

  // BR-1b: when the tenant is in arrears, present the full position — current
  // rent, unpaid rent brought forward (by month), penalties, and total due.
  const amountRows = arrears?.hasArrears
    ? [
        `<tr><td class="k">Current Month Rent (${inv.period})</td><td>KES ${fmtMoney(arrears.currentRent)}</td></tr>`,
        ...arrears.broughtForward.map(
          (b) => `<tr><td class="k">Brought Forward — ${b.period}</td><td>KES ${fmtMoney(b.amount)}</td></tr>`
        ),
        arrears.penaltyAccrued > 0
          ? `<tr><td class="k">Late Payment Penalties</td><td>KES ${fmtMoney(arrears.penaltyAccrued)}</td></tr>`
          : '',
        `<tr><td class="k">Total Amount Due</td><td class="due">KES ${fmtMoney(arrears.totalDue)}</td></tr>`,
      ]
        .filter(Boolean)
        .join('')
    : [
        `<tr><td class="k">Monthly Rent</td><td>KES ${fmtMoney(rent)}</td></tr>`,
        `<tr><td class="k">Amount Due</td><td class="due">KES ${fmtMoney(balanceDue)}</td></tr>`,
      ].join('')

  const payLines = [
    mpesa ? `<tr><td class="k">M-Pesa</td><td class="v">${mpesa}</td></tr>` : '',
    bank ? `<tr><td class="k">Bank</td><td class="v">${bank}</td></tr>` : '',
    `<tr><td class="k">Account Reference</td><td class="v">${accountRef}</td></tr>`,
  ].filter(Boolean).join('')

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Rent Invoice INV-${inv.invoiceNumber} — ${inv.period}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Open Sans',Arial,sans-serif;color:#1a1a1a;font-size:13px;background:#f4f6f8}
  .page{max-width:680px;margin:24px auto;background:#fff;border-radius:6px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,.1)}
  .head{display:flex;justify-content:space-between;align-items:center}
  .brand{display:flex;align-items:center;gap:10px}
  .brand-title{font-family:'Montserrat',Arial,sans-serif;font-weight:700;font-size:20px;color:#1A3A5C}
  .doc-title{font-family:'Montserrat',Arial,sans-serif;font-weight:700;font-size:15px;color:#1A3A5C;text-align:right}
  .brand-tag{font-size:11px;color:#6b7280;font-style:italic;margin-top:4px}
  .contact-line{font-size:11px;color:#6b7280;margin-top:2px}
  hr{border:none;border-top:3px solid #1A3A5C;margin:14px 0 18px}
  .sec-title{font-family:'Montserrat',Arial,sans-serif;font-size:12px;font-weight:700;color:#1A3A5C;text-transform:uppercase;border-bottom:2px solid #1A3A5C;padding-bottom:6px;margin:0 0 10px}
  table{width:100%;border-collapse:collapse;border:1px solid #E5E7EB;margin-bottom:22px}
  td{padding:9px 14px;border-bottom:1px solid #E5E7EB}
  td.k{width:38%;background:#F2F4F7;color:#374151;font-weight:600}
  .due{font-size:16px;font-weight:700;color:#1A3A5C}
</style></head>
<body><div class="page">
  <div class="head">
    <div class="brand">${tochiIconSvg}<div class="brand-title">TOCHI PROPERTY</div></div>
    <div><div class="doc-title">RENT INVOICE</div><div style="text-align:right;font-size:11px;color:#6b7280">INV-${inv.invoiceNumber}</div></div>
  </div>
  <div class="brand-tag">${brandTagline}</div>
  <div class="contact-line">${brandContactLine}</div>
  <hr>
  <div class="sec-title">Bill To</div>
  <table>
    <tr><td class="k">Tenant</td><td>${inv.tenant.name}</td></tr>
    <tr><td class="k">Property</td><td>${unitLine || '—'}</td></tr>
    <tr><td class="k">Billing Period</td><td>${inv.period}</td></tr>
    <tr><td class="k">Due Date</td><td>${fmtDate(inv.dueDate)}</td></tr>
  </table>
  <div class="sec-title">Amount</div>
  <table>${amountRows}</table>
  <div class="sec-title">How to Pay</div>
  <table>${payLines}</table>
  <p style="font-size:12px;color:#4b5563;line-height:1.6">Please pay by the due date to avoid late-payment penalties. Quote your account reference with every payment. Contact Tochi Property with any queries.</p>
</div></body></html>`
}
