import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';

export default function PostJobScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Post a Job</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Describe the issue</Text>
        <View style={styles.textArea}>
          <Text style={styles.placeholder}>e.g. Kitchen faucet is leaking from the base...</Text>
        </View>

        <TouchableOpacity style={styles.photoBtn} activeOpacity={0.7}>
          <Camera size={20} color="#6DBE75" strokeWidth={2} />
          <Text style={styles.photoText}>Add Photos</Text>
        </TouchableOpacity>

        <View style={styles.locationRow}>
          <MapPin size={18} color="#6B7280" strokeWidth={2} />
          <Text style={styles.locationText}>Nairobi, Kenya</Text>
        </View>

        <TouchableOpacity style={styles.submitBtn} activeOpacity={0.85}>
          <Text style={styles.submitText}>Post Job</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 8, marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  title: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  card: { marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 },
  textArea: { backgroundColor: '#F7F7F5', borderRadius: 16, padding: 14, minHeight: 120, marginBottom: 14 },
  placeholder: { fontSize: 14, color: '#9CA3AF' },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: '#E8F5E9', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 14 },
  photoText: { fontSize: 13, fontWeight: '600', color: '#6DBE75' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  locationText: { fontSize: 13, color: '#6B7280' },
  submitBtn: { backgroundColor: '#6DBE75', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  submitText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
