import { command, form, getRequestEvent, query } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { nanoid } from 'nanoid';

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
      body: { name, email, password, role: '' },
      headers: request.headers,
      asResponse: true,
    });

    if (resp.ok) {
      await getCurrentUserSession().refresh();
      redirect(302, '/');
    }

    console.error(await resp.text());

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

export const createUser = command(
  z.object({
    name: z.string(),
    email: z.string(),
    role: z.enum(['user', 'staff', 'admin']).default('user'),
  }),
  async ({ name, email, role }) => {
    const { locals, request } = getRequestEvent();
    const user = await locals.auth.api.createUser({
      body: { name, email, role, password: nanoid(10) },
      headers: request.headers,
    });

    await locals.auth.api.sendVerificationOTP({
      body: { email, type: 'forget-password' },
      headers: request.headers,
    });

    await listUsers({}).refresh();

    return {
      success: true,
      message: 'User created!',
      user,
    };
  }
);

export const deleteUser = command(
  z.object({
    userId: z.string(),
  }),
  async ({ userId }) => {
    const { locals, request } = getRequestEvent();

    // can't delete yourself
    const { session, user } = await locals.auth.api.getSession({ headers: request.headers });
    if (user?.id === userId) {
      return {
        success: false,
        message: 'You cannot delete yourself',
      };
    }

    const resp = await locals.auth.api.removeUser({ body: { userId }, headers: request.headers });

    if (!resp.success) {
      return {
        success: false,
        message: 'Failed to delete user',
      };
    }

    await listUsers({}).refresh();

    return {
      success: true,
      message: 'User deleted!',
    };
  }
);

export const resetPassword = form(
  z.object({
    email: z.string(),
    otp: z.string(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
  async ({ email, otp, password }) => {
    const { locals, request } = getRequestEvent();

    const resp = await locals.auth.api.resetPasswordEmailOTP({
      body: { email, otp, password },
      headers: request.headers,
      asResponse: true,
    });

    if (resp.ok) {
      await locals.auth.api.signInEmail({
        body: {
          email,
          password,
        },
        headers: request.headers,
      });
      await getCurrentUserSession().refresh();
      redirect(302, '/');
    }

    return {
      success: false,
      message: 'Failed to reset password',
    };
  }
);
