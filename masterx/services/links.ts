// Link repository — all DB operations on links + tags join + FTS search.
import { getDb, newId } from '../db';
import type {
  CreateLinkInput,
  Link,
  LinkFilter,
  LinkWithRelations,
  Tag,
  Collection,
  UpdateLinkInput,
} from '../db/types';

interface LinkRow {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  domain: string;
  notes: string;
  is_bookmarked: number;
  is_read: number;
  collection_id: string | null;
  created_at: number;
  updated_at: number;
}

interface CollectionRow {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  icon_kind: Collection['iconKind'];
  icon_value: string;
  color: string;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

function rowToLink(r: LinkRow): Link {
  return {
    id: r.id,
    url: r.url,
    title: r.title,
    description: r.description,
    image: r.image,
    domain: r.domain,
    notes: r.notes,
    isBookmarked: !!r.is_bookmarked,
    isRead: !!r.is_read,
    collectionId: r.collection_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function deriveDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] || '';
  }
}

export async function listLinks(filter: LinkFilter = 'all', collectionId?: string, tagId?: string): Promise<LinkWithRelations[]> {
  const db = await getDb();
  const where: string[] = [];
  const params: any[] = [];

  if (filter === 'favorites') where.push('l.is_bookmarked = 1');
  if (filter === 'unread') where.push('l.is_read = 0');
  if (collectionId) {
    where.push('l.collection_id = ?');
    params.push(collectionId);
  }
  if (tagId) {
    where.push('EXISTS(SELECT 1 FROM link_tags lt WHERE lt.link_id = l.id AND lt.tag_id = ?)');
    params.push(tagId);
  }

  const orderBy =
    filter === 'recent'
      ? 'l.created_at DESC'
      : 'l.created_at DESC';

  const sql = `SELECT l.* FROM links l
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY ${orderBy}
    LIMIT 500;`;

  const rows = await db.getAllAsync<LinkRow>(sql, params);
  return hydrateLinks(rows);
}

export async function searchLinks(query: string): Promise<LinkWithRelations[]> {
  const q = query.trim();
  if (!q) return listLinks('all');
  const db = await getDb();
  // Use FTS prefix matching on each token; sanitize quotes.
  const ftsQuery =
    q
      .replace(/["'()]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => t + '*')
      .join(' ') || '*';

  const rows = await db.getAllAsync<LinkRow>(
    `SELECT l.* FROM links l
     JOIN links_fts f ON f.rowid = l.rowid
     WHERE links_fts MATCH ?
     ORDER BY l.created_at DESC
     LIMIT 200;`,
    [ftsQuery]
  );
  return hydrateLinks(rows);
}

async function hydrateLinks(rows: LinkRow[]): Promise<LinkWithRelations[]> {
  if (rows.length === 0) return [];
  const db = await getDb();
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map(() => '?').join(',');

  const tagRows = await db.getAllAsync<{ link_id: string; id: string; name: string; color: string; created_at: number }>(
    `SELECT lt.link_id, t.id, t.name, t.color, t.created_at
     FROM link_tags lt JOIN tags t ON t.id = lt.tag_id
     WHERE lt.link_id IN (${placeholders});`,
    ids
  );
  const tagsByLink = new Map<string, Tag[]>();
  for (const tr of tagRows) {
    const arr = tagsByLink.get(tr.link_id) ?? [];
    arr.push({ id: tr.id, name: tr.name, color: tr.color, createdAt: tr.created_at });
    tagsByLink.set(tr.link_id, arr);
  }

  const collectionIds = Array.from(new Set(rows.map((r) => r.collection_id).filter((x): x is string => !!x)));
  const collectionsById = new Map<string, Collection>();
  if (collectionIds.length) {
    const cph = collectionIds.map(() => '?').join(',');
    const collRows = await db.getAllAsync<CollectionRow>(
      `SELECT * FROM collections WHERE id IN (${cph});`,
      collectionIds
    );
    for (const c of collRows) {
      collectionsById.set(c.id, {
        id: c.id,
        name: c.name,
        description: c.description ?? '',
        parentId: c.parent_id,
        iconKind: c.icon_kind,
        iconValue: c.icon_value,
        color: c.color,
        sortOrder: c.sort_order ?? 0,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      });
    }
  }

  return rows.map((r) => ({
    ...rowToLink(r),
    tags: tagsByLink.get(r.id) ?? [],
    collection: r.collection_id ? collectionsById.get(r.collection_id) ?? null : null,
  }));
}

export async function getLink(id: string): Promise<LinkWithRelations | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<LinkRow>(`SELECT * FROM links WHERE id = ?;`, [id]);
  if (!row) return null;
  const [hydrated] = await hydrateLinks([row]);
  return hydrated;
}

export async function createLink(input: CreateLinkInput): Promise<Link> {
  const db = await getDb();
  const id = newId();
  const now = Date.now();
  const domain = input.domain ?? deriveDomain(input.url);
  await db.runAsync(
    `INSERT INTO links(id, url, title, description, image, domain, notes, is_bookmarked, is_read, collection_id, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?);`,
    [
      id,
      input.url,
      input.title ?? '',
      input.description ?? '',
      input.image ?? '',
      domain,
      input.notes ?? '',
      input.isBookmarked ? 1 : 0,
      input.collectionId ?? null,
      now,
      now,
    ]
  );
  if (input.tagIds && input.tagIds.length) {
    for (const tid of input.tagIds) {
      await db.runAsync(`INSERT OR IGNORE INTO link_tags(link_id, tag_id) VALUES(?, ?);`, [id, tid]);
    }
  }
  const created = await getLink(id);
  return created!;
}

export async function updateLink(id: string, patch: UpdateLinkInput): Promise<void> {
  const db = await getDb();
  const sets: string[] = [];
  const params: any[] = [];
  if (patch.title !== undefined)        { sets.push('title = ?');         params.push(patch.title); }
  if (patch.description !== undefined)  { sets.push('description = ?');   params.push(patch.description); }
  if (patch.image !== undefined)        { sets.push('image = ?');         params.push(patch.image); }
  if (patch.notes !== undefined)        { sets.push('notes = ?');         params.push(patch.notes); }
  if (patch.isBookmarked !== undefined) { sets.push('is_bookmarked = ?'); params.push(patch.isBookmarked ? 1 : 0); }
  if (patch.isRead !== undefined)       { sets.push('is_read = ?');       params.push(patch.isRead ? 1 : 0); }
  if (patch.collectionId !== undefined) { sets.push('collection_id = ?'); params.push(patch.collectionId); }
  if (!sets.length) return;
  sets.push('updated_at = ?'); params.push(Date.now());
  params.push(id);
  await db.runAsync(`UPDATE links SET ${sets.join(', ')} WHERE id = ?;`, params);
}

export async function deleteLink(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM links WHERE id = ?;`, [id]);
}

export async function toggleBookmark(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE links SET is_bookmarked = CASE WHEN is_bookmarked = 1 THEN 0 ELSE 1 END, updated_at = ? WHERE id = ?;`,
    [Date.now(), id]
  );
}

export async function setLinkTags(linkId: string, tagIds: string[]): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM link_tags WHERE link_id = ?;`, [linkId]);
  for (const tid of tagIds) {
    await db.runAsync(`INSERT OR IGNORE INTO link_tags(link_id, tag_id) VALUES(?, ?);`, [linkId, tid]);
  }
}

export async function addTagToLink(linkId: string, tagId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`INSERT OR IGNORE INTO link_tags(link_id, tag_id) VALUES(?, ?);`, [linkId, tagId]);
}

export async function removeTagFromLink(linkId: string, tagId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM link_tags WHERE link_id = ? AND tag_id = ?;`, [linkId, tagId]);
}
