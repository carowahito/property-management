# Tochi Property

Monorepo containing the **marketing site** (`tochiproperty.com`) and the **operations portal** (admin / landlord / tenant / vendor).

## Repo layout

```
apps/
├── marketing/   @tochi/marketing — Next.js 15 marketing site (port 3002)
└── portal/      @tochi/portal    — Next.js 15 portal app    (port 3001)
```

Workspace is managed with **pnpm workspaces + Turborepo**. The two apps share zero code today; each deploys independently on Vercel.

## Quick start

```bash
pnpm install           # install everything

pnpm dev               # run both apps in parallel
pnpm dev:portal        # portal only        → http://localhost:3001
pnpm dev:marketing     # marketing only     → http://localhost:3002

pnpm build             # build both
pnpm build:portal      # portal only
pnpm build:marketing   # marketing only
```

Marketing's "Sign in" and "Tenant portal" links resolve against `NEXT_PUBLIC_PORTAL_URL` (defaults to `http://localhost:3001`). Copy `apps/marketing/.env.example` to `apps/marketing/.env.local` to override for staging/prod.

## Deploys (Vercel)

Two separate Vercel projects pointed at the same repo:

| Project          | Root Directory      | Domain                          |
| ---------------- | ------------------- | ------------------------------- |
| `tochi-marketing`| `apps/marketing`    | `tochiproperty.com`             |
| `tochi-portal`   | `apps/portal`       | `app.tochiproperty.com`         |

Configure each project's *Ignored Build Step* with `git diff --quiet HEAD^ HEAD -- apps/<name>` so a commit that only touches the other app skips the build. Marketing edits will not trigger a portal deploy.

---

## Operations portal — feature reference

The remainder of this document describes the portal application (admin/landlord/tenant/vendor).

## Features

### Property Management
- Properties portfolio management
- Unit tracking and availability
- Property analytics and reporting

### Tenant Management
- Tenant/Renter profiles
- Application processing
- Tenant portal access

### Landlord Management
- Landlord profiles
- Payout management
- Commission tracking

### Lease Management
- Lease agreements
- Lease renewals
- Termination processing

### Financial Management
- Rent payment collection
- Security deposits tracking
- Landlord payouts
- Late fee management
- Financial reporting

### Maintenance
- Maintenance request tracking
- Work order management
- Vendor management

### Compliance
- Compliance tracking
- Property inspections
- Document templates

### Analytics
- Occupancy tracking
- Revenue analytics
- Sustainability metrics

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
property-management-system/
├── app/
│   ├── properties/         # Property management
│   ├── renters/           # Tenant management
│   ├── landlords/         # Landlord management
│   ├── leases/            # Lease agreements
│   ├── rent-payments/     # Payment collection
│   ├── deposits/          # Security deposits
│   ├── payouts/           # Landlord payouts
│   ├── maintenance/       # Maintenance requests
│   ├── vendors/           # Vendor management
│   ├── inspections/       # Property inspections
│   ├── compliance/        # Compliance tracking
│   ├── viewings/          # Property viewings
│   ├── renewals/          # Lease renewals
│   ├── occupancy/         # Occupancy tracking
│   ├── financial-reports/ # Financial reporting
│   ├── late-fees/         # Late fee management
│   ├── templates/         # Document templates
│   ├── sustainability/    # Sustainability metrics
│   ├── analytics/         # Analytics dashboard
│   └── work-orders/       # Work order management
├── components/            # Reusable UI components
├── lib/                   # Utility functions
└── public/               # Static assets
```

## Integration as Submodule

This app can be integrated back into the main Catalyst Suite as a git submodule:

```bash
# In the main Catalyst Suite repository
git submodule add https://github.com/[your-org]/property-management-system modules/property-management
```

## License

Proprietary - All rights reserved
