import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { ac, adminRole, staffRole, userRole } from '$lib/server/auth/permissions';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { type DrizzleClient } from '../db';
import * as schema from '../db/schema';

export const createAuth = (database: DrizzleClient) =>
  betterAuth({
    appName: 'Gaming Booker',
    basePath: '/api/auth',
    trustedOrigins: env.TRUSTED_ORIGINS?.split(',') ?? [],
    plugins: [
      admin({
        adminUserIds: ['fbU0dmB8KAEbhbPWGJosJPbc90QdPhXs'],
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
    database: drizzleAdapter(database, {
      schema: {
        user: schema.USERS,
        session: schema.SESSIONS,
        account: schema.ACCOUNTS,
        verification: schema.VERIFICATIONS,
      },
      provider: 'sqlite',
    }),
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        role: {
          type: 'string',
          default: 'user',
        },
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
  });
