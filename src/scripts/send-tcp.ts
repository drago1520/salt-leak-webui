import { SENSOR_SAMPLE_LINE, SERIAL_DELIMITER, TCP_HOST, TCP_PORT, TCP_SEND_Hz } from "../utils/env-schema";

const socket = await Bun.connect({
  hostname: TCP_HOST,
  port: TCP_PORT,
  socket: {
    data() {},
  },
});
console.log(`Connected to ${TCP_HOST}:${TCP_PORT}`);

const intervalMs = Math.max(1, Math.round(1000 / TCP_SEND_Hz));

setInterval(() => {
  const msg = `${SENSOR_SAMPLE_LINE}${SERIAL_DELIMITER}`
  socket.write(msg);
  console.log('Wrote message :', msg);
}, intervalMs);
