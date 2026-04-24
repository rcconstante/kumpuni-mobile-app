// Tag repository.
import { getDb, newId } from '../db';
import type { Tag, TagWithCount } from '../db/types';

const PALETTE = ['#0D9488', '#8B5CF6', '#F59E0B', '#F472B6', '#EC4899', '#3B82F6', '#10B981'];

function pickColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function normalize(name: string): string {
  return name.trim().replace(/^#/, '').toLowerCase();
}

interface Row {
  id: string;
  name: string;
  color: string;
  created_at: number;
}

export async function listTags(): Promise<TagWithCount[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row & { count: number }>(`
    SELECT t.*, (SELECT COUNT(*) FROM link_tags lt WHERE lt.tag_id = t.id) AS count
    FROM tags t ORDER BY count DESC, t.name ASC;
  `);
  return rows.map((r) => ({
    id: r.id, name: r.name, color: r.color, createdAt: r.created_at, count: r.count,
  }));
}

export async function getTag(id: string): Promise<Tag | null> {
  const db = await getDb();
  const r = await db.getFirstAsync<Row>(`SELECT * FROM tags WHERE id = ?;`, [id]);
  return r ? { id: r.id, name: r.name, color: r.color, createdAt: r.created_at } : null;
}

export async function getOrCreateTagByName(rawName: string): Promise<Tag> {
  const name = normalize(rawName);
  if (!name) throw new Error('Tag name required');
  const db = await getDb();
  const existing = await db.getFirstAsync<Row>(`SELECT * FROM tags WHERE name = ?;`, [name]);
  if (existing) return { id: existing.id, name: existing.name, color: existing.color, createdAt: existing.created_at };
  const id = newId();
  const now = Date.now();
  const color = pickColor(name);
  await db.runAsync(
    `INSERT INTO tags(id, name, color, created_at) VALUES(?, ?, ?, ?);`,
    [id, name, color, now]
  );
  return { id, name, color, createdAt: now };
}

export async function renameTag(id: string, newName: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE tags SET name = ? WHERE id = ?;`, [normalize(newName), id]);
}

export async function deleteTag(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM tags WHERE id = ?;`, [id]);
}
