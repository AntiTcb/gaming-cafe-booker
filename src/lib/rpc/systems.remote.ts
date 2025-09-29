import { command, getRequestEvent, query } from '$app/server';
import { GAME_SYSTEMS, RESERVATIONS, SYSTEM_TYPES } from '$lib/server/db/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const db = () => {
  const { locals } = getRequestEvent();
  return locals.db;
};

export const getSystems = query(async () => {
  const systems = await db()
    .select()
    .from(GAME_SYSTEMS)
    .innerJoin(SYSTEM_TYPES, eq(GAME_SYSTEMS.systemTypeId, SYSTEM_TYPES.id));
  return systems;
});

export const createSystem = command(
  z.object({
    name: z.string(),
    systemTypeId: z.number(),
  }),
  async ({ name, systemTypeId }) => {
    const { locals, request } = getRequestEvent();
    const { session, user } = await locals.auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !user || user.role !== 'admin') {
      return {
        success: false,
        message: 'You are not authorized to create a system',
      };
    }

    await db().insert(GAME_SYSTEMS).values({
      name,
      systemTypeId,
    });

    await getSystems().refresh();

    return {
      success: true,
      message: 'System created!',
    };
  }
);

export const updateSystem = command(
  z.object({
    systemId: z.number(),
    name: z.string().optional(),
    active: z.boolean().optional(),
  }),
  async ({ systemId, name, active }) => {
    const { locals, request } = getRequestEvent();
    const { session, user } = await locals.auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !user || user.role !== 'admin') {
      return {
        success: false,
        message: 'You are not authorized to update a system',
      };
    }

    await db().update(GAME_SYSTEMS).set({ name, active }).where(eq(GAME_SYSTEMS.id, systemId));

    await getSystems().refresh();

    return {
      success: true,
      message: 'System updated!',
    };
  }
);

export const deleteSystem = command(
  z.object({
    systemId: z.number(),
  }),
  async ({ systemId }) => {
    const { locals, request } = getRequestEvent();
    const { session, user } = await locals.auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !user || user.role !== 'admin') {
      return {
        success: false,
        message: 'You are not authorized to delete a system',
      };
    }

    const reservations = await db().$count(RESERVATIONS, eq(RESERVATIONS.gameSystemId, systemId));

    if (reservations > 0) {
      return {
        success: false,
        message: 'System cannot be deleted because it has reservations',
      };
    }

    await db().delete(GAME_SYSTEMS).where(eq(GAME_SYSTEMS.id, systemId));

    await getSystems().refresh();

    return {
      success: true,
      message: 'System deleted successfully!',
    };
  }
);

export const getSystemTypes = query(async () => {
  const systemTypes = await db().select().from(SYSTEM_TYPES);
  return systemTypes;
});
