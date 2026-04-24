import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Globe } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { useEffect, useState } from 'react';
import { safeHttpUrl } from '@/lib/safeUrl';

const YOUTUBE_DEEP_LINK_REGEX = /^(vnd\.youtube:\/\/|youtube:\/\/)/i;
const YOUTUBE_VIDEO_ID_QUERY_REGEX = /[?&]v=([A-Za-z0-9_-]{11})/;

function normalizeYoutubeDeepLinkUrl(url: string): string | undefined {
  const decoded = decodeURIComponent(url ?? '');
  if (!YOUTUBE_DEEP_LINK_REGEX.test(decoded)) return undefined;

  const idMatch = decoded.match(YOUTUBE_VIDEO_ID_QUERY_REGEX);
  if (idMatch?.[1]) {
    return `https://www.youtube.com/watch?v=${idMatch[1]}`;
  }

  const withoutScheme = decoded
    .replace(/^vnd\.youtube:\/\//i, '')
    .replace(/^youtube:\/\//i, '');

  if (!withoutScheme) return undefined;
  return `https://${withoutScheme}`;
}

export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Validate entry URL — only https allowed; YouTube deep links are rewritten
  // to https by onShouldStartLoadWithRequest before the WebView ever loads them.
  const decodedUrl = safeHttpUrl(decodeURIComponent(url || ''));
  const decodedTitle = decodeURIComponent(title || 'Web View').slice(0, 120);
  const [currentUrl, setCurrentUrl] = useState(decodedUrl);

  useEffect(() => {
    setCurrentUrl(safeHttpUrl(decodeURIComponent(url || '')));
    setLoading(true);
    setError(false);
  }, [url]);

  const handleShouldStartLoad = (urlToLoad: string): boolean => {
    // Rewrite YouTube deep links to https before allowing.
    const rewritten = normalizeYoutubeDeepLinkUrl(urlToLoad);
    if (rewritten) {
      setCurrentUrl(rewritten);
      return false;
    }
    // Block everything that isn't https.
    return !!safeHttpUrl(urlToLoad);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Globe size={16} color="#9CA3AF" strokeWidth={2} />
          <Text style={styles.title} numberOfLines={1}>{decodedTitle}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {currentUrl ? (
        <>
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#6DBE75" />
              <Text style={styles.loaderText}>Loading...</Text>
            </View>
          )}
          {error ? (
            <View style={styles.error}>
              <Text style={styles.errorText}>Could not load the page.</Text>
              <Text style={styles.errorSub}>Check your internet connection or try again later.</Text>
            </View>
          ) : (
            <WebView
              source={{ uri: currentUrl! }}
              style={{ flex: 1 }}
              originWhitelist={['https://*']}
              javaScriptEnabled
              setSupportMultipleWindows={false}
              allowFileAccess={false}
              allowFileAccessFromFileURLs={false}
              allowUniversalAccessFromFileURLs={false}
              onShouldStartLoadWithRequest={(request) => handleShouldStartLoad(request.url)}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
            />
          )}
        </>
      ) : (
        <View style={styles.error}>
          <Text style={styles.errorText}>Invalid or unsupported URL.</Text>
          <Text style={styles.errorSub}>Only https links are allowed.</Text>
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
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  loader: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loaderText: { marginTop: 8, fontSize: 13, color: '#9CA3AF' },
  error: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  errorText: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 6 },
  errorSub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});
