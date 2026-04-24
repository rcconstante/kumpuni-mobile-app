// SQLite database singleton + migration runner.
import * as SQLite from 'expo-sqlite';
import { CURRENT_DB_VERSION, MIGRATIONS } from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const DB_NAME = 'savit.db';

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync('PRAGMA foreign_keys = ON;');
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await runMigrations(db);
      return db;
    })();
  }
  return dbPromise;
}

async function runMigrations(db: SQLite.SQLiteDatabase) {
  // Bootstrap settings table to read current version.
  await db.execAsync(`CREATE TABLE IF NOT EXISTS settings_kv (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );`);

  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM settings_kv WHERE key = ?;`,
    ['db_version']
  );
  const currentVersion = row ? parseInt(row.value, 10) : 0;

  for (let v = currentVersion + 1; v <= CURRENT_DB_VERSION; v++) {
    const stmts = MIGRATIONS[v];
    if (!stmts) continue;
    for (const sql of stmts) {
      await db.execAsync(sql);
    }
  }

  if (currentVersion !== CURRENT_DB_VERSION) {
    await db.runAsync(
      `INSERT OR REPLACE INTO settings_kv(key, value) VALUES(?, ?);`,
      ['db_version', String(CURRENT_DB_VERSION)]
    );
  }
}

// Reset entire database — drop all tables and re-run migrations.
export async function resetDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    DROP TABLE IF EXISTS link_tags;
    DROP TRIGGER IF EXISTS links_ai;
    DROP TRIGGER IF EXISTS links_au;
    DROP TRIGGER IF EXISTS links_ad;
    DROP TABLE IF EXISTS links_fts;
    DROP TABLE IF EXISTS links;
    DROP TABLE IF EXISTS tags;
    DROP TABLE IF EXISTS collections;
    DROP TABLE IF EXISTS clipboard_history;
    DROP TABLE IF EXISTS settings_kv;
  `);
  await db.execAsync(`CREATE TABLE IF NOT EXISTS settings_kv (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );`);
  await runMigrations(db);
}

// Generate a sortable pseudo-random id without an extra dependency.
export function newId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10)
  );
}
