import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

// Simple in-memory cache for loaded translations
const translationsCache: Record<string, Record<string, string>> = {};

interface TranslationContextProps {
  language: string;
  changeLanguage: (lang: string) => void;
  t: (key: string) => Promise<string>;
  tSync: (key: string) => string;
  ready: boolean;
}

const TranslationContext = createContext<TranslationContextProps | undefined>(undefined);

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<string>(
    localStorage.getItem('language') || 'sv'
  );
  const [ready, setReady] = useState(false);

  // Load translations for the current language
  async function loadTranslations(lang: string): Promise<Record<string, string>> {
    if (translationsCache[lang]) return translationsCache[lang];
    let messages: Record<string, string> = {};
    try {
      messages = (await import(`../locales/${lang}.json`)).default;
    } catch (e) {
      // fallback to Swedish if not found
      if (lang !== 'sv') {
        messages = (await import(`../locales/sv.json`)).default;
      }
    }
    translationsCache[lang] = messages;
    return messages;
  }

  useEffect(() => {
    let mounted = true;
    setReady(false);
    loadTranslations(language).then(() => {
      if (mounted) setReady(true);
    });
    return () => { mounted = false; };
  }, [language]);

  async function t(key: string): Promise<string> {
    const messages = await loadTranslations(language);
    return messages[key] || key;
  }

  function tSync(key: string): string {
    const messages = translationsCache[language];
    return messages ? messages[key] || key : key;
  }

  function changeLanguage(lang: string) {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  }

  return (
    <TranslationContext.Provider value={{ language, changeLanguage, t, tSync, ready }}>
      {children}
    </TranslationContext.Provider>
  );
};

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error('useTranslation must be used within a TranslationProvider');
  return ctx;
}
