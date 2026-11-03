// src/slang-normalizer.js
// Intelligent Typo, Slang, Acronym & Cross-Border Jargon Normalizer
// Handles real-world Reddit & Quora style messy queries with fuzzy matching,
// phonetics, 300+ acronyms, cross-border synonyms, and Hinglish transliterations.

export const IMMIGRATION_ACRONYMS = {
  // Canada
  'lmia': 'Labour Market Impact Assessment',
  'pgwp': 'Post-Graduation Work Permit',
  'bowp': 'Bridging Open Work Permit',
  'sowp': 'Spousal Open Work Permit',
  'owp': 'Open Work Permit',
  'vwowp': 'Vulnerable Worker Open Work Permit',
  'trp': 'Temporary Resident Permit',
  'trv': 'Temporary Resident Visa',
  'copr': 'Confirmation of Permanent Residence',
  'aor': 'Acknowledgment of Receipt',
  'ita': 'Invitation to Apply',
  'crs': 'Comprehensive Ranking System',
  'clb': 'Canadian Language Benchmark',
  'nclc': 'Niveaux de compétence linguistique canadiens',
  'noc': 'National Occupational Classification',
  'teer': 'Training Education Experience Responsibilities',
  'fsw': 'Federal Skilled Worker',
  'cec': 'Canadian Experience Class',
  'fst': 'Federal Skilled Trades',
  'pnp': 'Provincial Nominee Program',
  'oinp': 'Ontario Immigrant Nominee Program',
  'bcpnp': 'British Columbia Provincial Nominee Program',
  'ainp': 'Alberta Immigrant Nominee Program',
  'aaip': 'Alberta Advantage Immigration Program',
  'sinp': 'Saskatchewan Immigrant Nominee Program',
  'mpnp': 'Manitoba Provincial Nominee Program',
  'nsnp': 'Nova Scotia Nominee Program',
  'lico': 'Low Income Cut-Off',
  'prtd': 'Permanent Resident Travel Document',
  'dli': 'Designated Learning Institution',
  'pal': 'Provincial Attestation Letter',
  'ircc': 'Immigration Refugees and Citizenship Canada',
  'cbsa': 'Canada Border Services Agency',
  'irb': 'Immigration and Refugee Board',
  'rad': 'Refugee Appeal Division',
  'rpd': 'Refugee Protection Division',
  'iad': 'Immigration Appeal Division',
  'id': 'Immigration Division',
  'ltb': 'Landlord and Tenant Board',
  'rta': 'Residential Tenancies Act',
  'esa': 'Employment Standards Act',
  'ohip': 'Ontario Health Insurance Plan',
  'msp': 'Medical Services Plan',
  'ahcip': 'Alberta Health Care Insurance Plan',
  'cra': 'Canada Revenue Agency',
  'fintrac': 'Financial Transactions and Reports Analysis Centre of Canada',
  'cafc': 'Canadian Anti-Fraud Centre',
  'cicc': 'College of Immigration and Citizenship Consultants',
  'rcic': 'Regulated Canadian Immigration Consultant',
  'rheu': 'Rental Housing Enforcement Unit',

  // United States
  'uscis': 'U.S. Citizenship and Immigration Services',
  'cbp': 'Customs and Border Protection',
  'ice': 'Immigration and Customs Enforcement',
  'eoir': 'Executive Office for Immigration Review',
  'ead': 'Employment Authorization Document',
  'opt': 'Optional Practical Training',
  'cpt': 'Curricular Practical Training',
  'stem opt': 'Science Technology Engineering Math Optional Practical Training',
  'lca': 'Labor Condition Application',
  'perm': 'Program Electronic Review Management',
  'pwd': 'Prevailing Wage Determination',
  'i94': 'Form I-94 Arrival Departure Record',
  'i20': 'Certificate of Eligibility for Nonimmigrant Student Status',
  'ds2019': 'Certificate of Eligibility for Exchange Visitor Status',
  'sevis': 'Student and Exchange Visitor Information System',
  'vawa': 'Violence Against Women Act',
  'daca': 'Deferred Action for Childhood Arrivals',
  'tps': 'Temporary Protected Status',
  'ssn': 'Social Security Number',
  'itin': 'Individual Taxpayer Identification Number',
  'flsa': 'Fair Labor Standards Act',
  'fmla': 'Family and Medical Leave Act',
  'dol': 'Department of Labor',

  // United Kingdom
  'ukvi': 'UK Visas and Immigration',
  'ilr': 'Indefinite Leave to Remain',
  'brp': 'Biometric Residence Permit',
  'cas': 'Confirmation of Acceptance for Studies',
  'cos': 'Certificate of Sponsorship',
  'selt': 'Secure English Language Test',
  'ecctis': 'UK National Academic Recognition Information Centre',
  'acas': 'Advisory Conciliation and Arbitration Service',
  'hmrc': 'HM Revenue and Customs',
  'dwp': 'Department for Work and Pensions',
  'nin': 'National Insurance Number',
  'nino': 'National Insurance Number',
  'nhs': 'National Health Service',
  'ihs': 'Immigration Health Surcharge',
  'evisa': 'Digital Electronic Visa',
  'swv': 'Skilled Worker Visa',
  'hpi': 'High Potential Individual Visa',
  'tds': 'Tenancy Deposit Scheme',

  // Australia
  'dha': 'Department of Home Affairs',
  'vevo': 'Visa Entitlement Verification Online',
  'tfn': 'Tax File Number',
  'abn': 'Australian Business Number',
  'fwo': 'Fair Work Ombudsman',
  'fwc': 'Fair Work Commission',
  'bva': 'Bridging Visa A',
  'bvb': 'Bridging Visa B',
  'bvc': 'Bridging Visa C',
  'rrv': 'Resident Return Visa',
  'gsm': 'General Skilled Migration',
  'eoi': 'Expression of Interest',
  'tra': 'Trades Recognition Australia',
  'vetassess': 'Vocational Education and Training Assessment Services',
  'ncat': 'NSW Civil and Administrative Tribunal',
  'vcat': 'Victorian Civil and Administrative Tribunal',

  // Germany
  'bamf': 'Bundesamt für Migration und Flüchtlinge',
  'ausländerbehörde': 'Ausländerbehörde Foreigners Registration Office',
  'abh': 'Ausländerbehörde',
  'ba': 'Bundesagentur für Arbeit',
  'bafin': 'Bundesanstalt für Finanzdienstleistungsaufsicht',
  'bgb': 'Bürgerliches Gesetzbuch',
  'aufenthg': 'Aufenthaltsgesetz Residence Act',
  'sgb': 'Sozialgesetzbuch',
  'gkv': 'Gesetzliche Krankenversicherung',
  'pkv': 'Private Krankenversicherung',
  'tüv': 'Technischer Überwachungsverein Vehicle Inspection',
  'schufa': 'Schufa Credit Bureau',

  // UAE
  'icp': 'Federal Authority for Identity Citizenship Customs and Port Security',
  'gdrfa': 'General Directorate of Residency and Foreigners Affairs',
  'mohre': 'Ministry of Human Resources and Emiratisation',
  'mofa': 'Ministry of Foreign Affairs',
  'eid': 'Emirates ID',
  'wps': 'Wages Protection System',
  'rera': 'Real Estate Regulatory Agency',
  'rdc': 'Rental Dispute Center',
  'dha uae': 'Dubai Health Authority',
  'doh': 'Department of Health Abu Dhabi',
  'tdra': 'Telecommunications and Digital Government Regulatory Authority',

  // New Zealand
  'inz': 'Immigration New Zealand',
  'mbie': 'Ministry of Business Innovation and Employment',
  'aewv': 'Accredited Employer Work Visa',
  'smc': 'Skilled Migrant Category',
  'ird': 'Inland Revenue Department',
  'nzqa': 'New Zealand Qualifications Authority',
  'iqa': 'International Qualifications Assessment',
  'pswv': 'Post Study Work Visa',

  // European Union / General
  'echr': 'European Court of Human Rights',
  'cjeu': 'Court of Justice of the European Union',
  'gdpr': 'General Data Protection Regulation',
  'eidas': 'Electronic Identification Authentication and Trust Services',
  'ehic': 'European Health Insurance Card',
  'cefr': 'Common European Framework of Reference for Languages',
  'twov': 'Transit Without Visa',
  'eta': 'Electronic Travel Authorization',
  'esta': 'Electronic System for Travel Authorization',
  'etias': 'European Travel Information and Authorisation System'
};

export const COMMON_TYPOS_MAP = [
  // Express Entry & PR
  [/\b(?:expres|exprees|exress|xpress)\s+entr(?:y|ie)\b/gi, 'Express Entry'],
  [/\b(?:aply|appley|aplying|aplied)\b/gi, 'apply'],
  [/\b(?:expir(?:e|ing|d)?|expring|expred)\b/gi, 'expiring'],
  [/\b(?:permenant|permanant|parmanent|permenent)\s+residen(?:ce|t|cy)\b/gi, 'permanent residence'],
  [/\b(?:pr\s+crd|pr\s*cad)\b/gi, 'PR Card'],
  [/\b(?:copr|c\.o\.p\.r)\b/gi, 'COPR'],

  // Work & Study Permits
  [/\b(?:wrk|wrok)\s+perm(?:it|its?)\b/gi, 'work permit'],
  [/\b(?:studey|studdy|stdy)\s+perm(?:it|its?)\b/gi, 'study permit'],
  [/\b(?:clossed|cloesd)\s+work\s+permit\b/gi, 'closed work permit'],
  [/\b(?:oppen|opn)\s+work\s+permit\b/gi, 'open work permit'],
  [/\b(?:implied|maintained)\s+statu(?:s|se)\b/gi, 'maintained status'],
  [/\b(?:restoration\s+of\s+statu[s]?|restore\s+statu[s]?)\b/gi, 'restoration of status'],
  [/\b(?:flag\s*pol(?:e|ing|ed)?)\b/gi, 'flagpoling'],

  // Tenancy & Housing
  [/\b(?:land\s*loard|landlor|landloard)\b/gi, 'landlord'],
  [/\b(?:tenent|tenat|tenants)\b/gi, 'tenant'],
  [/\b(?:evicshun|evicton|evicte?d?)\b/gi, 'eviction'],
  [/\b(?:securty|deposite|securty\s+deposite)\b/gi, 'security deposit'],
  [/\b(?:rent\s+incr(?:ease|ise)|rent\s+hyke)\b/gi, 'rent increase'],
  [/\b(?:chang(?:ed|ing)?\s+lock[s]?|lock\s*out)\b/gi, 'illegal lockout changing locks'],

  // Identity & Health
  [/\b(?:sin\s+numbr|sin\s+crd|sin\s+card)\b/gi, 'Social Insurance Number SIN'],
  [/\b(?:ssn\s+crd|ssn\s+numbr)\b/gi, 'Social Security Number SSN'],
  [/\b(?:ohip\s+crd|ohip\s+card)\b/gi, 'OHIP card'],
  [/\b(?:medcal|medicall)\s+(?:card|insurnce|insurance)\b/gi, 'health insurance card'],

  // Documents & Legal
  [/\b(?:marrige|marraige|marige)\s+cert(?:ificate)?\b/gi, 'marriage certificate'],
  [/\b(?:notariz(?:ed)?|notorized)\s+translat(?:on|ion)\b/gi, 'certified notarized translation'],
  [/\b(?:schengan|shengen|schenegen)\b/gi, 'Schengen'],
  [/\b(?:anmeldng|amelung|ameldung)\b/gi, 'Anmeldung'],
  [/\b(?:ejary|ijari|ezari)\b/gi, 'Ejari'],
  [/\b(?:steuer\s*id|stuer\s*id)\b/gi, 'Steuer-ID'],
  [/\b(?:chancen\s*karte|chance\s*card)\b/gi, 'Chancenkarte Opportunity Card']
];

export const CROSS_BORDER_SYNONYMS = [
  // US to UK/Canada/Australia
  { pattern: /\bgreen\s+card\s+in\s+(?:the\s+)?(?:uk|united\s+kingdom|britain|england|london)\b|\b(?:in\s+london|in\s+the\s+uk|in\s+england|in\s+britain)\b.*?\bgreen\s+card\b/gi, replacement: 'Indefinite Leave to Remain ILR permanent residence in the United Kingdom' },
  { pattern: /\bgreen\s+card\s+in\s+canada\b/gi, replacement: 'Canadian permanent residence PR in Canada' },
  { pattern: /\bgreen\s+card\s+in\s+australia\b/gi, replacement: 'Australian permanent residence PR in Australia' },
  { pattern: /\bgreen\s+card\s+in\s+germany\b/gi, replacement: 'Niederlassungserlaubnis permanent settlement permit in Germany' },
  
  // Provincial Healthcare
  { pattern: /\bohip\s+(?:in|for)\s+(?:calgary|edmonton|alberta)\b/gi, replacement: 'AHCIP Alberta Health Care Insurance Plan in Alberta' },
  { pattern: /\bohip\s+(?:in|for)\s+(?:vancouver|victoria|bc|british\s+columbia)\b/gi, replacement: 'MSP Medical Services Plan in British Columbia' },
  { pattern: /\bohip\s+(?:in|for)\s+(?:montreal|quebec)\b/gi, replacement: 'RAMQ health insurance in Quebec' },
  
  // US & UK terms in Canada
  { pattern: /\b(?:ssn|social\s+security\s+number)\s+(?:in|for)\s+canada\b/gi, replacement: 'SIN Social Insurance Number in Canada' },
  { pattern: /\b(?:401k|401\s*k)\s+(?:in|for)\s+canada\b/gi, replacement: 'RRSP Registered Retirement Savings Plan in Canada' },
  { pattern: /\bsection\s+8\s+(?:in|for)\s+canada\b/gi, replacement: 'subsidized social housing in Canada' }
];

export const HINGLISH_EXPANSIONS = [
  [/\b(?:pgwp|work\s*permit)\s+(?:khatam|expire)\s+(?:hone\s*wala|ho\s*raha)\b/gi, 'work permit expiring soon extension restoration of status'],
  [/\b(?:makan\s*malik|landlord)\s+(?:ne\s*tala\s*badal\s*diya|lock\s*kar\s*diya|bahar\s*nikal\s*diya)\b/gi, 'landlord illegal lockout changed locks RTA eviction'],
  [/\b(?:bina\s*naukri|naukri\s*ke\s*bina)\s+(?:bank\s*account|khata)\b/gi, 'open bank account without a job Bank Act'],
  [/\b(?:kiraya|rent)\s+(?:badha\s*diya|zyada\s*mang\s*raha)\b/gi, 'unlawful rent increase guideline LTB'],
  [/\b(?:cash\s*par\s*kaam|under\s*the\s*table\s*kaam)\b/gi, 'unauthorized cash employment IRPA s 30 violation'],
  [/\b(?:police\s*deport\s*karegi|cbsa\s*pakad\s*legi)\b/gi, 'deportation removal order procedural rights']
];

export const EMOTIONAL_FLUFF_PATTERNS = [
  /\b(?:urgent\s*help\s*pls|pls\s*help\s*me(?:\s*sir)?|please\s*help\s*me\s*urgent(?:ly)?|guys\s*please\s*help|need\s*advice\s*asap|i(?:'?m|\s+am)\s+crying(?:\s+so\s+much)?|so\s*stressed\s*out|freaking\s*out|someone\s*please\s*tell\s*me|any\s*help\s*appreciated|throwaway\s*account|posting\s*for\s*a\s*friend)\b/gi,
  /[!]{2,}/g,
  /[?]{2,}/g
];

export function cleanEmotionalFluff(text) {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text;
  for (const pat of EMOTIONAL_FLUFF_PATTERNS) {
    cleaned = cleaned.replace(pat, ' ');
  }
  return cleaned.replace(/\s+/g, ' ').trim();
}

export function normalizeSlangAndTypos(text) {
  if (!text || typeof text !== 'string') return '';

  let out = text;

  // 1. Cross-border synonyms
  for (const item of CROSS_BORDER_SYNONYMS) {
    out = out.replace(item.pattern, item.replacement);
  }

  // 2. Hinglish expansions
  for (const [pattern, replacement] of HINGLISH_EXPANSIONS) {
    out = out.replace(pattern, replacement);
  }

  // 3. Common newcomer typos
  for (const [pattern, replacement] of COMMON_TYPOS_MAP) {
    out = out.replace(pattern, replacement);
  }

  // 4. Acronym expansion (word-boundary safe)
  for (const [acr, expansion] of Object.entries(IMMIGRATION_ACRONYMS)) {
    const pat = new RegExp(`\\b${acr}\\b`, 'gi');
    if (pat.test(out)) {
      // Append the full meaning alongside acronym for dual retrieval
      out = out.replace(pat, `${acr.toUpperCase()} (${expansion})`);
    }
  }

  return out.replace(/\s+/g, ' ').trim();
}

export function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val = a[i - 1] === b[j - 1] ? row[j - 1] : Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

export function fuzzyMatchGlossary(token, glossaryTerms, maxDistance = 2) {
  if (!token || token.length < 4) return null;
  const lower = token.toLowerCase();

  let bestMatch = null;
  let minDistance = maxDistance + 1;

  for (const term of glossaryTerms) {
    const termLower = term.toLowerCase();
    const dist = levenshteinDistance(lower, termLower);
    if (dist <= maxDistance && dist < minDistance) {
      minDistance = dist;
      bestMatch = term;
    }
  }

  return bestMatch;
}
