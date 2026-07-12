-- SOP 004 / BR-6: Day-21 Notice to Remedy human gate fields on arrears_escalations.
ALTER TABLE "arrears_escalations"
  ADD COLUMN IF NOT EXISTS "consultationConfirmed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "directorApprovedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "directorApprovedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "recordedDeliveryRef" TEXT;

-- SOP 004 / BR-7: Legal/Dispute case opened on legal referral (Day 35+).
DO $$ BEGIN
  CREATE TYPE "LegalCaseStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "legal_cases" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "leaseId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "arrearsEscalationId" TEXT,
  "status" "LegalCaseStatus" NOT NULL DEFAULT 'OPEN',
  "amountClaimed" DECIMAL(10,2) NOT NULL,
  "penaltyClaimed" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "documentBundle" JSONB,
  "openedBy" TEXT,
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "legal_cases_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "legal_cases_arrearsEscalationId_key" ON "legal_cases"("arrearsEscalationId");
CREATE INDEX IF NOT EXISTS "legal_cases_companyId_idx" ON "legal_cases"("companyId");
CREATE INDEX IF NOT EXISTS "legal_cases_leaseId_idx" ON "legal_cases"("leaseId");
CREATE INDEX IF NOT EXISTS "legal_cases_tenantId_idx" ON "legal_cases"("tenantId");
CREATE INDEX IF NOT EXISTS "legal_cases_status_idx" ON "legal_cases"("status");

-- Foreign keys (drop-then-add for idempotency)
ALTER TABLE "legal_cases" DROP CONSTRAINT IF EXISTS "legal_cases_companyId_fkey";
ALTER TABLE "legal_cases" ADD CONSTRAINT "legal_cases_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "legal_cases" DROP CONSTRAINT IF EXISTS "legal_cases_leaseId_fkey";
ALTER TABLE "legal_cases" ADD CONSTRAINT "legal_cases_leaseId_fkey"
  FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "legal_cases" DROP CONSTRAINT IF EXISTS "legal_cases_tenantId_fkey";
ALTER TABLE "legal_cases" ADD CONSTRAINT "legal_cases_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "legal_cases" DROP CONSTRAINT IF EXISTS "legal_cases_propertyId_fkey";
ALTER TABLE "legal_cases" ADD CONSTRAINT "legal_cases_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "legal_cases" DROP CONSTRAINT IF EXISTS "legal_cases_arrearsEscalationId_fkey";
ALTER TABLE "legal_cases" ADD CONSTRAINT "legal_cases_arrearsEscalationId_fkey"
  FOREIGN KEY ("arrearsEscalationId") REFERENCES "arrears_escalations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
