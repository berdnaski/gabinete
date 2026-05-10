/*
  Warnings:

  - A unique constraint covering the columns `[survey_token]` on the table `demands` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "demands" ADD COLUMN     "guest_phone" TEXT,
ADD COLUMN     "survey_comment" TEXT,
ADD COLUMN     "survey_rating" INTEGER,
ADD COLUMN     "survey_submitted_at" TIMESTAMP(3),
ADD COLUMN     "survey_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "demands_survey_token_key" ON "demands"("survey_token");
