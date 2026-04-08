-- CreateIndex
CREATE INDEX "cabinet_members_user_id_idx" ON "cabinet_members"("user_id");

-- CreateIndex
CREATE INDEX "cabinet_members_cabinet_id_idx" ON "cabinet_members"("cabinet_id");

-- CreateIndex
CREATE INDEX "cabinets_slug_idx" ON "cabinets"("slug");

-- CreateIndex
CREATE INDEX "cabinets_disabled_at_idx" ON "cabinets"("disabled_at");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_disabled_at_idx" ON "categories"("disabled_at");

-- CreateIndex
CREATE INDEX "demand_comments_demand_id_idx" ON "demand_comments"("demand_id");

-- CreateIndex
CREATE INDEX "demand_likes_demand_id_idx" ON "demand_likes"("demand_id");

-- CreateIndex
CREATE INDEX "demands_cabinet_id_idx" ON "demands"("cabinet_id");

-- CreateIndex
CREATE INDEX "demands_category_id_idx" ON "demands"("category_id");

-- CreateIndex
CREATE INDEX "demands_status_idx" ON "demands"("status");

-- CreateIndex
CREATE INDEX "demands_city_idx" ON "demands"("city");

-- CreateIndex
CREATE INDEX "demands_disabled_at_idx" ON "demands"("disabled_at");

-- CreateIndex
CREATE INDEX "results_cabinet_id_idx" ON "results"("cabinet_id");

-- CreateIndex
CREATE INDEX "results_disabled_at_idx" ON "results"("disabled_at");

-- CreateIndex
CREATE INDEX "users_disabled_at_idx" ON "users"("disabled_at");
