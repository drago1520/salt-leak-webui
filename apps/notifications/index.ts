import { connect } from "mqtt";
import { notifyEmail } from "./email";
import { notifyWebDashboard } from "./web-push";

const Server = Bun.serve({
  port: Number(process.env.WS_PORT ?? 4001),
  fetch(req, server) {
    const { searchParams, pathname } = new URL(req.url);
    if (pathname === "/health") return new Response("ok");
    if (searchParams.get("key") !== process.env.WS_KEY) //Tech debt: must be at least Bearer token in headers
      return new Response("unauthorized", { status: 401 });
    if (server.upgrade(req)) return;
    return new Response("not found", { status: 404 });
  },
  websocket: {
    open(ws) {
      ws.subscribe("alerts");
      console.log("WS connected: alerts", ws.remoteAddress);
    },
    close(ws, code, reason) {
      console.log("WS disconnected", { code, reason });
    },
    message() { },
  },
});

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
  await Promise.all([notifyWebDashboard(sensorId, id, message, Server), notifyEmail(sensorId, id, message)]);
});

client.on("connect", () => console.log("MQTT connected"));
client.on("error", (e) => console.error("MQTT error:", e.message));
