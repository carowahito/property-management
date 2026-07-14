-- SOP 004 — RentInvoice (billing document) + PaymentAllocation (§4.2 / §4.4).

DO $$ BEGIN
  CREATE TYPE "RentInvoiceStatus" AS ENUM (
    'DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'IN_ARREARS', 'WRITTEN_OFF', 'LEGAL_REFERRAL'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "AllocationTarget" AS ENUM ('RENT', 'PENALTY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "rent_invoices" (
  "id" TEXT NOT NULL,
  "invoiceNumber" SERIAL NOT NULL,
  "companyId" TEXT NOT NULL,
  "leaseId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "unitId" TEXT,
  "period" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "rentAmount" DECIMAL(10,2) NOT NULL,
  "gracePeriodDays" INTEGER NOT NULL DEFAULT 5,
  "status" "RentInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
  "issuedAt" TIMESTAMP(3),
  "lastSentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "rent_invoices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "rent_invoices_invoiceNumber_key" ON "rent_invoices"("invoiceNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "rent_invoices_leaseId_period_key" ON "rent_invoices"("leaseId", "period");
CREATE INDEX IF NOT EXISTS "rent_invoices_companyId_idx" ON "rent_invoices"("companyId");
CREATE INDEX IF NOT EXISTS "rent_invoices_leaseId_idx" ON "rent_invoices"("leaseId");
CREATE INDEX IF NOT EXISTS "rent_invoices_tenantId_idx" ON "rent_invoices"("tenantId");
CREATE INDEX IF NOT EXISTS "rent_invoices_status_idx" ON "rent_invoices"("status");
CREATE INDEX IF NOT EXISTS "rent_invoices_period_idx" ON "rent_invoices"("period");

CREATE TABLE IF NOT EXISTS "payment_allocations" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "invoiceId" TEXT,
  "target" "AllocationTarget" NOT NULL DEFAULT 'RENT',
  "amount" DECIMAL(10,2) NOT NULL,
  "allocationOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "payment_allocations_paymentId_idx" ON "payment_allocations"("paymentId");
CREATE INDEX IF NOT EXISTS "payment_allocations_invoiceId_idx" ON "payment_allocations"("invoiceId");

-- Foreign keys (drop-then-add for idempotency)
ALTER TABLE "rent_invoices" DROP CONSTRAINT IF EXISTS "rent_invoices_companyId_fkey";
ALTER TABLE "rent_invoices" ADD CONSTRAINT "rent_invoices_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "rent_invoices" DROP CONSTRAINT IF EXISTS "rent_invoices_leaseId_fkey";
ALTER TABLE "rent_invoices" ADD CONSTRAINT "rent_invoices_leaseId_fkey"
  FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "rent_invoices" DROP CONSTRAINT IF EXISTS "rent_invoices_tenantId_fkey";
ALTER TABLE "rent_invoices" ADD CONSTRAINT "rent_invoices_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "rent_invoices" DROP CONSTRAINT IF EXISTS "rent_invoices_propertyId_fkey";
ALTER TABLE "rent_invoices" ADD CONSTRAINT "rent_invoices_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payment_allocations" DROP CONSTRAINT IF EXISTS "payment_allocations_paymentId_fkey";
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payment_allocations" DROP CONSTRAINT IF EXISTS "payment_allocations_invoiceId_fkey";
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_invoiceId_fkey"
  FOREIGN KEY ("invoiceId") REFERENCES "rent_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
