/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cabinet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CabinetMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Demand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DemandComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DemandEvidence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DemandLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Result` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResultImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "CabinetMember" DROP CONSTRAINT "CabinetMember_cabinetId_fkey";

-- DropForeignKey
ALTER TABLE "CabinetMember" DROP CONSTRAINT "CabinetMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Demand" DROP CONSTRAINT "Demand_assigneeMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Demand" DROP CONSTRAINT "Demand_cabinetId_fkey";

-- DropForeignKey
ALTER TABLE "Demand" DROP CONSTRAINT "Demand_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Demand" DROP CONSTRAINT "Demand_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "DemandComment" DROP CONSTRAINT "DemandComment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "DemandComment" DROP CONSTRAINT "DemandComment_demandId_fkey";

-- DropForeignKey
ALTER TABLE "DemandEvidence" DROP CONSTRAINT "DemandEvidence_demandId_fkey";

-- DropForeignKey
ALTER TABLE "DemandLike" DROP CONSTRAINT "DemandLike_demandId_fkey";

-- DropForeignKey
ALTER TABLE "DemandLike" DROP CONSTRAINT "DemandLike_userId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_cabinetId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_demandId_fkey";

-- DropForeignKey
ALTER TABLE "ResultImage" DROP CONSTRAINT "ResultImage_resultId_fkey";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Cabinet";

-- DropTable
DROP TABLE "CabinetMember";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Demand";

-- DropTable
DROP TABLE "DemandComment";

-- DropTable
DROP TABLE "DemandEvidence";

-- DropTable
DROP TABLE "DemandLike";

-- DropTable
DROP TABLE "Result";

-- DropTable
DROP TABLE "ResultImage";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "disabled_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabinets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "avatar_url" TEXT,
    "disabled_at" TIMESTAMP(3),

    CONSTRAINT "cabinets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabinet_members" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "cabinet_id" TEXT NOT NULL,
    "role" "CabinetRole" NOT NULL DEFAULT 'STAFF',

    CONSTRAINT "cabinet_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "disabled_at" TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demands" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DemandStatus" NOT NULL DEFAULT 'SUBMITTED',
    "priority" "DemandPriority" NOT NULL DEFAULT 'LOW',
    "address" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "long" DOUBLE PRECISION,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "reporter_id" TEXT,
    "guest_email" TEXT,
    "cabinet_id" TEXT,
    "category_id" TEXT,
    "assignee_member_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "disabled_at" TIMESTAMP(3),

    CONSTRAINT "demands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_evidences" (
    "id" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER,
    "demand_id" TEXT NOT NULL,

    CONSTRAINT "demand_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_likes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "demand_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_cabinet_response" BOOLEAN NOT NULL DEFAULT false,
    "demand_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ResultType" NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "cabinet_id" TEXT NOT NULL,
    "demand_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMP(3),

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "type" "ResultImageType" NOT NULL,
    "result_id" TEXT NOT NULL,

    CONSTRAINT "result_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "cabinets_slug_key" ON "cabinets"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cabinet_members_user_id_cabinet_id_key" ON "cabinet_members"("user_id", "cabinet_id");

-- CreateIndex
CREATE UNIQUE INDEX "demand_likes_user_id_demand_id_key" ON "demand_likes"("user_id", "demand_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_members" ADD CONSTRAINT "cabinet_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabinet_members" ADD CONSTRAINT "cabinet_members_cabinet_id_fkey" FOREIGN KEY ("cabinet_id") REFERENCES "cabinets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demands" ADD CONSTRAINT "demands_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demands" ADD CONSTRAINT "demands_cabinet_id_fkey" FOREIGN KEY ("cabinet_id") REFERENCES "cabinets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demands" ADD CONSTRAINT "demands_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demands" ADD CONSTRAINT "demands_assignee_member_id_fkey" FOREIGN KEY ("assignee_member_id") REFERENCES "cabinet_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_evidences" ADD CONSTRAINT "demand_evidences_demand_id_fkey" FOREIGN KEY ("demand_id") REFERENCES "demands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_likes" ADD CONSTRAINT "demand_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_likes" ADD CONSTRAINT "demand_likes_demand_id_fkey" FOREIGN KEY ("demand_id") REFERENCES "demands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_comments" ADD CONSTRAINT "demand_comments_demand_id_fkey" FOREIGN KEY ("demand_id") REFERENCES "demands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_comments" ADD CONSTRAINT "demand_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_cabinet_id_fkey" FOREIGN KEY ("cabinet_id") REFERENCES "cabinets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_demand_id_fkey" FOREIGN KEY ("demand_id") REFERENCES "demands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_images" ADD CONSTRAINT "result_images_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
