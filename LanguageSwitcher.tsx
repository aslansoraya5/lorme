import { useLanguage } from '../contexts/LanguageContext';
import { languages } from '../i18n/translations';

export default function LanguageSwitcher() {
  const { language, setLanguage, isRTL } = useLanguage();

  return (
    <div className={`flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all touch-manipulation ${
            language === lang.code
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {lang.native}
        </button>
      ))}
    </div>
  );
}
