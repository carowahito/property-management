import PDFDocument from 'pdfkit'

// ─── Brand Colours ───────────────────────────────────────────
const NAVY = '#1B3A5C'
const GOLD = '#C49A3C'
const DARK = '#333333'
const BORDER = '#CCCCCC'

// ─── A4 Dimensions (points) ─────────────────────────────────
const PW = 595.28
const PH = 841.89
const ML = 55 // margin left
const MR = 55
const CW = PW - ML - MR // content width ≈ 485

// ─── Data contract ───────────────────────────────────────────
export interface LeaseData {
  companyName: string
  companyEmail: string
  companyPhone: string
  companyWebsite: string

  propertyName: string
  propertyAddress: string
  unitNumber: string

  tenantName: string
  tenantIdNumber: string
  tenantEmail: string
  tenantPhone: string

  monthlyRent: number
  securityDeposit: number
  startDate: Date
  endDate: Date
  noticePeriodMonths: number
  rentEscalation: number
  gracePeriodDays: number
  latePenaltyPerDay: number
  rentDueDay: number
  petPolicy: string

  mpesaPaybill?: string
  mpesaAccountRef?: string
  bankName?: string
  bankAccountNo?: string
  bankBranch?: string
  emergencyPhone?: string
  signatoryName?: string
  signatoryTitle?: string
}

// ─── Helpers ─────────────────────────────────────────────────
function fmtDate(d: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const dt = new Date(d)
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`
}

function fmtKShs(n: number): string {
  return `KShs ${n.toLocaleString('en-KE')}/=`
}

function fmtNum(n: number): string {
  return n.toLocaleString('en-KE')
}

function monthsBetween(a: Date, b: Date): number {
  const da = new Date(a)
  const db = new Date(b)
  return (db.getFullYear() - da.getFullYear()) * 12 + (db.getMonth() - da.getMonth())
}

const ONES = [
  '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
]
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

function numWords(n: number): string {
  if (n < 20) return ONES[n]
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '')
  return n.toString()
}

function ord(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// ─── Table drawing ───────────────────────────────────────────
interface Cell {
  text: string
  bold?: boolean
  bg?: string
  color?: string
}

function drawTable(
  doc: PDFKit.PDFDocument,
  y: number,
  rows: Cell[][],
  colWidths: number[],
  opts: { fontSize?: number; padding?: number } = {},
): number {
  const fs = opts.fontSize ?? 9
  const pad = opts.padding ?? 6

  for (const row of rows) {
    // measure row height
    let maxH = 0
    for (let c = 0; c < row.length; c++) {
      const cell = row[c]
      const font = cell.bold ? 'Helvetica-Bold' : 'Helvetica'
      const h = doc.font(font).fontSize(fs).heightOfString(cell.text, { width: colWidths[c] - pad * 2 })
      maxH = Math.max(maxH, h)
    }
    const rh = maxH + pad * 2

    // page break check
    if (y + rh > PH - 70) {
      doc.addPage()
      y = doc.page.margins.top
    }

    let x = ML
    for (let c = 0; c < row.length; c++) {
      const cell = row[c]
      const w = colWidths[c]
      // bg
      if (cell.bg) {
        doc.save().rect(x, y, w, rh).fill(cell.bg).restore()
      }
      // border
      doc.save().rect(x, y, w, rh).strokeColor(BORDER).lineWidth(0.5).stroke().restore()
      // text
      const font = cell.bold ? 'Helvetica-Bold' : 'Helvetica'
      doc.font(font).fontSize(fs).fillColor(cell.color ?? DARK)
        .text(cell.text, x + pad, y + pad, { width: w - pad * 2 })
      x += w
    }
    y += rh
  }
  return y
}

// ─── Reusable text helpers ───────────────────────────────────
function sectionTitle(doc: PDFKit.PDFDocument, label: string) {
  ensureSpace(doc, 40)
  doc.font('Helvetica-Bold').fontSize(13).fillColor(NAVY).text(label)
  // gold underline
  const lineY = doc.y + 2
  doc.save().moveTo(ML, lineY).lineTo(PW - MR, lineY).strokeColor(GOLD).lineWidth(1.5).stroke().restore()
  doc.y = lineY + 8
}

function clauseTitle(doc: PDFKit.PDFDocument, label: string) {
  ensureSpace(doc, 30)
  doc.moveDown(0.5)
  doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY).text(label)
  doc.moveDown(0.3)
}

function subClause(doc: PDFKit.PDFDocument, num: string, title: string, body: string) {
  ensureSpace(doc, 24)
  doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK)
    .text(`${num} ${title} `, { continued: true })
  doc.font('Helvetica').text(body)
  doc.moveDown(0.3)
}

function subClauseOnly(doc: PDFKit.PDFDocument, num: string, title: string) {
  ensureSpace(doc, 24)
  doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK).text(`${num} ${title}`)
  doc.moveDown(0.2)
}

function para(doc: PDFKit.PDFDocument, text: string) {
  doc.font('Helvetica').fontSize(10).fillColor(DARK).text(text)
  doc.moveDown(0.3)
}

function bullet(doc: PDFKit.PDFDocument, text: string) {
  const x = ML + 20
  const bx = ML + 8
  const startY = doc.y
  ensureSpace(doc, 16)
  doc.font('Helvetica').fontSize(10).fillColor(DARK)
  // bullet dot
  doc.circle(bx + 2, doc.y + 5, 2).fill(DARK)
  doc.text(text, x, doc.y, { width: CW - 20 })
  doc.moveDown(0.15)
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > PH - 70) {
    doc.addPage()
  }
}

// ─── Build the full document ─────────────────────────────────
export async function generateLeasePDF(data: LeaseData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      bufferPages: true,
      margins: { top: 85, bottom: 65, left: ML, right: MR },
    })

    const bufs: Buffer[] = []
    doc.on('data', (c: Buffer) => bufs.push(c))
    doc.on('end', () => resolve(Buffer.concat(bufs)))
    doc.on('error', reject)

    const dur = monthsBetween(data.startDate, data.endDate)
    const durWords = numWords(dur)
    const depMonths = Math.round(data.securityDeposit / data.monthlyRent)
    const noticeDays = data.noticePeriodMonths * 30
    const noticeDaysWords = numWords(noticeDays)
    const graceWords = numWords(data.gracePeriodDays)

    // ═══════════════════════════════════════════════════════════
    // TITLE
    // ═══════════════════════════════════════════════════════════
    doc.font('Helvetica-Bold').fontSize(18).fillColor(DARK)
      .text('RESIDENTIAL TENANCY AGREEMENT', { align: 'center' })
    doc.moveDown(0.3)
    doc.font('Helvetica').fontSize(11).fillColor(DARK)
      .text(`Property: ${data.propertyName}, Unit ${data.unitNumber}`, { align: 'center' })
    doc.moveDown(1)

    // ═══════════════════════════════════════════════════════════
    // A. PARTIES
    // ═══════════════════════════════════════════════════════════
    sectionTitle(doc, 'A. Parties to this Agreement')

    // MANAGING AGENT
    doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK).text('MANAGING AGENT')
    doc.moveDown(0.4)

    const col1 = 140
    const col2 = CW - col1
    let ty = drawTable(doc, doc.y, [
      [{ text: 'Name', bold: true }, { text: data.companyName }],
      [{ text: 'Email', bold: true }, { text: data.companyEmail }],
      [{ text: 'Mobile', bold: true }, { text: data.companyPhone }],
      [{ text: 'Website', bold: true }, { text: data.companyWebsite }],
      [
        { text: 'Acting for', bold: true },
        { text: `The registered owner of the property (the "Landlord"), for whom ${data.companyName} acts as managing agent.` },
      ],
    ], [col1, col2])
    doc.x = ML
    doc.y = ty + 12

    // TENANT(S)
    doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK).text('TENANT(S)')
    doc.moveDown(0.4)

    const tc1 = 120
    const tc2 = Math.floor((CW - tc1) / 2)
    const tc3 = CW - tc1 - tc2
    ty = drawTable(doc, doc.y, [
      [
        { text: '', bg: NAVY, color: '#FFFFFF', bold: true },
        { text: 'Tenant 1', bg: NAVY, color: '#FFFFFF', bold: true },
        { text: 'Tenant 2 (if applicable)', bg: NAVY, color: '#FFFFFF', bold: true },
      ],
      [{ text: 'Full Name', bold: true }, { text: data.tenantName }, { text: 'N/A' }],
      [{ text: 'National ID /\nPassport No.', bold: true }, { text: data.tenantIdNumber }, { text: 'N/A' }],
      [{ text: 'Email Address', bold: true }, { text: data.tenantEmail }, { text: 'N/A' }],
      [{ text: 'Mobile Number', bold: true }, { text: data.tenantPhone }, { text: 'N/A' }],
    ], [tc1, tc2, tc3])
    doc.x = ML
    doc.y = ty + 12

    // ═══════════════════════════════════════════════════════════
    // B. KEY TERMS SUMMARY
    // ═══════════════════════════════════════════════════════════
    sectionTitle(doc, 'B. Key Terms Summary')

    const kc1 = 160
    const kc2 = CW - kc1
    ty = drawTable(doc, doc.y, [
      [{ text: 'Property Address', bold: true }, { text: `${data.propertyAddress}, ${data.propertyName}, Unit ${data.unitNumber}` }],
      [{ text: 'Monthly Rent', bold: true }, { text: `${fmtKShs(data.monthlyRent)} per month` }],
      [{ text: 'Rent Due Date', bold: true }, { text: `${ord(data.rentDueDay)} day of each calendar month, in advance` }],
      [{ text: 'Grace Period', bold: true }, { text: `${data.gracePeriodDays} days \u2014 rent not received by Day ${data.gracePeriodDays} is overdue` }],
      [{ text: 'Late Payment Penalty', bold: true }, { text: `KShs ${fmtNum(data.latePenaltyPerDay)} per day, charged from Day ${data.gracePeriodDays + 1} onwards` }],
      [{ text: 'Security Deposit', bold: true }, { text: `${fmtKShs(data.securityDeposit)} (equivalent to ${depMonths} month(s)\u2019 rent)` }],
      [{ text: 'Lease Start Date', bold: true }, { text: fmtDate(data.startDate) }],
      [{ text: 'Lease End Date', bold: true }, { text: `${fmtDate(data.endDate)} (${dur} months from start date)` }],
      [{ text: 'Notice Period', bold: true }, { text: `${noticeDays} days\u2019 written notice by either party` }],
      [{ text: 'Annual Rent Escalation', bold: true }, { text: `${data.rentEscalation}% per annum \u2014 see Clause 5` }],
      [{ text: 'Permitted Use', bold: true }, { text: 'Residential occupation only' }],
    ], [kc1, kc2])
    doc.x = ML
    doc.y = ty + 14

    // ═══════════════════════════════════════════════════════════
    // C. AGREEMENT
    // ═══════════════════════════════════════════════════════════
    sectionTitle(doc, 'C. Agreement')

    doc.font('Helvetica').fontSize(10).fillColor(DARK)
      .text('This Agreement is entered into between ', { continued: true })
    doc.font('Helvetica-Bold').text(`${data.companyName}`, { continued: true })
    doc.font('Helvetica').text(` (the \u201CAgent\u201D, acting for and on behalf of the Landlord) and `, { continued: true })
    doc.font('Helvetica-Bold').text(data.tenantName, { continued: true })
    doc.font('Helvetica').text(` (the \u201CTenant\u201D), for the lease of the property described in Section B above. Both parties agree to be bound by the terms and conditions set out below.`)
    doc.moveDown(0.6)

    // ═══════════════════════════════════════════════════════════
    // 1. RENT & PAYMENT
    // ═══════════════════════════════════════════════════════════
    clauseTitle(doc, '1. RENT & PAYMENT')

    subClause(doc, '1.1', 'Amount & Due Date.',
      `The monthly rent is as stated in Section B, payable in advance on the ${ord(data.rentDueDay)} day of each calendar month.`)

    subClause(doc, '1.2', 'Grace Period.',
      `A grace period of ${graceWords} (${data.gracePeriodDays}) days applies. Rent not received by the ${ord(data.gracePeriodDays)} of the month is overdue and the late payment penalty applies from Day ${data.gracePeriodDays + 1}.`)

    subClause(doc, '1.3', 'Late Payment Penalty.',
      `A penalty of KShs ${fmtNum(data.latePenaltyPerDay)}/= per day is charged for every day the rent remains unpaid from Day ${data.gracePeriodDays + 1} of the calendar month, accruing daily until the outstanding amount is paid in full. The Agent will notify the Tenant in writing of the rent outstanding, the penalty accrued, and the total amount due.`)

    subClauseOnly(doc, '1.4', 'Permitted Payment Methods.')
    para(doc, 'All payments must be made via one of the following methods only:')
    if (data.mpesaPaybill) {
      bullet(doc, `M-Pesa Paybill: ${data.mpesaPaybill} \u2014 Account: ${data.mpesaAccountRef || data.unitNumber}`)
    }
    if (data.bankName) {
      bullet(doc, `Bank EFT / RTGS: ${data.companyName}, Account No. ${data.bankAccountNo}, ${data.bankName}, ${data.bankBranch || ''}`)
    }
    if (!data.mpesaPaybill && !data.bankName) {
      bullet(doc, 'Payment details to be advised by the Agent.')
    }
    doc.font('Helvetica').fontSize(10).fillColor(DARK)
      .text('Cash payments will ', { continued: true })
    doc.font('Helvetica-Bold').text('not', { continued: true })
    doc.font('Helvetica').text(' be accepted. Payments must clear before any receipt is issued.')
    doc.moveDown(0.3)

    subClause(doc, '1.5', 'Receipts.',
      'An official receipt is issued automatically for every payment received, stating the amount paid, the period covered, and the payment reference number.')

    subClause(doc, '1.6', 'Arrears.',
      'Where rent remains unpaid, the Agent will issue written arrears notices and may issue a formal Notice to Remedy or Vacate where arrears remain unresolved, without prejudice to Clause 12.')

    // ═══════════════════════════════════════════════════════════
    // 2. SECURITY DEPOSIT
    // ═══════════════════════════════════════════════════════════
    clauseTitle(doc, '2. SECURITY DEPOSIT')

    subClause(doc, '2.1', 'Amount.',
      `Prior to moving in, the Tenant shall pay a security deposit of ${fmtKShs(data.securityDeposit)} as stated in Section B. The deposit must be received and cleared before keys are released.`)

    subClause(doc, '2.2', 'Holding.',
      'The deposit is held against the Tenant\u2019s obligations under this Agreement. It shall not be applied to any purpose other than those set out in Clause 2.4, and any balance remaining after lawful deductions shall be refunded in accordance with Clause 2.6.')

    subClause(doc, '2.3', 'No Commutation.',
      'The security deposit shall under no circumstances be applied as payment for rent during or at the end of the tenancy.')

    subClauseOnly(doc, '2.4', 'Permitted Deductions.')
    para(doc, 'At the end of the tenancy, deductions from the deposit are only permitted for:')
    bullet(doc, 'Unpaid rent or other charges confirmed in writing;')
    bullet(doc, 'Damage to the property or its contents beyond fair wear and tear, evidenced by comparison of the move-in and move-out inspection reports (including photographic evidence);')
    bullet(doc, 'Professional cleaning costs where the property is left below its move-in standard (cleaning invoice required);')
    bullet(doc, 'Replacement of lost or damaged inventory items as evidenced by the signed inventory list at move-in;')
    bullet(doc, 'Any breach of this Agreement resulting in a quantifiable financial loss.')
    doc.moveDown(0.2)

    subClauseOnly(doc, '2.5', 'Non-Permitted Deductions.')
    para(doc, 'The following shall not be deducted from the deposit:')
    bullet(doc, 'Normal fair wear and tear (light scuffs, minor marks, faded paint);')
    bullet(doc, 'Pre-existing damage documented on the move-in inspection report;')
    bullet(doc, 'Structural repairs or maintenance that are the Landlord\u2019s responsibility.')
    doc.moveDown(0.2)

    subClause(doc, '2.6', 'Refund Timeline.',
      'The deposit (or balance after permitted deductions) shall be refunded within ten (10) business days of completion of the move-out inspection, together with an itemised deposit settlement statement detailing any deductions made.')

    subClause(doc, '2.7', 'Disputed Deductions.',
      'If the Tenant disputes any deduction, they must notify the Agent in writing within five (5) business days of receiving the settlement statement. The parties shall attempt to resolve the dispute within a further five (5) business days, failing which the dispute shall be referred to the process in Clause 13.')

    // ═══════════════════════════════════════════════════════════
    // 3. LEASE TERM & RENEWAL
    // ═══════════════════════════════════════════════════════════
    clauseTitle(doc, '3. LEASE TERM & RENEWAL')

    subClause(doc, '3.1', 'Fixed Term.',
      `This Agreement is for a fixed term of ${durWords} (${dur}) months commencing and expiring on the dates stated in Section B.`)

    subClause(doc, '3.2', 'Renewal.',
      'This Agreement may be renewed for further periods upon mutual written agreement of both parties. The Agent shall contact the Tenant before the expiry date regarding renewal terms.')

    subClause(doc, '3.3', 'Periodic Tenancy.',
      'If the fixed term expires without either party issuing a notice to terminate or a new fixed-term agreement being signed, the tenancy converts to a month-to-month periodic tenancy on the same terms until terminated in accordance with Clause 4.')

    // ═══════════════════════════════════════════════════════════
    // 4. NOTICE PERIOD & TERMINATION
    // ═══════════════════════════════════════════════════════════
    clauseTitle(doc, '4. NOTICE PERIOD & TERMINATION')

    subClause(doc, '4.1', 'Tenant Notice.',
      `The Tenant shall give at least ${noticeDaysWords} (${noticeDays}) days\u2019 written notice before vacating, submitted by email or hand-delivered letter to the Agent.`)

    subClause(doc, '4.2', 'Rent During Notice.',
      'The Tenant is liable for rent for the full duration of the notice period, irrespective of whether they vacate earlier.')

    subClause(doc, '4.3', 'Agent / Landlord Notice.',
      `The Agent shall give at least ${noticeDaysWords} (${noticeDays}) days\u2019 written notice to the Tenant to vacate, except where the Tenant is in material breach of this Agreement.`)

    // ═══════════════════════════════════════════════════════════
    // 5. RENT REVIEW & ESCALATION
    // ═══════════════════════════════════════════════════════════
    clauseTitle(doc, '5. RENT REVIEW & ESCALATION')

    subClause(doc, '5.1', 'Annual Review.',
      'The rent shall be reviewed annually at the end of each 12-month lease term. Rent may only be increased once per 12-month tenancy period unless otherwise agreed in writing.')

    subClause(doc, '5.2', 'Notice of Increase.',
      'The Agent shall notify the Tenant of any proposed rent increase in writing before the new rate takes effect.')

    subClause(doc, '5.3', 'Escalation Basis.',
      `The annual rent escalation is ${data.rentEscalation}% of the then-current monthly rent, unless otherwise agreed in writing by both parties. Any increase will be market-referenced.`)

    // ═══════════════════════════════════════════════════════════
    // 6. MOVE-IN INSPECTION
    // ═══════════════════════════════════════════════════════════
    clauseTitle(doc, '6. MOVE-IN INSPECTION')

    subClause(doc, '6.1', 'Initial Inspection.',
      'A digital Move-In Inspection Report shall be completed by the Agent and the Tenant on or before move-in day, documenting the condition of every room, wall, floor, ceiling, door, window, fixture, fitting, and appliance with photographic evidence.')

    subClause(doc, '6.2', 'Binding Record.',
      'The signed move-in inspection report forms the definitive record of the property\u2019s condition at commencement and is the baseline for any deposit deduction assessment at move-out.')

    // ═══════════════════════════════════════════════════════════
    // 7. INSPECTIONS DURING TENANCY
    // ═══════════════════════════════════════════════════════════
    clauseTitle(doc, '7. INSPECTIONS DURING TENANCY')

    subClause(doc, '7.1', 'Routine Inspections.',
      'The Agent is entitled to inspect the property at reasonable intervals. Routine inspections take place every six (6) months, with an additional inspection three (3) months after move-in for new tenancies.')

    subClause(doc, '7.2', 'Notice.',
      'The Agent shall provide at least twenty-four (24) hours\u2019 written notice before any routine inspection, via email, SMS, or WhatsApp.')

    subClause(doc, '7.3', 'Emergency Access.',
      'In an emergency (flooding, fire, structural failure, security breach), the Agent or Landlord may access the property without prior notice and shall notify the Tenant as soon as practicable thereafter.')

    subClause(doc, '7.4', 'Reports.',
      'Inspection reports, including photographs, are signed digitally by both the inspector and the Tenant and a copy is provided to the Tenant.')

    // ═══════════════════════════════════════════════════════════
    // 8. MOVE-OUT PROCESS & CLEARANCE TO VACATE
    // ═══════════════════════════════════════════════════════════
    clauseTitle(doc, '8. MOVE-OUT PROCESS & CLEARANCE TO VACATE')

    subClause(doc, '8.1', 'Pre-Move-Out Inspection.',
      'At least two (2) weeks before the agreed move-out date, the Agent shall conduct a pre-move-out advisory inspection and advise the Tenant in writing of any items to remedy before vacating.')

    subClause(doc, '8.2', 'Final Inspection.',
      `On move-out day, a final inspection shall be conducted with the Tenant, the Agent, and ${data.companyName}\u2019s appointed general contractor present, compared side-by-side against the move-in report. The contractor shall assess and cost all repairs or remedial works required.`)

    subClause(doc, '8.3', 'Statement of Repair Costs.',
      'The Agent and contractor shall jointly produce a Statement of Repair Costs, which the Tenant must sign before vacating. This statement forms the basis for any deposit deductions.')

    subClauseOnly(doc, '8.4', 'Clearance to Vacate.')
    para(doc, 'A Clearance to Vacate shall be issued to the Tenant once:')
    bullet(doc, 'All keys have been returned and utility meter readings recorded;')
    bullet(doc, 'The Statement of Repair Costs has been signed;')
    bullet(doc, 'Any repair costs exceeding the deposit held have been settled in full by the Tenant;')
    bullet(doc, 'All rent and outstanding charges have been paid.')
    doc.moveDown(0.1)
    para(doc, 'No Clearance to Vacate will be issued until all conditions above are met.')

    // ═══════════════════════════════════════════════════════════
    // 9. TENANT OBLIGATIONS
    // ═══════════════════════════════════════════════════════════
    clauseTitle(doc, '9. TENANT OBLIGATIONS')
    para(doc, 'The Tenant agrees to:')

    const obligations = [
      ['(a)', 'Keep the property clean and in good condition throughout the tenancy.'],
      ['(b)', 'Keep outdoor areas, common areas, and parking spaces clean and free from obstruction.'],
      ['(c)', 'Refrain from loud noises or disturbances that interfere with the peace and quiet of neighbouring occupants.'],
      ['(d)', 'Not paint or make any structural alterations without prior written consent from the Agent.'],
      ['(e)', 'Park vehicles only in designated spaces and keep those spaces free from oil drippings and grease.'],
      ['(f)', 'Not keep or store any flammable, hazardous, or explosive materials on the property.'],
      ['(g)', 'Not alter, replace, or add any lock or locking system without the Agent\u2019s prior written consent.'],
      ['(h)', 'Not keep pets on the property without the Agent\u2019s prior written consent.'],
      ['(i)', 'Pay for the repair of all damage caused by the Tenant, their guests, or household members.'],
      ['(j)', 'Pay for all utilities serving the property (electricity, water, internet) as applicable.'],
      ['(k)', 'Report any maintenance issue or defect to the Agent promptly in writing.'],
      ['(l)', 'Keep their contact details up to date with the Agent, and notify the Agent in advance of any extended absence from the property.'],
    ]
    for (const [lbl, text] of obligations) {
      ensureSpace(doc, 20)
      doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK)
        .text(`${lbl} `, { continued: true, indent: 20 })
      doc.font('Helvetica').text(text, { indent: 0 })
      doc.moveDown(0.15)
    }

    // ═══════════════════════════════════════════════════════════
    // 10. MAINTENANCE RESPONSIBILITIES
    // ═══════════════════════════════════════════════════════════
    clauseTitle(doc, '10. MAINTENANCE RESPONSIBILITIES')

    subClause(doc, '10.1', 'Tenant Responsibility.',
      'The Tenant is responsible for minor day-to-day maintenance arising from their use of the property, including replacement of light bulbs, minor tap washers, keeping drains free from blockage caused by misuse, and repair of any damage caused by the Tenant or their guests.')

    subClause(doc, '10.2', 'Landlord / Agent Responsibility.',
      'The Landlord (through the Agent) is responsible for structural repairs, maintenance of plumbing and electrical systems not caused by the Tenant\u2019s misuse, and upkeep of fixtures and fittings forming part of the property.')

    const emergencyLine = data.emergencyPhone || data.companyPhone
    subClause(doc, '10.3', 'Reporting.',
      `All maintenance requests must be submitted in writing to the Agent by email or WhatsApp; verbal reports alone are not sufficient. Emergencies (flooding, total power or water failure, security breach, fire or gas hazard) should be reported immediately via the emergency line: ${emergencyLine}.`)

    // ═══════════════════════════════════════════════════════════
    // 11. USE OF PROPERTY & SUBLETTING
    // ═══════════════════════════════════════════════════════════
    clauseTitle(doc, '11. USE OF PROPERTY & SUBLETTING')

    subClause(doc, '11.1', 'Residential Use Only.',
      'The property shall be used for residential occupation only. No commercial activity, business operation, or unregistered enterprise shall be conducted from the property.')

    subClause(doc, '11.2', 'No Short-Term Letting.',
      'The property may not be listed on or made available through any short-term rental platform (including but not limited to Airbnb, Booking.com, or similar services).')

    subClause(doc, '11.3', 'No Subletting.',
      'The Tenant may not sublet the whole or any part of the property without the prior written consent of the Agent.')

    subClause(doc, '11.4', 'Permitted Occupants.',
      'Only the Tenant(s) named in this Agreement and their immediate family members shall reside at the property.')

    // ═══════════════════════════════════════════════════════════
    // 12. BREACH & EVICTION
    // ═══════════════════════════════════════════════════════════
    clauseTitle(doc, '12. BREACH & EVICTION')

    para(doc, 'Violation of any material term of this Agreement, or non-payment of rent when due, constitutes grounds for eviction proceedings under applicable Kenyan law. The Agent reserves the right to issue a formal Notice to Remedy or Vacate where a breach remains uncured for more than fourteen (14) days after written notice is given to the Tenant.')

    // ═══════════════════════════════════════════════════════════
    // 13. COMPLAINTS & DISPUTE RESOLUTION
    // ═══════════════════════════════════════════════════════════
    clauseTitle(doc, '13. COMPLAINTS & DISPUTE RESOLUTION')

    subClause(doc, '13.1', 'Complaints.',
      'Complaints should be submitted in writing to the Agent. The Agent will acknowledge the complaint, investigate within two (2) business days, and provide a written response within five (5) business days.')

    subClause(doc, '13.2', 'Negotiation.',
      'Any dispute arising under this Agreement shall first be submitted to good-faith negotiation between the parties, who shall make every effort to resolve the matter within fourteen (14) days of written notice of the dispute.')

    subClause(doc, '13.3', 'Arbitration.',
      'If the dispute remains unresolved after fourteen (14) days, it shall be referred to a single arbitrator agreed upon by both parties, or in default of agreement, appointed by the Chairman of the Chartered Institute of Arbitrators, Kenya Branch, in accordance with the Arbitration Act (1995), Laws of Kenya.')

    subClause(doc, '13.4', 'Legal Costs.',
      'Each party shall bear its own legal costs unless a court or arbitrator expressly awards costs to one party.')

    // ═══════════════════════════════════════════════════════════
    // 14. GENERAL PROVISIONS
    // ═══════════════════════════════════════════════════════════
    clauseTitle(doc, '14. GENERAL PROVISIONS')

    subClause(doc, '14.1', 'Entire Agreement.',
      'This Agreement constitutes the entire agreement between the parties with respect to the tenancy and supersedes all prior verbal or written arrangements.')

    subClause(doc, '14.2', 'Amendments.',
      'Any variation to this Agreement must be agreed in writing and signed by both parties.')

    subClause(doc, '14.3', 'Governing Law.',
      'This Agreement shall be governed by and construed in accordance with the laws of Kenya.')

    subClause(doc, '14.4', 'Acknowledgement.',
      'Both parties confirm they have read, understood, and agree to be bound by this Agreement, and each has been provided with a signed copy.')

    // ═══════════════════════════════════════════════════════════
    // D. SIGNATURES
    // ═══════════════════════════════════════════════════════════
    sectionTitle(doc, 'D. Signatures')

    para(doc, 'IN WITNESS WHEREOF, the parties have set their hands on the date(s) written below.')
    doc.moveDown(1)

    // Signature blocks — two columns
    ensureSpace(doc, 220)
    const sigTop = doc.y
    const sigColW = CW / 2 - 10
    const sigLeftX = ML
    const sigRightX = ML + sigColW + 20

    // Header bars
    doc.save().rect(sigLeftX, sigTop, sigColW, 22).fill(NAVY).restore()
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF')
      .text('MANAGING AGENT', sigLeftX + 6, sigTop + 5, { width: sigColW - 12 })

    doc.save().rect(sigRightX, sigTop, sigColW, 22).fill(NAVY).restore()
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF')
      .text('TENANT(S)', sigRightX + 6, sigTop + 5, { width: sigColW - 12 })

    let sy = sigTop + 32
    const sigName = data.signatoryName
      ? `${data.companyName} \u2014 ${data.signatoryName}, ${data.signatoryTitle || ''}`
      : data.companyName
    doc.font('Helvetica').fontSize(10).fillColor(DARK)
      .text(sigName, sigLeftX, sy, { width: sigColW })
    doc.text(data.tenantName, sigRightX, sy, { width: sigColW })

    sy += 35
    // Signature lines
    const lineLen = sigColW - 20
    const fields = ['Signature', 'Full Name', 'Date', 'Witness Name & Signature']
    for (const field of fields) {
      doc.save()
        .moveTo(sigLeftX, sy).lineTo(sigLeftX + lineLen, sy)
        .strokeColor(DARK).lineWidth(0.5).stroke()
        .restore()
      doc.save()
        .moveTo(sigRightX, sy).lineTo(sigRightX + lineLen, sy)
        .strokeColor(DARK).lineWidth(0.5).stroke()
        .restore()

      doc.font('Helvetica').fontSize(9).fillColor(DARK)
        .text(field, sigLeftX, sy + 4, { width: lineLen })
      doc.text(field, sigRightX, sy + 4, { width: lineLen })
      sy += 38
    }

    // Final footer line
    doc.moveDown(2)
    ensureSpace(doc, 30)
    doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY)
      .text('TOCHI PROPERTY', { align: 'center', continued: true })
    doc.font('Helvetica').fillColor(DARK).text('  \u00B7  ', { continued: true })
    doc.font('Helvetica-Oblique').fillColor(GOLD).text('Your Property. Our Pride.', { align: 'center' })

    // ═══════════════════════════════════════════════════════════
    // POST-PROCESS: headers & footers on every page
    // ═══════════════════════════════════════════════════════════
    const range = doc.bufferedPageRange()
    const totalPages = range.count

    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i)

      // ── Header ──
      const hy = 30
      doc.save()
      doc.font('Helvetica-Bold').fontSize(14).fillColor(NAVY)
        .text('TOCHI PROPERTY', ML, hy, { width: CW })
      doc.font('Helvetica-Oblique').fontSize(10).fillColor(GOLD)
        .text('Your Property. Our Pride.', ML, hy + 3, { width: CW, align: 'right' })
      // gold rule
      doc.moveTo(ML, hy + 22).lineTo(PW - MR, hy + 22)
        .strokeColor(GOLD).lineWidth(1.5).stroke()
      doc.restore()

      // ── Footer ──
      const fy = PH - 45
      doc.save()
      doc.font('Helvetica').fontSize(8).fillColor('#888888')
        .text(`${data.companyName} \u00B7 ${data.companyEmail} \u00B7 ${data.companyWebsite}`, ML, fy, { width: CW })
      doc.font('Helvetica').fontSize(8).fillColor('#888888')
        .text(`Page ${i + 1} of ${totalPages}`, ML, fy, { width: CW, align: 'right' })
      doc.restore()
    }

    doc.end()
  })
}
