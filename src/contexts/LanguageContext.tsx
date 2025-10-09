'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
];

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred_language') as SupportedLanguage;
    if (savedLanguage && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
      if (SUPPORTED_LANGUAGES.some(lang => lang.code === browserLang)) {
        setCurrentLanguage(browserLang);
      }
    }
  }, []);

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const module = await import(`@/locales/${currentLanguage}.json`);
        setTranslations(module.default);
      } catch (error) {
        console.error(`Failed to load translations for ${currentLanguage}:`, error);
        // Fallback to English
        const fallback = await import('@/locales/en.json');
        setTranslations(fallback.default);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    localStorage.setItem('preferred_language', lang);
    // Update HTML lang attribute
    document.documentElement.lang = lang;
  };

  // Translation function with nested key support and parameter interpolation
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    let result = typeof value === 'string' ? value : key;

    // Replace parameters
    if (params) {
      Object.keys(params).forEach(param => {
        result = result.replace(new RegExp(`{{${param}}}`, 'g'), String(params[param]));
      });
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

