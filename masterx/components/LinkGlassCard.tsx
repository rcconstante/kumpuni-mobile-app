// Vertical glass-style link card. Used when viewMode === 'glass'.
// Hero image background + frosted info panel overlaid at the bottom.
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
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

export function LinkGlassCard({ link, onPress, onToggleBookmark, onLongPress }: Props) {
  const { isDark, colors } = useTheme();
  const initial = (link.domain || link.url || '?')[0].toUpperCase();
  const heroBg = isDark ? '#1F2937' : '#E5E7EB';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
      activeOpacity={0.92}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={[styles.hero, { backgroundColor: heroBg }]}>
        {link.image ? (
          <Image source={{ uri: link.image }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroFallback, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.heroInitial, { color: colors.accent }]}>{initial}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={onToggleBookmark}
          disabled={!onToggleBookmark}
          hitSlop={10}
          style={styles.bookmarkChip}
        >
          <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={styles.bookmarkBlur}>
            <Bookmark
              size={16}
              color={link.isBookmarked ? colors.accent : '#FFFFFF'}
              fill={link.isBookmarked ? colors.accent : 'transparent'}
            />
          </BlurView>
        </TouchableOpacity>

        <BlurView intensity={50} tint={isDark ? 'dark' : 'light'} style={styles.glassPanel}>
          <View style={[styles.glassInner, { backgroundColor: colors.glassTint }]}>
            <Text
              style={[styles.title, { color: isDark ? '#F3F4F6' : '#1F2937' }]}
              numberOfLines={2}
            >
              {link.title || link.url}
            </Text>
            <View style={styles.metaRow}>
              <Text style={[styles.domain, { color: isDark ? '#D1D5DB' : '#4B5563' }]} numberOfLines={1}>
                {link.domain || link.url}
              </Text>
              <Text style={[styles.time, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {formatRelativeTime(link.createdAt)}
              </Text>
            </View>
            {link.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {link.tags.slice(0, 3).map((t) => (
                  <View key={t.id} style={[styles.tagPill, { backgroundColor: colors.accentSoft }]}>
                    <Text style={[styles.tagText, { color: colors.accent }]}>#{t.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </BlurView>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  hero: { width: '100%', height: 240, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroInitial: { fontSize: 56, fontWeight: '700' },

  bookmarkChip: { position: 'absolute', top: 12, right: 12, borderRadius: 20, overflow: 'hidden' },
  bookmarkBlur: { padding: 8, alignItems: 'center', justifyContent: 'center' },

  glassPanel: { position: 'absolute', left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  glassInner: { padding: 14, paddingTop: 12 },

  title: { fontSize: 15, fontWeight: '700', marginBottom: 6, lineHeight: 20 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  domain: { fontSize: 12, fontWeight: '500', flex: 1, minWidth: 0 },
  time: { fontSize: 11 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tagPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '500' },
});
