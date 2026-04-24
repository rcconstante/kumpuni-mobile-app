import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Hash, Search, Settings, ChevronRight, X } from 'lucide-react-native';

import { useAppData } from '@/context/AppDataContext';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/context/I18nContext';
import { useToast } from '@/components/Toast';
import { useDialogs } from '@/components/Dialogs';
import { EmptyState } from '@/components/EmptyState';
import { deleteTag, renameTag } from '@/services/tags';
import type { TagWithCount } from '@/db/types';

export default function TagsScreen() {
  const router = useRouter();
  const { tags, reloadTags, reloadLinks } = useAppData();
  const { colors } = useTheme();
  const { t } = useI18n();
  const toast = useToast();
  const dialogs = useDialogs();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.name.toLowerCase().includes(q));
  }, [tags, searchQuery]);

  const onLongPress = async (item: TagWithCount) => {
    const choice = await dialogs.actionSheet({
      title: `#${item.name}`,
      items: [
        { id: 'open', label: t.actionOpen },
        { id: 'rename', label: t.actionRename },
        { id: 'delete', label: t.actionDelete, destructive: true },
      ],
    });
    if (choice === 'open') {
      router.push(`/tag/${item.id}` as any);
    } else if (choice === 'rename') {
      const next = await dialogs.prompt({
        title: t.dialogRenameTag,
        message: t.dialogRenameTagHint,
        defaultValue: item.name,
        placeholder: t.dialogTagPlaceholder,
        validate: (v) => (v.trim() ? null : t.dialogNameRequired),
      });
      if (next === null) return;
      try {
        await renameTag(item.id, next.trim());
        await reloadTags(); await reloadLinks();
        toast.show(t.toastRenamed);
      } catch (e: any) {
        await dialogs.confirm({ title: t.errorCouldNotOpenMail, message: e?.message ?? 'Unknown error', confirmLabel: t.actionOk, cancelLabel: t.actionClose });
      }
    } else if (choice === 'delete') {
      const ok = await dialogs.confirm({
        title: t.dialogDeleteTag,
        message: t.dialogDeleteTagMsg,
        confirmLabel: t.actionDelete,
        destructive: true,
      });
      if (!ok) return;
      await deleteTag(item.id); await reloadTags(); await reloadLinks();
      toast.show(t.toastTagDeleted);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.header}>
        <View><Text style={[styles.title, { color: colors.text }]}>{t.tabTags}</Text></View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => { setShowSearch(!showSearch); setSearchQuery(''); }}>
            {showSearch ? <X size={20} color={colors.text} /> : <Search size={20} color={colors.text} />}
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
            placeholder={t.searchTags}
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

      <Text style={[styles.subtitle, { color: colors.textFaint }]}>{tags.length} {tags.length === 1 ? t.countTag : t.countTags}</Text>

      <FlatList
        data={filtered}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.tagRow, { borderBottomColor: colors.divider }]}
            activeOpacity={0.8}
            onPress={() => router.push(`/tag/${item.id}` as any)}
            onLongPress={() => onLongPress(item)}
          >
            <View style={[styles.tagCircle, { backgroundColor: item.color + '20' }]}>
              <Hash size={14} color={item.color} />
            </View>
            <Text style={[styles.tagName, { color: colors.text }]}>#{item.name}</Text>
            <Text style={[styles.tagCount, { color: colors.textFaint }]}>{item.count}</Text>
            <ChevronRight size={16} color={colors.textFaint} />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title={searchQuery ? t.emptyNoMatches : t.emptyNoTags}
            subtitle={searchQuery ? t.emptyTryDifferentSearch : t.emptyTagsAppear}
          />
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
  searchBar:    { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 20, marginBottom: 4, gap: 8 },
  searchInput:  { flex: 1, fontSize: 15, padding: 0 },
  subtitle:     { fontSize: 14, paddingHorizontal: 20, paddingBottom: 12 },
  list:         { paddingHorizontal: 20, paddingBottom: 140 },
  tagRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  tagCircle:    { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tagName:      { flex: 1, fontSize: 14, fontWeight: '500' },
  tagCount:     { fontSize: 14, marginRight: 4 },
});
