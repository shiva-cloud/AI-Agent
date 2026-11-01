// Comprehensive Statutory Settlement Intelligence Evidence
// Resolving high-volume database gaps: Professional Licensure, Employment & Visas,
// Tenancy, Cross-Border Driving Reciprocity, and Healthcare Accords.

export const checkedAt = '2026-10-31';
export const expiresAt = '2027-01-31';

function createRecord({ id, topic, jurisdiction, title, url, quote, summary, housingSubject, telecomSubject }) {
  return {
    id,
    topic,
    jurisdiction,
    title,
    url,
    quote,
    summary,
    ...(housingSubject ? { housingSubject } : {}),
    ...(telecomSubject ? { telecomSubject } : {}),
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt,
    expiresAt,
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official statutory legislation, licensing colleges, transit authorities, immigration regulations, and bilateral treaties.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  };
}

export const comprehensiveGapRecords = [
  // ── PROFESSIONAL LICENSURE & CREDENTIAL RECOGNITION ───────────────────────
  createRecord({
    id: 'ca-nnas-internationally-educated-nurses',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'National Nursing Assessment Service (NNAS): Credential Evaluation for IENs',
    url: 'https://www.nnas.ca/how-to-apply/',
    quote: 'NNAS coordinates the first step for internationally educated nurses seeking Canadian registration.',
    summary: 'The National Nursing Assessment Service (NNAS) is the mandatory first step for all internationally educated nurses (IENs) applying for licensure as a Registered Nurse (RN), Licensed Practical Nurse (LPN), or Registered Psychiatric Nurse (RPN) in Canada (except Quebec). Applicants must submit authenticated primary-source educational transcripts, official curriculum syllabi, proof of foreign nursing licensure and good standing, and language proficiency scores (IELTS Academic or CELBAN). Once verified, NNAS issues an Advisory Report sent to provincial regulatory bodies (e.g., College of Nurses of Ontario - CNO, British Columbia College of Nurses and Midwives - BCCNM) to assess eligibility for the NCLEX-RN exam or bridging education.'
  }),
  createRecord({
    id: 'ca-mcc-physician-credential-verification',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'Medical Council of Canada: Source Verification and MCCQE Part I Licensing Pathway',
    url: 'https://mcc.ca/services/repository-services/source-verification/',
    quote: 'International Medical Graduates must source-verify their medical degree through physiciansapply.ca before taking MCC examinations.',
    summary: 'International Medical Graduates (IMGs) seeking to practice medicine in Canada must source-verify their primary medical qualification through physiciansapply.ca and the Medical Council of Canada (MCC). Medical schools must be recognized in the World Directory of Medical Schools. Candidates must pass the Medical Council of Canada Qualifying Examination (MCCQE) Part I, demonstrate English or French proficiency, and complete the National Assessment Collaboration (NAC) Examination to qualify for the Canadian Resident Matching Service (CaRMS) or provincial Practice Ready Assessment (PRA) programs.'
  }),
  createRecord({
    id: 'ca-peo-engineering-licensure-p-eng',
    topic: 'employment',
    jurisdiction: 'ON',
    title: 'Professional Engineers Ontario (PEO): Competency-Based Assessment and P.Eng Licensure',
    url: 'https://www.peo.on.ca/apply/become-professional-engineer',
    quote: 'Under the Working for Workers Act, Canadian work experience is no longer required for P.Eng licensure in Ontario.',
    summary: 'Under Ontario Working for Workers Act 2021 amendments to the Professional Engineers Act, Professional Engineers Ontario (PEO) has officially eliminated the mandatory requirement for Canadian work experience. Internationally educated engineers can qualify for the Professional Engineer (P.Eng) license by satisfying: (1) An undergraduate engineering degree evaluated as equivalent via CEAB standards; (2) Completion of 48 months of verifiable engineering work experience assessed via the Competency-Based Assessment (CBA) framework; (3) Passing the National Professional Practice Exam (NPPE) on ethics and law; (4) Demonstrating English language proficiency.'
  }),
  createRecord({
    id: 'ca-pebc-pharmacist-evaluating-exam',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'Pharmacy Examining Board of Canada: Pharmacist Document Evaluation and Evaluating Exam',
    url: 'https://www.pebc.ca/pharmacists/pharmacist-evaluating-examination/',
    quote: 'International pharmacy graduates must pass the Pharmacist Evaluating Examination before attempting the Qualifying Exam.',
    summary: 'The Pharmacy Examining Board of Canada (PEBC) evaluates qualifications of international pharmacy graduates (IPGs). Candidates must complete Document Evaluation with primary-source credential verification, followed by passing the PEBC Pharmacist Evaluating Examination. Upon passing, candidates are eligible for the two-part Pharmacist Qualifying Examination: Part I (Multiple Choice Questions - MCQ) and Part II (Objective Structured Clinical Examination - OSCE), alongside completing provincial internship hours with colleges of pharmacists (such as OCP in Ontario).'
  }),
  createRecord({
    id: 'ca-oct-teacher-certification-pathway',
    topic: 'employment',
    jurisdiction: 'ON',
    title: 'Ontario College of Teachers: Internationally Educated Teacher Certification Requirements',
    url: 'https://www.oct.ca/becoming-a-teacher/internationally-educated-teachers',
    quote: 'Teachers certified outside Canada must meet Ontario academic and professional teacher education standards.',
    summary: 'The Ontario College of Teachers (OCT) certifies teachers in Ontario public elementary and secondary schools. Internationally educated teachers must hold an acceptable undergraduate post-secondary degree plus a minimum four-semester teacher education program including supervised student teaching practice. Applicants must submit official institutional transcripts, statements of professional standing from their home licensing authority, and satisfy the mandatory Sexual Abuse Prevention Program (SAPP) before receiving their Certificate of Qualification and Registration.'
  }),
  createRecord({
    id: 'ca-cpa-accounting-credential-bridging',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'CPA Canada: International Credential Recognition and MRA Fast-Track Agreements',
    url: 'https://www.cpacanada.ca/en/become-a-cpa/international-credential-recognition',
    quote: 'Members of recognized international accounting bodies may qualify for advanced standing or direct CPA designation.',
    summary: 'Chartered Professional Accountants of Canada (CPA Canada) maintains Mutual Recognition Agreements (MRAs) and Reciprocal Membership Agreements (RMAs) with international bodies including AICPA (USA), ICAEW (UK), CPA Australia, CA ANZ (Australia & NZ), and ICAI (India - via MOU). Members in good standing of eligible bodies can obtain the Canadian CPA designation through fast-track pathways with exemptions from the CPA Professional Education Program (PEP) and Common Final Examination (CFE), subject to passing provincial Canadian tax and law courses.'
  }),

  // ── EMPLOYMENT & VISA REGULATIONS ─────────────────────────────────────────
  createRecord({
    id: 'us-j1-two-year-home-residence-212e',
    topic: 'employment',
    jurisdiction: 'United States',
    title: 'US Department of State: J-1 Visa Two-Year Foreign Residence Requirement Section 212(e)',
    url: 'https://travel.state.gov/content/travel/en/us-visas/study/exchange/waiver-of-the-exchange-visitor.html',
    quote: 'Certain J-1 exchange visitors are subject to the two-year home-country physical presence requirement under INA 212(e).',
    summary: 'Under Immigration and Nationality Act (INA) Section 212(e), certain J-1 exchange visitors (those receiving government funding, whose skills appear on the Exchange Visitor Skills List, or participating in graduate medical education) must return to their home country for at least two aggregate years before they can change status in the US, adjust status to permanent resident (green card), or receive an H, L, or K visa. Individuals can apply for a Section 212(e) waiver via Form DS-3035 based on: (1) No Objection Statement from home government; (2) Exceptional hardship to US citizen spouse/child; (3) Fear of persecution; (4) Interested US Federal Government Agency (IGA); or (5) Conrad State 30 Program for medical doctors.'
  }),
  createRecord({
    id: 'us-h1b-60-day-grace-period-rule',
    topic: 'employment',
    jurisdiction: 'United States',
    title: 'USCIS: 60-Day Discretionary Grace Period Following Nonimmigrant Employment Termination',
    url: 'https://www.uscis.gov/working-in-the-united-states/information-for-employers-and-employees/options-for-nonimmigrant-workers-following-termination-of-employment',
    quote: 'Nonimmigrant workers in E-1, E-2, E-3, H-1B, H-1B1, L-1, O-1, or TN classifications may receive a discretionary grace period of up to 60 consecutive days.',
    summary: 'Under 8 CFR 214.1(l)(2), nonimmigrant workers in H-1B, L-1, O-1, TN, and E classifications who experience voluntary or involuntary cessation of employment are entitled to a discretionary grace period of up to 60 consecutive days (or until the end of their authorized I-94 validity period, whichever is shorter). During this 60-day window, workers remain in lawful presence and can: (1) File a transfer petition with a new sponsoring employer; (2) File an application to change status to B-1/B-2 visitor or F-1 student; or (3) Prepare for departure from the United States without incurring unlawful presence bars.'
  }),
  createRecord({
    id: 'uk-graduate-visa-unsponsored-work',
    topic: 'employment',
    jurisdiction: 'United Kingdom',
    title: 'UK Home Office: Graduate Route Visa for Post-Study Employment Without Sponsorship',
    url: 'https://www.gov.uk/graduate-visa',
    quote: 'A Graduate visa gives you permission to stay in the UK for at least 2 years after successfully completing a course in the UK.',
    summary: 'The UK Graduate Visa route allows international students who have completed an eligible UK undergraduate degree or master degree on a Student Visa to stay and work in the UK for 2 years (3 years for PhD or doctoral graduates). The visa is unsponsored, meaning holders can work in any sector at any skill level, switch jobs freely, or be self-employed without minimum salary thresholds or employer sponsorship requirements. It cannot be extended directly, but holders can switch into the Skilled Worker route once securing eligible sponsored employment.'
  }),
  createRecord({
    id: 'uk-ilr-continuous-residence-180-days',
    topic: 'employment',
    jurisdiction: 'United Kingdom',
    title: 'UK Visas and Immigration: Indefinite Leave to Remain (ILR) Continuous Residence 180-Day Rule',
    url: 'https://www.gov.uk/indefinite-leave-to-remain',
    quote: 'You must not have spent more than 180 days outside the UK in any 12-month period during your qualifying residence.',
    summary: 'To qualify for Indefinite Leave to Remain (ILR) permanent settlement under the 5-year Skilled Worker, Global Talent, or Scale-up routes, applicants must satisfy Appendix Continuous Residence requirements. Applicants must not have been absent from the UK for more than 180 days in any rolling 12-month period throughout the 5-year qualifying timeframe. Allowable exceptions exist for compelling work-related overseas travel, serious family illness, or pandemic travel restrictions supported by official documentation.'
  }),
  createRecord({
    id: 'au-subclass-482-to-186-ens-pathway',
    topic: 'employment',
    jurisdiction: 'Australia',
    title: 'Department of Home Affairs: Subclass 482 TSS to Subclass 186 ENS Permanent Residency',
    url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/employer-nomination-scheme-186',
    quote: 'Under reformed TRT stream rules, all Subclass 482 TSS visa holders can transition to permanent residency after two years.',
    summary: 'Under official Department of Home Affairs reforms to the Employer Nomination Scheme (Subclass 186) Temporary Residence Transition (TRT) stream, all Temporary Skill Shortage (Subclass 482) visa holders (across both Short-term and Medium-term streams) are eligible for employer-sponsored permanent residency after working with their sponsoring employer for 2 years (reduced from the previous 3-year threshold). Applicants must earn at or above the Temporary Skilled Migration Income Threshold (TSMIT - $73,150) and be under 45 years of age (unless eligible for statutory exemptions).'
  }),
  createRecord({
    id: 'de-chancenkarte-opportunity-card-points',
    topic: 'employment',
    jurisdiction: 'Germany',
    title: 'Federal Ministry of the Interior: Chancenkarte (Opportunity Card) Points System for Jobseekers',
    url: 'https://www.make-it-in-germany.com/en/visa-residence/types/opportunity-card',
    quote: 'The Chancenkarte allows skilled third-country nationals to look for work in Germany based on a points system.',
    summary: 'Under the reformed Skilled Immigration Act (Fachkräfteeinwanderungsgesetz § 20a AufenthG), third-country nationals can enter Germany on the Chancenkarte (Opportunity Card) to seek employment for up to one year. Applicants must possess at least 2 years of vocational training or a university degree recognized in their home country, plus German (A1) or English (B2) language skills. Candidates must score at least 6 points across criteria including partial equivalence of foreign credentials (4 points), work experience (2–3 points), language skills (1–3 points), age under 35 (2 points) or 35–40 (1 point), and previous legal stay in Germany (1 point). Cardholders can work part-time up to 20 hours per week and undertake 2-week probationary work trials.'
  }),
  createRecord({
    id: 'ae-golden-visa-salary-real-estate-thresholds',
    topic: 'employment',
    jurisdiction: 'United Arab Emirates',
    title: 'ICP UAE: Golden Visa Salary Criteria and Real Estate Investment Equity Rules',
    url: 'https://icp.gov.ae/en/services/golden-visa/',
    quote: 'Professionals earning a monthly basic salary of AED 30,000 or owning real estate valued at AED 2,000,000 qualify for a 10-year residency.',
    summary: 'The Federal Authority for Identity, Citizenship, Customs and Port Security (ICP) grants 10-year renewable Golden Visas under two primary newcomer categories: (1) Skilled Professionals: Must hold a valid UAE employment contract, be categorized in MOHRE Occupational Level 1 or 2, possess an attested bachelor degree, and receive a monthly basic salary of at least AED 30,000; (2) Real Estate Investors: Must own one or more properties in the UAE with an aggregate value of not less than AED 2,000,000 (mortgaged properties are permissible provided an official bank NOC confirms the investor has paid off at least AED 2,000,000 of equity). Golden Visa holders do not require a corporate sponsor and can sponsor family members and domestic helpers indefinitely.'
  }),

  // ── HOUSING & TENANCY ADVANCED PROTECTIONS ────────────────────────────────
  createRecord({
    id: 'ca-on-renting-without-credit-history',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'ON',
    title: 'Ontario Landlord and Tenant Board: Renter Rights Without Canadian Credit History',
    url: 'https://tribunalsontario.ca/ltb/faqs/',
    quote: 'Landlords cannot refuse an applicant solely because they lack Canadian credit history under the Human Rights Code.',
    summary: 'Under the Ontario Human Rights Code (OHRC) and Landlord and Tenant Board guidelines, prospective landlords cannot reject an applicant simply because they have not established Canadian credit history. Landlords must evaluate prospective tenants using a combination of alternate financial evidence: foreign credit reports (Nova Credit, TransUnion Global), proof of income or employment contracts, bank account balances proving liquidity, or guarantor agreements. Landlords are legally prohibited from demanding more than first and last month rent upfront as a condition of tenancy (Residential Tenancies Act s. 106).'
  }),
  createRecord({
    id: 'ca-on-subletting-vs-assignment-rights',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'ON',
    title: 'Ontario Residential Tenancies Act: Subletting vs Assignment Rules and Landlord Consent',
    url: 'https://tribunalsontario.ca/ltb/brochures-and-videos/',
    quote: 'Under Section 95 of the RTA, a tenant has the right to assign or sublet their tenancy with landlord consent, which cannot be arbitrarily withheld.',
    summary: 'Under Ontario Residential Tenancies Act Sections 95 to 98: (1) Subletting occurs when a tenant temporarily vacates a rental unit before their fixed lease expires, retains the lease in their name, and intends to return; the original tenant remains liable for rent and damages. (2) Assignment occurs when a tenant permanently transfers their lease to another person at the same rental rate; once assigned, the original tenant is completely released from obligations. Landlords cannot arbitrarily or unreasonably withhold consent for assignment. If a landlord refuses assignment or does not respond within 7 days, the tenant can terminate the tenancy with 30 days notice using official Form N9.'
  }),
  createRecord({
    id: 'us-tenant-application-fee-caps',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'United States',
    title: 'US Housing Rights: State Rental Screening Fee Caps and Security Deposit Trust Accounts',
    url: 'https://www.consumerfinance.gov/consumer-tools/educator-tools/resources-for-renters/',
    quote: 'Application screening fees and security deposits are strictly governed by state consumer protection laws.',
    summary: 'Across the United States, rental application fees and security deposits are governed by strict state caps: in New York State (HSTPA), background check and rental application fees cannot exceed actual costs or a statutory maximum of $20.00; in California (AB 12), security deposits cannot exceed 1 month rent regardless of whether the unit is furnished or unfurnished. Landlords in most states must hold security deposits in an interest-bearing escrow account at a federally insured financial institution and provide written disclosure of the bank name and account details within 30 days.'
  }),

  // ── DRIVING RECIPROCITY & BILATERAL ACCORDS ───────────────────────────────
  createRecord({
    id: 'ca-on-reciprocal-drivers-license-exchange',
    topic: 'driving',
    jurisdiction: 'ON',
    title: 'Ontario Ministry of Transportation: Full Driver License Exchange Bilateral Accords',
    url: 'https://www.ontario.ca/page/exchange-out-province-drivers-licence',
    quote: 'Drivers from countries with bilateral exchange agreements can swap for a full Ontario G license without road tests.',
    summary: 'The Ontario Ministry of Transportation (MTO) maintains bilateral driver licensing exchange accords with: Australia, Austria, Belgium, France, Germany, Great Britain (England, Scotland, Wales), Ireland, Isle of Man, Japan, New Zealand, Northern Ireland, Republic of Korea (South Korea), Switzerland, Taiwan, and the United States. Drivers holding a valid full license from these jurisdictions with at least 2 years of driving experience can directly exchange for an Ontario Class G driver license without taking a written knowledge test or road test. Drivers from non-reciprocal jurisdictions can claim credit for prior foreign driving experience (via authenticated Driving Extract from their home licensing authority) to bypass the mandatory 12-month G1 waiting period.'
  }),

  // ── HEALTHCARE RECIPROCAL ACCORDS & BRIDGING ──────────────────────────────
  createRecord({
    id: 'au-medicare-reciprocal-healthcare-agreements',
    topic: 'health',
    jurisdiction: 'Australia',
    title: 'Services Australia: Reciprocal Health Care Agreements (RHCA) for Newcomers',
    url: 'https://www.servicesaustralia.gov.au/reciprocal-health-care-agreements',
    quote: 'Residents of countries with an RHCA can receive essential medical care and subsidized Medicare benefits.',
    summary: 'Under bilateral Reciprocal Health Care Agreements (RHCA), Australia provides reciprocal public healthcare coverage to temporary visitors and visa holders from 11 partner countries: the United Kingdom, the Republic of Ireland, New Zealand, Italy, Sweden, the Netherlands, Finland, Norway, Malta, Belgium, and Slovenia. Eligible newcomers can enroll with Services Australia to obtain a Reciprocal Medicare Card, granting access to subsidized GP consultations under the Medicare Benefits Schedule (MBS), free essential inpatient and emergency treatment at public hospitals, and subsidized prescription medicines under the Pharmaceutical Benefits Scheme (PBS).'
  })
];
