import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  Image,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Search, Settings, ChevronRight, X, GripVertical } from 'lucide-react-native';

import { useAppData } from '@/context/AppDataContext';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/context/I18nContext';
import { useToast } from '@/components/Toast';
import { useDialogs } from '@/components/Dialogs';
import { CollectionIconForCollection } from '@/components/CollectionIcon';
import { EmptyState } from '@/components/EmptyState';
import { getAssetIcon, getLucideIcon } from '@/components/iconCatalog';
import { IconPickerModal } from '@/components/IconPickerModal';
import { deleteCollection, reorderCollections, updateCollection } from '@/services/collections';
import { DraggableList, DRAG_ITEM_HEIGHT, DRAG_ITEM_GAP } from '@/components/DraggableList';
import type { CollectionWithCount } from '@/db/types';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;
const PREVIEW_H = 120;
const GLASS_H = 160;

export default function CollectionsScreen() {
  const router = useRouter();
  const { collections, settings, reloadCollections, reloadLinks } = useAppData();
  const { isDark, colors } = useTheme();
  const { t } = useI18n();
  const toast = useToast();
  const dialogs = useDialogs();
  const [showSearch, setShowSearch] = useState(false);
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [iconPickerTarget, setIconPickerTarget] = useState<CollectionWithCount | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter((c) => c.name.toLowerCase().includes(q));
  }, [collections, searchQuery]);

  const onLongPress = async (item: CollectionWithCount) => {
    const choice = await dialogs.actionSheet({
      title: item.name,
      items: [
        { id: 'open', label: t.actionOpen },
        { id: 'editIcon', label: 'Edit Icon' },
        { id: 'rename', label: t.actionRename },
        { id: 'delete', label: t.actionDelete, destructive: true },
      ],
    });
    if (choice === 'open') {
      router.push(`/collection/${item.id}` as any);
    } else if (choice === 'editIcon') {
      setIconPickerTarget(item);
      setIconPickerVisible(true);
    } else if (choice === 'rename') {
      const next = await dialogs.prompt({
        title: t.dialogRenameCollection,
        defaultValue: item.name,
        placeholder: t.dialogCollectionPlaceholder,
        validate: (v) => (v.trim() ? null : t.dialogNameRequired),
      });
      if (next === null) return;
      await updateCollection(item.id, { name: next.trim() });
      await reloadCollections();
      toast.show(t.toastRenamed);
    } else if (choice === 'delete') {
      const ok = await dialogs.confirm({
        title: t.dialogDeleteCollection,
        message: t.dialogDeleteCollectionMsg,
        confirmLabel: t.actionDelete,
        destructive: true,
      });
      if (!ok) return;
      await deleteCollection(item.id);
      await reloadCollections();
      await reloadLinks();
      toast.show(t.toastCollectionDeleted);
    }
  };

  const handleReorder = useCallback(async (from: number, to: number) => {
    const reordered = [...filtered];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    await reorderCollections(reordered.map((c) => c.id));
    await reloadCollections();
  }, [filtered, reloadCollections]);

  // Shared icon builder for all card modes
  const buildIconNode = (item: CollectionWithCount, size: number, style: any) => {
    if (item.iconKind === 'asset') {
      const asset = getAssetIcon(item.iconValue);
      return (
        <View style={[style, { backgroundColor: asset.color }]}>
          <Image source={asset.image} style={StyleSheet.absoluteFill} resizeMode="cover" />
        </View>
      );
    }
    if (item.iconKind === 'photo') {
      return (
        <View style={style}>
          <Image source={{ uri: item.iconValue }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        </View>
      );
    }
    if (item.iconKind === 'emoji') {
      return (
        <View style={[style, styles.centered, { backgroundColor: item.color }]}>
          <Text style={{ fontSize: size * 0.45 }}>{item.iconValue}</Text>
        </View>
      );
    }
    const Icon = getLucideIcon(item.iconValue);
    return (
      <View style={[style, styles.centered, { backgroundColor: item.color }]}>
        <Icon size={size * 0.4} color={colors.accent} />
      </View>
    );
  };

  const countLabel = (c: CollectionWithCount) =>
    `${c.count} ${c.count === 1 ? t.countItem : t.countItems}`;

  // ── Grid (2-column image card) ──────────────────────────────────────────
  const renderGridItem = ({ item }: { item: CollectionWithCount }) => (
    <TouchableOpacity
      style={[styles.gridCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
      activeOpacity={0.9}
      onPress={() => router.push(`/collection/${item.id}` as any)}
      onLongPress={() => onLongPress(item)}
    >
      {buildIconNode(item, CARD_WIDTH, styles.cardTop)}
      <View style={styles.cardBottom}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.cardCount, { color: colors.textFaint }]}>{countLabel(item)}</Text>
      </View>
    </TouchableOpacity>
  );

  // ── Preview (single-column wide card) ────────────────────────────────────
  const renderPreviewItem = ({ item }: { item: CollectionWithCount }) => (
    <TouchableOpacity
      style={[styles.previewCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
      activeOpacity={0.9}
      onPress={() => router.push(`/collection/${item.id}` as any)}
      onLongPress={() => onLongPress(item)}
    >
      {buildIconNode(item, PREVIEW_H, styles.previewTop)}
      <View style={styles.previewBottom}>
        <View style={styles.previewTextBox}>
          <Text style={[styles.previewTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.cardCount, { color: colors.textFaint }]}>{countLabel(item)}</Text>
        </View>
        <ChevronRight size={18} color={colors.textFaint} />
      </View>
    </TouchableOpacity>
  );

  // ── Glass (frosted overlay card) ─────────────────────────────────────────
  const renderGlassItem = ({ item }: { item: CollectionWithCount }) => (
    <TouchableOpacity
      style={[styles.glassCard, { shadowColor: colors.shadow }]}
      activeOpacity={0.9}
      onPress={() => router.push(`/collection/${item.id}` as any)}
      onLongPress={() => onLongPress(item)}
    >
      {buildIconNode(item, GLASS_H, styles.glassBg)}
      <BlurView
        intensity={isDark ? 60 : 50}
        tint={isDark ? 'dark' : 'light'}
        style={styles.glassOverlay}
      >
        <Text style={[styles.glassTitle, { color: isDark ? '#F3F4F6' : '#1F2937' }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.cardCount, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{countLabel(item)}</Text>
      </BlurView>
    </TouchableOpacity>
  );

  // ── List (compact row — supports drag-to-reorder) ───────────────────────
  const renderListItem = (item: CollectionWithCount, isDragging: boolean, onDragStart: () => void) => (
    <View
      style={[
        styles.listCard,
        { backgroundColor: colors.surface, shadowColor: colors.shadow },
        isDragging && styles.listCardDragging,
      ]}
    >
      {/* Grip handle — long-press here to start dragging */}
      <Pressable
        onLongPress={onDragStart}
        delayLongPress={300}
        hitSlop={8}
        style={styles.dragHandleBtn}
      >
        <GripVertical size={18} color={isDragging ? colors.accent : colors.textFaint} />
      </Pressable>
      {/* Main content — tap to open, long-press for action sheet */}
      <TouchableOpacity
        style={styles.listCardMain}
        activeOpacity={0.85}
        onPress={() => !isDragging && router.push(`/collection/${item.id}` as any)}
        onLongPress={() => onLongPress(item)}
      >
        <CollectionIconForCollection collection={item} size={44} />
        <View style={styles.listTextBox}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.cardCount, { color: colors.textFaint }]}>{countLabel(item)}</Text>
        </View>
        <ChevronRight size={18} color={colors.textFaint} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <IconPickerModal
        visible={iconPickerVisible}
        initialIcon={iconPickerTarget ? { kind: iconPickerTarget.iconKind, value: iconPickerTarget.iconValue, color: iconPickerTarget.color } : { kind: 'asset', value: 'green', color: '#C8F6E8' }}
        onClose={() => { setIconPickerVisible(false); setIconPickerTarget(null); }}
        onSave={async (icon) => {
          if (!iconPickerTarget) return;
          await updateCollection(iconPickerTarget.id, {
            iconKind: icon.kind,
            iconValue: icon.value,
            color: icon.color,
          });
          await reloadCollections();
          toast.show('Icon updated');
          setIconPickerVisible(false);
          setIconPickerTarget(null);
        }}
      />

      <View style={[styles.headerWrap, { backgroundColor: colors.bg }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.text }]}>{t.tabCollections}</Text>
            <Text style={[styles.subtitle, { color: colors.textFaint }]}>
              {collections.length} {collections.length === 1 ? t.countCollection : t.countCollections}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.iconsRow}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => { setShowSearch(!showSearch); setSearchQuery(''); }}
              >
                {showSearch ? <X size={20} color={colors.text} /> : <Search size={20} color={colors.text} />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/settings' as any)}>
                <Settings size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {showSearch && (
          <View style={[styles.searchBar, { backgroundColor: colors.searchBg }]}>
            <Search size={16} color={colors.textFaint} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t.searchCollections}
              placeholderTextColor={colors.textFaint}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={colors.textFaint} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          title={searchQuery ? t.emptyNoMatches : t.emptyNoCollections}
          subtitle={searchQuery ? t.emptyTryDifferentName : t.emptyAddFirstCollection}
        />
      ) : settings.collectionsLayout === 'grid' ? (
        <FlatList
          key="grid"
          data={filtered}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
        />
      ) : settings.collectionsLayout === 'preview' ? (
        <FlatList
          key="preview"
          data={filtered}
          renderItem={renderPreviewItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : settings.collectionsLayout === 'glass' ? (
        <FlatList
          key="glass"
          data={filtered}
          renderItem={renderGlassItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <DraggableList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderListItem}
          onReorder={handleReorder}
          itemHeight={DRAG_ITEM_HEIGHT}
          itemGap={DRAG_ITEM_GAP}
          contentContainerStyle={styles.listDragContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  headerWrap:    {},
  centered:      { alignItems: 'center', justifyContent: 'center' },
  header:        { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  headerLeft:    {},
  title:         { fontSize: 28, fontWeight: '700' },
  subtitle:      { fontSize: 14, marginTop: 4 },
  headerRight:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconsRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn:       { padding: 4 },
  searchBar:     { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 20, marginBottom: 8, gap: 8 },
  searchInput:   { flex: 1, fontSize: 15, padding: 0 },
  // Grid
  gridContent:   { paddingHorizontal: 16, paddingBottom: 140 },
  gridRow:       { justifyContent: 'space-between', marginBottom: CARD_GAP },
  gridCard:      { width: CARD_WIDTH, borderRadius: 16, overflow: 'hidden', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  cardTop:       { width: '100%', height: CARD_WIDTH, overflow: 'hidden' },
  cardBottom:    { padding: 12 },
  cardTitle:     { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  cardCount:     { fontSize: 12 },
  // Shared list container
  listContent:   { paddingHorizontal: 16, paddingBottom: 140, gap: 10 },
  // List
  listDragContent:  { paddingHorizontal: 16, paddingTop: 4 },
  listCard:         { flexDirection: 'row', alignItems: 'center', borderRadius: 14, overflow: 'hidden', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  listCardDragging: { shadowOpacity: 0.18, shadowRadius: 12, elevation: 10 },
  dragHandleBtn:    { paddingHorizontal: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  listCardMain:     { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingRight: 12, gap: 10 },
  listTextBox:      { flex: 1 },
  // Preview
  previewCard:   { borderRadius: 16, overflow: 'hidden', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 },
  previewTop:    { width: '100%', height: PREVIEW_H, overflow: 'hidden' },
  previewBottom: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8 },
  previewTextBox:{ flex: 1 },
  previewTitle:  { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  // Glass
  glassCard:     { borderRadius: 18, overflow: 'hidden', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  glassBg:       { width: '100%', height: GLASS_H, overflow: 'hidden' },
  glassOverlay:  { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingVertical: 12 },
  glassTitle:    { fontSize: 16, fontWeight: '700', marginBottom: 2 },
});
