-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "sensor_readings" (
	"id" bigint PRIMARY KEY NOT NULL,
	"received_at" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"raw_line" text NOT NULL,
	"p1_ohms" double precision NOT NULL,
	"p2_ohms" double precision NOT NULL,
	"p3_ohms" double precision NOT NULL,
	"p4_ohms" double precision NOT NULL,
	"p5_ohms" double precision NOT NULL,
	"p6_ohms" double precision NOT NULL,
	"p1_status_code" integer NOT NULL,
	"p2_status_code" integer NOT NULL,
	"p3_status_code" integer NOT NULL,
	"p4_status_code" integer NOT NULL,
	"p5_status_code" integer NOT NULL,
	"p6_status_code" integer NOT NULL,
	"boost_voltage_v" double precision NOT NULL,
	"box_status_code" integer NOT NULL,
	"datacenter_id" integer NOT NULL,
	"machine_id" integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX "sensor_readings_box_status_alert_idx" ON "sensor_readings" USING btree ("received_at" timestamp_ops) WHERE (box_status_code <> 0);--> statement-breakpoint
CREATE INDEX "sensor_readings_p1_low_ohms_idx" ON "sensor_readings" USING btree ("received_at" timestamp_ops) WHERE (p1_ohms < (10)::double precision);--> statement-breakpoint
CREATE INDEX "sensor_readings_p1_status_alert_idx" ON "sensor_readings" USING btree ("received_at" timestamp_ops) WHERE (p1_status_code <> 0);--> statement-breakpoint
CREATE INDEX "sensor_readings_p2_low_ohms_idx" ON "sensor_readings" USING btree ("received_at" timestamp_ops) WHERE (p2_ohms < (10)::double precision);--> statement-breakpoint
CREATE INDEX "sensor_readings_p2_status_alert_idx" ON "sensor_readings" USING btree ("received_at" timestamp_ops) WHERE (p2_status_code <> 0);--> statement-breakpoint
CREATE INDEX "sensor_readings_p3_low_ohms_idx" ON "sensor_readings" USING btree ("received_at" timestamp_ops) WHERE (p3_ohms < (10)::double precision);--> statement-breakpoint
CREATE INDEX "sensor_readings_p3_status_alert_idx" ON "sensor_readings" USING btree ("received_at" timestamp_ops) WHERE (p3_status_code <> 0);--> statement-breakpoint
CREATE INDEX "sensor_readings_p4_low_ohms_idx" ON "sensor_readings" USING btree ("received_at" timestamp_ops) WHERE (p4_ohms < (10)::double precision);--> statement-breakpoint
CREATE INDEX "sensor_readings_p4_status_alert_idx" ON "sensor_readings" USING btree ("received_at" timestamp_ops) WHERE (p4_status_code <> 0);--> statement-breakpoint
CREATE INDEX "sensor_readings_p5_low_ohms_idx" ON "sensor_readings" USING btree ("received_at" timestamp_ops) WHERE (p5_ohms < (10)::double precision);--> statement-breakpoint
CREATE INDEX "sensor_readings_p5_status_alert_idx" ON "sensor_readings" USING btree ("received_at" timestamp_ops) WHERE (p5_status_code <> 0);--> statement-breakpoint
CREATE INDEX "sensor_readings_p6_low_ohms_idx" ON "sensor_readings" USING btree ("received_at" timestamp_ops) WHERE (p6_ohms < (10)::double precision);--> statement-breakpoint
CREATE INDEX "sensor_readings_p6_status_alert_idx" ON "sensor_readings" USING btree ("received_at" timestamp_ops) WHERE (p6_status_code <> 0);--> statement-breakpoint
CREATE INDEX "sensor_readings_received_at_idx" ON "sensor_readings" USING btree ("received_at" timestamp_ops);
*/