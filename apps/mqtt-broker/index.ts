import 'dotenv/config';
import { Aedes, type AedesPublishPacket, type Client } from 'aedes';
import { createServer } from 'node:net';
import { z } from 'zod';
import type { SensorReadingEvent } from '@ca/shared/sensor-events-SSE.ts';
import { db } from '@ca/db';
import { sensorReadings } from '@ca/db/drizzle-kit/schema';
import { generateID } from '@ca/shared/generate-id.ts';
import { sensorOutputSchema } from '@ca/shared/sensor-output-schema.ts';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  MQTT_PORT: z.coerce.number().int().positive().default(1883),
  WS_PORT: z.coerce.number().int().positive().default(4000),
});

const env = envSchema.parse(process.env);
const broker = await Aedes.createBroker();
const publishTopicSchema = z.string().regex(/^sensor-readings\/\d+\/\d+$/);

const wsServer = Bun.serve({
  port: env.WS_PORT,
  fetch(req, server) {
    if (server.upgrade(req)) return;
    return new Response('not found', { status: 404 });
  },
  websocket: {
    open(ws) { ws.subscribe('readings'); console.log('WS client connected'); },
    close(ws) { ws.unsubscribe('readings'); console.log('WS client disconnected'); },
    message() {},
  },
});

broker.on('publish', async (packet: AedesPublishPacket, client: Client | null) => {
  if (!client) return;
  try {
    publishTopicSchema.parse(packet.topic);
    const match = packet.topic.match(/^sensor-readings\/(\d+)\/(\d+)$/);
    const datacenterIdText = match?.[1];
    const machineIdText = match?.[2];
    if (!datacenterIdText || !machineIdText)
      throw new Error('Topic must be sensor-readings/<datacenterId>/<machineId>');

    const datacenterId = Number(datacenterIdText);
    const machineId = Number(machineIdText);
    const reading = sensorOutputSchema.parse(packet.payload.toString());
    const id = generateID(datacenterId, machineId);

    const event: SensorReadingEvent = {
      id,
      datacenterId,
      machineId,
      pins: [
        { pin: 'p1Ohms', value: reading.p1Ohms },
        { pin: 'p2Ohms', value: reading.p2Ohms },
        { pin: 'p3Ohms', value: reading.p3Ohms },
        { pin: 'p4Ohms', value: reading.p4Ohms },
        { pin: 'p5Ohms', value: reading.p5Ohms },
        { pin: 'p6Ohms', value: reading.p6Ohms },
      ],
    };

    const payload = JSON.stringify(event, (_, v) => (typeof v === 'bigint' ? v.toString() : v));
    wsServer.publish('readings', payload);

    await db.insert(sensorReadings).values({
      id,
      rawLine: reading.rawLine,
      p1Ohms: reading.p1Ohms,
      p2Ohms: reading.p2Ohms,
      p3Ohms: reading.p3Ohms,
      p4Ohms: reading.p4Ohms,
      p5Ohms: reading.p5Ohms,
      p6Ohms: reading.p6Ohms,
      p1StatusCode: reading.p1StatusCode,
      p2StatusCode: reading.p2StatusCode,
      p3StatusCode: reading.p3StatusCode,
      p4StatusCode: reading.p4StatusCode,
      p5StatusCode: reading.p5StatusCode,
      p6StatusCode: reading.p6StatusCode,
      boostVoltageV: reading.boostVoltageV,
      boxStatusCode: reading.boxStatusCode,
      datacenterId,
      machineId,
    });
  } catch (error) {
    console.error('MQTT publish failed:', error instanceof Error ? error.message : error);
  }
});

broker.on('client', (client: Client) => console.log('MQTT connected:', client.id));
broker.on('clientDisconnect', (client: Client) => console.log('MQTT disconnected:', client.id));
broker.on('connectionError', error => console.error('broker error:', error));
broker.on('clientError', error => console.error('broker error:', error));

createServer(broker.handle).listen(env.MQTT_PORT, () => {
  console.log(`MQTT TCP on :${env.MQTT_PORT}`);
});

console.log(`WS on :${env.WS_PORT}`);
