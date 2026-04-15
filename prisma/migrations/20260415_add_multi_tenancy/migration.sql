-- CreateTable: companies
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Kenya',
    "logo" TEXT,
    "website" TEXT,
    "taxId" TEXT,
    "businessReg" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");
CREATE INDEX "companies_slug_idx" ON "companies"("slug");
CREATE INDEX "companies_status_idx" ON "companies"("status");

-- Add companyId to users
ALTER TABLE "users" ADD COLUMN "companyId" TEXT;
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_key";

-- Add companyId to properties
ALTER TABLE "properties" ADD COLUMN "companyId" TEXT;

-- Add companyId to landlords
ALTER TABLE "landlords" ADD COLUMN "companyId" TEXT;
ALTER TABLE "landlords" DROP CONSTRAINT IF EXISTS "landlords_email_key";
ALTER TABLE "landlords" DROP CONSTRAINT IF EXISTS "landlords_idNumber_key";

-- Add companyId to tenants
ALTER TABLE "tenants" ADD COLUMN "companyId" TEXT;
ALTER TABLE "tenants" DROP CONSTRAINT IF EXISTS "tenants_email_key";
ALTER TABLE "tenants" DROP CONSTRAINT IF EXISTS "tenants_idNumber_key";

-- Add companyId to vendors
ALTER TABLE "vendors" ADD COLUMN "companyId" TEXT;
ALTER TABLE "vendors" DROP CONSTRAINT IF EXISTS "vendors_email_key";

-- Add companyId to contractors
ALTER TABLE "contractors" ADD COLUMN "companyId" TEXT;

-- Add companyId to leads
ALTER TABLE "leads" ADD COLUMN "companyId" TEXT;

-- Add companyId to enquiries
ALTER TABLE "enquiries" ADD COLUMN "companyId" TEXT;

-- Add companyId to lease_templates
ALTER TABLE "lease_templates" ADD COLUMN "companyId" TEXT;

-- Backfill: Create default company and assign all existing records
-- (Run manually or via seed script for existing data)

-- Set NOT NULL after backfill
-- ALTER TABLE "users" ALTER COLUMN "companyId" SET NOT NULL;
-- ALTER TABLE "properties" ALTER COLUMN "companyId" SET NOT NULL;
-- ALTER TABLE "landlords" ALTER COLUMN "companyId" SET NOT NULL;
-- ALTER TABLE "tenants" ALTER COLUMN "companyId" SET NOT NULL;
-- ALTER TABLE "vendors" ALTER COLUMN "companyId" SET NOT NULL;
-- ALTER TABLE "contractors" ALTER COLUMN "companyId" SET NOT NULL;
-- ALTER TABLE "leads" ALTER COLUMN "companyId" SET NOT NULL;
-- ALTER TABLE "enquiries" ALTER COLUMN "companyId" SET NOT NULL;
-- ALTER TABLE "lease_templates" ALTER COLUMN "companyId" SET NOT NULL;

-- Foreign keys
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "properties" ADD CONSTRAINT "properties_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "landlords" ADD CONSTRAINT "landlords_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contractors" ADD CONSTRAINT "contractors_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leads" ADD CONSTRAINT "leads_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lease_templates" ADD CONSTRAINT "lease_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Compound unique indexes (email unique per company, not globally)
CREATE UNIQUE INDEX "users_companyId_email_key" ON "users"("companyId", "email");
CREATE UNIQUE INDEX "landlords_companyId_email_key" ON "landlords"("companyId", "email");
CREATE UNIQUE INDEX "tenants_companyId_email_key" ON "tenants"("companyId", "email");
CREATE UNIQUE INDEX "vendors_companyId_email_key" ON "vendors"("companyId", "email");

-- Performance indexes
CREATE INDEX "users_companyId_idx" ON "users"("companyId");
CREATE INDEX "properties_companyId_idx" ON "properties"("companyId");
CREATE INDEX "landlords_companyId_idx" ON "landlords"("companyId");
CREATE INDEX "tenants_companyId_idx" ON "tenants"("companyId");
CREATE INDEX "vendors_companyId_idx" ON "vendors"("companyId");
CREATE INDEX "contractors_companyId_idx" ON "contractors"("companyId");
CREATE INDEX "leads_companyId_idx" ON "leads"("companyId");
CREATE INDEX "enquiries_companyId_idx" ON "enquiries"("companyId");
CREATE INDEX "lease_templates_companyId_idx" ON "lease_templates"("companyId");
