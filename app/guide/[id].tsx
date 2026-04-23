import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, AlertTriangle, Wrench, Globe, BookOpen, PlayCircle } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { WebView } from 'react-native-webview';
import {
  findGuideContent,
  getGuideFirstYoutubeVideoId,
  getGuideYoutubeEmbedUrl,
  getGuideYoutubeSearchUrl,
  getYoutubeEmbedUrlFromVideoId,
} from '@/data/guideContent';

const WEBVIEW_ALLOWED_URL_REGEX = /^(https?:\/\/|about:blank|data:)/i;
const YOUTUBE_QUERY_VIDEO_ID_REGEX = /[?&]v=([A-Za-z0-9_-]{11})/;
const YOUTUBE_PATH_VIDEO_ID_REGEX = /\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/;

function extractVideoIdFromUrl(rawUrl: string): string | undefined {
  const queryMatch = rawUrl.match(YOUTUBE_QUERY_VIDEO_ID_REGEX);
  if (queryMatch?.[1]) return queryMatch[1];

  const pathMatch = rawUrl.match(YOUTUBE_PATH_VIDEO_ID_REGEX);
  if (pathMatch?.[1]) return pathMatch[1];

  return undefined;
}

export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const [mode, setMode] = useState<'local' | 'external'>('local');
  const [videoHasError, setVideoHasError] = useState(false);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState<string | undefined>(undefined);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | undefined>(undefined);
  const [thumbnailHasError, setThumbnailHasError] = useState(false);
  const [isResolvingVideo, setIsResolvingVideo] = useState(false);
  const guideId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
  const guide = useMemo(() => findGuideContent(guideId ?? ''), [guideId]);
  const configuredYoutubeEmbedUrl = useMemo(() => (guide ? getGuideYoutubeEmbedUrl(guide) : undefined), [guide]);
  const youtubeSearchUrl = useMemo(() => (guide ? getGuideYoutubeSearchUrl(guide) : ''), [guide]);
  const youtubeThumbnailUrl = useMemo(
    () => (youtubeVideoId ? `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg` : undefined),
    [youtubeVideoId]
  );
  const youtubeOpenUrl = useMemo(
    () => (youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : youtubeSearchUrl),
    [youtubeVideoId, youtubeSearchUrl]
  );

  const handleVideoShouldStartLoad = (url: string): boolean => {
    const decodedUrl = decodeURIComponent(url ?? '');

    if (decodedUrl.startsWith('vnd.youtube://') || decodedUrl.startsWith('youtube://')) {
      const deepLinkedVideoId = extractVideoIdFromUrl(decodedUrl);
      if (deepLinkedVideoId) {
        setYoutubeEmbedUrl(getYoutubeEmbedUrlFromVideoId(deepLinkedVideoId));
        setYoutubeVideoId(deepLinkedVideoId);
        setThumbnailHasError(false);
        setVideoHasError(false);
      }
      return false;
    }

    return WEBVIEW_ALLOWED_URL_REGEX.test(decodedUrl);
  };

  const openYoutubeTutorial = () => {
    const tutorialTitle = guide?.title ? `${guide.title} Tutorial` : 'Guide Tutorial';
    router.push(
      `/webview?url=${encodeURIComponent(youtubeOpenUrl)}&title=${encodeURIComponent(tutorialTitle)}`
    );
  };

  useEffect(() => {
    let cancelled = false;
    setVideoHasError(false);
    setThumbnailHasError(false);

    if (!guide) {
      setYoutubeEmbedUrl(undefined);
      setYoutubeVideoId(undefined);
      setIsResolvingVideo(false);
      return;
    }

    if (configuredYoutubeEmbedUrl) {
      setYoutubeEmbedUrl(configuredYoutubeEmbedUrl);
      setYoutubeVideoId(extractVideoIdFromUrl(configuredYoutubeEmbedUrl));
      setIsResolvingVideo(false);
      return;
    }

    setYoutubeEmbedUrl(undefined);
    setYoutubeVideoId(undefined);
    setIsResolvingVideo(true);

    getGuideFirstYoutubeVideoId(guide)
      .then((videoId) => {
        if (cancelled) return;
        setYoutubeVideoId(videoId);
        setYoutubeEmbedUrl(videoId ? getYoutubeEmbedUrlFromVideoId(videoId) : undefined);
      })
      .finally(() => {
        if (!cancelled) {
          setIsResolvingVideo(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [guide, guideId, configuredYoutubeEmbedUrl]);

  if (!guide) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
            <ArrowLeft size={22} color="#1F2937" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.title}>Guide</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.empty}>Guide not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{guide.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Source toggle */}
      {guide?.ifixitUrl && (
        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => setMode('local')}
            style={[styles.toggleBtn, mode === 'local' && styles.toggleActive]}
            activeOpacity={0.8}>
            <BookOpen size={14} color={mode === 'local' ? '#FFFFFF' : '#374151'} />
            <Text style={[styles.toggleText, mode === 'local' && styles.toggleTextActive]}>Local Guide</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('external')}
            style={[styles.toggleBtn, mode === 'external' && styles.toggleActive]}
            activeOpacity={0.8}>
            <Globe size={14} color={mode === 'external' ? '#FFFFFF' : '#374151'} />
            <Text style={[styles.toggleText, mode === 'external' && styles.toggleTextActive]}>External Guide</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'external' && guide?.ifixitUrl ? (
        <WebView
          style={{ flex: 1 }}
          source={{ uri: guide.ifixitUrl }}
          startInLoadingState
          renderLoading={() => (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F7F5' }}>
              <ActivityIndicator size="large" color="#6DBE75" />
              <Text style={{ marginTop: 12, fontSize: 13, color: '#6B7280' }}>Loading iFixit guide…</Text>
            </View>
          )}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Overview */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.bodyText}>{guide.overview}</Text>
          </View>

          {/* YouTube tutorial */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <PlayCircle size={18} color="#6DBE75" strokeWidth={2} />
              <Text style={styles.sectionTitle}>YouTube Tutorial</Text>
            </View>
            <View style={styles.videoFrame}>
              {isResolvingVideo ? (
                <View style={styles.videoLoadingWrap}>
                  <ActivityIndicator size="small" color="#E5E7EB" />
                  <Text style={styles.videoLoadingText}>Finding top YouTube tutorial...</Text>
                </View>
              ) : youtubeEmbedUrl && !videoHasError ? (
                <WebView
                  key={youtubeEmbedUrl}
                  source={{ uri: youtubeEmbedUrl }}
                  style={styles.videoWebView}
                  originWhitelist={["*"]}
                  allowsFullscreenVideo
                  allowsInlineMediaPlayback
                  javaScriptEnabled
                  domStorageEnabled
                  mediaPlaybackRequiresUserAction={false}
                  setSupportMultipleWindows={false}
                  onShouldStartLoadWithRequest={(request) => handleVideoShouldStartLoad(request.url)}
                  onError={() => setVideoHasError(true)}
                  onHttpError={() => setVideoHasError(true)}
                />
              ) : (
                <TouchableOpacity style={styles.videoFallbackWrap} activeOpacity={0.9} onPress={openYoutubeTutorial}>
                  {youtubeThumbnailUrl && !thumbnailHasError ? (
                    <Image
                      source={{ uri: youtubeThumbnailUrl }}
                      style={styles.videoFallbackThumbnail}
                      resizeMode="cover"
                      onError={() => setThumbnailHasError(true)}
                    />
                  ) : null}
                  <View style={styles.videoFallbackOverlay} />
                  <View style={styles.videoPreviewPlayBadge}>
                    <PlayCircle size={52} color="#FFFFFF" strokeWidth={1.8} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Tools */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Wrench size={18} color="#6DBE75" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Tools Needed</Text>
          </View>
          <View style={styles.badgeRow}>
            {guide.tools.map((tool, i) => (
              <View key={i} style={styles.badge}>
                <Text style={styles.badgeText}>{tool}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Steps */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <CheckCircle2 size={18} color="#6DBE75" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Steps</Text>
          </View>
          {guide.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Safety */}
        <View style={[styles.sectionCard, styles.warningCard]}>
          <View style={styles.sectionHeader}>
            <AlertTriangle size={18} color="#F59E0B" strokeWidth={2} />
            <Text style={[styles.sectionTitle, styles.warningTitle]}>Safety Notes</Text>
          </View>
          <Text style={styles.bodyText}>{guide.safetyNotes}</Text>
        </View>

        {/* When to call pro */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>When to Call a Professional</Text>
          <Text style={styles.bodyText}>{guide.callProfessional}</Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  title: { fontSize: 16, fontWeight: '700', color: '#1F2937', flex: 1, textAlign: 'center' },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  bodyText: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  videoFrame: {
    marginTop: 4,
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  videoWebView: { flex: 1, backgroundColor: '#000000' },
  videoLoadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#111827',
  },
  videoLoadingText: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  videoFallbackWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#111827',
    position: 'relative',
    overflow: 'hidden',
  },
  videoFallbackThumbnail: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  videoFallbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
  },
  videoPreviewPlayBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 74,
    height: 74,
    marginLeft: -37,
    marginTop: -37,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    zIndex: 1,
  },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  badge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  stepNumberText: { fontSize: 12, fontWeight: '700', color: '#6DBE75' },
  stepText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 },
  warningCard: { backgroundColor: '#FFFBEB' },
  toggleRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  toggleActive: {
    backgroundColor: '#6DBE75',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  warningTitle: { color: '#B45309' },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    color: '#9CA3AF',
  },
});
