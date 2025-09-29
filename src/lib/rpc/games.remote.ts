import { command, getRequestEvent, query } from '$app/server';
import { GAMES, SYSTEM_TYPES, RESERVATIONS } from '$lib/server/db/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const db = () => {
  const { locals } = getRequestEvent();
  return locals.db;
};

export const getGames = query(async () => {
  const games = await db().select().from(GAMES).innerJoin(SYSTEM_TYPES, eq(GAMES.systemTypeId, SYSTEM_TYPES.id));
  return games;
});

export const createGame = command(
  z.object({
    name: z.string(),
    systemTypeId: z.number(),
    quantity: z.number().min(0),
  }),
  async ({ name, systemTypeId, quantity }) => {
    const { locals, request } = getRequestEvent();
    const { session, user } = await locals.auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !user || user.role !== 'admin') {
      return {
        success: false,
        message: 'You are not authorized to create a game',
      };
    }

    await db().insert(GAMES).values({
      name,
      systemTypeId,
      quantity,
    });

    await getGames().refresh();

    return {
      success: true,
      message: 'Game created!',
    };
  }
);

export const updateGame = command(
  z.object({
    gameId: z.number(),
    name: z.string().optional(),
    quantity: z.number().min(0).optional(),
    active: z.boolean().optional(),
  }),
  async ({ gameId, name, quantity, active }) => {
    const { locals, request } = getRequestEvent();
    const { session, user } = await locals.auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !user || user.role !== 'admin') {
      return {
        success: false,
        message: 'You are not authorized to update a game',
      };
    }

    await db().update(GAMES).set({ name, quantity, active }).where(eq(GAMES.id, gameId));

    await getGames().refresh();

    return {
      success: true,
      message: 'Game updated!',
    };
  }
);

export const deleteGame = command(
  z.object({
    gameId: z.number(),
  }),
  async ({ gameId }) => {
    const { locals, request } = getRequestEvent();
    const { session, user } = await locals.auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !user || user.role !== 'admin') {
      return {
        success: false,
        message: 'You are not authorized to delete a game',
      };
    }

    const reservations = await db().$count(RESERVATIONS, eq(RESERVATIONS.gameId, gameId));

    if (reservations > 0) {
      return {
        success: false,
        message: 'Game cannot be deleted because it has reservations',
      };
    }

    await db().delete(GAMES).where(eq(GAMES.id, gameId));

    await getGames().refresh();

    return {
      success: true,
      message: 'Game deleted successfully!',
    };
  }
);

export const getSystemTypes = query(async () => {
  const systemTypes = await db().select().from(SYSTEM_TYPES);
  return systemTypes;
});
