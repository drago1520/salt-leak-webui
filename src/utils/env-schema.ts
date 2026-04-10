import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.coerce.string().nonempty("DATABASE_URL is missing from .env"),
  DATACENTER_ID: z.coerce
    .number()
    .refine(
      (value) => !Number.isNaN(value),
      'DATACENTER_ID is missing from the enviroment variables. TLDR: if only 1 server, set DATACENTER_ID = 0, MACHINE_ID = 0 in root level .env. Long: It is used to generate an ID for every new sensor message. There can be 32 Datacenters with 32 MACHINE_ID (sensor servers) in each. Pick a number for DATACENTER_ID = 1. Use it until you have 32 MACHINE_IDs. Then make DATACENTER_ID = 1. See "Twitter Snowflake ID" how this works.',
    )
    .refine(
      (value) => Number.isInteger(value) && value >= 0 && value <= 31,
      "DATACENTER_ID must be an integer between 0 and 31.",
    ),
  MACHINE_ID: z.coerce
    .number()
    .refine(
      (value) => !Number.isNaN(value),
      "MACHINE_ID is missing from the enviroment variables. Use the next avaliable MACHINE_ID for the DATACENTER_ID. See 'Twitter Snowflake ID'",
    )
    .refine(
      (value) => Number.isInteger(value) && value >= 0 && value <= 31,
      "MACHINE_ID must be an integer between 0 and 31.",
    ),
  SERIAL_PORT: z.coerce.string().nonempty("SERIAL_PORT is missing from .env"),
  SERIAL_DELIMITER: z.coerce.string(),
  IS_REAL_DEVICE: z.coerce
    .string()
    .nonempty("IS_REAL_DEVICE is missing from .env")
    .refine(
      (value) => value === "true" || value === "false",
      "IS_REAL_DEVICE must be true or false.",
    ),
  TCP_HOST: z.coerce.string().nonempty("TCP_HOST is missing from .env"),
  TCP_PORT: z.coerce
    .number()
    .refine(
      (value) =>
        !Number.isNaN(value) &&
        Number.isInteger(value) &&
        value > 0 &&
        value <= 65535,
      "TCP_PORT must be an integer between 1 and 65535.",
    ),
  TCP_SEND_Hz: z.coerce
    .number()
    .refine(
      (value) => !Number.isNaN(value) && Number.isFinite(value) && value > 0,
      "TCP_SEND_Hz must be > 0.",
    ),
});

export const ENV = envSchema.parse(process.env);

export const {
  DATABASE_URL,
  DATACENTER_ID,
  MACHINE_ID,
  SERIAL_PORT,
  SERIAL_DELIMITER,
  IS_REAL_DEVICE,
  TCP_HOST,
  TCP_PORT,
  TCP_SEND_Hz,
} = ENV;
