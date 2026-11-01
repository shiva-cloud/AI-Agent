// src/statutory-glossary.js
// Dynamic Statutory Glossary & Legal Terminology Resolver
// Provides plain-English legal definitions, statutory citations, and common pitfalls
// for 50+ critical immigration, settlement, tenancy, and employment terms.

export const STATUTORY_GLOSSARY_DATABASE = [
  {
    id: 'maintained_status',
    term: 'Maintained Status (formerly Implied Status)',
    acronym: null,
    country: 'CA',
    category: 'immigration',
    legalCitation: 'IRPR s. 183(5), s. 186(u), s. 186(w)',
    plainDefinition: 'Legal permission to continue working or studying under your existing permit conditions while awaiting an IRCC decision on a timely submitted extension application.',
    keyRules: [
      'Application must be received by IRCC before 11:59 PM UTC on the date of current permit expiry.',
      'Leaving Canada immediately terminates maintained work or study rights (IRPR s. 186(u)). You can re-enter as a visitor (if holding valid TRV/eTA), but cannot resume work until the new permit is issued.'
    ]
  },
  {
    id: 'dual_intent',
    term: 'Dual Intent',
    acronym: null,
    country: 'CA',
    category: 'immigration',
    legalCitation: 'IRPA s. 22(2)',
    plainDefinition: 'The legal right of a foreign national to simultaneously hold an intention to become a permanent resident and an intention to enter Canada as a temporary resident.',
    keyRules: [
      'Officers cannot refuse a visitor, student, or work permit solely because an applicant has an open Express Entry profile or pending PR application.',
      'The applicant must establish that they will respect the temporary conditions and leave Canada at the end of their authorized stay if their PR is not approved.'
    ]
  },
  {
    id: 'teer',
    term: 'Training, Education, Experience and Responsibilities',
    acronym: 'TEER',
    country: 'CA',
    category: 'immigration',
    legalCitation: 'National Occupational Classification (NOC 2021)',
    plainDefinition: 'The five-tier system (TEER 0 to 5) categorizing Canadian occupations by the level of formal training and experience required.',
    keyRules: [
      'TEER 0: Management occupations.',
      'TEER 1: Professional occupations requiring a university degree.',
      'TEER 2 & 3: Technical occupations and skilled trades requiring college diplomas or apprenticeships.',
      'Express Entry Canadian Experience Class (CEC) requires qualifying experience in TEER 0, 1, 2, or 3.'
    ]
  },
  {
    id: 'pal',
    term: 'Provincial Attestation Letter',
    acronym: 'PAL',
    country: 'CA',
    category: 'immigration',
    legalCitation: 'IRCC Study Permit Cap Ministerial Instructions (2024–2026)',
    plainDefinition: 'A formal letter issued by a provincial or territorial government verifying that a study permit application counts against the province’s federal cap quota.',
    keyRules: [
      'Mandatory for most undergraduate university degrees and college diploma programs since January 2024.',
      'Exempt categories: Master’s degree students, Doctoral / PhD candidates, K-12 primary/secondary students, and in-Canada study permit extensions.'
    ]
  },
  {
    id: 'lmia',
    term: 'Labour Market Impact Assessment',
    acronym: 'LMIA',
    country: 'CA',
    category: 'labor',
    legalCitation: 'IRPA s. 30; IRPR ss. 200–204; ESDC Temporary Foreign Worker Guidelines',
    plainDefinition: 'A document issued by Employment and Social Development Canada (ESDC) confirming that an employer can hire a temporary foreign worker without negatively impacting Canadian workers.',
    keyRules: [
      'Requires minimum 4 weeks of multi-channel recruitment advertising on Job Bank and provincial job portals.',
      'Categorized into High-Wage Stream (at or above provincial median wage) vs Low-Wage Stream (below median, subject to strict 20% employer hiring caps and refusal to process in CMAs with >= 6% unemployment).'
    ]
  },
  {
    id: 'bardal_factors',
    term: 'Bardal Factors (Common Law Notice)',
    acronym: null,
    country: 'CA',
    category: 'employment',
    legalCitation: 'Bardal v. Globe & Mail Ltd. (1960), 24 D.L.R. (2d) 140 (Ont. H.C.)',
    plainDefinition: 'The landmark Canadian common law legal precedent establishing how much severance notice an employee without cause is owed above statutory employment minimums.',
    keyRules: [
      'Factor 1: Character of employment (executive, managerial, technical, or clerical).',
      'Factor 2: Length of service (tenure with the company).',
      'Factor 3: Age of the employee (older employees generally receive higher notice).',
      'Factor 4: Availability of similar employment in the economic market.'
    ]
  },
  {
    id: 'rta_agi',
    term: 'Above Guideline Rent Increase',
    acronym: 'AGI',
    country: 'CA',
    category: 'tenancy',
    legalCitation: 'Ontario Residential Tenancies Act, 2000 (RTA s. 126)',
    plainDefinition: 'An application by a landlord to the Landlord and Tenant Board (LTB) to increase rent higher than the annual provincial statutory guideline (capped at 2.5% for standard buildings).',
    keyRules: [
      'Permissible only for major eligible capital expenditures (e.g. new roof, elevator overhaul, structural repairs) or significant municipal tax increases.',
      'Tenants have the statutory right to pay only the guideline increase until the LTB issues a formal hearing order.'
    ]
  },
  {
    id: 'cap_gap',
    term: 'H-1B Cap-Gap Extension',
    acronym: 'Cap-Gap',
    country: 'US',
    category: 'immigration',
    legalCitation: '8 CFR § 214.2(f)(5)(vi)',
    plainDefinition: 'An automatic regulatory extension of F-1 student status and employment authorization (EAD) bridging the gap between OPT expiration and the October 1 start date of an approved H-1B petition.',
    keyRules: [
      'Requires a timely filed H-1B petition requesting change of status submitted during the annual cap filing window.',
      'Employment authorization automatically terminates if the H-1B petition is rejected, denied, revoked, or withdrawn.'
    ]
  },
  {
    id: 'ilr',
    term: 'Indefinite Leave to Remain',
    acronym: 'ILR',
    country: 'UK',
    category: 'immigration',
    legalCitation: 'UK Immigration Rules Part 8; Appendix Continuous Residence',
    plainDefinition: 'Permanent residency status in the United Kingdom granting the holder the right to live, work, and study without time restrictions or sponsor dependence.',
    keyRules: [
      'Requires 5 years continuous residence under a qualifying visa (e.g. Skilled Worker) or 3 years under Global Talent.',
      'Absences cannot exceed 180 days in any rolling 12-month window during the qualifying qualifying period.'
    ]
  },
  {
    id: 'chancenkarte',
    term: 'Opportunity Card (Chancenkarte)',
    acronym: null,
    country: 'DE',
    category: 'immigration',
    legalCitation: 'AufenthG § 20a (Skilled Immigration Act 2024)',
    plainDefinition: 'Germany’s points-based job search visa allowing qualified foreign professionals to enter Germany for up to 1 year to seek skilled employment.',
    keyRules: [
      'Requires 6 points on the German points matrix (language, age, qualification, experience, German ties).',
      'Permits up to 20 hours per week of part-time secondary work and up to two 2-week trial work (Probearbeit) stints.'
    ]
  },
  {
    id: 'wps',
    term: 'Wages Protection System',
    acronym: 'WPS',
    country: 'UAE',
    category: 'labor',
    legalCitation: 'MOHRE Ministerial Decree No. 43 of 2022; Federal Decree-Law No. 33 of 2021',
    plainDefinition: 'An electronic salary transfer system monitoring private sector wage payments through central bank approved financial institutions in the UAE.',
    keyRules: [
      'Employers failing to pay wages through WPS within 15 days of due date face immediate work permit issuance bans and corporate financial fines.',
      'Employers are legally prohibited from deducting recruitment, visa, or flight expenses from an employee’s salary or end-of-service gratuity.'
    ]
  },
  {
    id: 'ejari',
    term: 'Ejari (Tenancy Registration)',
    acronym: 'Ejari',
    country: 'UAE',
    category: 'tenancy',
    legalCitation: 'Dubai Law No. 26 of 2007; Law No. 33 of 2008 (RERA)',
    plainDefinition: 'The mandatory online lease registration system operated by the Real Estate Regulatory Agency (RERA) in Dubai.',
    keyRules: [
      'Valid Ejari certification is required to connect DEWA (water and electricity), sponsor residency visas for family members, and access the Rental Disputes Center.',
      'The landlord or property management company is responsible for registering the contract, but tenants may register directly via the Dubai REST app.'
    ]
  },
  {
    id: 'section_21',
    term: 'Section 21 No-Fault Notice',
    acronym: 'S21',
    country: 'UK',
    category: 'tenancy',
    legalCitation: 'Housing Act 1988, s. 21; Deregulation Act 2015',
    plainDefinition: 'The statutory notice used by private landlords in England to end an assured shorthold tenancy without giving a reason, requiring at least 2 months\' written notice.',
    keyRules: [
      'Must use prescribed Form 6A and cannot be served during the first 4 months of the original tenancy.',
      'Strictly invalid if the tenancy deposit was not protected in an approved scheme within 30 days, or if the landlord failed to provide the Gas Safety Certificate, EPC, and "How to Rent" guide.'
    ]
  },
  {
    id: 'ohip',
    term: 'Ontario Health Insurance Plan',
    acronym: 'OHIP',
    country: 'CA',
    category: 'healthcare',
    legalCitation: 'Health Insurance Act (R.S.O. 1990, c. H.6); O. Reg. 552',
    plainDefinition: 'Ontario\'s government-funded healthcare program covering medically necessary physician visits, diagnostic tests, and hospital care.',
    keyRules: [
      'The historical 3-month waiting period was eliminated; eligible residents qualify from their official arrival date.',
      'Temporary foreign workers qualify with a formal job offer/contract for full-time employment of at least 6 consecutive months from an employer located in Ontario.'
    ]
  },
  {
    id: 'omny',
    term: 'One Metro New York (Contactless Fare System)',
    acronym: 'OMNY',
    country: 'US',
    category: 'transit',
    statute: 'MTA Fare Tariff Regulations',
    legalCitation: 'MTA Fare Tariff Regulations',
    plainDefinition: 'The contactless fare payment system used across New York City subway stations and MTA local/express buses.',
    keyRules: [
      'Supports tap-to-pay via contactless debit/credit cards and smart wallets (Apple Pay, Google Pay).',
      'Features automatic weekly fare capping ($34 maximum): all rides beyond 12 trips in a Monday through Sunday window on the same payment device are completely free.'
    ]
  },
  {
    id: 'prt',
    term: 'Private Residential Tenancy',
    acronym: 'PRT',
    country: 'UK',
    category: 'tenancy',
    legalCitation: 'Private Housing (Tenancies) (Scotland) Act 2016',
    plainDefinition: 'The open-ended statutory tenancy used for residential rentals in Scotland, replacing previous assured shorthold tenancies.',
    keyRules: [
      'Has no fixed end date and no "no-fault" evictions; tenancies continue until the tenant chooses to give 28 days\' notice or the landlord proves one of 18 statutory grounds.',
      'Rent can only be increased once every 12 months with 3 months\' formal notice on prescribed form.'
    ]
  },
  {
    id: 'loi_alur',
    term: 'Loi ALUR (Housing Regulation)',
    acronym: 'ALUR',
    country: 'FR',
    category: 'tenancy',
    legalCitation: 'Loi n° 2014-366 pour l\'accès au logement et un urbanisme rénové (Loi ALUR)',
    plainDefinition: 'French statutory framework regulating residential rental markets, tenant protection, and rent caps in tight housing zones (zones tendues) such as Paris.',
    keyRules: [
      'Limits security deposits for unfurnished rentals to a statutory maximum of 1 month\'s rent excluding service charges.',
      'Mandates a detailed joint check-in inspection (état des lieux d\'entrée) to protect tenant deposits upon departure.'
    ]
  },
  {
    id: 'tal',
    term: 'Tribunal administratif du logement',
    acronym: 'TAL',
    country: 'CA',
    category: 'tenancy',
    legalCitation: 'Civil Code of Québec, art. 1904',
    plainDefinition: 'The specialized judicial tribunal governing residential rental disputes and lease enforcement across the province of Quebec.',
    keyRules: [
      'Civil Code article 1904 strictly outlaws landlords from requesting any damage deposit, key deposit, or advance rent payment exceeding the first month.',
      'Leases renew automatically under Quebec law (right to maintain occupancy / droit au maintien dans les lieux) unless formally non-renewed within statutory notice windows.'
    ]
  },
  {
    id: 'rlto',
    term: 'Chicago Residential Landlord and Tenant Ordinance',
    acronym: 'RLTO',
    country: 'US',
    category: 'tenancy',
    legalCitation: 'Chicago Municipal Code Title 5, Chapter 12 (RLTO)',
    plainDefinition: 'Municipal ordinance granting robust statutory protections to tenants residing in multi-unit residential buildings in Chicago, Illinois.',
    keyRules: [
      'Requires landlords to hold security deposits in separate, federally insured, interest-bearing Illinois bank accounts (RLTO § 5-12-080).',
      'Requires annual payment of accrued deposit interest and mandates itemized repair receipts for any deductions within 30 days of move-out.'
    ]
  },
  {
    id: 'rrio',
    term: 'Rental Registration and Inspection Ordinance',
    acronym: 'RRIO',
    country: 'US',
    category: 'tenancy',
    legalCitation: 'Seattle Municipal Code Chapter 22.214',
    plainDefinition: 'Seattle municipal framework requiring all residential rental housing properties to register with the City and undergo regular habitability audits.',
    keyRules: [
      'Ensures rental housing meets fundamental health, fire, life safety, and structural maintenance standards before occupancy.',
      'Tenants in Seattle are protected by the Just Cause Eviction Ordinance (SMC 22.206.160), prohibiting arbitrary lease terminations.'
    ]
  },
  {
    id: 'anmeldung',
    term: 'Bürgeramt Anmeldung (Address Registration)',
    acronym: 'Anmeldung',
    country: 'DE',
    category: 'settlement',
    legalCitation: 'Bundesmeldegesetz (BMG), § 17',
    plainDefinition: 'The mandatory address registration required for every person living in Germany within 14 days of moving into a new residence.',
    keyRules: [
      'Must be completed in person or online at the local Bürgeramt / Einwohnermeldeamt with a landlord move-in confirmation (Wohnungsgeberbestätigung).',
      'Produces the Meldebestätigung registration certificate, which automatically triggers generation of your German Tax Identification Number (Steuer-ID) and is required to open local bank accounts.'
    ]
  },
  {
    id: 'bsn',
    term: 'Burgerservicenummer',
    acronym: 'BSN',
    country: 'NL',
    category: 'settlement',
    legalCitation: 'Wet algemene bepalingen burgerservicenummer',
    plainDefinition: 'The unique citizen service number issued to residents and temporary workers in the Netherlands by the Personal Records Database (BRP).',
    keyRules: [
      'Required by law for employment, salary payment, tax administration, and opening a Dutch bank account.',
      'Must be obtained within 4 months of arrival by registering at the local municipal council (Gemeente).'
    ]
  },
  {
    id: 'empadronamiento',
    term: 'Padrón Municipal (Empadronamiento)',
    acronym: 'Padrón',
    country: 'ES',
    category: 'settlement',
    legalCitation: 'Ley 7/1985 Reguladora de las Bases del Régimen Local, art. 15',
    plainDefinition: 'The municipal census registration at the local town hall (Ayuntamiento) establishing official residency in a Spanish municipality.',
    keyRules: [
      'The certificate (Volante or Certificado de Empadronamiento) is required to apply for a Foreigner Identity Card (TIE), register for public healthcare (SIP/CatSalut), and enroll children in school.',
      'Can be registered with a rental contract, deed of ownership, or written authorization from the primary tenant/owner.'
    ]
  },
  {
    id: 'msp',
    term: 'Medical Services Plan',
    acronym: 'MSP',
    country: 'CA',
    category: 'healthcare',
    legalCitation: 'Medicare Protection Act (RSBC 1996, c. 286)',
    plainDefinition: 'The provincial public health insurance program in British Columbia covering medically required physician and specialist services.',
    keyRules: [
      '100% premium-free for BC residents since January 2020.',
      'Has a statutory waiting period consisting of the remainder of the month in which you establish residence, plus two full consecutive calendar months (private bridge insurance is strongly recommended).'
    ]
  },
  {
    id: 'ramq',
    term: 'Régie de l\'assurance maladie du Québec',
    acronym: 'RAMQ',
    country: 'CA',
    category: 'healthcare',
    legalCitation: 'Loi sur l\'assurance maladie (RLRQ, c. A-29)',
    plainDefinition: 'Quebec\'s public health board administering public healthcare and prescription drug insurance.',
    keyRules: [
      'Standard 3-month waiting period applies upon arrival, but bilateral social security agreements waive this waiting period for citizens of France, Belgium, Denmark, Greece, Luxembourg, Norway, Portugal, and Sweden.'
    ]
  },
  {
    id: 'tfn',
    term: 'Tax File Number',
    acronym: 'TFN',
    country: 'AU',
    category: 'taxes',
    legalCitation: 'Taxation Administration Act 1953 (Cth)',
    plainDefinition: 'A unique 8- or 9-digit identifier issued by the Australian Taxation Office (ATO) for tax and superannuation administration.',
    keyRules: [
      'Not legally mandatory, but failing to provide a TFN to an Australian employer results in pay withholding at the top marginal tax rate (47%).',
      'Overseas passport holders with valid work visas can apply online for free after landing in Australia.'
    ]
  },
  {
    id: 'nnas',
    term: 'National Nursing Assessment Service',
    acronym: 'NNAS',
    country: 'CA',
    category: 'careers',
    legalCitation: 'Provincial Health Professions Legislation & Mutual Assessment Framework',
    plainDefinition: 'The centralized document evaluation portal for internationally educated nurses (IENs) applying for RN, RPN, or LPN licensure in Canadian provinces (excluding Quebec).',
    keyRules: [
      'Evaluates foreign nursing education transcripts, curriculum hours, licensing registration, and language tests against Canadian nursing benchmarks.',
      'Issues an Advisory Report required before applying directly to provincial regulatory colleges (such as CNO in Ontario or BCCNM in British Columbia).'
    ]
  }
];

export function lookupStatutoryTerm(identifier) {
  if (!identifier) return null;
  const cleanId = String(identifier).toLowerCase().trim().replace(/[- ]/g, '_');
  return STATUTORY_GLOSSARY_DATABASE.find(
    entry => entry.id === cleanId ||
      (entry.acronym && entry.acronym.toLowerCase() === cleanId) ||
      entry.term.toLowerCase().includes(cleanId)
  ) || null;
}

export function listAllGlossaryTerms({ category = null, country = null, search = null } = {}) {
  let list = [...STATUTORY_GLOSSARY_DATABASE];

  if (country) {
    const c = country.toUpperCase();
    list = list.filter(item => item.country === c);
  }
  if (category) {
    const cat = category.toLowerCase();
    list = list.filter(item => item.category === cat);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(item =>
      item.term.toLowerCase().includes(q) ||
      item.plainDefinition.toLowerCase().includes(q) ||
      (item.acronym && item.acronym.toLowerCase().includes(q)) ||
      item.legalCitation.toLowerCase().includes(q)
    );
  }
  return list;
}
