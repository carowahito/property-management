-- CreateEnum (idempotent)
DO $$ BEGIN
  CREATE TYPE "FeeType" AS ENUM ('FIXED', 'PERCENTAGE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable (idempotent)
ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "serviceChargeType" "FeeType" NOT NULL DEFAULT 'FIXED';
ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "managementFeeType" "FeeType" NOT NULL DEFAULT 'PERCENTAGE';
