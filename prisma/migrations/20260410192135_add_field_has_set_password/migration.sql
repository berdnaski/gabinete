-- AlterTable
ALTER TABLE "cabinets" ADD COLUMN     "in_progress_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resolved_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "has_set_password" BOOLEAN NOT NULL DEFAULT true;
