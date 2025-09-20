import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

const statement = {
  ...defaultStatements,
  reservations: ['create', 'update', 'delete'],
} as const;

export const ac = createAccessControl(statement);

export const userRole = ac.newRole({
  reservations: ['create'],
});
export const staffRole = ac.newRole({
  reservations: ['create', 'update', 'delete'],
});
export const adminRole = ac.newRole({
  reservations: ['create', 'update', 'delete'],
  ...adminAc.statements,
});
