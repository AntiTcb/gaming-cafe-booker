import { getReservations } from '$lib/rpc/reservations.remote';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const start = url.searchParams.get('start');
  const end = url.searchParams.get('end');

  const reservations = await getReservations({
    start: start ? new Date(start).toISOString() : undefined,
    end: end ? new Date(end).toISOString() : undefined,
  }).then((r) =>
    r.map((r) => ({
      ...r,
      title: r.game.name,
      extendedProps: {
        system: r.systemType.name,
      },
    }))
  );

  //console.debug('reservations', reservations);

  return new Response(JSON.stringify(reservations));
};
