-- SOP 004 / OQ-4: configurable late-payment penalty cap.
ALTER TABLE "leases" ADD COLUMN IF NOT EXISTS "penaltyCapMonths" DECIMAL(4,2);
ALTER TABLE "arrears_escalations" ADD COLUMN IF NOT EXISTS "penaltyCap" DECIMAL(10,2);
