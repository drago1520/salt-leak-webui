import { SerialPort } from "serialport";
import { SERIAL_DELIMITER, SERIAL_PORT_SENDER, TCP_SEND_Hz } from "../utils/env-schema.ts";
import { presets, simulateSensorOutput } from "../utils/simulate-sensor-output.ts";

const port = new SerialPort({
  path: SERIAL_PORT_SENDER,
  baudRate: 115200,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  autoOpen: false,
});

await new Promise<void>((resolve, reject) => {
  port.open(error => {
    if (error) {
      reject(error);
      return;
    }

    resolve();
  });
});

console.log(`Opened ${SERIAL_PORT_SENDER}`);

const intervalMs = Math.max(1, Math.round(1000 / TCP_SEND_Hz));

setInterval(() => {
  const presetIndex = Math.random() < 0.10
    ? Math.trunc(Math.random() * 3)
    : Math.trunc(Math.random() * (16 - 3) + 3);

  const sensorOutput = simulateSensorOutput(presets[presetIndex]);
  const payload = `${sensorOutput}${SERIAL_DELIMITER}`;

  port.write(payload, error => {
    if (error) {
      console.error("Serial write failed:", error);
      return;
    }

    console.log("Wrote message:", payload);
  });
}, intervalMs);
