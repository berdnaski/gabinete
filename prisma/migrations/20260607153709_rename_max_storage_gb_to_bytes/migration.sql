/*
  Warnings:

  - You are about to drop the column `max_storage_gb` on the `plans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plans" DROP COLUMN "max_storage_gb",
ADD COLUMN     "max_storage_bytes" DOUBLE PRECISION;
