import { getCurrentUserSession } from '$lib/rpc/auth.remote';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
  const currentUserSession = await getCurrentUserSession();

  return {
    ...currentUserSession,
  };
};
