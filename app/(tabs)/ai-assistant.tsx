import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Send, ThumbsUp, ThumbsDown, Droplets, Wind, PaintBucket } from 'lucide-react-native';

const STEPS = [
  'Turn off the water supply under the sink.',
  'Inspect the base for loose parts or worn out washers.',
  'Tighten the mounting nut with a wrench.',
  'Replace the washer if the leak persists.',
];

const CHIPS = ['How do I clean my AC filter?', 'What paint works best for bathroom?'];

export default function AIAssistantScreen() {
  const [input, setInput] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Assistant</Text>
          <Text style={styles.subtitle}>Your home. Your questions. Instant answers.</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* User bubble */}
          <View style={styles.userBubble}>
            <Text style={styles.userText}>My faucet is leaking from the base, what could be the cause?</Text>
          </View>
          <Text style={styles.timeLabel}>Just now</Text>

          {/* AI bubble */}
          <View style={styles.aiBubble}>
            <View style={styles.aiImageWrap}>
              <Droplets size={40} color="#6DBE75" strokeWidth={1.5} />
            </View>
            <Text style={styles.aiText}>Quick Fix Steps</Text>
          </View>

          {/* Steps card */}
          <View style={styles.stepsCard}>
            {STEPS.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{i + 1}</Text></View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
            <Text style={styles.stepNote}>It's usually an inexpensive fix!</Text>
          </View>

          {/* Feedback */}
          <View style={styles.feedbackRow}>
            <TouchableOpacity style={styles.feedbackBtn} activeOpacity={0.7}>
              <ThumbsUp size={16} color="#6B7280" strokeWidth={2} />
              <Text style={styles.feedbackText}>Helpful</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.feedbackBtn} activeOpacity={0.7}>
              <ThumbsDown size={16} color="#6B7280" strokeWidth={2} />
              <Text style={styles.feedbackText}>Not helpful</Text>
            </TouchableOpacity>
          </View>

          {/* Chips */}
          <View style={styles.chipsRow}>
            {CHIPS.map((chip, i) => (
              <TouchableOpacity key={i} style={styles.chip} activeOpacity={0.7}>
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Input */}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Describe your issue..."
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.micBtn} activeOpacity={0.7}>
            <Mic size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendBtn} activeOpacity={0.8}>
            <Send size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  header: { paddingHorizontal: 20, marginTop: 8, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  subtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#6DBE75', borderRadius: 20, borderBottomRightRadius: 4, padding: 14, maxWidth: '80%', marginBottom: 4 },
  userText: { color: '#FFFFFF', fontSize: 14, lineHeight: 20 },
  timeLabel: { alignSelf: 'flex-end', fontSize: 11, color: '#9CA3AF', marginBottom: 16, marginRight: 4 },
  aiBubble: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 8 },
  aiImageWrap: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  aiText: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  stepsCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1 },
  stepNumberText: { fontSize: 12, fontWeight: '700', color: '#6DBE75' },
  stepText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 },
  stepNote: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', marginTop: 4 },
  feedbackRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  feedbackBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  feedbackText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  chipText: { fontSize: 12, fontWeight: '500', color: '#374151' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 20, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  input: { flex: 1, fontSize: 14, color: '#1F2937', maxHeight: 80, paddingVertical: 6 },
  micBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6DBE75', alignItems: 'center', justifyContent: 'center' },
});
