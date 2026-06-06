-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('ESSENCIAL', 'PROFISSIONAL', 'CAPITAL');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OverrideType" AS ENUM ('GRANT', 'BLOCK');

-- CreateEnum
CREATE TYPE "OverrideSource" AS ENUM ('ADD_ON', 'CUSTOM_CONTRACT', 'TRIAL', 'GIFT', 'ADMIN');

-- CreateTable
CREATE TABLE "features" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "features_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "name" TEXT NOT NULL,
    "price_in_cents" INTEGER NOT NULL,
    "max_members" INTEGER,
    "max_demands" INTEGER,
    "max_storage_gb" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_features" (
    "plan_id" TEXT NOT NULL,
    "feature_slug" TEXT NOT NULL,
    "effective_from" TIMESTAMP(3),

    CONSTRAINT "plan_features_pkey" PRIMARY KEY ("plan_id","feature_slug")
);

-- CreateTable
CREATE TABLE "cabinet_subscriptions" (
    "id" TEXT NOT NULL,
    "cabinet_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_period_start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_period_end" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cabinet_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabinet_feature_overrides" (
    "id" TEXT NOT NULL,
    "cabinet_id" TEXT NOT NULL,
    "feature_slug" TEXT NOT NULL,
    "type" "OverrideType" NOT NULL DEFAULT 'GRANT',
    "source" "OverrideSource" NOT NULL,
    "expires_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cabinet_feature_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plans_tier_key" ON "plans"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "cabinet_subscriptions_cabinet_id_key" ON "cabinet_subscriptions"("cabinet_id");

-- CreateIndex
CREATE UNIQUE INDEX "cabinet_feature_overrides_cabinet_id_feature_slug_key" ON "cabinet_feature_overrides"("cabinet_id", "feature_slug");

-- AddForeignKey
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_feature_slug_fkey" FOREIGN KEY ("feature_slug") REFERENCES "features"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_subscriptions" ADD CONSTRAINT "cabinet_subscriptions_cabinet_id_fkey" FOREIGN KEY ("cabinet_id") REFERENCES "cabinets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_subscriptions" ADD CONSTRAINT "cabinet_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_feature_overrides" ADD CONSTRAINT "cabinet_feature_overrides_cabinet_id_fkey" FOREIGN KEY ("cabinet_id") REFERENCES "cabinets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_feature_overrides" ADD CONSTRAINT "cabinet_feature_overrides_feature_slug_fkey" FOREIGN KEY ("feature_slug") REFERENCES "features"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
