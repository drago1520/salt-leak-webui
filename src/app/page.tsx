import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Page() {
  const res = await auth.api.getSession({
    headers: await headers(),
  });
  if (!res?.session) redirect('/auth');

  return <div></div>;
}
