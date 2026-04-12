-- CreateTable
CREATE TABLE "cabinet_invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "cabinet_id" TEXT NOT NULL,
    "role" "CabinetRole" NOT NULL DEFAULT 'STAFF',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cabinet_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cabinet_invitations_token_key" ON "cabinet_invitations"("token");

-- CreateIndex
CREATE INDEX "cabinet_invitations_email_idx" ON "cabinet_invitations"("email");

-- CreateIndex
CREATE INDEX "cabinet_invitations_token_idx" ON "cabinet_invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "cabinet_invitations_email_cabinet_id_key" ON "cabinet_invitations"("email", "cabinet_id");

-- AddForeignKey
ALTER TABLE "cabinet_invitations" ADD CONSTRAINT "cabinet_invitations_cabinet_id_fkey" FOREIGN KEY ("cabinet_id") REFERENCES "cabinets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
