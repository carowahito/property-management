-- Make Unit.landlordId nullable (true joint ownership with no forced single primary)
ALTER TABLE "units" ALTER COLUMN "landlordId" DROP NOT NULL;

-- Change FK to SET NULL on landlord delete (instead of CASCADE which would delete the unit)
ALTER TABLE "units" DROP CONSTRAINT IF EXISTS "units_landlordId_fkey";
ALTER TABLE "units" ADD CONSTRAINT "units_landlordId_fkey"
  FOREIGN KEY ("landlordId") REFERENCES "landlords"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Add isPrimary flag to co-owners (designates financial primary when Unit.landlordId is null)
ALTER TABLE "unit_co_owners"
  ADD COLUMN IF NOT EXISTS "isPrimary" BOOLEAN NOT NULL DEFAULT false;
