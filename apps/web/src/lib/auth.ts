import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@repo/db';

export const auth = betterAuth({
  emailAndPassword: { enabled: true },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  session: {
    cookieCache: { enabled: true, maxAge: 60 * 60 }, //1 hr; If I revoke the session, it might not work if < 1 hr.
  },
  plugins: [nextCookies()], //nextCookies MUST be last.
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
});
