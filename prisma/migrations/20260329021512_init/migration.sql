-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "CabinetRole" AS ENUM ('OWNER', 'STAFF');

-- CreateEnum
CREATE TYPE "DemandStatus" AS ENUM ('SUBMITTED', 'IN_ANALYSIS', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CANCELED');

-- CreateEnum
CREATE TYPE "DemandPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ResultType" AS ENUM ('INFRASTRUCTURE', 'SOCIAL', 'LEGISLATIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "ResultImageType" AS ENUM ('BEFORE', 'AFTER', 'GENERAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "disabledAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cabinet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "avatarUrl" TEXT,
    "disabledAt" TIMESTAMP(3),

    CONSTRAINT "Cabinet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CabinetMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cabinetId" TEXT NOT NULL,
    "role" "CabinetRole" NOT NULL DEFAULT 'STAFF',

    CONSTRAINT "CabinetMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "disabledAt" TIMESTAMP(3),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demand" (
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
    "reporterId" TEXT,
    "guestEmail" TEXT,
    "cabinetId" TEXT,
    "categoryId" TEXT,
    "assigneeMemberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "disabledAt" TIMESTAMP(3),

    CONSTRAINT "Demand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandEvidence" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER,
    "demandId" TEXT NOT NULL,

    CONSTRAINT "DemandEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "demandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemandLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isCabinetResponse" BOOLEAN NOT NULL DEFAULT false,
    "demandId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemandComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ResultType" NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "cabinetId" TEXT NOT NULL,
    "demandId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabledAt" TIMESTAMP(3),

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "type" "ResultImageType" NOT NULL,
    "resultId" TEXT NOT NULL,

    CONSTRAINT "ResultImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Cabinet_slug_key" ON "Cabinet"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CabinetMember_userId_cabinetId_key" ON "CabinetMember"("userId", "cabinetId");

-- CreateIndex
CREATE UNIQUE INDEX "DemandLike_userId_demandId_key" ON "DemandLike"("userId", "demandId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CabinetMember" ADD CONSTRAINT "CabinetMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CabinetMember" ADD CONSTRAINT "CabinetMember_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "Cabinet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "Cabinet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_assigneeMemberId_fkey" FOREIGN KEY ("assigneeMemberId") REFERENCES "CabinetMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandEvidence" ADD CONSTRAINT "DemandEvidence_demandId_fkey" FOREIGN KEY ("demandId") REFERENCES "Demand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandLike" ADD CONSTRAINT "DemandLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandLike" ADD CONSTRAINT "DemandLike_demandId_fkey" FOREIGN KEY ("demandId") REFERENCES "Demand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandComment" ADD CONSTRAINT "DemandComment_demandId_fkey" FOREIGN KEY ("demandId") REFERENCES "Demand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandComment" ADD CONSTRAINT "DemandComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "Cabinet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_demandId_fkey" FOREIGN KEY ("demandId") REFERENCES "Demand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultImage" ADD CONSTRAINT "ResultImage_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
