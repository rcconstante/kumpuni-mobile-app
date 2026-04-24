// Typed AsyncStorage wrapper for app settings + flags.
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Appearance = 'system' | 'light' | 'dark';
export type ViewMode = 'preview' | 'grid' | 'glass' | 'list';
export type CollectionsLayout = ViewMode;
export type LangCode = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'zh' | 'ko' | 'it' | 'ru' | 'hi';

export interface AppSettings {
  appearance: Appearance;
  language: LangCode;
  viewMode: ViewMode;
  collectionsLayout: CollectionsLayout;
  autoImportTags: boolean;
  defaultCollectionId: string | null;
  onboardingComplete: boolean;
}

const KEY = 'savit:settings:v1';

const DEFAULTS: AppSettings = {
  appearance: 'system',
  language: 'en',
  viewMode: 'preview',
  collectionsLayout: 'grid',
  autoImportTags: true,
  defaultCollectionId: null,
  onboardingComplete: false,
};

// Migrate legacy language strings to codes
const LANG_MIGRATE: Record<string, LangCode> = {
  English: 'en', Español: 'es', Français: 'fr', Deutsch: 'de',
  Português: 'pt', '日本語': 'ja', '中文': 'zh', '한국어': 'ko',
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    // Migrate old string language to code
    if (parsed.language && LANG_MIGRATE[parsed.language]) {
      parsed.language = LANG_MIGRATE[parsed.language];
    }
    // Migrate old collectionsLayout values that are not ViewMode
    const validLayouts: CollectionsLayout[] = ['preview', 'grid', 'glass', 'list'];
    if (parsed.collectionsLayout && !validLayouts.includes(parsed.collectionsLayout)) {
      parsed.collectionsLayout = 'grid';
    }
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
}

export async function patchSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const current = await loadSettings();
  const next = { ...current, ...patch };
  await saveSettings(next);
  return next;
}
