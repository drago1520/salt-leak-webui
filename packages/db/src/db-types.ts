import { sensorReadings, webPushSubscriptions, notifications, notificationRecipients } from "./drizzle-kit/schema.ts";

export type SelectSensorReadings = typeof sensorReadings.$inferSelect
export type InsertSensorReadings = typeof sensorReadings.$inferSelect

export type SelectPushSubscription = typeof webPushSubscriptions.$inferSelect;

export type SelectNotification = typeof notifications.$inferSelect;
export type SelectNotificationRecipient = typeof notificationRecipients.$inferSelect;