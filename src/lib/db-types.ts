import { sensorReadings } from '@/server/db/drizzle-kit/schema';
import type { AppRouter } from '@/server/root';
import type { TRPCClientErrorLike } from '@trpc/client';
import { getTableColumns } from 'drizzle-orm';

export type SelectSensorReading = typeof sensorReadings.$inferSelect;
export type InsertSensorReading = typeof sensorReadings.$inferInsert;
export type TrpcErr = TRPCClientErrorLike<AppRouter>;
export const columnNamesSensorReading = Object.keys(getTableColumns(sensorReadings));
