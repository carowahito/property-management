-- SOP 015: Monthly Portfolio Health Review

CREATE TABLE IF NOT EXISTS "portfolio_health_reviews" (
  "id"                   TEXT NOT NULL PRIMARY KEY,
  "period"               TEXT NOT NULL,
  "reviewDate"           TIMESTAMP(3) NOT NULL,
  "completedAt"          TIMESTAMP(3),
  "directorSignedOffAt"  TIMESTAMP(3),
  "directorSignedOffBy"  TEXT,
  "directorNotes"        TEXT,
  "summary"              JSONB NOT NULL,
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "tenant_health_scores" (
  "id"                   TEXT NOT NULL PRIMARY KEY,
  "reviewId"             TEXT NOT NULL,
  "tenantId"             TEXT NOT NULL,
  "leaseId"              TEXT NOT NULL,
  "propertyId"           TEXT NOT NULL,

  "paymentScore"         TEXT NOT NULL,
  "paymentNotes"         TEXT,
  "arrearsScore"         TEXT NOT NULL,
  "arrearsNotes"         TEXT,
  "contactScore"         TEXT NOT NULL,
  "contactNotes"         TEXT,
  "inspectionScore"      TEXT NOT NULL,
  "inspectionNotes"      TEXT,

  "overallRisk"          TEXT NOT NULL,
  "redCount"             INTEGER NOT NULL DEFAULT 0,
  "flaggedForDirector"   BOOLEAN NOT NULL DEFAULT false,
  "followUpTaskId"       TEXT,
  "recommendedAction"    TEXT,
  "agentNotes"           TEXT,
  "directorApproved"     BOOLEAN NOT NULL DEFAULT false,
  "directorApprovedAt"   TIMESTAMP(3),

  "latePaymentCount"     INTEGER NOT NULL DEFAULT 0,
  "currentBalance"       DECIMAL(10,2) NOT NULL DEFAULT 0,
  "monthlyRent"          DECIMAL(10,2) NOT NULL,
  "daysSinceContact"     INTEGER,
  "daysSinceInspection"  INTEGER,

  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL,

  CONSTRAINT "tenant_health_scores_reviewId_fkey"
    FOREIGN KEY ("reviewId") REFERENCES "portfolio_health_reviews"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "tenant_health_scores_reviewId_idx" ON "tenant_health_scores"("reviewId");
CREATE INDEX IF NOT EXISTS "tenant_health_scores_tenantId_idx" ON "tenant_health_scores"("tenantId");
CREATE INDEX IF NOT EXISTS "tenant_health_scores_flaggedForDirector_idx" ON "tenant_health_scores"("flaggedForDirector");
