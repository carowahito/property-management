# Toru PropTech — Implementation Tasks

> Based on Tochi Realty Master SOP Manual v1.0 (March 2026)
> Gap analysis performed 2026-03-22 against current app state

---

## Priority Legend

- 🔴 **CRITICAL** — Core SOP requirement, no implementation exists
- 🟠 **HIGH** — Partial implementation, significant gaps
- 🟡 **MEDIUM** — Placeholder pages exist, needs real functionality
- 🟢 **LOW** — Future phase, not blocking core operations

---

## SOP 001 — Client & Landlord Onboarding

**Current state:** Landlord CRUD works (list, add, view detail). Missing document management and onboarding workflow.

- [ ] 🟠 Document upload system for landlord profile (title deed, national ID, KRA PIN, utility bills, inventory list)
- [ ] 🟠 Management agreement template with e-signing (generate from template, send for signature, store signed copy)
- [ ] 🟠 Landlord onboarding wizard (step-by-step: enquiry → assessment → proposal → agreement → setup → list property)
- [ ] 🟡 Lead-to-Active-Client conversion flow (convert CRM lead to landlord record)
- [ ] 🟡 Rental valuation report generator (CMA tool for rental pricing)
- [ ] 🟡 Pre-let repairs workflow (log maintenance tasks, 3 quotes, landlord approval before listing)
- [ ] 🟡 Welcome Pack auto-dispatch (email/WhatsApp with onboarding materials)
- [ ] 🟡 Property listing auto-publish to external portals (Buyrentkenya, PigiaMe, Jumia House)
- [ ] 🟢 Bank account details storage for landlord (for monthly disbursement)
- [ ] 🟢 Key management log (serial numbers, spare locations, date issued)
- [ ] 🟢 Communication preferences per landlord (WhatsApp, email, phone)

**SLA tracking needed:**
- [ ] 🟡 4-hour initial response timer on new enquiries
- [ ] 🟡 3-day property visit deadline after instruction
- [ ] 🟡 48-hour rental valuation report deadline
- [ ] 🟡 24-hour management agreement send deadline

---

## SOP 002 — Tenant Screening & Vetting

**Current state:** No screening workflow exists. Tenants are added directly without vetting.

- [ ] 🔴 Tenant application form (structured data capture: name, ID, employer, income, references)
- [ ] 🔴 Screening criteria engine (income ≥ 3x rent auto-check, employment min 6 months)
- [ ] 🔴 Screening checklist workflow (Application → Documents → Income Check → CRB → Employment → References → Decision → Landlord Approval)
- [ ] 🔴 Document upload per applicant (ID, payslips, employment letter, business registration)
- [ ] 🟠 CRB check integration (TransUnion/Metropol API or manual upload with Pass/Refer/Fail status)
- [ ] 🟠 Employer verification log (call notes, outcome, independently sourced number)
- [ ] 🟠 Previous landlord reference log (payment record, property care, disputes)
- [ ] 🟠 Screening summary report (auto-generated for landlord approval)
- [ ] 🟡 Non-discrimination compliance audit trail (all decisions logged with objective criteria)

**Tenant Sourcing (SOP 002, Section 1A):**
- [ ] 🟠 Property listings module (professional photos, accurate details, asking rent confirmation)
- [ ] 🟠 Enquiry tracker (log all enquiries, 4-hour response SLA)
- [ ] 🟠 Viewing scheduler (book via platform, auto-notify landlord, log outcome: Interested/Not Interested/Application Submitted)
- [ ] 🟡 Multi-applicant shortlisting (compare 2+ applicants against criteria)

---

## SOP 003 — Move-In Process & Tenancy Setup

**Current state:** No move-in workflow. No lease template system. No deposit management.

### 3A. Lease Agreement Automation 🔴
- [ ] 🔴 Lease template system (Residential Standard, Short-Term, Commercial Residential)
- [ ] 🔴 Dynamic field insertion engine ({{tenant_name}}, {{national_id}}, {{property_address}}, {{monthly_rent}}, {{rent_due_date}}, {{deposit_amount}}, {{lease_start}}, {{lease_end}}, {{notice_period}}, {{special_conditions}})
- [ ] 🔴 Clause management (rent escalation, subletting prohibition, pet policy, maintenance responsibilities, early termination penalty)
- [ ] 🔴 PDF generation from template
- [ ] 🔴 E-signing flow (send to tenant → 48hr review → tenant signs → agent/landlord counter-signs)
- [ ] 🔴 Amendment log (track any changes to standard clauses)
- [ ] 🔴 Auto-distribute signed copies (tenant + landlord via WhatsApp + email)
- [ ] 🟠 Tenant portal: "View & Sign Lease" page

### 3B. Deposit Management 🔴
- [ ] 🔴 Deposit ledger (record: date received, amount, payment reference, tenant name, status)
- [ ] 🔴 Deposit status tracking (Held — Active Tenancy / Under Review / Returned)
- [ ] 🔴 Deposit receipt auto-generation on payment confirmation
- [ ] 🔴 Deposit on owner statement (marked "Not Disbursable")
- [ ] 🟠 Deposit settlement tool (itemised deductions with evidence at move-out)
- [ ] 🟠 Deposit dispute workflow (log dispute, 5-day resolution, mediation referral)
- [ ] 🟡 Deposit return processing (refund within 10 business days, log reference, send itemised statement)

### 3C. Move-In Workflow
- [ ] 🔴 Pre-move-in checklist (agreement signed ✓, deposit cleared ✓, first month cleared ✓, inspection done ✓, meters logged ✓, inventory signed ✓, profile active ✓, welcome pack sent ✓)
- [ ] 🔴 Move-in inspection module (digital form, room-by-room, min 30 photos, timestamped, geo-tagged)
- [ ] 🔴 Inventory sign-off (furnished properties — photo evidence of all items)
- [ ] 🟠 Utility meter reading capture (electricity + water, with photo attachment)
- [ ] 🟠 Smart meter integration (auto-capture readings, agent verify at move-in)
- [ ] 🟠 Tenant Welcome Pack (welcome letter, agreement copy, payment instructions, app guide, emergency contacts, house rules, utility accounts, move-out notice info)
- [ ] 🟡 Key release gate (block key handover until: signed agreement + deposit cleared + first month cleared)

---

## SOP 004 — Rent Collection & Arrears Management

**Current state:** Payment records exist in admin. No M-Pesa integration, no arrears escalation, no auto-receipts.

### 4A. Rent Collection
- [ ] 🔴 M-Pesa Paybill integration (auto-match payments to tenants via Toru PropTech)
- [ ] 🔴 Auto-receipt generation (sent to tenant immediately on payment confirmation)
- [ ] 🔴 Grace period configuration (default 5 days, per lease)
- [ ] 🔴 Auto-overdue flagging after grace period
- [ ] 🟠 Late payment penalty calculation (percentage or flat fee, per tenancy agreement)
- [ ] 🟠 Landlord disbursement by 10th of month (net rent less management fee and approved deductions)
- [ ] 🟠 Disbursement report generation

### 4B. Owner Financial Statements
- [ ] 🔴 Monthly owner statement auto-generation (by 1st of month)
- [ ] 🔴 Statement contents: property/unit, rent due vs received, management fee, maintenance deductions, deposit held, net disbursement, YTD totals
- [ ] 🔴 Statement delivery by 5th of month (owner portal + WhatsApp PDF + email PDF)
- [ ] 🟠 Multi-property consolidated portfolio statement
- [ ] 🟠 Annual income summary (by 31 January for tax/accounting)
- [ ] 🟡 Statement query/correction workflow (5 business day response)

### 4C. Arrears Escalation Workflow
- [ ] 🔴 Day 1: Auto WhatsApp/SMS rent reminder
- [ ] 🔴 Day 6: Overdue flag + Arrears Notice #1 (with late penalty notice)
- [ ] 🔴 Day 10: Agent phone call task + outcome log + follow-up reminder
- [ ] 🔴 Day 14: Arrears Notice #2 + landlord notification
- [ ] 🟠 Day 21: Formal "Notice to Remedy or Vacate" (generated, recorded delivery)
- [ ] 🟠 Day 35+: Legal referral (close arrears file, open Legal/Dispute record)
- [ ] 🟠 Arrears dashboard (all overdue properties, days overdue, amounts, communication history)

---

## SOP 005 — Property Maintenance & Repairs

**Current state:** Maintenance module exists with basic CRUD. Missing triage, SLA, quotes, contractor ratings.

- [ ] 🟠 Request triage categories: Emergency (2hr) / Urgent (next business day) / Routine (5 days) / Preventive (scheduled)
- [ ] 🟠 SLA timer per category (auto-assign on triage, track against target)
- [ ] 🟠 Landlord notification before authorising works (Urgent + Routine)
- [ ] 🟠 Emergency bypass (dispatch without prior approval, notify landlord after)
- [ ] 🟠 3-quote workflow for works over KSh 15,000 (upload quotes, landlord written approval)
- [ ] 🟠 Approval threshold: KSh 5,000 (auto-approve below, require landlord approval above)
- [ ] 🟡 Contractor dispatch via platform (job details + property access instructions)
- [ ] 🟡 Contractor job completion confirmation + tenant satisfaction check
- [ ] 🟡 Completion photo upload + invoice attachment
- [ ] 🟡 Maintenance cost auto-include in next landlord statement
- [ ] 🟡 Preventive maintenance calendar (recurring tasks: 6-monthly inspections, annual painting, gutter cleaning, HVAC)

### Contractor Panel
- [ ] 🟠 Vetted contractor directory in platform (business registration, KRA PIN, references, insurance)
- [ ] 🟠 Contractor rating system (rate after every completed job, flag poor performers)
- [ ] 🟡 Minimum 2 approved contractors per trade (plumbing, electrical, carpentry, painting, security)
- [ ] 🟡 Block unvetted/tenant-recommended contractors

---

## SOP 006 — Property Inspections

**Current state:** Placeholder page exists. No digital inspection functionality.

- [ ] 🟠 Digital inspection form (room-by-room, condition rating: Excellent/Good/Fair/Poor, notes for Fair/Poor)
- [ ] 🟠 Photo capture via mobile (auto-timestamped, geo-tagged, filed per room)
- [ ] 🟠 Inspection types: Move-In / 3-Month (new tenants) / 6-Monthly Routine / Pre-Move-Out / Move-Out / Annual
- [ ] 🟠 Auto-scheduling (6-monthly recurrence, 24-48hr tenant notification)
- [ ] 🟡 Digital signature (inspector + tenant sign in app)
- [ ] 🟡 Auto-generate inspection report (email to landlord within 24hrs)
- [ ] 🟡 Lease violation auto-flagging (pets, subletting, damage → follow-up task)
- [ ] 🟡 Maintenance request auto-creation from inspection findings
- [ ] 🟡 Move-out side-by-side comparison (move-in photos vs current photos per area)
- [ ] 🟢 5-day post-move-in follow-up inspection (for defects not apparent on day 1)

---

## SOP 007 — Tenant Complaints & Dispute Resolution

**Current state:** No complaints system exists.

- [ ] 🟡 Complaints register (date, tenant, property, category, description, assigned agent)
- [ ] 🟡 Auto-acknowledge to tenant on complaint submission
- [ ] 🟡 Investigation workflow (2 business day SLA, review maintenance/comms/inspection history)
- [ ] 🟡 Written response to tenant within 5 business days
- [ ] 🟡 Escalation matrix (maintenance → Property Manager, security → Director, discrimination → Director + legal, fee dispute → Director, legal threat → Director + legal advisor)
- [ ] 🟡 Root cause tagging on close (for trend analysis)
- [ ] 🟢 Monthly Director review of all closed complaints

---

## SOP 008 — Move-Out & End of Tenancy

**Current state:** No move-out workflow exists.

- [ ] 🟠 Notice receipt confirmation (verify notice period, set move-out date, trigger workflow)
- [ ] 🟠 Re-letting auto-activation on notice (update listing to "Available from [Date]", begin marketing)
- [ ] 🟠 Pre-move-out inspection (2 weeks before, advise tenant on items to remedy)
- [ ] 🟠 Final inspection with contractor (side-by-side comparison, Statement of Repairs Costs, tenant signs)
- [ ] 🟠 Key handover confirmation (all keys returned, update key log)
- [ ] 🟠 Utility meter reading capture (final electricity + water, photo upload)
- [ ] 🟠 Deposit settlement tool (deductions with evidence: photos, invoices, inspection comparison)
- [ ] 🟠 Deposit return processing (within 10 business days, itemised schedule to tenant)
- [ ] 🟡 Post-tenancy works as maintenance tasks → update listing to "Available" when complete
- [ ] 🟡 Clearance to Vacate document (issued only after all costs settled)

### Deposit Deduction Rules (enforce in platform)
- [ ] 🟡 Permitted: damage beyond fair wear (with evidence), unpaid rent, professional cleaning, lost/damaged inventory
- [ ] 🟡 Not permitted: normal wear and tear, pre-existing damage (from move-in report), landlord maintenance responsibilities

---

## SOP 009 — Commercial Property Management

**Current state:** No commercial-specific features.

- [ ] 🟢 Commercial lease template (2-5yr duration, renewal options)
- [ ] 🟢 Annual CPI-linked rent review scheduler (auto-generate review notice)
- [ ] 🟢 Service charge tracking (common area maintenance, security, insurance — separate ledger)
- [ ] 🟢 Annual service charge account generation
- [ ] 🟢 Tenant alteration consent log (written consent, approved drawings, photo records)
- [ ] 🟢 Dilapidations protocol (original condition documentation at lease start)
- [ ] 🟢 Quarterly review meeting scheduler with notes
- [ ] 🟢 Building compliance certificate library (fire safety, electrical, lift certificates)
- [ ] 🟢 Multi-tenant proportional cost allocation

---

## SOP 010 — Property Sales

**Current state:** Placeholder pages exist. No real sales workflow.

- [ ] 🟡 Comparative Market Analysis (CMA) tool
- [ ] 🟡 Sales mandate agreement (e-sign, expiry date, 2-week expiry alert)
- [ ] 🟡 Legal checks tracker (title clear, land rates/rent paid, confirmation upload)
- [ ] 🟡 Property listing with brochure generation
- [ ] 🟡 Sales pipeline (enquiry → pre-qualify → viewing → offer → sale agreed → completion)
- [ ] 🟡 Buyer register (budget, type, location, timeline preferences)
- [ ] 🟡 Buyer-listing matching alerts
- [ ] 🟡 Offer module (enter offers, present to seller, counter-offer history)
- [ ] 🟡 Completion milestone tracker (advocate instructions, financing, title transfer)
- [ ] 🟡 Commission auto-calculation + invoice generation
- [ ] 🟢 Dual representation conflict-of-interest log

---

## SOP 011 — Estate & HOA Management

**Current state:** No estate/HOA features exist.

### Phase 1 — Core Estate Management
- [ ] 🟢 Estate onboarding (developer/HOA details, unit count, phases, asset register, snagging list)
- [ ] 🟢 Estate management agreement (scope, fees, reporting, escalation matrix)
- [ ] 🟢 Homeowner/resident register (unit, owner, contacts, vehicle registration)
- [ ] 🟢 Monthly levy/service charge billing (auto-generate invoices, M-Pesa link)
- [ ] 🟢 Levy arrears tracking (14-day demand notice, 30-day escalation to committee)
- [ ] 🟢 Monthly estate management report (collection rate, arrears, maintenance, security, financial position)

### Phase 2 — Governance & Operations
- [ ] 🟢 HOA budget preparation workflow (Oct-Nov annually)
- [ ] 🟢 AGM management (21-day notice, agenda, financials, minutes, resolution tracking)
- [ ] 🟢 Committee meeting support (quarterly, action item tracking)
- [ ] 🟢 Sinking/reserve fund tracking (balance vs projected capital expenditure)
- [ ] 🟢 Annual vendor/contractor review + RFP process

### Phase 3 — Visitor & Utilities
- [ ] 🟢 Visitor access management (pre-register, QR gate pass, guard app scan)
- [ ] 🟢 Contractor access passes (one-day or recurring)
- [ ] 🟢 Blacklist management (committee-approved, guard auto-alert)
- [ ] 🟢 Security incident log (within 1hr, monthly summary)
- [ ] 🟢 Utility management (borehole, generator levy, meter readings, per-unit billing)
- [ ] 🟢 County compliance certificates (health, fire, structural, waste)

---

## SOP 012 — Lease Renewals & Rent Reviews

**Current state:** No renewal workflow exists.

- [ ] 🟠 90-day renewal alert system (auto-alert to assigned agent)
- [ ] 🟠 Renewal review checklist (payment history, inspections, complaints, compliance)
- [ ] 🟠 Landlord renewal intent capture (Renew same / Renew new rent / Not Renewing)
- [ ] 🟠 Rent review tool (3 market comparables, 7-10% or CPI+3% guideline, step-up schedule option)
- [ ] 🟠 60-day tenant notice of rent increase (auto-generated, multi-channel delivery)
- [ ] 🟠 Renewal agreement execution (new agreement or addendum via e-signing)
- [ ] 🟠 Month-to-month extension notice (max 3 months if renewal not yet signed)
- [ ] 🟠 Rent freeze documentation (market evidence, landlord decision logged)
- [ ] 🟡 Non-renewal → auto-activate re-letting workflow (SOP 008)
- [ ] 🟡 Platform auto-update: new rent amount, management fee recalculation, disbursement recalculation

**SLA tracking:**
- [ ] 🟡 3 business days: agent action on renewal alert
- [ ] 🟡 5 days: landlord contacted after 90-day alert
- [ ] 🟡 75-day mark: rent review recommendation to landlord
- [ ] 🟡 7 days before expiry: renewal agreement executed
- [ ] 🟡 Zero tolerance: no undocumented tenancies

---

## Cross-Cutting Platform Requirements

### Tenant Portal (currently all placeholder/missing)
- [ ] 🔴 Dashboard with real data (lease, payments, maintenance, documents from API)
- [ ] 🔴 Maintenance request submission (with photo upload, category, description)
- [ ] 🔴 Payment history (real data from payment records)
- [ ] 🔴 Lease viewing + e-signing
- [ ] 🔴 Document access (lease, inspection reports, receipts)
- [ ] 🟠 Messages / communications hub (real-time with property manager)
- [ ] 🟡 Tenant profile management (emergency contacts, communication preferences)

### Landlord Portal (currently all placeholder)
- [ ] 🔴 Owner dashboard with real data (property performance, vacancy, income)
- [ ] 🔴 Monthly owner statements (auto-generated, downloadable PDF)
- [ ] 🔴 Maintenance history per property
- [ ] 🟠 Document access (agreements, inspection reports, compliance)
- [ ] 🟡 Approval workflows (maintenance quotes, tenant applications)

### Communications Hub
- [ ] 🟠 WhatsApp integration (send/receive, log against tenant/landlord/property records)
- [ ] 🟠 Email integration (send/receive, auto-log)
- [ ] 🟡 SMS sending for payment reminders
- [ ] 🟡 Call logging (date, duration, outcome notes)
- [ ] 🟡 Communication history per contact (all channels unified)

### Notifications & Automation Engine
- [ ] 🟠 Configurable auto-reminders (rent due, lease expiry, inspection due, arrears escalation)
- [ ] 🟠 SLA timer system (track response times against targets per SOP)
- [ ] 🟡 Workflow triggers (e.g., payment received → auto-receipt, notice received → activate move-out checklist)
- [ ] 🟡 Scheduled report generation (monthly statements, weekly arrears dashboard)

### Document Management
- [ ] 🔴 File upload/storage per entity (landlord, tenant, property, lease, maintenance)
- [ ] 🔴 Document types: title deed, ID, KRA PIN, agreements, inspection reports, receipts, invoices
- [ ] 🟠 PDF generation engine (statements, reports, agreements, receipts)
- [ ] 🟡 Document expiry tracking and alerts

---

## Suggested Implementation Order

### Phase 1 — Foundation (Weeks 1-4)
1. Lease template system + PDF generation + e-signing (SOP 003A)
2. Deposit ledger + settlement tool (SOP 003B)
3. Tenant portal — real data integration (dashboard, payments, lease, documents)
4. Document upload system (cross-cutting)

### Phase 2 — Revenue Protection (Weeks 5-8)
5. M-Pesa integration + auto-receipts (SOP 004A)
6. Arrears escalation workflow (SOP 004C)
7. Monthly owner statements (SOP 004B)
8. Landlord portal — real data integration

### Phase 3 — Operations (Weeks 9-12)
9. Tenant screening workflow (SOP 002)
10. Move-in checklist + inspection module (SOP 003C, 006)
11. Maintenance triage + SLA + contractor panel (SOP 005)
12. Lease renewal + rent review (SOP 012)

### Phase 4 — Growth (Weeks 13-16)
13. Move-out workflow + re-letting (SOP 008)
14. Communications hub (WhatsApp/email/SMS integration)
15. Complaints & disputes (SOP 007)
16. Landlord onboarding wizard (SOP 001)

### Phase 5 — Expansion (Weeks 17+)
17. Property sales pipeline (SOP 010)
18. Commercial property management (SOP 009)
19. Estate & HOA management (SOP 011)
20. Notification & automation engine
