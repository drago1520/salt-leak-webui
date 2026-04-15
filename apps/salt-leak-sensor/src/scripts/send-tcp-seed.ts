import { createConnection } from "node:net";
import {
  FAIL_CHANCE,
  SERIAL_DELIMITER,
  TCP_HOST,
  TCP_PORT,
  TCP_SEND_Hz,
} from "../utils/env-schema.ts";
import {
  presets,
  simulateSensorOutput,
} from "../utils/simulate-sensor-output.ts";

const socket = createConnection({
  host: TCP_HOST,
  port: TCP_PORT,
});

await new Promise<void>((resolve, reject) => {
  socket.once("connect", resolve);
  socket.once("error", reject);
});

console.log(`Connected to ${TCP_HOST}:${TCP_PORT}`);

const intervalMs = Math.max(1, Math.round(1000 / TCP_SEND_Hz)); //0-2; 3-15

setInterval(() => {
  const presetIndex =
    Math.random() < FAIL_CHANCE / 100
      ? Math.trunc(Math.random() * (16 - 3) + 3)
      : Math.trunc(Math.random() * 3);

  const sensorOutput = simulateSensorOutput(presets[presetIndex]);
  const msg = `${sensorOutput}${SERIAL_DELIMITER}`;
  socket.write(msg);
  console.log("Wrote message :", msg);
}, intervalMs);
