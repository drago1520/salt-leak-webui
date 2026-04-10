import { DATACENTER_ID, DATABASE_URL, MACHINE_ID } from "../utils/env-schema";
import { generateID } from "../utils/generate-id";
import { sensorOutputSchema } from "../utils/sensor-output-schema";

const INPUT_PATH = process.argv[2] ?? "sensor-output-500k.csv";
const BATCH_SIZE = 1_000;

const db = new Bun.SQL(DATABASE_URL);
const file = Bun.file(INPUT_PATH);
const text = await file.text();
const lines = text.split(/\r?\n/).slice(1).filter(Boolean);

let values: Array<string | number | bigint> = [];
let inserted = 0;

const flush = async () => {
  if (values.length === 0) return;

  const rowWidth = 18;
  const rows = values.length / rowWidth;
  const placeholders = Array.from({ length: rows }, (_, rowIndex) => {
    const offset = rowIndex * rowWidth;
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13}, $${offset + 14}, $${offset + 15}, $${offset + 16}, $${offset + 17}, $${offset + 18})`;
  }).join(", ");

  await db.unsafe(
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
    ) values ${placeholders}`,
    values
  );

  inserted += rows;
  values = [];
};

for (const line of lines) {
  const rawLine = line.replace(/^"/, "").replace(/",[^"]*$/, "");
  const parsed = sensorOutputSchema.parse(rawLine);

  values.push(
    generateID(),
    parsed.rawLine,
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
    MACHINE_ID
  );

  if (values.length / 18 >= BATCH_SIZE) {
    await flush();
  }
}

await flush();

console.log(`Imported ${inserted} rows from ${INPUT_PATH}`);
await db.end();
