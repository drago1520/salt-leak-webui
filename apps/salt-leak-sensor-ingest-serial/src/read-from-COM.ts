import { SerialPort, ReadlineParser } from "serialport";
import { SERIAL_PORT_LISTEN, SERIAL_DELIMITER, BROKER_URL, MACHINE_ID, DATACENTER_ID } from "./utils/env-schema.ts";
import { handleMessage } from "./utils/handle-message.ts";

export function readFromComPort() {
  const port = new SerialPort({
    path: SERIAL_PORT_LISTEN,
    baudRate: 115200,
    dataBits: 8,
    parity: "none",
    stopBits: 1,
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: SERIAL_DELIMITER }));

  parser.on("data", async (rawLine) => {
    handleMessage(rawLine).catch(err => console.log(err))
  });

  port.on("open", () => {
    console.log(`Reading sensor data from ${port.path}`);
  });

  port.on("error", (error) => {
    console.error("Serial port error:", error);
  });

  port.on("close", () => {
    console.error("Serial port closed");
  });
}
