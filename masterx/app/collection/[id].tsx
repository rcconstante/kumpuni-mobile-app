import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ArrowLeft, MoreHorizontal } from 'lucide-react-native';

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
import { CollectionIconForCollection } from '@/components/CollectionIcon';
import { IconPickerModal } from '@/components/IconPickerModal';
import { listLinks, toggleBookmark, deleteLink } from '@/services/links';
import { getCollection, deleteCollection, updateCollection } from '@/services/collections';
import type { Collection, LinkWithRelations } from '@/db/types';

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_W = (SCREEN_W - 32 - GRID_GAP) / 2;

export default function CollectionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { settings, reloadCollections, reloadLinks } = useAppData();
  const { colors } = useTheme();
  const { t } = useI18n();
  const toast = useToast();
  const dialogs = useDialogs();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [links, setLinks] = useState<LinkWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [iconPickerVisible, setIconPickerVisible] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const [c, ls] = await Promise.all([getCollection(id), listLinks('all', id)]);
    setCollection(c);
    setLinks(ls);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRename = async () => {
    if (!collection) return;
    const next = await dialogs.prompt({
      title: t.dialogRenameCollection,
      defaultValue: collection.name,
      placeholder: t.dialogCollectionPlaceholder,
      confirmLabel: t.actionSave,
      validate: (v) => (v.trim() ? null : t.dialogNameRequired),
    });
    if (next === null) return;
    await updateCollection(collection.id, { name: next.trim() });
    await reloadCollections();
    await load();
    toast.show(t.toastRenamed);
  };

  const onDelete = async () => {
    if (!collection) return;
    const ok = await dialogs.confirm({
      title: t.dialogDeleteCollection,
      message: t.dialogDeleteCollectionMsg,
      confirmLabel: t.actionDelete,
      destructive: true,
    });
    if (!ok) return;
    await deleteCollection(collection.id);
    await reloadCollections();
    await reloadLinks();
    toast.show(t.toastDeleted);
    router.back();
  };

  const onEditIcon = () => {
    if (!collection) return;
    setIconPickerVisible(true);
  };

  const onMore = async () => {
    const choice = await dialogs.actionSheet({
      title: collection?.name ?? t.tabCollections,
      items: [
        { id: 'editIcon', label: 'Edit Icon' },
        { id: 'rename', label: t.actionRename },
        { id: 'delete', label: t.actionDelete, destructive: true },
      ],
    });
    if (choice === 'editIcon') onEditIcon();
    else if (choice === 'rename') onRename();
    else if (choice === 'delete') onDelete();
  };

  const onLinkLongPress = async (link: LinkWithRelations) => {
    const choice = await dialogs.actionSheet({
      title: link.title || link.url,
      items: [{ id: 'delete', label: t.actionDelete, destructive: true }],
    });
    if (choice === 'delete') {
      await deleteLink(link.id);
      await reloadLinks();
      await load();
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

  if (!collection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}><Text style={[styles.title, { color: colors.text }]}>{t.detailCollectionNotFound}</Text></View>
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
      <IconPickerModal
        visible={iconPickerVisible}
        initialIcon={{
          kind: collection.iconKind,
          value: collection.iconValue,
          color: collection.color,
        }}
        onClose={() => setIconPickerVisible(false)}
        onSave={async (icon) => {
          await updateCollection(collection.id, {
            iconKind: icon.kind,
            iconValue: icon.value,
            color: icon.color,
          });
          await reloadCollections();
          await load();
          toast.show('Icon updated');
          setIconPickerVisible(false);
        }}
      />

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
        <CollectionIconForCollection collection={collection} size={56} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>{collection.name}</Text>
          <Text style={[styles.subtitle, { color: colors.textFaint }]}>{links.length} {links.length === 1 ? 'item' : 'items'}</Text>
          {!!collection.description && <Text style={[styles.description, { color: colors.textMuted }]}>{collection.description}</Text>}
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
        ListEmptyComponent={<EmptyState title="No links" subtitle="Add links to this collection from the + tab." />}
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
  title:        { fontSize: 22, fontWeight: '700' },
  subtitle:     { fontSize: 13, marginTop: 2 },
  description:  { fontSize: 13, marginTop: 6 },
  listContent:  { padding: 16, paddingBottom: 140 },
  gridRow:      { gap: GRID_GAP, marginBottom: GRID_GAP },
});
