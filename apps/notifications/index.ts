import { connect } from "mqtt";
import { notifyEmail } from "./email";
import { notifyWebPush } from "./web-push";

const client = connect(process.env.BROKER_URL!, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

client.subscribe("readings");

client.on("message", async (_topic, payload) => {
  const data = JSON.parse(payload.toString());
  const id = BigInt(data.id);
  const sensorId = `${data.datacenterId}:${data.machineId}`;

  const hasError = [
    data.p1StatusCode,
    data.p2StatusCode,
    data.p3StatusCode,
    data.p4StatusCode,
    data.p5StatusCode,
    data.p6StatusCode,
  ].some((v: number) => v !== 0);
  if (!hasError) return;

  const message = `Sensor ${sensorId} leaking on reading ${id}`;
  await Promise.all([notifyWebPush(sensorId, id, message), notifyEmail(sensorId, id, message)]);
});

client.on("connect", () => console.log("MQTT connected"));
client.on("error", (e) => console.error("MQTT error:", e.message));
