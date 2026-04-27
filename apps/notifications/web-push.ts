import { buildPushHTTPRequest } from "@pushforge/builder";
import { db } from "@repo/db";
import {
  notifications,
  webPushSubscriptions,
} from "@repo/db/drizzle-kit/schema";
import { eq } from "drizzle-orm";

const VAPID_PRIVATE_KEY = JSON.parse(process.env.VAPID_PRIVATE_KEY!);
const COOLDOWN_MS = Number(process.env.COOLDOWN_MS ?? 30_000);
const lastAlertAt = new Map<string, number>();

export const wsServer = Bun.serve({
  port: Number(process.env.WS_PORT ?? 4001),
  fetch(req, server) {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("key") !== process.env.WS_KEY)
      return new Response("unauthorized", { status: 401 });
    if (server.upgrade(req)) return;
    return new Response("not found", { status: 404 });
  },
  websocket: {
    open(ws) {
      ws.subscribe("alerts");
    },
    message() {},
  },
});

export async function notifyWebPush(
  sensorId: string,
  id: bigint,
  message: string,
) {
  const now = Date.now();
  if (now - (lastAlertAt.get(sensorId) ?? 0) < COOLDOWN_MS) return;
  lastAlertAt.set(sensorId, now);

  await db.insert(notifications).values({ id, message });
  wsServer.publish(
    "alerts",
    JSON.stringify({ sensorId, id: id.toString(), message }),
  );

  const subs = await db.select().from(webPushSubscriptions);
  await Promise.all(
    subs.map(async ({ endpoint, p256Dh, auth }) => {
      const req = await buildPushHTTPRequest({
        privateJWK: VAPID_PRIVATE_KEY,
        subscription: { endpoint, keys: { p256dh: p256Dh, auth } },
        message: {
          payload: { title: "Sensor Alert", body: message },
          adminContact: "mailto:admin@example.com",
          options: { ttl: 3600 },
        },
      });
      const res = await fetch(req.endpoint, {
        method: "POST",
        headers: req.headers,
        body: req.body,
      });
      if (res.status === 410)
        await db
          .delete(webPushSubscriptions)
          .where(eq(webPushSubscriptions.endpoint, endpoint));
    }),
  );
}
