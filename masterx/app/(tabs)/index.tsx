import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Search, Settings, Share2, X } from 'lucide-react-native';

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
import { searchLinks, toggleBookmark, deleteLink } from '@/services/links';
import type { LinkFilter, LinkWithRelations } from '@/db/types';

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_CARD_W = (SCREEN_W - 32 - GRID_GAP) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const { links, settings, reloadLinks } = useAppData();
  const { isDark, colors } = useTheme();
  const { t } = useI18n();
  const toast = useToast();
  const dialogs = useDialogs();

  const FILTERS: { id: LinkFilter; label: string }[] = [
    { id: 'all', label: t.filterAll },
    { id: 'recent', label: t.filterRecent },
    { id: 'favorites', label: t.filterFavorites },
    { id: 'unread', label: t.filterUnread },
  ];

  const [activeFilter, setActiveFilter] = useState<LinkFilter>('all');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LinkWithRelations[] | null>(null);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) { setSearchResults(null); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const r = await searchLinks(q);
        if (!cancelled) setSearchResults(r);
      } catch { if (!cancelled) setSearchResults([]); }
    }, 200);
    return () => { cancelled = true; clearTimeout(t); };
  }, [searchQuery]);

  const filtered = useMemo(() => {
    const source = searchResults ?? links;
    switch (activeFilter) {
      case 'favorites': return source.filter((l) => l.isBookmarked);
      case 'unread':    return source.filter((l) => !l.isRead);
      case 'recent': {
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return source.filter((l) => l.createdAt >= cutoff);
      }
      default: return source;
    }
  }, [searchResults, links, activeFilter]);

  const onToggleBookmark = async (id: string) => {
    await toggleBookmark(id);
    await reloadLinks();
  };

  const onLongPress = async (link: LinkWithRelations) => {
    const choice = await dialogs.actionSheet({
      title: link.title || link.url,
      message: link.domain,
      items: [
        { id: 'open', label: t.actionOpen },
        { id: 'copy', label: t.actionCopyLink },
        { id: 'share', label: t.actionShareViaApps, icon: <Share2 size={18} color={colors.text} /> },
        { id: 'bookmark', label: link.isBookmarked ? t.actionRemoveBookmark : t.actionBookmark },
        { id: 'delete', label: t.actionDelete, destructive: true },
      ],
    });
    if (!choice) return;
    if (choice === 'open') {
      router.push({ pathname: '/webview', params: { url: link.url, title: link.title } } as any);
    } else if (choice === 'copy') {
      await Clipboard.setStringAsync(link.url);
      toast.show(t.toastLinkCopied);
    } else if (choice === 'share') {
      try { await Share.share({ message: link.url, url: link.url, title: link.title }); } catch {}
    } else if (choice === 'bookmark') {
      await onToggleBookmark(link.id);
    } else if (choice === 'delete') {
      const ok = await dialogs.confirm({
        title: t.dialogDeleteLink,
        message: t.dialogDeleteLinkMsg,
        confirmLabel: t.actionDelete,
        destructive: true,
      });
      if (ok) {
        await deleteLink(link.id);
        await reloadLinks();
        toast.show(t.toastLinkDeleted);
      }
    }
  };

  const view = settings.viewMode;

  const renderItem = ({ item }: { item: LinkWithRelations }) => {
    const press = () => router.push(`/item/${item.id}` as any);
    const bm = () => onToggleBookmark(item.id);
    const lp = () => onLongPress(item);
    if (view === 'grid')  return <LinkGridCard link={item} width={GRID_CARD_W} onPress={press} onToggleBookmark={bm} onLongPress={lp} />;
    if (view === 'glass') return <LinkGlassCard link={item} onPress={press} onToggleBookmark={bm} onLongPress={lp} />;
    if (view === 'list')  return <LinkRow link={item} onPress={press} onToggleBookmark={bm} onLongPress={lp} />;
    return <LinkCard link={item} onPress={press} onToggleBookmark={bm} onLongPress={lp} />;
  };

  const logo = isDark
    ? require('../../assets/images/savit-white.png')
    : require('../../assets/images/savit.png');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => { setShowSearch(!showSearch); setSearchQuery(''); }}
          >
            {showSearch ? <X size={20} color={colors.text} /> : <Search size={20} color={colors.text} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings' as any)}>
            <Settings size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={[styles.searchBar, { backgroundColor: colors.searchBg }]}>
          <Search size={16} color={colors.textFaint} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t.searchLinks}
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

      <View style={[styles.filterContainer, { borderBottomColor: colors.divider }]}>
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={styles.filterButton}
              onPress={() => setActiveFilter(f.id)}
            >
              <Text style={[styles.filterText, { color: colors.textFaint }, activeFilter === f.id && { color: colors.accent, fontWeight: '600' }]}>
                {f.label}
              </Text>
              {activeFilter === f.id && <View style={[styles.filterUnderline, { backgroundColor: colors.accent }]} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        key={view}
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={view === 'grid' ? 2 : 1}
        columnWrapperStyle={view === 'grid' ? styles.gridRow : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title={searchQuery ? t.emptyNoResults : t.emptyNoLinks}
            subtitle={searchQuery ? t.emptyTryDifferentSearch : t.emptyAddFirstLink}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  logoImage:    { width: 100, height: 32 },
  headerRight:  { flexDirection: 'row', gap: 8 },
  iconButton:   { padding: 4 },
  searchBar:    { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 20, marginBottom: 4, gap: 8 },
  searchInput:  { flex: 1, fontSize: 15, padding: 0 },
  filterContainer: { borderBottomWidth: 1, paddingHorizontal: 20 },
  filterRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  filterButton: { flex: 1, alignItems: 'center', paddingVertical: 12, position: 'relative' },
  filterText:   { fontSize: 14, fontWeight: '500' },
  filterUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, borderRadius: 1 },
  listContent:  { padding: 16, paddingBottom: 140 },
  gridRow:      { gap: GRID_GAP, marginBottom: GRID_GAP },
});
