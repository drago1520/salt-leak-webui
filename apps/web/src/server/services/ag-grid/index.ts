import { protectedProcedure } from '@/server/trpc';
import sensorReadingsAgGrid, { notificationsAgGrid, archivedNotificationsAgGrid } from './ag-grid-infinite-row-model-backend';
import { agGridQuerySchema } from './schema';

export const agGridSensorReadingsQuery = protectedProcedure.input(agGridQuerySchema).query(({ input }) => sensorReadingsAgGrid.getData(input));

export const agGridNotificationsQuery = protectedProcedure.input(agGridQuerySchema).query(({ input }) => notificationsAgGrid.getData(input));

export const agGridArchivedNotificationsQuery = protectedProcedure.input(agGridQuerySchema).query(({ input }) => archivedNotificationsAgGrid.getData(input));
