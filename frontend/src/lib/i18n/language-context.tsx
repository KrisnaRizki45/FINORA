'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations, Language, TranslationKey } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'finora_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language;
      if (stored === 'en' || stored === 'id') {
        setLanguageState(stored);
      }
    } catch {
      // Ignore localStorage errors (e.g. incognito)
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const activeLang = mounted ? language : 'en';
    const dict = translations[activeLang] || translations.en;
    const value = dict[key] || translations.en[key] || fallback || key;
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a safe fallback if used outside provider
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: (key: TranslationKey, fallback?: string) => translations.en[key] || fallback || key,
    };
  }
  return context;
}
