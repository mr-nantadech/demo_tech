import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Prisma CLI does not auto-load .env.local, so we load it manually
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!,
  },
});
