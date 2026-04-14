import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/server/db/db';
import { sensorReadings } from '@/server/db/drizzle-kit/schema';
import { sensorEvents } from '@/server/services/sensor-ingestion/sensor-events-SSE';
import { generateID } from '@/server/services/sensor-ingestion/generate-id';
import { sensorOutputSchema } from '@/server/services/sensor-ingestion/sensor-output-schema';

const sensorIngestReqSchema = z.object({
  rawLine: z.string().min(1, 'rawLine is required'),
  machineId: z.int().nonnegative(),
  datacenterId: z.int().nonnegative(),
  pass: z.string(),
});

export async function POST(request: Request) {
  try {
    const { pass, rawLine, datacenterId, machineId } = sensorIngestReqSchema.parse(await request.json());
    if (pass !== process.env.BROKER_PASS)
      return NextResponse.json({ ok: false, error: 'False password' }, { status: 401 });

    const reading = sensorOutputSchema.parse(rawLine);
    const id = generateID(datacenterId, machineId);

    sensorEvents.emit('reading', {
      id,
      pins: [
      { pin: 'p1Ohms', value: reading.p1Ohms },
      { pin: 'p2Ohms', value: reading.p2Ohms },
      { pin: 'p3Ohms', value: reading.p3Ohms },
      { pin: 'p4Ohms', value: reading.p4Ohms },
      { pin: 'p5Ohms', value: reading.p5Ohms },
      { pin: 'p6Ohms', value: reading.p6Ohms },
    ]});

    await db.insert(sensorReadings).values({
      id,
      datacenterId: datacenterId,
      machineId: machineId,
      ...reading,
    });

    return NextResponse.json({}, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ ok: false, error: z.treeifyError(error) }, { status: 400 });

    console.error(error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
