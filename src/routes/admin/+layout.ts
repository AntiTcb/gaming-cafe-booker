import { getCurrentUserSession } from '$lib/rpc/auth.remote';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
  const currentUserSession = await getCurrentUserSession();
  if (currentUserSession.user?.role !== 'admin') {
    redirect(302, '/');
  }
};
