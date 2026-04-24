// Global app data context — owns hydrated lists + pending clipboard banner.
// Screens read state via hooks; mutations call services + reload.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { getDb } from '../db';
import { listLinks } from '../services/links';
import { listCollections } from '../services/collections';
import { listTags } from '../services/tags';
import {
  dismissClipboardEntry,
  getPendingClipboardEntry,
  listClipboard,
  recordClipboardUrl,
} from '../services/clipboard';
import { loadSettings, patchSettings, type AppSettings } from '../services/settings';
import { saveAutoBackup } from '../services/backup';
import { isProbablyUrl } from '../services/metadata';
import type {
  ClipboardEntry,
  CollectionWithCount,
  LinkWithRelations,
  TagWithCount,
} from '../db/types';

interface AppDataContextValue {
  ready: boolean;
  links: LinkWithRelations[];
  collections: CollectionWithCount[];
  tags: TagWithCount[];
  clipboardHistory: ClipboardEntry[];
  pendingClipboard: ClipboardEntry | null;
  settings: AppSettings;

  reloadAll: () => Promise<void>;
  reloadLinks: () => Promise<void>;
  reloadCollections: () => Promise<void>;
  reloadTags: () => Promise<void>;
  reloadClipboard: () => Promise<void>;

  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  dismissPendingClipboard: () => Promise<void>;
}

const Ctx = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [links, setLinks] = useState<LinkWithRelations[]>([]);
  const [collections, setCollections] = useState<CollectionWithCount[]>([]);
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [clipboardHistory, setClipboardHistory] = useState<ClipboardEntry[]>([]);
  const [pendingClipboard, setPendingClipboard] = useState<ClipboardEntry | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    appearance: 'system',
    language: 'en',
    viewMode: 'preview',
    collectionsLayout: 'grid',
    autoImportTags: true,
    defaultCollectionId: null,
    onboardingComplete: false,
  });

  const lastClipboardCheckRef = useRef<string>('');

  const reloadLinks = useCallback(async () => {
    setLinks(await listLinks('all'));
  }, []);

  const reloadCollections = useCallback(async () => {
    setCollections(await listCollections());
  }, []);

  const reloadTags = useCallback(async () => {
    setTags(await listTags());
  }, []);

  const reloadClipboard = useCallback(async () => {
    const [list, pending] = await Promise.all([listClipboard(), getPendingClipboardEntry()]);
    setClipboardHistory(list);
    setPendingClipboard(pending);
  }, []);

  const reloadAll = useCallback(async () => {
    await Promise.all([reloadLinks(), reloadCollections(), reloadTags(), reloadClipboard()]);
  }, [reloadLinks, reloadCollections, reloadTags, reloadClipboard]);

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    const next = await patchSettings(patch);
    setSettings(next);
  }, []);

  const dismissPendingClipboard = useCallback(async () => {
    if (!pendingClipboard) return;
    await dismissClipboardEntry(pendingClipboard.id);
    await reloadClipboard();
  }, [pendingClipboard, reloadClipboard]);

  // Clipboard polling on foreground.
  const checkClipboard = useCallback(async () => {
    try {
      const has = await Clipboard.hasStringAsync();
      if (!has) return;
      const text = await Clipboard.getStringAsync();
      if (!text || text === lastClipboardCheckRef.current) return;
      lastClipboardCheckRef.current = text;
      if (!isProbablyUrl(text)) return;
      const url = text.trim();
      await recordClipboardUrl(url.startsWith('http') ? url : 'https://' + url);
      await reloadClipboard();
    } catch {
      // ignore — clipboard access can be denied silently on web
    }
  }, [reloadClipboard]);

  // Boot: open DB, seed, load settings + lists.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await getDb();
        const s = await loadSettings();
        if (cancelled) return;
        setSettings(s);
        await reloadAll();
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadAll]);

  // Listen to app foreground/background for clipboard + auto-backup.
  useEffect(() => {
    if (!ready) return;
    checkClipboard();
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        checkClipboard();
      } else if (state === 'background' || state === 'inactive') {
        // Fire-and-forget local backup whenever the app backgrounds.
        saveAutoBackup({
          exportedAt: new Date().toISOString(),
          version: 1,
          links,
          collections,
          tags,
          clipboardHistory,
        }).catch(() => {});
      }
    });
    return () => sub.remove();
  }, [ready, checkClipboard, links, collections, tags, clipboardHistory]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      ready,
      links,
      collections,
      tags,
      clipboardHistory,
      pendingClipboard,
      settings,
      reloadAll,
      reloadLinks,
      reloadCollections,
      reloadTags,
      reloadClipboard,
      updateSettings,
      dismissPendingClipboard,
    }),
    [
      ready,
      links,
      collections,
      tags,
      clipboardHistory,
      pendingClipboard,
      settings,
      reloadAll,
      reloadLinks,
      reloadCollections,
      reloadTags,
      reloadClipboard,
      updateSettings,
      dismissPendingClipboard,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}
