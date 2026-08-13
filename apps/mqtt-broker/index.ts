import "dotenv/config";
import { Aedes, type AedesPublishPacket, type Client } from "aedes";
import { createServer } from "node:net";
import { z } from "zod";
import type { SensorReadingEvent } from "@repo/shared/sensor-events-SSE.ts";
import {
  sensorChannelSchema,
  toMqttTopic,
} from "@repo/shared/sensor-channel.ts";
import { db } from "@repo/db";
import { sensorReadings } from "@repo/db/drizzle-kit/schema.ts";
import { generateID } from "@repo/shared/generate-id.ts";
import { sensorOutputSchema } from "@repo/shared/sensor-output-schema.ts";

const env = z
  .object({
    DB_URL: z.string().min(1),
    MQTT_PORT: z.coerce.number().int().positive().default(1883),
    WS_PORT: z.coerce.number().int().positive().default(4000),
    MQTT_USERNAME: z.string().min(1),
    MQTT_PASSWORD: z.string().min(1),
    WS_SECRET: z.string().min(1),
  })
  .parse(process.env);

const broker = await Aedes.createBroker();
let mqttListening = false; //singleton

broker.authenticate = (_client, username, password, done) => {
  const ok =
    username === env.MQTT_USERNAME &&
    password?.toString() === env.MQTT_PASSWORD;
  done(null, ok);
};

/** Tech debt
 * TODO: implement at-least-once retry for critical events. For most events we'll have at-most-once. However, if they meet certain conditions (like failed sensor1) => at-least-once with timestamp + sensorID == idempotency key. P.S. it's dangerous to have timestamp in idempotency because of client clock drift. I don't believe clock drift will be an issue at all, it's 10 per second, like cmon + sensorID. If fail, send to -> DLQ
 * TODO: Implement Dead letter queue for human inspection.
 */
const wsServer = Bun.serve<{ channel: string }>({
  port: env.WS_PORT,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/health") return new Response("ok");
    if (url.pathname === "/health/deep") return deepHealth();
    if (url.searchParams.get("key") !== env.WS_SECRET) //Tech debt: token leaks trough url params in reverse proxy logs. Find better ways later on.
      return new Response("unauthorized", { status: 401 });
    const channel = url.searchParams.get("channel") ?? "#";
    if (server.upgrade(req, { data: { channel } })) return;
    return new Response("not found", { status: 404 });
  },
  websocket: {
    open(ws) {
      ws.subscribe(ws.data.channel);
      console.log("WS connected:", ws.data.channel);
    },
    close(ws) {
      ws.unsubscribe(ws.data.channel);
      console.log("WS disconnected:", ws.data.channel);
    },
    message() { },
  },
});

const TOPIC_RE = /^([^/]+)\/([^/]+)\/([^/]+)\/(\d+)\/(\d+)$/;
const PIN_KEYS = [
  "p1Ohms",
  "p2Ohms",
  "p3Ohms",
  "p4Ohms",
  "p5Ohms",
  "p6Ohms",
] as const;

broker.on(
  "publish",
  async (packet: AedesPublishPacket, client: Client | null) => {
    if (!client) return;
    try {
      const [
        companyId,
        locationId,
        sensorType,
        datacenterIdText,
        machineIdText,
      ] = z
        .tuple([z.string(), z.string(), z.string(), z.string(), z.string()])
        .parse(TOPIC_RE.exec(packet.topic)?.slice(1));
      const channel = sensorChannelSchema.parse({
        companyId,
        locationId,
        sensorType,
        datacenterId: Number(datacenterIdText),
        machineId: Number(machineIdText),
      });
      const { datacenterId, machineId } = channel;
      const reading = sensorOutputSchema.parse(packet.payload.toString());
      const id = generateID(datacenterId, machineId);

      const event: SensorReadingEvent = {
        id,
        ...channel,
        pins: PIN_KEYS.map((pin) => ({ pin, value: reading[pin] })),
      };

      wsServer.publish(
        toMqttTopic(channel),
        JSON.stringify(event, (_, v) =>
          typeof v === "bigint" ? v.toString() : v,
        ),
      );
      await db
        .insert(sensorReadings)
        .values({ id, datacenterId, machineId, ...reading, boxStatusCode: BigInt(reading.boxStatusCode) });

      broker.publish({ ...packet, topic: 'readings', payload: Buffer.from(JSON.stringify({ id: id.toString(), datacenterId, machineId, ...reading })) }, () => { });
    } catch (error) {
      console.error(
        "publish failed:",
        error instanceof Error ? error.message : error,
      );
    }
  },
);

broker.on("client", (client: Client) =>
  console.log("MQTT connected:", client.id),
);
broker.on("clientDisconnect", (client: Client) =>
  console.log("MQTT disconnected:", client.id),
);
broker.on("connectionError", (error) => console.error("broker error:", error));
broker.on("clientError", (error) => console.error("broker error:", error));

async function deepHealth() {
  const [dbRes] = await Promise.allSettled([db.$client.query("select 1")]);
  const checks = {
    db: dbRes.status === "fulfilled" ? "ok" : String(dbRes.reason),
    mqtt: mqttListening ? "ok" : "not listening",
  };
  const ok = Object.values(checks).every((v) => v === "ok");
  return Response.json({ status: ok ? "ok" : "degraded", checks }, { status: ok ? 200 : 503 });
}

createServer(broker.handle).listen(env.MQTT_PORT, () => {
  mqttListening = true;
  console.log(`MQTT on :${env.MQTT_PORT}`);
});
console.log(`WS on :${env.WS_PORT}`);
