-- DropIndex
DROP INDEX "cabinet_subscriptions_cabinet_id_key";

-- DropIndex
DROP INDEX "cabinet_subscriptions_deleted_at_idx";

-- CreateIndex
CREATE INDEX "cabinet_subscriptions_cabinet_id_deleted_at_idx" ON "cabinet_subscriptions"("cabinet_id", "deleted_at");
