import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { ac, adminRole, staffRole, userRole } from '$lib/server/auth/permissions';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getDb } from './lib/server/db';
import * as schema from './lib/server/db/schema';

export const auth = betterAuth({
  appName: 'Gaming Booker',
  basePath: '/api/auth',
  trustedOrigins: env.TRUSTED_ORIGINS?.split(',') ?? [],
  plugins: [
    admin({
      defaultRole: 'user',
      ac,
      roles: {
        user: userRole,
        staff: staffRole,
        admin: adminRole,
      },
    }),
    sveltekitCookies(getRequestEvent),
  ],
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  database: drizzleAdapter(getDb(env.DATABASE_URL), {
    schema: {
      user: schema.USERS,
      session: schema.SESSIONS,
      account: schema.ACCOUNTS,
      verification: schema.VERIFICATIONS,
    },
    provider: 'sqlite',
  }),
});
