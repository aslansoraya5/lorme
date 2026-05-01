import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, ...args: any[]) => string;
  formatCurrency: (value: number) => string;
  formatDate: (dateStr: string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved && ['en', 'dr', 'ps'].includes(saved) ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, ...args: any[]): string => {
    const langTranslations = translations[language];
    const value = langTranslations[key];
    
    if (typeof value === 'function') {
      return (value as (...args: any[]) => string)(...args);
    }
    if (typeof value === 'string') {
      return value;
    }
    // Fallback to English
    const enValue = translations.en[key];
    if (typeof enValue === 'function') {
      return (enValue as (...args: any[]) => string)(...args);
    }
    return typeof enValue === 'string' ? enValue : key;
  };

  const isRTL = language === 'dr' || language === 'ps';

  const locale = language === 'dr' ? 'fa-AF' : language === 'ps' ? 'ps-AF' : 'en-AF';

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);

  const formatCurrency = (value: number) => {
    const amount = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
    return language === 'en' ? `AFN ${amount}` : `${amount} افغانی`;
  };

  const formatDate = (dateStr: string, options?: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, options ?? { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));

  // Apply RTL to document
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'dr' ? 'fa' : language === 'ps' ? 'ps' : 'en';
  }, [isRTL, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatCurrency, formatDate, formatNumber, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
