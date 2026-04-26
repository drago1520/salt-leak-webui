'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationSheet } from '@/components/notification-sheet';
import { usePushSubscribe } from '@/hooks/use-push-subscribe';
import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';

type Sub = Awaited<ReturnType<typeof trpc.webPush.list.query>>[number];

export default function Page() {
  const [open, setOpen] = useState(false);
  const [subs, setSubs] = useState<Sub[]>([]);
  const { subscribe, braveNoGoogle } = usePushSubscribe();

  useEffect(() => {
    trpc.webPush.list.query().then(setSubs);
  }, []);

  return (
    <div>
      <Button variant="outline" onClick={() => setOpen(true)}>Notifications</Button>
      <NotificationSheet open={open} onOpenChange={setOpen} />
      {braveNoGoogle && (
        <p>
          Brave detected without Google messaging. Enable at <code>brave://settings/privacy</code> → &quot;Use Google
          services for push messaging&quot;
        </p>
      )}
      <Button onClick={() => subscribe().then(() => trpc.webPush.list.query().then(setSubs))}>Subscribe</Button>
      <Button onClick={() => toast.error('Wtf is up doog')}>Test toast</Button>
      <ul>
        {subs.map(s => (
          <li key={s.id}>
            #{s.id}{' '}
            <Button
              variant="destructive"
              onClick={async () => {
                await trpc.webPush.unsubscribe.mutate({ id: s.id });
                trpc.webPush.list.query().then(setSubs);
              }}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
