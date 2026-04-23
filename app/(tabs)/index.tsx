import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, ChevronRight, Home, Wrench, Car, Cpu, FileText } from 'lucide-react-native';
import { router } from 'expo-router';
import { GUIDE_CATEGORIES } from '@/data/guides';

const ICON_MAP: Record<string, typeof Home> = {
  home: Home,
  appliances: Wrench,
  car: Car,
  electronics: Cpu,
};

export default function HomeScreen() {
  const featured = GUIDE_CATEGORIES.slice(0, 4);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandWrap}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="cover"
            />
            <View>
              <Text style={styles.appName}>Kumpuni</Text>
              <Text style={styles.tagline}>The DIY Home Maintenance Guide</Text>
              <Text style={styles.dateText}>April 23, 2026</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
            <Bell size={20} color="#1F2937" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={require('@/assets/images/greetings.png')}
            style={{ width: 120, height: 120, marginLeft: -10, marginBottom: -16 }}
            resizeMode="contain"
          />
          <View style={styles.heroText}>
            <Text style={styles.heroGreeting}>Hi there!</Text>
            <Text style={styles.heroSub}>Welcome back! Your home is in great shape. Let's keep it that way.</Text>
          </View>
        </View>

        {/* Guides */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/guides' as any)}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.guidesGrid}>
          {featured.map((cat) => {
            const Icon = ICON_MAP[cat.id] || Home;
            const count = cat.subCategories.reduce((s, sub) => s + sub.items.length, 0);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.guideCard, { backgroundColor: cat.color }]}
                activeOpacity={0.8}
                onPress={() => router.push(`/guides/${cat.id}` as any)}
              >
                <View style={styles.guideTop}>
                  <View style={styles.iconWrap}>
                    <Icon size={24} color="#1F2937" strokeWidth={1.8} />
                  </View>
                </View>
                <Text style={styles.guideTitle}>{cat.title}</Text>
                <Text style={styles.guideSub}>{count} guides</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quarterly Tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconWrap}>
            <FileText size={20} color="#6DBE75" strokeWidth={2} />
          </View>
          <View style={styles.tipText}>
            <Text style={styles.tipTitle}>Quarterly Tip</Text>
            <Text style={styles.tipBody}>Check your AC filter every 3 months for optimal performance.</Text>
          </View>
          <ChevronRight size={18} color="#9CA3AF" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8, marginBottom: 24 },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 48, height: 48, borderRadius: 16 },
  appName: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  tagline: { fontSize: 12, fontWeight: '500', color: '#9CA3AF', marginTop: 2 },
  bellBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9F0', borderRadius: 24, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  dateText: { fontSize: 11, fontWeight: '500', color: '#9CA3AF', marginTop: 2 },
  heroText: { flex: 1 },
  heroGreeting: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  heroSub: { fontSize: 13, lineHeight: 20, color: '#6B7280' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  viewAll: { fontSize: 13, fontWeight: '600', color: '#6DBE75' },
  guidesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  guideCard: { width: '47%', borderRadius: 20, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  guideTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  guideTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  guideSub: { fontSize: 11, color: '#6B7280', lineHeight: 16 },
  tipCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  tipIconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  tipText: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  tipBody: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
});
