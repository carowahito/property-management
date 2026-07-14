-- SOP 004 / BR-1a: send/suppress audit trail on rent invoices.
ALTER TABLE "rent_invoices" ADD COLUMN IF NOT EXISTS "events" JSONB;
