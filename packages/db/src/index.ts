import { drizzle } from "drizzle-orm/node-postgres";
import * as tables from "./drizzle-kit/schema.ts";
import * as relations from './drizzle-kit/relations.ts'
import { Pool } from "pg";

const connectionString = process.env.DB_URL;

if (!connectionString) throw new Error("DB_URL is not set");

const pool = new Pool({ connectionString }); //pg was making problems

export const db = drizzle(pool, { schema: {...tables, ...relations } });
