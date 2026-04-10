-- AlterEnum
ALTER TYPE "TokenType" ADD VALUE 'CHANGE_PASSWORD';

-- AlterTable
ALTER TABLE "tokens" ADD COLUMN     "payload" TEXT;
