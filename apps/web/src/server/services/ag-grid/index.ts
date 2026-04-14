import { protectedProcedure } from '@/server/trpc';
import postgresService from './postgres-service';
import { agGridQuerySchema } from './schema';

export const agGridQuery = protectedProcedure.input(agGridQuerySchema).query(async ({ input, ctx }) => {
  const res = await postgresService.getData(input);
  return res;
});
