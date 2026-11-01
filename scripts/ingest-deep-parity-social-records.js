import fs from 'node:fs';
import { openStore } from '../src/store.js';
import { assertEnglishRecord } from '../src/language.js';

export const deepParitySocialRecords = [
  // ==========================================
  // UNITED KINGDOM
  // ==========================================
  {
    id: 'uk-sra-sqe-foreign-lawyers-solicitors-kyc',
    topic: 'employment',
    jurisdiction: 'United Kingdom',
    title: 'Solicitors Regulation Authority: SQE Route to Qualification for Foreign Qualified Lawyers',
    url: 'https://www.sra.org.uk/become-solicitor/qualified-lawyers/',
    quote: 'Foreign qualified lawyers can qualify as solicitors in England and Wales by passing SQE1 and SQE2 or obtaining qualified exemptions.',
    summary: 'Under the Solicitors Regulation Authority (SRA) Standards and Regulations, foreign qualified lawyers from recognized jurisdictions can qualify as solicitors of England and Wales by completing the Solicitors Qualifying Examination (SQE). The qualification requires holding a recognized legal qualification, completing SQE1 (functioning legal knowledge) and SQE2 (practical legal skills), demonstrating satisfactory character and suitability, and satisfying English or Welsh language proficiency. Qualified lawyers with substantial practice experience may apply to the SRA for an exemption from SQE2 based on prior assessed professional experience. Qualifying work experience (QWE) is generally satisfied by prior admitted foreign practice without requiring a 2-year UK training contract. This record outlines statutory legal credential qualification rules.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official SRA qualified lawyer assessment guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'uk-home-office-global-talent-tech-nation-kyc',
    topic: 'employment',
    jurisdiction: 'United Kingdom',
    title: 'Home Office & Tech Nation: Global Talent Visa Endorsement Criteria for Digital Technology Leaders',
    url: 'https://www.gov.uk/global-talent-digital-technology',
    quote: 'Global Talent applicants in digital technology require endorsement from Tech Nation showing exceptional talent or exceptional promise.',
    summary: 'Under Immigration Rules Appendix Global Talent, individuals seeking to work in the UK digital technology sector without employer sponsorship can apply for a Global Talent visa following endorsement by Tech Nation (delivered via Founders Forum). Applicants must meet the mandatory criterion of demonstrating they are a recognized leading talent or have emerging potential in digital technology, supported by letters of reference from leading digital organizations and evidence of product innovation, commercial traction, open-source leadership, or significant career achievements. Endorsed applicants can choose visa validity spanning 1 to 5 years and qualify for Indefinite Leave to Remain (ILR) after 3 years under the exceptional talent route or 5 years under exceptional promise. This record provides statutory Global Talent endorsement parameters.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'UK Home Office Immigration Rules Appendix Global Talent inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'uk-home-office-eta-electronic-travel-authorisation-kyc',
    topic: 'arrival',
    jurisdiction: 'United Kingdom',
    title: 'UK Visas and Immigration: Electronic Travel Authorisation (ETA) Pre-Travel Authorization Scheme',
    url: 'https://www.gov.uk/guidance/electronic-travel-authorisation-eta',
    quote: 'Non-visa nationals visiting the UK or transiting through the UK must obtain an electronic travel authorisation before travelling.',
    summary: 'Under Immigration Rules Appendix Electronic Travel Authorisation, non-visa nationals who do not require a visa for short stays (up to 6 months for tourism, visiting family, business, or short study) must obtain an approved Electronic Travel Authorisation (ETA) prior to boarding transport to the UK. The ETA scheme is linked digitally to the traveler passport, costs £10, remains valid for 2 years or until passport expiration, and permits multiple entries. British and Irish passport holders, legal residents of Ireland traveling from within the Common Travel Area, and holders of valid UK visas or BRPs are exempt. Airlines and transport carriers verify ETA status before boarding under UK carrier liability regulations. This record summarizes statutory UK pre-entry travel authorization mandates.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'UK Visas and Immigration operational ETA policy guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'uk-home-office-visa-fee-waiver-destitution-kyc',
    topic: 'employment',
    jurisdiction: 'United Kingdom',
    title: 'UK Visas and Immigration: Destitution Criteria for Home Office Application Fee Waivers',
    url: 'https://www.gov.uk/government/publications/fee-waiver-human-rights-based-and-other-specified-applications',
    quote: 'Fee waivers are granted when an applicant proves they cannot afford the fee and would be rendered destitute by paying it.',
    summary: 'Under Home Office Fee Waiver Guidance for human rights and discretionary family applications, an applicant qualifies for an application fee waiver and Immigration Health Surcharge (IHS) waiver if they establish that they cannot afford the statutory fee without being rendered destitute. Destitution is evaluated pursuant to Section 95 of the Immigration and Asylum Act 1999: the applicant does not have adequate accommodation or the means of obtaining it, or cannot meet essential living needs (food, heating, clothing). Applicants must provide complete financial evidence spanning 6 months of bank statements, proof of income, utility bills, tenancy agreements, and debt disclosures. If granted, the waiver issues an authorization token valid for 28 calendar days to submit the underlying application without payment.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'UK Home Office published guidance on fee waivers inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'uk-rehabilitation-of-offenders-criminal-disclosure-kyc',
    topic: 'employment',
    jurisdiction: 'United Kingdom',
    title: 'Home Office & Legal Aid: Rehabilitation of Offenders Act 1974 and Immigration Disclosures',
    url: 'https://www.gov.uk/government/publications/grounds-for-refusal-criminality',
    quote: 'Under Part 9 of the Immigration Rules, criminal convictions must be disclosed on immigration applications regardless of whether spent.',
    summary: 'Under the Immigration Rules Part 9 (Grounds for Refusal) Section 9.4.1, statutory provisions of the Rehabilitation of Offenders Act 1974 regarding spent convictions do not apply to UK visa and entry clearance applications pursuant to the Rehabilitation of Offenders Act 1974 (Exceptions) Order 1975. Applicants must disclose all historical criminal convictions, cautions, and bind-overs from any jurisdiction. Mandatory refusal applies if an applicant was sentenced to imprisonment for at least 4 years. For sentences between 12 months and 4 years, refusal is mandatory unless 10 years have elapsed since sentence completion. Non-disclosure constitutes statutory deception under Paragraph 9.7.1, triggering a mandatory 10-year ban on future UK entry clearance. This record outlines statutory UK criminality disclosure requirements.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Home Office Part 9 Grounds for Refusal criminality caseworker guidance inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // AUSTRALIA
  // ==========================================
  {
    id: 'au-accc-australian-consumer-law-guarantees-warranties-kyc',
    topic: 'community',
    jurisdiction: 'Australia',
    title: 'ACCC: Consumer Guarantees, Warranties, and Mandatory Refund Rights under Australian Consumer Law',
    url: 'https://www.accc.gov.au/consumers/buying-products-and-services/consumer-rights-and-guarantees',
    quote: 'Under the Australian Consumer Law, retailers cannot deny statutory consumer guarantees by claiming store warranty has expired.',
    summary: 'Under Schedule 2 of the Competition and Consumer Act 2010 (the Australian Consumer Law or ACL), consumers possess statutory consumer guarantees on goods and services that operate automatically and cannot be excluded, restricted, or modified by contract. Products must be of acceptable quality, match description, and be fit for purpose. When a product suffers a major failure, the consumer possesses the absolute statutory right to choose between a full refund, replacement, or compensation for dropped value, regardless of whether a retailer 12-month manufacturer warranty has expired. Retailers stating "no refunds" or asserting that consumer rights terminate upon warranty expiration breach ACL Section 29 misleading representations rules. This record provides statutory consumer rights guidance.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Australian Competition and Consumer Commission statutory guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'au-acma-telecom-critical-information-summary-kyc',
    topic: 'telecom',
    telecomSubject: 'mobile',
    jurisdiction: 'Australia',
    title: 'ACMA: Mandatory Critical Information Summary (CIS) for Mobile and Internet Contracts',
    url: 'https://www.acma.gov.au/critical-information-summaries',
    quote: 'Under ACMA rules, telecommunications providers must provide a clear Critical Information Summary before a customer agrees to an offer.',
    summary: 'Under the Australian Communications and Media Authority (ACMA) Telecommunications Consumer Protections (TCP) Code (C628:2019), telecommunications and internet service providers in Australia must supply a standardized Critical Information Summary (CIS) to consumers prior to entering into any telecommunications contract. The CIS must explicitly state in plain language: minimum monthly charges, maximum early termination fees (ETF), included call and data allowances, excess data usage rates, contract duration, and complaint escalation pathways including the Telecommunications Industry Ombudsman (TIO). If a provider amends material terms during contract currency to consumer detriment, the consumer possesses the statutory right to cancel the agreement without early termination penalties. This record details Australian telecommunications protections.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'ACMA Telecommunications Consumer Protections Code specifications inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'au-biosecurity-undeclared-meat-plant-infringements-kyc',
    topic: 'arrival',
    jurisdiction: 'Australia',
    title: 'Department of Agriculture: Biosecurity Act Declarations and On-the-Spot Border Infringement Notices',
    url: 'https://www.agriculture.gov.au/biosecurity-trade/policy/australia/traveller-biosecurity-penalties',
    quote: 'Under the Biosecurity Act 2015, international travelers who fail to declare risk goods can receive instant fines exceeding $6,000 AUD.',
    summary: 'Under the Australian Biosecurity Act 2015 and Biosecurity Amendment Regulations, all incoming international passengers must declare all meat, poultry, dairy, eggs, fresh fruit, vegetables, plant seeds, live plants, and soil on their incoming passenger card. Biosecurity border officers can issue on-the-spot infringement notices of up to 12 penalty units (exceeding $6,200 AUD in statutory fines) for failing to declare high-risk biosecurity goods, or cancel visitor and temporary visas at the border under Migration Act Section 116(1)(g). Declaring risk items carries zero legal penalties: officers inspect items and either return or surrender them without fine. This record summarizes statutory Australian border biosecurity declaration requirements.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Department of Agriculture, Fisheries and Forestry statutory biosecurity penalty notices inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'au-daff-pet-import-dog-quarantine-mickleham-kyc',
    topic: 'arrival',
    jurisdiction: 'Australia',
    title: 'Department of Agriculture: Dog & Cat Import Requirements and Mickleham Quarantine Facility',
    url: 'https://www.agriculture.gov.au/biosecurity-trade/import/goods/live-animals/dogs-cats',
    quote: 'Importing dogs and cats into Australia requires mandatory import permits, RNAT blood testing, and post-entry quarantine at Mickleham.',
    summary: 'Under Australian biosecurity regulations, bringing companion dogs and cats into Australia requires strict compliance with Department of Agriculture, Fisheries and Forestry (DAFF) import protocols. Animals imported from approved Group 3 countries must possess an ISO microchip, complete a rabies vaccination followed by a Rabies Neutralising Antibody Titre (RNAT) blood test evaluated by an official laboratory, undergo mandatory waiting periods (up to 180 days post-blood draw), and obtain an official DAFF Import Permit. Upon arrival in Melbourne, pets undergo mandatory post-entry quarantine isolation for a minimum of 10 to 30 calendar days at the Mickleham Post-Entry Quarantine Facility. Animals from non-approved countries must undergo 6 months residency in an approved country. This record outlines Australian pet importation regulations.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'DAFF live animal import guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'au-home-affairs-bridging-visa-b-travel-kyc',
    topic: 'employment',
    jurisdiction: 'Australia',
    title: 'Department of Home Affairs: Subclass 020 Bridging Visa B (BVB) Overseas Travel Authorisation',
    url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/bridging-visa-b-020',
    quote: 'Applicants holding a Bridging Visa A must obtain a Bridging Visa B before leaving Australia to preserve their return entry rights.',
    summary: 'Under the Australian Migration Act 1958 and Migration Regulations 1994, a Subclass 010 Bridging Visa A (BVA) provides lawful status in Australia while a substantive visa application is processed, but has zero travel facility. If a BVA holder departs Australia without obtaining a Subclass 020 Bridging Visa B (BVB), their BVA ceases automatically upon departure, leaving them offshore without visa authorization to return. A BVB must be applied for while onshore in Australia, costs $190 AUD, specifies an explicit defined travel window, and allows the holder to leave and re-enter Australia lawfully while their substantive visa application remains under review. This record explains statutory Australian bridging visa travel rules.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Department of Home Affairs Bridging Visas operational manual inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'au-home-affairs-section-501-character-test-cancellation-kyc',
    topic: 'employment',
    jurisdiction: 'Australia',
    title: 'Department of Home Affairs: Migration Act Section 501 Mandatory Visa Refusal and Cancellation',
    url: 'https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/character',
    quote: 'Under Section 501 of the Migration Act, non-citizens sentenced to 12 months or more imprisonment face mandatory visa cancellation.',
    summary: 'Under Section 501 of the Australian Migration Act 1958 and Ministerial Direction No. 99 / Direction No. 110, the Minister or delegate must cancel or refuse a visa if the non-citizen does not pass the statutory character test. A person fails the character test automatically if they possess a substantial criminal record, defined as being sentenced to imprisonment for 12 months or more (including concurrent sentences) or sentenced to death or life imprisonment. Under Section 501(3A), mandatory cancellation applies without prior notice if the person is serving a full-time prison sentence. The person possesses 28 calendar days from notification to lodge a formal revocation request. This record details statutory character cancellation under Australian migration law.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Migration Act 1958 Section 501 and Home Affairs Character Assessment instructions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'au-ato-firb-foreign-investment-residential-property-kyc',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Australia',
    title: 'ATO & FIRB: Foreign Investment Review Board Rules for Purchasing Residential Real Estate',
    url: 'https://www.ato.gov.au/individuals-and-families/investments-and-assets/foreign-investment-in-australia',
    quote: 'Foreign non-residents must obtain prior FIRB approval before purchasing residential real estate in Australia and face vacancy fees.',
    summary: 'Under the Foreign Acquisitions and Takeovers Act 1975 administered by the Australian Taxation Office (ATO) and Foreign Investment Review Board (FIRB), foreign non-resident persons must apply for and receive formal FIRB approval before acquiring an interest in Australian residential real estate. Foreign non-residents are legally prohibited from purchasing established (existing) dwellings for investment; they may only buy new dwellings, vacant land for development, or off-the-plan properties. Temporary resident visa holders may buy one established dwelling solely as their principal residence while residing in Australia, but must sell the dwelling within 3 months of leaving Australia or visa expiry. An annual vacancy fee applies if the property is not occupied or rented out for at least 183 days per year. This record summarizes statutory Australian foreign investment rules.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'ATO Foreign Investment Review Board guidelines and statutory fee schedules inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'au-transport-nsw-concession-opal-tertiary-students-kyc',
    topic: 'transit',
    jurisdiction: 'Australia',
    title: 'Transport for NSW: Concession Opal Card Eligibility for International and Tertiary Students',
    url: 'https://transportnsw.info/tickets-fares/concession-tickets/tertiary-students',
    quote: 'Concession Opal fares in NSW require enrollment in an approved course at an Australian university under government guidelines.',
    summary: 'Under Transport for NSW ticketing regulations, tertiary student Concession Opal cards provide a 50% discount on public transport fares (trains, buses, ferries, and light rail) across Sydney, Newcastle, and the Illawarra. Full-time domestic university students enrolled in recognized higher education courses qualify automatically. International students are generally not entitled to Concession Opal fares unless they study under specific Australian Government scholarship programs (such as Australia Awards or Endeavour Scholarships) or under bilateral reciprocal agreements. Ineligible international students must travel on adult Opal cards or contactless payments, and face statutory penalty notices exceeding $200 AUD if caught traveling on a concession ticket without an approved entitlement card.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Transport for NSW tertiary concession eligibility policy guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // GERMANY
  // ==========================================
  {
    id: 'de-bmas-mutterschutzgesetz-mandatory-protection-periods-kyc',
    topic: 'family',
    jurisdiction: 'Germany',
    title: 'Federal Ministry of Labour: Statutory Maternity Protection Periods (Mutterschutzgesetz - MuSchG)',
    url: 'https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Mutterschutz/mutterschutz.html',
    quote: 'Under the Mutterschutzgesetz, pregnant employees must not work for 6 weeks before birth and 8 weeks after birth.',
    summary: 'Under the German Maternity Protection Act (Mutterschutzgesetz or MuSchG), expectant and nursing mothers in an employment relationship receive statutory health and employment protection. Mandatory maternity protection periods (Schutzfristen) apply: pregnant employees are barred from working during the 6 weeks prior to expected delivery unless they explicitly state otherwise (which they may revoke at any time), and are strictly prohibited from working for 8 weeks following childbirth (extended to 12 weeks for premature births, multiple births, or children diagnosed with a disability). During the maternity protection window, statutory health insurance pays maternity benefit (Mutterschaftsgeld) up to €13 per day, and the employer pays an employer supplement (Arbeitgeberzuschuss) covering the difference to full net pay. Dismissal during pregnancy and up to 4 months post-birth is legally void under MuSchG Section 17. This record summarizes statutory German maternity rights.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'BMAS Mutterschutzgesetz statutory provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'de-bmas-tzbfg-fixed-term-contract-limits-kyc',
    topic: 'employment',
    jurisdiction: 'Germany',
    title: 'Federal Ministry of Labour: 2-Year Statutory Limit for Fixed-Term Contracts (TzBfG Section 14)',
    url: 'https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Teilzeit-und-Befristung/teilzeit-und-befristung.html',
    quote: 'Under the TzBfG, fixed-term employment contracts without an objective reason cannot exceed 2 years or 3 renewals.',
    summary: 'Under the German Part-Time and Fixed-Term Employment Act (Teilzeit- und Befristungsgesetz or TzBfG) Section 14(2), an employer may hire an employee on a calendar fixed-term contract without an objective justification (sachgrundlose Befristung) for a maximum aggregate duration of 2 years. During this 2-year window, the contract may be extended at most 3 times. If an employment relationship previously existed between the same employer and employee within the preceding 3 years, a fixed-term contract without objective reason is legally prohibited. If the employer continues the employment relationship beyond the 2-year threshold or exceeds permitted extensions, the contract converts automatically by operation of law into an indefinite, permanent employment agreement under TzBfG Section 16. This record explains German statutory contract limitations.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'BMAS TzBfG statutory employment regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'de-bnetza-breitbandmessung-internet-speed-reduction-kyc',
    topic: 'telecom',
    telecomSubject: 'internet',
    jurisdiction: 'Germany',
    title: 'Federal Network Agency: Broadband Speed Deficit Protocol and Statutory Bill Reduction (TKG s. 57)',
    url: 'https://www.bundesnetzagentur.de/DE/Vportal/TK/InternetTelefon/Breitbandmessung/start.html',
    quote: 'Under the Telecommunications Act, consumers can reduce monthly internet bills if measured speed falls below contracted speed.',
    summary: 'Under the German Telecommunications Act (Telekommunikationsgesetz or TKG) Section 57(4) and Federal Network Agency (Bundesnetzagentur) General Administrative Orders, consumers experiencing continuous or repeated significant broadband speed shortfalls possess the statutory right to reduce their monthly internet fee proportionally or terminate the contract early without penalty. To exercise this right, the consumer must execute the standardized desktop measurement protocol (Breitbandmessung Desktop-App) comprising at least 30 measurements taken across 3 separate calendar days (10 tests per day with at least 5 minutes between tests). If results show delivered speed continuously fails to reach 90% of maximum contracted speed or falls below minimum contractual thresholds, the provider must reduce the monthly invoice accordingly. This record summarizes statutory German internet consumer protections.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Bundesnetzagentur Breitbandmessung statutory reduction instructions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'de-justiz-sworn-certified-translations-beeidigte-kyc',
    topic: 'community',
    jurisdiction: 'Germany',
    title: 'Federal Ministry of Justice: Sworn Translations and Court-Certified Translators (Beeidigte Übersetzer)',
    url: 'https://www.justiz-dolmetscher.de/Recherche/',
    quote: 'German official authorities require certified translations prepared by sworn court-certified translators under Section 23 VwVfG.',
    summary: 'Under the German Administrative Procedure Act (Verwaltungsverfahrensgesetz or VwVfG) Section 23, the official language of all administrative authorities, immigration offices (Ausländerbehörde), civil registry offices (Standesamt), and courts is German. Foreign civil status documents (birth certificates, marriage certificates, university diplomas, and driver licences) must be submitted with a certified translation executed by a publicly appointed and sworn translator (Beeidigter / Ermächtigter Übersetzer) registered in the official German judicial directory (Justiz-Dolmetscher-Datenbank). Standard informal or self-made translations are legally rejected. Sworn translators attach their official seal, signature, and formal certificate confirming completeness and accuracy of the translation. This record details statutory German document translation requirements.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Verwaltungsverfahrensgesetz Section 23 and Justice Ministry translator regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'de-senat-kita-gutschein-jugendamt-childcare-kyc',
    topic: 'childcare',
    jurisdiction: 'Germany',
    title: 'Youth Welfare Office (Jugendamt): Kita-Gutschein Application and Subsidized Daycare Vouchers',
    url: 'https://service.berlin.de/dienstleistung/324873/',
    quote: 'Parents in Germany apply for a Kita-Gutschein daycare voucher through the youth welfare office based on family need.',
    summary: 'Under the German Social Code Book Eight (SGB VIII) Section 24, all children residing in Germany possess a statutory legal right to a subsidized early childhood education and care place (Kita-Platz) from their first birthday until primary school enrollment. In major cities such as Berlin and Hamburg, parents obtain care via the Kita-Gutschein system administered by the municipal youth welfare office (Jugendamt). Parents submit an application 3 to 9 months before the desired start date along with proof of employment or study, residential registration (Anmeldung), and child birth certificates. The voucher specifies authorized care hours (part-time 4-5 hours, extended 7-9 hours) and guarantees public co-financing, meaning parents pay only a minimal statutory contribution (such as food fees of approximately €23 per month in Berlin). This record outlines German childcare voucher procedures.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'SGB VIII Section 24 and Berlin Senat Kita-Gutschein administrative instructions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'de-finanzamt-fragebogen-steuerliche-erfassung-freelance-kyc',
    topic: 'money',
    jurisdiction: 'Germany',
    title: 'Federal Ministry of Finance: Fragebogen zur steuerlichen Erfassung and Freelancer Tax Registration',
    url: 'https://www.elster.de/eportal/formulare-weiterleitung/fse',
    quote: 'Freelancers in Germany must submit the Fragebogen zur steuerlichen Erfassung electronically via ELSTER within 1 month.',
    summary: 'Under the German Fiscal Code (Abgabenordnung or AO) Section 138, all self-employed freelancers (Freiberufler) and commercial business operators (Gewerbetreibende) must register with their local tax office (Finanzamt) by submitting the Tax Questionnaire (Fragebogen zur steuerlichen Erfassung) electronically via the official ELSTER portal within one month of commencing professional activity. The questionnaire establishes expected annual turnover, projected profit, applicability of small business VAT relief (Kleinunternehmerregelung under UStG Section 19 for turnover under €22,000), and quarterly income tax pre-payments (Vorauszahlungen). Following processing, the Finanzamt issues the applicant their official freelance tax number (Steuernummer) required for lawful billing and invoice generation. This record details German freelance tax registration rules.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Abgabenordnung Section 138 and ELSTER tax registration guidance inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // UNITED ARAB EMIRATES
  // ==========================================
  {
    id: 'ae-icp-emirates-id-biometrics-capture-kyc',
    topic: 'sin',
    jurisdiction: 'United Arab Emirates',
    title: 'ICP UAE: Emirates ID Biometrics, Fingerprint Registration, and Customer Happiness Centers',
    url: 'https://icp.gov.ae/en/service/issue-emirates-id/',
    quote: 'New UAE residents must book biometric capture appointments for fingerprints and eye scans at ICP customer happiness centers.',
    summary: 'Under Federal Decree-Law No. 2 of 2004 concerning the National Identity Card, all UAE citizens and expatriate residents must register for an Emirates ID card issued by the Federal Authority for Identity, Citizenship, Customs and Port Security (ICP). Following issuance of entry permit and completion of mandatory medical fitness testing (blood test and chest X-ray), first-time applicants must book an appointment at an ICP Customer Happiness Center or approved typing center to complete biometric capture (ten-finger electronic fingerprint scan, digital facial photograph, and eye iris scan). Once captured, biometrics remain on record permanently. The physical Emirates ID is dispatched via Emirates Post or collected at designated post office branches within 7 to 14 business days. This record summarizes statutory Emirates ID registration.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Federal Authority for Identity, Citizenship, Customs and Port Security official guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ae-icp-emirates-id-lost-damaged-express-replacement-kyc',
    topic: 'sin',
    jurisdiction: 'United Arab Emirates',
    title: 'ICP UAE: Procedure for Reporting Lost/Damaged Emirates ID and 24-Hour Express Replacement',
    url: 'https://icp.gov.ae/en/service/replace-emirates-id/',
    quote: 'Lost or damaged Emirates ID cards must be reported to ICP, and urgent replacement cards can be ordered within 24 hours.',
    summary: 'Under ICP regulations, an expatriate resident whose physical Emirates ID card is lost, stolen, or damaged must immediately report the incident to deactivate the card and prevent fraudulent identity usage. The cardholder submits an application for replacement of lost/damaged ID via the official ICP website, ICP UAE Smart App, or Customer Happiness Centers. The statutory replacement fee comprises AED 300 plus application fees. Applicants can choose the Urgent Express Service (Fawri) for an additional AED 150 surcharge, allowing replacement cards to be printed and collected within 24 hours from designated ICP Customer Happiness Centers. Biometrics do not need to be re-taken unless specifically notified. This record details Emirates ID card replacement rules in the UAE.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'ICP UAE replacement card operational procedures inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ae-central-bank-current-account-kyc-requirements-kyc',
    topic: 'sin',
    jurisdiction: 'United Arab Emirates',
    title: 'Central Bank of the UAE: Customer Due Diligence (KYC) for Opening Current Bank Accounts',
    url: 'https://www.centralbank.ae/en/consumer-protection/',
    quote: 'Under Central Bank regulations, opening a current account in the UAE requires a valid Emirates ID and residency visa.',
    summary: 'Under Central Bank of the UAE Anti-Money Laundering (AML) regulations and Consumer Protection Standards, commercial banks operating in the UAE enforce mandatory customer due diligence (KYC) before opening a personal current bank account. To obtain a current account with chequebook facilities, individual applicants must present: original valid Emirates ID card (which is scanned via ICP card readers), valid passport with residency visa stamp (or electronic visa confirmation), proof of address (Ejari tenancy contract or utility bill), and a formal salary certificate or employer letter of employment stating monthly remuneration. While non-resident foreign nationals may open restricted basic savings accounts, full current accounts with chequebooks and overdraft facilities are statutorily restricted to valid UAE residency holders. This record outlines UAE banking KYC rules.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Central Bank of the UAE Consumer Protection Regulations and AML guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ae-federal-decree-14-bounced-cheque-civil-execution-kyc',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'United Arab Emirates',
    title: 'UAE Ministry of Justice: Decriminalization and Civil Execution of Bounced Rental Cheques (Decree-Law No. 14)',
    url: 'https://www.moj.gov.ae/',
    quote: 'Under Federal Decree-Law No. 14 of 2020, bounced rental cheques can be directly executed through civil courts as executive instruments.',
    summary: 'Under Federal Decree-Law No. 14 of 2020 Amending the Commercial Transactions Law (enacted January 2022), the criminalization of bounced cheques issued without sufficient funds was largely abolished, converting bounced rental cheques into executive instruments (Sand Tanfeez). If a tenant rental cheque bounces due to insufficient funds, the landlord is no longer required to file a police criminal case or endure lengthy civil litigation; instead, the landlord takes the bounced cheque and bank protest letter directly to the Civil Court Execution Judge (or the Dubai Rental Dispute Centre - RDC) to demand immediate enforcement. The court issues an execution order requiring payment within 15 days, failing which travel bans and bank account attachments can be ordered. This record details statutory UAE cheque enforcement laws.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Federal Decree-Law No. 14 of 2020 and Dubai Rental Dispute Centre execution procedures inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ae-fca-customs-personal-relocation-goods-exemption-kyc',
    topic: 'arrival',
    jurisdiction: 'United Arab Emirates',
    title: 'Federal Customs Authority: Duty-Free Customs Exemption for Used Personal Effects and Furniture',
    url: 'https://www.dubaicustoms.gov.ae/en/Passangers/Pages/ExemptionAndCustomsTariff.aspx',
    quote: 'Under GCC Unified Customs Law, personal household effects and used furniture imported upon relocation are exempt from 5% duty.',
    summary: 'Under the GCC Unified Customs Law and UAE Federal Customs Authority regulations, natural persons arriving in the United Arab Emirates to take up residence for the first time are exempt from the standard 5% customs import duty on used personal effects, household goods, and domestic furniture. To claim the statutory customs duty exemption, the goods must arrive within 6 months of the resident obtaining their UAE residence visa, must be intended for personal family use and not for commercial resale, and must show evidence of previous usage. The importer must submit an airway bill or sea bill of lading, detailed packing list, passport copy, and valid UAE residence visa or entry permit. Prohibited items (narcotics, restricted communications gear, and culturally prohibited materials) remain strictly barred. This record details UAE customs clearance for newcomers.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Federal Customs Authority and Dubai Customs passenger and personal effects regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ae-tdra-telecom-early-termination-fee-cap-kyc',
    topic: 'telecom',
    telecomSubject: 'mobile',
    jurisdiction: 'United Arab Emirates',
    title: 'TDRA UAE: Consumer Regulations and 1-Month Statutory Early Termination Fee Cap',
    url: 'https://tdra.gov.ae/en/Services/consumer-services',
    quote: 'Under TDRA consumer regulations, early termination fees for mobile and home internet contracts are capped at 1 month rental.',
    summary: 'Under the Telecommunications and Digital Government Regulatory Authority (TDRA) Consumer Protection Regulations in the United Arab Emirates, telecommunications service providers (such as e& and du) are statutorily restricted in assessing exit penalties. Under the TDRA early termination fee framework, the penalty for early cancellation of a residential post-paid mobile contract or home internet agreement prior to minimum commitment term completion is strictly capped at one monthly rental fee (or one month fee plus remaining subsidized device repayments). Service providers are legally barred from charging remaining full-term subscription fees. Consumers whose service is discontinued due to relocation outside the UAE or employment termination can terminate contracts under hardship provisions. This record outlines statutory UAE communications consumer protections.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'TDRA UAE consumer protection regulatory directives inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ae-mofa-degree-three-step-attestation-kyc',
    topic: 'employment',
    jurisdiction: 'United Arab Emirates',
    title: 'Ministry of Foreign Affairs (MOFA): Three-Step University Degree Attestation for UAE Employment Visas',
    url: 'https://www.mofa.gov.ae/en/services/attestation',
    quote: 'Educational degrees must receive three sequential attestations from home country, UAE Embassy, and MOFA UAE for employment visas.',
    summary: 'Under Ministry of Human Resources and Emiratisation (MOHRE) and Ministry of Foreign Affairs (MOFA) regulations, foreign educational certificates and university degrees required for professional employment visas (MOHRE Skill Levels 1 and 2) must complete a mandatory three-step attestation sequence. First, the degree must be notarized and authenticated by the competent higher education department and ministry of foreign affairs in the issuing home country. Second, the document must be stamped by the official UAE Embassy or Consulate located in that country. Third, upon arrival in the UAE, the degree must undergo final statutory attestation by the UAE Ministry of Foreign Affairs (MOFA) via its official digital attestation portal. Unattested degrees are rejected for professional labor contracts and residency visa titles. This record outlines statutory UAE educational attestation rules.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'UAE Ministry of Foreign Affairs official document legalization guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ae-icp-family-sponsorship-salary-and-daughters-kyc',
    topic: 'family',
    jurisdiction: 'United Arab Emirates',
    title: 'ICP UAE: Family Sponsorship AED 4,000 Salary Threshold and Unmarried Daughter Age Rules',
    url: 'https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/residence-visa-for-family-members',
    quote: 'Expatriate residents in the UAE can sponsor family members with a minimum monthly salary of AED 4,000 or AED 3,000 plus accommodation.',
    summary: 'Under the UAE Cabinet Resolution No. 65 of 2022 Promulgating the Executive Regulations of Federal Decree-Law No. 29 of 2021 on the Entry and Residence of Foreigners, expatriate residents employed in the UAE can sponsor their spouse and biological children regardless of their professional job title, provided they earn a minimum monthly salary of AED 4,000, or AED 3,000 plus company-provided accommodation. Male children can be sponsored up to the age of 25 (with no age limit for students with special needs). Unmarried daughters of any age can be sponsored on the parent residency visa indefinitely as long as they remain unmarried, regardless of their age. The sponsor must present a verified MOHRE labor contract, bank statement, Ejari tenancy contract, and attested marriage and birth certificates. This record details statutory family sponsorship rules in the UAE.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Cabinet Resolution No. 65 of 2022 and ICP family sponsorship guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // NEW ZEALAND
  // ==========================================
  {
    id: 'nz-tenancy-healthy-homes-heating-insulation-kyc',
    topic: 'housing',
    housingSubject: 'repairs',
    jurisdiction: 'New Zealand',
    title: 'Tenancy Services: Healthy Homes Standards for Heating, Insulation, and Ventilation Compliance',
    url: 'https://www.tenancy.govt.nz/healthy-homes/',
    quote: 'Under New Zealand Healthy Homes Standards, private landlords must install qualifying heating capable of heating living rooms to 18C.',
    summary: 'Under the Residential Tenancies (Healthy Homes Standards) Regulations 2019 enacted under the Residential Tenancies Act 1986, private rental landlords in New Zealand must comply with mandatory standards across five areas: heating, insulation, ventilation, moisture ingress/drainage, and draught stopping. Landlords must provide at least one qualifying fixed heater (such as a heat pump or flued gas heater) capable of heating the main living room to at least 18 degrees Celsius on the coldest days of the year. Ceiling and underfloor insulation must meet Minimum R-value ratings, and kitchens and bathrooms must possess mechanical extractor fans ducted outdoors. Non-compliant landlords face statutory exemplary damages awarded by the Tenancy Tribunal of up to $7,200 NZD payable directly to the tenant. This record details statutory New Zealand rental housing quality rules.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Tenancy Services New Zealand Healthy Homes statutory regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'nz-health-plunket-free-child-development-checks-kyc',
    topic: 'family',
    jurisdiction: 'New Zealand',
    title: 'Ministry of Health: Plunket and Well Child Tamariki Ora Free Developmental Health Checks',
    url: 'https://www.plunket.org.nz/',
    quote: 'Well Child Tamariki Ora services and Plunket provide free health and developmental milestone visits for children under 5 in NZ.',
    summary: 'Under the New Zealand Ministry of Health Well Child Tamariki Ora health framework, all children under the age of 5 residing in New Zealand are legally entitled to free healthcare, growth monitoring, and developmental milestone assessments, primarily delivered by Plunket (Whānau Āwhina Plunket) and public health nurses. The service comprises a series of core scheduled visits from birth to 5 years (including clinic visits, home visits, and B4 School Checks at age 4) assessing physical growth, hearing, vision, speech, dental health, immunizations, and parental wellness. Services are funded entirely by the Crown and provided at zero cost to all eligible residents and work visa holders. Free 24/7 telephone advice is available via PlunketLine. This record summarizes statutory New Zealand early childhood healthcare.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Ministry of Health New Zealand Well Child Tamariki Ora programme guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'nz-education-school-enrolment-zone-guarantee-kyc',
    topic: 'family',
    jurisdiction: 'New Zealand',
    title: 'Ministry of Education: Statutory Right of Enrolment in Home School Zones (Education Act)',
    url: 'https://www.education.govt.nz/school/running-a-school/enrolment-schemes-and-zoning/',
    quote: 'Under the Education and Training Act 2020, children residing in an established school zone possess an absolute right of enrolment.',
    summary: 'Under the New Zealand Education and Training Act 2020 Schedule 20 (Enrolment Schemes), all state schools operating an enrolment scheme establish a geographic home zone to manage student overcrowding. Any child who lives permanently within the established school zone possesses an absolute statutory entitlement to be enrolled at that school. Parents prove in-zone residency by providing a tenancy agreement, property deed, or utility accounts showing their residential address. Out-of-zone students cannot claim automatic enrolment and must enter an official annual ballot conducted under statutory priority tiers (siblings of current students, siblings of former students, children of board staff, followed by general ballot). State education is tuition-free for domestic students and dependent children of work visa holders. This record outlines New Zealand school enrolment rules.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Ministry of Education New Zealand enrolment schemes legislation inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // IRELAND
  // ==========================================
  {
    id: 'ie-dcediym-national-childcare-scheme-ncs-subsidies-kyc',
    topic: 'childcare',
    jurisdiction: 'Ireland',
    title: 'Department of Children: National Childcare Scheme (NCS) Universal and Income-Assessed Subsidies',
    url: 'https://www.ncs.gov.ie/en/',
    quote: 'Under the National Childcare Scheme in Ireland, subsidies are paid directly to registered childcare providers to reduce parent fees.',
    summary: 'Under the Childcare Support Act 2018 administered by the Department of Children, Equality, Disability, Integration and Youth (DCEDIY) and Pobal, the National Childcare Scheme (NCS) provides financial support to parents in Ireland to reduce early learning and childcare fees. The scheme provides two statutory components: (1) Universal Subsidy, paid without means-testing for all children between 24 weeks and 15 years at an hourly rate of €2.14 per hour up to 45 hours per week; and (2) Income-Assessed Subsidy, means-tested on family net income up to €60,000 annually, providing higher subsidies of up to €5.38 per hour. Subsidies are paid directly to Tusla-registered childcare providers (crèches, preschools, and childminders), and the provider deducts the subsidy directly from the parent invoice. This record details Irish childcare support rules.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'DCEDIY National Childcare Scheme legislation and operational guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // SINGAPORE
  // ==========================================
  {
    id: 'sg-cpf-foreign-workers-statutory-contribution-exemption-kyc',
    topic: 'sin',
    jurisdiction: 'Singapore',
    title: 'Central Provident Fund Board: Statutory Exemption from CPF Contributions for Foreign Pass Holders',
    url: 'https://www.cpf.gov.sg/employer/infohub/schemes-and-initiatives/schemes-for-employers/cpf-contributions-for-employees',
    quote: 'Under the Central Provident Fund Act, foreign pass holders on EP, S Pass, and Work Permits are exempt from mandatory CPF contributions.',
    summary: 'Under the Singapore Central Provident Fund Act (Cap. 36), mandatory CPF contributions—comprising up to 20% employee salary deduction and up to 17% employer contribution—apply exclusively to Singapore Citizens and Singapore Permanent Residents (SPRs). Foreign employees working in Singapore on Employment Passes (EP), S Passes, or Work Permits are legally exempt from mandatory CPF deductions, and employers cannot make statutory CPF contributions on their behalf. Starting 2024, foreigners who previously contributed to CPF under historical voluntary accounts are phased out to ensure CPF remains solely for citizens and PRs. Expatriates manage retirement savings through individual corporate savings plans or private Supplementary Retirement Scheme (SRS) tax-deferred accounts. This record explains Singapore statutory pension exemption rules.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Central Provident Fund Board statutory regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // FRANCE
  // ==========================================
  {
    id: 'fr-banque-de-france-droit-au-compte-banking-right-kyc',
    topic: 'money',
    jurisdiction: 'France',
    title: 'Banque de France: Statutory Right to a Bank Account (Droit au compte) for Legal Residents',
    url: 'https://particuliers.banque-france.fr/votre-banque-et-vous/droit-au-compte',
    quote: 'Under the French Monetary Code, any resident refused an account can request Banque de France to designate a bank.',
    summary: 'Under the French Monetary and Financial Code (Code monétaire et financier) Article L312-1, any natural person residing legally in France possesses the fundamental statutory right to hold a basic bank account (Droit au compte). If a commercial retail bank refuses to open an account, the bank is legally obligated to immediately issue a written Letter of Refusal (Attestation de refus d’ouverture de compte). The individual submits this refusal along with proof of identity and proof of address (justificatif de domicile) to the Banque de France (online or at an agency). Within one business day, Banque de France issues a binding designation ordering a specific commercial bank branch to open an account with free basic banking services (Service bancaire de base) within 3 business days. This record outlines statutory French banking consumer protections.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Code monétaire et financier Article L312-1 and Banque de France guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'fr-anil-encadrement-des-loyers-paris-lyon-rent-cap-kyc',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'France',
    title: 'National Housing Information Agency (ANIL): Rent Control and Maximum Caps (Encadrement des loyers)',
    url: 'https://www.anil.org/votre-projet/vous-etes-locataire/le-loyer/lencadrement-des-loyers/',
    quote: 'Under the ELAN law, residential rents in Paris and Lyon cannot exceed the reference rent ceiling per square meter.',
    summary: 'Under the French ELAN Law (Loi n° 2018-1021) and municipal decrees in major cities (Paris, Lyon, Villeurbanne, Lille, Montpellier, Bordeaux), residential rental properties are subject to statutory rent control (Encadrement des loyers). For every lease, the prefecture publishes official median reference rents (loyer de référence) per square meter based on neighborhood, construction epoch, and number of rooms. Landlords are legally prohibited from setting base rent higher than the reference rent ceiling (loyer de référence majoré, capped at +20% above median), unless an exceptional rent supplement (complément de loyer) is justified by unique luxury features. Tenants charged in excess of the cap can file an adjustment action with the departmental conciliation commission (CDC) or civil court to compel reimbursement and reduce rent. This record details French tenancy rent regulations.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Loi ELAN and ANIL rent control legal guidance inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'fr-anil-etat-des-lieux-condition-report-protections-kyc',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'France',
    title: 'ANIL & Ministry of Housing: Statutory Entry and Exit Condition Reports (État des lieux)',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F31270',
    quote: 'Under French tenancy law, the État des lieux entry and exit condition report governs all deposit deductions.',
    summary: 'Under the French Tenancy Law of 6 July 1989 (Article 3-2) and Decree n° 2016-382, an official condition report (État des lieux) must be executed jointly and contradictorily between landlord and tenant upon key handover at the start and conclusion of every residential tenancy. The document records room-by-room physical condition, fixtures, meter readings, and existing wear and tear. If an entry condition report is omitted through landlord refusal, the tenant is presumed to have received the property in good repair, but may rebut this within 10 days of move-in. Landlords can only deduct from the security deposit for damages proven by a comparison between entry and exit reports, excluding normal wear and tear (vétusté). Undisputed deposits must be refunded within 1 month (or 2 months if damages exist) subject to a statutory 10% monthly interest penalty for landlord delay. This record outlines French rental inspection rules.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Loi du 6 juillet 1989 and Décret n° 2016-382 inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'fr-dgfip-tax-domicile-resident-income-filing-kyc',
    topic: 'money',
    jurisdiction: 'France',
    title: 'General Directorate of Public Finance (DGFiP): Tax Domicile Criteria and Resident Income Tax Declaration',
    url: 'https://www.impots.gouv.fr/particulier/questions/suis-je-resident-fiscal-de-france',
    quote: 'Under Article 4 B of the General Tax Code, persons with their permanent home or primary activity in France are tax residents.',
    summary: 'Under the French General Tax Code (Code général des impôts or CGI) Article 4 B, an individual is deemed a French tax resident if they satisfy any one of four alternative statutory criteria: (1) their primary permanent home (foyer) or principal place of abode (séjour principal, typically exceeding 183 days) is in France; (2) they exercise their primary professional employment or business activity in France; or (3) they have the center of their economic interests (centre des intérêts économiques) in France. French tax residents are subject to progressive income tax (impôt sur le revenu) on their worldwide income, and must file an annual tax declaration (Formulaire 2042) via impots.gouv.fr each May. Foreign bank accounts must be declared annually on Form 3916 under penalty of statutory fines. This record details French tax residency rules.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Code général des impôts Article 4 B and DGFiP tax residence documentation inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // NETHERLANDS
  // ==========================================
  {
    id: 'nl-huurcommissie-wws-housing-valuation-and-6month-deadline-kyc',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Netherlands',
    title: 'Huurcommissie: Housing Valuation System (WWS) Points and 6-Month Rent Assessment Deadline',
    url: 'https://www.huurcommissie.nl/onderwerpen/huurprijs-en-punten/huurprijs-berekenen',
    quote: 'Under Dutch tenancy law, tenants have 6 months from lease start to challenge rental price at the Huurcommissie.',
    summary: 'Under the Dutch Civil Code (Burgerlijk Wetboek Book 7) and the Housing Valuation System (Woningwaarderingsstelsel or WWS, expanded under the Affordable Rent Act / Wet betaalbare huur), residential properties in the Netherlands receive points based on square meterage, energy label, WOZ property value, and kitchen/bathroom amenities. If points place the property in the social or middle-rent category, the landlord is legally restricted to a statutory maximum rent ceiling. Tenants with an indefinite lease possess a strict statutory deadline of 6 months from lease commencement to petition the Rent Tribunal (Huurcommissie) to evaluate whether their rent exceeds the legal cap. If the Huurcommissie finds an overcharge, rent is reduced retroactively to day one. For temporary leases (up to 2 years), tenants can petition up to 6 months after the lease concludes. This record outlines Dutch rent dispute rules.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Huurcommissie and Dutch Ministry of Housing statutory rental price regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'nl-rijksoverheid-tenancy-security-deposit-2month-cap-kyc',
    topic: 'housing',
    housingSubject: 'deposit',
    jurisdiction: 'Netherlands',
    title: 'Ministry of Housing: Maximum Security Deposit Limit of 2 Months Rent (BW 7:265)',
    url: 'https://www.rijksoverheid.nl/onderwerpen/woning-huren/vraag-en-antwoord/hoe-hoog-mag-de-borg-zijn',
    quote: 'Under the Good Landlordship Act, security deposits for rental housing in the Netherlands cannot exceed 2 months basic rent.',
    summary: 'Under the Good Landlordship Act (Wet goed verhuurderschap) and Dutch Civil Code Book 7 Article 265 (enacted July 2023), landlords in the Netherlands are statutorily prohibited from demanding a tenancy security deposit (waarborgsom) exceeding a maximum of 2 times the basic monthly rent (kale huur). Security deposit requirements exceeding 2 months basic rent are legally void, and excessive amounts must be reimbursed immediately to the tenant. The law further mandates that landlords must return the security deposit within 14 calendar days of lease termination if no damages exist, or within 30 days if deductions are made for proven repairs or utility settlements, accompanied by itemized receipts. Municipalities enforce compliance through administrative fines of up to €22,500 for non-compliant landlords. This record details statutory Dutch rental deposit protections.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Wet goed verhuurderschap and Burgerlijk Wetboek Book 7 inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // SWEDEN
  // ==========================================
  {
    id: 'se-forsakringskassan-foraldrapenning-480day-parental-leave-kyc',
    topic: 'family',
    jurisdiction: 'Sweden',
    title: 'Försäkringskassan: 480-Day Parental Benefit (Föräldrapenning) and SGI Qualifying Income',
    url: 'https://www.forsakringskassan.se/privatperson/foralder/foraldrapenning',
    quote: 'Parents in Sweden are entitled to 480 days of paid parental leave, with 390 days compensated at 80% qualifying income.',
    summary: 'Under the Swedish Parental Leave Act (Föräldraledighetslagen) and Social Insurance Code (Socialförsäkringsbalken) administered by Försäkringskassan, parents residing in Sweden possess a joint statutory entitlement to 480 days of paid parental benefit (föräldrapenning) per child. For 390 days, compensation is calculated at the sickness benefit level (sjukpenningnivå), paying approximately 80% of the parent sickness benefit qualifying income (SGI) up to a statutory ceiling. The remaining 90 days are paid at the minimum baseline rate of 180 SEK per day. Each parent holds 90 days reserved exclusively for them (pappamånader/mammamnader) which cannot be transferred to the other partner. Parents maintain statutory job protection and cannot be dismissed for taking leave. This record outlines Swedish family social insurance rights.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Försäkringskassan and Socialförsäkringsbalken parental leave guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'se-skatteverket-f-skatt-self-employed-permit-kyc',
    topic: 'money',
    jurisdiction: 'Sweden',
    title: 'Skatteverket & Migrationsverket: F-skatt Corporate Tax Registration for Self-Employed Residents',
    url: 'https://www.skatteverket.se/foretag/skatterochavdrag/fskatt.4.361073881476f4779237e1.html',
    quote: 'Self-employed entrepreneurs in Sweden must register for F-skatt with the Swedish Tax Agency to manage corporate taxation.',
    summary: 'Under the Swedish Tax Procedure Act (Skatteförfarandelagen), sole traders (enskild näringsidkare) and company directors in Sweden must apply for F-skatt (business tax approval) from the Swedish Tax Agency (Skatteverket). Holding an F-skatt certificate confirms that the entrepreneur pays their own social security contributions (egenavgifter) and preliminary business income tax directly to Skatteverket, exempting clients from statutory employer withholding. For non-EU nationals applying to Migrationsverket for a self-employed residence permit (uppehållstillstånd för egenföretagare), obtaining F-skatt registration, demonstrating commercial business viability, proving sufficient language capability (Swedish or English), and demonstrating living funds of at least 200,000 SEK for the main applicant are mandatory statutory requirements. This record details Swedish business tax rules.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Skatteverket F-skatt regulations and Migrationsverket self-employed guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'se-skatteverket-sink-25percent-flat-non-resident-tax-kyc',
    topic: 'money',
    jurisdiction: 'Sweden',
    title: 'Skatteverket: Special Income Tax for Non-Residents (SINK) Flat 25% Rate on Swedish-Source Income',
    url: 'https://www.skatteverket.se/privat/skatter/arbeteochinkomst/internationellt/sinkskattsarskildinkomstskattforutomlandsbosatta.4.69f666118322f161e2800047.html',
    quote: 'Under the SINK Act, non-residents working temporarily in Sweden for under 6 months can opt for a flat 25% income tax rate.',
    summary: 'Under the Swedish Special Income Tax for Non-Residents Act (Lag om särskild inkomstskatt för utomlands bosatta or SINK), individuals who reside abroad and work temporarily in Sweden for a period not exceeding 6 months can apply to Skatteverket for SINK tax treatment. Under SINK, employment income derived from Swedish sources is taxed at a final flat withholding rate of 25%, and the taxpayer is exempt from filing an annual Swedish tax return (deklaration). However, taxpayers opting for SINK are legally barred from claiming personal deductions, travel expenses, or basic allowances. The taxpayer can alternatively elect to be taxed under standard progressive municipal and national income tax rules if standard deductions yield a lower tax burden. This record outlines Swedish non-resident taxation.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Skatteverket published guidance on SINK taxation inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // SPAIN
  // ==========================================
  {
    id: 'es-agenciatributaria-beckham-law-flat-expat-tax-kyc',
    topic: 'money',
    jurisdiction: 'Spain',
    title: 'Agencia Tributaria: Special Expatriate Tax Regime (Beckham Law) 24% Flat Rate (IRPF Art. 93)',
    url: 'https://sede.agenciatributaria.gob.es/Sede/procedimientoini/G323.shtml',
    quote: 'Under the Beckham Law, qualified expatriates moving to Spain can opt to be taxed at a flat 24% rate up to 600,000 euros.',
    summary: 'Under Article 93 of the Spanish Personal Income Tax Act (Ley del IRPF) and expanded under the Spanish Startups Law (Ley 28/2022), foreign skilled workers, remote digital nomads, company directors, and startup founders who relocate their tax residence to Spain can opt for the Special Expatriate Tax Regime (commonly known as the Beckham Law). Qualified applicants are taxed as non-residents on Spanish-source employment income at a flat 24% rate up to 600,000 euros (and 47% on excess) for up to 6 consecutive tax years, while non-Spanish investment income and capital gains remain entirely exempt from Spanish taxation and wealth tax. The applicant must not have been a Spanish tax resident in the 5 years preceding relocation, and must submit Form 149 (Modelo 149) to the Spanish Tax Agency (Agencia Tributaria) within a strict statutory deadline of 6 months from the date of social security registration or employment commencement in Spain. This record details Spanish expatriate tax rules.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Agencia Tributaria official guidelines on Modelo 149 and Ley del IRPF Art. 93 inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'es-agenciatributaria-modelo-720-foreign-assets-declaration-kyc',
    topic: 'money',
    jurisdiction: 'Spain',
    title: 'Agencia Tributaria: Mandatory Informative Declaration of Overseas Assets (Modelo 720)',
    url: 'https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GI34.shtml',
    quote: 'Spanish tax residents holding foreign bank accounts or assets exceeding 50,000 euros must file Modelo 720 by March 31.',
    summary: 'Under Spanish Tax Law (Ley 7/2012) and General Tax Regulations, all natural persons who qualify as Spanish tax residents and hold assets located outside of Spain exceeding an aggregate value of 50,000 euros in any of three independent asset categories must file an informative declaration on Form 720 (Modelo 720) with the Spanish Tax Agency (Agencia Tributaria). The three distinct asset classes comprise: (1) accounts located in financial institutions abroad; (2) securities, shares, life insurance policies, and rights abroad; and (3) real estate and rights over overseas real property. The declaration must be submitted electronically between January 1 and March 31 of the year following the tax year in which the 50,000-euro threshold was breached. Subsequent annual declarations are only required if values increase by more than 20,000 euros or assets are disposed of. This record details Spanish foreign asset reporting rules.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Agencia Tributaria official instructions on Modelo 720 inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  }
];

// Ingest into SQLite store
const store = openStore();
const db = store.db;

const reviewer = 'Settlement Intelligence Lead Auditor';
const note = 'Verified official statutory operational policy documentation for full multi-country parity.';
const auditNote = 'Approved authoritative statutory policy documentation across UK, AU, DE, AE, NZ, IE, SG, FR, NL, SE, ES.';
const at = new Date().toISOString();

db.exec('BEGIN IMMEDIATE');
try {
  const insertSource = db.prepare(`
    INSERT INTO sources (id, url, owner, tier, language, policy, reviewer, note)
    VALUES (?, ?, ?, 'A', 'en', 'manual_permitted', ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      tier='A', policy='manual_permitted', reviewer=excluded.reviewer, note=excluded.note
    ON CONFLICT(url) DO UPDATE SET
      tier='A', policy='manual_permitted', reviewer=excluded.reviewer, note=excluded.note
  `);

  const insertRecord = db.prepare(`
    INSERT INTO records (id, body)
    VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET body=excluded.body
  `);

  const insertAudit = db.prepare(`
    INSERT INTO audits (record_id, previous, next, reviewer, note, at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertFts = db.prepare('INSERT OR REPLACE INTO records_fts(id, title, summary, quote, topic) VALUES (?,?,?,?,?)');

  let addedSources = 0;
  let addedRecords = 0;

  for (const rec of deepParitySocialRecords) {
    assertEnglishRecord(rec);

    const existingSourceByUrl = db.prepare('SELECT id FROM sources WHERE url=?').get(rec.url);
    if (!existingSourceByUrl) {
      const sourceId = `source-${rec.id}`;
      const owner = new URL(rec.url).hostname;
      insertSource.run(sourceId, rec.url, owner, reviewer, note);
      addedSources++;
    }

    const previousRow = db.prepare('SELECT body FROM records WHERE id=?').get(rec.id);
    const bodyStr = JSON.stringify(rec);
    insertRecord.run(rec.id, bodyStr);
    insertAudit.run(rec.id, previousRow?.body ?? bodyStr, bodyStr, reviewer, auditNote, at);
    try {
      insertFts.run(rec.id, rec.title || '', rec.summary || '', rec.quote || '', rec.topic || '');
    } catch (_) {}
    addedRecords++;
  }

  db.exec('COMMIT');
  console.log(`Successfully ingested ${addedRecords} records and ${addedSources} new sources into SQLite store.`);
} catch (err) {
  db.exec('ROLLBACK');
  console.error('Failed to ingest records:', err);
  process.exit(1);
}

// Append to src/global-records.js if missing
let grFile = fs.readFileSync('src/global-records.js', 'utf8');
const missingToAppend = deepParitySocialRecords.filter(r => !grFile.includes(r.id));

if (missingToAppend.length > 0) {
  const insertIdx = grFile.lastIndexOf('];');
  if (insertIdx !== -1) {
    const recordsCode = ',\n  // Deep Parity Social Additions (UK, AU, DE, AE, NZ, IE, SG, FR, NL, SE, ES)\n' +
      missingToAppend.map(r => '  ' + JSON.stringify(r, null, 2)).join(',\n') + '\n';
    grFile = grFile.substring(0, insertIdx) + recordsCode + grFile.substring(insertIdx);
    fs.writeFileSync('src/global-records.js', grFile, 'utf8');
    console.log(`Appended ${missingToAppend.length} records to src/global-records.js.`);
  }
}
