import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Settings, Link2, X, Plus, Trash2 } from 'lucide-react-native';

import { useAppData } from '@/context/AppDataContext';
import { useUi } from '@/context/UiContext';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/context/I18nContext';
import { useToast } from '@/components/Toast';
import { useDialogs } from '@/components/Dialogs';
import { EmptyState } from '@/components/EmptyState';
import { formatRelativeTime } from '@/components/time';
import {
  clearClipboardHistory,
  deleteClipboardEntry,
  dismissClipboardEntry,
} from '@/services/clipboard';
import type { ClipboardEntry } from '@/db/types';

export default function ClipboardScreen() {
  const router = useRouter();
  const { clipboardHistory, pendingClipboard, reloadClipboard, dismissPendingClipboard } = useAppData();
  const { openAddModal } = useUi();
  const { colors } = useTheme();
  const { t } = useI18n();
  const toast = useToast();
  const dialogs = useDialogs();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return clipboardHistory;
    return clipboardHistory.filter(
      (e) => e.url.toLowerCase().includes(q) || e.domain.toLowerCase().includes(q)
    );
  }, [clipboardHistory, searchQuery]);

  const onSavePending = () => {
    if (!pendingClipboard) return;
    openAddModal({ tab: 'link', presetUrl: pendingClipboard.url, clipboardEntryId: pendingClipboard.id });
  };
  const onSaveEntry = (entry: ClipboardEntry) => {
    openAddModal({ tab: 'link', presetUrl: entry.url, clipboardEntryId: entry.id });
  };

  const onLongPress = async (entry: ClipboardEntry) => {
    const choice = await dialogs.actionSheet({
      title: entry.domain || 'Clipboard entry',
      message: entry.url,
      items: [
        { id: 'save', label: t.clipboardSaveToApp },
        { id: 'dismiss', label: t.actionDismiss },
        { id: 'delete', label: t.actionDelete, destructive: true },
      ],
    });
    if (choice === 'save') onSaveEntry(entry);
    else if (choice === 'dismiss') { await dismissClipboardEntry(entry.id); await reloadClipboard(); }
    else if (choice === 'delete') { await deleteClipboardEntry(entry.id); await reloadClipboard(); toast.show(t.toastDeleted); }
  };

  const onClearAll = async () => {
    if (clipboardHistory.length === 0) return;
    const ok = await dialogs.confirm({ title: t.dialogClearHistory, message: t.dialogClearHistoryMsg, confirmLabel: t.actionDone, destructive: true });
    if (!ok) return;
    await clearClipboardHistory(); await reloadClipboard();
    toast.show(t.toastHistoryCleared);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.header}>
        <View><Text style={[styles.title, { color: colors.text }]}>{t.tabClipboard}</Text></View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => { setShowSearch(!showSearch); setSearchQuery(''); }}>
            {showSearch ? <X size={20} color={colors.text} /> : <Search size={20} color={colors.text} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onClearAll}>
            <Trash2 size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/settings' as any)}>
            <Settings size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={[styles.searchBar, { backgroundColor: colors.searchBg }]}>
          <Search size={16} color={colors.textFaint} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t.searchClipboard}
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

      {pendingClipboard && (
        <View style={[styles.banner, { backgroundColor: colors.accentSoft }]}>
          <View style={[styles.bannerIcon, { backgroundColor: colors.surface }]}>
            <Link2 size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: colors.accent }]}>{t.clipboardLinkDetected}</Text>
            <Text style={[styles.bannerUrl, { color: colors.textMuted }]} numberOfLines={1}>{pendingClipboard.url}</Text>
          </View>
          <TouchableOpacity style={[styles.bannerSave, { backgroundColor: colors.accent }]} onPress={onSavePending}>
            <Plus size={14} color="#FFFFFF" />
            <Text style={styles.bannerSaveText}>{t.actionSave}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bannerDismiss} onPress={dismissPendingClipboard}>
            <X size={16} color={colors.textFaint} />
          </TouchableOpacity>
        </View>
      )}

      <Text style={[styles.subtitle, { color: colors.textFaint }]}>{t.clipboardRecent}</Text>

      <FlatList
        data={filtered}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.divider }]}
            activeOpacity={0.85}
            onPress={() => onSaveEntry(item)}
            onLongPress={() => onLongPress(item)}
          >
            <View style={[styles.rowIcon, { backgroundColor: colors.bgElev }]}>
              <Link2 size={16} color={colors.textMuted} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.rowDomain, { color: colors.text }]} numberOfLines={1}>{item.domain || item.url}</Text>
              <Text style={[styles.rowUrl, { color: colors.textMuted }]} numberOfLines={1}>{item.url}</Text>
              <Text style={[styles.rowTime, { color: colors.textFaint }]}>{formatRelativeTime(item.createdAt)}{item.saved ? t.clipboardSavedSuffix : ''}</Text>
            </View>
            <TouchableOpacity style={styles.rowSave} onPress={() => onSaveEntry(item)} hitSlop={8}>
              <Plus size={16} color={colors.accent} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState title={t.emptyNothingHere} subtitle={t.emptyCopyLinkHint} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title:        { fontSize: 28, fontWeight: '700' },
  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn:      { padding: 4 },
  searchBar:    { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 20, marginBottom: 8, gap: 8 },
  searchInput:  { flex: 1, fontSize: 15, padding: 0 },
  banner:       { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12, marginHorizontal: 20, marginBottom: 12, gap: 12 },
  bannerIcon:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bannerTitle:  { fontSize: 13, fontWeight: '600' },
  bannerUrl:    { fontSize: 12, marginTop: 2 },
  bannerSave:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  bannerSaveText:{ fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  bannerDismiss:{ padding: 4 },
  subtitle:     { fontSize: 14, paddingHorizontal: 20, paddingBottom: 8 },
  list:         { paddingHorizontal: 20, paddingBottom: 140 },
  row:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  rowIcon:      { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowDomain:    { fontSize: 14, fontWeight: '600' },
  rowUrl:       { fontSize: 12, marginTop: 2 },
  rowTime:      { fontSize: 11, marginTop: 2 },
  rowSave:      { padding: 8 },
});
