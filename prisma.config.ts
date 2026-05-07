import { defineConfig } from "prisma/config";
import { existsSync } from "fs";
import { configDotenv } from "dotenv";

if (existsSync(".env")) {
  configDotenv();
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
