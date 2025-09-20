import { getRequestEvent, query, command } from '$app/server';
import { GAME_SYSTEMS, RESERVATIONS, SYSTEM_TYPES, GAMES, USERS } from '$lib/server/db/schema';
import { and, between, eq, notInArray } from 'drizzle-orm';
import { z } from 'zod';

const db = () => {
  const { locals } = getRequestEvent();
  return locals.db;
};

const isoDateTimeToDate = z.codec(z.iso.datetime(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (date) => date.toISOString(),
});

export const getSystems = query(async () => {
  const systems = await db().select().from(GAME_SYSTEMS);
  return systems;
});

export const getReservations = query(
  z.object({
    start: isoDateTimeToDate.nullish(),
    end: isoDateTimeToDate.nullish(),
  }),
  async ({ start, end }) => {
    start ??= new Date('1970-01-01T00:00:00Z');
    end ??= new Date('2099-01-01T00:00:00Z');
    const reservations = await db()
      .select()
      .from(RESERVATIONS)
      .innerJoin(GAMES, eq(RESERVATIONS.gameId, GAMES.id))
      .innerJoin(GAME_SYSTEMS, eq(RESERVATIONS.gameSystemId, GAME_SYSTEMS.id))
      .innerJoin(SYSTEM_TYPES, eq(GAME_SYSTEMS.systemTypeId, SYSTEM_TYPES.id))
      .innerJoin(USERS, eq(RESERVATIONS.userId, USERS.id))
      .where(between(RESERVATIONS.start, start, end));

    return reservations.map((r) => ({
      ...r.reservations,
      game: r.games,
      gameSystem: r.game_systems,
      systemType: r.system_types,
      user: r.user,
    }));
  }
);

export const getAvailableGames = query(
  z.object({
    start: isoDateTimeToDate,
    end: isoDateTimeToDate,
  }),
  async ({ start, end }) => {
    const reservations = await db()
      .select()
      .from(RESERVATIONS)
      .where(between(RESERVATIONS.start, start, end))
      .all();

    // get all reserved games by ID and tally the quantity
    const reservedGames = reservations
      .map((reservation) => reservation.gameId)
      .reduce(
        (acc, gameId) => {
          acc[gameId] = (acc[gameId] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>
      );

    let availableGames = await db()
      .select()
      .from(GAMES)
      .innerJoin(SYSTEM_TYPES, eq(GAMES.systemTypeId, SYSTEM_TYPES.id))
      .where(
        and(notInArray(GAMES.id, Object.keys(reservedGames).map(Number)), eq(GAMES.quantity, 1), eq(GAMES.active, true))
      )
      .all();

    availableGames = availableGames.filter(({ games }) => games.quantity > (reservedGames[games.id] || 0));

    const reservedGameSystemIds = reservations.map((reservation) => reservation.gameSystemId);

    const availableSystems = await db()
      .select()
      .from(GAME_SYSTEMS)
      .innerJoin(SYSTEM_TYPES, eq(GAME_SYSTEMS.systemTypeId, SYSTEM_TYPES.id))
      .where(and(eq(GAME_SYSTEMS.active, true), notInArray(GAME_SYSTEMS.id, reservedGameSystemIds)))
      .all();

    // availableToReserve - for each available system, group available games by system_type
    const availableToReserve = availableSystems
      .map((system) => ({
        systemName: system.system_types.name,
        games: availableGames.filter((game) => game.games.systemTypeId === system.system_types.id),
      }))
      .reduce(
        (acc, system) => {
          acc[system.systemName] = system.games;
          return acc;
        },
        {} as Record<string, typeof availableGames>
      );

    return {
      availableToReserve,
    };
  }
);

export const createReservation = command(
  z.object({
    start: isoDateTimeToDate,
    end: isoDateTimeToDate,
    gameId: z.number(),
    gameSystemId: z.number(),
    userId: z.number().optional(),
  }),
  async ({ start, end, gameId, gameSystemId, userId: reservationUserId }) => {
    const { locals, request } = getRequestEvent();
    const { session, user } = await locals.auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !user) {
      return {
        success: false,
        message: 'You are not authorized to create a reservation',
      };
    }

    if (reservationUserId) {
      if (user.role !== 'admin' && session?.user.id !== reservationUserId) {
        return {
          success: false,
          message: 'You are not authorized to create a reservation for this user',
        };
      }
    }

    const reservation = await db()
      .insert(RESERVATIONS)
      .values({
        userId: reservationUserId ?? user.id,
        start,
        end,
        gameId,
        gameSystemId,
      })
      .returning();

    await getReservations({}).refresh();

    return {
      success: true,
      message: 'Reservation created!',
      reservation: reservation[0],
    };
  }
);
