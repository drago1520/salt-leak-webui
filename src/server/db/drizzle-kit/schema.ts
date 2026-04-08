import { pgTable, index, bigint, timestamp, text, doublePrecision, integer, boolean } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const sensorReadings = pgTable(
  'sensor_readings',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: 'bigint' }).primaryKey().notNull(),
    receivedAt: timestamp('received_at', { mode: 'string' })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    rawLine: text('raw_line').notNull(),
    p1Ohms: doublePrecision('p1_ohms').notNull(),
    p2Ohms: doublePrecision('p2_ohms').notNull(),
    p3Ohms: doublePrecision('p3_ohms').notNull(),
    p4Ohms: doublePrecision('p4_ohms').notNull(),
    p5Ohms: doublePrecision('p5_ohms').notNull(),
    p6Ohms: doublePrecision('p6_ohms').notNull(),
    p1StatusCode: integer('p1_status_code').notNull(),
    p2StatusCode: integer('p2_status_code').notNull(),
    p3StatusCode: integer('p3_status_code').notNull(),
    p4StatusCode: integer('p4_status_code').notNull(),
    p5StatusCode: integer('p5_status_code').notNull(),
    p6StatusCode: integer('p6_status_code').notNull(),
    boostVoltageV: doublePrecision('boost_voltage_v').notNull(),
    boxStatusCode: integer('box_status_code').notNull(),
    datacenterId: integer('datacenter_id').notNull(),
    machineId: integer('machine_id').notNull(),
  },
  table => [
    index('sensor_readings_box_status_alert_idx')
      .using('btree', table.receivedAt.desc().nullsFirst().op('timestamp_ops'))
      .where(sql`(box_status_code <> 0)`),
    index('sensor_readings_p1_low_ohms_idx')
      .using('btree', table.receivedAt.desc().nullsFirst().op('timestamp_ops'))
      .where(sql`(p1_ohms < (10)::double precision)`),
    index('sensor_readings_p1_status_alert_idx')
      .using('btree', table.receivedAt.desc().nullsFirst().op('timestamp_ops'))
      .where(sql`(p1_status_code <> 0)`),
    index('sensor_readings_p2_low_ohms_idx')
      .using('btree', table.receivedAt.desc().nullsFirst().op('timestamp_ops'))
      .where(sql`(p2_ohms < (10)::double precision)`),
    index('sensor_readings_p2_status_alert_idx')
      .using('btree', table.receivedAt.desc().nullsFirst().op('timestamp_ops'))
      .where(sql`(p2_status_code <> 0)`),
    index('sensor_readings_p3_low_ohms_idx')
      .using('btree', table.receivedAt.desc().nullsFirst().op('timestamp_ops'))
      .where(sql`(p3_ohms < (10)::double precision)`),
    index('sensor_readings_p3_status_alert_idx')
      .using('btree', table.receivedAt.desc().nullsFirst().op('timestamp_ops'))
      .where(sql`(p3_status_code <> 0)`),
    index('sensor_readings_p4_low_ohms_idx')
      .using('btree', table.receivedAt.desc().nullsFirst().op('timestamp_ops'))
      .where(sql`(p4_ohms < (10)::double precision)`),
    index('sensor_readings_p4_status_alert_idx')
      .using('btree', table.receivedAt.desc().nullsFirst().op('timestamp_ops'))
      .where(sql`(p4_status_code <> 0)`),
    index('sensor_readings_p5_low_ohms_idx')
      .using('btree', table.receivedAt.desc().nullsFirst().op('timestamp_ops'))
      .where(sql`(p5_ohms < (10)::double precision)`),
    index('sensor_readings_p5_status_alert_idx')
      .using('btree', table.receivedAt.desc().nullsFirst().op('timestamp_ops'))
      .where(sql`(p5_status_code <> 0)`),
    index('sensor_readings_p6_low_ohms_idx')
      .using('btree', table.receivedAt.desc().nullsFirst().op('timestamp_ops'))
      .where(sql`(p6_ohms < (10)::double precision)`),
    index('sensor_readings_p6_status_alert_idx')
      .using('btree', table.receivedAt.desc().nullsFirst().op('timestamp_ops'))
      .where(sql`(p6_status_code <> 0)`),
    index('sensor_readings_received_at_idx').using('btree', table.receivedAt.desc().nullsFirst().op('timestamp_ops')),
  ],
);

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  table => [index('session_userId_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  table => [index('account_userId_idx').on(table.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  table => [index('verification_identifier_idx').on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
