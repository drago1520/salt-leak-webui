import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/trpc';

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

export const appRouter = createTRPCRouter({ hello });

export type AppRouter = typeof appRouter;
