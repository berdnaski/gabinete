-- AlterTable
ALTER TABLE "cabinet_feature_overrides" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "cabinet_subscriptions" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "cabinet_feature_overrides_deleted_at_idx" ON "cabinet_feature_overrides"("deleted_at");

-- CreateIndex
CREATE INDEX "cabinet_subscriptions_deleted_at_idx" ON "cabinet_subscriptions"("deleted_at");

-- CreateIndex
CREATE INDEX "plans_deleted_at_idx" ON "plans"("deleted_at");
