// Two-column grid card for the 'grid' view mode.
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import type { LinkWithRelations } from '../db/types';
import { useTheme } from '../context/ThemeContext';

interface Props {
  link: LinkWithRelations;
  width: number;
  onPress: () => void;
  onToggleBookmark?: () => void;
  onLongPress?: () => void;
}

export function LinkGridCard({ link, width, onPress, onToggleBookmark, onLongPress }: Props) {
  const { colors } = useTheme();
  const initial = (link.domain || link.url || '?')[0]?.toUpperCase() ?? '?';
  return (
    <TouchableOpacity
      style={[s.card, { width, backgroundColor: colors.surface, shadowColor: colors.shadow }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.9}
    >
      <View style={[s.media, { height: width * 0.75, backgroundColor: colors.bgElev }]}>
        {link.image ? (
          <Image source={{ uri: link.image }} style={s.image} resizeMode="cover" />
        ) : (
          <View style={[s.fallback, { backgroundColor: colors.accentSoft }]}>
            <Text style={[s.fallbackText, { color: colors.accent }]}>{initial}</Text>
          </View>
        )}
        <TouchableOpacity style={s.bookmarkBtn} onPress={onToggleBookmark} hitSlop={6} disabled={!onToggleBookmark}>
          <Bookmark
            size={14}
            color={link.isBookmarked ? colors.accent : '#FFFFFF'}
            fill={link.isBookmarked ? colors.accent : 'rgba(0,0,0,0.25)'}
          />
        </TouchableOpacity>
      </View>
      <View style={s.body}>
        <Text style={[s.title, { color: colors.text }]} numberOfLines={2}>{link.title || link.url}</Text>
        <Text style={[s.domain, { color: colors.textFaint }]} numberOfLines={1}>{link.domain || link.url}</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card:        { borderRadius: 14, overflow: 'hidden', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  media:       { width: '100%' },
  image:       { width: '100%', height: '100%' },
  fallback:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fallbackText:{ fontSize: 28, fontWeight: '700' },
  bookmarkBtn: { position: 'absolute', top: 8, right: 8, padding: 4, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.2)' },
  body:        { padding: 10 },
  title:       { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  domain:      { fontSize: 11, marginTop: 4 },
});
