import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ArrowLeft, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { GUIDE_CATEGORIES } from '@/data/guides';

interface FlatGuide {
  id: string;
  title: string;
  categoryTitle: string;
  categoryId: string;
  subCategoryTitle: string;
  color: string;
}

function getAllGuides(): FlatGuide[] {
  const list: FlatGuide[] = [];
  for (const cat of GUIDE_CATEGORIES) {
    for (const sub of cat.subCategories) {
      for (const item of sub.items) {
        list.push({
          id: item.id,
          title: item.title,
          categoryTitle: cat.title,
          categoryId: cat.id,
          subCategoryTitle: sub.title,
          color: cat.color,
        });
      }
    }
  }
  return list;
}

export default function GuidesScreen() {
  const [query, setQuery] = useState('');
  const allGuides = useMemo(() => getAllGuides(), []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allGuides;
    return allGuides.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.categoryTitle.toLowerCase().includes(q) ||
        g.subCategoryTitle.toLowerCase().includes(q)
    );
  }, [allGuides, query]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>All Guides</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchWrap}>
        <Search size={18} color="#9CA3AF" strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search guides..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {filtered.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push(`/guide/${g.id}` as any)}
          >
            <View style={[styles.dot, { backgroundColor: g.color }]} />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{g.title}</Text>
              <Text style={styles.cardSub}>{g.categoryTitle} — {g.subCategoryTitle}</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

        {filtered.length === 0 && (
          <Text style={styles.empty}>No guides found.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 2,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 14,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  cardSub: { fontSize: 12, color: '#9CA3AF' },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    color: '#9CA3AF',
  },
});
