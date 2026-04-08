import { auth } from '@/lib/auth';
import { TRPCError, initTRPC } from '@trpc/server';

type TRPCContext = {
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
};

const t = initTRPC.context<TRPCContext>().create();

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Sign in and retry this request.',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
