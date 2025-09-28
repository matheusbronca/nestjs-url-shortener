import { InferSelectModel } from 'drizzle-orm';
import { pgTable, timestamp, varchar, text, serial } from 'drizzle-orm/pg-core';

export const urls = pgTable('urls', {
  id: serial('id').primaryKey().unique(),
  title: varchar('title', { length: 60 }).notNull(),
  description: varchar('description', { length: 255 }),
  url: text('url').notNull().unique(),
  redirect: text('redirect').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type UrlType = InferSelectModel<typeof urls>;
