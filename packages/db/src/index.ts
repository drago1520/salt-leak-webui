import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './drizzle-kit/schema.ts';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) throw new Error('DATABASE_URL is not set');

const pool = new Pool({ connectionString }); //pg was making problems

export const db = drizzle(pool, { schema });
