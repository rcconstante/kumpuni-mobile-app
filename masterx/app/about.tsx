import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Github, Globe, User, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/context/I18nContext';

function WebModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={[wm.container, { backgroundColor: colors.surface, paddingTop: insets.top || (Platform.OS === 'android' ? 24 : 0) }]}>
        <View style={[wm.header, { borderBottomColor: colors.divider }]}>
          <TouchableOpacity onPress={onClose} style={wm.closeBtn}>
            <X size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[wm.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
          <View style={{ width: 36 }} />
        </View>
        <WebView
          source={{ uri: url }}
          style={{ flex: 1 }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
        {loading && (
          <View style={[wm.loader, { backgroundColor: colors.scrim }]}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        )}
      </View>
    </Modal>
  );
}

const wm = StyleSheet.create({
  container: { flex: 1 },
  header:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  closeBtn:  { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title:     { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600' },
  loader:    { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});

export default function AboutScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();
  const [webModal, setWebModal] = useState<{ url: string; title: string } | null>(null);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>About</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.mascotWrap}>
          <View style={[styles.mascotCircle, { backgroundColor: colors.accentSoft }]}>
            <Image source={require('../assets/images/icon.png')} style={styles.mascot} resizeMode="contain" />
          </View>
        </View>

        <Text style={[styles.appName, { color: colors.text }]}>Savit</Text>
        <Text style={[styles.appTagline, { color: colors.textMuted }]}>{t.aboutTagline}</Text>

        <View style={[styles.versionBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.versionText, { color: colors.textMuted }]}>{t.aboutVersion} 1.0.0</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}>
              <User size={18} color={colors.accent} />
            </View>
            <View style={styles.rowBody}><Text style={[styles.rowLabel, { color: colors.text }]}>{t.aboutDeveloper}</Text></View>
            <View style={styles.rowRight}><Text style={[styles.rowValue, { color: colors.textFaint }]}>Richmond Constante</Text></View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => setWebModal({ url: 'https://github.com/rcconstante', title: 'GitHub — rcconstante' })}>
            <View style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}><Github size={18} color={colors.accent} /></View>
            <View style={styles.rowBody}><Text style={[styles.rowLabel, { color: colors.text }]}>GitHub</Text></View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: colors.textFaint }]}>rcconstante</Text>
              <ChevronRight size={16} color={colors.textFaint} />
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => setWebModal({ url: 'https://rcconstante.dev', title: 'rcconstante.dev' })}>
            <View style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}><Globe size={18} color={colors.accent} /></View>
            <View style={styles.rowBody}><Text style={[styles.rowLabel, { color: colors.text }]}>Website</Text></View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: colors.textFaint }]}>rcconstante.dev</Text>
              <ChevronRight size={16} color={colors.textFaint} />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.copyright, { color: colors.textFaint }]}>{t.aboutCopyright}</Text>
      </ScrollView>

      {webModal && <WebModal url={webModal.url} title={webModal.title} onClose={() => setWebModal(null)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 4 },
  backBtn:      { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontSize: 17, fontWeight: '600' },
  content:      { alignItems: 'center', paddingTop: 24, paddingHorizontal: 16, paddingBottom: 48 },
  mascotWrap:   { marginBottom: 20 },
  mascotCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  mascot:       { width: 96, height: 96 },
  appName:      { fontSize: 28, fontWeight: '700', marginBottom: 6 },
  appTagline:   { fontSize: 15, marginBottom: 18, textAlign: 'center' },
  versionBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 36, borderWidth: 1 },
  versionText:  { fontSize: 14, fontWeight: '500' },
  section:      { borderRadius: 14, overflow: 'hidden', width: '100%' },
  row:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, minHeight: 54 },
  rowIcon:      { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowBody:      { flex: 1 },
  rowLabel:     { fontSize: 15, fontWeight: '500' },
  rowRight:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue:     { fontSize: 14 },
  divider:      { height: 1, marginLeft: 60 },
  copyright:    { marginTop: 32, fontSize: 13, textAlign: 'center' },
});
