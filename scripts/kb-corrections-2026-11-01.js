// Knowledge-base corrections from the 1 November 2026 KB audit
// (docs/archive/KB_AUDIT_2026-11-01.md). Each correction replaces exact text that the
// audit found to be outdated or wrong, and names the source that confirms the
// new value. The script is idempotent: a correction already applied is skipped.
//
//   node scripts/kb-corrections-2026-11-01.js            dry run (no writes)
//   node scripts/kb-corrections-2026-11-01.js --apply    back up, then apply
//
// --apply first copies the database to data/backups/, then updates the record
// body and full-text index, and appends a hash-chained audit row per record,
// the same way store.review() does. The same text edits are applied to the
// seed files in src/ when the record is defined there, so a rebuilt database
// does not bring the old text back. Approval status is not changed, except for
// records that are rejected outright; a corrected record still needs editorial
// review before it counts as reviewed.
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { configureEnglishDatabase } from '../src/migrations.js';
import { REWRITES } from './kb-rewrites.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIT_ID = 'kb-audit-2026-11-01';
const CHECKED_AT = '2026-11-01';
const REVIEWER = 'KB audit 2026-11-01 (automated correction, not editorial review)';
const SEED_FILES = ['knowledge.js', 'kyc-records.js', 'global-records.js', 'insider-immigration-records.js', 'technical-immigration-records.js'];

// [from, to] pairs apply to the summary unless the pair is tagged {field}.
export const CORRECTIONS = [
  // United Kingdom
  { id: 'uk-home-office-skilled-worker-visa-kyc', sources: ['https://www.gov.uk/skilled-worker-visa'],
    note: 'Since 22 July 2025 the general threshold is £41,700 and most roles must be RQF 6; since 8 January 2026 new applicants need B2 English.',
    edits: [
      ['An eligible job at RQF Level 3 or higher', 'An eligible job at RQF Level 6 (graduate level) for most new applications since 22 July 2025'],
      ['(£38,700 standard or occupation-specific going rates)', '(£41,700 since 22 July 2025, or the occupation-specific going rate if higher)'],
      ['English language proficiency at CEFR B1 level.', 'English language proficiency at CEFR B2 for new applicants from 8 January 2026 (B1 for people already on the route).'],
      ['Skilled Worker status provides a 5-year pathway', 'Skilled Worker status has provided a 5-year pathway'],
      ['Spouses and dependent children under 18 can accompany', 'The government has proposed longer settlement periods, so check GOV.UK before planning. Spouses and dependent children under 18 can accompany']] },
  { id: 'uk-home-office-skilled-worker-salary-grandfathering', sources: ['https://www.gov.uk/skilled-worker-visa'],
    note: 'The £38,700 figure was replaced on 22 July 2025; the transitional amounts changed too and must be checked on GOV.UK.',
    edits: [
      [{ field: 'title' }, 'UK Home Office: Skilled Worker salary threshold increase to £38,700 and £29,000 grandfathered protections (HC 590)', 'UK Home Office: Skilled Worker salary thresholds and transitional protections (history from HC 590)'],
      ['the baseline general minimum salary threshold for new Skilled Worker visa applicants was increased to £38,700 per year', 'the baseline general minimum salary threshold for new Skilled Worker visa applicants was increased to £38,700 per year, and on 22 July 2025 it rose again to £41,700'],
      ['Grandfathered workers are assessed against a reduced baseline salary threshold of £29,000 (indexed to the 25th percentile of 2023 UK earnings) rather than the £38,700 rate.', 'Transitional thresholds for people already on the route were also revised in July 2025, so the older £29,000 figure should not be relied on; check the current transitional rate on GOV.UK.'],
      [{ field: 'quote' }, 'The general salary threshold for a Skilled Worker visa has increased to thirty-eight thousand seven hundred pounds per year, subject to transitional arrangements.', 'Skilled Worker salary thresholds change over time and include transitional arrangements for people already on the route.']] },
  { id: 'uk-tenancy-deposit-scheme-tds-kyc', sources: ['https://www.legislation.gov.uk/ukpga/2025/26'],
    note: 'Section 21 no-fault notices were abolished in England from 1 May 2026 (Renters\' Rights Act 2025).',
    edits: [['Landlords cannot evict tenants without an official Section 21 or Section 8 court possession order from a county court.', 'Landlords cannot evict tenants without a county court possession order. In England, Section 21 no-fault notices were abolished from 1 May 2026 (Renters\' Rights Act 2025), so possession now needs a Section 8 ground.']] },
  { id: 'uk-tenancy-deposit-protection-caps-and-dispute-kyc', sources: ['https://www.legislation.gov.uk/ukpga/2025/26'],
    note: 'Section 21 abolished in England from 1 May 2026.',
    edits: [['Failure to protect deposits invalidates Section 21 eviction notices and subjects landlords', 'Failure to protect deposits invalidated Section 21 notices served before 1 May 2026 (when Section 21 was abolished in England) and subjects landlords']] },
  { id: 'uk-tenancy-section-21-gas-safety-invalidation', sources: ['https://www.legislation.gov.uk/ukpga/2025/26'],
    note: 'Historical rule: no new Section 21 notices can be served in England from 1 May 2026.',
    edits: [
      [{ field: 'title' }, 'UK Tenancy: Section 21 eviction notice invalidation for missing Gas Safety Certificate and How to Rent guide', 'UK Tenancy (historical): Section 21 notice invalidation rules, abolished in England from 1 May 2026'],
      ['Under the Deregulation Act 2015 section 33', 'From 1 May 2026 the Renters\' Rights Act 2025 abolished Section 21 no-fault evictions in England, so no new Section 21 notice can be served and possession needs a Section 8 ground. For notices served before that date: under the Deregulation Act 2015 section 33']] },
  { id: 'uk-tenant-fees-act-prohibited-payments-ban', sources: ['https://www.legislation.gov.uk/ukpga/2025/26'],
    note: 'Section 21 abolished in England from 1 May 2026.',
    edits: [['and is statutorily barred from issuing a Section 21 eviction notice until all unlawful payments are refunded in full.', 'and, before Section 21 was abolished in England on 1 May 2026, could not serve a Section 21 notice until unlawful payments were refunded.']] },
  { id: 'uk-london-tenancy-deposit-protection', sources: ['https://www.legislation.gov.uk/ukpga/2025/26'],
    note: 'Section 21 abolished in England from 1 May 2026.',
    edits: [['Landlords cannot evict tenants without a court order, and Section 21 notice is invalid if the deposit was unprotected.', 'Landlords cannot evict tenants without a court order. Section 21 no-fault notices were abolished in England from 1 May 2026, so possession now needs a Section 8 ground.']] },
  { id: 'uk-home-office-eta-electronic-travel-authorisation-kyc', sources: ['https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta'],
    note: 'The ETA fee rose from £10 to £16 on 9 April 2025; a further rise has been announced.',
    edits: [
      ['costs £10, remains valid', 'costs £16 since 9 April 2025 (a further increase has been announced, so check GOV.UK), remains valid'],
      ['holders of valid UK visas or BRPs are exempt', 'holders of valid UK visas or other UK immigration permission are exempt']] },
  { id: 'uk-dwp-national-insurance-number-nin-kyc', sources: ['https://www.gov.uk/evisa'],
    note: 'BRPs were replaced by eVisas; status is proved with an eVisa share code.',
    edits: [['(2) UK biometric residence permit (BRP) or Home Office eVisa digital share code proving lawful immigration status.', '(2) Home Office eVisa (proved with a share code) showing lawful immigration status; biometric residence permits (BRPs) have been replaced by eVisas.']] },
  { id: 'uk-home-office-right-to-work-share-code-kyc', sources: ['https://www.gov.uk/evisa'],
    note: 'BRPs were replaced by eVisas.',
    edits: [['Migrants holding a Biometric Residence Permit (BRP), settled status, or an eVisa prove', 'Migrants with an eVisa or EU Settlement Scheme status (biometric residence permits have been replaced by eVisas) prove']] },
  { id: 'uk-fca-retail-banking-kyc', sources: ['https://www.gov.uk/evisa'],
    note: 'BRPs were replaced by eVisas.',
    edits: [['valid foreign passport with UK visa or BRP;', 'valid foreign passport plus proof of UK immigration status (an eVisa share code; BRPs have been replaced by eVisas);']] },

  // Germany
  { id: 'de-gkv-statutory-health-insurance-kyc', sources: ['https://www.deutsche-rentenversicherung.de/DRV/DE/Experten/Arbeitgeber-und-Steuerberater/summa-summarum/Lexikon/J/jahresarbeitsentgeltgrenze.html'],
    note: 'Compulsory insurance threshold (Jahresarbeitsentgeltgrenze) is €77,400 for 2026; it changes every year.',
    edits: [['(€69,300 annually)', '(€77,400 a year in 2026; it is updated every January)']] },
  { id: 'de-stag-citizenship-modernisation-dual-nationality', sources: ['https://www.bmi.bund.de/'],
    note: 'The 3-year fast track was abolished by the Bundestag in October 2025.',
    edits: [['(and down to 3 years for special integration achievements, including CEFR Level C1 German and professional excellence)', '(the 3-year fast track for special integration achievements was abolished in October 2025; shorter periods remain only in limited cases such as spouses of German citizens)']] },
  { id: 'de-bamf-staatsangehoerigkeit-modernized-citizenship', sources: ['https://www.bmi.bund.de/'],
    note: 'The 3-year fast track was abolished by the Bundestag in October 2025.',
    edits: [['For applicants demonstrating special integration achievements (outstanding academic or professional performance, civic volunteer engagement, and certified German language proficiency at CEFR Level C1), the naturalization threshold is reduced to just 3 years.', 'The 3-year fast track for special integration achievements that this law introduced was abolished in October 2025, so 5 years is now the general minimum.']] },
  { id: 'de-bamf-eu-blue-card-chancenkarte-kyc', sources: ['https://www.gesetze-im-internet.de/aufenthg_2004/__18g.html'],
    note: 'Since November 2023 the EU Blue Card is in Section 18g AufenthG, not 18b.',
    edits: [['Under Section 18b of the German Residence Act', 'Under Section 18g of the German Residence Act']] },
  { id: 'de-aufenthg-blue-card-21-month-pr-fast-track', sources: ['https://www.gesetze-im-internet.de/aufenthg_2004/__18c.html'],
    note: 'The Blue Card settlement permit is in Section 18c(2) AufenthG.',
    edits: [
      [{ field: 'title' }, 'AufenthG Section 18b (2): Accelerated EU Blue Card Settlement Permit (Niederlassungserlaubnis)', 'AufenthG Section 18c (2): Accelerated EU Blue Card Settlement Permit (Niederlassungserlaubnis)'],
      ['Under Section 18b Subsection 2 of the German Residence Act', 'Under Section 18c Subsection 2 of the German Residence Act']] },
  { id: 'de-finanzamt-fragebogen-steuerliche-erfassung-freelance-kyc', sources: ['https://www.gesetze-im-internet.de/ustg_1980/__19.html'],
    note: 'The small-business VAT threshold rose to €25,000 prior-year turnover from 1 January 2025.',
    edits: [['for turnover under €22,000)', 'for prior-year turnover up to €25,000 and current-year turnover up to €100,000, since 1 January 2025)']] },

  // Australia and New Zealand
  { id: 'au-ato-dasp-super-withholding-rates', sources: ['https://www.ato.gov.au/'],
    note: 'Super guarantee is 12% from 1 July 2025.',
    edits: [['mandatory 11.5% employer super guarantee', 'mandatory employer super guarantee (12% from 1 July 2025)']] },
  { id: 'au-dha-subclass-500-student-485-graduate', sources: ['https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485'],
    note: 'Since 1 July 2024: 2 years for bachelor and coursework master graduates, 3 years for research master and doctoral graduates.',
    edits: [['The visa grants 2 years of unrestricted work rights for Bachelor graduates and 3 years for Master graduates.', 'The visa generally grants up to 2 years for Bachelor and coursework Master graduates and up to 3 years for research Master and doctoral graduates (settings from 1 July 2024).']] },
  { id: 'au-home-affairs-482-180-day-cessation-transfer', sources: ['https://immi.homeaffairs.gov.au/'],
    note: 'Subclass 457 is the former Temporary Work (Skilled) visa, not Temporary Graduate (485). Subclass 482 is now the Skills in Demand visa.',
    edits: [['for Temporary Skill Shortage (Subclass 482) and Temporary Graduate (Subclass 457) visa holders', 'for Temporary Skill Shortage (Subclass 482, renamed Skills in Demand from 7 December 2024), Skilled Employer Sponsored Regional (Subclass 494) and former Temporary Work (Skilled) (Subclass 457) visa holders']] },
  { id: 'au-dha-subclass-482-to-186-ens-pr-transition', sources: ['https://immi.homeaffairs.gov.au/'],
    note: 'TSMIT was replaced by the Core Skills Income Threshold (A$76,515 from 1 July 2025); subclass 482 is now Skills in Demand.',
    edits: [['earning above the Temporary Skilled Migration Income Threshold (TSMIT).', 'earning at least the Core Skills Income Threshold (A$76,515 from 1 July 2025; it replaced TSMIT and is indexed each July). Since 7 December 2024 new subclass 482 visas are granted as the Skills in Demand visa.']] },
  { id: 'au-subclass-482-to-186-ens-pathway', sources: ['https://immi.homeaffairs.gov.au/'],
    note: 'TSMIT was replaced by the Core Skills Income Threshold (A$76,515 from 1 July 2025).',
    edits: [['at or above the Temporary Skilled Migration Income Threshold (TSMIT - $73,150)', 'at or above the Core Skills Income Threshold (A$76,515 from 1 July 2025, which replaced TSMIT)']] },
  { id: 'au-dha-subclass-188-and-national-innovation-visa', sources: ['https://legislation.gov.au/F2024L00900/asmade/2024-07-18/es/original/pdf'],
    note: 'The Business Innovation and Investment Program closed to new applications on 31 July 2024.',
    edits: [
      ['Australia offers business and investor pathways through the Business Innovation and Investment (Provisional) Subclass 188 visa and the incoming National Innovation Visa.', 'The Business Innovation and Investment (Provisional) Subclass 188 visa closed to new applications on 31 July 2024; applications lodged before then are still processed, and existing holders can still extend or apply for Subclass 888. New high-calibre applicants now use the National Innovation Visa.'],
      ['Subclass 188 includes streams for', 'Subclass 188 had streams for']] },
  { id: 'nz-inz-active-investor-plus-visa', sources: ['https://www.immigration.govt.nz/about-us/news-centre/investor-category'],
    note: 'From 1 April 2025 the weighted system was replaced by Growth (NZD 5m, 3 years) and Balanced (NZD 10m, 5 years).',
    edits: [['New Zealand Active Investor Plus Visa attracts high-value investors through a weighted investment weighting system requiring a minimum of NZD $15 million in acceptable investments (or NZD $5 million if investing in direct private investments). Direct private equity investments are weighted at 3x (NZD $5M needed), private managed funds at 2x (NZD $7.5M needed), and listed equities or philanthropic funds at 1x (NZD $15M needed). The investment period is 3 to 4 years, during which the investor must spend at least 117 days in New Zealand over the 4-year period (or 88 days for direct investors).', 'Since 1 April 2025, the New Zealand Active Investor Plus Visa has two categories, replacing the earlier weighted system: Growth, with at least NZD 5 million invested for at least 3 years in higher-risk investments such as managed funds and direct investment in New Zealand businesses; and Balanced, with at least NZD 10 million invested over 5 years, which can also include bonds and property that support housing or infrastructure. Minimum time-in-New Zealand rules differ by category and are set by Immigration New Zealand.']] },
  { id: 'nz-inz-accredited-employer-work-visa-aewv', sources: ['https://www.immigration.govt.nz/about-us/news-centre/changes-to-the-accredited-employer-work-visa-aewv-and-median-wage/'],
    note: 'The AEWV median wage requirement was removed from 10 March 2025.',
    edits: [
      [{ field: 'title' }, 'INZ: Accredited Employer Work Visa (AEWV) Median Wage Rules and Resident Visa Progression', 'INZ: Accredited Employer Work Visa (AEWV) Pay Rules and Resident Visa Progression'],
      ['Jobs must pay at or above the national median wage threshold (or applicable statutory sector agreement rates) for full-time work of at least 30 hours per week.', 'Since 10 March 2025 jobs no longer have to pay the median wage: they must pay the market rate for the role and at least the New Zealand minimum wage, for work of at least 30 hours per week.']] },

  // Europe
  { id: 'es-ugce-startup-innovative-enterprise-and-golden-visa', sources: ['https://www.boe.es/buscar/act.php?id=BOE-A-2025-76'],
    note: 'Spain ended the investor (golden) visa on 3 April 2025 (Organic Law 1/2025).',
    edits: [['Separately, qualified foreign investors can obtain Golden Residence Visas through capital asset investments (EUR 1M in Spanish company shares or bank deposits, EUR 2M in government debt, or EUR 500,000 in unencumbered real estate assets) without mandatory minimum physical stay requirements.', 'Spain ended its investor (golden) visa on 3 April 2025 under Organic Law 1/2025; applications filed before that date are processed under the old rules and existing permits stay valid, but no new investor visas are issued.']] },
  { id: 'nl-ind-highly-skilled-migrant-kennismigrant', sources: ['https://ind.nl/en/required-amounts-income-requirements'],
    note: '2026 thresholds: EUR 5,942 (30+), EUR 4,357 (under 30), EUR 3,122 (reduced).',
    edits: [['for workers aged 30 and older, minimum EUR 5,688 per month; for workers under age 30, minimum EUR 4,171 per month; and a reduced graduate threshold of EUR 2,989 per month', 'in 2026, for workers aged 30 and older, minimum EUR 5,942 per month; for workers under age 30, minimum EUR 4,357 per month; and a reduced graduate threshold of EUR 3,122 per month']] },
  { id: 'nl-tax-30-percent-ruling-and-huurcommissie', sources: ['https://www.belastingdienst.nl/'],
    note: '2026 salary norms are EUR 48,013 and EUR 36,497; a cut to 27% is planned from 2027.',
    edits: [['(statutory threshold of EUR 46,107, or EUR 35,048 for master graduates under 30)', '(in 2026, EUR 48,013, or EUR 36,497 for master graduates under 30; the thresholds are indexed every year and a reduction of the allowance to 27% from 2027 has been announced)']] },
  { id: 'fr-service-public-carte-de-resident-10-ans-pr', sources: ['https://www.service-public.fr/particuliers/vosdroits/F17359'],
    note: 'From 1 January 2026 a first 10-year card generally requires B1 French and a civics exam.',
    edits: [['including certified French language proficiency at CEFR Level A2 or higher', 'including certified French language proficiency (CEFR B1 for most first applications from 1 January 2026, up from A2) and, in many cases, a civics exam']] },
  { id: 'se-skatteverket-personnummer-and-id-kort', sources: ['https://www.skatteverket.se/'],
    note: 'Personnummer is 10 digits (YYMMDD-XXXX), written as 12 with the century.',
    edits: [
      [{ field: 'title' }, 'Skatteverket: Population Registration (Folkbokföring), 12-Digit Personnummer, and BankID', 'Skatteverket: Population Registration (Folkbokföring), Personnummer, and BankID'],
      ['an immutable 12-digit national identification number (YYMMDD-XXXX)', 'a personal identity number written as YYMMDD-XXXX (10 digits, or 12 when the century is included)']] },

  // Ireland
  { id: 'ie-deti-critical-skills-employment-permit-kyc', sources: ['https://enterprise.gov.ie/en/news-and-events/department-news/2025/december/20251202.html'],
    note: 'From 1 March 2026 the CSEP thresholds are €40,904 and €68,911.',
    edits: [['of at least €38,000 (or €64,000 for unlisted roles)', 'of at least €40,904 from 1 March 2026 (or €68,911 for roles not on the list, for applicants with relevant experience)']] },
  { id: 'ie-dsp-pps-number-and-rtb-tenancy-kyc', sources: ['https://rtb.ie/'],
    note: 'Rent Pressure Zones were extended nationwide on 20 June 2025; a new national rent-control system began on 1 March 2026.',
    edits: [['In designated Rent Pressure Zones (RPZs, covering Dublin and major cities), annual rent increases cannot exceed 2% or general inflation.', 'Rent increases are capped at 2% or inflation, whichever is lower: Rent Pressure Zones covered the whole country from 20 June 2025, and a national rent-control system with new rules for tenancies starting on or after 1 March 2026 replaced them.']] },
  { id: 'ie-rtb-residential-tenancy-and-deposit-kyc', sources: ['https://rtb.ie/'],
    note: 'RPZs nationwide from 20 June 2025; national system from 1 March 2026.',
    edits: [['In designated Rent Pressure Zones (RPZs, covering Dublin, Cork, Galway, and commuter towns), annual rent increases are legally capped', 'Rent Pressure Zone rules have applied to the whole country since 20 June 2025, and a national rent-control system took over from 1 March 2026; annual rent increases are capped']] },
  { id: 'ie-rtb-rpz-2-percent-rent-cap', sources: ['https://rtb.ie/'],
    note: 'RPZs nationwide from 20 June 2025; from 1 March 2026 rent can reset to market only at a new tenancy start or after 6 years.',
    edits: [
      ['residential rental properties situated within designated Rent Pressure Zones (RPZs)—including Dublin, Cork, Galway, Limerick, and major commuter towns—are subject', 'residential rental properties (in Rent Pressure Zones, which have covered the whole country since 20 June 2025) are subject'],
      ['landlords cannot reset rent to market rates between tenancies when a previous tenant vacates.', 'for tenancies that began before 1 March 2026 landlords cannot reset rent to market rates between tenancies. Under the national system that started on 1 March 2026, new tenancies follow different reset rules (generally at the start of a new tenancy or after 6 years), so check the RTB.']] },

  // Canada
  { id: 'ca-ircc-start-up-visa-suv-program', sources: ['https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-visa.html'],
    note: 'The Start-up Visa closed to new applications on 31 December 2025.',
    edits: [
      ['Canada Start-up Visa (SUV) Program grants permanent residence', 'Canada closed the Start-up Visa (SUV) Program to new applications on 31 December 2025 (applicants with a valid 2025 commitment certificate had until 30 June 2026), stopped new SUV work permit applications on 19 December 2025, and announced a replacement entrepreneur pilot. Applications already submitted are still processed. The program granted permanent residence'],
      ['Essential applicants qualify for an open work permit while permanent residence is processed.', '']] },
  { id: 'ontario-rent-increase-guideline', sources: ['https://www.ontario.ca/page/residential-rent-increases'],
    note: 'The 2026 Ontario guideline is 2.1%.',
    edits: [['(2.5% in 2024, 2025, and 2026)', '(2.5% in 2024 and 2025, 2.1% in 2026)']] },
  { id: 'ontario-rta-unlawful-rent-increase-defense-and-form-n1', sources: ['https://www.ontario.ca/page/residential-rent-increases'],
    note: 'The 2026 Ontario guideline is 2.1%.',
    edits: [['(2.5% for 2024 through 2026)', '(2.5% for 2024 and 2025, 2.1% for 2026)']] },
  { id: 'cra-newcomer-benefit-registration-rc151-rc66', sources: ['https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/rc151.html'],
    note: 'The Canada Carbon Rebate (formerly Climate Action Incentive) ended in 2025; RC151 now applies for the GST/HST credit.',
    edits: [['(1) Form RC151 (GST/HST and Climate Action Incentive Credit Application for Individuals Who Become Residents of Canada):', '(1) Form RC151 (GST/HST credit application for individuals who become residents of Canada; the Canada Carbon Rebate, formerly the Climate Action Incentive, ended in 2025):']] },
  { id: 'fintrac-cra-tax-free-family-gift-wire-kyc', sources: ['https://www.canada.ca/en/revenue-agency.html', 'https://fintrac-canafe.canada.ca/'],
    note: 'Gifts are generally not taxable, but income earned on them is; the documentation is good practice, not a legal form requirement.',
    edits: [
      [{ field: 'title' }, 'CRA & FINTRAC: Tax-free overseas family gifts, wire transfer KYC, and gift deed documentation', 'CRA & FINTRAC: Overseas family gifts, wire transfer reporting, and gift documentation'],
      ['are 100% tax-free and are not counted as taxable income in Canada.', 'are generally not taxable income in Canada. Income later earned on the money (interest, dividends, rent or capital gains) is taxable, and foreign property costing more than CAD 100,000 in total must be reported on Form T1135.'],
      ['receiving Canadian banks must satisfy FINTRAC anti-money laundering reporting requirements. Newcomers must maintain a clear paper trail: (1) A signed and notarized Deed of Gift', 'receiving Canadian banks report the transfer to FINTRAC and may ask where the money came from. Keeping a clear paper trail is good practice (no specific form is required by law): (1) A signed gift letter']] },
  { id: 'cra-moving-expenses-relocation-deduction', sources: ['https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-1-individuals/folio-3-family-unit-issues/income-tax-folio-s1-f3-c4-moving-expenses.html'],
    note: 'A move from another country into Canada is generally not deductible; the old and new homes must both be in Canada, with narrow exceptions for students and residents moving abroad.',
    edits: [
      [{ field: 'title' }, 'CRA: Moving expense tax deduction for newcomers relocating for employment or study (ITA s.62)', 'CRA: Moving expense deduction (ITA s.62) and why most moves into Canada do not qualify'],
      ['individuals who relocate to Canada to take up employment, operate a business, or attend full-time post-secondary education can deduct eligible moving expenses from their Canadian income, provided their new home is at least 40 kilometres closer', 'individuals who move within Canada to take up employment, operate a business, or attend full-time post-secondary education can deduct eligible moving expenses, provided their new home is at least 40 kilometres closer'],
      ['This record does not prepare individual tax returns.', 'A move from another country into Canada is generally not deductible, because both the old and the new home must normally be in Canada; the exceptions are narrow (for example some full-time students, and Canadian residents moving to or from a job abroad). This record does not prepare individual tax returns.']] },
  { id: 'global-proof-of-funds-and-financial-maintenance', sources: ['https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html'],
    note: 'Express Entry settlement funds for one person are CAD 15,263 since 7 July 2025.',
    edits: [['(minimum CAD 14,690 for a single applicant)', '(CAD 15,263 for a single applicant since 7 July 2025)']] },
  { id: 'ontario-health-ohip-wait-elimination', sources: ['https://www.ontario.ca/page/apply-ohip-and-get-health-card'],
    note: 'The OHIP waiting period was removed by amending O. Reg. 552; Bill 175 is unrelated home-care legislation.',
    edits: [['Under the Connecting People to Home and Community Care Act, 2020 (S.O. 2020, c. 5 - Bill 175) and amendments to Ontario Regulation 552', 'Under amendments to Ontario Regulation 552']] },
  { id: 'peel-mississauga-newcomer-arrival-orientation-and-settlement-framework', sources: ['https://www.ontario.ca/page/apply-ohip-and-get-health-card'],
    note: 'The OHIP waiting period was removed by amending O. Reg. 552, not by Bill 175.',
    edits: [['with zero waiting period under Bill 175;', 'with no three-month waiting period (removed by amendments to Ontario Regulation 552);']] },
  { id: 'ircc-express-entry-crs', sources: ['https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html'],
    note: 'Age points are highest (110 single, 100 with spouse) for ages 20 to 29 and fall unevenly to 0 at 45.',
    edits: [['age maximum 110 points at 29, dropping 5 points per year after 30;', 'age points highest at 110 for ages 20 to 29 (100 with an accompanying spouse), falling each year from age 30 to 0 at age 45;']] },
  { id: 'ca-ircc-express-entry-fsw-cec-pnp-pr', sources: ['https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html'],
    note: 'A nomination adds 600 points but does not legally guarantee an ITA.',
    edits: [['awarding a massive 600 CRS bonus points guaranteeing an Invitation to Apply (ITA).', 'awarding 600 additional CRS points, which in practice usually leads to an Invitation to Apply (ITA) but is not a legal guarantee.']] },
  { id: 'tdsb-pdsb-vsb-dependent-school-registration-kyc', sources: ['https://www.tdsb.on.ca/Elementary-School/Register-for-School'],
    note: 'VSB is in British Columbia and follows the BC School Act, not Ontario law.',
    edits: [
      ['To register a child with the Toronto District School Board (TDSB), Peel District School Board (PDSB), or Vancouver School Board (VSB), parents must complete', 'To register a child with the Toronto District School Board (TDSB) or Peel District School Board (PDSB), parents usually complete'],
      ['This record does not assign students to specific schools.', 'In British Columbia (for example the Vancouver School Board) registration follows the BC School Act and the board\'s own document list instead. This record does not assign students to specific schools.']] },

  // United States
  { id: 'us-uscis-540-day-ead-automatic-extension', sources: ['https://www.uscis.gov/working-in-the-united-states/information-for-employers-and-employees/automatic-employment-authorization-document-ead-extension'],
    note: 'Automatic EAD extensions ended for renewals filed on or after 30 October 2025.',
    edits: [
      [{ field: 'title' }, 'USCIS: Up to 540-day automatic employment authorization renewal extension (8 CFR § 274a.13(d))', 'USCIS: Automatic EAD extension (8 CFR § 274a.13(d)), ended for renewals filed on or after 30 October 2025'],
      ['Under US Department of Homeland Security regulations', 'For EAD renewal applications filed on or after 30 October 2025, DHS ended the automatic extension, so workers can face a gap if the new card is late; extensions granted before that date stay valid. Earlier rules: under US Department of Homeland Security regulations']] },
  { id: 'us-nyc-mta-omny-transit', sources: ['https://new.mta.info/fares'],
    note: 'Fare is $3.00 from 4 January 2026, with a $35 rolling 7-day cap.',
    edits: [['Under the weekly 7-day fare cap, once a rider completes 12 paid fares ($2.90 per ride) using the same card or device between Monday 12:00 AM and Sunday 11:59 PM, all subsequent subway and local bus trips for the remainder of that seven-day window are automatically free.', 'Since 4 January 2026 the base fare is $3.00 and fares are capped at $35 in any rolling 7 days: after 12 paid rides on the same card or device, the remaining subway and local bus trips in that window are free.']] },
  { id: 'us-uscis-l1-intracompany-transferee-and-eb1c', sources: ['https://www.uscis.gov/working-in-the-united-states/temporary-workers/l-1a-intracompany-transferee-executive-or-manager'],
    note: 'L-1 dual intent comes from INA § 214(h); § 214(b) is the presumption of immigrant intent.',
    edits: [['dual intent under INA § 214(b)', 'dual intent under INA § 214(h)']] },
  { id: 'us-tenant-application-fee-caps', sources: ['https://www.hud.gov/'],
    note: 'Interest-bearing escrow is required only in some states; California small landlords may charge two months.',
    edits: [
      ['security deposits cannot exceed 1 month rent regardless of whether the unit is furnished or unfurnished.', 'security deposits generally cannot exceed 1 month rent whether the unit is furnished or not (some small landlords may charge 2 months).'],
      ['Landlords in most states must hold security deposits in an interest-bearing escrow account at a federally insured financial institution and provide written disclosure of the bank name and account details within 30 days.', 'Some states (for example Massachusetts and New Jersey) require deposits to be held in a separate or interest-bearing account and the bank details to be disclosed; rules differ by state.']] },
  { id: 'us-fair-housing-act-tenant-kyc', sources: ['https://www.hud.gov/'],
    note: 'Deposit rules vary by state; most states do not require interest-bearing escrow.',
    edits: [['security deposits are typically capped at 1 to 2 months rent, must be held in an interest-bearing escrow account, and must be returned within 14 to 30 days after lease termination.', 'security deposit caps, holding rules (a few states require a separate or interest-bearing account) and return deadlines (often 14 to 30 days) differ by state.']] },
  { id: 'us-aca-healthcare-enrollment-kyc', sources: ['https://www.healthcare.gov/immigrants/lawfully-present-immigrants/'],
    note: '2025 federal law narrows premium tax credit eligibility for many lawfully present immigrants from 2027.',
    edits: [['Subsidies (premium tax credits) reduce monthly premiums', 'Federal law passed in 2025 narrows premium tax credit eligibility for many lawfully present immigrants from 1 January 2027 (generally keeping it for permanent residents and a few other groups), so check HealthCare.gov for your status. Subsidies (premium tax credits) reduce monthly premiums']] },

  // Singapore
  { id: 'sg-mom-employment-pass-compass-framework', sources: ['https://www.mom.gov.sg/passes-and-permits/employment-pass/eligibility'],
    note: 'EP minimum is SGD 5,600 (SGD 6,200 financial services) for new applications from 1 January 2025.',
    edits: [['earning a minimum qualifying monthly salary of SGD 5,000 (increasing progressively with age up to SGD 10,500 at age 45), with a higher threshold of SGD 5,500 to SGD 11,500 in financial services.', 'earning a minimum qualifying monthly salary of SGD 5,600 for new applications from 1 January 2025 (rising with age to about SGD 10,700 in the mid-40s), or SGD 6,200 in financial services; renewals moved to the same levels from 1 January 2026.']] },
  { id: 'sg-mom-s-pass-quota-and-salary-tiers', sources: ['https://www.mom.gov.sg/passes-and-permits/s-pass/eligibility'],
    note: 'From 1 September 2025: S Pass minimum SGD 3,300 (SGD 3,800 financial services) and Tier 1 levy SGD 650.',
    edits: [
      ['who earn at least SGD 3,150 per month (increasing with age up to SGD 4,650), or SGD 3,650 in the financial services sector.', 'who earn at least SGD 3,300 per month for new applications from 1 September 2025 (increasing with age), or SGD 3,800 in the financial services sector.'],
      ['(Tier 1 at SGD 550; Tier 2 at SGD 650)', '(SGD 650 for both tiers from 1 September 2025)']] },

  // Second round (items the first pass marked "needs a human check")
  { id: 'ircc-express-entry-crs', sources: ['https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/submit-profile/rounds-invitations/category-based-selection.html'],
    note: 'Since 18 February 2026 occupational categories need 12 months of experience in the last 3 years, not necessarily continuous.',
    edits: [['require a minimum of 6 continuous months of full-time work experience in an eligible NOC code within the past 3 years.', 'require at least 12 months of full-time (or equivalent) work experience in an eligible occupation within the past 3 years, which need not be continuous (since 18 February 2026; it was 6 continuous months before).']] },
  { id: 'ircc-employer-kyc-right-to-work', sources: ['https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/extend-permit.html'],
    note: 'There is no "WP-EXT" document; proof of maintained status is the expired permit plus the Acknowledgement of Receipt and IRCC\'s work-authorization letter.',
    edits: [['the official legal KYC document is the IRCC "WP-EXT" (Work Permit Extension) acknowledgement letter (IMM 5429 / IMM 5988), which legally confirms ongoing full-time work authorization until a formal decision is made.', 'the worker shows the expired permit together with proof of the timely application: the online Acknowledgement of Receipt and, for online applications, the letter IRCC issues confirming they may keep working until a decision is made.']] },
  { id: 'service-canada-sin-temporary-expiry-and-renewal-kyc', sources: ['https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/extend-permit.html'],
    note: 'There is no "WP-EXT / IMM 5429 / IMM 5988" maintained-status letter.',
    edits: [['employers are legally required to accept the maintained status confirmation letter (WP-EXT / IMM 5429 / IMM 5988) and cannot terminate employment solely due to an expired SIN document.', 'the worker can show the expired permit with proof of the timely application (the Acknowledgement of Receipt and IRCC\'s work-authorization letter), and an expired SIN document alone is not a reason to stop employment.']] },
  { id: 'irpr-maintained-status-expired-sin-and-payroll-compliance', sources: ['https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/extend-permit.html'],
    note: 'There is no "WP-EXT" letter.',
    edits: [['upon receipt of the IRCC Acknowledgement of Receipt (AoR) or WP-EXT letter.', 'upon receipt of the IRCC Acknowledgement of Receipt (AoR) or IRCC\'s letter confirming the worker may keep working.']] },
  { id: 'serviceontario-vital-stats-baby-and-address-kyc', sources: ['https://www.ontario.ca/page/health-cards'],
    note: 'The 6-day rule is for the driver\'s licence; the health card must be updated within 30 days.',
    edits: [
      [{ field: 'title' }, 'ServiceOntario: 5-in-1 newborn registration and mandatory 6-day address update KYC', 'ServiceOntario: 5-in-1 newborn registration and address update deadlines'],
      ['must be updated on both the Ontario Driver Licence and OHIP Health Card within 6 days of moving (or within 10 days for BC Services Cards).', 'must be updated on the Ontario driver\'s licence within 6 days of moving and on the OHIP health card within 30 days (in British Columbia, the driver\'s licence within 10 days).'],
      [{ field: 'quote' }, 'You must register your newborn within 30 days and update your residential address on your health card and driver licence within 6 days of moving.', 'You must register your newborn within 30 days of birth and update your address after moving.']] },
  { id: 'au-biosecurity-undeclared-meat-plant-infringements-kyc', sources: ['https://agriculture.gov.au/biosecurity-trade/policy/legislation/compliance/infringement-notice-scheme/infringement-notices-at-the-airport'],
    note: 'Notices are 2, 6, 12 or 20 penalty units; at $330 a unit, 12 units is $3,960 and 20 units (concealment) is $6,600.',
    edits: [
      ['can issue on-the-spot infringement notices of up to 12 penalty units (exceeding $6,200 AUD in statutory fines) for failing to declare high-risk biosecurity goods,', 'can issue on-the-spot infringement notices of 2, 6, 12 or 20 penalty units (for example 6 units, $1,980, or 12 units, $3,960, for undeclared high-risk goods, and 20 units, $6,600, for concealment, at the current $330 unit value),'],
      [{ field: 'quote' }, 'Under the Biosecurity Act 2015, international travelers who fail to declare risk goods can receive instant fines exceeding $6,000 AUD.', 'Under the Biosecurity Act 2015, international travellers who fail to declare risk goods can receive infringement notices on the spot.']] },
  { id: 'canada-ircc-settlement-services-eligibility-and-2026-limits', sources: ['https://search.open.canada.ca/qpnotes/record/cic%2CIRCC-2025-QP-00014'],
    note: 'From 1 April 2026 economic-class permanent residents can use settlement services for 6 years after becoming PR, and 5 years from 1 April 2027.',
    edits: [['Effective April 1, 2026, IRCC introduces time-limited settlement eligibility for economic-class permanent residents (access prioritized within early post-landing years), with further transitional rules in 2027.', 'From April 1, 2026, economic-class permanent residents and their accompanying family members can use settlement services for 6 years from the date they became permanent residents, falling to 5 years from April 1, 2027; family-class immigrants and resettled refugees are not subject to this limit.']] },
  { id: 'canada-visitor-status-extension-and-90-day-restoration-framework', sources: ['https://ircc.canada.ca/english/information/fees/fees.asp'],
    note: 'Restoration costs $246.25 under the current fee schedule, plus the $100 visitor record fee; fees are indexed.',
    edits: [['Restoration requires paying the $200 restoration fee plus the $100 extension fee,', 'Restoration requires paying the restoration fee ($246.25 in the current schedule, which IRCC indexes) plus the $100 visitor record fee,']] },
  { id: 'ontario-tenant-board-ltb-t2-harassment-kyc', sources: ['https://www.ontario.ca/rent'],
    note: 'Court fines for RTA offences rose on 1 July 2026 to $100,000 (individuals) and $500,000 (corporations).',
    edits: [['and levy administrative fines up to $50,000 against non-compliant landlords.', 'and levy administrative fines up to its monetary limit ($50,000) against non-compliant landlords. Separately, a court can fine a landlord convicted of an offence under the Act up to $100,000 (individuals) or $500,000 (corporations) since July 1, 2026.']] },
  { id: 'au-home-affairs-bridging-visa-b-travel-kyc', sources: ['https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/bridging-visa-b-020'],
    note: 'The Bridging Visa B fee rose from $190 to $575 on 1 July 2026.',
    edits: [['costs $190 AUD,', 'costs AUD 575 from 1 July 2026 (it was AUD 190; check the current fee with Home Affairs),']] },

  // Third round: records added to global-records.js later on 1 November 2026
  { id: 'de-deutschlandticket-and-bvg-transit-regulations', sources: ['https://www.zdfheute.de/politik/deutschlandticket-dticket-verkehr-nahverkehr-preis-erhoehung-100.html'],
    note: 'The Deutschlandticket costs EUR 63 a month from 1 January 2026 (EUR 58 in 2025, EUR 49 before).',
    edits: [['a nationwide digital subscription ticket priced at €49 per calendar month', 'a nationwide digital subscription ticket priced at €63 per calendar month from January 2026 (€58 in 2025; a price-adjustment mechanism is planned from 2027)']] },
  { id: 'us-irs-transit-benefits-commuter-tax-exclusion', sources: ['https://www.proskauer.com/blog/irs-releases-annual-increases-to-health-fsa-and-transportation-fringe-benefit-limits-for-2026'],
    note: 'The section 132(f) limit is $340 a month in 2026 ($325 in 2025, $315 in 2024).',
    edits: [['($315 per month in 2024–2026, indexed annually for inflation)', '($340 per month in 2026, up from $325 in 2025; indexed annually for inflation)']] },
  { id: 'us-hhs-ccdf-childcare-and-dependent-care-fsa', sources: ['https://www.shrm.org/content/dam/en/shrm/topics-tools/tools/fact-sheets/2026-benefit-plan-limits-chart-download.pdf'],
    note: 'From 1 January 2026 the dependent care FSA limit is $7,500 ($3,750 married filing separately).',
    edits: [['contributing up to $5,000 annually in pre-tax dollars', 'contributing up to $7,500 a year in pre-tax dollars from 2026 ($3,750 if married filing separately; it was $5,000 before)']] },
  { id: 'au-services-australia-child-care-subsidy-ccs', sources: ['https://www.acecqa.gov.au/latest-news/3-day-guarantee-changes-ccs-activity-test-january-2026'],
    note: 'From 5 January 2026 the 3 Day Guarantee gives at least 72 subsidised hours a fortnight; up to 100 hours needs more than 48 hours of activity per parent.',
    edits: [["with the number of subsidized hours per fortnight (up to 100 hours) determined by the parents' combined recognized work, training, or study activities under the CCS Activity Test.", 'and since 5 January 2026 the 3 Day Guarantee gives eligible families at least 72 subsidised hours per fortnight per child regardless of activity, rising to 100 hours where each parent does more than 48 hours of recognised work, study or training a fortnight (it replaced the CCS Activity Test).']] },
  { id: 'uk-tfl-transit-contactless-capping-and-fare-zones', sources: ['https://www.london.gov.uk/md3517-july-2026-fare-changes'],
    note: 'The London bus and tram fare rises from GBP 1.75 to GBP 1.85 on 1 November 2026.',
    edits: [['Buses and trams operate on a flat fare of £1.75 across London', 'Buses and trams operate on a flat fare across London (£1.85 from 1 November 2026, up from £1.75)']] },
  { id: 'ae-rta-nol-card-and-hafilat-transit-regulations', sources: ['https://www.rta.ae/links/rail/metro-minimum-nol-top-up-en.pdf'],
    note: 'A Nol card needs at least AED 7.50 to start a metro trip; AED 20 is the minimum top-up at vending machines since March 2025.',
    edits: [['passengers must maintain a statutory minimum Nol balance of AED 15 before entering metro gates.', 'passengers need at least AED 7.50 on the card to start a metro trip (enough for a return trip is about AED 15), and since March 2025 the minimum top-up at metro vending machines is AED 20.']] },

  { id: 'us-dol-independent-contractor-economic-reality-kyc', sources: ['https://www.hklaw.com/en/insights/publications/2026/03/dol-proposes-to-rescind-biden-era-independent-contractor-rule'],
    note: 'In February 2026 the DOL proposed rescinding the 2024 rule and returning to the 2021 core-factors test; until a final rule, the 2024 rule applies.',
    edits: [['No single factor has predetermined weight. This record outlines', 'No single factor has predetermined weight. In February 2026 the Department of Labor proposed rescinding this 2024 rule and returning to the 2021 "core factors" test (control and opportunity for profit or loss); until a final rule takes effect the 2024 rule applies, so check the Wage and Hour Division for the current status. This record outlines']] },

  // Yearly indexation found while building src/kb-facts.js
  { id: 'au-dha-subclass-482-to-186-ens-pr-transition', sources: ['https://www.bdo.com.au/en-au/insights/migration-services/updated-income-thresholds-for-skilled-visas-what-employers-need-to-know'],
    note: 'The Core Skills Income Threshold was indexed to A$79,499 on 1 July 2026.',
    edits: [['(A$76,515 from 1 July 2025; it replaced TSMIT and is indexed each July)', '(A$79,499 from 1 July 2026, up from A$76,515; it replaced TSMIT and is indexed each July)']] },
  { id: 'au-subclass-482-to-186-ens-pathway', sources: ['https://www.bdo.com.au/en-au/insights/migration-services/updated-income-thresholds-for-skilled-visas-what-employers-need-to-know'],
    note: 'The Core Skills Income Threshold was indexed to A$79,499 on 1 July 2026.',
    edits: [['(A$76,515 from 1 July 2025, which replaced TSMIT)', '(A$79,499 from 1 July 2026, indexed each July; it replaced TSMIT)']] },

  // Scheduled review 2026-11-03
  { id: 'au-austrac-100-point-banking-kyc', sources: ['https://www.austrac.gov.au/industry-and-business/obligations-and-guidance/your-amlctf-program/reporting-us/threshold-transaction-reports', 'https://www.austrac.gov.au/industry-and-business/education-and-resources/publications-and-resources/international-funds-transfer-instructions-iftis-reporting'],
    note: 'The AUD 10,000 threshold applies to cash (threshold transaction reports); international funds transfer instructions are reported whatever the amount.',
    edits: [['International electronic wire transfers of AUD $10,000 or more are reported to AUSTRAC for AML compliance.', 'Banks report international funds transfers to AUSTRAC whatever the amount, and report cash transactions (notes and coins) of AUD 10,000 or more as threshold transactions.']] },
  { id: 'au-home-affairs-vevo-right-to-work-kyc', sources: ['https://www.legislation.gov.au/C2013A00010/asmade/details'],
    note: 'The 2013 employer sanctions law is the Migration Amendment (Reform of Employer Sanctions) Act 2013 (Act No. 10 of 2013).',
    edits: [['Under the Migration Amendment (Employer Sanctions) Act 2013,', 'Under the Migration Act 1958 as amended by the Migration Amendment (Reform of Employer Sanctions) Act 2013,']] },
  { id: 'au-rental-bonds-lodgement-and-refund-kyc', sources: ['https://www.nsw.gov.au/housing-and-construction/renting-a-place-to-live/starting-a-residential-tenancy', 'https://www.consumerprotection.wa.gov.au/lodging-bond'],
    note: 'Bond lodgement deadlines differ by state: 10 working days in NSW and 14 days in Western Australia.',
    edits: [['Agents must lodge bond monies electronically within 7 to 10 days', 'Agents must lodge bond monies within the deadline set by each state (for example 10 working days in NSW and 14 days in Western Australia)']] },
  { id: 'au-ato-tax-file-number-tfn-kyc', sources: ['https://www.ato.gov.au/forms-and-instructions/tfn-application-for-permanent-migrants-and-temporary-visitors'],
    note: 'The ATO online service for foreign passport holders is called Individual Auto Registration (IAR); visas with no-work conditions cannot use it.',
    edits: [['apply online through the Individual Auto TFN service using their passport details', 'apply online through the ATO Individual Auto Registration (IAR) service using their passport details (they must be in Australia and hold a visa that allows work or study)']] },

  // Australia tenancy
  { id: 'au-sydney-nsw-fair-trading-rental-bonds', sources: ['https://www.nsw.gov.au/housing-and-construction/renting-a-place-to-live/starting-a-residential-tenancy'],
    note: 'NSW bonds must be lodged within 10 working days.',
    edits: [['via Rental Bonds Online (RBO) within 7 days.', 'via Rental Bonds Online (RBO) within 10 working days.']] },
  { id: 'au-residential-tenancy-bond-authority-kyc', sources: ['https://www.nsw.gov.au/housing-and-construction/renting-a-place-to-live/starting-a-residential-tenancy', 'https://www.rentalbonds.vic.gov.au/s/'],
    note: 'NSW and Victoria both allow 10 business days for lodgement; Victoria caps bonds at one month.',
    edits: [
      ['within 7 business days of receipt.', 'within the state deadline (10 business days in NSW and Victoria).'],
      ['Rental bonds are strictly capped at a maximum of 4 weeks rent for standard properties.', 'Bonds are capped by state law, for example 4 weeks rent in NSW and 1 month in Victoria for most properties.']] }
];

// Crawler-generated "Policy Update" records whose summaries say only that a page
// changed, with HTML fragments as quotes and an inferred "effective date". They
// carry no checkable fact, so they are rejected rather than corrected.
export const REJECT_PATTERN = /^[a-z]{2}-[a-z0-9-]+-[0-9a-f]{8}$/;
export const REJECT_NOTE = 'Rejected in the KB audit: crawler-generated change notice with no verifiable content, an HTML fragment as its quote, and an effective date inferred by the crawler rather than stated by the source.';

// The 201 "<country>-settlement-services" records shared one directory link but
// made unverified country-specific claims (named agencies, Ontario/BC landing,
// pre-arrival help for anyone). They are rewritten to what the source supports.
export const TEMPLATE_PATTERN = /-settlement-services$/;
export function templateSummary(country) {
  return `Newcomers moving from ${country} to Canada can use free settlement services funded by Immigration, Refugees and Citizenship Canada (IRCC). Pre-arrival services are for people who have already been approved to immigrate, before they travel; after arrival, eligible newcomers can get language assessment and classes, employment help, information and orientation, and community connections. Eligibility depends on immigration status, so confirm it and find a provider near you with IRCC's official service finder.`;
}

function applyEdits(record, edits) {
  const next = { ...record }; const missing = []; let changed = 0;
  const parsed = edits.map(e => typeof e[0] === 'object' ? [e[0].field, e[1], e[2]] : ['summary', e[0], e[1]]);
  parsed.forEach(([field, from, to], i) => {
    const text = next[field] ?? '';
    // Already applied: the replacement is present, or a deletion's text is gone.
    // Checked first because some replacements contain their original text.
    if (to ? text.includes(to) : !text.includes(from)) return;
    if (text.includes(from)) { next[field] = text.replace(from, to).replace(/\s{2,}/g, ' ').trim(); changed++; return; }
    // A later round may have rewritten this edit's output (for example a yearly figure).
    const superseded = parsed.slice(i + 1).some(([f, , laterTo]) => f === field && laterTo && text.includes(laterTo));
    const rewritten = REWRITES.find(r => r.id === record.id);
    if (rewritten && rewritten[field] && text === rewritten[field]) return;
    if (!superseded) missing.push(`${field}: ${from.slice(0, 70)}`);
  });
  return { next, missing, changed };
}

export function planCorrections(rows) {
  const byId = new Map(rows.map(r => [r.id, r]));
  const plan = []; const problems = [];
  // A record corrected in more than one round gets one combined note.
  const merged = new Map();
  // Whole-field rewrites (scripts/kb-rewrites.js) become edits from the current text.
  const rewrites = REWRITES.filter(r => byId.has(r.id)).map(r => ({ id: r.id, note: r.note, sources: r.sources,
    edits: ['title', 'quote', 'summary'].filter(f => r[f] && byId.get(r.id)[f] !== r[f]).map(f => [{ field: f }, byId.get(r.id)[f], r[f]]) }));
  for (const c of [...CORRECTIONS, ...rewrites]) {
    const m = merged.get(c.id);
    merged.set(c.id, m ? { id: c.id, note: `${m.note} ${c.note}`, sources: [...new Set([...m.sources, ...c.sources])], edits: [...m.edits, ...c.edits] } : c);
  }
  for (const c of merged.values()) {
    const old = byId.get(c.id);
    if (!old) { problems.push(`${c.id}: not in database`); continue; }
    const { next, missing, changed } = applyEdits(old, c.edits);
    if (missing.length) problems.push(`${c.id}: text not found -> ${missing.join(' | ')}`);
    // Records accept only known evidence fields, so the correction is described
    // in reviewBasis and in the audit note rather than in a new field.
    const basis = `Corrected in the ${AUDIT_ID}: ${c.note} Checked against ${c.sources.join(', ')}. Not yet editorially reviewed.`;
    if (changed) plan.push({ id: c.id, old, next: { ...next, checkedAt: CHECKED_AT, reviewBasis: basis }, note: `${c.note} Sources: ${c.sources.join(', ')}`, kind: 'correct', edits: c.edits });
    // Already corrected, but the note or source list has since been revised.
    else if (old.reviewBasis?.startsWith(`Corrected in the ${AUDIT_ID}`) && old.reviewBasis !== basis)
      plan.push({ id: c.id, old, next: { ...old, reviewBasis: basis }, note: `Source list revised. Sources: ${c.sources.join(', ')}`, kind: 'basis', edits: [] });
  }
  for (const old of rows) {
    if (REJECT_PATTERN.test(old.id) && /Effective date: \d{4}-\d\d-\d\d\. Changes were detected/.test(old.summary || '') && old.status !== 'rejected')
      plan.push({ id: old.id, old, next: { ...old, status: 'rejected' }, note: REJECT_NOTE, kind: 'reject' });
    if (TEMPLATE_PATTERN.test(old.id)) {
      const summary = templateSummary(old.jurisdiction);
      if (old.summary !== summary) plan.push({ id: old.id, old, next: { ...old, summary, checkedAt: CHECKED_AT, reviewBasis: `Rewritten in the ${AUDIT_ID} to what the official IRCC service finder supports; earlier country-specific claims were unverified.` }, note: 'Template record rewritten to remove unverified country-specific claims.', kind: 'template' });
    }
  }
  return { plan, problems };
}

function applyToSeedFiles(plan, write) {
  const report = [];
  for (const file of SEED_FILES) {
    const path = join(root, 'src', file);
    let text = readFileSync(path, 'utf8'); let count = 0;
    for (const p of plan.filter(p => p.kind === 'correct')) {
      if (!text.includes(`'${p.id}'`) && !text.includes(`"${p.id}"`)) continue;
      for (const e of p.edits) {
        const [from, to] = typeof e[0] === 'object' ? [e[1], e[2]] : e;
        const variants = [[from, to], [from.replaceAll("'", "\\'"), to.replaceAll("'", "\\'")], [from.replaceAll('"', '\\"'), to.replaceAll('"', '\\"')]];
        if (variants.some(([f, t]) => (t ? text.includes(t) : !text.includes(f)))) continue;
        const hit = variants.find(([f]) => text.includes(f));
        if (hit) {
          // Escape the replacement for the string literal it lands in.
          const at = text.indexOf(hit[0]), line = text.slice(text.lastIndexOf('\n', at) + 1, at);
          const quote = line.match(/^\s*\w+:\s*(['"])/)?.[1];
          const insert = quote ? to.replaceAll('\\', '\\\\').replaceAll(quote, `\\${quote}`) : hit[1];
          text = text.replace(hit[0], insert); count++;
        }
        else report.push(`${file} ${p.id}: seed text not found (${from.slice(0, 50)})`);
      }
    }
    if (count && write) writeFileSync(path, text);
    if (count) report.push(`${file}: ${count} edit(s)${write ? '' : ' (dry run)'}`);
  }
  return report;
}

// Backups from this script are about the size of the database, so only the
// original pre-audit copy and the newest KEEP_RECENT_BACKUPS later copies are kept.
const KEEP_RECENT_BACKUPS = 2;
export function pruneBackups(backupDir) {
  const original = `settlement-before-${AUDIT_ID}.sqlite`;
  const later = readdirSync(backupDir)
    .filter(name => name.startsWith(`settlement-before-${AUDIT_ID}-`) && name.endsWith('.sqlite'))
    .sort((a, b) => Number(b.match(/-(\d+)\.sqlite$/)?.[1] ?? 0) - Number(a.match(/-(\d+)\.sqlite$/)?.[1] ?? 0));
  const removed = later.slice(KEEP_RECENT_BACKUPS);
  for (const name of removed) rmSync(join(backupDir, name), { force: true });
  return { kept: [original, ...later.slice(0, KEEP_RECENT_BACKUPS)], removed };
}

export function run({ dbPath = join(root, 'data', 'settlement.sqlite'), apply = false, seedFiles = true } = {}) {
  const db = new DatabaseSync(dbPath, { readOnly: !apply });
  const rows = db.prepare('SELECT body FROM records').all().map(r => JSON.parse(r.body));
  const { plan, problems } = planCorrections(rows);
  const summary = { corrections: plan.filter(p => p.kind === 'correct').length, rejected: plan.filter(p => p.kind === 'reject').length, templates: plan.filter(p => p.kind === 'template').length, basisUpdates: plan.filter(p => p.kind === 'basis').length, problems };
  if (!apply) { db.close(); return { ...summary, seed: seedFiles ? applyToSeedFiles(plan, false) : [], applied: false }; }
  if (problems.length) { db.close(); throw new Error(`Refusing to apply: ${problems.join('; ')}`); }

  const backupDir = join(dirname(dbPath), 'backups'); mkdirSync(backupDir, { recursive: true });
  // Every applying run gets its own backup (the first keeps the plain name).
  let backup = join(backupDir, `settlement-before-${AUDIT_ID}.sqlite`);
  if (existsSync(backup)) backup = join(backupDir, `settlement-before-${AUDIT_ID}-${Date.now()}.sqlite`);
  db.exec(`VACUUM INTO '${backup.replaceAll("'", "''")}'`);
  pruneBackups(backupDir);
  // The records triggers call english_record(); register it as the store does.
  configureEnglishDatabase(db);
  const at = new Date().toISOString();
  db.exec('BEGIN');
  try {
    const update = db.prepare('UPDATE records SET body=? WHERE id=?');
    const delFts = db.prepare('DELETE FROM records_fts WHERE id=?');
    const insFts = db.prepare('INSERT INTO records_fts(id, title, summary, quote, topic) VALUES (?,?,?,?,?)');
    const insAudit = db.prepare('INSERT INTO audits(record_id,previous,next,reviewer,note,at,prev_hash,hash) VALUES (?,?,?,?,?,?,?,?)');
    for (const p of plan) {
      const previous = JSON.stringify(p.old), next = JSON.stringify(p.next);
      const prevHash = db.prepare('SELECT hash FROM audits ORDER BY id DESC LIMIT 1').get()?.hash || '0'.repeat(64);
      const hash = createHash('sha256').update(`${prevHash}|${p.id}|${p.kind}|${REVIEWER}|${at}|${previous}|${next}`).digest('hex');
      update.run(next, p.id);
      try { delFts.run(p.id); insFts.run(p.id, p.next.title || '', p.next.summary || '', p.next.quote || '', p.next.topic || ''); } catch {}
      insAudit.run(p.id, previous, next, REVIEWER, p.note.slice(0, 1000), at, prevHash, hash);
    }
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); db.close(); throw e; }
  db.close();
  return { ...summary, seed: seedFiles ? applyToSeedFiles(plan, true) : [], applied: true, backup };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = run({ apply: process.argv.includes('--apply') });
  console.log(JSON.stringify(result, null, 2));
  if (result.problems.length) process.exitCode = 1;
}
