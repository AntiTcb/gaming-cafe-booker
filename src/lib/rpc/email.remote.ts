import { command, getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { PUBLIC_SITE_DOMAIN } from '$env/static/public';
import { z } from 'zod';

export const sendTestEmail = command(z.object({ email: z.string() }), async ({ email }) => {
  if (!PUBLIC_SITE_DOMAIN) throw new Error('PUBLIC_SITE_DOMAIN is not set');
  if (!env.MAILGUN_API_KEY || !env.MAILGUN_DOMAIN) throw new Error('Mailgun is not configured');

  const formData = new FormData();
  formData.append('from', 'Gaming Booker <noreply@antitcb.dev>');
  formData.append('to', email);
  formData.append('subject', `Test Email`);
  formData.append('html', `<p>This is a test email from https://${PUBLIC_SITE_DOMAIN}</p>`);

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
    if (!PUBLIC_SITE_DOMAIN) throw new Error('PUBLIC_SITE_DOMAIN is not set');
    if (!env.MAILGUN_API_KEY || !env.MAILGUN_DOMAIN) throw new Error('Mailgun is not configured');

    const encodedData = Buffer.from(`${email}:${otp}`).toString('base64');

    const formData = new FormData();
    formData.append('from', 'Gaming Booker <noreply@antitcb.dev>');
    formData.append('to', email);
    formData.append('subject', `[${otp}] Password reset for ${PUBLIC_SITE_DOMAIN}`);
    formData.append(
      'html',
      `<p>Go here to reset your password: <a href="https://${PUBLIC_SITE_DOMAIN}/resetPassword?data=${encodedData}">https://${PUBLIC_SITE_DOMAIN}/resetPassword?data=${encodedData}</a></p>
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
