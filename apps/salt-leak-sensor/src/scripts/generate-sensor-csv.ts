//run on remote machine directly
import { createWriteStream } from "node:fs";
import { once } from "node:events";
import { DATACENTER_ID, MACHINE_ID } from "../utils/env-schema.ts";
import { simulateSensorOutput } from "../utils/simulate-sensor-output.ts";
import { generateID } from "@repo/shared/generate-id.ts";
const RECORD_COUNT = Number(process.argv[2] ?? 10_500_000),
  OUTPUT_PATH = process.argv[3] ?? `sensor-output-${RECORD_COUNT}.csv`,
  FLUSH_ROWS = 5_000_000,
  start = performance.now();

const formatTimestamp = (date: Date) => date.toISOString().slice(0, 19).replace("T", " ");

if (Bun.file(OUTPUT_PATH).size > 0) await Bun.file(OUTPUT_PATH).unlink();

const stream = createWriteStream(OUTPUT_PATH, { encoding: "utf8" }),
  buffer: { header: string, records: string[] } = {
    header: "id,received_at,raw_line,p1_ohms,p2_ohms,p3_ohms,p4_ohms,p5_ohms,p6_ohms,p1_status_code,p2_status_code,p3_status_code,p4_status_code,p5_status_code,p6_status_code,boost_voltage_v,box_status_code,datacenter_id,machine_id\n",
    records: []
  };

const flush = async () => {
  if (!buffer.records.length) return;
  if (!stream.write(buffer.records.join("\n") + "\n")) await once(stream, "drain");
  buffer.records.length = 0;
  Bun.gc(true);
};

stream.write(buffer.header);

for (let i = 1; i <= RECORD_COUNT; i++) {
  const preset: "lower" | "higher" = Math.random() < 0.5 ? "lower" : "higher";
  const rawLine = simulateSensorOutput(preset);
  const id = generateID(0, 0).toString();
  const receivedAt = formatTimestamp(new Date());
  // The raw line's fields are already in CSV column order, and Number("0x00000001") is 1.
  buffer.records.push(
    `"${id}","${receivedAt}","${rawLine}",${rawLine.split(" ").map(Number).join(",")},${DATACENTER_ID},${MACHINE_ID}`);

  if (i % FLUSH_ROWS === 0) {
    console.log(`Flushing rows on row ${i}`);
    await flush();
  }
}

await flush();
stream.end();
await once(stream, "finish");

console.log(`Wrote ${RECORD_COUNT} rows to ${OUTPUT_PATH}`);
console.log(`Script took ${(performance.now() - start) / 1000}s.`)