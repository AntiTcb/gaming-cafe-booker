import { createClient } from '@libsql/client';
import { drizzle as drizzleD1, DrizzleD1Database } from 'drizzle-orm/d1';
import { drizzle as drizzleLibSql, LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';

export const getDb = (
  db: D1Database | string | undefined
): DrizzleD1Database<typeof schema> | LibSQLDatabase<typeof schema> => {
  if (!db) {
    throw new Error('No database configuration provided');
  }
  if (typeof db === 'string') {
    const client = createClient({ url: db });
    return drizzleLibSql(client, { schema });
  }
  if (db) {
    return drizzleD1(db, { schema });
  }
  throw new Error('No database configuration found');
};

export type DrizzleClient = ReturnType<typeof getDb>;
