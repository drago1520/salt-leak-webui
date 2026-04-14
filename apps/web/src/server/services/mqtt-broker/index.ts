import 'dotenv/config';
import { Aedes, type AedesPublishPacket, type Client } from 'aedes';
import { EventEmitter } from 'node:events';
import { createServer } from 'node:net';
import { z } from 'zod';
import { db } from '../../db/db';
import { sensorReadings } from '../../db/drizzle-kit/schema';
import { generateID } from '../sensor-ingestion/generate-id';
import { SensorEvents } from '../sensor-ingestion/sensor-events-SSE';
import { sensorOutputSchema } from '../sensor-ingestion/sensor-output-schema';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  MQTT_PORT: z.coerce.number().int().positive().default(1883),
  SSE_PORT: z.coerce.number().int().positive().default(4000),
});

const env = envSchema.parse(process.env);
const broker = new Aedes();
const sseEmitter = new EventEmitter<SensorEvents>();

const publishTopicSchema = z.string().regex(/^sensor-readings\/\d+\/\d+$/);

broker.on('publish', async (packet: AedesPublishPacket, client: Client | null) => {
  if (!client) return;

  try {
    publishTopicSchema.parse(packet.topic);
    const [, datacenterIdText, machineIdText] = packet.topic.match(/^sensor-readings\/(\d+)\/(\d+)$/) ?? [];
    if (!datacenterIdText || !machineIdText)
      throw new Error('Topic must be sensor-readings/<datacenterId>/<machineId>');

    const datacenterId = Number(datacenterIdText);
    const machineId = Number(machineIdText);
    const reading = sensorOutputSchema.parse(packet.payload.toString());
    const id = generateID(datacenterId, machineId);
    console.log('id :', id);
    sseEmitter.emit('reading', {
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
    });

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
    console.error('MQTT publish failed:', error);
  }
});

broker.on('client', (client: Client) => console.log('connected:', client.id));
broker.on('clientDisconnect', (client: Client) => console.log('disconnected:', client.id));
broker.on('connectionError', (error) => console.error('broker error:', error));
broker.on('clientError', (error) => console.error('broker error:', error));

createServer(broker.handle).listen(env.MQTT_PORT, () => {
  console.log(`MQTT TCP on :${env.MQTT_PORT}`);
});

Bun.serve({
  port: env.SSE_PORT,
  fetch(req) {
    if (new URL(req.url).pathname !== '/readings')
      return new Response('not found', { status: 404 });

    let cleanup = () => {};

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const encoder = new TextEncoder();
        const handler = (data: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        sseEmitter.on('reading', handler);
        controller.enqueue(encoder.encode('retry: 1000\n\n'));
        cleanup = () => sseEmitter.off('reading', handler);
      },
      cancel() {
        cleanup();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
});

console.log(`SSE on :${env.SSE_PORT}`);
