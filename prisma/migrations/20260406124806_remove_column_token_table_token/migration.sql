/*
  Warnings:

  - You are about to drop the column `token` on the `tokens` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "tokens_token_key";

-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "token";
