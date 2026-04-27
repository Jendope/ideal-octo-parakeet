'use client';

import { useState, useCallback, createContext, useContext, ReactNode, useSyncExternalStore } from 'react';
import { translations, Language, languageNames, TranslationKey } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  languageName: string;
  availableLanguages: Language[];
}

const I18nContext = createContext<I18nContextType | null>(null);

// Create a proper store with subscription support
// Default language is zh-HK (Traditional Chinese) for Hong Kong users
function createLanguageStore() {
  const KEY = 'fraudguard_language';
  const DEFAULT_LANG: Language = 'zh-HK';
  
  let listeners: Array<() => void> = [];

  const getSnapshot = (): Language => {
    if (typeof window === 'undefined') return DEFAULT_LANG;
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && (saved === 'en' || saved === 'zh-HK' || saved === 'zh-CN')) {
        return saved;
      }
      // Default to Traditional Chinese for Hong Kong users
      return DEFAULT_LANG;
    } catch {
      // localStorage might not be available
      return DEFAULT_LANG;
    }
  };

  const getServerSnapshot = (): Language => DEFAULT_LANG;

  const subscribe = (listener: () => void) => {
    listeners.push(listener);
    // Listen for storage events (cross-tab sync)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        listeners.forEach(l => l());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      listeners = listeners.filter(l => l !== listener);
      window.removeEventListener('storage', handleStorage);
    };
  };

  const setValue = (lang: Language) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(KEY, lang);
        listeners.forEach(l => l());
      } catch {
        // localStorage might not be available
      }
    }
  };

  return { getSnapshot, getServerSnapshot, subscribe, setValue };
}

const languageStore = createLanguageStore();

// Hydration detection
function createHydrationStore() {
  const getSnapshot = () => typeof window !== 'undefined';
  const getServerSnapshot = () => false;
  const subscribe = () => () => {};
  return { getSnapshot, getServerSnapshot, subscribe };
}

const hydrationStore = createHydrationStore();

export function I18nProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.getSnapshot,
    languageStore.getServerSnapshot
  );
  
  const isHydrated = useSyncExternalStore(
    hydrationStore.subscribe,
    hydrationStore.getSnapshot,
    hydrationStore.getServerSnapshot
  );

  const setLanguage = useCallback((lang: Language) => {
    languageStore.setValue(lang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || key;
  }, [language]);

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
    languageName: languageNames[language],
    availableLanguages: ['en', 'zh-HK', 'zh-CN']
  };

  // Loading state
  if (!isHydrated) {
    return (
      <I18nContext.Provider value={value}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

// Export for convenience
export { languageNames };
export type { TranslationKey };
