import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, request, url }) => {
  const data = url.searchParams.get('data');

  if (!data) {
    redirect(302, '/');
  }

  const decodedData = Buffer.from(data, 'base64').toString('utf-8');

  const [email, otp] = decodedData.split(':');

  if (!email || !otp) {
    redirect(302, '/');
  }

  const t = await locals.auth.api.checkVerificationOTP({
    body: { email, otp, type: 'forget-password' },
    headers: request.headers,
  });

  if (!t.success) {
    redirect(302, '/');
  }

  return {
    email,
    otp,
  };
};
