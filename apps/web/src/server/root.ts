import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/trpc';
import { agGridQuery } from './services/ag-grid';
import z from 'zod';
import { sensorReadingsLive } from './services/ag-charts/trpc';

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


export const appRouter = createTRPCRouter({ hello, helloAuthed, agGridQuery, sensorReadingsLive });

export type AppRouter = typeof appRouter;
