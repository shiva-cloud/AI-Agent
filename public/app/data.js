// Static reference data used by the main app views (cities, kits, benchmarks, labels).
// Split out of public/app.js; app.js imports what it uses from here.

// Reader-facing wording for verdict codes the tool APIs return. These are
// estimates, so they describe likelihood rather than a legal ruling.
export const VERDICT_TEXT = {
  STATUTORILY_VOID: 'This notice may be invalid',
  DEFECTIVE_NOTICE: 'This notice has problems you can raise',
  FACIALLY_VALID_CHALLENGEABLE: 'This notice looks valid, but you can still dispute it',
  VALID: 'This notice appears to meet the basic requirements',
  UNLAWFUL_EMPLOYEE_MISCLASSIFICATION: 'You may be an employee, not a contractor',
  PROPERLY_CLASSIFIED_EMPLOYEE: 'You appear to be correctly treated as an employee',
  LEGITIMATE_INDEPENDENT_CONTRACTOR: 'You appear to be a genuine independent contractor'
};

export const CITIES = ['Toronto', 'Mississauga', 'Brampton', 'Vancouver'];

export const COUNTRY_CITIES = {
  '': ['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador', 'Prince Edward Island', 'Yukon', 'Northwest Territories', 'Nunavut', 'Toronto', 'Mississauga', 'Brampton', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Montreal', 'Winnipeg', 'Halifax'],
  'CA': ['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador', 'Prince Edward Island', 'Yukon', 'Northwest Territories', 'Nunavut', 'Toronto', 'Mississauga', 'Brampton', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Montreal', 'Winnipeg', 'Halifax'],
  'Canada': ['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador', 'Prince Edward Island', 'Yukon', 'Northwest Territories', 'Nunavut', 'Toronto', 'Mississauga', 'Brampton', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Montreal', 'Winnipeg', 'Halifax'],
  'United States': ['California', 'New York', 'Texas', 'Florida', 'Washington State', 'Illinois', 'Los Angeles', 'San Francisco', 'Chicago', 'Seattle', 'Boston', 'Austin'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland', 'London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow'],
  'Australia': ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
  'Germany': ['Bavaria', 'North Rhine-Westphalia', 'Baden-Württemberg', 'Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne', 'Dusseldorf', 'Stuttgart'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah'],
  'New Zealand': ['Auckland', 'Wellington', 'Christchurch'],
  'Ireland': ['Dublin', 'Cork', 'Galway', 'Limerick'],
  'Singapore': ['Singapore'],
  'France': ['Paris', 'Lyon', 'Marseille'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'],
  'Sweden': ['Stockholm', 'Gothenburg', 'Malmo'],
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville']
};

export const ASK_LABEL = 'Find guidance';

export const BASE_TITLE = 'Northstar';

export const VIEW_TITLES = { 
  ask: 'Ask Northstar',
  casework: 'Immigration workspace', 
  binder: 'Document Binder',
  airport: 'Airport Arrival Kit',
  pathway: 'Pathway Comparator',
  cashflow: 'Relocation Budget',
  tenancy: 'Tenant Rights',
  journey: '180-Day Settlement Roadmap',
  tax: 'Cross-Border Tax',
  forms: 'Government Forms',
  paycheck: 'Take-Home Pay',
  banking: 'Banking & Credit',
  driving: 'Foreign Licence Exchange',
  careers: 'CV Check & Professional Licensing',
  healthcare: 'Healthcare & Prescriptions',
  schools: 'Schools & Child Care',
  sos: 'Emergency Help',
  compare: 'City Comparison',
  languages: 'Guides in Your Language',
  coverage: 'Knowledge Coverage',
  review: 'Editorial Review'
};

// Optional AI rewrite statuses reported by /v1/answers. `disabled` and
// `not_applicable` are normal operation and need no badge.
export const AI_STATUS_META = {
  checked: ['AI wording reviewed', false],
  fallback: ['AI wording review unavailable', true],
  busy: ['AI review busy', true],
  knowledge_changed: ['Knowledge changed during review', true]
}

// City-aware example questions, aligned with the per-city knowledge map:
// sin/community/transit everywhere, arrival also in Vancouver. OHIP stays an
// Ontario-only example.
export const EXAMPLES = [
  { label: 'Banking KYC (No Job / Credit)', build: city => `Can a bank refuse to open an account if I have no job in ${city}?`, city: true },
  { label: 'Tenant KYC & Illegal SIN', build: city => `Can a landlord demand my SIN on a rental application in ${city}?`, city: true, cities: ['Toronto', 'Mississauga', 'Brampton'] },
  { label: 'FINTRAC $10k Wire Transfer', build: city => `Do I need to report a 10000 dollar wire transfer to Canada in ${city}?`, city: true },
  { label: 'Secured Credit Card (Build Credit)', build: city => `How do I build Canadian credit from zero with a secured credit card in ${city}?`, city: true },
  { label: 'Key Deposit Law (RTA s.134)', build: city => `Is a landlord allowed to charge a 500 dollar key deposit in ${city}?`, city: true, cities: ['Toronto', 'Mississauga', 'Brampton'] },
  { label: 'SIN Disclosure Rights', build: () => 'When is it legally mandatory to provide my SIN in Canada?' },
  { label: 'SIN 900-Series Renewal', build: city => `How do I renew my 900-series temporary resident SIN during maintained status in ${city}?`, city: true },
  { label: 'CRA Interac Sign-In', build: city => `How can a first-year newcomer register for CRA My Account using Interac Sign-In Partner in ${city}?`, city: true },
  { label: 'Tax-Free Parental Gifts', build: city => `Are cash gifts from parents abroad taxable in Canada when transferred to ${city}?`, city: true },
  { label: 'Equifax & TransUnion Alerts', build: city => `How do I place a fraud alert on my credit bureau file with Equifax and TransUnion in ${city}?`, city: true },
  { label: 'BC MSP & Services Card', build: () => 'What are the identity documents and waiting period for BC MSP enrollment in Vancouver?', cities: ['Vancouver'] },
  { label: 'LTB T2 Tenant Rights', build: city => `Can a landlord enter without 24 hours notice or harass a tenant and how to file Form T2 in ${city}?`, city: true, cities: ['Toronto', 'Mississauga', 'Brampton'] },
  { label: 'Vulnerable Sector Check (VSC)', build: city => `How do I apply for a police vulnerable sector check for a healthcare job in ${city}?`, city: true, cities: ['Toronto', 'Mississauga', 'Brampton'] },
  { label: 'Newborn 5-in-1 & Address', build: city => `How many days do I have to update my address on my Ontario health card in ${city}?`, city: true, cities: ['Toronto', 'Mississauga', 'Brampton'] },
  { label: 'Newcomer Anti-Fraud Scam Shield', build: city => `Will CRA or immigration officers call and threaten deportation over the phone in ${city}?`, city: true },
  { label: 'POE Cash Declaration (E677)', build: city => `Do I need to declare 10000 dollars cash at port of entry with CBSA in ${city}?`, city: true },
  { label: 'School Enrollment KYC', build: city => `What documents are required for dependent school registration in ${city}?`, city: true },
  { label: 'Ontario Photo Card', build: city => `How can a non-driver get an Ontario photo card for identity verification in ${city}?`, city: true, cities: ['Toronto', 'Mississauga', 'Brampton'] },
  { label: 'CRA Benefit (RC151/RC66)', build: city => `Can newcomers apply for the GST credit using form RC151 before filing taxes in ${city}?`, city: true },
  { label: 'Getting a SIN', build: () => 'How do I apply for a SIN in Canada?' },
  { label: 'Super Visa for Parents', build: city => `My mother is 62 and my father is 65. Can I sponsor both parents on a Super Visa in ${city}?`, city: true },
  { label: 'N12 Rent Compensation', build: city => `Does my landlord legally owe me one month rent compensation for N12 in ${city}?`, city: true, cities: ['Toronto', 'Mississauga', 'Brampton'] },
  { label: 'Express Entry CRS', build: city => `How many CRS points do I get with 3 years foreign experience and 1 year in ${city}?`, city: true },
  { label: 'Indian Licence & Sarathi', build: city => `Can I exchange my Indian driving licence with a Sarathi extract in ${city}?`, city: true, cities: ['Toronto', 'Mississauga', 'Brampton'] },
  { label: 'Police Certificates (PCC)', build: city => `Which countries do I need police clearance certificates from for PR in ${city}?`, city: true },
  { label: 'Medical Exam & Health', build: city => `Will type 2 diabetes cause medical inadmissibility for Canada PR in ${city}?`, city: true },
  { label: 'Rent Increase Cap', build: city => `Can my landlord raise rent by 8% in a 2015 building in ${city}?`, city: true, cities: ['Toronto', 'Mississauga', 'Brampton'] },
  { label: 'Newcomer services', build: city => `What settlement services can help me in ${city}?`, city: true },
  { label: 'Transit resources', build: city => `What transit resources are available in ${city}?`, city: true },
  { label: 'OHIP (Ontario)', build: city => `What is the OHIP waiting period in ${city}?`, city: true, cities: ['Toronto', 'Mississauga', 'Brampton'] },
  { label: 'Arrival support', build: () => 'What landing support is available in Vancouver?', cities: ['Vancouver'] },
  // Insider Settlement & Statutory Traps
  { label: 'Maintained Status Travel', build: city => `Can I travel outside Canada while on maintained status PGWP in ${city}?`, city: true },
  { label: 'Remote Work Visitor', build: city => `Can I work remotely for a foreign employer on a visitor visa in ${city}?`, city: true },
  { label: 'Expired PR Card Border', build: city => `Can I enter Canada at land border with expired PR card in private vehicle in ${city}?`, city: true },
  { label: 'Flagpoling PGWP Ban', build: city => `Can I flagpole at Rainbow Bridge for PGWP work permit at border in ${city}?`, city: true },
  { label: '117(9)(d) Family Class Bar', build: city => `What happens if a dependent child was non-accompanying and unexamined section 117(9)(d) in ${city}?`, city: true },
  { label: 'Shared Kitchen No RTA', build: city => `Does RTA apply if I share kitchen or bathroom with the landlord owner in Ontario in ${city}?`, city: true, cities: ['Toronto', 'Mississauga', 'Brampton'] },
  { label: 'Post-2018 Rent Exemption', build: city => `How to verify rent control exemption for building first occupied after November 15 2018 in ${city}?`, city: true, cities: ['Toronto', 'Mississauga', 'Brampton'] },
  { label: 'TFSA Non-Resident Penalty', build: city => `What is the CRA penalty for contributing to TFSA as a non-resident 1% tax in ${city}?`, city: true },
  { label: 'FMV Cost Base Step-Up', build: city => `Does Canada tax foreign capital gains prior to landing fair market value cost base step-up in ${city}?`, city: true },
  { label: 'Parental Gift Wire Deed', build: city => `Is wire transfer gift from parents taxable in Canada Deed of Gift FINTRAC in ${city}?`, city: true },
  { label: 'Claims-Free Insurance', build: city => `How to get auto insurance discount with foreign Claims-Free Letter of Experience in Ontario FSRA in ${city}?`, city: true, cities: ['Toronto', 'Mississauga', 'Brampton'] },
  { label: 'Self-Employed CEC Bar', build: city => `Does self-employed contract work count for Canadian Experience Class CEC section 87.1(3)(b) in ${city}?`, city: true },
  { label: 'Dual Intent IRPA 22(2)', build: city => `Can I enter Canada on visitor visa if I have pending Express Entry PR dual intent in ${city}?`, city: true },
  { label: 'CBSA Phone Search Limits', build: city => `Can CBSA border officers search my digital device phone search passcode at airport in ${city}?`, city: true },
  { label: '30-Day Lease Exit (s.95)', build: city => `Can I terminate early with 30 days notice if landlord refuses lease assignment in ${city}?`, city: true, cities: ['Toronto', 'Mississauga', 'Brampton'] },
  { label: 'N12 Compensation Timing', build: city => `Is N12 eviction notice void if landlord fails to pay one month compensation before termination date in ${city}?`, city: true, cities: ['Toronto', 'Mississauga', 'Brampton'] },
  { label: 'T1135 Foreign Home Exempt', build: city => `Do I need to report family home abroad on CRA form T1135 personal-use property in ${city}?`, city: true },
  { label: 'Driving Extract G-Skip', build: city => `How to bypass 12 month G1 wait with official driving extract experience credit in ${city}?`, city: true, cities: ['Toronto', 'Mississauga', 'Brampton'] },
  // Global Destination Parity Examples: Study Visas, PR, Business/Investor & Settlement
  { label: '🇺🇸 US: F-1 Student & STEM OPT', build: () => 'What are the on-campus work hours and 24-month STEM OPT extension rules on F-1 student visa in the United States?', country: 'United States' },
  { label: '🇺🇸 US: EB-1 / EB-2 NIW / EB-3 PR', build: () => 'How does employment-based permanent residence Green Card work for EB-1, EB-2 NIW and EB-3 in the United States?', country: 'United States' },
  { label: '🇺🇸 US: EB-5 & E-2 Investor Visa', build: () => 'What are the minimum investment amounts for EB-5 immigrant investor and E-2 treaty visa in the United States?', country: 'United States' },
  { label: '🇺🇸 US: SSN & Form I-9', build: () => 'How do I apply for a Social Security Number and verify right to work with Form I-9 in the United States?', country: 'United States' },
  { label: '🇺🇸 US: H-1B 60-Day Grace Period', build: () => 'When does the 60-day grace period start after layoff severance for H-1B in the United States?', country: 'United States' },
  { label: '🇬🇧 UK: Student & Graduate Route', build: () => 'Can international students work 20 hours per week and switch to the 2-year Graduate Route visa in the UK?', country: 'United Kingdom' },
  { label: '🇬🇧 UK: ILR 5-Year Settlement PR', build: () => 'What are the 5-year continuous residence and Life in the UK requirements for Indefinite Leave to Remain ILR in the UK?', country: 'United Kingdom' },
  { label: '🇬🇧 UK: Innovator Founder Visa', build: () => 'What are the endorsement requirements and accelerated 3-year ILR rules for Innovator Founder visa in the UK?', country: 'United Kingdom' },
  { label: '🇬🇧 UK: NIN & NHS GP', build: () => 'How do I apply for a National Insurance Number and register for free NHS GP care in the UK?', country: 'United Kingdom' },
  { label: '🇦🇺 AU: Subclass 500 & 485 Visa', build: () => 'What are the 48-hour fortnight student work limits and Subclass 485 Temporary Graduate visa in Australia?', country: 'Australia' },
  { label: '🇦🇺 AU: General Skilled Migration PR', build: () => 'How does the 65-point test work for Subclass 189, 190 and 491 permanent skilled visas in Australia?', country: 'Australia' },
  { label: '🇦🇺 AU: Subclass 188 Business Visa', build: () => 'What are the turnover and asset requirements for Subclass 188 Business Innovation and Investment in Australia?', country: 'Australia' },
  { label: '🇦🇺 AU: TFN & Medicare', build: () => 'How do I apply for a Tax File Number and enroll in Medicare in Australia?', country: 'Australia' },
  { label: '🇩🇪 DE: Student Visa & 18-Mo Job Search', build: () => 'Can international students work 140 days per year and get an 18-month job seeker visa under Section 20 in Germany?', country: 'Germany' },
  { label: '🇩🇪 DE: Niederlassungserlaubnis PR', build: () => 'How many years of pension contributions are required for permanent settlement permit Niederlassungserlaubnis in Germany?', country: 'Germany' },
  { label: '🇩🇪 DE: Section 21 Self-Employment', build: () => 'What are the business plan and economic interest rules for Section 21 self-employment visa in Germany?', country: 'Germany' },
  { label: '🇩🇪 DE: Anmeldung & GKV', build: () => 'How do I complete 14-day Anmeldung address registration and enroll in statutory GKV health insurance in Germany?', country: 'Germany' },
  { label: '🇦🇪 UAE: 10-Yr Golden Visa Investor', build: () => 'What are the AED 2M capital and accredited startup rules for UAE 10-Year Golden Visa for entrepreneurs and investors?', country: 'United Arab Emirates' },
  { label: '🇦🇪 UAE: Emirates ID & WPS Banking', build: () => 'How do I get an Emirates ID and what is mandatory Ejari tenancy registration in the UAE?', country: 'United Arab Emirates' },
  { label: '🇳🇿 NZ: Student Visa & PSWV', build: () => 'Can international students work 20 hours per week and get a 3-year Post-Study Work Visa PSWV in New Zealand?', country: 'New Zealand' },
  { label: '🇳🇿 NZ: Green List & SMC PR', build: () => 'How does the Green List Straight to Residence and SMC 6-point permanent residency system work in New Zealand?', country: 'New Zealand' },
  { label: '🇳🇿 NZ: Active Investor Plus Visa', build: () => 'What are the weighted investment requirements for Active Investor Plus Visa in New Zealand?', country: 'New Zealand' },
  { label: '🇮🇪 IE: Stamp 2 Student & Stamp 1G', build: () => 'Can students work 20 hours and get 2-year Stamp 1G post-study work permission in Ireland?', country: 'Ireland' },
  { label: '🇮🇪 IE: CSEP to Stamp 4 PR', build: () => 'How do Critical Skills Employment Permit holders fast-track to Stamp 4 permanent residence in Ireland?', country: 'Ireland' },
  { label: '🇸🇬 SG: Student Pass & LTVP Search', build: () => 'Can university students work 16 hours and get a one-year LTVP graduate job search pass in Singapore?', country: 'Singapore' },
  { label: '🇸🇬 SG: Permanent Residence PTS', build: () => 'How do Employment Pass holders apply for Singapore Permanent Residence under the PTS scheme?', country: 'Singapore' },
  { label: '🇫🇷 FR: VLS-TS Student & RECE Card', build: () => 'What is the 964-hour student work cap and 1-year RECE job search card in France?', country: 'France' },
  { label: '🇫🇷 FR: Passeport Talent Business', build: () => 'What are the 30000 euro investment and business plan rules for Passeport Talent Createur d entreprise in France?', country: 'France' }
];

export const EXAMPLES_PER_ROW = 3;

// Keyboard shortcuts: "/" focuses the question, Alt+1/2/3 switch views,
// "?" lists them all in a session overlay.
export const VIEW_ORDER = ['ask', 'binder', 'airport', 'pathway', 'cashflow', 'tenancy', 'journey', 'tax', 'forms', 'paycheck', 'banking', 'driving', 'careers', 'healthcare', 'schools', 'sos', 'compare', 'languages', 'coverage', 'review'];

export const SHORTCUTS = [
  ['/ ', 'focus the question box'],
  ['Ctrl+Enter', 'submit the question'],
  ['Alt+1 · 2 · 3 · 4 · 5 · 6 · 7 · 8', 'Switch primary views'],
  ['?', 'open this shortcut list']
];

// Session theme toggle: Auto follows the system preference; explicit Light/Dark
// apply to this tab only and never persist.
export const THEME_ORDER = ['', 'dark', 'light'];

export const THEME_LABELS = { '': 'Auto', dark: 'Dark', light: 'Light' };

// Session text-size toggle: Auto keeps the base layout; Large / Extra large / Maximum
// scale this tab only, the same no-storage rule as the theme toggle.
export const SIZE_ORDER = ['', 'large', 'x-large', 'xx-large'];

export const SIZE_LABELS = { '': 'Auto (100%)', large: 'Large (115%)', 'x-large': 'Extra large (130%)', 'xx-large': 'Maximum (150%)' };

// ==========================================
// TWO-PASS SAFE MULTILINGUAL PIPELINE
// ==========================================
export const MULTILINGUAL_TERMS = {
  hi: {
    langName: 'हिन्दी (Hindi)',
    patterns: [
      [/\bsin\b|सोशल इंश्योरेंस|सिन नंबर|सामाजिक सुरक्षा|पहचान नंबर/iu, 'When is it legally mandatory to provide my SIN in Canada?'],
      [/बैंक खाता|बिना नौकरी|अकाउंट खोल|खाता खोल/iu, 'Can a bank refuse to open an account if I have no job?'],
      [/10000|दस हजार|विदेश से पैसे|वायर ट्रांसफर|fintrac/iu, 'Do I need to report a 10000 dollar wire transfer to Canada?'],
      [/क्रेडिट स्कोर|क्रेडिट कार्ड|सिक्योर्ड क्रेडिट|क्रेडिट बनाना/iu, 'How do I build Canadian credit from zero with a secured credit card?'],
      [/एडवांस किराया|मकान मालिक.*डिपॉजिट|चाबी डिपॉजिट|सिक्योरिटी डिपॉजिट|किराया मांग/iu, 'Is a landlord allowed to charge advance rent or 500 dollar key deposit in Ontario?'],
      [/बिना नोटिस|घर में घुस|मकान मालिक.*प्रवेश|प्राइवेसी/iu, 'Can landlord enter rental unit without 24 hours notice in Ontario?'],
      [/मकान मालिक निकाल|बेदखल|n12|घर खाली/iu, 'What are my tenant rights if landlord serves N12 notice for personal use?'],
      [/canada me rent agreement|kiraya kaise|makan malik.*notice|ghar khali.*rta/iu, 'Is a landlord allowed to charge advance rent or 500 dollar key deposit in Ontario?'],
      [/sin number kaise|sin kaise banaye|sin card chahiye/iu, 'When is it legally mandatory to provide my SIN in Canada?'],
      [/bank account bina job|bina naukri khata|khata kaise khole/iu, 'Can a bank refuse to open an account if I have no job?'],
      [/ohip kaise banwaye|toronto me doctor|health card kaise/iu, 'How do I register for provincial health insurance OHIP or MSP?'],
      [/एयरपोर्ट.*कैश|कितना कैश|कस्टम्स डिक्लेरेशन|हवाई अड्डे पर नकदी/iu, 'What are the customs currency and cash declaration rules at the airport?'],
      [/हेल्थ इंश्योरेंस|ओहिप|डॉक्टर|मेडिकल कार्ड/iu, 'How do I register for provincial health insurance OHIP or MSP?'],
      [/वर्क परमिट|नौकरी|राइट टू वर्क|मेंटेंड स्टेटस/iu, 'How does an employer verify right to work with maintained status or work permit?'],
      [/मेंटेंड स्टेटस.*विदेश|मेंटेंड स्टेटस.*यात्रा|pgwp.*कनाडा से बाहर/iu, 'Can I travel outside Canada while on maintained status PGWP in Toronto?'],
      [/विज़िटर वीज़ा.*रिमोट वर्क|टूरिस्ट वीज़ा.*घर से काम|विज़िटर.*नौकरी/iu, 'Can I work remotely for a foreign employer on a visitor visa in Toronto?'],
      [/पीआर कार्ड एक्सपायर|लैंड बॉर्डर.*पीआर|बिना पीआर कार्ड.*प्रवेश/iu, 'Can I enter Canada at land border with expired PR card in private vehicle in Toronto?'],
      [/फ्लैगपोलिंग.*बैन|बॉर्डर पर pgwp|रेनबो ब्रिज.*वर्क परमिट/iu, 'Can I flagpole at Rainbow Bridge for PGWP work permit at border in Toronto?'],
      [/बच्चे को शामिल नहीं किया|नॉन-अकम्पनीइंग|117\(9\)\(d\)|फैमिली स्पॉन्सरशिप रिजेक्ट/iu, 'What happens if a dependent child was non-accompanying and unexamined section 117(9)(d) in Toronto?'],
      [/किचन शेयर|बाथरूम शेयर|मकान मालिक के साथ किचन|rta लागू/iu, 'Does RTA apply if I share kitchen or bathroom with the landlord owner in Ontario?'],
      [/2018 के बाद.*किराया|रेंट कंट्रोल छूट|किराया वृद्धि 2018/iu, 'How to verify rent control exemption for building first occupied after November 15 2018 in Toronto?'],
      [/tfsa.*पेनल्टी|tfsa.*1% टैक्स|नॉन-रेजिडेंट tfsa/iu, 'What is the CRA penalty for contributing to TFSA as a non-resident 1% tax in Toronto?'],
      [/कनाडा आने से पहले की प्रॉपर्टी|फेयर मार्केट वैल्यू|कैपिटल गेन टैक्स.*विदेश/iu, 'Does Canada tax foreign capital gains prior to landing fair market value cost base step-up in Toronto?'],
      [/माता-पिता से गिफ्ट|गिफ्ट डीड|विदेश से गिफ्ट पर टैक्स/iu, 'Is wire transfer gift from parents taxable in Canada Deed of Gift FINTRAC in Toronto?'],
      [/ड्राइविंग एक्सट्रैक्ट|12 महीने g1 छोड़ना|विदेशी लाइसेंस अनुभव/iu, 'How to bypass 12 month G1 wait with official driving extract experience credit in Toronto?'],
      [/h1b.*60 दिन|h1b.*छंटनी|ग्रेस पीरियड.*h1b/iu, 'When does the 60-day grace period start after layoff severance for H-1B in the United States?'],
      [/ilr.*180 दिन|यूके.*180 दिन बाहर|कंटीन्यूअस रेजिडेंस/iu, 'What is the 180-day continuous residence rolling absence limit for ILR in the UK?'],
      [/नेबेनकोस्टन|बिजली पानी बिल.*जर्मनी|12 महीने बाद बिल/iu, 'What is the landlord 12-month preclusion rule on annual utility bills Nebenkosten in Germany?'],
      [/दुबई.*ग्रेच्युटी|वीज़ा खर्चा काटना|wps.*ग्रेच्युटी/iu, 'Can an employer deduct visa or recruitment fees from gratuity under WPS in the UAE?'],
      [/दुबई.*मकान खाली|रेरा.*12 महीने|नोटरी नोटिस.*दुबई/iu, 'Can my landlord evict me in Dubai with WhatsApp notice or do they need 12 months notary public notice under RERA?'],
      [/ओहिप.*3 महीने|ओहिप वेटिंग पीरियड|हेल्थ कार्ड.*3 महीने/iu, 'Is there still a three-month waiting period for OHIP health insurance coverage in Ontario?'],
      [/एक्सप्रेस एंट्री.*52 हफ्ते|1560 घंटे.*6 महीने|cec.*52 हफ्ते/iu, 'Can I qualify for Canadian Experience Class CEC in 6 months with 1560 hours or does it require 52 continuous weeks?'],
      [/fica.*टैक्स|opt.*टैक्स छूट|f1.*सोशल सिक्योरिटी टैक्स/iu, 'Are F-1 students on OPT exempt from Social Security and Medicare FICA taxes in the United States?'],
      [/540 दिन.*ead|ead ऑटोमैटिक एक्सटेंशन|i-765.*540 दिन/iu, 'Does a timely filed I-765 renewal qualify for a 540-day automatic extension of EAD work authorization in the United States?'],
      [/वर्किंग हॉलिडे.*88 दिन|फार्म वर्क.*वेतन|ऑस्ट्रेलिया.*88 दिन/iu, 'What are the award wage and piece rate protections for Working Holiday 88 days regional work under Fair Work in Australia?'],
      [/जर्मनी.*नोटिस पीरियड|kündigungsfrist|प्रोबेशन.*इस्तीफा जर्मनी/iu, 'What is the statutory notice period for resignation or dismissal under BGB 622 during probation in Germany?'],
      [/pnp.*दूसरा राज्य|pnp.*दूसरे राज्य में जाना|इंटेंट टू रिसाइड/iu, 'Can a provincial nominee PNP move to another province before landing or does IRPA require intent to reside in Toronto?'],
      [/fhsa.*पहला साल|पहला घर बचत खाता|fhsa.*नया अप्रवासी/iu, 'Can a newcomer open a First Home Savings Account FHSA in their first year of arrival in Canada in Toronto?'],
      [/सेवरेंस पे.*नोटिस|टर्मिनेशन नोटिस और सेवरेंस|25 लाख पेरोल.*सेवरेंस/iu, 'What is the difference between notice of termination and severance pay under Ontario ESA 2.5 million payroll in Toronto?'],
      [/i-94.*वीज़ा एक्सपायरी|i-94.*अमेरिका में रुकना|पासपोर्ट वीज़ा स्टैम्प.*i94/iu, 'Does electronic Form I-94 determine authorized stay and override passport visa foil expiration in the United States?'],
      [/डुअल स्टेटस टैक्स|6013\(g\).*चुनाव|अमेरिका में शादीशुदा टैक्स/iu, 'Can a married dual-status alien make a 6013(g) election to file married filing jointly in the United States?'],
      [/स्किल्ड वर्कर.*38700|29000 सैलरी.*यूके|यूके वीज़ा एक्सटेंशन सैलरी/iu, 'What is the grandfathered salary threshold for pre-April 2024 Skilled Worker visa holders in the United Kingdom?'],
      [/ऑस्ट्रेलिया.*विदेशी संपत्ति टैक्स|cgt छूट.*ऑस्ट्रेलिया|टेम्परेरी रेजिडेंट cgt/iu, 'Are temporary residents exempt from capital gains tax CGT on foreign assets under Subdivision 768-R in Australia?'],
      [/चांसेनकार्टे.*20 घंटे|जर्मनी अपॉर्चुनिटी कार्ड काम|probearbeit.*जर्मनी/iu, 'Can Opportunity Card Chancenkarte holders work 20 hours per week or do trial work Probearbeit in Germany?'],
      [/शिफ्टिंग खर्च.*टैक्स छूट|मूविंग एक्सपेंस.*t1-m|40 किलोमीटर.*काम शिफ्ट/iu, 'Can I deduct moving expenses on form T1-M if I moved 40 kilometres for work in Canada in Toronto?'],
      [/क्रेडिट हिस्ट्री नहीं.*मकान मालिक मना|ओंटारियो मानवाधिकार.*किराया|नो क्रेडिट.*मकान/iu, 'Can a landlord refuse to rent to a newcomer because they have no Canadian credit history under the Human Rights Code in Toronto?'],
      [/245\(k\).*अनऑथराइज्ड वर्क|ग्रीन कार्ड.*180 दिन छूट|स्टेटस वायलेशन.*eb ग्रीन कार्ड/iu, 'Can employment-based green card applicants forgive up to 180 days of unauthorized work under 245(k) in the United States?'],
      [/राइट टू रेंट.*28 दिन|वीज़ा पेंडिंग.*किराया यूके|लैंडलॉर्ड चेकिंग सर्विस/iu, 'Does a landlord have a 28-day statutory excuse via Landlord Checking Service during in-time visa extension Right to Rent in the United Kingdom?'],
      [/ऑस्ट्रेलिया.*मेडिकेयर रेसिप्रोकल|rhca.*मेडिकेयर|ऑस्ट्रेलिया में फ्री इलाज/iu, 'Can visitors from Reciprocal Health Care Agreement RHCA countries enroll in Medicare in Australia?'],
      [/पिछला किराया बताना.*जर्मनी|vormiete.*जर्मनी|रेंट ब्रेक.*जर्मनी 10%/iu, 'Must a landlord disclose the previous rent Vormiete in writing under the Mietpreisbremse rent brake in Germany?']
    ],
    synthesisPrefix: 'अधिकारिक विनियामक निष्कर्ष (वैधानिक धाराएं व कानूनी टोकन लॉक हैं):',
    synthesisAllowed: 'अनुमति प्राप्त: आधिकारिक कानूनों के अनुसार आपकी प्रक्रिया मान्य है।',
    synthesisForbidden: 'अवैध उल्लंघन: कानून के अनुसार यह मांग या कार्रवाई पूरी तरह निषिद्ध है।'
  },
  pa: {
    langName: 'ਪੰਜਾਬੀ (Punjabi)',
    patterns: [
      [/ਸਿਨ ਨੰਬਰ|ਸੋਸ਼ਲ ਇੰਸ਼ੋਰੈਂਸ|ਪਛਾਣ/iu, 'When is it legally mandatory to provide my SIN in Canada?'],
      [/ਬੈਂਕ ਖਾਤਾ|ਬਿਨਾਂ ਨੌਕਰੀ|ਖਾਤਾ ਖੋਲ੍ਹ/iu, 'Can a bank refuse to open an account if I have no job?'],
      [/10000|ਦਸ ਹਜ਼ਾਰ|ਵਾਇਰ ਟ੍ਰਾਂਸਫਰ|ਵਿਦੇਸ਼ੋਂ ਪੈਸੇ/iu, 'Do I need to report a 10000 dollar wire transfer to Canada?'],
      [/ਕ੍ਰੈਡਿਟ ਕਾਰਡ|ਕ੍ਰੈਡਿਟ ਸਕੋਰ|ਸਿਕਿਉਰਡ ਕਾਰਡ/iu, 'How do I build Canadian credit from zero with a secured credit card?'],
      [/ਪੇਸ਼ਗੀ ਕਿਰਾਇਆ|ਕੀ ਡਿਪਾਜ਼ਿਟ|ਸਿਕਿਉਰਿਟੀ ਡਿਪਾਜ਼ਿਟ|ਮਕਾਨ ਮਾਲਕ/iu, 'Is a landlord allowed to charge advance rent or 500 dollar key deposit in Ontario?'],
      [/ਬਿਨਾਂ ਨੋਟਿਸ|ਘਰ ਵਿੱਚ ਦਾਖਲ|ਘਰ ਵੜ/iu, 'Can landlord enter rental unit without 24 hours notice in Ontario?'],
      [/ਹਵਾਈ ਅੱਡੇ.*ਕੈਸ਼|ਕਸਟਮਜ਼ ਡਿਕਲੇਰੇਸ਼ਨ/iu, 'What are the customs currency and cash declaration rules at the airport?'],
      [/ਮੇਨਟੇਨਡ ਸਟੇਟਸ.*ਵਿਦੇਸ਼|ਕੈਨੇਡਾ ਤੋਂ ਬਾਹਰ.*pgwp/iu, 'Can I travel outside Canada while on maintained status PGWP in Toronto?'],
      [/ਪੀਆਰ ਕਾਰਡ ਮਿਆਦ ਖਤਮ|ਲੈਂਡ ਬਾਰਡਰ.*ਪੀਆਰ/iu, 'Can I enter Canada at land border with expired PR card in private vehicle in Toronto?'],
      [/ਮਾਪਿਆਂ ਤੋਂ ਗਿਫਟ|ਗਿਫਟ ਡੀਡ|ਵਿਦੇਸ਼ੀ ਪੈਸੇ ਟੈਕਸ/iu, 'Is wire transfer gift from parents taxable in Canada Deed of Gift FINTRAC in Toronto?'],
      [/ਡਰਾਈਵਿੰਗ ਐਕਸਟ੍ਰੈਕਟ|g1 ਟੈਸਟ.*ਤਜਰਬਾ/iu, 'How to bypass 12 month G1 wait with official driving extract experience credit in Toronto?'],
      [/ਰਸੋਈ ਸਾਂਝੀ|ਮਕਾਨ ਮਾਲਕ ਨਾਲ ਬਾਥਰੂਮ/iu, 'Does RTA apply if I share kitchen or bathroom with the landlord owner in Ontario?'],
      [/ਦੁਬਈ.*ਗ੍ਰੈਚੂਟੀ|ਵੀਜ਼ਾ ਖਰਚ ਕੱਟਣਾ/iu, 'Can an employer deduct visa or recruitment fees from gratuity under WPS in the UAE?']
    ],
    synthesisPrefix: 'ਅਧਿਕਾਰਤ ਕਾਨੂੰਨੀ ਨਿਰਣੇ (ਵੈਧਾਨਿਕ ਧਾਰਾਵਾਂ ਅਤੇ ਕਾਨੂੰਨੀ ਟੋਕਨ ਲਾਕ ਹਨ):',
    synthesisAllowed: 'ਮਨਜ਼ੂਰਸ਼ੁਦਾ: ਸਰਕਾਰੀ ਕਾਨੂੰਨਾਂ ਅਨੁਸਾਰ ਤੁਹਾਡੀ ਪ੍ਰਕਿਰਿਆ ਵੈਧ ਹੈ।',
    synthesisForbidden: 'ਗੈਰ-ਕਾਨੂੰਨੀ ਉਲੰਘਣਾ: ਕਾਨੂੰਨ ਅਨੁਸਾਰ ਇਹ ਮੰਗ ਜਾਂ ਕਾਰਵਾਈ ਸਖ਼ਤ ਮਨਾਹੀ ਅਧੀਨ ਹੈ।'
  },
  ar: {
    langName: 'العربية (Arabic)',
    patterns: [
      [/رقم التأمين|sin/iu, 'When is it legally mandatory to provide my SIN in Canada?'],
      [/فتح حساب|بدون عمل|بنك/iu, 'Can a bank refuse to open an account if I have no job?'],
      [/تحويل مالي|10000|أموال/iu, 'Do I need to report a 10000 dollar wire transfer to Canada?'],
      [/بطاقة ائتمان|بناء الائتمان|سجل ائتماني/iu, 'How do I build Canadian credit from zero with a secured credit card?'],
      [/إيجار مقدم|تأمين المفتاح|وديعة تأمين|طلب المالك/iu, 'Is a landlord allowed to charge advance rent or 500 dollar key deposit in Ontario?'],
      [/دخول المالك|بدون إشعار|خصوصية/iu, 'Can landlord enter rental unit without 24 hours notice in Ontario?'],
      [/المطار.*نقد|إعلان جمركي|أموال المطار/iu, 'What are the customs currency and cash declaration rules at the airport?']
    ],
    synthesisPrefix: 'التوجيه القانوني الرسمي المعتمد (الرموز القانونية مقفلة):',
    synthesisAllowed: 'مسموح قانوناً: الإجراء متوافق مع التشريعات الحكومية.',
    synthesisForbidden: 'مخالفة قانونية: هذا الإجراء أو الطلب محظور صراحة بموجب القانون.'
  },
  es: {
    langName: 'Español (Spanish)',
    patterns: [
      [/número de seguro social|sin/iu, 'When is it legally mandatory to provide my SIN in Canada?'],
      [/abrir cuenta|sin trabajo|banco/iu, 'Can a bank refuse to open an account if I have no job?'],
      [/transferencia.*10000|declarar dinero|aduana/iu, 'Do I need to report a 10000 dollar wire transfer to Canada?'],
      [/tarjeta de crédito|historial crediticio|score/iu, 'How do I build Canadian credit from zero with a secured credit card?'],
      [/alquiler por adelantado|depósito de llaves|fianza/iu, 'Is a landlord allowed to charge advance rent or 500 dollar key deposit in Ontario?'],
      [/entrar sin aviso|24 horas|dueño/iu, 'Can landlord enter rental unit without 24 hours notice in Ontario?'],
      [/declarar efectivo|aduana.*aeropuerto/iu, 'What are the customs currency and cash declaration rules at the airport?']
    ],
    synthesisPrefix: 'Conclusión legal oficial verificada (términos legales bloqueados):',
    synthesisAllowed: 'Permitido por ley: Procedimiento amparado por la legislación oficial.',
    synthesisForbidden: 'Infracción legal: Esta exigencia está estrictamente prohibida por la ley.'
  },
  fr: {
    langName: 'Français (French)',
    patterns: [
      [/numéro d'assurance sociale|nas|sin/iu, 'When is it legally mandatory to provide my SIN in Canada?'],
      [/ouvrir un compte|sans emploi|banque/iu, 'Can a bank refuse to open an account if I have no job?'],
      [/virement.*10000|fintrac|déclarer/iu, 'Do I need to report a 10000 dollar wire transfer to Canada?'],
      [/carte de crédit sécurisée|cote de crédit/iu, 'How do I build Canadian credit from zero with a secured credit card?'],
      [/loyer d'avance|dépôt de garantie|clé/iu, 'Is a landlord allowed to charge advance rent or 500 dollar key deposit in Ontario?'],
      [/entrer sans préavis|24 heures|propriétaire/iu, 'Can landlord enter rental unit without 24 hours notice in Ontario?'],
      [/déclaration de devises|douane.*aéroport/iu, 'What are the customs currency and cash declaration rules at the airport?']
    ],
    synthesisPrefix: 'Orientation réglementaire officielle vérifiée (clauses juridiques verrouillées) :',
    synthesisAllowed: 'Autorisé par la loi : Démarche conforme aux textes réglementaires en vigueur.',
    synthesisForbidden: 'Infraction légale : Cette exigence est formellement interdite par la loi.'
  },
  zh: {
    langName: '简体中文 (Simplified Chinese)',
    patterns: [
      [/社会保险号|sin卡|工卡|工卡号/iu, 'When is it legally mandatory to provide my SIN in Canada?'],
      [/开户|银行账户|没有工作|无工作开户/iu, 'Can a bank refuse to open an account if I have no job?'],
      [/汇款.*10000|一万加币|现金申报|海关申报/iu, 'Do I need to report a 10000 dollar wire transfer to Canada?'],
      [/信用记录|安全信用卡|押金信用卡|积攒信用/iu, 'How do I build Canadian credit from zero with a secured credit card?'],
      [/预付租金|提前交房租|钥匙押金|损害押金|房东要押金/iu, 'Is a landlord allowed to charge advance rent or 500 dollar key deposit in Ontario?'],
      [/不通知进屋|24小时通知|房东进屋|隐私/iu, 'Can landlord enter rental unit without 24 hours notice in Ontario?'],
      [/驱逐|n12|房东自住|搬走/iu, 'What are my tenant rights if landlord serves N12 notice for personal use?'],
      [/海关.*现金|带现金|机场申报|一万现金/iu, 'What are the customs currency and cash declaration rules at the airport?'],
      [/健康卡|医保|ohip|msp|医疗卡/iu, 'How do I register for provincial health insurance OHIP or MSP?'],
      [/工签|合法工作|雇主核实|维持身份/iu, 'How does an employer verify right to work with maintained status or work permit?']
    ],
    synthesisPrefix: '经官方核实法定结论（法定关键条款锁定）：',
    synthesisAllowed: '法律允许：符合官方现行法规与程序。',
    synthesisForbidden: '法律禁止：该行为或要求被现行法律严格禁止。'
  }
};

// ── Interactive Settlement Document Binder & KYC Readiness Checklist ───────
export const BINDER_DOCUMENTS = [
  {
    category: '1. Legal Identity & Canadian Status Verification',
    items: [
      { id: 'doc-passport', name: 'Valid Foreign Passport (Original)', authority: 'IRCC / CBSA Border Control', tip: 'Must be current and non-expired. Keep physical document in carry-on bag during travel.', statuses: ['all'] },
      { id: 'doc-permit', name: 'Original Physical Immigration Permit', authority: 'IRCC National Standards', tip: 'Work Permit, Study Permit, PR Card, or COPR IMM 5292/5688. Digital phone PDFs are strictly rejected at Service Canada.', statuses: ['all'] },
      { id: 'doc-wp-ext', name: 'WP-EXT Maintained Status Confirmation Letter', authority: 'IRPA Regulation 186(u)', tip: 'IMM 5429 / IMM 5988 letter proves continuous statutory authorization to work while extension is pending.', statuses: ['work_permit'] },
      { id: 'doc-enrollment', name: 'Designated Learning Institution (DLI) Enrollment Letter', authority: 'IRCC Student Compliance', tip: 'Proves full-time student status at an accredited Canadian educational institution.', statuses: ['student'] }
    ]
  },
  {
    category: '2. Social Insurance Number (SIN) KYC & Privacy Shield',
    items: [
      { id: 'doc-sin', name: 'Service Canada SIN Confirmation Letter', authority: 'Service Canada / Treasury Board', tip: 'Obtain in person at a Service Canada Centre without fees. 900-series temporary numbers match permit expiry.', statuses: ['work_permit', 'student', 'pr'] },
      { id: 'doc-sin-privacy', name: 'SIN Privacy Shield (Know Your Statutory Rights)', authority: 'PIPEDA & Treasury Board Directives', tip: 'Landlords, rental applications, gyms, cell carriers, and employers before hiring CANNOT legally demand your SIN. Keep it strictly private.', statuses: ['all'] }
    ]
  },
  {
    category: '3. Banking & Settlement Capital KYC (Bank Act s.627.17)',
    items: [
      { id: 'doc-bank-two-doc', name: 'Two-Document Rule Identification Bundle', authority: 'Federal Bank Act Section 627.17', tip: 'Primary: Passport + Permit; Secondary: Foreign credit card with your signature, Canadian utility bill, or signed lease.', statuses: ['all'] },
      { id: 'doc-gift-deed', name: 'Parental Gift Deed & SWIFT Wire Transfer Receipts', authority: 'CRA & FINTRAC PCMLTFA', tip: 'A genuine gift from family abroad is generally not taxed as income in Canada. Keep a signed gift letter and the transfer receipts, especially for transfers of CAD 10,000 or more, because your bank may ask where the money came from.', statuses: ['all'] },
      { id: 'doc-poe-currency', name: 'CBSA Form E677 Currency Declaration (If carrying >= $10,000)', authority: 'CBSA Border Compliance', tip: 'Mandatory declaration if carrying physical cash, drafts, or traveller cheques >= $10,000 at port of entry. Avoid cash seizures.', statuses: ['all'] },
      { id: 'doc-secured-card', name: 'Secured Credit Card Deposit ($500–$1,000)', authority: 'FCAC Credit Establishment', tip: 'Open a secured card with a major bank or Neo Financial to build your Equifax and TransUnion credit file from zero.', statuses: ['all'] },
      { id: 'doc-fraud-alert', name: 'Equifax & TransUnion Potential Fraud Alert', authority: 'FCAC Consumer Protection', tip: 'Register a free fraud alert with both bureaus so lenders must phone you before opening new accounts in your name.', statuses: ['all'] }
    ]
  },
  {
    category: '4. Provincial Healthcare Registration (OHIP / MSP)',
    items: [
      { id: 'doc-ohip-3list', name: 'ServiceOntario Regulation 552 Three-Document Standard', authority: 'ServiceOntario (OHIP)', tip: 'List A (status: permit valid 6+ mo with job letter/PR); List B (residency: lease/utility); List C (identity: credit card/photo ID). No 3-month wait.', cities: ['Toronto', 'Mississauga', 'Brampton'], statuses: ['work_permit', 'student', 'pr'] },
      { id: 'doc-bc-msp', name: 'Health Insurance BC MSP Application Bundle', authority: 'Medicare Protection Act BC', tip: 'Requires permit valid 6+ months + secondary ID. Complete in-person photo session at ICBC for BC Services Card.', cities: ['Vancouver'], statuses: ['work_permit', 'student', 'pr'] },
      { id: 'doc-bridge-insurance', name: 'Private Bridge Health Insurance Policy', authority: 'BC Settlement Advisory', tip: 'Essential in British Columbia during the statutory 2-month + arrival month waiting period before MSP activates.', cities: ['Vancouver'], statuses: ['all'] },
      { id: 'doc-photo-card', name: 'Ontario Photo Card for Non-Drivers', authority: 'ServiceOntario Photo Card Act', tip: 'Provides official provincial photo ID for non-drivers so you do not have to carry your foreign passport in public.', cities: ['Toronto', 'Mississauga', 'Brampton'], statuses: ['all'] }
    ]
  },
  {
    category: '5. Tenancy, Housing & Tenant Screening Rights',
    items: [
      { id: 'doc-tenant-screening', name: 'Equifax / TransUnion Free Consumer Credit Report', authority: 'OHRC & Privacy Commissioner', tip: 'Provide a free consumer disclosure or overseas credit report. Landlords cannot reject you solely for having no Canadian credit score.', statuses: ['all'] },
      { id: 'doc-key-deposit-limit', name: 'Refundable Key Deposit Receipt ($25–$50 Statutory Cap)', authority: 'Ontario RTA Section 134', tip: 'Under Ontario law, key deposits exceeding direct replacement cost are illegal, and damage/security deposits are void.', cities: ['Toronto', 'Mississauga', 'Brampton'], statuses: ['all'] },
      { id: 'doc-ltb-t2', name: 'Tenant Rights Protection Against Landlord Harassment', authority: 'Ontario Landlord & Tenant Board', tip: 'Landlords cannot enter without 24 hours notice or harass tenants. Form T2 provides legal remedies and rent abatements.', cities: ['Toronto', 'Mississauga', 'Brampton'], statuses: ['all'] }
    ]
  },
  {
    category: '6. Driver Licensing & Authentication KYC',
    items: [
      { id: 'doc-orig-licence', name: 'Original Plastic Foreign Driver Licence', authority: 'DriveTest Ontario / ICBC BC', tip: 'Must be current and non-expired. Drive up to 60 days in Ontario or 90 days in BC on foreign licence.', statuses: ['all'] },
      { id: 'doc-licence-extract', name: 'Official Driving Extract (Sarathi / DVLA / LTO)', authority: 'DriveTest / ICBC Experience Credit', tip: 'Extract from licensing ministry proves 2+ years of driving experience to bypass G1/G2 or Class 7 graduated waiting periods.', statuses: ['all'] },
      { id: 'doc-translation', name: 'ATIO / STIBC Certified Translation', authority: 'Certified Translators Association', tip: 'Mandatory if your foreign licence or extract contains any text not in English or French.', statuses: ['all'] }
    ]
  },
  {
    category: '7. Dependent Children Public School Enrollment KYC',
    items: [
      { id: 'doc-child-birth', name: 'Child Original Birth Certificate / Foreign Passport', authority: 'Ontario Education Act (TDSB / PDSB / VSB)', tip: 'Proves child’s legal name and age. All children aged 6 to 18 are entitled to free public education regardless of status.', statuses: ['all'] },
      { id: 'doc-child-status', name: 'Parents and Child Legal Status Documents', authority: 'School Board Admissions', tip: 'Work permit, study permit, or PR documentation.', statuses: ['all'] },
      { id: 'doc-child-catchment', name: 'Proof of Catchment Address (Lease or Utility Bill)', authority: 'Catchment Area Verification', tip: 'Confirms child resides within the designated school boundaries.', statuses: ['all'] },
      { id: 'doc-child-vaccine', name: 'Translated Immunization Yellow Card', authority: 'Immunization of School Pupils Act', tip: 'Full childhood vaccine history translated and submitted to local Public Health.', statuses: ['all'] }
    ]
  }
];

export const BINDER_DOCUMENTS_BY_COUNTRY = {
  Canada: BINDER_DOCUMENTS,
  'United States': [
    {
      category: '1. Legal Identity & US Lawful Status Verification',
      items: [
        { id: 'us-doc-passport', name: 'Valid Foreign Passport & US Visa Foil', authority: 'CBP / USCIS National Standards', tip: 'Must be valid for at least 6 months beyond intended period of stay.', statuses: ['all'] },
        { id: 'us-doc-i94', name: 'Electronic Form I-94 Arrival/Departure Record', authority: 'CBP I-94 Official Retrieval', tip: 'Download immediately after arrival from i94.cbp.dhs.gov. Proves lawful admission class and authorized stay.', statuses: ['all'] },
        { id: 'us-doc-i797', name: 'Form I-797 Notice of Action (H-1B / L-1 / O-1 / I-485)', authority: 'USCIS Approval Document', tip: 'Original physical approval notice proves underlying nonimmigrant or immigrant petition validity.', statuses: ['work_permit', 'pr'] },
        { id: 'us-doc-i20', name: 'Form I-20 Certificate of Eligibility (F-1 Students)', authority: 'SEVP / DSO Endorsement', tip: 'Must carry valid travel endorsement signature from DSO within past 12 months.', statuses: ['student'] },
        { id: 'us-doc-greencard', name: 'Permanent Resident Card (Form I-551 Green Card) / ADIT Stamp', authority: 'USCIS Permanent Residence', tip: 'Unconditional proof of permanent resident status and employment authorization.', statuses: ['pr'] }
      ]
    },
    {
      category: '2. Social Security Administration (SSA) SSN Issuance KYC',
      items: [
        { id: 'us-doc-ss5', name: 'Completed Form SS-5 Application for a Social Security Card', authority: 'Social Security Administration', tip: 'Apply in person at a local SSA field office with original passport and I-94.', statuses: ['work_permit', 'student', 'pr'] },
        { id: 'us-doc-ssn-job', name: 'Employer Job Offer Letter & Work Authorization', authority: 'SSA Employment Evidence', tip: 'Required for F-1 on-campus employment or CPT/OPT to establish work authorization.', statuses: ['student', 'work_permit'] },
        { id: 'us-doc-ssn-privacy', name: 'SSN Statutory Privacy Protection', authority: 'Privacy Act of 1974', tip: 'You are never required to provide your SSN to private landlords or retail businesses who do not report to IRS.', statuses: ['all'] }
      ]
    },
    {
      category: '3. FDIC Retail Banking & Patriot Act Customer Due Diligence',
      items: [
        { id: 'us-doc-bank-cip', name: 'Patriot Act Section 326 Dual-ID Bundle', authority: 'FDIC / FinCEN CIP Rules', tip: 'Primary: Unexpired foreign passport; Secondary: US lease agreement, utility bill, or foreign credit card.', statuses: ['all'] },
        { id: 'us-doc-itin-w8', name: 'Form W-8BEN or ITIN / SSN Declaration', authority: 'IRS Tax Withholding Compliance', tip: 'Nonresident aliens submit Form W-8BEN to claim statutory tax treaty benefits on banking interest.', statuses: ['all'] },
        { id: 'us-doc-credit-builder', name: 'CFPB Secured Credit Card Deposit ($300–$500)', authority: 'CFPB Credit Establishment', tip: 'Deposit cash collateral into a secured credit card (Capital One, Discover) to establish FICO score from zero.', statuses: ['all'] },
        { id: 'us-doc-fincen-fbar', name: 'FinCEN Form 114 (FBAR) Foreign Bank Account Tracking', authority: 'FinCEN / US Treasury', tip: 'Keep records of overseas accounts if aggregate balance exceeds USD $10,000 at any time during calendar year.', statuses: ['pr', 'work_permit'] }
      ]
    },
    {
      category: '4. USCIS Form I-9 Employment Verification',
      items: [
        { id: 'us-doc-i9-list-a', name: 'Form I-9 List A Document (EAD Card / Foreign Passport + I-94)', authority: 'USCIS Employment Eligibility Verification', tip: 'Establishes both identity and employment authorization simultaneously within 3 business days of hire.', statuses: ['work_permit', 'student'] },
        { id: 'us-doc-i9-everify', name: 'E-Verify Case Verification Confirmation', authority: 'DHS / SSA Joint Verification', tip: 'Participating employers confirm work authorization electronically without retaining identity documents.', statuses: ['work_permit', 'pr'] }
      ]
    },
    {
      category: '5. State DMV Real ID Driver Licensing',
      items: [
        { id: 'us-doc-dmv-residence', name: 'Two Proofs of State Residential Address', authority: 'State DMV Real ID Standards', tip: 'Residential lease, utility bill, bank statement, or renters insurance policy.', statuses: ['all'] },
        { id: 'us-doc-dmv-presence', name: 'Proof of Lawful US Presence & SSN Card', authority: 'REAL ID Act of 2005', tip: 'Foreign passport with valid I-94 stamp plus physical Social Security Card or SSA-L676 ineligibility letter.', statuses: ['all'] }
      ]
    },
    {
      category: '6. K-12 Universal Public School Enrollment (Plyler v. Doe)',
      items: [
        { id: 'us-doc-school-birth', name: 'Child Original Birth Certificate or Passport', authority: 'US Supreme Court Plyler v. Doe', tip: 'Proof of age. Schools cannot request immigration status, green cards, or Social Security numbers.', statuses: ['all'] },
        { id: 'us-doc-school-vaccine', name: 'State Childhood Immunization & Health Exam Record', authority: 'State Dept of Public Health', tip: 'Mandatory vaccinations (DTaP, Polio, MMR, Varicella, Hepatitis B) certified on state health forms.', statuses: ['all'] }
      ]
    }
  ],
  'United Kingdom': [
    {
      category: '1. UK Legal Status & eVisa / BRP Verification',
      items: [
        { id: 'uk-doc-passport', name: 'Valid Passport with Entry Vignette', authority: 'UK Visas and Immigration (UKVI)', tip: 'Original 90-day vignette stamped by Border Force upon entry to activate visa.', statuses: ['all'] },
        { id: 'uk-doc-evisa', name: 'UKVI Digital eVisa / BRP Card Collection', authority: 'Home Office Digital Status', tip: 'Collect physical Biometric Residence Permit (BRP) from designated Post Office within 10 days, or link UKVI account.', statuses: ['all'] }
      ]
    },
    {
      category: '2. DWP National Insurance Number (NIN) KYC',
      items: [
        { id: 'uk-doc-nin', name: 'DWP National Insurance Number Application', authority: 'Department for Work and Pensions', tip: 'Apply online via GOV.UK. You have a statutory right to begin working immediately before NIN is issued.', statuses: ['work_permit', 'pr'] }
      ]
    },
    {
      category: '3. NHS Free Primary Healthcare GP Registration',
      items: [
        { id: 'uk-doc-gp-gms1', name: 'NHS GP Registration Form (GMS1)', authority: 'NHS England / Primary Care', tip: 'Register at your nearest local GP surgery. Proof of address or immigration status cannot be demanded.', statuses: ['all'] },
        { id: 'uk-doc-ihs', name: 'Immigration Health Surcharge (IHS) Payment Reference', authority: 'Home Office / NHS Access', tip: 'Grants full access to secondary hospital care on the same basis as permanent UK residents.', statuses: ['all'] }
      ]
    },
    {
      category: '4. FCA Retail Banking & Right to Rent Proof',
      items: [
        { id: 'uk-doc-bank-poa', name: 'FCA Basic Bank Account Proof of Address Bundle', authority: 'Financial Conduct Authority', tip: 'Tenancy agreement, council tax demand, or letter from university/employer plus valid passport/BRP.', statuses: ['all'] },
        { id: 'uk-doc-right-to-rent', name: 'Home Office Digital Right to Rent Share Code', authority: 'Immigration Act 2014', tip: 'Landlords verify tenancy eligibility via GOV.UK share code without confiscating biometric cards.', statuses: ['all'] },
        { id: 'uk-doc-tds-receipt', name: 'Tenancy Deposit Protection (TDP) Certificate & 5-Week Cap', authority: 'Tenant Fees Act 2019', tip: 'Landlords must protect deposits in DPS, MyDeposits, or TDS within 30 days and provide Prescribed Information.', statuses: ['all'] }
      ]
    },
    {
      category: '5. Home Office Digital Right to Work Verification',
      items: [
        { id: 'uk-doc-rtw-sharecode', name: 'Digital Right to Work 9-Character Share Code', authority: 'Home Office Online RTW Checking', tip: 'Generate at gov.uk/prove-right-to-work. Provides employer with a statutory excuse against civil penalties.', statuses: ['work_permit', 'student', 'pr'] }
      ]
    }
  ],
  'Australia': [
    {
      category: '1. Australian Visa Grant & VEVO Verification',
      items: [
        { id: 'au-doc-passport', name: 'Current Foreign Passport', authority: 'Australian Border Force (ABF)', tip: 'Must remain valid throughout stay in Australia.', statuses: ['all'] },
        { id: 'au-doc-vevo', name: 'Home Affairs VEVO Visa Grant Notification', authority: 'Department of Home Affairs', tip: 'Details Subclass (189/190/482/500), visa conditions (8105, 8501), and expiry dates.', statuses: ['all'] }
      ]
    },
    {
      category: '2. ATO Tax File Number (TFN) Issuance',
      items: [
        { id: 'au-doc-tfn', name: 'ATO Online Tax File Number Registration', authority: 'Australian Taxation Office', tip: 'Apply online after arrival. Provide TFN to employer within 28 days to prevent top marginal tax withholding.', statuses: ['work_permit', 'student', 'pr'] }
      ]
    },
    {
      category: '3. Services Australia Medicare Public Health Enrollment',
      items: [
        { id: 'au-doc-medicare-ms004', name: 'Medicare Enrollment Form (MS004)', authority: 'Services Australia', tip: 'Submit with passport and visa grant notice. Covers PR, applicants for PR, and reciprocal RHCA countries.', statuses: ['all'] }
      ]
    },
    {
      category: '4. AUSTRAC 100-Point Banking KYC Check',
      items: [
        { id: 'au-doc-bank-100pt', name: 'AUSTRAC 100-Point Identity Bundle', authority: 'AUSTRAC Anti-Money Laundering', tip: 'Foreign passport (70 pts) + Australian Driver Licence or lease (40 pts) + Medicare card (25 pts) = 135 pts.', statuses: ['all'] },
        { id: 'au-doc-rbo-bond', name: 'State Rental Bond Online (RBO) Lodgement Receipt', authority: 'State Tenancy Authorities (e.g. NSW Fair Trading)', tip: 'Bonds are capped at 4 weeks rent and must be lodged directly with state authority, not held privately.', statuses: ['all'] }
      ]
    }
  ],
  'Germany': [
    {
      category: '1. German National Visa & Residence Title KYC',
      items: [
        { id: 'de-doc-passport', name: 'Valid Passport with German National Visa Type D', authority: 'Federal Foreign Office / BAMF', tip: 'Must be stamped by Bundespolizei on entry to activate residency period.', statuses: ['all'] },
        { id: 'de-doc-bluecard', name: 'EU Blue Card / Aufenthaltskarte Approval', authority: 'Ausländerbehörde (Immigration Office)', tip: 'Physical residence card issued with explicit employment permission (Erwerbstätigkeit gestattet).', statuses: ['work_permit', 'pr'] }
      ]
    },
    {
      category: '2. Bürgeramt Anmeldung & Steuer-ID Registration',
      items: [
        { id: 'de-doc-anmeldung', name: 'Wohnungsgeberbestätigung (Landlord Confirmation Certificate)', authority: 'Federal Act on Registration (BMG s.19)', tip: 'Mandatory certificate signed by landlord. Must register address at Bürgeramt within 14 days of move-in.', statuses: ['all'] },
        { id: 'de-doc-steuer-id', name: 'BZSt Tax Identification Number (Steuerliche Identifikationsnummer)', authority: 'Federal Central Tax Office (BZSt)', tip: 'Automatically generated and posted to registered address following Bürgeramt Anmeldung.', statuses: ['all'] }
      ]
    },
    {
      category: '3. Statutory Health Insurance GKV Enrollment',
      items: [
        { id: 'de-doc-gkv', name: 'GKV Membership Certificate (Mitgliedsbescheinigung)', authority: 'Statutory Health Insurance (TK / AOK / Barmer)', tip: 'Mandatory for all employees. Contributions are split 50/50 between employer and employee.', statuses: ['all'] }
      ]
    },
    {
      category: '4. BaFin Retail Banking & Mietkaution Escrow',
      items: [
        { id: 'de-doc-girokonto', name: 'BaFin Basiskonto / Girokonto Banking KYC', authority: 'Federal Financial Supervisory Authority (BaFin)', tip: 'Present passport, Meldebescheinigung address certificate, and Steuer-ID.', statuses: ['all'] },
        { id: 'de-doc-kaution', name: 'Mietkaution 3-Month Installment Agreement & Escrow Account', authority: 'German Civil Code BGB Section 551', tip: 'Statutory right to pay maximum 3 net cold rents in 3 equal monthly installments into segregated Kautionskonto.', statuses: ['all'] }
      ]
    }
  ],
  'United Arab Emirates': [
    {
      category: '1. UAE Entry Permit & Residence Visa KYC',
      items: [
        { id: 'ae-doc-visa', name: 'Electronic Entry Permit / Golden Visa Approval', authority: 'Federal Authority for Identity & Citizenship (ICP)', tip: '10-Year Golden Visa or employer-sponsored entry permit stamped at airport immigration.', statuses: ['all'] },
        { id: 'ae-doc-medical', name: 'DHA / SEHA Medical Fitness & Blood Test Certificate', authority: 'Ministry of Health & Prevention', tip: 'Mandatory screening for communicable diseases prior to residence visa stamping.', statuses: ['all'] }
      ]
    },
    {
      category: '2. ICP Mandatory Emirates ID Card',
      items: [
        { id: 'ae-doc-eid', name: 'Emirates ID Biometric Card & ICP Registration', authority: 'ICP UAE Federal Standards', tip: 'Primary legal identity card for all public, private, and banking services across the Emirates.', statuses: ['all'] }
      ]
    },
    {
      category: '3. MOHRE Labour Contract & Central Bank WPS Banking',
      items: [
        { id: 'ae-doc-mohre', name: 'Standard MOHRE Electronic Employment Contract', authority: 'Ministry of Human Resources and Emiratisation', tip: 'Official tripartite contract governing employment conditions and gratuity entitlements.', statuses: ['work_permit'] },
        { id: 'ae-doc-wps', name: 'Central Bank Wages Protection System (WPS) Account', authority: 'Central Bank of the UAE', tip: 'Mandatory payroll account ensuring statutory salary transfer and compliance monitoring.', statuses: ['all'] }
      ]
    },
    {
      category: '4. DLD Ejari Tenancy Contract & RERA Index',
      items: [
        { id: 'ae-doc-ejari', name: 'Dubai Land Department Ejari Certificate', authority: 'Real Estate Regulatory Agency (RERA)', tip: 'Mandatory tenancy registration required to activate DEWA utility services and sponsor family visas.', statuses: ['all'] }
      ]
    }
  ],
  'New Zealand': [
    {
      category: '1. New Zealand Visa & Immigration KYC',
      items: [
        { id: 'nz-doc-visa', name: 'Immigration New Zealand eVisa Approval Letter', authority: 'Immigration New Zealand (INZ)', tip: 'Details visa conditions under SMC, AEWV, or partnership streams.', statuses: ['all'] }
      ]
    },
    {
      category: '2. Inland Revenue IRD Number KYC',
      items: [
        { id: 'nz-doc-ird', name: 'Inland Revenue IRD Tax Number Confirmation', authority: 'Inland Revenue Department (IRD)', tip: 'Apply online with active New Zealand bank account and foreign passport.', statuses: ['all'] }
      ]
    },
    {
      category: '3. ACC Universal Injury Cover & Public Health',
      items: [
        { id: 'nz-doc-acc', name: 'Universal ACC 24/7 No-Fault Injury Protection', authority: 'Accident Compensation Corporation', tip: 'Universal coverage for personal accidents. GP registration through local PHO for subsidized visits.', statuses: ['all'] }
      ]
    },
    {
      category: '4. Tenancy Services 4-Week Bond Lodgement',
      items: [
        { id: 'nz-doc-bond', name: 'MBIE Tenancy Services Bond Lodgement Receipt', authority: 'Ministry of Business, Innovation and Employment', tip: 'Statutory 4-week bond cap lodged directly with MBIE within 23 working days.', statuses: ['all'] }
      ]
    }
  ],
  'Ireland': [
    {
      category: '1. Irish Immigration & Employment Permit KYC',
      items: [
        { id: 'ie-doc-csep', name: 'DETE Critical Skills Employment Permit (CSEP)', authority: 'Department of Enterprise, Trade and Employment', tip: 'Fast-tracks from Stamp 1 to permanent Stamp 4 residency after 21 months.', statuses: ['work_permit'] },
        { id: 'ie-doc-irp', name: 'Irish Residence Permit (IRP) Registration Card', authority: 'Immigration Service Delivery (ISD)', tip: 'Mandatory biometric registration at Burgh Quay or local Garda immigration office.', statuses: ['all'] }
      ]
    },
    {
      category: '2. DSP Personal Public Service (PPS) Number',
      items: [
        { id: 'ie-doc-pps', name: 'DSP PPS Number Allocation Confirmation', authority: 'Department of Social Protection', tip: 'Apply via MyWelfare.ie with passport, proof of Irish address, and job offer.', statuses: ['all'] }
      ]
    },
    {
      category: '3. Central Bank EU Basic Bank Account & RTB Tenancy',
      items: [
        { id: 'ie-doc-bank', name: 'Fee-Free Basic Payment Account Bundle', authority: 'Central Bank of Ireland / EU Regulations', tip: 'Statutory right to a basic current account with passport, proof of address, and PPSN.', statuses: ['all'] },
        { id: 'ie-doc-rtb', name: 'Residential Tenancies Board (RTB) Registered Tenancy', authority: 'Residential Tenancies Board', tip: 'Landlords must register tenancy. One-month deposit cap and 2% RPZ rent increase limit.', statuses: ['all'] }
      ]
    }
  ],
  'Singapore': [
    {
      category: '1. MOM Employment Pass (EP) & COMPASS Framework',
      items: [
        { id: 'sg-doc-ipa', name: 'MOM In-Principle Approval (IPA) Letter', authority: 'Ministry of Manpower (MOM)', tip: 'Pre-approved single-entry pass valid for entry into Singapore.', statuses: ['all'] },
        { id: 'sg-doc-compass', name: 'COMPASS Points & Qualification Verification (DataFlow)', authority: 'MOM COMPASS Framework', tip: 'Mandatory 40-point verification with authenticated educational credentials.', statuses: ['work_permit'] }
      ]
    },
    {
      category: '2. Singpass & National FIN Registration',
      items: [
        { id: 'sg-doc-singpass', name: 'Singpass Digital Identity Setup (MyInfo)', authority: 'Government Technology Agency (GovTech)', tip: 'Access all government digital portals and instant banking KYC.', statuses: ['all'] }
      ]
    },
    {
      category: '3. CPF Central Provident Fund & MediShield Life',
      items: [
        { id: 'sg-doc-cpf', name: 'CPF Board Statutory Social Security Account', authority: 'Central Provident Fund Board', tip: 'Mandatory for Singapore Citizens and Permanent Residents (PRs).', statuses: ['pr'] }
      ]
    },
    {
      category: '4. URA Tenancy Protections & 3-Month Minimum Term',
      items: [
        { id: 'sg-doc-ura', name: 'URA Compliant Residential Tenancy Agreement', authority: 'Urban Redevelopment Authority (URA)', tip: 'Minimum 3 months continuous rental for private residential; diplomatic clause for >1 year.', statuses: ['all'] }
      ]
    }
  ],
  'France': [
    {
      category: '1. Passeport Talent & OFII Residence Tax KYC',
      items: [
        { id: 'fr-doc-talent', name: 'Passeport Talent / Salarié Qualifié VLS-TS', authority: 'Ministère de l’Intérieur (DGEF)', tip: 'Long-stay visa equivalent to residence permit for qualified skilled employees.', statuses: ['all'] },
        { id: 'fr-doc-ofii', name: 'OFII Online Validation & Tax Stamp (Timbre Fiscal)', authority: 'Office Français de l’Immigration et de l’Intégration', tip: 'Mandatory online confirmation within 3 months of arrival in France.', statuses: ['all'] }
      ]
    },
    {
      category: '2. Assurance Maladie & Carte Vitale Health KYC',
      items: [
        { id: 'fr-doc-vitale', name: 'Numéro de Sécurité Sociale (NIR) & Carte Vitale', authority: 'Caisse Primaire d’Assurance Maladie (CPAM)', tip: 'Universal healthcare coverage (PUMA) reimbursing 70% of medical fees.', statuses: ['all'] }
      ]
    },
    {
      category: '3. French Banking KYC & Loi ALUR Tenancy',
      items: [
        { id: 'fr-doc-rib', name: 'Relevé d’Identité Bancaire (RIB) Bank Account', authority: 'Banque de France / SEPA', tip: 'Essential for salary direct deposit, CPAM reimbursements, and utilities.', statuses: ['all'] },
        { id: 'fr-doc-alur', name: 'Loi ALUR Tenancy Contract & 1-Month Deposit Cap', authority: 'Ministère du Logement', tip: 'Unfurnished rental deposit capped strictly at 1 month cold rent.', statuses: ['all'] }
      ]
    }
  ],
  'Netherlands': [
    {
      category: '1. IND Highly Skilled Migrant (Kennismigrant) KYC',
      items: [
        { id: 'nl-doc-ind', name: 'IND Residence Permit Approval Letter', authority: 'Immigratie- en Naturalisatiedienst (IND)', tip: 'Authorizes work for recognized sponsor employer with 30% tax ruling eligibility.', statuses: ['all'] }
      ]
    },
    {
      category: '2. Gemeente BSN & DigiD Digital Identity',
      items: [
        { id: 'nl-doc-bsn', name: 'BSN (Burgerservicenummer) Municipal Registration', authority: 'Gemeente (Municipal Administration)', tip: 'Mandatory registration within 5 days of arrival; unlocks all Dutch services.', statuses: ['all'] },
        { id: 'nl-doc-digid', name: 'DigiD Government Login Authentication', authority: 'Logius / Dutch Government', tip: 'Secure digital key for tax authority (Belastingdienst) and healthcare.', statuses: ['all'] }
      ]
    },
    {
      category: '3. Mandatory Basisverzekering & Huurcommissie Tenancy',
      items: [
        { id: 'nl-doc-health', name: 'Basisverzekering Standard Dutch Health Policy', authority: 'Zorginstituut Nederland', tip: 'Mandatory within 4 months of arrival; standard package with chosen insurer.', statuses: ['all'] },
        { id: 'nl-doc-huur', name: 'Huurcommissie WWS Rent Point Regulated Lease', authority: 'Huurcommissie (Rent Tribunal)', tip: 'Rental deposit capped at 2 months bare rent under 2024 legislation.', statuses: ['all'] }
      ]
    }
  ],
  'Sweden': [
    {
      category: '1. Migrationsverket Residence & Work Permit KYC',
      items: [
        { id: 'se-doc-permit', name: 'Migrationsverket Work & Residence Permit Card', authority: 'Migrationsverket (Swedish Migration Agency)', tip: 'Biometric card tied to certified Swedish employment terms.', statuses: ['all'] }
      ]
    },
    {
      category: '2. Skatteverket Personnummer & BankID KYC',
      items: [
        { id: 'se-doc-personnummer', name: 'Skatteverket 10-Digit Personnummer Registration', authority: 'Skatteverket (Swedish Tax Agency)', tip: 'Foundation of all civic life, banking, and medical services in Sweden.', statuses: ['all'] },
        { id: 'se-doc-bankid', name: 'Mobile BankID Electronic Signature', authority: 'Finansiell ID-Teknik / Swedish Banks', tip: 'Universal digital verification used across private banks and public portals.', statuses: ['all'] }
      ]
    },
    {
      category: '3. Försäkringskassan Social Insurance & Rent Control',
      items: [
        { id: 'se-doc-forsk', name: 'Försäkringskassan Social Insurance Enrollment', authority: 'Försäkringskassan', tip: 'Covers parental benefits, sickness insurance, and subsidized healthcare.', statuses: ['all'] },
        { id: 'se-doc-hyres', name: 'Hyresnämnden Regulated Bruksvärde Lease', authority: 'Hyresnämnden (Rent Tribunal)', tip: 'Protects against unreasonable sublet rents; excess recoverable up to 2 years.', statuses: ['all'] }
      ]
    }
  ],
  'Spain': [
    {
      category: '1. NIE & TIE Tarjeta de Identidad de Extranjero KYC',
      items: [
        { id: 'es-doc-tie', name: 'TIE Biometric Card & NIE Certificate', authority: 'Policía Nacional / Extranjería', tip: 'Physical identity card proving legal residency under Digital Nomad or Work visa.', statuses: ['all'] }
      ]
    },
    {
      category: '2. Empadronamiento & Social Security (INSS)',
      items: [
        { id: 'es-doc-padron', name: 'Certificado de Empadronamiento Municipal', authority: 'Ayuntamiento (City Town Hall)', tip: 'Official registration of residential address required for healthcare and schooling.', statuses: ['all'] },
        { id: 'es-doc-ssn', name: 'Número de la Seguridad Social (NAF)', authority: 'Instituto Nacional de la Seguridad Social (INSS)', tip: 'Unlocks public employment, contributions, and universal healthcare.', statuses: ['all'] }
      ]
    },
    {
      category: '3. Sistema Nacional de Salud & LAU Tenancy',
      items: [
        { id: 'es-doc-tarjeta', name: 'Tarjeta Sanitaria Individual (TSI) Health Card', authority: 'Servicio de Salud Autonómico', tip: 'Free public healthcare at local Centro de Salud.', statuses: ['all'] },
        { id: 'es-doc-lau', name: 'Contrato de Arrendamiento LAU & 1-Month Fianza', authority: 'Ley de Arrendamientos Urbanos (LAU)', tip: 'Security deposit capped at 1 month fianza; agency fees paid by landlord by law.', statuses: ['all'] }
      ]
    }
  ]
};

// Port-of-Entry Airport Survival Kits
export const AIRPORT_KITS = {
  'Canada': {
    airports: 'Toronto Pearson (YYZ), Vancouver (YVR), Montréal-Trudeau (YUL)',
    customsForm: 'CBSA Form E677 (Cross-Border Currency Declaration)',
    customsLimit: 'CAD $10,000 (Mandatory declaration of cash, bank drafts, and negotiable instruments under PCMLTFA s.12)',
    customsPenalty: 'Failure to declare carries customs seizures and statutory penalties from $250 up to $5,000.',
    emergency: [
      { num: '911', desc: 'Police, Fire, Ambulance Emergency' },
      { num: '211', desc: 'Settlement & Community Services' },
      { num: '811', desc: 'Telehealth Registered Nurse Advice' }
    ],
    borderRights: [
      'CBSA officers verify your Confirmation of Permanent Residence (COPR) or Letter of Introduction for study/work permit.',
      'Secondary inspection is standard for initial permit printing; this is normal procedure, not a detention.',
      'You are legally entitled to professional interpretation if you are not fluent in English or French.'
    ],
    first48: [
      'Connect to Free Airport Wi-Fi: Connect to "Toronto Pearson Wi-Fi" or "YVR-Free-WiFi" without requiring an SMS OTP.',
      'Airport Transit: Take the UP Express at YYZ Terminal 1 into Union Station ($12.35 tap debit/credit) or SkyTrain Canada Line at YVR ($5 YVR AddFare).',
      'Original Documents: Always carry passports, COPR, lease agreements, and medical records in hand luggage. Never check them in.'
    ]
  },
  'United States': {
    airports: 'New York (JFK), Chicago O’Hare (ORD), Los Angeles (LAX), San Francisco (SFO)',
    customsForm: 'FinCEN Form 105 (Report of International Transportation of Currency)',
    customsLimit: 'USD $10,000 (Mandatory for combined cash, traveler’s checks, and money orders under 31 U.S.C. 5316)',
    customsPenalty: 'Failure to report can result in civil forfeiture of funds and criminal penalties.',
    emergency: [
      { num: '911', desc: 'Police, Fire, Medical Emergency' },
      { num: '311', desc: 'Municipal Non-Emergency & City Services' }
    ],
    borderRights: [
      'CBP officers verify visa status and generate your electronic Form I-94 arrival record.',
      'Check your Form I-94 online at i94.cbp.dhs.gov within 24 hours to confirm correct admit-until date and visa classification.',
      'Officers can inspect electronic devices subject to DHS directive 3340-049A.'
    ],
    first48: [
      'Free Airport Wi-Fi: Connect to "_Free JFK WiFi" or "Boingo Hotspot" at terminals.',
      'Local Transit: Tap any contactless debit/credit card on OMNY turnstiles (New York Subway) or buy Ventra card in Chicago.',
      'Social Security Number (SSN): If not checked on DS-260, visit an SSA office with passport and Form I-94 after 10 days.'
    ]
  },
  'United Kingdom': {
    airports: 'London Heathrow (LHR), London Gatwick (LGW), Manchester (MAN)',
    customsForm: 'HMRC Form C9011 (Cash Declaration)',
    customsLimit: 'GBP £10,000 (Mandatory declaration when carrying £10k or more into or out of Great Britain)',
    customsPenalty: 'Undeclared cash can be seized by Border Force under the Proceeds of Crime Act.',
    emergency: [
      { num: '999', desc: 'Emergency Police, Fire, Ambulance' },
      { num: '111', desc: 'NHS Free Non-Emergency Health Advice' },
      { num: '101', desc: 'Police Non-Emergency Assistance' }
    ],
    borderRights: [
      'Eligible e-Passport holders (US, AU, NZ, CA, EU, etc.) may use ePassport gates at major terminals.',
      'Skilled workers must carry their Certificate of Sponsorship (CoS) reference number.',
      'Border officers confirm eVisa access code or vignette endorsement.'
    ],
    first48: [
      'Free Airport Wi-Fi: Select "_Heathrow Wi-Fi" for 4 hours of fast complimentary access.',
      'Airport Transit: Use the Elizabeth line or Piccadilly line into Central London. Tap any contactless card directly at fare gates.',
      'BRP Collection: If issued a vignette, collect your Biometric Residence Permit from designated Post Office within 10 days.'
    ]
  },
  'Australia': {
    airports: 'Sydney Kingsford Smith (SYD), Melbourne Tullamarine (MEL), Brisbane (BNE)',
    customsForm: 'AU Border Force Currency Declaration & Incoming Passenger Card (IPC)',
    customsLimit: 'AUD $10,000 (Mandatory declaration under AML/CTF Act 2006)',
    customsPenalty: 'Severe biosecurity on-the-spot fines up to $6,260 for undeclared plant, animal, or food items.',
    emergency: [
      { num: '000', desc: 'Triple Zero National Emergency' },
      { num: '131 450', desc: 'TIS National Translating & Interpreting Service' }
    ],
    borderRights: [
      'All visas are electronic (VEVO). SmartGate automated border clearance is available for eligible biometric passports.',
      'Biosecurity officers inspect luggage with detector dogs for all agricultural items and organic food.',
      'Secondary questioning ensures your visa conditions (such as work or study hour limits) are understood.'
    ],
    first48: [
      'Free Airport Wi-Fi: Connect to "-Free SYD WiFi-" across international terminals.',
      'Transit Cards: Buy an Opal card at Sydney Airport train station, or myki card at Melbourne Airport bus hub.',
      'Tax File Number (TFN): Apply online via ATO website once physically located inside Australia.'
    ]
  },
  'Germany': {
    airports: 'Frankfurt (FRA), Munich (MUC), Berlin Brandenburg (BER)',
    customsForm: 'EU Cash Declaration Form (Bargeldanmeldung)',
    customsLimit: 'EUR €10,000 (Mandatory declaration of cash and securities entering from non-EU countries)',
    customsPenalty: 'Violations constitute administrative offenses under Section 31a Zollverwaltungsgesetz with fines up to €1,000,000.',
    emergency: [
      { num: '112', desc: 'European Universal Emergency (Fire / Ambulance)' },
      { num: '110', desc: 'German Police Emergency' },
      { num: '116 117', desc: 'Statutory On-Call Medical Assistance' }
    ],
    borderRights: [
      'Bundespolizei verifies entry visa, Chancenkarte, or Blue Card approval.',
      'Proof of accommodation (Wohnungsgeberbestätigung or temporary booking) and statutory health insurance certificate may be requested.'
    ],
    first48: [
      'Free Airport Wi-Fi: Connect to "Fraport Free WiFi" for 24-hour high-speed internet.',
      'Public Transit: Buy S-Bahn ticket (e.g. S8 / S9 in Frankfurt) or regional DB train ticket at airport station.',
      'Anmeldung: Schedule Bürgeramt appointment within 14 days of moving into permanent accommodation.'
    ]
  },
  'United Arab Emirates': {
    airports: 'Dubai International (DXB), Zayed International Abu Dhabi (AUH)',
    customsForm: 'UAE Customs Currency Declaration Form (Afsah)',
    customsLimit: 'AED 60,000 (Mandatory declaration for travelers over 18 years carrying AED 60,000 or foreign equivalent)',
    customsPenalty: 'Undeclared currency is subject to seizure and inquiry under UAE Anti-Money Laundering legislation.',
    emergency: [
      { num: '999', desc: 'Dubai / UAE Police Emergency' },
      { num: '998', desc: 'Ambulance Emergency' },
      { num: '800 5111', desc: 'Amer / GDRFA Immigration Helpline' }
    ],
    borderRights: [
      'Immigration officers stamp entry permit. Eligible passports use Smart Gates.',
      'Free 1GB tourist eSIM is provided at Dubai immigration counters for arriving adult visitors.'
    ],
    first48: [
      'Free Airport Wi-Fi: Connect to "DXB Free WiFi" across all terminals.',
      'Airport Transit: Buy a Silver Nol card at Dubai Metro Terminal 1 or 3 stations.',
      'Medical & Emirates ID: Complete blood test / chest X-ray and biometric capture for Emirates ID card.'
    ]
  },
  'New Zealand': {
    airports: 'Auckland (AKL), Wellington (WLG), Christchurch (CHC)',
    customsForm: 'NZ Border Cash Report (BCR) & Passenger Arrival Card',
    customsLimit: 'NZD $10,000 (Mandatory declaration under AML/CFT Act 2009)',
    customsPenalty: 'Instant $400 infringement fine for undeclared biosecurity risk goods (fruit, hiking boots, honey, wooden items).',
    emergency: [
      { num: '111', desc: 'Emergency Services (Police, Ambulance, Fire)' },
      { num: '0800 611 116', desc: 'Healthline 24/7 Free Advice' }
    ],
    borderRights: [
      'Immigration New Zealand verifies your electronic visa or NZeTA.',
      'Strict biosecurity screening with x-ray and sniffer dogs for all arrivals.'
    ],
    first48: [
      'Free Airport Wi-Fi: Connect to "AucklandAirport-Free" for 2 hours complimentary access.',
      'Public Transit: Buy an AT HOP card at Auckland Airport terminal convenience stores.',
      'Apply for an IRD number online via Inland Revenue with your passport and NZ bank account.'
    ]
  },
  'Ireland': {
    airports: 'Dublin (DUB), Shannon (SNN)',
    customsForm: 'EU Cash Declaration Form',
    customsLimit: 'EUR €10,000 (Mandatory declaration for cash or negotiable drafts from outside the EU)',
    customsPenalty: 'Undeclared cash can be seized by Revenue Commissioners under Criminal Justice Act 1994.',
    emergency: [
      { num: '112 / 999', desc: 'National Emergency Services' },
      { num: '0818 22 44 77', desc: 'Citizens Information Helpline' }
    ],
    borderRights: [
      'Border Management Unit (BMU) officers examine passports. Non-EEA arrivals receive a landing stamp with initial permission to remain (typically 90 days).',
      'You must register with Immigration Service Delivery (ISD) to receive your Irish Residence Permit (IRP) card.'
    ],
    first48: [
      'Free Airport Wi-Fi: Connect to "Dublin Airport Free WiFi" throughout Terminal 1 & 2.',
      'Airport Transit: Dublin Express (routes 782/784) or Dublin Bus into city centre. Buy a Leap Card at terminal shops.',
      'PPS Number: Apply online via MyWelfare.ie after moving into accommodation.'
    ]
  },
  'Singapore': {
    airports: 'Singapore Changi (SIN)',
    customsForm: 'Form NP 727 (Physical cash declaration) & SG Arrival Card (Online)',
    customsLimit: 'SGD $20,000 (Mandatory declaration for physical currency or bearer instruments)',
    customsPenalty: 'Failure to declare carries fine up to SGD $50,000 and/or imprisonment up to 3 years under CDSA.',
    emergency: [
      { num: '999', desc: 'Police Emergency' },
      { num: '995', desc: 'SCDF Fire & Ambulance' },
      { num: '1777', desc: 'Non-Emergency Ambulance' }
    ],
    borderRights: [
      'Present In-Principle Approval (IPA) letter and valid passport at ICA border gates.',
      'Submit the mandatory SG Arrival Card with health declaration online within 3 days before touchdown.'
    ],
    first48: [
      'Free Airport Wi-Fi: Connect to "#WiFi@Changi" across all 4 passenger terminals.',
      'Airport Transit: Take MRT East West Line (green) from Changi Airport MRT Station (CG2). Simply tap contactless Mastercard/Visa.',
      'Complete biometric pass card registration at MOM Employment Pass Services Centre (EPSC).'
    ]
  },
  'France': {
    airports: 'Paris Charles de Gaulle (CDG), Paris Orly (ORY), Nice (NCE)',
    customsForm: 'Cerfa 13426 (Déclaration d’argent liquide)',
    customsLimit: 'EUR €10,000 (Mandatory declaration entering or leaving the European Union)',
    customsPenalty: 'Undeclared cash subject to 50% confiscation and customs penalty under Code des Douanes.',
    emergency: [
      { num: '112', desc: 'European Emergency Hotline' },
      { num: '15', desc: 'SAMU (Emergency Medical)' },
      { num: '17', desc: 'Police Secours' },
      { num: '18', desc: 'Sapeurs-Pompiers (Fire & Rescue)' }
    ],
    borderRights: [
      'Border Police (PAF) stamp your VLS-TS visa. Keep employment contract and accommodation address accessible.',
      'Must complete the online OFII validation within 3 months of landing.'
    ],
    first48: [
      'Free Airport Wi-Fi: Connect to "WIFI-AIRPORT" at Charles de Gaulle and Orly.',
      'Airport Transit: RER B suburban rail connects CDG directly to central Paris (Gare du Nord, Châtelet-Les Halles). Buy Navigo pass.',
      'Validate your visa online on the OFII portal and pay the statutory residence tax stamp.'
    ]
  },
  'Netherlands': {
    airports: 'Amsterdam Airport Schiphol (AMS), Eindhoven (EIN)',
    customsForm: 'Aangifte van liquide middelen (EU Cash Declaration)',
    customsLimit: 'EUR €10,000 (Mandatory customs declaration for cash or securities)',
    customsPenalty: 'Fines and potential criminal prosecution under Dutch Financial Supervision Act.',
    emergency: [
      { num: '112', desc: 'National Emergency Number' },
      { num: '0900-8844', desc: 'Police Non-Emergency Hotline' }
    ],
    borderRights: [
      'Royal Marechaussee border control checks IND approval letter and passport.',
      'You are granted entry to register at your local municipality (Gemeente) to obtain your BSN.'
    ],
    first48: [
      'Free Airport Wi-Fi: Connect to "Airport_Free_Wifi" at Schiphol Airport.',
      'Airport Transit: Direct NS passenger trains depart from platform beneath Schiphol Plaza to Amsterdam Centraal in 14 minutes. Tap in/out with OVpay.',
      'Attend booked Gemeente appointment for BSN assignment and biometrics collection.'
    ]
  },
  'Sweden': {
    airports: 'Stockholm Arlanda (ARN), Gothenburg Landvetter (GOT)',
    customsForm: 'Tullverket Cash Declaration Form',
    customsLimit: 'EUR €10,000 or equivalent in SEK (approx. SEK 115,000)',
    customsPenalty: 'Fines and seizure under Swedish Customs Powers Act.',
    emergency: [
      { num: '112', desc: 'SOS Alarm Emergency' },
      { num: '114 14', desc: 'Police Non-Emergency' },
      { num: '1177', desc: 'Healthcare Advice Service' }
    ],
    borderRights: [
      'Swedish Police Authority checks biometric residence permit card or decision letter.',
      'Entry granted for employment, study, or residence.'
    ],
    first48: [
      'Free Airport Wi-Fi: Connect to "Airport-Guest" at Arlanda Airport.',
      'Airport Transit: Take Arlanda Express (high-speed train to Stockholm Central in 18 minutes) or Pendeltåg commuter train line 40. Buy SL ticket.',
      'Visit local Skatteverket service centre to apply for Swedish Personnummer in the population register.'
    ]
  },
  'Spain': {
    airports: 'Madrid-Barajas (MAD), Barcelona-El Prat (BCN), Málaga (AGP)',
    customsForm: 'Formulario S-1 (Declaración de movimiento de medios de pago)',
    customsLimit: 'EUR €10,000 (Mandatory declaration for inbound travellers outside Spain)',
    customsPenalty: 'Fines from €600 up to 50% of the value of undeclared funds under Law 10/2010.',
    emergency: [
      { num: '112', desc: 'Emergency Coordination' },
      { num: '091', desc: 'Policía Nacional' },
      { num: '062', desc: 'Guardia Civil' },
      { num: '061', desc: 'Urgencias Médicas' }
    ],
    borderRights: [
      'Policía Nacional inspects foreign passport, entry visa, and return/onward itinerary.',
      'Must book a Cita Previa online at extranjería for your physical TIE fingerprint card within 30 days.'
    ],
    first48: [
      'Free Airport Wi-Fi: Connect to "Airport_Free_Wifi_AENA" across all Spanish airports.',
      'Airport Transit: Metro Line 8 connects Barajas Airport directly to Nuevos Ministerios in central Madrid. In Barcelona, take Aerobús (A1/A2) or Metro L9 Sud.',
      'Obtain Certificado de Empadronamiento from local Ayuntamiento town hall.'
    ]
  }
};

// 90-Day Relocation Cashflow & Financial Runway Engine
export const CITY_FINANCIAL_BENCHMARKS = {
  'Toronto': {
    currency: 'CAD', symbol: '$', toUSD: 0.74,
    statutoryPoF: [14690, 18288, 22483, 27297], // IRCC LICO 2026 table
    statutoryRule: 'IRCC LICO Settlement Funds (mandatory for FSW/Express Entry)',
    rents: { studio: 1850, '1bed': 2400, '2bed': 3100, '3bed': 3800 },
    depositRule: 'First & last month rent (Ontario RTA s.106) + $50 refundable key deposit',
    depositMonths: 2, keyDeposit: 50,
    transitMonthly: 156, // TTC monthly pass
    healthMonthly: 0, // OHIP 3-month wait permanently eliminated
    healthNote: 'OHIP active from arrival date (Regulation 552). Private bridge insurance not required.',
    groceriesPerPerson: 420
  },
  'Vancouver': {
    currency: 'CAD', symbol: '$', toUSD: 0.74,
    statutoryPoF: [14690, 18288, 22483, 27297],
    statutoryRule: 'IRCC LICO Settlement Funds',
    rents: { studio: 1950, '1bed': 2600, '2bed': 3400, '3bed': 4200 },
    depositRule: 'First month rent + half-month security deposit (BC Residential Tenancy Act s.19)',
    depositMonths: 1.5, keyDeposit: 50,
    transitMonthly: 189, // TransLink 3-Zone Compass Card
    healthMonthly: 140, // BC MSP waiting period bridge insurance (~2 full months)
    healthNote: 'Statutory 2-month MSP waiting period requires private emergency bridge medical insurance.',
    groceriesPerPerson: 450
  },
  'New York': {
    currency: 'USD', symbol: '$', toUSD: 1.0,
    statutoryPoF: [12000, 16000, 20000, 24000],
    statutoryRule: 'USCIS Public Charge Affordability Benchmark',
    rents: { studio: 2500, '1bed': 3300, '2bed': 4400, '3bed': 5500 },
    depositRule: 'First month rent + 1 month security deposit (capped at 1 month by HSTPA 2019)',
    depositMonths: 2, keyDeposit: 0,
    transitMonthly: 132, // MTA 30-Day Unlimited
    healthMonthly: 280, // High-deductible ACA or employer bridge
    healthNote: 'Statutory health coverage through employer plan or NY State of Health marketplace.',
    groceriesPerPerson: 520
  },
  'San Francisco': {
    currency: 'USD', symbol: '$', toUSD: 1.0,
    statutoryPoF: [12000, 16000, 20000, 24000],
    statutoryRule: 'USCIS Public Charge Benchmark',
    rents: { studio: 2300, '1bed': 3000, '2bed': 4100, '3bed': 5200 },
    depositRule: 'First month rent + 1 month security deposit (California AB 12 cap)',
    depositMonths: 2, keyDeposit: 0,
    transitMonthly: 128, // Muni / BART monthly pass
    healthMonthly: 280,
    healthNote: 'Covered California enrollment required within 60 days of relocation.',
    groceriesPerPerson: 500
  },
  'London': {
    currency: 'GBP', symbol: '£', toUSD: 1.28,
    statutoryPoF: [1270, 1555, 1840, 2125], // Home Office maintenance funds
    statutoryRule: 'Home Office 28-day maintenance funds rule (£1,270 main applicant + £285/dep)',
    rents: { studio: 1500, '1bed': 2000, '2bed': 2600, '3bed': 3400 },
    depositRule: 'First month rent + 5-week tenancy deposit (capped by UK Tenant Fees Act 2019)',
    depositMonths: 2.15, keyDeposit: 0,
    transitMonthly: 185, // Zones 1-3 Travelcard
    healthMonthly: 0, // IHS paid upfront with visa
    healthNote: 'Full NHS GP and hospital care covered via Immigration Health Surcharge (IHS).',
    groceriesPerPerson: 320
  },
  'Sydney': {
    currency: 'AUD', symbol: '$', toUSD: 0.65,
    statutoryPoF: [5000, 7500, 10000, 12500],
    statutoryRule: 'Australian Home Affairs settlement liquidity guideline',
    rents: { studio: 1900, '1bed': 2500, '2bed': 3300, '3bed': 4200 },
    depositRule: 'First month rent + 4-week rental bond lodged with NSW Fair Trading',
    depositMonths: 2.0, keyDeposit: 50,
    transitMonthly: 200, // Opal card monthly cap
    healthMonthly: 120, // OVHC bridge insurance for temporary visa holders
    healthNote: 'Medicare reciprocal care depends on nationality; 482 visa requires Overseas Visitor Health Cover.',
    groceriesPerPerson: 400
  },
  'Melbourne': {
    currency: 'AUD', symbol: '$', toUSD: 0.65,
    statutoryPoF: [5000, 7500, 10000, 12500],
    statutoryRule: 'Home Affairs settlement guideline',
    rents: { studio: 1600, '1bed': 2100, '2bed': 2800, '3bed': 3600 },
    depositRule: 'First month rent + 4-week bond lodged with RTBA',
    depositMonths: 2.0, keyDeposit: 50,
    transitMonthly: 170, // myki pass
    healthMonthly: 120,
    healthNote: 'Overseas Visitor Health Cover (OVHC) condition 8501 compliance.',
    groceriesPerPerson: 380
  },
  'Berlin': {
    currency: 'EUR', symbol: '€', toUSD: 1.08,
    statutoryPoF: [2976, 5952, 7500, 9000], // 3 months of €992/mo Sperrkonto
    statutoryRule: 'German Sperrkonto (€11,904/year = €992/mo legally locked)',
    rents: { studio: 900, '1bed': 1300, '2bed': 1800, '3bed': 2400 },
    depositRule: 'First month rent + 3 months cold rent Kaution (payable in 3 installments under § 551 BGB)',
    depositMonths: 2.0, keyDeposit: 0, // 1st month + 1st installment of Kaution
    transitMonthly: 49, // Deutschlandticket (€49/mo all public transit)
    healthMonthly: 130, // GKV statutory insurance
    healthNote: 'Statutory health insurance (GKV) mandatory for all residents and jobseekers.',
    groceriesPerPerson: 280
  },
  'Munich': {
    currency: 'EUR', symbol: '€', toUSD: 1.08,
    statutoryPoF: [2976, 5952, 7500, 9000],
    statutoryRule: 'Sperrkonto blocked account benchmark',
    rents: { studio: 1200, '1bed': 1700, '2bed': 2300, '3bed': 3100 },
    depositRule: 'First month rent + 3 months cold rent Kaution (§ 551 BGB in 3 installments)',
    depositMonths: 2.0, keyDeposit: 0,
    transitMonthly: 49, // Deutschlandticket
    healthMonthly: 130,
    healthNote: 'Statutory GKV insurance from arrival date.',
    groceriesPerPerson: 320
  },
  'Dubai': {
    currency: 'AED', symbol: 'AED ', toUSD: 0.27,
    statutoryPoF: [10000, 15000, 20000, 25000],
    statutoryRule: 'GDRFA residency & employment sponsorship liquidity guideline',
    rents: { studio: 3500, '1bed': 5500, '2bed': 8000, '3bed': 12000 }, // monthly equivalent
    depositRule: 'First quarterly cheque (3 months rent) + 5% security deposit + AED 220 Ejari',
    depositMonths: 3.15, keyDeposit: 0,
    transitMonthly: 350, // Nol Red/Silver card
    healthMonthly: 0, // Employer/sponsor mandatory insurance
    healthNote: 'Employer legally mandated to provide basic health insurance under DHA rules.',
    groceriesPerPerson: 1200
  },
  'Auckland': {
    currency: 'NZD', symbol: '$', toUSD: 0.60,
    statutoryPoF: [4200, 6000, 8000, 10000],
    statutoryRule: 'Immigration New Zealand settlement funds guideline ($1,000/mo min maintenance)',
    rents: { studio: 1600, '1bed': 2100, '2bed': 2700, '3bed': 3500 },
    depositRule: 'First month rent + 4-week bond lodged with Tenancy Services',
    depositMonths: 2.0, keyDeposit: 50,
    transitMonthly: 180, // AT HOP monthly
    healthMonthly: 80,
    healthNote: 'Work visas under 2 years require comprehensive private travel/health policy.',
    groceriesPerPerson: 380
  },
  'Dublin': {
    currency: 'EUR', symbol: '€', toUSD: 1.08,
    statutoryPoF: [3000, 4500, 6000, 7500],
    statutoryRule: 'Irish Immigration Service Delivery (ISD) maintenance threshold',
    rents: { studio: 1500, '1bed': 2000, '2bed': 2600, '3bed': 3300 },
    depositRule: 'First month rent + 1 month security deposit (Residential Tenancies Act)',
    depositMonths: 2.0, keyDeposit: 0,
    transitMonthly: 140, // Leap Card monthly cap
    healthMonthly: 90,
    healthNote: 'Non-EEA residents require private medical insurance for Stamp 1 / Stamp 2.',
    groceriesPerPerson: 320
  },
  'Singapore': {
    currency: 'SGD', symbol: 'S$', toUSD: 0.75,
    statutoryPoF: [5000, 7500, 10000, 12500],
    statutoryRule: 'MOM Employment Pass salary and family dependency liquidity threshold',
    rents: { studio: 1800, '1bed': 2600, '2bed': 3600, '3bed': 4800 },
    depositRule: 'First month rent + 1-2 months security deposit (URA tenancy standard)',
    depositMonths: 2.0, keyDeposit: 0,
    transitMonthly: 128, // Adult Monthly Travel Pass (SimplyGo)
    healthMonthly: 80, // Integrated Shield Plan
    healthNote: 'MediShield Life is statutory for PRs/Citizens; EP holders utilize employer/private insurance.',
    groceriesPerPerson: 450
  },
  'Paris': {
    currency: 'EUR', symbol: '€', toUSD: 1.08,
    statutoryPoF: [2500, 3800, 5000, 6200],
    statutoryRule: 'SMIC statutory indexation and talent passport maintenance threshold',
    rents: { studio: 950, '1bed': 1350, '2bed': 1900, '3bed': 2700 },
    depositRule: 'First month rent + 1 month deposit (Loi ALUR statutory unfurnished cap)',
    depositMonths: 2.0, keyDeposit: 0,
    transitMonthly: 86, // Navigo pass all zones
    healthMonthly: 60, // Mutuelle top-up policy
    healthNote: 'Assurance Maladie (PUMA) reimburses statutory 70%; mutuelle covers remaining co-pays.',
    groceriesPerPerson: 300
  },
  'Amsterdam': {
    currency: 'EUR', symbol: '€', toUSD: 1.08,
    statutoryPoF: [3500, 5000, 6500, 8000],
    statutoryRule: 'IND Kennismigrant minimum income benchmark (€3,909 to €5,331/mo)',
    rents: { studio: 1200, '1bed': 1650, '2bed': 2200, '3bed': 3000 },
    depositRule: 'First month rent + 2 months deposit (Wet vaste huurcontracten 2024 statutory cap)',
    depositMonths: 3.0, keyDeposit: 0,
    transitMonthly: 120, // GVB / NS pass
    healthMonthly: 145, // Basisverzekering mandatory package
    healthNote: 'Statutory basic health insurance is legally mandatory within 4 months of arrival.',
    groceriesPerPerson: 320
  },
  'Stockholm': {
    currency: 'SEK', symbol: 'kr ', toUSD: 0.095,
    statutoryPoF: [28480, 42000, 55000, 70000],
    statutoryRule: 'Swedish work permit maintenance floor (SEK 28,480/mo or 80% median salary)',
    rents: { studio: 8500, '1bed': 12500, '2bed': 17000, '3bed': 23000 },
    depositRule: 'First month rent + 1 month rental deposit (Hyresgästföreningen standard)',
    depositMonths: 2.0, keyDeposit: 0,
    transitMonthly: 1020, // SL 30-day ticket
    healthMonthly: 0, // Funded through Skatteverket taxes
    healthNote: 'Universal region medical coverage active once Personnummer is issued by Skatteverket.',
    groceriesPerPerson: 3200
  },
  'Madrid': {
    currency: 'EUR', symbol: '€', toUSD: 1.08,
    statutoryPoF: [2646, 3969, 5292, 6615],
    statutoryRule: 'Spain Digital Nomad Visa statutory income criterion (200% of SMI)',
    rents: { studio: 850, '1bed': 1150, '2bed': 1550, '3bed': 2100 },
    depositRule: 'First month rent + 1 month legal fianza (LAU residential cap)',
    depositMonths: 2.0, keyDeposit: 0,
    transitMonthly: 55, // Abono Transporte Madrid
    healthMonthly: 60,
    healthNote: 'Universal public access via Tarjeta Sanitaria at local Centro de Salud.',
    groceriesPerPerson: 250
  }
};

// ==========================================
// TENANT RIGHTS & DISPUTE RESOLUTION WIZARD
// ==========================================
export const TENANCY_JURISDICTIONS = {
  'CA-ON': {
    name: 'Ontario, Canada',
    currency: 'CAD',
    symbol: '$',
    authority: 'Landlord and Tenant Board (LTB)',
    statute: 'Ontario Residential Tenancies Act, 2006 (RTA)',
    tribunalForm: 'LTB Form T1 (Rebate of Money Landlord Owes) / Form T2 (Tenant Rights Violation)',
    tribunalHelp: 'File online through Tribunals Ontario Portal. Fee is $53 or fee waiver available.'
  },
  'CA-BC': {
    name: 'British Columbia, Canada',
    currency: 'CAD',
    symbol: '$',
    authority: 'Residential Tenancy Branch (RTB)',
    statute: 'BC Residential Tenancy Act [SBC 2002] c. 78',
    tribunalForm: 'RTB Application for Dispute Resolution (Form RTB-12T-PT)',
    tribunalHelp: 'File dispute online via BC RTB Dispute Access site within statutory deadline.'
  },
  'UK': {
    name: 'England, United Kingdom',
    currency: 'GBP',
    symbol: '£',
    authority: 'First-tier Tribunal (Property Chamber) & Trading Standards',
    statute: 'Tenant Fees Act 2019 & Housing Act 1988/2004',
    tribunalForm: 'First-tier Tribunal Form RPT / County Court Section 214 Claim',
    tribunalHelp: 'Report prohibited fees to Local Council Trading Standards and claim back through First-tier Tribunal.'
  },
  'AU-NSW': {
    name: 'New South Wales, Australia',
    currency: 'AUD',
    symbol: '$',
    authority: 'NSW Civil and Administrative Tribunal (NCAT) & NSW Fair Trading',
    statute: 'NSW Residential Tenancies Act 2010',
    tribunalForm: 'NCAT Tenancy Dispute Application',
    tribunalHelp: 'Lodge an application online via NCAT portal or seek help from Tenants\' Union of NSW.'
  },
  'AU-VIC': {
    name: 'Victoria, Australia',
    currency: 'AUD',
    symbol: '$',
    authority: 'Victorian Civil and Administrative Tribunal (VCAT) & RTBA',
    statute: 'Residential Tenancies Act 1997 (Vic)',
    tribunalForm: 'VCAT Residential Tenancies Application',
    tribunalHelp: 'File residential tenancy claim with VCAT. Contact Tenants Victoria for free tenancy advocacy.'
  },
  'DE': {
    name: 'Germany (Federal)',
    currency: 'EUR',
    symbol: '€',
    authority: 'Amtsgericht & Deutscher Mieterbund (DMB)',
    statute: 'Bürgerliches Gesetzbuch (BGB) §§ 535–580a',
    tribunalForm: 'Amtsgericht Mahnbescheid / Formlose Mängel- & Kautionsrüge (§ 551 & § 556g BGB)',
    tribunalHelp: 'Consult local Mieterverein (Tenants Association) or file a summary payment proceeding (Mahnverfahren).'
  },
  'US-CA': {
    name: 'California, United States',
    currency: 'USD',
    symbol: '$',
    authority: 'California Small Claims Court & Civil Rights Department',
    statute: 'California Civil Code § 1950.5 (AB 12) & Tenant Protection Act (AB 1482)',
    tribunalForm: 'Small Claims Form SC-100 (Demand for Return of Security Deposit)',
    tribunalHelp: 'File claim in local county Small Claims Court for up to $12,500 without needing an attorney.'
  },
  'US-NY': {
    name: 'New York, United States',
    currency: 'USD',
    symbol: '$',
    authority: 'New York City Housing Court & DHCR Tenant Protection Unit',
    statute: 'Housing Stability and Tenant Protection Act of 2019 (HSTPA)',
    tribunalForm: 'DHCR Form RA-89 (Tenant Complaint of Rent Overcharge) / Housing Court HP Action',
    tribunalHelp: 'File complaint with NY State Homes and Community Renewal (DHCR) or Housing Court.'
  },
  'AE': {
    name: 'Dubai, United Arab Emirates',
    currency: 'AED',
    symbol: 'AED ',
    authority: 'Dubai Land Department Rental Dispute Center (RDC)',
    statute: 'Dubai Law No. 26 of 2007 (amended by Law No. 33 of 2008)',
    tribunalForm: 'RDC Tenancy Lawsuit Petition via Dubai REST App',
    tribunalHelp: 'Submit formal petition at the Rental Dispute Center in Deira or online through Dubai REST.'
  },
  'IE': {
    name: 'Ireland (Nationwide)',
    currency: 'EUR',
    symbol: '€',
    authority: 'Residential Tenancies Board (RTB)',
    statute: 'Residential Tenancies Acts 2004–2021',
    tribunalForm: 'RTB Online Dispute Resolution Application (Tribunal Referral)',
    tribunalHelp: 'Register dispute on RTB website; RTB provides telephone mediation followed by formal tenancy tribunal.'
  },
  'NZ': {
    name: 'New Zealand (Nationwide)',
    currency: 'NZD',
    symbol: '$',
    authority: 'Tenancy Tribunal & Tenancy Services (MBIE)',
    statute: 'Residential Tenancies Act 1986',
    tribunalForm: 'Tenancy Tribunal Online Application Form',
    tribunalHelp: 'Apply online via Tenancy Services website ($20.44 filing fee). Mediation offered first.'
  },
  'SG': {
    name: 'Singapore (Nationwide)',
    currency: 'SGD',
    symbol: 'S$',
    authority: 'State Courts Small Claims Tribunals (SCT) & URA',
    statute: 'Urban Redevelopment Authority (URA) Regulations & Common Law',
    tribunalForm: 'Small Claims Tribunals (SCT) Electronic Claim via CJTS',
    tribunalHelp: 'File dispute online through Community Justice and Tribunals System (CJTS) for claims up to S$20,000.'
  },
  'FR': {
    name: 'France (Paris / Nationwide)',
    currency: 'EUR',
    symbol: '€',
    authority: 'Commission Départementale de Conciliation (CDC) & Tribunal Judiciaire',
    statute: 'Loi n° 89-462 (amended by Loi ALUR)',
    tribunalForm: 'Saisine de la CDC / Injonction de payer au Tribunal Judiciaire',
    tribunalHelp: 'Free dispute resolution through the departmental conciliation commission (CDC) before court action.'
  },
  'NL': {
    name: 'Netherlands (Nationwide)',
    currency: 'EUR',
    symbol: '€',
    authority: 'Huurcommissie & Kantonrechter',
    statute: 'Burgerlijk Wetboek Boek 7 & Wet vaste huurcontracten 2024',
    tribunalForm: 'Huurcommissie Verzoekschrift (Procedure Huurprijscheck / Borg)',
    tribunalHelp: 'Submit online petition to Huurcommissie for rent assessment or deposit recovery (€25 procedure fee).'
  },
  'SE': {
    name: 'Sweden (Nationwide)',
    currency: 'SEK',
    symbol: 'kr ',
    authority: 'Hyresnämnden (Regional Rent Tribunal)',
    statute: 'Jordabalken (12 kap. Hyreslagen)',
    tribunalForm: 'Ansökan till Hyresnämnden om återbetalning av överhyra',
    tribunalHelp: 'Apply to Hyresnämnden to reclaim unlawful subletting rent overcharges with statutory interest.'
  },
  'ES': {
    name: 'Spain (Nationwide)',
    currency: 'EUR',
    symbol: '€',
    authority: 'Juzgado de Primera Instancia & Consumo',
    statute: 'Ley de Arrendamientos Urbanos (LAU) & Ley Vivienda 2023',
    tribunalForm: 'Demanda de Juicio Verbal / Reclamación previa de Fianza',
    tribunalHelp: 'File verbal proceeding (Juicio Verbal) without needing a lawyer for claims under €2,000.'
  }
};

// Additions for Module 1, Module 2, Module 3

// --- MODULE 1: 180-Day Chronological Gantt & Milestone Roadmap with .ics Export ---
export const JOURNEY_MILESTONES = [
  // Phase 0: Pre-Departure (Day -30 to -1)
  {
    id: 'm_poe_letter',
    phase: 0,
    dayOffset: -30,
    title: 'Port of Entry Documents & Visa Verification',
    badge: 'mandatory',
    desc: 'Verify Port of Entry (POE) Introduction Letter, biometric validity, and ensure passport has at least 6 months validity beyond intended stay.',
    cite: 'IRCC / US CBP / UK Border Force'
  },
  {
    id: 'm_currency_prep',
    phase: 0,
    dayOffset: -14,
    title: 'Customs Currency & Funds Declaration Preparation',
    badge: 'mandatory',
    desc: 'Review funds across cash, bank drafts, and traveler cheques. If value equals or exceeds $10,000 local currency, prepare mandatory statutory declaration form.',
    cite: 'PCMLTFA s.12 (CBSA E677) / 31 U.S.C. 5316 (FinCEN 105)'
  },
  {
    id: 'm_health_bridge',
    phase: 0,
    dayOffset: -7,
    title: 'Emergency Medical Bridge Travel Insurance',
    badge: 'high',
    desc: 'Secure private travel medical insurance covering the initial 30–90 days prior to domestic statutory public healthcare enrollment.',
    cite: 'Provincial / State Health Ministry Newcomer Guidance'
  },
  {
    id: 'm_dossier_assembly',
    phase: 0,
    dayOffset: -3,
    title: 'Primary Physical KYC Dossier Assembly',
    badge: 'mandatory',
    desc: 'Pack certified physical copies of police clearances (PCC), certified translations (ATIO/NAATI), ECA degree evaluations, and reference letters in carry-on luggage.',
    cite: 'ICAO Annex 9 / National Immigration Checklists'
  },

  // Phase 1: Touchdown & Primary Identity (Day 1 to 3)
  {
    id: 'm_poe_clearance',
    phase: 1,
    dayOffset: 1,
    title: 'Border Clearance & Primary Permit Endorsement',
    badge: 'mandatory',
    desc: 'Present Port of Entry letter to Border Services Officer. Verify conditions, spelling, employer/institution name, and validity date on your physical study/work permit before leaving customs.',
    cite: 'Immigration and Refugee Protection Act s.22 / INA 235'
  },
  {
    id: 'm_national_id',
    phase: 1,
    dayOffset: 2,
    title: 'National Identity / Tax Registration (SIN / SSN / TFN / BRP)',
    badge: 'mandatory',
    desc: 'Apply in-person or online for your national identity and tax number (Canada SIN at Service Canada, US SSN, Australia TFN, UK BRP collection). Essential for legal employment.',
    cite: 'Employment Insurance Act s.138 / Social Security Act'
  },
  {
    id: 'm_mobile_connectivity',
    phase: 1,
    dayOffset: 3,
    title: 'Local Telecom SIM & Two-Factor Authentication Setup',
    badge: 'high',
    desc: 'Activate local mobile phone number. A domestic phone number is mandatory for two-factor authentication (SMS 2FA) across banks, tax agencies, and tenancy applications.',
    cite: 'CRTC Wireless Code / FCC Telecom Framework'
  },

  // Phase 2: Banking & Tenancy Core (Day 4 to 14)
  {
    id: 'm_chequing_account',
    phase: 2,
    dayOffset: 5,
    title: 'Retail Bank Account Opening (Right to Open)',
    badge: 'mandatory',
    desc: 'Open a primary chequing/checking account. Banks cannot legally refuse solely due to lack of local employment or current unemployment.',
    cite: 'Canada Bank Act s.627.17 / US FDIC Consumer Access / UK FCA'
  },
  {
    id: 'm_secured_credit',
    phase: 2,
    dayOffset: 8,
    title: 'Newcomer Secured Credit Card & Credit File Creation',
    badge: 'recommended',
    desc: 'Apply for a newcomer or secured credit card to establish credit history from day one. Keep credit utilization below 30% of credit limit.',
    cite: 'FCAC Credit Guidelines / Equifax & TransUnion Reporting'
  },
  {
    id: 'm_tenancy_lease',
    phase: 2,
    dayOffset: 12,
    title: 'Residential Tenancy Execution & Deposit Verification',
    badge: 'mandatory',
    desc: 'Sign standard residential tenancy agreement. Verify landlord does not charge illegal advance rent (e.g. capped at 1 month in Ontario, 5 weeks in UK, 3 months net in Germany).',
    cite: 'Ontario RTA s.106 / UK Tenant Fees Act 2019 / BGB § 551'
  },

  // Phase 3: Public Services & Healthcare (Day 15 to 30)
  {
    id: 'm_public_health',
    phase: 3,
    dayOffset: 18,
    title: 'Provincial / National Public Healthcare Enrollment',
    badge: 'mandatory',
    desc: 'Submit application for public healthcare coverage (Ontario OHIP, BC MSP, UK NHS GP registration, Australian Medicare, Germany Gesetzliche Krankenversicherung).',
    cite: 'Health Insurance Act (Ontario) / BC Medicare Protection Act / NHS Act'
  },
  {
    id: 'm_proof_of_address',
    phase: 3,
    dayOffset: 25,
    title: 'Consolidate 90-Day Proof of Address Documentation',
    badge: 'high',
    desc: 'Download your first official bank statement or residential utility bill (hydro, gas, or broadband) displaying your full name and address for KYC recency requirements.',
    cite: 'FINTRAC Guideline on Methods to Verify Identity / Patriot Act s.326'
  },

  // Phase 4: Mobility & Licensing (Day 31 to 90)
  {
    id: 'm_drivers_license',
    phase: 4,
    dayOffset: 45,
    title: 'Foreign Driver Licence Exchange / Knowledge Test',
    badge: 'high',
    desc: 'Exchange foreign driver licence with driving extract (e.g. DL Extract/Sarathi) before the statutory driving grace period expires (60 days in Ontario, 6 months in Germany, 12 months in UK).',
    cite: 'Highway Traffic Act s.34 / DVLA UK Regulations'
  },
  {
    id: 'm_school_registration',
    phase: 4,
    dayOffset: 60,
    title: 'Dependent School Enrollment & Immunization Records',
    badge: 'mandatory',
    desc: 'Register children with local school board. Submit immunization records to public health unit to avoid statutory school suspensions.',
    cite: 'Education Act s.33 / Child Care and Early Years Act'
  },
  {
    id: 'm_community_integration',
    phase: 4,
    dayOffset: 75,
    title: 'Municipal Library Card & Community Settlement Services',
    badge: 'recommended',
    desc: 'Obtain municipal library card for free computer/printing access, language conversation circles, and government settlement orientation programs.',
    cite: 'Public Libraries Act / National Settlement Support Services'
  },

  // Phase 5: Financial Independence & Tax Readiness (Day 91 to 180)
  {
    id: 'm_tax_online_account',
    phase: 5,
    dayOffset: 100,
    title: 'Government Revenue Account Portal Registration',
    badge: 'high',
    desc: 'Register for CRA My Account (via Sign-In Partner), IRS Online Account, or HMRC Government Gateway to view official tax correspondence and benefit notices.',
    cite: 'CRA Individual Portal / IRS Online Tools / HMRC Digital Services'
  },
  {
    id: 'm_child_benefits',
    phase: 5,
    dayOffset: 120,
    title: 'Newcomer Child Benefits & Tax Credits Application',
    badge: 'high',
    desc: 'Submit application for retroactive newcomer tax credits and child benefits (e.g. Form RC151 / RC66 in Canada) without waiting for your first annual tax filing.',
    cite: 'Income Tax Act s.122.5 (GST/HST Credit) / s.122.6 (CCB)'
  },
  {
    id: 'm_foreign_asset_review',
    phase: 5,
    dayOffset: 150,
    title: 'Foreign asset reporting check',
    badge: 'mandatory',
    desc: 'Assess foreign assets for compliance with Form T1135 ($100k CAD cost base) or FBAR ($10k USD balance). Note first-year arrival exemptions if applicable.',
    cite: 'CRA Form T1135 / FinCEN Form 114 (FBAR) / HMRC SRT'
  },
  {
    id: 'm_probation_financial_check',
    phase: 5,
    dayOffset: 180,
    title: '6-Month Employment Probation & Full Settlement Milestone',
    badge: 'recommended',
    desc: 'Complete employment probation milestone, enroll in employer extended health and dental benefit plans, and review credit score report with Equifax/TransUnion.',
    cite: 'Employment Standards Act / National Credit Reporting Code'
  }
];

export const PHASE_NAMES = [
  'Phase 0: Pre-Departure Preparation (Day -30 to -1)',
  'Phase 1: Touchdown & Primary Identity (Day 1 to 3)',
  'Phase 2: Banking & Tenancy Core (Day 4 to 14)',
  'Phase 3: Public Services & Healthcare (Day 15 to 30)',
  'Phase 4: Mobility & Licensing (Day 31 to 90)',
  'Phase 5: Financial Independence & Tax Readiness (Day 91 to 180)'
];

// --- MODULE 2: Cross-Border Tax Treaty & Foreign Asset Disclosure Engine ---
export const DTAA_MATRIX = {
  'India': {
    'Canada': { interest: '15%', dividends: '15%', royalties: '15%', treatyArticle: 'India-Canada DTAA Art. 11 & 10', withholdingNote: 'CRA Foreign Tax Credit (ITA s.126) offsets Indian TDS' },
    'United States': { interest: '15%', dividends: '15%', royalties: '15%', treatyArticle: 'India-USA DTAA Art. 11 & 10', withholdingNote: 'IRS Form 1116 Foreign Tax Credit avoids double taxation' },
    'United Kingdom': { interest: '15%', dividends: '15%', royalties: '15%', treatyArticle: 'India-UK DTAA Art. 12 & 11', withholdingNote: 'HMRC Foreign Tax Credit Relief (FTCR)' },
    'Australia': { interest: '15%', dividends: '15%', royalties: '15%', treatyArticle: 'India-Australia DTAA Art. 11 & 10', withholdingNote: 'ATO Foreign Income Tax Offset (FITO)' },
    'Germany': { interest: '10%', dividends: '10%', royalties: '10%', treatyArticle: 'India-Germany DTAA Art. 11 & 10', withholdingNote: 'Anrechnung ausländischer Steuern (§ 34c EStG)' }
  },
  'China': {
    'Canada': { interest: '10%', dividends: '10%', royalties: '10%', treatyArticle: 'China-Canada DTAA Art. 11 & 10', withholdingNote: 'CRA Foreign Tax Credit (s.126)' },
    'United States': { interest: '10%', dividends: '10%', royalties: '10%', treatyArticle: 'China-USA DTAA Art. 10 & 9', withholdingNote: 'IRS Form 1116 Foreign Tax Credit' },
    'United Kingdom': { interest: '10%', dividends: '10%', royalties: '10%', treatyArticle: 'China-UK DTAA Art. 11 & 10', withholdingNote: 'HMRC Foreign Tax Credit Relief' },
    'Australia': { interest: '10%', dividends: '10%', royalties: '10%', treatyArticle: 'China-Australia DTAA Art. 11 & 10', withholdingNote: 'ATO Foreign Income Tax Offset' },
    'Germany': { interest: '10%', dividends: '10%', royalties: '10%', treatyArticle: 'China-Germany DTAA Art. 11 & 10', withholdingNote: 'Anrechnungsverfahren nach § 34c EStG' }
  },
  'United States': {
    'Canada': { interest: '0%', dividends: '15%', royalties: '0%', treatyArticle: 'Canada-US Tax Treaty Art. XI & X', withholdingNote: 'Interest exempt under 5th Protocol; 15% standard dividend' },
    'United Kingdom': { interest: '0%', dividends: '15%', royalties: '0%', treatyArticle: 'US-UK Tax Treaty Art. 11 & 10', withholdingNote: 'Zero withholding on interest/royalties; FTC available' },
    'Australia': { interest: '10%', dividends: '15%', royalties: '5%', treatyArticle: 'US-Australia Tax Treaty Art. 11 & 10', withholdingNote: 'ATO FITO credit' },
    'Germany': { interest: '0%', dividends: '15%', royalties: '0%', treatyArticle: 'US-Germany Tax Treaty Art. 11 & 10', withholdingNote: '§ 50d EStG Freistellung' }
  },
  'United Kingdom': {
    'Canada': { interest: '10%', dividends: '15%', royalties: '10%', treatyArticle: 'UK-Canada Tax Convention Art. 11 & 10', withholdingNote: 'CRA Foreign Tax Credit (s.126)' },
    'United States': { interest: '0%', dividends: '15%', royalties: '0%', treatyArticle: 'UK-US Tax Treaty Art. 11 & 10', withholdingNote: 'IRS Form 1116' },
    'Australia': { interest: '10%', dividends: '15%', royalties: '5%', treatyArticle: 'UK-Australia DTAA Art. 11 & 10', withholdingNote: 'ATO FITO' },
    'Germany': { interest: '0%', dividends: '15%', royalties: '0%', treatyArticle: 'UK-Germany DTAA Art. 11 & 10', withholdingNote: 'Bilateral exemption' }
  }
};

// --- MODULE: GROSS-TO-NET PAYCHECK & AFFORDABILITY SIMULATOR (#paycheck) ---
export const PAYCHECK_DESTS = {
  'Toronto': { country: 'Canada', prov: 'Ontario', currency: 'CAD', symbol: '$', medianRent: 2300, groceries: 550, fedRate: 0.155, provRate: 0.082, cppRate: 0.0595, cppCap: 4055, eiRate: 0.0163, eiCap: 1077, taxLaw: 'Canada Income Tax Act & Ontario Taxation Act' },
  'Vancouver': { country: 'Canada', prov: 'British Columbia', currency: 'CAD', symbol: '$', medianRent: 2450, groceries: 580, fedRate: 0.155, provRate: 0.076, cppRate: 0.0595, cppCap: 4055, eiRate: 0.0163, eiCap: 1077, taxLaw: 'Canada Income Tax Act & BC Income Tax Act' },
  'New York': { country: 'USA', prov: 'New York', currency: 'USD', symbol: '$', medianRent: 3400, groceries: 700, fedRate: 0.165, provRate: 0.065, ficaRate: 0.0765, ficaCap: 12898, taxLaw: 'Internal Revenue Code & NY State Tax Law' },
  'San Francisco': { country: 'USA', prov: 'California', currency: 'USD', symbol: '$', medianRent: 3000, groceries: 750, fedRate: 0.165, provRate: 0.072, ficaRate: 0.0765, ficaCap: 12898, taxLaw: 'Internal Revenue Code & California Revenue Code' },
  'Austin': { country: 'USA', prov: 'Texas', currency: 'USD', symbol: '$', medianRent: 1750, groceries: 550, fedRate: 0.165, provRate: 0.0, ficaRate: 0.0765, ficaCap: 12898, taxLaw: 'Internal Revenue Code (0% Texas State Income Tax)' },
  'London': { country: 'UK', prov: 'England', currency: 'GBP', symbol: '£', medianRent: 1950, groceries: 400, fedRate: 0.20, provRate: 0.0, niRate: 0.08, niCap: 3800, taxLaw: 'HMRC PAYE Income Tax & National Insurance Contributions Act' },
  'Sydney': { country: 'Australia', prov: 'NSW', currency: 'AUD', symbol: '$', medianRent: 2800, groceries: 600, fedRate: 0.22, provRate: 0.02, taxLaw: 'Income Tax Assessment Act (ITAA 1997) & Medicare Levy' },
  'Melbourne': { country: 'Australia', prov: 'Victoria', currency: 'AUD', symbol: '$', medianRent: 2300, groceries: 580, fedRate: 0.22, provRate: 0.02, taxLaw: 'Income Tax Assessment Act (ITAA 1997) & Medicare Levy' },
  'Berlin': { country: 'Germany', prov: 'Federal', currency: 'EUR', symbol: '€', medianRent: 1300, groceries: 380, fedRate: 0.26, provRate: 0.0, socRate: 0.19, taxLaw: 'Einkommensteuergesetz (EStG) & Sozialgesetzbuch (SGB)' },
  'Munich': { country: 'Germany', prov: 'Bavaria', currency: 'EUR', symbol: '€', medianRent: 1650, groceries: 420, fedRate: 0.26, provRate: 0.0, socRate: 0.19, taxLaw: 'Einkommensteuergesetz (EStG) & Sozialgesetzbuch (SGB)' },
  'Dubai': { country: 'UAE', prov: 'Dubai', currency: 'AED', symbol: 'AED ', medianRent: 6500, groceries: 1500, fedRate: 0.0, provRate: 0.0, taxLaw: 'UAE Federal Decree-Law No. 47 (0% Personal Income Tax)' },
  'Dublin': { country: 'Ireland', prov: 'National', currency: 'EUR', symbol: '€', medianRent: 2100, groceries: 450, fedRate: 0.24, provRate: 0.04, taxLaw: 'Taxes Consolidation Act (TCA 1997) & USC / PRSI' },
  'Auckland': { country: 'New Zealand', prov: 'National', currency: 'NZD', symbol: '$', medianRent: 2400, groceries: 580, fedRate: 0.21, provRate: 0.016, taxLaw: 'Income Tax Act 2007 & ACC Earner Levy' },
  'Singapore': { country: 'Singapore', prov: 'National', currency: 'SGD', symbol: 'S$', medianRent: 3200, groceries: 700, fedRate: 0.115, provRate: 0.0, taxLaw: 'Inland Revenue Authority of Singapore (IRAS) ITA' },
  'Paris': { country: 'France', prov: 'National', currency: 'EUR', symbol: '€', medianRent: 1550, groceries: 450, fedRate: 0.22, provRate: 0.09, taxLaw: 'Code général des impôts (CGI) & CSG / CRDS' },
  'Amsterdam': { country: 'Netherlands', prov: 'National', currency: 'EUR', symbol: '€', medianRent: 1850, groceries: 420, fedRate: 0.369, provRate: 0.0, taxLaw: 'Wet inkomstenbelasting 2001 (Box 1 Progressive Tax)' }
};

// --- MODULE: NEWCOMER CV LINTER & REGULATED LICENSING (#careers) ---
export const LICENSING_DATA = {
  'engineering': {
    title: 'Professional Engineer (P.Eng / P.E.)',
    body: 'Professional Engineers Ontario (PEO) / APEGA / State Licensing Board',
    steps: [
      { num: '1', title: 'Academic Credential Evaluation', desc: 'Verify foreign engineering degree through WES or direct PEO syllabus review (CEAB equivalent).' },
      { num: '2', title: 'National Professional Practice Exam (NPPE)', desc: 'Pass the mandatory NPPE examination covering Canadian professional law, engineering ethics, and tort liability.' },
      { num: '3', title: 'Competency-Based Assessment (CBA)', desc: 'Document 48 months of verifiable engineering experience demonstrating core technical competencies.' },
      { num: '4', title: 'Full Licensure & Title Protection', desc: 'Issuance of P.Eng license. Under Ontario FarPACTA legislation, Canadian work experience requirements have been legally repealed for foreign engineers!' }
    ]
  },
  'accounting': {
    title: 'Chartered Professional Accountant (CPA)',
    body: 'CPA Canada / CPA Provincial Bodies / ACCA / ICAEW',
    steps: [
      { num: '1', title: 'International Transcript Assessment', desc: 'Submit foreign university transcripts and professional body credentials (e.g. ICAI, ACCA, ICAP) to CPA provincial registrar.' },
      { num: '2', title: 'Mutual Recognition Pathways (MRA / MOU)', desc: 'Members of recognized institutes (e.g. ICAI, ACCA, AICPA) qualify for advanced standing and course exemptions.' },
      { num: '3', title: 'CPA Professional Education Program (PEP)', desc: 'Complete capstone modules and pass the multi-day Common Final Examination (CFE).' },
      { num: '4', title: 'Practical Experience Reporting (PERT)', desc: 'Log 30 months of mentored practical financial and assurance experience.' }
    ]
  },
  'medicine': {
    title: 'Physician / Medical Doctor (CPSO / GMC / AMC)',
    body: 'Medical Council of Canada (MCC) / Provincial Medical Colleges',
    steps: [
      { num: '1', title: 'PhysiciansApply Credentials Verification', desc: 'Submit Primary Source Verification (PSV) of medical degree via the Medical Council of Canada (MCC).' },
      { num: '2', title: 'MCCQE Part 1 Medical Examination', desc: 'Pass the Medical Council of Canada Qualifying Examination Part 1 evaluating clinical medical knowledge.' },
      { num: '3', title: 'National Assessment Collaboration (NAC) OSCE', desc: 'Complete the objective structured clinical exam evaluating clinical communication and patient assessment.' },
      { num: '4', title: 'Practice-Ready Assessment (PRA) / Residency Match', desc: 'Enroll in provincial Practice-Ready Assessment for IMGs or apply through CaRMS for clinical residency.' }
    ]
  },
  'nursing': {
    title: 'Registered Nurse (RN) / Practical Nurse (RPN)',
    body: 'National Nursing Assessment Service (NNAS) / Provincial Nursing Colleges (CNO)',
    steps: [
      { num: '1', title: 'NNAS Advisory Report', desc: 'Initiate evaluation of international nursing education, registration, and employment history with NNAS.' },
      { num: '2', title: 'Provincial College Assessment', desc: 'Submit NNAS Advisory Report to regulatory body (e.g. College of Nurses of Ontario).' },
      { num: '3', title: 'Regulatory Examination (NCLEX-RN)', desc: 'Write and pass the National Council Licensure Examination (NCLEX-RN) for professional nursing competence.' },
      { num: '4', title: 'Jurisprudence Examination & Safe Practice', desc: 'Complete Ontario Nursing Jurisprudence exam and demonstrate active clinical safe practice hours.' }
    ]
  },
  'teaching': {
    title: 'Elementary & Secondary School Educator',
    body: 'Ontario College of Teachers (OCT) / State Board of Education',
    steps: [
      { num: '1', title: 'Evaluation of Post-Secondary Degree', desc: 'Submit ECA confirming completed 3-to-4 year undergraduate degree plus professional teacher education.' },
      { num: '2', title: 'Language test results', desc: 'Demonstrate fluency in English (IELTS Academic) or French (TEF/TCF).' },
      { num: '3', title: 'Criminal Background & Vulnerable Sector Check', desc: 'Clear screening through police services for child safeguarding.' },
      { num: '4', title: 'Certificate of Qualification and Registration (CQR)', desc: 'Receive teaching certificate with divisional qualifications (Primary, Junior, Intermediate, Senior).' }
    ]
  },
  'tech': {
    title: 'Software Engineer / Technology Professional',
    body: 'Non-Regulated Profession Standards (Industry Standards)',
    steps: [
      { num: '1', title: 'No Mandatory Statutory License', desc: 'Software engineering, web development, data science, and IT administration are non-regulated professions in Canada, the US, and the UK.' },
      { num: '2', title: 'Title Protection Nuance', desc: 'You cannot legally advertise yourself as a "Professional Engineer" (P.Eng) without a PEO license, but job titles like "Software Developer", "IT Architect", or "Full Stack Developer" require no government license.' },
      { num: '3', title: 'Technical Portfolio & GitHub', desc: 'North American and UK tech employers assess technical competency via GitHub repositories, system design, and coding interviews.' },
      { num: '4', title: 'Right-to-Work Verification', desc: 'Present valid work permit / SIN / I-9 verification upon receiving formal job offer.' }
    ]
  }
};

export const SAMPLE_NON_COMPLIANT_CV = `Shiva Sharma
Flat 402, Green Valley Apartments, 15th Cross Road, Indira Nagar, Bangalore 560038
Email: shiva.settlement@example.com | Phone: +91 98450 12345
Photo: [Attached passport photo headshot.jpg]
Personal Details:
- Date of Birth: 15th June 1995 (Age: 31 years)
- Gender: Male | Marital Status: Married | Nationality: Indian | Religion: Hindu
- Father's Name: Ramesh Sharma

Professional Summary:
Senior Full Stack Software Engineer with 8+ years experience building scalable enterprise cloud systems and microservices.`;

// --- MODULE: HEALTHCARE ACCESS TRIAGE & EMERGENCY PRESCRIPTION BRIDGE (#healthcare) ---
export const HEALTHCARE_TRIAGE_MAP = {
  'chronic_rx': {
    level: 'RETAIL COMMUNITY PHARMACY',
    badge: 'badge-compliant',
    destination: 'Visit Licensed Community Pharmacy (Shoppers, Rexall, Boots, Chemist Warehouse)',
    desc: 'Do not go to the ER or wait months for a family physician. Licensed community pharmacists possess statutory authority under the Ontario Pharmacy Act Schedule 1 (and UK NHS Community Emergency Supply) to dispense an emergency 30-day bridge supply of essential chronic medication upon inspecting your foreign prescription and original packaging.',
    cite: 'Pharmacy Act, 1991 (Ontario) / NHS Emergency Supply Regulations / PBS Emergency Provision'
  },
  'mild_illness': {
    level: 'WALK-IN CLINIC / TELEHEALTH',
    badge: 'badge-compliant',
    destination: 'Walk-In Medical Clinic or Call Health811 / NHS 111',
    desc: 'For common infections, cough, earache, or minor rashes, walk-in clinics provide same-day evaluation without requiring a permanent family doctor. Call Health811 (Ontario) or NHS 111 (UK) for free 24/7 symptom screening by a Registered Nurse.',
    cite: 'Ministry of Health Walk-in Guidelines / NHS 111 Service Standards'
  },
  'moderate_injury': {
    level: 'HOSPITAL URGENT CARE CENTRE (UCC)',
    badge: 'badge-warn',
    destination: 'Urgent Care Centre (Not Emergency Room)',
    desc: 'Urgent Care Centres treat non-life-threatening emergencies such as sprains, simple bone fractures, and cuts requiring stitches. They have on-site X-ray and diagnostic ultrasound with significantly lower wait times (1–3 hours vs 6–10 hours at ERs).',
    cite: 'Ontario Hospital Association Urgent Care Protocols / NHS Urgent Treatment Centres'
  },
  'emergency_life': {
    level: 'EMERGENCY ROOM (ER) / CALL 911 / 999',
    badge: 'badge-danger',
    destination: 'Hospital Emergency Department or Call 911 (North America) / 999 (UK) / 000 (Australia)',
    desc: 'For chest pain, sudden numbness/paralysis, severe breathing distress, head trauma with loss of consciousness, or uncontrollable bleeding, go immediately to the nearest Emergency Department. ERs cannot deny care based on immigration status.',
    cite: 'Emergency Medical Treatment & Hospital Care Mandate'
  },
  'general_advice': {
    level: 'FREE TELEHEALTH REGISTERED NURSE',
    badge: 'badge-compliant',
    destination: 'Call 811 (Canada) / 111 (UK) / 1800 022 222 (Australia)',
    desc: 'Free, confidential telephone access to Registered Nurses 24 hours a day, 7 days a week. Translation support is available in over 200 languages upon request.',
    cite: 'Public Health Telehealth Framework'
  },
  'family_doctor': {
    level: 'PROVINCIAL / NATIONAL WAITLIST REGISTRY',
    badge: 'badge-warn',
    destination: 'Register on Health Care Connect (Ontario) / Health Connect Registry (BC)',
    desc: 'Finding a permanent family doctor takes time. Register on provincial waitlists immediately upon obtaining your health card. Meanwhile, establish continuity of care by using the same local walk-in clinic for your medical records.',
    cite: 'Health Care Connect (Ontario Ministry of Health)'
  }
};

export const COMMON_DRUG_EQUIVALENCES = {
  glucophage: { brand: 'Glucophage', generic: 'metformin', drugClass: 'Antidiabetic (Type 2 Diabetes)', isChronic: true, commonDoses: '500mg, 850mg, 1000mg', canEquiv: 'Glucophage, Glumetza, Apo-Metformin' },
  lipitor: { brand: 'Lipitor', generic: 'atorvastatin', drugClass: 'Statin / Cholesterol Lowering', isChronic: true, commonDoses: '10mg, 20mg, 40mg, 80mg', canEquiv: 'Lipitor, Apo-Atorvastatin, Teva-Atorvastatin' },
  synthroid: { brand: 'Synthroid', generic: 'levothyroxine', drugClass: 'Thyroid Hormone Replacement', isChronic: true, commonDoses: '25mcg to 200mcg', canEquiv: 'Synthroid, Eltroxin' },
  norvasc: { brand: 'Norvasc', generic: 'amlodipine', drugClass: 'Calcium Channel Blocker (Hypertension)', isChronic: true, commonDoses: '2.5mg, 5mg, 10mg', canEquiv: 'Norvasc, Apo-Amlodipine' },
  ventolin: { brand: 'Ventolin', generic: 'salbutamol', drugClass: 'Short-acting Beta Agonist (Asthma)', isChronic: true, commonDoses: '100mcg inhaler', canEquiv: 'Ventolin HFA, Airomir, Apo-Salvent' },
  losec: { brand: 'Losec', generic: 'omeprazole', drugClass: 'Proton Pump Inhibitor (GERD / Acid Reflux)', isChronic: true, commonDoses: '10mg, 20mg', canEquiv: 'Losec, Apo-Omeprazole' },
  prilosec: { brand: 'Prilosec', generic: 'omeprazole', drugClass: 'Proton Pump Inhibitor (GERD / Acid Reflux)', isChronic: true, commonDoses: '10mg, 20mg', canEquiv: 'Losec, Apo-Omeprazole' },
  zoloft: { brand: 'Zoloft', generic: 'sertraline', drugClass: 'SSRI Antidepressant / Anti-Anxiety', isChronic: true, commonDoses: '25mg, 50mg, 100mg', canEquiv: 'Zoloft, Apo-Sertraline' },
  nexium: { brand: 'Nexium', generic: 'esomeprazole', drugClass: 'Proton Pump Inhibitor (GERD / Acid Reflux)', isChronic: true, commonDoses: '20mg, 40mg', canEquiv: 'Nexium, Apo-Esomeprazole' },
  crestor: { brand: 'Crestor', generic: 'rosuvastatin', drugClass: 'Statin / Cholesterol Lowering', isChronic: true, commonDoses: '5mg, 10mg, 20mg, 40mg', canEquiv: 'Crestor, Apo-Rosuvastatin' }
};

// --- MODULE: NEWCOMER BANKING & 720+ CREDIT FAST-TRACK (#banking) ---
export const BANK_PACKAGES = {
  Canada: [
    {
      name: 'RBC Royal Bank',
      package: 'RBC Newcomer Advantage',
      perks: [
        'No monthly fee for 12 months on RBC Signature No Limit Banking (save $203.40/yr)',
        'RBC Avion / Rewards Visa with up to $2,000 credit limit and NO Canadian credit history required',
        'Wire transfer up to $50,000 CAD to your account prior to arriving in Canada',
        '2 free international money transfers per month for the first year'
      ],
      cite: 'RBC Newcomer Banking Program & Bank Act s.627.17'
    },
    {
      name: 'TD Canada Trust',
      package: 'TD New to Canada Banking Package',
      perks: [
        'Unlimited transactions with monthly fee waived for 12 months (save $203.40/yr)',
        'Up to $600 cash welcome bonus upon opening account and setting up direct deposit',
        'TD Cash Back Visa or Aeroplan Visa with no Canadian credit history required',
        'Unlimited $0 transfer fee international transfers via TD Global Transfer for 6 months'
      ],
      cite: 'TD Newcomer Offer & Financial Consumer Protection Framework'
    },
    {
      name: 'Scotiabank',
      package: 'StartRight Newcomer Program',
      perks: [
        'Free Preferred Package checking account for 12 months',
        'Up to $2,000 unsecured Scotiabank Scene+ Visa Card without Canadian credit history',
        'Pre-arrival international account opening via Scotia International Account Transfer',
        '10 free equity trades on Scotia iTRADE platform for self-directed investing'
      ],
      cite: 'Scotiabank StartRight Program Policy'
    },
    {
      name: 'CIBC',
      package: 'CIBC Welcome to Canada Banking Package',
      perks: [
        'No monthly fee for 2 full years on CIBC Smart Account for Newcomers (save $406.80)',
        'CIBC Dividend Visa or Aventura Visa with up to $2,000 credit limit without credit score',
        'International Student GIC Program for pre-arrival proof of funds ($20,635 CAD compliance)',
        '0% transfer fee on Global Money Transfers to over 120 destination countries'
      ],
      cite: 'CIBC Newcomer Advantage & IRCC Student Direct Stream'
    },
    {
      name: 'Simplii Financial & Tangerine',
      package: 'Zero-Fee Digital Banking',
      perks: [
        'Permanently $0 monthly fee forever (no minimum balance required)',
        'Free Interac e-Transfers and unlimited day-to-day debit transactions',
        'High promotional interest rates on savings accounts for the first 5 months',
        'Use CIBC (Simplii) or Scotiabank (Tangerine) ATM networks nationwide with $0 surcharge'
      ],
      cite: 'Federal Retail Banking Regulations & CDIC Insured'
    }
  ],
  'United States': [
    {
      name: 'Chase Bank',
      package: 'Chase Total Checking & Freedom Rise',
      perks: [
        'Chase Freedom Rise credit card built specifically for newcomers with no US credit history',
        'Over 4,700 branches nationwide with multilingual account representatives',
        '$300 welcome bonus for setting up qualifying direct deposit within 90 days',
        'Chase QuickPay with Zelle for instant zero-fee domestic money transfers'
      ],
      cite: 'US Consumer Financial Protection Bureau (CFPB) & FDIC Insured'
    },
    {
      name: 'Bank of America',
      package: 'Advantage Banking for Non-Residents',
      perks: [
        'Account opening permitted with foreign passport and visa without US Social Security Number (SSN)',
        'Bank of America Customized Cash Rewards Secured Card to build US FICO score from zero',
        'International wire transfers available through online banking portal',
        'FDIC member bank insuring individual deposits up to $250,000 USD'
      ],
      cite: 'Bank Secrecy Act & Customer Identification Program (CIP)'
    },
    {
      name: 'Capital One',
      package: '360 Checking & Quicksilver Secured',
      perks: [
        'Zero monthly account maintenance fees and no foreign transaction fees anywhere worldwide',
        'Capital One Platinum / Quicksilver Secured Card with refund of deposit after 6 months of on-time payments',
        'Automatic credit line reviews in as little as 6 months to graduate to an unsecured card',
        'Mobile app with integrated CreditWise score monitoring tools'
      ],
      cite: 'US Fair Credit Reporting Act (FCRA) Compliance'
    }
  ],
  'United Kingdom': [
    {
      name: 'Barclays UK',
      package: 'Barclays International Banking',
      perks: [
        'Account opening pre-arrival for foreign workers holding valid UK visas or BRP',
        'Zero monthly fee standard checking account with contactless Visa debit card',
        'Direct connection to UK Faster Payments network for instant transfers',
        'Barclays Blue Rewards program with cashback on domestic utility bills'
      ],
      cite: 'Financial Conduct Authority (FCA) & FSCS Protected'
    },
    {
      name: 'Monzo & Revolut',
      package: 'Digital App-Based Banking',
      perks: [
        'Open account within 10 minutes using smartphone and Home Office Right to Work Share Code',
        'No proof of UK address required (passport verification sufficient for basic tier)',
        'Real-time spending notifications and instant categorization of settlement living expenses',
        'Free ATM withdrawals abroad and fee-free currency exchange at interbank rates'
      ],
      cite: 'FCA Regulated & Prudential Regulation Authority (PRA)'
    }
  ],
  Australia: [
    {
      name: 'Commonwealth Bank (CommBank)',
      package: 'Everyday Account Smart Access for Migrants',
      perks: [
        'Open account online up to 14 days before departing your home country',
        'Transfer funds to Australia before arrival to secure proof of funds',
        'Monthly account fee waived for the first 12 months after arrival',
        'Collect your contactless debit card at chosen branch upon presenting your passport'
      ],
      cite: 'Australian Banking Code of Practice & APRA Insured'
    },
    {
      name: 'Westpac Australia',
      package: 'Westpac Choice Migrant Account',
      perks: [
        'Account opening up to 12 months before landing in Australia',
        'No account-keeping fees for your first 12 months in Australia',
        'Extensive ATM and branch network across Sydney, Melbourne, Brisbane, and Perth',
        'Instant issuance of digital debit card to Apple Pay or Google Wallet'
      ],
      cite: 'National Consumer Credit Protection Act & ASIC'
    }
  ],
  Germany: [
    {
      name: 'Deutsche Bank',
      package: 'Sperrkonto & Das Junge Konto',
      perks: [
        'Official blocked bank account (Sperrkonto) for German student visa proof of funds (€11,904)',
        'Free checking account (Das Junge Konto) for students and young trainees under 30',
        'Direct SEPA IBAN issued pre-arrival for blocked fund transfers',
        'Nationwide Cash Group fee-free ATM network across Germany'
      ],
      cite: 'German Residence Act § 16b & BaFin Deposit Insurance'
    },
    {
      name: 'N26 Germany',
      package: 'N26 Standard & Smart Newcomer Account',
      perks: [
        'Instant digital account opening via video passport verification in 8 minutes',
        'No German credit history (SCHUFA) or local address required on initial sign-up',
        'Free virtual Mastercard compatible with Apple Pay and Google Wallet',
        'Multilingual mobile banking app in English, German, French, and Spanish'
      ],
      cite: 'EU Payment Services Directive (PSD2) & German Banking Act (KWG)'
    }
  ],
  'United Arab Emirates': [
    {
      name: 'Emirates NBD',
      package: 'Liv. by Emirates NBD Digital Newcomer',
      perks: [
        'Instant digital salary account opening with UAE Pass verification',
        'No minimum balance requirement for initial 3 months for new visa holders',
        'Pre-allocation of UAE IBAN before Emirates ID card physical delivery',
        'Free domestic AED transfers and discounted international wire rates'
      ],
      cite: 'Central Bank of the UAE Consumer Protection Regulation'
    },
    {
      name: 'Mashreq',
      package: 'Mashreq Neo Expat Advantage',
      perks: [
        'Free checking account with direct salary deposit of AED 5,000+',
        'Welcome cashback bonus up to AED 1,000 upon salary transfer',
        'Compliant zero-balance savings account options for newcomers',
        'Integrated remittance gateway for instant transfers to India, Pakistan, UK'
      ],
      cite: 'UAE Federal Law No. 14 of 2018 Regarding Central Bank'
    }
  ],
  'New Zealand': [
    {
      name: 'ANZ New Zealand',
      package: 'ANZ Migrant Banking Package',
      perks: [
        'Open New Zealand bank account online up to 90 days before moving',
        'Transfer funds to NZ before departure to satisfy Immigration NZ proof of funds',
        'Monthly account fee waived on ANZ Go account',
        'In-person activation and EFTPOS/Visa debit card collection at your local branch'
      ],
      cite: 'Reserve Bank of New Zealand & Code of Banking Practice'
    }
  ],
  Ireland: [
    {
      name: 'Allied Irish Banks (AIB)',
      package: 'AIB Newcomer Personal Current Account',
      perks: [
        'Open account with simplified verification for Irish work permit and Stamp 2 holders',
        'No account maintenance fees for full-time higher education students',
        'Contactless Visa Debit card with instant Apple Pay and Google Pay integration',
        'Nationwide branch and ATM network across Dublin, Cork, Galway, and Limerick'
      ],
      cite: 'Central Bank of Ireland Consumer Protection Code'
    }
  ],
  Singapore: [
    {
      name: 'DBS Bank Singapore',
      package: 'DBS Expat / Employment Pass Account',
      perks: [
        'Pre-arrival online application with Singapore In-Principle Approval (IPA) letter',
        'Instant Multi-Currency Account holding 12 currencies including USD, SGD, EUR, AUD',
        'Fee waivers for initial months and automated PayNow registration via FIN',
        'Largest ATM and digital banking network in Singapore'
      ],
      cite: 'Monetary Authority of Singapore (MAS) Regulations'
    }
  ],
  France: [
    {
      name: 'BNP Paribas',
      package: 'Package Séjour Étudiant & Expat',
      perks: [
        'Assistance opening French bank account upon arrival with VLS-TS visa validation',
        'French IBAN (RIB) required for CAF housing allowance and French payroll',
        'Compliant student checking package for €1-2/month with international wire perks',
        'Comprehensive civil liability insurance (assurance responsabilité civile) add-on'
      ],
      cite: 'French Monetary and Financial Code (Code monétaire et financier)'
    }
  ],
  Netherlands: [
    {
      name: 'ABN AMRO',
      package: 'ABN AMRO International Clients Package',
      perks: [
        'English-language onboarding and mobile app specifically designed for expats',
        'Possibility to open account before BSN appointment with grace period to submit BSN',
        'Dutch IBAN for Dutch health insurance (basisverzekering) and OV-chipkaart transit',
        'Pre-departure consultation for European and international arrivals'
      ],
      cite: 'Dutch Financial Supervision Act (Wft) & De Nederlandsche Bank (DNB)'
    }
  ],
  Sweden: [
    {
      name: 'Swedbank Sweden',
      package: 'New in Sweden Banking Services',
      perks: [
        'Right to a basic payment account under the EU Payment Accounts Directive with passport',
        'Swedish IBAN and Bankgiro for salary payment and Försäkringskassan benefits',
        'Setup of BankID (Swedish digital ID) once Skatteverket Personnummer is issued',
        'Contactless debit card with multi-currency SEPA support'
      ],
      cite: 'Swedish Banking and Financing Business Act & Finansinspektionen'
    }
  ],
  Spain: [
    {
      name: 'Banco Santander',
      package: 'Santander Cuenta Online para Nuevos Residentes',
      perks: [
        'Fee-free online bank account with Spanish IBAN for payroll and utility direct debits',
        'Accepts NIE certificate and foreign passport during initial settlement period',
        'Compliant Bizum instant mobile payment activation for all local transfers',
        'Free contactless debit card with access to 30,000+ Santander ATMs worldwide'
      ],
      cite: 'Bank of Spain Transparency & Consumer Protection Regulations'
    }
  ]
};

// --- MODULE: CHILD SCHOOLING & ISPA CATCHMENT SUITE (#schools) ---
export const ISPA_VACCINES = [
  { id: 'dtp', name: 'Diphtheria, Tetanus, Pertussis & Polio (DTaP-IPV)', doses: '4-5 doses (primary series + age 4-6 booster)', mandate: 'Mandatory under ISPA s.3' },
  { id: 'mmr', name: 'Measles, Mumps, Rubella (MMR)', doses: '2 doses (at 12 months and 4-6 years)', mandate: 'Mandatory under ISPA s.3' },
  { id: 'meningococcal', name: 'Meningococcal Conjugate (Men-C-ACYW)', doses: '1 dose (at 12 months & Grade 7)', mandate: 'Mandatory under ISPA s.3' },
  { id: 'varicella', name: 'Varicella (Chickenpox)', doses: '2 doses (born on or after 2010)', mandate: 'Mandatory under ISPA s.3' }
];

// --- MODULE 5: GLOBAL FUZZY COMMAND PALETTE (Ctrl+K) & EMERGENCY SOS TOOLKIT (#sos) ---
export const PERSONA_DIRECTORY = [
  { id: 'all_personas', label: 'All Personas', icon: '👥' },
  { id: 'student', label: 'Student (PAL/PGWP)', icon: '🎓', tools: ['cmd-study-permit-cap-pal', 'cmd-study-to-pr', 'student-compliance', 'sin-healthcare', 'childcare', 'driving', 'auto-insurance', 'cra-benefits', 'insider-remote-work', 'cmd-study-permit-off-campus-work', 'cmd-alberta-youth-employment'] },
  { id: 'worker', label: 'Worker / TFW', icon: '💼', tools: ['cmd-lmia-readiness', 'cmd-severance-bardal', 'cmd-legal-notices', 'statutory-pay', 'worker-classification', 'vulnerable-worker', 'human-rights-defense', 'bowp-diagnostic', 'insider-maintained-status', 'insider-on-esa-severance', 'cmd-bc-illness-injury-leave', 'cmd-alberta-maternity-parental', 'cmd-ontario-employment-reprisal', 'cmd-ontario-public-holiday-pay', 'cmd-bc-overtime-banking', 'cmd-alberta-constructive-dismissal', 'cmd-alberta-general-holiday-pay', 'cmd-manitoba-holiday-pay', 'cmd-c12-professional-fta'] },
  { id: 'pr_newcomer', label: 'PR / Newcomer', icon: '🍁', tools: ['cmd-pr-matrix', 'express-entry-crs', 'pnp-pathway', 'cmd-tax-shield', 'cmd-cra-newcomer-wealth', 'cmd-moving-tax-calc', 'cmd-calendar-sync', 'bsf186-engine', 'citizenship', 'pr-residency', 'insider-expired-pr-card', 'cmd-caregiver-pr-experience', 'cmd-c11-entrepreneur', 'cmd-francophone-mobility-c16', 'cmd-bowp-pr-aor', 'cmd-start-up-visa-peer-review'] },
  { id: 'family', label: 'Family & Parents', icon: '👨‍👩‍👧‍👦', tools: ['cmd-family-reunification', 'cmd-super-visa-lico', 'super-visa-sponsor', 'family-law', 'parental-leave', 'schools', 'childcare', 'social-assistance', 'insider-family-bar', 'cmd-super-visa-medical-insurance', 'cmd-alberta-maternity-parental', 'cmd-caregiver-pr-experience', 'cmd-alberta-youth-employment'] },
  { id: 'renter', label: 'Renter / Tenant', icon: '🏠', tools: ['cmd-ontario-bc-tenancy', 'cmd-legal-notices', 'lease-guard', 'eviction-defense', 'rent-increase', 'lease-assignment', 'homebuyer-tax', 'insider-shared-kitchen', 'insider-post-2018-rent', 'insider-n12-timing', 'insider-calgary-suite', 'cmd-ontario-urgent-repairs-t6', 'cmd-ontario-rent-deposit-interest', 'cmd-bc-security-deposit-double', 'cmd-saskatchewan-security-deposit', 'cmd-ontario-illegal-entry-t2', 'cmd-alberta-periodic-tenancy-termination', 'cmd-bc-dispute-resolution-urgency', 'cmd-bc-strata-depreciation-crf'] },
  { id: 'global_expat', label: 'Global Expat', icon: '🌐', tools: ['cmd-global-visa-matrix', 'cmd-us-h1b-opt', 'cmd-uk-skilled-worker', 'cmd-australia-reforms', 'cmd-germany-chancenkarte', 'cmd-global-expat', 'insider-us-h1b-severance', 'insider-de-nebenkosten', 'insider-uae-gratuity-wps'] }
];

export const COMMAND_CATEGORIES = [
  { id: 'all', label: 'All Tools', icon: '⚡' },
  { id: 'recent', label: 'Recent & Pinned', icon: '⭐' },
  { id: 'immigration', label: 'Immigration & PR', icon: '⚖️' },
  { id: 'housing', label: 'Housing & Tenancy', icon: '🏠' },
  { id: 'labor', label: 'Work & Labor', icon: '💼' },
  { id: 'tax', label: 'Tax & Banking', icon: '💰' },
  { id: 'health', label: 'Health & Family', icon: '🏥' },
  { id: 'notices', label: 'Legal Notices', icon: '📜' },
  { id: 'arrival', label: 'Arrival & Border', icon: '✈️' },
  { id: 'global', label: 'Global Corridors', icon: '🌐' }
];

// --- MODULE 6: STREET-SMART INSIDER SETTLEMENT INTEL SHOWCASE ---
export const INSIDER_INTEL_ITEMS = [
  {
    category: 'immigration',
    badge: 'IRPR 186(u)',
    title: 'Maintained Status Travel Trap',
    myth: 'Myth: "I can take a short vacation abroad while my PGWP / work permit extension is pending."',
    statute: 'Reality: Leaving Canada terminates authorization to work immediately. You re-enter as a visitor and cannot work until approval.',
    q: 'Can I travel outside Canada while on maintained status PGWP in Toronto?'
  },
  {
    category: 'immigration',
    badge: 'IRPA s.2',
    title: 'Remote Work on Visitor Status',
    myth: 'Myth: "I need a Canadian work permit to work remotely for my US/foreign employer while visiting Canada."',
    statute: 'Reality: IRCC generally allows visitors to work remotely for a foreign employer, as long as the work is not for a Canadian employer and does not enter the Canadian labour market.',
    q: 'Can I work remotely for a foreign employer on a visitor visa in Toronto?'
  },
  {
    category: 'immigration',
    badge: 'IRPA 19(2)',
    title: 'Expired PR Card Land Border Entry',
    myth: 'Myth: "My PR card expired while abroad, so I am stranded and cannot return to Canada."',
    statute: 'Reality: Airlines will deny boarding, but you have an absolute statutory right of entry at US-Canada land borders in a private vehicle upon proving status.',
    q: 'Can I enter Canada at land border with expired PR card in private vehicle in Toronto?'
  },
  {
    category: 'immigration',
    badge: 'June 2024 Policy',
    title: 'Border Flagpoling & PGWP Ban',
    myth: 'Myth: "I can flagpole at the land border bridge anytime to quickly get my PGWP."',
    statute: 'Reality: Border PGWP applications were permanently banned on June 21, 2024. Other permit flagpoling has strict quotas and specific days (Tue-Thu).',
    q: 'Can I flagpole at Rainbow Bridge for PGWP work permit at border in Toronto?'
  },
  {
    category: 'immigration',
    badge: 'IRPR 117(9)(d)',
    title: 'Unexamined Dependent Permanent Bar',
    myth: 'Myth: "I will omit my newborn child or spouse from my PR application to save fees and sponsor them later."',
    statute: 'Reality: Any family member not declared or medically examined during initial PR processing is permanently excluded from family class sponsorship forever.',
    q: 'What happens if a dependent child was non-accompanying and unexamined section 117(9)(d) in Toronto?'
  },
  {
    category: 'immigration',
    badge: 'IRPR 87.1(3)(b)',
    title: 'Self-Employed CEC Express Entry Bar',
    myth: 'Myth: "My 2 years as an independent IT contractor (T4A/Incorporated) in Canada count for CEC Express Entry."',
    statute: 'Reality: All self-employed work inside Canada is statutorily disqualified from Canadian Experience Class (CEC), though it may qualify under FSWP or PNP.',
    q: 'Does self-employed contract work count for Canadian Experience Class CEC section 87.1(3)(b) in Toronto?'
  },
  {
    category: 'immigration',
    badge: 'IRPA 22(2)',
    title: 'Dual Intent Statutory Protections',
    myth: 'Myth: "Officers will reject my visitor visa or border entry if I have an Express Entry profile or pending PR."',
    statute: 'Reality: Dual intent is explicitly lawful under IRPA s.22(2); holding PR ambitions does not preclude temporary resident admission if you will leave when authorized stay ends.',
    q: 'Can I enter Canada on visitor visa if I have pending Express Entry PR dual intent in Toronto?'
  },
  {
    category: 'immigration',
    badge: 'Customs Act 99(1)',
    title: 'CBSA Digital Device & Phone Searches',
    myth: 'Myth: "CBSA border officers routinely inspect all phones and can search my remote cloud emails."',
    statute: 'Reality: Device searches require specific indicators (not routine). Devices must be placed in Airplane Mode; accessing remote cloud data or webmail is strictly prohibited.',
    q: 'Can CBSA border officers search my digital device phone search passcode at airport in Toronto?'
  },
  {
    category: 'housing',
    badge: 'RTA s.5(i)',
    title: 'Shared Kitchen No-RTA Exemption',
    myth: 'Myth: "As a room tenant sharing a house with the owner, I have full Landlord and Tenant Board (LTB) protections."',
    statute: 'Reality: Sharing a kitchen or bathroom with the property owner or their immediate family exempts the tenancy completely from the RTA (Boarder/Licensee status).',
    q: 'Does RTA apply if I share kitchen or bathroom with the landlord owner in Ontario in Toronto?'
  },
  {
    category: 'housing',
    badge: 'RTA s.6.1',
    title: 'Post-2018 Rent Increase Exemption',
    myth: 'Myth: "Every residential apartment in Ontario has rent control capped at the annual 2.5% provincial guideline."',
    statute: 'Reality: Buildings first occupied for residential purposes after Nov 15, 2018 have zero rent increase caps. Tenants must check MPAC and occupancy permits.',
    q: 'How to verify rent control exemption for building first occupied after November 15 2018 in Toronto?'
  },
  {
    category: 'housing',
    badge: 'RTA s.95',
    title: '30-Day Early Lease Break (s.95)',
    myth: 'Myth: "If I break my 1-year lease 6 months early, I must pay the remaining $15,000 rent to the landlord."',
    statute: 'Reality: If the landlord refuses permission to assign the lease or fails to respond within 7 days, you can terminate with 30 days notice (Form N9) with zero penalty.',
    q: 'Can I terminate early with 30 days notice if landlord refuses lease assignment in Toronto?'
  },
  {
    category: 'housing',
    badge: 'RTA s.48.1',
    title: 'N12 1-Month Compensation Deadline',
    myth: 'Myth: "The landlord can pay my 1 month N12 compensation on move-out day after I return the keys."',
    statute: 'Reality: Compensation MUST be paid on or before the termination date on the N12. Failure to pay on time legally voids the eviction notice at the LTB hearing.',
    q: 'Is N12 eviction notice void if landlord fails to pay one month compensation before termination date in Toronto?'
  },
  {
    category: 'tax',
    badge: 'ITA s.207.02',
    title: 'TFSA Non-Resident 1% Penalty Tax',
    myth: 'Myth: "CRA My Account shows I have $35,000 TFSA contribution room, so I can safely invest as a new arrival."',
    statute: 'Reality: You accumulate TFSA room only for tax resident years. Non-resident contributions trigger a 1% per month penalty tax on the highest balance.',
    q: 'What is the CRA penalty for contributing to TFSA as a non-resident 1% tax in Toronto?'
  },
  {
    category: 'tax',
    badge: 'ITA 128.1',
    title: 'FMV Cost Base Step-Up on Landing',
    myth: 'Myth: "Canada will tax all global capital gains on my foreign properties accumulated 10 years before moving."',
    statute: 'Reality: Properties are deemed acquired at Fair Market Value (FMV) on your landing date. Pre-landing foreign appreciation is completely tax-free in Canada.',
    q: 'Does Canada tax foreign capital gains prior to landing fair market value cost base step-up in Toronto?'
  },
  {
    category: 'tax',
    badge: 'ITA 233.3(1)',
    title: 'Foreign Home T1135 Exemption',
    myth: 'Myth: "I must report my family ancestral home in India/UK on CRA Form T1135 and pay annual tax."',
    statute: 'Reality: Personal-use property held primarily for personal enjoyment of relatives (rent-free) is statutorily exempt from Form T1135 foreign asset reporting.',
    q: 'Do I need to report family home abroad on CRA form T1135 personal-use property in Toronto?'
  },
  {
    category: 'tax',
    badge: 'PCMLTFA s.12',
    title: 'Parental Gift Wire & Deed of Gift',
    myth: 'Myth: "I should split an $80k wire from parents into ten $8k wires to avoid bank reporting."',
    statute: 'Reality: Splitting transfers to avoid reporting is illegal (structuring). A genuine gift from family is generally not taxed as income in Canada; keep a signed gift letter and proof of where the money came from, because your bank may ask.',
    q: 'Is wire transfer gift from parents taxable in Canada Deed of Gift FINTRAC in Toronto?'
  },
  {
    category: 'driving',
    badge: 'FSRA Rules',
    title: 'FSRA Auto Insurance Letter of Experience',
    myth: 'Myth: "Getting an Ontario Full G licence guarantees standard $150/month car insurance rates."',
    statute: 'Reality: Insurers rate newcomers as zero-experience drivers ($500+/mo). A foreign Claims-Free Letter of Experience from your past insurer saves $2,500-$4,000/yr.',
    q: 'How to get auto insurance discount with foreign Claims-Free Letter of Experience in Ontario FSRA in Toronto?'
  },
  {
    category: 'driving',
    badge: 'HTA Reg 340/94',
    title: 'Foreign Licence Driving Extract G-Skip',
    myth: 'Myth: "I can show my foreign plastic driver licence at DriveTest and immediately take the Full G highway road test."',
    statute: 'Reality: A plastic licence only grants 12 months credit (G2 test). To skip the wait and take the Full G directly, you MUST provide an official authenticated Driving Extract.',
    q: 'How to bypass 12 month G1 wait with official driving extract experience credit in Toronto?'
  },
  {
    category: 'international',
    country: 'United States',
    badge: '8 CFR 214.1(l)(2)',
    title: 'US H-1B 60-Day Grace Period Severance Trap',
    myth: 'Myth: "My 60-day H-1B grace period starts when my severance pay or health insurance expires."',
    statute: 'Reality: The 60-day clock begins the day after actual cessation of employment. Remaining past 60 days causes unlawful presence.',
    q: 'When does the 60-day grace period start after layoff severance for H-1B in the United States?'
  },
  {
    category: 'international',
    country: 'United States',
    badge: '8 CFR 214.2(f)(5)',
    title: 'US F-1 OPT to H-1B Cap-Gap Rules',
    myth: 'Myth: "If my OPT expires in July, I cannot work between July and October 1 when H-1B begins."',
    statute: 'Reality: Filing a timely change-of-status H-1B automatically extends F-1 status and OPT work authorization through September 30.',
    q: 'How does F-1 OPT Cap-Gap work authorization extension work in the United States?'
  },
  {
    category: 'international',
    country: 'United Kingdom',
    badge: 'Appendix CR 2.1',
    title: 'UK ILR 180-Day Rolling Absence Rule',
    myth: 'Myth: "I can spend up to 180 days outside the UK in each calendar year while on a Skilled Worker visa."',
    statute: 'Reality: Absences cannot exceed 180 days in ANY rolling 12-month window. A single 181-day absence resets the 5-year ILR clock to zero.',
    q: 'What is the 180-day continuous residence rolling absence limit for ILR in the UK?'
  },
  {
    category: 'international',
    country: 'United Kingdom',
    badge: 'Deregulation Act s.33',
    title: 'UK Section 21 Gas Safety Invalidation',
    myth: 'Myth: "A landlord in England can evict any private tenant on 2 months notice using Form 6A (Section 21)."',
    statute: 'Reality: Section 21 is void if the landlord failed to provide a Gas Safety Certificate, EPC, or How to rent guide before move-in.',
    q: 'Is Section 21 eviction notice void if landlord failed to provide Gas Safety Certificate in the UK?'
  },
  {
    category: 'international',
    country: 'Australia',
    badge: 'Condition 8607 Reform',
    title: 'AU 482 Visa 180-Day Sponsor Transfer',
    myth: 'Myth: "Subclass 482 visa holders have only 60 days to find a new employer sponsor if their job ceases."',
    statute: 'Reality: Under July 2024 reforms, workers have up to 180 days per cessation (365 days total) and can work for any employer during the gap.',
    q: 'How many days do subclass 482 visa holders have to find a new sponsor under condition 8607 in Australia?'
  },
  {
    category: 'international',
    country: 'Australia',
    badge: 'Medicare Levy Act',
    title: 'AU Medicare Levy Exemption & MES',
    myth: 'Myth: "Temporary visa holders without Medicare access still have to pay the 2% Medicare Levy on their taxes."',
    statute: 'Reality: Visa holders who are not entitled to Medicare generally do not pay the 2% levy, but they must get a Medicare Entitlement Statement (MES) to claim the exemption.',
    q: 'How to claim Medicare Levy exemption with Medicare Entitlement Statement MES in Australia?'
  },
  {
    category: 'international',
    country: 'Germany',
    badge: 'BGB § 556(3)',
    title: 'German Nebenkosten 12-Month Cutoff',
    myth: 'Myth: "A German landlord can demand payment for heating deficits years after you move out."',
    statute: 'Reality: Under BGB 556(3), landlords must deliver the annual utility bill within 12 months. Any claim delivered late is legally extinguished.',
    q: 'What is the landlord 12-month preclusion rule on annual utility bills Nebenkosten in Germany?'
  },
  {
    category: 'international',
    country: 'Germany',
    badge: 'RBStV § 2',
    title: 'German Rundfunkbeitrag Flat Exemption',
    myth: 'Myth: "Every person living in a shared flat (WG) must pay the monthly €18.36 TV/radio fee."',
    statute: 'Reality: The fee is assessed strictly per residence, not per person. Only one tenant pays; the other flatmates register the payer account number so they are not charged again.',
    q: 'Does each flatmate have to pay Rundfunkbeitrag TV tax or is it one fee per apartment in Germany?'
  },
  {
    category: 'international',
    country: 'United Arab Emirates',
    badge: 'UAE Decree 33',
    title: 'UAE Gratuity & Visa Fee Recovery Ban',
    myth: 'Myth: "Employer can deduct visa processing and recruitment costs from final salary or end-of-service gratuity."',
    statute: 'Reality: Under Federal Decree-Law No. 33 of 2021 Article 6, employers are strictly prohibited from recovering visa fees from workers. Gratuity must be paid within 14 days via WPS.',
    q: 'Can an employer deduct visa or recruitment fees from gratuity under WPS in the UAE?'
  },
  {
    category: 'international',
    country: 'United Arab Emirates',
    badge: 'Dubai Law 33',
    title: 'Dubai RERA 12-Month Notary Eviction Rule',
    myth: 'Myth: "Landlord can evict with a 60-day WhatsApp message or demand an arbitrary 30% rent increase."',
    statute: 'Reality: Under Dubai Law 33 of 2008, eviction for personal use or sale requires 12 months written notice served strictly via Notary Public. Rent increases are capped by the RERA Smart Rental Index.',
    q: 'Can my landlord evict me in Dubai with WhatsApp notice or do they need 12 months notary public notice under RERA?'
  },
  {
    category: 'international',
    country: 'Ireland',
    badge: 'RTA 2004 s.19',
    title: 'Ireland Rent Pressure Zone 2% Cap',
    myth: 'Myth: "Landlords can raise rent to market rates between tenancies when a previous tenant moves out."',
    statute: 'Reality: In Rent Pressure Zones (Dublin, Cork, Galway), the statutory 2% annual cap adheres to the property, not the tenant. Landlords must provide the previous rent calculation sheet.',
    q: 'What is the maximum rent increase in a Rent Pressure Zone RPZ in Ireland?'
  },
  {
    category: 'international',
    country: 'Ireland',
    badge: 'ISD Stamp 4',
    title: 'Ireland CSEP 21-Month Stamp 4 Freedom',
    myth: 'Myth: "Critical Skills permit holders remain tied to their employer sponsor for 5 years until citizenship."',
    statute: 'Reality: After 21 months of compliant CSEP service, holders qualify for Stamp 4, unlocking unrestricted work rights without employer sponsorship or permit renewals.',
    q: 'When can a Critical Skills Employment Permit CSEP holder transition to Stamp 4 in Ireland?'
  },
  {
    category: 'international',
    country: 'New Zealand',
    badge: 'INZ WK3',
    title: 'NZ AEWV 90-Day Redundancy Protection',
    myth: 'Myth: "If made redundant on an Accredited Employer Work Visa, your visa is cancelled immediately."',
    statute: 'Reality: INZ grants up to 90 days to find another accredited employer and lodge a Variation of Conditions (VOC) or apply for a migrant protection visa without deportation risk.',
    q: 'How many days do I have after redundancy to find an accredited employer and apply for variation of conditions AEWV in New Zealand?'
  },
  {
    category: 'international',
    country: 'New Zealand',
    badge: 'RTA 1986 s.23',
    title: 'NZ Tenancy Services 23-Day Bond Rule',
    myth: 'Myth: "Private landlords can hold your 4-week rental bond in their personal savings account."',
    statute: 'Reality: Holding tenancy bonds privately is an unlawful act. Landlords must lodge all bond funds with Tenancy Services within 23 working days, or face up to $1,500 exemplary damages.',
    q: 'Can a landlord hold bond in private account or must they lodge with Tenancy Services within 23 days in New Zealand?'
  },
  {
    category: 'international',
    country: 'United States',
    badge: '9 FAM 302.9',
    title: 'US 90-Day Visa Misrepresentation Rule',
    myth: 'Myth: "You can enter on a B1/B2 tourist visa or ESTA and file for a marriage green card immediately."',
    statute: 'Reality: Inconsistent conduct within 90 days of arrival triggers a statutory presumption of willful misrepresentation under INA § 212(a)(6)(C)(i), risking a lifetime immigration bar.',
    q: 'What is the 90-day rule for willful misrepresentation when filing adjustment of status or green card in the United States?'
  },
  {
    category: 'international',
    country: 'United Kingdom',
    badge: 'TFA 2019',
    title: 'UK Letting Agent Fee Prohibition',
    myth: 'Myth: "Letting agents in London can charge administrative, reference check, and inventory fees."',
    statute: 'Reality: The Tenant Fees Act 2019 completely bans all letting agent fees. Holding deposits are capped at 1 week rent, and any unlawful fee invalidates Section 21 eviction notices.',
    q: 'Can letting agents charge admin fees or holding deposit beyond limits under Tenant Fees Act in the UK?'
  },
  {
    category: 'health',
    badge: 'Reg. 552',
    title: 'Ontario OHIP 3-Month Waiting Period Removal',
    myth: 'Myth: "All newcomers must wait 3 months without healthcare in Ontario."',
    statute: 'Reality: Ontario permanently removed the 3-month OHIP wait by amending Regulation 552 under the Health Insurance Act. Eligible PRs and foreign workers get immediate coverage upon ServiceOntario approval. Portability covers interprovincial moves.',
    q: 'Is there still a three-month waiting period for OHIP health insurance coverage in Ontario?'
  },
  {
    category: 'immigration',
    badge: 'IRPR s.87.1',
    title: 'IRCC Express Entry CEC 52-Week Work Cap Rule',
    myth: 'Myth: "Working 60 hours/week lets you finish 1 year CEC experience in 6 months."',
    statute: 'Reality: IRCC caps countable hours at 30 hours/week. Qualifying 1-year experience requires at least 1,560 hours AND at least 52 continuous calendar weeks.',
    q: 'Can I qualify for Canadian Experience Class CEC in 6 months with 1560 hours or does it require 52 continuous weeks?'
  },
  {
    category: 'international',
    country: 'United States',
    badge: 'IRC 3121(b)(19)',
    title: 'US F-1 OPT 5-Year FICA Tax Exemption',
    myth: 'Myth: "F-1 OPT workers must pay Social Security and Medicare taxes like all US employees."',
    statute: 'Reality: Non-resident students are exempt from FICA (7.65%) for their first 5 calendar years. Erroneously withheld taxes can be refunded directly by employers or via IRS Form 843.',
    q: 'Are F-1 students on OPT exempt from Social Security and Medicare FICA taxes in the United States?'
  },
  {
    category: 'international',
    country: 'United States',
    badge: '8 CFR 274a.13(d)',
    title: 'US 540-Day Automatic EAD Renewal Extension',
    myth: 'Myth: "If your EAD expires while renewal is pending, you must stop working immediately."',
    statute: 'Reality: Timely filed Form I-765 renewals in qualifying categories (H-4 with I-94, L-2, AOS) receive an automatic extension of up to 540 days under the USCIS Temporary Final Rule.',
    q: 'Does a timely filed I-765 renewal qualify for a 540-day automatic extension of EAD work authorization in the United States?'
  },
  {
    category: 'international',
    country: 'Australia',
    badge: 'Fair Work Act 2009',
    title: 'AU Working Holiday 88-Day Farm Work Floor',
    myth: 'Myth: "Regional farm employers can offer free bunkhouse accommodation instead of wages."',
    statute: 'Reality: Award wages are mandatory for all 88-day regional work. Piece rates must guarantee at least 15% above the minimum hourly floor, and accommodation deductions require written consent.',
    q: 'What are the award wage and piece rate protections for Working Holiday 88 days regional work under Fair Work in Australia?'
  },
  {
    category: 'international',
    country: 'Germany',
    badge: 'BGB § 622',
    title: 'Germany Statutory Notice Periods & Probation',
    myth: 'Myth: "You can resign with immediate effect or be fired on the spot in Germany."',
    statute: 'Reality: Under BGB § 622, probationary notice is strictly 2 weeks. Post-probation employee resignation requires 4 weeks to the 15th or end of month, while employer notice scales up to 7 months.',
    q: 'What is the statutory notice period for resignation or dismissal under BGB 622 during probation in Germany?'
  },
  {
    category: 'immigration',
    badge: 'IRPA s.87(2)',
    title: 'Canada PNP Intent to Reside & Mobility Trap',
    myth: 'Myth: "PNP nominees can freely land and immediately settle in any Canadian province under Charter Section 6."',
    statute: 'Reality: Charter Section 6 mobility rights attach only after landing. Moving or leasing in another province before landing violates IRPA Section 87(2), risking nomination revocation and a 5-year bar.',
    q: 'Can a provincial nominee PNP move to another province before landing or does IRPA require intent to reside in Toronto?'
  },
  {
    category: 'tax',
    badge: 'ITA s.146.6',
    title: 'Canada CRA FHSA Newcomer Eligibility ($8,000)',
    myth: 'Myth: "Newcomers must wait a full calendar year before opening a First Home Savings Account."',
    statute: 'Reality: Under ITA Section 146.6, newcomers who are 18+ and Canadian tax residents can immediately open an FHSA in year 1, contributing up to $8,000 tax-deductible toward their first home.',
    q: 'Can a newcomer open a First Home Savings Account FHSA in their first year of arrival in Canada in Toronto?'
  },
  {
    category: 'immigration',
    badge: 'Ontario ESA s.64',
    title: 'Ontario Notice vs Severance Pay ($2.5M Threshold)',
    myth: 'Myth: "All laid-off employees in Ontario are entitled to statutory severance pay."',
    statute: 'Reality: Termination notice (up to 8 weeks) applies to all, but statutory severance (up to 26 weeks) requires 5+ years of service AND an employer Ontario payroll of at least $2.5 million.',
    q: 'What is the difference between notice of termination and severance pay under Ontario ESA 2.5 million payroll in Toronto?'
  },
  {
    category: 'international',
    country: 'United States',
    badge: '8 CFR § 214.1',
    title: 'US Electronic I-94 Governs Lawful Stay',
    myth: 'Myth: "You can stay in the US until the expiration date stamped on your passport visa foil."',
    statute: 'Reality: Under 8 CFR § 214.1(a)(3), the electronic CBP Form I-94 strictly governs lawful stay. If your passport expires early, CBP truncates the I-94, and staying past it triggers unlawful presence.',
    q: 'Does electronic Form I-94 determine authorized stay and override passport visa foil expiration in the United States?'
  },
  {
    category: 'international',
    country: 'United States',
    badge: 'IRC § 6013(g)',
    title: 'US Dual-Status Alien s.6013(g) Joint Election',
    myth: 'Myth: "Dual-status aliens arriving mid-year can never claim the standard deduction."',
    statute: 'Reality: Under IRC § 6013(g), a married dual-status newcomer can elect to be treated as a full-year US resident, unlocking the full married filing jointly standard deduction and joint tax brackets.',
    q: 'Can a married dual-status alien make a 6013(g) election to file married filing jointly in the United States?'
  },
  {
    category: 'international',
    country: 'United Kingdom',
    badge: 'HC 590',
    title: 'UK Skilled Worker £29k Grandfathered Salary',
    myth: 'Myth: "All existing Skilled Worker visa holders must now earn £38,700 to extend their visa in the UK."',
    statute: 'Reality: Statement of Changes HC 590 strictly grandfathers workers who held visas before April 4, 2024 at a reduced £29,000 baseline threshold for extensions and ILR until 2030.',
    q: 'What is the grandfathered salary threshold for pre-April 2024 Skilled Worker visa holders in the United Kingdom?'
  },
  {
    category: 'international',
    country: 'Australia',
    badge: 'ITAA 1997 Subdiv 768-R',
    title: 'AU Temporary Resident Foreign CGT Exemption',
    myth: 'Myth: "Temporary residents in Australia must pay Capital Gains Tax on property or shares sold overseas."',
    statute: 'Reality: Under ITAA 1997 Subdivision 768-R, temporary residents (482, 500, 417) are generally exempt from Australian CGT on foreign assets, while Australian real property remains taxable. Exceptions apply, so check with the ATO.',
    q: 'Are temporary residents exempt from capital gains tax CGT on foreign assets under Subdivision 768-R in Australia?'
  },
  {
    category: 'international',
    country: 'Germany',
    badge: 'AufenthG § 20a',
    title: 'Germany Chancenkarte 20-Hour & Trial Work',
    myth: 'Myth: "Opportunity Card holders cannot work any jobs while searching for skilled employment."',
    statute: 'Reality: Under AufenthG § 20a, Chancenkarte holders are legally permitted to work up to 20 hours/week in secondary employment and take two-week trial jobs (Probearbeit) without extra permits.',
    q: 'Can Opportunity Card Chancenkarte holders work 20 hours per week or do trial work Probearbeit in Germany?'
  },
  {
    category: 'tax',
    badge: 'ITA s.62',
    title: 'Canada CRA Moving Expense Deduction (40 km Rule)',
    myth: 'Myth: "Moving expenses for relocating to Canada are never tax deductible on your first Canadian return."',
    statute: 'Reality: Under ITA Section 62 and Form T1-M, newcomers relocating for work or study at least 40 km closer to their new job can deduct flights, temporary living (up to 15 days), and movers against Canadian income.',
    q: 'Can I deduct moving expenses on form T1-M if I moved 40 kilometres for work in Canada in Toronto?'
  },
  {
    category: 'housing',
    badge: 'OHRC s.2(1)',
    title: 'Ontario Rental Ban on No-Credit Discrimination',
    myth: 'Myth: "Landlords can lawfully reject you or demand 12 months upfront rent if you have no Canadian credit history."',
    statute: 'Reality: Under Ontario Human Rights Code Section 2(1) and OHRC policy, rejecting tenants solely for lacking domestic credit history or local guarantors is unlawful discrimination. Alternative proof of income must be accepted.',
    q: 'Can a landlord refuse to rent to a newcomer because they have no Canadian credit history under the Human Rights Code in Toronto?'
  },
  {
    category: 'international',
    country: 'United States',
    badge: 'INA § 245(k)',
    title: 'US USCIS 245(k) 180-Day Work Violation Exemption',
    myth: 'Myth: "Any unauthorized employment or gap in status permanently blocks an employment-based green card in the US."',
    statute: 'Reality: Under INA § 245(k), employment-based applicants (EB-1, EB-2, EB-3) can forgive up to 180 days of unauthorized work or status violations committed since their last lawful admission when filing Form I-485.',
    q: 'Can employment-based green card applicants forgive up to 180 days of unauthorized work under 245(k) in the United States?'
  },
  {
    category: 'international',
    country: 'United Kingdom',
    badge: 'Immigration Act 2014',
    title: 'UK Right to Rent Statutory Excuse & LCS',
    myth: 'Myth: "Tenants with a pending visa extension cannot rent a home while waiting for Home Office decisions."',
    statute: 'Reality: Under Section 3C leave, legal rights are preserved. Landlords verify pending applications through the Landlord Checking Service (LCS), obtaining a 28-day statutory excuse against civil penalties.',
    q: 'Does a landlord have a 28-day statutory excuse via Landlord Checking Service during in-time visa extension Right to Rent in the United Kingdom?'
  },
  {
    category: 'international',
    country: 'Australia',
    badge: 'Health Insurance Act 1973',
    title: 'AU Reciprocal Medicare Enrolment & Exceptions',
    myth: 'Myth: "All foreign visitors and temporary visa holders in Australia must pay 100% out of pocket for healthcare."',
    statute: 'Reality: Citizens of 11 RHCA countries (UK, IE, NZ, IT, etc.) are entitled to free public hospital care and PBS subsidies under Medicare. Note: UK/Irish students are excluded and require OSHC.',
    q: 'Can visitors from Reciprocal Health Care Agreement RHCA countries enroll in Medicare in Australia?'
  },
  {
    category: 'international',
    country: 'Germany',
    badge: 'BGB § 556g',
    title: 'Germany Mietpreisbremse Prior Rent Disclosure',
    myth: 'Myth: "German landlords can charge whatever rent they want if the previous tenant paid that price."',
    statute: 'Reality: Under BGB § 556g(1a), landlords claiming a previous rent (Vormiete) exemption above the 10% Mietpreisbremse cap MUST disclose the prior rent in writing BEFORE contract signing, or lose the exemption.',
    q: 'Must a landlord disclose the previous rent Vormiete in writing under the Mietpreisbremse rent brake in Germany?'
  }
];

export const CUSTOMS_PRESETS = {
  standard: {
    items: [
      { category: 'electronics', description: 'Apple MacBook Pro 16" (SN: C02G45ABCDEF)', valueCad: 3500, ownedMonths: 14, isAccompanying: true, serialNumber: 'C02G45ABCDEF' },
      { category: 'electronics', description: 'iPhone 15 Pro (SN: DX3J9KLMNP)', valueCad: 1400, ownedMonths: 9, isAccompanying: true, serialNumber: 'DX3J9KLMNP' },
      { category: 'clothing', description: 'Winter jackets, boots & personal wardrobe (4 suitcases)', valueCad: 2200, ownedMonths: 18, isAccompanying: true },
      { category: 'jewelry', description: '2x Gold wedding bands (18K, 12g) & chain', valueCad: 3800, ownedMonths: 24, isAccompanying: true, hasAppraisalReceipt: true },
      { category: 'furniture', description: 'Study desk, books & household goods (4 air cargo boxes)', valueCad: 1800, ownedMonths: 12, isAccompanying: false }
    ],
    vehicle: null
  },
  tech: {
    items: [
      { category: 'electronics', description: 'Apple MacBook Pro M3 Max 16"', valueCad: 4500, ownedMonths: 10, isAccompanying: true, serialNumber: 'C02XYZ1234' },
      { category: 'electronics', description: 'Dell UltraSharp 4K 32" Monitor', valueCad: 1100, ownedMonths: 12, isAccompanying: false, serialNumber: 'DL98765432' },
      { category: 'electronics', description: 'Sony A7 IV Camera & 24-70mm GM Lens', valueCad: 4200, ownedMonths: 15, isAccompanying: true, serialNumber: 'SN445566' },
      { category: 'electronics', description: 'Sennheiser Studio Headphones & DAC', valueCad: 850, ownedMonths: 8, isAccompanying: true },
      { category: 'clothing', description: 'Personal attire and luggage', valueCad: 1500, ownedMonths: 24, isAccompanying: true }
    ],
    vehicle: null
  },
  family: {
    items: [
      { category: 'electronics', description: '2x Laptops & 2x iPads', valueCad: 4000, ownedMonths: 12, isAccompanying: true },
      { category: 'jewelry', description: 'Gold ornaments & bridal necklace (22K, 45g)', valueCad: 6500, ownedMonths: 36, isAccompanying: true, hasAppraisalReceipt: true },
      { category: 'furniture', description: 'Solid wood dining set & master bedroom furniture', valueCad: 4500, ownedMonths: 24, isAccompanying: false },
      { category: 'appliances', description: 'Kitchen cookware & small appliances (110V compatible)', valueCad: 1200, ownedMonths: 12, isAccompanying: false },
      { category: 'clothing', description: 'Family seasonal apparel and bedding (8 shipping boxes)', valueCad: 3500, ownedMonths: 18, isAccompanying: false }
    ],
    vehicle: null
  },
  vehicle: {
    items: [
      { category: 'electronics', description: 'Laptop and mobile devices', valueCad: 2800, ownedMonths: 12, isAccompanying: true },
      { category: 'clothing', description: 'Personal effects and luggage', valueCad: 1800, ownedMonths: 12, isAccompanying: true },
      { category: 'furniture', description: 'Household goods (2 cargo boxes)', valueCad: 1400, ownedMonths: 14, isAccompanying: false }
    ],
    vehicle: { makeModel: '2021 Toyota RAV4 AWD', year: 2021, valueCad: 32000, hasAirConditioning: true }
  }
};

export const TOOL_SWITCHER_CONFIG = {
  casework: [
    { id: 'checklist', title: '📋 Application Checklist Audit' },
    { id: 'history', title: '⏳ Personal History & Gap Checker' },
    { id: 'family-plan', title: '👨‍👩‍👧 Family Deadlines & Milestones' },
    { id: 'change-review', title: '🔄 Material Change of Circumstances' }
  ],
  pathway: [
    { id: 'pathway-comparator-card', title: '🌐 Pathways Comparison Engine' },
    { id: 'citizenship-calculator-card', title: '🇨🇦 Canadian Citizenship Eligibility' },
    { id: 'pr-residency-card', title: '📋 PR Card Renewal & Residency (730 Days)' },
    { id: 'super-visa-card', title: '👨‍👩‍👧 Parents & Grandparents Super Visa Income' },
    { id: 'express-entry-crs-card', title: '📊 Express Entry Comprehensive Ranking (CRS)' },
    { id: 'pnp-pathway-card', title: '🍁 Provincial Nominee (PNP) Points & Tech Streams' },
    { id: 'bowp-card', title: '🔄 Bridging Open Work Permit (BOWP) Diagnostic' },
    { id: 'border-flagpoling-card', title: '🛂 CBSA Flagpoling & Land Border Diagnostic' },
    { id: 'employment-reference-card', title: '📄 Foreign Work Experience & Reference Auditor' },
    { id: 'pgwp-card', title: '🎓 Post-Graduation Work Permit (PGWP) Audit' },
    { id: 'tfw-compliance-card', title: '💼 Closed Work Permit Compliance & Wage Theft' },
    { id: 'sowp-card', title: '💍 Spousal Open Work Permit (SOWP) 2024 Audit' },
    { id: 'criminal-rehab-card', title: '⚖️ Criminal Inadmissibility & Bill C-46 DUI' },
    { id: 'rural-renewal-card', title: '🌾 Alberta Rural Renewal & Entrepreneur (AAIP)' },
    { id: 'child-welfare-card', title: '👶 Youth Welfare & Child Citizenship (s. 5.1)' },
    { id: 'francophone-mobility-card', title: '⚜️ Francophone Mobility Program (LMIA C16)' },
    { id: 'atlantic-immigration-card', title: '⚓ Atlantic Immigration Program (AIP)' },
    { id: 'pr-matrix-card', title: '🌍 Global PR Matrix (CA, AU, DE, UK, NZ)' },
    { id: 'family-reunification-card', title: '❤️ Spousal & Family Reunification Navigator' }
  ],
  tenancy: [
    { id: 'tenancy-claim-card', title: '⚖️ Tenancy Rights & Jurisdiction Guide' },
    { id: 'tenancy-vault', title: '🎙️ LTB Claim Estimator & Evidence Vault' },
    { id: 'lease-guard-card', title: '🛡️ Residential Lease Checker & Illegal Clauses' },
    { id: 'eviction-defense-card', title: '🛑 Eviction Notice Defense (N12, N13, N4, N11)' },
    { id: 'lease-assignment-card', title: '📝 Lease Assignment & Early Termination' },
    { id: 'rent-increase-card', title: '📈 Rent Increase & Illegal AGI Defense' },
    { id: 'tenancy-repairs-card', title: '🛠️ Repairs, Vital Services & Rent Abatement' },
    { id: 'bc-strata-bylaw-card', title: '🏢 BC Strata Bylaw Defense & Bill 44 Repeal' },
    { id: 'pr-card-renewal-card', title: '🪪 PR Card Renewal & Urgent PRTD Navigator' },
    { id: 'foreign-worker-transition-card', title: '👔 TFW Transition & Low-Wage LMIA Policy' },
    { id: 'child-disability-benefit-card', title: '♿ Child Disability Benefit & RDSP Engine' },
    { id: 'alberta-security-deposit-card', title: '💰 Alberta Security Deposit & RTDRS Defense' },
    { id: 'internationally-trained-nurse-card', title: '🩺 Internationally Educated Nurses (NNAS)' },
    { id: 'alberta-opportunity-stream-card', title: '🏔️ AAIP Opportunity & Tourism Streams' },
    { id: 'bc-speculation-tax-declaration-card', title: '🏡 BC Speculation & Vacancy Tax Exemption' },
    { id: 'prtd-humanitarian-card', title: '🤝 PRTD Humanitarian & Compassionate (H&C)' },
    { id: 'severance-reasonable-notice-card', title: '📜 Bardal Common Law Notice vs ESA Severance' },
    { id: 'manitoba-pnp-skilled-worker-card', title: '🌾 Manitoba MPNP Skilled Worker Ranking' }
  ],
  paycheck: [
    { id: 'paycheck-simulator-card', title: '💵 Paycheck Calculator & Tax Deductions' },
    { id: 'paycheck-severance-card', title: '🛡️ Layoff Severance & EI Benefit Estimator' },
    { id: 'worker-classification-card', title: '📋 Employee vs Contractor Audit (T4 vs T4A)' },
    { id: 'vulnerable-worker-card', title: '🚨 Vulnerable Worker Open Work Permit (Abuse)' },
    { id: 'parental-leave-card', title: '👶 Maternity & Parental Leave EI Simulator' },
    { id: 'business-structure-card', title: '🏢 Sole Proprietorship vs Incorporation' },
    { id: 'commercial-lease-card', title: '🏬 Commercial Lease Review & Tenant Defense' },
    { id: 'human-rights-defense-card', title: '⚖️ Human Rights & Constructive Dismissal' },
    { id: 'small-claims-card', title: '🏛️ Small Claims Court & Demand Letter Engine' },
    { id: 'statutory-pay-card', title: '⏱️ Statutory Holiday Pay & Wage Calculator' },
    { id: 'workplace-safety-card', title: '🦺 OHSA Workplace Safety & WSIB Compensation' },
    { id: 'franchise-disclosure-card', title: '📑 Franchise Disclosure & 2-Year Rescission' },
    { id: 'ei-disqualification-card', title: '💼 EI Just Cause & Severance Allocation' },
    { id: 'digital-platform-worker-card', title: '📱 Gig & Platform Worker Wage Rights (DPWRA)' }
  ],
  tax: [
    { id: 'tax-benefits-card', title: '📊 Tax Credits & Surcharge Comparison' },
    { id: 'cra-benefits-card', title: '🍁 Canada Child Benefit (CCB) & GST Credit' },
    { id: 'moving-tax-card', title: '📦 Newcomer Moving Expenses Deduction (T1-M)' },
    { id: 'estate-planning-card', title: '📜 Multijurisdictional Wills, Assets & Probate' },
    { id: 'cra-vdp-card', title: '🛡️ CRA Voluntary Disclosures (VDP & T1135)' },
    { id: 'cross-border-tax-card', title: '🌐 Cross-Border FBAR & T1135 Asset Transfer' },
    { id: 'real-estate-assignment-card', title: '🏗️ Assignment Sales, Anti-Flipping & Tarion' },
    { id: 'speculation-tax-rebate-card', title: '🏡 BC SVT & Ontario NRST Foreign Rebates' },
    { id: 'tax-shield-card', title: '💰 Tax Shield Builder (FHSA, TFSA, RRSP)' }
  ],
  cashflow: [
    { id: 'cashflow-relocation-card', title: '✈️ City-by-City Relocation Budget Simulator' },
    { id: 'newcomer-budget-card', title: '🏠 First-Year Monthly City Living Budget' },
    { id: 'homebuyer-eligibility-card', title: '🏡 Foreign Buyer Ban & Closing Costs Checker' },
    { id: 'homebuyer-tax-card', title: '🔑 First-Time Home Buyer Incentives & Rebates' },
    { id: 'social-assistance-card', title: '🤝 Ontario Works & ODSP Emergency Assistance' },
    { id: 'oas-gis-card', title: '👴 Senior Old Age Security & GIS Pension Engine' }
  ],
  banking: [
    { id: 'banking-comparator-card', title: '🏦 Big 5 Bank Newcomer Package Comparison' },
    { id: 'currency-exchange-card', title: '💱 Foreign Wire Transfer & FINTRAC Limits' },
    { id: 'debt-defense-card', title: '🛡️ Debt Collection Harassment & Limitations' },
    { id: 'telecom-defense-card', title: '📱 CRTC Wireless Code Cell & Internet Rights' },
    { id: 'consumer-protection-card', title: '🛍️ Cooling-Off Periods & Door-to-Door Sales' },
    { id: 'high-cost-credit-card', title: '⚠️ Payday Loan & 35% Criminal APR Defense' }
  ],
  healthcare: [
    { id: 'healthcare-eligibility-card', title: '🍁 Provincial Public Health Waiting Periods' },
    { id: 'medical-admissibility-card', title: '🩺 Immigration Medical Exam & Admissibility' },
    { id: 'healthcare-portability-card', title: '🏥 Interprovincial Portability & IFHP Coverage' },
    { id: 'excessive-demand-card', title: '💊 Medical Excessive Demand Mitigation Plan' }
  ],
  schools: [
    { id: 'childcare-card', title: '🎒 Daycare & Childcare Average Costs by City' },
    { id: 'student-compliance-card', title: '📚 International Student 24-hr Work Limit' },
    { id: 'ispa-compliance-audit', title: '🛡️ ISPA Private Career College Exemption Audit' },
    { id: 'family-law-card', title: '⚖️ Child & Spousal Support Asset Equalization' },
    { id: 'childcare-subsidy-card', title: '👶 CWELCC $10/Day Childcare Fee Subsidy' }
  ],
  binder: [
    { id: 'binder-checklist-card', title: '📋 Newcomer Document Checklist & Readiness Bar' },
    { id: 'binder-watchdog', title: '⏱️ Permit Expiry & Maintained Status Watchdog' },
    { id: 'preflight-inspector', title: '✈️ Pre-Departure Critical Document Checklist' },
    { id: 'identity-harmonization-card', title: '🪪 Passport / Visa Name Mismatch Resolver' }
  ],
  airport: [
    { id: 'airport-content', title: '✈️ Port-of-Entry Survival Kit (Arrival Guide, Customs & Hotlines)' },
    { id: 'customs-declaration-card', title: '📦 CBSA Forms BSF186 & BSF186A Goods to Follow' },
    { id: 'pet-import-card', title: '🐕 CFIA Pet Import Rules & Breed Restrictions' },
    { id: 'airport-phrasebook', title: '🗣️ Border Officer Dialogues & Audio Phrasebook' }
  ],
  driving: [
    { id: 'vehicle-import-card', title: '🚗 RIV Vehicle Importation & Safety Standards' },
    { id: 'auto-insurance-card', title: '🛡️ Auto Insurance & Foreign Driving History Credit' }
  ]
};
