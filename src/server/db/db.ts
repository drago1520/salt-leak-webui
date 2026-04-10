import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './drizzle-kit/schema';
import { Pool } from 'pg';
//DO NOT PUT exports for front-end here

const connectionString = process.env.DATABASE_URL;

if (!connectionString) throw new Error('DATABASE_URL is not set');

const pool = new Pool({ connectionString }); //pg was making problems

export const db = drizzle(pool, { schema });
