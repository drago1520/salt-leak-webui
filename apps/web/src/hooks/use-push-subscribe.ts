'use client';

import { trpc } from '@/lib/trpc-client';
import { useEffect, useState } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

export function usePushSubscribe({ subscribeOnMount = true } = {}) {
  const [braveNoGoogle, setBraveNoGoogle] = useState<boolean>(false);

  useEffect(() => { if (subscribeOnMount) subscribe(); }, [subscribeOnMount]);

  async function subscribe() {
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    let sub: PushSubscription;
    try {
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY });
    } catch (e) {
      if ('brave' in navigator) {
        setBraveNoGoogle(true);
        return;
      }
      throw e;
    }
    const { endpoint, keys } = sub.toJSON();
    await trpc.webPush.subscribe.mutate({ endpoint: endpoint!, keys: { p256Dh: keys!.p256dh, auth: keys!.auth } });
  }

  return { subscribe, braveNoGoogle };
}
