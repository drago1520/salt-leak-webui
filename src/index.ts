import { DATABASE_URL, DATACENTER_ID, IS_REAL_DEVICE_TEST, MACHINE_ID } from "./utils/env-schema";
import { generateID } from "./utils/generate-id";
import { sensorOutputSchema } from "./utils/sensor-output-schema";
import { readFromComPort } from "./read-from-COM";
import { readFromTcp } from "./read-from-TCP";

const db = new Bun.SQL(DATABASE_URL);

export async function handleLine(rawLine: string) {
  const validated = sensorOutputSchema.parse(rawLine);

  await db`
    insert into sensor_readings ( id, raw_line, p1_ohms, p2_ohms, p3_ohms, p4_ohms, p5_ohms, p6_ohms, p1_status_code, p2_status_code, p3_status_code, p4_status_code, p5_status_code, p6_status_code, boost_voltage_v, box_status_code, datacenter_id, machine_id ) values ( ${generateID()}, ${validated.rawLine}, ${validated.p1Ohms}, ${validated.p2Ohms}, ${validated.p3Ohms}, ${validated.p4Ohms}, ${validated.p5Ohms}, ${validated.p6Ohms}, ${validated.p1StatusCode}, ${validated.p2StatusCode}, ${validated.p3StatusCode}, ${validated.p4StatusCode}, ${validated.p5StatusCode}, ${validated.p6StatusCode}, ${validated.boostVoltageV}, ${validated.boxStatusCode}, ${DATACENTER_ID}, ${MACHINE_ID}
    )
  `;
}

if (IS_REAL_DEVICE_TEST === "true") readFromComPort();
else readFromTcp();



