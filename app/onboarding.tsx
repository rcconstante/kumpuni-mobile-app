import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, type ViewToken, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PAGES = [
  { id: '1', title: 'Welcome to\nKumpuni', description: 'Your personal DIY home maintenance guide. Keep your home in great shape with easy-to-follow guides and tips.', image: require('@/assets/images/greetings.png') },
  { id: '2', title: 'AI Assistant\nAlways Ready', description: 'Got a leaking faucet or a flickering light? Ask our AI for instant step-by-step repair guidance.', image: require('@/assets/images/assistant.png') },
  { id: '3', title: 'Find Trusted\nFixers Near You', description: 'Need a professional? Connect with rated plumbers, electricians, and handymen in your area in seconds.', image: require('@/assets/images/fix.png') },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) setCurrentIndex(viewableItems[0].index);
  }).current;
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  const isLastPage = currentIndex === PAGES.length - 1;

  const handleNext = () => {
    if (isLastPage) router.replace('/(tabs)');
    else flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
  };
  const handleSkip = () => router.replace('/(tabs)');

  const renderPage = ({ item }: { item: (typeof PAGES)[number] }) => (
    <View style={[styles.page, { width: SCREEN_WIDTH }]}>
      <Image source={item.image} style={{ width: 180, height: 180, marginBottom: 40 }} resizeMode="contain" />
      <Text style={styles.pageTitle}>{item.title}</Text>
      <Text style={styles.pageDesc}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        {!isLastPage ? <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}><Text style={styles.skipText}>Skip</Text></TouchableOpacity> : <View />}
      </View>
      <FlatList ref={flatListRef} data={PAGES} renderItem={renderPage} keyExtractor={(item) => item.id} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onViewableItemsChanged={onViewableItemsChanged} viewabilityConfig={viewabilityConfig} bounces={false} />
      <View style={styles.bottomSection}>
        <View style={styles.dots}>
          {PAGES.map((_, i) => <View key={i} style={[styles.dot, { backgroundColor: i === currentIndex ? '#6DBE75' : '#D1D5DB', width: i === currentIndex ? 24 : 8 }]} />)}
        </View>
        <TouchableOpacity style={styles.ctaButton} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.ctaText}>{isLastPage ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
  skipText: { fontSize: 15, fontWeight: '500', color: '#9CA3AF' },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  pageTitle: { fontSize: 30, fontWeight: '800', textAlign: 'center', lineHeight: 38, marginBottom: 20, color: '#1F2937' },
  pageDesc: { fontSize: 16, textAlign: 'center', lineHeight: 24, maxWidth: 320, color: '#6B7280' },
  bottomSection: { paddingHorizontal: 24, paddingBottom: 16, gap: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  ctaButton: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6DBE75' },
  ctaText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
