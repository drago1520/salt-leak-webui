import { pgTable, index, bigint, timestamp, text, doublePrecision, integer, foreignKey, unique, serial, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const sensorReadings = pgTable("sensor_readings", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "bigint" }).primaryKey().notNull(),
	receivedAt: timestamp("received_at", { mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	rawLine: text("raw_line").notNull(),
	p1Ohms: doublePrecision("p1_ohms").notNull(),
	p2Ohms: doublePrecision("p2_ohms").notNull(),
	p3Ohms: doublePrecision("p3_ohms").notNull(),
	p4Ohms: doublePrecision("p4_ohms").notNull(),
	p5Ohms: doublePrecision("p5_ohms").notNull(),
	p6Ohms: doublePrecision("p6_ohms").notNull(),
	p1StatusCode: integer("p1_status_code").notNull(),
	p2StatusCode: integer("p2_status_code").notNull(),
	p3StatusCode: integer("p3_status_code").notNull(),
	p4StatusCode: integer("p4_status_code").notNull(),
	p5StatusCode: integer("p5_status_code").notNull(),
	p6StatusCode: integer("p6_status_code").notNull(),
	boostVoltageV: doublePrecision("boost_voltage_v").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	boxStatusCode: bigint("box_status_code", { mode: "bigint" }).notNull(),
	datacenterId: integer("datacenter_id").notNull(),
	machineId: integer("machine_id").notNull(),
}, (table) => [
	index("sensor_readings_box_status_alert_idx").using("btree", table.boxStatusCode.asc().nullsLast().op("int8_ops")).where(sql`(box_status_code <> 0)`),
	index("sensor_readings_p1_low_ohms_idx").using("btree", table.p1Ohms.asc().nullsLast().op("float8_ops")).where(sql`(p1_ohms < (10)::double precision)`),
	index("sensor_readings_p1_status_alert_idx").using("btree", table.p1StatusCode.asc().nullsLast().op("int4_ops")).where(sql`(p1_status_code <> 0)`),
	index("sensor_readings_p2_low_ohms_idx").using("btree", table.p2Ohms.asc().nullsLast().op("float8_ops")).where(sql`(p2_ohms < (10)::double precision)`),
	index("sensor_readings_p2_status_alert_idx").using("btree", table.p2StatusCode.asc().nullsLast().op("int4_ops")).where(sql`(p2_status_code <> 0)`),
	index("sensor_readings_p3_low_ohms_idx").using("btree", table.p3Ohms.asc().nullsLast().op("float8_ops")).where(sql`(p3_ohms < (10)::double precision)`),
	index("sensor_readings_p3_status_alert_idx").using("btree", table.p3StatusCode.asc().nullsLast().op("int4_ops")).where(sql`(p3_status_code <> 0)`),
	index("sensor_readings_p4_low_ohms_idx").using("btree", table.p4Ohms.asc().nullsLast().op("float8_ops")).where(sql`(p4_ohms < (10)::double precision)`),
	index("sensor_readings_p4_status_alert_idx").using("btree", table.p4StatusCode.asc().nullsLast().op("int4_ops")).where(sql`(p4_status_code <> 0)`),
	index("sensor_readings_p5_low_ohms_idx").using("btree", table.p5Ohms.asc().nullsLast().op("float8_ops")).where(sql`(p5_ohms < (10)::double precision)`),
	index("sensor_readings_p5_status_alert_idx").using("btree", table.p5StatusCode.asc().nullsLast().op("int4_ops")).where(sql`(p5_status_code <> 0)`),
	index("sensor_readings_p6_low_ohms_idx").using("btree", table.p6Ohms.asc().nullsLast().op("float8_ops")).where(sql`(p6_ohms < (10)::double precision)`),
	index("sensor_readings_p6_status_alert_idx").using("btree", table.p6StatusCode.asc().nullsLast().op("int4_ops")).where(sql`(p6_status_code <> 0)`),
	index("sensor_readings_received_at_brin_idx").using("brin", table.receivedAt.asc().nullsLast().op("timestamp_minmax_ops")),
]);

export const notifications = pgTable("notifications", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "bigint" }).primaryKey().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [sensorReadings.id],
			name: "notifications_id_sensor_readings_id_fk"
		}),
]);

export const webPushSubscriptions = pgTable("web_push_subscriptions", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	endpoint: text().notNull(),
	p256Dh: text("p256_dh").notNull(),
	auth: text().notNull(),
	expirationTime: text("expiration_time"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "push_subscriptions_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("web_push_subscriptions_endpoint_unique").on(table.endpoint),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true, mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true, mode: 'string' }),
	scope: text(),
	idToken: text("id_token"),
	password: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);
