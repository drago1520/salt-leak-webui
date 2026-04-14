import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Grid from './ag-grid-table';
import { db } from 'db';
import { sensorReadings } from 'db/drizzle-kit/schema';

export default async function Page() {
  const res = await auth.api.getSession({
    headers: await headers(),
  });
  if (!res?.session) redirect('/auth');
  const rows = await db.select().from(sensorReadings).limit(20);

  return <Grid rows={rows} />;
}
