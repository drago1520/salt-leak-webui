import { relations } from "drizzle-orm/relations";
import { sensorReadings, notifications, user, webPushSubscriptions, session, account } from "./schema";

export const notificationsRelations = relations(notifications, ({one}) => ({
	sensorReading: one(sensorReadings, {
		fields: [notifications.id],
		references: [sensorReadings.id]
	}),
}));

export const sensorReadingsRelations = relations(sensorReadings, ({many}) => ({
	notifications: many(notifications),
}));

export const webPushSubscriptionsRelations = relations(webPushSubscriptions, ({one}) => ({
	user: one(user, {
		fields: [webPushSubscriptions.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	webPushSubscriptions: many(webPushSubscriptions),
	sessions: many(session),
	accounts: many(account),
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