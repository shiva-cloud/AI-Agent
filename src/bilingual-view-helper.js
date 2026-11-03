// src/bilingual-view-helper.js
// Bilingual Side-by-Side Statute & Vernacular Presentation Helper
// Formats legal answers and official statutory citations into synchronized side-by-side columns:
// Left: Vernacular Plain Explanation (Hindi, Punjabi, Spanish, French, Arabic)
// Right: Authentic English Statutory Citation & Official Legal Text

import { getLocaleDictionary } from './ui-locale-dictionary.js';
import { boundedText, safeIsoDate, todayIso } from './text-input.js';

const COMMON_STATUTORY_PHRASES = {
  hi: [
    [/must not/gi, 'नहीं होना चाहिए (अनिवार्य निषेध)'],
    [/shall provide/gi, 'प्रदान करना अनिवार्य होगा'],
    [/as prescribed/gi, 'यथा निर्धारित'],
    [/within (\d+) days/gi, '$1 दिनों के भीतर'],
    [/without penalty/gi, 'बिना किसी दंड के'],
    [/written notice/gi, 'लिखित सूचना'],
    [/landlord/gi, 'मकान मालिक'],
    [/tenant/gi, 'किरायेदार'],
    [/security deposit/gi, 'सुरक्षा जमा'],
    [/lawful rent/gi, 'वैध किराया']
  ],
  pa: [
    [/must not/gi, 'ਨਹੀਂ ਕਰ ਸਕਦਾ (ਸਖ਼ਤ ਮਨਾਹੀ)'],
    [/shall provide/gi, 'ਮੁਹੱਈਆ ਕਰਵਾਉਣਾ ਲਾਜ਼ਮੀ ਹੋਵੇਗਾ'],
    [/as prescribed/gi, 'ਨਿਰਧਾਰਿਤ ਨਿਯਮਾਂ ਅਨੁਸਾਰ'],
    [/within (\d+) days/gi, '$1 ਦਿਨਾਂ ਦੇ ਅੰਦਰ'],
    [/without penalty/gi, 'ਬਿਨਾਂ ਕਿਸੇ ਜੁਰਮਾਨੇ ਦੇ'],
    [/written notice/gi, 'ਲਿਖਤੀ ਨੋਟਿਸ'],
    [/landlord/gi, 'ਮਕਾਨ ਮਾਲਕ'],
    [/tenant/gi, 'ਕਿਰਾਏਦਾਰ'],
    [/security deposit/gi, 'ਸਕਿਓਰਿਟੀ ਡਿਪਾਜ਼ਿਟ'],
    [/lawful rent/gi, 'ਕਾਨੂੰਨੀ ਕਿਰਾਇਆ']
  ]
};

/**
 * Generate side-by-side bilingual payload for any statutory text.
 */
export function generateBilingualView({
  text = '',
  targetLocale = 'hi',
  sourceId = null,
  citationTitle = 'Official Statutory Source',
  assessmentDate = todayIso()
} = {}) {
  const normLocale = boundedText(targetLocale, 'hi', 10).toLowerCase().trim().slice(0, 2);
  const dict = getLocaleDictionary(normLocale);
  const cleanDate = safeIsoDate(assessmentDate, todayIso());

  // Only text is displayed; any other type would render as "[object Object]".
  const englishStatute = boundedText(
    typeof text === 'string' ? text : typeof text === 'number' ? String(text) : '',
    '',
    50000
  ).trim();
  const safeCitationTitle = boundedText(citationTitle, 'Official Statutory Source', 200);
  const safeSourceId = typeof sourceId === 'string' && sourceId.trim() ? boundedText(sourceId, 'statutory_source', 100) : null;
  let vernacularText = englishStatute;

  // Apply vernacular phrase translations for key legal keywords
  const phrases = COMMON_STATUTORY_PHRASES[normLocale] || [];
  for (const [regex, replacement] of phrases) {
    vernacularText = vernacularText.replace(regex, `**${replacement}**`);
  }

  const localeNames = {
    hi: 'हिन्दी (Hindi Plain Language)',
    pa: 'ਪੰਜਾਬੀ (Punjabi Plain Language)',
    es: 'Español (Lenguaje Claro)',
    fr: 'Français (Langage Clair)',
    ar: 'العربية (لغة واضحة)',
    en: 'English (Plain Language)'
  };

  return {
    sourceId: safeSourceId || 'statutory_source',
    citationTitle: safeCitationTitle,
    targetLocale: normLocale,
    assessmentDate: cleanDate,
    bilingualLayout: {
      leftColumn: {
        language: normLocale,
        label: localeNames[normLocale] || 'Vernacular Plain Language',
        direction: normLocale === 'ar' ? 'rtl' : 'ltr',
        content: vernacularText
      },
      rightColumn: {
        language: 'en',
        label: 'Official English Statutory Text',
        direction: 'ltr',
        content: englishStatute
      }
    },
    statutoryDisclaimer: dict.disclaimer_text
  };
}
