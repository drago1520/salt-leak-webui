import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z
    .string({
      error: issue => issue.input === undefined ? "DATABASE_URL is missing from .env" : "DATABASE_URL must be a Postgres connection string.",
    })
    .refine(value => value.trim() !== "", "DATABASE_URL is missing from .env"),
  DATACENTER_ID: z
    .string({
      error: issue => issue.input === undefined ? 'DATACENTER_ID is missing from the enviroment variables. TLDR: if only 1 server, set DATACENTER_ID = 0, MACHINE_ID = 0 in root level .env. Long: It is used to generate an ID for every new sensor message. There can be 32 Datacenters with 32 MACHINE_ID (sensor servers) in each. Pick a number for DATACENTER_ID = 1. Use it until you have 32 MACHINE_IDs. Then make DATACENTER_ID = 1. See "Twitter Snowflake ID" how this works.' : "DATACENTER_ID must be text.",
    })
    .refine(value => value.trim() !== "", 'DATACENTER_ID is missing from the enviroment variables. TLDR: if only 1 server, set DATACENTER_ID = 0, MACHINE_ID = 0 in root level .env. Long: It is used to generate an ID for every new sensor message. There can be 32 Datacenters with 32 MACHINE_ID (sensor servers) in each. Pick a number for DATACENTER_ID = 1. Use it until you have 32 MACHINE_IDs. Then make DATACENTER_ID = 1. See "Twitter Snowflake ID" how this works.')
    .transform(value => Number(value))
    .refine(value => Number.isInteger(value) && value >= 0 && value <= 31, "DATACENTER_ID must be an integer between 0 and 31."),
  MACHINE_ID: z
    .string({
      error: issue => issue.input === undefined ? "MACHINE_ID is missing from the enviroment variables. Use the next avaliable MACHINE_ID for the DATACENTER_ID. See 'Twitter Snowflake ID'" : "MACHINE_ID must be text.",
    })
    .refine(value => value.trim() !== "", "MACHINE_ID is missing from the enviroment variables. Use the next avaliable MACHINE_ID for the DATACENTER_ID. See 'Twitter Snowflake ID'")
    .transform(value => Number(value))
    .refine(value => Number.isInteger(value) && value >= 0 && value <= 31, "MACHINE_ID must be an integer between 0 and 31."),
  SERIAL_PORT: z.string().optional(),
  SERIAL_DELIMITER: z.string().optional(),
});

export const ENV = envSchema.parse(process.env);
