import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `whoosh_${name}`);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d.boolean(),
  image: d.varchar({ length: 255 }),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  capsules: many(capsules),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    id: d.varchar().notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    providerId: d.varchar({ length: 255 }).notNull(),
    accountId: d.varchar({ length: 255 }).notNull(),
    refreshToken: d.text(),
    accessToken: d.text(),
    accessTokenExpiresAt: d.timestamp({ withTimezone: true }).notNull(),
    scope: d.varchar({ length: 255 }),
    idToken: d.text(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  }),
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    id: d.text().primaryKey(),
    token: d.varchar({ length: 255 }).notNull(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    ipAddress: d.text(),
    userAgent: d.text(),
    expiresAt: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verifications = createTable("verification", (d) => ({
  id: d.text().primaryKey(),
  identifier: d.text().notNull(),
  value: d.text().notNull(),
  expiresAt: d.timestamp({ withTimezone: true }).notNull(),
  createdAt: d.timestamp({ withTimezone: true }).$defaultFn(() => new Date()),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const capsules = createTable(
  "capsule",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    title: d.varchar({ length: 256 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    followupPool: d.json().default([]).notNull(),
    // summary: d.text(),
    // todos: d.json(),
    // tone: d.varchar({ length: 64 }),
    // userDraftStyle: d.text(),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("title_idx").on(t.title),
  ],
);

export const voiceInteractions = createTable("voice_interaction", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  capsuleId: d
    .integer()
    .notNull()
    .references(() => capsules.id, { onDelete: "cascade" }),
  audioUrl: d.varchar({ length: 1024 }),
  transcription: d.text(),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),

  // embedding: d.vector("float4", { dimensions: 1536 }),
}));

export const followupReplies = createTable("followup_reply", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  capsuleId: d
    .integer()
    .notNull()
    .references(() => capsules.id, { onDelete: "cascade" }),
  followupQuestion: d.text().notNull(),
  audioUrl: d.varchar({ length: 1024 }),
  transcription: d.text(),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),

  // embedding: d.vector("float4", { dimensions: 1536 }),
}));

export const capsulesRelations = relations(capsules, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [capsules.createdById],
    references: [users.id],
  }),
  voiceInteractions: many(voiceInteractions),
  followupReplies: many(followupReplies),
}));

export const voiceInteractionsRelations = relations(
  voiceInteractions,
  ({ one }) => ({
    capsule: one(capsules, {
      fields: [voiceInteractions.capsuleId],
      references: [capsules.id],
    }),
  }),
);

export const followupRepliesRelations = relations(
  followupReplies,
  ({ one }) => ({
    capsule: one(capsules, {
      fields: [followupReplies.capsuleId],
      references: [capsules.id],
    }),
  }),
);

export const schema = { users, sessions, accounts, verifications };
