import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, QrCode, CheckCircle2, Upload } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  BusinessCategory,
  FIXER_CATEGORIES,
  submitBusinessApplication,
} from '@/data/fixers';

const STEPS = ['Details', 'Payment', 'Done'] as const;

export default function ApplyBusinessScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('Home');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);
  const [highlightImage, setHighlightImage] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Payment state
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [processing, setProcessing] = useState(false);

  const canNext = () => {
    if (step === 0) return name && address && city && country && phone && email && googleMapsUrl.trim();
    if (step === 1) return !!paymentProof;
    return true;
  };

  const pickBusinessImage = async (kind: 'logo' | 'highlight' | 'proof') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        'Please allow photo library access to upload your image.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      // Hard size cap (~5 MB after base64 ≈ 6.7 MB string). Reject early.
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert('Image too large', 'Please choose an image under 5 MB.');
        return;
      }
      const imageSource =
        asset.base64 && asset.mimeType
          ? `data:${asset.mimeType};base64,${asset.base64}`
          : asset.uri;

      if (kind === 'logo') setBusinessLogo(imageSource);
      else if (kind === 'highlight') setHighlightImage(imageSource);
      else setPaymentProof(imageSource);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!paymentProof) {
        Alert.alert('Payment proof required', 'Please upload a screenshot of your payment.');
        return;
      }
      setProcessing(true);
      submitBusinessApplication({
        name,
        category,
        address,
        city,
        country,
        phone,
        email,
        description,
        logoUrl: businessLogo || undefined,
        imageUrl: highlightImage || undefined,
        googleMapsUrl,
        paymentProof,
        paymentReference,
      })
        .then(() => {
          setProcessing(false);
          setStep(2);
        })
        .catch((err) => {
          setProcessing(false);
          Alert.alert(
            'Submission failed',
            err?.message ?? 'Could not submit your application. Please try again.'
          );
        });
    } else {
      setStep(step + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Highlight Your Business</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.progressItem}>
            <View
              style={[
                styles.progressDot,
                i <= step && styles.progressDotActive,
                i === 2 && step === 2 && styles.progressDotDone,
              ]}
            >
              {i === 2 && step === 2 ? (
                <CheckCircle2 size={14} color="#FFFFFF" />
              ) : (
                <Text style={[styles.progressNum, i <= step && styles.progressNumActive]}>
                  {i + 1}
                </Text>
              )}
            </View>
            <Text style={[styles.progressLabel, i <= step && styles.progressLabelActive]}>
              {s}
            </Text>
          </View>
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {step === 0 && (
            <>
              <Text style={styles.label}>Business Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Manila Pipe Masters"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={styles.select}
                activeOpacity={0.8}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Text style={styles.selectText}>{category}</Text>
                <ChevronDown size={18} color="#6B7280" />
              </TouchableOpacity>
              {showCategoryPicker && (
                <View style={styles.picker}>
                  {FIXER_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={styles.pickerItem}
                      onPress={() => {
                        setCategory(c as BusinessCategory);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text style={styles.pickerItemText}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Full business address"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor="#9CA3AF"
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    value={city}
                    onChangeText={setCity}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={{ width: 16 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Country</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Country"
                    value={country}
                    onChangeText={setCountry}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <Text style={styles.label}>Contact Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+63 912 345 6789"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="business@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Google Maps Link</Text>
              <TextInput
                style={styles.input}
                placeholder="Paste your Google Maps share link"
                value={googleMapsUrl}
                onChangeText={setGoogleMapsUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.helperText}>
                Use the Google Maps share link for your business location so customers can open it directly.
              </Text>

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="What services do you offer?"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Business Logo (optional)</Text>
              <TouchableOpacity
                style={styles.uploadBtn}
                activeOpacity={0.8}
                onPress={() => pickBusinessImage('logo')}
              >
                <Text style={styles.uploadBtnText}>
                  {businessLogo ? 'Change Business Logo' : 'Upload Business Logo'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>
                This logo is used for your business branding in cards and admin views.
              </Text>
              {businessLogo && (
                <Image
                  source={{ uri: businessLogo }}
                  style={styles.logoPreview}
                  resizeMode="contain"
                />
              )}

              <Text style={styles.label}>Highlight Picture</Text>
              <TouchableOpacity
                style={styles.uploadBtn}
                activeOpacity={0.8}
                onPress={() => pickBusinessImage('highlight')}
              >
                <Text style={styles.uploadBtnText}>
                  {highlightImage ? 'Change Highlight Picture' : 'Upload Highlight Picture'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>
                This picture will be shown when your highlighted business appears in fixer listings.
              </Text>
              {highlightImage && (
                <Image
                  source={{ uri: highlightImage }}
                  style={styles.uploadPreview}
                  resizeMode="cover"
                />
              )}
            </>
          )}

          {step === 1 && (
            <>
              <View style={styles.paymentHeader}>
                <QrCode size={32} color="#6DBE75" />
                <Text style={styles.paymentTitle}>Scan to Pay</Text>
                <Text style={styles.paymentSub}>
                  Use your bank or e-wallet app to scan the QR code below, then upload
                  the screenshot of your payment confirmation.
                </Text>
              </View>

              <View style={styles.qrCard}>
                <Image
                  source={require('@/assets/images/qr.png')}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
                <Text style={styles.qrCaption}>Kumpuni Business Listing • ₱999</Text>
              </View>

              <Text style={styles.label}>Reference Number / Sender Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. GCash ref 1234567890"
                value={paymentReference}
                onChangeText={(t) => setPaymentReference(t.slice(0, 120))}
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.helperText}>
                Helps us match your payment if the screenshot is unclear.
              </Text>

              <Text style={styles.label}>Payment Proof Screenshot *</Text>
              <TouchableOpacity
                style={styles.uploadBtn}
                activeOpacity={0.8}
                onPress={() => pickBusinessImage('proof')}
              >
                <Upload size={16} color="#374151" />
                <Text style={styles.uploadBtnText}>
                  {paymentProof ? 'Change Payment Screenshot' : 'Upload Payment Screenshot'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>
                Upload a clear screenshot showing the amount, date and reference number.
                Max 5 MB. Stored privately and only visible to Kumpuni admins.
              </Text>
              {paymentProof && (
                <Image
                  source={{ uri: paymentProof }}
                  style={styles.uploadPreview}
                  resizeMode="cover"
                />
              )}

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Plan Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Business Listing</Text>
                  <Text style={styles.summaryValue}>₱999 / month</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Highlight Badge</Text>
                  <Text style={styles.summaryValue}>Included</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.summaryLabelTotal}>Total</Text>
                  <Text style={styles.summaryValueTotal}>₱999</Text>
                </View>
              </View>
            </>
          )}

          {step === 2 && (
            <View style={styles.success}>
              <View style={styles.successCircle}>
                <CheckCircle2 size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Application Submitted!</Text>
              <Text style={styles.successText}>
                Your business is pending manual verification. We will review your details and
                contact you via email within 2-3 business days.
              </Text>
              <TouchableOpacity
                style={styles.doneBtn}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/find-fixer')}
              >
                <Text style={styles.doneBtnText}>Back to Find Fixer</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {step < 2 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, (!canNext() || processing) && styles.nextBtnDisabled]}
            activeOpacity={0.8}
            disabled={!canNext() || processing}
            onPress={handleNext}
          >
            <Text style={styles.nextBtnText}>
              {processing ? 'Processing...' : step === 1 ? 'Submit Application' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
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
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressItem: { alignItems: 'center', gap: 6 },
  progressDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  progressDotActive: { backgroundColor: '#6DBE75' },
  progressDotDone: { backgroundColor: '#10B981' },
  progressNum: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  progressNumActive: { color: '#FFFFFF' },
  progressLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  progressLabelActive: { color: '#1F2937' },
  scroll: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helperText: { fontSize: 12, color: '#6B7280', marginTop: 6, lineHeight: 18 },
  textarea: { height: 90, textAlignVertical: 'top', paddingTop: 12 },
  uploadBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 2,
  },
  uploadBtnText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  uploadPreview: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  logoPreview: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  select: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectText: { fontSize: 14, color: '#1F2937' },
  picker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  pickerItem: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  pickerItemText: { fontSize: 14, color: '#1F2937' },
  paymentHeader: { alignItems: 'center', marginVertical: 20, gap: 8 },
  paymentTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  paymentSub: { fontSize: 12, color: '#6B7280', textAlign: 'center', paddingHorizontal: 12, lineHeight: 18 },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qrImage: { width: 220, height: 220 },
  qrCaption: { marginTop: 12, fontSize: 13, fontWeight: '700', color: '#1F2937' },
  row: { flexDirection: 'row' },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginTop: 20 },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  summaryLabel: { fontSize: 13, color: '#6B7280' },
  summaryValue: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  summaryTotal: { borderBottomWidth: 0, marginTop: 4 },
  summaryLabelTotal: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  summaryValueTotal: { fontSize: 14, fontWeight: '800', color: '#6DBE75' },
  success: { alignItems: 'center', paddingVertical: 40, gap: 16 },
  successCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937' },
  successText: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  doneBtn: { backgroundColor: '#6DBE75', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginTop: 16 },
  doneBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  footer: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#F7F7F5' },
  nextBtn: { backgroundColor: '#6DBE75', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: '#D1D5DB' },
  nextBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
