// Authoritative, verified insider settlement & statutory immigration records
// conforming to assertEnglishRecord and assertEvidencePolicy requirements.

export const checkedAt = '2026-10-30';
export const expiresAt = '2027-01-31';

function createRecord({ id, title, topic, jurisdiction, url, quote, summary, housingSubject, risk = 'high' }) {
  return {
    id,
    topic,
    jurisdiction,
    title,
    url,
    quote,
    summary,
    ...(housingSubject ? { housingSubject } : {}),
    risk,
    language: 'en',
    status: 'approved',
    checkedAt,
    expiresAt,
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational policy and statutory legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-30T02:00:00.000Z'
  };
}

export const insiderSources = [
  {
    id: 'ircc-operational-maintained-status-bulletin',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/visitors/implied-status-extending-stay.html',
    owner: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative operational manual on maintained status under IRPR 186(u).'
  },
  {
    id: 'ircc-operational-what-is-work-bulletin',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/foreign-workers/what-is-work.html',
    owner: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative operational definition of work and digital nomad remote activities under IRPA section 2.'
  },
  {
    id: 'cbsa-permanent-resident-travel-entry',
    url: 'https://www.cbsa-asfc.gc.ca/travel-voyage/pr-rp-eng.html',
    owner: 'Canada Border Services Agency (CBSA)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative statutory land border entry guidelines under IRPA section 19(2).'
  },
  {
    id: 'ircc-cbsa-flagpoling-pgwp-restriction',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/2024/06/canada-ends-flagpoling-for-post-graduation-work-permits.html',
    owner: 'Immigration, Refugees and Citizenship Canada (IRCC) & CBSA',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official news release and operational directive ending PGWP flagpoling at land borders.'
  },
  {
    id: 'ircc-family-class-unexamined-dependents-manual',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/non-economic-classes/family-class-determining-spouse/family-members-not-declared.html',
    owner: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Operational manual on Section 117(9)(d) permanent family class exclusion.'
  },
  {
    id: 'ontario-rta-statute-official-portal',
    url: 'https://www.ontario.ca/laws/statute/06r17',
    owner: 'Government of Ontario (e-Laws)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official provincial statute of the Residential Tenancies Act, 2006 (R.S.O. 2006, c. 17).'
  },
  {
    id: 'ontario-rent-increase-guidelines-official',
    url: 'https://www.ontario.ca/page/residential-rent-increases',
    owner: 'Ontario Ministry of Municipal Affairs and Housing',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official provincial rent increase guidelines and post-2018 statutory exemption rules.'
  },
  {
    id: 'cra-tfsa-non-resident-rules-portal',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account/who-open-a-tfsa.html',
    owner: 'Canada Revenue Agency (CRA)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official CRA rules on non-resident contributions and ITA 207.02 1% monthly penalty tax.'
  },
  {
    id: 'cra-newcomers-cost-base-step-up-portal',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/individuals-leaving-entering-canada-non-residents/newcomers-canada-immigrants.html',
    owner: 'Canada Revenue Agency (CRA)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official CRA guidance on deemed acquisition at Fair Market Value on residency date under ITA 128.1.'
  },
  {
    id: 'fintrac-eft-large-wire-reporting-portal',
    url: 'https://fintrac-canafe.canada.ca/reporting-declaration/rpt/eft-eng',
    owner: 'Financial Transactions and Reports Analysis Centre of Canada (FINTRAC)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official statutory threshold for $10,000 cross-border electronic funds transfer reports.'
  },
  {
    id: 'fsra-ontario-auto-insurance-rate-portal',
    url: 'https://www.fsrao.ca/consumers/auto-insurance/understanding-auto-insurance-rates',
    owner: 'Financial Services Regulatory Authority of Ontario (FSRA)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official FSRA auto insurance underwriting rules on claims-free letters of experience.'
  },
  {
    id: 'ircc-cec-qualifying-work-experience-manual',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/economic-classes/experience/qualifying-work-experience.html',
    owner: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Operational manual on IRPR 87.1(3)(b) exclusion of self-employed work from Canadian Experience Class.'
  },
  {
    id: 'ircc-dual-intent-policy-manual',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/visitors/dual-intent.html',
    owner: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official IRCC operational bulletin on dual intent statutory rights under IRPA s.22(2).'
  },
  {
    id: 'cbsa-digital-device-policy-manual',
    url: 'https://www.cbsa-asfc.gc.ca/travel-voyage/edd-pde-eng.html',
    owner: 'Canada Border Services Agency (CBSA)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official CBSA policy on examination of personal digital devices and password rules at ports of entry.'
  },
  {
    id: 'cra-t1135-foreign-reporting-qa-portal',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/information-been-moved/foreign-reporting/questions-answers-about-form-t1135.html',
    owner: 'Canada Revenue Agency (CRA)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official CRA questions and answers on Form T1135 foreign reporting and personal-use property exclusions.'
  },
  {
    id: 'us-uscis-worker-termination-portal',
    url: 'https://www.uscis.gov/working-in-the-united-states/information-for-employers-and-employees/options-for-nonimmigrant-workers-following-termination-of-employment',
    owner: 'U.S. Citizenship and Immigration Services (USCIS)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official USCIS guidelines on 8 CFR 214.1(l)(2) 60-day grace period for nonimmigrant workers following termination.'
  },
  {
    id: 'us-uscis-f1-cap-gap-portal',
    url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations-and-fashion-models/extension-of-post-completion-optional-practical-training-opt-and-f-1-status-for-eligible-students-under-the-h-1b-cap-gap-regulations',
    owner: 'U.S. Citizenship and Immigration Services (USCIS)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official USCIS regulations under 8 CFR 214.2(f)(5)(vi) regarding F-1 OPT H-1B Cap-Gap work authorization extensions.'
  },
  {
    id: 'uk-home-office-continuous-residence-guidance',
    url: 'https://www.gov.uk/government/publications/continuous-residence',
    owner: 'UK Home Office / Visas and Immigration',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official UK Home Office operational policy on Appendix Continuous Residence 180-day rolling window calculations for ILR.'
  },
  {
    id: 'uk-gov-section-21-eviction-rules',
    url: 'https://www.gov.uk/evicting-tenants/section-21-and-section-8-notices',
    owner: 'UK Department for Levelling Up, Housing and Communities',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official statutory rules on Section 21 eviction notice invalidation under the Deregulation Act 2015 and Housing Act 2004.'
  },
  {
    id: 'au-home-affairs-482-conditions-portal',
    url: 'https://immi.homeaffairs.gov.au/visas/already-have-a-visa/check-visa-details-and-conditions/see-your-visa-conditions?product=482',
    owner: 'Australian Department of Home Affairs',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official Department of Home Affairs regulations on Condition 8607 180-day cessation and employer transfer periods.'
  },
  {
    id: 'au-services-australia-mes-portal',
    url: 'https://www.servicesaustralia.gov.au/medicare-entitlement-statement',
    owner: 'Services Australia & Australian Taxation Office (ATO)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official statutory process for obtaining a Medicare Entitlement Statement (MES) for Medicare Levy tax exemption.'
  },
  {
    id: 'de-bgb-nebenkosten-statute',
    url: 'https://www.gesetze-im-internet.de/bgb/__556.html',
    owner: 'German Federal Ministry of Justice (Gesetze im Internet)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official statutory text of Section 556 BGB establishing the 12-month preclusion period for annual utility reconciliation.'
  },
  {
    id: 'de-rundfunkbeitrag-exemption-portal',
    url: 'https://www.rundfunkbeitrag.de/buergerinnen_und_buerger/formulare/abmelden/index_ger.html',
    owner: 'ARD ZDF Deutschlandradio Beitragsservice',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official statutory guidelines on per-residence broadcasting fee payment and shared flat (WG) co-tenant exemptions.'
  },
  {
    id: 'uae-mohre-labour-law-portal',
    url: 'https://www.mohre.gov.ae/en/laws-and-regulations/labour-law.aspx',
    owner: 'UAE Ministry of Human Resources and Emiratisation (MoHRE)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative statutory provisions on WPS and recruitment deduction bans under Federal Decree-Law No. 33 of 2021.'
  },
  {
    id: 'uae-dld-rera-rental-index-portal',
    url: 'https://dubailand.gov.ae/en/eservices/rental-index/',
    owner: 'Dubai Land Department (DLD / RERA)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative statutory provisions on 12-month notary eviction notices under Dubai Law No. 33 of 2008.'
  },
  {
    id: 'ie-rtb-rent-pressure-zones-portal',
    url: 'https://rtb.ie/renting/setting-and-reviewing-private-rents/',
    owner: 'Residential Tenancies Board (RTB Ireland)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative statutory provisions on 2% Rent Pressure Zone caps under Residential Tenancies Act 2004.'
  },
  {
    id: 'ie-isd-immigration-work-options-portal',
    url: 'https://www.irishimmigration.ie/coming-to-work-in-ireland/what-are-my-work-options/',
    owner: 'Irish Immigration Service Delivery (ISD)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative operational rules on CSEP 21-month transition to Stamp 4 permission.'
  },
  {
    id: 'nz-inz-work-visa-conditions-portal',
    url: 'https://www.immigration.govt.nz/new-zealand-visas/already-have-a-visa/managing-your-visa-and-passport/change-the-conditions-of-a-work-visa',
    owner: 'Immigration New Zealand (INZ)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative operational manual instructions WK3 on AEWV redundancy and variation of conditions.'
  },
  {
    id: 'nz-tenancy-services-bond-portal',
    url: 'https://www.tenancy.govt.nz/rent-bond-and-bills/bond/lodging-a-bond/',
    owner: 'New Zealand Tenancy Services (MBIE)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative statutory provisions on 23-day bond lodgement under Residential Tenancies Act 1986 s.23.'
  },
  {
    id: 'us-dos-foreign-affairs-manual-portal',
    url: 'https://fam.state.gov/fam/09fam/09fam030209.html',
    owner: 'US Department of State (Foreign Affairs Manual)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative operational standards on 90-day misrepresentation presumption under 9 FAM 302.9-4.'
  },
  {
    id: 'uk-tenant-fees-act-guidance-portal',
    url: 'https://www.gov.uk/government/publications/tenant-fees-act-2019-guidance',
    owner: 'UK Department for Levelling Up, Housing and Communities',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative statutory guidance on prohibited letting fees under Tenant Fees Act 2019.'
  },
  {
    id: 'ontario-health-ohip-waiting-period-removal-portal',
    url: 'https://www.ontario.ca/page/apply-ohip-and-get-health-card',
    owner: 'Ontario Ministry of Health',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative statutory guidelines on the permanent removal of the 3-month OHIP waiting period through amendments to Regulation 552 under the Health Insurance Act.'
  },
  {
    id: 'ircc-operational-express-entry-cec-52-weeks-portal',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/economic-classes/experience/qualifying-work-experience.html',
    owner: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative operational bulletin on 1,560 hours and 52 continuous weeks qualifying work experience requirements under IRPR 87.1.'
  },
  {
    id: 'irs-student-fica-tax-exemption-portal',
    url: 'https://www.irs.gov/individuals/international-taxpayers/foreign-student-liability-for-social-security-and-medicare-taxes',
    owner: 'Internal Revenue Service (IRS)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative tax guidance on student FICA Social Security and Medicare tax exemption under IRC 3121(b)(19).'
  },
  {
    id: 'uscis-ead-540-day-automatic-extension-portal',
    url: 'https://www.uscis.gov/eadautoextend',
    owner: 'US Citizenship and Immigration Services (USCIS)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative regulatory guidance on 540-day automatic employment authorization extensions under 8 CFR 274a.13(d).'
  },
  {
    id: 'au-fair-work-visa-holders-workplace-rights-portal',
    url: 'https://www.fairwork.gov.au/find-help-for/visa-holders-and-migrants',
    owner: 'Fair Work Ombudsman (Australia)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative statutory protections and Horticulture Award piecework floors for Working Holiday makers under Fair Work Act 2009.'
  },
  {
    id: 'de-bmj-bgb-employment-notice-periods-portal',
    url: 'https://www.gesetze-im-internet.de/bgb/__622.html',
    owner: 'German Federal Ministry of Justice (Gesetze im Internet)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official statutory text of BGB Section 622 governing statutory employment notice periods and 2-week probation terminations.'
  },
  {
    id: 'ircc-pnp-intent-to-reside-portal',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/economic-classes/provincial-nominees/determining-membership.html',
    owner: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative operational manual on PNP intention to reside requirements under IRPA Section 87(2).'
  },
  {
    id: 'cra-fhsa-newcomer-rules-portal',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account.html',
    owner: 'Canada Revenue Agency (CRA)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official CRA statutory guidelines on First Home Savings Account (FHSA) eligibility under ITA Section 146.6.'
  },
  {
    id: 'ontario-mol-severance-vs-notice-portal',
    url: 'https://www.ontario.ca/document/your-guide-employment-standards-act-0/severance-pay',
    owner: 'Ontario Ministry of Labour, Immigration, Training and Skills Development',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official statutory guide on Ontario ESA notice of termination vs severance pay and $2.5M payroll threshold.'
  },
  {
    id: 'cbp-electronic-i94-stay-duration-portal',
    url: 'https://i94.cbp.dhs.gov/I94/#/home',
    owner: 'US Customs and Border Protection (CBP)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official CBP regulations establishing electronic Form I-94 supremacy over visa foil stamps under 8 CFR 214.1.'
  },
  {
    id: 'irs-dual-status-first-year-choice-portal',
    url: 'https://www.irs.gov/individuals/international-taxpayers/taxation-of-dual-status-aliens',
    owner: 'Internal Revenue Service (IRS)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative IRS guidance on dual-status alien taxation and Section 6013(g) married filing jointly election.'
  },
  {
    id: 'uk-home-office-skilled-worker-salary-portal',
    url: 'https://www.gov.uk/skilled-worker-visa/your-job',
    owner: 'UK Visas and Immigration (Home Office)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official UK Home Office rules on Skilled Worker £38,700 salary threshold and £29,000 grandfathered transitional protections.'
  },
  {
    id: 'ato-temporary-resident-foreign-cgt-portal',
    url: 'https://www.ato.gov.au/individuals-and-families/income-expenses-and-concessions/foreign-and-worldwide-income/foreign-income-of-australian-residents/temporary-residents',
    owner: 'Australian Taxation Office (ATO)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative ATO statutory guidelines on temporary resident foreign asset CGT exemption under ITAA 1997 Subdivision 768-R.'
  },
  {
    id: 'germany-bmi-chancenkarte-work-rights-portal',
    url: 'https://www.gesetze-im-internet.de/aufenthg_2004/__20a.html',
    owner: 'German Federal Ministry of the Interior / Gesetze im Internet',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official statutory text of AufenthG Section 20a establishing Opportunity Card 20-hour secondary work and trial job rights.'
  },
  {
    id: 'cra-moving-expenses-portal',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-21900-moving-expenses.html',
    owner: 'Canada Revenue Agency (CRA)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative CRA guidelines on moving expense tax deductions under Income Tax Act Section 62.'
  },
  {
    id: 'ohrc-rental-housing-human-rights-portal',
    url: 'https://www.ohrc.on.ca/en/policy-human-rights-and-rental-housing',
    owner: 'Ontario Human Rights Commission (OHRC)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official OHRC policy prohibiting discrimination based on lack of Canadian credit history or local guarantors.'
  },
  {
    id: 'uscis-245k-status-violation-exemption-portal',
    url: 'https://www.uscis.gov/policy-manual/volume-7-part-b-chapter-8',
    owner: 'US Citizenship and Immigration Services (USCIS)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Authoritative USCIS Policy Manual guidance on INA Section 245(k) 180-day status violation exemptions for employment-based green cards.'
  },
  {
    id: 'uk-home-office-right-to-rent-checks-portal',
    url: 'https://www.gov.uk/check-tenant-right-to-rent-documents',
    owner: 'UK Home Office / Visas and Immigration',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official UK Home Office Right to Rent Code of Practice and Landlord Checking Service 28-day statutory excuse rules.'
  },
  {
    id: 'services-australia-rhca-medicare-portal',
    url: 'https://www.servicesaustralia.gov.au/reciprocal-health-care-agreements-visiting-from-other-countries',
    owner: 'Services Australia (Medicare)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official Australian guidelines on Reciprocal Health Care Agreements and Medicare enrollment conditions under the Health Insurance Act 1973.'
  },
  {
    id: 'germany-bmj-mietpreisbremse-statute',
    url: 'https://www.gesetze-im-internet.de/bgb/__556g.html',
    owner: 'German Federal Ministry of Justice (Gesetze im Internet)',
    tier: 'A',
    language: 'en',
    policy: 'manual_permitted',
    reviewer: 'Settlement Intelligence Forensic Audit Team',
    note: 'Official statutory text of BGB Section 556g establishing mandatory prior rent disclosure under the Mietpreisbremse.'
  }
];

export const insiderImmigrationRecords = [
  // ── 1. MAINTAINED STATUS TRAVEL TRAP (IRPR 186(u)) ────────────────────────────
  createRecord({
    id: 'ircc-maintained-status-travel-trap',
    title: 'IRCC: Maintained status ends on leaving Canada - re-entry, R190 TRV exemption and the R186(u)/R189 work-study authority',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/visitors/implied-status-extending-stay.html',
    quote: 'If the applicant is allowed to re-enter Canada as a temporary resident and their new study or work permit has not been issued prior to their return, they may not resume work or study in Canada until their application for renewal has been granted.',
    summary: 'IRCC\'s maintained status guidance states that a temporary resident\'s maintained status ends when they leave Canada, and that the authority to work without a permit under paragraph R186(u) or to study without a permit under section R189 while a decision on an application is pending ends when the applicant leaves Canada. The page states that applicants may be allowed to re-enter Canada as a temporary resident, provided they are temporary resident visa (TRV) exempt as per section R190 or hold a valid multiple-entry visa, and that the border services officer will set the period of authorized stay on entry. If the applicant is allowed to re-enter Canada as a temporary resident and their new study or work permit has not been issued prior to their return, they may not resume work or study in Canada until their application for renewal has been granted, and those not able to resume work must satisfy the border services officer that they have sufficient means of support and that they will not study or work without authorization. The page adds that temporary residents from TRV-required countries whose period of authorized stay was extended under subsection R183(5) and who are seeking re-entry following a visit solely to the United States or St. Pierre and Miquelon are considered to be TRV exempt. This record does not grant re-entry or permit extensions.'
  }),

  // ── 2. REMOTE WORK ON VISITOR STATUS (IRPA s.2) ──────────────────────────────
  createRecord({
    id: 'ircc-remote-work-visitor-status',
    title: 'IRCC: What is work? - remote work for an employer outside Canada is not work under the Regulations',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/foreign-workers/what-is-work.html',
    quote: 'long distance (by telephone or Internet) work done by a temporary resident whose employer is outside Canada and who is remunerated from outside Canada',
    summary: 'IRCC\'s operational guidance "What is work?" defines work as an activity for which wages are paid or commission is earned, or that competes directly with activities of Canadian citizens or permanent residents in the Canadian labour market. Wages or commission includes salary paid by an employer, remuneration or commission received for fulfilling a service contract, or any other situation where a foreign national receives payment for performing a service. Officers consider whether there is entry into the labour market: whether the person will do an activity a Canadian or permanent resident should really have an opportunity to do, or engage in a competitive business activity. The guidance lists activities that are not considered work, including volunteer work that is not normally remunerated, unremunerated help by a friend or family member during a visit, long distance (by telephone or Internet) work done by a temporary resident whose employer is outside Canada and who is remunerated from outside Canada, and self-employment where the work would have no real impact on the labour market nor really provide an opportunity for Canadians. Examples of work include a foreign technician coming to repair a machine or fulfil a contract, self-employment that could be a competitive economic activity, and unpaid employment undertaken to obtain work experience, such as an internship or practicum. The guidance also describes when a worker may be authorized to work without a work permit. This record does not issue work permits or decide whether a specific activity is work.'
  }),

  // ── 3. EXPIRED PR CARD LAND BORDER ENTRY (IRPA s.19(2)) ──────────────────────
  createRecord({
    id: 'cbsa-expired-pr-card-land-border-entry',
    title: 'IRCC: Permanent resident status, 730-day residency rule, and expired PR card',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-card/understand-pr-status.html',
    quote: "To keep your PR status, you must have been in Canada for at least 730 days during the last five years. These 730 days don't need to be continuous. Some of your time outside Canada may count towards the 730 days you need.",
    summary: 'Under Canadian immigration rules, you do not lose your permanent resident status when your PR card expires. To keep your PR status, you must have been in Canada for at least 730 days during the last five years (these 730 days do not need to be continuous). If you travel outside Canada without a valid PR card, you must apply for a permanent resident travel document before returning on a commercial vehicle. This record does not determine individual status.',
    risk: 'high'
  }),

  // ── 4. FLAGPOLING RESTRICTIONS & PGWP BAN ────────────────────────────────────
  createRecord({
    id: 'cbsa-flagpoling-restrictions-and-pgwp-ban',
    title: 'IRCC: How to apply for a post-graduation work permit (PGWP)',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/apply.html',
    quote: 'In most cases, you must apply online for a PGWP. Step 1: Make sure you have what you need',
    summary: 'Under IRCC guidelines, in most cases applicants must apply online for a post-graduation work permit (PGWP). Applicants must prepare electronic copies of documents and a valid payment card. This record does not issue work permits or decide applications.'
  }),

  // ── 5. NON-ACCOMPANYING FAMILY PERMANENT BAR (IRPR 117(9)(d)) ────────────────
  createRecord({
    id: 'ircc-family-class-exclusion-117-9-d',
    title: 'IRCC: Family class sponsorship exclusions and unexamined family members (IRPR s.117(9)(d))',
    topic: 'family',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/non-economic-classes/family-class-determining-spouse/family-members-not-declared.html',
    quote: "Family members who aren't declared and examined are excluded from the family class, which means you can't sponsor them at a later date.",
    summary: 'Under IRCC family sponsorship rules, family members who are not declared and examined when applying for permanent residence are excluded from the family class, which means you cannot sponsor them at a later date. Failing to declare all family members can also place permanent resident status at risk. This overview outlines statutory family class declaration rules; it does not adjudicate sponsorship applications.'
  }),

  // ── 6. RTA SECTION 5(i) SHARED KITCHEN EXEMPTION ─────────────────────────────
  createRecord({
    id: 'ontario-rta-section-5-shared-kitchen-exemption',
    title: 'LTB: Residential Tenancies Act exemptions for shared kitchen or bathroom',
    topic: 'housing',
    jurisdiction: 'ON',
    housingSubject: 'agreement',
    url: 'https://tribunalsontario.ca/documents/ltb/Brochures/A%20Guide%20to%20the%20Residential%20Tenancies%20Act.html',
    quote: 'The Act does not apply if the tenant must share a kitchen or bathroom with the landlord.',
    summary: 'Under the Landlord and Tenant Board (LTB) guide to the Ontario Residential Tenancies Act, the Act does not apply if the tenant must share a kitchen or bathroom with the landlord. In these exempt shared living arrangements, standard statutory tenancy protections, rent increase guidelines, and LTB dispute resolution processes do not apply. This record outlines statutory exemptions; it does not adjudicate roommate disputes.'
  }),

  // ── 7. POST-2018 RENT CONTROL VERIFICATION (RTA s.6.1) ───────────────────────
  createRecord({
    id: 'ontario-post-2018-rent-control-verification',
    title: 'Ontario rent control exemption for buildings first occupied after November 15, 2018',
    topic: 'housing',
    jurisdiction: 'ON',
    housingSubject: 'agreement',
    url: 'https://www.ontario.ca/page/residential-rent-increases',
    quote: 'New buildings, additions to existing buildings and most new basement apartments that are occupied for the first time for residential purposes after November 15, 2018 are exempt from rent control.',
    summary: 'Ontario\'s Residential rent increases page states that the rent increase guideline does not apply to new buildings, additions to existing buildings and most new basement apartments that are occupied for the first time for residential purposes after November 15, 2018 - such units are exempt from rent control - nor to rental units upon turnover of a tenancy (where the landlord and new tenant agree on the rent amount), community housing units, long-term care homes or commercial properties. Social housing is covered by the Residential Tenancies Act, 2006, but has different rules regarding rent control and rent increase notices. The guideline applies to most private residential rental units covered by the Act and is capped at 2.5% to prevent significant one-time rent increases; in some cases landlords can apply to the Landlord and Tenant Board for approval to raise rent by more than the guideline. In care homes the rent increase guideline applies only to the rent portion of the bill, not to the cost of services like nursing, food or cleaning. The guideline is calculated using the Ontario Consumer Price Index, a Statistics Canada tool that measures inflation and economic conditions over a year, with data from June to May used to determine the guideline for the following year. This record does not set rent amounts.'
  }),

  // ── 8. TFSA NON-RESIDENT 1% PENALTY TAX (ITA s.207.02) ───────────────────────
  createRecord({
    id: 'cra-tfsa-non-resident-contribution-penalty',
    title: 'CRA: TFSA non-resident contribution penalty tax',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account/owing-tax/non-resident.html',
    quote: 'Non-resident contributions are taxed in Canada at a rate of 1% per month for as long as the contribution remains in the account.',
    summary: 'Under CRA rules, non-resident contributions to a Tax-Free Savings Account (TFSA) are taxed in Canada at a rate of 1% per month for as long as the contribution remains in the account. The 1% per month tax applies until the full contribution is withdrawn or the person becomes a Canadian tax resident. This record reports CRA tax rules; it does not assess individual tax liabilities.'
  }),

  // ── 9. CRA COST BASE STEP-UP AT FMV (ITA s.128.1) ────────────────────────────
  createRecord({
    id: 'cra-cost-base-step-up-landing-fmv',
    title: 'CRA: Deemed acquisition of foreign property at Fair Market Value on becoming resident',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/individuals-leaving-entering-canada-non-residents/newcomers-canada-immigrants/completing-return-newcomers.html',
    quote: 'Property you owned before you arrived in Canada If you owned certain property at the time that you immigrated to Canada, the CRA considers you to have sold the property and to have immediately reacquired it at a cost equal to the fair market value (FMV) on the date that you became a resident of Canada. This is a deemed disposition. Your property could include items such as shares, jewellery, paintings or a collection.',
    summary: 'Under CRA rules for property owned before arriving in Canada, if you owned certain property when you immigrated, the CRA considers you to have sold the property and immediately reacquired it at a cost equal to its fair market value (FMV) on the date you became a resident of Canada. This deemed disposition establishes a new cost base step-up, meaning capital gains tax applies only to appreciation after arrival. You should keep a record of the FMV of your property on the arrival date. This record does not calculate capital gains or prepare tax returns.'
  }),

  // ── 10. PARENTAL WIRE GIFTS & DEED OF GIFT ───────────────────────────────────
  createRecord({
    id: 'fintrac-overseas-parental-gift-deed',
    title: 'CRA & FINTRAC: Tax treatment of personal gifts, parental wire transfers, and documentation',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/personal-income/amounts-that-taxed.html',
    quote: 'You do not have to report certain non-taxable amounts as income, including: lottery winnings of any amount, unless the prize can be considered income from employment, a business or property, or a prize for achievement most gifts and inheritances',
    summary: 'Under CRA guidelines, individuals do not have to report certain non-taxable amounts as income, including most personal gifts and inheritances. While receiving a gift or parental wire transfer is generally not taxable income in Canada, recipients should keep documentation such as a deed of gift or bank records to satisfy banking and tax inquiries. This overview describes personal income tax rules; it does not provide legal representation or audit defense.'
  }),

  // ── 11. AUTO INSURANCE FOREIGN EXPERIENCE LETTER (FSRA) ─────────────────────
  createRecord({
    id: 'fsra-auto-insurance-foreign-experience-letter',
    title: 'Financial Consumer Agency of Canada: Mandatory Car Insurance and Coverage Options',
    topic: 'driving',
    jurisdiction: 'ON',
    url: 'https://www.canada.ca/en/financial-consumer-agency/services/insurance/car.html',
    quote: 'Car insurance is a protection you must purchase if you own a car or other vehicle. It protects you in case of an accident.',
    summary: 'The Financial Consumer Agency of Canada explains that car insurance is mandatory protection you must purchase if you own a vehicle. Car insurance covers liability claims if you are responsible for an accident causing damage or injuries, and protects you against vehicle repair costs.'
  }),

  // ── 12. SELF-EMPLOYED WORK CEC EXCLUSION (IRPR 87.1(3)(b)) ───────────────────
  createRecord({
    id: 'ircc-self-employed-work-cec-exclusion',
    title: 'IRCC: Qualifying work experience for the Canadian experience class - self-employment and unauthorized work excluded (R87.1(3)(b))',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/economic-classes/experience/qualifying-work-experience.html',
    quote: 'Any periods of self-employment or unauthorized work will not be included in calculating the period of work experience [R87.1(3)(b)].',
    summary: 'IRCC\'s guidance on qualifying work experience for the Canadian experience class (CEC) states that the applicant must have had temporary resident status during the qualifying period of work experience acquired in Canada [R87.1(3)(c)], and that any periods of self-employment or unauthorized work will not be included in calculating the period of work experience [R87.1(3)(b)]. A person who has worked in Canada without authorization has failed to comply with subsection 30(1) of the Immigration and Refugee Protection Act (IRPA), and on that basis could be found inadmissible under section A41. The guidance notes that work experience acquired while on maintained status and working under the authority of paragraph 186(u) of the Immigration and Refugee Protection Regulations (IRPR) will be considered as eligible work experience under the CEC, provided the applicant continued to work in Canada under the same conditions as their original work permit until a decision was made on their application for a work permit extension. This record does not calculate points or decide applications.'
  }),

  // ── 13. DUAL INTENT (IRPA s.22(2)) ───────────────────────────────────────────
  createRecord({
    id: 'ircc-dual-intent-temporary-residence',
    title: 'IRCC: Dual intent for temporary residence applicants',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/transparency/committees/cimm-dec-02-2020/cimm-dual-intent-dec-02-2020.html',
    quote: 'refers to clients who apply for temporary status in Canada, while also having declared an intention to immigrate to Canada permanently through a permanent residence stream.',
    summary: 'IRCC explains that dual intent refers to clients who apply for temporary status in Canada, while also having declared an intention to immigrate to Canada permanently through a permanent residence stream. Having dual intent is legitimate, but the foreign national must still satisfy the officer that they will leave Canada at the end of their authorized stay. This record outlines policy instructions; it does not guarantee visa issuance.'
  }),

  // ── 14. CBSA DIGITAL DEVICE SEARCH LIMITS (CUSTOMS ACT s.99(1)(a)) ────────────
  createRecord({
    id: 'cbsa-digital-device-search-limits',
    title: 'CBSA: Examination of digital devices at the port of entry',
    topic: 'arrival',
    jurisdiction: 'CA',
    url: 'https://www.cbsa-asfc.gc.ca/travel-voyage/edd-ean-eng.html',
    quote: "Canada Border Services Agency ( CBSA ) officers, under the Customs Act , have the authority to examine all goods that cross the border. For border control purposes, our officers have similar authorities to examine your cell phones, tablets, laptops and any other digital device you are carrying. CBSA officers may also examine a traveller's personal digital device under the Immigration and Refugee Protection Act .",
    summary: 'The Canada Border Services Agency (CBSA) explains that officers, under the Customs Act, have the authority to examine all goods that cross the border. For border control purposes, officers have authorities to examine cell phones, tablets, laptops, and other digital devices, and may also examine personal digital devices under the Immigration and Refugee Protection Act. This overview explains border inspection authority; it does not provide legal representation.'
  }),

  // ── 15. LEASE ASSIGNMENT 30-DAY EXIT (ONTARIO RTA s.95) ───────────────────────
  createRecord({
    id: 'ontario-rta-lease-assignment-30-day-exit',
    title: 'LTB: Ending a tenancy early by assigning the tenancy and 30-day notice',
    topic: 'housing',
    jurisdiction: 'ON',
    housingSubject: 'agreement',
    url: 'https://tribunalsontario.ca/documents/ltb/Brochures/How%20a%20Tenant%20Can%20End%20Their%20Tenancy.html',
    quote: 'If the landlord refuses to let you assign the rental unit, or does not reply within seven days of your request to assign, you can end your tenancy early by giving your landlord a Tenant\'s Notice to Terminate the Tenancy (Form N9) . You must give the landlord this notice no more than 30 days after you made your request. You must give your landlord at least 30 days\' notice.',
    summary: 'Under the Ontario Landlord and Tenant Board (LTB) rules, if a landlord refuses to let a tenant assign the rental unit, or does not reply within seven days of the request to assign, the tenant can end the tenancy early by giving the landlord a Tenant\'s Notice to Terminate the Tenancy (Form N9). The tenant must give this notice no more than 30 days after making the request, providing at least 30 days\' notice. This overview explains statutory assignment exit rights; it does not issue termination notices.'
  }),

  // ── 16. FORM N12 COMPENSATION TIMING VOID (ONTARIO RTA s.48.1) ───────────────
  createRecord({
    id: 'ontario-rta-n12-compensation-timing-void',
    title: 'Ontario RTA: Eviction for personal use and 1-month compensation rules',
    topic: 'housing',
    jurisdiction: 'ON',
    housingSubject: 'eviction',
    url: 'https://www.ontario.ca/page/renting-ontario-your-rights',
    quote: "Your landlord must give you the equivalent of 1 month's rent or offer you another unit if they: want to use the unit themselves want to use the unit for their family or caregiver are selling the property and the purchaser will be using the unit themselves If your landlord gives you 120 days notice or more to evict you for personal use, your landlord does not have to give you the equivalent of 1 month's rent or offer you another unit.",
    summary: "Under Ontario rules for eviction for personal use, your landlord must give you the equivalent of 1 month's rent or offer you another unit if they want to use the unit themselves, for family, or if selling to a purchaser. If the landlord gives you 120 days notice or more to evict you for personal use, the landlord does not have to give you 1 month's rent or offer another unit. This record reports statutory housing guidelines and does not provide legal representation."
  }),

  // ── 17. CRA T1135 PERSONAL-USE PROPERTY EXEMPTION (ITA s.233.3) ───────────────
  createRecord({
    id: 'cra-t1135-personal-use-property-exemption',
    title: 'CRA: Form T1135 foreign reporting and personal-use property exemption',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/information-been-moved/foreign-reporting/questions-answers-about-form-t1135.html',
    quote: 'No, you do not have to report personal-use property. This includes vacation property that you use primarily as a personal residence (see real property questions below) and listed personal property such as works of art, jewelry, rare folios, rare manuscripts, rare books, stamps, and coins.',
    summary: 'Under CRA guidelines for Form T1135 (Foreign Income Verification Statement), taxpayers do not have to report personal-use property. Personal-use property includes vacation property used primarily as a personal residence, as well as listed personal property such as works of art, jewelry, rare books, stamps, and coins. This record does not determine foreign property reporting liability.'
  }),

  // ── 18. MTO FOREIGN DRIVING EXTRACT EXPERIENCE CREDIT ─────────────────────────
  createRecord({
    id: 'mto-foreign-licence-driving-extract-credit',
    title: 'DriveTest & MTO: Foreign licence experience credit limited to 12 months since 1 July 2026',
    topic: 'driving',
    jurisdiction: 'ON',
    url: 'https://www.ontario.ca/page/exchange-out-province-drivers-licence',
    quote: 'Effective July 1, 2026, you can can obtain credit for up to one year of driving experience, by showing a valid, original foreign driver\'s licence and authentication document.',
    summary: 'You might still be able to fast-track and get credit for previous driving experience. Effective July 1, 2026, you can can obtain credit for up to one year of driving experience, by showing a valid, original foreign driver\'s licence and authentication document. For example, if your foreign driver\'s licence was issued 6 months before you apply for an Ontario licence, but you have more than 6 months of total driving experience in that jurisdiction, you must provide an acceptable letter of authentication to receive credit for your full driving experience (up to a maximum of 12 months).'
  }),

  // ── 19. US H-1B 60-DAY GRACE PERIOD SEVERANCE TRAP (8 CFR § 214.1(l)(2)) ─────
  createRecord({
    id: 'us-uscis-h1b-60-day-grace-period-severance',
    title: 'USCIS: H-1B 60-day post-termination grace period calculation and severance trap (8 CFR 214.1(l)(2))',
    topic: 'employment',
    jurisdiction: 'United States',
    url: 'https://www.uscis.gov/working-in-the-united-states/information-for-employers-and-employees/options-for-nonimmigrant-workers-following-termination-of-employment',
    quote: 'The maximum 60-day grace period provides time for a nonimmigrant worker to retain their nonimmigrant status.',
    summary: 'If the worker is an eligible H-1B nonimmigrant and an employer files a new nonfrivolous H-1B petition on their behalf, the worker can begin work immediately after USCIS receives the petition and continue to maintain their H-1B status. The maximum 60-day grace period provides time for a nonimmigrant worker to retain their nonimmigrant status. Within the grace period, eligible H-1B nonimmigrant workers may also begin employment again as soon as a new employer properly files a new H-1B petition, rather than waiting for the new petition to be approved.'
  }),

  // ── 20. US F-1 OPT TO H-1B CAP-GAP EXTENSION (8 CFR § 214.2(f)(5)(vi)) ─────────
  createRecord({
    id: 'us-uscis-f1-opt-cap-gap-extension',
    title: 'USCIS: F-1 OPT to H-1B Cap-Gap automatic work authorization and status extension',
    topic: 'employment',
    jurisdiction: 'United States',
    url: 'https://www.uscis.gov/i-9-central/form-i-9-acceptable-documents/employment-authorization-extensions',
    quote: "A cap-gap is the period between the end of a nonimmigrant student's F-1 status and the beginning of their H-1B status. An F-1 student in Optional Practical Training (OPT) whose employer timely files an H-1B petition for the student may be eligible to continue working beyond the expiration of their OPT Employment Authorization Document.",
    summary: "Under USCIS guidance, a cap-gap is the period between the end of a nonimmigrant student's F-1 status and the beginning of their H-1B status. An F-1 student in Optional Practical Training (OPT) whose employer timely files an H-1B petition for the student may be eligible to continue working beyond the expiration of their OPT Employment Authorization Document (EAD) through the cap-gap period."
  }),

  // ── 21. UK ILR 180-DAY ROLLING ABSENCE LIMIT (APPENDIX CONTINUOUS RESIDENCE) ──
  createRecord({
    id: 'uk-home-office-ilr-180-day-rolling-absence',
    title: 'UK Visas and Immigration: Indefinite Leave to Remain (ILR) 180-day rolling absence calculation rules',
    topic: 'employment',
    jurisdiction: 'United Kingdom',
    url: 'https://www.gov.uk/government/publications/continuous-residence',
    quote: 'UK Visas and Immigration (UKVI) guidance on how staff assess the continuous residence requirements for applications for settlement (indefinite leave to remain) in the UK under the routes where Appendix Continuous Residence applies.',
    summary: 'Immigration staff guidance on assessing and calculating the requirements under Appendix Continuous Residence. UK Visas and Immigration (UKVI) guidance on how staff assess the continuous residence requirements for applications for settlement (indefinite leave to remain) in the UK under the routes where Appendix Continuous Residence applies.'
  }),

  // ── 22. UK SECTION 21 NOTICE INVALIDATION BY GAS & HOW TO RENT (DEREGULATION ACT 2015) ─
  createRecord({
    id: 'uk-tenancy-section-21-gas-safety-invalidation',
    title: 'GOV.UK: Evicting tenants in England and notice requirements',
    topic: 'housing',
    jurisdiction: 'United Kingdom',
    housingSubject: 'eviction',
    url: 'https://www.gov.uk/evicting-tenants',
    quote: 'You may be guilty of harassing or illegally evicting your tenant if you do not follow the correct procedures. Illegal eviction is a criminal offence that can lead to a prison sentence.',
    summary: 'Under UK government guidance for evicting tenants in England, landlords must follow strict procedures if they want a tenant to leave, and illegal eviction is a criminal offence that can lead to a prison sentence. For assured periodic tenancies, landlords must give proper notice and apply to court for a possession order if the tenant does not leave. This overview outlines statutory possession procedures; it does not grant eviction orders or represent landlords.'
  }),

  // ── 23. AU 482 VISA 180-DAY SPONSOR CESSATION WINDOW (CONDITION 8607) ──────────
  createRecord({
    id: 'au-home-affairs-482-180-day-cessation-transfer',
    title: 'Department of Home Affairs: Visa conditions and VEVO verification',
    topic: 'employment',
    jurisdiction: 'Australia',
    url: 'https://immi.homeaffairs.gov.au/visas/already-have-a-visa/check-visa-details-and-conditions/see-your-visa-conditions?product=482',
    quote: 'Not sure which visa you have? Check your conditions (VEVO) or have a look at the visa grant letter you received.',
    summary: 'Under Australian immigration guidance from the Department of Home Affairs, visa holders can verify attached conditions and work entitlements using Visa Entitlement Verification Online (VEVO) or by checking their official visa grant letter. Visa conditions specify employment and sponsorship rules. This overview outlines visa condition verification; it does not process sponsorship transfers or grant visas.'
  }),

  // ── 24. AU MEDICARE LEVY EXEMPTION & MES CERTIFICATE (ATO) ────────────────────
  createRecord({
    id: 'au-services-australia-medicare-levy-exemption-mes',
    title: 'Services Australia & ATO: Medicare Levy 2% tax exemption via Medicare Entitlement Statement (MES)',
    topic: 'health',
    jurisdiction: 'Australia',
    url: 'https://www.servicesaustralia.gov.au/medicare-entitlement-statement',
    quote: 'You can get a Medicare Entitlement Statement (MES) if you weren\'t eligible for Medicare for all or part of a financial year.',
    summary: 'If you were not eligible for Medicare for all or part of a financial year, you can ask Services Australia for a Medicare Entitlement Statement (MES) and use it to claim the Medicare levy exemption in your tax return. You can apply from 1 July each year.'
  }),

  // ── 25. GERMANY NEBENKOSTEN 12-MONTH PRECLUSION DEADLINE (BGB § 556(3)) ───────
  createRecord({
    id: 'de-bgb-nebenkosten-12-month-preclusion',
    title: 'German Civil Code: Landlord 12-month strict preclusion deadline for annual utility bills (BGB § 556(3))',
    topic: 'housing',
    jurisdiction: 'Germany',
    housingSubject: 'repairs',
    url: 'https://www.gesetze-im-internet.de/bgb/__556.html',
    quote: 'Die Abrechnung ist dem Mieter spätestens bis zum Ablauf des zwölften Monats nach Ende des Abrechnungszeitraums mitzuteilen. Nach Ablauf dieser Frist ist die Geltendmachung einer Nachforderung durch den Vermieter ausgeschlossen, es sei denn, der Vermieter hat die verspätete Geltendmachung nicht zu vertreten.',
    summary: 'Under the German Civil Code (Bürgerliches Gesetzbuch - BGB) provisions on Betriebskosten (operating costs), residential landlords who charge monthly operating and heating cost prepayments (Warmmiete / Nebenkosten) must provide an itemized annual operating cost reconciliation statement (Nebenkostenabrechnung) within the twelfth month after the end of the billing period. If the landlord delivers the statement even one day after the expiration of this twelve-month statutory preclusion period (Ausschlussfrist), the landlord\'s claim to any additional arrears or deficit payment is legally extinguished and barred, unless the landlord proves the delayed assertion was not their fault. Conversely, any credit or surplus balance remains owed to the tenant. Landlords cannot withhold security deposits (Mietkaution) past reasonable reconciliation periods to bypass the preclusion rule. This record does not adjudicate tenancy debts.'
  }),

  // ── 26. GERMANY RUNDFUNKBEITRAG PER-RESIDENCE EXEMPTION (RBStV § 2) ───────────
  createRecord({
    id: 'de-rundfunkbeitrag-single-household-exemption',
    title: 'ARD ZDF Beitragsservice: Licence Fee and One Dwelling One Fee Rule',
    topic: 'community',
    jurisdiction: 'Germany',
    url: 'https://www.rundfunkbeitrag.de/welcome/',
    quote: 'Basically, for citizens who are at least 18 years old, the following applies: One dwelling – one fee. If several persons live together in one dwelling, only one person pays the fee, regardless of how many persons live in it or how many devices they use.',
    summary: 'Under the German public broadcasting fee rules, for citizens who are at least 18 years old, one dwelling pays one fee. If several persons live together in one dwelling, only one person pays the fee, regardless of how many persons live in it or how many devices they use. The current fee for private households is 18.36 euros per month. This record explains household contribution rules; it does not cancel or administer broadcasting fee accounts.'
  }),

  // ── 27. UAE WPS & RECRUITMENT RECOVERY BAN (LABOUR LAW DECREE 33) ──────────────
  createRecord({
    id: 'uae-mohre-wps-gratuity-deduction-ban',
    title: 'UAE Ministry of Human Resources and Emiratisation: Wages Protection System (WPS) and recruitment fee deduction ban (Federal Decree-Law No. 33 of 2021)',
    topic: 'employment',
    jurisdiction: 'United Arab Emirates',
    url: 'https://www.mohre.gov.ae/en/laws-and-regulations/labour-law.aspx',
    quote: 'Under Federal Decree-Law No. 33 of 2021 Article 6, the employer is prohibited from charging the worker or deducting from their remuneration the recruitment and employment fees.',
    summary: 'Under UAE Federal Decree-Law No. 33 of 2021 (Article 6) on the Regulation of Labour Relations and Ministerial Resolution No. 598 of 2022 on the Wages Protection System (WPS), which repealed Resolution No. 43 of 2022, employers are prohibited from charging workers recruitment and employment fees and costs or collecting them directly or indirectly. Furthermore, under Article 51, full-time foreign employees completing at least one year of continuous service are entitled to end-of-service gratuity calculated on their basic wage (21 days wage per year for the first 5 years, and 30 days per year thereafter), payable with other dues within 14 days of the end of the contract. The total gratuity cannot exceed 2 years wage, and the employer may deduct amounts the worker owes. This record does not file MoHRE labour dispute claims.'
  }),

  // ── 28. UAE RERA 12-MONTH NOTARY EVICTION NOTICE (DUBAI LAW 33) ───────────────
  createRecord({
    id: 'uae-rera-12-month-eviction-notary-notice',
    title: 'Dubai Land Department: RERA 12-month formal Notary Public eviction notice requirement (Law No. 33 of 2008)',
    topic: 'housing',
    jurisdiction: 'United Arab Emirates',
    housingSubject: 'eviction',
    url: 'https://dubailand.gov.ae/en/eservices/rental-index/',
    quote: 'The landlord must notify the tenant of the reason for eviction at least twelve months prior to the date determined for eviction, provided that this notice is given through the Notary Public or by registered mail.',
    summary: 'Under Dubai Law No. 26 of 2007 as amended by Law No. 33 of 2008 Article 25(2), a residential landlord seeking to evict a tenant for personal occupancy, first-degree relative use, or property sale must provide the tenant with at least 12 months written notice served through a Notary Public or by registered mail. A WhatsApp message, SMS or informal email does not meet this requirement. In addition, under Decree No. 43 of 2013, landlords cannot demand arbitrary rent increases upon lease renewal; permissible rent increases are strictly governed by the official Dubai Land Department (DLD) Smart Rental Index calculator based on average area benchmarks. This record does not file Rental Dispute Centre claims.'
  }),

  // ── 29. IRELAND RPZ 2% STATUTORY RENT CAP (RTA 2004) ─────────────────────────
  createRecord({
    id: 'ie-rtb-rpz-2-percent-rent-cap',
    title: 'Ireland RTB: national rent control from 1 March 2026 (setting and reviewing private rents)',
    topic: 'housing',
    jurisdiction: 'Ireland',
    housingSubject: 'agreement',
    url: 'https://www.rtb.ie/rent-pressure-zones',
    quote: 'Rent can only be increased once per year by 2% or the rate of inflation, whichever is lower.',
    summary: 'From 1 March 2026, a new national system of rent control applies to all private tenancies and Student Specific Accommodation (SSA) under the Residential Tenancies Board: rent can only be increased once per year by 2% or the rate of inflation, whichever is lower, with the rate of inflation measured by the Consumer Price Index (CPI). For private tenancies created from 1 March 2026, re-setting to market rent is allowed only in specific cases: when a new tenancy begins, but only if the last tenancy ended because the tenant left by choice, breached their obligations or the property no longer suits their needs, or at the end of a 6-year tenancy cycle (called a Tenancy of Minimum Duration). For existing tenancies created before 1 March 2026, re-setting to market rent is not allowed for an ongoing tenancy. The page provides a simplified, plain-language summary of rental law and is not a substitute for the full and definitive information. This record does not adjudicate RTB dispute hearings.'
  }),

  // ── 30. IRELAND CSEP 21-MONTH STAMP 4 FAST-TRACK (ISD 2024) ────────────────────
  createRecord({
    id: 'ie-isd-csep-21-month-stamp-4-fast-track',
    title: 'Irish Immigration Service Delivery: Critical Skills Employment Permit 21-month transition to Stamp 4 permission (Employment Permits Act 2024)',
    topic: 'employment',
    jurisdiction: 'Ireland',
    url: 'https://www.irishimmigration.ie/coming-to-work-in-ireland/what-are-my-work-options/',
    quote: 'Critical Skills Employment Permit holders who have completed 21 months of continuous employment in Ireland can apply for Stamp 4 permission.',
    summary: 'Under Irish Department of Justice Immigration Service Delivery (ISD) policies and the Employment Permits Act 2024, foreign nationals holding a Critical Skills Employment Permit (CSEP) who have completed 21 months from the start of their employment on that permit, and have held Stamp 1 permission for at least 21 months, can apply directly to the Registration Office for Stamp 4 permission. The Department of Enterprise stopped taking applications for Stamp 4 support letters on 30 November 2023. Stamp 4 confers unrestricted right to work in Ireland, exempting the holder from employment permit requirements, labour market needs tests, and sponsor lock-in, while allowing them to change employers freely, establish independent business ventures, and accumulate reckonable residence towards naturalization under the Irish Nationality and Citizenship Act 1956. This record does not register Stamp 4 permissions.'
  }),

  // ── 31. NEW ZEALAND AEWV 90-DAY REDUNDANCY WINDOW (INZ WK3) ───────────────────
  createRecord({
    id: 'nz-inz-aewv-90-day-redundancy-cushion',
    title: 'Immigration New Zealand: Accredited Employer Work Visa (AEWV) redundancy and Job Change',
    topic: 'employment',
    jurisdiction: 'New Zealand',
    url: 'https://www.immigration.govt.nz/new-zealand-visas/already-have-a-visa/managing-your-visa-and-passport/change-the-conditions-of-a-work-visa',
    quote: 'If an AEWV worker loses their job, this may affect their work visa.',
    summary: 'Immigration New Zealand (INZ) says that if an Accredited Employer Work Visa (AEWV) worker loses their job, this may affect their work visa, and that workers affected by a restructure, redundancy, bankruptcy or liquidation should contact its Customer Service Centre to discuss their options. An AEWV holder may work only in the job, for the employer and in the location stated on the visa. To change any of these they must apply to vary their visa conditions, apply for a Job Change, or apply for a new visa, and a new job may need a job token. Changing visa conditions does not change the visa expiry date. The INZ pages checked do not state a fixed number of days to find new work. This record does not submit Job Change applications.'
  }),

  // ── 32. NEW ZEALAND 23-DAY BOND LODGEMENT RULE (MBIE RTA s.23) ─────────────────
  createRecord({
    id: 'nz-tenancy-services-bond-lodgement-23-days',
    title: 'Ministry of Business, Innovation and Employment: Mandatory 23-working-day tenancy bond lodgement (Residential Tenancies Act 1986 s.23)',
    topic: 'housing',
    jurisdiction: 'New Zealand',
    housingSubject: 'deposit',
    url: 'https://www.tenancy.govt.nz/rent-bond-and-bills/bond/lodging-a-bond/',
    quote: 'They can lodge a bond, lodge a bond top-up, and arrange a bond refund.',
    summary: 'In most situations, landlords who charge a general bond or pet bond must lodge (deposit) it online with Tenancy Services. In most situations, landlords must lodge a general bond, pet bond or bond top-up payment with Tenancy Services. They can lodge a bond, lodge a bond top-up, and arrange a bond refund.'
  }),

  // ── 33. US 90-DAY MISREPRESENTATION PRESUMPTION (9 FAM 302.9) ──────────────────
  createRecord({
    id: 'us-dos-90-day-rule-misrepresentation-presumption',
    title: 'USCIS Policy Manual: Adjudicating Inadmissibility for Fraud or Willful Misrepresentation',
    topic: 'employment',
    jurisdiction: 'United States',
    url: 'https://www.uscis.gov/policy-manual/volume-8-part-j-chapter-3',
    quote: 'To find an alien inadmissible for fraud or willful misrepresentation, [1] there must be at least some evidence that would permit a reasonable person to find that the alien used fraud or that he or she willfully misrepresented a material fact in an attempt to obtain a visa, other documentation, admission into the United States, or any other immigration benefit. [2]',
    summary: 'Under the USCIS Policy Manual Volume 8 Part J, to find an applicant inadmissible for fraud or willful misrepresentation, there must be evidence that would permit a reasonable person to find that the applicant used fraud or willfully misrepresented a material fact in an attempt to obtain a visa, admission, or other immigration benefit. The evidence must show that the misrepresentation was made to an authorized official of the U.S. government. This record explains statutory misrepresentation inadmissibility standards; it does not assess waiver eligibility.'
  }),

  // ── 34. UK TENANT FEES ACT BAN ON LETTING AGENT FEES (2019) ───────────────────
  createRecord({
    id: 'uk-tenant-fees-act-prohibited-payments-ban',
    title: 'UK Ministry of Housing: Tenant Fees Act guidance and permitted payments in England',
    topic: 'housing',
    jurisdiction: 'United Kingdom',
    housingSubject: 'deposit',
    url: 'https://www.gov.uk/government/publications/tenant-fees-act-2019-guidance',
    quote: 'Consumer guidance to help tenants understand their rights and obligations under the Act, including: a list of permitted and prohibited payments',
    summary: 'Under UK guidance on the Tenant Fees Act, published by the Ministry of Housing, Communities and Local Government for England, statutory guidance sets out tenant rights and obligations, including permitted and prohibited payments and enforcement powers. The guidance explains the penalties and consequences of a breach of the Act. This overview outlines statutory tenancy fee guidance; it does not adjudicate payment claims or issue civil penalties.'
  }),

  // ── 35. ONTARIO OHIP 3-MONTH WAITING PERIOD ELIMINATION (BILL 175) ──────────────
  createRecord({
    id: 'ontario-health-ohip-wait-elimination',
    title: 'Ontario Ministry of Health: Permanent elimination of the 3-month OHIP waiting period and interprovincial portability',
    topic: 'health',
    jurisdiction: 'ON',
    url: 'https://www.ontario.ca/page/apply-ohip-and-get-health-card',
    quote: 'There is no longer a waiting period for OHIP coverage.',
    summary: 'Ontario no longer has a waiting period for OHIP coverage. You still need to meet the eligibility rules, for example holding an eligible immigration status and living in Ontario, and you apply in person at ServiceOntario.'
  }),

  // ── 36. IRCC EXPRESS ENTRY CEC 52-WEEK CONTINUOUS REQUIREMENT ───────────────────
  createRecord({
    id: 'ircc-express-entry-continuous-work-52-weeks',
    title: 'Qualifying work experience under the Canadian Experience Class (CEC) - IRCC guidance',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/economic-classes/experience/qualifying-work-experience.html',
    quote: 'For the Post-graduation stream , the applicant must have at least 12 months of full-time, Canadian skilled work experience (or the equivalent in part-time work experience) in one or more NOC 0, A or B occupations, within the 24 months before the date the application is received [ R87.1(2)(a)(i) to (ii) ].',
    summary: 'IRCC\'s guidance for assessing qualifying work experience under the Canadian Experience Class (CEC) states that work experience need not be continuous, and that the employment requirements listed in the National Occupational Classification (NOC) description are not applicable. For applications received before January 2, 2013, the Temporary foreign worker stream requires at least 24 months of full-time, Canadian skilled work experience (or the equivalent in part-time work experience) in one or more NOC 0, A or B occupations, within 36 months before the date the application is received; the Post-graduation stream requires at least 12 months within the 24 months before the date the application is received [ R87.1(2)(a)(i) to (ii) ]. The page also covers assessing work experience for applications received in later date cohorts, determining an applicant\'s employment status (employee vs. self-employed), and bridging open work permits (BWOPs): applicants do not have to be employed at the time of application, but must have had temporary resident status during the qualifying period. This record does not assess Express Entry applications.'
  }),

  // ── 37. US IRS F-1/J-1 STUDENT FICA TAX EXEMPTION (IRC § 3121(b)(19)) ──────────
  createRecord({
    id: 'us-irs-f1-opt-fica-tax-exemption',
    title: 'IRS: F-1 and J-1 student exemption from Social Security and Medicare FICA taxes (IRC § 3121(b)(19))',
    topic: 'money',
    jurisdiction: 'United States',
    url: 'https://www.irs.gov/individuals/international-taxpayers/foreign-student-liability-for-social-security-and-medicare-taxes',
    quote: 'These nonresident alien students are exempt from Social Security Tax and Medicare Tax on wages paid to them for services performed within the U.S.',
    summary: 'Under the residency rules of Internal Revenue Code (IRC) section 7701(b), foreign students temporarily present in the United States in F-1, J-1, or M-1 visa status for less than 5 calendar years are generally nonresident aliens (NRA), and these nonresident alien students are exempt from Social Security Tax and Medicare Tax on wages paid to them for services performed within the U.S. To qualify for the exemption, the services performed need to be allowed by USCIS for these nonimmigrant statuses and must be performed to carry out the purposes for which such visas were issued. Exempt employment includes on-campus student employment up to 20 hours a week (40 hrs. during summer vacations), off-campus student employment allowed by USCIS, and practical training student employment on or off campus. The exemption does not apply to spouses and children in F-2, J-2, or M-2 status, nor to employment not allowed by USCIS or not closely connected to the purpose for which the visa was issued. Where FICA taxes were withheld in error, the page explains how the student may request a refund from the employer or file a claim for refund with the IRS if the employer cannot refund the amount. This record does not file tax returns.'
  }),

  // ── 38. US USCIS 540-DAY AUTOMATIC EAD EXTENSION (8 CFR § 274a.13(d)) ──────────
  createRecord({
    id: 'us-uscis-540-day-ead-automatic-extension',
    title: 'USCIS: Automatic EAD extension (8 CFR § 274a.13(d)), ended for renewals filed on or after 30 October 2025',
    topic: 'employment',
    jurisdiction: 'United States',
    url: 'https://www.uscis.gov/eadautoextend',
    quote: 'If you filed Form I-765, Application for Employment Authorization, to renew your expiring EAD, you may qualify for an up-to-540-day automatic extension of the expiration date printed on your EAD while your application is pending.',
    summary: 'USCIS explains the automatic extension of expiring Employment Authorization Documents (EADs) for workers who timely file Form I-765 (Application for Employment Authorization) to renew: if you filed Form I-765 to renew your expiring EAD, you may qualify for an up-to-540-day automatic extension of the expiration date printed on your EAD while your application is pending. Aliens who apply to renew their EAD on or after Oct. 30, 2025 will no longer receive an automatic extension of their EAD; exceptions include extensions provided by law or through a Federal Register notice for TPS-related employment documentation. TPS-related EADs may only be automatically extended for up to 1 year or the duration of TPS (whichever is shorter) for EAD renewal applications pending or filed on or after July 22, 2025 - the page\'s alert notes the H.R. 1 One Big Beautiful Bill Act was signed into law on July 4, 2025, established statutory validity periods for TPS-based employment authorization, and was implemented in a Federal Register notice on July 22, 2025 and a web alert on July 18, 2025. You qualify for the automatic extension if the Form I-797C Notice of Action receipt notice for your pending renewal has a Received Date before the Card Expires date shown on your EAD, the Received Date is on or after May 4, 2022 (or the renewal application was pending on May 4, 2022), the renewal application is under a category eligible for an automatic extension, and the category on your current EAD matches the category on the renewal application. This record does not issue EAD cards.'
  }),

  // ── 39. AUSTRALIA FAIR WORK WORKING HOLIDAY REGIONAL AWARD FLOOR ────────────────
  createRecord({
    id: 'au-fair-work-working-holiday-award-wage-floor',
    title: 'Fair Work Ombudsman: Working Holiday Visa regional work award wage floor and piece rate protections (Fair Work Act 2009)',
    topic: 'employment',
    jurisdiction: 'Australia',
    url: 'https://www.fairwork.gov.au/find-help-for/visa-holders-and-migrants',
    quote: 'All people working in Australia have the same basic rights and protections at work, regardless of citizenship or visa status.',
    summary: 'Under the Australian Fair Work Act 2009 and the Horticulture Award 2020, Working Holiday Visa (subclass 417 and subclass 462) holders undertaking 88 days or 6 months of specified regional work to qualify for subsequent visa extensions are protected by mandatory national workplace standards. Employers are legally prohibited from paying below National Minimum Wage award rates, offering unpaid trial shifts beyond brief demonstrations, or demanding unlawful cash-back arrangements. Under the piecework safety net clause of the Horticulture Award, employers must ensure that pieceworkers earn at least 15% above the minimum hourly rate for an average competent worker. Furthermore, employers cannot deduct accommodation, transportation, or tool expenses without the worker genuine, uncoerced written agreement. This record does not litigate Fair Work Ombudsman claims.'
  }),

  // ── 40. GERMANY BGB § 622 EMPLOYMENT NOTICE PERIODS & PROBATION ────────────────
  createRecord({
    id: 'de-bgb-kuendigungsfrist-notice-periods',
    title: 'German Civil Code: Statutory employment termination notice periods and 2-week probation rule (BGB § 622)',
    topic: 'employment',
    jurisdiction: 'Germany',
    url: 'https://www.gesetze-im-internet.de/bgb/__622.html',
    quote: 'Das Arbeitsverhältnis eines Arbeiters oder eines Angestellten (Arbeitnehmers) kann mit einer Frist von vier Wochen zum Fünfzehnten oder zum Ende eines Kalendermonats gekündigt werden.',
    summary: 'Under the German Civil Code (Bürgerliches Gesetzbuch - BGB) Section 622 governs the statutory termination notice periods (Kündigungsfristen) for the lawful termination of employment contracts. During an agreed probationary period (Probezeit) of up to six months, either employer or employee may terminate the employment relationship with a shortened notice period of two weeks to any day. Following the probationary period, the baseline statutory notice period for employee resignation is four weeks either to the fifteenth or to the end of a calendar month. For employer dismissals, statutory notice periods increase progressively with the employee\'s years of completed service, ranging from one month after two years of service up to seven months after twenty years of service. Contractual clauses cannot impose a longer notice period on the employee than on the employer. This record does not provide representation in Labour Court (Arbeitsgericht) proceedings.'
  }),

  // ── 41. CANADA PNP INTENT TO RESIDE & CHARTER S.6 TRAP ────────────────────────
  createRecord({
    id: 'canada-pnp-intent-to-reside-charter-s6',
    title: 'IRCC: Provincial Nominee Program (PNP) processing and streams',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/economic-classes/provincial-nominees.html',
    quote: 'The Provincial Nominee Program (PNP) is designed to enable provinces and territories to support the immigration of people who have expressed an interest in settling in their province or territory the province or territory believes will be able to contribute to the economic development and prosperity of that province or territory and Canada',
    summary: 'The Provincial Nominee Program (PNP) enables participating provinces and territories (outside Quebec and Nunavut) to nominate individuals who have expressed an interest in settling in that province or territory. Provinces can nominate individuals through either the Non-Express Entry base stream or the Express Entry enhanced stream. This record does not issue provincial nominations.'
  }),

  // ── 42. CANADA CRA FIRST HOME SAVINGS ACCOUNT (FHSA) FOR NEWCOMERS ─────────────
  createRecord({
    id: 'cra-fhsa-newcomer-immediate-eligibility',
    title: 'CRA: First Home Savings Account (FHSA) immediate contribution rights for first-year newcomers (ITA s.146.6)',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account.html',
    quote: 'Your FHSA participation room in the first year you open your FHSA is $8,000.',
    summary: 'A first home savings account (FHSA) is a registered plan which allows you, if you are a first-time home buyer, to save to buy or build a qualifying first home tax-free (up to certain limits). Your FHSA participation room in the first year you open your FHSA is $8,000. Contributions to an FHSA are generally deductible and can be used to reduce your tax.'
  }),

  // ── 43. ONTARIO ESA TERMINATION NOTICE VS SEVERANCE DISTINCTION ────────────────
  createRecord({
    id: 'ontario-esa-notice-vs-severance-distinction',
    title: 'Ontario: severance pay under the Employment Standards Act - how it differs from termination pay',
    topic: 'employment',
    jurisdiction: 'ON',
    url: 'https://www.ontario.ca/document/your-guide-employment-standards-act-0/severance-pay',
    quote: 'The maximum amount of severance pay required to be paid under the ESA is 26 weeks.',
    summary: 'Ontario\'s guide to the Employment Standards Act\'s severance pay rules states that severance pay is compensation paid to a qualified employee whose employment is "severed", and that severance pay is not the same as termination pay, which is given in place of the required notice of termination of employment. Employment is severed when the employer dismisses or stops employing the employee, including where the employee is no longer employed due to the bankruptcy or insolvency of the employer, or constructively dismisses the employee. An employee qualifies for severance pay if their employment is severed, they have worked for the employer for five or more years (whether continuous or not, active or not), and their employer has a global payroll of at least $2.5 million or severed the employment of 50 or more employees in a six-month period because all or part of the business permanently closed. Severance pay is calculated by multiplying the employee\'s regular wages for a regular work week by the completed years of employment plus the completed months of employment divided by 12, and the maximum amount of severance pay required to be paid under the ESA is 26 weeks. This record does not assess common law notice or termination pay amounts.'
  }),

  // ── 44. US CBP ELECTRONIC I-94 SUPREMACY OVER VISA FOIL ────────────────────────
  createRecord({
    id: 'us-cbp-electronic-i-94-controls-stay',
    title: 'US CBP & USCIS: Electronic Form I-94 governs lawful authorized stay and overrides visa foil expiration',
    topic: 'employment',
    jurisdiction: 'United States',
    url: 'https://www.cbp.gov/travel/international-visitors/i-94',
    quote: "Those who need to prove their legal-visitor status—to employers, schools/universities or government agencies—can access their CBP arrival/departure record information online. CBP now gathers travelers' arrival/departure information automatically from their electronic travel records. Now at the land border, travelers will be issued I-94s electronically and will no longer receive a paper I-94 stub.",
    summary: "Under U.S. Customs and Border Protection (CBP) guidance, foreign visitors to the United States no longer complete paper Form I-94 records. CBP gathers travelers' arrival and departure information automatically from electronic travel records, and travelers who need to prove legal-visitor status to employers, schools, universities, or government agencies can access their official record online."
  }),

  // ── 45. US IRS DUAL-STATUS ALIEN FIRST-YEAR CHOICE & S.6013(g) ─────────────────
  createRecord({
    id: 'us-irs-dual-status-first-year-choice',
    title: 'IRS: Dual-status alien first-year choice and Section 6013(g) joint election for married newcomers (IRC § 7701(b)(4) & § 6013(g))',
    topic: 'money',
    jurisdiction: 'United States',
    url: 'https://www.irs.gov/individuals/international-taxpayers/taxation-of-dual-status-aliens',
    quote: 'You are a dual-status individual when you have been both a U.S. resident and a nonresident in the same tax year.',
    summary: 'You are a dual-status individual in a year you relocate to the United States mid-year: different rules apply for the part of the year you are a resident of the United States, filed on Form 1040, and the part of the year you are a nonresident, filed on Form 1040-NR. A dual status individual must file a dual status return as described in Publication 519. Under the first-year choice, a nonresident who becomes a U.S. resident under the substantial presence test in the following tax year may choose to be treated as a dual status resident for this taxable year if certain tests are met, and the residency article of a tax treaty may define tax residency differently from the Internal Revenue Code. This record does not prepare IRS tax returns.'
  }),

  // ── 46. UK SKILLED WORKER SALARY THRESHOLD & GRANDFATHERING (HC 590) ───────────
  createRecord({
    id: 'uk-home-office-skilled-worker-salary-grandfathering',
    title: 'UK Home Office: Skilled Worker salary thresholds and transitional protections (history from HC 590)',
    topic: 'employment',
    jurisdiction: 'United Kingdom',
    url: 'https://www.gov.uk/skilled-worker-visa/your-job',
    quote: 'You must have a job offer from an approved UK employer before you apply for a Skilled Worker visa.',
    summary: "You must have a job offer from an approved UK employer before you apply for a Skilled Worker visa."
  }),

  // ── 47. AUSTRALIA ATO TEMPORARY RESIDENTS FOREIGN CGT EXEMPTION ────────────────
  createRecord({
    id: 'au-ato-temporary-resident-cgt-foreign-assets-exemption',
    title: 'ATO: Temporary residents capital gains tax exemption on foreign assets (ITAA 1997 Subdivision 768-R)',
    topic: 'money',
    jurisdiction: 'Australia',
    url: 'https://www.ato.gov.au/individuals-and-families/income-expenses-and-concessions/foreign-and-worldwide-income/foreign-income-of-australian-residents/temporary-residents',
    quote: 'As a temporary resident, you are not taxed on foreign investment income or capital gains on foreign assets.',
    summary: 'Under the Australian Income Tax Assessment Act 1997 (ITAA 1997) Subdivision 768-R, individuals who reside in Australia on temporary visas (including Subclass 482 Temporary Skill Shortage, Subclass 500 Student, and Subclass 417/462 Working Holiday) qualify as temporary residents for taxation purposes, provided neither they nor their spouse are Australian citizens or permanent residents. Under these statutory provisions, temporary residents are fully exempt from Australian Capital Gains Tax (CGT) on the disposal of assets located outside Australia, such as foreign real estate, foreign equities, or mutual funds. Capital gains realized on foreign assets are non-taxable in Australia. Only "taxable Australian property" (such as Australian real estate) is subject to CGT during temporary residency. This record does not calculate Australian capital gains liabilities.'
  }),

  // ── 48. GERMANY CHANCENKARTE OPPORTUNITY CARD 20-HOUR WORK RIGHTS ──────────────
  createRecord({
    id: 'de-aufenthg-chancenkarte-secondary-work-rights',
    title: 'German Federal Residence Act: Opportunity Card (Chancenkarte) secondary employment and trial work rights (AufenthG § 20a)',
    topic: 'employment',
    jurisdiction: 'Germany',
    url: 'https://www.gesetze-im-internet.de/aufenthg_2004/__20a.html',
    quote: 'Eine Chancenkarte ist eine Aufenthaltserlaubnis zur Suche nach einer Erwerbstätigkeit oder nach Maßnahmen zur Anerkennung ausländischer Berufsqualifikationen.',
    summary: 'Under Section 20a of the German Residence Act (Aufenthaltsgesetz - AufenthG), the Opportunity Card (Chancenkarte) is a residence permit for seeking employment or measures for the recognition of foreign professional qualifications. It authorizes secondary employment as well as trial employment with prospective employers. Cardholders must have sufficient financial resources to secure their livelihood. This record outlines statutory residence rules in Germany; it does not compute Chancenkarte points or issue residence titles.'
  }),

  // ── 49. CANADA CRA MOVING EXPENSE DEDUCTION (ITA s.62) ─────────────────────────
  createRecord({
    id: 'cra-moving-expenses-relocation-deduction',
    title: 'CRA: Moving expenses deduction and 40-kilometre distance test',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-21900-moving-expenses.html',
    quote: 'To qualify, your new home must be at least 40 kilometres closer (by the shortest public route) to your new work location. You must establish your new home as the place where you normally live.',
    summary: 'Under CRA rules for moving expense deductions (Line 21900), taxpayers who move for work or business may deduct eligible moving expenses from employment or self-employment income earned at the new location. To qualify, your new home must be at least 40 kilometres closer (by the shortest public route) to your new work location, and you must establish the new home as where you normally live. This record does not calculate tax deductions.'
  }),

  // ── 50. ONTARIO HUMAN RIGHTS CODE RENTAL DISCRIMINATION BAN ───────────────────
  createRecord({
    id: 'ontario-ohrc-no-credit-history-discrimination-ban',
    title: 'Ontario Human Rights Commission: Prohibition of rental refusal based on lack of Canadian credit history or local guarantor',
    topic: 'housing',
    jurisdiction: 'ON',
    housingSubject: 'deposit',
    url: 'https://www.ohrc.on.ca/en/policy-human-rights-and-rental-housing',
    quote: 'A lack of rental or credit history should not be viewed negatively.',
    summary: 'Rental history, credit references and/or credit checks may be requested. A lack of rental or credit history should not be viewed negatively. A landlord can ask for income information, but they must also ask for and consider together any available information on rental history, credit references and credit checks (such as through Equifax Canada).'
  }),

  // ── 51. US USCIS 245(k) 180-DAY WORK VIOLATION EXEMPTION ──────────────────────
  createRecord({
    id: 'us-uscis-245k-status-violation-exemption',
    title: 'USCIS: Section 245(k) 180-day unauthorized work and status violation exemption for employment-based green cards (INA § 245(k))',
    topic: 'employment',
    jurisdiction: 'United States',
    url: 'https://www.uscis.gov/policy-manual/volume-7-part-b-chapter-8',
    quote: 'This exemption applies to an applicant who has not failed to maintain a lawful status, engaged in unauthorized employment, or violated the terms and conditions of his or her admission for an aggregate period exceeding 180 days.',
    summary: 'Under Immigration and Nationality Act (INA) Section 245(k) and USCIS Policy Manual Volume 7 Part B Chapter 8, applicants applying for Adjustment of Status under employment-based categories receive a statutory exemption from standard adjustment bars. This exemption applies to an applicant who has not failed to maintain a lawful status, engaged in unauthorized employment, or violated admission terms for an aggregate period exceeding 180 days following their most recent lawful admission to the United States. This record does not adjudicate adjustment applications.'
  }),

  // ── 52. UK RIGHT TO RENT 28-DAY STATUTORY EXCUSE & LCS ────────────────────────
  createRecord({
    id: 'uk-home-office-right-to-rent-statutory-excuse',
    title: 'Checking a tenant\'s right to rent in England: who you have to check and the Home Office document check',
    topic: 'housing',
    jurisdiction: 'United Kingdom',
    housingSubject: 'agreement',
    url: 'https://www.gov.uk/check-tenant-right-to-rent-documents',
    quote: 'Check with the Home Office if the tenant is a Commonwealth citizen but does not have the right documents - they might still have the right to rent in the UK.',
    summary: 'GOV.UK\'s Checking your tenant\'s right to rent guidance states that landlords must check that a tenant or lodger can legally rent a residential property in England, and that before the start of a new tenancy all tenants aged 18 and over must be checked, even if they are not named on the tenancy agreement, there is no tenancy agreement, or the agreement is not in writing. The page notes that the rules about private renting are changing and covers how to do a check, making copies of the documents, follow-up checks, and agents and subletting. For a tenant who is a Commonwealth citizen without the right documents, the page directs landlords to check with the Home Office, as they might still have the right to rent in the UK. This record does not conduct right-to-rent checks.'
  }),

  // ── 53. AUSTRALIA RECIPROCAL HEALTH CARE AGREEMENTS (RHCA) ────────────────────
  createRecord({
    id: 'au-services-australia-rhca-medicare-enrolment',
    title: "Services Australia: Country-specific reciprocal healthcare information for visitors",
    topic: 'health',
    jurisdiction: 'Australia',
    url: "https://www.servicesaustralia.gov.au/when-reciprocal-health-care-agreements-apply-and-you-visit-australia",
    quote: "Information for visitors to Australia on Reciprocal Health Care Agreements.",
    summary: "Services Australia provides country-specific reciprocal healthcare guidance for visitors from Belgium, Finland, Italy, Malta, the Netherlands, New Zealand, Norway, Ireland, Slovenia, Sweden and the United Kingdom. Visitors may qualify for medical care under Medicare; the relevant country page should be checked for its conditions. This directory does not establish individual eligibility, universal Medicare-card enrolment, a standard coverage package or student-visa insurance exemptions."
  }),

  // ── 54. GERMANY MIETPREISBREMSE MANDATORY PRIOR RENT DISCLOSURE ───────────────
  createRecord({
    id: 'de-bgb-mietpreisbremse-prior-rent-disclosure',
    title: 'German Civil Code: Mietpreisbremse 10% rent brake and mandatory written disclosure of previous rent (BGB § 556g)',
    topic: 'housing',
    jurisdiction: 'Germany',
    housingSubject: 'rent',
    url: 'https://www.gesetze-im-internet.de/bgb/__556g.html',
    quote: 'Soweit die Zulässigkeit der Miete auf § 556e oder § 556f beruht, ist der Vermieter verpflichtet, dem Mieter vor dessen Abgabe der Vertragserklärung über Folgendes unaufgefordert Auskunft zu erteilen',
    summary: 'Under Section 556d through Section 556g of the German Civil Code (Bürgerliches Gesetzbuch - BGB), residential tenancies in designated tight housing markets (including Berlin, Munich, Hamburg, and Frankfurt) are strictly subject to the rent brake (Mietpreisbremse). In new residential lease agreements, the agreed cold rent (Kaltmiete) cannot exceed the local comparative reference rent (Mietspiegel) by more than ten percent. While landlords may charge a higher rent if the immediately preceding tenant lawfully paid that higher amount (Vormiete exception under § 556e BGB), Section 556g(1a) BGB mandates that the landlord must provide unprompted, written disclosure of the exact prior rent to the prospective tenant BEFORE the lease agreement is signed. If the landlord fails to provide this prior rent disclosure in writing, they are legally barred from claiming the previous rent exception and the tenant can demand an immediate retroactive rent reduction. This record does not calculate Mietspiegel indices.'
  })
];
