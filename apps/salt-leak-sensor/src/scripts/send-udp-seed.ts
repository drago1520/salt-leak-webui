import { createSocket } from "node:dgram";
import {
  FAIL_CHANCE,
  SERIAL_DELIMITER,
  UDP_HOST,
  UDP_PORT,
  SEND_Hz,
} from "../utils/env-schema.ts";
import {
  presets,
  simulateSensorOutput,
} from "../utils/simulate-sensor-output.ts";

const socket = createSocket("udp4");

console.log(`Sending to UDP ${UDP_HOST}:${UDP_PORT}`);

const intervalMs = Math.max(1, Math.round(1000 / SEND_Hz));

setInterval(() => {
  const presetIndex =
    Math.random() < FAIL_CHANCE / 100
      ? Math.trunc(Math.random() * (16 - 3) + 3)
      : Math.trunc(Math.random() * 3);

  const sensorOutput = simulateSensorOutput(presets[presetIndex]);
  const msg = `${sensorOutput}${SERIAL_DELIMITER}`;
  const buf = Buffer.from(msg);
  socket.send(buf, UDP_PORT, UDP_HOST, err => {
    if (err) console.error("UDP send error:", err);
    else console.log("Sent message:", msg);
  });
}, intervalMs);
