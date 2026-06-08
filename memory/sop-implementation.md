---
name: sop-implementation
description: Which SOPs are implemented, in-progress, or pending in the platform
metadata:
  type: project
---

**Why:** The full SOP guide was handed over on 2026-06-08. Implementation is being done incrementally per SOP. This tracks status so future sessions know where to pick up.

**How to apply:** Always check this before starting any feature work so we don't duplicate or conflict with existing implementation.

## Status as of 2026-06-08

### SOP 004 — Rent Collection & Arrears Management (IN PROGRESS)
Core infrastructure was already built. Added on 2026-06-08:
- Schema: `rentDueDay`, `gracePeriodDays`, `latePenaltyPerDay` on `Lease`; `penaltyPerDay`, `penaltyAccrued`, `landlordNotifiedDay6At`, `contactAttempts`, `lastContactAt`, `paymentPromisedDate`, `paymentPromisedAmount`, `unreachable`, `unreachableSince`, `suspectedAbandonment`, `abandonmentFlaggedAt` on `ArrearsEscalation`
- Migration: `apps/portal/prisma/migrations/20260608_sop004_arrears/migration.sql`
- New API: `POST /api/arrears/scan` — auto-detects overdue leases past grace period, creates ArrearsEscalation records with correct step and penalty calculation
- Escalate API: now records Day 6 landlord notification separately (`landlordNotifiedDay6At`), recalculates `penaltyAccrued` on every escalation
- PATCH API: supports contact attempts log, payment promise, unreachable/abandonment flags
- Dashboard (`/admin/late-fees`): Scan for Arrears button, Penalty Accrued column, payment promise fields in phone call modal, contact attempts log, unreachable/abandonment badges
- **Penalty rule enforced:** penalties shown as agent income only, never included in landlord notifications
- **Pending:** Automated WhatsApp/SMS Day 1 reminder, email template for Day 6/14/21 notices, statement of account generator

### Lease Status Auto-Expiry (2026-06-08)
- `POST /api/leases` GET handler now auto-marks ACTIVE leases with past end dates as EXPIRED
- Same auto-sync added to `GET /api/leases/[id]` and `GET /api/tenants/[id]`
- Addresses the bug where expired leases remained shown as Active

### SOP 016 — Lease Renewal & Rent Review (IN PROGRESS)
Core workflow built. What was added on 2026-06-08:
- Schema: `healthCheckOutcome`, `directorEscalated`, `rentReviewBasis`, `rentReviewFormula`, `landlordWrittenAuthority`, `cpiReference`, `responseDeadline`, `rentEffectiveDate`, `contactAttempts`, `noResponseNoticeAt`, `periodicAuthorisedAt`, `periodicTerms`, `periodicReviewReminderAt` added to `LeaseRenewal` model
- Migration: `apps/portal/prisma/migrations/20260608_sop016_lease_renewal/migration.sql`
- API: Business rules enforced in PATCH — blocks notification without landlord intent, validates 21-day response deadline, 60-day rent increase notice, director escalation block, NEGOTIATED basis requires written authority
- UI: Health check scoring, rent review basis/formula, SLA warnings, contact attempts log, periodic tenancy display added to renewals detail modal
- **Pending:** Email notification when `TENANT_NOTIFIED`, cron job for automated scanning, SLA email alerts to agents

### Earlier work (pre-2026-06-08)
- Basic `LeaseRenewal` CRUD (scan, create, update, execute renewal) already built
- Admin renewals page at `/admin/renewals`

### SOP 015 — Monthly Portfolio Health Review (COMPLETED 2026-06-08)
- Schema: `PortfolioHealthReview` and `TenantHealthScore` models added
- Migration: `apps/portal/prisma/migrations/20260608_sop015_portfolio_health/migration.sql` — applied to Supabase
- Health scoring service: `apps/portal/lib/services/health-scoring.ts` — 4-dimension matrix (payment 12-month, arrears vs monthly rent, days since contact, days since inspection)
- API: `POST /api/portfolio-health/generate`, `GET /api/portfolio-health`, `GET|PATCH /api/portfolio-health/[id]`
- Admin page: `/admin/portfolio-health` — review list, summary cards, dimension grid, director sign-off, filter by risk level
- Integration: auto-sets `directorEscalated` on open LeaseRenewals for tenants with redCount >= 2

### Not yet started
- SOP 001 — Client & Landlord Onboarding (leads module, landlord portal)
- SOP 002 — Tenant Screening & Vetting (application form, income ratio check, CRB upload)
- SOP 003 — Move-In Process (pre-move-in checklist gate, next-of-kin hard block)
- SOP 004 — Rent Collection & Arrears (automated escalation workflow Days 1–35+)
- SOP 005 — Property Maintenance (quote/approval workflow, contractor directory)
- SOP 006 — Property Inspections (mobile inspection module, move-out comparison view)
- SOP 007 — Tenant Complaints (complaints register, 5-day response SLA)
- SOP 008 — Move-Out (deposit settlement tool, 10-day refund processing)
- SOP 009 — Commercial Tenancies (6-month + 3-month alerts, service charge tracking)
- SOP 010 — Sales Process (sales module, CMA, offers module)
- SOP 011 — Estate / HOA Management (levy module, visitor access, AGM governance)
- SOP 012 — Unit Handover to Landlord (handover workflow, certificate gate)
- SOP 013 — Legal Enforcement (legal/dispute record, Track A distress, Track B court)
- SOP 014 — Landlord Communication in Problem Tenancies (automated prompts, authorisation blocks)
- SOP 015 — Monthly Portfolio Health Review ✓ COMPLETED 2026-06-08
- SOP 017 — Non-Rent Dispute Resolution (dispute log, deposit dispute tool, escalation)
