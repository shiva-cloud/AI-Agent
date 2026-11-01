// Deep official documentation and statutory operational policy records
// Extracted country-by-country from official government manuals and casework guidance.

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
    reviewBasis: 'Official statutory policy delivery manual and caseworker operational instructions.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  };
}

export const deepDocumentationRecords = [
  // ══════════════════════════════════════════════════════════════════════════════
  // 1. CANADA (CA, ON, BC)
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'ca-ircc-pdi-mobilite-francophone-c16',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'IRCC PDI: Mobilité Francophone LMIA-Exempt Work Permit (Code C16)',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/foreign-workers/exemption-codes/francophone-mobility.html',
    quote: 'Mobilité francophone: Exemption code C16',
    summary: 'Under IRPR Section 205(a) operational instructions, foreign workers destined to work outside the province of Quebec in TEER 0, 1, 2, or 3 occupations qualify for an LMIA-exempt employer-specific work permit under code C16 if they demonstrate French language proficiency at NCLC level 5 or higher in speaking and listening. Crucially, the operational manual clarifies that the job itself does not have to require French proficiency; the language ability of the foreign national satisfies the requirement. The employer must submit the offer of employment through the Employer Portal and pay the $230 compliance fee. This record provides statutory instructions and does not issue work permits.'
  }),
  createRecord({
    id: 'ca-ircc-pdi-excessive-demand-formula',
    topic: 'health',
    jurisdiction: 'CA',
    title: 'IRCC PDI: Medical Admissibility and Excessive Demand Threshold Calculation',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/standard-requirements/medical-requirements/excessive-demand.html',
    quote: 'Excessive demand on health and social services',
    summary: 'Under IRPA Section 38(1)(c) and operational guidelines, excessive demand on health or social services is triggered when anticipated medical costs exceed three times the average Canadian per capita spending ($131,100 over a 5-year period or $26,220 per year). Before an inadmissibility finding, medical officers must issue a Procedural Fairness Letter (PFL) granting 60 calendar days to submit a formal Mitigation Plan (Declaration of Ability and Intent). A valid mitigation plan must demonstrate signed, legally binding commitments to obtain outpatient medications privately and prove adequate financial assets to cover out-of-pocket costs without public subsidy. This record does not evaluate medical admissibility.'
  }),
  createRecord({
    id: 'ca-cra-folio-s5-f1-c1-residence-ties',
    topic: 'money',
    jurisdiction: 'CA',
    title: 'CRA Income Tax Folio S5-F1-C1: Determining an Individual Residence Status',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-5-international-residency/folio-1-residency/income-tax-folio-s5-f1-c1-determining-individual-s-residence-status.html',
    quote: 'Determining an Individual Residence Status',
    summary: 'CRA Income Tax Folio S5-F1-C1 establishes that tax residency for newcomers and departing individuals is determined primarily by significant primary residential ties: a dwelling place maintained for year-round living, a spouse or common-law partner, or dependent children in Canada. Secondary ties (personal property, car, Canadian bank accounts, credit cards, driver license, provincial health insurance) are evaluated in aggregate. The 183-day physical presence rule (sojourner rule under Income Tax Act subsection 250(1)(a)) applies only if an individual is not already a factual resident under common-law residence tests. This record does not assess individual tax liability.'
  }),
  createRecord({
    id: 'ca-cra-folio-s1-f3-c4-moving-expenses',
    topic: 'money',
    jurisdiction: 'CA',
    title: 'CRA Income Tax Folio S1-F3-C4: Moving Expenses Relocation Rules',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-1-individuals/folio-3-family/income-tax-folio-s1-f3-c4-moving-expenses.html',
    quote: 'Moving Expenses',
    summary: 'Under Income Tax Act Section 62 and CRA Folio S1-F3-C4, moving expenses incurred to start a new job or attend post-secondary education can only be deducted against employment or business income earned at the new Canadian work location. Newcomers relocating from abroad cannot claim moving expenses to Canada unless they were already factual or deemed Canadian residents before the move. Furthermore, the new home must be at least 40 kilometres closer to the new work location than the old residence. Unused moving expense deductions can be carried forward to subsequent tax years. This record does not file tax returns.'
  }),
  createRecord({
    id: 'ca-on-ltb-guideline-12-excluded-tenancies',
    topic: 'housing',
    jurisdiction: 'ON',
    title: 'Ontario LTB Interpretation Guideline 12: Excluded Tenancies and Shared Facilities',
    url: 'https://tribunalsontario.ca/documents/ltb/Interpretation%20Guidelines/12%20-%20Exemptions.html',
    quote: 'Exemptions from the Act',
    housingSubject: 'agreement',
    summary: 'Under Section 5(i) of the Ontario Residential Tenancies Act (RTA) 2006 and LTB Interpretation Guideline 12, the RTA does not apply to living accommodations where the occupant shares a bathroom or kitchen facility with the owner, the owner spouse, child, or parent. Occupants in these shared living arrangements are classified under common law as mere licensees or roomers, have no statutory tenancy rights, cannot file disputes with the Landlord and Tenant Board, and can be evicted upon reasonable notice without an eviction order from the LTB. This record does not resolve tenancy disputes.'
  }),
  createRecord({
    id: 'ca-on-ltb-guideline-19-assignment-refusal-n9',
    topic: 'housing',
    jurisdiction: 'ON',
    title: 'Ontario LTB Interpretation Guideline 19: Assignment Refusal and Early Termination (Form N9)',
    url: 'https://tribunalsontario.ca/documents/ltb/Interpretation%20Guidelines/19%20-%20Assignment%20and%20Subletting.html',
    quote: 'Assignment and Subletting',
    housingSubject: 'agreement',
    summary: 'Under RTA Section 95 and LTB Interpretation Guideline 19, a tenant wishing to break a fixed-term lease has the legal right to request the landlord consent to assign the tenancy. If the landlord refuses consent to assign in principle, refuses a specific assignee unreasonably, or fails to respond within 7 calendar days of the request, the tenant has the statutory right under Section 95(4) to serve Form N9 (Tenant Notice to End the Tenancy) with a shortened 30-day notice period, regardless of the lease expiry date, with zero break-lease penalty. This record does not deliver notices of termination.'
  }),
  createRecord({
    id: 'ca-bc-rtb-guideline-1-vacate-clause-and-deposit',
    topic: 'housing',
    jurisdiction: 'BC',
    title: 'BC RTB Policy Guideline 1: Unenforceable Vacate Clauses and Deposit Limits',
    url: 'https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/calculators-and-resources/policy-guidelines',
    quote: 'Landlord & Tenant - Responsibility for Residential Premises',
    housingSubject: 'agreement',
    summary: 'Under Section 44(1) of the British Columbia Residential Tenancy Act and RTB Policy Guideline 1, fixed-term tenancy agreements specifying that the tenant must vacate at the end of the term are legally void and automatically convert to month-to-month tenancies unless the landlord or a close family member intends in good faith to occupy the rental unit under Section 49. Furthermore, landlords cannot demand a security deposit exceeding one half of one month rent, and standard lease clauses requiring mandatory professional carpet or drapery cleaning regardless of condition are unenforceable. This record does not adjudicate tenancy claims.'
  }),

  // ══════════════════════════════════════════════════════════════════════════════
  // 2. UNITED STATES (US)
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'us-uscis-pdi-h1b-recapture-mechanics',
    topic: 'employment',
    jurisdiction: 'United States',
    title: 'USCIS Policy Manual: H-1B Six-Year Maximum Recapture of Time Spent Abroad',
    url: 'https://www.uscis.gov/policy-manual/volume-2-part-h-chapter-4',
    quote: 'H-1B Specialty Occupations',
    summary: 'Under INA Section 214(g)(4) and 8 CFR 214.2(h)(13)(iii)(A), the statutory 6-year maximum period of stay for H-1B non-immigrants accrues only for days physically spent inside the United States. USCIS Policy Manual instructions confirm that any full 24-hour day spent outside the US for vacation, business, or remote work can be recaptured in subsequent extension petitions. The petitioner bears the burden of proof, which must be supported by official documentary evidence: CBP entry/exit stamps, electronic I-94 travel histories, flight boarding passes, or foreign payroll records. There is no statutory deadline or limit on how many days can be recaptured. This record does not file immigration petitions.'
  }),
  createRecord({
    id: 'us-irs-pub-519-substantial-presence-formula',
    topic: 'money',
    jurisdiction: 'United States',
    title: 'IRS Publication 519: Substantial Presence Test (SPT) Weighted Day Calculation',
    url: 'https://www.irs.gov/publications/p519',
    quote: 'U.S. Tax Guide for Aliens',
    summary: 'Under Internal Revenue Code Section 7701(b) and IRS Publication 519, a foreign national is classified as a resident alien for federal tax purposes if they meet the Substantial Presence Test (SPT): present in the US for at least 31 days in the current calendar year, and 183 days over a 3-year rolling period calculated as: 100% of days in current year, plus 1/3 (33.3%) of days in the prior year, plus 1/6 (16.7%) of days in the second prior year. F-1 and J-1 students are exempt individuals (exempt from counting physical presence days) for up to 5 calendar years, provided they file Form 8843 annually. This record does not prepare tax returns.'
  }),
  createRecord({
    id: 'us-uscis-cspa-age-out-mathematical-formula',
    topic: 'family',
    jurisdiction: 'United States',
    title: 'USCIS Policy Manual: Child Status Protection Act (CSPA) Age Calculation Formula',
    url: 'https://www.uscis.gov/policy-manual/volume-7-part-a-chapter-6',
    quote: 'Child Status Protection Act',
    summary: 'Under the Child Status Protection Act (CSPA) and USCIS Policy Manual Volume 7, Part A, Chapter 6, derivative children who risk aging out beyond 21 years old calculate their statutory CSPA age using the formula: CSPA Age = Biological Age on Date Visa Becomes Available MINUS Total Days Form I-130 or I-140 Was Pending with USCIS. Under February 2023 policy guidance, USCIS allows applicants to use the Dates for Filing chart from the DOS Visa Bulletin if USCIS accepts that chart for the month, provided the applicant takes concrete action to seek to acquire permanent residence within one year of availability. This record does not determine visa availability.'
  }),
  createRecord({
    id: 'us-cfpb-regulation-v-immigrant-credit-rights',
    topic: 'money',
    jurisdiction: 'United States',
    title: 'CFPB Regulation B & Equal Credit Opportunity Act: Immigrant Credit Rights',
    url: 'https://www.consumerfinance.gov/compliance/compliance-resources/consumer-lending/equal-credit-opportunity-act/',
    quote: 'Equal Credit Opportunity Act',
    summary: 'Under the Equal Credit Opportunity Act (ECOA) and Consumer Financial Protection Bureau (CFPB) Regulation B (12 CFR Section 1002.6(b)(9)), creditors are legally prohibited from discriminating against credit applicants based on national origin or citizenship status. While a creditor may consider an applicant immigration status to assess creditworthiness and remedy rights (such as visa validity matching loan maturity), creditors cannot impose blanket bans denying credit solely because an applicant is a non-citizen or holds a temporary work visa (such as H-1B, L-1, or O-1). This record does not approve credit applications.'
  }),

  // ══════════════════════════════════════════════════════════════════════════════
  // 3. UNITED KINGDOM (UK)
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'uk-home-office-section-3c-leave-cta-travel-trap',
    topic: 'employment',
    jurisdiction: 'United Kingdom',
    title: 'Home Office Guidance: Section 3C Leave and Automatic Lapsing on CTA Departure',
    url: 'https://www.gov.uk/government/publications/3c-and-3d-leave',
    quote: '3C and 3D leave',
    summary: 'Under Section 3C(1) of the Immigration Act 1971 and Home Office caseworker instructions, an individual who submits an in-time application to extend or vary their leave retains their existing leave and all accompanying statutory rights (right to work, study, and NHS access) until the application is decided. However, under Section 3C(3A), if the applicant leaves the Common Travel Area (UK, Ireland, Isle of Man, Channel Islands) while their application is pending, the application is treated as statutorily withdrawn. Consequently, Section 3C leave immediately lapses, leaving the individual stranded abroad without lawful permission to enter or work. This record does not grant leave to remain.'
  }),
  createRecord({
    id: 'uk-home-office-continuous-residence-exceptional-absences',
    topic: 'employment',
    jurisdiction: 'United Kingdom',
    title: 'Home Office Appendix Continuous Residence: Discretionary Relief for Absences Over 180 Days',
    url: 'https://www.gov.uk/government/publications/continuous-residence',
    quote: 'Continuous residence',
    summary: 'Under Appendix Continuous Residence of the UK Immigration Rules, Indefinite Leave to Remain (ILR) applicants must not have been absent from the UK for more than 180 days in any 12-month rolling period. Home Office guidance establishes that caseworkers may exercise discretion to overlook excess absences only if they fall within statutory exceptional circumstances: assisting with a national or international humanitarian or environmental crisis overseas, travel disruption due to pandemic or natural disaster, or severe life-threatening illness of the applicant or close family member substantiated by certified consultant medical letters. This record does not issue ILR grants.'
  }),
  createRecord({
    id: 'uk-hmrc-rdr3-statutory-residence-sufficient-ties',
    topic: 'money',
    jurisdiction: 'United Kingdom',
    title: 'HMRC Guidance RDR3: Statutory Residence Test (SRT) Sufficient Ties Matrix',
    url: 'https://www.gov.uk/government/publications/rdr3-statutory-residence-test-srt',
    quote: 'Statutory Residence Test (SRT)',
    summary: 'Under Finance Act 2013 Schedule 45 and HMRC Guidance RDR3, an individual who does not meet automatic UK or overseas residency tests must apply the Sufficient Ties Test. Ties include Family Tie (UK resident spouse or minor child), Accommodation Tie (accessible home kept for 91 continuous days with 1+ night spent there), Work Tie (working in the UK for 40+ days of 3+ hours each), and 90-Day Tie (spent more than 90 days in the UK in either of the previous 2 tax years). For arrivers, spending 46 to 90 days in the UK creates tax residency if 4 ties exist, and 91 to 120 days creates residency with 3 ties. This record does not calculate tax assessments.'
  }),

  // ══════════════════════════════════════════════════════════════════════════════
  // 4. AUSTRALIA (AU)
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'au-dha-pam3-bridging-visa-b-travel-facility',
    topic: 'employment',
    jurisdiction: 'Australia',
    title: 'DHA PAM3: Bridging Visa B (Subclass 020) Travel Facility and Cancellation Risk',
    url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/bridging-visa-b-020',
    quote: 'Bridging visa B (BVB) subclass 020',
    summary: 'Under Migration Regulations 1994 Schedule 2 and DHA Procedures Advice Manual 3 (PAM3), a Bridging Visa A (BVA) provides lawful stay while a substantive visa application is processed but contains zero travel facility. Departing Australia on a BVA causes automatic and immediate visa cessation. Applicants wishing to travel abroad must apply for and be granted a Bridging Visa B (BVB, Subclass 020) before departing, specifying travel dates and substantial reasons. If the visa holder fails to re-enter Australia before the BVB travel facility expires, the visa lapses and they cannot return on that bridging visa. This record does not issue bridging visas.'
  }),
  createRecord({
    id: 'au-fair-work-cashback-coercion-prohibition',
    topic: 'employment',
    jurisdiction: 'Australia',
    title: 'Fair Work Ombudsman: Prohibition of Cash-Back Schemes and Unreasonable Deductions',
    url: 'https://www.fairwork.gov.au/pay-and-wages/paying-wages',
    quote: 'Paying wages',
    summary: 'Under Sections 323 and 325 of the Fair Work Act 2009, employers must pay employees all amounts due for work in full at least monthly, without unauthorized deductions. Section 325 strictly prohibits employers from directly or indirectly requiring employees to spend any part of their pay or give cash back, banning schemes where employers force visa holders to refund wages or pay for employer sponsorship, nomination fees, or migration agent costs. Agreements compelling cashback or wage deductions for visa maintenance are illegal, void, and subject to severe civil penalties under Fair Work compliance notices. This record does not recover unpaid wages.'
  }),
  createRecord({
    id: 'au-ato-dasp-super-withholding-rates',
    topic: 'money',
    jurisdiction: 'Australia',
    title: 'ATO Rulings: Departing Australia Superannuation Payment (DASP) Withholding Tax Rates',
    url: 'https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/temporary-residents-and-superannuation/departing-australia-superannuation-payment-dasp',
    quote: 'Departing Australia superannuation payment (DASP)',
    summary: 'Under the Superannuation (Departing Australia Superannuation Payments Tax) Act 2007 and ATO rulings, temporary residents who have accumulated superannuation through the mandatory 11.5% employer super guarantee can claim their funds upon departing Australia after their visa has ceased. The standard DASP withholding tax rate on the taxed element is 35% for holders of standard temporary work or student visas (such as Subclass 482, Subclass 500). However, if the applicant has ever held a Working Holiday Maker visa (Subclass 417 or 462), a punitive 65% flat withholding tax rate applies to the entire superannuation balance. This record does not disburse superannuation funds.'
  }),

  // ══════════════════════════════════════════════════════════════════════════════
  // 5. GERMANY (DE)
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'de-aufenthg-blue-card-21-month-pr-fast-track',
    topic: 'employment',
    jurisdiction: 'Germany',
    title: 'AufenthG Section 18b (2): Accelerated EU Blue Card Settlement Permit (Niederlassungserlaubnis)',
    url: 'https://www.gesetze-im-internet.de/aufenthg_2004/__18b.html',
    quote: 'Fachkrafte mit akademischer Ausbildung',
    summary: 'Under Section 18b Subsection 2 of the German Residence Act (Aufenthaltsgesetz - AufenthG), holders of an EU Blue Card are granted a settlement permit (Niederlassungserlaubnis / permanent residence) after 27 months of qualified employment with statutory pension contributions. This period is accelerated to only 21 months if the applicant demonstrates German language skills at CEFR Level B1. In both cases, the applicant must demonstrate basic knowledge of the German legal and social order (standard Leben in Deutschland test) and adequate living space for family members. This record does not issue residence permits.'
  }),
  createRecord({
    id: 'de-stag-citizenship-modernisation-dual-nationality',
    topic: 'community',
    jurisdiction: 'Germany',
    title: 'Federal Ministry of the Interior: Nationality Law Modernisation Act (StAG Section 10)',
    url: 'https://www.bmi.bund.de/DE/themen/verfassung/staatsangehoerigkeit/einbuergerung/einbuergerung-node.html',
    quote: 'Einbuergerung in den deutschen Staatsverband',
    summary: 'Under the amended German Nationality Act (Staatsangehoerigkeitsgesetz - StAG Section 10) in effect since June 2024, the general residence requirement for naturalisation is reduced from 8 years to 5 years (and down to 3 years for special integration achievements, including CEFR Level C1 German and professional excellence). Crucially, the historical requirement to renounce original citizenship has been completely abolished: dual and multiple citizenship is universally permitted. Applicants must secure their own livelihood without social assistance (SGB II/XII) and commit to the democratic constitutional order. This record does not grant citizenship.'
  }),
  createRecord({
    id: 'de-bgb-551-mietkaution-three-installments',
    topic: 'housing',
    jurisdiction: 'Germany',
    title: 'BGB Section 551: Security Deposit 3-Installment Guarantee and Statutory Escrow',
    url: 'https://www.gesetze-im-internet.de/bgb/__551.html',
    quote: 'Begrenzung und Anlage von Mietsicherheiten',
    housingSubject: 'deposit',
    summary: 'Under Section 551 of the German Civil Code (Buergerliches Gesetzbuch - BGB), the maximum tenancy security deposit (Mietkaution) cannot exceed three months net cold rent (Nettokaltmiete), excluding utility prepayments. Under Section 551 Absatz 2 BGB, the tenant has an unconditional statutory right to pay the deposit in three equal monthly installments: the first installment is due at the beginning of the lease, and the remaining two installments are due with the successive two rent payments. Any lease clause requiring full deposit payment upfront or penalizing installment payments is legally void under Section 551 Absatz 4 BGB. This record does not manage escrow accounts.'
  }),

  // ══════════════════════════════════════════════════════════════════════════════
  // 6. UNITED ARAB EMIRATES (UAE)
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'ae-mohre-decree-33-end-of-service-gratuity',
    topic: 'employment',
    jurisdiction: 'United Arab Emirates',
    title: 'Federal Decree-Law No. 33 of 2021 Article 51: End of Service Gratuity Statutory Calculation',
    url: 'https://www.mohre.gov.ae/en/laws-and-regulations/labour-law.aspx',
    quote: 'Federal Decree-Law No. 33 of 2021 on the Regulation of Labour Relations',
    summary: 'Under Article 51 of UAE Federal Decree-Law No. 33 of 2021 on Labour Relations, full-time expatriate employees completing at least one continuous year of service are entitled to End of Service Gratuity: 21 days basic wage for each of the first 5 years of service, and 30 days basic wage for each subsequent year, capped at 2 years total gross salary. The gratuity is calculated strictly on the employee basic wage, excluding housing, transport, or utility allowances. Under the current law, gratuity is no longer forfeited or reduced if an employee resigns voluntarily. This record does not disburse labour payments.'
  }),
  createRecord({
    id: 'ae-corporate-tax-small-business-relief-3m',
    topic: 'money',
    jurisdiction: 'United Arab Emirates',
    title: 'Federal Decree-Law No. 47 of 2022 Article 21: Corporate Tax Small Business Relief',
    url: 'https://tax.gov.ae/en/taxes/corporate.tax.aspx',
    quote: 'Corporate Tax in the UAE',
    summary: 'Under Article 21 of UAE Federal Decree-Law No. 47 of 2022 and Ministerial Decision No. 73 of 2023, resident taxable persons (individuals holding commercial freelance licences or juridical companies) with gross revenue under AED 3,000,000 in a relevant tax period up to December 31, 2026 can elect for Small Business Relief. Under this relief, taxable income is treated as zero, exempting the enterprise from corporate tax calculations, though annual tax registration and simplified declaration filing remains mandatory. This record does not file corporate tax declarations.'
  }),
  createRecord({
    id: 'ae-icp-golden-visa-mortgage-equity-rule',
    topic: 'community',
    jurisdiction: 'United Arab Emirates',
    title: 'ICP & DLD Executive Guidelines: Golden Visa Real Estate Equity and Mortgage Rules',
    url: 'https://smartservices.icp.gov.ae/',
    quote: 'Golden Visa for Real Estate Investors',
    summary: 'Under Cabinet Resolution No. 65 of 2022 and official Dubai Land Department (DLD) executive directives, foreign investors purchasing real estate worth at least AED 2,000,000 are eligible for a 10-year Golden Visa. Official guidelines confirm that mortgaged properties qualify provided the investor has paid at least AED 2,000,000 in equity directly to the bank or developer, supported by an official bank statement and Title Deed. Furthermore, off-plan purchases from approved local developers qualify when the investor has paid the AED 2,000,000 threshold, evidenced by an official DLD Initial Contract of Sale (Oqood). This record does not issue investor visas.'
  }),

  // ══════════════════════════════════════════════════════════════════════════════
  // 7. NEW ZEALAND (NZ)
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'nz-inz-smc-6-point-system-mechanics',
    topic: 'employment',
    jurisdiction: 'New Zealand',
    title: 'Immigration New Zealand Operational Manual: Skilled Migrant Category (SMC) 6-Point System',
    url: 'https://www.immigration.govt.nz/opsmanual/',
    quote: 'Skilled Migrant Category Residence Instructions',
    summary: 'Under Immigration New Zealand Operational Manual Residence Instructions (SR), applicants for the Skilled Migrant Category (SMC) Resident Visa must claim exactly 6 points. Points can be claimed from only one of three skill pillars: NZ occupational registration (3 to 6 points), recognised qualification (Doctorate=6, Master=5, Bachelor Hons/PGDip=4, Bachelor=3), or high remuneration from employment (1.5x median wage=3 points, 2x median=4, 3x median=6). Applicants may combine these with 1 to 3 points for skilled NZ work experience (1 point per year, maximum 3 points). All applicants must hold a job offer from an accredited employer paying at least the median wage. This record does not issue resident visas.'
  }),
  createRecord({
    id: 'nz-rta-bond-lodgement-23-days-statutory',
    topic: 'housing',
    jurisdiction: 'New Zealand',
    title: 'Residential Tenancies Act 1986 Section 18 & 23: Bond Cap and 23-Day Lodgement Enforcement',
    url: 'https://www.tenancy.govt.nz/rent-bond-and-bills/bond/',
    quote: 'Bond lodgement and refund',
    housingSubject: 'deposit',
    summary: 'Under Section 18 of the New Zealand Residential Tenancies Act 1986, a landlord cannot require a tenancy bond exceeding 4 weeks rent, nor demand rent in advance of more than 2 weeks. Under Section 23 of the Act, the landlord must forward the bond payment to the Tenancy Services Bond Centre within 23 working days of receiving it. Failure to lodge the bond within 23 working days is an unlawful act under the Act, exposing the landlord to Tenancy Tribunal exemplary damages of up to NZD $1,500 payable to the tenant. This record does not lodge or hold bond payments.'
  }),

  // ══════════════════════════════════════════════════════════════════════════════
  // 8. IRELAND (IE)
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'ie-dete-csep-stamp-4-twenty-one-month-rule',
    topic: 'employment',
    jurisdiction: 'Ireland',
    title: 'DETE & ISD Guidelines: Critical Skills Employment Permit 21-Month Stamp 4 Fast-Track',
    url: 'https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/',
    quote: 'Critical Skills Employment Permit',
    summary: 'Under Department of Enterprise, Trade and Employment (DETE) operational policy and Immigration Service Delivery (ISD) guidelines, holders of a Critical Skills Employment Permit (CSEP) who complete 21 continuous months of employment with their sponsor employer can obtain an official DETE Support Letter. With this letter, the permit holder can register with ISD for Stamp 4 permission. Stamp 4 confers unrestricted permission to work in Ireland without an employment permit, allows changing employers freely, and permits operating a business or self-employment. This record does not issue employment permits or registration stamps.'
  }),
  createRecord({
    id: 'ie-rtb-part-4-security-of-tenure-six-years',
    topic: 'housing',
    jurisdiction: 'Ireland',
    title: 'Residential Tenancies Board: Part 4 Security of Tenure 6-Year Protection Rules',
    url: 'https://www.rtb.ie/ending-a-tenancy/notice-periods-that-a-landlord-must-give',
    quote: 'Security of tenure and notice periods',
    housingSubject: 'agreement',
    summary: 'Under Section 28 of the Irish Residential Tenancies Act 2004 (as amended), once a residential tenancy has lasted 6 continuous months without service of a valid notice of termination, the tenant acquires statutory Part 4 rights granting security of tenure for a 6-year period (and indefinite tenure for tenancies created on or after June 11, 2022). The landlord can only terminate the tenancy for specific statutory grounds (such as intending to sell within 9 months, requiring the dwelling for own or family occupation, or substantial refurbishment). A statutory RTB Notice of Termination with notice periods ranging from 90 to 224 days is legally required. This record does not serve termination notices.'
  })
];
