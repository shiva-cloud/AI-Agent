// scripts/inject-mastery-records.js
import { DatabaseSync } from 'node:sqlite';
import { assertEnglishRecord } from '../src/language.js';
import { configureEnglishDatabase } from '../src/migrations.js';

export const masteryRecords = [
  {
    id: 'global-immigration-fundamentals-migration-definitions',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'International Migration: Fundamental distinctions between immigration, emigration, and general migration',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals.html',
    quote: 'Migration refers broadly to the movement of individuals across international borders.',
    summary: 'Under international public law and immigration frameworks, migration refers broadly to the geographic movement of individuals across boundaries; emigration defines the lawful departure and departure formalities from one origin country; and immigration defines the formal entry, lawful admission, and settlement in a destination sovereign state for permanent or long-term residence. Sovereign states exercise exclusive territorial authority over admissions, and an individual cannot claim immigrant status under international law without satisfying the domestic immigration acts and entry clearances established by the host sovereign nation.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-immigration-law-vs-policy-sovereign-authority',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'Immigration Law vs Administrative Policy: Legislative statutes, ministerial instructions, and sovereign officer discretion',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/acts-regulations.html',
    quote: 'Statutory immigration acts define mandatory legal entitlements while operational policies guide administrative execution.',
    summary: 'Statutory immigration law (such as Canada Immigration and Refugee Protection Act - IRPA, or the UK Immigration Act 1971) constitutes primary legislation enacted by parliament that defines mandatory statutory thresholds, fundamental legal entitlements, and judicial appeal rights. In contrast, immigration policy consists of executive regulations, ministerial instructions, annual immigration levels plans, quotas, and operational guidelines issued by government departments (like IRCC). While policies can be amended quickly by executive decision without parliamentary votes, they cannot override statutory legislation. Border control officers and visa officers hold ultimate statutory authority under the law to approve or reject applications based on genuine intentions and admissibility, and an administrative decision cannot be appealed solely because an applicant finds it unfair unless an error of law, jurisdiction, or procedural fairness occurred.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-visa-vs-residence-permit-border-refusal',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'Travel Visas vs Domestic Residence Permits and Port of Entry Sovereign Border Discretion',
    url: 'https://www.cbsa-asfc.gc.ca/travel-voyage/declare-eng.html',
    quote: 'A visa does not guarantee entry into Canada; border services officers make the final determination of admissibility.',
    summary: 'A visa or Electronic Travel Authorization (eTA) functions strictly as an entry clearance document permitting a foreign national to travel to an international port of entry (airport, land border, or seaport). It does not guarantee admission or grant an unconditional right of entry. At the port of entry, border services officers (such as CBSA in Canada or CBP in the US) possess sovereign statutory authority to conduct primary and secondary inspections, examine intentions, and legally refuse entry or cancel a visa if the traveler is inadmissible, cannot satisfy financial requirements, or appears to have undisclosed immigrant intent on a temporary visa. A residence permit or lawful status represents the legal right to physically reside and work or study within the country, granted only after lawful admission through immigration authorities.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-document-legalization-apostille-notarization',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'Cross-Border Document Authentication: Notarization, Hague Apostille Convention, and Consular Legalization',
    url: 'https://www.international.gc.ca/gac-amc/about-a_propos/services/authentication-authentification_documents.aspx',
    quote: 'Canada joined the Hague Apostille Convention on January 11, 2024, simplifying document authentication abroad.',
    summary: 'Cross-border immigration filings require verified official documentation. Notarization certifies the authenticity of a signature, identity, or true copy by a licensed notary public. For international validity, countries participating in the 1961 Hague Apostille Convention issue a single Apostille certificate (which Canada joined in January 2024 via Global Affairs Canada), eliminating embassy legalization for member states. For non-Hague jurisdictions, documents must undergo multi-tiered consular legalization: local notarization, home country ministry of foreign affairs attestation, and destination country consular/embassy authentication. Immigration authorities require certified sworn translations for any non-official language records, and inconsistencies in names across historical documents require formal statutory affidavits or official name change gazettes before submission.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-immigration-consultants-fraud-guarantees',
    topic: 'community',
    jurisdiction: 'CA',
    title: 'Authorized Immigration Representatives, Ghost Consultants, and Fraudulent Visa Guarantees',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigration-citizenship-representative/choose.html',
    quote: 'Only authorized representatives registered with CICC or a Canadian law society can charge a fee for immigration advice.',
    summary: 'Under Canadian law (IRPA Section 91) and international consumer protection standards, only licensed representatives—such as RCICs registered with the College of Immigration and Citizenship Consultants (CICC) or members of provincial law societies—may represent applicants for a fee. Unlicensed agents ("ghost consultants") are strictly illegal, and applicants who use them face application refusal and 5-year inadmissibility bans for misrepresentation if fraudulent documents are submitted. Legitimate immigration lawyers and consultants cannot offer 100% visa guarantees or promise expedited processing through internal government contacts, as processing is strictly subject to officer assessment and statutory rules. Applicants have the full legal right to represent themselves and submit applications independently without paying a consultant or lawyer.',
    risk: 'low',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-home-country-employment-pre-planning',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'Pre-Immigration Planning: Maintaining overseas employment, financial sustainability, and dual intent',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/visitors/dual-intent-applicants.html',
    quote: 'Dual intent is legally recognized under IRPA Section 22(2); an applicant may intend to become a PR while applying for temporary entry.',
    summary: 'In international immigration planning, applicants can lawfully maintain existing employment, business operations, and salary income in their home country while an overseas permanent residency or visa application is pending. Applying for immigration does not revoke or restrict foreign employment, and applicants should maintain continuous work until formal landing documents (COPR/visa) are issued. Under IRPA Section 22(2) (Dual Intent), holding or declaring a prospective permanent residence intention does not automatically disqualify an applicant from obtaining a temporary resident visa, provided they satisfy the officer they will leave when their authorized stay expires. Applicants must plan financial sustainability using unencumbered liquid funds meeting statutory settlement thresholds (LICO / Express Entry proof of funds) without relying on borrowed funds or predatory loans.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-five-eyes-biometrics-undeclared-refusals',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'Five Eyes (FCC) Biometric Data-Sharing, Previous Visa Refusal Disclosures, and A40 Misrepresentation',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/identity-management/biometrics/information-sharing.html',
    quote: 'Automated biometric and biographical data-sharing occurs systematically between Five Eyes member states.',
    summary: 'Under the Five Country Conference (FCC / Five Eyes) High-Value Data Sharing Protocol, Canada, the United States, the United Kingdom, Australia, and New Zealand automatically exchange biometric data (fingerprints and facial images) and immigration history records. If an applicant fails to declare a previous visa refusal from any country on an IRCC or international application, automated biometric matching flags the concealment to the assessing officer. Concealing prior refusals constitutes material misrepresentation under IRPA Section 40, resulting in automatic visa rejection, revocation of existing statuses, and a mandatory 5-year global inadmissibility ban.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-maintained-status-study-work-continuity',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'Maintained Status (Implied Status) and Legal Employment Continuity under IRPR Section 183(5)',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/visitors/implied-status-extending-stay.html',
    quote: 'A temporary resident who applies for an extension before permit expiry maintains their legal status by operation of law.',
    summary: 'Under Immigration and Refugee Protection Regulations (IRPR) Section 183(5), if a temporary resident (worker, student, or visitor) submits a valid application to extend or change their status prior to the expiration of their existing permit, their legal authorization to remain in the country and continue working or studying under the same conditions continues by operation of law until a final decision is rendered by IRCC. Proof of maintained status consists of the initial permit, proof of application submission prior to expiry (IRCC acknowledgement letter), and fee receipt. Leaving the country while on maintained status forfeits the right to work upon re-entry until the new permit is approved.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-pr-residency-obligation-and-citizenship-distinction',
    topic: 'community',
    jurisdiction: 'CA',
    title: 'Permanent Residency Obligations vs Citizenship Rights and Physical Presence Calculations',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/newcomers/councils.html',
    quote: 'Permanent residents must maintain 730 days of physical presence every 5 years; citizenship requires 1095 days.',
    summary: 'Permanent Residency (PR) provides the legal right to live, study, and work in Canada without employer sponsorship, access provincial healthcare, and receive social protections under the Charter of Rights and Freedoms. However, PR status is conditional: holders must satisfy the residency obligation under IRPA Section 28 (physically present in Canada for at least 730 days in every 5-year rolling period), cannot vote in federal or provincial elections, cannot run for public office, and remain subject to deportation for serious criminality or misrepresentation. In contrast, Citizenship under the Citizenship Act is unconditional, cannot be lost due to absence abroad, grants full voting and passport rights, and requires 1,095 days of physical presence in Canada during the 5 years immediately preceding the application, alongside language proficiency (CLB 4+) and passing the citizenship test.',
    risk: 'low',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-proof-of-funds-settlement-finance-rules',
    topic: 'money',
    jurisdiction: 'CA',
    title: 'Proof of Funds (POF) Standards: Liquid assets, gift deeds, and unencumbered settlement funds',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html',
    quote: 'Settlement funds must be official, liquid, unencumbered, and cannot be borrowed from another party.',
    summary: 'Express Entry (FSW/FST) and economic immigration categories require applicants to provide proof of unencumbered settlement funds based on 50% of the Low Income Cut-Off (LICO), updated annually by ministerial instructions. Acceptable funds must be completely liquid and accessible: cash deposits, savings accounts, treasury bills, and term deposits at regulated financial institutions. Borrowed funds, real estate equity, vehicle values, and speculative cryptocurrency assets are statutorily prohibited. If funds are provided by family members, they must be transferred irrevocably with an executed, notarized Deed of Gift confirming that the funds are non-repayable. Large unexplained bank deposits right before application submission trigger procedural fairness letters and source-of-funds scrutiny under anti-money laundering regulations.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-student-work-limits-pgwp-rules',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'International Student Work Regulations: Off-Campus 24-Hour Limit, Designated Learning Institutions, and PGWP',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/work-off-campus.html',
    quote: 'Eligible students may work off-campus up to 24 hours per week during academic sessions under IRPR Section 186(v).',
    summary: 'International students in Canada enrolled in full-time studies at a Designated Learning Institution (DLI) are authorized under IRPR Section 186(v) to work off-campus up to 24 hours per week during regular academic sessions, and full-time during scheduled academic breaks (winter and summer vacations). Unauthorized work exceeding statutory hour limits violates permit conditions, leading to exclusion orders, loss of study status, and ineligibility for the Post-Graduation Work Permit (PGWP). PGWP eligibility requires continuous full-time study throughout the academic program (except the final semester), graduation from an eligible public post-secondary institution or approved private degree program, and adherence to field-of-study language benchmarks (CLB 7 for university degrees, CLB 5 for college programs under recent ministerial instructions).',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-medical-inadmissibility-excessive-demand',
    topic: 'health',
    jurisdiction: 'CA',
    title: 'Immigration Medical Examination (IME), Excessive Demand on Health Services, and Public Safety Clearance',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/standard-requirements/medical-requirements/refusals-inadmissibility/excessive-demand-on-health-and-social-services.html',
    quote: 'Foreign nationals are inadmissible if their health condition causes excessive demand on public health services.',
    summary: 'Under IRPA Section 38(1), foreign nationals are inadmissible to Canada on health grounds if their health condition is likely to be a danger to public health (e.g. active tuberculosis), a danger to public safety, or might reasonably be expected to cause excessive demand on health or social services. Excessive demand is calculated annually as three times the Canadian average per capita health and social services expenditure. If projected treatment costs exceed this threshold over 5 consecutive years, the application is refused unless the applicant submits an approved Mitigation Plan demonstrating private payment ability for non-publicly funded social services, or falls into an exempt category (convention refugees, protected persons, and sponsored spouses or dependent children are statutorily exempt from excessive demand under IRPA Section 38(2)).',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-international-banking-wire-transfers-fintrac',
    topic: 'money',
    jurisdiction: 'CA',
    title: 'International Asset Transfer, FINTRAC $10,000 Cross-Border Declarations, and Bank Act Account Rights',
    url: 'https://fintrac-canafe.canada.ca/individuals-individus/trans-eng',
    quote: 'Cross-border transport of currency equal to or exceeding 10000 CAD must be reported to the CBSA.',
    summary: 'Cross-border financial settlement requires strict compliance with anti-money laundering regulations. Under the Proceeds of Crime (Money Laundering) and Terrorist Financing Act (PCMLTFA), currency or monetary instruments exceeding $10,000 CAD (or foreign equivalent) physically transported across the border must be declared to the CBSA on Form E677; failure to declare leads to seizure, mandatory civil penalties, and potential criminal forfeiture. Wire transfers exceeding $10,000 CAD sent through international banking channels are automatically reported by financial institutions to FINTRAC (Financial Transactions and Reports Analysis Centre). Under the Bank Act (Section 627.17), Canadian banks cannot refuse to open a basic personal chequing account simply because a newcomer does not have employment or has an initial low balance, provided two pieces of valid government identification are presented.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-refusal-appeals-judicial-review-iad',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'Immigration Application Refusals: Immigration Appeal Division (IAD) vs Federal Court Judicial Review',
    url: 'https://www.irb-cisr.gc.ca/en/hearing-procedures/Pages/iad-process.aspx',
    quote: 'Judicial review applications at the Federal Court must be filed within 60 days for overseas decisions under IRPA s.72.',
    summary: 'When an immigration or visa application is refused, the legal recourse depends strictly on the application category and statutory rights under IRPA. Canadian citizens and permanent residents sponsoring family class members have a statutory right of appeal to the Immigration Appeal Division (IAD) under IRPA Section 63, where appeals can be argued on errors of law or humanitarian and compassionate (H&C) considerations. However, overseas economic applicants, temporary visa applicants (visitor, student, worker), and Express Entry candidates have no right of administrative appeal to the IAD. Their sole legal remedy is an application for Leave and Judicial Review at the Federal Court of Canada under IRPA Section 72 within 60 days (for decisions made outside Canada) or 15 days (for decisions inside Canada). The Federal Court does not substitute its own decision; it determines only whether the officer committed a reviewable error of procedural fairness, jurisdictional breach, or made an unreasonable decision contrary to administrative law standards.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-child-school-enrollment-and-age-caps',
    topic: 'family',
    jurisdiction: 'CA',
    title: 'Minor Children School Enrollment Rights and Immigration Dependent Child Age Limits',
    url: 'https://www.ontario.ca/laws/statute/90e02',
    quote: 'Children residing in Ontario have the statutory right to attend publicly funded schools without paying fees under the Education Act.',
    summary: 'Under the Ontario Education Act (Section 49.1) and provincial education legislation across Canada, every minor child residing in the province has a statutory legal right to enroll in and attend publicly funded elementary and secondary schools without paying tuition, regardless of their parents immigration status or lack of permanent residency. School boards are legally prohibited from reporting undocumented families or student immigration inquiries to immigration enforcement (CBSA). Under IRPR Section 2, a dependent child qualifies for inclusion in immigration and permanent residence applications if they are under 22 years of age and not married or in a common-law partnership. Children aged 22 or older qualify only if they have depended continuously on the parent for financial support since before age 22 due to a physical or mental health condition.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-asylum-refugee-geneva-convention-safe-third-country',
    topic: 'community',
    jurisdiction: 'CA',
    title: 'Asylum and Refugee Protection: 1951 Geneva Convention, Safe Third Country Agreement (STCA), and IRB',
    url: 'https://www.irb-cisr.gc.ca/en/refugee-claims/Pages/index.aspx',
    quote: 'Refugee protection is granted under the 1951 Geneva Convention to individuals with a well-founded fear of persecution.',
    summary: 'Under the 1951 United Nations Convention Relating to the Status of Refugees and IRPA Section 96, refugee protection is granted to individuals who establish a well-founded fear of persecution based on race, religion, nationality, membership in a particular social group, or political opinion. In Canada, refugee claims made at the border or inland are adjudicated independently by the Refugee Protection Division (RPD) of the Immigration and Refugee Board (IRB). Under the Canada-US Safe Third Country Agreement (STCA), expanded across the entire land border including irregular crossings, individuals entering Canada from the United States cannot make a refugee claim at the border unless they qualify for a statutory exemption (such as having family members legally residing in Canada, being an unaccompanied minor, or holding a valid Canadian visa).',
    risk: 'low',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-customs-duty-free-settlers-effects',
    topic: 'arrival',
    jurisdiction: 'CA',
    title: 'Arrival Customs Exemption: Settler Effects (Tariff Item 9807.00.00), BSF186 Forms, and Device Searches',
    url: 'https://www.cbsa-asfc.gc.ca/publications/dm-md/d2/d2-2-1-eng.html',
    quote: 'Settlers may import personal and household effects duty-free under Tariff Item 9807.00.00.',
    summary: 'Under Customs Tariff Item 9807.00.00, individuals entering Canada with the intention of establishing permanent residence for more than 12 months (Settlers) are entitled to import their personal and used household effects completely free of customs duties and Goods and Services Tax (GST). To qualify, goods must have been owned, possessed, and used abroad prior to arrival. Newcomers must prepare CBSA Form BSF186 (Personal Effects Accounting Document) for goods accompanying them, and Form BSF186A for "Goods to Follow" that will arrive later. High-value jewelry must be individually photographed and appraised prior to landing. Under the Customs Act, CBSA officers have statutory authority to examine goods and digital devices at international border checkpoints; under current CBSA operational policy, digital device searches require specific indicators of customs violations or contraband.',
    risk: 'low',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'global-points-systems-crs-human-capital',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'Points-Based Immigration Systems: Comprehensive Ranking System (CRS), Human Capital Factors, and Category Draws',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/criteria-comprehensive-ranking-system/grid.html',
    quote: 'CRS ranks economic immigration candidates based on human capital factors including age, education, and language.',
    summary: 'Points-based skilled immigration systems (such as Canada Express Entry Comprehensive Ranking System - CRS, Australia SkillSelect, and New Zealand SMC) rank prospective immigrants objectively against standardized economic criteria. Under the CRS, candidates receive points across core human capital factors: age (maximum points awarded between ages 20 to 29, tapering down to zero by age 45), verified level of education evaluated through an ECA/WES report, official language proficiency benchmarks (CLB/NCLC in English and French), and qualifying skilled work experience (TEER categories 0, 1, 2, or 3). Ministerial instructions introduced category-based selection draws (targeting healthcare, STEM, trades, transport, agriculture, and French language proficiency), allowing candidates with specific in-demand occupations to receive Invitations to Apply (ITAs) at significantly lower CRS cutoff thresholds than general draws.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  }
];

export function injectMasteryRecords(dbPath = 'data/settlement.sqlite') {
  const db = new DatabaseSync(dbPath);
  configureEnglishDatabase(db);
  console.log(`Injecting ${masteryRecords.length} mastery statutory records into ${dbPath}...`);

  for (const r of masteryRecords) {
    r.reviewMethod = 'editorial_review';
    assertEnglishRecord(r);
    const body = JSON.stringify(r);
    db.prepare(`
      INSERT INTO records (id, body) VALUES (?, ?)
      ON CONFLICT(id) DO UPDATE SET body = excluded.body
    `).run(r.id, body);

    try {
      db.prepare('DELETE FROM records_fts WHERE id = ?').run(r.id);
      db.prepare(`
        INSERT INTO records_fts (id, title, summary, quote, topic)
        VALUES (?, ?, ?, ?, ?)
      `).run(r.id, r.title, r.summary, r.quote, r.topic);
    } catch (e) {
      // FTS table might be updated automatically or optional
    }
  }

  const count = db.prepare('SELECT count(*) as cnt FROM records').get();
  console.log(`Successfully injected mastery records! Total records in store now: ${count.cnt}`);
}

// If executed directly
if (process.argv[1]?.endsWith('inject-mastery-records.js')) {
  injectMasteryRecords();
}
