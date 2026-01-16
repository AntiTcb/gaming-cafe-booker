import { getRequestEvent, query, command } from '$app/server';
import { GAME_SYSTEMS, RESERVATIONS, SYSTEM_TYPES, GAMES, USERS } from '$lib/server/db/schema';
import { and, between, eq, notInArray, gt, lt } from 'drizzle-orm';
import { z } from 'zod';
import { sendReservationEmail } from './email.remote';

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

export const getAdminReservations = query(async () => {
  const reservations = await db()
    .select()
    .from(RESERVATIONS)
    .innerJoin(GAMES, eq(RESERVATIONS.gameId, GAMES.id))
    .innerJoin(GAME_SYSTEMS, eq(RESERVATIONS.gameSystemId, GAME_SYSTEMS.id))
    .innerJoin(SYSTEM_TYPES, eq(GAME_SYSTEMS.systemTypeId, SYSTEM_TYPES.id))
    .innerJoin(USERS, eq(RESERVATIONS.userId, USERS.id));

  return reservations.map((r) => ({
    ...r.reservations,
    game: r.games,
    gameSystem: r.game_systems,
    systemType: r.system_types,
    user: r.user,
  }));
});

export const getAvailableGames = query(
  z.object({
    start: isoDateTimeToDate,
    end: isoDateTimeToDate,
  }),
  async ({ start, end }) => {
    // Subtract 30 minutes from query start to account for cleanup buffer
    // A reservation ending at X blocks the system until X+30min
    const adjustedStart = new Date(start);
    adjustedStart.setMinutes(adjustedStart.getMinutes() - 30);
    const reservations = await db()
      .select()
      .from(RESERVATIONS)
      .where(and(lt(RESERVATIONS.start, end), gt(RESERVATIONS.end, adjustedStart)))
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
    userId: z.string().optional(),
  }),
  async ({ start, end, gameId, gameSystemId, userId: reservationUserId }) => {
    // Add 30 minutes to the end time to account for the cleanup buffer
    end.setMinutes(end.getMinutes() - 30);
    end.setSeconds(end.getSeconds() + 1);
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

    const availableGames = await getAvailableGames({ start: start.toISOString(), end: end.toISOString() });
    if (
      !Object.values(availableGames.availableToReserve)
        .flat()
        .find(({ games }) => games.id === gameId)
    ) {
      return {
        success: false,
        message: 'The selected game is not available for this system at this time',
      };
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

    await getAvailableGames({ start: start.toISOString(), end: end.toISOString() }).refresh();
    await getReservations({}).refresh();

    await sendReservationEmail({ email: user.email, reservationId: reservation[0].id });

    return {
      success: true,
      message: 'Reservation created!',
      reservation: reservation[0],
    };
  }
);

export const cancelReservation = command(
  z.object({
    reservationId: z.number(),
  }),
  async ({ reservationId }) => {
    const { locals, request } = getRequestEvent();
    const { session, user } = await locals.auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !user || user.role !== 'admin') {
      return {
        success: false,
        message: 'You are not authorized to cancel a reservation',
      };
    }

    await db().delete(RESERVATIONS).where(eq(RESERVATIONS.id, reservationId));

    await getReservations({}).refresh();

    return {
      success: true,
      message: 'Reservation cancelled!',
    };
  }
);
