// Multilingual UI Translation & Emergency Survival Glossary
// Provides essential newcomer statutory rights, emergency scripts, and navigation
// terms in Canada's official languages and major newcomer mother tongues:
// French (fr), Hindi (hi), Punjabi (pa), Simplified Chinese (zh), and Spanish (es).

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', isDefault: true },
  { code: 'fr', name: 'French', native: 'Français', isOfficial: true },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'zh', name: 'Simplified Chinese', native: '简体中文' },
  { code: 'es', name: 'Spanish', native: 'Español' }
];

export const UI_LABELS = {
  en: {
    askNorthstar: 'Ask Northstar',
    cityPlaceholder: 'Choose Canadian city',
    emergencySOS: 'Emergency SOS Toolkit',
    tenantWizard: 'Tenant Rights Wizard',
    cityComparator: 'City Comparison Tool',
    findGuidance: 'Find Guidance',
    sourceVerified: 'Sourced from Official Records',
    honestGap: 'Data Gap / Pending Human Review',
    lockoutTitle: 'Illegal Landlord Lockout Tonight',
    lockoutCallout: 'ONLY a Sheriff with an LTB court order can evict a tenant or change locks.',
    healthcareTitle: 'Emergency Medical Care Without OHIP/MSP',
    healthcareCallout: 'Hospital Emergency Departments cannot deny life-saving stabilizing care.',
    bankingTitle: 'Right to Open a Bank Account (Bank Act s.627.17)',
    bankingCallout: 'Banks cannot refuse an account for lack of job or local credit history.'
  },
  fr: {
    askNorthstar: 'Demandez à Northstar',
    cityPlaceholder: 'Choisissez une ville canadienne',
    emergencySOS: 'Trousse d\'urgence SOS',
    tenantWizard: 'Assistant des droits des locataires',
    cityComparator: 'Outil de comparaison des villes',
    findGuidance: 'Obtenir des conseils',
    sourceVerified: 'Issu de sources officielles',
    honestGap: 'Lacune dans les données / Examen en attente',
    lockoutTitle: 'Expulsion illégale ce soir',
    lockoutCallout: 'SEUL un shérif avec une ordonnance du tribunal peut changer les serrures.',
    healthcareTitle: 'Soins médicaux d\'urgence sans assurance maladie',
    healthcareCallout: 'Les urgences hospitalières ne peuvent refuser des soins vitaux.',
    bankingTitle: 'Droit d\'ouvrir un compte bancaire (Loi sur les banques art. 627.17)',
    bankingCallout: 'Les banques ne peuvent refuser l\'ouverture pour absence d\'emploi.'
  },
  hi: {
    askNorthstar: 'नॉर्थस्टार से पूछें',
    cityPlaceholder: 'कनाडाई शहर चुनें',
    emergencySOS: 'आपातकालीन एसओएस टूलकिट',
    tenantWizard: 'किरायेदार अधिकार विज़ार्ड',
    cityComparator: 'शहर तुलना टूल',
    findGuidance: 'मार्गदर्शन खोजें',
    sourceVerified: 'आधिकारिक स्रोतों से सत्यापित',
    honestGap: 'सत्यापन पेंडिंग / आधिकारिक डेटा गैप',
    lockoutTitle: 'मकान मालिक द्वारा अवैध रूप से ताला बदलना',
    lockoutCallout: 'केवल एलटीबी कोर्ट ऑर्डर वाले शेरिफ ही आपको बेदखल कर सकते हैं। मकान मालिक खुद ताला नहीं बदल सकता।',
    healthcareTitle: 'हेल्थ कार्ड (OHIP/MSP) के बिना आपातकालीन चिकित्सा',
    healthcareCallout: 'अस्पताल के इमरजेंसी वार्ड जानलेवा स्थिति में इलाज से मना नहीं कर सकते।',
    bankingTitle: 'बैंक खाता खोलने का कानूनी अधिकार (बैंक एक्ट s.627.17)',
    bankingCallout: 'कनाडाई बैंक नौकरी या क्रेडिट हिस्ट्री न होने पर खाता खोलने से मना नहीं कर सकते।'
  },
  pa: {
    askNorthstar: 'ਨੌਰਥਸਟਾਰ ਨੂੰ ਪੁੱਛੋ',
    cityPlaceholder: 'ਕੈਨੇਡੀਅਨ ਸ਼ਹਿਰ ਚੁਣੋ',
    emergencySOS: 'ਐਮਰਜੈਂਸੀ ਐਸਓਐਸ ਟੂਲਕਿੱਟ',
    tenantWizard: 'ਕਿਰਾਏਦਾਰਾਂ ਦੇ ਹੱਕ',
    cityComparator: 'ਸ਼ਹਿਰਾਂ ਦੀ ਤੁਲਨਾ',
    findGuidance: 'ਸੇਧ ਪ੍ਰਾਪਤ ਕਰੋ',
    sourceVerified: 'ਸਰਕਾਰੀ ਸਰੋਤਾਂ ਤੋਂ ਤਸਦੀਕਸ਼ੁਦਾ',
    honestGap: 'ਡਾਟਾ ਗੈਪ / ਰਿਵਿਊ ਬਾਕੀ',
    lockoutTitle: 'ਮਕਾਨ ਮਾਲਕ ਵੱਲੋਂ ਗੈਰ-ਕਾਨੂੰਨੀ ਤਾਲਾਬੰਦੀ',
    lockoutCallout: 'ਸਿਰਫ ਅਦਾਲਤੀ ਆਰਡਰ ਵਾਲਾ ਸ਼ੈਰਿਫ ਹੀ ਘਰ ਖਾਲੀ ਕਰਵਾ ਸਕਦਾ ਹੈ।',
    healthcareTitle: 'ਬਿਨਾਂ ਹੈਲਥ ਕਾਰਡ ਦੇ ਐਮਰਜੈਂਸੀ ਇਲਾਜ',
    healthcareCallout: 'ਹਸਪਤਾਲ ਐਮਰਜੈਂਸੀ ਵੇਲੇ ਇਲਾਜ ਕਰਨ ਤੋਂ ਇਨਕਾਰ ਨਹੀਂ ਕਰ ਸਕਦੇ।',
    bankingTitle: 'ਬੈਂਕ ਖਾਤਾ ਖੋਲ੍ਹਣ ਦਾ ਕਾਨੂੰਨੀ ਹੱਕ (ਬੈਂਕ ਐਕਟ s.627.17)',
    bankingCallout: 'ਬੈਂਕ ਬਿਨਾਂ ਨੌਕਰੀ ਜਾਂ ਕ੍ਰੈਡਿਟ ਹਿਸਟਰੀ ਦੇ ਖਾਤਾ ਖੋਲ੍ਹਣ ਤੋਂ ਮਨ੍ਹਾ ਨਹੀਂ ਕਰ ਸਕਦੇ।'
  },
  zh: {
    askNorthstar: '向北极星咨询',
    cityPlaceholder: '选择加拿大城市',
    emergencySOS: '紧急求助工具箱',
    tenantWizard: '租户权益向导',
    cityComparator: '城市对比工具',
    findGuidance: '查找指引',
    sourceVerified: '经官方记录核实',
    honestGap: '数据空缺 / 等待人工审核',
    lockoutTitle: '今夜遭遇房东非法换锁驱逐',
    lockoutCallout: '只有持有房东及租客委员会（LTB）法院命令的法警才能执行驱逐。',
    healthcareTitle: '无省医保情况下的急诊就医',
    healthcareCallout: '医院急诊室不得拒绝挽救生命的紧急救治。',
    bankingTitle: '开立银行账户的法定权利（《银行法》第627.17条）',
    bankingCallout: '银行不得因缺乏本地工作或信用记录而拒绝开户。'
  },
  es: {
    askNorthstar: 'Preguntar a Northstar',
    cityPlaceholder: 'Elija una ciudad canadiense',
    emergencySOS: 'Kit de emergencia SOS',
    tenantWizard: 'Asistente de derechos del inquilino',
    cityComparator: 'Herramienta de comparación de ciudades',
    findGuidance: 'Buscar orientación',
    sourceVerified: 'Verificado con fuentes oficiales',
    honestGap: 'Brecha de datos / En revisión humana',
    lockoutTitle: 'Desalojo o cambio de cerraduras ilegal esta noche',
    lockoutCallout: 'SOLO un Sheriff con orden judicial del LTB puede desalojar a un inquilino.',
    healthcareTitle: 'Atención médica de emergencia sin seguro de salud',
    healthcareCallout: 'Las salas de emergencia no pueden negar atención médica vital.',
    bankingTitle: 'Derecho a abrir una cuenta bancaria (Ley de Bancos art. 627.17)',
    bankingCallout: 'Los bancos no pueden denegar una cuenta por falta de empleo o historial crediticio.'
  }
};

/**
 * Returns localized survival UI terms and statutory emergency summaries.
 * Falls back to English if requested code is unsupported.
 * @param {string} langCode 
 * @returns {object}
 */
export function getLocalizedKit(langCode = 'en') {
  let code = (typeof langCode === 'string' ? langCode.toLowerCase().trim() : 'en');
  const aliasMap = {
    hindi: 'hi',
    punjabi: 'pa',
    chinese: 'zh',
    spanish: 'es',
    french: 'fr',
    english: 'en'
  };
  if (aliasMap[code]) code = aliasMap[code];
  const labels = UI_LABELS[code] || UI_LABELS.en;
  return {
    language: UI_LABELS[code] ? code : 'en',
    labels,
    supportedLanguages: SUPPORTED_LANGUAGES
  };
}
