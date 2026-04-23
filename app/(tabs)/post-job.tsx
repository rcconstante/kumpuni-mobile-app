import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, MapPin, X, SwitchCamera } from 'lucide-react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function PostJobScreen() {
  const [showCamera, setShowCamera] = useState(true);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          router.back();
        }
      }
    })();
  }, [permission]);

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setShowCamera(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo?.uri) {
        setPhotoUri(photo.uri);
        setShowCamera(false);
        router.push({ pathname: '/ai-assistant', params: { photo: photo.uri } });
      }
    }
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <SafeAreaView style={styles.cameraOverlay} edges={['top']}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity onPress={() => setShowCamera(false)} activeOpacity={0.7}>
                <X size={28} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFacing(facing === 'back' ? 'front' : 'back')} activeOpacity={0.7}>
                <SwitchCamera size={28} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.shutterBtn} onPress={takePicture} activeOpacity={0.8} />
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    );
  }

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

        {photoUri && (
          <View style={styles.photoPreview}>
            <Image source={{ uri: photoUri }} style={styles.previewImg} />
            <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setPhotoUri(null)} activeOpacity={0.7}>
              <X size={16} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.photoBtn} activeOpacity={0.7} onPress={handleOpenCamera}>
          <Camera size={20} color="#6DBE75" strokeWidth={2} />
          <Text style={styles.photoText}>{photoUri ? 'Retake Photo' : 'Add Photos'}</Text>
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
  photoPreview: { position: 'relative', marginBottom: 14 },
  previewImg: { width: '100%', height: 180, borderRadius: 16 },
  removePhotoBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: '#E8F5E9', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 14 },
  photoText: { fontSize: 13, fontWeight: '600', color: '#6DBE75' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  locationText: { fontSize: 13, color: '#6B7280' },
  submitBtn: { backgroundColor: '#6DBE75', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  submitText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, backgroundColor: 'transparent' },
  cameraHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  cameraControls: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40 },
  shutterBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#FFFFFF', backgroundColor: 'transparent' },
});
