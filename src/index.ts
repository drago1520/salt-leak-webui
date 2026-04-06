import { ReadlineParser } from "@serialport/parser-readline";
import { SerialPort } from "serialport";
import { ENV } from "./utils/env-schema";
import { generateID } from "./utils/generate-id";
import { sensorOutputSchema } from "./utils/sensor-output-schema";

export const DATABASE_URL = ENV.DATABASE_URL;
export const SERIAL_PORT = ENV.SERIAL_PORT ?? "COM3";
export const SERIAL_DELIMITER = ENV.SERIAL_DELIMITER ?? "\r\n";
export const DATACENTER_ID = ENV.DATACENTER_ID;
export const MACHINE_ID = ENV.MACHINE_ID;

const db = new Bun.SQL(DATABASE_URL);

const port = new SerialPort({
  path: SERIAL_PORT,
  baudRate: 115200,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
});

const parser = port.pipe(new ReadlineParser({ delimiter: SERIAL_DELIMITER }));

parser.on("data", line => {
  void (async () => {
    const rawLine = String(line).trim();
    const validated = sensorOutputSchema.parse(rawLine);

    await db`
      insert into sensor_readings ( id, raw_line, p1_ohms, p2_ohms, p3_ohms, p4_ohms, p5_ohms, p6_ohms, p1_status_code, p2_status_code, p3_status_code, p4_status_code, p5_status_code, p6_status_code, boost_voltage_v, box_status_code, datacenter_id, machine_id ) values (
        ${generateID()},
        ${validated.rawLine},
        ${validated.p1Ohms},
        ${validated.p2Ohms},
        ${validated.p3Ohms},
        ${validated.p4Ohms},
        ${validated.p5Ohms},
        ${validated.p6Ohms},
        ${validated.p1StatusCode},
        ${validated.p2StatusCode},
        ${validated.p3StatusCode},
        ${validated.p4StatusCode},
        ${validated.p5StatusCode},
        ${validated.p6StatusCode},
        ${validated.boostVoltageV},
        ${validated.boxStatusCode},
        ${DATACENTER_ID},
        ${MACHINE_ID}
      )
    `;
  })().catch(error => {
    console.error("Line handling failed:", error);
  });
});

port.on("open", () => {
  console.log(`Reading sensor data from ${port.path}`);
});

port.on("error", error => {
  console.error("Serial port error:", error);
});
