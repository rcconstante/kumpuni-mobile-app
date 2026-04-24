// Reusable view-mode toggle row used in Home / Collection-detail / Tag-detail.
// 4 modes: preview, grid, glass, list — active button has filled dark background.
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LayoutGrid, Layers, List as ListIcon, Rows3 } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import type { ViewMode } from '@/services/settings';

export const VIEW_MODES: { id: ViewMode; Icon: typeof LayoutGrid; label: string }[] = [
  { id: 'preview', Icon: Rows3, label: 'Link Preview' },
  { id: 'grid', Icon: LayoutGrid, label: 'Visual Grid' },
  { id: 'glass', Icon: Layers, label: 'Vertical Glass' },
  { id: 'list', Icon: ListIcon, label: 'Compact List' },
];

interface Props {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
}

export function ViewModeBar({ value, onChange }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {VIEW_MODES.map(({ id, Icon }) => {
        const active = id === value;
        return (
          <TouchableOpacity
            key={id}
            onPress={() => onChange(id)}
            activeOpacity={0.85}
            style={[
              styles.btn,
              { backgroundColor: active ? colors.iconButtonActiveBg : colors.bgElev },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${VIEW_MODES.find((v) => v.id === id)?.label} view`}
          >
            <Icon size={16} color={active ? colors.textInverse : colors.textFaint} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  btn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
