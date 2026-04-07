import { handleLine } from ".";
import { TCP_HOST, TCP_PORT, SERIAL_DELIMITER } from "./utils/env-schema";

export function readFromTcp() {
  const buffers = new Map<object, string>();

  Bun.listen({
    hostname: TCP_HOST,
    port: TCP_PORT,
    socket: {
      data(socket, chunk) {
        const text = chunk.toString();
        const previous = buffers.get(socket) ?? "";
        const buffer = previous + text;
        const parts = buffer.split(SERIAL_DELIMITER);
        buffers.set(socket, parts.pop() ?? "");

        for (const rawLine of parts) {
          void handleLine(rawLine).catch(error => {
            console.error("Line handling failed:", error);
          });
        }
      },
      close(socket) {
        buffers.delete(socket);
      },
    },
  });

  console.log(`Reading sensor data from TCP ${TCP_HOST}:${TCP_PORT}`);
}