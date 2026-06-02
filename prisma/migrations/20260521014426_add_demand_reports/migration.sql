-- CreateEnum
CREATE TYPE "DemandReportStatus" AS ENUM ('PENDING', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "demand_reports" (
    "id" TEXT NOT NULL,
    "demand_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "DemandReportStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demand_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "demand_reports_demand_id_idx" ON "demand_reports"("demand_id");

-- CreateIndex
CREATE INDEX "demand_reports_user_id_idx" ON "demand_reports"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "demand_reports_demand_id_user_id_key" ON "demand_reports"("demand_id", "user_id");

-- AddForeignKey
ALTER TABLE "demand_reports" ADD CONSTRAINT "demand_reports_demand_id_fkey" FOREIGN KEY ("demand_id") REFERENCES "demands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_reports" ADD CONSTRAINT "demand_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
