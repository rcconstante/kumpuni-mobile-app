// Theme context — light/dark palettes + system follow.
// Screens read colors via useTheme(); cards re-style themselves.
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { useAppData } from './AppDataContext';

export interface ThemePalette {
  bg: string;
  bgElev: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  divider: string;

  text: string;
  textMuted: string;
  textFaint: string;
  textInverse: string;

  accent: string;
  accentSoft: string;
  accentText: string;

  danger: string;
  dangerSoft: string;

  searchBg: string;
  inputBg: string;
  iconButtonActiveBg: string;
  shadow: string;
  scrim: string;
  glassTint: string;
}

const LIGHT: ThemePalette = {
  bg: '#FAFBFC',
  bgElev: '#F3F4F6',
  surface: '#FFFFFF',
  surfaceAlt: '#F9FAFB',
  border: '#E5E7EB',
  divider: '#F3F4F6',

  text: '#1F2937',
  textMuted: '#6B7280',
  textFaint: '#9CA3AF',
  textInverse: '#FFFFFF',

  accent: '#0D9488',
  accentSoft: '#F0FDFA',
  accentText: '#0D9488',

  danger: '#EF4444',
  dangerSoft: '#FEF2F2',

  searchBg: '#F3F4F6',
  inputBg: '#FFFFFF',
  iconButtonActiveBg: '#1F2937',
  shadow: '#000000',
  scrim: 'rgba(0,0,0,0.4)',
  glassTint: 'rgba(255,255,255,0.55)',
};

const DARK: ThemePalette = {
  bg: '#0B0F14',
  bgElev: '#0F141B',
  surface: '#151B23',
  surfaceAlt: '#1B222C',
  border: '#1F2937',
  divider: '#1B222C',

  text: '#F3F4F6',
  textMuted: '#9CA3AF',
  textFaint: '#6B7280',
  textInverse: '#0B0F14',

  accent: '#2DD4BF',
  accentSoft: '#0F2E2A',
  accentText: '#5EEAD4',

  danger: '#F87171',
  dangerSoft: '#3F1414',

  searchBg: '#151B23',
  inputBg: '#151B23',
  iconButtonActiveBg: '#F3F4F6',
  shadow: '#000000',
  scrim: 'rgba(0,0,0,0.65)',
  glassTint: 'rgba(21,27,35,0.6)',
};

interface ThemeContextValue {
  isDark: boolean;
  scheme: 'light' | 'dark';
  colors: ThemePalette;
}

const ThemeCtx = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useAppData();
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme));
    return () => sub.remove();
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const eff =
      settings.appearance === 'system'
        ? systemScheme === 'dark' ? 'dark' : 'light'
        : settings.appearance;
    const isDark = eff === 'dark';
    return { isDark, scheme: isDark ? 'dark' : 'light', colors: isDark ? DARK : LIGHT };
  }, [settings.appearance, systemScheme]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
