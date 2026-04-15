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

broker.authenticate = (_client, username, password, done) => {
  const ok =
    username === env.MQTT_USERNAME &&
    password?.toString() === env.MQTT_PASSWORD;
  done(null, ok);
};

const wsServer = Bun.serve<{ channel: string }>({
  port: env.WS_PORT,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.searchParams.get("key") !== env.WS_SECRET)
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
    message() {},
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
        .values({ id, datacenterId, machineId, ...reading });
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

createServer(broker.handle).listen(env.MQTT_PORT, () =>
  console.log(`MQTT on :${env.MQTT_PORT}`),
);
console.log(`WS on :${env.WS_PORT}`);
