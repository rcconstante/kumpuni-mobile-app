import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { FIXER_CATEGORIES, FixerCategory } from '@/data/fixers';

interface CategoryFilterProps {
  active: FixerCategory;
  onSelect: (c: FixerCategory) => void;
}

export default function CategoryFilter({ active, onSelect }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FIXER_CATEGORIES.map((cat) => {
        const isActive = active === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, isActive && styles.chipActive]}
            activeOpacity={0.8}
            onPress={() => onSelect(cat as FixerCategory)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{cat}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#6DBE75',
    borderColor: '#6DBE75',
  },
  label: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  labelActive: { color: '#FFFFFF', fontWeight: '700' },
});
