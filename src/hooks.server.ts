import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { getDb } from '$lib/server/db';
import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { createAuth } from './lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  if (building) return resolve(event);

  event.locals.db = getDb(env.DATABASE_URL || event.platform?.env?.DB);
  const auth = createAuth(event.locals.db);
  event.locals.auth = auth;

  return svelteKitHandler({ event, resolve, auth, building });
};
