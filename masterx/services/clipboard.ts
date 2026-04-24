// Clipboard history repository.
import { getDb, newId } from '../db';
import type { ClipboardEntry } from '../db/types';
import { deriveDomain } from './links';

interface Row {
  id: string;
  url: string;
  domain: string;
  saved: number;
  dismissed: number;
  created_at: number;
}

function toEntry(r: Row): ClipboardEntry {
  return {
    id: r.id,
    url: r.url,
    domain: r.domain,
    saved: !!r.saved,
    dismissed: !!r.dismissed,
    createdAt: r.created_at,
  };
}

export async function listClipboard(): Promise<ClipboardEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>(
    `SELECT * FROM clipboard_history ORDER BY created_at DESC LIMIT 100;`
  );
  return rows.map(toEntry);
}

export async function recordClipboardUrl(url: string): Promise<ClipboardEntry | null> {
  if (!url) return null;
  const db = await getDb();
  // Avoid duplicate consecutive entries within the last 24h.
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const existing = await db.getFirstAsync<Row>(
    `SELECT * FROM clipboard_history WHERE url = ? AND created_at > ? LIMIT 1;`,
    [url, dayAgo]
  );
  if (existing) return toEntry(existing);
  const id = newId();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO clipboard_history(id, url, domain, saved, dismissed, created_at) VALUES(?, ?, ?, 0, 0, ?);`,
    [id, url, deriveDomain(url), now]
  );
  return { id, url, domain: deriveDomain(url), saved: false, dismissed: false, createdAt: now };
}

export async function markClipboardSaved(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE clipboard_history SET saved = 1 WHERE id = ?;`, [id]);
}

export async function dismissClipboardEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE clipboard_history SET dismissed = 1 WHERE id = ?;`, [id]);
}

export async function dismissClipboardUrl(url: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE clipboard_history SET dismissed = 1 WHERE url = ?;`, [url]);
}

export async function deleteClipboardEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM clipboard_history WHERE id = ?;`, [id]);
}

export async function clearClipboardHistory(): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM clipboard_history;`);
}

// Find latest unsaved + undismissed entry — the one to surface as a banner.
export async function getPendingClipboardEntry(): Promise<ClipboardEntry | null> {
  const db = await getDb();
  const r = await db.getFirstAsync<Row>(
    `SELECT * FROM clipboard_history WHERE saved = 0 AND dismissed = 0 ORDER BY created_at DESC LIMIT 1;`
  );
  return r ? toEntry(r) : null;
}
