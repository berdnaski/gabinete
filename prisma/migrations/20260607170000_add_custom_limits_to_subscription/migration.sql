-- AlterTable: add custom limit overrides to cabinet_subscriptions
ALTER TABLE "cabinet_subscriptions"
  ADD COLUMN "price_in_cents"    INTEGER,
  ADD COLUMN "max_members"       INTEGER,
  ADD COLUMN "max_demands"       INTEGER,
  ADD COLUMN "max_storage_bytes" DOUBLE PRECISION;

-- Backfill existing rows from their plan values
UPDATE "cabinet_subscriptions" cs
SET
  price_in_cents    = p.price_in_cents,
  max_members       = p.max_members,
  max_demands       = p.max_demands,
  max_storage_bytes = p.max_storage_bytes
FROM "plans" p
WHERE cs.plan_id = p.id;
