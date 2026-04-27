import "dotenv/config";
import { z } from "zod";

export const envSchema = z.object({
  BROKER_URL: z
    .string()
    .min(
      1,
      "BROKER_URL is missing. The sensor has nowhere to send data. Use mqtt://host:1883",
    ),
  MQTT_USERNAME: z.string().min(1, "MQTT_USERNAME is missing."),
  MQTT_PASSWORD: z.string().min(1, "MQTT_PASSWORD is missing."),
  COMPANY_ID: z.string().min(1, "COMPANY_ID is missing."),
  LOCATION_ID: z.string().min(1, "LOCATION_ID is missing."),
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
  SERIAL_PORT_LISTEN: z.coerce
    .string()
    .nonempty("SERIAL_PORT_LISTEN is missing from .env"),
  SERIAL_PORT_SENDER: z.coerce
    .string()
    .nonempty("SERIAL_PORT_WRITER is missing from .env"),
  SERIAL_DELIMITER: z.coerce.string(),
  IS_REAL_DEVICE: z.coerce
    .string()
    .nonempty("IS_REAL_DEVICE is missing from .env")
    .refine(
      (value) => value === "true" || value === "false",
      "IS_REAL_DEVICE must be true or false.",
    ),
  UDP_HOST: z.coerce.string().nonempty("UDP_HOST is missing from .env"),
  UDP_PORT: z.coerce
    .number()
    .refine(
      (value) =>
        !Number.isNaN(value) &&
        Number.isInteger(value) &&
        value > 0 &&
        value <= 65535,
      "UDP_PORT must be an integer between 1 and 65535.",
    ),
  SEND_Hz: z.coerce
    .number()
    .refine(
      (value) => !Number.isNaN(value) && Number.isFinite(value) && value > 0,
      "SEND_Hz must be > 0.",
    ),
  FAIL_CHANCE: z.coerce.number().int().nonnegative().default(0),
});

export const ENV = envSchema.safeParse(process.env).data;
if (!ENV) throw new Error("env broken");

export const {
  BROKER_URL,
  MQTT_USERNAME,
  MQTT_PASSWORD,
  COMPANY_ID,
  LOCATION_ID,
  DATACENTER_ID,
  MACHINE_ID,
  SERIAL_PORT_LISTEN,
  SERIAL_PORT_SENDER,
  SERIAL_DELIMITER,
  IS_REAL_DEVICE,
  UDP_HOST,
  UDP_PORT,
  SEND_Hz,
  FAIL_CHANCE,
} = ENV;
