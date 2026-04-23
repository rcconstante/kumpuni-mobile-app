import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Navigation, Star, ChevronRight, ShieldCheck } from 'lucide-react-native';

const FIXERS = [
  { id: '1', name: 'James Plumbing', spec: 'Plumbing Specialist', rating: 4.8, reviews: 120, bg: '#E8F5E9' },
  { id: '2', name: 'CozyCool HVAC', spec: 'AC & Heating Expert', rating: 4.7, reviews: 98, bg: '#E3F2FD' },
  { id: '3', name: 'FixIt Electric', spec: 'Electrical Technician', rating: 4.9, reviews: 76, bg: '#FFF3E0' },
];

export default function FindFixerScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Find a Trusted Fixer</Text>
          <TouchableOpacity style={styles.shieldBtn} activeOpacity={0.7}>
            <ShieldCheck size={20} color="#1F2937" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>We'll help you find reliable pros near you.</Text>

        <View style={styles.heroCard}>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Need help with{'\n'}a bigger fix?</Text>
            <Text style={styles.heroSub}>Let a trusted professional take care of it.</Text>
            <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.8}>
              <Text style={styles.ctaText}>Post a Job</Text>
              <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          <Image
            source={require('@/assets/images/fix.png')}
            style={{ width: 130, height: 130, marginRight: -10, marginBottom: -16 }}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.sectionTitle}>Your Location</Text>
        <View style={styles.locationRow}>
          <View style={styles.locationInput}>
            <MapPin size={18} color="#6B7280" strokeWidth={2} />
            <Text style={styles.locationText}>Nairobi, Kenya</Text>
          </View>
          <TouchableOpacity style={styles.gpsBtn} activeOpacity={0.7}>
            <Navigation size={18} color="#6DBE75" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Nearby Fixers</Text>
        <View style={styles.fixersList}>
          {FIXERS.map((f) => (
            <View key={f.id} style={styles.fixerCard}>
              <View style={[styles.avatarWrap, { backgroundColor: f.bg }]}>
                <Text style={styles.avatarText}>{f.name[0]}</Text>
              </View>
              <View style={styles.fixerInfo}>
                <Text style={styles.fixerName}>{f.name}</Text>
                <Text style={styles.fixerSpec}>{f.spec}</Text>
                <View style={styles.ratingRow}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
                  <Text style={styles.ratingText}>{f.rating}</Text>
                  <Text style={styles.reviewText}>({f.reviews} reviews)</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.viewBtn} activeOpacity={0.8}>
                <Text style={styles.viewBtnText}>View</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#1F2937', flex: 1 },
  shieldBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  subtitle: { fontSize: 13, color: '#9CA3AF', marginBottom: 20 },
  heroCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4E8', borderRadius: 24, padding: 18, marginBottom: 24 },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginBottom: 6 },
  heroSub: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 14 },
  ctaBtn: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 6, backgroundColor: '#6DBE75', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14 },
  ctaText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12, marginTop: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  locationInput: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  locationText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  gpsBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  fixersList: { gap: 12 },
  fixerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  avatarWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  fixerInfo: { flex: 1 },
  fixerName: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  fixerSpec: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
  reviewText: { fontSize: 12, color: '#9CA3AF' },
  viewBtn: { backgroundColor: '#6DBE75', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 14 },
  viewBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
});
