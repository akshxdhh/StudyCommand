import { describe, it, expect } from 'vitest';
import { translate, TRANSLATIONS, SUPPORTED_LANGUAGES } from '../../i18n';

describe('Internationalization (i18n) Engine', () => {
  it('should support all 4 configured languages', () => {
    expect(SUPPORTED_LANGUAGES.map((l) => l.code)).toEqual(['en', 'es', 'ml', 'hi']);
  });

  it('should translate dashboard keys correctly across all languages', () => {
    expect(translate('nav.dashboard', 'en')).toBe('Dashboard');
    expect(translate('nav.dashboard', 'es')).toBe('Panel Principal');
    expect(translate('nav.dashboard', 'ml')).toBe('ഡാഷ്‌ബോർഡ്');
    expect(translate('nav.dashboard', 'hi')).toBe('डैशबोर्ड');
  });

  it('should translate focus mode keys correctly', () => {
    expect(translate('focus.title', 'en')).toBe('Focus Mode');
    expect(translate('focus.title', 'es')).toBe('Modo de Enfoque');
    expect(translate('focus.title', 'ml')).toBe('ഫോക്കസ് മോഡ്');
    expect(translate('focus.title', 'hi')).toBe('फोकस मोड');
  });

  it('should fall back to English if an unsupported language is provided', () => {
    // @ts-expect-error testing invalid language code
    const res = translate('nav.planner', 'fr');
    expect(res).toBe('Study Planner');
  });

  it('should ensure translation dictionaries have identical keys for consistency', () => {
    const enKeys = Object.keys(TRANSLATIONS.en).sort();
    const esKeys = Object.keys(TRANSLATIONS.es).sort();
    const mlKeys = Object.keys(TRANSLATIONS.ml).sort();
    const hiKeys = Object.keys(TRANSLATIONS.hi).sort();

    expect(esKeys).toEqual(enKeys);
    expect(mlKeys).toEqual(enKeys);
    expect(hiKeys).toEqual(enKeys);
  });
});
