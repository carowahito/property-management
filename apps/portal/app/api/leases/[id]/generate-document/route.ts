import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

function fmtDate(date: Date): string {
  const d = new Date(date)
  const m = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`
}

function fmtKShs(n: number): string {
  return `KShs ${n.toLocaleString('en-KE')}/=`
}

function fmtNum(n: number): string { return n.toLocaleString('en-KE') }

const ONES = ['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen']
const TENS_W = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']
function numWords(n: number): string {
  if (n < 20) return ONES[n]
  if (n < 100) return TENS_W[Math.floor(n/10)] + (n%10 ? '-'+ONES[n%10] : '')
  return n.toString()
}
function ord(n: number): string {
  const s = ['th','st','nd','rd']; const v = n % 100
  return n + (s[(v-20)%10] || s[v] || s[0])
}
function monthsBetween(a: Date, b: Date): number {
  const da = new Date(a), db = new Date(b)
  return (db.getFullYear()-da.getFullYear())*12 + (db.getMonth()-da.getMonth())
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const lease = await prisma.lease.findUnique({
      where: { id },
      include: {
        tenant: true,
        property: { include: { company: true, landlord: true } },
        unitRef: { include: { landlord: true } },
      },
    })
    if (!lease) return NextResponse.json({ error: 'Lease not found' }, { status: 404 })

    const company = lease.property.company
    const companyName = company.name
    const companyEmail = company.email || 'info@tochiproperty.com'
    const companyPhone = company.phone || '+254721998499'
    const companyWebsite = company.website || 'tochiproperty.com'
    const unitNumber = lease.unitRef?.unitNumber || lease.unit || ''
    const rent = parseFloat(lease.monthlyRent.toString())
    const deposit = parseFloat(lease.securityDeposit.toString())
    const depMonths = Math.round(deposit / rent)
    const dur = monthsBetween(lease.startDate, lease.endDate)
    const durWords = numWords(dur)
    const graceDays = lease.gracePeriodDays ?? 5
    const graceWords = numWords(graceDays)
    const penalty = parseFloat(lease.latePenaltyPerDay.toString())
    const noticeDays = (lease.noticePeriod ?? 1) * 30
    const noticeDaysWords = numWords(noticeDays)
    const escalation = lease.rentEscalation ? parseFloat(lease.rentEscalation.toString()) : 10
    const rentDueDay = lease.rentDueDay ?? 1
    const emergencyPhone = companyPhone

    // Build full HTML matching the Tochi Property Tenancy Agreement Template
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 60px 55px; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; color: #333; line-height: 1.7; }
  .page { max-width: 750px; margin: 0 auto; padding: 40px 0; }
  .header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #C49A3C; padding-bottom: 8px; margin-bottom: 24px; }
  .header-name { font-size: 14pt; font-weight: bold; color: #1B3A5C; }
  .header-tagline { font-size: 10pt; font-style: italic; color: #C49A3C; }
  h1 { font-size: 18pt; text-align: center; color: #333; margin-bottom: 4px; }
  .subtitle { text-align: center; font-size: 11pt; margin-bottom: 24px; }
  .section-title { font-size: 13pt; font-weight: bold; color: #1B3A5C; border-bottom: 2px solid #C49A3C; padding-bottom: 4px; margin: 20px 0 12px; }
  .clause-title { font-size: 11pt; font-weight: bold; color: #1B3A5C; margin: 22px 0 10px; }
  .sub-clause { margin-bottom: 10px; }
  .sub-num { font-weight: bold; }
  table.terms { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9pt; }
  table.terms th { background: #1B3A5C; color: #fff; padding: 6px 8px; text-align: left; font-weight: bold; }
  table.terms td { padding: 6px 8px; border: 1px solid #ccc; vertical-align: top; }
  table.terms td:first-child { font-weight: bold; }
  .bullet-list { margin: 8px 0 10px 24px; }
  .bullet-list li { margin-bottom: 6px; }
  .obligation { margin-left: 20px; margin-bottom: 8px; }
  .obl-label { font-weight: bold; }
  .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
  .sig-box-header { background: #1B3A5C; color: #fff; font-weight: bold; font-size: 10pt; padding: 5px 8px; }
  .sig-line { border-bottom: 1px solid #333; margin: 28px 0 4px; }
  .sig-label { font-size: 9pt; color: #555; margin-bottom: 8px; }
  .footer { margin-top: 24px; text-align: center; font-size: 8pt; color: #888; }
  .bold { font-weight: bold; }
  @media print { .page { padding: 0; } }
</style>
</head>
<body>
<div class="page">

<div class="header">
  <span class="header-name">TOCHI PROPERTY</span>
  <span class="header-tagline">Your Property. Our Pride.</span>
</div>

<h1>RESIDENTIAL TENANCY AGREEMENT</h1>
<p class="subtitle">Property: ${companyName === 'Tochi Property' ? '' : companyName + ', '}${lease.property.name}, Unit ${unitNumber}</p>

<!-- A. PARTIES -->
<div class="section-title">A. Parties to this Agreement</div>

<p class="bold" style="margin-bottom:6px;">MANAGING AGENT</p>
<table class="terms">
  <tr><td style="width:140px;">Name</td><td>${companyName}</td></tr>
  <tr><td>Email</td><td>${companyEmail}</td></tr>
  <tr><td>Mobile</td><td>${companyPhone}</td></tr>
  <tr><td>Website</td><td>${companyWebsite}</td></tr>
  <tr><td>Acting for</td><td>The registered owner of the property (the &ldquo;<strong>Landlord</strong>&rdquo;), for whom ${companyName} acts as managing agent.</td></tr>
</table>

<p class="bold" style="margin-bottom:6px;">TENANT(S)</p>
<table class="terms">
  <tr><td>Full Name</td><td>${lease.tenant.name}</td></tr>
  <tr><td>National ID / Passport No.</td><td>${lease.tenant.idNumber || 'N/A'}</td></tr>
  <tr><td>Email Address</td><td>${lease.tenant.email}</td></tr>
  <tr><td>Mobile Number</td><td>${lease.tenant.phone}</td></tr>
</table>

<!-- B. KEY TERMS -->
<div class="section-title">B. Key Terms Summary</div>
<table class="terms">
  <tr><td style="width:160px;">Property Address</td><td>${lease.property.address}, ${lease.property.name}, Unit ${unitNumber}</td></tr>
  <tr><td>Monthly Rent</td><td>${fmtKShs(rent)} per month</td></tr>
  <tr><td>Rent Due Date</td><td>${ord(rentDueDay)} day of each calendar month, in advance</td></tr>
  <tr><td>Grace Period</td><td>${graceDays} days &mdash; rent not received by Day ${graceDays} is overdue</td></tr>
  <tr><td>Late Payment Penalty</td><td>KShs ${fmtNum(penalty)} per day, charged from Day ${graceDays + 1} onwards</td></tr>
  <tr><td>Security Deposit</td><td>${fmtKShs(deposit)} (equivalent to ${depMonths} month(s)&rsquo; rent)</td></tr>
  <tr><td>Lease Start Date</td><td>${fmtDate(lease.startDate)}</td></tr>
  <tr><td>Lease End Date</td><td>${fmtDate(lease.endDate)} (${dur} months from start date)</td></tr>
  <tr><td>Notice Period</td><td>${noticeDays} days&rsquo; written notice by either party</td></tr>
  <tr><td>Annual Rent Escalation</td><td>${escalation}% per annum &mdash; see Clause 5</td></tr>
  <tr><td>Permitted Use</td><td>Residential occupation only</td></tr>
</table>

<!-- C. AGREEMENT -->
<div class="section-title">C. Agreement</div>
<p>This Agreement is entered into between <strong>${companyName}</strong> (the &ldquo;Agent&rdquo;, acting for and on behalf of the Landlord) and <strong>${lease.tenant.name}</strong> (the &ldquo;Tenant&rdquo;), for the lease of the property described in Section B above. Both parties agree to be bound by the terms and conditions set out below.</p>

<!-- 1. RENT & PAYMENT -->
<div class="clause-title">1. RENT &amp; PAYMENT</div>
<p class="sub-clause"><span class="sub-num">1.1 Amount &amp; Due Date.</span> The monthly rent is as stated in Section B, payable in advance on the ${ord(rentDueDay)} day of each calendar month.</p>
<p class="sub-clause"><span class="sub-num">1.2 Grace Period.</span> A grace period of ${graceWords} (${graceDays}) days applies. Rent not received by the ${ord(graceDays)} of the month is overdue and the late payment penalty applies from Day ${graceDays + 1}.</p>
<p class="sub-clause"><span class="sub-num">1.3 Late Payment Penalty.</span> A penalty of KShs ${fmtNum(penalty)}/= per day is charged for every day the rent remains unpaid from Day ${graceDays + 1} of the calendar month, accruing daily until the outstanding amount is paid in full. The Agent will notify the Tenant in writing of the rent outstanding, the penalty accrued, and the total amount due.</p>
<p class="sub-clause"><span class="sub-num">1.4 Permitted Payment Methods.</span> All payments must be made via one of the following methods only:</p>
<ul class="bullet-list">
  <li>Payment details to be advised by the Agent.</li>
</ul>
<p class="sub-clause">Cash payments will <strong>not</strong> be accepted. Payments must clear before any receipt is issued.</p>
<p class="sub-clause"><span class="sub-num">1.5 Receipts.</span> An official receipt is issued automatically for every payment received, stating the amount paid, the period covered, and the payment reference number.</p>
<p class="sub-clause"><span class="sub-num">1.6 Arrears.</span> Where rent remains unpaid, the Agent will issue written arrears notices and may issue a formal Notice to Remedy or Vacate where arrears remain unresolved, without prejudice to Clause 12.</p>

<!-- 2. SECURITY DEPOSIT -->
<div class="clause-title">2. SECURITY DEPOSIT</div>
<p class="sub-clause"><span class="sub-num">2.1 Amount.</span> Prior to moving in, the Tenant shall pay a security deposit of ${fmtKShs(deposit)} as stated in Section B. The deposit must be received and cleared before keys are released.</p>
<p class="sub-clause"><span class="sub-num">2.2 Holding.</span> The deposit is held against the Tenant&rsquo;s obligations under this Agreement. It shall not be applied to any purpose other than those set out in Clause 2.4, and any balance remaining after lawful deductions shall be refunded in accordance with Clause 2.6.</p>
<p class="sub-clause"><span class="sub-num">2.3 No Commutation.</span> The security deposit shall under no circumstances be applied as payment for rent during or at the end of the tenancy.</p>
<p class="sub-clause"><span class="sub-num">2.4 Permitted Deductions.</span> At the end of the tenancy, deductions from the deposit are only permitted for:</p>
<ul class="bullet-list">
  <li>Unpaid rent or other charges confirmed in writing;</li>
  <li>Damage to the property or its contents beyond fair wear and tear, evidenced by comparison of the move-in and move-out inspection reports (including photographic evidence);</li>
  <li>Professional cleaning costs where the property is left below its move-in standard (cleaning invoice required);</li>
  <li>Replacement of lost or damaged inventory items as evidenced by the signed inventory list at move-in;</li>
  <li>Any breach of this Agreement resulting in a quantifiable financial loss.</li>
</ul>
<p class="sub-clause"><span class="sub-num">2.5 Non-Permitted Deductions.</span> The following shall not be deducted from the deposit:</p>
<ul class="bullet-list">
  <li>Normal fair wear and tear (light scuffs, minor marks, faded paint);</li>
  <li>Pre-existing damage documented on the move-in inspection report;</li>
  <li>Structural repairs or maintenance that are the Landlord&rsquo;s responsibility.</li>
</ul>
<p class="sub-clause"><span class="sub-num">2.6 Refund Timeline.</span> The deposit (or balance after permitted deductions) shall be refunded within ten (10) business days of completion of the move-out inspection, together with an itemised deposit settlement statement detailing any deductions made.</p>
<p class="sub-clause"><span class="sub-num">2.7 Disputed Deductions.</span> If the Tenant disputes any deduction, they must notify the Agent in writing within five (5) business days of receiving the settlement statement. The parties shall attempt to resolve the dispute within a further five (5) business days, failing which the dispute shall be referred to the process in Clause 13.</p>

<!-- 3. LEASE TERM & RENEWAL -->
<div class="clause-title">3. LEASE TERM &amp; RENEWAL</div>
<p class="sub-clause"><span class="sub-num">3.1 Fixed Term.</span> This Agreement is for a fixed term of ${durWords} (${dur}) months commencing and expiring on the dates stated in Section B.</p>
<p class="sub-clause"><span class="sub-num">3.2 Renewal.</span> This Agreement may be renewed for further periods upon mutual written agreement of both parties. The Agent shall contact the Tenant before the expiry date regarding renewal terms.</p>
<p class="sub-clause"><span class="sub-num">3.3 Periodic Tenancy.</span> If the fixed term expires without either party issuing a notice to terminate or a new fixed-term agreement being signed, the tenancy converts to a month-to-month periodic tenancy on the same terms until terminated in accordance with Clause 4.</p>

<!-- 4. NOTICE PERIOD & TERMINATION -->
<div class="clause-title">4. NOTICE PERIOD &amp; TERMINATION</div>
<p class="sub-clause"><span class="sub-num">4.1 Tenant Notice.</span> The Tenant shall give at least ${noticeDaysWords} (${noticeDays}) days&rsquo; written notice before vacating, submitted by email or hand-delivered letter to the Agent.</p>
<p class="sub-clause"><span class="sub-num">4.2 Rent During Notice.</span> The Tenant is liable for rent for the full duration of the notice period, irrespective of whether they vacate earlier.</p>
<p class="sub-clause"><span class="sub-num">4.3 Agent / Landlord Notice.</span> The Agent shall give at least ${noticeDaysWords} (${noticeDays}) days&rsquo; written notice to the Tenant to vacate, except where the Tenant is in material breach of this Agreement.</p>

<!-- 5. RENT REVIEW & ESCALATION -->
<div class="clause-title">5. RENT REVIEW &amp; ESCALATION</div>
<p class="sub-clause"><span class="sub-num">5.1 Annual Review.</span> The rent shall be reviewed annually at the end of each 12-month lease term. Rent may only be increased once per 12-month tenancy period unless otherwise agreed in writing.</p>
<p class="sub-clause"><span class="sub-num">5.2 Notice of Increase.</span> The Agent shall notify the Tenant of any proposed rent increase in writing before the new rate takes effect.</p>
<p class="sub-clause"><span class="sub-num">5.3 Escalation Basis.</span> The annual rent escalation is ${escalation}% of the then-current monthly rent, unless otherwise agreed in writing by both parties. Any increase will be market-referenced.</p>

<!-- 6. MOVE-IN INSPECTION -->
<div class="clause-title">6. MOVE-IN INSPECTION</div>
<p class="sub-clause"><span class="sub-num">6.1 Initial Inspection.</span> A digital Move-In Inspection Report shall be completed by the Agent and the Tenant on or before move-in day, documenting the condition of every room, wall, floor, ceiling, door, window, fixture, fitting, and appliance with photographic evidence.</p>
<p class="sub-clause"><span class="sub-num">6.2 Binding Record.</span> The signed move-in inspection report forms the definitive record of the property&rsquo;s condition at commencement and is the baseline for any deposit deduction assessment at move-out.</p>

<!-- 7. INSPECTIONS DURING TENANCY -->
<div class="clause-title">7. INSPECTIONS DURING TENANCY</div>
<p class="sub-clause"><span class="sub-num">7.1 Routine Inspections.</span> The Agent is entitled to inspect the property at reasonable intervals. Routine inspections take place every six (6) months, with an additional inspection three (3) months after move-in for new tenancies.</p>
<p class="sub-clause"><span class="sub-num">7.2 Notice.</span> The Agent shall provide at least twenty-four (24) hours&rsquo; written notice before any routine inspection, via email, SMS, or WhatsApp.</p>
<p class="sub-clause"><span class="sub-num">7.3 Emergency Access.</span> In an emergency (flooding, fire, structural failure, security breach), the Agent or Landlord may access the property without prior notice and shall notify the Tenant as soon as practicable thereafter.</p>
<p class="sub-clause"><span class="sub-num">7.4 Reports.</span> Inspection reports, including photographs, are signed digitally by both the inspector and the Tenant and a copy is provided to the Tenant.</p>

<!-- 8. MOVE-OUT PROCESS -->
<div class="clause-title">8. MOVE-OUT PROCESS &amp; CLEARANCE TO VACATE</div>
<p class="sub-clause"><span class="sub-num">8.1 Pre-Move-Out Inspection.</span> At least two (2) weeks before the agreed move-out date, the Agent shall conduct a pre-move-out advisory inspection and advise the Tenant in writing of any items to remedy before vacating.</p>
<p class="sub-clause"><span class="sub-num">8.2 Final Inspection.</span> On move-out day, a final inspection shall be conducted with the Tenant, the Agent, and ${companyName}&rsquo;s appointed general contractor present, compared side-by-side against the move-in report. The contractor shall assess and cost all repairs or remedial works required.</p>
<p class="sub-clause"><span class="sub-num">8.3 Statement of Repair Costs.</span> The Agent and contractor shall jointly produce a Statement of Repair Costs, which the Tenant must sign before vacating. This statement forms the basis for any deposit deductions.</p>
<p class="sub-clause"><span class="sub-num">8.4 Clearance to Vacate.</span> A Clearance to Vacate shall be issued to the Tenant once:</p>
<ul class="bullet-list">
  <li>All keys have been returned and utility meter readings recorded;</li>
  <li>The Statement of Repair Costs has been signed;</li>
  <li>Any repair costs exceeding the deposit held have been settled in full by the Tenant;</li>
  <li>All rent and outstanding charges have been paid.</li>
</ul>
<p class="sub-clause">No Clearance to Vacate will be issued until all conditions above are met.</p>

<!-- 9. TENANT OBLIGATIONS -->
<div class="clause-title">9. TENANT OBLIGATIONS</div>
<p>The Tenant agrees to:</p>
<p class="obligation"><span class="obl-label">(a)</span> Keep the property clean and in good condition throughout the tenancy.</p>
<p class="obligation"><span class="obl-label">(b)</span> Keep outdoor areas, common areas, and parking spaces clean and free from obstruction.</p>
<p class="obligation"><span class="obl-label">(c)</span> Refrain from loud noises or disturbances that interfere with the peace and quiet of neighbouring occupants.</p>
<p class="obligation"><span class="obl-label">(d)</span> Not paint or make any structural alterations without prior written consent from the Agent.</p>
<p class="obligation"><span class="obl-label">(e)</span> Park vehicles only in designated spaces and keep those spaces free from oil drippings and grease.</p>
<p class="obligation"><span class="obl-label">(f)</span> Not keep or store any flammable, hazardous, or explosive materials on the property.</p>
<p class="obligation"><span class="obl-label">(g)</span> Not alter, replace, or add any lock or locking system without the Agent&rsquo;s prior written consent.</p>
<p class="obligation"><span class="obl-label">(h)</span> Not keep pets on the property without the Agent&rsquo;s prior written consent.</p>
<p class="obligation"><span class="obl-label">(i)</span> Pay for the repair of all damage caused by the Tenant, their guests, or household members.</p>
<p class="obligation"><span class="obl-label">(j)</span> Pay for all utilities serving the property (electricity, water, internet) as applicable.</p>
<p class="obligation"><span class="obl-label">(k)</span> Report any maintenance issue or defect to the Agent promptly in writing.</p>
<p class="obligation"><span class="obl-label">(l)</span> Keep their contact details up to date with the Agent, and notify the Agent in advance of any extended absence from the property.</p>

<!-- 10. MAINTENANCE -->
<div class="clause-title">10. MAINTENANCE RESPONSIBILITIES</div>
<p class="sub-clause"><span class="sub-num">10.1 Tenant Responsibility.</span> The Tenant is responsible for minor day-to-day maintenance arising from their use of the property, including replacement of light bulbs, minor tap washers, keeping drains free from blockage caused by misuse, and repair of any damage caused by the Tenant or their guests.</p>
<p class="sub-clause"><span class="sub-num">10.2 Landlord / Agent Responsibility.</span> The Landlord (through the Agent) is responsible for structural repairs, maintenance of plumbing and electrical systems not caused by the Tenant&rsquo;s misuse, and upkeep of fixtures and fittings forming part of the property.</p>
<p class="sub-clause"><span class="sub-num">10.3 Reporting.</span> All maintenance requests must be submitted in writing to the Agent by email or WhatsApp; verbal reports alone are not sufficient. Emergencies (flooding, total power or water failure, security breach, fire or gas hazard) should be reported immediately via the emergency line: ${emergencyPhone}.</p>

<!-- 11. USE OF PROPERTY & SUBLETTING -->
<div class="clause-title">11. USE OF PROPERTY &amp; SUBLETTING</div>
<p class="sub-clause"><span class="sub-num">11.1 Residential Use Only.</span> The property shall be used for residential occupation only. No commercial activity, business operation, or unregistered enterprise shall be conducted from the property.</p>
<p class="sub-clause"><span class="sub-num">11.2 No Short-Term Letting.</span> The property may not be listed on or made available through any short-term rental platform (including but not limited to Airbnb, Booking.com, or similar services).</p>
<p class="sub-clause"><span class="sub-num">11.3 No Subletting.</span> The Tenant may not sublet the whole or any part of the property without the prior written consent of the Agent.</p>
<p class="sub-clause"><span class="sub-num">11.4 Permitted Occupants.</span> Only the Tenant(s) named in this Agreement and their immediate family members shall reside at the property.</p>

<!-- 12. BREACH & EVICTION -->
<div class="clause-title">12. BREACH &amp; EVICTION</div>
<p>Violation of any material term of this Agreement, or non-payment of rent when due, constitutes grounds for eviction proceedings under applicable Kenyan law. The Agent reserves the right to issue a formal Notice to Remedy or Vacate where a breach remains uncured for more than fourteen (14) days after written notice is given to the Tenant.</p>

<!-- 13. COMPLAINTS & DISPUTE RESOLUTION -->
<div class="clause-title">13. COMPLAINTS &amp; DISPUTE RESOLUTION</div>
<p class="sub-clause"><span class="sub-num">13.1 Complaints.</span> Complaints should be submitted in writing to the Agent. The Agent will acknowledge the complaint, investigate within two (2) business days, and provide a written response within five (5) business days.</p>
<p class="sub-clause"><span class="sub-num">13.2 Negotiation.</span> Any dispute arising under this Agreement shall first be submitted to good-faith negotiation between the parties, who shall make every effort to resolve the matter within fourteen (14) days of written notice of the dispute.</p>
<p class="sub-clause"><span class="sub-num">13.3 Arbitration.</span> If the dispute remains unresolved after fourteen (14) days, it shall be referred to a single arbitrator agreed upon by both parties, or in default of agreement, appointed by the Chairman of the Chartered Institute of Arbitrators, Kenya Branch, in accordance with the Arbitration Act (1995), Laws of Kenya.</p>
<p class="sub-clause"><span class="sub-num">13.4 Legal Costs.</span> Each party shall bear its own legal costs unless a court or arbitrator expressly awards costs to one party.</p>

<!-- 14. GENERAL PROVISIONS -->
<div class="clause-title">14. GENERAL PROVISIONS</div>
<p class="sub-clause"><span class="sub-num">14.1 Entire Agreement.</span> This Agreement constitutes the entire agreement between the parties with respect to the tenancy and supersedes all prior verbal or written arrangements.</p>
<p class="sub-clause"><span class="sub-num">14.2 Amendments.</span> Any variation to this Agreement must be agreed in writing and signed by both parties.</p>
<p class="sub-clause"><span class="sub-num">14.3 Governing Law.</span> This Agreement shall be governed by and construed in accordance with the laws of Kenya.</p>
<p class="sub-clause"><span class="sub-num">14.4 Acknowledgement.</span> Both parties confirm they have read, understood, and agree to be bound by this Agreement, and each has been provided with a signed copy.</p>

<!-- D. SIGNATURES -->
<div class="section-title">D. Signatures</div>
<p>IN WITNESS WHEREOF, the parties have set their hands on the date(s) written below.</p>

<div class="sig-grid">
  <div>
    <div class="sig-box-header">MANAGING AGENT</div>
    <p style="margin-top:8px;">${companyName}</p>
    <div class="sig-line"></div><p class="sig-label">Signature</p>
    <div class="sig-line"></div><p class="sig-label">Full Name</p>
    <div class="sig-line"></div><p class="sig-label">Date</p>
    <div class="sig-line"></div><p class="sig-label">Witness Name &amp; Signature</p>
  </div>
  <div>
    <div class="sig-box-header">TENANT(S)</div>
    <p style="margin-top:8px;">${lease.tenant.name}</p>
    <div class="sig-line"></div><p class="sig-label">Signature</p>
    <div class="sig-line"></div><p class="sig-label">Full Name</p>
    <div class="sig-line"></div><p class="sig-label">Date</p>
    <div class="sig-line"></div><p class="sig-label">Witness Name &amp; Signature</p>
  </div>
</div>

<div class="footer">
  <strong>TOCHI PROPERTY</strong> &middot; <em style="color:#C49A3C;">Your Property. Our Pride.</em>
</div>

</div>
</body>
</html>`

    // Save the rendered document
    await prisma.lease.update({
      where: { id },
      data: { documentHtml: html },
    })

    return NextResponse.json({
      message: 'Lease document generated successfully',
      documentHtml: html,
    })
  } catch (error) {
    console.error('Error generating lease document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
