import { createSocket } from "node:dgram";
import { UDP_HOST, UDP_PORT, SERIAL_DELIMITER } from "./utils/env-schema.ts";
import { handleMessage } from "./utils/handle-message.ts";

export function readFromUdp() {
  const server = createSocket("udp4");

  server.on("message", chunk => {
    const text = chunk.toString();
    const parts = text.split(SERIAL_DELIMITER);

    for (const rawLine of parts) {
      if (rawLine) handleMessage(rawLine).catch(err => console.log(err));
    }
  });

  server.bind(UDP_PORT, UDP_HOST);

  console.log(`Reading sensor data from UDP ${UDP_HOST}:${UDP_PORT}`);
}
