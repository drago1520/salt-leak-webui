import { drizzle } from 'drizzle-orm/bun-sql';
import * as schema from './drizzle-kit/schema';
//DO NOT PUT exports for front-end here

const connectionString = process.env.DATABASE_URL;

if (!connectionString) throw new Error('DATABASE_URL is not set');

const pool = new Bun.SQL(connectionString); //pg was making problems

export const db = drizzle(pool, { schema });
