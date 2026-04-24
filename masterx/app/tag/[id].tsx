import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ArrowLeft, MoreHorizontal, Hash } from 'lucide-react-native';

import { useAppData } from '@/context/AppDataContext';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/context/I18nContext';
import { useToast } from '@/components/Toast';
import { useDialogs } from '@/components/Dialogs';
import { LinkCard } from '@/components/LinkCard';
import { LinkRow } from '@/components/LinkRow';
import { LinkGridCard } from '@/components/LinkGridCard';
import { LinkGlassCard } from '@/components/LinkGlassCard';
import { EmptyState } from '@/components/EmptyState';
import { listLinks, toggleBookmark, deleteLink, removeTagFromLink } from '@/services/links';
import { getTag, deleteTag, renameTag } from '@/services/tags';
import type { Tag, LinkWithRelations } from '@/db/types';

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_W = (SCREEN_W - 32 - GRID_GAP) / 2;

export default function TagDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { settings, reloadTags, reloadLinks } = useAppData();
  const { colors } = useTheme();
  const { t } = useI18n();
  const toast = useToast();
  const dialogs = useDialogs();

  const [tag, setTag] = useState<Tag | null>(null);
  const [links, setLinks] = useState<LinkWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const [t, ls] = await Promise.all([getTag(id), listLinks('all', undefined, id)]);
    setTag(t);
    setLinks(ls);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRename = async () => {
    if (!tag) return;
    const next = await dialogs.prompt({
      title: t.dialogRenameTag,
      message: t.dialogRenameTagHint,
      defaultValue: tag.name,
      placeholder: t.dialogTagPlaceholder,
      validate: (v) => (v.trim() ? null : t.dialogNameRequired),
    });
    if (next === null) return;
    try {
      await renameTag(tag.id, next.trim());
      await reloadTags(); await reloadLinks(); await load();
      toast.show(t.toastRenamed);
    } catch (e: any) {
      await dialogs.confirm({ title: t.errorCouldNotOpenMail, message: e?.message ?? 'Unknown error', confirmLabel: t.actionOk, cancelLabel: t.actionClose });
    }
  };

  const onDelete = async () => {
    if (!tag) return;
    const ok = await dialogs.confirm({
      title: t.dialogDeleteTag,
      message: t.dialogDeleteTagMsg,
      confirmLabel: t.actionDelete, destructive: true,
    });
    if (!ok) return;
    await deleteTag(tag.id); await reloadTags(); await reloadLinks();
    toast.show(t.toastDeleted); router.back();
  };

  const onMore = async () => {
    const choice = await dialogs.actionSheet({
      title: `#${tag?.name ?? t.countTag}`,
      items: [
        { id: 'rename', label: t.actionRename },
        { id: 'delete', label: t.actionDelete, destructive: true },
      ],
    });
    if (choice === 'rename') onRename();
    if (choice === 'delete') onDelete();
  };

  const onLinkLongPress = async (link: LinkWithRelations) => {
    if (!tag) return;
    const choice = await dialogs.actionSheet({
      title: link.title || link.url,
      items: [
        { id: 'untag', label: `Remove #${tag.name}` },
        { id: 'delete', label: t.actionDelete, destructive: true },
      ],
    });
    if (choice === 'untag') {
      await removeTagFromLink(link.id, tag.id);
      await reloadLinks(); await reloadTags(); await load();
    } else if (choice === 'delete') {
      await deleteLink(link.id); await reloadLinks(); await load();
      toast.show(t.toastDeleted);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }
  if (!tag) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}><Text style={[styles.title, { color: colors.text }]}>{t.detailTagNotFound}</Text></View>
      </SafeAreaView>
    );
  }

  const view = settings.viewMode;

  const renderItem = ({ item }: { item: LinkWithRelations }) => {
    const press = () => router.push(`/item/${item.id}` as any);
    const bm = async () => { await toggleBookmark(item.id); await reloadLinks(); await load(); };
    const lp = () => onLinkLongPress(item);
    if (view === 'grid')  return <LinkGridCard link={item} width={GRID_W} onPress={press} onToggleBookmark={bm} onLongPress={lp} />;
    if (view === 'glass') return <LinkGlassCard link={item} onPress={press} onToggleBookmark={bm} onLongPress={lp} />;
    if (view === 'list')  return <LinkRow link={item} onPress={press} onToggleBookmark={bm} onLongPress={lp} />;
    return <LinkCard link={item} onPress={press} onToggleBookmark={bm} onLongPress={lp} />;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={onMore} style={styles.iconBtn}>
            <MoreHorizontal size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.heroRow}>
        <View style={[styles.tagCircle, { backgroundColor: tag.color + '20' }]}>
          <Hash size={22} color={tag.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>#{tag.name}</Text>
          <Text style={[styles.subtitle, { color: colors.textFaint }]}>{links.length} {links.length === 1 ? 'item' : 'items'}</Text>
        </View>
      </View>

      <FlatList
        key={view}
        data={links}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={view === 'grid' ? 2 : 1}
        columnWrapperStyle={view === 'grid' ? styles.gridRow : undefined}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState title="No links with this tag" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  headerRight:  { flexDirection: 'row', gap: 4 },
  iconBtn:      { padding: 6 },
  heroRow:      { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  tagCircle:    { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  title:        { fontSize: 22, fontWeight: '700' },
  subtitle:     { fontSize: 13, marginTop: 2 },
  listContent:  { padding: 16, paddingBottom: 140 },
  gridRow:      { gap: GRID_GAP, marginBottom: GRID_GAP },
});
