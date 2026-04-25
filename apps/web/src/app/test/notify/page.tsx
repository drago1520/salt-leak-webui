'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc-client';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

type Sub = Awaited<ReturnType<typeof trpc.push.list.query>>[number];

export default function Page() {
  const [braveNoGoogle, setBraveNoGoogle] = useState(false);
  const [subs, setSubs] = useState<Sub[]>([]);

  async function fetchSubs() {
    setSubs(await trpc.push.list.query());
  }

  useEffect(() => { fetchSubs(); }, []);

  async function subscribe() {
    const isBrave = 'brave' in navigator;
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    let sub: PushSubscription;
    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY,
      });
    } catch (e) {
      if (isBrave) { setBraveNoGoogle(true); return; }
      throw e;
    }
    const { endpoint, keys } = sub.toJSON();
    await trpc.push.subscribe.mutate({
      endpoint: endpoint!,
      keys: { p256Dh: keys!.p256dh, auth: keys!.auth },
    });
    await fetchSubs();
  }

  async function unsubscribe(id: number) {
    await trpc.push.unsubscribe.mutate({ id });
    await fetchSubs();
  }

  return (
    <div>
      {braveNoGoogle && (
        <p>
          Brave detected without Google messaging. Enable at{' '}
          <code>brave://settings/privacy</code> → &quot;Use Google services for push messaging&quot;
        </p>
      )}
      <Button onClick={subscribe}>Subscribe</Button>
      <ul>
        {subs.map((s) => (
          <li key={s.id}>
            #{s.id} <Button variant="destructive" onClick={() => unsubscribe(s.id)}>Remove</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
