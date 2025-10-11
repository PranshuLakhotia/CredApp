'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
  messages: any;
  setMessages: (messages: any) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState('en');
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    // Check for stored language preference
    const storedLanguage = typeof window !== 'undefined' 
      ? localStorage.getItem('preferred-language') || 'en'
      : 'en';
    
    setLocale(storedLanguage);
    loadMessages(storedLanguage);
  }, []);

  const loadMessages = async (languageCode: string) => {
    try {
      const msgs = await import(`../../messages/${languageCode}.json`);
      setMessages(msgs.default);
    } catch (error) {
      // Fallback to English if language file doesn't exist
      const msgs = await import('../../messages/en.json');
      setMessages(msgs.default);
    }
  };

  const handleSetLocale = async (newLocale: string) => {
    setLocale(newLocale);
    localStorage.setItem('preferred-language', newLocale);
    await loadMessages(newLocale);
  };

  const value = {
    locale,
    setLocale: handleSetLocale,
    messages,
    setMessages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
