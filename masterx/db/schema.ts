// SQLite schema definitions for Savit. Versioned migrations live here.
// Migration version is stored in settings_kv['db_version'].

export const CURRENT_DB_VERSION = 3;

export const MIGRATIONS: Record<number, string[]> = {
  1: [
    `CREATE TABLE IF NOT EXISTS settings_kv (
       key   TEXT PRIMARY KEY NOT NULL,
       value TEXT NOT NULL
     );`,
    `CREATE TABLE IF NOT EXISTS collections (
       id          TEXT PRIMARY KEY NOT NULL,
       name        TEXT NOT NULL,
       description TEXT,
       parent_id   TEXT,
       icon_kind   TEXT NOT NULL DEFAULT 'asset',     -- 'asset' | 'emoji' | 'lucide' | 'photo'
       icon_value  TEXT NOT NULL DEFAULT 'green',     -- asset id, emoji char, lucide id, or file uri
       color       TEXT NOT NULL DEFAULT '#C8F6E8',
       created_at  INTEGER NOT NULL,
       updated_at  INTEGER NOT NULL,
       FOREIGN KEY(parent_id) REFERENCES collections(id) ON DELETE SET NULL
     );`,
    `CREATE TABLE IF NOT EXISTS tags (
       id         TEXT PRIMARY KEY NOT NULL,
       name       TEXT NOT NULL UNIQUE,
       color      TEXT NOT NULL DEFAULT '#0D9488',
       created_at INTEGER NOT NULL
     );`,
    `CREATE TABLE IF NOT EXISTS links (
       id            TEXT PRIMARY KEY NOT NULL,
       url           TEXT NOT NULL,
       title         TEXT NOT NULL DEFAULT '',
       description   TEXT NOT NULL DEFAULT '',
       image         TEXT NOT NULL DEFAULT '',
       domain        TEXT NOT NULL DEFAULT '',
       notes         TEXT NOT NULL DEFAULT '',
       is_bookmarked INTEGER NOT NULL DEFAULT 0,
       is_read       INTEGER NOT NULL DEFAULT 0,
       collection_id TEXT,
       created_at    INTEGER NOT NULL,
       updated_at    INTEGER NOT NULL,
       FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE SET NULL
     );`,
    `CREATE TABLE IF NOT EXISTS link_tags (
       link_id TEXT NOT NULL,
       tag_id  TEXT NOT NULL,
       PRIMARY KEY(link_id, tag_id),
       FOREIGN KEY(link_id) REFERENCES links(id) ON DELETE CASCADE,
       FOREIGN KEY(tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
     );`,
    `CREATE TABLE IF NOT EXISTS clipboard_history (
       id         TEXT PRIMARY KEY NOT NULL,
       url        TEXT NOT NULL,
       domain     TEXT NOT NULL DEFAULT '',
       saved      INTEGER NOT NULL DEFAULT 0,
       dismissed  INTEGER NOT NULL DEFAULT 0,
       created_at INTEGER NOT NULL
     );`,
    `CREATE INDEX IF NOT EXISTS idx_links_created  ON links(created_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_links_collection ON links(collection_id);`,
    `CREATE INDEX IF NOT EXISTS idx_link_tags_tag  ON link_tags(tag_id);`,
    `CREATE INDEX IF NOT EXISTS idx_clip_created   ON clipboard_history(created_at DESC);`,
    // FTS5 virtual table for full-text search over links.
    `CREATE VIRTUAL TABLE IF NOT EXISTS links_fts USING fts5(
       title, description, url, notes, content='links', content_rowid='rowid'
     );`,
    // Triggers to keep FTS in sync.
    `CREATE TRIGGER IF NOT EXISTS links_ai AFTER INSERT ON links BEGIN
       INSERT INTO links_fts(rowid, title, description, url, notes)
         VALUES (new.rowid, new.title, new.description, new.url, new.notes);
     END;`,
    `CREATE TRIGGER IF NOT EXISTS links_ad AFTER DELETE ON links BEGIN
       INSERT INTO links_fts(links_fts, rowid, title, description, url, notes)
         VALUES('delete', old.rowid, old.title, old.description, old.url, old.notes);
     END;`,
    `CREATE TRIGGER IF NOT EXISTS links_au AFTER UPDATE ON links BEGIN
       INSERT INTO links_fts(links_fts, rowid, title, description, url, notes)
         VALUES('delete', old.rowid, old.title, old.description, old.url, old.notes);
       INSERT INTO links_fts(rowid, title, description, url, notes)
         VALUES (new.rowid, new.title, new.description, new.url, new.notes);
     END;`,
  ],
  // v3: add sort_order column for drag-to-reorder.
  3: [
    `ALTER TABLE collections ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;`,
  ],
  // v2: wipe any pre-seeded mock data from earlier installs.
  2: [
    `DELETE FROM link_tags;`,
    `DELETE FROM links;`,
    `DELETE FROM tags;`,
    `DELETE FROM collections;`,
    `DELETE FROM clipboard_history;`,
    `DELETE FROM settings_kv WHERE key = 'seeded_v1';`,
  ],
};
