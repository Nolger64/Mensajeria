import React, { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo, useColorScheme } from 'react-native';
import { auraThemes, type AuraMode, type AuraTheme } from './auraTheme';

const preferenceKey = 'aura-spa.appearance';

interface ThemeContextValue {
  mode: AuraMode;
  theme: AuraTheme;
  reduceMotion: boolean;
  ready: boolean;
  toggleMode: () => void;
}

const AuraThemeContext = createContext<ThemeContextValue | null>(null);

export function AuraThemeProvider({ children }: PropsWithChildren) {
  const systemMode = useColorScheme();
  const [preference, setPreference] = useState<AuraMode | null>(null);
  const [ready, setReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(preferenceKey)
      .then((saved) => {
        if (active && (saved === 'light' || saved === 'dark')) setPreference(saved);
      })
      .catch(() => {})
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let initialValuePending = true;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      initialValuePending = false;
      setReduceMotion(enabled);
    });
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (initialValuePending) setReduceMotion(enabled);
    }).catch(() => {});
    return () => {
      initialValuePending = false;
      subscription.remove();
    };
  }, []);

  const mode = preference ?? (systemMode === 'dark' ? 'dark' : 'light');

  function toggleMode() {
    const next = mode === 'light' ? 'dark' : 'light';
    setPreference(next);
    void AsyncStorage.setItem(preferenceKey, next).catch(() => {});
  }

  return (
    <AuraThemeContext.Provider value={{ mode, theme: auraThemes[mode], reduceMotion, ready, toggleMode }}>
      {children}
    </AuraThemeContext.Provider>
  );
}

export function useAuraTheme() {
  const value = useContext(AuraThemeContext);
  if (!value) throw new Error('La pantalla requiere AuraThemeProvider.');
  return value;
}
