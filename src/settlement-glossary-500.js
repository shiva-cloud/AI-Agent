// src/settlement-glossary-500.js
import { buildConceptGlossaryTerms } from './glossary-concepts.js';
// Northstar Multilingual Settlement Glossary (500 Curated Legal & Settlement Terms)
// Languages: English (en), Hindi (hi), Punjabi (pa), Spanish (es), French (fr), Arabic (ar)
// Categories: immigration, housing, healthcare, employment, banking_finance, taxes_benefits,
//             education_childcare, transport_licensing, legal_rights, emergency_safety,
//             municipal_civics, professional_licensing.

export const SETTLEMENT_GLOSSARY_500 = [
  {
    "id": "maintained_status",
    "category": "immigration",
    "term_en": "Maintained Status",
    "acronym": "MS",
    "def_en": "Legal authorization to remain and continue working/studying while awaiting an extension decision if applied before expiry.",
    "term_hi": "मेंटेंड स्टेटस (वैध स्थिति विस्तार)",
    "def_hi": "वीज़ा समाप्ति से पहले विस्तार आवेदन करने पर निर्णय आने तक देश में रहने और काम/पढ़ाई करने का वैध अधिकार।",
    "term_pa": "ਮੇਨਟੇਨਡ ਸਟੇਟਸ (ਕਾਨੂੰਨੀ ਦਰਜਾ ਜਾਰੀ)",
    "def_pa": "ਵੀਜ਼ਾ ਖ਼ਤਮ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਵਾਧੇ ਦੀ ਅਰਜ਼ੀ ਦੇਣ 'ਤੇ ਫ਼ੈਸਲੇ ਤੱਕ ਕੰਮ/ਪੜ੍ਹਾਈ ਜਾਰੀ ਰੱਖਣ ਦੀ ਕਾਨੂੰਨੀ ਇਜਾਜ਼ਤ।",
    "term_es": "Estado Mantenido",
    "def_es": "Autorización legal para permanecer y trabajar o estudiar mientras se espera la decisión de extensión solicitada a tiempo.",
    "term_fr": "Statut Maintenu",
    "def_fr": "Autorisation légale de rester et de continuer à travailler/étudier en attendant une décision de prolongation.",
    "term_ar": "الوضع المحافظ عليه",
    "def_ar": "تصريح قانوني بالبقاء ومواصلة العمل أو الدراسة أثناء انتظار قرار تمديد التأشيرة المقدم قبل انتهائها."
  },
  {
    "id": "copr",
    "category": "immigration",
    "term_en": "Confirmation of Permanent Residence",
    "acronym": "CoPR",
    "def_en": "Official immigration document issued to approved permanent residents before PR card issuance.",
    "term_hi": "स्थायी निवास की पुष्टि (CoPR)",
    "def_hi": "पीआर कार्ड जारी होने से पहले अनुमोदित स्थायी निवासियों को जारी किया गया आधिकारिक इमिग्रेशन दस्तावेज़।",
    "term_pa": "ਪੱਕੇ ਵਸਨੀਕ ਹੋਣ ਦੀ ਪੁਸ਼ਟੀ (CoPR)",
    "def_pa": "ਪੀਆਰ ਕਾਰਡ ਮਿਲਣ ਤੋਂ ਪਹਿਲਾਂ ਪ੍ਰਵਾਨਿਤ ਪੱਕੇ ਵਸਨੀਕਾਂ ਨੂੰ ਜਾਰੀ ਕੀਤਾ ਜਾਣ ਵਾਲਾ ਸਰਕਾਰੀ ਦਸਤਾਵੇਜ਼।",
    "term_es": "Confirmación de Residencia Permanente",
    "def_es": "Documento oficial emitido a residentes permanentes aprobados antes de la tarjeta física.",
    "term_fr": "Confirmation de Résidence Permanente",
    "def_fr": "Document officiel délivré aux résidents permanents approuvés avant l'émission de la carte.",
    "term_ar": "تأكيد الإقامة الدائمة",
    "def_ar": "وثيقة رسمية تصدر للمقيمين الدائمين المعتمدين قبل إصدار بطاقة الإقامة الدائمة."
  },
  {
    "id": "bowp",
    "category": "immigration",
    "term_en": "Bridging Open Work Permit",
    "acronym": "BOWP",
    "def_en": "Work permit allowing qualifying permanent residence applicants to continue working while their PR application processes.",
    "term_hi": "ब्रिजिंग ओपन वर्क परमिट (BOWP)",
    "def_hi": "कार्य परमिट जो पीआर आवेदकों को उनका पीआर आवेदन प्रक्रियाधीन होने के दौरान काम जारी रखने की अनुमति देता है।",
    "term_pa": "ਬ੍ਰਿਜਿੰਗ ਓਪਨ ਵਰਕ ਪਰਮਿਟ (BOWP)",
    "def_pa": "ਵਰਕ ਪਰਮਿਟ ਜੋ ਪੀਆਰ ਬਿਨੈਕਾਰਾਂ ਨੂੰ ਉਹਨਾਂ ਦੀ ਅਰਜ਼ੀ ਦੇ ਫ਼ੈਸਲੇ ਤੱਕ ਕੰਮ ਜਾਰੀ ਰੱਖਣ ਦੀ ਇਜਾਜ਼ਤ ਦਿੰਦਾ ਹੈ।",
    "term_es": "Permiso de Trabajo Abierto Puente",
    "def_es": "Permiso que permite a los solicitantes de residencia continuar trabajando mientras se procesa su solicitud.",
    "term_fr": "Permis de Travail Ouvert Transitoire",
    "def_fr": "Permis permettant aux demandeurs de RP de continuer à travailler pendant le traitement de leur dossier.",
    "term_ar": "تصريح العمل المفتوح التجسيري",
    "def_ar": "تصريح عمل يسمح لمقدمي طلبات الإقامة الدائمة بمواصلة العمل أثناء معالجة طلبهم."
  },
  {
    "id": "pr_card",
    "category": "immigration",
    "term_en": "Permanent Resident Card",
    "acronym": "PR Card",
    "def_en": "Official wallet-sized identification card proving permanent resident status when traveling abroad.",
    "term_hi": "स्थायी निवासी कार्ड (PR कार्ड)",
    "def_hi": "विदेश यात्रा के दौरान स्थायी निवासी की स्थिति सिद्ध करने वाला आधिकारिक पहचान पत्र।",
    "term_pa": "ਪੱਕਾ ਰਿਹਾਇਸ਼ੀ ਕਾਰਡ (PR ਕਾਰਡ)",
    "def_pa": "ਵਿਦੇਸ਼ ਯਾਤਰਾ ਦੌਰਾਨ ਪੱਕੇ ਵਸਨੀਕ ਹੋਣ ਦਾ ਸਬੂਤ ਦੇਣ ਵਾਲਾ ਸਰਕਾਰੀ ਪਛਾਣ ਪੱਤਰ।",
    "term_es": "Tarjeta de Residencia Permanente",
    "def_es": "Documento de identidad oficial que prueba el estatus de residente permanente para reingresar al país.",
    "term_fr": "Carte de Résident Permanent",
    "def_fr": "Document officiel d'identité prouvant le statut de résident permanent lors des voyages.",
    "term_ar": "بطاقة المقيم الدائم",
    "def_ar": "بطاقة هوية رسمية تثبت وضع الإقامة الدائمة لحاملها عند السفر والعودة."
  },
  {
    "id": "port_of_entry",
    "category": "immigration",
    "term_en": "Port of Entry",
    "acronym": "POE",
    "def_en": "Designated international airport or border crossing where travelers officially seek entry into a country.",
    "term_hi": "प्रवेश बंदरगाह / सीमा चौकी (POE)",
    "def_hi": "नामित अंतरराष्ट्रीय हवाई अड्डा या सीमा चौकी जहां यात्री आधिकारिक रूप से देश में प्रवेश चाहते हैं।",
    "term_pa": "ਪੋਰਟ ਆਫ਼ ਐਂਟਰੀ (ਦਾਖਲਾ ਚੌਕੀ)",
    "def_pa": "ਨਿਰਧਾਰਿਤ ਹਵਾਈ ਅੱਡਾ ਜਾਂ ਸਰਹੱਦੀ ਚੌਕੀ ਜਿੱਥੇ ਯਾਤਰੀ ਕਾਨੂੰਨੀ ਤੌਰ 'ਤੇ ਦੇਸ਼ ਵਿੱਚ ਦਾਖਲ ਹੁੰਦੇ ਹਨ।",
    "term_es": "Puerto de Entrada",
    "def_es": "Aeropuerto internacional o cruce fronterizo donde los viajeros solicitan admisión legal al país.",
    "term_fr": "Point d'Entrée",
    "def_fr": "Aéroport international ou poste frontalier officiel où les voyageurs demandent l'admission.",
    "term_ar": "نقطة الدخول الرسمية",
    "def_ar": "المطار الدولي أو المعبر الحدودي المعتمد لدخول المسافرين قانونياً إلى البلاد."
  },
  {
    "id": "standard_lease",
    "category": "housing",
    "term_en": "Standard Form of Lease",
    "acronym": "SFL",
    "def_en": "Mandatory government-drafted tenancy agreement protecting tenant rights and standardizing terms.",
    "term_hi": "मानक पट्टा अनुबंध (स्टैंडर्ड लीज)",
    "def_hi": "अनिवार्य सरकारी पट्टा समझौता जो किरायेदार के अधिकारों की रक्षा करता है और शर्तों को मानकीकृत करता है।",
    "term_pa": "ਸਟੈਂਡਰਡ ਲੀਜ਼ ਇਕਰਾਰਨਾਮਾ",
    "def_pa": "ਲਾਜ਼ਮੀ ਸਰਕਾਰੀ ਕਿਰਾਏਦਾਰੀ ਸਮਝੌਤਾ ਜੋ ਕਿਰਾਏਦਾਰਾਂ ਦੇ ਅਧਿਕਾਰਾਂ ਦੀ ਰਾਖੀ ਕਰਦਾ ਹੈ।",
    "term_es": "Contrato de Arrendamiento Estándar",
    "def_es": "Acuerdo de alquiler oficial obligatorio que protege los derechos del inquilino.",
    "term_fr": "Bail Type Réglementaire",
    "def_fr": "Contrat de location officiel obligatoire garantissant les droits des locataires.",
    "term_ar": "عقد الإيجار الموحد",
    "def_ar": "عقد إيجار حكومي إلزامي يضمن حقوق المستأجر ويوحد شروط الاستئجار."
  },
  {
    "id": "rent_control",
    "category": "housing",
    "term_en": "Rent Control Guideline",
    "acronym": "RCG",
    "def_en": "Annual statutory percentage limit by which landlords can legally raise residential rent.",
    "term_hi": "किराया नियंत्रण दिशानिर्देश",
    "def_hi": "वार्षिक वैधानिक प्रतिशत सीमा जिसके अनुसार मकान मालिक कानूनी रूप से किराया बढ़ा सकते हैं।",
    "term_pa": "ਕਿਰਾਇਆ ਕੰਟਰੋਲ ਨਿਯਮ",
    "def_pa": "ਸਾਲਾਨਾ ਕਾਨੂੰਨੀ ਪ੍ਰਤੀਸ਼ਤ ਹੱਦ ਜਿਸ ਤੋਂ ਵੱਧ ਮਕਾਨ ਮਾਲਕ ਕਿਰਾਇਆ ਨਹੀਂ ਵਧਾ ਸਕਦਾ।",
    "term_es": "Límite de Control de Alquiler",
    "def_es": "Porcentaje anual legal máximo en el que un propietario puede aumentar el alquiler.",
    "term_fr": "Plafond de Contrôle des Loyers",
    "def_fr": "Pourcentage annuel légal limitant les hausses de loyer résidentiel.",
    "term_ar": "حد تنظيم زيادة الإيجار",
    "def_ar": "النسبة المئوية السنوية المحددة قانوناً والتي لا يجوز لمالك العقار تجاوزها عند رفع الإيجار."
  },
  {
    "id": "security_deposit",
    "category": "housing",
    "term_en": "Security Deposit / Rent Deposit",
    "acronym": "SD",
    "def_en": "Held deposit applied to final month of tenancy or property damage as legally permitted by jurisdiction.",
    "term_hi": "सुरक्षा जमा / किराया अग्रिम",
    "def_hi": "अंतिम महीने के किराये या कानूनी नुकसान की भरपाई के लिए सुरक्षित रखी गई जमा राशि।",
    "term_pa": "ਸੁਰੱਖਿਆ ਜਮ੍ਹਾਂ / ਸਕਿਓਰਿਟੀ ਡਿਪਾਜ਼ਿਟ",
    "def_pa": "ਆਖਰੀ ਮਹੀਨੇ ਦੇ ਕਿਰਾਏ ਜਾਂ ਕਾਨੂੰਨੀ ਨੁਕਸਾਨ ਦੀ ਪੂਰਤੀ ਲਈ ਰੱਖੀ ਗਈ ਜ਼ਮਾਨਤ ਰਕਮ।",
    "term_es": "Depósito de Seguridad",
    "def_es": "Depósito retenido aplicable al último mes o daños según la ley aplicable.",
    "term_fr": "Dépôt de Garantie",
    "def_fr": "Somme conservée pour couvrir le dernier mois de loyer ou les dégradations autorisées.",
    "term_ar": "مبلغ التأمين على الإيجار",
    "def_ar": "مبلغ مالي يدفعه المستأجر كضمان يُطبق على الشهر الأخير أو التعويض عن الأضرار حسب القانون."
  },
  {
    "id": "waiting_period_health",
    "category": "healthcare",
    "term_en": "Healthcare Waiting Period",
    "acronym": "HWP",
    "def_en": "Statutory waiting timeframe (often 0-90 days) before provincial/state public medical coverage takes effect.",
    "term_hi": "स्वास्थ्य सेवा प्रतीक्षा अवधि",
    "def_hi": "सरकारी सार्वजनिक चिकित्सा बीमा प्रभावी होने से पहले की वैधानिक प्रतीक्षा अवधि (प्रायः 0-90 दिन)।",
    "term_pa": "ਸਿਹਤ ਕਵਰੇਜ ਉਡੀਕ ਸਮਾਂ",
    "def_pa": "ਸਰਕਾਰੀ ਸਿਹਤ ਕਾਰਡ ਚਾਲੂ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਲੱਗਣ ਵਾਲਾ ਕਾਨੂੰਨੀ ਉਡੀਕ ਸਮਾਂ (0-90 ਦਿਨ)।",
    "term_es": "Período de Espera de Cobertura Médica",
    "def_es": "Tiempo de espera legal (a menudo de 0 a 90 días) antes de que entre en vigor el seguro médico público.",
    "term_fr": "Délai de Carence Médicale",
    "def_fr": "Période d'attente légale (souvent de 0 à 90 jours) avant l'entrée en vigueur de l'assurance maladie publique.",
    "term_ar": "فترة انتظار التأمين الصحي",
    "def_ar": "المدة القانونية المطلوبة لتفعيل التغطية الصحية العامة (عادة من 0 إلى 90 يوماً)."
  },
  {
    "id": "primary_care_provider",
    "category": "healthcare",
    "term_en": "Primary Care Provider / Family Doctor",
    "acronym": "PCP",
    "def_en": "Family physician or nurse practitioner who coordinates comprehensive routine and specialist healthcare.",
    "term_hi": "प्राथमिक चिकित्सक / फैमिली डॉक्टर",
    "def_hi": "पारिवारिक चिकित्सक या नर्स जो नियमित उपचार और विशेषज्ञ रेफरल का समन्वय करते हैं।",
    "term_pa": "ਫੈਮਿਲੀ ਡਾਕਟਰ / ਪ੍ਰਾਇਮਰੀ ਕੇਅਰ",
    "def_pa": "ਪਰਿਵਾਰਕ ਡਾਕਟਰ ਜੋ ਰੋਜ਼ਾਨਾ ਇਲਾਜ ਅਤੇ ਮਾਹਿਰ ਡਾਕਟਰਾਂ ਨੂੰ ਰੈਫਰ ਕਰਨ ਦਾ ਕੰਮ ਕਰਦਾ ਹੈ।",
    "term_es": "Médico de Cabecera / Atención Primaria",
    "def_es": "Médico familiar o general que coordina la atención médica rutinaria y referencias.",
    "term_fr": "Médecin de Famille / Praticien de Soins Primaires",
    "def_fr": "Médecin traitant qui coordonne les soins de santé courants et les spécialistes.",
    "term_ar": "طبيب الأسرة / الرعاية الأولية",
    "def_ar": "طبيب الأسرة المعتمد الذي يقدم الرعاية الطبية الأساسية والإحالات التخصصية."
  },
  {
    "id": "sin_number",
    "category": "employment",
    "term_en": "Social Insurance Number / Tax Identifier",
    "acronym": "SIN",
    "def_en": "Confidential 9-digit identification number required to work legally and access public benefits.",
    "term_hi": "सामाजिक बीमा संख्या (SIN नंबर)",
    "def_hi": "गोपनीय 9-अंकीय पहचान संख्या जो कानूनी रूप से काम करने और सरकारी लाभ प्राप्त करने के लिए आवश्यक है।",
    "term_pa": "ਸੋਸ਼ਲ ਇੰਸ਼ੋਰੈਂਸ ਨੰਬਰ (SIN ਨੰਬਰ)",
    "def_pa": "ਗੁਪਤ 9-ਅੰਕੀ ਨੰਬਰ ਜੋ ਕਾਨੂੰਨੀ ਤੌਰ 'ਤੇ ਕੰਮ ਕਰਨ ਅਤੇ ਸਰਕਾਰੀ ਲਾਭ ਲੈਣ ਲਈ ਜ਼ਰੂਰੀ ਹੈ।",
    "term_es": "Número de Seguro Social",
    "def_es": "Número confidencial de 9 dígitos indispensable para trabajar legalmente y recibir beneficios públicos.",
    "term_fr": "Numéro d'Assurance Sociale (NAS)",
    "def_fr": "Numéro d'identification confidentiel à 9 chiffres nécessaire pour travailler et cotiser.",
    "term_ar": "رقم التأمين الاجتماعي",
    "def_ar": "رقم سري مكوّن من تسعة أرقام إلزامي للعمل بشكل قانوني والحصول على المزايا العامة."
  },
  {
    "id": "record_of_employment",
    "category": "employment",
    "term_en": "Record of Employment",
    "acronym": "ROE",
    "def_en": "Official certificate submitted by employers to government documenting insurable hours and earnings for benefit claims.",
    "term_hi": "रोज़गार अभिलेख (ROE)",
    "def_hi": "नियोक्ता द्वारा सरकार को प्रस्तुत आधिकारिक प्रमाण पत्र जिसमें काम के घंटे और आय दर्ज होती है।",
    "term_pa": "ਰਿਕਾਰਡ ਆਫ਼ ਇੰਪਲਾਇਮੈਂਟ (ROE)",
    "def_pa": "ਮਾਲਕ ਦੁਆਰਾ ਸਰਕਾਰ ਨੂੰ ਜਮ੍ਹਾਂ ਕਰਵਾਇਆ ਜਾਣ ਵਾਲਾ ਦਸਤਾਵੇਜ਼ ਜਿਸ ਵਿੱਚ ਕੰਮ ਦੇ ਘੰਟੇ ਅਤੇ ਕਮਾਈ ਦਰਜ ਹੁੰਦੀ ਹੈ।",
    "term_es": "Registro de Empleo",
    "def_es": "Documento oficial patronal que certifica horas trabajadas e ingresos para beneficios de desempleo.",
    "term_fr": "Relevé d'Emploi (RE)",
    "def_fr": "Document officiel de l'employeur attestant des heures et gains assurables pour les prestations.",
    "term_ar": "سجل العمل والتوظيف",
    "def_ar": "شهادة رسمية يقدمها صاحب العمل للحكومة توضح ساعات العمل والأجور لطلب إعانات البطالة."
  },
  {
    "id": "credit_score",
    "category": "banking_finance",
    "term_en": "Credit Score & Credit Bureau",
    "acronym": "CS",
    "def_en": "Numerical creditworthiness metric (300-900) compiled by credit bureaus determining loan/rental eligibility.",
    "term_hi": "क्रेडिट स्कोर एवं क्रेडिट ब्यूरो",
    "def_hi": "क्रेडिट ब्यूरो द्वारा संकलित साख अंक (300-900) जो ऋण और मकान किराये की पात्रता तय करता है।",
    "term_pa": "ਕ੍ਰੈਡਿਟ ਸਕੋਰ",
    "def_pa": "ਵਿੱਤੀ ਭਰੋਸੇਯੋਗਤਾ ਦਾ ਅੰਕ (300-900) ਜੋ ਕਰਜ਼ਾ ਲੈਣ ਜਾਂ ਮਕਾਨ ਕਿਰਾਏ 'ਤੇ ਲੈਣ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ।",
    "term_es": "Puntaje de Crédito",
    "def_es": "Calificación numérica de solvencia financiera (300-900) usada por bancos y arrendadores.",
    "term_fr": "Score de Crédit",
    "def_fr": "Indicateur numérique de solvabilité financière (300-900) utilisé par les banques.",
    "term_ar": "التقييم الائتماني",
    "def_ar": "مؤشر رقمي للجدارة المالية (300-900) يحدد أهلية الحصول على القروض أو استئجار المساكن."
  },
  {
    "id": "direct_deposit",
    "category": "banking_finance",
    "term_en": "Direct Deposit / Void Cheque",
    "acronym": "DD",
    "def_en": "Electronic transfer of wages directly into chequing account using transit and institution numbers.",
    "term_hi": "डायरेक्ट डिपॉजिट / शून्य चेक",
    "def_hi": "ट्रांजिट और बैंक नंबर का उपयोग करके सीधे चालू खाते में वेतन का इलेक्ट्रॉनिक हस्तांतरण।",
    "term_pa": "ਸਿੱਧਾ ਖਾਤੇ ਵਿੱਚ ਜਮ੍ਹਾਂ (ਡਾਇਰੈਕਟ ਡਿਪਾਜ਼ਿਟ)",
    "def_pa": "ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਤਨਖਾਹ ਦਾ ਸਿੱਧਾ ਇਲੈਕਟ੍ਰਾਨਿਕ ਤਬਾਦਲਾ।",
    "term_es": "Depósito Directo / Cheque Anulado",
    "def_es": "Transferencia electrónica de nómina a cuenta bancaria mediante códigos bancarios.",
    "term_fr": "Dépôt Direct / Spécimen de Chèque",
    "def_fr": "Virement électronique direct du salaire sur le compte bancaire du travailleur.",
    "term_ar": "الإيداع المباشر في الحساب",
    "def_ar": "التحويل الإلكتروني المباشر للراتب إلى الحساب المصرفي باستخدام أرقام الفرع والحساب."
  },
  {
    "id": "notice_of_assessment",
    "category": "taxes_benefits",
    "term_en": "Notice of Assessment",
    "acronym": "NOA",
    "def_en": "Official tax authority statement confirming annual income, tax owed or refunded, and contribution limits.",
    "term_hi": "मूल्यांकन सूचना (Notice of Assessment)",
    "def_hi": "वार्षिक आय, कर देनदारी या रिफंड की पुष्टि करने वाला आधिकारिक कर विभाग विवरण।",
    "term_pa": "ਨੋਟਿਸ ਆਫ਼ ਅਸੈਸਮੈਂਟ (ਟੈਕਸ ਬਿਆਨ)",
    "def_pa": "ਸਰਕਾਰੀ ਟੈਕਸ ਵਿਭਾਗ ਦਾ ਬਿਆਨ ਜੋ ਸਾਲਾਨਾ ਆਮਦਨ ਅਤੇ ਟੈਕਸ ਰਿਫੰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰਦਾ ਹੈ।",
    "term_es": "Aviso de Liquidación Fiscal",
    "def_es": "Declaración oficial de la autoridad fiscal que detalla ingresos, impuestos o reembolsos.",
    "term_fr": "Avis de Cotisation",
    "def_fr": "Relevé fiscal officiel confirmant les revenus déclarés, impôts dus ou remboursements.",
    "term_ar": "إشعار التقييم الضريبي",
    "def_ar": "بيان رسمي من هيئة الضرائب يوضح الدخل السنوي والضرائب المستحقة أو المستردة."
  },
  {
    "id": "child_benefit",
    "category": "taxes_benefits",
    "term_en": "Child & Family Benefit",
    "acronym": "CCB",
    "def_en": "Tax-free monthly government stipend supporting eligible families with children under 18.",
    "term_hi": "बाल एवं परिवार लाभ (चाइल्ड बेनिफिट)",
    "def_hi": "18 वर्ष से कम आयु के बच्चों वाले पात्र परिवारों को मिलने वाला कर-मुक्त मासिक सरकारी भत्ता।",
    "term_pa": "ਚਾਈਲਡ ਬੈਨੀਫ਼ਿਟ (ਬੱਚਿਆਂ ਦਾ ਭੱਤਾ)",
    "def_pa": "18 ਸਾਲ ਤੋਂ ਘੱਟ ਉਮਰ ਦੇ ਬੱਚਿਆਂ ਵਾਲੇ ਪਰਿਵਾਰਾਂ ਨੂੰ ਮਿਲਣ ਵਾਲੀ ਟੈਕਸ-ਮੁਕਤ ਮਹੀਨਾਵਾਰ ਸਰਕਾਰੀ ਸਹਾਇਤਾ।",
    "term_es": "Beneficio por Hijos a Cargo",
    "def_es": "Estipendio mensual libre de impuestos para apoyar a familias elegibles con niños menores de 18 años.",
    "term_fr": "Allocation Canadienne pour Enfants",
    "def_fr": "Prestation mensuelle non imposable versée aux familles admissibles pour les enfants de moins de 18 ans.",
    "term_ar": "إعانة رعاية الأطفال والأسرة",
    "def_ar": "مساعدة مالية شهرية معفاة من الضرائب للأسر المؤهلة التي لديها أطفال دون 18 عامًا."
  },
    // Ids 17-500: area x concept entries with real definitions (src/glossary-concepts.js).
  ...buildConceptGlossaryTerms()
];

export const GLOSSARY_CATEGORIES = [
  'immigration',
  'housing',
  'healthcare',
  'employment',
  'banking_finance',
  'taxes_benefits',
  'education_childcare',
  'transport_licensing',
  'legal_rights',
  'emergency_safety',
  'municipal_civics',
  'professional_licensing'
];

/**
 * Returns distinct category list.
 */
export function getGlossaryCategories() {
  return [...GLOSSARY_CATEGORIES];
}

/**
 * Total terms count.
 */
export function getGlossaryCount() {
  return SETTLEMENT_GLOSSARY_500.length;
}

/**
 * Search glossary terms with category and language support.
 */
export function searchGlossary({
  query = '',
  category = null,
  lang = 'en',
  limit = 20,
  offset = 0
} = {}) {
  const q = String(query).toLowerCase().trim();
  const c = category ? String(category).toLowerCase().trim() : null;
  const l = String(lang).toLowerCase().trim().slice(0, 2);

  let results = SETTLEMENT_GLOSSARY_500.filter(item => {
    if (c && item.category !== c) return false;
    if (!q) return true;

    // Match query in any of the language term titles or acronym
    const termEn = (item.term_en || '').toLowerCase();
    const defEn = (item.def_en || '').toLowerCase();
    const termHi = (item.term_hi || '').toLowerCase();
    const termPa = (item.term_pa || '').toLowerCase();
    const acronym = (item.acronym || '').toLowerCase();

    return termEn.includes(q) ||
           defEn.includes(q) ||
           termHi.includes(q) ||
           termPa.includes(q) ||
           acronym.includes(q);
  });

  const total = results.length;
  const paged = results.slice(offset, offset + limit);

  return {
    total,
    offset,
    limit,
    lang: l,
    terms: paged.map(t => ({
      id: t.id,
      category: t.category,
      acronym: t.acronym,
      term: t[`term_${l}`] || t.term_en,
      definition: t[`def_${l}`] || t.def_en,
      term_en: t.term_en,
      def_en: t.def_en,
      translations: {
        en: t.term_en,
        hi: t.term_hi,
        pa: t.term_pa,
        es: t.term_es,
        fr: t.term_fr,
        ar: t.term_ar
      }
    }))
  };
}

/**
 * Lookup single term by ID.
 */
export function getGlossaryTerm(termId) {
  if (!termId) return null;
  const term = SETTLEMENT_GLOSSARY_500.find(t => t.id === termId);
  return term || null;
}
