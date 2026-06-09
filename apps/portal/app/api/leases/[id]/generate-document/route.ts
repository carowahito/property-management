import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function formatDate(date: Date): string {
  const d = new Date(date)
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function formatCurrency(amount: number | any): string {
  const num = typeof amount === 'object' ? parseFloat(amount.toString()) : Number(amount)
  return `KES ${num.toLocaleString('en-KE')}`
}

function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '')
  }
  return result
}

// Built-in Kenyan Residential Tenancy Agreement template — matches GWG4-K55 reference format
const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Residential Tenancy Agreement — {{property_ref}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 1.55; color: #1a1a1a; background: #fff; }
    .page { max-width: 840px; margin: 0 auto; padding: 40px 52px; }
    .doc-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1A3A5C; padding-bottom: 14px; margin-bottom: 20px; }
    .brand-name { font-size: 15pt; font-weight: 700; color: #1A3A5C; letter-spacing: 2px; text-transform: uppercase; }
    .brand-sub { font-size: 8.5pt; color: #666; margin-top: 3px; }
    .header-right { text-align: right; font-size: 8.5pt; color: #666; line-height: 1.8; }
    .confidential { font-size: 7.5pt; font-weight: 700; color: #fff; background: #1A3A5C; padding: 2px 7px; border-radius: 2px; display: inline-block; margin-bottom: 3px; }
    .doc-title { text-align: center; margin: 20px 0 6px; }
    .doc-title h1 { font-size: 13.5pt; font-weight: 800; color: #1A3A5C; letter-spacing: 1px; text-transform: uppercase; }
    .doc-ref { text-align: center; font-size: 9pt; color: #555; margin-bottom: 22px; }
    .section-hdr { background: #1A3A5C; color: #fff; padding: 6px 14px; font-size: 9.5pt; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin: 22px 0 10px; }
    .parties-wrap { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #c8d5e0; margin-bottom: 10px; }
    .party-block { padding: 11px 14px; border-right: 1px solid #c8d5e0; }
    .party-block:last-child { border-right: none; }
    .tenants-row { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #c8d5e0; margin-bottom: 10px; }
    .party-title { font-weight: 700; font-size: 8.5pt; color: #1A3A5C; text-transform: uppercase; border-bottom: 1px solid #e0e7ef; padding-bottom: 5px; margin-bottom: 7px; }
    .prow { display: flex; gap: 6px; font-size: 9pt; margin-bottom: 3px; }
    .plabel { font-weight: 600; color: #444; min-width: 110px; flex-shrink: 0; }
    table.terms { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9pt; }
    table.terms th { background: #1A3A5C; color: #fff; padding: 6px 11px; text-align: left; font-weight: 600; }
    table.terms td { padding: 5px 11px; border-bottom: 1px solid #e0e7ef; vertical-align: top; }
    table.terms tr:nth-child(even) td { background: #f5f8fb; }
    table.terms td:first-child { font-weight: 600; color: #333; width: 38%; }
    .clause { margin-bottom: 14px; }
    .clause-num { font-weight: 700; color: #1A3A5C; font-size: 9.5pt; border-left: 4px solid #E8960C; padding-left: 10px; margin-bottom: 7px; text-transform: uppercase; }
    .sub-clause { margin: 5px 0 5px 14px; font-size: 9pt; }
    .sub-num { font-weight: 700; }
    .blist { margin: 5px 0 5px 28px; }
    .blist li { margin-bottom: 3px; font-size: 9pt; }
    .alist { list-style-type: lower-alpha; padding-left: 26px; margin: 5px 0; }
    .alist li { margin-bottom: 4px; font-size: 9pt; }
    .sig-section { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 36px; }
    .sig-block { border: 1px solid #c8d5e0; padding: 14px; }
    .sig-block-title { font-weight: 700; color: #1A3A5C; font-size: 9pt; text-transform: uppercase; border-bottom: 1px solid #e0e7ef; padding-bottom: 5px; margin-bottom: 12px; }
    .sig-line { border-bottom: 1px solid #333; margin: 34px 0 5px; }
    .sig-label { font-size: 8.5pt; color: #555; margin-bottom: 9px; }
    .witness-block { margin-top: 14px; padding-top: 9px; border-top: 1px dashed #ddd; }
    .doc-footer { margin-top: 28px; border-top: 1px solid #ddd; padding-top: 8px; text-align: center; font-size: 8pt; color: #999; }
    @media print { .page { padding: 18px 30px; } }
  </style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="doc-header">
    <div>
      <div class="brand-name">Tochi Property</div>
      <div class="brand-sub">Your Property. Our Pride. &nbsp;·&nbsp; info@tochiproperty.com</div>
    </div>
    <div class="header-right">
      <span class="confidential">CONFIDENTIAL</span><br>
      Ref: {{property_ref}}<br>
      Date: {{agreement_date}}
    </div>
  </div>

  <div class="doc-title"><h1>Residential Tenancy Agreement</h1></div>
  <p class="doc-ref">This agreement is entered into by the parties identified in Section A below and is governed by the laws of Kenya.</p>

  <!-- SECTION A: PARTIES -->
  <div class="section-hdr">A &nbsp;&nbsp; Parties</div>

  <div class="parties-wrap">
    <div class="party-block">
      <div class="party-title">Landlord / Managing Agent</div>
      <div class="prow"><span class="plabel">Name:</span><span>{{landlord_name}}</span></div>
      <div class="prow"><span class="plabel">Email:</span><span>{{landlord_email}}</span></div>
      <div class="prow"><span class="plabel">Mobile:</span><span>{{landlord_phone}}</span></div>
      <div class="prow"><span class="plabel">Managed by:</span><span>Tochi Property</span></div>
      <div class="prow"><span class="plabel">Agent Email:</span><span>info@tochiproperty.com</span></div>
    </div>
    <div class="party-block">
      <div class="party-title">Property</div>
      <div class="prow"><span class="plabel">Name:</span><span>{{property_name}}</span></div>
      <div class="prow"><span class="plabel">Address:</span><span>{{property_address}}</span></div>
      <div class="prow"><span class="plabel">Unit / Apt:</span><span>{{unit_number}}</span></div>
      <div class="prow"><span class="plabel">Type:</span><span>{{property_type}}</span></div>
    </div>
  </div>

  <div class="tenants-row">
    <div class="party-block">
      <div class="party-title">Tenant 1</div>
      <div class="prow"><span class="plabel">Full Name:</span><span>{{tenant_name}}</span></div>
      <div class="prow"><span class="plabel">ID / Passport No.:</span><span>{{tenant_id_number}}</span></div>
      <div class="prow"><span class="plabel">Email Address:</span><span>{{tenant_email}}</span></div>
      <div class="prow"><span class="plabel">Mobile Number:</span><span>{{tenant_phone}}</span></div>
    </div>
    <div class="party-block">
      <div class="party-title">Tenant 2 &nbsp;<span style="font-weight:400;color:#999;font-size:8pt;">(if applicable)</span></div>
      <div class="prow"><span class="plabel">Full Name:</span><span>{{tenant2_name}}</span></div>
      <div class="prow"><span class="plabel">ID / Passport No.:</span><span>{{tenant2_id_number}}</span></div>
      <div class="prow"><span class="plabel">Email Address:</span><span>{{tenant2_email}}</span></div>
      <div class="prow"><span class="plabel">Mobile Number:</span><span>{{tenant2_phone}}</span></div>
    </div>
  </div>

  <!-- SECTION B: KEY TERMS -->
  <div class="section-hdr">B &nbsp;&nbsp; Key Terms Summary</div>

  <table class="terms">
    <tr><th>Term</th><th>Detail</th></tr>
    <tr><td>Property Address</td><td>{{property_address}}, {{property_name}}</td></tr>
    <tr><td>Monthly Rent</td><td>{{monthly_rent}}</td></tr>
    <tr><td>Rent Due Date</td><td>{{rent_due_day_ordinal}} of each month</td></tr>
    <tr><td>Grace Period</td><td>{{grace_period_days}} days from due date</td></tr>
    <tr><td>Late Payment Penalty</td><td>KES {{late_penalty_per_day}} per day after grace period</td></tr>
    <tr><td>Security Deposit</td><td>{{security_deposit}}</td></tr>
    <tr><td>Lease Start Date</td><td>{{lease_start_date}}</td></tr>
    <tr><td>Lease End Date</td><td>{{lease_end_date}}</td></tr>
    <tr><td>Notice Period</td><td>{{notice_period_days}} days</td></tr>
    <tr><td>Permitted Use</td><td>Residential occupation only</td></tr>
  </table>

  <!-- SECTION C: AGREEMENT -->
  <div class="section-hdr">C &nbsp;&nbsp; Agreement</div>

  <div class="clause">
    <div class="clause-num">1. &nbsp; Rent &amp; Payment</div>
    <div class="sub-clause"><span class="sub-num">1.1 Amount &amp; Due Date.</span> The Tenant agrees to pay a monthly rent of <strong>{{monthly_rent}}</strong>, due on the <strong>{{rent_due_day_ordinal}}</strong> of each calendar month.</div>
    <div class="sub-clause"><span class="sub-num">1.2 Grace Period.</span> A grace period of <strong>{{grace_period_days}} days</strong> is granted after the due date. Rent received within this window will not attract a late penalty.</div>
    <div class="sub-clause"><span class="sub-num">1.3 Late Payment Penalty.</span> Rent not received by the end of the grace period will attract a penalty of <strong>KES {{late_penalty_per_day}} per day</strong> for every day beyond the grace period until the full outstanding balance is cleared.</div>
    <div class="sub-clause"><span class="sub-num">1.4 Permitted Payment Methods.</span> Rent shall be paid via:
      <ul class="blist">
        <li><strong>M-Pesa Till:</strong> {{mpesa_details}}</li>
        <li><strong>Bank EFT:</strong> {{bank_details}}</li>
        <li>The Tenant must include their name and unit number as the payment reference for all transactions.</li>
      </ul>
    </div>
    <div class="sub-clause"><span class="sub-num">1.5 Receipts.</span> Tochi Property will issue digital payment receipts via the tenant portal or email for all rent received.</div>
  </div>

  <div class="clause">
    <div class="clause-num">2. &nbsp; Security Deposit</div>
    <div class="sub-clause"><span class="sub-num">2.1 Amount.</span> A security deposit of <strong>{{security_deposit}}</strong> is payable at or before the commencement date of this agreement.</div>
    <div class="sub-clause"><span class="sub-num">2.2 Holding.</span> The deposit is held by Tochi Property on behalf of the Landlord in a designated account and does not attract interest.</div>
    <div class="sub-clause"><span class="sub-num">2.3 No Commutation.</span> The security deposit may not be used by the Tenant in lieu of rent at any time during the tenancy.</div>
    <div class="sub-clause"><span class="sub-num">2.4 Permitted Deductions.</span> The Landlord/Agent may deduct from the deposit: (i) unpaid rent or service charges; (ii) costs of repairing damage beyond fair wear and tear; (iii) cleaning costs if the property is not returned in a clean condition; and (iv) any other amounts lawfully owed under this agreement.</div>
    <div class="sub-clause"><span class="sub-num">2.5 Non-Permitted Deductions.</span> No deduction shall be made for fair wear and tear resulting from normal residential use of the Premises.</div>
    <div class="sub-clause"><span class="sub-num">2.6 Refund Timeline.</span> The deposit (less any lawful deductions) shall be refunded within <strong>10 business days</strong> after the Tenant vacates, completes the move-out inspection, and returns all keys and access devices.</div>
    <div class="sub-clause"><span class="sub-num">2.7 Disputed Deductions.</span> If the Tenant disputes any proposed deduction, the parties shall follow the dispute resolution process in Clause 13.</div>
  </div>

  <div class="clause">
    <div class="clause-num">3. &nbsp; Lease Term &amp; Renewal</div>
    <div class="sub-clause"><span class="sub-num">3.1 Fixed Term.</span> This agreement is for a fixed term commencing <strong>{{lease_start_date}}</strong> and expiring on <strong>{{lease_end_date}}</strong> (a period of <strong>{{lease_duration_months}} months</strong>).</div>
    <div class="sub-clause"><span class="sub-num">3.2 Renewal.</span> If either party wishes to renew or not renew, written notice must be given at least <strong>60 days</strong> before the expiry date. Failure to give timely notice by either party will result in the agreement continuing on a periodic basis per Clause 3.3.</div>
    <div class="sub-clause"><span class="sub-num">3.3 Periodic Tenancy.</span> If not renewed or terminated at the end of the fixed term, this agreement shall continue <strong>month-to-month</strong> under the same terms, terminable by either party on <strong>{{notice_period_days}} days</strong> written notice.</div>
  </div>

  <div class="clause">
    <div class="clause-num">4. &nbsp; Notice Period &amp; Termination</div>
    <div class="sub-clause"><span class="sub-num">4.1 Tenant Notice.</span> The Tenant must give Tochi Property a minimum of <strong>{{notice_period_days}} days</strong> written notice of intention to vacate. Notice may be given by email to info@tochiproperty.com or in writing to the managing agent's office.</div>
    <div class="sub-clause"><span class="sub-num">4.2 Rent During Notice.</span> The Tenant is liable to pay rent in full for the entire notice period regardless of the date of actual departure. The security deposit may not be applied to offset rent due during the notice period.</div>
    <div class="sub-clause"><span class="sub-num">4.3 Landlord/Agent Notice.</span> The Landlord/Agent may terminate this agreement by giving the Tenant <strong>{{notice_period_days}} days</strong> written notice to vacate, subject to applicable Kenyan tenancy law.</div>
  </div>

  <div class="clause">
    <div class="clause-num">5. &nbsp; Rent Review &amp; Escalation</div>
    <div class="sub-clause"><span class="sub-num">5.1 Annual Review.</span> The monthly rent is subject to an annual review at the end of each twelve-month period of the tenancy.</div>
    <div class="sub-clause"><span class="sub-num">5.2 Notice of Increase.</span> Tochi Property will notify the Tenant of any rent increase at least <strong>60 days</strong> before the effective date.</div>
    <div class="sub-clause"><span class="sub-num">5.3 Standard Rate.</span> Unless otherwise agreed in writing, the annual rent increase shall not exceed <strong>{{rent_escalation_percent}}</strong> of the prevailing monthly rent, in line with prevailing market rates.</div>
    <div class="sub-clause"><span class="sub-num">5.4 Agreement Required.</span> Any rent adjustment agreed between the parties shall be documented in a signed addendum before taking effect.</div>
  </div>

  <div class="clause">
    <div class="clause-num">6. &nbsp; Move-In Inspection</div>
    <div class="sub-clause"><span class="sub-num">6.1 Initial Inspection.</span> Tochi Property will conduct a move-in inspection with the Tenant on or before the commencement date and prepare a detailed Move-In Inspection Report.</div>
    <div class="sub-clause"><span class="sub-num">6.2 Signed Report.</span> Both parties shall sign the report confirming the condition of the Premises, fixtures, fittings, and appliances at the start of the tenancy.</div>
    <div class="sub-clause"><span class="sub-num">6.3 Binding Record.</span> The signed Move-In Inspection Report is the reference document against which the Premises condition will be assessed at the end of the tenancy.</div>
  </div>

  <div class="clause">
    <div class="clause-num">7. &nbsp; Inspections During Tenancy</div>
    <div class="sub-clause"><span class="sub-num">7.1 Routine Inspections.</span> Tochi Property reserves the right to carry out routine inspections to ensure the Premises are being maintained in good condition.</div>
    <div class="sub-clause"><span class="sub-num">7.2 Notice.</span> At least <strong>24 hours'</strong> prior written notice will be given before any routine inspection, except in an emergency.</div>
    <div class="sub-clause"><span class="sub-num">7.3 Emergency Access.</span> In the event of an emergency (e.g., fire, flood, or structural risk), Tochi Property or the Landlord may access the Premises without prior notice.</div>
    <div class="sub-clause"><span class="sub-num">7.4 Inspection Schedule.</span> Routine inspections will be conducted every <strong>six (6) months</strong> unless there is cause for more frequent inspection.</div>
  </div>

  <div class="clause">
    <div class="clause-num">8. &nbsp; Move-Out Process &amp; Clearance to Vacate</div>
    <div class="sub-clause"><span class="sub-num">8.1 Pre-Move-Out Inspection.</span> Tochi Property will conduct a pre-move-out inspection approximately <strong>two (2) weeks</strong> before the Tenant's intended vacate date to identify repairs or cleaning that must be addressed.</div>
    <div class="sub-clause"><span class="sub-num">8.2 Final Inspection.</span> A final move-out inspection will be carried out on or after the vacate date. The Tenant is encouraged to be present.</div>
    <div class="sub-clause"><span class="sub-num">8.3 Statement of Repair Costs.</span> Following the final inspection, Tochi Property will provide an itemised statement of any proposed deductions from the security deposit, with supporting evidence.</div>
    <div class="sub-clause"><span class="sub-num">8.4 Clearance to Vacate.</span> A Clearance to Vacate will be issued once all obligations are settled, including return of all keys and access devices, completion of agreed repairs, and payment of outstanding rent or charges.</div>
  </div>

  <div class="clause">
    <div class="clause-num">9. &nbsp; Tenant Obligations</div>
    <p style="margin:5px 0 7px 0;font-size:9pt;">The Tenant agrees to:</p>
    <ol class="alist">
      <li>Pay rent in full on or before the due date each month;</li>
      <li>Keep the Premises, fixtures, fittings, and appliances in a clean and good state of repair throughout the tenancy;</li>
      <li>Not sublet, assign, or part with possession of all or any part of the Premises without prior written consent of the Landlord/Agent;</li>
      <li>Use the Premises for residential purposes only and not conduct any business, trade, profession, or unlawful activity therein;</li>
      <li>Promptly report in writing to Tochi Property any damage, defect, or maintenance issue at the Premises;</li>
      <li>Permit Tochi Property and/or the Landlord to access the Premises on <strong>24 hours'</strong> written notice (or immediately in an emergency) for inspection, repair, or valuation;</li>
      <li>Not make any structural alteration, addition, or improvement to the Premises without prior written consent of the Landlord;</li>
      <li>Comply with all applicable laws, by-laws, regulations, and the rules of any estate management, body corporate, or residents' association;</li>
      <li>Not cause nuisance, annoyance, or unreasonable disturbance to neighbours or other occupants of the building or estate;</li>
      <li>On vacating, leave the Premises clean and tidy, in the same condition as at commencement (fair wear and tear excepted), and return all keys and access devices;</li>
      <li>Not keep any pet or animal at the Premises without prior written consent from the Landlord. <strong>{{pet_policy}}</strong></li>
    </ol>
  </div>

  <div class="clause">
    <div class="clause-num">10. &nbsp; Maintenance Responsibilities</div>
    <div class="sub-clause"><span class="sub-num">10.1 Tenant Responsibility.</span> The Tenant is responsible for minor day-to-day maintenance, including replacing light bulbs, keeping drains clear of blockages caused by the Tenant's use, and maintaining the interior in a clean and tidy condition.</div>
    <div class="sub-clause"><span class="sub-num">10.2 Landlord/Agent Responsibility.</span> The Landlord/Agent is responsible for maintaining the structure and exterior, ensuring major plumbing, electrical, and structural services are in good working order, and attending to essential repairs not caused by the Tenant.</div>
    <div class="sub-clause"><span class="sub-num">10.3 Reporting.</span> All maintenance issues must be reported in writing to Tochi Property via the tenant portal, email, or phone. The Tenant must not carry out repairs without prior authorisation except in genuine emergencies.</div>
  </div>

  <div class="clause">
    <div class="clause-num">11. &nbsp; Use of Property &amp; Subletting</div>
    <div class="sub-clause"><span class="sub-num">11.1 Residential Use Only.</span> The Premises shall be used solely for private residential occupation by the Tenant(s) named in this agreement and their immediate family members.</div>
    <div class="sub-clause"><span class="sub-num">11.2 No Short-Term Subletting.</span> The Tenant shall not list or rent the Premises on any short-term rental platform (including Airbnb, Booking.com, or similar) without the express prior written consent of the Landlord.</div>
    <div class="sub-clause"><span class="sub-num">11.3 No Subletting.</span> The Tenant shall not sublet, assign, or grant any licence to occupy the Premises to any third party without prior written consent of the Landlord.</div>
    <div class="sub-clause"><span class="sub-num">11.4 Permitted Occupants.</span> Only the Tenant(s) named in this agreement and persons specifically approved in writing by the Landlord may occupy the Premises on a permanent basis.</div>
  </div>

  <div class="clause">
    <div class="clause-num">12. &nbsp; Breach &amp; Eviction</div>
    <div class="sub-clause"><span class="sub-num">12.1 Notice to Remedy.</span> In the event of a breach (including non-payment of rent), Tochi Property will issue a formal Notice to Remedy, requiring the Tenant to rectify the breach within <strong>14 days</strong> of the notice date.</div>
    <div class="sub-clause"><span class="sub-num">12.2 Vacate Notice.</span> If the breach is not remedied within the stipulated period, or in the event of repeated breaches, the Landlord/Agent may issue a Notice to Vacate requiring the Tenant to leave within <strong>30 days</strong> (or as required by applicable Kenyan law).</div>
    <div class="sub-clause"><span class="sub-num">12.3 Recovery of Costs.</span> The Landlord is entitled to recover from the Tenant all costs, including legal fees and expenses, incurred as a result of any breach of this agreement.</div>
  </div>

  <div class="clause">
    <div class="clause-num">13. &nbsp; Dispute Resolution</div>
    <div class="sub-clause"><span class="sub-num">13.1 Negotiation.</span> In the event of a dispute, the parties shall first attempt resolution by good-faith negotiation within <strong>14 days</strong> of written notice of the dispute by either party.</div>
    <div class="sub-clause"><span class="sub-num">13.2 Arbitration.</span> If the dispute is not resolved by negotiation, it shall be referred to binding arbitration under the rules of the <strong>Chartered Institute of Arbitrators (Kenya Branch)</strong>. The arbitrator's award shall be final and binding on both parties.</div>
    <div class="sub-clause"><span class="sub-num">13.3 Legal Costs.</span> Each party shall bear their own legal costs unless otherwise directed by the arbitrator or a court of competent jurisdiction.</div>
  </div>

  <div class="clause">
    <div class="clause-num">14. &nbsp; General Provisions</div>
    <div class="sub-clause"><span class="sub-num">14.1 Entire Agreement.</span> This agreement, together with any signed addenda, constitutes the entire agreement between the parties regarding the Premises and supersedes all prior negotiations, representations, and understandings, whether oral or written.</div>
    <div class="sub-clause"><span class="sub-num">14.2 Amendments.</span> No amendment or variation of this agreement is valid unless made in writing and signed by both parties.</div>
    <div class="sub-clause"><span class="sub-num">14.3 Governing Law.</span> This agreement is governed by the laws of Kenya, including the Landlord and Tenant (Shops, Hotels and Catering Establishments) Act (Cap. 301), the Rent Restriction Act (Cap. 296), and any other applicable legislation.</div>
    <div class="sub-clause"><span class="sub-num">14.4 Acknowledgement.</span> The parties confirm they have read, understood, and agreed to all terms set out in this agreement, and that no representations or warranties have been made other than those expressly stated herein.</div>
  </div>

  <!-- SECTION D: SIGNATURES -->
  <div class="section-hdr">D &nbsp;&nbsp; Signatures</div>

  <p style="font-size:9pt;margin-bottom:14px;">By signing below, each party confirms they have read and agreed to the terms of this Residential Tenancy Agreement.</p>

  <div class="sig-section">
    <div class="sig-block">
      <div class="sig-block-title">Landlord / Managing Agent</div>
      <div class="sig-line"></div>
      <div class="sig-label">Signature</div>
      <div class="sig-line"></div>
      <div class="sig-label">Full Name: {{landlord_name}}<br>Represented by: Tochi Property<br>Date: ___________________________</div>
      <div class="witness-block">
        <div class="sig-line"></div>
        <div class="sig-label">Witness Name &amp; Signature</div>
      </div>
    </div>
    <div class="sig-block">
      <div class="sig-block-title">Tenant(s)</div>
      <div class="sig-line"></div>
      <div class="sig-label">Tenant 1 Signature</div>
      <div class="sig-line"></div>
      <div class="sig-label">Full Name: {{tenant_name}}<br>ID / Passport: {{tenant_id_number}}<br>Date: ___________________________</div>
      <div class="witness-block">
        <div class="sig-line"></div>
        <div class="sig-label">Witness Name &amp; Signature</div>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    Tochi Property &nbsp;·&nbsp; Your Property. Our Pride. &nbsp;·&nbsp; info@tochiproperty.com<br>
    Generated: {{agreement_date}} &nbsp;·&nbsp; Ref: {{property_ref}}
  </div>

</div>
</body>
</html>`

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const lease = await prisma.lease.findUnique({
      where: { id },
      include: {
        tenant: true,
        property: {
          include: {
            landlord: true,
          },
        },
        unitRef: {
          include: {
            landlord: true,
          },
        },
        template: true,
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    // Resolve template: use lease's assigned template → company default → built-in
    let templateContent: string
    let resolvedTemplateId: string | null = lease.templateId

    if (lease.template) {
      templateContent = lease.template.content
    } else {
      // Try to find a default template for the company
      const company = await prisma.company.findFirst({ where: { status: 'ACTIVE' } })
      const defaultTemplate = company
        ? await prisma.leaseTemplate.findFirst({
            where: { companyId: company.id, isDefault: true, isActive: true },
            orderBy: { updatedAt: 'desc' },
          })
        : null

      if (defaultTemplate) {
        templateContent = defaultTemplate.content
        resolvedTemplateId = defaultTemplate.id
        // Assign the default template to this lease for future use
        await prisma.lease.update({ where: { id }, data: { templateId: defaultTemplate.id } })
      } else {
        // Fall back to built-in template — also persist it as the company's default
        templateContent = DEFAULT_TEMPLATE
        if (company) {
          const created = await prisma.leaseTemplate.create({
            data: {
              companyId: company.id,
              name: 'Standard Residential Tenancy Agreement',
              type: 'RESIDENTIAL_STANDARD',
              content: DEFAULT_TEMPLATE,
              isDefault: true,
              isActive: true,
            },
          })
          resolvedTemplateId = created.id
          await prisma.lease.update({ where: { id }, data: { templateId: created.id } })
        }
      }
    }

    // Resolve landlord: prefer unit-level landlord, fall back to property-level
    const landlord = lease.unitRef?.landlord || lease.property?.landlord

    const rentDueDay = (lease as any).rentDueDay || 1
    const gracePeriodDays = (lease as any).gracePeriodDays ?? 5
    const latePenaltyPerDay = parseFloat(((lease as any).latePenaltyPerDay || 500).toString())
    const noticePeriodMonths = (lease as any).noticePeriod || 1
    const noticePeriodDays = noticePeriodMonths * 30
    const rentEscalationPct = (lease as any).rentEscalation
      ? `${(lease as any).rentEscalation}%`
      : '10%'
    const unitRef = lease.unitRef?.unitNumber || (lease as any).unit || ''
    const propertyRef = unitRef ? `${lease.property.name} — ${unitRef}` : lease.property.name

    // Build placeholder data
    const placeholders: Record<string, string> = {
      // Header
      property_ref: propertyRef,

      // Tenant 1
      tenant_name: lease.tenant.name,
      tenant_email: lease.tenant.email,
      tenant_phone: lease.tenant.phone,
      tenant_id_number: lease.tenant.idNumber || 'N/A',

      // Tenant 2 (optional co-tenant)
      tenant2_name: (lease as any).tenant2Name || '—',
      tenant2_id_number: (lease as any).tenant2IdNumber || '—',
      tenant2_email: (lease as any).tenant2Email || '—',
      tenant2_phone: (lease as any).tenant2Phone || '—',

      // Property
      property_name: lease.property.name,
      property_address: lease.property.address,
      property_type: lease.property.type,

      // Unit
      unit_number: unitRef || 'N/A',

      // Landlord (unit-level takes priority over property-level)
      landlord_name: landlord?.name || 'N/A',
      landlord_email: landlord?.email || 'N/A',
      landlord_phone: landlord?.phone || 'N/A',

      // Lease financial terms
      monthly_rent: formatCurrency(lease.monthlyRent),
      security_deposit: formatCurrency(lease.securityDeposit),
      lease_start_date: formatDate(lease.startDate),
      lease_end_date: formatDate(lease.endDate),
      lease_duration_months: Math.round((lease.endDate.getTime() - lease.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)).toString(),

      // Notice & grace
      notice_period_days: noticePeriodDays.toString(),
      rent_due_day_ordinal: ordinal(rentDueDay),
      grace_period_days: gracePeriodDays.toString(),
      late_penalty_per_day: latePenaltyPerDay.toLocaleString('en-KE'),
      rent_escalation_percent: rentEscalationPct,

      // Payment methods
      mpesa_details: (lease as any).mpesaTill || '[M-Pesa Till — contact Tochi Property for details]',
      bank_details: (lease as any).bankDetails || '[Bank EFT — contact Tochi Property for details]',

      // Policy fields
      pet_policy: (lease as any).petPolicy || 'No pets allowed without prior written consent from the Landlord.',
      special_conditions: (lease as any).specialConditions || 'None.',

      // Company
      company_name: 'Tochi Property',
      company_tagline: 'Your Property. Our Pride.',

      // Dates
      agreement_date: formatDate(new Date()),
      current_year: new Date().getFullYear().toString(),
    }

    const documentHtml = replacePlaceholders(templateContent, placeholders)

    await prisma.lease.update({
      where: { id },
      data: { documentHtml },
    })

    return NextResponse.json({
      message: 'Lease document generated successfully',
      documentHtml,
    })
  } catch (error) {
    console.error('Error generating lease document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
