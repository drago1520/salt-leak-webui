import { db } from '@repo/db';
import { webPushSubscriptions } from '@repo/db/drizzle-kit/schema';
import { and, eq } from 'drizzle-orm';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/trpc';
import { agGridQuery } from './services/ag-grid';
import z from 'zod';

const hello = publicProcedure
  .input(
    z
      .object({
        name: z.string().default('world'),
      })
      .optional(),
  )
  .query(({ input }) => {
    return {
      greeting: `Hello ${input?.name ?? 'world'}`,
    };
  });

const helloAuthed = protectedProcedure.query(({ ctx }) => {
  return {
    greeting: `Hello ${ctx.session.user.email}!`,
    userId: ctx.session.user.id,
  };
});

const subscriptionInput = z.object({
  endpoint: z.string(),
  keys: z.object({ p256Dh: z.string(), auth: z.string() }),
});

const webPushRouter = createTRPCRouter({
  subscribe: protectedProcedure
    .input(subscriptionInput)
    .mutation(async ({ input, ctx }) => {
      await db.insert(webPushSubscriptions).values({
        userId: ctx.session.user.id,
        endpoint: input.endpoint,
        p256Dh: input.keys.p256Dh,
        auth: input.keys.auth,
      }).onConflictDoUpdate({
        target: webPushSubscriptions.endpoint,
        set: { userId: ctx.session.user.id, p256Dh: input.keys.p256Dh, auth: input.keys.auth },
      });
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      return db.select().from(webPushSubscriptions).where(eq(webPushSubscriptions.userId, ctx.session.user.id));
    }),

  unsubscribe: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.delete(webPushSubscriptions).where(
        and(eq(webPushSubscriptions.id, input.id), eq(webPushSubscriptions.userId, ctx.session.user.id)),
      );
    }),
});

export const appRouter = createTRPCRouter({ hello, helloAuthed, agGridQuery, push: webPushRouter });

export type AppRouter = typeof appRouter;
