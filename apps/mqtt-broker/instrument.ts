import * as Sentry from "@sentry/bun";

Sentry.init({ dsn: process.env.BUGSINK_DSN });
