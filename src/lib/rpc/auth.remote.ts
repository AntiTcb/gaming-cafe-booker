import { command, form, getRequestEvent, query } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const getCurrentUserSession = query(async () => {
  const { locals, request } = getRequestEvent();
  const session = await locals.auth.api.getSession({ headers: request.headers });
  return { ...session };
});

export const register = form(
  z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
  async ({ name, email, password }) => {
    const { locals, request } = getRequestEvent();
    const resp = await locals.auth.api.signUpEmail({
      body: { name, email, password },
      headers: request.headers,
      asResponse: true,
    });

    if (resp.ok) {
      redirect(302, '/');
    }

    return { error: 'Invalid email or password' };
  }
);

export const login = form(
  z.object({
    email: z.email(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
  async ({ email, password }) => {
    const { locals, request } = getRequestEvent();
    const session = await locals.auth.api.getSession({ headers: request.headers });

    if (session) {
      redirect(302, '/');
    }

    const response = await locals.auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: request.headers,
      asResponse: true,
    });

    if (response.ok) {
      await getCurrentUserSession().refresh();
      redirect(302, '/');
    }

    return { error: 'Invalid email or password' };
  }
);

export const logout = command(async () => {
  const { locals, request } = getRequestEvent();
  await locals.auth.api.signOut({ headers: request.headers });
  await getCurrentUserSession().refresh();
});

export const listUsers = query(
  z.object({
    limit: z.number().default(100),
    offset: z.number().default(0),
  }),
  async ({ limit, offset }) => {
    const { locals, request } = getRequestEvent();
    const users = await locals.auth.api.listUsers({
      query: {
        limit,
        offset,
      },
      headers: request.headers,
    });
    return users;
  }
);
