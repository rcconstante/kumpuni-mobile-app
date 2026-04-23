import { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Send, ArrowRight, Zap, RotateCcw } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS, CHIPS } from './constants';
import { MarkdownText } from './components/MarkdownText';
import { TypewriterText } from './components/TypewriterText';
import { TypingDots } from './components/TypingDots';
import { confidenceBadge } from './replies';
import { styles } from './styles';
import { useAIAssistant } from './useAIAssistant';

export default function AIAssistantScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const { photo } = useLocalSearchParams<{ photo?: string }>();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const {
    input,
    setInput,
    messages,
    typingIds,
    handleSend,
    handleChip,
    handleSuggestion,
    handleReset,
    initializeFromPhoto,
  } = useAIAssistant({ scrollToBottom });

  useEffect(() => {
    if (photo) {
      initializeFromPhoto(photo);
    }
  }, [photo, initializeFromPhoto]);

  const onReset = useCallback(() => {
    handleReset();
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [handleReset]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          onContentSizeChange={scrollToBottom}
        >
          <View style={styles.heroCard}>
            <Image
              source={require('@/assets/images/assistant.png')}
              style={{ width: 100, height: 100, marginLeft: -8, marginBottom: -12 }}
              resizeMode="contain"
            />
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>AI Assistant</Text>
              <Text style={styles.heroSub}>Describe your problem and I&apos;ll find the right guide for you.</Text>
            </View>
            <TouchableOpacity onPress={onReset} style={styles.resetBtn} activeOpacity={0.7}>
              <RotateCcw size={18} color="#6DBE75" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {messages.map((msg) => {
            if (msg.role === 'user') {
              return (
                <View key={msg.id} style={{ marginBottom: 4 }}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userText}>{msg.text}</Text>
                  </View>
                  {msg.photoUri && (
                    <Image source={{ uri: msg.photoUri }} style={styles.capturedPhoto} />
                  )}
                </View>
              );
            }

            const isTyping = typingIds.has(msg.id);

            return (
              <View key={msg.id} style={{ marginBottom: 6 }}>
                <View style={styles.aiBubble}>
                  <View style={styles.aiImageWrap}>
                    <Image
                      source={require('@/assets/images/AI.png')}
                      style={{ width: 28, height: 28 }}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    {isTyping ? (
                      <TypewriterText
                        text={msg.text ?? ''}
                        onDone={scrollToBottom}
                        onProgress={scrollToBottom}
                      />
                    ) : (
                      <Text style={styles.aiText}>
                        <MarkdownText text={msg.text ?? ''} />
                      </Text>
                    )}
                  </View>
                </View>

                {msg.guides && !typingIds.has(msg.id) && msg.guides.map((guide) => {
                  const badge = confidenceBadge(guide.confidence);
                  const CatIcon = CATEGORY_ICONS[guide.categoryId] || Zap;
                  const catColor = CATEGORY_COLORS[guide.categoryId] || '#6DBE75';

                  return (
                    <TouchableOpacity
                      key={guide.id}
                      style={[styles.resultCard, { borderLeftColor: catColor }]}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/guide/${guide.id}` as any)}
                    >
                      <View style={styles.cardTopRow}>
                        <View style={styles.cardTitleRow}>
                          <CatIcon size={14} color={catColor} strokeWidth={2.5} />
                          <Text style={styles.resultTitle}>{guide.title}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                        </View>
                      </View>
                      <Text style={styles.resultOverview} numberOfLines={2}>
                        {guide.overview}
                      </Text>
                      <View style={styles.cardFooter}>
                        <Text style={styles.catLabel}>{CATEGORY_LABELS[guide.categoryId] || guide.categoryId}</Text>
                        <View style={styles.viewLink}>
                          <Text style={styles.viewLinkText}>View Guide</Text>
                          <ArrowRight size={14} color="#6DBE75" strokeWidth={2.5} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}

          {Array.from(typingIds).some((id) => id.startsWith('think-')) && (
            <View style={styles.thinkingRow}>
              <View style={styles.aiImageWrapSmall}>
                <Image
                  source={require('@/assets/images/AI.png')}
                  style={{ width: 22, height: 22 }}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.thinkingBubble}>
                <TypingDots />
              </View>
            </View>
          )}

          {(() => {
            const lastAi = [...messages].reverse().find((m) => m.role === 'ai');
            if (!lastAi || !lastAi.guides || lastAi.guides.length === 0) return null;
            if (lastAi.guides[0].confidence === 'high') return null;
            return (
              <View style={styles.suggestWrap}>
                <Text style={styles.suggestLabel}>Or try:</Text>
                <View style={styles.chipsRow}>
                  {lastAi.guides.slice(0, 2).map((g) => (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.suggestChip, { borderColor: CATEGORY_COLORS[g.categoryId] || '#E5E7EB' }]}
                      activeOpacity={0.7}
                      onPress={() => handleSuggestion(g.title)}
                    >
                      <Text style={styles.suggestChipText}>{g.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })()}

          {messages.length === 0 && (
            <View style={styles.chipsRow}>
              {CHIPS.map((chip, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.chip}
                  activeOpacity={0.7}
                  onPress={() => handleChip(chip)}
                >
                  <Text style={styles.chipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

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
          <TouchableOpacity style={styles.sendBtn} activeOpacity={0.8} onPress={handleSend}>
            <Send size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
