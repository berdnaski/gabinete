-- CreateEnum
CREATE TYPE "CabinetSectionType" AS ENUM ('HERO', 'BIOGRAPHY', 'PRIORITIES', 'STATS', 'RESULTS', 'TESTIMONIALS', 'NEWS', 'GALLERY', 'FAQ', 'ACTION_MAP', 'TIMELINE', 'DEMANDS_CTA', 'CONTACT');

-- AlterTable
ALTER TABLE "cabinets" ADD COLUMN     "biography_content" TEXT,
ADD COLUMN     "biography_photo_key" TEXT,
ADD COLUMN     "biography_photo_url" TEXT,
ADD COLUMN     "hero_subtitle" TEXT,
ADD COLUMN     "hero_title" TEXT,
ADD COLUMN     "hero_video_url" TEXT,
ADD COLUMN     "tiktok_url" TEXT,
ADD COLUMN     "whatsapp_url" TEXT,
ADD COLUMN     "youtube_url" TEXT;

-- CreateTable
CREATE TABLE "cabinet_sections" (
    "id" TEXT NOT NULL,
    "cabinet_id" TEXT NOT NULL,
    "type" "CabinetSectionType" NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cabinet_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabinet_articles" (
    "id" TEXT NOT NULL,
    "cabinet_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "cover_url" TEXT,
    "cover_key" TEXT,
    "category" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "disabled_at" TIMESTAMP(3),

    CONSTRAINT "cabinet_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabinet_gallery_images" (
    "id" TEXT NOT NULL,
    "cabinet_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cabinet_gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cabinet_sections_cabinet_id_idx" ON "cabinet_sections"("cabinet_id");

-- CreateIndex
CREATE UNIQUE INDEX "cabinet_sections_cabinet_id_type_key" ON "cabinet_sections"("cabinet_id", "type");

-- CreateIndex
CREATE INDEX "cabinet_articles_cabinet_id_idx" ON "cabinet_articles"("cabinet_id");

-- CreateIndex
CREATE INDEX "cabinet_articles_published_at_idx" ON "cabinet_articles"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "cabinet_articles_cabinet_id_slug_key" ON "cabinet_articles"("cabinet_id", "slug");

-- CreateIndex
CREATE INDEX "cabinet_gallery_images_cabinet_id_idx" ON "cabinet_gallery_images"("cabinet_id");

-- AddForeignKey
ALTER TABLE "cabinet_sections" ADD CONSTRAINT "cabinet_sections_cabinet_id_fkey" FOREIGN KEY ("cabinet_id") REFERENCES "cabinets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_articles" ADD CONSTRAINT "cabinet_articles_cabinet_id_fkey" FOREIGN KEY ("cabinet_id") REFERENCES "cabinets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_gallery_images" ADD CONSTRAINT "cabinet_gallery_images_cabinet_id_fkey" FOREIGN KEY ("cabinet_id") REFERENCES "cabinets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
