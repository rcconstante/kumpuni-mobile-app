import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Star, MapPin, ChevronRight, Crown } from 'lucide-react-native';
import { FixerBusiness } from '@/data/fixers';
import { formatDistance } from '@/hooks/useNearbyFixers';
import { useRouter } from 'expo-router';

interface FixerCardProps {
  fixer: FixerBusiness & { _distance?: number };
}

export default function FixerCard({ fixer }: FixerCardProps) {
  const router = useRouter();
  const distance = (fixer as any)._distance ?? 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push(`/fixer/${fixer.id}` as any)}
    >
      {fixer.logoUrl ? (
        <Image source={{ uri: fixer.logoUrl }} style={styles.photo} resizeMode="contain" />
      ) : fixer.images?.[0] ? (
        <Image source={{ uri: fixer.images[0] }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={[styles.avatar, { backgroundColor: stringToColor(fixer.category) }]}>
          <Text style={styles.avatarText}>{fixer.name[0]}</Text>
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {fixer.name}
          </Text>
          {fixer.isPremium && <Crown size={14} color="#F59E0B" fill="#F59E0B" />}
        </View>

        <View style={styles.metaRow}>
          <View
            style={[styles.badge, { backgroundColor: `${stringToColor(fixer.category)}22` }]}
          >
            <Text style={[styles.badgeText, { color: stringToColor(fixer.category) }]}>
              {fixer.category}
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Star size={12} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
            <Text style={styles.rating}>{fixer.rating}</Text>
            <Text style={styles.reviews}>({fixer.reviews})</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={12} color="#6B7280" />
          <Text style={styles.address} numberOfLines={1}>
            {formatDistance(distance)} - {fixer.city}, {fixer.country}
          </Text>
        </View>
      </View>

      <ChevronRight size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

function stringToColor(str: string): string {
  const colors: Record<string, string> = {
    Home: '#E3F2FD',
    Plumbing: '#E8F5E9',
    Electronics: '#FFF3E0',
    Car: '#F3E5F5',
    Appliances: '#E0F2F1',
    HVAC: '#FFF8E1',
  };
  return colors[str] ?? '#F3F4F6';
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  photo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  info: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 15, fontWeight: '700', color: '#1F2937', flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 12, fontWeight: '700', color: '#1F2937' },
  reviews: { fontSize: 11, color: '#9CA3AF' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  address: { fontSize: 12, color: '#6B7280', flex: 1 },
});
