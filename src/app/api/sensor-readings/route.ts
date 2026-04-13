import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/server/db/db';
import { sensorReadings } from '@/server/db/drizzle-kit/schema';
import { generateID } from '@/server/services/sensor-ingestion/generate-id';
import { sensorOutputSchema } from '@/server/services/sensor-ingestion/sensor-output-schema';

const requestSchema = z.object({
  rawLine: z.string().min(1, 'rawLine is required'),
  machineId: z.int().nonnegative(),
  datacenterId: z.int().nonnegative(),
  pass: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    if (body.pass !== process.env.BROKER_PASS)
      return NextResponse.json({ ok: false, error: 'False password' }, { status: 401 });
    const reading = sensorOutputSchema.parse(body.rawLine);
    const datacenterId = BigInt(process.env.DATACENTER_ID ?? 0);
    const machineId = BigInt(process.env.MACHINE_ID ?? 0);

    await db.insert(sensorReadings).values({
      id: generateID(datacenterId, machineId),
      datacenterId: Number(datacenterId),
      machineId: Number(machineId),
      ...reading,
    });

    return NextResponse.json({}, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: z.treeifyError(error) }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
