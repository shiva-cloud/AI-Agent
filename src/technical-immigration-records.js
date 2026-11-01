// Verified technical Canadian immigration, family sponsorship, Express Entry CRS,
// tenancy dispute and police certificate records conforming to assertEnglishRecord schema.

export const checkedAt = '2026-10-30';
export const expiresAt = '2026-11-25';

function createRecord({ id, title, topic, jurisdiction, url, quote, summary, housingSubject }) {
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
    reviewBasis: 'Official government operational policy and legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-30T12:00:00.000Z'
  };
}

export const technicalImmigrationRecords = [
  // ── 1. FAMILY & PARENT SPONSORSHIP ──────────────────────────────────────────
  createRecord({
    id: 'ircc-super-visa',
    title: 'IRCC: Super Visa for parents and grandparents',
    topic: 'family',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/parent-grandparent-super-visa.html',
    quote: 'The Super Visa lets eligible parents and grandparents visit family in Canada for up to 5 years at a time.',
    summary: 'The IRCC Super Visa allows eligible parents and grandparents of Canadian citizens and permanent residents to visit Canada for up to 5 continuous years per entry without renewing their status, with multi-entry validity up to 10 years. Applicants must provide a signed letter of financial promise from their host child or grandchild meeting the Minimum Necessary Income (LICO table based on household size), proof of valid emergency medical insurance from an approved Canadian or designated insurance company providing at least $100,000 in health coverage, and complete an immigration medical examination. Foreign pension or host country income of the parent cannot replace the Canadian sponsor financial requirement. This record does not verify individual financial eligibility or issue visas.'
  }),
  createRecord({
    id: 'ircc-spousal-sponsorship',
    title: 'IRCC: Sponsoring your spouse, partner or dependent child',
    topic: 'family',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children.html',
    quote: 'Sponsor your spouse, partner or dependent child to live in Canada as a permanent resident.',
    summary: 'Canadian citizens and permanent residents living in Canada can sponsor their spouse, common-law partner (requiring proof of at least 12 continuous months of cohabitation in a conjugal relationship), or dependent children under age 22. Sponsored spouses living inside Canada on valid temporary resident status can apply for an open work permit while their permanent residence application is being processed under the in-Canada spousal sponsorship public policy. Sponsoring a spouse does not require meeting a minimum necessary income threshold unless the dependent child also has dependent children of their own. Sponsors must sign an official 3-year undertaking of financial support. This record does not approve sponsorship applications or determine marriage validity.'
  }),
  createRecord({
    id: 'ircc-parent-sponsorship-pgp',
    title: 'IRCC: Parents and Grandparents Program (PGP)',
    topic: 'family',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/parents-grandparents.html',
    quote: 'Sponsor your parents and grandparents for permanent residence through the Parents and Grandparents Program.',
    summary: 'The Parents and Grandparents Program (PGP) allows Canadian citizens and permanent residents to sponsor parents and grandparents for permanent residence through an annual invitation-to-apply lottery system. Sponsors must prove they meet the Minimum Necessary Income (LICO plus 30%) for each of the 3 consecutive tax years prior to applying, evidenced exclusively by official CRA Notices of Assessment (NOA), and sign a 20-year undertaking to financially support their sponsored parents. Foreign pension or applicant income cannot be counted toward the sponsor income threshold. This record does not issue invitations to apply or calculate individual income.'
  }),
  createRecord({
    id: 'ircc-dependent-child-sponsorship',
    title: 'IRCC: Sponsoring a dependent child or orphaned family member',
    topic: 'family',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/who-you-can-sponsor.html',
    quote: 'A child qualifies as a dependent if they are under 22 years of age and not married or in a common-law relationship.',
    summary: 'A child qualifies as a dependent for Canadian immigration if they are under 22 years of age and not married or in a common-law partnership, or 22 and older if financially dependent due to a physical or mental health condition before age 22. When sponsoring a minor child with one biological parent living abroad, IRCC requires form IMM 5604 (Declaration from Non-Accompanying Parent) signed with certified photo ID. Canadian citizens and permanent residents may also sponsor an orphaned brother, sister, nephew, niece, or grandchild under 18 years old who is unmarried and whose parents are deceased. This record does not grant child custody or legal guardianship.'
  }),

  // ── 2. EXPRESS ENTRY, WORK EXPERIENCE & CRS ──────────────────────────────────
  createRecord({
    id: 'ircc-express-entry-crs',
    title: 'IRCC: Comprehensive Ranking System (CRS) criteria for Express Entry',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/criteria-comprehensive-ranking-system.html',
    quote: 'The Comprehensive Ranking System (CRS) ranks candidates out of 1,200 points across human capital, skill transferability and additional factors.',
    summary: 'The Express Entry Comprehensive Ranking System (CRS) ranks candidates out of 1,200 points across Core Human Capital (age points highest at 110 for ages 20 to 29 (100 with an accompanying spouse), falling each year from age 30 to 0 at age 45; education up to 150 points with 135 for Master degree and 120 for Bachelor degree; first language CLB level), Skill Transferability (combinations of post-secondary education with CLB 9+ language or 3+ years foreign work experience with Canadian work experience awarding up to 100 bonus points), and Additional Factors: 15 points for a Canadian citizen or permanent resident sibling, 50 points for bilingual French proficiency at NCLC 7, and 600 points for a provincial nomination. Category-based selection draws (such as STEM, healthcare, and skilled trades) require at least 12 months of full-time (or equivalent) work experience in an eligible occupation within the past 3 years, which need not be continuous (since 18 February 2026; it was 6 continuous months before). This record does not calculate individual CRS profiles or guarantee Invitations to Apply.'
  }),
  createRecord({
    id: 'ircc-work-experience-rules',
    title: 'IRCC: Work experience requirements for Express Entry',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/federal-skilled-workers.html',
    quote: 'Your skilled work experience must be paid work in NOC TEER 0, 1, 2, or 3.',
    summary: 'For the Federal Skilled Worker (FSW) program, candidates must have at least 1 continuous year of full-time (or equal part-time, minimum 1,560 hours at 30 hours per week) paid skilled work experience in NOC TEER 0, 1, 2, or 3 within the last 10 years; unpaid work and work while studying full-time do not qualify for FSW or Canadian Experience Class (CEC). CEC requires at least 1 year of skilled Canadian work experience on valid authorization within the last 3 years, which does not need to be continuous. Employer reference letters must state job title, start and end dates, weekly hours, salary, and list duties matching the NOC lead statement. Self-employed work in Canada is excluded from CEC but can qualify for FSW. This record does not determine occupation code classification or individual work history.'
  }),
  createRecord({
    id: 'ircc-pgwp-maintained-status',
    title: 'IRCC: Post-graduation work permit (PGWP) and maintained status',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/about.html',
    quote: 'A post-graduation work permit (PGWP) gives you open work status after completing an eligible Canadian program.',
    summary: 'Post-graduation work permits (PGWP) are open work permits issued once per lifetime for graduates of designated learning institutions; under current policy, graduates of master degree programs of at least 8 months are eligible for a 3-year PGWP. Temporary residents who apply to extend their work permit before their current status expires may continue working under the same conditions while awaiting a decision under maintained status pursuant to Immigration and Refugee Protection Regulations section 186(u). Candidates with an active Express Entry permanent residence application and valid work permit nearing expiry can apply for a Bridging Open Work Permit (BOWP) upon receiving an Acknowledgment of Receipt (AOR). This record does not issue study or work permits.'
  }),
  createRecord({
    id: 'ircc-settlement-funds-pof',
    title: 'IRCC: Proof of funds for Express Entry',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html',
    quote: 'You must show that you have enough money to settle in Canada if you are invited to apply under FSW or FST.',
    summary: 'Applicants under Federal Skilled Worker (FSW) and Federal Skilled Trades (FST) must show official bank letters proving unencumbered, readily available settlement funds based on family size (updated annually with LICO figures). Official bank letters must list all bank and investment accounts, balances, outstanding debts, and average balances for the past 6 months on official bank letterhead. Candidates applying under the Canadian Experience Class (CEC) or those authorized to work in Canada with a valid job offer from an employer are exempt from proof of funds requirements. This record does not verify individual bank balances or grant exemptions.'
  }),

  // ── 3. POLICE CERTIFICATES & MEDICAL ADMISSIBILITY ───────────────────────────
  createRecord({
    id: 'ircc-police-certificates-pcc',
    title: 'IRCC: Police certificates for immigration and citizenship',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/apply-permanent-residence/police-certificates.html',
    quote: 'You must get a police certificate from each country or territory where you have spent 6 or more months in a row since age 18.',
    summary: 'IRCC requires applicants and family members aged 18 and older to submit police clearance certificates (PCC) for any country where they have lived for 6 or more consecutive months since turning 18. Official certificates must be obtained from designated national authorities: India requires a Passport Seva Kendra (PSK) PCC via BLS International; United Kingdom requires an ACRO Police Certificate; United States requires an FBI Identity History Summary (IdHS) via fingerprinting; Philippines requires an NBI Clearance with biometric fingerprinting; Nigeria requires a CIID Police Character Certificate. Minor traffic fines do not cause criminal inadmissibility, but single DUI offences constitute serious criminality requiring formal Criminal Rehabilitation. Residency obligations require permanent residents to be physically present in Canada for at least 730 days in every 5-year window, or accompany a Canadian citizen spouse abroad. This record does not issue certificates or waive inadmissibility.'
  }),
  createRecord({
    id: 'ircc-medical-excessive-demand',
    title: 'IRCC: Immigration medical examination and excessive demand policy',
    topic: 'health',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/standard-requirements/medical-requirements/refusals-inadmissibility/excessive-demand-on-health-and-social-services.html',
    quote: 'The excessive demand threshold is updated annually and reflects three times the Canadian average health and social services spending.',
    summary: 'Applicants for Canadian permanent residence must complete an immigration medical examination with a panel physician using the eMedical system. Under IRCC excessive demand policy, medical conditions are assessed against the excessive demand cost threshold (three times the Canadian average per capita health spending). Common manageable chronic conditions such as controlled type 2 diabetes, treated hypertension, and stable conditions requiring standard outpatient medications do not exceed the cost threshold and do not result in medical inadmissibility. Sponsored spouses and dependent children are completely exempt from excessive demand assessment. This record does not diagnose conditions or issue medical clearance.'
  }),

  // ── 4. HOUSING & TENANCY DISPUTES ───────────────────────────────────────────
  createRecord({
    id: 'ontario-rent-increase-guideline',
    title: 'Ontario: Residential rent increase guideline and exemptions',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'ON',
    url: 'https://www.ontario.ca/page/residential-rent-increases',
    quote: 'The rent increase guideline is the maximum amount a landlord can increase a tenant rent during a year without approval from the LTB.',
    summary: 'Under Ontario Residential Tenancies Act (RTA), annual rent increases for residential rental units first occupied for residential purposes on or before November 15, 2018 are capped by the Ontario rent increase guideline (2.5% in 2024 and 2025, 2.1% in 2026), requiring at least 90 days advance written notice on official Form N1. Rental units in buildings or additions first occupied for residential purposes after November 15, 2018 are exempt from rent control caps, allowing landlords to increase rent by any amount with 90 days written notice on Form N2. Fixed-term leases automatically convert to month-to-month tenancies with statutory security of tenure without requiring a new lease agreement. This record does not establish individual rent amounts or resolve tenancy disputes.'
  }),
  createRecord({
    id: 'ontario-ltb-n12-compensation',
    title: 'LTB: Notice to end tenancy for landlord personal use (Form N12)',
    topic: 'housing',
    housingSubject: 'eviction',
    jurisdiction: 'ON',
    url: 'https://tribunalsontario.ca/ltb/notices-and-applications-forms/',
    quote: 'A landlord must give this notice if they in good faith require the rental unit for personal residential occupation.',
    summary: 'When an Ontario landlord serves a Form N12 notice to terminate a tenancy for personal use (for themselves, a spouse, child, or parent), section 48.1 of the Residential Tenancies Act requires the landlord to pay the tenant compensation equal to 1 month rent or offer another acceptable rental unit on or before the termination date on the notice. If the landlord fails to pay the compensation by the termination date, the LTB can dismiss the eviction application. If a landlord evicts in bad faith (such as relisting or re-renting within 12 months without occupying the unit), the LTB can order the landlord to pay the former tenant up to 12 months rent, moving expenses, and rent differentials under Form T5. This record does not issue eviction orders or award compensation.'
  }),
  createRecord({
    id: 'ontario-landlord-entry-privacy',
    title: 'Ontario: Landlord right of entry, privacy, and no-pet clauses',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'ON',
    url: 'https://www.ontario.ca/page/renting-ontario-your-rights',
    quote: 'Landlords must follow rules under the RTA before entering a rental property and regarding tenancy terms.',
    summary: 'Under Ontario Residential Tenancies Act, landlords may only enter a rented unit after giving at least 24 hours advance written notice specifying the date, time between 8 a.m. and 8 p.m., and a valid reason such as repairs, inspections, or mortgage appraisal, except in genuine emergencies or where the tenant consents. Section 14 of the RTA makes no pet clauses in tenancy agreements completely void and unenforceable, meaning a landlord cannot evict a tenant simply for having a pet unless the pet causes damage, severe allergic reactions, or substantial interference (condominium declarations may have separate valid pet bylaws). Only the court sheriff may physically enforce an eviction; illegal lockouts by landlords are offences investigated by the Rental Housing Enforcement Unit (RHEU). Landlords may only require first and last month rent deposits, and security deposits are illegal. This record does not enforce privacy or investigate offences.'
  }),

  // ── 5. DRIVING LICENCE FOREIGN EXPERIENCE ────────────────────────────────────
  createRecord({
    id: 'ontario-foreign-driving-experience',
    title: 'DriveTest Ontario: Foreign driver licence experience and road tests',
    topic: 'driving',
    jurisdiction: 'ON',
    url: 'https://drivetest.ca/licences/licence-exchanges/foreign-licence-experience-credits/',
    quote: 'You can credit foreign driving experience to fast-track your Ontario graduated driver licence.',
    summary: 'Applicants moving to Ontario with a driver licence from a non-reciprocal country can credit foreign driving experience toward the graduated licensing system. With 2 or more years of verified driving experience supported by an official driving record abstract (such as an authenticated extract from the issuing transportation authority like Sarathi in India or embassy), applicants may bypass the mandatory G1 (12 months) and G2 (12 months) waiting periods upon passing the G1 knowledge and vision tests, and book the full G highway road test directly. If an applicant fails the G road test on the first attempt, they must pass the G2 road test before attempting the G road test again. Reciprocal licence holders with 2 or more years experience receive a full G licence directly, while those with less than 2 years receive a G2 licence. New residents may drive on an out-of-province or foreign licence for up to 60 days before switching to an Ontario licence. This record does not issue driving licences or verify individual records.'
  }),

  // ── 6. FOREIGN POLICE CLEARANCE CERTIFICATES (USA, PHILIPPINES, NIGERIA) ────
  createRecord({
    id: 'ircc-foreign-pcc-usa-philippines-nigeria',
    title: 'IRCC: How to obtain police certificates from USA, Philippines, and Nigeria',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates/how.html',
    quote: 'Find out how and where to get a police certificate for living in the United States, Philippines, or Nigeria.',
    summary: 'IRCC requires police certificates for immigration from countries where an applicant lived for 6 consecutive months or longer since age 18. For the United States, applicants must obtain an FBI Identity History Summary (IdHS) clearance by submitting fingerprints on form FD-1164 directly to the FBI electronically or through an FBI-approved channeler. For the Philippines, applicants must submit an NBI Clearance issued by the National Bureau of Investigation with biometric fingerprinting on NBI Fingerprint Form No. 5. For Nigeria, applicants must obtain a Police Character Certificate issued by the Nigeria Police Force Criminal Intelligence and Investigations Department (CIID) in Alagbon, Lagos. If a country refuses or cannot issue a police certificate, an applicant must submit proof of refusal along with an official explanation letter showing all reasonable efforts. This record does not issue police clearance certificates.'
  }),

  // ── 7. PERMANENT RESIDENT RESIDENCY OBLIGATION & PRTD ───────────────────────
  createRecord({
    id: 'ircc-pr-residency-obligation-prtd',
    title: 'IRCC: Permanent resident 730-day residency obligation and PRTD',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-travel-document.html',
    quote: 'Permanent residents must meet the residency obligation of 730 days in Canada to maintain their status.',
    summary: 'Under section 28 of the Immigration and Refugee Protection Act (IRPA), permanent residents must accumulate at least 730 days (2 years) of physical presence in Canada within each 5-year rolling period to maintain permanent resident status. Days spent outside Canada count toward the 730 days residency obligation if accompanying a Canadian citizen spouse or common-law partner, working full-time for a Canadian enterprise or the Canadian public service abroad, or accompanying a permanent resident spouse who works full-time for a Canadian business. If a permanent resident is outside Canada with an expired or lost PR card, they cannot board a commercial flight, train, bus, or boat to Canada without applying online for a Permanent Resident Travel Document (PRTD) through the IRCC portal. This record does not determine residency compliance or issue travel documents.'
  }),

  // ── 8. ONTARIO PROFESSIONAL LICENSING (PEBC, OCT, PEO) ───────────────────────
  createRecord({
    id: 'ontario-professional-licensing-pebc-oct-peo',
    title: 'Ontario: Professional licensing and credential evaluation for PEBC, OCT, and PEO',
    topic: 'employment',
    jurisdiction: 'ON',
    url: 'https://www.ontario.ca/page/work-your-profession-or-trade',
    quote: 'Regulatory colleges evaluate international credentials for licensed professions in Ontario.',
    summary: 'Internationally educated professionals in Ontario must be licensed by their designated regulatory body before practicing in a regulated occupation. For pharmacy, the Pharmacy Examining Board of Canada (PEBC) evaluates international pharmacy degrees through Document Evaluation and the PEBC Evaluating Examination before graduates apply to the Ontario College of Pharmacists. For teaching, internationally educated teachers must apply to the Ontario College of Teachers (OCT) for evaluation of post-secondary degrees, initial teacher education, language proficiency, and good standing to obtain an OCT certificate. For professional engineering, Professional Engineers Ontario (PEO) evaluates engineering academic qualifications; under Ontario Fair Access to Regulated Professions Act, PEO has eliminated the requirement for Canadian work experience, utilizing competency-based assessment (CBA). This record does not issue professional licences.'
  }),

  // ── 9. ONTARIO RENTAL HEATING & REPAIRS STANDARDS ────────────────────────────
  createRecord({
    id: 'ontario-rental-heating-standards',
    title: 'Ontario: Tenant rights for heating, vital services, and municipal winter bylaws',
    topic: 'housing',
    housingSubject: 'repairs',
    jurisdiction: 'ON',
    url: 'https://tribunalsontario.ca/ltb/maintenance-and-repairs/',
    quote: 'Landlords must provide vital services including heat during prescribed winter months.',
    summary: 'Under the Ontario Residential Tenancies Act and local municipal property standards bylaws, landlords are legally required to provide vital services including adequate heating from September 15 to June 1. Municipal bylaws specify minimum heating standards: the minimum room temperature is 20°C in Brampton under Property Standards By-law 56-2008, and 21°C in Toronto under Toronto Municipal Code Chapter 497 and in Mississauga. A landlord cannot shut off or withhold heat or any vital service, even for non-payment of rent. If heating is inadequate and the landlord fails to resolve it after written notice, tenants may contact municipal bylaw enforcement (311) for an inspection or file Form T6 (Tenant Application about Maintenance and Repairs) with the Landlord and Tenant Board for a rent abatement or repair order. This record does not issue repair orders or assess abatements.'
  }),

  // ── 10. BC RESIDENTIAL TENANCY BRANCH DISPUTE RESOLUTION ─────────────────────
  createRecord({
    id: 'bc-rtb-dispute-resolution',
    title: 'BC: Residential Tenancy Branch online dispute resolution and hearings',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'BC',
    url: 'https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution',
    quote: 'The Residential Tenancy Branch (RTB) provides dispute resolution services for BC landlords and tenants.',
    summary: 'Under the British Columbia Residential Tenancy Act, landlords and tenants in Vancouver and across BC resolve formal disputes through the Residential Tenancy Branch (RTB). Parties file an application for dispute resolution online through the RTB Dispute Access site using a Basic BCeID, providing evidence and paying a $100 filing fee (or applying for a fee waiver based on low income). Dispute resolution hearings are conducted by telephone conference with an independent RTB arbitrator whose written decisions and orders are legally binding and enforceable in BC Provincial Small Claims Court or BC Supreme Court. Emergency applications can be expedited for urgent health or safety issues. This record does not conduct hearings or issue arbitrated orders.'
  })
];
