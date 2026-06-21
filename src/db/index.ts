import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const sqlite = new Database(path.join(dataDir, 'sqlite.db'));
export const db = drizzle(sqlite, { schema });

// Initialize database schema (simple migration)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    developer_name TEXT NOT NULL,
    description TEXT NOT NULL,
    version TEXT NOT NULL,
    size TEXT NOT NULL,
    update_date TEXT NOT NULL,
    category TEXT NOT NULL,
    icon_url TEXT NOT NULL,
    apk_url TEXT NOT NULL,
    download_count INTEGER NOT NULL DEFAULT 0,
    is_featured INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS screenshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    url TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    rating REAL NOT NULL,
    created_at TEXT NOT NULL
  );
`);
