// Compact one-line list row for the 'list' view mode.
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import type { LinkWithRelations } from '../db/types';
import { useTheme } from '../context/ThemeContext';
import { formatRelativeTime } from './time';

interface Props {
  link: LinkWithRelations;
  onPress: () => void;
  onToggleBookmark?: () => void;
  onLongPress?: () => void;
}

export function LinkRow({ link, onPress, onToggleBookmark, onLongPress }: Props) {
  const { colors } = useTheme();
  const initial = (link.domain || link.url || '?')[0]?.toUpperCase() ?? '?';
  return (
    <TouchableOpacity
      style={[s.row, { backgroundColor: colors.surface }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
    >
      {link.image ? (
        <Image source={{ uri: link.image }} style={[s.thumb, { backgroundColor: colors.bgElev }]} />
      ) : (
        <View style={[s.thumb, s.thumbFallback, { backgroundColor: colors.bgElev }]}>
          <Text style={[s.thumbText, { color: colors.textMuted }]}>{initial}</Text>
        </View>
      )}
      <View style={s.body}>
        <Text style={[s.title, { color: colors.text }]} numberOfLines={1}>{link.title || link.url}</Text>
        <Text style={[s.meta, { color: colors.textFaint }]} numberOfLines={1}>{link.domain || link.url} · {formatRelativeTime(link.createdAt)}</Text>
      </View>
      <TouchableOpacity onPress={onToggleBookmark} hitSlop={8} disabled={!onToggleBookmark}>
        <Bookmark
          size={16}
          color={link.isBookmarked ? colors.accent : colors.textFaint}
          fill={link.isBookmarked ? colors.accent : 'none'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  row:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, gap: 12, marginBottom: 8 },
  thumb:         { width: 44, height: 44, borderRadius: 10 },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  thumbText:     { fontSize: 16, fontWeight: '700' },
  body:          { flex: 1, minWidth: 0 },
  title:         { fontSize: 14, fontWeight: '600' },
  meta:          { fontSize: 12, marginTop: 2 },
});
