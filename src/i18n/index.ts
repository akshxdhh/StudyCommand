import { TRANSLATIONS, TranslationKey, LanguageCode } from './translations';

export * from './translations';

export const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
];

export function translate(key: TranslationKey, lang: LanguageCode = 'en', fallback?: string): string {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.en;
  if (dictionary && dictionary[key]) {
    return dictionary[key];
  }
  // Fallback to English
  if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
    return TRANSLATIONS.en[key];
  }
  return fallback || key;
}

export function useTranslation(currentLang: LanguageCode = 'en') {
  return {
    t: (key: TranslationKey, fallback?: string) => translate(key, currentLang, fallback),
    lang: currentLang,
    languages: SUPPORTED_LANGUAGES,
  };
}
