import { sensorReadings, webPushSubscriptions, notifications} from "./drizzle-kit/schema.ts";

export type SelectSensorReadings = typeof sensorReadings.$inferSelect
export type InsertSensorReadings = typeof sensorReadings.$inferSelect

export type SelectPushSubscription = typeof webPushSubscriptions.$inferSelect;

export type SelectNotification = typeof notifications.$inferSelect;