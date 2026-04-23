import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MapPin,
  Navigation,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Store,
  Crown,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';

import { useLocation } from '@/hooks/useLocation';
import { useNearbyFixers, formatDistance, SortMode } from '@/hooks/useNearbyFixers';
import { FixerCategory } from '@/data/fixers';
import CategoryFilter from '@/components/CategoryFilter';
import FixerCard from '@/components/FixerCard';

const SORT_LABELS: Record<SortMode, string> = {
  nearest: 'Nearest',
  rating: 'Top Rated',
  reviews: 'Most Reviews',
};

export default function FindFixerScreen() {
  const router = useRouter();
  const { location, loading, error, getGPSLocation, geocodeAddress, clearLocation } =
    useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<FixerCategory>('All');
  const [radiusKm, setRadiusKm] = useState(10);
  const [sort, setSort] = useState<SortMode>('nearest');
  const [mapMode, setMapMode] = useState<'leaflet' | 'list'>('leaflet');
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [showSort, setShowSort] = useState(false);

  // Default to a central world location when no user location set
  const userLat = location?.lat ?? 14.5995;
  const userLng = location?.lng ?? 120.9842;

  const fixers = useNearbyFixers(userLat, userLng, radiusKm, category, sort);

  // Build Leaflet map HTML
  const mapHtml = useMemo(() => {
    const markers = fixers
      .map(
        (f) =>
          `L.marker([${f.lat}, ${f.lng}]).addTo(map).bindPopup('<b>${f.name.replace(
            /'/g,
            "\\'"
          )}</b><br>${f.category}');`
      )
      .join('\n');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>body{margin:0;padding:0;}#map{height:100vh;width:100vw;}</style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${userLat}, ${userLng}], ${fixers.length ? 11 : 3});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    ${markers}
    L.circle([${userLat}, ${userLng}], { radius: ${radiusKm * 1000}, color: '#6DBE75', fillColor: '#6DBE75', fillOpacity: 0.08 }).addTo(map);
  </script>
</body>
</html>`;
  }, [fixers, userLat, userLng, radiusKm]);

  const onSearch = () => {
    if (searchQuery.trim()) {
      geocodeAddress(searchQuery.trim());
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Find a Fixer</Text>
          <TouchableOpacity
            style={styles.ctaPill}
            activeOpacity={0.8}
            onPress={() => router.push('/business/apply')}
          >
            <Store size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.ctaPillText}>List Business</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Looking for a fixer?</Text>
            <Text style={styles.heroSub}>
              Find trusted professionals nearby for any home repair, plumbing, electrical, and more.
            </Text>
          </View>
          <Image
            source={require('@/assets/images/fix.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Location Bar */}
        {location ? (
          <View style={styles.locationSet}>
            <View style={styles.locationSetInner}>
              <MapPin size={18} color="#6DBE75" strokeWidth={2} />
              <Text style={styles.locationSetText} numberOfLines={1}>
                {location.address}
              </Text>
            </View>
            <TouchableOpacity onPress={clearLocation}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.locationSearch}>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search city, address, or landmark..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={onSearch}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity style={styles.searchBtn} activeOpacity={0.8} onPress={onSearch}>
                <Search size={18} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <View style={styles.locActions}>
              <TouchableOpacity
                style={styles.gpsBtn}
                activeOpacity={0.8}
                onPress={getGPSLocation}
                disabled={loading}
              >
                <Navigation size={16} color="#6DBE75" strokeWidth={2} />
                <Text style={styles.gpsBtnText}>Use GPS</Text>
              </TouchableOpacity>
            </View>
            {loading && <ActivityIndicator style={{ marginTop: 8 }} color="#6DBE75" />}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        )}

        {location && (
          <View style={styles.mapModeWrap}>
            <Text style={styles.mapModeLabel}>Map Option</Text>
            <View style={styles.mapModeSwitch}>
              <TouchableOpacity
                style={[styles.mapModeBtn, mapMode === 'leaflet' && styles.mapModeBtnActive]}
                activeOpacity={0.8}
                onPress={() => setMapMode('leaflet')}
              >
                <Text style={[styles.mapModeBtnText, mapMode === 'leaflet' && styles.mapModeBtnTextActive]}>
                  Leaflet
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mapModeBtn, mapMode === 'list' && styles.mapModeBtnActive]}
                activeOpacity={0.8}
                onPress={() => setMapMode('list')}
              >
                <Text style={[styles.mapModeBtnText, mapMode === 'list' && styles.mapModeBtnTextActive]}>
                  List Only
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Map Toggle & Map */}
        {location && (
          <>
            <View style={styles.mapToggleWrap}>
              <TouchableOpacity
                style={[styles.mapToggleBtn, showMap && styles.mapToggleBtnActive]}
                activeOpacity={0.8}
                onPress={() => setShowMap(!showMap)}
              >
                <MapPin size={14} color={showMap ? '#FFFFFF' : '#374151'} strokeWidth={2} />
                <Text style={[styles.mapToggleText, showMap && styles.mapToggleTextActive]}>
                  {showMap ? 'Hide Map' : 'Show Map'}
                </Text>
              </TouchableOpacity>
            </View>
            {showMap && mapMode === 'leaflet' && (
              <View style={styles.mapWrap}>
                <WebView
                  originWhitelist={['*']}
                  source={{ html: mapHtml }}
                  style={styles.map}
                  scrollEnabled={false}
                />
              </View>
            )}
            {showMap && mapMode === 'list' && (
              <View style={styles.mapHint}>
                <Text style={styles.mapHintText}>Leaflet map hidden. Switch back anytime from Map Option.</Text>
              </View>
            )}
          </>
        )}

        {/* Category Filter */}
        <CategoryFilter active={category} onSelect={setCategory} />

        {/* Filters & Sort Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={styles.filterBtn}
            activeOpacity={0.8}
            onPress={() => {
              setShowFilters(!showFilters);
              setShowSort(false);
            }}
          >
            <SlidersHorizontal size={16} color="#374151" strokeWidth={2} />
            <Text style={styles.filterBtnText}>Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterBtn}
            activeOpacity={0.8}
            onPress={() => {
              setShowSort(!showSort);
              setShowFilters(false);
            }}
          >
            <ArrowUpDown size={16} color="#374151" strokeWidth={2} />
            <Text style={styles.filterBtnText}>{SORT_LABELS[sort]}</Text>
          </TouchableOpacity>
        </View>

        {/* Radius Slider */}
        {showFilters && (
          <View style={styles.filterPanel}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Radius</Text>
              <Text style={styles.sliderValue}>{radiusKm} km</Text>
            </View>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderMin}>1</Text>
              <View style={{ flex: 1, marginHorizontal: 8 }}>
                {/* Custom slider via Touchable for cross-platform compat */}
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.sliderTrack}
                  onPress={(e) => {
                    const native = e.nativeEvent as any;
                    const pct = Math.max(0, Math.min(1, native.locationX / native.width));
                    const val = Math.round(1 + pct * 49);
                    setRadiusKm(val);
                  }}
                >
                  <View
                    style={[
                      styles.sliderFill,
                      { width: `${((radiusKm - 1) / 49) * 100}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.sliderThumb,
                      { left: `${((radiusKm - 1) / 49) * 100}%` },
                    ]}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.sliderMax}>50</Text>
            </View>
          </View>
        )}

        {/* Sort Options */}
        {showSort && (
          <View style={styles.filterPanel}>
            {(Object.keys(SORT_LABELS) as SortMode[]).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.sortItem, sort === s && styles.sortItemActive]}
                activeOpacity={0.8}
                onPress={() => {
                  setSort(s);
                  setShowSort(false);
                }}
              >
                <Text style={[styles.sortItemText, sort === s && styles.sortItemTextActive]}>
                  {SORT_LABELS[s]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Results */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Nearby Fixers</Text>
          <Text style={styles.resultsCount}>{fixers.length} found</Text>
        </View>

        {fixers.length === 0 ? (
          <View style={styles.empty}>
            <MapPin size={40} color="#D1D5DB" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No fixers nearby</Text>
            <Text style={styles.emptyText}>
              Try increasing the search radius, changing the category filter, or selecting a
              different location.
            </Text>
            <TouchableOpacity
              style={styles.widenBtn}
              activeOpacity={0.8}
              onPress={() => setRadiusKm(Math.min(50, radiusKm + 10))}
            >
              <Text style={styles.widenBtnText}>Widen Search (+10 km)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {fixers.map((f) => (
              <FixerCard key={f.id} fixer={f} />
            ))}
          </View>
        )}

        {/* Highlight CTA */}
        <TouchableOpacity
          style={styles.highlightCard}
          activeOpacity={0.8}
          onPress={() => router.push('/business/apply')}
        >
          <View style={styles.highlightIconWrap}>
            <Crown size={24} color="#F59E0B" fill="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.highlightTitle}>Wanna highlight your business?</Text>
            <Text style={styles.highlightSub}>
              Add a highlight picture and Google Maps link to get featured nearby.
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  scroll: { paddingBottom: 100 },
  heroCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  heroImage: { width: 96, height: 96 },
  heroTextWrap: { flex: 1 },
  heroTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  heroSub: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  mapToggleWrap: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  mapToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mapToggleBtnActive: {
    backgroundColor: '#6DBE75',
    borderColor: '#6DBE75',
  },
  mapToggleText: { fontSize: 12, fontWeight: '700', color: '#374151' },
  mapToggleTextActive: { color: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6DBE75',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  ctaPillText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  locationSearch: { paddingHorizontal: 20, marginBottom: 16 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#6DBE75',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gpsBtnText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 6 },
  locationSet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationSetInner: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  locationSetText: { fontSize: 14, fontWeight: '500', color: '#374151', flex: 1 },
  changeText: { fontSize: 13, fontWeight: '700', color: '#6DBE75' },
  mapModeWrap: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  mapModeLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 6 },
  mapModeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 4,
    gap: 4,
  },
  mapModeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
  },
  mapModeBtnActive: { backgroundColor: '#6DBE75' },
  mapModeBtnText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  mapModeBtnTextActive: { color: '#FFFFFF' },
  mapWrap: {
    marginHorizontal: 20,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#E5E7EB',
  },
  map: { flex: 1 },
  mapHint: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  mapHintText: { fontSize: 12, color: '#6B7280' },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  filterPanel: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sliderLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  sliderValue: { fontSize: 13, fontWeight: '700', color: '#6DBE75' },
  sliderRow: { flexDirection: 'row', alignItems: 'center' },
  sliderMin: { fontSize: 12, color: '#9CA3AF', width: 20, textAlign: 'right' },
  sliderMax: { fontSize: 12, color: '#9CA3AF', width: 20 },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6DBE75',
  },
  sliderThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#6DBE75',
    marginLeft: -9,
    top: -6,
  },
  sortItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  sortItemActive: { backgroundColor: '#F0FDF4', borderRadius: 8, paddingHorizontal: 10, marginBottom: 4 },
  sortItemText: { fontSize: 14, color: '#374151' },
  sortItemTextActive: { fontWeight: '700', color: '#15803D' },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  resultsTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  resultsCount: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  list: { paddingHorizontal: 20 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginTop: 6 },
  widenBtn: {
    marginTop: 16,
    backgroundColor: '#6DBE75',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  widenBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#FFF8E1',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  highlightIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  highlightSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});
