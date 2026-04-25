import { buildPushHTTPRequest } from "@pushforge/builder";
import { db } from "@repo/db";
import { notifications, webPushSubscriptions } from "@repo/db/drizzle-kit/schema";
import { eq } from "drizzle-orm";
import { connect } from "mqtt";

const VAPID_PRIVATE_KEY = JSON.parse(process.env.VAPID_PRIVATE_KEY!);

async function sendPushToAll(title: string, body: string) {
  const subs = await db.select().from(webPushSubscriptions);
  const t = performance.now();
  await Promise.all(
    subs.map(async ({ endpoint, p256Dh, auth }) => {
      const req = await buildPushHTTPRequest({
        privateJWK: VAPID_PRIVATE_KEY,
        subscription: { endpoint, keys: { p256dh: p256Dh, auth } },
        message: {
          payload: { title, body },
          adminContact: "mailto:admin@example.com",
          options: { ttl: 3600 },
        },
      });
      const res = await fetch(req.endpoint, { method: "POST", headers: req.headers, body: req.body });
      if (res.status === 410) {
        await db.delete(webPushSubscriptions).where(eq(webPushSubscriptions.endpoint, endpoint));
      }
    }),
  );
  console.log(`Sent ${subs.length} pushes in ${(performance.now() - t).toFixed(0)}ms`);
}

const client = connect(process.env.BROKER_URL!, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

client.subscribe("readings");

client.on("message", async (_topic, payload) => {
  const data = JSON.parse(payload.toString());
  const id = BigInt(data.id);

  const hasError = [data.p1StatusCode, data.p2StatusCode, data.p3StatusCode, data.p4StatusCode, data.p5StatusCode, data.p6StatusCode].some((v: number) => v !== 0);
  if (!hasError) return;

  await db.insert(notifications).values({ id }).onConflictDoNothing();
  await sendPushToAll("Sensor Alert", `Error on reading ${id}`);
  console.log("Push sent for reading", id);
});

client.on("connect", () => console.log("MQTT connected"));
client.on("error", (e) => console.error("MQTT error:", e.message));
