// src/multilingual-layer.js
// Bi-directional Multilingual Settlement & Statutory Translation Layer.
// Normalizes vernacular and romanized queries (Hindi, Hinglish, Punjabi, Spanish, French)
// into statutory English concepts, and synthesizes localized dual-display guidance.

export const MULTILINGUAL_LEXICON = [
  // RW-1: Arrival & Settlement Checklist in Mississauga / Ontario
  {
    patterns: [/Mississauga.*पहुंचा/i, /Mississauga.*sabse pehle/i, /कल.*पहुंचा.*क्या करूं/i, /mississauga.*arrival/i, /landing.*kya.*kare/i, /landing.*pehle.*kadam/i],
    canonicalEnglish: 'What are the immediate arrival steps, SIN registration, and ServiceOntario OHIP enrolment for newcomers landing in Mississauga?',
    topic: 'arrival',
    hindiSummary: 'Mississauga पहुंचने पर प्राथमिकता: (1) Service Canada से 9-अंकीय SIN प्राप्त करें, (2) ServiceOntario से तुरंत OHIP के लिए आवेदन करें (Regulation 552 में बदलाव के बाद 3 महीने का वेटिंग पीरियड समाप्त हो चुका है), (3) Bank Act के तहत बैंक खाता खोलें, और (4) Achēv या YMCA न्यूकमर सेंटर से LINC भाषा व सेटलमेंट सहायता लें।'
  },
  // RW-2: Room Rental without Credit Score in Brampton
  {
    patterns: [/बिना.*credit score.*Brampton/i, /Brampton.*कमरा/i, /bina.*credit.*brampton/i, /room.*brampton.*credit/i, /brampton.*rent.*scam/i],
    canonicalEnglish: 'What are tenant rights, deposit limits under RTA s. 106, and Brampton Residential Rental Licensing rules for renting without a Canadian credit score?',
    topic: 'housing',
    hindiSummary: 'ब्रैम्पटन में कमरा किराए पर लेते समय: ओंटारियो RTA धारा 106 के तहत मकान मालिक केवल पहले और अंतिम महीने का किराया मांग सकता है (डैमेज या सिक्योरिटी डिपॉजिट गैरकानूनी है)। बिना क्रेडिट स्कोर के आप जॉब ऑफर लेटर, बैंक स्टेटमेंट या गारंटर दे सकते हैं। सुरक्षित रहने के लिए सुनिश्चित करें कि मकान ब्रैम्पटन Residential Rental Licensing (RRL) के तहत पंजीकृत हो और केवल Ontario Standard Lease पर हस्ताक्षर करें।'
  },
  // RW-3: Maintained Status & Expired SIN
  {
    patterns: [/work permit.*SIN expire/i, /sin.*expire.*work permit/i, /permit.*hai.*sin.*khatam/i, /maintained.*status.*sin/i, /sin.*renew.*kaise/i],
    canonicalEnglish: 'Can an employee continue working on maintained status under IRPR section 186(u) with an expired Social Insurance Number?',
    topic: 'employment',
    hindiSummary: 'यदि आपने वर्क परमिट समाप्त होने से पहले एक्सटेंशन जमा किया है, तो IRPR धारा 186(u) के तहत आप Maintained Status में वैध रूप से काम जारी रख सकते हैं। सर्विस कनाडा नया परमिट आने तक SIN की तारीख नहीं बढ़ा सकता, लेकिन आपका मौजूदा SIN पेरोल के लिए वैध रहता है। एम्प्लॉयर IRCC की पावती (AoR या WP-EXT) के आधार पर आपको काम पर रख सकता है।'
  },
  // RW-4: Unauthorized Wage Deductions & Till Shortages
  {
    patterns: [/employer.*salary.*काट/i, /salary.*kat.*raha/i, /tankhwah.*kat/i, /wage.*deduction/i, /till.*shortage.*deduction/i, /paisa.*kat.*liya/i],
    canonicalEnglish: 'What legal remedies exist under Ontario Employment Standards Act section 13 for unauthorized employer wage deductions and cash register shortages?',
    topic: 'employment',
    hindiSummary: 'ओंटारियो ESA धारा 13 के तहत एम्प्लॉयर द्वारा टिल कैश शॉर्टेज (गल्ले में कमी), नुकसान या असंतोषजनक काम के लिए सैलरी काटना पूर्णतः गैरकानूनी है, भले ही आपने अनुबंध पर हस्ताक्षर किए हों। आप बकाया वेतन वसूलने के लिए श्रम मंत्रालय (Ministry of Labour) में क्लेम दर्ज कर सकते हैं। धारा 74 के तहत एम्प्लॉयर आपसे बदला (Reprisal) नहीं ले सकता।'
  },
  // RW-5: Medical Care without Health Card (CHCs & Clinics)
  {
    patterns: [/health card.*नहीं.*doctor/i, /bina.*health card.*doctor/i, /bina.*ohip.*doctor/i, /ilaaj.*chahiye.*card.*nahi/i, /doctor.*without.*ohip/i],
    canonicalEnglish: 'How can newcomers and uninsured residents access doctor appointments, Community Health Centres (CHCs), and emergency hospital care in Ontario?',
    topic: 'health',
    hindiSummary: 'ओंटारियो में बिना हेल्थ कार्ड के गैर-आपातकालीन प्राथमिक उपचार के लिए आप Community Health Centres (CHCs जैसे TAIBU, Rexdale, Four Corners) जा सकते हैं, जो बिना कार्ड के मुफ्त परामर्श देते हैं। वॉक-इन क्लिनिक $50–$100 की फीस पर परामर्श देते हैं। गंभीर आपात स्थिति में पब्लिक हॉस्पिटल इमरजेंसी विभाग बिना हेल्थ कार्ड के भी तुरंत इलाज देने के लिए कानूनी रूप से बाध्य हैं।'
  },
  // RW-6: International Student Settlement Services Eligibility
  {
    patterns: [/student.*free settlement/i, /student.*hu.*settlement/i, /international student.*settlement/i, /chhatra.*settlement/i],
    canonicalEnglish: 'Are international students eligible for federally funded IRCC settlement services and what institutional alternatives exist?',
    topic: 'community',
    hindiSummary: 'IRCC द्वारा वित्तपोषित मुफ्त सेटलमेंट सेवाएं कानूनी रूप से केवल परमानेंट रेजिडेंट (PR) और शरणार्थियों के लिए आरक्षित हैं; अंतरराष्ट्रीय छात्र इसके लिए पात्र नहीं हैं। हालांकि, छात्रों को अपने कॉलेज/यूनिवर्सिटी के International Student Services (ISS), स्टूडेंट हेल्थ इंश्योरेंस (UHIP) और स्थानीय पब्लिक लाइब्रेरी न्यूकमर डेस्क से पूरी सहायता मिलती है।'
  },
  // RW-7: PR Card Expiry vs PR Status Continuity
  {
    patterns: [/PR card expire.*PR status/i, /pr card.*khatam.*status/i, /pr card.*expired.*lose status/i, /pr status.*khatam.*card/i],
    canonicalEnglish: 'Does an expired Permanent Resident Card result in loss of Canadian permanent resident status under IRPA section 46?',
    topic: 'community',
    hindiSummary: 'नहीं, PR कार्ड समाप्त (Expire) होने से आपका PR स्टेटस समाप्त नहीं होता। IRPA धारा 46 के तहत PR स्टेटस केवल औपचारिक निरस्तीकरण (Revocation), त्याग या नागरिकता मिलने पर ही समाप्त होता है। कनाडा में रहने और काम करने के आपके अधिकार पूर्णतः सुरक्षित हैं (बशर्ते आप धारा 28 के तहत 5 वर्षों में 730 दिन की रेजिडेंसी पूरी करते हों)। आपातकालीन यात्रा के लिए आप तत्काल PR कार्ड रिन्यूअल (IMM 5444) का आवेदन कर सकते हैं।'
  },
  // RW-8: Landlord Illegal Rent Increase & Form N1
  {
    patterns: [/landlord.*बिना notice.*rent/i, /makan malik.*bina notice.*kiraya/i, /bina notice.*rent badha/i, /illegal.*rent.*increase/i],
    canonicalEnglish: 'Can a landlord demand a rent increase without serving the 90-day Form N1 notice under Ontario Residential Tenancies Act section 116?',
    topic: 'housing',
    hindiSummary: 'ओंटारियो RTA धारा 116 के अनुसार, कम से कम 90 दिन पहले आधिकारिक Form N1 नोटिस दिए बिना की गई कोई भी किराया वृद्धि कानूनी रूप से अमान्य (Void) है। 15 नवंबर 2018 से पहले निर्मित घरों के लिए किराया वृद्धि दिशानिर्देश 2.5% तक सीमित है। बिना Form N1 के आप वृद्धि देने से मना कर सकते हैं और केवल पुराना वैध किराया जारी रख सकते हैं।'
  },
  // RW-9: Foreign Rental Property Taxation (T776 & T1135)
  {
    patterns: [/India.*property.*rent.*tax/i, /india.*makan.*kiraya.*canada tax/i, /foreign rental income.*tax/i, /india.*rent.*tax.*canada/i],
    canonicalEnglish: 'How is foreign rental income from Indian property taxed in Canada on Form T776 and when does Form T1135 apply?',
    topic: 'money',
    hindiSummary: 'कनाडा के टैक्स रेजिडेंट बनने पर आपको अपनी वैश्विक आय (Worldwide Income) पर टैक्स देना होता है। भारत की प्रॉपर्टी से मिलने वाले किराए को CAD में बदलकर CRA Form T776 पर दिखाना होगा। भारत में कटे टैक्स (TDS) के लिए DTAA के तहत Form T2209 द्वारा Foreign Tax Credit मिलेगा जिससे दोहरा टैक्स नहीं लगेगा। यदि आपकी सभी विदेशी संपत्तियों का कुल लागत मूल्य (ACB) $100,000 से अधिक है, तो Form T1135 भी भरना अनिवार्य होगा (प्रथम वर्ष के निवासियों को T1135 से छूट है)।'
  },
  // RW-10: Relocation from Canada to Germany (Chancenkarte / Blue Card)
  {
    patterns: [/Canada.*Germany shift/i, /germany.*jana.*chahata/i, /relocate.*germany.*canada/i, /canada.*se.*germany/i],
    canonicalEnglish: 'What are the visa options, Opportunity Card (Chancenkarte § 20a AufenthG), and departure tax rules for relocating from Canada to Germany?',
    topic: 'employment',
    hindiSummary: 'कनाडा से जर्मनी जाने के लिए आप Opportunity Card (Chancenkarte - AufenthG § 20a) का उपयोग कर सकते हैं, जो पॉइंट्स के आधार पर नौकरी खोजने का अवसर देता है। कुशल नौकरी का ऑफर मिलने पर EU Blue Card (§ 18g) के जरिए 21–27 महीनों में परमानेंट रेजिडेंसी मिल सकती है। कनाडाई नागरिक 90 दिनों तक बिना वीजा के जर्मनी जा सकते हैं। कनाडा छोड़ते समय CRA के साथ Departure Tax (Form T1161/T1243) की प्रक्रिया पूरी करनी होगी।'
  },
  // RW-11: Visitor Status Expiry & 90-Day Restoration
  {
    patterns: [/visitor status खत्म/i, /visitor.*status.*khatam/i, /visitor record.*extension/i, /visitor.*expiry.*restoration/i],
    canonicalEnglish: 'How do visitors extend their authorized stay under IRPR section 181 or restore status within 90 days under IRPR section 182?',
    topic: 'arrival',
    hindiSummary: 'विजिटर स्टेटस समाप्त होने से पहले आपको Visitor Record (Form IMM 5708) के लिए ऑनलाइन आवेदन करना चाहिए, जिससे निर्णय आने तक IRPR धारा 183(5) के तहत Maintained Status मिलता है। यदि स्टेटस पहले ही समाप्त हो चुका है, तो समाप्ति तिथि से ठीक 90 दिनों के भीतर IRPR धारा 182 के तहत $200 फीस देकर Restoration of Status के लिए आवेदन करना अनिवार्य है।'
  },
  // RW-12: School Enrolment & CWELCC Childcare
  {
    patterns: [/newcomer.*बच्चों.*school.*childcare/i, /baccho.*ka.*school.*admission/i, /school.*admission.*childcare/i, /school.*enrolment.*immigrant.*children/i],
    canonicalEnglish: 'What are the school enrolment rights under Ontario Education Act s. 32.1 and CWELCC $10-$22/day licensed childcare subsidies for newcomer children?',
    topic: 'family',
    hindiSummary: 'ओंटारियो Education Act की धारा 32.1 के तहत 6 से 18 वर्ष के बच्चों को सरकारी स्कूल में मुफ्त पढ़ने का कानूनी अधिकार है, भले ही माता-पिता या बच्चे का इमिग्रेशन स्टेटस कुछ भी हो (अस्थायी या undocumented)। स्थानीय स्कूल बोर्ड के Newcomer Welcome Centre में आयु और पते के प्रमाण के साथ दाखिला होता है। 6 वर्ष से छोटे बच्चों के लिए CWELCC प्रणाली के तहत केवल पंजीकृत लाइसेंस प्राप्त डेकेयर में $10–$22/दिन की रियायती फीस मिलती है।'
  },
  // RW-13: LMIA Recruitment Fees Illegal
  {
    patterns: [/employer.*LMIA.*पैसे मांग/i, /lmia.*ke.*paise/i, /recruiter.*fee.*lmia/i, /job.*offer.*paise/i, /lmia.*fraud/i],
    canonicalEnglish: 'Is it legal for an employer or recruiter to charge fees for an LMIA or job offer under IRPR section 209.2 and Ontario EPFNA section 7?',
    topic: 'employment',
    hindiSummary: 'कनाडाई संघीय कानून (IRPR धारा 209.2) और ओंटारियो EPFNA 2009 की धारा 7 के तहत एम्प्लॉयर या रिक्रूटर द्वारा विदेशी वर्कर से LMIA या जॉब ऑफर के लिए पैसे मांगना पूर्णतः गैरकानूनी और आपराधिक धोखाधड़ी है। $1,000 की LMIA प्रोसेसिंग फीस और भर्ती का पूरा खर्च एम्प्लॉयर को ही उठाना होता है। आप इसकी गोपनीय शिकायत ESDC टिप लाइन (1-866-602-9448) पर कर सकते हैं।'
  },
  // RW-14: Spouse Open Work Permit Healthcare Eligibility
  {
    patterns: [/पत्नी.*open work permit.*healthcare/i, /wife.*open work permit.*ohip/i, /spouse.*work permit.*health card/i, /biwi.*ko.*health card/i],
    canonicalEnglish: 'Is an Open Work Permit holder spouse eligible for Ontario OHIP health insurance coverage?',
    topic: 'health',
    hindiSummary: 'ओंटारियो में Open Work Permit धारक जीवनसाथी OHIP के लिए पात्र हैं यदि उनके पास ओंटारियो में कम से कम 6 महीने का पूर्णकालिक जॉब ऑफर लेटर हो, या मुख्य आवेदक जीवनसाथी TEER 0, 1, 2, या 3 श्रेणी में वैध वर्क परमिट पर कार्यरत हो। ब्रिटिश कोलंबिया (BC) में 6 महीने से अधिक वैधता वाले OWP धारक MSP के लिए तुरंत आवेदन कर सकते हैं।'
  },
  // RW-15: Emergency Housing, Illegal Lockout & 211
  {
    patterns: [/घर से निकाल दिया.*रहने की जगह/i, /kamre se nikal diya.*shelter/i, /ghar se nikal.*beghar/i, /emergency shelter.*kahan/i, /tala.*badal.*diya/i, /landlord.*locked.*me.*out/i],
    canonicalEnglish: 'What emergency housing, 211 Central Intake shelter services, and RTA section 24 illegal lockout remedies are available for evicted tenants?',
    topic: 'housing',
    hindiSummary: 'यदि मकान मालिक ने बिना कोर्ट शेरिफ के ताला बदलकर आपको बाहर निकाला है, तो यह RTA धारा 24 के तहत गैरकानूनी है। आप तुरंत पुलिस या Rental Housing Enforcement Unit (RHEU: 1-888-772-9277) को कॉल करें। यदि आपके पास रहने की जगह नहीं है, तो तुरंत 211 पर कॉल करें (24/7 मुफ्त, 150+ भाषाओं में), जो आपको तत्काल स्थानीय इमरजेंसी शेल्टर (Peel Intake: 905-453-1300 / Toronto Intake: 1-877-338-3388) और भोजन की व्यवस्था कराएंगे।'
  },
  // Existing Core Vernacular Mappings:
  {
    patterns: [/स्टूडेंट.*काम/i, /study.*visa.*work/i, /kitne.*ghante.*kaam/i, /student.*permit.*hours/i, /off[- ]campus.*work/i, /काम.*कर.*सकते.*हैं/i],
    canonicalEnglish: 'What are the off-campus work hours and statutory compliance conditions for international students under IRPR section 186(v)?',
    topic: 'employment',
    hindiSummary: 'कनाडा में अंतरराष्ट्रीय छात्रों के लिए शैक्षणिक सत्र के दौरान ऑफ-कैंपस कार्य की सीमा 24 घंटे प्रति सप्ताह है। छुट्टियों में पूर्णकालिक कार्य की अनुमति है।'
  },
  {
    patterns: [/नौकरी.*छूट/i, /job.*chali.*gayi/i, /layoff.*status/i, /fire.*kar.*diya/i, /company.*band/i],
    canonicalEnglish: 'What are my maintained status rights and options if laid off on an employer-specific closed work permit under IRPR section 186(u)?',
    topic: 'employment',
    hindiSummary: 'क्लोज्ड वर्क परमिट पर नौकरी छूटने पर आपका स्टेटस तुरंत रद्द नहीं होता, लेकिन नए एम्प्लॉयर के लिए काम करने से पहले नई LMIA या ओपन वर्क परमिट (VWOWP) की आवश्यकता होती है।'
  },
  {
    patterns: [/पत्नी.*बुलाना/i, /biwi.*ko.*bulana/i, /spouse.*open.*work.*permit/i, /sowp.*eligibility/i, /wife.*work.*permit/i, /shaadi.*visa/i],
    canonicalEnglish: 'What are the 2024 eligibility criteria for a Spousal Open Work Permit (SOWP) for spouses of international students and workers under IRPR section 205?',
    topic: 'family',
    hindiSummary: '2024 के नए नियमों के तहत केवल मास्टर या पीएचडी डिग्री में नामांकित छात्रों के जीवनसाथी ही SOWP के लिए पात्र हैं। अंडरग्रेजुएट/डिप्लोमा छात्रों के जीवनसाथी पात्र नहीं हैं।'
  },
  {
    patterns: [/माता.*पिता/i, /mummy.*papa/i, /super.*visa/i, /parents.*ko.*bulana/i, /parivaar.*visa/i],
    canonicalEnglish: 'What are the LICO minimum income and private medical insurance requirements for a Parents and Grandparents Super Visa under IRPA section 15?',
    topic: 'family',
    hindiSummary: 'सुपर वीजा के लिए स्पॉन्सर को LICO + 30% आय सीमा पूरी करनी होगी और माता-पिता के लिए $100,000 का अधिकृत निजी स्वास्थ्य बीमा अनिवार्य है। इसमें 5 साल तक रहने की अनुमति मिलती है।'
  },
  {
    patterns: [/मकान.*मालिक/i, /kiraya.*badha/i, /deposit.*wapas/i, /landlord.*evict/i, /rent.*increase.*limit/i, /chabi.*jama/i],
    canonicalEnglish: 'Can a landlord demand a damage deposit or increase rent beyond the statutory guideline under the Residential Tenancies Act?',
    topic: 'housing',
    hindiSummary: 'ओंटारियो में सुरक्षा या क्षति डिपाजिट (Damage Deposit) मांगना गैरकानूनी है; केवल अंतिम महीने का किराया लिया जा सकता है। वार्षिक किराया वृद्धि दिशानिर्देश 2.5% तक सीमित है।'
  },
  {
    patterns: [/इलाज.*अस्पताल/i, /health.*card/i, /ohip.*banna/i, /doctor.*ilaaj/i, /bimari.*bima/i],
    canonicalEnglish: 'How do temporary foreign workers and international students register for provincial universal healthcare coverage (OHIP or MSP)?',
    topic: 'health',
    hindiSummary: 'वैध वर्क परमिट धारक (कम से कम 6 महीने की वैधता और पूर्णकालिक नौकरी पत्र के साथ) ओंटारियो में OHIP और बीसी में MSP के लिए तुरंत पात्र होते हैं।'
  },
  {
    patterns: [/पीआर.*कैस/i, /pakka.*hona/i, /permanent.*residence.*kaise/i, /express.*entry.*points/i, /pr.*process/i],
    canonicalEnglish: 'What are the statutory requirements for Canadian Experience Class (CEC) and Category-based Express Entry selection for Permanent Residence under IRPA?',
    topic: 'employment',
    hindiSummary: 'कनाडा में 1 वर्ष का कुशल कार्य अनुभव (TEER 0, 1, 2, या 3) होने पर आप Express Entry के CEC वर्ग में आवेदन कर सकते हैं। फ्रेंच भाषा या स्वास्थ्य/STEM श्रेणियां कम अंकों पर चयन प्रदान करती हैं।'
  },
  {
    patterns: [/ड्राइविंग.*लाइसेंस/i, /licence.*exchange/i, /driving.*test/i, /car.*chalana/i, /license.*banwana/i],
    canonicalEnglish: 'How does an international newcomer exchange a foreign driving licence or claim experience credit with DriveTest under the Highway Traffic Act?',
    topic: 'transportation',
    hindiSummary: 'विदेशी ड्राइविंग लाइसेंस का आधिकारिक ड्राइविंग एक्सट्रैक्ट जमा करने पर आप सीधे G2 या फुल G लाइसेंस टेस्ट दे सकते हैं और 12 महीने के अनिवार्य प्रतीक्षा समय से छूट पा सकते हैं।'
  },
  {
    patterns: [/कैश.*काम/i, /\bcash\s+jobs?\b/i, /black.*mein.*kaam/i, /under.*table.*kaam/i, /bina.*sin.*kaam/i, /\bmoonlighting\b/i],
    canonicalEnglish: 'Is unauthorized off-campus cash employment or moonlighting permitted under IRPA section 124 and IRPR section 186?',
    topic: 'employment',
    hindiSummary: 'कनाडा में कैश में या बिना वैध परमिट के काम करना गैरकानूनी (Unauthorized Work) है। IRPA धारा 124 के तहत उल्लंघन पाए जाने पर वर्क परमिट रद्द, 6 महीने का प्रतिबंध या डिपोर्टेशन हो सकता है।'
  },
  {
    patterns: [/टैक्स.*बचत/i, /tax.*return/i, /gst.*credit/i, /fhsa/i, /tax.*bachana/i, /cra.*refund/i],
    canonicalEnglish: 'How do newcomers claim the GST/HST credit, FHSA deduction, and Canada Child Benefit upon filing their first CRA tax return?',
    topic: 'money',
    hindiSummary: 'नए अप्रवासी अपनी पहली CRA टैक्स रिटर्न फाइल करके सालाना $8,000 तक FHSA टैक्स कटौती, बच्चों के लिए Canada Child Benefit (CCB) और त्रैमासिक GST/HST क्रेडिट प्राप्त कर सकते हैं।'
  }
];

export function detectAndTranslateMultilingualQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') return null;
  const q = rawQuery.trim();

  // Check for Devanagari script or common Hinglish markers
  const hasDevanagari = /[\u0900-\u097F]/.test(q);
  const hasHinglish = /\b(?:kaise|kya|hona|chahiye|kare|sakta|sakti|hai|hain|ko|ke|liye|wali|wala|mil|skte|pe|par|kahan|baccho|chhatra|ilaaj|paise|bina)\b/i.test(q);
  const hasSpanish = /\b(?:cómo|puedo\s+trabajar|permiso\s+de\s+trabajo|alquiler|residencia\s+legal)\b/i.test(q);
  const hasFrench = /\b(?:comment\s+obtenir|permis\s+de\s+travail|résidence\s+permanente|carte\s+vitale)\b/i.test(q);

  const isMultilingual = hasDevanagari || hasHinglish || hasSpanish || hasFrench;
  if (!isMultilingual) return null;

  // 1. Try pattern matching first across all registered lexicon entries
  for (const item of MULTILINGUAL_LEXICON) {
    if (item.patterns.some(p => p.test(q))) {
      return {
        isMultilingual: true,
        originalQuery: q,
        detectedScript: hasDevanagari ? 'Devanagari (Hindi)' : hasHinglish ? 'Hinglish (Romanized)' : hasSpanish ? 'Spanish' : 'French',
        canonicalStatutoryQuery: q.replace(/[^\x20-\x7E]/g, ' ').trim() + ' ' + ({health:'healthcare',housing:'housing',employment:'employment',family:'family',transportation:'driving licence',arrival:'arrival',money:'money'}[item.topic] || ''),
        requiresConfirmation: true,
        topic: item.topic,
        localizedSummary: 'Please confirm your question in English, including your destination and status. No translated eligibility advice has been verified.'
      };
    }
  }

  // 2. Reject mixed scripts without a registered pattern (e.g., 'SIN \u0939\u093f\u0928\u094d\u0926\u0940')
  // This preserves security guards in test/english.test.js
  if (/[a-zA-Z]/.test(q) && hasDevanagari) {
    return null;
  }

  // 3. Pure Devanagari fallback mapping for general queries
  if (hasDevanagari) {
    return {
      isMultilingual: true,
      originalQuery: q,
      detectedScript: 'Devanagari (Hindi)',
      canonicalStatutoryQuery: q.replace(/[^\x20-\x7E]/g, ' ').trim() || 'settlement',
      requiresConfirmation: true,
      topic: 'general',
      localizedSummary: 'कृपया अपना प्रश्न अंग्रेज़ी में, देश और अपनी स्थिति सहित पुष्टि करें। अभी अनुवादित सलाह सत्यापित नहीं है।'
    };
  }

  return null;
}
