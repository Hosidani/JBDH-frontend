import { useState, useEffect } from 'react';

// Simple in-memory cache for loaded translations
const translationsCache: Record<string, Record<string, string>> = {};


export function useTranslation() {
  // Default to Swedish, but allow override (could be from context, localStorage, etc.)
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

  // On mount and when language changes, load translations and trigger re-render
  useEffect(() => {
    let mounted = true;
    setReady(false);
    loadTranslations(language).then(() => {
      if (mounted) setReady(true);
    });
    return () => { mounted = false; };
  }, [language]);

  // Translation function
  async function t(key: string): Promise<string> {
    const messages = await loadTranslations(language);
    return messages[key] || key;
  }

  // Synchronous version for simple usage (will not update if language changes after first load)
  function tSync(key: string): string {
    const messages = translationsCache[language];
    return messages ? messages[key] || key : key;
  }

  // Change language
  function changeLanguage(lang: string) {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  }

  return { t, tSync, language, changeLanguage, ready };
}
