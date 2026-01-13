import { command, getRequestEvent, query } from '$app/server';
import { WEEKLY_EVENTS } from '$lib/server/db/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const db = () => {
  const { locals } = getRequestEvent();
  return locals.db;
};

export const getWeeklyEvent = query(async () => {
  const events = await db().select().from(WEEKLY_EVENTS).limit(1);
  return events[0] || null;
});

export const updateWeeklyEvent = command(
  z.object({
    content: z.string(),
  }),
  async ({ content }) => {
    const { locals, request } = getRequestEvent();
    const { session, user } = await locals.auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !user || user.role !== 'admin') {
      return {
        success: false,
        message: 'You are not authorized to update weekly events',
      };
    }

    const existing = await db().select().from(WEEKLY_EVENTS).limit(1);

    if (existing.length === 0) {
      await db().insert(WEEKLY_EVENTS).values({
        content,
        updatedBy: user.id,
      });
    } else {
      await db()
        .update(WEEKLY_EVENTS)
        .set({
          content,
          updatedBy: user.id,
        })
        .where(eq(WEEKLY_EVENTS.id, existing[0].id));
    }

    await getWeeklyEvent().refresh();

    return {
      success: true,
      message: 'Weekly event updated!',
    };
  }
);


