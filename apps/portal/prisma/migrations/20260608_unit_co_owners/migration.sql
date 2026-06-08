-- Joint unit ownership (display only — financials use Unit.landlordId as primary owner)
CREATE TABLE IF NOT EXISTS "unit_co_owners" (
  "id"               TEXT NOT NULL PRIMARY KEY,
  "unitId"           TEXT NOT NULL,
  "landlordId"       TEXT NOT NULL,
  "ownershipPercent" DECIMAL(5,2),
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "unit_co_owners_unitId_fkey"
    FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE,
  CONSTRAINT "unit_co_owners_landlordId_fkey"
    FOREIGN KEY ("landlordId") REFERENCES "landlords"("id") ON DELETE CASCADE,
  CONSTRAINT "unit_co_owners_unitId_landlordId_key"
    UNIQUE ("unitId", "landlordId")
);

CREATE INDEX IF NOT EXISTS "unit_co_owners_unitId_idx"     ON "unit_co_owners"("unitId");
CREATE INDEX IF NOT EXISTS "unit_co_owners_landlordId_idx" ON "unit_co_owners"("landlordId");
