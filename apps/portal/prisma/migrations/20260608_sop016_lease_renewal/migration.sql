-- SOP 016: Lease Renewal & Rent Review — additional fields

ALTER TABLE "lease_renewals"
  ADD COLUMN IF NOT EXISTS "healthCheckOutcome"    JSONB,
  ADD COLUMN IF NOT EXISTS "healthCheckCompletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "directorEscalated"     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "directorEscalatedAt"   TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rentReviewBasis"        TEXT,
  ADD COLUMN IF NOT EXISTS "rentReviewFormula"      TEXT,
  ADD COLUMN IF NOT EXISTS "landlordWrittenAuthority" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "cpiReference"           TEXT,
  ADD COLUMN IF NOT EXISTS "responseDeadline"       TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rentEffectiveDate"      TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "contactAttempts"        JSONB,
  ADD COLUMN IF NOT EXISTS "noResponseNoticeAt"     TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "periodicAuthorisedAt"   TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "periodicTerms"          JSONB,
  ADD COLUMN IF NOT EXISTS "periodicReviewReminderAt" TIMESTAMP(3);
