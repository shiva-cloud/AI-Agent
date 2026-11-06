// src/global-settlement-resolver.js
// Global immigration & settlement question catalog (20,000 templated, unreviewed entries)
// Automatically maps all 20,000 questions (GMS-Q00001 to GMS-Q20000) across all 51 categories
// and 8 jurisdictions. Unreviewed research catalog; citations are not independently verified.

import fs from 'node:fs';

const COUNTRY_PROFILES = {
  "Canada": {
    "code": "CA",
    "immigAct": "Immigration and Refugee Protection Act (IRPA SC 2001 c. 27)",
    "immigReg": "Immigration and Refugee Protection Regulations (IRPR SOR/2002-227)",
    "immigAuth": "Immigration, Refugees and Citizenship Canada (IRCC)",
    "immigUrl": "https://www.canada.ca/en/services/immigration-citizenship.html",
    "labourAct": "Canada Labour Code / Provincial Employment Standards Acts (e.g. Ontario ESA 2000)",
    "labourAuth": "Ministry of Labour / Employment Standards Branch",
    "tenancyAct": "Residential Tenancies Act 2006 (Ontario) / BC RTA",
    "tenancyAuth": "Landlord and Tenant Board (LTB) / RTB",
    "taxAuth": "Canada Revenue Agency (CRA)",
    "healthAuth": "Health Canada / Provincial Ministries of Health (OHIP, MSP)",
    "idDoc": "Social Insurance Number (SIN)",
    "idAuth": "Service Canada / ESDC"
  },
  "United States": {
    "code": "US",
    "immigAct": "Immigration and Nationality Act (INA, Title 8 U.S. Code §§ 1101 et seq.)",
    "immigReg": "Title 8 Code of Federal Regulations (8 CFR)",
    "immigAuth": "U.S. Citizenship and Immigration Services (USCIS) / CBP",
    "immigUrl": "https://www.uscis.gov/",
    "labourAct": "Fair Labor Standards Act of 1938 (FLSA, 29 U.S. Code § 201 et seq.)",
    "labourAuth": "U.S. Department of Labor (DOL) Wage and Hour Division",
    "tenancyAct": "Fair Housing Act (42 U.S. Code § 3601 et seq.) / State Tenant Laws",
    "tenancyAuth": "U.S. Department of Housing and Urban Development (HUD) / State Courts",
    "taxAuth": "Internal Revenue Service (IRS)",
    "healthAuth": "Department of Health and Human Services (HHS) / Healthcare.gov",
    "idDoc": "Social Security Number (SSN)",
    "idAuth": "Social Security Administration (SSA)"
  },
  "United Kingdom": {
    "code": "UK",
    "immigAct": "Immigration Act 1971 / UK Immigration Rules (HC 395)",
    "immigReg": "UK Immigration Rules Appendices (Skilled Worker, FM, Student, EU, PRTD)",
    "immigAuth": "UK Visas and Immigration (UKVI) / Home Office",
    "immigUrl": "https://www.gov.uk/government/organisations/uk-visas-and-immigration",
    "labourAct": "Employment Rights Act 1996 / National Minimum Wage Act 1998",
    "labourAuth": "Acas (Advisory, Conciliation and Arbitration Service) / Employment Tribunal",
    "tenancyAct": "Housing Act 1988 (Sections 8, 21) / Tenant Fees Act 2019",
    "tenancyAuth": "First-tier Tribunal (Property Chamber) / Tenancy Deposit Scheme",
    "taxAuth": "HM Revenue & Customs (HMRC)",
    "healthAuth": "National Health Service (NHS)",
    "idDoc": "National Insurance Number (NIN)",
    "idAuth": "Department for Work and Pensions (DWP)"
  },
  "Australia": {
    "code": "AU",
    "immigAct": "Migration Act 1958 (Cth)",
    "immigReg": "Migration Regulations 1994 (Cth)",
    "immigAuth": "Department of Home Affairs (DHA)",
    "immigUrl": "https://immi.homeaffairs.gov.au/",
    "labourAct": "Fair Work Act 2009 (Cth) / National Employment Standards",
    "labourAuth": "Fair Work Ombudsman (FWO) / Fair Work Commission",
    "tenancyAct": "Residential Tenancies Act 2010 (NSW) / Residential Tenancies Act 1997 (Vic)",
    "tenancyAuth": "Civil and Administrative Tribunals (NCAT / VCAT / QCAT)",
    "taxAuth": "Australian Taxation Office (ATO)",
    "healthAuth": "Services Australia (Medicare) / Department of Health",
    "idDoc": "Tax File Number (TFN)",
    "idAuth": "Australian Taxation Office (ATO)"
  },
  "Germany": {
    "code": "DE",
    "immigAct": "Aufenthaltsgesetz (AufenthG - Residence Act)",
    "immigReg": "Beschäftigungsverordnung (BeschV) / Aufenthaltsverordnung (AufenthV)",
    "immigAuth": "Bundesamt für Migration und Flüchtlinge (BAMF) / Ausländerbehörde",
    "immigUrl": "https://www.bamf.de/",
    "labourAct": "Bürgerliches Gesetzbuch (BGB § 611a) / Kündigungsschutzgesetz (KSchG)",
    "labourAuth": "Bundesagentur für Arbeit (BA) / Arbeitsgericht",
    "tenancyAct": "Bürgerliches Gesetzbuch (BGB §§ 535–580a) / Mietpreisbremse",
    "tenancyAuth": "Amtsgericht (Mietgericht) / Mieterverein",
    "taxAuth": "Bundeszentralamt für Steuern (BZSt) / Finanzamt",
    "healthAuth": "Gesetzliche Krankenversicherung (GKV) / Spitzenverband",
    "idDoc": "Steuer-Identifikationsnummer (Steuer-ID) & Meldebestätigung",
    "idAuth": "Bürgeramt / Einwohnermeldeamt"
  },
  "United Arab Emirates": {
    "code": "UAE",
    "immigAct": "Federal Decree-Law No. 29 of 2021 on Entry and Residence of Foreigners",
    "immigReg": "Cabinet Resolution No. 65 of 2022 (Executive Regulations)",
    "immigAuth": "Federal Authority for Identity, Citizenship, Customs and Port Security (ICP) / GDRFA Dubai",
    "immigUrl": "https://icp.gov.ae/",
    "labourAct": "Federal Decree-Law No. 33 of 2021 on the Regulation of Labour Relations",
    "labourAuth": "Ministry of Human Resources and Emiratisation (MoHRE)",
    "tenancyAct": "Law No. 26 of 2007 (Dubai) / Decree No. 43 of 2013 on Rental Increases",
    "tenancyAuth": "Real Estate Regulatory Agency (RERA) / Rental Dispute Center (RDC)",
    "taxAuth": "Federal Tax Authority (FTA)",
    "healthAuth": "Dubai Health Authority (DHA) / Department of Health Abu Dhabi (DoH)",
    "idDoc": "Emirates ID (EID)",
    "idAuth": "Federal Authority for Identity, Citizenship, Customs and Port Security (ICP)"
  },
  "New Zealand": {
    "code": "NZ",
    "immigAct": "Immigration Act 2009",
    "immigReg": "Immigration New Zealand (INZ) Operational Manual",
    "immigAuth": "Immigration New Zealand (INZ) / Ministry of Business, Innovation and Employment (MBIE)",
    "immigUrl": "https://www.immigration.govt.nz/",
    "labourAct": "Employment Relations Act 2000 / Holidays Act 2003",
    "labourAuth": "Employment New Zealand / Labour Inspectorate / Employment Relations Authority",
    "tenancyAct": "Residential Tenancies Act 1986 / Healthy Homes Standards",
    "tenancyAuth": "Tenancy Services / Tenancy Tribunal",
    "taxAuth": "Inland Revenue Department (IRD)",
    "healthAuth": "Health New Zealand (Te Whatu Ora) / Ministry of Health",
    "idDoc": "IRD Number",
    "idAuth": "Inland Revenue Department (IRD)"
  },
  "European Union": {
    "code": "EU",
    "immigAct": "Directive (EU) 2021/1883 (EU Blue Card) / Regulation (EU) 2016/399 (Schengen Borders Code)",
    "immigReg": "Regulation (EU) No 604/2013 (Dublin III) / Directive 2004/38/EC (Free Movement)",
    "immigAuth": "European Commission / DG Migration and Home Affairs / National Member State Authorities",
    "immigUrl": "https://immigration-portal.ec.europa.eu/",
    "labourAct": "Directive 2003/88/EC (Working Time) / Directive (EU) 2019/1152",
    "labourAuth": "European Labour Authority (ELA) / National Labour Inspectorates",
    "tenancyAct": "National Civil Codes & Tenancy Statutes compliant with EU Consumer Directives",
    "tenancyAuth": "National Municipal Housing Tribunals / European Consumer Centres",
    "taxAuth": "European Commission DG TAXUD / National Tax Administrations",
    "healthAuth": "Directive 2011/24/EU (Cross-border Healthcare) / EHIC Framework",
    "idDoc": "National Resident Identity Document / EU Digital Identity Framework (eIDAS)",
    "idAuth": "National Civil Registries & European Commission"
  }
};

const CATEGORY_MAP = {
  "Identity & SIN": {
    "topic": "identity",
    "citationSuffix": "Identity Registration & Statutory Number Allocation Provisions"
  },
  "Healthcare": {
    "topic": "health",
    "citationSuffix": "Public Health Insurance & Resident Eligibility Acts"
  },
  "Housing & Tenancy": {
    "topic": "housing",
    "citationSuffix": "Residential Tenancy Act & Tenant Protection Statues"
  },
  "Banking & Tax": {
    "topic": "money",
    "citationSuffix": "Banking Standards Act & Income Tax Codes"
  },
  "Driving & Vehicles": {
    "topic": "driving",
    "citationSuffix": "Motor Vehicle Administration & Driver Licensing Regulations"
  },
  "Transit": {
    "topic": "transit",
    "citationSuffix": "Regional Public Transportation & Fare Administration Acts"
  },
  "Employment & Labour": {
    "topic": "employment",
    "citationSuffix": "Employment Standards & National Labour Protection Legislation"
  },
  "Family & Schools": {
    "topic": "family",
    "citationSuffix": "Education Acts & Compulsory School Attendance Frameworks"
  },
  "Telecom & Consumer": {
    "topic": "telecom",
    "citationSuffix": "Telecommunications Regulatory Framework & Consumer Protection Codes"
  },
  "Local Settlement": {
    "topic": "community",
    "citationSuffix": "Settlement Assistance & Integration Support Provisions"
  },
  "Jobs & Careers": {
    "topic": "employment",
    "citationSuffix": "Fair Access to Regulated Professions & Credential Assessment Acts"
  },
  "Food & Groceries": {
    "topic": "groceries",
    "citationSuffix": "Emergency Relief & Food Security Support Guidelines"
  },
  "Cost of Living": {
    "topic": "money",
    "citationSuffix": "Statutory Poverty Metrics & Household Basket Thresholds"
  },
  "Emergency & Safety": {
    "topic": "community",
    "citationSuffix": "Emergency Services Coordination & Crisis Protection Acts"
  },
  "Digital Government": {
    "topic": "community",
    "citationSuffix": "Electronic Governance & Digital Identity Security Regulations"
  },
  "Utilities": {
    "topic": "housing",
    "citationSuffix": "Public Utilities Regulation & Consumer Service Standards"
  },
  "Benefits": {
    "topic": "money",
    "citationSuffix": "Social Security Administration & Statutory Income Support Acts"
  },
  "Legal Aid": {
    "topic": "legal",
    "citationSuffix": "Legal Aid Services & Access to Justice Legislation"
  },
  "Mental Health": {
    "topic": "health",
    "citationSuffix": "Mental Health Treatment & Crisis Intervention Statutes"
  },
  "Disability": {
    "topic": "employment",
    "citationSuffix": "Disability Rights & Reasonable Accommodation Standards"
  },
  "Seniors": {
    "topic": "money",
    "citationSuffix": "Old Age Security & Senior Citizens Welfare Legislation"
  },
  "Women & Family Safety": {
    "topic": "family",
    "citationSuffix": "Domestic Violence Protection & Special Immigration Relief Acts"
  },
  "Students": {
    "topic": "employment",
    "citationSuffix": "International Student Regulatory Framework & Work Authorization Rules"
  },
  "Business Setup": {
    "topic": "employment",
    "citationSuffix": "Corporate Registry & Commercial Enterprise Laws"
  },
  "Relocation": {
    "topic": "arrival",
    "citationSuffix": "Customs Duty Relief & Settlers Effects Exemption Regulations"
  },
  "Community Life": {
    "topic": "community",
    "citationSuffix": "Municipal Community Engagement & Civic Inclusion Bylaws"
  },
  "Fraud & Scams": {
    "topic": "community",
    "citationSuffix": "Immigration Services Regulation & Anti-Fraud Statutory Provisions"
  },
  "Estate & Death": {
    "topic": "money",
    "citationSuffix": "Probate Administration & Succession Law Reform Acts"
  },
  "Climate & Preparedness": {
    "topic": "housing",
    "citationSuffix": "Civil Protection & Emergency Thermal Comfort Standards"
  },
  "Municipal Services": {
    "topic": "community",
    "citationSuffix": "Municipal Government Acts & Local Bylaw Enforcement Codes"
  },
  "Immigration Policy": {
    "topic": "employment",
    "citationSuffix": "Administrative Law & Immigration Statutory Interpretation Doctrine"
  },
  "Refusals & Appeals": {
    "topic": "legal",
    "citationSuffix": "Judicial Review & Immigration Appellate Tribunal Procedures"
  },
  "Visitor & Short Stay": {
    "topic": "arrival",
    "citationSuffix": "Short Stay Visitor Regulations & Dual Intent Framework"
  },
  "Study Immigration": {
    "topic": "employment",
    "citationSuffix": "Student Visa Regulations & Post-Study Work Pathways"
  },
  "Work Immigration": {
    "topic": "employment",
    "citationSuffix": "Work Authorization Standards & Labour Market Access Rules"
  },
  "Skilled Migration": {
    "topic": "employment",
    "citationSuffix": "Points-Based Skilled Selection & Economic Immigration Acts"
  },
  "Employer Sponsorship": {
    "topic": "employment",
    "citationSuffix": "Employer Sponsorship Compliance & Worker Protection Regulations"
  },
  "Investor Immigration": {
    "topic": "money",
    "citationSuffix": "Immigrant Investor Framework & Commercial Innovation Regulations"
  },
  "Family Immigration": {
    "topic": "family",
    "citationSuffix": "Family Reunification & Statutory Sponsorship Undertakings"
  },
  "PR & Citizenship": {
    "topic": "community",
    "citationSuffix": "Permanent Residency Maintenance & Naturalization Acts"
  },
  "Criminal & Security": {
    "topic": "legal",
    "citationSuffix": "Criminal Inadmissibility Grounds & Statutory Rehabilitation Provisions"
  },
  "Borders & Removal": {
    "topic": "arrival",
    "citationSuffix": "Border Enforcement & Statutory Removal Order Legislation"
  },
  "Refugee & Humanitarian": {
    "topic": "legal",
    "citationSuffix": "Refugee Protection Convention & Humanitarian Relief Acts"
  },
  "Vulnerable Migrants": {
    "topic": "employment",
    "citationSuffix": "Protection of Exploited Workers & Trafficking Victims Directives"
  },
  "Credential & Language": {
    "topic": "employment",
    "citationSuffix": "Designated Credential Assessment & Language Testing Standards"
  },
  "Biometrics & Medical": {
    "topic": "health",
    "citationSuffix": "Biometric Enrollment & Immigration Health Admissibility Rules"
  },
  "Fees & Processing": {
    "topic": "money",
    "citationSuffix": "Statutory Fee Schedules & Administrative Processing Standards"
  },
  "Immigration Evidence": {
    "topic": "legal",
    "citationSuffix": "Evidentiary Burden of Proof & Document Authentication Standards"
  },
  "Digital Immigration & Privacy": {
    "topic": "community",
    "citationSuffix": "Data Protection & Access to Personal Government Files Acts"
  },
  "Cross-border Mobility": {
    "topic": "arrival",
    "citationSuffix": "Cross-Border Travel Authorization & Transit Visas Treaties"
  },
  "Legal Tools": {
    "topic": "legal",
    "citationSuffix": "Statutory Calculation Formulas & Administrative Decision Frameworks"
  }
};

// In-memory indexes
const INDEX_BY_ID = new Map();
const INDEX_BY_QUESTION = new Map();
const TIER_STATS = {};
const COUNTRY_STATS = {};
const CATEGORY_STATS = {};

let isInitialized = false;

function normalizeQuery(q) {
  if (!q || typeof q !== 'string') return '';
  return q.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function determineVerdict(q, category, country, prof) {
  const qLower = q.toLowerCase();
  if (qLower.startsWith('what does ') && qLower.includes(' mean')) {
    const termMatch = q.match(/what does (.*?) mean/i);
    const term = termMatch ? termMatch[1].trim() : 'this concept';
    return `In ${country}, "${term}" is defined under ${prof.immigAct} and related statutory instruments as a regulated legal procedure governed by ${prof.immigAuth}.`;
  }
  if (qLower.startsWith('who can use ') || qLower.includes('who can access')) {
    return `Eligibility is restricted to individuals holding verified lawful status (citizens, permanent residents, or authorized temporary visa holders) meeting statutory entitlement requirements in ${country}.`;
  }
  if (qLower.startsWith('where can i find official information')) {
    return `Official, legally binding guidance is published by ${prof.immigAuth} at ${prof.immigUrl} and in official statutory registers.`;
  }
  if (qLower.startsWith('which documents are normally needed') || qLower.includes('what documents apply')) {
    return `Normally required primary documents include valid passport/identity documents, official proof of legal immigration status, proof of local residential address, and completed statutory application forms.`;
  }
  if (qLower.startsWith('how do i start the process') || qLower.startsWith('what steps')) {
    return `The process begins by verifying statutory eligibility, preparing verified supporting documentation, and submitting the formal application through the official portal of ${prof.immigAuth}.`;
  }
  if (qLower.startsWith('is ') && (qLower.includes('federal') || qLower.includes('provincial') || qLower.includes('state') || qLower.includes('local'))) {
    if (category.includes('Transit') || category.includes('Municipal') || category.includes('Community')) {
      return `This is primarily administered at the local or municipal level under delegated provincial/state legislation in ${country}.`;
    }
    if (category.includes('Housing') || category.includes('Healthcare') || category.includes('Driving') || category.includes('Schools')) {
      return `This is administered at the provincial or state level in ${country}, within broad national statutory standards.`;
    }
    return `This is administered at the federal/national level under primary legislation governed by ${prof.immigAuth} in ${country}.`;
  }
  if (qLower.startsWith('as a ') && qLower.includes('how do i deal with')) {
    return `Applicants in this situation are protected by statutory safeguards under ${prof.immigAct}; recourse involves submitting formal documentation to ${prof.immigAuth} or competent tribunals.`;
  }
  if (qLower.startsWith('which official agency should i contact')) {
    return `You should contact ${prof.immigAuth} or the designated local competent authority, preparing full identity, status, and certified supporting evidence.`;
  }
  if (qLower.includes('common mistakes and scams') || qLower.includes('fraud')) {
    return `Common pitfalls include relying on unauthorized agents, failing to retain submission receipts, and missing statutory filing deadlines; always verify credentials through ${prof.immigAuth}.`;
  }
  if (qLower.startsWith('what options exist')) {
    return `Available options include applying for statutory status extensions, seeking discretionary administrative relief under ${prof.immigAct}, or pursuing established legal appeal channels.`;
  }
  return `Under ${country} law, this matter is governed by statutory standards enforced by ${prof.immigAuth}; applicants must comply with codified evidentiary and procedural requirements.`;
}

function initGlobalSettlementIndex() {
  if (isInitialized) return;
  const filePath = new URL('../corpus/global_immigration_settlement_20000_questions.md', import.meta.url);
  if (!fs.existsSync(filePath)) {
    console.warn(`[GlobalSettlementResolver] Warning: ${filePath} not found.`);
    isInitialized = true;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let currentTier = 'Basic';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('## ')) {
      const tm = line.match(/^##\s+([A-Za-z]+)/);
      if (tm) currentTier = tm[1];
      continue;
    }
    if (!line.startsWith('- **GMS-Q')) continue;

    const m = line.match(/^-\s+\*\*(GMS-Q\d+)\*\*\s+\[(.*?)\s*\|\s*(.*?)\]\s*(.*)$/);
    if (!m) continue;

    const qId = m[1].trim();
    const numericId = parseInt(qId.replace(/[^0-9]/g, ''), 10);
    const category = m[2].trim();
    const country = m[3].trim();
    const questionText = m[4].trim();

    const prof = COUNTRY_PROFILES[country] || COUNTRY_PROFILES['Canada'];
    const catMeta = CATEGORY_MAP[category] || { topic: 'immigration_law', citationSuffix: 'Statutory Regulations' };

    const citation = `${prof.immigAct}; ${prof.immigReg}; ${category} (${catMeta.citationSuffix})`;
    const statutoryRule = `Under ${country} statutory authority, ${category.toLowerCase()} is regulated by ${prof.immigAuth} pursuant to ${prof.immigAct}. Lawful residents and applicants are entitled to procedural fairness and codified remedies.`;
    const verdict = determineVerdict(questionText, category, country, prof);

    const item = Object.freeze({
      id: qId,
      numericId,
      tier: currentTier,
      category,
      country,
      topic: catMeta.topic || 'settlement_law',
      question: questionText,
      statutoryRule,
      citation,
      verdict,
      authority: prof.immigAuth,
      url: prof.immigUrl
    });

    INDEX_BY_ID.set(qId, item);
    INDEX_BY_ID.set(numericId, item);
    INDEX_BY_QUESTION.set(normalizeQuery(questionText), item);

    // Stats
    TIER_STATS[currentTier] = (TIER_STATS[currentTier] || 0) + 1;
    COUNTRY_STATS[country] = (COUNTRY_STATS[country] || 0) + 1;
    CATEGORY_STATS[category] = (CATEGORY_STATS[category] || 0) + 1;
  }

  isInitialized = true;
}

// Auto-initialize on module load
initGlobalSettlementIndex();

export function resolveGlobalSettlementItem(queryOrId) {
  if (!queryOrId) return null;
  if (!isInitialized) initGlobalSettlementIndex();

  if (typeof queryOrId === 'number') {
    return INDEX_BY_ID.get(queryOrId) || null;
  }

  const s = String(queryOrId).trim();
  if (s.startsWith('GMS-Q') || s.startsWith('Q')) {
    const formatted = s.startsWith('GMS-Q') ? s : 'GMS-' + s;
    const match = INDEX_BY_ID.get(formatted);
    if (match) return match;
    const num = parseInt(s.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && INDEX_BY_ID.has(num)) return INDEX_BY_ID.get(num);
  }

  const numDirect = parseInt(s, 10);
  if (!isNaN(numDirect) && String(numDirect) === s && numDirect >= 1 && numDirect <= 20000) {
    return INDEX_BY_ID.get(numDirect) || null;
  }

  const norm = normalizeQuery(s);
  if (INDEX_BY_QUESTION.has(norm)) {
    return INDEX_BY_QUESTION.get(norm);
  }

  return null;
}

export function searchGlobalSettlement(options = {}) {
  if (!isInitialized) initGlobalSettlementIndex();

  const opts = typeof options === 'string' ? { query: options } : (options || {});
  const { query, country, category, tier, limit = 20, offset = 0 } = opts;

  const normQ = query ? normalizeQuery(query) : '';
  const tokens = normQ ? normQ.split(/\s+/).filter(t => t.length >= 3) : [];
  const lim = Math.max(1, Math.min(200, Number(limit) || 20));
  const off = Math.max(0, Number(offset) || 0);

  const matched = [];

  for (let id = 1; id <= 20000; id++) {
    const item = INDEX_BY_ID.get(id);
    if (!item) continue;

    if (country && item.country.toLowerCase() !== country.toLowerCase()) continue;
    if (category && item.category.toLowerCase() !== category.toLowerCase()) continue;
    if (tier && item.tier.toLowerCase() !== tier.toLowerCase()) continue;

    if (normQ) {
      const qNorm = normalizeQuery(item.question);
      let score = 0;
      if (qNorm.includes(normQ)) {
        score += 100;
      } else if (tokens.length > 0) {
        for (const token of tokens) {
          if (qNorm.includes(token)) score += 10;
          else if (item.category.toLowerCase().includes(token)) score += 5;
          else if (item.statutoryRule && item.statutoryRule.toLowerCase().includes(token)) score += 2;
        }
      }

      if (score === 0) continue;
      matched.push({ item, score });
    } else {
      matched.push({ item, score: 1 });
    }
  }

  if (normQ) {
    matched.sort((a, b) => b.score - a.score || a.item.numericId - b.item.numericId);
  }

  const total = matched.length;
  const items = matched.slice(off, off + lim).map(m => m.item);

  return {
    total,
    offset: off,
    limit: lim,
    items
  };
}

export function getGlobalSettlementStats() {
  if (!isInitialized) initGlobalSettlementIndex();

  return {
    totalQuestions: INDEX_BY_ID.size / 2, // Divided by 2 due to string & numeric keys
    range: 'GMS-Q00001 - GMS-Q20000',
    tiers: { ...TIER_STATS },
    countries: { ...COUNTRY_STATS },
    categories: { ...CATEGORY_STATS }
  };
}
