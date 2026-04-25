import { relations } from "drizzle-orm/relations";
import { sensorReadings, notifications, notificationRecipients, user, webPushSubscriptions, session, account } from "./schema";

export const notificationsRelations = relations(notifications, ({one, many}) => ({
	sensorReading: one(sensorReadings, {
		fields: [notifications.id],
		references: [sensorReadings.id]
	}),
	notificationRecipients: many(notificationRecipients),
}));

export const sensorReadingsRelations = relations(sensorReadings, ({many}) => ({
	notifications: many(notifications),
}));

export const notificationRecipientsRelations = relations(notificationRecipients, ({one}) => ({
	notification: one(notifications, {
		fields: [notificationRecipients.notificationId],
		references: [notifications.id]
	}),
	user: one(user, {
		fields: [notificationRecipients.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	notificationRecipients: many(notificationRecipients),
	webPushSubscriptions: many(webPushSubscriptions),
	sessions: many(session),
	accounts: many(account),
}));

export const webPushSubscriptionsRelations = relations(webPushSubscriptions, ({one}) => ({
	user: one(user, {
		fields: [webPushSubscriptions.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));