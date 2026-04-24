import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/context/I18nContext';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Text style={[styles.text, { color: colors.text }]}>{t.notFoundText}</Text>
        <Link href="/" style={[styles.link, { backgroundColor: colors.accent }]}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>{t.notFoundGo}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  text:      { fontSize: 20, textAlign: 'center', fontWeight: '600' },
  link:      { marginTop: 15, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, textAlign: 'center' },
});
