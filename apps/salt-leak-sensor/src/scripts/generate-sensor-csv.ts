import { writeFile } from "node:fs/promises";
import { DATACENTER_ID, MACHINE_ID } from "../utils/env-schema.ts";
import { generateID } from "../utils/generate-id.ts";
import { simulateSensorOutput } from "../utils/simulate-sensor-output.ts";
import { sensorOutputSchema } from "../utils/sensor-output-schema.ts";

const RECORD_COUNT = Number(process.argv[2] ?? 10_500_000);
const OUTPUT_PATH = process.argv[3] ?? `sensor-output-${RECORD_COUNT}.csv`;

const formatTimestamp = (date: Date) => date.toISOString().slice(0, 19).replace("T", " ");

const csv =
  "id,received_at,raw_line,p1_ohms,p2_ohms,p3_ohms,p4_ohms,p5_ohms,p6_ohms,p1_status_code,p2_status_code,p3_status_code,p4_status_code,p5_status_code,p6_status_code,boost_voltage_v,box_status_code,datacenter_id,machine_id\n" +
  Array.from({ length: RECORD_COUNT }, () => {
    const preset: "lower" | "higher" = Math.random() < 0.5 ? "lower" : "higher";
    const rawLine = simulateSensorOutput(preset);
    const parsed = sensorOutputSchema.parse(rawLine);
    const id = generateID().toString();
    const receivedAt = formatTimestamp(new Date());

    return [
      `"${id}"`,
      `"${receivedAt}"`,
      `"${rawLine}"`,
      parsed.p1Ohms,
      parsed.p2Ohms,
      parsed.p3Ohms,
      parsed.p4Ohms,
      parsed.p5Ohms,
      parsed.p6Ohms,
      parsed.p1StatusCode,
      parsed.p2StatusCode,
      parsed.p3StatusCode,
      parsed.p4StatusCode,
      parsed.p5StatusCode,
      parsed.p6StatusCode,
      parsed.boostVoltageV,
      parsed.boxStatusCode,
      DATACENTER_ID,
      MACHINE_ID,
    ].join(",") + "\n";
  }).join("");

await writeFile(OUTPUT_PATH, csv, "utf8");

console.log(`Wrote ${RECORD_COUNT} rows to ${OUTPUT_PATH}`);
