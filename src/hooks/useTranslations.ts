import { useLanguage } from '@/contexts/LanguageContext';

export function useTranslations(namespace?: string) {
  const { messages } = useLanguage();

  return (key: string) => {
    if (!messages) return key;
    
    const keys = namespace ? `${namespace}.${key}` : key;
    const keyPath = keys.split('.');
    
    let value = messages;
    for (const k of keyPath) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return value || key;
  };
}
