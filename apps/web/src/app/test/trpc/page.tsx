'use client';
import { TrpcErr } from '@/lib/db-goodies';
import { trpc } from '@/lib/trpc-client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [greeting, setGreeting] = useState('Loading...');
  const [authGreeting, setAuthGreeting] = useState('Loading auth...');

  useEffect(() => {
    let active = true;

    trpc.hello.query({ name: 'world' }).then(result => {
      if (active) {
        setGreeting(result.greeting);
      }
    });
    trpc.helloAuthed
      .query()
      .then(res => setAuthGreeting(res.greeting))
      .catch((err: TrpcErr) => setAuthGreeting(err.message));

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-24 text-zinc-950">
      <div className="rounded-2xl border border-zinc-200 bg-white px-8 py-6 shadow-sm">
        <p className="font-mono text-sm tracking-[0.2em] text-zinc-500 uppercase">tRPC</p>
        <h1 className="mt-3 text-3xl font-semibold">{greeting}</h1>
        <p className="mt-2 text-sm text-zinc-600">App Router route handler served from `/api/trpc`.</p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white px-8 py-6 shadow-sm">
        <p className="font-mono text-sm tracking-[0.2em] text-zinc-500 uppercase">tRPC</p>
        <h1 className="mt-3 text-3xl font-semibold">{authGreeting}</h1>
        <p className="mt-2 text-sm text-zinc-600">App Router route handler served from `/api/trpc`.</p>
      </div>
    </main>
  );
}
