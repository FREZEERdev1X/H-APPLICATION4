import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const applications = sqliteTable('applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  developerName: text('developer_name').notNull(),
  description: text('description').notNull(),
  version: text('version').notNull(),
  size: text('size').notNull(),
  updateDate: text('update_date').notNull(),
  category: text('category').notNull(),
  iconUrl: text('icon_url').notNull(),
  apkUrl: text('apk_url').notNull(),
  downloadCount: integer('download_count').default(0).notNull(),
  isFeatured: integer('is_featured').default(0).notNull(), // 0 or 1
});

export const screenshots = sqliteTable('screenshots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  appId: integer('app_id').references(() => applications.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
});

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  appId: integer('app_id').references(() => applications.id, { onDelete: 'cascade' }).notNull(),
  userName: text('user_name').notNull(),
  content: text('content').notNull(),
  rating: real('rating').notNull(),
  createdAt: text('created_at').notNull(), // ISO string
});
