import {
  DATABASE_URL,
  DATACENTER_ID,
  IS_REAL_DEVICE,
  MACHINE_ID,
} from "./utils/env-schema.ts";
import { sensorOutputSchema } from "./utils/sensor-output-schema.ts";
import { Pool } from "pg";
import { readFromComPort } from "./read-from-COM.ts";
import { readFromTcp } from "./read-from-TCP.ts";
import { generateID } from "./utils/generate-id.ts";

const db = new Pool({connectionString: DATABASE_URL});
export async function handleLine(rawLine: string) {
  const validated = sensorOutputSchema.parse(rawLine);
  await db.query(
    `insert into sensor_readings (
      id,
      raw_line,
      p1_ohms,
      p2_ohms,
      p3_ohms,
      p4_ohms,
      p5_ohms,
      p6_ohms,
      p1_status_code,
      p2_status_code,
      p3_status_code,
      p4_status_code,
      p5_status_code,
      p6_status_code,
      boost_voltage_v,
      box_status_code,
      datacenter_id,
      machine_id
    ) values (
      $1, $2, $3, $4, $5, $6, $7, $8, $9,
      $10, $11, $12, $13, $14, $15, $16, $17, $18
    )`,
    [
      generateID().toString(),
      validated.rawLine,
      validated.p1Ohms,
      validated.p2Ohms,
      validated.p3Ohms,
      validated.p4Ohms,
      validated.p5Ohms,
      validated.p6Ohms,
      validated.p1StatusCode,
      validated.p2StatusCode,
      validated.p3StatusCode,
      validated.p4StatusCode,
      validated.p5StatusCode,
      validated.p6StatusCode,
      validated.boostVoltageV,
      validated.boxStatusCode,
      DATACENTER_ID,
      MACHINE_ID,
    ]
  );
}

if (IS_REAL_DEVICE === "true") readFromComPort();
else readFromTcp();
