// Collection repository.
import { getDb, newId } from '../db';
import type {
  Collection,
  CollectionWithCount,
  CreateCollectionInput,
  UpdateCollectionInput,
} from '../db/types';

interface Row {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  icon_kind: any;
  icon_value: string;
  color: string;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

function toCollection(r: Row): Collection {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    parentId: r.parent_id,
    iconKind: r.icon_kind,
    iconValue: r.icon_value,
    color: r.color,
    sortOrder: r.sort_order ?? 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function listCollections(): Promise<CollectionWithCount[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row & { count: number }>(`
    SELECT c.*, (SELECT COUNT(*) FROM links l WHERE l.collection_id = c.id) AS count
    FROM collections c ORDER BY c.sort_order ASC, c.created_at ASC;
  `);
  return rows.map((r) => ({ ...toCollection(r), count: r.count }));
}

export async function getCollection(id: string): Promise<Collection | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>(`SELECT * FROM collections WHERE id = ?;`, [id]);
  return row ? toCollection(row) : null;
}

export async function createCollection(input: CreateCollectionInput): Promise<Collection> {
  const db = await getDb();
  const id = newId();
  const now = Date.now();
  const maxRow = await db.getFirstAsync<{ max_order: number | null }>(
    `SELECT MAX(sort_order) AS max_order FROM collections;`
  );
  const sortOrder = (maxRow?.max_order ?? -1) + 1;
  await db.runAsync(
    `INSERT INTO collections(id, name, description, parent_id, icon_kind, icon_value, color, sort_order, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      input.name.trim(),
      input.description ?? '',
      input.parentId ?? null,
      input.iconKind ?? 'asset',
      input.iconValue ?? 'green',
      input.color ?? '#C8F6E8',
      sortOrder,
      now,
      now,
    ]
  );
  const c = await getCollection(id);
  return c!;
}

export async function updateCollection(id: string, patch: UpdateCollectionInput): Promise<void> {
  const db = await getDb();
  const sets: string[] = [];
  const params: any[] = [];
  if (patch.name !== undefined)        { sets.push('name = ?');        params.push(patch.name); }
  if (patch.description !== undefined) { sets.push('description = ?'); params.push(patch.description); }
  if (patch.parentId !== undefined)    { sets.push('parent_id = ?');   params.push(patch.parentId); }
  if (patch.iconKind !== undefined)    { sets.push('icon_kind = ?');   params.push(patch.iconKind); }
  if (patch.iconValue !== undefined)   { sets.push('icon_value = ?');  params.push(patch.iconValue); }
  if (patch.color !== undefined)       { sets.push('color = ?');       params.push(patch.color); }
  if (!sets.length) return;
  sets.push('updated_at = ?'); params.push(Date.now());
  params.push(id);
  await db.runAsync(`UPDATE collections SET ${sets.join(', ')} WHERE id = ?;`, params);
}

export async function deleteCollection(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM collections WHERE id = ?;`, [id]);
}

export async function reorderCollections(orderedIds: string[]): Promise<void> {
  const db = await getDb();
  await Promise.all(
    orderedIds.map((id, idx) =>
      db.runAsync(`UPDATE collections SET sort_order = ? WHERE id = ?;`, [idx, id])
    )
  );
}

export async function getCollectionByName(name: string): Promise<Collection | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>(`SELECT * FROM collections WHERE name = ? LIMIT 1;`, [name]);
  return row ? toCollection(row) : null;
}
