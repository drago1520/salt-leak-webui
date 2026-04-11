import { createServer } from "node:net";
import { handleLine } from "./index.ts";
import { TCP_HOST, TCP_PORT, SERIAL_DELIMITER } from "./utils/env-schema.ts";

export function readFromTcp() {
  const server = createServer(socket => {
    let buffer = "";

    socket.on("data", chunk => {
      const text = chunk.toString();
      buffer += text;
      const parts = buffer.split(SERIAL_DELIMITER);
      buffer = parts.pop() ?? "";

      for (const rawLine of parts) {
        void handleLine(rawLine).catch(error => {
          console.error("Line handling failed:", error);
        });
      }
    });
  });

  server.listen(TCP_PORT, TCP_HOST);

  console.log(`Reading sensor data from TCP ${TCP_HOST}:${TCP_PORT}`);
}
