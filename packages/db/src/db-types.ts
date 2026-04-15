import { sensorReadings } from "./drizzle-kit/schema.ts";

export type SelectSensorReadings = typeof sensorReadings.$inferSelect
export type InsertSensorReadings = typeof sensorReadings.$inferSelect