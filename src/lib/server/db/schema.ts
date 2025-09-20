import { sql, type InferSelectModel } from 'drizzle-orm';
import { check, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';

export const SYSTEM_TYPES = sqliteTable('system_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});
export type SystemType = InferSelectModel<typeof SYSTEM_TYPES>;

export const GAME_SYSTEMS = sqliteTable('game_systems', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  systemTypeId: integer('system_type_id').references(() => SYSTEM_TYPES.id),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
});
export type GameSystem = InferSelectModel<typeof GAME_SYSTEMS>;

export const GAMES = sqliteTable('games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  systemTypeId: integer('system_type_id')
    .notNull()
    .references(() => SYSTEM_TYPES.id),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  quantity: integer('quantity').notNull().default(1),
});
export type Game = InferSelectModel<typeof GAMES>;

export const USERS = sqliteTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
    image: text('image'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    role: text('role').notNull().default('user'),
    banned: integer('banned', { mode: 'boolean' }).default(false),
    banReason: text('ban_reason'),
    banExpires: integer('ban_expires', { mode: 'timestamp' }),
  },
  (table) => [check('role', sql`${table.role} IN ('admin', 'staff', 'user')`)]
);
export type User = InferSelectModel<typeof USERS>;

export const RESERVATIONS = sqliteTable('reservations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => USERS.id),
  start: integer('start', { mode: 'timestamp' }).notNull(),
  end: integer('end', { mode: 'timestamp' }).notNull(),
  gameSystemId: integer('game_system_id')
    .notNull()
    .references(() => GAME_SYSTEMS.id),
  gameId: integer('game_id')
    .notNull()
    .references(() => GAMES.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
export type Reservation = InferSelectModel<typeof RESERVATIONS>;

export const SESSIONS = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => USERS.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by'),
});
export type Session = InferSelectModel<typeof SESSIONS>;

export const ACCOUNTS = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => USERS.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', {
    mode: 'timestamp',
  }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', {
    mode: 'timestamp',
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type Account = InferSelectModel<typeof ACCOUNTS>;
export const VERIFICATIONS = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
export type Verification = InferSelectModel<typeof VERIFICATIONS>;

export const systemTypesInsertSchema = createInsertSchema(SYSTEM_TYPES);
export const gameSystemsInsertSchema = createInsertSchema(GAME_SYSTEMS);
export const gamesInsertSchema = createInsertSchema(GAMES);
export const usersInsertSchema = createInsertSchema(USERS);
export const reservationsInsertSchema = createInsertSchema(RESERVATIONS);

export const systemTypesUpdateSchema = createUpdateSchema(SYSTEM_TYPES);
export const gameSystemsUpdateSchema = createUpdateSchema(GAME_SYSTEMS);
export const gamesUpdateSchema = createUpdateSchema(GAMES);
export const usersUpdateSchema = createUpdateSchema(USERS);
export const reservationsUpdateSchema = createUpdateSchema(RESERVATIONS);
