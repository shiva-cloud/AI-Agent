// Full Spectrum Global Immigration & Settlement Statutory Records
// Covering Pre-Immigration, Visas, Permanent Residency, Arrival, and Settlement
// across Singapore, France, Netherlands, Sweden, Spain, USA, UK, Australia, Germany, and New Zealand.

export const checkedAt = '2026-10-31';
export const expiresAt = '2027-01-31';

function createRecord({ id, topic, jurisdiction, title, url, quote, summary, housingSubject }) {
  return {
    id,
    topic,
    jurisdiction,
    title,
    url,
    quote,
    summary,
    ...(housingSubject ? { housingSubject } : {}),
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt,
    expiresAt,
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official statutory and immigration operational policy manual inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T14:00:00.000Z',
    reviewMethod: 'editorial_review'
  };
}

export const fullSpectrumRecords = [
  // ══════════════════════════════════════════════════════════════════════════════
  // SECTION 1: PRE-IMMIGRATION GLOBAL STATUTORY BENCHMARKS
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'global-police-clearance-certificates-statutory-standards',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'Statutory Standards: Police Clearance Certificates (PCC) for Global Immigration',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates/about.html',
    quote: 'Police certificates for immigration and citizenship',
    summary: 'Applicants applying for permanent residency or long-term work permits in Canada, the United States, the United Kingdom, Australia, and New Zealand must submit official Police Clearance Certificates (PCC) from every country lived in for 6 or 12 consecutive months since age 16 or 18. Common statutory certificates include the FBI Identity History Summary (IdHS) with fingerprint card FD-258 in the US, ACRO Police Certificate in the UK, Australian Federal Police (AFP) National Police Check Code 33, and German Führungszeugnis. Certificates must be issued within 6 to 12 months of application submission and accompanied by certified English or French translations with notarized translator affidavits. This record does not issue police certificates.'
  }),
  createRecord({
    id: 'global-educational-credential-assessment-equivalencies',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'Statutory Standards: Educational Credential Assessments (ECA) for Skilled Migration',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessed.html',
    quote: 'Educational credential assessment (ECA) for Express Entry',
    summary: 'Skilled immigration programs worldwide require formal verification that foreign academic credentials equal domestic educational standards. Canada mandates an Educational Credential Assessment (ECA) from designated bodies such as WES, ICAS, or IQAS, valid for 5 years. Australia requires formal skills assessment through occupational authorities including VETASSESS, ACS (computing), and Engineers Australia. Germany evaluates university degrees through the Central Office for Foreign Education (ZAB) and the Anabin database. The UK uses ECCTIS statements of comparability, and the Netherlands utilizes Nuffic evaluations. Applicants must submit official transcripts sent directly from degree-granting universities. This record does not issue credential equivalency assessments.'
  }),
  createRecord({
    id: 'global-proof-of-funds-and-financial-maintenance',
    topic: 'money',
    jurisdiction: 'CA',
    title: 'Statutory Standards: Settlement Funds, Maintenance, and Sperrkonto Blocked Accounts',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html',
    quote: 'Proof of funds - Skilled immigrants (Express Entry)',
    summary: 'Immigration authorities mandate unencumbered, liquid settlement funds to prevent newcomers from becoming a public charge. Canada requires Express Entry applicants without an approved Canadian job offer to prove liquid funds based on 50% of the Low Income Cut-Off (LICO), adjusted annually for family size (minimum CAD 14,690 for a single applicant). Germany requires a legally binding blocked bank account (Sperrkonto) holding at least EUR 11,904 per year for student and job seeker visas. The UK requires 28 consecutive days of maintenance funds (£1,270 for skilled workers) held in a regulated financial institution. Funds must be readily accessible cash deposits; equity, real estate, and borrowed personal loans are strictly disallowed. This record does not provide financial settlement loans.'
  }),

  // ══════════════════════════════════════════════════════════════════════════════
  // SECTION 2: SINGAPORE — WORK PASSES, PR, POST-ARRIVAL & SETTLEMENT
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'sg-mom-employment-pass-compass-framework',
    topic: 'employment',
    jurisdiction: 'Singapore',
    title: 'MOM: Employment Pass (EP) Eligibility, COMPASS 40-Point Rubric, and Salary Thresholds',
    url: 'https://www.mom.gov.sg/passes-and-permits/employment-pass/eligibility',
    quote: 'Employment Pass eligibility: COMPASS',
    summary: 'The Singapore Ministry of Manpower (MOM) grants Employment Passes (EP) to foreign managers, executives, and specialized professionals earning a minimum qualifying monthly salary of SGD 5,000 (increasing progressively with age up to SGD 10,500 at age 45), with a higher threshold of SGD 5,500 to SGD 11,500 in financial services. In addition to the salary requirement, candidates must score at least 40 points on the Complementarity Assessment Framework (COMPASS) across 4 foundational criteria: salary benchmark relative to local peers (C1), degree-level qualifications from accredited institutions (C2), nationality diversity within the firm (C3), and support for local PMET employment (C4). Bonus points are awarded for occupations on the Shortage Occupation List (SOL) and strategic economic partnerships. This record does not issue Singapore Employment Passes.'
  }),
  createRecord({
    id: 'sg-mom-s-pass-quota-and-salary-tiers',
    topic: 'employment',
    jurisdiction: 'Singapore',
    title: 'MOM: S-Pass Criteria, Dependency Ratio Ceiling (DRC), and Foreign Worker Levies',
    url: 'https://www.mom.gov.sg/passes-and-permits/s-pass/eligibility',
    quote: 'S Pass eligibility',
    summary: 'The Singapore S-Pass is designed for mid-level skilled technical staff who earn at least SGD 3,150 per month (increasing with age up to SGD 4,650), or SGD 3,650 in the financial services sector. Employers must satisfy the Dependency Ratio Ceiling (DRC), which caps S-Pass holders at 10% to 15% of the total workforce depending on the industry sector (services vs manufacturing/construction). Employers must pay a monthly foreign worker levy per S-Pass worker (Tier 1 at SGD 550; Tier 2 at SGD 650) and provide mandatory health insurance coverage of at least SGD 60,000 per year for inpatient care. Holders earning at least SGD 6,000 per month can sponsor spouses and children on Dependant Passes. This record does not issue S-Pass work authorizations.'
  }),
  createRecord({
    id: 'sg-mom-one-pass-and-entrepass',
    topic: 'employment',
    jurisdiction: 'Singapore',
    title: 'MOM: ONE Pass (Overseas Networks & Expertise) and EntrePass Innovation Schemes',
    url: 'https://www.mom.gov.sg/passes-and-permits/overseas-networks-and-expertise-pass',
    quote: 'Overseas Networks & Expertise Pass',
    summary: 'Top global talent in business, arts, sports, science, and academia can obtain the Overseas Networks and Expertise (ONE) Pass from MOM. Applicants must demonstrate a fixed monthly salary of at least SGD 30,000 from an established employer or prospective Singapore employer, or outstanding achievements in arts, culture, sports, or research. The ONE Pass grants a 5-year personalized work permit, allows concurrent employment across multiple enterprises, and provides spouses with a Letter of Consent (LOC) to work without needing an independent EP. For early-stage tech founders, the EntrePass provides residency backed by government-partnered venture capitalists, business angels, or recognized incubators (SGInnovate) with no strict initial paid-up capital requirement. This record does not grant investment passes.'
  }),
  createRecord({
    id: 'sg-singpass-and-epsc-biometric-registration',
    topic: 'community',
    jurisdiction: 'Singapore',
    title: 'MOM & GovTech: Singpass Digital Identity, FIN Number, and EPSC Card Registration',
    url: 'https://www.singpass.gov.sg/main/html/about-us.html',
    quote: 'About Singpass',
    summary: 'Upon receiving MOM In-Principle Approval (IPA), foreign pass holders enter Singapore and must complete formal card registration. The employer must issue the pass online within the IPA validity window, and the newcomer must book an appointment at the Employment Pass Services Centre (EPSC) for biometric enrollment (fingerprints and digital photo). MOM issues the physical Long-Term Pass card displaying the Foreign Identification Number (FIN). Pass holders can then register for Singpass, Singapore national digital identity platform, enabling secure two-factor authentication (2FA) access to government portals (IRAS tax, CPF board, MyICA), public hospital portals, and mobile banking applications. This record does not register digital identity accounts.'
  }),
  createRecord({
    id: 'sg-cpf-and-iras-tax-residency',
    topic: 'money',
    jurisdiction: 'Singapore',
    title: 'IRAS & CPF: Foreigner CPF Exemption, SPR Graduated Contribution, and Tax Residency Rules',
    url: 'https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates',
    quote: 'Individual Income Tax Rates',
    summary: 'In Singapore, Central Provident Fund (CPF) social security contributions are legally mandatory only for Singapore Citizens and Singapore Permanent Residents (SPR). Foreign workers on EP, S-Pass, or ONE Pass are exempt from CPF contributions, and voluntary foreign contributions are disallowed. Upon obtaining SPR status, employers and employees make graduated CPF contributions (first year: 5% employee / 4% employer; second year: 15% employee / 9% employer; third year onwards: full statutory 20% employee / 17% employer for workers aged 55 and below). Under Inland Revenue Authority of Singapore (IRAS) rules, a foreigner who stays or works in Singapore for 183 days or more in a calendar year is treated as a tax resident and taxed at progressive resident rates (0% to 24%), with access to personal tax reliefs. This record does not calculate individual tax returns.'
  }),
  createRecord({
    id: 'sg-ura-housing-and-mom-healthcare',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Singapore',
    title: 'URA & MOM: Private Tenancy 3-Month Minimum Rule, HDB Quota, and Healthcare Mandates',
    url: 'https://www.ura.gov.sg/Corporate/Property/Residential/Renting-Property',
    quote: 'Renting out your residential property',
    summary: 'Under Urban Redevelopment Authority (URA) regulations, private residential properties in Singapore cannot be rented out for short-term stays; leases must have a minimum duration of 3 consecutive months. Maximum occupancy is capped at 6 unrelated persons per private dwelling. In public Housing & Development Board (HDB) flats, foreigners on valid passes can rent only if the flat owner has completed the 5-year Minimum Occupation Period (MOP) and the non-citizen quota (8% for the neighbourhood, 11% for the block) has not been breached. MOM mandates that employers of S-Pass and Work Permit holders provide comprehensive medical insurance with an annual claim limit of at least SGD 60,000 for hospitalisation and surgical procedures. EP holders must arrange employer-sponsored or private health insurance as foreigners do not qualify for subsidized public healthcare. This record does not mediate tenancy disputes.'
  }),

  // ══════════════════════════════════════════════════════════════════════════════
  // SECTION 3: FRANCE — SKILLED VISAS, PR, POST-ARRIVAL & SETTLEMENT
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'fr-service-public-passeport-talent-salarie-qualifie',
    topic: 'employment',
    jurisdiction: 'France',
    title: 'Service-Public: Passeport Talent Salarié Qualifié, French Tech Visa, and Family Rights',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F16922',
    quote: 'Carte de séjour Passeport talent - Salarié qualifié',
    summary: 'The French Passeport Talent (Salarié qualifié / Entreprise innovante) under CESEDA Article L421-9 is a 4-year renewable multi-year residence permit granted to highly qualified professionals. Applicants must hold a professional master degree or equivalent and an employment contract of at least 3 months with gross annual compensation of at least twice the statutory minimum wage (SMIC), approximately EUR 42,400 per year. For employees of officially recognized innovative startups (French Tech Visa), the salary threshold is reduced to 1x SMIC. The employer is exempt from labour market testing (no situation de l emploi check required). Spouses automatically receive a Passeport Talent (Famille) permit authorizing full unrestricted employment in France without a separate work permit. This record does not issue French visas.'
  }),
  createRecord({
    id: 'fr-service-public-carte-bleue-europeenne',
    topic: 'employment',
    jurisdiction: 'France',
    title: 'Service-Public: EU Blue Card France (Carte Bleue Européenne) Rules and EU Mobility',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F20689',
    quote: 'Carte de séjour Carte bleue européenne',
    summary: 'Foreign highly skilled workers in France can obtain the EU Blue Card (Carte Bleue Européenne) under CESEDA Article L421-11. Applicants must possess a diploma certifying at least 3 years of higher education or 5 years of comparable professional experience, a work contract of at least 6 months, and gross annual salary at least 1.5 times the gross average reference salary in France (statutory threshold of EUR 53,836 per year). The permit is issued for 1 to 4 years. After 12 months of legal employment with an EU Blue Card in France, holders can move to another EU Member State for highly qualified work under simplified procedures. Blue Card holders can obtain EU Long-Term Resident status after 5 years of continuous legal residence in the EU, provided the last 2 years were in France. This record does not issue work permits.'
  }),
  createRecord({
    id: 'fr-service-public-carte-de-resident-10-ans-pr',
    topic: 'employment',
    jurisdiction: 'France',
    title: 'Service-Public: Carte de Résident 10 Ans Permanent Residency and Language Standards',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F11211',
    quote: 'Carte de résident de 10 ans d un étranger en France',
    summary: 'Third-country nationals legally residing in France on renewable temporary or multi-year residence permits can apply for the 10-year Permanent Resident Card (Carte de résident de 10 ans) under CESEDA Article L424-1 after 5 years of continuous, uninterrupted legal residence in France. Applicants must demonstrate stable, sufficient, and personal financial resources (at least the statutory minimum wage SMIC, excluding social assistance benefits) and health insurance coverage. Furthermore, applicants must demonstrate republican integration into French society, including certified French language proficiency at CEFR Level A2 or higher and compliance with the fundamental principles of the French Republic. The 10-year card confers indefinite settlement rights and unrestricted commercial or professional employment. This record does not issue permanent resident cards.'
  }),
  createRecord({
    id: 'fr-ofii-cir-contrat-integration-republicaine',
    topic: 'community',
    jurisdiction: 'France',
    title: 'OFII: Online VLS-TS Validation, Medical Exam, and Contrat d Intégration Républicaine (CIR)',
    url: 'https://www.ofii.fr/le-contrat-d-integration-republicaine/',
    quote: 'Le Contrat d Intégration Républicaine',
    summary: 'Upon arriving in France with a Long-Stay Visa acting as Residence Permit (VLS-TS), newcomers must validate their visa online on the ANEF portal within 3 months of entry and pay the statutory tax stamp (taxe de séjour). The French Office for Immigration and Integration (OFII) convenes newcomers for a compulsory appointment consisting of a medical examination, an individual interview, and a language assessment. Most non-exempt newcomers holding multi-year settlement aspirations must sign the Contrat d Intégration Républicaine (CIR). The CIR commits the migrant to 4 days of mandatory civic training regarding French history, democratic values, and institutional systems, as well as up to 600 hours of free French language training if language level A1 is not yet attained. Completion of the CIR is mandatory for renewal of residence cards. This record does not validate visas.'
  }),
  createRecord({
    id: 'fr-ameli-cpam-securite-sociale-carte-vitale',
    topic: 'health',
    jurisdiction: 'France',
    title: 'Ameli & CPAM: French Social Security Registration, Temporary NIR, and Carte Vitale',
    url: 'https://www.ameli.fr/assure/droits-demarches/europe-international/protection-sociale-france',
    quote: 'Vous venez vivre ou travailler en France',
    summary: 'Newcomers residing and working legally in France are entitled to universal health coverage under the Protection Universelle Maladie (PUMA). Foreign workers register online via the dedicated CPAM portal for foreign arrivals (etudiant-etranger.ameli.fr for students, or through employer DSN declaration for salaried workers). CPAM issues an initial temporary social security number (NIR provisoire) allowing healthcare claim reimbursements, followed by a permanent 15-digit NIR upon identity verification. The beneficiary then receives the green electronic Carte Vitale chip card. The statutory Assurance Maladie reimburses approximately 70% of standard medical fees; the remaining out-of-pocket cost (ticket modérateur) is typically reimbursed by a complementary mutual health insurance plan (Mutuelle d entreprise), which employers are legally mandated to co-finance by at least 50%. This record does not register medical coverage.'
  }),
  createRecord({
    id: 'fr-logement-bail-alur-visale-et-droit-au-compte',
    topic: 'housing',
    housingSubject: 'deposit',
    jurisdiction: 'France',
    title: 'Loi ALUR & Banque de France: Tenancy Leases, Deposit Caps, VISALE Guarantor, and Bank Rights',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F31267',
    quote: 'Contrat de location (bail)',
    summary: 'Under the French Housing Tenancy Act (Loi ALUR), residential leases must adhere to statutory standard contracts (bail type): 3 years minimum duration for unfurnished rentals, and 1 year for furnished properties. Security deposits (dépôt de garantie) are legally capped at exactly 1 month of base rent for unfurnished housing and 2 months for furnished rentals. Landlords cannot demand both a security deposit and an external personal guarantor (garant physique) unless the tenant is a student or apprentice. Foreign workers aged under 31 or newcomers entering employment can use VISALE, a free government-backed rental guarantee provided by Action Logement that covers up to 36 months of unpaid rent. Under French monetary law, any legal resident who is denied a bank account by retail banks can exercise the Right to an Account (Droit au compte) via the Banque de France, which legally designates a bank to provide a free basic bank account. This record does not mediate rental leases.'
  }),

  // ══════════════════════════════════════════════════════════════════════════════
  // SECTION 4: NETHERLANDS — WORK VISAS, PR, POST-ARRIVAL & SETTLEMENT
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'nl-ind-highly-skilled-migrant-kennismigrant',
    topic: 'employment',
    jurisdiction: 'Netherlands',
    title: 'IND: Highly Skilled Migrant (Kennismigrant) Scheme, Salary Benchmarks, and Recognized Sponsors',
    url: 'https://ind.nl/en/residence-permits/work/highly-skilled-migrant',
    quote: 'Highly skilled migrant',
    summary: 'The Dutch Immigration and Naturalisation Service (IND) grants Highly Skilled Migrant (Kennismigrant) residence permits to foreign professionals recruited by an IND-recognized sponsor (erkend referent). Employers must meet strict statutory gross monthly salary thresholds (excluding 8% holiday allowance), adjusted annually: for workers aged 30 and older, minimum EUR 5,688 per month; for workers under age 30, minimum EUR 4,171 per month; and a reduced graduate threshold of EUR 2,989 per month for individuals hired within 3 years of graduating from an approved top-200 university or completing a Dutch orientation year. The recognized employer applies on behalf of the migrant through fast-track IND processing (typically 2 weeks). Spouses receive unrestricted open work permission on their dependent residence card. This record does not issue Dutch residence permits.'
  }),
  createRecord({
    id: 'nl-ind-search-year-zoekjaar-orientation-visa',
    topic: 'employment',
    jurisdiction: 'Netherlands',
    title: 'IND: Search Year Visa (Zoekjaar Hoogopgeleiden) for International University Graduates',
    url: 'https://ind.nl/en/residence-permits/work/orientation-year-highly-educated-persons',
    quote: 'Orientation year highly educated persons',
    summary: 'The Dutch Orientation Year for Highly Educated Persons (Zoekjaar) is an open 1-year residence permit granted by IND to international talent to seek employment or start an innovative business in the Netherlands. Applicants qualify if they graduated with a bachelor, master, or PhD from a Dutch higher education institution within the past 3 years, or obtained a master or PhD from an international top-200 university (ranked in top 200 of Times Higher Education, QS, or Shanghai ARWU rankings) and scored minimum IELTS 6.0 English or completed education in English. During the Zoekjaar, the holder has free access to the Dutch labour market (arbeid is vrij toegestaan; geen TWV vereist) and does not require work permit sponsorship. If hired as a Kennismigrant during or directly following the Zoekjaar, the lower graduate salary threshold applies indefinitely for that job. This record does not issue orientation visas.'
  }),
  createRecord({
    id: 'nl-ind-startup-visa-and-self-employed',
    topic: 'employment',
    jurisdiction: 'Netherlands',
    title: 'IND: Startup Visa with Recognized Facilitators and Points-Based Self-Employed Permits',
    url: 'https://ind.nl/en/residence-permits/work/start-up',
    quote: 'Residence permit for start-up',
    summary: 'Foreign entrepreneurs introducing innovative new products or services to the Netherlands can apply for the 1-year Dutch Startup Residence Permit. The applicant must work with a reliable, recognized business mentor (facilitator) accredited in the Netherlands, possess a step-by-step business plan, be registered with the Dutch Chamber of Commerce (KvK), and demonstrate sufficient financial means (at least 70% of the single person statutory minimum wage) without relying on public funds. Following the 1-year startup period, entrepreneurs can transition to a regular self-employed residence permit evaluated on a 300-point rubric administered by the Netherlands Enterprise Agency (RVO) assessing personal experience (100 points), business plan (100 points), and added value for the Dutch economy (100 points). This record does not grant startup visas.'
  }),
  createRecord({
    id: 'nl-ind-permanent-residence-onbepaalde-tijd',
    topic: 'employment',
    jurisdiction: 'Netherlands',
    title: 'IND: Permanent Residence (Verblijfsvergunning voor onbepaalde tijd) and Inburgering Exam',
    url: 'https://ind.nl/en/residence-permits/permanent-residence/permanent-residence-permit-for-foreign-nationals',
    quote: 'Permanent residence permit for foreign nationals',
    summary: 'Third-country nationals who have resided in the Netherlands for 5 consecutive years on a valid, non-temporary residence permit can apply to the IND for a Permanent Residence Permit (Verblijfsvergunning voor onbepaalde tijd). Applicants must demonstrate continuous municipal registration (BRP), independent and sustainable monthly income equal to or exceeding the statutory minimum wage, and successful completion of the Civic Integration Exam (Inburgeringsexamen) covering Dutch language proficiency (reading, listening, writing, and speaking at CEFR Level A2/B1) and Knowledge of Dutch Society (KNS). Temporary stays such as exchange study or seasonal work do not count towards the 5-year requirement. Permanent residence grants indefinite settlement and unrestricted work authorization without requiring employer sponsorship. This record does not grant permanent residency.'
  }),
  createRecord({
    id: 'nl-gemeente-bsn-registration-and-digid',
    topic: 'sin',
    jurisdiction: 'Netherlands',
    title: 'Gemeente: Municipal BRP Registration, Citizen Service Number (BSN), and DigiD Identity',
    url: 'https://www.government.nl/topics/personal-data/citizen-service-number-bsn',
    quote: 'Citizen service number (BSN)',
    summary: 'Anyone planning to live in the Netherlands for more than 4 months must register in person at their local municipality (Gemeente) within 5 days of arrival. Registration in the Municipal Personal Records Database (BRP) requires a valid passport, an apostilled/legalized birth certificate, a recognized rental contract or landlord consent form, and IND residence approval if non-EU. Upon successful registration, the municipality issues the Burgerservicenummer (BSN), a unique 9-digit tax and citizen identification number mandatory for opening Dutch bank accounts, taking out mandatory health insurance, receiving wages, and registering with healthcare providers. With the BSN, residents activate their DigiD, the Dutch national digital identity infrastructure providing secure two-factor access to tax, healthcare, and pension portals. This record does not issue BSN numbers.'
  }),
  createRecord({
    id: 'nl-zorgverzekering-mandatory-basic-health-insurance',
    topic: 'health',
    jurisdiction: 'Netherlands',
    title: 'Zorgverzekeringswet: Mandatory Basic Health Insurance (Basisverzekering) and Healthcare Allowance',
    url: 'https://www.government.nl/topics/health-insurance/standard-health-insurance',
    quote: 'Standard health insurance',
    summary: 'Under the Dutch Health Insurance Act (Zorgverzekeringswet), everyone who lives or works in the Netherlands is legally required to purchase basic statutory health insurance (basisverzekering) from a private insurer within 4 months of arrival. Insurance coverage is retroactive to the date of municipal registration, and insurers are legally prohibited from refusing applicants or charging risk-differentiated premiums based on age or pre-existing conditions. Insured individuals pay a statutory monthly premium (approx EUR 140 to EUR 175) and must satisfy a mandatory annual deductible (eigen risico, statutory standard EUR 385 per year). General practitioner (huisarts) consultations, maternal care, and children under 18 healthcare are exempt from the deductible. Low-income residents can apply via the Belastingdienst for a monthly healthcare allowance (Zorgtoeslag) to offset premium costs. This record does not sell medical insurance policies.'
  }),
  createRecord({
    id: 'nl-tax-30-percent-ruling-and-huurcommissie',
    topic: 'money',
    jurisdiction: 'Netherlands',
    title: 'Belastingdienst: 30% Ruling Tax Facility, WWS Tenancy Points, and Huurcommissie Rent Control',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/en/individuals/content-individuals/coming-to-the-netherlands-30-percent-facility',
    quote: '30% facility for incoming employees',
    summary: 'The Dutch 30% Ruling (30%-regeling) is a tax incentive allowing employers to pay eligible expatriates up to 30% of their gross employment income as a tax-free allowance to compensate for extraterritorial relocation expenses. To qualify, the employee must be recruited from more than 150 km from the Dutch border and meet minimum annual taxable salary thresholds (statutory threshold of EUR 46,107, or EUR 35,048 for master graduates under 30). In the Dutch rental housing market, residential properties are evaluated under the Housing Valuation System (WWS) point system. Leases scoring below the deregulation liberalization threshold (regulated sector) are subject to statutory maximum rent caps, and tenants can challenge excessive rent or unjustified service costs within 6 months of lease commencement through the Rent Tribunal (Huurcommissie). This record does not provide individual tax optimization.'
  }),

  // ══════════════════════════════════════════════════════════════════════════════
  // SECTION 5: SWEDEN — WORK PERMITS, PR, POST-ARRIVAL & SETTLEMENT
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'se-migrationsverket-work-permit-arbetstillstand',
    topic: 'employment',
    jurisdiction: 'Sweden',
    title: 'Migrationsverket: Swedish Work Permit (Arbetstillstånd) Terms, Kollektivavtal, and Salary Floor',
    url: 'https://www.migrationsverket.se/en/you-want-to-apply-for/work/employees.html',
    quote: 'Work permit requirements',
    summary: 'To obtain a Swedish Work Permit (Arbetstillstånd), third-country nationals must have an official job offer from an employer in Sweden. The job must have been advertised in Sweden and the EU/EEA/Switzerland (EURES) for at least 10 calendar days. The terms of employment, including salary, health insurance, occupational pension (tjänstepension), life insurance, and industrial injury insurance, must be equal to or better than Swedish collective agreements (kollektivavtal) or statutory custom in the occupation. The salary must enable the employee to achieve a good maintenance level, statutory minimum of 80% of the Swedish median salary (minimum SEK 28,480 per month). The employer must initiate the application online and obtain an official trade union statement (fackligt yttrande) before submitting to Migrationsverket. This record does not issue work permits.'
  }),
  createRecord({
    id: 'se-migrationsverket-eu-blue-card-and-job-seeker',
    topic: 'employment',
    jurisdiction: 'Sweden',
    title: 'Migrationsverket: Swedish EU Blue Card and 9-Month Job Seeker Visa for Advanced Degree Holders',
    url: 'https://www.migrationsverket.se/en/you-want-to-apply-for/work/eu-blue-card.html',
    quote: 'EU Blue Card in Sweden',
    summary: 'Highly qualified specialists can apply for the Swedish EU Blue Card if they possess a completed 180 ECTS higher education degree (equivalent to a 3-year bachelor) or 5 years of relevant professional experience, an employment contract of at least 6 months, and gross monthly salary equal to at least 1.5 times the average gross annual salary in Sweden (approx SEK 59,850 per month). In addition, foreign graduates who completed a master or doctoral degree abroad can apply for a Swedish Job Seeker Residence Permit valid for up to 9 months to look for work or explore starting a business. Applicants for the job seeker permit must show financial self-support funds of at least SEK 13,000 per month and comprehensive health insurance valid in Sweden. This record does not issue job seeker visas.'
  }),
  createRecord({
    id: 'se-migrationsverket-permanent-residence-put',
    topic: 'employment',
    jurisdiction: 'Sweden',
    title: 'Migrationsverket: Permanent Residence (PUT) Criteria, 4-Year Threshold, and Maintenance Rule',
    url: 'https://www.migrationsverket.se/en/you-want-to-apply-for/work/permanent-residence.html',
    quote: 'Permanent residence for employees',
    summary: 'Under the Swedish Aliens Act (Utlänningslagen), a work permit holder can apply for Permanent Residence (Permanent uppehållstillstånd - PUT) in conjunction with applying for an extension after holding Swedish work permits for a total of 4 years within the last 7 years. To be granted permanent residence, the applicant must satisfy a strict maintenance requirement: they must demonstrate stable, ongoing employment of at least 18 months duration with salary sufficient to support themselves and family members after paying housing expenses. In addition, the applicant must satisfy good conduct criteria with no criminal convictions or unpaid debts registered with the Swedish Enforcement Authority (Kronofogden). PUT confers indefinite permission to reside and work freely in Sweden without employer-tied restrictions. This record does not grant permanent residency.'
  }),
  createRecord({
    id: 'se-skatteverket-personnummer-and-id-kort',
    topic: 'sin',
    jurisdiction: 'Sweden',
    title: 'Skatteverket: Population Registration (Folkbokföring), 12-Digit Personnummer, and BankID',
    url: 'https://www.skatteverket.se/servicelankar/otherlanguages/inenglish/individualsandemployees/movingtosweden.4.7be5268714a3d0e1fc94019.html',
    quote: 'Moving to Sweden',
    summary: 'Anyone moving to Sweden with a residence permit valid for at least 12 months must register in the Swedish Population Register (folkbokföring) at a service office of the Swedish Tax Agency (Skatteverket). Newcomers must present their valid passport, residence permit card (UT-kort), and proof of civil status (marriage and birth certificates). Skatteverket issues the Personnummer, an immutable 12-digit national identification number (YYMMDD-XXXX) essential for daily life. With the Personnummer, newcomers apply for a Skatteverket photo ID card (ID-kort), which is required to open a retail bank account and obtain BankID, the universal Swedish digital cryptographic identity used to log into public services, healthcare, and instant payment apps (Swish). This record does not issue Swedish tax numbers.'
  }),
  createRecord({
    id: 'se-forsakringskassan-healthcare-and-parental-benefits',
    topic: 'health',
    jurisdiction: 'Sweden',
    title: 'Försäkringskassan: Social Insurance Registration, Universal Healthcare, and 480-Day Parental Leave',
    url: 'https://www.forsakringskassan.se/english/moving-to-working-or-studying-in-sweden/move-to-sweden',
    quote: 'Moving to Sweden',
    summary: 'Residents registered in the Swedish population register are covered by Swedish social insurance administered by the Swedish Social Insurance Agency (Försäkringskassan). Universal public healthcare is organized at the regional county (region) level, providing access to doctors at local primary health clinics (vårdcentral). Patient fees (patientavgift) are modest (typically SEK 100 to SEK 300 per visit) and capped by a national high-cost protection threshold (högkostnadsskydd), limiting total out-of-pocket medical visits to SEK 1,400 within a 12-month period, after which healthcare is 100% free. Social insurance includes comprehensive paid parental leave (föräldrapenning) granting 480 days of leave per child, of which 390 days are paid at 80% of qualifying income (SGI) and 90 days at minimum daily flat rates. This record does not process parental benefit claims.'
  }),
  createRecord({
    id: 'se-hyresgastforeningen-rental-housing-rights',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Sweden',
    title: 'Hyresnämnden: First-Hand vs Second-Hand Leases, Subletting Approval, and Legal Rent Caps',
    url: 'https://www.hyresnamnden.se/amnen/hyra-av-bostad/',
    quote: 'Hyra av bostad',
    summary: 'The Swedish rental housing market distinguishes between primary first-hand contracts (förstahandskontrakt) with municipal or private housing companies, and sublet second-hand contracts (andrahandskontrakt). A tenant or housing cooperative (bostadsrätt) owner must obtain formal prior permission from their landlord or housing board before subletting; subletting without authorization is grounds for immediate termination without notice. Under Swedish tenancy law (hyreslagen), second-hand rent for tenancy apartments is legally capped by the utility value system (bruksvärdessystemet) equal to the primary rent plus a maximum 15% surcharge if fully furnished. Charging unlawful excess rent is prohibited by law, and subtenants can apply to the Regional Rent Tribunal (Hyresnämnden) to force retroactive repayment of unlawful excess rent for up to 2 years. This record does not mediate rental arbitrations.'
  }),

  // ══════════════════════════════════════════════════════════════════════════════
  // SECTION 6: SPAIN — VISAS, PR, POST-ARRIVAL & SETTLEMENT
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'es-ugce-digital-nomad-visa-teletrabajador',
    topic: 'employment',
    jurisdiction: 'Spain',
    title: 'UGE-CE: Spain Digital Nomad Visa (Teletrabajador de Carácter Internacional) under Startups Law',
    url: 'https://www.inclusion.gob.es/en/web/migraciones/teletrabajadores-de-caracter-internacional',
    quote: 'Teletrabajadores de carácter internacional',
    summary: 'The Spanish International Teleworker (Digital Nomad) Visa enacted under the Spanish Startups Law (Ley 28/2022) allows third-country remote employees and freelancers to reside in Spain while working for foreign enterprises. Applicants must demonstrate an undergraduate degree or at least 3 years of verifiable professional experience, at least 3 months of continuous pre-existing engagement with foreign employers located outside Spain, and regular monthly income of at least 200% of the Spanish statutory minimum wage (SMI), approximately EUR 2,646 per month (plus 75% SMI for a spouse and 25% per child). When submitted inside Spain to the Large Business and Strategic Collectives Unit (UGE-CE), the residence authorization is issued directly for 3 years, renewable for 2-year periods, and confers unrestricted national travel across the Schengen zone. This record does not issue digital nomad visas.'
  }),
  createRecord({
    id: 'es-ugce-highly-skilled-professional-pac',
    topic: 'employment',
    jurisdiction: 'Spain',
    title: 'UGE-CE: Highly Skilled Professional (PAC) Fast-Track Authorization under Ley 14/2013',
    url: 'https://www.inclusion.gob.es/en/web/migraciones/profesionales-altamente-cualificados',
    quote: 'Profesionales altamente cualificados',
    summary: 'Under Law 14/2013 on Support for Entrepreneurs and their Internationalization, Spanish enterprises can hire foreign managers, directors, and specialized technical staff through the Highly Skilled Professional (Profesional Altamente Cualificado - PAC) route. Applications are processed directly by UGE-CE within a mandatory 20-working-day statutory fast-track window; failure to issue a decision within 20 days triggers positive administrative silence (silencio administrativo positivo). Candidates must hold a university degree or recognized post-secondary qualification, or minimum 3 years of senior technical experience, with qualifying annual salary benchmarks established by collective agreements (approx EUR 40,000 to EUR 55,000 annually). Spouses and dependent children obtain simultaneous residence permits with full right to work. This record does not grant work permits.'
  }),
  createRecord({
    id: 'es-ugce-startup-innovative-enterprise-and-golden-visa',
    topic: 'employment',
    jurisdiction: 'Spain',
    title: 'ENISA & UGE-CE: Innovative Startup Residence Permit and Strategic Investor Framework',
    url: 'https://www.enisa.es/es/certifica-tu-start-up',
    quote: 'Certificación de empresas emergentes',
    summary: 'Foreign entrepreneurs establishing innovative, scalable business projects in Spain can obtain a 3-year Entrepreneur Residence Permit under Ley 14/2013. The enterprise business plan must receive formal innovation certification from ENISA (Empresa Nacional de Innovación), which evaluates the business model, degree of innovation, job creation potential, and scalability within Spain. Certified startups benefit from reduced corporate tax rates (15% for the first 4 years) and streamlined stock option tax incentives. Separately, qualified foreign investors can obtain Golden Residence Visas through capital asset investments (EUR 1M in Spanish company shares or bank deposits, EUR 2M in government debt, or EUR 500,000 in unencumbered real estate assets) without mandatory minimum physical stay requirements. This record does not evaluate startup business plans.'
  }),
  createRecord({
    id: 'es-extranjeria-residencia-larga-duracion-pr',
    topic: 'employment',
    jurisdiction: 'Spain',
    title: 'Extranjería: Residencia de Larga Duración (5-Year Permanent Residency) and Absence Limits',
    url: 'https://www.inclusion.gob.es/en/web/migraciones/residencia-de-larga-duracion',
    quote: 'Residencia de larga duración',
    summary: 'Under Organic Law 4/2000 (LOEX) and Royal Decree 557/2011, third-country nationals who have resided continuously and legally in Spanish territory for 5 full years are eligible for Permanent Residency (Autorización de residencia de larga duración). Continuous residence is not considered interrupted by temporary absences from Spain, provided individual absences do not exceed 6 consecutive months and total cumulative absences do not exceed 10 months within the entire 5-year qualification window (or 12 months if motivated by employment). Long-term residence grants the right to live and work indefinitely in Spain under equal conditions with Spanish citizens, in both employed and self-employed capacities, without requiring further renewal of the residence authorization itself (only the physical TIE card is renewed every 5 years). This record does not issue permanent resident authorizations.'
  }),
  createRecord({
    id: 'es-policia-nie-tie-and-empadronamiento',
    topic: 'sin',
    jurisdiction: 'Spain',
    title: 'Policía Nacional & Ayuntamiento: NIE Number, TIE Card Biometrics, and Empadronamiento',
    url: 'https://sede.policía.gob.es/portalWeb/_es/tramites_extranjeria.php',
    quote: 'Trámites de Extranjería',
    summary: 'Upon arriving in Spain, foreigners must register on the municipal population register (Padrón Municipal) at the local City Hall (Ayuntamiento) where they reside, known as Empadronamiento. The certificate of empadronamiento (volante de empadronamiento) is required to access public healthcare, enroll children in school, and obtain identity documents. Non-Spanish nationals are assigned a Foreigner Identity Number (NIE), which serves as the personal tax and administrative identifier. Holders of residence authorizations valid for more than 6 months must book a police appointment (cita previa) at the Foreigners Office or National Police station within 30 days of arrival to submit Form EX-17, provide biometric fingerprints, and obtain the physical Foreigner Identity Card (Tarjeta de Identidad de Extranjero - TIE). This record does not book police appointments.'
  }),
  createRecord({
    id: 'es-seguridad-social-sns-and-beckham-law',
    topic: 'health',
    jurisdiction: 'Spain',
    title: 'Seguridad Social: Public Healthcare (SNS), Tarjeta Sanitaria, and Beckham Law Expat Tax Regime',
    url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion',
    quote: 'Afiliación a la Seguridad Social',
    summary: 'Foreigners legally working in Spain as employees or registered autonomous workers (autónomos) must be affiliated with Spanish Social Security (Seguridad Social). Affiliation guarantees full access to public healthcare through the National Health System (Sistema Nacional de Salud - SNS). With a certificate of social security affiliation and empadronamiento, newcomers register at their neighbourhood primary healthcare centre (Centro de Salud) to be assigned a family doctor (médico de cabecera) and obtain the Individual Health Card (Tarjeta Sanitaria Individual - TSI). Under the Special Expatriate Tax Regime (commonly known as the Beckham Law, Article 93 of the Personal Income Tax Act), foreign skilled workers and digital nomads relocating to Spain can opt to be taxed as non-residents on Spanish-source employment income at a flat 24% rate up to EUR 600,000 for up to 6 tax years, exempting foreign investment returns from Spanish wealth tax. This record does not file tax declarations.'
  }),
  createRecord({
    id: 'es-vivienda-lau-lease-and-deposit-protections',
    topic: 'housing',
    housingSubject: 'deposit',
    jurisdiction: 'Spain',
    title: 'Ley de Arrendamientos Urbanos (LAU): 5-Year Lease Security, Deposit Escrow, and Rent Caps',
    url: 'https://www.mitma.gob.es/vivienda/alquiler/ley-de-arrendamientos-urbanos',
    quote: 'Arrendamientos urbanos',
    summary: 'Residential tenancies in Spain are regulated by the Urban Tenancies Act (Ley de Arrendamientos Urbanos - LAU). Habitual residential leases (arrendamiento de vivienda habitual) have a statutory minimum duration of 5 years if the landlord is an individual, or 7 years if the landlord is a corporate entity, renewable annually at the tenant election. By law, the security deposit (fianza) for residential leases is capped at exactly 1 month of base rent (plus up to 2 months of additional financial guarantees). The landlord is legally mandated to deposit the fianza in the official regional escrow institute (such as IVIMA in Madrid or INCASÒL in Catalonia); failure to deposit the fianza is subject to administrative sanctions. Under state housing legislation, annual rent updates during the contract are capped by official reference indices (maximum 3% in 2024, followed by a dedicated INE reference index) rather than unconstrained inflation. This record does not mediate rental arbitrations.'
  }),

  // ══════════════════════════════════════════════════════════════════════════════
  // SECTION 7: ADVANCED MULTI-DESTINATION EXPANSION (US, UK, AU, DE, NZ)
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'us-uscis-l1-intracompany-transferee-and-eb1c',
    topic: 'employment',
    jurisdiction: 'United States',
    title: 'USCIS: L-1A Executive Transferee, Dual Intent, and EB-1C Multinational Green Card Transition',
    url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/l-1a-intracompany-transferee-executive-or-manager',
    quote: 'L-1A Intracompany Transferee Executive or Manager',
    summary: 'The US L-1A nonimmigrant classification enables multinational companies to transfer executives or managers from an affiliated foreign office to a US parent, subsidiary, or branch. The employee must have worked continuously for the foreign entity for at least one full year within the 3 preceding years. L-1A visas allow a maximum stay of 7 years (5 years for L-1B specialized knowledge). Because the L-1 visa is statutorily designated as dual intent under INA § 214(b), the holder can pursue permanent residence without jeopardizing status. Employers can sponsor L-1A executives directly for permanent residence under the first-preference Employment-Based EB-1C Multinational Executive category, which statutorily exempts the employer from the lengthy PERM labor certification process with the US Department of Labor. Spouses hold L-2 status and possess automatic statutory employment authorization incident to status. This record does not issue nonimmigrant visas.'
  }),
  createRecord({
    id: 'uk-home-office-scale-up-and-high-potential-individual',
    topic: 'employment',
    jurisdiction: 'United Kingdom',
    title: 'Home Office: Scale-up Worker Visa and High Potential Individual (HPI) Global Routes',
    url: 'https://www.gov.uk/scale-up-worker-visa',
    quote: 'Scale-up Worker visa',
    summary: 'The UK Scale-up Worker visa allows high-growth UK businesses (firms with 20% annualised turnover or employment growth over 3 years) to hire eligible foreign workers. The candidate must have an approved job offer at RQF Level 6 (degree-equivalent) earning at least £36,300 per year or the going rate for the occupation code. After 6 months of sponsored employment, the Scale-up worker is legally free to switch employers, become self-employed, or work without ongoing sponsorship for the remaining 18 months, leading to a 3-year extension and 5-year Indefinite Leave to Remain (ILR). In addition, the High Potential Individual (HPI) visa offers an unsponsored 2-year open work permit (3 years for PhDs) to recent graduates of top non-UK global universities listed on the Home Office Global Universities List, requiring no UK job offer, sponsor, or minimum salary. This record does not issue UK entry clearances.'
  }),
  createRecord({
    id: 'au-dha-subclass-482-to-186-ens-pr-transition',
    topic: 'employment',
    jurisdiction: 'Australia',
    title: 'DHA: Subclass 482 TSS to Subclass 186 Employer Nomination Scheme (ENS) PR Transition',
    url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/employer-nomination-scheme-186',
    quote: 'Employer Nomination Scheme (subclass 186)',
    summary: 'The Australian Subclass 482 Temporary Skill Shortage (TSS) visa allows employers to address labour shortages by sponsoring skilled overseas workers earning above the Temporary Skilled Migration Income Threshold (TSMIT). Under updated statutory migration regulations, all Subclass 482 TSS visa holders across both short-term and medium-term occupation streams are eligible for an employer-sponsored permanent residence pathway through the Subclass 186 Employer Nomination Scheme (ENS) Temporary Residence Transition (TRT) stream after completing 2 years of full-time sponsored work with the nominating employer (reduced from the previous 3-year requirement). Employers must pay the statutory Skilling Australians Fund (SAF) levy, and applicants must demonstrate at least Competent English and be aged under 45 at the time of ENS application unless specific statutory exemptions apply. This record does not grant Australian permanent residency.'
  }),
  createRecord({
    id: 'de-bamf-staatsangehoerigkeit-modernized-citizenship',
    topic: 'community',
    jurisdiction: 'Germany',
    title: 'BAMF & BMI: Modernized German Citizenship Act (StARegG 2024) 5-Year and Dual Citizenship Rules',
    url: 'https://www.bmi.bund.de/SharedDocs/pressemitteilungen/DE/2024/06/staatsangehoerigkeitsrecht.html',
    quote: 'Modernes Staatsangehörigkeitsrecht tritt in Kraft',
    summary: 'Under the modernized German Nationality Act (StARegG) effective June 2024, the residency requirement for naturalization (Einbürgerung) in Germany is reduced from 8 years to 5 years of lawful residence. For applicants demonstrating special integration achievements (outstanding academic or professional performance, civic volunteer engagement, and certified German language proficiency at CEFR Level C1), the naturalization threshold is reduced to just 3 years. The law completely abolishes the historic prohibition against multiple nationalities, permitting newcomers to naturalize as German citizens while permanently retaining their original citizenship without needing a waiver (Beibehaltungsgenehmigung). Applicants must demonstrate economic self-sufficiency without receiving social assistance benefits under SGB II or XII, commitment to the democratic basic order (FDGO) of the Basic Law, and passing score on the naturalization test (Einbürgerungstest). This record does not process citizenship naturalization applications.'
  }),
  createRecord({
    id: 'nz-inz-accredited-employer-work-visa-aewv',
    topic: 'employment',
    jurisdiction: 'New Zealand',
    title: 'INZ: Accredited Employer Work Visa (AEWV) Median Wage Rules and Resident Visa Progression',
    url: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa',
    quote: 'Accredited Employer Work Visa',
    summary: 'The Accredited Employer Work Visa (AEWV) is the primary temporary work visa for New Zealand. Employers must hold active INZ accreditation and complete an approved Job Check demonstrating that no suitable New Zealand citizens or residents were available. Jobs must pay at or above the national median wage threshold (or applicable statutory sector agreement rates) for full-time work of at least 30 hours per week. AEWV holders in roles classified at ANZSCO Skill Levels 1 to 3 can obtain visas for up to 5 years and can progress to permanent residence via the Green List Straight to Residence pathway or the Skilled Migrant Category (SMC) 6-point system. For roles at ANZSCO Levels 4 and 5, applicants must satisfy minimum English language benchmarks and face maximum continuous stay limits, after which they must spend 12 consecutive months outside New Zealand before applying for a further AEWV. This record does not issue New Zealand work visas.'
  })
];
