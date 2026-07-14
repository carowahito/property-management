-- Move-Out Settlement (lease clauses 8.2 - 8.4):
--   MoveOutQuote      = "Statement of Repair Costs" (8.3)
--   MoveOutQuoteLine  = one costed remedial item (contractor name/contact free text)
--   ClearanceToVacate = Clearance to Vacate gate/document (8.4)

-- ── Enums ─────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "MoveOutQuoteStatus" AS ENUM ('DRAFT', 'AGREED', 'DISPUTED', 'SETTLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "MoveOutLineAction" AS ENUM ('REPAIR', 'REPLACE', 'CLEAN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "MoveOutResponsibility" AS ENUM ('TENANT', 'LANDLORD', 'SHARED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ClearanceStatus" AS ENUM ('BLOCKED', 'READY', 'ISSUED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ── move_out_quotes ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "move_out_quotes" (
  "id"                TEXT NOT NULL,
  "inspectionId"      TEXT NOT NULL,
  "leaseId"           TEXT NOT NULL,
  "tenantId"          TEXT NOT NULL,
  "depositId"         TEXT,
  "status"            "MoveOutQuoteStatus" NOT NULL DEFAULT 'DRAFT',
  "depositHeld"       DECIMAL(10,2) NOT NULL DEFAULT 0,
  "totalTenantCharge" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "totalLandlordCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "balanceDue"        DECIMAL(10,2) NOT NULL DEFAULT 0,
  "refundDue"         DECIMAL(10,2) NOT NULL DEFAULT 0,
  "issuedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validUntil"        TIMESTAMP(3) NOT NULL,
  "agentNotes"        TEXT,
  "agentSignature"    TEXT,
  "agentSignedAt"     TIMESTAMP(3),
  "tenantSignature"   TEXT,
  "tenantApprovedAt"  TIMESTAMP(3),
  "tenantApprovalVia" TEXT,
  "sentToTenantAt"    TIMESTAMP(3),
  "disputeReason"     TEXT,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "move_out_quotes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "move_out_quotes_inspectionId_key" ON "move_out_quotes"("inspectionId");
CREATE INDEX IF NOT EXISTS "move_out_quotes_leaseId_idx" ON "move_out_quotes"("leaseId");
CREATE INDEX IF NOT EXISTS "move_out_quotes_tenantId_idx" ON "move_out_quotes"("tenantId");
CREATE INDEX IF NOT EXISTS "move_out_quotes_status_idx" ON "move_out_quotes"("status");

-- ── move_out_quote_lines ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "move_out_quote_lines" (
  "id"                TEXT NOT NULL,
  "quoteId"           TEXT NOT NULL,
  "sourceRef"         TEXT,
  "description"       TEXT NOT NULL,
  "room"              TEXT,
  "action"            "MoveOutLineAction" NOT NULL DEFAULT 'REPAIR',
  "responsibility"    "MoveOutResponsibility" NOT NULL DEFAULT 'TENANT',
  "contractorId"      TEXT,
  "contractorName"    TEXT,
  "contractorContact" TEXT,
  "unitCost"          DECIMAL(10,2) NOT NULL DEFAULT 0,
  "quantity"          DECIMAL(10,2) NOT NULL DEFAULT 1,
  "lineTotal"         DECIMAL(10,2) NOT NULL DEFAULT 0,
  "tenantCharge"      DECIMAL(10,2) NOT NULL DEFAULT 0,
  "evidenceUrl"       TEXT,
  "sortOrder"         INTEGER NOT NULL DEFAULT 0,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "move_out_quote_lines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "move_out_quote_lines_quoteId_idx" ON "move_out_quote_lines"("quoteId");
CREATE INDEX IF NOT EXISTS "move_out_quote_lines_contractorId_idx" ON "move_out_quote_lines"("contractorId");

-- ── clearances_to_vacate ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "clearances_to_vacate" (
  "id"                TEXT NOT NULL,
  "leaseId"           TEXT NOT NULL,
  "inspectionId"      TEXT NOT NULL,
  "quoteId"           TEXT NOT NULL,
  "status"            "ClearanceStatus" NOT NULL DEFAULT 'BLOCKED',
  "keysReturned"      BOOLEAN NOT NULL DEFAULT false,
  "metersRecorded"    BOOLEAN NOT NULL DEFAULT false,
  "statementSigned"   BOOLEAN NOT NULL DEFAULT false,
  "balanceSettled"    BOOLEAN NOT NULL DEFAULT false,
  "rentCleared"       BOOLEAN NOT NULL DEFAULT false,
  "rentArrearsAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "issuedAt"          TIMESTAMP(3),
  "issuedToOfficeAt"  TIMESTAMP(3),
  "officeEmail"       TEXT,
  "documentUrl"       TEXT,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "clearances_to_vacate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "clearances_to_vacate_leaseId_key" ON "clearances_to_vacate"("leaseId");
CREATE UNIQUE INDEX IF NOT EXISTS "clearances_to_vacate_inspectionId_key" ON "clearances_to_vacate"("inspectionId");
CREATE INDEX IF NOT EXISTS "clearances_to_vacate_status_idx" ON "clearances_to_vacate"("status");

-- ── Foreign keys (drop-then-add for idempotency) ──────────────────────────────
ALTER TABLE "move_out_quotes" DROP CONSTRAINT IF EXISTS "move_out_quotes_inspectionId_fkey";
ALTER TABLE "move_out_quotes" ADD CONSTRAINT "move_out_quotes_inspectionId_fkey"
  FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "move_out_quotes" DROP CONSTRAINT IF EXISTS "move_out_quotes_leaseId_fkey";
ALTER TABLE "move_out_quotes" ADD CONSTRAINT "move_out_quotes_leaseId_fkey"
  FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "move_out_quotes" DROP CONSTRAINT IF EXISTS "move_out_quotes_tenantId_fkey";
ALTER TABLE "move_out_quotes" ADD CONSTRAINT "move_out_quotes_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "move_out_quotes" DROP CONSTRAINT IF EXISTS "move_out_quotes_depositId_fkey";
ALTER TABLE "move_out_quotes" ADD CONSTRAINT "move_out_quotes_depositId_fkey"
  FOREIGN KEY ("depositId") REFERENCES "deposits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "move_out_quote_lines" DROP CONSTRAINT IF EXISTS "move_out_quote_lines_quoteId_fkey";
ALTER TABLE "move_out_quote_lines" ADD CONSTRAINT "move_out_quote_lines_quoteId_fkey"
  FOREIGN KEY ("quoteId") REFERENCES "move_out_quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "move_out_quote_lines" DROP CONSTRAINT IF EXISTS "move_out_quote_lines_contractorId_fkey";
ALTER TABLE "move_out_quote_lines" ADD CONSTRAINT "move_out_quote_lines_contractorId_fkey"
  FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "clearances_to_vacate" DROP CONSTRAINT IF EXISTS "clearances_to_vacate_leaseId_fkey";
ALTER TABLE "clearances_to_vacate" ADD CONSTRAINT "clearances_to_vacate_leaseId_fkey"
  FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "clearances_to_vacate" DROP CONSTRAINT IF EXISTS "clearances_to_vacate_inspectionId_fkey";
ALTER TABLE "clearances_to_vacate" ADD CONSTRAINT "clearances_to_vacate_inspectionId_fkey"
  FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
