/*
  Warnings:

  - You are about to drop the column `type` on the `result_images` table. All the data in the column will be lost.
  - You are about to drop the column `is_public` on the `results` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "result_images" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "results" DROP COLUMN "is_public",
ADD COLUMN     "protocol_file_key" TEXT,
ADD COLUMN     "protocol_file_mime_type" TEXT,
ADD COLUMN     "protocol_file_name" TEXT,
ADD COLUMN     "protocol_file_size" INTEGER,
ADD COLUMN     "protocol_file_url" TEXT;

-- DropEnum
DROP TYPE "ResultImageType";

-- CreateIndex
CREATE INDEX "result_images_result_id_idx" ON "result_images"("result_id");
