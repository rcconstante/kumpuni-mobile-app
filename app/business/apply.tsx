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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, QrCode, CheckCircle2, Upload, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  BusinessCategory,
  FIXER_CATEGORIES,
  submitBusinessApplication,
} from '@/data/fixers';

const STEPS = ['Details', 'Payment', 'Done'] as const;

const COUNTRIES = [
  'Philippines', 'Singapore', 'Malaysia', 'Indonesia', 'Thailand',
  'Vietnam', 'Myanmar', 'Cambodia', 'Brunei', 'United States',
  'United Kingdom', 'Australia', 'Canada', 'Japan', 'South Korea',
  'China', 'India', 'Other',
];

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;
const PHONE_RE = /^[+\d\s\-()\\.]{7,40}$/;

export default function ApplyBusinessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('Home');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Philippines');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);
  const [highlightImages, setHighlightImages] = useState<string[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Payment state
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [processing, setProcessing] = useState(false);

  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: '' }));

  const validateStep0 = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Business name is required.';
    if (!address.trim()) e.address = 'Address is required.';
    if (!city.trim()) e.city = 'City is required.';
    if (!phone.trim()) e.phone = 'Contact number is required.';
    else if (!PHONE_RE.test(phone.trim()))
      e.phone = 'Enter a valid phone number (digits, +, spaces or dashes).';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!EMAIL_RE.test(email.trim()))
      e.email = 'Enter a valid email address (e.g. business@gmail.com).';
    if (!googleMapsUrl.trim()) e.googleMapsUrl = 'Google Maps link is required.';
    else if (!/^https?:\/\//i.test(googleMapsUrl.trim()))
      e.googleMapsUrl = 'Must start with https:// — paste the share link from Google Maps.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleBack = () => {
    if (step === 0) router.back();
    else setStep((s) => s - 1);
  };

  const pickImage = async (kind: 'logo' | 'highlight' | 'proof') => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: kind === 'highlight',
      selectionLimit: kind === 'highlight' ? 5 : 1,
      allowsEditing: kind !== 'highlight',
      quality: 0.8,
      base64: true,
    });

    if (result.canceled) return;

    const toDataUri = (asset: ImagePicker.ImagePickerAsset): string | null => {
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert('Image too large', 'Please choose images under 5 MB each.');
        return null;
      }
      return asset.base64 && asset.mimeType
        ? `data:${asset.mimeType};base64,${asset.base64}`
        : asset.uri;
    };

    if (kind === 'logo') {
      const uri = toDataUri(result.assets[0]);
      if (uri) setBusinessLogo(uri);
    } else if (kind === 'highlight') {
      const uris = result.assets.map(toDataUri).filter(Boolean) as string[];
      setHighlightImages((prev) => [...prev, ...uris].slice(0, 5));
    } else {
      const uri = toDataUri(result.assets[0]);
      if (uri) setPaymentProof(uri);
    }
  };

  const removeHighlight = (index: number) =>
    setHighlightImages((prev) => prev.filter((_, i) => i !== index));

  const canNext = () => {
    if (step === 1) return !!paymentProof;
    return true;
  };

  const handleNext = () => {
    if (step === 0) {
      if (!validateStep0()) return;
      setStep(1);
    } else if (step === 1) {
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
        googleMapsUrl,
        logoUrl: businessLogo || undefined,
        imageUrl: highlightImages[0] || undefined,
        images: highlightImages.slice(1),
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
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={handleBack}>
          <ArrowLeft size={22} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>List Your Business</Text>
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Step 0: Details ── */}
          {step === 0 && (
            <>
              <Text style={styles.label}>Business Name *</Text>
              <TextInput
                style={[styles.input, !!errors.name && styles.inputError]}
                placeholder="e.g. Manila Pipe Masters"
                value={name}
                onChangeText={(t) => { setName(t); clearError('name'); }}
                placeholderTextColor="#9CA3AF"
              />
              {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

              <Text style={styles.label}>Category *</Text>
              <TouchableOpacity
                style={styles.select}
                activeOpacity={0.8}
                onPress={() => {
                  setShowCategoryPicker(!showCategoryPicker);
                  setShowCountryPicker(false);
                }}
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
                      <Text style={[styles.pickerItemText, category === c && styles.pickerItemActive]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={[styles.input, !!errors.address && styles.inputError]}
                placeholder="Full business address"
                value={address}
                onChangeText={(t) => { setAddress(t); clearError('address'); }}
                placeholderTextColor="#9CA3AF"
              />
              {!!errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>City *</Text>
                  <TextInput
                    style={[styles.input, !!errors.city && styles.inputError]}
                    placeholder="City"
                    value={city}
                    onChangeText={(t) => { setCity(t); clearError('city'); }}
                    placeholderTextColor="#9CA3AF"
                  />
                  {!!errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Country *</Text>
                  <TouchableOpacity
                    style={styles.select}
                    activeOpacity={0.8}
                    onPress={() => {
                      setShowCountryPicker(!showCountryPicker);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={[styles.selectText, { fontSize: 13 }]} numberOfLines={1}>
                      {country}
                    </Text>
                    <ChevronDown size={15} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
              {showCountryPicker && (
                <View style={styles.picker}>
                  {COUNTRIES.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={styles.pickerItem}
                      onPress={() => { setCountry(c); setShowCountryPicker(false); }}
                    >
                      <Text style={[styles.pickerItemText, country === c && styles.pickerItemActive]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.label}>Contact Number *</Text>
              <TextInput
                style={[styles.input, !!errors.phone && styles.inputError]}
                placeholder="+63 912 345 6789"
                value={phone}
                onChangeText={(t) => { setPhone(t); clearError('phone'); }}
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
              />
              {!!errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, !!errors.email && styles.inputError]}
                placeholder="business@gmail.com"
                value={email}
                onChangeText={(t) => { setEmail(t.trim()); clearError('email'); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#9CA3AF"
              />
              {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              <Text style={styles.label}>Google Maps Link *</Text>
              <TextInput
                style={[styles.input, !!errors.googleMapsUrl && styles.inputError]}
                placeholder="Paste your Google Maps share link"
                value={googleMapsUrl}
                onChangeText={(t) => { setGoogleMapsUrl(t); clearError('googleMapsUrl'); }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                placeholderTextColor="#9CA3AF"
              />
              {!!errors.googleMapsUrl
                ? <Text style={styles.errorText}>{errors.googleMapsUrl}</Text>
                : <Text style={styles.helperText}>Open Google Maps → Share → Copy link, then paste here.</Text>
              }

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
              <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.8} onPress={() => pickImage('logo')}>
                <Text style={styles.uploadBtnText}>
                  {businessLogo ? 'Change Logo' : 'Upload Business Logo'}
                </Text>
              </TouchableOpacity>
              {businessLogo && (
                <Image source={{ uri: businessLogo }} style={styles.logoPreview} resizeMode="contain" />
              )}

              <Text style={styles.label}>Highlight Photos (up to 5)</Text>
              <Text style={styles.helperText}>
                These photos appear in your business listing. You can select multiple at once.
              </Text>
              <TouchableOpacity
                style={[styles.uploadBtn, highlightImages.length >= 5 && styles.uploadBtnDisabled]}
                activeOpacity={0.8}
                onPress={() => pickImage('highlight')}
                disabled={highlightImages.length >= 5}
              >
                <Upload size={16} color="#374151" />
                <Text style={styles.uploadBtnText}>
                  {highlightImages.length === 0 ? 'Choose Photos' : `Add More (${highlightImages.length}/5)`}
                </Text>
              </TouchableOpacity>
              {highlightImages.length > 0 && (
                <View style={styles.imageGrid}>
                  {highlightImages.map((uri, idx) => (
                    <View key={idx} style={styles.imageGridItem}>
                      <Image source={{ uri }} style={styles.imageGridThumb} resizeMode="cover" />
                      <TouchableOpacity style={styles.removeBtn} onPress={() => removeHighlight(idx)}>
                        <X size={11} color="#FFFFFF" />
                      </TouchableOpacity>
                      {idx === 0 && (
                        <View style={styles.mainBadge}>
                          <Text style={styles.mainBadgeText}>Main</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* ── Step 1: Payment ── */}
          {step === 1 && (
            <>
              <View style={styles.paymentHeader}>
                <QrCode size={32} color="#6DBE75" />
                <Text style={styles.paymentTitle}>Scan to Pay</Text>
                <Text style={styles.paymentSub}>
                  Scan the QR code below with your bank or e-wallet app, then upload
                  a screenshot of your payment confirmation.
                </Text>
              </View>

              <View style={styles.qrCard}>
                <Image
                  source={require('@/assets/images/qr.png')}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
                <Text style={styles.qrCaption}>Kumpuni Business Listing • ₱200</Text>
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
              <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.8} onPress={() => pickImage('proof')}>
                <Upload size={16} color="#374151" />
                <Text style={styles.uploadBtnText}>
                  {paymentProof ? 'Change Screenshot' : 'Upload Payment Screenshot'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>
                Clear screenshot showing amount, date, and reference number. Max 5 MB.
              </Text>
              {paymentProof && (
                <Image source={{ uri: paymentProof }} style={styles.uploadPreview} resizeMode="cover" />
              )}

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Plan Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Business Listing</Text>
                  <Text style={styles.summaryValue}>₱200</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Highlight Badge</Text>
                  <Text style={styles.summaryValue}>Included</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.summaryLabelTotal}>Total</Text>
                  <Text style={styles.summaryValueTotal}>₱200</Text>
                </View>
              </View>
            </>
          )}

          {/* ── Step 2: Done ── */}
          {step === 2 && (
            <View style={styles.success}>
              <View style={styles.successCircle}>
                <CheckCircle2 size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Application Submitted!</Text>
              <Text style={styles.successText}>
                Your business is pending manual verification. We will review your details and
                contact you via email within 2–3 business days.
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
        <View style={[styles.footer, step > 0 && styles.footerRow, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {step > 0 && (
            <TouchableOpacity style={styles.backFooterBtn} activeOpacity={0.8} onPress={handleBack}>
              <Text style={styles.backFooterBtnText}>← Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.nextBtn,
              (!canNext() || processing) && styles.nextBtnDisabled,
            ]}
            activeOpacity={0.8}
            disabled={processing}
            onPress={handleNext}
          >
            <Text style={styles.nextBtnText}>
              {processing ? 'Submitting...' : step === 1 ? 'Submit Application' : 'Continue'}
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
  inputError: { borderColor: '#EF4444' },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 4, lineHeight: 16 },
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
  uploadBtnDisabled: { opacity: 0.4 },
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
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  imageGridItem: { width: 90, height: 90, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  imageGridThumb: { width: 90, height: 90 },
  removeBtn: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10,
    width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
  },
  mainBadge: {
    position: 'absolute', bottom: 4, left: 4,
    backgroundColor: '#6DBE75', borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  mainBadgeText: { fontSize: 9, fontWeight: '700', color: '#FFFFFF' },
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
  selectText: { fontSize: 14, color: '#1F2937', flex: 1 },
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
  pickerItemActive: { color: '#6DBE75', fontWeight: '700' },
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
  footerRow: { flexDirection: 'row', gap: 12 },
  backFooterBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB',
  },
  backFooterBtnText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  nextBtn: { backgroundColor: '#6DBE75', borderRadius: 16, paddingVertical: 14, alignItems: 'center', flex: 1 },
  nextBtnDisabled: { backgroundColor: '#D1D5DB' },
  nextBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
