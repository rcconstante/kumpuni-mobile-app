import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, MapPin, Phone, Mail, Globe, Clock, Crown } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FixerBusiness, getFixerById } from '@/data/fixers';
import { safeHttpUrl, safeImageUrl } from '@/lib/safeUrl';

export default function FixerDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const fixerId = Array.isArray(id) ? id[0] : id ?? '';
  const [fixer, setFixer] = useState<FixerBusiness | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFixerById(fixerId).then((data) => {
      if (!cancelled) {
        setFixer(data ?? null);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fixerId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
            <ArrowLeft size={22} color="#1F2937" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fixer</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color="#6DBE75" />
        </View>
      </SafeAreaView>
    );
  }

  if (!fixer) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
            <ArrowLeft size={22} color="#1F2937" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fixer</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.empty}>Fixer not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {fixer.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          {(() => {
            const safeLogo = safeImageUrl(fixer.logoUrl);
            const safeFirstImage = safeImageUrl(fixer.images?.[0]);
            if (safeLogo) return <Image source={{ uri: safeLogo }} style={styles.heroImage} resizeMode="contain" />;
            if (safeFirstImage) return <Image source={{ uri: safeFirstImage }} style={styles.heroImage} resizeMode="cover" />;
            return (
              <View style={[styles.heroAvatar, { backgroundColor: stringToColor(fixer.category) }]}>
                <Text style={styles.heroAvatarText}>{fixer.name[0]}</Text>
              </View>
            );
          })()}
          <View style={styles.heroInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.heroName}>{fixer.name}</Text>
              {fixer.isPremium && <Crown size={18} color="#F59E0B" fill="#F59E0B" />}
            </View>
            <View style={[styles.badge, { backgroundColor: stringToColor(fixer.category) + '33' }]}>
              <Text style={[styles.badgeText, { color: darken(stringToColor(fixer.category)) }]}>
                {fixer.category}
              </Text>
            </View>
            <View style={styles.ratingRow}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
              <Text style={styles.rating}>{fixer.rating}</Text>
              <Text style={styles.reviews}>({fixer.reviews} reviews)</Text>
            </View>
          </View>
        </View>

        {/* Business Images */}
        {fixer.images && fixer.images.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {fixer.images.map((img, idx) => {
                const safe = safeImageUrl(img);
                if (!safe) return null;
                return <Image key={idx} source={{ uri: safe }} style={styles.bizImage} resizeMode="cover" />;
              })}
            </ScrollView>
          </>
        )}

        {/* Description */}
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{fixer.description}</Text>

        {/* Services */}
        {fixer.services && fixer.services.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.servicesWrap}>
              {fixer.services.map((s) => (
                <View key={s} style={styles.serviceChip}>
                  <Text style={styles.serviceText}>{s}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Info */}
        <Text style={styles.sectionTitle}>Business Info</Text>
        <View style={styles.infoCard}>
          <InfoRow icon={MapPin} label="Address" value={`${fixer.address}, ${fixer.city}, ${fixer.country}`} />
          {fixer.hours && <InfoRow icon={Clock} label="Hours" value={fixer.hours} />}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <ActionBtn
            icon={Phone}
            label="Call"
            onPress={() => {
              const phone = (fixer.phone || '').replace(/[^+\d]/g, '').slice(0, 20);
              if (phone) Linking.openURL(`tel:${phone}`);
            }}
          />
          <ActionBtn
            icon={Mail}
            label="Email"
            onPress={() => {
              const email = (fixer.email || '').trim();
              if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) Linking.openURL(`mailto:${email}`);
            }}
          />
          <ActionBtn
            icon={Globe}
            label="Open in Maps"
            onPress={() => {
              const safe = safeHttpUrl(fixer.googleMapsUrl);
              if (safe) Linking.openURL(safe);
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Icon size={18} color="#6B7280" strokeWidth={2} />
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onPress,
}: {
  icon: typeof Phone;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={onPress}>
      <Icon size={20} color="#FFFFFF" strokeWidth={2} />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function stringToColor(str: string): string {
  const map: Record<string, string> = {
    Home: '#E3F2FD',
    Plumbing: '#E8F5E9',
    Electronics: '#FFF3E0',
    Car: '#F3E5F5',
    Appliances: '#E0F2F1',
    HVAC: '#FFF8E1',
  };
  return map[str] ?? '#F3F4F6';
}

function darken(hex: string): string {
  const map: Record<string, string> = {
    '#E3F2FD': '#1565C0',
    '#E8F5E9': '#2E7D32',
    '#FFF3E0': '#E65100',
    '#F3E5F5': '#6A1B9A',
    '#E0F2F1': '#00695C',
    '#FFF8E1': '#F57F17',
  };
  return map[hex] ?? '#374151';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  empty: { fontSize: 16, color: '#9CA3AF', textAlign: 'center', marginTop: 40 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  hero: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 20 },
  heroAvatar: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  heroImage: {
    width: 72,
    height: 72,
    borderRadius: 22,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  heroAvatarText: { fontSize: 28, fontWeight: '800', color: '#1F2937' },
  heroInfo: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroName: { fontSize: 20, fontWeight: '800', color: '#1F2937', flex: 1 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  reviews: { fontSize: 13, color: '#6B7280' },
  imageScroll: { marginBottom: 10, marginLeft: -4 },
  bizImage: {
    width: 160,
    height: 120,
    borderRadius: 14,
    marginRight: 10,
    backgroundColor: '#E5E7EB',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginTop: 20, marginBottom: 10 },
  description: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
  servicesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceChip: { backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  serviceText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  actionBtn: { flex: 1, backgroundColor: '#6DBE75', borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 4 },
  actionLabel: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
});
