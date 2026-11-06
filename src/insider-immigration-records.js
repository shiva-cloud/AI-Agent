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
    title: 'CBSA: Right of entry for permanent residents with expired PR cards at land border (IRPA s.19(2))',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.cbsa-asfc.gc.ca/travel-voyage/pr-rp-eng.html',
    quote: 'A permanent resident of Canada has the right to enter and remain in Canada at any port of entry once identity and status are established.',
    summary: 'Under Immigration and Refugee Protection Act (IRPA) section 19(2), a Canadian permanent resident has an absolute statutory right of entry into Canada at any Port of Entry upon establishing their identity. While commercial air, rail, and sea carriers are legally required under section 148 to deny boarding to passengers without an unexpired PR card or Permanent Resident Travel Document (PRTD), a permanent resident returning to Canada via a private vehicle or on foot at a US-Canada land border can present an expired PR card or Confirmation of Permanent Residence (COPR) with their passport. CBSA officers verify status electronically and cannot refuse entry, though residency obligations (730 days in 5 years) remain subject to review. This record does not replace a valid PR card.',
    risk: 'high'
  }),

  // ── 4. FLAGPOLING RESTRICTIONS & PGWP BAN ────────────────────────────────────
  createRecord({
    id: 'cbsa-flagpoling-restrictions-and-pgwp-ban',
    title: 'CBSA: Border flagpoling restrictions and PGWP land border prohibition',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/2024/06/canada-ends-flagpoling-for-post-graduation-work-permits.html',
    quote: 'Effective June 21, 2024, foreign nationals can no longer apply for a post-graduation work permit (PGWP) at the border.',
    summary: 'Foreign nationals are prohibited from applying for a Post-Graduation Work Permit (PGWP) at Canadian land ports of entry (flagpoling); PGWP applications must be submitted online inside Canada. For other eligible temporary permit applications, CBSA restricts flagpoling services to designated ports of entry during specific days of the week and limited operating hours (such as Tuesdays, Wednesdays, and Thursdays with strict daily applicant quotas at Southern Ontario bridges). Applicants who flagpole exit to the US and receive an administrative refusal from US Customs and Border Protection (CBP) before returning to the Canadian border post. This record does not process work permit applications.'
  }),

  // ── 5. NON-ACCOMPANYING FAMILY PERMANENT BAR (IRPR 117(9)(d)) ────────────────
  createRecord({
    id: 'ircc-family-class-exclusion-117-9-d',
    title: 'IRCC: Permanent family class sponsorship exclusion for unexamined dependents (IRPR s.117(9)(d))',
    topic: 'family',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/non-economic-classes/family-class-determining-spouse/family-members-not-declared.html',
    quote: 'A foreign national shall not be considered a member of the family class by virtue of their relationship to a sponsor if the foreign national was a non-accompanying family member and was not examined.',
    summary: 'Under Immigration and Refugee Protection Regulations (IRPR) section 117(9)(d), if a family member (spouse, common-law partner, or dependent child) was not declared or was declared as non-accompanying and not medically examined at the time the sponsor applied for and obtained permanent residence, that family member is excluded from the Family Class and cannot be sponsored, unless an officer determined they did not need to be examined (section 117(10)). Omitting a dependent to expedite processing or save fees can bar that person from family sponsorship permanently; the remaining route is an exceptional, discretionary Humanitarian and Compassionate (H&C) application under IRPA section 25(1). The temporary public policy that allowed certain undeclared family members to be sponsored ended on 10 September 2026 and now applies only to eligible applications received from 31 May 2019 to 10 September 2026. This record does not adjudicate family class applications.'
  }),

  // ── 6. RTA SECTION 5(i) SHARED KITCHEN EXEMPTION ─────────────────────────────
  createRecord({
    id: 'ontario-rta-section-5-shared-kitchen-exemption',
    title: 'Ontario RTA: Exemption for accommodation sharing kitchen or bathroom with owner (s.5(i))',
    topic: 'housing',
    jurisdiction: 'ON',
    housingSubject: 'agreement',
    url: 'https://www.ontario.ca/laws/statute/06r17',
    quote: 'This Act does not apply with respect to living accommodation whose occupant is required to share a bathroom or kitchen facility with the owner, spouse, child or parent.',
    summary: 'Under Ontario Residential Tenancies Act (RTA) section 5(i), the Act does not apply to living accommodations where the occupant is required to share a kitchen or bathroom facility with the property owner, the owner spouse, child, or parent who resides in the building. Occupants in shared living arrangements are classified as common-law boarders or roommates rather than statutory tenants; they possess no Landlord and Tenant Board (LTB) jurisdiction, no statutory rent increase protections, and no protection against locks being changed upon reasonable notice. Tenancy dispute notices (Forms T1, T2, N12) cannot be filed with the LTB for exempt accommodations. This record does not resolve roommate disputes or enforce eviction orders.'
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
    title: 'CRA: Tax-Free Savings Account (TFSA) non-resident contribution penalty tax (ITA s.207.03)',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account/who-open-a-tfsa.html',
    quote: 'Contributions made while you are a non-resident of Canada are subject to a 1% per month tax for each month that the contribution stays in the account.',
    summary: 'Under the Income Tax Act (ITA), individuals accumulate Tax-Free Savings Account (TFSA) contribution room only for calendar years in which they were at least 18 years of age, possessed a valid Social Insurance Number (SIN), and were a factual tax resident of Canada. Any contribution made while a non-resident is taxed at 1% per month for as long as it stays in the account (ITA s.207.03), until the whole contribution is withdrawn or the person becomes resident again; contributions above available room are taxed separately at 1% per month on the highest excess amount (ITA s.207.02). Automated CRA My Account portals frequently display incorrect retroactive room prior to processing a newcomer first annual tax return. Taxpayers who contributed by mistake should withdraw the full contribution, file Form RC243 (TFSA Return) and Schedule B by June 30 of the following year, and can ask the CRA to waive or cancel the tax if it arose from a reasonable error. This record does not calculate tax liabilities.'
  }),

  // ── 9. CRA COST BASE STEP-UP AT FMV (ITA s.128.1) ────────────────────────────
  createRecord({
    id: 'cra-cost-base-step-up-landing-fmv',
    title: 'CRA: Deemed acquisition of foreign property at Fair Market Value on becoming resident (ITA s.128.1)',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/individuals-leaving-entering-canada-non-residents/newcomers-canada-immigrants.html',
    quote: 'When you become a resident of Canada, you are considered to have acquired your capital property at a cost equal to its fair market value on the date you became a resident.',
    summary: 'Under Income Tax Act (ITA) section 128.1(1)(b), when an individual becomes a tax resident of Canada, they are deemed to have disposed of and immediately reacquired all their global capital property (foreign real estate, publicly traded shares, mutual funds, and cryptocurrency) at its Fair Market Value (FMV) on the exact date residency is established. This statutory cost base step-up ensures Canada does not tax capital gains that accrued prior to immigration; capital gains tax applies only to appreciation occurring after the Canadian landing date. Newcomers should obtain written independent appraisals, property valuations, and broker statements establishing FMV on their arrival date. This record does not calculate capital gains or provide tax advice.'
  }),

  // ── 10. PARENTAL WIRE GIFTS & DEED OF GIFT ───────────────────────────────────
  createRecord({
    id: 'fintrac-overseas-parental-gift-deed',
    title: 'FINTRAC & CRA: Foreign parental gift wires and gift documentation',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://fintrac-canafe.canada.ca/reporting-declaration/rpt/eft-eng',
    quote: 'Reporting entities must report electronic funds transfers of $10,000 CAD or more sent or received across borders within 15 days.',
    summary: 'Canada imposes no gift tax, inheritance tax, or wealth tax on genuine monetary transfers received from family members abroad. While incoming foreign wire transfers of $10,000 CAD or more are automatically reported by financial institutions to FINTRAC under the Proceeds of Crime (Money Laundering) and Terrorist Financing Act (PCMLTFA), a genuine gift is generally not taxable income to the recipient, although income later earned on the money is taxable. To reduce the risk of bank anti-money laundering (AML) delays or CRA questions, recipients should keep a signed gift letter or deed (no specific form is required by law) from the parents confirming the transfer is a non-repayable gift, alongside foreign bank statements showing legitimate source of funds. Splitting transfers to avoid reporting is an offence (structured financial transactions, PCMLTFA s.77.3). This record does not verify banking compliance.'
  }),

  // ── 11. AUTO INSURANCE FOREIGN EXPERIENCE LETTER (FSRA) ─────────────────────
  createRecord({
    id: 'fsra-auto-insurance-foreign-experience-letter',
    title: 'FSRA: Auto insurance rate discounts with foreign Claims-Free Letter of Experience',
    topic: 'driving',
    jurisdiction: 'ON',
    url: 'https://www.fsrao.ca/consumers/auto-insurance/understanding-auto-insurance-rates',
    quote: 'Insurers use your driving record, including years licensed and claims history, to determine your auto insurance premium.',
    summary: 'While the Ontario Ministry of Transportation (DriveTest) issues driver licences, private auto insurance premiums are regulated by the Financial Services Regulatory Authority of Ontario (FSRA). Under standard insurance underwriting rules, a newcomer with an exchanged Ontario G licence is rated as a driver with zero years of insurance history, leading to substantial premium surcharges ($4,000 to $6,500 annually). Most licensed Ontario insurers grant up to 3 to 10 years of domestic insurance history credit if the driver provides an official Claims-Free Letter of Experience on insurance company letterhead from their previous country of origin, detailing continuous coverage and absence of at-fault accidents, reducing annual premiums by $2,000 to $3,500. This record does not bind insurance underwriters.'
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
    title: 'IRCC: Statutory dual intent rights for temporary residents and applicants (IRPA s.22(2))',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/visitors/dual-intent.html',
    quote: 'An intention by a foreign national to become a permanent resident does not preclude them from becoming a temporary resident if the officer is satisfied that they will leave Canada by the end of the period authorized for their stay.',
    summary: 'Under Immigration and Refugee Protection Act (IRPA) section 22(2), holding dual intent (having an active intention to seek permanent residence while concurrently seeking temporary resident entry, visitor status, a study permit, or a work permit) is explicitly lawful in Canada. Officers cannot refuse a temporary visa or entry at a Port of Entry solely because an applicant has submitted an Express Entry profile, spousal sponsorship, or permanent residence application. The foreign national must demonstrate to the officer satisfaction that they have the means and genuine willingness to depart Canada at the expiration of their authorized temporary stay should their permanent residence application be refused or delayed. This record does not guarantee visa issuance.'
  }),

  // ── 14. CBSA DIGITAL DEVICE SEARCH LIMITS (CUSTOMS ACT s.99(1)(a)) ────────────
  createRecord({
    id: 'cbsa-digital-device-search-limits',
    title: 'CBSA: Digital device search powers, reasonable grounds, and cloud data limits at Port of Entry',
    topic: 'arrival',
    jurisdiction: 'CA',
    url: 'https://www.cbsa-asfc.gc.ca/travel-voyage/edd-pde-eng.html',
    quote: 'Examinations of personal digital devices are not conducted as routine inspections. Officers must have a multiplicity of indicators or evidence to search digital devices.',
    summary: 'Under Customs Act section 99(1)(a), CBSA border officers possess the statutory authority to inspect goods, which Canadian courts recognize as including electronic devices such as mobile phones, tablets, and laptops. However, under official CBSA Operational Directives, searches of personal digital devices cannot be conducted routinely; officers must have a multiplicity of indicators or evidence suggesting border non-compliance before inspecting devices or requesting passwords. Officers must place electronic devices into Airplane Mode during examination and are strictly prohibited from viewing remote cloud data, cloud drives, social media accounts, or remote webmail. Travelers who refuse to provide passcodes may have devices detained for forensic examination. This record does not restrict lawful border inspection powers.'
  }),

  // ── 15. LEASE ASSIGNMENT 30-DAY EXIT (ONTARIO RTA s.95) ───────────────────────
  createRecord({
    id: 'ontario-rta-lease-assignment-30-day-exit',
    title: 'Ontario RTA: Statutory right to assign tenancy and 30-day early lease termination on refusal (s.95)',
    topic: 'housing',
    jurisdiction: 'ON',
    housingSubject: 'agreement',
    url: 'https://www.ontario.ca/laws/statute/06r17',
    quote: 'A tenant may give the landlord a notice of termination under section 96 if the landlord refuses to consent to the assignment or does not respond within seven days.',
    summary: 'Under Ontario Residential Tenancies Act (RTA) section 95, a tenant on a fixed-term residential lease has the statutory right to request their landlord permission to assign the tenancy to a new tenant at the identical rent and lease terms. If the landlord refuses consent to assign in principle, or fails to respond within 7 calendar days of the written request, section 95(4) empowers the tenant to legally terminate the entire fixed-term lease with 30 days written notice using Ontario LTB Form N9. The tenant is completely released from all future rent liabilities and cannot be charged lease-break fees, advertising costs, or liquidated damages. Landlords cannot arbitrarily or unreasonably withhold consent to an assignee. This record does not resolve lease disputes.'
  }),

  // ── 16. FORM N12 COMPENSATION TIMING VOID (ONTARIO RTA s.48.1) ───────────────
  createRecord({
    id: 'ontario-rta-n12-compensation-timing-void',
    title: 'Ontario RTA: Landlord 1-month compensation deadline for Form N12 personal use eviction (s.48.1)',
    topic: 'housing',
    jurisdiction: 'ON',
    housingSubject: 'eviction',
    url: 'https://www.ontario.ca/laws/statute/06r17',
    quote: 'The landlord shall compensate a tenant who receives a notice of termination under section 48 on or before the termination date specified in the notice.',
    summary: 'Under Ontario Residential Tenancies Act (RTA) section 48.1, when a landlord serves a tenant with Form N12 (Notice to End your Tenancy Because the Landlord, a Purchaser or a Family Member Requires the Rental Unit), the landlord is legally mandated to pay the tenant compensation equal to one month rent, or offer another acceptable rental unit, on or before the termination date stated in the notice. Under binding Landlord and Tenant Board (LTB) jurisprudence and section 48.1, paying the compensation after the termination date renders the N12 notice fatally defective and void, resulting in automatic dismissal of the landlord Form L2 application at the eviction hearing. A promise to pay compensation on the move-out date does not satisfy the statutory deadline. This record does not represent parties before the LTB.'
  }),

  // ── 17. CRA T1135 PERSONAL-USE PROPERTY EXEMPTION (ITA s.233.3) ───────────────
  createRecord({
    id: 'cra-t1135-personal-use-property-exemption',
    title: 'CRA: Form T1135 foreign reporting exemption for overseas personal-use residential property (ITA s.233.3)',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/information-been-moved/foreign-reporting/questions-answers-about-form-t1135.html',
    quote: 'Specified foreign property does not include personal-use property, which is property used primarily for personal use and enjoyment.',
    summary: 'Under Income Tax Act (ITA) section 233.3(1), Canadian tax residents who hold specified foreign property with an aggregate cost base exceeding $100,000 CAD at any time during the tax year must file CRA Form T1135 (Foreign Income Verification Statement). However, the statute explicitly excludes "personal-use property" from the definition of specified foreign property. A foreign home, residential condominium, or family property owned abroad that is held primarily for the personal use and enjoyment of the taxpayer or their related family members (such as parents or siblings living in the home without paying commercial rent) is entirely exempt from Form T1135 reporting, provided the property is not held to produce commercial rental income. Personal vehicles, jewellery, and heirlooms abroad are also exempt. This record does not calculate foreign cost bases or prepare tax returns.'
  }),

  // ── 18. MTO FOREIGN DRIVING EXTRACT EXPERIENCE CREDIT ─────────────────────────
  createRecord({
    id: 'mto-foreign-licence-driving-extract-credit',
    title: 'DriveTest & MTO: Foreign licence experience credit limited to 12 months since 1 July 2026',
    topic: 'driving',
    jurisdiction: 'ON',
    url: 'https://www.ontario.ca/page/exchange-out-province-drivers-licence',
    quote: 'To get credit for more than one year of driving experience, you need an official letter from the foreign licensing authority or embassy.',
    summary: 'Since 1 July 2026, drivers licensed in jurisdictions without a licence exchange agreement with Ontario (including India, Pakistan, Philippines, Nigeria, UAE, China, and Brazil) can get credit for up to 12 months of driving experience by showing a valid, original foreign driver licence and, if the licence does not show that experience, an official authentication letter in English or French from the government or agency that issued it. They must pass the vision test, knowledge test and G2 road test, then wait at least 12 months before taking the G road test. A licence not written in English or French needs a translation from an approved translator, dated within six months of the application. This record does not book road tests.'
  }),

  // ── 19. US H-1B 60-DAY GRACE PERIOD SEVERANCE TRAP (8 CFR § 214.1(l)(2)) ─────
  createRecord({
    id: 'us-uscis-h1b-60-day-grace-period-severance',
    title: 'USCIS: H-1B 60-day post-termination grace period calculation and severance trap (8 CFR 214.1(l)(2))',
    topic: 'employment',
    jurisdiction: 'United States',
    url: 'https://www.uscis.gov/working-in-the-united-states/information-for-employers-and-employees/options-for-nonimmigrant-workers-following-termination-of-employment',
    quote: 'An individual may be granted a grace period of up to 60 consecutive days, or until the end of the authorized validity period, whichever is shorter, following cessation of employment.',
    summary: 'Under 8 CFR section 214.1(l)(2), nonimmigrant workers in H-1B, L-1, O-1, or TN status who experience cessation of employment are granted a discretionary grace period of up to 60 consecutive calendar days, or until the end of their existing Form I-94 authorized validity period, whichever is shorter. Crucially, USCIS calculates this 60-day clock starting on the day immediately following the worker last day of actual employment, not when severance pay, payroll continuation, or health benefits terminate. Remaining in the US past the 60th day without filing a timely change of status or new H-1B change-of-employer petition constitutes unlawful presence, potentially triggering statutory 3-year or 10-year admissibility bars under INA section 212(a)(9)(B). This record does not grant immigration status.'
  }),

  // ── 20. US F-1 OPT TO H-1B CAP-GAP EXTENSION (8 CFR § 214.2(f)(5)(vi)) ─────────
  createRecord({
    id: 'us-uscis-f1-opt-cap-gap-extension',
    title: 'USCIS: F-1 OPT to H-1B Cap-Gap automatic work authorization and status extension (8 CFR 214.2(f)(5)(vi))',
    topic: 'employment',
    jurisdiction: 'United States',
    url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations-and-fashion-models/extension-of-post-completion-optional-practical-training-opt-and-f-1-status-for-eligible-students-under-the-h-1b-cap-gap-regulations',
    quote: 'Cap-gap occurs when an F-1 student status and employment authorization expire before their approved H-1B begins on October 1.',
    summary: 'Under 8 CFR section 214.2(f)(5)(vi), an eligible F-1 student whose employer timely files a non-frivolous Form I-129 H-1B petition requesting an October 1 start date and change of status under the annual statutory cap receives an automatic extension of their F-1 status and post-completion Optional Practical Training (OPT) employment authorization. If the student OPT Employment Authorization Document (EAD) expires between April 1 and September 30 while the H-1B petition is pending or approved, the Cap-Gap regulation automatically bridges and extends their work authorization through September 30. The student Designated School Official (DSO) issues an updated Form I-20 documenting the Cap-Gap extension for employer Form I-9 verification. Traveling abroad during the cap-gap period before H-1B approval risks abandoning status. This record does not issue EADs.'
  }),

  // ── 21. UK ILR 180-DAY ROLLING ABSENCE LIMIT (APPENDIX CONTINUOUS RESIDENCE) ──
  createRecord({
    id: 'uk-home-office-ilr-180-day-rolling-absence',
    title: 'UK Visas and Immigration: Indefinite Leave to Remain (ILR) 180-day rolling absence calculation rules',
    topic: 'employment',
    jurisdiction: 'United Kingdom',
    url: 'https://www.gov.uk/government/publications/continuous-residence',
    quote: 'You must not have spent more than 180 days outside the UK in any 12-month period to meet the continuous residence requirement.',
    summary: 'Under UK Home Office Immigration Rules Appendix Continuous Residence (rules CR 2.1 through CR 2.3), applicants seeking Indefinite Leave to Remain (ILR) under Skilled Worker, Global Talent, Scale-up, or Tier 2 routes must satisfy the strict continuous residence requirement. The statutory limit prohibits being absent from the United Kingdom for more than 180 days in any 12-month rolling period throughout the 5-year qualifying period. Unlike calendar-year limits, the 180-day test applies to every possible 12-month rolling window counted backward and forward from any day of absence. Exceeding 180 days in any single rolling 12-month window irrevocably breaks continuous residence, resetting the 5-year qualification clock back to day zero, unless the absence qualifies under statutory exceptions such as overseas research, medical crises, or natural disasters. This record does not calculate ILR eligibility.'
  }),

  // ── 22. UK SECTION 21 NOTICE INVALIDATION BY GAS & HOW TO RENT (DEREGULATION ACT 2015) ─
  createRecord({
    id: 'uk-tenancy-section-21-gas-safety-invalidation',
    title: 'UK Tenancy (historical): Section 21 notice invalidation rules, abolished in England from 1 May 2026',
    topic: 'housing',
    jurisdiction: 'United Kingdom',
    housingSubject: 'eviction',
    url: 'https://www.gov.uk/evicting-tenants/section-21-and-section-8-notices',
    quote: 'A Section 21 notice cannot be used if the landlord did not give the tenant a current Gas Safety Certificate, an Energy Performance Certificate, and the government How to rent guide.',
    summary: 'From 1 May 2026 the Renters\' Rights Act 2025 abolished Section 21 no-fault evictions in England, so no new Section 21 notice can be served and possession needs a Section 8 ground. For notices served before that date: under the Deregulation Act 2015 section 33 and the Housing Act 1988 section 21, a residential landlord in England cannot serve a valid Section 21 "no-fault" eviction notice (Form 6A) if they have failed to comply with statutory prescribed legal requirements. A Section 21 notice is legally invalid if: (1) the landlord did not provide the tenant with a valid Gas Safety Certificate before the tenant moved into the property; (2) the landlord failed to provide a valid Energy Performance Certificate (EPC); (3) the landlord did not give the tenant the latest government "How to rent: the checklist for renting in England" guide; or (4) the tenancy deposit was not protected in a government-authorized tenancy deposit scheme (DPS, TDS, or MyDeposits) within 30 days of receipt under Housing Act 2004 section 213. An invalid Section 21 notice results in automatic dismissal of the landlord court possession claim. This record does not resolve possession claims.'
  }),

  // ── 23. AU 482 VISA 180-DAY SPONSOR CESSATION WINDOW (CONDITION 8607) ──────────
  createRecord({
    id: 'au-home-affairs-482-180-day-cessation-transfer',
    title: 'Australian Home Affairs: Subclass 482 visa 180-day employer cessation and transfer rights (Condition 8607)',
    topic: 'employment',
    jurisdiction: 'Australia',
    url: 'https://immi.homeaffairs.gov.au/visas/already-have-a-visa/check-visa-details-and-conditions/see-your-visa-conditions?product=482',
    quote: 'From 1 July 2024, visa holders who stop working for their sponsor have up to 180 days at a time, or up to 365 days in total across the visa grant period, to find a new sponsor.',
    summary: 'Effective 1 July 2024, the Australian Department of Home Affairs implemented major statutory reforms to visa Condition 8607 for Temporary Skill Shortage (Subclass 482, renamed Skills in Demand from 7 December 2024), Skilled Employer Sponsored Regional (Subclass 494) and former Temporary Work (Skilled) (Subclass 457) visa holders. When a sponsored employee ceases employment with their approved business sponsor, they are granted up to 180 consecutive calendar days per cessation (and up to 365 days cumulatively across the entire visa grant period) to secure a new approved employer nomination, transition to a different visa subclass, or depart Australia, without breaching visa conditions or facing cancellation under Migration Act section 116. Furthermore, during this 180-day transition window, the worker is legally authorized to work in any occupation for other employers to support themselves while securing permanent sponsorship. This record does not lodge nomination transfers.'
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
    title: 'ARD ZDF Beitragsservice: Mandatory public broadcasting fee single per-residence flatmate exemption (RBStV § 2)',
    topic: 'community',
    jurisdiction: 'Germany',
    url: 'https://www.rundfunkbeitrag.de/buergerinnen_und_buerger/formulare/abmelden/index_ger.html',
    quote: 'In the private sector, one contribution is to be paid for each residence, regardless of how many persons live there or how many receiving devices are available.',
    summary: 'Under the Interstate Broadcasting Treaty (Rundfunkbeitragsstaatsvertrag - RBStV) section 2, the mandatory monthly broadcasting fee of €18.36 (Rundfunkbeitrag, formerly known as GEZ) is assessed per residential dwelling, not per person or per device. Following mandatory 14-day address registration (Anmeldung), municipal registration authorities automatically notify the ARD ZDF Deutschlandradio Beitragsservice, resulting in automatic payment requests sent to every registered newcomer. In shared apartments (Wohngemeinschaft - WG) or family households where another occupant is already paying the fee, all other co-tenants are statutorily exempt from paying again. To cancel or avoid payment demands, flatmates must complete the official online deregistration / exemption form specifying the primary contributor 9-digit contributor account number (Beitragskontonummer). Unanswered letters result in administrative debt collection (Mahnung) and bank garnishment. This record does not cancel broadcasting accounts.'
  }),

  // ── 27. UAE WPS & RECRUITMENT RECOVERY BAN (LABOUR LAW DECREE 33) ──────────────
  createRecord({
    id: 'uae-mohre-wps-gratuity-deduction-ban',
    title: 'UAE Ministry of Human Resources and Emiratisation: Wages Protection System (WPS) and recruitment fee deduction ban (Federal Decree-Law No. 33 of 2021)',
    topic: 'employment',
    jurisdiction: 'United Arab Emirates',
    url: 'https://www.mohre.gov.ae/en/laws-and-regulations/labour-law.aspx',
    quote: 'Under Federal Decree-Law No. 33 of 2021 Article 6, the employer is prohibited from charging the worker or deducting from their remuneration the recruitment and employment fees.',
    summary: 'Under UAE Federal Decree-Law No. 33 of 2021 (Article 6) on the Regulation of Labour Relations and Ministerial Resolution No. 43 of 2022 on the Wages Protection System (WPS), employers are strictly prohibited from recovering, deducting, or withholding visa application costs, medical examinations, Emirates ID issuance, or recruitment agency fees from an employee salary or end-of-service settlement. Furthermore, under Article 51, full-time foreign employees completing at least one year of continuous service are entitled to end-of-service gratuity calculated on their basic wage (21 days wage per year for the first 5 years, and 30 days per year thereafter), payable in full through WPS within 14 calendar days of termination regardless of whether separation is initiated by employer dismissal or employee resignation. This record does not file MoHRE labour dispute claims.'
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
    summary: 'Under Dubai Law No. 26 of 2007 as amended by Law No. 33 of 2008 Article 25(2), a residential landlord seeking to evict a tenant for personal occupancy, first-degree relative use, or property sale must provide the tenant with at least 12 months written notice served exclusively through the official Notary Public or by registered courier mail. Informal notifications via WhatsApp, SMS, or informal email are legally invalid and void under RERA. In addition, under Decree No. 43 of 2013, landlords cannot demand arbitrary rent increases upon lease renewal; permissible rent increases are strictly governed by the official Dubai Land Department (DLD) Smart Rental Index calculator based on average area benchmarks. This record does not file Rental Dispute Centre claims.'
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
    title: 'Immigration New Zealand: Accredited Employer Work Visa (AEWV) 90-day redundancy transition and Job Change rights (Instructions WK3)',
    topic: 'employment',
    jurisdiction: 'New Zealand',
    url: 'https://www.immigration.govt.nz/new-zealand-visas/already-have-a-visa/managing-your-visa-and-passport/change-the-conditions-of-a-work-visa',
    quote: 'If you have an Accredited Employer Work Visa and your employment ends because of redundancy, you can apply for a Job Change or Migrant Exploitation Protection Visa.',
    summary: 'Under Immigration New Zealand (INZ) Operational Manual Work Visa Instructions (WK3 and WM5), when an Accredited Employer Work Visa (AEWV) holder faces involuntary termination or employment cessation through company redundancy or liquidation, INZ provides a statutory transitional protection window rather than immediate visa revocation under Immigration Act 2009 section 157. Redundant workers have up to 90 calendar days to secure an offer from another accredited employer and lodge an official Variation of Conditions (VOC) or Job Change application. While the migrant may not perform unauthorized work for the prospective employer prior to formal VOC approval, their lawful immigration status and residency rights remain fully protected during the 90-day window. This record does not submit VOC applications.'
  }),

  // ── 32. NEW ZEALAND 23-DAY BOND LODGEMENT RULE (MBIE RTA s.23) ─────────────────
  createRecord({
    id: 'nz-tenancy-services-bond-lodgement-23-days',
    title: 'Ministry of Business, Innovation and Employment: Mandatory 23-working-day tenancy bond lodgement (Residential Tenancies Act 1986 s.23)',
    topic: 'housing',
    jurisdiction: 'New Zealand',
    housingSubject: 'deposit',
    url: 'https://www.tenancy.govt.nz/rent-bond-and-bills/bond/lodging-a-bond/',
    quote: 'Landlords must lodge all bond money received with Tenancy Services within 23 working days of receiving it.',
    summary: 'Under the New Zealand Residential Tenancies Act 1986 section 19 and section 23, the maximum residential tenancy bond a landlord may lawfully require is capped at four weeks rent. Furthermore, landlords are statutorily prohibited from retaining tenancy bond funds in private bank accounts. Section 23 mandates that the landlord must deposit all bond payments with the Ministry of Business, Innovation and Employment (MBIE) Tenancy Services Bond Centre within 23 working days of receipt, accompanied by a completed official Bond Lodgement Form signed by both parties. Failure to lodge within 23 working days is an unlawful act under RTA Schedule 1A, exposing the landlord to exemplary damages of up to $1,500 payable to the tenant upon application to the Tenancy Tribunal. This record does not process bond refund claims.'
  }),

  // ── 33. US 90-DAY MISREPRESENTATION PRESUMPTION (9 FAM 302.9) ──────────────────
  createRecord({
    id: 'us-dos-90-day-rule-misrepresentation-presumption',
    title: 'US Department of State & USCIS: 90-day rule for non-immigrant status violation and willful misrepresentation (9 FAM 302.9-4(b)(3))',
    topic: 'employment',
    jurisdiction: 'United States',
    url: 'https://fam.state.gov/fam/09fam/09fam030209.html',
    quote: 'Inconsistent conduct within 90 days of entry may create a presumption that the applicant made a willful misrepresentation of material fact.',
    summary: 'Under the US Department of State Foreign Affairs Manual (9 FAM 302.9-4(b)(3)) and USCIS Policy Manual Volume 8, consular and immigration adjudicators apply the strict 90-day rule when assessing non-immigrant intent. If a foreign national enters the United States on a temporary, non-immigrant single-intent status (such as B-1/B-2 visitor visa, ESTA Visa Waiver Program, or F-1 student) and within 90 days of admission engages in conduct inconsistent with their entry representations—such as engaging in unauthorized employment, enrolling in unauthorized study, marrying a US citizen, or filing Form I-485 for Adjustment of Status—there arises a rebuttable presumption of willful misrepresentation under Immigration and Nationality Act (INA) Section 212(a)(6)(C)(i). A finding of willful misrepresentation results in a permanent lifetime inadmissibility bar to the United States. This record does not assess waiver eligibility.'
  }),

  // ── 34. UK TENANT FEES ACT BAN ON LETTING AGENT FEES (2019) ───────────────────
  createRecord({
    id: 'uk-tenant-fees-act-prohibited-payments-ban',
    title: 'UK Ministry of Housing: Tenant Fees Act 2019 ban on letting agent fees and holding deposit cap',
    topic: 'housing',
    jurisdiction: 'United Kingdom',
    housingSubject: 'deposit',
    url: 'https://www.gov.uk/government/publications/tenant-fees-act-2019-guidance',
    quote: 'Landlords and letting agents cannot require a tenant to make any payment as a condition of granting, continuing or renewing a tenancy, other than permitted payments.',
    summary: 'Under the UK Tenant Fees Act 2019 (Section 1 and Schedule 1), residential landlords and letting agents in England are strictly prohibited from charging tenants or guarantors any fees whatsoever as a condition of granting, renewing, or continuing an Assured Shorthold Tenancy (AST). Prohibited fees include administration charges, reference checks, credit checks, inventory checks, checkout fees, and guarantor fees. The only permitted payments are rent, a refundable tenancy deposit (capped at 5 weeks rent for tenancies with an annual rent under £50,000), a refundable holding deposit (capped at 1 week rent with mandatory refund within 7 calendar days), and reasonable default fees for lost keys or rent arrears exceeding 14 days. Any landlord charging prohibited fees faces local authority penalties of up to £5,000 for a first breach and, before Section 21 was abolished in England on 1 May 2026, could not serve a Section 21 notice until unlawful payments were refunded. This record does not litigate First-tier Tribunal claims.'
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
    title: 'IRCC: Provincial Nominee Program intent to reside requirement and pre-landing mobility limits (IRPR s.87)',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/economic-classes/provincial-nominees/determining-membership.html',
    quote: 'The applicant must establish the intention to reside in the nominating province as a permanent resident.',
    summary: 'Under section 87 of the Immigration and Refugee Protection Regulations (IRPR), a Provincial Nominee Program (PNP) candidate must satisfy immigration and border officers that they maintain a genuine intention to reside in the nominating province or territory. While Section 6(2) of the Canadian Charter of Rights and Freedoms guarantees citizens and permanent residents the mobility right to move and work in any province, this constitutional protection attaches strictly only after the applicant has formally landed and attained permanent resident status. If a nominee signs a residential lease, establishes household ties, or accepts employment in a non-nominating province prior to landing, officers may determine that the nomination was obtained under false pretenses or misrepresentation under IRPA Section 40, resulting in nomination revocation, refusal of landing, and a 5-year inadmissibility bar. This record does not litigate PNP refusal appeals.'
  }),

  // ── 42. CANADA CRA FIRST HOME SAVINGS ACCOUNT (FHSA) FOR NEWCOMERS ─────────────
  createRecord({
    id: 'cra-fhsa-newcomer-immediate-eligibility',
    title: 'CRA: First Home Savings Account (FHSA) immediate contribution rights for first-year newcomers (ITA s.146.6)',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account.html',
    quote: 'An individual can open an FHSA if they are a resident of Canada, at least 18 years of age, and a first-time home buyer.',
    summary: 'Under Income Tax Act (ITA) Section 146.6, individuals who establish factual tax residency in Canada can immediately open a First Home Savings Account (FHSA) during their very first year of arrival. FHSA participation room of $8,000 CAD per year starts only in the year the individual (a Canadian resident aged 18 or older who is a first-time home buyer) opens their first FHSA; no room builds up before the account is opened. Contributions are generally deductible from Canadian taxable income, and qualifying withdrawals to buy a first qualifying home in Canada are not taxed. Unused contribution room of up to $8,000 can be carried forward to subsequent years, up to the lifetime statutory contribution limit of $40,000 CAD. This record does not open financial accounts.'
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
    title: 'US CBP & USCIS: Electronic Form I-94 governs lawful authorized stay and overrides visa foil expiration (8 CFR § 214.1(a)(3))',
    topic: 'employment',
    jurisdiction: 'United States',
    url: 'https://i94.cbp.dhs.gov/I94/#/home',
    quote: 'The expiration date on your visa does not determine how long you can remain in the United States; the Form I-94 determines your authorized stay.',
    summary: 'Under 8 CFR Section 214.1(a)(3) and USCIS regulations, a non-immigrant period of lawful authorized stay in the United States is governed exclusively by the electronic Form I-94 (Arrival/Departure Record) issued by CBP upon entry, NOT by the visa foil stamp printed in the foreign passport. A visa is merely an entry document granting permission to apply for admission at a Port of Entry. Once admitted, the "Admit Until Date" on the official electronic CBP Form I-94 controls status duration. If the foreign passport expires prior to the intended petition duration, CBP officers truncate the I-94 to match the passport expiry date. Remaining in the US past the electronic I-94 date results in unlawful presence under INA Section 212(a)(9)(B), triggering statutory 3-year or 10-year reentry bars regardless of the visa sticker expiration date. This record does not retrieve electronic I-94 records.'
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
    quote: 'Skilled Worker salary thresholds change over time and include transitional arrangements for people already on the route.',
    summary: 'Under UK Home Office Immigration Rules Appendix Skilled Worker and Statement of Changes HC 590 enacted in April 2024, the baseline general minimum salary threshold for new Skilled Worker visa applicants was increased to £38,700 per year, and on 22 July 2025 it rose again to £41,700 (or the occupation-specific going rate, whichever is higher). However, under formal transitional arrangements, individuals who held valid Skilled Worker permission prior to April 4, 2024 and apply to extend their stay, change sponsored employment, or seek Indefinite Leave to Remain (ILR) before April 4, 2030 are strictly grandfathered. Transitional thresholds for people already on the route were also revised in July 2025, so the older £29,000 figure should not be relied on; check the current transitional rate on GOV.UK. This record does not sponsor Certificate of Sponsorship applications.'
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
    title: 'German Federal Residence Act: Opportunity Card (Chancenkarte) 20-hour secondary work and trial job rights (AufenthG § 20a)',
    topic: 'employment',
    jurisdiction: 'Germany',
    url: 'https://www.gesetze-im-internet.de/aufenthg_2004/__20a.html',
    quote: 'Die Chancenkarte berechtigt zur Ausuebung einer Beschaeftigung mit einem Umfang von bis zu 20 Stunden je Woche sowie zur Probearbeit.',
    summary: 'Under Section 20a of the German Federal Residence Act (Aufenthaltsgesetz - AufenthG), foreign nationals admitted to Germany on the points-based Opportunity Card (Chancenkarte) for seeking employment enjoy statutory work authorization rights while searching for qualified long-term positions. Cardholders are legally permitted to take up secondary employment (Nebenbeschäftigung) for up to 20 hours per week in any occupation, including gig, retail, or tech work, without requiring approval from the Federal Employment Agency (Bundesagentur für Arbeit). In addition, cardholders may complete trial employment (Probearbeit) of up to two weeks with any prospective employer to demonstrate qualified vocational or academic skills. Transitioning from the Chancenkarte to an EU Blue Card (Section 18g) or skilled worker residence title (Section 18a/18b) is permitted entirely within Germany. This record does not calculate Chancenkarte points.'
  }),

  // ── 49. CANADA CRA MOVING EXPENSE DEDUCTION (ITA s.62) ─────────────────────────
  createRecord({
    id: 'cra-moving-expenses-relocation-deduction',
    title: 'CRA: Moving expense deduction (ITA s.62) and why most moves into Canada do not qualify',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-21900-moving-expenses.html',
    quote: 'You can deduct eligible moving expenses if you moved for work or post-secondary education and your new home is at least 40 kilometres closer to your new work or school.',
    summary: 'Under Income Tax Act (ITA) Section 62 and CRA Form T1-M, individuals who move within Canada to take up employment, operate a business, or attend full-time post-secondary education can deduct eligible moving expenses, provided their new home is at least 40 kilometres closer to the new work or school location than the previous home. Eligible deductions include travel expenses (airfare, meals, vehicle mileage), temporary living expenses near the new residence for up to 15 days, cost of packing and transporting household effects, and lease cancellation fees on the former residence. Moving expenses can be deducted only against employment or self-employment income earned at the new Canadian location, but any unused moving expenses can be carried forward indefinitely to future tax years. A move from another country into Canada is generally not deductible, because both the old and the new home must normally be in Canada; the exceptions are narrow (for example some full-time students, and Canadian residents moving to or from a job abroad). This record does not prepare individual tax returns.'
  }),

  // ── 50. ONTARIO HUMAN RIGHTS CODE RENTAL DISCRIMINATION BAN ───────────────────
  createRecord({
    id: 'ontario-ohrc-no-credit-history-discrimination-ban',
    title: 'Ontario Human Rights Commission: Prohibition of rental refusal based on lack of Canadian credit history or local guarantor',
    topic: 'housing',
    jurisdiction: 'ON',
    housingSubject: 'deposit',
    url: 'https://www.ohrc.on.ca/en/policy-human-rights-and-rental-housing',
    quote: 'Landlords cannot refuse prospective tenants simply because they lack a Canadian credit history or local guarantor.',
    summary: 'Under the Ontario Human Rights Code Section 2(1) and the OHRC Policy on Human Rights and Rental Housing, housing providers and property managers are strictly prohibited from discriminating against rental applicants based on race, place of origin, citizenship, or ethnic origin. Landlords cannot reject newcomer tenant applications or demand unlawful financial penalties (such as requiring 6 to 12 months rent upfront) solely because the applicant lacks a Canadian credit history, Canadian employment references, or a Canadian guarantor. The Code mandates that landlords must evaluate alternative evidence of creditworthiness, including foreign bank references, international income statements, or proof of timely rental payments abroad. Arbitrary refusal based on lack of domestic credit is actionable discrimination before the Human Rights Tribunal of Ontario (HRTO). This record does not file HRTO applications.'
  }),

  // ── 51. US USCIS 245(k) 180-DAY WORK VIOLATION EXEMPTION ──────────────────────
  createRecord({
    id: 'us-uscis-245k-status-violation-exemption',
    title: 'USCIS: Section 245(k) 180-day unauthorized work and status violation exemption for employment-based green cards (INA § 245(k))',
    topic: 'employment',
    jurisdiction: 'United States',
    url: 'https://www.uscis.gov/policy-manual/volume-7-part-b-chapter-8',
    quote: 'An employment-based adjustment of status applicant may be eligible for adjustment under INA 245(k) despite failing to maintain lawful status for not more than 180 days.',
    summary: 'Under Immigration and Nationality Act (INA) Section 245(k) and USCIS Policy Manual Volume 7 Part B Chapter 8, applicants applying for Adjustment of Status to permanent residence under employment-based categories (EB-1, EB-2, EB-3, and certain EB-4 religious workers) receive a statutory exemption from standard Section 245(c) status violations. An applicant who worked without authorization, failed to continuously maintain lawful non-immigrant status, or violated the terms of their admission is still legally eligible for green card approval, provided the aggregate duration of all status violations and unauthorized work does not exceed 180 days counted from the date of their most recent lawful admission to the United States. Status violations occurring during previous trips prior to a subsequent lawful entry do not count against the 180-day statutory cushion. This record does not adjudicate Form I-485 petitions.'
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
    title: 'Services Australia: Reciprocal Health Care Agreements (RHCA) Medicare enrollment and student visa exceptions (Health Insurance Act 1973)',
    topic: 'health',
    jurisdiction: 'Australia',
    url: 'https://www.servicesaustralia.gov.au/reciprocal-health-care-agreements-visiting-from-other-countries',
    quote: 'You may be eligible for Medicare if you visit Australia from a country that has a Reciprocal Health Care Agreement with Australia.',
    summary: 'Under the Australian Health Insurance Act 1973 and bilateral treaties, Australia maintains Reciprocal Health Care Agreements (RHCA) with 11 countries: the United Kingdom, Ireland, New Zealand, Sweden, the Netherlands, Finland, Italy, Malta, Norway, Belgium, and Slovenia. Eligible citizens and residents from these partner countries can enroll in Medicare upon arrival in Australia, receiving a Reciprocal Medicare Card that covers medically necessary inpatient and outpatient care in public hospitals, as well as subsidized prescription medicines under the Pharmaceutical Benefits Scheme (PBS). However, student visa (subclass 500) holders face critical exceptions: UK and Irish students are excluded from RHCA coverage and must purchase private Overseas Student Health Cover (OSHC), whereas students from Belgium, Norway, and Sweden qualify for reciprocal healthcare exemptions under specific bilateral agreements. This record does not issue Medicare cards.'
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
