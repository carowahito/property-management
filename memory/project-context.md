---
name: project-context
description: Jabin Property Agents platform — purpose, tech stack, and governing principles
metadata:
  type: project
---

This is the property management platform for **Jabin Property Agents** (Kenya). All features are driven by the **Jabin Master SOP Manual v1.1** (March 2026, amended May 2026). Every field, automation, validation rule, and workflow must trace back to a specific SOP.

**Platform principle:** The platform is the single source of truth for all property, tenant, landlord, lease, maintenance, and financial records. Every action must be logged.

**Tech stack:** Next.js 15 (App Router), Prisma ORM, Supabase (PostgreSQL), pnpm monorepo with Turbo, Tailwind CSS, SendGrid email, WhatsApp Meta API, M-Pesa/Daraja integration.

**Apps:** `apps/portal` (main admin portal, port 3001), `apps/marketing` (public site).

**16 modules required per SOP guide:**
1. Leads & Client Onboarding
2. Landlord & Property Module
3. Tenant Module (including Tenant Portal)
4. Lease Management
5. Maintenance Module (including Contractor Directory)
6. Inspection Module (mobile-ready)
7. Rent Collection & Arrears Dashboard
8. Communications Hub
9. Complaints Register
10. Sales Module
11. Estate / HOA Module (including Resident Portal)
12. Legal / Dispute Record Module
13. Reporting & Analytics
14. Document Management (7-year retention)
15. Visitor & Access Management Module (Estate)
16. HOA Governance Module

**Key business rules (cross-cutting):**
- Late payment penalties are **agent income only** — never show on landlord statements
- 7-year document retention minimum
- All formal communications must be logged in Communications Hub
- Every action must have a named user + timestamp (audit trail)

**Why:** Jabin is building this platform to automate their property management SOP workflows and enforce compliance at the data layer rather than relying on agent discipline.
