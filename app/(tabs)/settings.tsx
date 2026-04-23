import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  HelpCircle,
  FileText,
  Shield,
  Code,
  Globe,
  Moon,
  Star,
  ChevronRight,
  ExternalLink,
} from 'lucide-react-native';

const BASE_URL = 'https://kumpuni.netlify.app';

const LINKS = [
  { id: '1', label: 'Help & Support', icon: HelpCircle },
  { id: '2', label: 'Legal', icon: FileText, url: `${BASE_URL}/terms` },
  { id: '3', label: 'Privacy', icon: Shield, url: `${BASE_URL}/privacy` },
];

const DEVELOPERS = [
  {
    id: '1',
    name: 'Adlei Jed Tan',
    githubLabel: 'github: ajt28-dev',
    githubUrl: 'https://github.com/ajt28-dev',
  },
  {
    id: '2',
    name: 'Richmond C. Constante',
    githubLabel: 'github: rcconstante.dev',
  },
];

function openWebView(label: string, url?: string) {
  if (!url) return;
  router.push(`/webview?url=${encodeURIComponent(url)}&title=${encodeURIComponent(label)}` as any);
}

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Settings</Text>

        {/* Links */}
        <View style={styles.menu}>
          {LINKS.map((m) => {
            const Icon = m.icon;
            return (
              <TouchableOpacity
                key={m.id}
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => openWebView(m.label, m.url)}
              >
                <Icon size={20} color="#1F2937" strokeWidth={2} />
                <Text style={styles.menuLabel}>{m.label}</Text>
                <ChevronRight size={18} color="#9CA3AF" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.menu}>
          <View style={styles.menuItem}>
            <Globe size={20} color="#1F2937" strokeWidth={2} />
            <Text style={styles.menuLabel}>Language</Text>
            <Text style={styles.menuValue}>English</Text>
          </View>
          <View style={styles.menuItem}>
            <Moon size={20} color="#1F2937" strokeWidth={2} />
            <Text style={styles.menuLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              thumbColor={darkMode ? '#6DBE75' : '#f4f3f4'}
              trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
            />
          </View>
        </View>

        {/* Rate */}
        <TouchableOpacity style={styles.rateBtn} activeOpacity={0.8}>
          <Star size={20} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
          <Text style={styles.rateText}>Rate 5 Stars</Text>
        </TouchableOpacity>

        {/* Developer */}
        <View style={styles.devList}>
          {DEVELOPERS.map((dev) => (
            <View key={dev.id} style={styles.devCard}>
              <Code size={20} color="#6DBE75" strokeWidth={2} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.devName}>{dev.name}</Text>
                <TouchableOpacity activeOpacity={0.7} onPress={() => openWebView(dev.name, dev.githubUrl)}>
                  <Text style={styles.devLink}>{dev.githubLabel}</Text>
                </TouchableOpacity>
              </View>
              <ExternalLink size={16} color="#9CA3AF" />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#1F2937', marginBottom: 24 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', marginTop: 24, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  menu: { width: '100%', gap: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#374151' },
  menuValue: { fontSize: 13, fontWeight: '500', color: '#9CA3AF' },
  rateBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'center', marginTop: 30, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  rateText: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  devList: { marginTop: 24, gap: 10 },
  devCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  devName: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  devLink: { fontSize: 12, color: '#6DBE75', marginTop: 2 },
});
