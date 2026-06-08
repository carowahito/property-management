-- SOP 004: Rent Collection & Arrears Management — additional fields

-- Lease: rent due day, grace period, daily penalty rate
ALTER TABLE "leases"
  ADD COLUMN IF NOT EXISTS "rentDueDay"         INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "gracePeriodDays"    INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS "latePenaltyPerDay"  DECIMAL(10,2) NOT NULL DEFAULT 500;

-- ArrearsEscalation: penalty tracking, contact log, flags
ALTER TABLE "arrears_escalations"
  ADD COLUMN IF NOT EXISTS "penaltyPerDay"           DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "penaltyAccrued"          DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "landlordNotifiedDay6At"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "contactAttempts"         JSONB,
  ADD COLUMN IF NOT EXISTS "lastContactAt"           TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "paymentPromisedDate"     TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "paymentPromisedAmount"   DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "unreachable"             BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "unreachableSince"        TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "suspectedAbandonment"    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "abandonmentFlaggedAt"    TIMESTAMP(3);
