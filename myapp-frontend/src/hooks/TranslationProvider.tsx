import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ApiService } from '../services/ApiService';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const [language, setLanguage] = useState<string>(
    localStorage.getItem('language') || 'sv'
  );
  const [ready, setReady] = useState(false);

  // Load user's preferred language from database when they log in
  useEffect(() => {
    const loadUserLanguagePreference = async () => {
      if (user) {
        try {
          const accountSettings = await ApiService.getAccountSettings();
          if (accountSettings && accountSettings.preferredLanguage) {
            const dbLanguage = accountSettings.preferredLanguage;
            if (dbLanguage !== language) {
              setLanguage(dbLanguage);
              localStorage.setItem('language', dbLanguage);
            }
          }
        } catch (error) {
          // Silently ignore if user not logged in or API error
        }
      }
    };

    loadUserLanguagePreference();
  }, [user]); // Run when user logs in/out

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
    
    // Only update database if user is logged in
    if (user) {
      updateLanguageInDatabase(lang);
    }
  }

  async function updateLanguageInDatabase(lang: string) {
    try {
      // Try to get current account settings to check if user is logged in
      const accountSettings = await ApiService.getAccountSettings();
      if (accountSettings) {
        // Update preferredLanguage in database
        await ApiService.updateAccountSettings({
          preferredLanguage: lang
        });
      }
    } catch (error) {
      // User might not be logged in, silently ignore
    }
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
