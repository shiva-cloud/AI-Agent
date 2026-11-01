// src/ui-locale-dictionary.js
// Comprehensive Multilingual UI Dictionary for Northstar Settlement Intelligence
// Provides localized interface strings for English, Hindi (हिन्दी), and Punjabi (ਪੰਜਾਬੀ).
// Supports full UI toggling, instant DOM updates, and fallback mechanisms.

export const SUPPORTED_LOCALES = ['en', 'hi', 'pa'];

export const UI_DICTIONARIES = {
  en: {
    // Brand & Workspace
    brand_sub: 'SETTLEMENT INTELLIGENCE',
    workspace_label: 'YOUR WORKSPACE',
    all_tools_cta: 'All Tools Directory',
    all_tools_sub: '60+ Navigators by Category',

    // Navigation Groups
    nav_group_chat: '💬 CHAT & CASEWORK',
    nav_group_pre_imm: '⚖ PRE-IMMIGRATION & VISAS',
    nav_group_arrival: '✈ ARRIVAL & FIRST 30 DAYS',
    nav_group_housing: '🛡 HOUSING & SETTLEMENT',
    nav_group_finance: '💰 JOBS, TAXES & MONEY',
    nav_group_health: '🏥 HEALTH & FAMILIES',
    nav_group_life: '🌱 DAILY LIFE & CIVICS',
    nav_group_resources: '📚 RESOURCES & TOOLS',
    nav_group_reference: '🧭 STATUTES & REFERENCE',

    // Nav Items
    nav_ask: 'Ask Northstar',
    nav_casework: 'Immigration workspace',
    nav_pathway: 'Pathway comparison',
    nav_binder: 'Document Binder',
    nav_forms: 'Government forms',
    nav_airport: 'Airport arrival kit',
    nav_journey: '180-Day roadmap',
    nav_sos: 'Emergency help',
    nav_housing: 'Tenant rights',
    nav_calculator: 'Settlement cost calculator',
    nav_sin: 'SIN & Tax guide',
    nav_childcare: 'Childcare & schooling',
    nav_scams: 'Scam prevention guard',
    nav_browse: 'Browse statutory records',
    nav_glossary: 'Multilingual Glossary',
    nav_phrasebook: 'Airport Phrasebook',
    nav_admin: 'Admin Console',

    // Common Buttons & Actions
    btn_ask: 'Ask Question',
    btn_search: 'Search',
    btn_submit: 'Submit',
    btn_clear: 'Clear',
    btn_copy: 'Copy',
    btn_listen: 'Listen',
    btn_stop: 'Stop',
    btn_bilingual: 'Bilingual View',
    btn_print: 'Print Guide',
    btn_export_pdf: 'Export PDF',
    btn_close: 'Close',
    btn_endorse: 'Endorse Translation',

    // Badges & Labels
    badge_verified: 'Verified Statutory Evidence',
    badge_zero_pii: 'Zero-PII Encrypted',
    badge_offline_ready: 'Available Offline',
    badge_statute_citation: 'Statutory Source Citation',
    label_destination_country: 'Destination Country',
    label_destination_city: 'City / Municipality',
    label_accent: 'Accent',
    label_legal_disclaimer: 'Legal Disclaimer',

    // Placeholders
    placeholder_ask_input: 'e.g. Can my landlord ask for 6 months rent upfront in Ontario?',
    placeholder_search_glossary: 'Search settlement terms (e.g. Maintained Status, OHIP, Security Deposit)...',
    placeholder_search_phrasebook: 'Search airport & border crossing phrases...',

    // Legal Disclaimer
    disclaimer_text: 'Northstar provides statutory reference and settlement navigation assistance based on official legislation. It does not constitute formal legal counsel. Always verify with official authorities or licensed immigration practitioners.'
  },

  hi: {
    // Brand & Workspace
    brand_sub: 'सेटलमेंट इंटेलिजेंस',
    workspace_label: 'आपका कार्यक्षेत्र',
    all_tools_cta: 'सभी उपकरण डायरेक्टरी',
    all_tools_sub: 'श्रेणी अनुसार 60+ नेविगेटर्स',

    // Navigation Groups
    nav_group_chat: '💬 चैट एवं केसवर्क',
    nav_group_pre_imm: '⚖ पूर्व-आप्रवासन एवं वीज़ा',
    nav_group_arrival: '✈ आगमन एवं शुरुआती 30 दिन',
    nav_group_housing: '🛡 आवास एवं पुनर्वास',
    nav_group_finance: '💰 रोज़गार, कर एवं वित्त',
    nav_group_health: '🏥 स्वास्थ्य एवं परिवार',
    nav_group_life: '🌱 दैनिक जीवन एवं नागरिकता',
    nav_group_resources: '📚 संसाधन एवं उपकरण',
    nav_group_reference: '🧭 वैधानिक संदर्भ',

    // Nav Items
    nav_ask: 'नॉर्थस्टार से पूछें',
    nav_casework: 'इमिग्रेशन वर्कस्पेस',
    nav_pathway: 'मार्ग तुलना',
    nav_binder: 'दस्तावेज़ बाइंडर',
    nav_forms: 'सरकारी प्रपत्र',
    nav_airport: 'हवाई अड्डा आगमन किट',
    nav_journey: '180-दिवसीय रोडमैप',
    nav_sos: 'आपातकालीन सहायता',
    nav_housing: 'किरायेदार अधिकार',
    nav_calculator: 'सेटलमेंट लागत कैलकुलेटर',
    nav_sin: 'एसआईएन एवं टैक्स गाइड',
    nav_childcare: 'शिशु देखभाल एवं स्कूल',
    nav_scams: 'धोखाधड़ी निवारण गार्ड',
    nav_browse: 'वैधानिक रिकॉर्ड्स ब्राउज़ करें',
    nav_glossary: 'बहुभाषी शब्दावली',
    nav_phrasebook: 'एयरपोर्ट वाक्यांश-पुस्तिका',
    nav_admin: 'प्रशासन कंसोल',

    // Common Buttons & Actions
    btn_ask: 'प्रश्न पूछें',
    btn_search: 'खोजें',
    btn_submit: 'जमा करें',
    btn_clear: 'साफ़ करें',
    btn_copy: 'प्रतिलिपि करें',
    btn_listen: 'सुनें (ऑडियो)',
    btn_stop: 'रोकें',
    btn_bilingual: 'द्विभाषी दृश्य',
    btn_print: 'गाइड प्रिंट करें',
    btn_export_pdf: 'पीडीएफ निर्यात करें',
    btn_close: 'बंद करें',
    btn_endorse: 'अनुवाद समर्थन करें',

    // Badges & Labels
    badge_verified: 'सत्यापित वैधानिक साक्ष्य',
    badge_zero_pii: 'शून्य-पीआईआई एन्क्रिप्टेड',
    badge_offline_ready: 'ऑफ़लाइन उपलब्ध',
    badge_statute_citation: 'आधिकारिक कानूनी उद्धरण',
    label_destination_country: 'गंतव्य देश',
    label_destination_city: 'शहर / नगर पालिका',
    label_accent: 'उच्चारण शैली',
    label_legal_disclaimer: 'कानूनी अस्वीकरण',

    // Placeholders
    placeholder_ask_input: 'उदा. क्या ओंटारियो में मकान मालिक 6 महीने का किराया अग्रिम मांग सकता है?',
    placeholder_search_glossary: 'सेटलमेंट शब्द खोजें (उदा. मेंटेंड स्टेटस, ओहिप, सिक्योरिटी डिपॉजिट)...',
    placeholder_search_phrasebook: 'हवाई अड्डे व सीमा जांच वाक्यांश खोजें...',

    // Legal Disclaimer
    disclaimer_text: 'नॉर्थस्टार आधिकारिक वैधानिक नियमों के आधार पर सूचना और मार्गदर्शन प्रदान करता है। यह औपचारिक कानूनी सलाह नहीं है। अंतिम निर्णय से पूर्व अधिकृत अधिकारियों या पंजीकृत वकीलों से परामर्श करें।'
  },

  pa: {
    // Brand & Workspace
    brand_sub: 'ਸੈਟਲਮੈਂਟ ਇੰਟੈਲੀਜੈਂਸ',
    workspace_label: 'ਤੁਹਾਡਾ ਵਰਕਸਪੇਸ',
    all_tools_cta: 'ਸਾਰੇ ਟੂਲਜ਼ ਡਾਇਰੈਕਟਰੀ',
    all_tools_sub: 'ਸ਼੍ਰੇਣੀ ਅਨੁਸਾਰ 60+ ਨੇਵੀਗੇਟਰਜ਼',

    // Navigation Groups
    nav_group_chat: '💬 ਗੱਲਬਾਤ ਅਤੇ ਕੇਸਵਰਕ',
    nav_group_pre_imm: '⚖ ਇਮੀਗ੍ਰੇਸ਼ਨ ਤੋਂ ਪਹਿਲਾਂ ਅਤੇ ਵੀਜ਼ਾ',
    nav_group_arrival: '✈ ਪਹੁੰਚਣਾ ਅਤੇ ਪਹਿਲੇ 30 ਦਿਨ',
    nav_group_housing: '🛡 ਰਿਹਾਇਸ਼ ਅਤੇ ਵਸੇਬਾ',
    nav_group_finance: '💰 ਨੌਕਰੀਆਂ, ਟੈਕਸ ਅਤੇ ਪੈਸੇ',
    nav_group_health: '🏥 ਸਿਹਤ ਅਤੇ ਪਰਿਵਾਰ',
    nav_group_life: '🌱 ਰੋਜ਼ਾਨਾ ਜੀਵਨ ਅਤੇ ਅਧਿਕਾਰ',
    nav_group_resources: '📚 ਸਰੋਤ ਅਤੇ ਟੂਲਜ਼',
    nav_group_reference: '🧭 ਕਾਨੂੰਨੀ ਨਿਯਮ ਅਤੇ ਸੰਦਰਭ',

    // Nav Items
    nav_ask: 'ਨਾਰਥਸਟਾਰ ਨੂੰ ਪੁੱਛੋ',
    nav_casework: 'ਇਮੀਗ੍ਰੇਸ਼ਨ ਵਰਕਸਪੇਸ',
    nav_pathway: 'ਰਸਤੇ ਦੀ ਤੁਲਨਾ',
    nav_binder: 'ਦਸਤਾਵੇਜ਼ ਬਾਇੰਡਰ',
    nav_forms: 'ਸਰਕਾਰੀ ਫ਼ਾਰਮ',
    nav_airport: 'ਏਅਰਪੋਰਟ ਪਹੁੰਚ ਕਿੱਟ',
    nav_journey: '180-ਦਿਨਾਂ ਦਾ ਰੋਡਮੈਪ',
    nav_sos: 'ਐਮਰਜੈਂਸੀ ਮਦਦ',
    nav_housing: 'ਕਿਰਾਏਦਾਰਾਂ ਦੇ ਹੱਕ',
    nav_calculator: 'ਵਸੇਬਾ ਖ਼ਰਚਾ ਕੈਲਕੁਲੇਟਰ',
    nav_sin: 'ਸਿਨ (SIN) ਅਤੇ ਟੈਕਸ ਗਾਈਡ',
    nav_childcare: 'ਬਾਲ ਦੇਖਭਾਲ ਅਤੇ ਸਕੂਲ',
    nav_scams: 'ਧੋਖਾਧੜੀ ਰੋਕਥਾਮ ਗਾਰਡ',
    nav_browse: 'ਕਾਨੂੰਨੀ ਰਿਕਾਰਡ ਵੇਖੋ',
    nav_glossary: 'ਬਹੁ-ਭਾਸ਼ਾਈ ਸ਼ਬਦਕੋਸ਼',
    nav_phrasebook: 'ਏਅਰਪੋਰਟ ਵਾਕਾਂਸ਼-ਪੁਸਤਕ',
    nav_admin: 'ਐਡਮਿਨ ਕੰਸੋਲ',

    // Common Buttons & Actions
    btn_ask: 'ਸਵਾਲ ਪੁੱਛੋ',
    btn_search: 'ਖੋਜੋ',
    btn_submit: 'ਜਮ੍ਹਾਂ ਕਰੋ',
    btn_clear: 'ਸਾਫ਼ ਕਰੋ',
    btn_copy: 'ਕਾਪੀ ਕਰੋ',
    btn_listen: 'ਸੁਣੋ (ਆਡੀਓ)',
    btn_stop: 'ਰੋਕੋ',
    btn_bilingual: 'ਦੋਭਾਸ਼ੀ ਦ੍ਰਿਸ਼',
    btn_print: 'ਗਾਈਡ ਪ੍ਰਿੰਟ ਕਰੋ',
    btn_export_pdf: 'ਪੀਡੀਐਫ ਐਕਸਪੋਰਟ',
    btn_close: 'ਬੰਦ ਕਰੋ',
    btn_endorse: 'ਅਨੁਵਾਦ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',

    // Badges & Labels
    badge_verified: 'ਤਸਦੀਕਸ਼ੁਦਾ ਕਾਨੂੰਨੀ ਸਬੂਤ',
    badge_zero_pii: 'ਜ਼ੀਰੋ-ਪੀਆਈਆਈ ਐਨਕ੍ਰਿਪਟਡ',
    badge_offline_ready: 'ਔਫ਼ਲਾਈਨ ਉਪਲਬਧ',
    badge_statute_citation: 'ਅਧਿਕਾਰਤ ਕਾਨੂੰਨੀ ਹਵਾਲਾ',
    label_destination_country: 'ਮੰਜ਼ਿਲ ਦੇਸ਼',
    label_destination_city: 'ਸ਼ਹਿਰ / ਮਿਊਂਸਪੈਲਟੀ',
    label_accent: 'ਬੋਲਣ ਦਾ ਲਹਿਜਾ',
    label_legal_disclaimer: 'ਕਾਨੂੰਨੀ ਬੇਦਾਅਵਾ',

    // Placeholders
    placeholder_ask_input: 'ਉਦਾਹਰਣ: ਕੀ ਉਨਟਾਰੀਓ ਵਿੱਚ ਮਕਾਨ ਮਾਲਕ 6 ਮਹੀਨੇ ਦਾ ਕਿਰਾਇਆ ਪੇਸ਼ਗੀ ਮੰਗ ਸਕਦਾ ਹੈ?',
    placeholder_search_glossary: 'ਸੈਟਲਮੈਂਟ ਸ਼ਬਦ ਖੋਜੋ (ਜਿਵੇਂ ਕਿ ਮੇਨਟੇਨਡ ਸਟੇਟਸ, ਓਹਿਪ, ਸਕਿਓਰਿਟੀ ਡਿਪਾਜ਼ਿਟ)...',
    placeholder_search_phrasebook: 'ਏਅਰਪੋਰਟ ਅਤੇ ਇਮੀਗ੍ਰੇਸ਼ਨ ਵਾਕਾਂਸ਼ ਖੋਜੋ...',

    // Legal Disclaimer
    disclaimer_text: 'ਨਾਰਥਸਟਾਰ ਅਧਿਕਾਰਤ ਕਾਨੂੰਨੀ ਨਿਯਮਾਂ ਦੇ ਅਧਾਰ ਤੇ ਸੂਚਨਾ ਅਤੇ ਸੇਧ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ। ਇਹ ਰਸਮੀ ਕਾਨੂੰਨੀ ਸਲਾਹ ਨਹੀਂ ਹੈ। ਕੋਈ ਵੀ ਕਦਮ ਚੁੱਕਣ ਤੋਂ ਪਹਿਲਾਂ ਸਰਕਾਰੀ ਅਧਿਕਾਰੀਆਂ ਜਾਂ ਲਾਇਸੰਸਸ਼ੁਦਾ ਵਕੀਲਾਂ ਨਾਲ ਪੁਸ਼ਟੀ ਕਰੋ।'
  }
};

/**
 * Returns supported language codes.
 */
export function getSupportedLocales() {
  return [...SUPPORTED_LOCALES];
}

/**
 * Returns dictionary for a given locale with fallback to English.
 */
export function getLocaleDictionary(locale = 'en') {
  const norm = String(locale).toLowerCase().trim().slice(0, 2);
  return UI_DICTIONARIES[norm] || UI_DICTIONARIES.en;
}

/**
 * Translates a key for a given locale.
 */
export function translateKey(key, locale = 'en') {
  const dict = getLocaleDictionary(locale);
  if (dict && dict[key]) return dict[key];
  return UI_DICTIONARIES.en[key] || key;
}
