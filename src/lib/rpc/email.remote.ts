import { command, getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { dev } from '$app/environment';
import { z } from 'zod';
import { GAME_SYSTEMS, GAMES, RESERVATIONS, SYSTEM_TYPES, USERS } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm/sql';

export const sendTestEmail = command(z.object({ email: z.string() }), async ({ email }) => {
  if (!publicEnv.PUBLIC_SITE_DOMAIN) throw new Error('PUBLIC_SITE_DOMAIN is not set');
  if (!env.MAILGUN_API_KEY || !env.MAILGUN_DOMAIN) throw new Error('Mailgun is not configured');

  const formData = new FormData();
  formData.append('from', 'Gaming Booker <noreply@passagegamingpros.ca>');
  formData.append('to', email);
  formData.append('subject', `Test Email`);
  formData.append('html', `<p>This is a test email from https://${publicEnv.PUBLIC_SITE_DOMAIN}</p>`);

  const resp = await fetch(`https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${env.MAILGUN_API_KEY}`).toString('base64')}`,
    },
    body: formData,
  });

  if (!resp.ok) {
    console.error(await resp.text());
  }

  return {
    success: resp.ok,
    message: resp.ok ? 'Email sent successfully' : 'Failed to send email',
  };
});

export const sendReservationEmail = command(
  z.object({ email: z.string(), reservationId: z.number() }),
  async ({ email, reservationId }) => {
    const { locals, request } = getRequestEvent();
    const reservation = await locals.db
      .select()
      .from(RESERVATIONS)
      .where(eq(RESERVATIONS.id, reservationId))
      .innerJoin(GAMES, eq(RESERVATIONS.gameId, GAMES.id))
      .innerJoin(GAME_SYSTEMS, eq(RESERVATIONS.gameSystemId, GAME_SYSTEMS.id))
      .innerJoin(SYSTEM_TYPES, eq(GAME_SYSTEMS.systemTypeId, SYSTEM_TYPES.id))
      .innerJoin(USERS, eq(RESERVATIONS.userId, USERS.id));

    if (!reservation) {
      return {
        success: false,
        message: 'Reservation not found',
      };
    }

    const formData = new FormData();
    formData.append('from', 'Gaming Booker <noreply@passagegamingpros.ca>');
    formData.append('to', email);
    formData.append('bcc', `${dev ? 'antitcb+reservations@gmail.com' : 'reservations@passagegamingpros.ca'}`);
    formData.append('subject', `PGP Reservation Confirmation: ${reservation[0].reservations.start.toDateString()}`);
    formData.append(
      'html',
      `<p>Hi ${reservation[0].user.name},</p>
      <p>You have a reservation for ${reservation[0].games.name} on ${reservation[0].game_systems.name} from ${reservation[0].reservations.start.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })} to ${reservation[0].reservations.end.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</p>
      <p>If you need to cancel or modify your reservation, please visit contact us via phone at 902-495-7605 or email at info@passagegamingpros.ca</p>
      <p>Thank you for choosing Passage Gaming Pros!</p>`
    );

    const resp = await fetch(`https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${env.MAILGUN_API_KEY}`).toString('base64')}`,
      },
      body: formData,
    });

    if (!resp.ok) {
      console.error(await resp.text());
    }

    console.info(`Reservation confirmation email sent to ${email} for reservation ${reservationId}`);

    return {
      success: resp.ok,
      message: resp.ok ? 'Email sent successfully' : 'Failed to send email',
    };
  }
);

export const sendForgotPasswordEmail = command(z.object({ email: z.string() }), async ({ email }) => {
  const { locals, request } = getRequestEvent();

  await locals.auth.api.sendVerificationOTP({
    body: { email, type: 'forget-password' },
    headers: request.headers,
  });
});

export const sendForgotPasswordOtpEmail = command(
  z.object({ email: z.string(), otp: z.string() }),
  async ({ email, otp }) => {
    if (!publicEnv.PUBLIC_SITE_DOMAIN) throw new Error('PUBLIC_SITE_DOMAIN is not set');
    if (!env.MAILGUN_API_KEY || !env.MAILGUN_DOMAIN) throw new Error('Mailgun is not configured');

    const encodedData = Buffer.from(`${email}:${otp}`).toString('base64');

    const formData = new FormData();
    formData.append('from', 'Gaming Booker <noreply@passagegamingpros.ca>');
    formData.append('to', email);
    formData.append('subject', `[${otp}] Password reset for ${publicEnv.PUBLIC_SITE_DOMAIN}`);
    formData.append(
      'html',
      `<p>Go here to reset your password: <a href="https://${publicEnv.PUBLIC_SITE_DOMAIN}/resetPassword?data=${encodedData}">https://${publicEnv.PUBLIC_SITE_DOMAIN}/resetPassword?data=${encodedData}</a></p>
      <p>Your OTP is <strong>${otp}</strong></p>`
    );

    const resp = await fetch(`https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${env.MAILGUN_API_KEY}`).toString('base64')}`,
      },
      body: formData,
    });

    if (!resp.ok) {
      console.error(await resp.text());
    }

    return {
      success: resp.ok,
      message: resp.ok ? 'Email sent successfully' : 'Failed to send email',
    };
  }
);
