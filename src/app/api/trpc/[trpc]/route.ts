import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { auth } from '@/lib/auth';
import { appRouter } from '@/server/root';

const handler = (request: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: async () => ({
      session: await auth.api.getSession({
        headers: request.headers,
      }),
    }),
  });

export { handler as GET, handler as POST };
