// src/airport-phrasebook.js
// Offline Airport & Port-of-Entry Phrasebook for Newcomers
// Designed for international arrivals at Pearson, Heathrow, JFK, Sydney, Frankfurt, Dubai, etc.
// Fully cached offline via Service Worker; includes phonetics, official officer questions,
// recommended newcomer replies, multilingual translations, and border crossing dos & don'ts.

export const AIRPORT_CATEGORIES = [
  { id: 'border_inspection', name: 'Passport Control & Primary Inspection', icon: '🛂' },
  { id: 'customs_declaration', name: 'Customs, Currency & Food Declarations', icon: '📋' },
  { id: 'secondary_examination', name: 'Secondary Screening & Permit Issuance', icon: '📑' },
  { id: 'baggage_claim', name: 'Baggage Claim & Lost Property', icon: '🧳' },
  { id: 'airport_transit', name: 'Ground Transit, SIM & Currency Exchange', icon: '🚆' },
  { id: 'emergency_assistance', name: 'Emergency Assistance & Translation Help', icon: '🚨' }
];

export const AIRPORT_PHRASES = [
  // --- Category 1: Border Inspection ---
  {
    id: 'air_01_purpose_of_travel',
    category: 'border_inspection',
    officer_question_en: 'What is the purpose of your trip, and what type of visa/status are you entering on?',
    newcomer_response_en: 'I am landing as a new permanent resident / international student / temporary foreign worker. Here is my passport and Port of Entry Letter of Introduction.',
    translations: {
      hi: 'मैं एक नए स्थायी निवासी / अंतर्राष्ट्रीय छात्र / अस्थायी विदेशी कामगार के रूप में आ रहा हूँ। यह मेरा पासपोर्ट और पोर्ट ऑफ एंट्री पत्र है।',
      pa: 'ਮੈਂ ਇੱਕ ਨਵੇਂ ਪੱਕੇ ਵਸਨੀਕ / ਅੰਤਰਰਾਸ਼ਟਰੀ ਵਿਦਿਆਰਥੀ / ਵਿਦੇਸ਼ੀ ਕਾਮੇ ਵਜੋਂ ਪਹੁੰਚਿਆ ਹਾਂ। ਇਹ ਮੇਰਾ ਪਾਸਪੋਰਟ ਅਤੇ ਪੋਰਟ ਆਫ਼ ਐਂਟਰੀ ਪੱਤਰ ਹੈ।',
      es: 'Estoy ingresando como nuevo residente permanente / estudiante internacional / trabajador temporal. Aquí está mi pasaporte y carta de aprobación.',
      fr: 'J\'arrive en tant que nouveau résident permanent / étudiant international / travailleur étranger temporaire. Voici mon passeport et ma lettre d\'introduction.',
      ar: 'أنا قادم كمقيم دائم جديد / طالب دولي / عامل أجنبي مؤقت. إليك جواز سفري وخطاب الموافقة عند نقطة الدخول.'
    },
    phonetic_pronunciation_hi: 'आइ ऍम लैंडिंग ऐज़ अ न्यू परमानेंट रेजिडेंट... हेयर इज़ माइ पासपोर्ट एंड पोर्ट ऑफ एंट्री लेटर ऑफ इंट्रोडक्शन।',
    phonetic_pronunciation_pa: 'ਆਈ ਐਮ ਲੈਂਡਿੰਗ ਐਜ਼ ਅ ਨਿਊ ਪਰਮਾਨੈਂਟ ਰੈਜ਼ੀਡੈਂਟ... ਹੇਅਰ ਇਜ਼ ਮਾਈ ਪਾਸਪੋਰਟ ਐਂਡ ਪੋਰਟ ਆਫ਼ ਐਂਟਰੀ ਲੈਟਰ।',
    critical_dos_and_donts: 'DO keep your Port of Entry (POE) letter, acceptance letter, and proof of funds in your carry-on bag, NEVER in checked luggage.'
  },
  {
    id: 'air_02_duration_and_funds',
    category: 'border_inspection',
    officer_question_en: 'Where will you be staying, and how are you supporting yourself financially?',
    newcomer_response_en: 'I will be staying at [Address/Hotel]. Here is my bank balance statement and proof of tuition/living funds.',
    translations: {
      hi: 'मैं [पते/होटल] पर ठहरूँगा। यह मेरा बैंक स्टेटमेंट और फंड का प्रमाण है।',
      pa: 'ਮੈਂ [ਪਤੇ/ਹੋਟਲ] \'ਤੇ ਠਹਿਰਾਂਗਾ। ਇਹ ਮੇਰਾ ਬੈਂਕ ਬਿਆਨ ਅਤੇ ਫੰਡਾਂ ਦਾ ਸਬੂਤ ਹੈ।',
      es: 'Me alojaré en [Dirección/Hotel]. Aquí está mi estado de cuenta bancario y fondos suficientes.',
      fr: 'Je vais séjourner à [Adresse/Hôtel]. Voici mon relevé bancaire et ma preuve de fonds.',
      ar: 'سأقيم في [العنوان/الفندق]. إليك كشف حسابي البنكي وإثبات الأموال الكافية للعيش.'
    },
    phonetic_pronunciation_hi: 'आइ विल बी स्टेइंग एट [एड्रेस/होटल]। हेयर इज़ माइ बैंक बैलेंस स्टेटमेंट एंड प्रूफ ऑफ फंड्स।',
    phonetic_pronunciation_pa: 'ਆਈ ਵਿਲ ਬੀ ਸਟੇਇੰਗ ਐਟ [ਪਤਾ/ਹੋਟਲ]। ਹੇਅਰ ਇਜ਼ ਮਾਈ ਬੈਂਕ ਬੈਲੇਂਸ ਸਟੇਟਮੈਂਟ।',
    critical_dos_and_donts: 'Provide exact address. If staying at an Airbnb or hotel temporarily, show the booking reservation.'
  },
  {
    id: 'air_03_return_ticket',
    category: 'border_inspection',
    officer_question_en: 'Do you have a return ticket or funds to depart at the end of your authorized stay?',
    newcomer_response_en: 'I hold an authorized multi-year study/work permit, and I have sufficient liquid funds to purchase an outbound flight when my authorized stay concludes.',
    translations: {
      hi: 'मेरे पास बहु-वर्षीय अध्ययन/कार्य परमिट है, और अधिकृत प्रवास समाप्त होने पर वापसी टिकट खरीदने के लिए पर्याप्त धन उपलब्ध है।',
      pa: 'ਮੇਰੇ ਕੋਲ ਬਹੁ-ਸਾਲਾ ਸਟੱਡੀ/ਵਰਕ ਪਰਮਿਟ ਹੈ, ਅਤੇ ਵੀਜ਼ਾ ਖ਼ਤਮ ਹੋਣ \'ਤੇ ਵਾਪਸੀ ਟਿਕਟ ਖ਼ਰੀਦਣ ਲਈ ਮੇਰੇ ਕੋਲ ਪੂਰੇ ਪੈਸੇ ਹਨ।',
      es: 'Poseo un permiso de estudio/trabajo de varios años y cuento con fondos suficientes para adquirir un vuelo de regreso al finalizar.',
      fr: 'Je détiens un permis d\'études/travail de plusieurs années et j\'ai les fonds nécessaires pour acheter un billet de retour à l\'échéance.',
      ar: 'أحمل تصريح دراسة/عمل لعدة سنوات، ولدي أموال كافية لشراء تذكرة العودة عند انتهاء فترة إقامتي المصرح بها.'
    },
    phonetic_pronunciation_hi: 'आइ होल्ड एन ऑथराइज़्ड मल्टी-ईयर स्टडी परमिट, एंड आइ हैव सफिशिएंट फंड्स टू परचेज़ एन आउटबाउंड फ्लाइट।',
    phonetic_pronunciation_pa: 'ਆਈ ਹੋਲਡ ਐਨ ਔਥਰਾਈਜ਼ਡ ਮਲਟੀ-ਈਅਰ ਸਟੱਡੀ ਪਰਮਿਟ, ਐਂਡ ਆਈ ਹੈਵ ਸਫ਼ੀਸ਼ੈਂਟ ਫੰਡਸ।',
    critical_dos_and_donts: 'Do not panic if asked about a return ticket; show your course/job duration documents.'
  },

  // --- Category 2: Customs & Declarations ---
  {
    id: 'air_04_cash_declaration',
    category: 'customs_declaration',
    officer_question_en: 'Are you carrying cash, negotiable instruments, or monetary instruments equal to or exceeding 10,000 dollars?',
    newcomer_response_en: 'Yes, officer. I am carrying [Exact Amount] in currency/bank drafts, and I have completed the E677 / FinCEN / cross-border declaration form.',
    translations: {
      hi: 'हाँ अधिकारी महोदय। मैं [सटीक राशि] नकद/ड्राफ्ट लेकर आ रहा हूँ और मैंने सीमा पार मुद्रा घोषणा प्रपत्र भर दिया है।',
      pa: 'ਹਾਂਜੀ ਅਫ਼ਸਰ ਸਾਹਿਬ। ਮੈਂ [ਸਹੀ ਰਕਮ] ਨਕਦੀ/ਡਰਾਫ਼ਟ ਲੈ ਕੇ ਆਇਆ ਹਾਂ ਅਤੇ ਮੈਂ ਡੈਕਲੇਰੇਸ਼ਨ ਫ਼ਾਰਮ ਭਰ ਦਿੱਤਾ ਹੈ।',
      es: 'Sí, oficial. Llevo [Monto Exacto] en efectivo/giros y he completado el formulario de declaración transfronteriza.',
      fr: 'Oui, agent. Je transporte [Montant Exact] en devises/traites et j\'ai rempli le formulaire de déclaration transfrontalière.',
      ar: 'نعم سيدي الضابط. أنا أحمل [المبلغ بالتحديد] نقداً أو شيكات مصرفية، وقمت بتعبئة استمارة الإفصاح المالي عبر الحدود.'
    },
    phonetic_pronunciation_hi: 'यस ऑफिसर। आइ ऍम कैरिंग [एग्जैक्ट अमाउंट] इन करंसी, एंड आइ हैव कंप्लीटेड द डिक्लेरेशन फॉर्म।',
    phonetic_pronunciation_pa: 'ਯੈੱਸ ਅਫ਼ਸਰ। ਆਈ ਐਮ ਕੈਰੀਇੰਗ [ਰਕਮ] ਇਨ ਕਰੰਸੀ, ਐਂਡ ਆਈ ਹੈਵ ਕੰਪਲੀਟਿਡ ਦਾ ਡੈਕਲੇਰੇਸ਼ਨ ਫ਼ਾਰਮ।',
    critical_dos_and_donts: 'CRITICAL WARNING: Bringing over ,000 is permitted to bring over $10,000, but failing to declare it can lead to immediate seizure and severe fines.'
  },
  {
    id: 'air_05_food_agriculture',
    category: 'customs_declaration',
    officer_question_en: 'Are you bringing any food, plants, seeds, spices, meat, dairy, or traditional herbal medicines?',
    newcomer_response_en: 'Yes, officer. I have packed commercially packaged and sealed spices/tea. Here is the full itemized list on my declaration.',
    translations: {
      hi: 'हाँ अधिकारी महोदय। मैंने व्यावसायिक रूप से सील किए गए मसाले/चाय रखी है। यह मेरी घोषणा पर पूरी सूची है।',
      pa: 'ਹਾਂਜੀ ਸਰ। ਮੇਰੇ ਕੋਲ ਪੈਕ ਕੀਤੇ ਅਤੇ ਸੀਲਬੰਦ ਮਸਾਲੇ/ਚਾਹ ਹਨ। ਇਹ ਮੇਰੀ ਡੈਕਲੇਰੇਸ਼ਨ ਵਿੱਚ ਪੂਰੀ ਲਿਸਟ ਹੈ।',
      es: 'Sí, oficial. Traigo especias/té sellados comercialmente. Aquí está la lista detallada en mi declaración.',
      fr: 'Oui, agent. J\'ai emballé des épices/thé scellés commercialement. Voici la liste détaillée sur ma déclaration.',
      ar: 'نعم يا سيدي. أحمل توابل وشاي مغلف ومختوم تجارياً. إليك القائمة المفصلة في إقراري الجمركي.'
    },
    phonetic_pronunciation_hi: 'यस ऑफिसर। आइ हैव पैक्ड कमर्शियली पैकेज्ड स्पाइसेस। हेयर इज़ द फुल लिस्ट।',
    phonetic_pronunciation_pa: 'ਯੈੱਸ ਅਫ਼ਸਰ। ਆਈ ਹੈਵ ਪੈਕਡ ਕਮਰਸ਼ੀਅਲੀ ਪੈਕੇਜਡ ਮਸਾਲੇ। ਹੇਅਰ ਇਜ਼ ਦਾ ਲਿਸਟ।',
    critical_dos_and_donts: 'NEVER bring fresh meat, dairy, fruits, or plants. ALWAYS declare any commercially packaged food or face an instant $1,300 statutory fine.'
  },

  // --- Category 3: Secondary Examination & Permits ---
  {
    id: 'air_06_permit_issuance',
    category: 'secondary_examination',
    officer_question_en: 'Please proceed to secondary immigration queue B for document validation and study/work permit printing.',
    newcomer_response_en: 'Understood. Thank you. I have my passport, LOI, university enrollment letter, and proof of medical exam ready.',
    translations: {
      hi: 'समझ गया, धन्यवाद। मेरे पास पासपोर्ट, एलओआई, विश्वविद्यालय नामांकन पत्र और मेडिकल जांच का प्रमाण तैयार है।',
      pa: 'ਸਮਝ ਗਿਆ ਜੀ, ਧੰਨਵਾਦ। ਮੇਰੇ ਕੋਲ ਪਾਸਪੋਰਟ, ਲੈਟਰ ਆਫ਼ ਇੰਟਰੋਡਕਸ਼ਨ, ਕਾਲਜ ਦਾ ਦਾਖ਼ਲਾ ਪੱਤਰ ਅਤੇ ਮੈਡੀਕਲ ਸਬੂਤ ਤਿਆਰ ਹਨ।',
      es: 'Entendido, gracias. Tengo listo mi pasaporte, carta de introducción, matrícula y examen médico.',
      fr: 'Compris, merci. J\'ai mon passeport, lettre d\'introduction, inscription scolaire et examen médical prêts.',
      ar: 'مفهوم، شكراً لك. جواز سفري وخطاب التقديم وشهادة القيد الجامعي والفحص الطبي جاهزة.'
    },
    phonetic_pronunciation_hi: 'अंडरस्टूड। थैंक यू। आइ हैव माइ पासपोर्ट, एलओआई, एंड एनरोलमेंट लेटर रेडी।',
    phonetic_pronunciation_pa: 'ਅੰਡਰਸਟੂਡ। ਥੈਂਕ ਯੂ। ਆਈ ਹੈਵ ਮਾਈ ਪਾਸਪੋਰਟ ਐਂਡ ਐਨਰੋਲਮੈਂਟ ਲੈਟਰ ਰੈਡੀ।',
    critical_dos_and_donts: 'CRUCIAL: Before leaving the immigration desk, carefully check your printed permit for spelling of your name, date of birth, and work condition remarks.'
  },

  // --- Category 4: Baggage Claim & Lost Property ---
  {
    id: 'air_07_delayed_baggage',
    category: 'baggage_claim',
    officer_question_en: 'Baggage service agent: Did your checked bags fail to arrive on the carousel carousel 6?',
    newcomer_response_en: 'Yes, my flight was [Flight Number]. My two checked bags did not appear. Here are my baggage claim tags and destination delivery address.',
    translations: {
      hi: 'हाँ, मेरी उड़ान [फ्लाइट नंबर] थी। मेरे दो बैग नहीं आए। यह मेरे बैगेज टैग और डिलीवरी का पता है।',
      pa: 'ਹਾਂਜੀ, ਮੇਰੀ ਫਲਾਈਟ [ਨੰਬਰ] ਸੀ। ਮੇਰੇ ਦੋ ਬੈਗ ਨਹੀਂ ਆਏ। ਇਹ ਮੇਰੇ ਬੈਗੇਜ ਟੈਗ ਅਤੇ ਡਿਲੀਵਰੀ ਦਾ ਪਤਾ ਹਨ।',
      es: 'Sí, mi vuelo fue [Número]. No llegaron mis dos maletas. Aquí están mis contraseñas de equipaje y dirección.',
      fr: 'Oui, mon vol était le [Numéro]. Mes deux bagages ne sont pas arrivés. Voici mes reçus et mon adresse de livraison.',
      ar: 'نعم، كانت رحلتي رقم [رقم الرحلة]. حقيبتاي لم تصلا. إليك بطاقات استلام الأمتعة وعنوان التوصيل.'
    },
    phonetic_pronunciation_hi: 'यस, माइ फ्लाइट वाज़ [नंबर]। माइ टू बैग्ज़ डिड नॉट अपीयर। हेयर आर माइ क्लेम टैग्स।',
    phonetic_pronunciation_pa: 'ਯੈੱਸ, ਮਾਈ ਫ਼ਲਾਈਟ ਵਾਜ਼ [ਨੰਬਰ]। ਮਾਈ ਟੂ ਬੈਗਜ਼ ਡਿਡ ਨਾਟ ਅਪੀਅਰ। ਹੇਅਰ ਆਰ ਮਾਈ ਟੈਗਜ਼।',
    critical_dos_and_donts: 'Keep the Property Irregularity Report (PIR) number safe. Airlines must deliver your delayed luggage directly to your home address free of charge.'
  },

  // --- Category 5: Ground Transit & Connectivity ---
  {
    id: 'air_08_airport_transit',
    category: 'airport_transit',
    officer_question_en: 'Information desk / Transit kiosk: Can I help you with public transit, express trains, or airport taxi vouchers?',
    newcomer_response_en: 'Yes, please. What is the fastest and most economical way to reach downtown [City] by train or subway, and where can I buy a reloadable transit card?',
    translations: {
      hi: 'हाँ कृपया। ट्रेन या मेट्रो द्वारा [शहर] के डाउनटाउन पहुँचने का सबसे तेज़ और किफायती तरीका क्या है, और मुझे ट्रांजिट कार्ड कहाँ मिलेगा?',
      pa: 'ਹਾਂਜੀ ਕਿਰਪਾ ਕਰਕੇ। ਟਰੇਨ ਜਾਂ ਮੈਟਰੋ ਰਾਹੀਂ ਸ਼ਹਿਰ ਪਹੁੰਚਣ ਦਾ ਸਭ ਤੋਂ ਤੇਜ਼ ਅਤੇ ਸਸਤਾ ਰਸਤਾ ਕਿਹੜਾ ਹੈ, ਅਤੇ ਕਾਰਡ ਕਿੱਥੋਂ ਮਿਲੇਗਾ?',
      es: 'Sí, por favor. ¿Cuál es la forma más rápida y económica de llegar al centro en tren o metro y dónde compro la tarjeta?',
      fr: 'Oui, s\'il vous plaît. Quel est le moyen le plus rapide et économique d\'aller au centre-ville et où acheter le titre de transport ?',
      ar: 'نعم من فضلك. ما هي أسرع وأوفر وسيلة للوصول إلى وسط المدينة بالقطار، وأين يمكنني شراء بطاقة المواصلات؟'
    },
    phonetic_pronunciation_hi: 'यस, प्लीज़। वॉट इज़ द फास्टेस्ट वे टू रीच डाउनटाउन बाय ट्रेन, एंड वेयर कैन आइ बाय अ ट्रांजिट कार्ड?',
    phonetic_pronunciation_pa: 'ਯੈੱਸ, ਪਲੀਜ਼। ਵਾਟ ਇਜ਼ ਦਾ ਫ਼ਾਸਟੈਸਟ ਵੇਅ ਟੂ ਰੀਚ ਡਾਊਨਟਾਊਨ ਬਾਏ ਟਰੇਨ?',
    critical_dos_and_donts: 'Take official licensed taxis or public transit express trains (e.g., UP Express in Toronto, Heathrow Express in London, Airtrain in NYC/Brisbane). Never accept rides from unlicensed individuals soliciting inside arrival terminals.'
  },

  // --- Category 6: Emergency Assistance & Translation Help ---
  {
    id: 'air_09_interpreter_request',
    category: 'emergency_assistance',
    officer_question_en: 'Official / Medical officer: Do you require language assistance or medical evaluation?',
    newcomer_response_en: 'Officer, I speak [Hindi / Punjabi / Spanish / French / Arabic]. I respectfully request an official interpreter to ensure accurate communication.',
    translations: {
      hi: 'अधिकारी महोदय, मैं [हिन्दी/पंजाबी] बोलता हूँ। सटीक बातचीत सुनिश्चित करने के लिए मैं आधिकारिक दुभाषिया (इंटरप्रेटर) का सादर अनुरोध करता हूँ।',
      pa: 'ਅਫ਼ਸਰ ਸਾਹਿਬ, ਮੈਂ [ਪੰਜਾਬੀ/ਹਿੰਦੀ] ਬੋਲਦਾ ਹਾਂ। ਸਹੀ ਗੱਲਬਾਤ ਲਈ ਮੈਂ ਸਰਕਾਰੀ ਦੁਭਾਸ਼ੀਏ (ਇੰਟਰਪ੍ਰੇਟਰ) ਦੀ ਬੇਨਤੀ ਕਰਦਾ ਹਾਂ।',
      es: 'Oficial, hablo español. Solicito respetuosamente un intérprete oficial para asegurar una comunicación precisa.',
      fr: 'Agent, je parle français. Je demande respectueusement un interprète officiel pour faciliter notre échange.',
      ar: 'سيدي الضابط، أنا أتحدث اللغة العربية. أطلب باحترام توفير مترجم فوري رسمي لضمان دقة التواصل.'
    },
    phonetic_pronunciation_hi: 'ऑफिसर, आइ रिस्पेक्टफुली रिक्वेस्ट एन ऑफिशियल इंटरप्रेटर टू एन्श्योर एक्यूरेट कम्युनिकेशन।',
    phonetic_pronunciation_pa: 'ਅਫ਼ਸਰ, ਆਈ ਰਿਸਪੈਕਟਫੁੱਲੀ ਰਿਕੁਐਸਟ ਐਨ ਔਫ਼ੀਸ਼ੀਅਲ ਇੰਟਰਪ੍ਰੇਟਰ।',
    critical_dos_and_donts: 'You have a statutory right to an interpreter at government border inspections if you do not understand questions clearly. Never guess an answer.'
  }
];

/**
 * Returns available airport dialogue categories.
 */
export function getAirportCategories() {
  return [...AIRPORT_CATEGORIES];
}

/**
 * Retrieves phrases with optional category and query filtering.
 */
export function getAirportPhrases({
  category = null,
  query = '',
  lang = 'en'
} = {}) {
  const q = String(query).toLowerCase().trim();
  const c = category ? String(category).toLowerCase().trim() : null;
  const l = String(lang).toLowerCase().trim().slice(0, 2);

  let results = AIRPORT_PHRASES.filter(phrase => {
    if (c && phrase.category !== c) return false;
    if (!q) return true;

    const enQ = phrase.officer_question_en.toLowerCase();
    const enA = phrase.newcomer_response_en.toLowerCase();
    const trans = (phrase.translations[l] || '').toLowerCase();
    const tips = phrase.critical_dos_and_donts.toLowerCase();

    return enQ.includes(q) || enA.includes(q) || trans.includes(q) || tips.includes(q);
  });

  return results.map(p => ({
    id: p.id,
    category: p.category,
    officer_question_en: p.officer_question_en,
    newcomer_response_en: p.newcomer_response_en,
    translation: p.translations[l] || p.translations.en || p.newcomer_response_en,
    translations: p.translations,
    phonetic: l === 'hi' ? p.phonetic_pronunciation_hi : (l === 'pa' ? p.phonetic_pronunciation_pa : null),
    critical_dos_and_donts: p.critical_dos_and_donts
  }));
}

/**
 * Retrieves a single phrase by ID.
 */
export function getAirportPhraseById(phraseId) {
  if (!phraseId) return null;
  return AIRPORT_PHRASES.find(p => p.id === phraseId) || null;
}
