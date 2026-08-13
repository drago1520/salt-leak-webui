import { db } from '@repo/db';

export const dynamic = 'force-dynamic';

const ping = (url: string) =>
  new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(url);
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error('timeout'));
    }, 3000);
    ws.onopen = () => {
      clearTimeout(timer);
      ws.close();
      resolve();
    };
    ws.onerror = () => {
      clearTimeout(timer);
      reject(new Error('connect failed'));
    };
  });

export async function GET() {
  const [dbRes, brokerRes, notifRes] = await Promise.allSettled([
    db.$client.query('select 1'),
    ping(
      `${process.env.NEXT_PUBLIC_SENSOR_BAR_CHARTS_WS_URL}?key=${process.env.NEXT_PUBLIC_SENSOR_BAR_CHARTS_WS_SECRET}`,
    ),
    ping(`${process.env.NEXT_PUBLIC_NOTIFICATIONS_WS_URL}?key=${process.env.NEXT_PUBLIC_NOTIFICATIONS_WS_KEY}`),
  ]);
  const checks = {
    db: dbRes.status === 'fulfilled' ? 'ok' : String(dbRes.reason),
    mqttBrokerWs: brokerRes.status === 'fulfilled' ? 'ok' : String(brokerRes.reason),
    notificationsWs: notifRes.status === 'fulfilled' ? 'ok' : String(notifRes.reason),
  };
  const ok = Object.values(checks).every((v) => v === 'ok');
  return Response.json({ status: ok ? 'ok' : 'degraded', checks }, { status: ok ? 200 : 503 });
}
