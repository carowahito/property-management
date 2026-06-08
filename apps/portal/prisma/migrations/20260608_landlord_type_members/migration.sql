-- Drop the unit_co_owners table (joint ownership is now modelled on the Landlord entity)
DROP TABLE IF EXISTS "unit_co_owners";

-- Add LandlordType enum
DO $$ BEGIN
  CREATE TYPE "LandlordType" AS ENUM ('INDIVIDUAL', 'COMPANY', 'JOINT_OWNERSHIP');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Add type column to landlords (default INDIVIDUAL for all existing records)
ALTER TABLE "landlords"
  ADD COLUMN IF NOT EXISTS "type" "LandlordType" NOT NULL DEFAULT 'INDIVIDUAL';

-- Create landlord_members table
CREATE TABLE IF NOT EXISTS "landlord_members" (
  "id"                 TEXT NOT NULL,
  "landlordId"         TEXT NOT NULL,
  "name"               TEXT NOT NULL,
  "idNumber"           TEXT,
  "phone"              TEXT,
  "email"              TEXT,
  "nationality"        TEXT,
  "countryOfResidence" TEXT,
  "ownershipPercent"   DECIMAL(5, 2),
  "isPrimary"          BOOLEAN NOT NULL DEFAULT false,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "landlord_members_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "landlord_members_landlordId_fkey"
    FOREIGN KEY ("landlordId") REFERENCES "landlords"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "landlord_members_landlordId_idx"
  ON "landlord_members"("landlordId");
