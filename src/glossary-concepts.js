// Real content for the concept entries of the multilingual settlement glossary.
//
// The glossary's ids 17-500 combine one of 12 settlement areas with one of 41
// everyday procedural concepts (for example "Tenancy & Housing Code: Appeal
// Right"). Each entry's definition is the concept's plain-language meaning
// followed by a sentence on who handles it in that area in Canada, in all six
// glossary languages. Definitions are general guidance written in the
// November 2026 KB audit; translations other than English have not been
// reviewed by native speakers yet.

const LANGS = ['en', 'hi', 'pa', 'es', 'fr', 'ar'];

// Id prefix -> category, area label and "who handles it" sentence.
export const GLOSSARY_AREAS = {
  imm: {
    category: 'immigration',
    label: { en: 'Immigration & Status Policy', hi: 'इमिग्रेशन एवं स्थिति नियम', pa: 'ਇਮੀਗ੍ਰੇਸ਼ਨ ਅਤੇ ਦਰਜਾ ਨਿਯਮ', es: 'Inmigración y Estado Legal', fr: 'Immigration et Statut', ar: 'الهجرة والوضع القانوني' },
    context: {
      en: 'In immigration matters, check the official immigration department (in Canada, IRCC) or the border agency (CBSA) for the current rule.',
      hi: 'इमिग्रेशन से जुड़े मामलों में मौजूदा नियम के लिए आधिकारिक इमिग्रेशन विभाग (कनाडा में IRCC) या सीमा एजेंसी (CBSA) की जानकारी देखें।',
      pa: 'ਇਮੀਗ੍ਰੇਸ਼ਨ ਨਾਲ ਜੁੜੇ ਮਾਮਲਿਆਂ ਵਿੱਚ ਮੌਜੂਦਾ ਨਿਯਮ ਲਈ ਸਰਕਾਰੀ ਇਮੀਗ੍ਰੇਸ਼ਨ ਵਿਭਾਗ (ਕੈਨੇਡਾ ਵਿੱਚ IRCC) ਜਾਂ ਸਰਹੱਦੀ ਏਜੰਸੀ (CBSA) ਦੀ ਜਾਣਕਾਰੀ ਵੇਖੋ।',
      es: 'En asuntos de inmigración, consulte el departamento oficial de inmigración (en Canadá, IRCC) o la agencia fronteriza (CBSA) para conocer la regla vigente.',
      fr: "En matière d'immigration, consultez le ministère officiel de l'immigration (au Canada, IRCC) ou l'agence frontalière (ASFC) pour connaître la règle en vigueur.",
      ar: 'في مسائل الهجرة، راجع إدارة الهجرة الرسمية (في كندا IRCC) أو وكالة الحدود (CBSA) لمعرفة القاعدة الحالية.'
    }
  },
  house: {
    category: 'housing',
    label: { en: 'Tenancy & Housing Code', hi: 'आवास एवं किरायेदारी संहिता', pa: 'ਕਿਰਾਏਦਾਰੀ ਅਤੇ ਰਿਹਾਇਸ਼ੀ ਨਿਯਮ', es: 'Código de Vivienda e Inquilinato', fr: 'Logement et Droits Locatifs', ar: 'قوانين الإسكان والإيجار' },
    context: {
      en: "For rental housing, these rules come from provincial tenancy law and are applied by bodies such as Ontario's Landlord and Tenant Board or British Columbia's Residential Tenancy Branch.",
      hi: 'किराये के मकान के लिए ये नियम प्रांतीय किरायेदारी कानून से आते हैं और ओंटारियो के Landlord and Tenant Board या ब्रिटिश कोलंबिया की Residential Tenancy Branch जैसी संस्थाएं इन्हें लागू करती हैं।',
      pa: 'ਕਿਰਾਏ ਦੇ ਮਕਾਨ ਲਈ ਇਹ ਨਿਯਮ ਸੂਬਾਈ ਕਿਰਾਏਦਾਰੀ ਕਾਨੂੰਨ ਤੋਂ ਆਉਂਦੇ ਹਨ ਅਤੇ ਓਨਟਾਰੀਓ ਦਾ Landlord and Tenant Board ਜਾਂ ਬ੍ਰਿਟਿਸ਼ ਕੋਲੰਬੀਆ ਦੀ Residential Tenancy Branch ਵਰਗੀਆਂ ਸੰਸਥਾਵਾਂ ਇਨ੍ਹਾਂ ਨੂੰ ਲਾਗੂ ਕਰਦੀਆਂ ਹਨ।',
      es: 'En la vivienda de alquiler, estas reglas provienen de la ley provincial de arrendamiento y las aplican organismos como el Landlord and Tenant Board de Ontario o la Residential Tenancy Branch de Columbia Británica.',
      fr: "Pour le logement locatif, ces règles viennent du droit provincial de la location et sont appliquées par des organismes comme la Commission de la location immobilière de l'Ontario ou la Residential Tenancy Branch de la Colombie-Britannique.",
      ar: 'في السكن المؤجر، تأتي هذه القواعد من قانون الإيجار في المقاطعة، وتطبقها جهات مثل مجلس المالكين والمستأجرين في أونتاريو أو مكتب الإيجارات السكنية في كولومبيا البريطانية.'
    }
  },
  health: {
    category: 'healthcare',
    label: { en: 'Healthcare & Public Coverage', hi: 'स्वास्थ्य सेवा एवं सार्वजनिक बीमा', pa: 'ਸਿਹਤ ਸੰਭਾਲ ਅਤੇ ਸਰਕਾਰੀ ਕਵਰੇਜ', es: 'Atención Médica y Cobertura Pública', fr: 'Santé et Couverture Publique', ar: 'الرعاية الصحية والتأمين العام' },
    context: {
      en: 'For public health coverage, your provincial or territorial health plan (such as OHIP in Ontario or MSP in British Columbia) sets the rules.',
      hi: 'सरकारी स्वास्थ्य बीमा के नियम आपके प्रांत या क्षेत्र की स्वास्थ्य योजना (जैसे ओंटारियो में OHIP या ब्रिटिश कोलंबिया में MSP) तय करती है।',
      pa: 'ਸਰਕਾਰੀ ਸਿਹਤ ਬੀਮੇ ਦੇ ਨਿਯਮ ਤੁਹਾਡੇ ਸੂਬੇ ਜਾਂ ਖੇਤਰ ਦੀ ਸਿਹਤ ਯੋਜਨਾ (ਜਿਵੇਂ ਓਨਟਾਰੀਓ ਵਿੱਚ OHIP ਜਾਂ ਬ੍ਰਿਟਿਸ਼ ਕੋਲੰਬੀਆ ਵਿੱਚ MSP) ਤੈਅ ਕਰਦੀ ਹੈ।',
      es: 'Para la cobertura médica pública, el plan de salud de su provincia o territorio (como OHIP en Ontario o MSP en Columbia Británica) fija las reglas.',
      fr: "Pour l'assurance maladie publique, le régime de votre province ou territoire (comme l'OHIP en Ontario ou le MSP en Colombie-Britannique) fixe les règles.",
      ar: 'بالنسبة للتأمين الصحي العام، تحدد القواعد خطة الصحة في مقاطعتك أو إقليمك (مثل OHIP في أونتاريو أو MSP في كولومبيا البريطانية).'
    }
  },
  emp: {
    category: 'employment',
    label: { en: 'Labor Standards & Employment', hi: 'श्रम मानक एवं रोज़गार अधिकार', pa: 'ਲੇਬਰ ਸਟੈਂਡਰਡ ਅਤੇ ਨੌਕਰੀ ਹੱਕ', es: 'Normas Laborales y Empleo', fr: 'Normes du Travail et Emploi', ar: 'معايير العمل والتوظيف' },
    context: {
      en: 'At work, provincial or federal employment standards apply, and the labour ministry handles complaints about unpaid wages or unfair treatment.',
      hi: 'नौकरी में प्रांतीय या संघीय रोज़गार मानक लागू होते हैं, और बकाया वेतन या गलत व्यवहार की शिकायतें श्रम मंत्रालय देखता है।',
      pa: 'ਨੌਕਰੀ ਵਿੱਚ ਸੂਬਾਈ ਜਾਂ ਫ਼ੈਡਰਲ ਰੁਜ਼ਗਾਰ ਮਿਆਰ ਲਾਗੂ ਹੁੰਦੇ ਹਨ, ਅਤੇ ਬਕਾਇਆ ਤਨਖਾਹ ਜਾਂ ਗਲਤ ਵਿਹਾਰ ਦੀਆਂ ਸ਼ਿਕਾਇਤਾਂ ਲੇਬਰ ਮੰਤਰਾਲਾ ਵੇਖਦਾ ਹੈ।',
      es: 'En el trabajo se aplican las normas laborales provinciales o federales, y el ministerio de trabajo atiende las quejas por salarios impagos o trato injusto.',
      fr: "Au travail, les normes d'emploi provinciales ou fédérales s'appliquent, et le ministère du Travail traite les plaintes pour salaire impayé ou traitement injuste.",
      ar: 'في العمل تُطبق معايير التوظيف في المقاطعة أو الاتحادية، وتتولى وزارة العمل الشكاوى المتعلقة بالأجور غير المدفوعة أو المعاملة غير العادلة.'
    }
  },
  bank: {
    category: 'banking_finance',
    label: { en: 'Banking & Financial Safeguards', hi: 'बैंकिंग एवं वित्तीय सुरक्षा', pa: 'ਬੈਂਕਿੰਗ ਅਤੇ ਵਿੱਤੀ ਸੁਰੱਖਿਆ', es: 'Banca y Protección Financiera', fr: 'Services Bancaires et Finances', ar: 'الخدمات المصرفية والمالية' },
    context: {
      en: 'In banking, federally regulated banks follow federal rules, and the Financial Consumer Agency of Canada (FCAC) explains and enforces consumer rights.',
      hi: 'बैंकिंग में संघीय रूप से नियंत्रित बैंक संघीय नियमों का पालन करते हैं, और Financial Consumer Agency of Canada (FCAC) उपभोक्ता अधिकार समझाती और लागू करती है।',
      pa: 'ਬੈਂਕਿੰਗ ਵਿੱਚ ਫ਼ੈਡਰਲ ਤੌਰ ’ਤੇ ਨਿਯੰਤ੍ਰਿਤ ਬੈਂਕ ਫ਼ੈਡਰਲ ਨਿਯਮਾਂ ਦੀ ਪਾਲਣਾ ਕਰਦੇ ਹਨ, ਅਤੇ Financial Consumer Agency of Canada (FCAC) ਖਪਤਕਾਰ ਹੱਕ ਸਮਝਾਉਂਦੀ ਅਤੇ ਲਾਗੂ ਕਰਦੀ ਹੈ।',
      es: 'En la banca, los bancos regulados federalmente siguen reglas federales, y la Agencia de Consumo en Materia Financiera de Canadá (FCAC) explica y hace cumplir los derechos del consumidor.',
      fr: "Dans le secteur bancaire, les banques sous réglementation fédérale suivent les règles fédérales, et l'Agence de la consommation en matière financière du Canada (ACFC) explique et fait respecter les droits des consommateurs.",
      ar: 'في الخدمات المصرفية، تتبع البنوك الخاضعة للتنظيم الاتحادي القواعد الاتحادية، وتشرح وكالة حماية المستهلك المالي الكندية (FCAC) حقوق المستهلك وتطبقها.'
    }
  },
  tax: {
    category: 'taxes_benefits',
    label: { en: 'Tax Compliance & Social Benefits', hi: 'कर अनुपालन एवं सामाजिक लाभ', pa: 'ਟੈਕਸ ਨਿਯਮ ਅਤੇ ਸਮਾਜਿਕ ਲਾਭ', es: 'Cumplimiento Fiscal y Beneficios', fr: 'Fiscalité et Prestations Sociales', ar: 'الضرائب والإعانات الاجتماعية' },
    context: {
      en: 'For taxes and benefits, the Canada Revenue Agency (CRA) and provincial agencies set the rules and deadlines.',
      hi: 'कर और सरकारी लाभों के नियम और समय-सीमा कनाडा रेवेन्यू एजेंसी (CRA) और प्रांतीय एजेंसियां तय करती हैं।',
      pa: 'ਟੈਕਸ ਅਤੇ ਸਰਕਾਰੀ ਲਾਭਾਂ ਦੇ ਨਿਯਮ ਅਤੇ ਸਮਾਂ-ਸੀਮਾਵਾਂ ਕੈਨੇਡਾ ਰੈਵੇਨਿਊ ਏਜੰਸੀ (CRA) ਅਤੇ ਸੂਬਾਈ ਏਜੰਸੀਆਂ ਤੈਅ ਕਰਦੀਆਂ ਹਨ।',
      es: 'Para impuestos y prestaciones, la Agencia de Ingresos de Canadá (CRA) y los organismos provinciales fijan las reglas y los plazos.',
      fr: "Pour les impôts et les prestations, l'Agence du revenu du Canada (ARC) et les organismes provinciaux fixent les règles et les délais.",
      ar: 'بالنسبة للضرائب والإعانات، تحدد وكالة الإيرادات الكندية (CRA) والجهات الإقليمية القواعد والمواعيد النهائية.'
    }
  },
  edu: {
    category: 'education_childcare',
    label: { en: 'Education & Childcare Access', hi: 'शिक्षा एवं शिशु देखभाल सुविधा', pa: 'ਸਿੱਖਿਆ ਅਤੇ ਬਾਲ ਸੰਭਾਲ ਸਹੂਲਤ', es: 'Educación y Cuidado Infantil', fr: "Éducation et Garde d'Enfants", ar: 'التعليم ورعاية الأطفال' },
    context: {
      en: 'For schools and child care, the provincial ministry of education, local school boards and licensed child care centres set the rules.',
      hi: 'स्कूल और बाल देखभाल के नियम प्रांतीय शिक्षा मंत्रालय, स्थानीय स्कूल बोर्ड और लाइसेंस प्राप्त चाइल्ड केयर केंद्र तय करते हैं।',
      pa: 'ਸਕੂਲ ਅਤੇ ਬਾਲ ਸੰਭਾਲ ਦੇ ਨਿਯਮ ਸੂਬਾਈ ਸਿੱਖਿਆ ਮੰਤਰਾਲਾ, ਸਥਾਨਕ ਸਕੂਲ ਬੋਰਡ ਅਤੇ ਲਾਇਸੈਂਸ ਵਾਲੇ ਚਾਈਲਡ ਕੇਅਰ ਕੇਂਦਰ ਤੈਅ ਕਰਦੇ ਹਨ।',
      es: 'Para escuelas y cuidado infantil, el ministerio provincial de educación, las juntas escolares locales y los centros de cuidado infantil con licencia fijan las reglas.',
      fr: "Pour l'école et la garde d'enfants, le ministère provincial de l'Éducation, les conseils scolaires locaux et les services de garde agréés fixent les règles.",
      ar: 'بالنسبة للمدارس ورعاية الأطفال، تحدد القواعد وزارة التعليم في المقاطعة ومجالس المدارس المحلية ومراكز رعاية الأطفال المرخصة.'
    }
  },
  trans: {
    category: 'transport_licensing',
    label: { en: 'Driver Licensing & Transit', hi: 'ड्राइविंग लाइसेंस एवं परिवहन', pa: 'ਡਰਾਈਵਿੰਗ ਲਾਇਸੈਂਸ ਅਤੇ ਟਰਾਂਸਪੋਰਟ', es: 'Licencia de Conducir y Tránsito', fr: 'Permis de Conduire et Transport', ar: 'رخصة القيادة والمواصلات' },
    context: {
      en: 'For driving and transit, the provincial licensing authority (such as ServiceOntario or ICBC in British Columbia) and local transit agencies set the rules.',
      hi: 'ड्राइविंग और सार्वजनिक परिवहन के नियम प्रांतीय लाइसेंस प्राधिकरण (जैसे ServiceOntario या ब्रिटिश कोलंबिया में ICBC) और स्थानीय ट्रांज़िट एजेंसियां तय करती हैं।',
      pa: 'ਡਰਾਈਵਿੰਗ ਅਤੇ ਜਨਤਕ ਆਵਾਜਾਈ ਦੇ ਨਿਯਮ ਸੂਬਾਈ ਲਾਇਸੈਂਸ ਅਥਾਰਟੀ (ਜਿਵੇਂ ServiceOntario ਜਾਂ ਬ੍ਰਿਟਿਸ਼ ਕੋਲੰਬੀਆ ਵਿੱਚ ICBC) ਅਤੇ ਸਥਾਨਕ ਟਰਾਂਜ਼ਿਟ ਏਜੰਸੀਆਂ ਤੈਅ ਕਰਦੀਆਂ ਹਨ।',
      es: 'Para conducir y el transporte público, la autoridad provincial de licencias (como ServiceOntario o ICBC en Columbia Británica) y las agencias de tránsito locales fijan las reglas.',
      fr: "Pour la conduite et les transports en commun, l'autorité provinciale des permis (comme ServiceOntario ou ICBC en Colombie-Britannique) et les sociétés de transport locales fixent les règles.",
      ar: 'بالنسبة للقيادة والمواصلات العامة، تحدد القواعد جهة الترخيص في المقاطعة (مثل ServiceOntario أو ICBC في كولومبيا البريطانية) ووكالات النقل المحلية.'
    }
  },
  legal: {
    category: 'legal_rights',
    label: { en: 'Legal Rights & Statutory Protections', hi: 'कानूनी अधिकार एवं वैधानिक सुरक्षा', pa: 'ਕਾਨੂੰਨੀ ਹੱਕ ਅਤੇ ਨਿਯਮਤ ਸੁਰੱਖਿਆ', es: 'Derechos Legales y Protección', fr: 'Droits Juridiques et Protection', ar: 'الحقوق القانونية والحماية' },
    context: {
      en: 'For legal rights, provincial and federal laws, human rights commissions, courts and tribunals apply, and legal aid clinics can give free advice if you qualify.',
      hi: 'कानूनी अधिकारों के लिए प्रांतीय और संघीय कानून, मानवाधिकार आयोग, अदालतें और ट्रिब्यूनल लागू होते हैं, और योग्य होने पर लीगल एड क्लिनिक मुफ़्त सलाह दे सकते हैं।',
      pa: 'ਕਾਨੂੰਨੀ ਹੱਕਾਂ ਲਈ ਸੂਬਾਈ ਅਤੇ ਫ਼ੈਡਰਲ ਕਾਨੂੰਨ, ਮਨੁੱਖੀ ਅਧਿਕਾਰ ਕਮਿਸ਼ਨ, ਅਦਾਲਤਾਂ ਅਤੇ ਟ੍ਰਿਬਿਊਨਲ ਲਾਗੂ ਹੁੰਦੇ ਹਨ, ਅਤੇ ਯੋਗ ਹੋਣ ’ਤੇ ਲੀਗਲ ਏਡ ਕਲੀਨਿਕ ਮੁਫ਼ਤ ਸਲਾਹ ਦੇ ਸਕਦੇ ਹਨ।',
      es: 'Para los derechos legales se aplican las leyes provinciales y federales, las comisiones de derechos humanos, los tribunales y los organismos de adjudicación, y las clínicas de asistencia jurídica pueden asesorar gratis si usted califica.',
      fr: "Pour les droits juridiques, les lois provinciales et fédérales, les commissions des droits de la personne, les tribunaux judiciaires et administratifs s'appliquent, et les cliniques d'aide juridique peuvent conseiller gratuitement si vous êtes admissible.",
      ar: 'بالنسبة للحقوق القانونية، تُطبق قوانين المقاطعات والقوانين الاتحادية ولجان حقوق الإنسان والمحاكم والهيئات القضائية، ويمكن لعيادات المساعدة القانونية تقديم استشارة مجانية إذا كنت مؤهلاً.'
    }
  },
  emerg: {
    category: 'emergency_safety',
    label: { en: 'Emergency Services & Crisis Response', hi: 'आपातकालीन सेवाएं एवं संकट निवारण', pa: 'ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ ਅਤੇ ਰਾਹਤ', es: 'Servicios de Emergencia y Crisis', fr: "Services d'Urgence et Sécurité", ar: 'خدمات الطوارئ والاستجابة' },
    context: {
      en: 'In an emergency, call 9-1-1; for non-emergency help finding local services in Canada, call or text 2-1-1, and for a mental health crisis call or text 9-8-8.',
      hi: 'आपातकाल में 9-1-1 पर कॉल करें; कनाडा में स्थानीय सेवाएं खोजने में गैर-आपातकालीन मदद के लिए 2-1-1 पर कॉल या टेक्स्ट करें, और मानसिक स्वास्थ्य संकट में 9-8-8 पर कॉल या टेक्स्ट करें।',
      pa: 'ਐਮਰਜੈਂਸੀ ਵਿੱਚ 9-1-1 ’ਤੇ ਕਾਲ ਕਰੋ; ਕੈਨੇਡਾ ਵਿੱਚ ਸਥਾਨਕ ਸੇਵਾਵਾਂ ਲੱਭਣ ਲਈ ਗੈਰ-ਐਮਰਜੈਂਸੀ ਮਦਦ ਵਾਸਤੇ 2-1-1 ’ਤੇ ਕਾਲ ਜਾਂ ਟੈਕਸਟ ਕਰੋ, ਅਤੇ ਮਾਨਸਿਕ ਸਿਹਤ ਸੰਕਟ ਵਿੱਚ 9-8-8 ’ਤੇ ਕਾਲ ਜਾਂ ਟੈਕਸਟ ਕਰੋ।',
      es: 'En una emergencia, llame al 9-1-1; para ayuda no urgente para encontrar servicios locales en Canadá, llame o envíe un texto al 2-1-1, y en una crisis de salud mental llame o envíe un texto al 9-8-8.',
      fr: "En cas d'urgence, composez le 9-1-1; pour trouver des services locaux au Canada sans urgence, appelez ou textez le 2-1-1, et en cas de crise de santé mentale, appelez ou textez le 9-8-8.",
      ar: 'في حالات الطوارئ اتصل بالرقم 9-1-1؛ وللمساعدة غير الطارئة في العثور على الخدمات المحلية في كندا اتصل أو أرسل رسالة إلى 2-1-1، وفي أزمات الصحة النفسية اتصل أو أرسل رسالة إلى 9-8-8.'
    }
  },
  civic: {
    category: 'municipal_civics',
    label: { en: 'Municipal By-Laws & Community Civics', hi: 'नगरपालिका उपनियम एवं नागरिक सहभागिता', pa: 'ਮਿਊਂਸਪਲ ਕਾਨੂੰਨ ਅਤੇ ਨਾਗਰਿਕ ਜ਼ਿੰਮੇਵਾਰੀ', es: 'Regulaciones Municipales y Civismo', fr: 'Règlements Municipaux et Civisme', ar: 'اللوائح البلدية والمدنية' },
    context: {
      en: "For local matters, your city's by-laws apply, and in many Canadian cities you can call 3-1-1 to ask questions or make a complaint.",
      hi: 'स्थानीय मामलों में आपके शहर के उपनियम लागू होते हैं, और कनाडा के कई शहरों में सवाल पूछने या शिकायत करने के लिए 3-1-1 पर कॉल कर सकते हैं।',
      pa: 'ਸਥਾਨਕ ਮਾਮਲਿਆਂ ਵਿੱਚ ਤੁਹਾਡੇ ਸ਼ਹਿਰ ਦੇ ਉਪ-ਨਿਯਮ ਲਾਗੂ ਹੁੰਦੇ ਹਨ, ਅਤੇ ਕੈਨੇਡਾ ਦੇ ਕਈ ਸ਼ਹਿਰਾਂ ਵਿੱਚ ਸਵਾਲ ਪੁੱਛਣ ਜਾਂ ਸ਼ਿਕਾਇਤ ਕਰਨ ਲਈ 3-1-1 ’ਤੇ ਕਾਲ ਕਰ ਸਕਦੇ ਹੋ।',
      es: 'Para asuntos locales se aplican los reglamentos de su ciudad, y en muchas ciudades canadienses puede llamar al 3-1-1 para hacer preguntas o presentar una queja.',
      fr: 'Pour les questions locales, les règlements de votre ville s’appliquent, et dans de nombreuses villes canadiennes vous pouvez composer le 3-1-1 pour poser une question ou porter plainte.',
      ar: 'في الشؤون المحلية تُطبق لوائح مدينتك، وفي كثير من المدن الكندية يمكنك الاتصال بالرقم 3-1-1 لطرح الأسئلة أو تقديم شكوى.'
    }
  },
  prof: {
    category: 'professional_licensing',
    label: { en: 'Professional Accreditation & Trades', hi: 'व्यावसायिक मान्यता एवं ट्रेड लाइसेंस', pa: 'ਪੇਸ਼ੇਵਰ ਮਾਨਤਾ ਅਤੇ ਟਰੇਡ ਲਾਇਸੈਂਸ', es: 'Colegiatura y Certificación Laboral', fr: 'Agrément Professionnel et Métiers', ar: 'الاعتماد المهني والتراخيص' },
    context: {
      en: 'For regulated professions and trades, the provincial regulatory body or college sets the licensing rules for internationally trained applicants.',
      hi: 'नियंत्रित पेशों और ट्रेड के लिए विदेश में प्रशिक्षित आवेदकों के लाइसेंस नियम प्रांतीय नियामक संस्था या कॉलेज तय करता है।',
      pa: 'ਨਿਯੰਤ੍ਰਿਤ ਪੇਸ਼ਿਆਂ ਅਤੇ ਟਰੇਡਾਂ ਲਈ ਵਿਦੇਸ਼ ਵਿੱਚ ਸਿਖਲਾਈ ਪ੍ਰਾਪਤ ਬਿਨੈਕਾਰਾਂ ਦੇ ਲਾਇਸੈਂਸ ਨਿਯਮ ਸੂਬਾਈ ਰੈਗੂਲੇਟਰੀ ਸੰਸਥਾ ਜਾਂ ਕਾਲਜ ਤੈਅ ਕਰਦਾ ਹੈ।',
      es: 'Para profesiones y oficios regulados, el organismo regulador o colegio provincial fija las reglas de licencia para solicitantes formados en el extranjero.',
      fr: "Pour les professions et métiers réglementés, l'ordre ou l'organisme de réglementation provincial fixe les règles d'obtention du permis pour les personnes formées à l'étranger.",
      ar: 'بالنسبة للمهن والحرف المنظمة، تحدد الهيئة التنظيمية أو النقابة في المقاطعة قواعد الترخيص للمتقدمين الذين تدربوا في الخارج.'
    }
  }
};

// The 41 concepts, in the order the glossary ids use (17-500).
export const GLOSSARY_CONCEPTS = [
  ['verification_requirement',
    { en: 'Verification Requirement', hi: 'सत्यापन की आवश्यकता', pa: 'ਤਸਦੀਕ ਦੀ ਲੋੜ', es: 'Requisito de verificación', fr: 'Exigence de vérification', ar: 'شرط التحقق' },
    { en: 'A rule that an official body must confirm a fact, such as your identity, status, income or address, before it approves a request. Bring original documents, because copies are often not accepted.',
      hi: 'ऐसा नियम कि कोई अनुरोध मंज़ूर करने से पहले सरकारी संस्था किसी तथ्य, जैसे आपकी पहचान, स्थिति, आय या पता, की पुष्टि करे। मूल दस्तावेज़ साथ रखें, क्योंकि अक्सर कॉपी स्वीकार नहीं होती।',
      pa: 'ਇਹ ਨਿਯਮ ਕਿ ਕੋਈ ਬੇਨਤੀ ਮਨਜ਼ੂਰ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਸਰਕਾਰੀ ਸੰਸਥਾ ਕਿਸੇ ਤੱਥ, ਜਿਵੇਂ ਤੁਹਾਡੀ ਪਛਾਣ, ਦਰਜਾ, ਆਮਦਨ ਜਾਂ ਪਤਾ, ਦੀ ਪੁਸ਼ਟੀ ਕਰੇ। ਅਸਲ ਦਸਤਾਵੇਜ਼ ਨਾਲ ਲਿਆਓ, ਕਿਉਂਕਿ ਅਕਸਰ ਕਾਪੀ ਮਨਜ਼ੂਰ ਨਹੀਂ ਹੁੰਦੀ।',
      es: 'Regla según la cual un organismo oficial debe confirmar un hecho, como su identidad, estatus, ingresos o domicilio, antes de aprobar una solicitud. Lleve documentos originales, porque a menudo no se aceptan copias.',
      fr: "Règle selon laquelle un organisme officiel doit confirmer un fait, comme votre identité, votre statut, vos revenus ou votre adresse, avant d'approuver une demande. Apportez les originaux, car les copies sont souvent refusées.",
      ar: 'قاعدة تلزم الجهة الرسمية بالتأكد من معلومة مثل هويتك أو وضعك أو دخلك أو عنوانك قبل الموافقة على الطلب. أحضر المستندات الأصلية لأن النسخ غالباً لا تُقبل.' }],
  ['documentary_proof',
    { en: 'Documentary Proof', hi: 'दस्तावेज़ी प्रमाण', pa: 'ਦਸਤਾਵੇਜ਼ੀ ਸਬੂਤ', es: 'Prueba documental', fr: 'Preuve documentaire', ar: 'الإثبات المستندي' },
    { en: 'Papers that show a fact is true, such as a passport, lease, pay slip or bank statement. Documents in another language usually need a certified translation.',
      hi: 'ऐसे काग़ज़ जो किसी तथ्य को सच साबित करें, जैसे पासपोर्ट, किरायानामा, वेतन पर्ची या बैंक स्टेटमेंट। दूसरी भाषा के दस्तावेज़ों का आमतौर पर प्रमाणित अनुवाद चाहिए होता है।',
      pa: 'ਅਜਿਹੇ ਕਾਗਜ਼ ਜੋ ਕਿਸੇ ਤੱਥ ਨੂੰ ਸੱਚ ਸਾਬਤ ਕਰਨ, ਜਿਵੇਂ ਪਾਸਪੋਰਟ, ਕਿਰਾਇਆਨਾਮਾ, ਤਨਖਾਹ ਪਰਚੀ ਜਾਂ ਬੈਂਕ ਸਟੇਟਮੈਂਟ। ਦੂਜੀ ਭਾਸ਼ਾ ਦੇ ਦਸਤਾਵੇਜ਼ਾਂ ਦਾ ਆਮ ਤੌਰ ’ਤੇ ਪ੍ਰਮਾਣਿਤ ਅਨੁਵਾਦ ਚਾਹੀਦਾ ਹੈ।',
      es: 'Documentos que demuestran que un hecho es cierto, como un pasaporte, contrato de alquiler, recibo de sueldo o extracto bancario. Los documentos en otro idioma suelen requerir una traducción certificada.',
      fr: "Documents qui prouvent qu'un fait est vrai, comme un passeport, un bail, un talon de paie ou un relevé bancaire. Les documents dans une autre langue exigent généralement une traduction certifiée.",
      ar: 'أوراق تثبت صحة معلومة، مثل جواز السفر أو عقد الإيجار أو قسيمة الراتب أو كشف الحساب البنكي. المستندات بلغة أخرى تحتاج عادة إلى ترجمة معتمدة.' }],
  ['statutory_timeline',
    { en: 'Statutory Timeline', hi: 'कानूनी समय-सीमा', pa: 'ਕਾਨੂੰਨੀ ਸਮਾਂ-ਸੀਮਾ', es: 'Plazo legal', fr: 'Délai légal', ar: 'المهلة القانونية' },
    { en: 'A deadline set by law, for example the time to file an appeal or to give notice. Missing it can end your right to act, so note the date as soon as you receive a decision or notice.',
      hi: 'कानून द्वारा तय समय-सीमा, जैसे अपील दायर करने या नोटिस देने का समय। इसे चूकने पर आपका अधिकार खत्म हो सकता है, इसलिए फ़ैसला या नोटिस मिलते ही तारीख नोट करें।',
      pa: 'ਕਾਨੂੰਨ ਵੱਲੋਂ ਤੈਅ ਸਮਾਂ-ਸੀਮਾ, ਜਿਵੇਂ ਅਪੀਲ ਦਾਇਰ ਕਰਨ ਜਾਂ ਨੋਟਿਸ ਦੇਣ ਦਾ ਸਮਾਂ। ਇਸ ਤੋਂ ਖੁੰਝਣ ’ਤੇ ਤੁਹਾਡਾ ਹੱਕ ਖਤਮ ਹੋ ਸਕਦਾ ਹੈ, ਇਸ ਲਈ ਫ਼ੈਸਲਾ ਜਾਂ ਨੋਟਿਸ ਮਿਲਦੇ ਹੀ ਤਰੀਕ ਨੋਟ ਕਰੋ।',
      es: 'Plazo fijado por la ley, por ejemplo para presentar una apelación o dar un aviso. Si lo pierde, puede perder su derecho, así que anote la fecha en cuanto reciba una decisión o aviso.',
      fr: "Délai fixé par la loi, par exemple pour faire appel ou donner un avis. Le manquer peut vous faire perdre votre droit d'agir, alors notez la date dès que vous recevez une décision ou un avis.",
      ar: 'موعد نهائي يحدده القانون، مثل مهلة تقديم الاستئناف أو إرسال الإشعار. تفويته قد يُسقط حقك، لذا سجّل التاريخ فور استلام القرار أو الإشعار.' }],
  ['exemption_protocol',
    { en: 'Exemption Protocol', hi: 'छूट की प्रक्रिया', pa: 'ਛੋਟ ਦੀ ਪ੍ਰਕਿਰਿਆ', es: 'Procedimiento de exención', fr: "Procédure d'exemption", ar: 'إجراء الإعفاء' },
    { en: 'The process for showing that a rule, fee or requirement does not apply to you. You normally have to ask for the exemption and prove that you qualify.',
      hi: 'यह दिखाने की प्रक्रिया कि कोई नियम, शुल्क या शर्त आप पर लागू नहीं होती। आमतौर पर आपको छूट मांगनी होती है और अपनी पात्रता साबित करनी होती है।',
      pa: 'ਇਹ ਦਿਖਾਉਣ ਦੀ ਪ੍ਰਕਿਰਿਆ ਕਿ ਕੋਈ ਨਿਯਮ, ਫੀਸ ਜਾਂ ਸ਼ਰਤ ਤੁਹਾਡੇ ’ਤੇ ਲਾਗੂ ਨਹੀਂ ਹੁੰਦੀ। ਆਮ ਤੌਰ ’ਤੇ ਤੁਹਾਨੂੰ ਛੋਟ ਮੰਗਣੀ ਪੈਂਦੀ ਹੈ ਅਤੇ ਆਪਣੀ ਯੋਗਤਾ ਸਾਬਤ ਕਰਨੀ ਪੈਂਦੀ ਹੈ।',
      es: 'Proceso para demostrar que una regla, tarifa o requisito no se le aplica. Normalmente debe pedir la exención y probar que cumple las condiciones.',
      fr: "Démarche pour montrer qu'une règle, des frais ou une exigence ne s'appliquent pas à vous. Vous devez généralement demander l'exemption et prouver que vous y avez droit.",
      ar: 'إجراء لإثبات أن قاعدة أو رسماً أو شرطاً لا ينطبق عليك. عادة يجب أن تطلب الإعفاء وتثبت أنك مؤهل له.' }],
  ['appeal_right',
    { en: 'Appeal Right', hi: 'अपील का अधिकार', pa: 'ਅਪੀਲ ਦਾ ਹੱਕ', es: 'Derecho de apelación', fr: "Droit d'appel", ar: 'حق الاستئناف' },
    { en: 'The right to ask a higher authority, tribunal or court to review a decision you disagree with. Appeals have strict deadlines and usually must be made in writing.',
      hi: 'किसी फ़ैसले से असहमत होने पर ऊँचे प्राधिकरण, ट्रिब्यूनल या अदालत से उसकी समीक्षा मांगने का अधिकार। अपील की समय-सीमा सख़्त होती है और आमतौर पर लिखित में करनी होती है।',
      pa: 'ਕਿਸੇ ਫ਼ੈਸਲੇ ਨਾਲ ਅਸਹਿਮਤ ਹੋਣ ’ਤੇ ਉੱਚੀ ਅਥਾਰਟੀ, ਟ੍ਰਿਬਿਊਨਲ ਜਾਂ ਅਦਾਲਤ ਤੋਂ ਉਸ ਦੀ ਸਮੀਖਿਆ ਮੰਗਣ ਦਾ ਹੱਕ। ਅਪੀਲ ਦੀ ਸਮਾਂ-ਸੀਮਾ ਸਖ਼ਤ ਹੁੰਦੀ ਹੈ ਅਤੇ ਆਮ ਤੌਰ ’ਤੇ ਲਿਖਤੀ ਰੂਪ ਵਿੱਚ ਕਰਨੀ ਪੈਂਦੀ ਹੈ।',
      es: 'Derecho a pedir a una autoridad superior, tribunal administrativo o juzgado que revise una decisión con la que no está de acuerdo. Las apelaciones tienen plazos estrictos y suelen hacerse por escrito.',
      fr: "Droit de demander à une autorité supérieure, à un tribunal administratif ou à un tribunal de réexaminer une décision que vous contestez. Les appels ont des délais stricts et se font généralement par écrit.",
      ar: 'حق مطالبة جهة أعلى أو هيئة قضائية أو محكمة بمراجعة قرار لا توافق عليه. للاستئناف مواعيد صارمة وعادة يجب تقديمه كتابياً.' }],
  ['dispute_resolution',
    { en: 'Dispute Resolution', hi: 'विवाद समाधान', pa: 'ਵਿਵਾਦ ਨਿਪਟਾਰਾ', es: 'Resolución de disputas', fr: 'Règlement des différends', ar: 'تسوية النزاعات' },
    { en: 'A way to settle a disagreement without going straight to court, such as mediation, an ombudsperson or a tribunal hearing. It is often cheaper and faster than court.',
      hi: 'सीधे अदालत गए बिना विवाद सुलझाने का तरीका, जैसे मध्यस्थता, लोकपाल (ombudsperson) या ट्रिब्यूनल सुनवाई। यह अक्सर अदालत से सस्ता और तेज़ होता है।',
      pa: 'ਸਿੱਧਾ ਅਦਾਲਤ ਗਏ ਬਿਨਾਂ ਵਿਵਾਦ ਸੁਲਝਾਉਣ ਦਾ ਤਰੀਕਾ, ਜਿਵੇਂ ਵਿਚੋਲਗੀ, ਲੋਕਪਾਲ (ombudsperson) ਜਾਂ ਟ੍ਰਿਬਿਊਨਲ ਸੁਣਵਾਈ। ਇਹ ਅਕਸਰ ਅਦਾਲਤ ਨਾਲੋਂ ਸਸਤਾ ਅਤੇ ਤੇਜ਼ ਹੁੰਦਾ ਹੈ।',
      es: 'Forma de resolver un desacuerdo sin ir directamente a juicio, como la mediación, un defensor del pueblo o una audiencia ante un tribunal administrativo. Suele ser más barata y rápida que un juicio.',
      fr: "Façon de régler un désaccord sans aller directement devant un tribunal, par exemple la médiation, un ombudsman ou une audience devant un tribunal administratif. C'est souvent moins cher et plus rapide.",
      ar: 'طريقة لحل الخلاف دون اللجوء مباشرة إلى المحكمة، مثل الوساطة أو أمين المظالم أو جلسة أمام هيئة قضائية. غالباً ما تكون أرخص وأسرع من المحكمة.' }],
  ['registration_procedure',
    { en: 'Registration Procedure', hi: 'पंजीकरण प्रक्रिया', pa: 'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਪ੍ਰਕਿਰਿਆ', es: 'Procedimiento de registro', fr: "Procédure d'inscription", ar: 'إجراءات التسجيل' },
    { en: 'The steps to sign up with an official body or service, such as health coverage, a school or a professional college. Registration usually needs identity documents and proof of address.',
      hi: 'किसी सरकारी संस्था या सेवा, जैसे स्वास्थ्य बीमा, स्कूल या पेशेवर कॉलेज, में नाम दर्ज कराने के चरण। पंजीकरण के लिए आमतौर पर पहचान पत्र और पते का प्रमाण चाहिए।',
      pa: 'ਕਿਸੇ ਸਰਕਾਰੀ ਸੰਸਥਾ ਜਾਂ ਸੇਵਾ, ਜਿਵੇਂ ਸਿਹਤ ਬੀਮਾ, ਸਕੂਲ ਜਾਂ ਪੇਸ਼ੇਵਰ ਕਾਲਜ, ਵਿੱਚ ਨਾਂ ਦਰਜ ਕਰਵਾਉਣ ਦੇ ਕਦਮ। ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਲਈ ਆਮ ਤੌਰ ’ਤੇ ਪਛਾਣ ਪੱਤਰ ਅਤੇ ਪਤੇ ਦਾ ਸਬੂਤ ਚਾਹੀਦਾ ਹੈ।',
      es: 'Pasos para inscribirse en un organismo o servicio oficial, como la cobertura médica, una escuela o un colegio profesional. Suele requerir documentos de identidad y comprobante de domicilio.',
      fr: "Étapes pour s'inscrire auprès d'un organisme ou d'un service officiel, comme l'assurance maladie, une école ou un ordre professionnel. L'inscription exige généralement une pièce d'identité et une preuve d'adresse.",
      ar: 'الخطوات اللازمة للتسجيل لدى جهة أو خدمة رسمية، مثل التأمين الصحي أو المدرسة أو النقابة المهنية. يتطلب التسجيل عادة وثائق هوية وإثبات عنوان.' }],
  ['compliance_checklist',
    { en: 'Compliance Checklist', hi: 'अनुपालन जाँच-सूची', pa: 'ਪਾਲਣਾ ਜਾਂਚ-ਸੂਚੀ', es: 'Lista de cumplimiento', fr: 'Liste de conformité', ar: 'قائمة الامتثال' },
    { en: 'A list of the conditions you must meet to follow a rule or to keep a permit, licence or benefit. Checking it before you apply helps you avoid a refusal.',
      hi: 'उन शर्तों की सूची जिन्हें किसी नियम का पालन करने या परमिट, लाइसेंस या लाभ बनाए रखने के लिए पूरा करना होता है। आवेदन से पहले इसे जाँचने से अस्वीकृति से बचा जा सकता है।',
      pa: 'ਉਨ੍ਹਾਂ ਸ਼ਰਤਾਂ ਦੀ ਸੂਚੀ ਜੋ ਕਿਸੇ ਨਿਯਮ ਦੀ ਪਾਲਣਾ ਕਰਨ ਜਾਂ ਪਰਮਿਟ, ਲਾਇਸੈਂਸ ਜਾਂ ਲਾਭ ਬਣਾਈ ਰੱਖਣ ਲਈ ਪੂਰੀਆਂ ਕਰਨੀਆਂ ਪੈਂਦੀਆਂ ਹਨ। ਅਰਜ਼ੀ ਤੋਂ ਪਹਿਲਾਂ ਇਸ ਨੂੰ ਜਾਂਚਣ ਨਾਲ ਨਾਮਨਜ਼ੂਰੀ ਤੋਂ ਬਚਿਆ ਜਾ ਸਕਦਾ ਹੈ।',
      es: 'Lista de condiciones que debe cumplir para seguir una regla o mantener un permiso, licencia o prestación. Revisarla antes de solicitar ayuda a evitar un rechazo.',
      fr: "Liste des conditions à respecter pour suivre une règle ou conserver un permis, une licence ou une prestation. La vérifier avant de faire une demande aide à éviter un refus.",
      ar: 'قائمة بالشروط التي يجب استيفاؤها للالتزام بقاعدة أو للاحتفاظ بتصريح أو رخصة أو إعانة. مراجعتها قبل التقديم تساعدك على تجنب الرفض.' }],
  ['renewal_criteria',
    { en: 'Renewal Criteria', hi: 'नवीनीकरण की शर्तें', pa: 'ਨਵੀਨੀਕਰਨ ਦੀਆਂ ਸ਼ਰਤਾਂ', es: 'Requisitos de renovación', fr: 'Critères de renouvellement', ar: 'شروط التجديد' },
    { en: 'The conditions for extending a document, permit, licence or benefit before it expires. Apply early: some renewals must be filed before the expiry date to keep your rights.',
      hi: 'किसी दस्तावेज़, परमिट, लाइसेंस या लाभ की अवधि खत्म होने से पहले उसे बढ़ाने की शर्तें। जल्दी आवेदन करें: कुछ नवीनीकरण अधिकार बचाए रखने के लिए समाप्ति तिथि से पहले दाखिल करने होते हैं।',
      pa: 'ਕਿਸੇ ਦਸਤਾਵੇਜ਼, ਪਰਮਿਟ, ਲਾਇਸੈਂਸ ਜਾਂ ਲਾਭ ਦੀ ਮਿਆਦ ਖਤਮ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਉਸ ਨੂੰ ਵਧਾਉਣ ਦੀਆਂ ਸ਼ਰਤਾਂ। ਜਲਦੀ ਅਰਜ਼ੀ ਦਿਓ: ਕੁਝ ਨਵੀਨੀਕਰਨ ਹੱਕ ਬਚਾਈ ਰੱਖਣ ਲਈ ਮਿਆਦ ਖਤਮ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਦਾਖ਼ਲ ਕਰਨੇ ਪੈਂਦੇ ਹਨ।',
      es: 'Condiciones para extender un documento, permiso, licencia o prestación antes de que venza. Solicítela con tiempo: algunas renovaciones deben presentarse antes del vencimiento para conservar sus derechos.',
      fr: "Conditions pour prolonger un document, un permis, une licence ou une prestation avant son expiration. Faites la demande tôt : certains renouvellements doivent être déposés avant la date d'expiration pour conserver vos droits.",
      ar: 'شروط تمديد وثيقة أو تصريح أو رخصة أو إعانة قبل انتهائها. قدّم مبكراً، فبعض طلبات التجديد يجب تقديمها قبل تاريخ الانتهاء للحفاظ على حقوقك.' }],
  ['fee_structure',
    { en: 'Fee Structure', hi: 'शुल्क संरचना', pa: 'ਫੀਸ ਢਾਂਚਾ', es: 'Estructura de tarifas', fr: 'Grille des frais', ar: 'هيكل الرسوم' },
    { en: 'The official list of charges for an application or service, including any reductions or waivers. Fees change, so check the official fee page and pay only through official channels.',
      hi: 'किसी आवेदन या सेवा के आधिकारिक शुल्क की सूची, जिसमें कोई छूट या माफ़ी भी शामिल है। शुल्क बदलते रहते हैं, इसलिए आधिकारिक शुल्क पेज देखें और भुगतान केवल आधिकारिक माध्यम से करें।',
      pa: 'ਕਿਸੇ ਅਰਜ਼ੀ ਜਾਂ ਸੇਵਾ ਦੀਆਂ ਅਧਿਕਾਰਤ ਫੀਸਾਂ ਦੀ ਸੂਚੀ, ਜਿਸ ਵਿੱਚ ਕੋਈ ਛੋਟ ਜਾਂ ਮੁਆਫ਼ੀ ਵੀ ਸ਼ਾਮਲ ਹੈ। ਫੀਸਾਂ ਬਦਲਦੀਆਂ ਰਹਿੰਦੀਆਂ ਹਨ, ਇਸ ਲਈ ਅਧਿਕਾਰਤ ਫੀਸ ਪੰਨਾ ਵੇਖੋ ਅਤੇ ਭੁਗਤਾਨ ਸਿਰਫ਼ ਅਧਿਕਾਰਤ ਤਰੀਕੇ ਨਾਲ ਕਰੋ।',
      es: 'Lista oficial de cobros por una solicitud o servicio, incluidas reducciones o exenciones. Las tarifas cambian, así que consulte la página oficial y pague solo por canales oficiales.',
      fr: "Liste officielle des frais d'une demande ou d'un service, y compris les réductions ou exemptions. Les frais changent : consultez la page officielle et payez uniquement par les canaux officiels.",
      ar: 'القائمة الرسمية لرسوم طلب أو خدمة، بما فيها أي تخفيض أو إعفاء. تتغير الرسوم، لذا راجع صفحة الرسوم الرسمية وادفع فقط عبر القنوات الرسمية.' }],
  ['legal_representation',
    { en: 'Legal Representation', hi: 'कानूनी प्रतिनिधित्व', pa: 'ਕਾਨੂੰਨੀ ਨੁਮਾਇੰਦਗੀ', es: 'Representación legal', fr: 'Représentation juridique', ar: 'التمثيل القانوني' },
    { en: 'Having a qualified person act or speak for you, such as a lawyer, a licensed paralegal or, for immigration, a licensed consultant. Paid help from unlicensed representatives is not allowed and can harm your case.',
      hi: 'किसी योग्य व्यक्ति का आपकी ओर से काम करना या बोलना, जैसे वकील, लाइसेंस प्राप्त पैरालीगल या इमिग्रेशन के लिए लाइसेंस प्राप्त कंसल्टेंट। बिना लाइसेंस वाले से पैसे देकर मदद लेना अनुमत नहीं है और आपके मामले को नुकसान पहुँचा सकता है।',
      pa: 'ਕਿਸੇ ਯੋਗ ਵਿਅਕਤੀ ਦਾ ਤੁਹਾਡੀ ਤਰਫ਼ੋਂ ਕੰਮ ਕਰਨਾ ਜਾਂ ਬੋਲਣਾ, ਜਿਵੇਂ ਵਕੀਲ, ਲਾਇਸੈਂਸ ਵਾਲਾ ਪੈਰਾਲੀਗਲ ਜਾਂ ਇਮੀਗ੍ਰੇਸ਼ਨ ਲਈ ਲਾਇਸੈਂਸ ਵਾਲਾ ਕੰਸਲਟੈਂਟ। ਬਿਨਾਂ ਲਾਇਸੈਂਸ ਵਾਲੇ ਤੋਂ ਪੈਸੇ ਦੇ ਕੇ ਮਦਦ ਲੈਣੀ ਮਨ੍ਹਾ ਹੈ ਅਤੇ ਤੁਹਾਡੇ ਕੇਸ ਨੂੰ ਨੁਕਸਾਨ ਪਹੁੰਚਾ ਸਕਦੀ ਹੈ।',
      es: 'Que una persona calificada actúe o hable por usted, como un abogado, un paralegal con licencia o, en inmigración, un consultor con licencia. La ayuda pagada de representantes sin licencia no está permitida y puede perjudicar su caso.',
      fr: "Le fait qu'une personne qualifiée agisse ou parle pour vous, comme un avocat, un parajuriste autorisé ou, en immigration, un consultant autorisé. L'aide rémunérée de représentants non autorisés est interdite et peut nuire à votre dossier.",
      ar: 'أن يتصرف أو يتحدث نيابة عنك شخص مؤهل، مثل محامٍ أو مساعد قانوني مرخص أو مستشار هجرة مرخص. المساعدة المدفوعة من ممثلين غير مرخصين غير مسموح بها وقد تضر بقضيتك.' }],
  ['confidentiality_guard',
    { en: 'Confidentiality Guard', hi: 'गोपनीयता सुरक्षा', pa: 'ਗੁਪਤਤਾ ਸੁਰੱਖਿਆ', es: 'Protección de la confidencialidad', fr: 'Protection de la confidentialité', ar: 'حماية السرية' },
    { en: 'Rules that protect your personal information and limit who can see or share it. You can usually ask an organisation what information it holds about you and how it is used.',
      hi: 'ऐसे नियम जो आपकी निजी जानकारी की रक्षा करते हैं और तय करते हैं कि उसे कौन देख या साझा कर सकता है। आप आमतौर पर किसी संस्था से पूछ सकते हैं कि उसके पास आपकी क्या जानकारी है और उसका उपयोग कैसे होता है।',
      pa: 'ਅਜਿਹੇ ਨਿਯਮ ਜੋ ਤੁਹਾਡੀ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਦੀ ਰੱਖਿਆ ਕਰਦੇ ਹਨ ਅਤੇ ਤੈਅ ਕਰਦੇ ਹਨ ਕਿ ਉਸ ਨੂੰ ਕੌਣ ਵੇਖ ਜਾਂ ਸਾਂਝਾ ਕਰ ਸਕਦਾ ਹੈ। ਤੁਸੀਂ ਆਮ ਤੌਰ ’ਤੇ ਕਿਸੇ ਸੰਸਥਾ ਤੋਂ ਪੁੱਛ ਸਕਦੇ ਹੋ ਕਿ ਉਸ ਕੋਲ ਤੁਹਾਡੀ ਕੀ ਜਾਣਕਾਰੀ ਹੈ ਅਤੇ ਉਸ ਦੀ ਵਰਤੋਂ ਕਿਵੇਂ ਹੁੰਦੀ ਹੈ।',
      es: 'Reglas que protegen su información personal y limitan quién puede verla o compartirla. Normalmente puede preguntar a una organización qué información tiene sobre usted y cómo la usa.',
      fr: "Règles qui protègent vos renseignements personnels et limitent qui peut les consulter ou les communiquer. Vous pouvez généralement demander à un organisme quels renseignements il détient sur vous et comment il les utilise.",
      ar: 'قواعد تحمي معلوماتك الشخصية وتحدد من يمكنه الاطلاع عليها أو مشاركتها. يمكنك عادة أن تسأل أي جهة عن المعلومات التي تحتفظ بها عنك وكيف تستخدمها.' }],
  ['cross_jurisdictional_recognition',
    { en: 'Cross-Jurisdictional Recognition', hi: 'अन्य क्षेत्राधिकार में मान्यता', pa: 'ਹੋਰ ਖੇਤਰ ਵਿੱਚ ਮਾਨਤਾ', es: 'Reconocimiento entre jurisdicciones', fr: 'Reconnaissance entre juridictions', ar: 'الاعتراف بين الولايات القضائية' },
    { en: 'Whether a document, licence or qualification from one country or province is accepted in another. Recognition is often partial and may need an assessment, an exam or an exchange.',
      hi: 'क्या किसी एक देश या प्रांत का दस्तावेज़, लाइसेंस या योग्यता दूसरी जगह मान्य है। मान्यता अक्सर आंशिक होती है और इसके लिए मूल्यांकन, परीक्षा या बदलाव (exchange) की ज़रूरत पड़ सकती है।',
      pa: 'ਕੀ ਕਿਸੇ ਇੱਕ ਦੇਸ਼ ਜਾਂ ਸੂਬੇ ਦਾ ਦਸਤਾਵੇਜ਼, ਲਾਇਸੈਂਸ ਜਾਂ ਯੋਗਤਾ ਦੂਜੀ ਥਾਂ ਮੰਨੀ ਜਾਂਦੀ ਹੈ। ਮਾਨਤਾ ਅਕਸਰ ਅੰਸ਼ਕ ਹੁੰਦੀ ਹੈ ਅਤੇ ਇਸ ਲਈ ਮੁਲਾਂਕਣ, ਇਮਤਿਹਾਨ ਜਾਂ ਬਦਲੀ (exchange) ਦੀ ਲੋੜ ਪੈ ਸਕਦੀ ਹੈ।',
      es: 'Si un documento, licencia o título de un país o provincia se acepta en otro. El reconocimiento suele ser parcial y puede requerir una evaluación, un examen o un canje.',
      fr: "Le fait qu'un document, un permis ou une qualification d'un pays ou d'une province soit accepté ailleurs. La reconnaissance est souvent partielle et peut exiger une évaluation, un examen ou un échange.",
      ar: 'مدى قبول وثيقة أو رخصة أو مؤهل من دولة أو مقاطعة في مكان آخر. غالباً ما يكون الاعتراف جزئياً وقد يتطلب تقييماً أو امتحاناً أو استبدالاً.' }],
  ['expedited_channel',
    { en: 'Expedited Channel', hi: 'त्वरित प्रक्रिया', pa: 'ਤੇਜ਼ ਪ੍ਰਕਿਰਿਆ', es: 'Trámite acelerado', fr: 'Traitement accéléré', ar: 'المسار المعجّل' },
    { en: 'A faster processing route for urgent or priority cases, for example on medical or humanitarian grounds. You usually need to request it and show evidence of the urgency.',
      hi: 'तत्काल या प्राथमिकता वाले मामलों के लिए तेज़ प्रक्रिया, जैसे चिकित्सा या मानवीय कारणों पर। आमतौर पर इसे मांगना पड़ता है और तात्कालिकता का प्रमाण देना होता है।',
      pa: 'ਜ਼ਰੂਰੀ ਜਾਂ ਤਰਜੀਹੀ ਮਾਮਲਿਆਂ ਲਈ ਤੇਜ਼ ਪ੍ਰਕਿਰਿਆ, ਜਿਵੇਂ ਡਾਕਟਰੀ ਜਾਂ ਮਨੁੱਖੀ ਆਧਾਰ ’ਤੇ। ਆਮ ਤੌਰ ’ਤੇ ਇਸ ਨੂੰ ਮੰਗਣਾ ਪੈਂਦਾ ਹੈ ਅਤੇ ਜ਼ਰੂਰਤ ਦਾ ਸਬੂਤ ਦੇਣਾ ਪੈਂਦਾ ਹੈ।',
      es: 'Vía de tramitación más rápida para casos urgentes o prioritarios, por ejemplo por motivos médicos o humanitarios. Normalmente debe solicitarla y demostrar la urgencia.',
      fr: "Voie de traitement plus rapide pour les cas urgents ou prioritaires, par exemple pour des raisons médicales ou humanitaires. Il faut généralement la demander et prouver l'urgence.",
      ar: 'مسار معالجة أسرع للحالات العاجلة أو ذات الأولوية، مثل الأسباب الطبية أو الإنسانية. عادة يجب طلبه وتقديم دليل على الاستعجال.' }],
  ['hardship_relief',
    { en: 'Hardship Relief', hi: 'कठिनाई में राहत', pa: 'ਮੁਸ਼ਕਲ ਵਿੱਚ ਰਾਹਤ', es: 'Alivio por dificultades', fr: 'Allègement pour difficultés', ar: 'الإغاثة في حالات الضائقة' },
    { en: 'Help or flexibility given when following a rule would cause serious hardship, such as a waived fee, extra time or a payment plan. It is discretionary, so explain your situation with evidence.',
      hi: 'जब किसी नियम का पालन गंभीर कठिनाई पैदा करे तब दी जाने वाली मदद या छूट, जैसे शुल्क माफ़ी, अतिरिक्त समय या किस्तों में भुगतान। यह अधिकारी के विवेक पर होती है, इसलिए अपनी स्थिति प्रमाण सहित बताएं।',
      pa: 'ਜਦੋਂ ਕਿਸੇ ਨਿਯਮ ਦੀ ਪਾਲਣਾ ਗੰਭੀਰ ਮੁਸ਼ਕਲ ਪੈਦਾ ਕਰੇ ਤਾਂ ਦਿੱਤੀ ਜਾਣ ਵਾਲੀ ਮਦਦ ਜਾਂ ਛੋਟ, ਜਿਵੇਂ ਫੀਸ ਮੁਆਫ਼ੀ, ਵਾਧੂ ਸਮਾਂ ਜਾਂ ਕਿਸ਼ਤਾਂ ਵਿੱਚ ਭੁਗਤਾਨ। ਇਹ ਅਧਿਕਾਰੀ ਦੀ ਮਰਜ਼ੀ ’ਤੇ ਹੁੰਦੀ ਹੈ, ਇਸ ਲਈ ਆਪਣੀ ਹਾਲਤ ਸਬੂਤ ਸਮੇਤ ਦੱਸੋ।',
      es: 'Ayuda o flexibilidad cuando cumplir una regla causaría una dificultad grave, como la exención de una tarifa, más tiempo o un plan de pagos. Es discrecional, así que explique su situación con pruebas.',
      fr: "Aide ou souplesse accordée lorsque respecter une règle causerait de graves difficultés, comme une exemption de frais, un délai supplémentaire ou un plan de paiement. C'est discrétionnaire : expliquez votre situation avec des preuves.",
      ar: 'مساعدة أو مرونة تُمنح عندما يسبب تطبيق قاعدة ضائقة شديدة، مثل الإعفاء من رسوم أو وقت إضافي أو خطة سداد. تخضع للتقدير، لذا اشرح وضعك مع الأدلة.' }],
  ['primary_audit',
    { en: 'Primary Audit', hi: 'प्रारंभिक जाँच', pa: 'ਮੁਢਲੀ ਜਾਂਚ', es: 'Revisión inicial', fr: 'Examen initial', ar: 'المراجعة الأولية' },
    { en: 'The first check of an application or file to see if it is complete and meets the basic requirements. Incomplete files are often returned or refused at this stage.',
      hi: 'किसी आवेदन या फ़ाइल की पहली जाँच कि वह पूरी है और बुनियादी शर्तें पूरी करती है या नहीं। अधूरी फ़ाइलें अक्सर इसी चरण में लौटा दी जाती हैं या अस्वीकार हो जाती हैं।',
      pa: 'ਕਿਸੇ ਅਰਜ਼ੀ ਜਾਂ ਫ਼ਾਈਲ ਦੀ ਪਹਿਲੀ ਜਾਂਚ ਕਿ ਉਹ ਪੂਰੀ ਹੈ ਅਤੇ ਬੁਨਿਆਦੀ ਸ਼ਰਤਾਂ ਪੂਰੀਆਂ ਕਰਦੀ ਹੈ ਜਾਂ ਨਹੀਂ। ਅਧੂਰੀਆਂ ਫ਼ਾਈਲਾਂ ਅਕਸਰ ਇਸੇ ਪੜਾਅ ’ਤੇ ਵਾਪਸ ਕਰ ਦਿੱਤੀਆਂ ਜਾਂਦੀਆਂ ਹਨ ਜਾਂ ਨਾਮਨਜ਼ੂਰ ਹੋ ਜਾਂਦੀਆਂ ਹਨ।',
      es: 'Primera revisión de una solicitud o expediente para ver si está completo y cumple los requisitos básicos. Los expedientes incompletos suelen devolverse o rechazarse en esta etapa.',
      fr: "Première vérification d'une demande ou d'un dossier pour voir s'il est complet et respecte les exigences de base. Les dossiers incomplets sont souvent retournés ou refusés à cette étape.",
      ar: 'الفحص الأول للطلب أو الملف للتأكد من اكتماله واستيفائه الشروط الأساسية. الملفات الناقصة غالباً ما تُعاد أو تُرفض في هذه المرحلة.' }],
  ['secondary_review',
    { en: 'Secondary Review', hi: 'द्वितीय समीक्षा', pa: 'ਦੂਜੀ ਸਮੀਖਿਆ', es: 'Revisión secundaria', fr: 'Réexamen', ar: 'المراجعة الثانوية' },
    { en: 'A second, more detailed look at a decision or file, often by a different officer or a supervisor. You may be able to request one if you believe a mistake was made.',
      hi: 'किसी फ़ैसले या फ़ाइल की दूसरी, ज़्यादा विस्तृत जाँच, अक्सर किसी दूसरे अधिकारी या सुपरवाइज़र द्वारा। अगर आपको लगता है कि गलती हुई है तो आप इसकी मांग कर सकते हैं।',
      pa: 'ਕਿਸੇ ਫ਼ੈਸਲੇ ਜਾਂ ਫ਼ਾਈਲ ਦੀ ਦੂਜੀ, ਵਧੇਰੇ ਵਿਸਥਾਰਤ ਜਾਂਚ, ਅਕਸਰ ਕਿਸੇ ਹੋਰ ਅਧਿਕਾਰੀ ਜਾਂ ਸੁਪਰਵਾਈਜ਼ਰ ਵੱਲੋਂ। ਜੇ ਤੁਹਾਨੂੰ ਲੱਗਦਾ ਹੈ ਕਿ ਗਲਤੀ ਹੋਈ ਹੈ ਤਾਂ ਤੁਸੀਂ ਇਸ ਦੀ ਮੰਗ ਕਰ ਸਕਦੇ ਹੋ।',
      es: 'Segunda revisión, más detallada, de una decisión o expediente, a menudo por otro funcionario o un supervisor. Puede pedirla si cree que hubo un error.',
      fr: "Deuxième examen, plus détaillé, d'une décision ou d'un dossier, souvent par un autre agent ou un superviseur. Vous pouvez parfois le demander si vous pensez qu'il y a eu une erreur.",
      ar: 'نظرة ثانية أكثر تفصيلاً في قرار أو ملف، غالباً من موظف آخر أو مشرف. قد يمكنك طلبها إذا كنت تعتقد بوجود خطأ.' }],
  ['enforcement_officer',
    { en: 'Enforcement Officer', hi: 'प्रवर्तन अधिकारी', pa: 'ਲਾਗੂ ਕਰਨ ਵਾਲਾ ਅਧਿਕਾਰੀ', es: 'Agente de cumplimiento', fr: "Agent d'application", ar: 'موظف الإنفاذ' },
    { en: 'An official who checks that a law is followed and can issue warnings, orders or fines, such as a by-law, employment standards or border officer. You can ask for the officer’s name and badge number.',
      hi: 'वह अधिकारी जो जाँचता है कि कानून का पालन हो रहा है और चेतावनी, आदेश या जुर्माना जारी कर सकता है, जैसे उपनियम, रोज़गार मानक या सीमा अधिकारी। आप अधिकारी का नाम और बैज नंबर पूछ सकते हैं।',
      pa: 'ਉਹ ਅਧਿਕਾਰੀ ਜੋ ਜਾਂਚਦਾ ਹੈ ਕਿ ਕਾਨੂੰਨ ਦੀ ਪਾਲਣਾ ਹੋ ਰਹੀ ਹੈ ਅਤੇ ਚੇਤਾਵਨੀ, ਹੁਕਮ ਜਾਂ ਜੁਰਮਾਨਾ ਜਾਰੀ ਕਰ ਸਕਦਾ ਹੈ, ਜਿਵੇਂ ਉਪ-ਨਿਯਮ, ਰੁਜ਼ਗਾਰ ਮਿਆਰ ਜਾਂ ਸਰਹੱਦੀ ਅਧਿਕਾਰੀ। ਤੁਸੀਂ ਅਧਿਕਾਰੀ ਦਾ ਨਾਂ ਅਤੇ ਬੈਜ ਨੰਬਰ ਪੁੱਛ ਸਕਦੇ ਹੋ।',
      es: 'Funcionario que comprueba que se cumpla una ley y puede emitir advertencias, órdenes o multas, como un agente municipal, laboral o fronterizo. Puede pedirle su nombre y número de placa.',
      fr: "Agent qui vérifie le respect d'une loi et peut donner des avertissements, des ordres ou des amendes, comme un agent municipal, des normes du travail ou des frontières. Vous pouvez demander son nom et son numéro d'insigne.",
      ar: 'موظف يتحقق من تطبيق القانون ويمكنه إصدار تحذيرات أو أوامر أو غرامات، مثل موظف اللوائح البلدية أو معايير العمل أو الحدود. يمكنك أن تسأله عن اسمه ورقم شارته.' }],
  ['language_assessment',
    { en: 'Language Assessment', hi: 'भाषा मूल्यांकन', pa: 'ਭਾਸ਼ਾ ਮੁਲਾਂਕਣ', es: 'Evaluación de idioma', fr: 'Évaluation linguistique', ar: 'تقييم اللغة' },
    { en: 'A test or assessment of your English or French, used for immigration, study, work or placement in free language classes. Only approved tests are accepted for official purposes.',
      hi: 'आपकी अंग्रेज़ी या फ़्रेंच की परीक्षा या मूल्यांकन, जो इमिग्रेशन, पढ़ाई, नौकरी या मुफ़्त भाषा कक्षाओं में स्थान के लिए होता है। आधिकारिक कामों के लिए केवल मान्यता प्राप्त परीक्षाएं स्वीकार होती हैं।',
      pa: 'ਤੁਹਾਡੀ ਅੰਗਰੇਜ਼ੀ ਜਾਂ ਫ਼੍ਰੈਂਚ ਦਾ ਇਮਤਿਹਾਨ ਜਾਂ ਮੁਲਾਂਕਣ, ਜੋ ਇਮੀਗ੍ਰੇਸ਼ਨ, ਪੜ੍ਹਾਈ, ਨੌਕਰੀ ਜਾਂ ਮੁਫ਼ਤ ਭਾਸ਼ਾ ਕਲਾਸਾਂ ਵਿੱਚ ਥਾਂ ਲਈ ਹੁੰਦਾ ਹੈ। ਸਰਕਾਰੀ ਕੰਮਾਂ ਲਈ ਸਿਰਫ਼ ਮਨਜ਼ੂਰਸ਼ੁਦਾ ਇਮਤਿਹਾਨ ਮੰਨੇ ਜਾਂਦੇ ਹਨ।',
      es: 'Prueba o evaluación de su inglés o francés, usada para inmigración, estudios, trabajo o para ubicarlo en clases de idioma gratuitas. Solo se aceptan pruebas aprobadas para fines oficiales.',
      fr: "Test ou évaluation de votre anglais ou français, utilisé pour l'immigration, les études, le travail ou le classement dans des cours de langue gratuits. Seuls les tests approuvés sont acceptés à des fins officielles.",
      ar: 'اختبار أو تقييم لمستواك في الإنجليزية أو الفرنسية، يُستخدم للهجرة أو الدراسة أو العمل أو لتحديد مستواك في دروس اللغة المجانية. لا تُقبل للأغراض الرسمية إلا الاختبارات المعتمدة.' }],
  ['equivalency_pathway',
    { en: 'Equivalency Pathway', hi: 'समकक्षता मार्ग', pa: 'ਬਰਾਬਰੀ ਦਾ ਰਸਤਾ', es: 'Vía de equivalencia', fr: "Voie d'équivalence", ar: 'مسار المعادلة' },
    { en: 'A route to have foreign education, training or work experience recognised as equal to the local standard, often through a credential assessment, exams or a bridging program.',
      hi: 'विदेशी शिक्षा, प्रशिक्षण या कार्य अनुभव को स्थानीय मानक के बराबर मान्यता दिलाने का रास्ता, अक्सर क्रेडेंशियल मूल्यांकन, परीक्षाओं या ब्रिजिंग प्रोग्राम के ज़रिए।',
      pa: 'ਵਿਦੇਸ਼ੀ ਸਿੱਖਿਆ, ਸਿਖਲਾਈ ਜਾਂ ਕੰਮ ਦੇ ਤਜਰਬੇ ਨੂੰ ਸਥਾਨਕ ਮਿਆਰ ਦੇ ਬਰਾਬਰ ਮਾਨਤਾ ਦਿਵਾਉਣ ਦਾ ਰਸਤਾ, ਅਕਸਰ ਕ੍ਰੈਡੈਂਸ਼ੀਅਲ ਮੁਲਾਂਕਣ, ਇਮਤਿਹਾਨਾਂ ਜਾਂ ਬ੍ਰਿਜਿੰਗ ਪ੍ਰੋਗਰਾਮ ਰਾਹੀਂ।',
      es: 'Vía para que su educación, formación o experiencia extranjera se reconozca como equivalente al estándar local, a menudo mediante una evaluación de credenciales, exámenes o un programa puente.',
      fr: "Démarche pour faire reconnaître vos études, votre formation ou votre expérience étrangère comme équivalentes à la norme locale, souvent par une évaluation des diplômes, des examens ou un programme passerelle.",
      ar: 'مسار للاعتراف بتعليمك أو تدريبك أو خبرتك الأجنبية على أنها تعادل المعيار المحلي، غالباً عبر تقييم الشهادات أو الامتحانات أو برنامج تأهيلي.' }],
  ['temporary_waiver',
    { en: 'Temporary Waiver', hi: 'अस्थायी छूट', pa: 'ਆਰਜ਼ੀ ਛੋਟ', es: 'Exención temporal', fr: 'Dispense temporaire', ar: 'إعفاء مؤقت' },
    { en: 'Permission to set aside a requirement for a limited time. It ends on a set date, so plan to meet the requirement or renew the waiver before then.',
      hi: 'किसी शर्त को सीमित समय के लिए हटाने की अनुमति। यह तय तारीख पर खत्म होती है, इसलिए उससे पहले शर्त पूरी करने या छूट का नवीनीकरण करने की योजना बनाएं।',
      pa: 'ਕਿਸੇ ਸ਼ਰਤ ਨੂੰ ਸੀਮਤ ਸਮੇਂ ਲਈ ਹਟਾਉਣ ਦੀ ਇਜਾਜ਼ਤ। ਇਹ ਤੈਅ ਤਰੀਕ ’ਤੇ ਖਤਮ ਹੁੰਦੀ ਹੈ, ਇਸ ਲਈ ਉਸ ਤੋਂ ਪਹਿਲਾਂ ਸ਼ਰਤ ਪੂਰੀ ਕਰਨ ਜਾਂ ਛੋਟ ਨਵਿਆਉਣ ਦੀ ਯੋਜਨਾ ਬਣਾਓ।',
      es: 'Permiso para dejar de lado un requisito por un tiempo limitado. Termina en una fecha fija, así que planifique cumplir el requisito o renovar la exención antes.',
      fr: "Autorisation de mettre de côté une exigence pour une période limitée. Elle prend fin à une date fixe : prévoyez de satisfaire l'exigence ou de renouveler la dispense avant.",
      ar: 'إذن بتعليق شرط لفترة محدودة. ينتهي في تاريخ محدد، لذا خطط لاستيفاء الشرط أو تجديد الإعفاء قبل ذلك.' }],
  ['identity_verification',
    { en: 'Identity Verification', hi: 'पहचान सत्यापन', pa: 'ਪਛਾਣ ਤਸਦੀਕ', es: 'Verificación de identidad', fr: "Vérification d'identité", ar: 'التحقق من الهوية' },
    { en: 'Proving you are who you say you are, usually with government photo ID such as a passport, and sometimes biometrics. Names must match across documents, or you may need proof of a name change.',
      hi: 'यह साबित करना कि आप वही हैं जो आप कहते हैं, आमतौर पर पासपोर्ट जैसे सरकारी फ़ोटो पहचान पत्र से और कभी-कभी बायोमेट्रिक्स से। सभी दस्तावेज़ों में नाम एक जैसा होना चाहिए, नहीं तो नाम बदलने का प्रमाण चाहिए हो सकता है।',
      pa: 'ਇਹ ਸਾਬਤ ਕਰਨਾ ਕਿ ਤੁਸੀਂ ਉਹੀ ਹੋ ਜੋ ਤੁਸੀਂ ਕਹਿੰਦੇ ਹੋ, ਆਮ ਤੌਰ ’ਤੇ ਪਾਸਪੋਰਟ ਵਰਗੇ ਸਰਕਾਰੀ ਫ਼ੋਟੋ ਪਛਾਣ ਪੱਤਰ ਨਾਲ ਅਤੇ ਕਦੇ-ਕਦੇ ਬਾਇਓਮੈਟ੍ਰਿਕਸ ਨਾਲ। ਸਾਰੇ ਦਸਤਾਵੇਜ਼ਾਂ ਵਿੱਚ ਨਾਂ ਇੱਕੋ ਜਿਹਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ, ਨਹੀਂ ਤਾਂ ਨਾਂ ਬਦਲਣ ਦਾ ਸਬੂਤ ਚਾਹੀਦਾ ਹੋ ਸਕਦਾ ਹੈ।',
      es: 'Demostrar que usted es quien dice ser, normalmente con una identificación oficial con foto como el pasaporte y a veces con datos biométricos. Los nombres deben coincidir en todos los documentos o puede necesitar prueba de un cambio de nombre.',
      fr: "Prouver que vous êtes bien la personne que vous dites être, généralement avec une pièce d'identité officielle avec photo comme le passeport, et parfois des données biométriques. Les noms doivent concorder sur tous les documents, sinon une preuve de changement de nom peut être exigée.",
      ar: 'إثبات أنك الشخص الذي تقول إنك هو، عادة بهوية حكومية تحمل صورة مثل جواز السفر، وأحياناً بالبيانات الحيوية. يجب أن تتطابق الأسماء في كل المستندات، وإلا قد تحتاج إلى إثبات تغيير الاسم.' }],
  ['address_confirmation',
    { en: 'Address Confirmation', hi: 'पते की पुष्टि', pa: 'ਪਤੇ ਦੀ ਪੁਸ਼ਟੀ', es: 'Confirmación de domicilio', fr: "Confirmation d'adresse", ar: 'تأكيد العنوان' },
    { en: 'Proof of where you live, such as a lease, utility bill or official letter showing your name and address. Many services also require you to report a change of address within a deadline.',
      hi: 'आप कहाँ रहते हैं इसका प्रमाण, जैसे किरायानामा, बिजली-पानी का बिल या आपके नाम और पते वाला सरकारी पत्र। कई सेवाओं में पता बदलने की सूचना तय समय में देनी होती है।',
      pa: 'ਤੁਸੀਂ ਕਿੱਥੇ ਰਹਿੰਦੇ ਹੋ ਇਸ ਦਾ ਸਬੂਤ, ਜਿਵੇਂ ਕਿਰਾਇਆਨਾਮਾ, ਬਿਜਲੀ-ਪਾਣੀ ਦਾ ਬਿੱਲ ਜਾਂ ਤੁਹਾਡੇ ਨਾਂ ਅਤੇ ਪਤੇ ਵਾਲੀ ਸਰਕਾਰੀ ਚਿੱਠੀ। ਕਈ ਸੇਵਾਵਾਂ ਵਿੱਚ ਪਤਾ ਬਦਲਣ ਦੀ ਸੂਚਨਾ ਤੈਅ ਸਮੇਂ ਵਿੱਚ ਦੇਣੀ ਪੈਂਦੀ ਹੈ।',
      es: 'Prueba de dónde vive, como un contrato de alquiler, una factura de servicios o una carta oficial con su nombre y dirección. Muchos servicios también exigen informar un cambio de domicilio dentro de un plazo.',
      fr: "Preuve de votre lieu de résidence, comme un bail, une facture de services publics ou une lettre officielle indiquant votre nom et votre adresse. De nombreux services exigent aussi de déclarer un changement d'adresse dans un délai fixé.",
      ar: 'إثبات مكان سكنك، مثل عقد إيجار أو فاتورة خدمات أو رسالة رسمية تحمل اسمك وعنوانك. كما تشترط خدمات كثيرة الإبلاغ عن تغيير العنوان خلال مهلة محددة.' }],
  ['electronic_lodgement',
    { en: 'Electronic Lodgement', hi: 'ऑनलाइन जमा करना', pa: 'ਆਨਲਾਈਨ ਜਮ੍ਹਾਂ ਕਰਵਾਉਣਾ', es: 'Presentación electrónica', fr: 'Dépôt électronique', ar: 'التقديم الإلكتروني' },
    { en: 'Submitting an application or document online through an official portal. Keep the confirmation number or receipt, because it is your proof that you filed on time.',
      hi: 'किसी आधिकारिक पोर्टल के ज़रिए आवेदन या दस्तावेज़ ऑनलाइन जमा करना। पुष्टि संख्या या रसीद संभालकर रखें, क्योंकि यही समय पर जमा करने का आपका प्रमाण है।',
      pa: 'ਕਿਸੇ ਅਧਿਕਾਰਤ ਪੋਰਟਲ ਰਾਹੀਂ ਅਰਜ਼ੀ ਜਾਂ ਦਸਤਾਵੇਜ਼ ਆਨਲਾਈਨ ਜਮ੍ਹਾਂ ਕਰਵਾਉਣਾ। ਪੁਸ਼ਟੀ ਨੰਬਰ ਜਾਂ ਰਸੀਦ ਸੰਭਾਲ ਕੇ ਰੱਖੋ, ਕਿਉਂਕਿ ਇਹੀ ਸਮੇਂ ਸਿਰ ਜਮ੍ਹਾਂ ਕਰਵਾਉਣ ਦਾ ਤੁਹਾਡਾ ਸਬੂਤ ਹੈ।',
      es: 'Enviar una solicitud o documento en línea por un portal oficial. Guarde el número de confirmación o el recibo, porque es su prueba de que lo presentó a tiempo.',
      fr: "Soumettre une demande ou un document en ligne par un portail officiel. Conservez le numéro de confirmation ou le reçu : c'est votre preuve de dépôt dans les délais.",
      ar: 'تقديم طلب أو مستند عبر الإنترنت من خلال بوابة رسمية. احتفظ برقم التأكيد أو الإيصال لأنه دليلك على التقديم في الموعد.' }],
  ['paper_submission',
    { en: 'Paper Submission', hi: 'काग़ज़ी जमा', pa: 'ਕਾਗਜ਼ੀ ਜਮ੍ਹਾਂ', es: 'Presentación en papel', fr: 'Dépôt papier', ar: 'التقديم الورقي' },
    { en: 'Sending an application or document by mail or in person. Use a trackable delivery method and keep copies, because the date it is received can matter.',
      hi: 'आवेदन या दस्तावेज़ डाक से या खुद जाकर जमा करना। ट्रैक हो सकने वाला तरीका अपनाएं और कॉपी रखें, क्योंकि इसके प्राप्त होने की तारीख मायने रख सकती है।',
      pa: 'ਅਰਜ਼ੀ ਜਾਂ ਦਸਤਾਵੇਜ਼ ਡਾਕ ਰਾਹੀਂ ਜਾਂ ਖੁਦ ਜਾ ਕੇ ਜਮ੍ਹਾਂ ਕਰਵਾਉਣਾ। ਟ੍ਰੈਕ ਹੋ ਸਕਣ ਵਾਲਾ ਤਰੀਕਾ ਵਰਤੋ ਅਤੇ ਕਾਪੀਆਂ ਰੱਖੋ, ਕਿਉਂਕਿ ਇਸ ਦੇ ਮਿਲਣ ਦੀ ਤਰੀਕ ਮਾਇਨੇ ਰੱਖ ਸਕਦੀ ਹੈ।',
      es: 'Enviar una solicitud o documento por correo o en persona. Use un método con seguimiento y guarde copias, porque la fecha de recepción puede ser importante.',
      fr: "Envoyer une demande ou un document par la poste ou en personne. Utilisez un mode d'envoi avec suivi et gardez des copies, car la date de réception peut compter.",
      ar: 'إرسال طلب أو مستند بالبريد أو شخصياً. استخدم وسيلة يمكن تتبعها واحتفظ بنسخ، لأن تاريخ الاستلام قد يكون مهماً.' }],
  ['inspection_standard',
    { en: 'Inspection Standard', hi: 'निरीक्षण मानक', pa: 'ਨਿਰੀਖਣ ਮਿਆਰ', es: 'Norma de inspección', fr: "Norme d'inspection", ar: 'معيار التفتيش' },
    { en: 'The rules an inspector uses to check a home, workplace, vehicle or facility, for example for safety, health or repairs. You can usually ask for an inspection if you think the standard is not met.',
      hi: 'वे नियम जिनसे निरीक्षक घर, कार्यस्थल, वाहन या सुविधा की जाँच करता है, जैसे सुरक्षा, स्वास्थ्य या मरम्मत के लिए। अगर आपको लगता है कि मानक पूरा नहीं हो रहा तो आप आमतौर पर निरीक्षण की मांग कर सकते हैं।',
      pa: 'ਉਹ ਨਿਯਮ ਜਿਨ੍ਹਾਂ ਨਾਲ ਨਿਰੀਖਕ ਘਰ, ਕੰਮ ਦੀ ਥਾਂ, ਵਾਹਨ ਜਾਂ ਸਹੂਲਤ ਦੀ ਜਾਂਚ ਕਰਦਾ ਹੈ, ਜਿਵੇਂ ਸੁਰੱਖਿਆ, ਸਿਹਤ ਜਾਂ ਮੁਰੰਮਤ ਲਈ। ਜੇ ਤੁਹਾਨੂੰ ਲੱਗਦਾ ਹੈ ਕਿ ਮਿਆਰ ਪੂਰਾ ਨਹੀਂ ਹੋ ਰਿਹਾ ਤਾਂ ਤੁਸੀਂ ਆਮ ਤੌਰ ’ਤੇ ਨਿਰੀਖਣ ਦੀ ਮੰਗ ਕਰ ਸਕਦੇ ਹੋ।',
      es: 'Reglas que usa un inspector para revisar una vivienda, lugar de trabajo, vehículo o instalación, por ejemplo en seguridad, salud o reparaciones. Normalmente puede pedir una inspección si cree que no se cumple la norma.',
      fr: "Règles qu'un inspecteur utilise pour vérifier un logement, un lieu de travail, un véhicule ou une installation, par exemple pour la sécurité, la santé ou les réparations. Vous pouvez généralement demander une inspection si la norme ne semble pas respectée.",
      ar: 'القواعد التي يستخدمها المفتش لفحص مسكن أو مكان عمل أو مركبة أو منشأة، مثل السلامة أو الصحة أو الإصلاحات. يمكنك عادة طلب تفتيش إذا اعتقدت أن المعيار غير مستوفى.' }],
  ['minimum_standard',
    { en: 'Minimum Standard', hi: 'न्यूनतम मानक', pa: 'ਘੱਟੋ-ਘੱਟ ਮਿਆਰ', es: 'Norma mínima', fr: 'Norme minimale', ar: 'الحد الأدنى من المعايير' },
    { en: 'The lowest level the law allows, such as minimum wage, minimum heat in a rental or minimum notice. A private agreement cannot normally take away a minimum standard set by law.',
      hi: 'कानून द्वारा अनुमत सबसे निचला स्तर, जैसे न्यूनतम वेतन, किराये के घर में न्यूनतम हीटिंग या न्यूनतम नोटिस। कोई निजी समझौता आमतौर पर कानून द्वारा तय न्यूनतम मानक को खत्म नहीं कर सकता।',
      pa: 'ਕਾਨੂੰਨ ਵੱਲੋਂ ਮਨਜ਼ੂਰ ਸਭ ਤੋਂ ਹੇਠਲਾ ਪੱਧਰ, ਜਿਵੇਂ ਘੱਟੋ-ਘੱਟ ਤਨਖਾਹ, ਕਿਰਾਏ ਦੇ ਘਰ ਵਿੱਚ ਘੱਟੋ-ਘੱਟ ਹੀਟਿੰਗ ਜਾਂ ਘੱਟੋ-ਘੱਟ ਨੋਟਿਸ। ਕੋਈ ਨਿੱਜੀ ਸਮਝੌਤਾ ਆਮ ਤੌਰ ’ਤੇ ਕਾਨੂੰਨ ਵੱਲੋਂ ਤੈਅ ਘੱਟੋ-ਘੱਟ ਮਿਆਰ ਖਤਮ ਨਹੀਂ ਕਰ ਸਕਦਾ।',
      es: 'Nivel más bajo que permite la ley, como el salario mínimo, la calefacción mínima en un alquiler o el aviso mínimo. Un acuerdo privado normalmente no puede eliminar una norma mínima fijada por ley.',
      fr: "Niveau le plus bas permis par la loi, comme le salaire minimum, le chauffage minimal d'un logement loué ou le préavis minimal. Une entente privée ne peut normalement pas supprimer une norme minimale prévue par la loi.",
      ar: 'أدنى مستوى يسمح به القانون، مثل الحد الأدنى للأجور أو الحد الأدنى للتدفئة في السكن المؤجر أو الحد الأدنى لمدة الإشعار. لا يمكن عادة لاتفاق خاص أن يلغي حداً أدنى يفرضه القانون.' }],
  ['statutory_notification',
    { en: 'Statutory Notification', hi: 'कानूनी सूचना', pa: 'ਕਾਨੂੰਨੀ ਸੂਚਨਾ', es: 'Notificación legal', fr: 'Avis légal', ar: 'الإشعار القانوني' },
    { en: 'A notice the law requires someone to give, in a set form and within a set time, such as a notice to end a tenancy or a rent increase notice. A notice that does not follow the rules may not be valid.',
      hi: 'ऐसी सूचना जो कानून के अनुसार तय रूप में और तय समय में देनी होती है, जैसे किरायेदारी खत्म करने या किराया बढ़ाने का नोटिस। नियमों का पालन न करने वाला नोटिस मान्य नहीं भी हो सकता है।',
      pa: 'ਅਜਿਹੀ ਸੂਚਨਾ ਜੋ ਕਾਨੂੰਨ ਮੁਤਾਬਕ ਤੈਅ ਰੂਪ ਵਿੱਚ ਅਤੇ ਤੈਅ ਸਮੇਂ ਵਿੱਚ ਦੇਣੀ ਪੈਂਦੀ ਹੈ, ਜਿਵੇਂ ਕਿਰਾਏਦਾਰੀ ਖਤਮ ਕਰਨ ਜਾਂ ਕਿਰਾਇਆ ਵਧਾਉਣ ਦਾ ਨੋਟਿਸ। ਨਿਯਮਾਂ ਦੀ ਪਾਲਣਾ ਨਾ ਕਰਨ ਵਾਲਾ ਨੋਟਿਸ ਜਾਇਜ਼ ਨਹੀਂ ਵੀ ਹੋ ਸਕਦਾ।',
      es: 'Aviso que la ley exige dar, en un formato y plazo fijos, como un aviso de terminación del arrendamiento o de aumento del alquiler. Un aviso que no siga las reglas puede no ser válido.',
      fr: "Avis que la loi oblige à donner, selon une forme et un délai précis, comme un avis de fin de location ou d'augmentation de loyer. Un avis qui ne respecte pas les règles peut ne pas être valide.",
      ar: 'إشعار يفرض القانون تقديمه بصيغة ومهلة محددتين، مثل إشعار إنهاء الإيجار أو زيادة الإيجار. الإشعار الذي لا يتبع القواعد قد لا يكون صحيحاً.' }],
  ['consumer_recourse',
    { en: 'Consumer Recourse', hi: 'उपभोक्ता उपाय', pa: 'ਖਪਤਕਾਰ ਉਪਾਅ', es: 'Recursos del consumidor', fr: 'Recours du consommateur', ar: 'سبل انتصاف المستهلك' },
    { en: 'Ways to fix a problem with a purchase or service, such as a refund, repair, a complaint to a regulator or a small claims case. Keep receipts and written records.',
      hi: 'किसी खरीद या सेवा की समस्या ठीक कराने के तरीके, जैसे पैसे वापसी, मरम्मत, नियामक से शिकायत या स्मॉल क्लेम्स केस। रसीदें और लिखित रिकॉर्ड संभालकर रखें।',
      pa: 'ਕਿਸੇ ਖਰੀਦ ਜਾਂ ਸੇਵਾ ਦੀ ਸਮੱਸਿਆ ਠੀਕ ਕਰਵਾਉਣ ਦੇ ਤਰੀਕੇ, ਜਿਵੇਂ ਪੈਸੇ ਵਾਪਸੀ, ਮੁਰੰਮਤ, ਰੈਗੂਲੇਟਰ ਕੋਲ ਸ਼ਿਕਾਇਤ ਜਾਂ ਸਮਾਲ ਕਲੇਮਜ਼ ਕੇਸ। ਰਸੀਦਾਂ ਅਤੇ ਲਿਖਤੀ ਰਿਕਾਰਡ ਸੰਭਾਲ ਕੇ ਰੱਖੋ।',
      es: 'Formas de resolver un problema con una compra o servicio, como un reembolso, una reparación, una queja ante un regulador o una demanda de menor cuantía. Guarde recibos y registros escritos.',
      fr: "Moyens de régler un problème lié à un achat ou à un service, comme un remboursement, une réparation, une plainte à un organisme de réglementation ou une demande aux petites créances. Gardez les reçus et les traces écrites.",
      ar: 'طرق حل مشكلة في شراء أو خدمة، مثل استرداد المبلغ أو الإصلاح أو تقديم شكوى إلى جهة تنظيمية أو رفع دعوى صغيرة. احتفظ بالإيصالات والسجلات المكتوبة.' }],
  ['public_register',
    { en: 'Public Register', hi: 'सार्वजनिक रजिस्टर', pa: 'ਜਨਤਕ ਰਜਿਸਟਰ', es: 'Registro público', fr: 'Registre public', ar: 'السجل العام' },
    { en: 'An official list anyone can check, such as registered professionals, licensed businesses or licensed immigration consultants. Checking it helps you avoid unlicensed providers and scams.',
      hi: 'आधिकारिक सूची जिसे कोई भी देख सकता है, जैसे पंजीकृत पेशेवर, लाइसेंस प्राप्त व्यवसाय या लाइसेंस प्राप्त इमिग्रेशन कंसल्टेंट। इसे जाँचने से बिना लाइसेंस वालों और धोखाधड़ी से बचा जा सकता है।',
      pa: 'ਅਧਿਕਾਰਤ ਸੂਚੀ ਜਿਸ ਨੂੰ ਕੋਈ ਵੀ ਵੇਖ ਸਕਦਾ ਹੈ, ਜਿਵੇਂ ਰਜਿਸਟਰਡ ਪੇਸ਼ੇਵਰ, ਲਾਇਸੈਂਸ ਵਾਲੇ ਕਾਰੋਬਾਰ ਜਾਂ ਲਾਇਸੈਂਸ ਵਾਲੇ ਇਮੀਗ੍ਰੇਸ਼ਨ ਕੰਸਲਟੈਂਟ। ਇਸ ਨੂੰ ਜਾਂਚਣ ਨਾਲ ਬਿਨਾਂ ਲਾਇਸੈਂਸ ਵਾਲਿਆਂ ਅਤੇ ਧੋਖਾਧੜੀ ਤੋਂ ਬਚਿਆ ਜਾ ਸਕਦਾ ਹੈ।',
      es: 'Lista oficial que cualquiera puede consultar, como profesionales registrados, empresas con licencia o consultores de inmigración con licencia. Consultarla ayuda a evitar proveedores sin licencia y estafas.',
      fr: "Liste officielle que tout le monde peut consulter, comme les professionnels inscrits, les entreprises autorisées ou les consultants en immigration autorisés. La vérifier aide à éviter les fournisseurs non autorisés et les fraudes.",
      ar: 'قائمة رسمية يمكن لأي شخص الاطلاع عليها، مثل المهنيين المسجلين أو الشركات المرخصة أو مستشاري الهجرة المرخصين. مراجعتها تساعدك على تجنب غير المرخصين والاحتيال.' }],
  ['emergency_shelter',
    { en: 'Emergency Shelter', hi: 'आपातकालीन आश्रय', pa: 'ਐਮਰਜੈਂਸੀ ਆਸਰਾ', es: 'Refugio de emergencia', fr: "Refuge d'urgence", ar: 'مأوى الطوارئ' },
    { en: 'Short-term safe housing for people who are homeless, fleeing violence or in crisis. Shelters are usually free, and local intake or helplines can tell you where space is available.',
      hi: 'बेघर, हिंसा से बचकर भागे या संकट में फँसे लोगों के लिए कम समय का सुरक्षित आवास। आश्रय आमतौर पर मुफ़्त होते हैं, और स्थानीय इनटेक या हेल्पलाइन बता सकती है कि कहाँ जगह उपलब्ध है।',
      pa: 'ਬੇਘਰ, ਹਿੰਸਾ ਤੋਂ ਬਚ ਕੇ ਆਏ ਜਾਂ ਸੰਕਟ ਵਿੱਚ ਫਸੇ ਲੋਕਾਂ ਲਈ ਥੋੜ੍ਹੇ ਸਮੇਂ ਦੀ ਸੁਰੱਖਿਅਤ ਰਿਹਾਇਸ਼। ਆਸਰੇ ਆਮ ਤੌਰ ’ਤੇ ਮੁਫ਼ਤ ਹੁੰਦੇ ਹਨ, ਅਤੇ ਸਥਾਨਕ ਇਨਟੇਕ ਜਾਂ ਹੈਲਪਲਾਈਨ ਦੱਸ ਸਕਦੀ ਹੈ ਕਿ ਕਿੱਥੇ ਥਾਂ ਉਪਲਬਧ ਹੈ।',
      es: 'Alojamiento seguro a corto plazo para personas sin hogar, que huyen de la violencia o están en crisis. Los refugios suelen ser gratuitos, y los servicios locales de admisión o líneas de ayuda pueden indicarle dónde hay lugar.',
      fr: "Hébergement sûr à court terme pour les personnes sans abri, fuyant la violence ou en crise. Les refuges sont généralement gratuits, et les services d'accueil ou lignes d'aide locales peuvent indiquer où il reste de la place.",
      ar: 'سكن آمن قصير الأمد لمن هم بلا مأوى أو الفارين من العنف أو في أزمة. الملاجئ عادة مجانية، ويمكن لخدمات الاستقبال أو خطوط المساعدة المحلية إخبارك بالأماكن المتاحة.' }],
  ['community_navigator',
    { en: 'Community Navigator', hi: 'सामुदायिक मार्गदर्शक', pa: 'ਭਾਈਚਾਰਕ ਮਾਰਗਦਰਸ਼ਕ', es: 'Orientador comunitario', fr: 'Intervenant communautaire', ar: 'المرشد المجتمعي' },
    { en: 'A trained worker, often at a settlement agency, who helps newcomers find and use services such as housing, health care, jobs and schools. Their help is usually free.',
      hi: 'प्रशिक्षित कर्मचारी, अक्सर किसी सेटलमेंट एजेंसी में, जो नए आए लोगों को आवास, स्वास्थ्य सेवा, नौकरी और स्कूल जैसी सेवाएं खोजने और इस्तेमाल करने में मदद करता है। उनकी मदद आमतौर पर मुफ़्त होती है।',
      pa: 'ਸਿਖਲਾਈ ਪ੍ਰਾਪਤ ਕਰਮਚਾਰੀ, ਅਕਸਰ ਕਿਸੇ ਸੈਟਲਮੈਂਟ ਏਜੰਸੀ ਵਿੱਚ, ਜੋ ਨਵੇਂ ਆਏ ਲੋਕਾਂ ਨੂੰ ਰਿਹਾਇਸ਼, ਸਿਹਤ ਸੰਭਾਲ, ਨੌਕਰੀ ਅਤੇ ਸਕੂਲ ਵਰਗੀਆਂ ਸੇਵਾਵਾਂ ਲੱਭਣ ਅਤੇ ਵਰਤਣ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ। ਉਨ੍ਹਾਂ ਦੀ ਮਦਦ ਆਮ ਤੌਰ ’ਤੇ ਮੁਫ਼ਤ ਹੁੰਦੀ ਹੈ।',
      es: 'Trabajador capacitado, a menudo de una agencia de asentamiento, que ayuda a los recién llegados a encontrar y usar servicios como vivienda, salud, empleo y escuelas. Su ayuda suele ser gratuita.',
      fr: "Intervenant formé, souvent dans un organisme d'aide à l'établissement, qui aide les nouveaux arrivants à trouver et utiliser des services comme le logement, la santé, l'emploi et l'école. Son aide est généralement gratuite.",
      ar: 'موظف مدرَّب، غالباً في وكالة استقرار، يساعد القادمين الجدد على إيجاد خدمات مثل السكن والرعاية الصحية والعمل والمدارس واستخدامها. مساعدته عادة مجانية.' }],
  ['interpreter_assistance',
    { en: 'Interpreter Assistance', hi: 'दुभाषिया सहायता', pa: 'ਦੁਭਾਸ਼ੀਆ ਸਹਾਇਤਾ', es: 'Asistencia de intérprete', fr: "Aide d'un interprète", ar: 'المساعدة بمترجم فوري' },
    { en: 'Help from a professional interpreter so you can understand and be understood. Courts, tribunals and many health and government services provide interpreters, often free, if you ask in advance.',
      hi: 'पेशेवर दुभाषिये की मदद ताकि आप समझ सकें और आपकी बात समझी जा सके। अदालतें, ट्रिब्यूनल और कई स्वास्थ्य व सरकारी सेवाएं पहले से मांगने पर अक्सर मुफ़्त दुभाषिया देती हैं।',
      pa: 'ਪੇਸ਼ੇਵਰ ਦੁਭਾਸ਼ੀਏ ਦੀ ਮਦਦ ਤਾਂ ਜੋ ਤੁਸੀਂ ਸਮਝ ਸਕੋ ਅਤੇ ਤੁਹਾਡੀ ਗੱਲ ਸਮਝੀ ਜਾ ਸਕੇ। ਅਦਾਲਤਾਂ, ਟ੍ਰਿਬਿਊਨਲ ਅਤੇ ਕਈ ਸਿਹਤ ਤੇ ਸਰਕਾਰੀ ਸੇਵਾਵਾਂ ਪਹਿਲਾਂ ਮੰਗਣ ’ਤੇ ਅਕਸਰ ਮੁਫ਼ਤ ਦੁਭਾਸ਼ੀਆ ਦਿੰਦੀਆਂ ਹਨ।',
      es: 'Ayuda de un intérprete profesional para que usted entienda y se le entienda. Los tribunales y muchos servicios de salud y del gobierno ofrecen intérpretes, a menudo gratis, si se solicita con anticipación.',
      fr: "Aide d'un interprète professionnel pour que vous compreniez et soyez compris. Les tribunaux et de nombreux services de santé et gouvernementaux fournissent un interprète, souvent gratuitement, si vous le demandez à l'avance.",
      ar: 'مساعدة مترجم فوري محترف لتفهم وتُفهَم. توفر المحاكم والهيئات القضائية وكثير من الخدمات الصحية والحكومية مترجمين، غالباً مجاناً، إذا طلبت ذلك مسبقاً.' }],
  ['legal_aid_clinic',
    { en: 'Legal Aid Clinic', hi: 'कानूनी सहायता क्लिनिक', pa: 'ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਕਲੀਨਿਕ', es: 'Clínica de asistencia jurídica', fr: "Clinique d'aide juridique", ar: 'عيادة المساعدة القانونية' },
    { en: 'A free or low-cost legal service for people with low income, often covering housing, employment, immigration and benefits problems. Eligibility depends on your income and the type of problem.',
      hi: 'कम आय वाले लोगों के लिए मुफ़्त या कम खर्च वाली कानूनी सेवा, जो अक्सर आवास, रोज़गार, इमिग्रेशन और सरकारी लाभ से जुड़ी समस्याओं में मदद करती है। पात्रता आपकी आय और समस्या के प्रकार पर निर्भर करती है।',
      pa: 'ਘੱਟ ਆਮਦਨ ਵਾਲੇ ਲੋਕਾਂ ਲਈ ਮੁਫ਼ਤ ਜਾਂ ਘੱਟ ਖਰਚੇ ਵਾਲੀ ਕਾਨੂੰਨੀ ਸੇਵਾ, ਜੋ ਅਕਸਰ ਰਿਹਾਇਸ਼, ਰੁਜ਼ਗਾਰ, ਇਮੀਗ੍ਰੇਸ਼ਨ ਅਤੇ ਸਰਕਾਰੀ ਲਾਭਾਂ ਨਾਲ ਜੁੜੀਆਂ ਸਮੱਸਿਆਵਾਂ ਵਿੱਚ ਮਦਦ ਕਰਦੀ ਹੈ। ਯੋਗਤਾ ਤੁਹਾਡੀ ਆਮਦਨ ਅਤੇ ਸਮੱਸਿਆ ਦੀ ਕਿਸਮ ’ਤੇ ਨਿਰਭਰ ਕਰਦੀ ਹੈ।',
      es: 'Servicio legal gratuito o de bajo costo para personas de bajos ingresos, que suele cubrir problemas de vivienda, empleo, inmigración y prestaciones. La elegibilidad depende de sus ingresos y del tipo de problema.',
      fr: "Service juridique gratuit ou peu coûteux pour les personnes à faible revenu, souvent pour des problèmes de logement, d'emploi, d'immigration et de prestations. L'admissibilité dépend de votre revenu et du type de problème.",
      ar: 'خدمة قانونية مجانية أو منخفضة التكلفة لذوي الدخل المحدود، تغطي غالباً مشكلات السكن والعمل والهجرة والإعانات. تعتمد الأهلية على دخلك ونوع المشكلة.' }],
  ['regulatory_board',
    { en: 'Regulatory Board', hi: 'नियामक बोर्ड', pa: 'ਰੈਗੂਲੇਟਰੀ ਬੋਰਡ', es: 'Organismo regulador', fr: 'Organisme de réglementation', ar: 'الهيئة التنظيمية' },
    { en: 'An official body that licenses and oversees a profession or industry, sets standards and handles complaints. Working in a regulated profession usually requires its licence.',
      hi: 'वह सरकारी संस्था जो किसी पेशे या उद्योग को लाइसेंस देती है, उसकी निगरानी करती है, मानक तय करती है और शिकायतें सुनती है। किसी नियंत्रित पेशे में काम करने के लिए आमतौर पर उसका लाइसेंस चाहिए।',
      pa: 'ਉਹ ਸਰਕਾਰੀ ਸੰਸਥਾ ਜੋ ਕਿਸੇ ਪੇਸ਼ੇ ਜਾਂ ਉਦਯੋਗ ਨੂੰ ਲਾਇਸੈਂਸ ਦਿੰਦੀ ਹੈ, ਉਸ ਦੀ ਨਿਗਰਾਨੀ ਕਰਦੀ ਹੈ, ਮਿਆਰ ਤੈਅ ਕਰਦੀ ਹੈ ਅਤੇ ਸ਼ਿਕਾਇਤਾਂ ਸੁਣਦੀ ਹੈ। ਕਿਸੇ ਨਿਯੰਤ੍ਰਿਤ ਪੇਸ਼ੇ ਵਿੱਚ ਕੰਮ ਕਰਨ ਲਈ ਆਮ ਤੌਰ ’ਤੇ ਉਸ ਦਾ ਲਾਇਸੈਂਸ ਚਾਹੀਦਾ ਹੈ।',
      es: 'Organismo oficial que otorga licencias y supervisa una profesión o industria, fija normas y atiende quejas. Trabajar en una profesión regulada suele requerir su licencia.',
      fr: "Organisme officiel qui délivre les permis, encadre une profession ou un secteur, fixe les normes et traite les plaintes. Exercer une profession réglementée exige généralement son permis.",
      ar: 'جهة رسمية تمنح التراخيص وتشرف على مهنة أو صناعة وتضع المعايير وتعالج الشكاوى. العمل في مهنة منظمة يتطلب عادة ترخيصها.' }],
  ['hearing_tribunal',
    { en: 'Hearing Tribunal', hi: 'सुनवाई ट्रिब्यूनल', pa: 'ਸੁਣਵਾਈ ਟ੍ਰਿਬਿਊਨਲ', es: 'Tribunal administrativo', fr: 'Tribunal administratif', ar: 'هيئة الاستماع القضائية' },
    { en: 'An independent decision-maker, less formal than a court, that hears disputes in areas such as tenancy, employment, human rights or immigration. You can present evidence and witnesses.',
      hi: 'अदालत से कम औपचारिक, स्वतंत्र निर्णयकर्ता संस्था जो किरायेदारी, रोज़गार, मानवाधिकार या इमिग्रेशन जैसे क्षेत्रों के विवाद सुनती है। आप सबूत और गवाह पेश कर सकते हैं।',
      pa: 'ਅਦਾਲਤ ਨਾਲੋਂ ਘੱਟ ਰਸਮੀ, ਸੁਤੰਤਰ ਫ਼ੈਸਲਾ ਕਰਨ ਵਾਲੀ ਸੰਸਥਾ ਜੋ ਕਿਰਾਏਦਾਰੀ, ਰੁਜ਼ਗਾਰ, ਮਨੁੱਖੀ ਅਧਿਕਾਰ ਜਾਂ ਇਮੀਗ੍ਰੇਸ਼ਨ ਵਰਗੇ ਖੇਤਰਾਂ ਦੇ ਵਿਵਾਦ ਸੁਣਦੀ ਹੈ। ਤੁਸੀਂ ਸਬੂਤ ਅਤੇ ਗਵਾਹ ਪੇਸ਼ ਕਰ ਸਕਦੇ ਹੋ।',
      es: 'Órgano de decisión independiente, menos formal que un juzgado, que resuelve disputas en materias como arrendamiento, empleo, derechos humanos o inmigración. Puede presentar pruebas y testigos.',
      fr: "Instance de décision indépendante, moins formelle qu'un tribunal judiciaire, qui entend des litiges en matière de location, d'emploi, de droits de la personne ou d'immigration. Vous pouvez présenter des preuves et des témoins.",
      ar: 'جهة مستقلة لاتخاذ القرار، أقل رسمية من المحكمة، تنظر في النزاعات في مجالات مثل الإيجار أو العمل أو حقوق الإنسان أو الهجرة. يمكنك تقديم الأدلة والشهود.' }],
  ['official_transcript',
    { en: 'Official Transcript', hi: 'आधिकारिक अंकपत्र', pa: 'ਅਧਿਕਾਰਤ ਅੰਕ-ਪੱਤਰ', es: 'Certificado oficial de notas', fr: 'Relevé de notes officiel', ar: 'كشف الدرجات الرسمي' },
    { en: 'An official record of your studies issued by your school, listing courses and grades. Credential assessors and licensing bodies often require it to be sent directly by the school.',
      hi: 'आपके स्कूल या विश्वविद्यालय द्वारा जारी पढ़ाई का आधिकारिक रिकॉर्ड, जिसमें विषय और अंक होते हैं। क्रेडेंशियल मूल्यांकन संस्थाएं और लाइसेंस देने वाली संस्थाएं अक्सर इसे सीधे संस्था से मंगवाती हैं।',
      pa: 'ਤੁਹਾਡੇ ਸਕੂਲ ਜਾਂ ਯੂਨੀਵਰਸਿਟੀ ਵੱਲੋਂ ਜਾਰੀ ਪੜ੍ਹਾਈ ਦਾ ਅਧਿਕਾਰਤ ਰਿਕਾਰਡ, ਜਿਸ ਵਿੱਚ ਵਿਸ਼ੇ ਅਤੇ ਅੰਕ ਹੁੰਦੇ ਹਨ। ਕ੍ਰੈਡੈਂਸ਼ੀਅਲ ਮੁਲਾਂਕਣ ਸੰਸਥਾਵਾਂ ਅਤੇ ਲਾਇਸੈਂਸ ਦੇਣ ਵਾਲੀਆਂ ਸੰਸਥਾਵਾਂ ਅਕਸਰ ਇਸ ਨੂੰ ਸਿੱਧਾ ਸੰਸਥਾ ਤੋਂ ਮੰਗਵਾਉਂਦੀਆਂ ਹਨ।',
      es: 'Registro oficial de sus estudios emitido por su institución, con las materias y calificaciones. Los evaluadores de credenciales y organismos de licencia suelen exigir que lo envíe directamente la institución.',
      fr: "Document officiel de vos études délivré par votre établissement, indiquant les cours et les notes. Les évaluateurs de diplômes et les ordres professionnels exigent souvent qu'il soit envoyé directement par l'établissement.",
      ar: 'سجل رسمي لدراستك تصدره مؤسستك التعليمية، ويتضمن المواد والدرجات. غالباً ما تشترط جهات تقييم الشهادات والترخيص إرساله مباشرة من المؤسسة.' }],
  ['notarized_affirmation',
    { en: 'Notarized Affirmation', hi: 'नोटरीकृत शपथ-पत्र', pa: 'ਨੋਟਰੀ ਵੱਲੋਂ ਤਸਦੀਕਸ਼ੁਦਾ ਹਲਫ਼ਨਾਮਾ', es: 'Declaración jurada notarial', fr: 'Déclaration solennelle notariée', ar: 'إقرار موثّق' },
    { en: 'A written statement you swear or affirm is true in front of a notary public or commissioner for oaths, who confirms your identity. It is used when an official document is missing or a fact must be formally declared.',
      hi: 'लिखित बयान जिसे आप नोटरी पब्लिक या शपथ आयुक्त के सामने सच होने की शपथ लेकर देते हैं, और वे आपकी पहचान की पुष्टि करते हैं। इसका उपयोग तब होता है जब कोई आधिकारिक दस्तावेज़ उपलब्ध न हो या किसी तथ्य की औपचारिक घोषणा करनी हो।',
      pa: 'ਲਿਖਤੀ ਬਿਆਨ ਜਿਸ ਨੂੰ ਤੁਸੀਂ ਨੋਟਰੀ ਪਬਲਿਕ ਜਾਂ ਹਲਫ਼ ਕਮਿਸ਼ਨਰ ਦੇ ਸਾਹਮਣੇ ਸੱਚ ਹੋਣ ਦੀ ਸਹੁੰ ਖਾ ਕੇ ਦਿੰਦੇ ਹੋ, ਅਤੇ ਉਹ ਤੁਹਾਡੀ ਪਛਾਣ ਦੀ ਪੁਸ਼ਟੀ ਕਰਦੇ ਹਨ। ਇਸ ਦੀ ਵਰਤੋਂ ਉਦੋਂ ਹੁੰਦੀ ਹੈ ਜਦੋਂ ਕੋਈ ਸਰਕਾਰੀ ਦਸਤਾਵੇਜ਼ ਉਪਲਬਧ ਨਾ ਹੋਵੇ ਜਾਂ ਕਿਸੇ ਤੱਥ ਦਾ ਰਸਮੀ ਐਲਾਨ ਕਰਨਾ ਹੋਵੇ।',
      es: 'Declaración escrita que usted jura o afirma como verdadera ante un notario o comisionado de juramentos, que confirma su identidad. Se usa cuando falta un documento oficial o debe declararse formalmente un hecho.',
      fr: "Déclaration écrite que vous jurez ou affirmez vraie devant un notaire ou un commissaire à l'assermentation, qui confirme votre identité. Elle sert lorsqu'un document officiel manque ou qu'un fait doit être déclaré officiellement.",
      ar: 'بيان مكتوب تُقسم أو تُقر بصحته أمام كاتب عدل أو مفوض أيمان يتحقق من هويتك. يُستخدم عند فقدان وثيقة رسمية أو عند الحاجة إلى إعلان واقعة بشكل رسمي.' }],
  ['biometric_enrolment',
    { en: 'Biometric Enrolment', hi: 'बायोमेट्रिक नामांकन', pa: 'ਬਾਇਓਮੈਟ੍ਰਿਕ ਦਾਖ਼ਲਾ', es: 'Registro biométrico', fr: 'Collecte des données biométriques', ar: 'تسجيل البيانات الحيوية' },
    { en: 'Giving your fingerprints and a photo for an application, for example for many Canadian visas and permits. You are usually asked to do this at an official service point after you apply.',
      hi: 'किसी आवेदन के लिए अपनी उंगलियों के निशान और फ़ोटो देना, जैसे कनाडा के कई वीज़ा और परमिट के लिए। आमतौर पर आवेदन के बाद आपसे किसी आधिकारिक केंद्र पर यह कराने को कहा जाता है।',
      pa: 'ਕਿਸੇ ਅਰਜ਼ੀ ਲਈ ਆਪਣੀਆਂ ਉਂਗਲਾਂ ਦੇ ਨਿਸ਼ਾਨ ਅਤੇ ਫ਼ੋਟੋ ਦੇਣਾ, ਜਿਵੇਂ ਕੈਨੇਡਾ ਦੇ ਕਈ ਵੀਜ਼ਿਆਂ ਅਤੇ ਪਰਮਿਟਾਂ ਲਈ। ਆਮ ਤੌਰ ’ਤੇ ਅਰਜ਼ੀ ਤੋਂ ਬਾਅਦ ਤੁਹਾਨੂੰ ਕਿਸੇ ਅਧਿਕਾਰਤ ਕੇਂਦਰ ’ਤੇ ਇਹ ਕਰਵਾਉਣ ਲਈ ਕਿਹਾ ਜਾਂਦਾ ਹੈ।',
      es: 'Proporcionar sus huellas dactilares y una foto para una solicitud, por ejemplo para muchas visas y permisos de Canadá. Normalmente se le pide hacerlo en un punto de servicio oficial después de solicitar.',
      fr: "Fournir vos empreintes digitales et une photo pour une demande, par exemple pour de nombreux visas et permis canadiens. On vous demande généralement de le faire dans un point de service officiel après votre demande.",
      ar: 'تقديم بصمات أصابعك وصورة لطلب ما، مثل كثير من التأشيرات والتصاريح الكندية. يُطلب منك عادة القيام بذلك في نقطة خدمة رسمية بعد تقديم الطلب.' }],
  ['port_clearance',
    { en: 'Port Clearance', hi: 'प्रवेश बंदरगाह पर अनुमति', pa: 'ਦਾਖ਼ਲਾ ਬੰਦਰਗਾਹ ’ਤੇ ਇਜਾਜ਼ਤ', es: 'Autorización en el puerto de entrada', fr: "Autorisation au point d'entrée", ar: 'الإذن في منفذ الدخول' },
    { en: 'Being allowed to enter a country at an airport, land border or seaport after an officer checks your documents and purpose of travel. An approved visa or permit does not guarantee entry.',
      hi: 'हवाई अड्डे, ज़मीनी सीमा या बंदरगाह पर अधिकारी द्वारा आपके दस्तावेज़ और यात्रा का उद्देश्य जाँचने के बाद देश में प्रवेश की अनुमति मिलना। मंज़ूर वीज़ा या परमिट प्रवेश की गारंटी नहीं है।',
      pa: 'ਹਵਾਈ ਅੱਡੇ, ਜ਼ਮੀਨੀ ਸਰਹੱਦ ਜਾਂ ਬੰਦਰਗਾਹ ’ਤੇ ਅਧਿਕਾਰੀ ਵੱਲੋਂ ਤੁਹਾਡੇ ਦਸਤਾਵੇਜ਼ ਅਤੇ ਯਾਤਰਾ ਦਾ ਮਕਸਦ ਜਾਂਚਣ ਤੋਂ ਬਾਅਦ ਦੇਸ਼ ਵਿੱਚ ਦਾਖ਼ਲੇ ਦੀ ਇਜਾਜ਼ਤ ਮਿਲਣਾ। ਮਨਜ਼ੂਰ ਵੀਜ਼ਾ ਜਾਂ ਪਰਮਿਟ ਦਾਖ਼ਲੇ ਦੀ ਗਾਰੰਟੀ ਨਹੀਂ ਹੈ।',
      es: 'Obtener permiso para entrar a un país en un aeropuerto, frontera terrestre o puerto marítimo después de que un oficial revise sus documentos y el motivo del viaje. Una visa o permiso aprobado no garantiza la entrada.',
      fr: "Être autorisé à entrer dans un pays à un aéroport, un poste frontalier terrestre ou un port après qu'un agent a vérifié vos documents et le motif du voyage. Un visa ou un permis approuvé ne garantit pas l'entrée.",
      ar: 'الحصول على إذن بدخول بلد في مطار أو معبر بري أو ميناء بعد أن يتحقق الموظف من مستنداتك والغرض من السفر. التأشيرة أو التصريح المعتمد لا يضمن الدخول.' }],
  ['customs_declaration',
    { en: 'Customs Declaration', hi: 'सीमा शुल्क घोषणा', pa: 'ਕਸਟਮ ਘੋਸ਼ਣਾ', es: 'Declaración de aduanas', fr: 'Déclaration en douane', ar: 'التصريح الجمركي' },
    { en: 'Telling border officers about the goods, food, plants, animals and money you are bringing in. In Canada, cash and monetary instruments of CAD 10,000 or more must be declared.',
      hi: 'सीमा अधिकारियों को उस सामान, भोजन, पौधों, जानवरों और पैसे के बारे में बताना जो आप साथ ला रहे हैं। कनाडा में CAD 10,000 या उससे अधिक की नकदी और मौद्रिक साधनों की घोषणा अनिवार्य है।',
      pa: 'ਸਰਹੱਦੀ ਅਧਿਕਾਰੀਆਂ ਨੂੰ ਉਸ ਸਮਾਨ, ਭੋਜਨ, ਪੌਦਿਆਂ, ਜਾਨਵਰਾਂ ਅਤੇ ਪੈਸੇ ਬਾਰੇ ਦੱਸਣਾ ਜੋ ਤੁਸੀਂ ਨਾਲ ਲਿਆ ਰਹੇ ਹੋ। ਕੈਨੇਡਾ ਵਿੱਚ CAD 10,000 ਜਾਂ ਇਸ ਤੋਂ ਵੱਧ ਨਕਦੀ ਅਤੇ ਮੁਦਰਾ ਸਾਧਨਾਂ ਦੀ ਘੋਸ਼ਣਾ ਲਾਜ਼ਮੀ ਹੈ।',
      es: 'Informar a los agentes fronterizos sobre los bienes, alimentos, plantas, animales y dinero que trae. En Canadá debe declararse el efectivo e instrumentos monetarios de CAD 10,000 o más.',
      fr: "Déclarer aux agents frontaliers les biens, aliments, plantes, animaux et l'argent que vous apportez. Au Canada, les espèces et effets monétaires de 10 000 $ CA ou plus doivent être déclarés.",
      ar: 'إبلاغ موظفي الحدود بالبضائع والأطعمة والنباتات والحيوانات والأموال التي تحملها. في كندا يجب التصريح بالنقد والأدوات النقدية التي تبلغ 10,000 دولار كندي أو أكثر.' }]
];

const CONCEPT_BY_SLUG = new Map(GLOSSARY_CONCEPTS.map(([slug, name, def]) => [slug, { name, def }]));

/**
 * Builds the concept entry for a glossary id such as "house_appeal_right_77".
 * Returns null for ids that are not concept entries.
 */
export function buildConceptTerm(id) {
  const m = /^([a-z]+)_([a-z_]+)_(\d+)$/.exec(id);
  if (!m) return null;
  const [, prefix, slug, number] = m;
  const area = GLOSSARY_AREAS[prefix], concept = CONCEPT_BY_SLUG.get(slug);
  if (!area || !concept) return null;
  const entry = { id, category: area.category, term_en: '', acronym: `${prefix.toUpperCase()}-${number}`, def_en: '' };
  for (const l of LANGS) {
    entry[`term_${l}`] = `${area.label[l]}: ${concept.name[l]}`;
    entry[`def_${l}`] = `${concept.def[l]} ${area.context[l]}`;
  }
  return entry;
}

// Ids 17-500 cycle through the 12 areas in this order while the concept
// advances every 12 ids (the first and last concept have 8 entries each).
const AREA_ORDER = ['imm', 'house', 'health', 'emp', 'bank', 'tax', 'edu', 'trans', 'legal', 'emerg', 'civic', 'prof'];
export function conceptGlossaryIds() {
  const ids = [];
  for (let n = 17; n <= 500; n++) {
    const prefix = AREA_ORDER[(n - 17) % 12];
    const slug = GLOSSARY_CONCEPTS[Math.floor((n - 17 + 4) / 12)][0];
    ids.push(`${prefix}_${slug}_${n}`);
  }
  return ids;
}

export function buildConceptGlossaryTerms() {
  return conceptGlossaryIds().map(buildConceptTerm);
}
