import { defineConfig } from "drizzle-kit";
const databaseUrl = process.env.DB_URL;

if (!databaseUrl) throw new Error("DB_URL is not set");

export default defineConfig({
  out: "./src/server/db/drizzle-kit",
  // schema: './src/server/db/drizzle-kit/schema.ts',
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
