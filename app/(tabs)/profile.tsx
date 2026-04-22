import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, HelpCircle, ChevronRight } from 'lucide-react-native';

const MENU = [
  { id: '1', label: 'Account Settings', icon: Settings },
  { id: '2', label: 'Help & Support', icon: HelpCircle },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.avatarWrap}>
          <User size={48} color="#6DBE75" strokeWidth={1.5} />
        </View>
        <Text style={styles.name}>Home Owner</Text>
        <Text style={styles.email}>home@kumpuni.app</Text>

        <View style={styles.menu}>
          {MENU.map((m) => {
            const Icon = m.icon;
            return (
              <TouchableOpacity key={m.id} style={styles.menuItem} activeOpacity={0.7}>
                <Icon size={20} color="#1F2937" strokeWidth={2} />
                <Text style={styles.menuLabel}>{m.label}</Text>
                <ChevronRight size={18} color="#9CA3AF" />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100, alignItems: 'center', paddingTop: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#1F2937', alignSelf: 'flex-start', marginBottom: 24 },
  avatarWrap: { width: 100, height: 100, borderRadius: 32, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  name: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  email: { fontSize: 13, color: '#9CA3AF', marginTop: 2, marginBottom: 30 },
  menu: { width: '100%', gap: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#374151' },
});
