export const DEFAULT_RESIDENTIAL_TEMPLATE = `
<div class="lease-document" style="font-family: 'Times New Roman', Georgia, serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; line-height: 1.8; font-size: 14px;">

  <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px double #333; padding-bottom: 30px;">
    <h1 style="font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px;">RESIDENTIAL TENANCY AGREEMENT</h1>
    <p style="font-size: 14px; color: #555; margin-top: 8px;">Made under the Laws of Kenya</p>
    <p style="font-size: 12px; color: #888; margin-top: 4px;">Managed by {{company_name}} — "{{company_tagline}}"</p>
  </div>

  <div style="background: #f8f9fa; padding: 20px; border-radius: 4px; margin-bottom: 30px; border: 1px solid #e0e0e0;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <tr>
        <td style="padding: 4px 8px; font-weight: bold; width: 40%;">Agreement Date:</td>
        <td style="padding: 4px 8px;">{{agreement_date}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 8px; font-weight: bold;">Lease Start Date:</td>
        <td style="padding: 4px 8px;">{{lease_start_date}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 8px; font-weight: bold;">Lease End Date:</td>
        <td style="padding: 4px 8px;">{{lease_end_date}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 8px; font-weight: bold;">Duration:</td>
        <td style="padding: 4px 8px;">{{lease_duration_months}} months</td>
      </tr>
    </table>
  </div>

  <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 30px;">1. PARTIES</h2>

  <p><strong>THE LANDLORD:</strong></p>
  <table style="width: 100%; margin-bottom: 15px; font-size: 13px;">
    <tr><td style="width: 150px; padding: 3px 0;">Name:</td><td><strong>{{landlord_name}}</strong></td></tr>
    <tr><td style="padding: 3px 0;">Email:</td><td>{{landlord_email}}</td></tr>
    <tr><td style="padding: 3px 0;">Phone:</td><td>{{landlord_phone}}</td></tr>
  </table>

  <p>(hereinafter referred to as "the Landlord", which expression shall include successors in title and assigns)</p>

  <p><strong>THE TENANT:</strong></p>
  <table style="width: 100%; margin-bottom: 15px; font-size: 13px;">
    <tr><td style="width: 150px; padding: 3px 0;">Name:</td><td><strong>{{tenant_name}}</strong></td></tr>
    <tr><td style="padding: 3px 0;">ID/Passport No:</td><td>{{tenant_id_number}}</td></tr>
    <tr><td style="padding: 3px 0;">Email:</td><td>{{tenant_email}}</td></tr>
    <tr><td style="padding: 3px 0;">Phone:</td><td>{{tenant_phone}}</td></tr>
  </table>

  <p>(hereinafter referred to as "the Tenant")</p>

  <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 30px;">2. PREMISES</h2>

  <p>The Landlord hereby lets and the Tenant hereby takes on lease the following premises:</p>
  <table style="width: 100%; margin-bottom: 15px; font-size: 13px;">
    <tr><td style="width: 150px; padding: 3px 0;">Property:</td><td><strong>{{property_name}}</strong></td></tr>
    <tr><td style="padding: 3px 0;">Address:</td><td>{{property_address}}</td></tr>
    <tr><td style="padding: 3px 0;">Unit Number:</td><td>{{unit_number}}</td></tr>
    <tr><td style="padding: 3px 0;">Property Type:</td><td>{{property_type}}</td></tr>
  </table>

  <p>(hereinafter referred to as "the Premises")</p>

  <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 30px;">3. TERM</h2>

  <p>The tenancy shall commence on <strong>{{lease_start_date}}</strong> and shall expire on <strong>{{lease_end_date}}</strong>, being a period of <strong>{{lease_duration_months}} months</strong>, unless terminated earlier in accordance with the provisions of this Agreement.</p>

  <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 30px;">4. RENT</h2>

  <p>4.1. The Tenant shall pay a monthly rent of <strong>{{monthly_rent}}</strong> (Kenya Shillings {{monthly_rent_number}} only), payable in advance on or before the <strong>{{rent_due_date}}</strong> of each calendar month.</p>

  <p>4.2. Rent shall be paid via M-Pesa Paybill or bank transfer as instructed by the managing agent. <strong>Cash payments are not accepted.</strong></p>

  <p>4.3. A grace period of <strong>five (5) days</strong> shall be allowed after the due date. After the grace period, a late payment penalty shall apply as agreed below.</p>

  <p>4.4. Failure to pay rent within <strong>fourteen (14) days</strong> of the due date shall constitute a material breach of this Agreement and may result in legal proceedings for recovery.</p>

  <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 30px;">5. RENT ESCALATION</h2>

  <p>The rent shall be subject to an annual review and increase of <strong>{{rent_escalation}}</strong>, effective on each anniversary of the commencement date. The Tenant shall be given at least sixty (60) days' written notice of any rent increase.</p>

  <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 30px;">6. SECURITY DEPOSIT</h2>

  <p>6.1. The Tenant shall pay a security deposit of <strong>{{security_deposit}}</strong> prior to the commencement of the tenancy.</p>

  <p>6.2. The deposit shall be held in a designated client trust account by {{company_name}}, separate from operating funds.</p>

  <p>6.3. The deposit shall be refunded within <strong>ten (10) business days</strong> of the termination of the tenancy and completion of the move-out inspection, less any lawful deductions for:</p>
  <ul style="margin-left: 20px;">
    <li>Unpaid rent or charges;</li>
    <li>Damage to the Premises beyond fair wear and tear (evidenced by inspection reports);</li>
    <li>Professional cleaning costs where the Premises are not left in an acceptable condition;</li>
    <li>Replacement of lost or damaged inventory items (for furnished properties).</li>
  </ul>

  <p>6.4. An itemised statement of any deductions shall be provided to the Tenant with the deposit refund.</p>

  <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 30px;">7. TENANT OBLIGATIONS</h2>

  <p>The Tenant shall:</p>
  <ul style="margin-left: 20px;">
    <li>Use the Premises exclusively for residential purposes;</li>
    <li>Keep the Premises in good and tenantable condition;</li>
    <li>Report any maintenance issues promptly via the Toru PropTech tenant portal;</li>
    <li>Not make any structural alterations without prior written consent of the Landlord;</li>
    <li>Not assign, sublet, or part with possession of the Premises or any part thereof;</li>
    <li>Comply with all applicable laws, estate rules, and community regulations;</li>
    <li>Pay for all utilities consumed during the tenancy period;</li>
    <li>Allow the managing agent access for inspections with minimum 24 hours' notice.</li>
  </ul>

  <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 30px;">8. LANDLORD OBLIGATIONS</h2>

  <p>The Landlord shall:</p>
  <ul style="margin-left: 20px;">
    <li>Ensure the Premises are fit for habitation at the commencement of the tenancy;</li>
    <li>Carry out structural and major repairs in a timely manner;</li>
    <li>Not interfere with the Tenant's quiet enjoyment of the Premises;</li>
    <li>Provide the managing agent with authority and funds to carry out approved maintenance;</li>
    <li>Comply with all statutory obligations as a property owner.</li>
  </ul>

  <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 30px;">9. PET POLICY</h2>

  <p>{{pet_policy}}</p>

  <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 30px;">10. TERMINATION & NOTICE</h2>

  <p>10.1. Either party may terminate this Agreement by giving <strong>{{notice_period}}</strong> written notice to the other party.</p>

  <p>10.2. Notice shall be served via the Toru PropTech platform, or by registered post or email.</p>

  <p>10.3. The Landlord may terminate this Agreement immediately if the Tenant:</p>
  <ul style="margin-left: 20px;">
    <li>Fails to pay rent for more than thirty-five (35) days after the due date;</li>
    <li>Causes damage to the Premises beyond fair wear and tear;</li>
    <li>Uses the Premises for unlawful purposes;</li>
    <li>Sublets the Premises without written consent;</li>
    <li>Commits a material breach of any term of this Agreement.</li>
  </ul>

  <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 30px;">11. MOVE-OUT PROCEDURE</h2>

  <p>11.1. A move-out inspection shall be conducted on the last day of the tenancy with both the Tenant and the managing agent present.</p>

  <p>11.2. The condition of the Premises shall be compared against the move-in inspection report held on the platform.</p>

  <p>11.3. All keys must be returned on the move-out date. Utility meter readings shall be recorded and photographed.</p>

  <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 30px;">12. SPECIAL CONDITIONS</h2>

  <p>{{special_conditions}}</p>

  <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 30px;">13. DISPUTE RESOLUTION</h2>

  <p>13.1. Any dispute arising from this Agreement shall first be referred to the managing agent for mediation.</p>

  <p>13.2. If unresolved within thirty (30) days, the dispute shall be referred to arbitration under the Arbitration Act of Kenya, or to the Rent Restriction Tribunal where applicable.</p>

  <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 30px;">14. GOVERNING LAW</h2>

  <p>This Agreement shall be governed by and construed in accordance with the laws of the Republic of Kenya.</p>

  <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 30px;">15. MANAGING AGENT</h2>

  <p>This tenancy is managed by <strong>{{company_name}}</strong>. All correspondence, payments, maintenance requests, and notices should be directed through the Toru PropTech platform or the managing agent's office.</p>

  <div style="margin-top: 50px; border-top: 3px double #333; padding-top: 30px;">
    <h2 style="font-size: 18px; text-align: center; margin-bottom: 30px;">SIGNATURES</h2>

    <div style="display: flex; justify-content: space-between; gap: 40px;">
      <div style="flex: 1;">
        <p style="font-weight: bold; margin-bottom: 5px;">THE LANDLORD</p>
        <p style="margin: 3px 0;">Name: {{landlord_name}}</p>
        <div style="border-bottom: 1px solid #333; height: 50px; margin: 15px 0 5px;"></div>
        <p style="font-size: 12px; color: #666;">Signature / Date</p>
      </div>
      <div style="flex: 1;">
        <p style="font-weight: bold; margin-bottom: 5px;">THE TENANT</p>
        <p style="margin: 3px 0;">Name: {{tenant_name}}</p>
        <div style="border-bottom: 1px solid #333; height: 50px; margin: 15px 0 5px;"></div>
        <p style="font-size: 12px; color: #666;">Signature / Date</p>
      </div>
    </div>

    <div style="margin-top: 30px;">
      <p style="font-weight: bold; margin-bottom: 5px;">WITNESSED BY (Managing Agent)</p>
      <p style="margin: 3px 0;">{{company_name}}</p>
      <div style="border-bottom: 1px solid #333; height: 50px; margin: 15px 0 5px; width: 50%;"></div>
      <p style="font-size: 12px; color: #666;">Authorised Signatory / Date</p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 11px;">
    <p>This agreement was generated via Toru PropTech on {{agreement_date}}.</p>
    <p>{{company_name}} — {{company_tagline}}</p>
  </div>
</div>
`

export const AVAILABLE_PLACEHOLDERS = [
  { key: 'tenant_name', label: 'Tenant Full Name', source: 'tenant' },
  { key: 'tenant_email', label: 'Tenant Email', source: 'tenant' },
  { key: 'tenant_phone', label: 'Tenant Phone', source: 'tenant' },
  { key: 'tenant_id_number', label: 'Tenant ID/Passport Number', source: 'tenant' },
  { key: 'tenant_emergency_contact', label: 'Emergency Contact Name', source: 'tenant' },
  { key: 'tenant_emergency_phone', label: 'Emergency Contact Phone', source: 'tenant' },
  { key: 'property_name', label: 'Property Name', source: 'property' },
  { key: 'property_address', label: 'Property Address', source: 'property' },
  { key: 'property_type', label: 'Property Type', source: 'property' },
  { key: 'unit_number', label: 'Unit Number', source: 'unit' },
  { key: 'unit_bedrooms', label: 'Bedrooms', source: 'unit' },
  { key: 'unit_bathrooms', label: 'Bathrooms', source: 'unit' },
  { key: 'unit_size_sqm', label: 'Size (sqm)', source: 'unit' },
  { key: 'landlord_name', label: 'Landlord Name', source: 'landlord' },
  { key: 'landlord_email', label: 'Landlord Email', source: 'landlord' },
  { key: 'landlord_phone', label: 'Landlord Phone', source: 'landlord' },
  { key: 'monthly_rent', label: 'Monthly Rent (formatted)', source: 'lease' },
  { key: 'monthly_rent_number', label: 'Monthly Rent (number)', source: 'lease' },
  { key: 'security_deposit', label: 'Security Deposit', source: 'lease' },
  { key: 'lease_start_date', label: 'Lease Start Date', source: 'lease' },
  { key: 'lease_end_date', label: 'Lease End Date', source: 'lease' },
  { key: 'lease_duration_months', label: 'Lease Duration (months)', source: 'lease' },
  { key: 'notice_period', label: 'Notice Period', source: 'lease' },
  { key: 'rent_escalation', label: 'Rent Escalation', source: 'lease' },
  { key: 'rent_due_date', label: 'Rent Due Date', source: 'lease' },
  { key: 'pet_policy', label: 'Pet Policy', source: 'lease' },
  { key: 'special_conditions', label: 'Special Conditions', source: 'lease' },
  { key: 'company_name', label: 'Company Name', source: 'system' },
  { key: 'company_tagline', label: 'Company Tagline', source: 'system' },
  { key: 'agreement_date', label: 'Agreement Date', source: 'system' },
  { key: 'current_year', label: 'Current Year', source: 'system' },
]
