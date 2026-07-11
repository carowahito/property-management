-- SOP 004 / BR-2: segregate agent income (late-payment penalties, management fees)
-- into its own ledger so it can never be joined onto landlord-facing artifacts.

-- Enum (idempotent)
DO $$ BEGIN
  CREATE TYPE "AgentIncomeSource" AS ENUM ('PENALTY', 'MANAGEMENT_FEE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Table
CREATE TABLE IF NOT EXISTS "agent_income_ledger" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "source" "AgentIncomeSource" NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'KES',
  "period" TEXT,
  "description" TEXT,
  "leaseId" TEXT,
  "tenantId" TEXT,
  "paymentId" TEXT,
  "rentTransactionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "agent_income_ledger_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "agent_income_ledger_paymentId_source_key" ON "agent_income_ledger"("paymentId", "source");
CREATE UNIQUE INDEX IF NOT EXISTS "agent_income_ledger_rentTransactionId_source_key" ON "agent_income_ledger"("rentTransactionId", "source");
CREATE INDEX IF NOT EXISTS "agent_income_ledger_companyId_idx" ON "agent_income_ledger"("companyId");
CREATE INDEX IF NOT EXISTS "agent_income_ledger_source_idx" ON "agent_income_ledger"("source");
CREATE INDEX IF NOT EXISTS "agent_income_ledger_leaseId_idx" ON "agent_income_ledger"("leaseId");
CREATE INDEX IF NOT EXISTS "agent_income_ledger_tenantId_idx" ON "agent_income_ledger"("tenantId");
CREATE INDEX IF NOT EXISTS "agent_income_ledger_period_idx" ON "agent_income_ledger"("period");

-- Foreign keys (drop-then-add for idempotency)
ALTER TABLE "agent_income_ledger" DROP CONSTRAINT IF EXISTS "agent_income_ledger_companyId_fkey";
ALTER TABLE "agent_income_ledger" ADD CONSTRAINT "agent_income_ledger_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "agent_income_ledger" DROP CONSTRAINT IF EXISTS "agent_income_ledger_leaseId_fkey";
ALTER TABLE "agent_income_ledger" ADD CONSTRAINT "agent_income_ledger_leaseId_fkey"
  FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "agent_income_ledger" DROP CONSTRAINT IF EXISTS "agent_income_ledger_tenantId_fkey";
ALTER TABLE "agent_income_ledger" ADD CONSTRAINT "agent_income_ledger_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "agent_income_ledger" DROP CONSTRAINT IF EXISTS "agent_income_ledger_paymentId_fkey";
ALTER TABLE "agent_income_ledger" ADD CONSTRAINT "agent_income_ledger_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "agent_income_ledger" DROP CONSTRAINT IF EXISTS "agent_income_ledger_rentTransactionId_fkey";
ALTER TABLE "agent_income_ledger" ADD CONSTRAINT "agent_income_ledger_rentTransactionId_fkey"
  FOREIGN KEY ("rentTransactionId") REFERENCES "rent_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
