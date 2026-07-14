// SOP 004: rent invoice document (BR-1a). Brand-styled HTML sent to the
// tenant with the amount due and payment instructions. A full arrears
// carry-forward presentation is BR-1b (a later phase); this shows the current
// month's rent and the live balance due.

import { brandHeaderTable } from '@/lib/services/brand'

function fmtDate(d: Date | string | null) {
  if (!d) return '-'
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
  const accountRef = inv.unitNumber || '-'
  const mpesa = inv.lease?.mpesaTill
  const bank = inv.lease?.bankDetails

  // BR-1b: when the tenant is in arrears, present the full position: current
  // rent, unpaid rent brought forward (by month), penalties, and total due.
  const amountRows = arrears?.hasArrears
    ? [
        `<tr><td class="k">Current Month Rent (${inv.period})</td><td>KES ${fmtMoney(arrears.currentRent)}</td></tr>`,
        ...arrears.broughtForward.map(
          (b) => `<tr><td class="k">Brought Forward ${b.period}</td><td>KES ${fmtMoney(b.amount)}</td></tr>`
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

  const rightHtml = `<div style="font-family:'Montserrat',Arial,sans-serif;font-weight:700;font-size:15px;color:#1A3A5C;">RENT INVOICE</div><div style="font-size:11px;color:#6b7280;">INV-${inv.invoiceNumber}</div>`

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Rent Invoice INV-${inv.invoiceNumber} - ${inv.period}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Open Sans',Arial,sans-serif;color:#1a1a1a;font-size:13px;background:#f4f6f8}
  .page{max-width:680px;margin:24px auto;background:#fff;border-radius:6px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,.1)}
  .sec-title{font-family:'Montserrat',Arial,sans-serif;font-size:12px;font-weight:700;color:#1A3A5C;text-transform:uppercase;border-bottom:2px solid #1A3A5C;padding-bottom:6px;margin:0 0 10px}
  table{width:100%;border-collapse:collapse;border:1px solid #E5E7EB;margin-bottom:22px}
  td{padding:9px 14px;border-bottom:1px solid #E5E7EB}
  td.k{width:38%;background:#F2F4F7;color:#374151;font-weight:600}
  .due{font-size:16px;font-weight:700;color:#1A3A5C}
</style></head>
<body><div class="page">
  ${brandHeaderTable(rightHtml)}
  <div class="sec-title">Bill To</div>
  <table>
    <tr><td class="k">Tenant</td><td>${inv.tenant.name}</td></tr>
    <tr><td class="k">Property</td><td>${unitLine || '-'}</td></tr>
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
