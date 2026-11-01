// Language Preference Auto-Detection & Interface Localizer (Rec 132)
// Evaluates client Accept-Language headers and browser navigator.languages
// to automatically recommend localized newcomer guides and settlement rights.

export const SUPPORTED_I18N_LOCALES = {
  hi: { code: 'hi', name: 'हिन्दी', label: 'Hindi', view: 'languages' },
  pa: { code: 'pa', name: 'ਪੰਜਾਬੀ', label: 'Punjabi', view: 'languages' },
  fr: { code: 'fr', name: 'Français', label: 'French', view: 'languages' },
  es: { code: 'es', name: 'Español', label: 'Spanish', view: 'languages' },
  zh: { code: 'zh', name: '简体中文', label: 'Simplified Chinese', view: 'languages' },
  ar: { code: 'ar', name: 'العربية', label: 'Arabic', dir: 'rtl', view: 'languages' },
  en: { code: 'en', name: 'English', label: 'English', view: 'ask' }
};

export function detectPreferredLanguage(acceptLanguageHeader = '') {
  if (!acceptLanguageHeader || typeof acceptLanguageHeader !== 'string') {
    return { detected: 'en', confidence: 1.0, isRtl: false, meta: SUPPORTED_I18N_LOCALES.en };
  }

  // Parse RFC 2616 Accept-Language (e.g., "hi-IN,hi;q=0.9,en-US;q=0.8,en;q=0.7")
  const tags = acceptLanguageHeader
    .split(',')
    .map(part => {
      const [lang, qPart] = part.trim().split(';');
      const q = qPart ? parseFloat(qPart.replace(/^q=/, '')) : 1.0;
      const primaryLang = lang.split('-')[0].toLowerCase();
      return { lang: primaryLang, q };
    })
    .sort((a, b) => b.q - a.q);

  for (const tag of tags) {
    if (SUPPORTED_I18N_LOCALES[tag.lang]) {
      const match = SUPPORTED_I18N_LOCALES[tag.lang];
      return {
        detected: match.code,
        confidence: tag.q,
        isRtl: match.dir === 'rtl',
        meta: match
      };
    }
  }

  return { detected: 'en', confidence: 1.0, isRtl: false, meta: SUPPORTED_I18N_LOCALES.en };
}
