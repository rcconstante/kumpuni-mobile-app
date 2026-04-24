// JSON import for Savit backups.
// Accepts an export bundle of shape { collections?, tags?, links?, clipboardHistory? }.
// Re-uses existing collections/tags by name; creates missing ones.
import * as FileSystem from 'expo-file-system/legacy';
import { getDb } from '../db';
import { createCollection, getCollectionByName } from './collections';
import { getOrCreateTagByName } from './tags';
import { createLink, deriveDomain } from './links';
import { recordClipboardUrl } from './clipboard';
import { isProbablyUrl } from './metadata';

interface RawCollection {
  id?: string;
  name?: string;
  description?: string;
  iconKind?: any;
  iconValue?: string;
  color?: string;
}
interface RawTag { id?: string; name?: string }
interface RawLink {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
  notes?: string;
  isBookmarked?: boolean;
  collectionId?: string | null;
  tags?: RawTag[];
}
interface RawClip { url?: string }
export interface ImportSummary {
  collections: number;
  tags: number;
  links: number;
  clipboard: number;
  skipped: number;
}

export interface ImportBundle {
  collections?: RawCollection[];
  tags?: RawTag[];
  links?: RawLink[];
  clipboardHistory?: RawClip[];
}

async function listExistingLinkUrls(): Promise<Set<string>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ url: string }>(`SELECT url FROM links;`);
  return new Set(rows.map((r) => r.url));
}

export async function importFromJsonString(json: string): Promise<ImportSummary> {
  let parsed: ImportBundle;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('File is not valid JSON');
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid Savit export file');

  const summary: ImportSummary = { collections: 0, tags: 0, links: 0, clipboard: 0, skipped: 0 };

  // Map original collection id -> new/existing id.
  const collectionIdMap = new Map<string, string>();
  for (const c of parsed.collections ?? []) {
    if (!c?.name) { summary.skipped++; continue; }
    const existing = await getCollectionByName(c.name);
    if (existing) {
      if (c.id) collectionIdMap.set(c.id, existing.id);
      continue;
    }
    const created = await createCollection({
      name: c.name,
      description: c.description ?? '',
      parentId: null,
      iconKind: c.iconKind ?? 'asset',
      iconValue: c.iconValue ?? 'green',
      color: c.color ?? '#C8F6E8',
    });
    if (c.id) collectionIdMap.set(c.id, created.id);
    summary.collections++;
  }

  // Pre-create tags so we can resolve by name later.
  const tagIdByName = new Map<string, string>();
  for (const t of parsed.tags ?? []) {
    if (!t?.name) { summary.skipped++; continue; }
    const tag = await getOrCreateTagByName(t.name);
    tagIdByName.set(tag.name, tag.id);
    summary.tags++;
  }

  // Skip links whose URL already exists.
  const existingUrls = await listExistingLinkUrls();

  for (const l of parsed.links ?? []) {
    if (!l?.url || !isProbablyUrl(l.url)) { summary.skipped++; continue; }
    if (existingUrls.has(l.url)) { summary.skipped++; continue; }

    const tagIds: string[] = [];
    for (const t of l.tags ?? []) {
      if (!t?.name) continue;
      const tag = await getOrCreateTagByName(t.name);
      tagIds.push(tag.id);
      tagIdByName.set(tag.name, tag.id);
    }

    const targetCollectionId =
      l.collectionId && collectionIdMap.get(l.collectionId)
        ? collectionIdMap.get(l.collectionId)!
        : null;

    await createLink({
      url: l.url,
      title: l.title ?? '',
      description: l.description ?? '',
      image: l.image ?? '',
      domain: l.domain || deriveDomain(l.url),
      notes: l.notes ?? '',
      isBookmarked: !!l.isBookmarked,
      collectionId: targetCollectionId,
      tagIds,
    });
    existingUrls.add(l.url);
    summary.links++;
  }

  for (const c of parsed.clipboardHistory ?? []) {
    if (!c?.url || !isProbablyUrl(c.url)) { summary.skipped++; continue; }
    await recordClipboardUrl(c.url);
    summary.clipboard++;
  }

  return summary;
}

export async function importFromFileUri(uri: string): Promise<ImportSummary> {
  const json = await FileSystem.readAsStringAsync(uri);
  return importFromJsonString(json);
}
