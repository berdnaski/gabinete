-- CreateTable
CREATE TABLE "user_neighborhoods" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "label" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_neighborhoods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_neighborhoods_user_id_idx" ON "user_neighborhoods"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_neighborhoods_user_id_neighborhood_city_state_key" ON "user_neighborhoods"("user_id", "neighborhood", "city", "state");

-- AddForeignKey
ALTER TABLE "user_neighborhoods" ADD CONSTRAINT "user_neighborhoods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
