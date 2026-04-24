// Reusable link card used by Home, Collection detail, Tag detail.
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

export function LinkCard({ link, onPress, onToggleBookmark, onLongPress }: Props) {
  const { colors } = useTheme();
  const initial = (link.domain || link.url || '?')[0].toUpperCase();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <View style={styles.domainRow}>
          <View style={[styles.favicon, { backgroundColor: colors.bgElev }]}>
            <Text style={[styles.faviconText, { color: colors.textMuted }]}>{initial}</Text>
          </View>
          <Text style={[styles.domainText, { color: colors.textMuted }]} numberOfLines={1}>{link.domain || link.url}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          <Text style={[styles.timeText, { color: colors.textFaint }]}>{formatRelativeTime(link.createdAt)}</Text>
          <TouchableOpacity onPress={onToggleBookmark} hitSlop={8} disabled={!onToggleBookmark}>
            <Bookmark
              size={16}
              color={link.isBookmarked ? colors.accent : colors.textFaint}
              fill={link.isBookmarked ? colors.accent : 'none'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.textColumn}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{link.title || link.url}</Text>
          {!!link.description && (
            <Text style={[styles.cardDescription, { color: colors.textMuted }]} numberOfLines={3}>{link.description}</Text>
          )}
          {link.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {link.tags.slice(0, 4).map((tag) => (
                <View key={tag.id} style={[styles.tagPill, { backgroundColor: colors.accentSoft }]}>
                  <Text style={[styles.tagText, { color: colors.accent }]}>#{tag.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {!!link.image && (
          <Image source={{ uri: link.image }} style={[styles.cardImage, { backgroundColor: colors.bgElev }]} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  domainRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 },
  favicon: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  faviconText: { fontSize: 10, fontWeight: '700' },
  domainText: { fontSize: 12, fontWeight: '500', flex: 1, minWidth: 0 },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeText: { fontSize: 12 },
  cardBody: { flexDirection: 'row', gap: 12 },
  textColumn: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6, lineHeight: 20 },
  cardDescription: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '500' },
  cardImage: { width: 80, height: 80, borderRadius: 12 },
});
