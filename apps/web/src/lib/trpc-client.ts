import { createTRPCClient, splitLink, httpSubscriptionLink, httpBatchLink } from '@trpc/client';
import { AppRouter } from '../server/root';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: op => op.type === 'subscription',
      true: httpSubscriptionLink({
        url: '/api/trpc',
      }),
      false: httpBatchLink({
        url: '/api/trpc',
      }),
    }),
  ],
});
