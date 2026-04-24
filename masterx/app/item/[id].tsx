import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  ArrowLeft,
  ExternalLink,
  Link2,
  MoreHorizontal,
  Folder,
  Bookmark,
  Trash2,
  X as XIcon,
  Share2,
} from 'lucide-react-native';

import { useAppData } from '@/context/AppDataContext';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/context/I18nContext';
import { useToast } from '@/components/Toast';
import { useDialogs } from '@/components/Dialogs';
import { CollectionIconForCollection } from '@/components/CollectionIcon';
import { formatRelativeTime } from '@/components/time';
import {
  getLink,
  updateLink,
  deleteLink,
  toggleBookmark,
  addTagToLink,
  removeTagFromLink,
} from '@/services/links';
import { getOrCreateTagByName } from '@/services/tags';
import type { LinkWithRelations } from '@/db/types';

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { collections, reloadLinks, reloadTags } = useAppData();
  const { colors } = useTheme();
  const { t } = useI18n();
  const toast = useToast();
  const dialogs = useDialogs();

  const [link, setLink] = useState<LinkWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const notesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setLink(null);
      setNotes('');
      setLoading(false);
      return;
    }
    const l = await getLink(id);
    setLink(l);
    setNotes(l?.notes ?? '');
    setLoading(false);
    if (l && !l.isRead) {
      await updateLink(l.id, { isRead: true });
      await reloadLinks();
    }
  }, [id, reloadLinks]);

  useEffect(() => { load(); }, [load]);

  const onChangeNotes = (text: string) => {
    setNotes(text);
    if (!link) return;
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(async () => { await updateLink(link.id, { notes: text }); }, 600);
  };

  const onOpen = () => { if (!link) return; router.push({ pathname: '/webview', params: { url: link.url, title: link.title } } as any); };
  const onCopy = async () => { if (!link) return; await Clipboard.setStringAsync(link.url); toast.show(t.toastLinkCopied); };
  const onSystemShare = async () => { if (!link) return; try { await Share.share({ message: link.url, url: link.url, title: link.title }); } catch {} };

  const onShare = async () => {
    if (!link) return;
    const choice = await dialogs.actionSheet({
      title: t.actionShare,
      message: link.url,
      items: [
        { id: 'copy', label: t.actionCopyToClipboard, icon: <Link2 size={18} color={colors.text} /> },
        { id: 'apps', label: t.actionShareViaApps, icon: <Share2 size={18} color={colors.text} /> },
        { id: 'collection', label: t.actionMoveToCollection, icon: <Folder size={18} color={colors.text} /> },
      ],
    });
    if (choice === 'copy') await onCopy();
    else if (choice === 'apps') await onSystemShare();
    else if (choice === 'collection') await onMoveToCollection();
  };

  const onMoveToCollection = async () => {
    if (!link) return;
    const choice = await dialogs.actionSheet({
      title: t.actionMoveToCollection,
      items: [
        { id: '__none__', label: t.modalNoCollection },
        ...collections.map((c) => ({ id: c.id, label: c.name })),
      ],
    });
    if (choice === null) return;
    await updateLink(link.id, { collectionId: choice === '__none__' ? null : choice });
    await reloadLinks(); await load(); toast.show(t.toastMoved);
  };

  const onToggleBookmark = async () => { if (!link) return; await toggleBookmark(link.id); await reloadLinks(); await load(); };

  const onDelete = async () => {
    if (!link) return;
    const ok = await dialogs.confirm({ title: t.dialogDeleteLink, message: t.dialogDeleteLinkMsg, confirmLabel: t.actionDelete, destructive: true });
    if (!ok) return;
    await deleteLink(link.id); await reloadLinks(); toast.show(t.toastDeleted); router.back();
  };

  const onEditTitle = async () => {
    if (!link) return;
    const next = await dialogs.prompt({ title: t.dialogEditTitle, defaultValue: link.title, placeholder: t.modalTitle, validate: (v) => (v.trim() ? null : t.dialogTitleRequired) });
    if (next === null) return;
    await updateLink(link.id, { title: next.trim() }); await reloadLinks(); await load();
  };

  const onMore = async () => {
    const choice = await dialogs.actionSheet({
      title: 'Actions',
      items: [
        { id: 'edit', label: t.actionEditTitle },
        { id: 'move', label: t.actionMoveToCollection },
        { id: 'delete', label: t.actionDelete, destructive: true },
      ],
    });
    if (choice === 'edit') onEditTitle();
    else if (choice === 'move') onMoveToCollection();
    else if (choice === 'delete') onDelete();
  };

  const onAddTag = async () => {
    if (!link) return;
    const raw = await dialogs.prompt({ title: t.dialogAddTag, message: t.dialogAddTagHint, placeholder: t.dialogTagPlaceholder, validate: (v) => (v.trim() ? null : t.dialogNameRequired) });
    if (raw === null) return;
    const tag = await getOrCreateTagByName(raw.trim());
    await addTagToLink(link.id, tag.id);
    await reloadLinks(); await reloadTags(); await load();
  };

  const onRemoveTag = async (tagId: string, name: string) => {
    if (!link) return;
    const ok = await dialogs.confirm({ title: `Remove #${name}?`, confirmLabel: t.actionDelete, destructive: true });
    if (!ok) return;
    await removeTagFromLink(link.id, tagId);
    await reloadLinks(); await reloadTags(); await load();
  };

  const initial = useMemo(() => (link?.domain || link?.url || '?')[0]?.toUpperCase() ?? '?', [link]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (!link) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}><Text style={[styles.title, { color: colors.text }]}>{t.detailItemNotFound}</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={onShare}><Share2 size={20} color={colors.text} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onOpen}><ExternalLink size={20} color={colors.text} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onMore}><MoreHorizontal size={20} color={colors.text} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!!link.image && (
          <View style={[styles.hero, { backgroundColor: colors.bgElev }]}>
            <Image source={{ uri: link.image }} style={styles.heroImage} resizeMode="cover" />
          </View>
        )}

        <View style={styles.metaRow}>
          <View style={[styles.favicon, { backgroundColor: colors.bgElev }]}>
            <Text style={[styles.faviconText, { color: colors.textMuted }]}>{initial}</Text>
          </View>
          <Text style={[styles.domain, { color: colors.textMuted }]}>{link.domain || link.url}</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{link.title || link.url}</Text>
        {!!link.description && <Text style={[styles.description, { color: colors.textMuted }]}>{link.description}</Text>}

        <View style={styles.tagsRow}>
          {link.tags.map((tag) => (
            <TouchableOpacity key={tag.id} style={[styles.tagPill, { backgroundColor: colors.accentSoft }]} onPress={() => onRemoveTag(tag.id, tag.name)}>
              <Text style={[styles.tagText, { color: colors.accent }]}>#{tag.name}</Text>
              <XIcon size={12} color={colors.accent} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.addTag, { borderColor: colors.border }]} onPress={onAddTag}>
            <Text style={[styles.addTagText, { color: colors.textFaint }]}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.actionsRow, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={onOpen}>
            <ExternalLink size={20} color={colors.text} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>{t.actionOpen}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
            <Share2 size={20} color={colors.text} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>{t.actionShare}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onToggleBookmark}>
            <Bookmark size={20} color={link.isBookmarked ? colors.accent : colors.text} fill={link.isBookmarked ? colors.accent : 'none'} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>{link.isBookmarked ? t.detailSaved : t.actionSave}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
            <Trash2 size={20} color="#EF4444" />
            <Text style={[styles.actionLabel, { color: '#EF4444' }]}>{t.actionDelete}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textFaint }]}>{t.detailNotes}</Text>
          <TextInput
            style={[styles.noteInput, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder={t.detailNotes + '...'}
            placeholderTextColor={colors.textFaint}
            value={notes}
            onChangeText={onChangeNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        {link.collection && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textFaint }]}>{t.detailSavedIn}</Text>
            <TouchableOpacity
              style={[styles.collectionRow, { backgroundColor: colors.surface }]}
              onPress={() => router.push(`/collection/${link.collection!.id}` as any)}
            >
              <CollectionIconForCollection collection={link.collection} size={32} />
              <Text style={[styles.collectionText, { color: colors.text }]}>{link.collection.name}</Text>
              <Folder size={16} color={colors.textFaint} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: colors.textFaint }]}>{t.detailSaved} {formatRelativeTime(link.createdAt)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 },
  headerRight:  { flexDirection: 'row', gap: 4 },
  iconBtn:      { padding: 6 },
  content:      { padding: 16, paddingBottom: 80 },
  hero:         { width: '100%', height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  heroImage:    { width: '100%', height: '100%' },
  metaRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  favicon:      { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  faviconText:  { fontSize: 11, fontWeight: '700' },
  domain:       { fontSize: 13, fontWeight: '500' },
  title:        { fontSize: 22, fontWeight: '700', marginBottom: 8, lineHeight: 28 },
  description:  { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  tagsRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  tagPill:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  tagText:      { fontSize: 12, fontWeight: '500' },
  addTag:       { width: 28, height: 28, borderRadius: 14, borderStyle: 'dashed', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  addTagText:   { fontSize: 16, lineHeight: 18 },
  actionsRow:   { flexDirection: 'row', justifyContent: 'space-around', borderRadius: 14, paddingVertical: 14, marginBottom: 16, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  actionBtn:    { alignItems: 'center', gap: 6, flex: 1 },
  actionLabel:  { fontSize: 12, fontWeight: '500' },
  section:      { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
  noteInput:    { borderRadius: 14, padding: 14, fontSize: 14, minHeight: 100 },
  collectionRow:{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 12 },
  collectionText:{ flex: 1, fontSize: 14, fontWeight: '500' },
  footerRow:    { alignItems: 'center', marginTop: 8 },
  footerText:   { fontSize: 12 },
});
