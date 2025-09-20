import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';
import { ac, adminRole, staffRole, userRole } from './server/auth/permissions';
export const authClient = createAuthClient({
  plugins: [
    adminClient({
      defaultRole: 'user',
      ac,
      roles: {
        user: userRole,
        staff: staffRole,
        admin: adminRole,
      },
    }),
  ],
});
