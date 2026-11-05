// Knowledge-base corrections for 4 November 2026: dead-link repair batches one
// and two (phase F-family of the verify backlog) plus the first quote-drift
// restorations from the same audit. Dead-link corrections relocate a record
// whose official page died (HTTP 404 without an archive copy) to the page its
// authority now serves; quote-drift corrections restore the quote word for word
// from the live page the record already cites. Both restore the quote so the
// record can pass the automated official-page check
// (scripts/kb-verify-publish.js). Where the page does not support the old
// summary's claims, the summary states only what the page supports.
// Idempotent: a correction already applied is skipped.
//
//   node scripts/kb-corrections-2026-11-04.js            dry run (no writes)
//   node scripts/kb-corrections-2026-11-04.js --apply    back up, then apply
//
// --apply first copies the database to data/backups/, then updates the record
// body and full-text index, and appends a hash-chained audit row per record,
// the same way store.review() does. The same text edits are applied to the
// seed files under src/ when the record is defined there, so a rebuilt
// database does not bring the old text back. Approval status is not changed.
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { configureEnglishDatabase } from '../src/migrations.js';
import { configureIngestion, ingestionStore } from '../src/ingestion.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIT_ID = 'kb-audit-2026-11-04';
const CHECKED_AT = '2026-11-04';
const REVIEWER = 'KB audit 2026-11-04 (automated correction, not editorial review)';
const SEED_FILES = ['knowledge.js', 'kyc-records.js', 'global-records.js', 'insider-immigration-records.js', 'technical-immigration-records.js'];
const GENERATOR_FILES = ['scripts/inject-real-world-and-gap-records.js'];

// [from, to] pairs apply to the summary unless tagged {field: 'url'|'quote'|...}.
export const CORRECTIONS = [
  // Germany - BMJV Mietrecht overview (domain moved bmj.de -> bmjv.de and tree restructured)
  { id: 'de-mietrecht-kaution-schufa-housing-kyc', sources: ['https://www.bmjv.de/DE/themen/kaufen_reisen_wohnen/mietrecht/mietrecht_node.html'],
    note: 'The old bmj.de page died with the ministry site restructuring (bmj.de became bmjv.de); the Mietrecht overview now lives under DE/themen/kaufen_reisen_wohnen/. The old quote was an English paraphrase; the summary was rewritten to what the relocated page states - the deposit cap (highest security is the threefold of one month basic rent, Section 551 (1) BGB) and the overview further covering permissible rent and notices of termination. The installment right, the ten-percent rent brake limit and the application-document figure count are not stated on the relocated page and were removed.',
    edits: [
      [{ field: 'url' }, 'https://www.bmj.de/DE/themen/bauen_wohnen/mietrecht/mietrecht_node.html', 'https://www.bmjv.de/DE/themen/kaufen_reisen_wohnen/mietrecht/mietrecht_node.html'],
      [{ field: 'quote' }, 'The tenancy deposit cannot exceed three times the monthly basic rent excluding utilities.', 'Die Höhe der Mietsicherheit darf – unabhängig von ihrer Form – höchstens das Dreifache der auf einen Monat entfallenden Grundmiete betragen ( § 551 Absatz 1 BGB ).'],
      ['Under Section 551 of the German Civil Code (Bürgerliches Gesetzbuch - BGB), residential tenancy security deposits (Mietkaution) are strictly capped at a maximum of three times the net cold rent (Nettokaltmiete, excluding heating and utility charges). Tenants have the statutory legal right to pay the Kaution in three equal monthly installments starting on the move-in date. Under the Mietpreisbremse (rent ceiling regulation in tight housing markets), new lease rents cannot exceed 10% above the local comparative rent index (Mietspiegel). When applying for apartments, landlords commonly require a SCHUFA Bonitätsauskunft (credit solvency report), proof of income (last 3 payslips), and a rent debt-free certificate (Mietschuldenfreiheitsbescheinigung). Landlords cannot terminate leases or evict tenants without statutory just cause and a court bailiff order. This record does not adjudicate tenancy disputes.', 'The Federal Ministry of Justice (BMJV) Mietrecht overview states that the height of the Mietsicherheit - whatever its form, a rent deposit account, a guarantee, or the handover of a bank savings book - may not exceed the threefold of the basic rent attributable to one month (Section 551 (1) BGB). The same overview further covers the permissible rent at lease start, the Mietpreisbremse, notices of termination and their prerequisites; what landlords ask for in an individual apartment application, such as a SCHUFA Bonitätsauskunft and proof of income, is beyond the ministry page. This record does not adjudicate tenancy disputes.'] ] },

  // Ireland - RTB rent-cap page (rtb.ie restructured to a flat /renting/ tree)
  { id: 'ie-rtb-rpz-2-percent-rent-cap', sources: ['https://rtb.ie/renting/setting-and-reviewing-private-rents/'],
    note: 'The old rtb.ie/rent-pressure-zones page died in the site restructuring (all tenant-facing pages moved under rtb.ie/renting/); the rent-cap substance lives on the new setting-and-reviewing-private-rents page. The old quote and summary described the RPZ rule with HICP as the inflation index; the relocated page proves a fresh verbatim sentence (annual 2% cap or the rate of inflation, measured by CPI) and the 1 March 2026 national system, so quote and summary now state what the page states.',
    edits: [
      [{ field: 'url' }, 'https://www.rtb.ie/rent-pressure-zones', 'https://rtb.ie/renting/setting-and-reviewing-private-rents/'],
      [{ field: 'quote' }, 'In a Rent Pressure Zone, rent cannot be increased by more than 2 percent per year, and the cap applies to the dwelling, not the tenant.', 'Rent can only be increased once per year by 2% or the rate of inflation, whichever is lower.'],
      ['Crucially, this statutory rent restriction attaches directly to the property rather than the tenancy agreement; for tenancies that began before 1 March 2026 landlords cannot reset rent to market rates between tenancies. Under the national system that started on 1 March 2026, new tenancies follow different reset rules (generally at the start of a new tenancy or after 6 years), so check the RTB. Landlords must provide incoming tenants with an official RTB RPZ Rent Calculation Sheet demonstrating compliance based on the previous rent. This record does not adjudicate RTB dispute hearings.', 'For private tenancies created from 1 March 2026, re-setting to market rent is allowed only in specific cases, for example when a new tenancy begins after the tenant left by choice, breached their obligations, or the property no longer suits their needs; the page lists those cases in full. A printed RTB Rent Calculator output and details of 3 comparable properties from the RTB Rent Register document how the new rent was calculated. This record does not adjudicate RTB dispute hearings.'] ] },

  // Ireland - same record, follow-up after the relocation: the automated
  // summary-figure check still failed because the summary kept the old RPZ
  // framing (Act sections, nationwide-RPZ date, HICP index), none of which the
  // relocated page states.
  { id: 'ie-rtb-rpz-2-percent-rent-cap', sources: ['https://rtb.ie/renting/setting-and-reviewing-private-rents/'],
    note: 'Follow-up to the relocation above: the summary still opened with the old RPZ framing - Residential Tenancies Act sections 19 through 24B, Rent Pressure Zones nationwide since 20 June 2025, and the HICP index - none of which the relocated page states, so the automated summary-figure check failed. The opening now states the national system of rent control from 1 March 2026 (2% or the rate of inflation, measured by the Consumer Price Index) plus the Rent Pressure Zone review deferral the page states, the title follows the page, and an unclear clause about the reset rule is clarified.',
    edits: [
      [{ field: 'title' }, 'Residential Tenancies Board: Rent Pressure Zone (RPZ) 2% statutory rent cap adhering to property (Residential Tenancies Act 2004)', 'Residential Tenancies Board: 2% statutory rent cap for private tenancies from 1 March 2026, Rent Pressure Zone review deferral'],
      ['Under the Irish Residential Tenancies Act 2004 (as amended, Sections 19 through 24B), residential rental properties (in Rent Pressure Zones, which have covered the whole country since 20 June 2025) are subject to a strict statutory rent increase cap of 2% per annum or the Harmonised Index of Consumer Prices (HICP) inflation rate, whichever is lower.', 'Under the national system of rent control that the Residential Tenancies Board applies to all private tenancies from 1 March 2026, rent can only be increased once per year by 2% or the rate of inflation, whichever is lower, with the rate of inflation measured by the Consumer Price Index (CPI). In areas that became a Rent Pressure Zone (RPZ) in the last 2 years, the rent cannot be reviewed until 24 months after the date the rent was last set or reviewed for the tenancy.'],
      ['that rule is in the same page, not only the tenancy agreement.', 'the page lists those cases in full.'] ] },

  // Ireland - RTB security-deposits page (rtb.ie restructured to a flat /renting/ tree)
  { id: 'ie-rtb-security-deposit-and-rpz-protection-kyc', sources: ['https://rtb.ie/renting/rights-responsibilities/security-deposits/'],
    note: 'The old rtb.ie/ending-a-tenancy/disputes/security-deposits page died in the site restructuring (all tenant-facing pages moved under rtb.ie/renting/); the deposit substance lives on the new rights-responsibilities/security-deposits page. The old quote and summary described the advance-rent cap, the two-months total, the Residential Tenancies (No. 2) Act 2021 citation and District Court enforcement of RTB orders, none of which the simplified page states; the page proves the one-month deposit cap and the return rule, so quote and summary now state what the page states.',
    edits: [
      [{ field: 'url' }, 'https://www.rtb.ie/ending-a-tenancy/disputes/security-deposits', 'https://rtb.ie/renting/rights-responsibilities/security-deposits/'],
      [{ field: 'quote' }, 'Under Irish law, landlords cannot request a deposit exceeding one month rent and advance rent is strictly capped at one month.', 'A landlord cannot ask for a deposit that is more than one month\'s rent.'],
      ['Under the Residential Tenancies (No. 2) Act 2021, landlords in Ireland cannot lawfully demand an upfront deposit exceeding one month rent, nor can they demand advance rent payment exceeding one month. Tenants therefore cannot be required to pay more than two months rent in total upon signing a lease (one month deposit plus one month initial rent). Landlords must return the deposit promptly at the end of the tenancy unless there is proven rent arrears, unpaid utility charges, or damage beyond normal wear and tear. If a landlord unlawfully withholds a deposit, tenants can lodge a formal dispute application with the RTB, which issues legally binding dispute orders enforceable through the District Court.', 'The Residential Tenancies Board security deposits page states that a security deposit is a sum of money paid by a tenant to a landlord before the tenancy begins - financial protection for the landlord to cover rent arrears, bills owing or damage beyond normal wear and tear at the end of the tenancy. A landlord cannot ask for a deposit that is more than one month\'s rent; the agreed amount should be documented, and both the tenant and landlord should get a signed and dated receipt. The deposit must be returned at the end of the tenancy unless deductions are necessary. This record does not adjudicate RTB dispute hearings.'] ] },

  // Ontario - residential rent increases page (quote drift: the quote
  // paraphrased the guideline definition instead of the wording on the page,
  // and the summary named Forms N1/N2 and a fixed-term conversion the page
  // does not state)
  { id: 'ontario-rent-increase-guideline', sources: ['https://www.ontario.ca/page/residential-rent-increases'],
    note: 'The old quote paraphrased the guideline definition instead of the wording on the page, so the word-for-word check failed, and the summary named Forms N1 and N2 plus a fixed-term-to-month-to-month conversion, none of which the page states. The quote is now the verbatim guideline sentence and the summary restates the page: the 12-month rule, the 90-day written notice in the proper form available from the Landlord and Tenant Board, the 2027 guideline of 1.9% capped at 2.5%, the chart values (2.5% for 2024 and 2025, 2.1% for 2026), the November 15, 2018 exemption for new buildings and additions, the sample calculation, and the 12-month dispute window.',
    edits: [
      [{ field: 'quote' }, 'The rent increase guideline is the maximum amount a landlord can increase a tenant rent during a year without approval from the LTB.', 'The guideline is the maximum a landlord can increase most tenants\' rent during a year without the approval of the Landlord and Tenant Board.'],
      ['Under Ontario Residential Tenancies Act (RTA), annual rent increases for residential rental units first occupied for residential purposes on or before November 15, 2018 are capped by the Ontario rent increase guideline (2.5% in 2024 and 2025, 2.1% in 2026), requiring at least 90 days advance written notice on official Form N1. Rental units in buildings or additions first occupied for residential purposes after November 15, 2018 are exempt from rent control caps, allowing landlords to increase rent by any amount with 90 days written notice on Form N2. Fixed-term leases automatically convert to month-to-month tenancies with statutory security of tenure without requiring a new lease agreement. This record does not establish individual rent amounts or resolve tenancy disputes.', 'Ontario\'s Residential rent increases page states that in most cases the rent for a residential unit can be increased if at least 12 months have passed since the last rent increase or the date the tenancy began, and that the landlord must give the tenant written notice of a rent increase in the proper form at least 90 days before it takes effect; the proper forms are available from the Landlord and Tenant Board. The rent increase guideline for 2027 is 1.9%, and the guideline - capped at 2.5% to prevent significant one-time rent increases - is the maximum a landlord can increase most tenants\' rent during a year without the approval of the Landlord and Tenant Board; it applies to most private residential rental units covered by the Residential Tenancies Act, 2006. The chart of yearly guidelines on the page shows 2.5% for 2024 and 2025 and 2.1% for 2026. New buildings, additions to existing buildings and most new basement apartments occupied for the first time for residential purposes after November 15, 2018 are exempt from rent control. A sample calculation on the page: a monthly rent of $1,000 when signing a lease on June 1, 2026 could lawfully be increased 12 months later, on June 1, 2027, by 1.9% - an increase of $19.00, taking the rent to $1,019.00 per month, with written notice at least 90 days before the increase takes effect. A tenant who believes the rent was raised by an improper amount can dispute it at the Landlord and Tenant Board within 12 months after the amount was first charged. This record does not establish individual rent amounts or resolve tenancy disputes.'] ] },

  // England & Wales - gov.uk tenancy deposit protection overview (quote drift:
  // the summary carried Housing Act / Tenant Fees Act / Section 21 claims the
  // overview page does not state; the sibling record
  // uk-tenancy-deposit-protection-caps-and-dispute-kyc already carries the cap
  // and dispute claims verified against this same page)
  { id: 'uk-tenancy-deposit-scheme-tds-kyc', sources: ['https://www.gov.uk/tenancy-deposit-protection'],
    note: 'The old summary claimed the Housing Act 2004 registration duty, the Tenant Fees Act 2019 five-week and £50,000 deposit cap, prohibited fees, holding-deposit rules, Section 21 abolition and county-court possession, none of which the overview page states; the cap and dispute claims already live on the sibling record uk-tenancy-deposit-protection-caps-and-dispute-kyc, corrected against this same page. The quote is now the verbatim 10-day return sentence and the summary restates the page: the TDP requirement for assured periodic tenancies, APTs replacing assured shorthold tenancies on 1 May 2026, the three schemes, the 30-day protection rule, the 10-day return rule, and the separate schemes in Scotland and Northern Ireland. The title no longer cites the Tenant Fees Act.',
    edits: [
      [{ field: 'title' }, 'GOV.UK: Tenancy Deposit Scheme (TDS) protections and Tenant Fees Act 2019 rights', 'GOV.UK: Tenancy deposit protection - TDP schemes, the 30-day protection rule, and getting your deposit back'],
      [{ field: 'quote' }, 'Landlords must put your deposit in a government-approved tenancy deposit scheme within 30 days.', 'Your landlord must return your deposit within 10 days of you both agreeing how much you\'ll get back.'],
      ['Under the Housing Act 2004, residential tenancy deposits in England and Wales must be registered by the landlord with an authorized government-backed tenancy deposit protection scheme (Deposit Protection Service DPS, MyDeposits, or Tenancy Deposit Scheme TDS) within 30 days of receipt. Under the Tenant Fees Act 2019, security deposits are capped at a maximum of 5 weeks rent for tenancies with annual rent under £50,000. All administrative, referencing, inventory check, and contract fees charged by landlords or letting agents are illegal prohibited fees. Holding deposits to reserve a property are strictly capped at 1 week rent and must be refunded if the tenancy is not finalized. Landlords cannot evict tenants without a county court possession order. In England, Section 21 no-fault notices were abolished from 1 May 2026 (Renters\' Rights Act 2025), so possession now needs a Section 8 ground. This record does not arbitrate deposit claims.', 'The GOV.UK tenancy deposit protection overview states that a landlord must put a deposit in a government-approved tenancy deposit scheme (TDP) if the home is rented on an assured periodic tenancy (APT), and that APTs replaced assured shorthold tenancies on 1 May 2026. In England and Wales the deposit can be registered with the Deposit Protection Service, MyDeposits (including deposits that were held by Capita), or the Tenancy Deposit Scheme, and the landlord or letting agent must put the deposit in the scheme within 30 days of getting it. At the end of the tenancy the landlord must return the deposit within 10 days of the landlord and tenant both agreeing how much will be returned; Scotland and Northern Ireland run separate TDP schemes. This record does not arbitrate deposit claims.'] ] },

  // England & Wales - gov.uk MEES landlord guidance (quote drift: the quote
  // paraphrased the core rule and the summary cited the 2015 Regulations the
  // page does not name)
  { id: 'uk-private-rented-epc-mees-regulations-kyc', sources: ['https://www.gov.uk/guidance/domestic-private-rented-property-minimum-energy-efficiency-standard-landlord-guidance'],
    note: 'The old quote paraphrased the core rule and the summary cited the Energy Efficiency (Private Rented Property) (England and Wales) Regulations 2015, which the page does not name, and described the £5,000 penalty as for persistent non-compliance. The quote is now the verbatim statement of the continued-letting rule and the summary restates the page: the 2018 Minimum Level of Energy Efficiency standard (EPC band E), the 1 April 2018 new-tenancy bar and the 1 April 2020 continued-letting rule, the F-or-G compliance duty, the £3,500 (including VAT) cost cap with the all-improvements-made exemption on the PRS Exemptions Register, and enforcement by local authorities with the £5,000 per-property maximum fine and the £2,000/£4,000 breakdown by renting duration.',
    edits: [
      [{ field: 'quote' }, 'Under MEES regulations, it is unlawful for a landlord to let domestic private rented property with an EPC rating below E without a registered exemption.', 'Since 1 April 2020, landlords can no longer let or continue to let properties covered by the MEES Regulations if they have an EPC rating below E, unless they have a valid exemption in place.'],
      ['Under the Energy Efficiency (Private Rented Property) (England and Wales) Regulations 2015, private landlords are legally prohibited from granting a new tenancy or continuing to let a domestic property that has an Energy Performance Certificate (EPC) rating of F or G, unless an official statutory exemption is registered on the PRS Exemptions Register. Landlords must invest up to £3,500 including VAT in energy efficiency improvements (such as insulation or heating upgrades) before claiming a high-cost exemption. Local authorities enforce MEES compliance through financial penalty notices of up to £5,000 per property for persistent non-compliance. This record outlines statutory energy efficiency standards in UK private tenancies.', 'The GOV.UK landlord guidance for domestic private rented property explains how to comply with the 2018 Minimum Level of Energy Efficiency standard (EPC band E) under the MEES Regulations. Since 1 April 2018 the Regulations have barred letting domestic properties on new tenancies where the EPC rating is below E, and from 1 April 2020 this extends to continued lettings; where a property has an EPC rating of F or G, the landlord must take appropriate steps to comply with the requirements of the MEES Regulations. The cost cap: a landlord is not currently required to spend more than £3,500 (including VAT) on energy efficiency improvements; if the property cannot be improved to EPC E for £3,500 or less, all improvements that can be made up to that amount should be made and an all-improvements-made exemption registered on the PRS Exemptions Register. The MEES Regulations are enforced by local authorities; the maximum amount a landlord can be fined per property is £5,000 in total, with penalties of up to £2,000 for renting out a non-compliant property for less than 3 months and up to £4,000 for 3 months or more. This record outlines statutory energy efficiency standards in UK private tenancies.'] ] },

  // Germany - BGB section 551 Einzelnorm (short-quote repair: the quote was the
  // section heading, 5 words, below the 8-word minimum)
  { id: 'de-bgb-551-mietkaution-three-installments', sources: ['https://www.gesetze-im-internet.de/bgb/__551.html'],
    note: 'The old quote was the section heading (Begrenzung und Anlage von Mietsicherheiten) - 5 words, below the 8-word minimum - so the record failed the quote_too_short check. The quote is now the verbatim statutory sentence on the three equal monthly installment right (Section 551 paragraph 2 BGB); the summary already matched the page (the threefold cap excluding operating costs, the installment schedule with the first payment at the start of the tenancy and the later ones with the following rent payments, and the voidness of agreements to the disadvantage of the tenant under paragraph 4) and needed no change.',
    edits: [
      [{ field: 'quote' }, 'Begrenzung und Anlage von Mietsicherheiten', 'Ist als Sicherheit eine Geldsumme bereitzustellen, so ist der Mieter zu drei gleichen monatlichen Teilzahlungen berechtigt.'] ] },

  // Canada - IRCC work-off-campus page (short-quote repair: the quote was the
  // page title; the summary carried PGWP-reform claims the page does not state)
  { id: 'ca-ircc-study-permit-pgwp-rules', sources: ['https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/work-off-campus.html'],
    note: 'The old quote was the page title (7 words, below the 8-word minimum) and the summary carried the PGWP reforms (master programs of at least 8 months, a 3-year PGWP, CLB 5 and CLB 7 language benchmarks) plus the Fall 2024 framing, none of which the off-campus work page states. The quote is now the verbatim study-permit condition the page quotes (24 hours per week off campus or full-time during regular breaks, paragraph 186(v) of the IRPR) and the summary restates the page: the off-campus work condition printed on the permit, the how-many-hours section (up to 24 hours per week during regular school terms, more than 1 job to make up those hours, a permit limited to 20 hours per week still allowing up to 24), the eligibility requirements for working without a work permit, and unlimited hours during scheduled breaks. The page states its minimum program length with a figure that sits outside the 2,400-character evidence window archived around the quote, so the summary refers to the minimum program-length requirement without citing that figure. The title now follows the page.',
    edits: [
      [{ field: 'title' }, 'IRCC: Study Permit, 24-Hour Work Cap, and PGWP Eligibility Reforms', 'IRCC: Work off campus as an international student - the 24 hours per week condition and eligibility rules'],
      [{ field: 'quote' }, 'Work off campus as an international student', 'May work 24 hours per week off campus or full-time during regular breaks if meeting criteria outlined in paragraph 186(v) of the Immigration and Refugee Protection Regulations (IRPR).'],
      ['Effective Fall 2024, eligible full-time international students holding a valid study permit with off-campus work authorization are permitted to work up to 24 hours per week off-campus during regular academic semesters, and full-time during regularly scheduled academic breaks. Students must maintain continuous full-time enrollment; dropping to part-time status forfeits off-campus work rights. Under updated PGWP guidelines, graduates of master degree programs of at least 8 months are eligible for a 3-year PGWP, while college diploma graduates must graduate from programs linked to designated national labour market shortages and meet minimum language benchmarks (CLB 5 for college, CLB 7 for university) to qualify for a PGWP. This record does not issue study permits.', 'The IRCC Work off campus as an international student page states the condition that must be printed on a study permit to apply for a SIN to work off campus: may work 24 hours per week off campus or full-time during regular breaks if meeting criteria outlined in paragraph 186(v) of the Immigration and Refugee Protection Regulations (IRPR). During regular school terms or semesters the page says you can work up to 24 hours per week, and that you can work more than 1 job to make up those hours as long as you continue to meet the conditions of your study permit; it adds that a study permit saying you may only work 20 hours per week off campus still allows working up to 24 hours per week as long as the eligibility requirements continue to be met. The page\'s eligibility requirements for working off campus without a work permit are: be a full-time student at a designated learning institution who has started the study program, be enrolled in a post-secondary academic, vocational or professional training program or a secondary-level vocational training program in Quebec, hold a valid study permit or have applied to extend it before it expired, and have a study program that meets the page\'s minimum program-length requirement and leads to a degree, diploma or certificate. During scheduled breaks in the school year, such as summer and winter holidays or a reading week, the page states such a student can work unlimited hours off campus and take courses on a part-time or full-time basis. This record does not issue study permits.'],
      ['The IRCC Work off campus as an international student page states the condition that must be printed on a study permit to apply for a SIN to work off campus: may work 24 hours per week off campus or full-time during regular breaks if meeting criteria outlined in paragraph 186(v) of the Immigration and Refugee Protection Regulations (IRPR). To work off campus without a work permit, the page requires that the person be a full-time student at a designated learning institution who has started their study program, be enrolled in a post-secondary academic, vocational or professional training program or a secondary-level vocational training program in Quebec, hold a valid study permit or have applied to extend it before it expired, and that the study program be at least 6 months long and lead to a degree, diploma or certificate. During scheduled breaks in the school year, such as summer and winter holidays or a reading week, the page states such a student can work unlimited hours off campus and take courses on a part-time or full-time basis without that affecting the ability to work unlimited hours during the break. This record does not issue study permits.', 'The IRCC Work off campus as an international student page states the condition that must be printed on a study permit to apply for a SIN to work off campus: may work 24 hours per week off campus or full-time during regular breaks if meeting criteria outlined in paragraph 186(v) of the Immigration and Refugee Protection Regulations (IRPR). During regular school terms or semesters the page says you can work up to 24 hours per week, and that you can work more than 1 job to make up those hours as long as you continue to meet the conditions of your study permit; it adds that a study permit saying you may only work 20 hours per week off campus still allows working up to 24 hours per week as long as the eligibility requirements continue to be met. The page\'s eligibility requirements for working off campus without a work permit are: be a full-time student at a designated learning institution who has started the study program, be enrolled in a post-secondary academic, vocational or professional training program or a secondary-level vocational training program in Quebec, hold a valid study permit or have applied to extend it before it expired, and have a study program that meets the page\'s minimum program-length requirement and leads to a degree, diploma or certificate. During scheduled breaks in the school year, such as summer and winter holidays or a reading week, the page states such a student can work unlimited hours off campus and take courses on a part-time or full-time basis. This record does not issue study permits.'] ] },

  // Canada - IRCC Express Entry who-can-apply page (short-quote repair: the
  // quote was a navigation heading; the summary carried CRS/FSW/PNP figures
  // the page does not state)
  { id: 'ca-ircc-express-entry-fsw-cec-pnp-pr', sources: ['https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/works.html'],
    note: 'The old quote was a navigation heading (4 words) and the summary carried figures the Who-can-apply page does not state (CRS out of 1,200 points, the Federal Skilled Worker 67-point grid, 600 nomination points) plus a category-based-draws list. The quote is now the verbatim opening sentence (Express Entry is an online system managing applications for 3 programs) and the summary restates the page: the three programs with their one-line audience, the key differences in eligibility criteria (job-offer and education requirements per program), the Provincial Nominee Program section, and the steps from checking your score to applying for permanent residence. The title follows the page.',
    edits: [
      [{ field: 'title' }, 'IRCC: Express Entry Permanent Residence Selection Streams (FSW, CEC, and PNP)', 'IRCC: Express Entry - the online system managing applications for the Canadian Experience Class, Federal Skilled Worker, and Federal Skilled Trades programs'],
      [{ field: 'quote' }, 'How Express Entry works', 'Express Entry is an online system that we use to manage immigration applications for 3 programs'],
      ['Canada Express Entry system manages permanent residence applications for three economic immigration programs: Federal Skilled Worker (FSW), Canadian Experience Class (CEC), and Federal Skilled Trades (FST). Candidates submit an online profile and are scored under the Comprehensive Ranking System (CRS) out of 1,200 points based on human capital (age, education, language, work experience). FSW requires 67 points on a separate grid, at least 1 continuous year of skilled work, and settlement funds. CEC requires 1 year of skilled Canadian work experience and has no settlement funds requirement. Provinces nominate candidates through aligned Provincial Nominee Program (PNP) streams, awarding 600 additional CRS points, which in practice usually leads to an Invitation to Apply (ITA) but is not a legal guarantee. Category-based draws target specific occupational priorities including STEM, healthcare, trades, transport, agriculture, and French language proficiency. This record does not issue ITAs.', 'IRCC\'s Express Entry: Who can apply page states that Express Entry is an online system used to manage immigration applications for 3 programs: Canadian Experience Class, for skilled workers with eligible Canadian work experience; the Federal Skilled Worker Program, for skilled workers with eligible foreign or Canadian work experience; and the Federal Skilled Trades Program, for skilled workers who are qualified in a skilled trade. The page sets out the key differences in eligibility criteria across those programs, including job-offer and education requirements per program, and covers the Provincial Nominee Program (PNP). The steps the page lists run from checking your score and getting your documents ready through creating a profile and rounds of invitations to applying for permanent residence. Check the page for each program\'s eligibility details. This record does not issue invitations to apply.'] ] },

  // Canada - IRCC ECA page (short-quote repair: the quote was the page title;
  // the summary described a worldwide assessment system the page does not state)
  { id: 'global-educational-credential-assessment-equivalencies', sources: ['https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessed.html'],
    note: 'The old quote was the page title (7 words, below the 8-word minimum) and the summary described a worldwide system (WES, ICAS and IQAS validity for 5 years, VETASSESS, ACS, Engineers Australia, ZAB, Anabin, ECCTIS, Nuffic) that the IRCC page does not state. The quote is now the verbatim what-is-an-ECA sentence and the summary restates the page: the ECA verifies a foreign credential is valid and equal to a Canadian one, immigration-purpose assessments must come from organizations designated by IRCC, processing times and costs vary, the report and its reference number go into the Express Entry profile, and the points table maps results to Canadian equivalency levels. The title follows the page.',
    edits: [
      [{ field: 'title' }, 'Statutory Standards: Educational Credential Assessments (ECA) for Skilled Migration', 'IRCC: Educational Credential Assessment (ECA) for Express Entry - what it verifies, designated bodies, and validity'],
      [{ field: 'quote' }, 'Educational credential assessment (ECA) for Express Entry', 'An Educational credential assessment (ECA) is used to verify that your foreign degree, diploma, or certificate (or other proof of your credential) is valid and equal to a Canadian one.'],
      ['Skilled immigration programs worldwide require formal verification that foreign academic credentials equal domestic educational standards. Canada mandates an Educational Credential Assessment (ECA) from designated bodies such as WES, ICAS, or IQAS, valid for 5 years. Australia requires formal skills assessment through occupational authorities including VETASSESS, ACS (computing), and Engineers Australia. Germany evaluates university degrees through the Central Office for Foreign Education (ZAB) and the Anabin database. The UK uses ECCTIS statements of comparability, and the Netherlands utilizes Nuffic evaluations. Applicants must submit official transcripts sent directly from degree-granting universities. This record does not issue credential equivalency assessments.', 'IRCC\'s educational credential assessment page states that an Educational credential assessment (ECA) is used to verify that a foreign degree, diploma, or certificate is valid and equal to a Canadian one, and that an ECA for immigration purposes must be obtained from an organization or professional body designated by Immigration, Refugees and Citizenship Canada; processing times and costs vary by organization or professional body. The ECA report and its reference number must be included in the Express Entry profile, and the points table maps assessment results to Canadian equivalency levels under the Comprehensive Ranking System. This record does not issue credential equivalency assessments.'] ] },

  // Ontario - same Residential rent increases page as the guideline record
  // (drift repair: the quote and summary cited RTA sections 116/135, form
  // numbers and a ignore-the-demand right the page does not state)
  { id: 'ontario-rta-unlawful-rent-increase-defense-and-form-n1', sources: ['https://www.ontario.ca/page/residential-rent-increases'],
    note: 'The old quote and summary cited Residential Tenancies Act sections 116 and 135, Forms N1, N2 and T1, and a tenant right to ignore an increase and continue paying the existing rent - none of which the Residential rent increases page states (the page speaks of the proper form, not form numbers). The quote is now the verbatim dispute sentence and the summary restates the page: the 90-day written notice in the proper form available from the Landlord and Tenant Board, the 12-month dispute window for missing notice or improper amounts, and the guideline maximum for most tenants. The title follows the page.',
    edits: [
      [{ field: 'title' }, 'Ontario Rent Increases: Mandatory 90-day Form N1 notice, annual guideline caps, and unlawful increase remedies (RTA s. 116)', 'Ontario: disputing an improper rent increase - the 90-day notice rule and the 12-month Landlord and Tenant Board dispute window'],
      [{ field: 'quote' }, 'Under Ontario RTA section 116, a rent increase is legally void unless the landlord serves an official 90-day Form N1 notice conforming to guideline caps.', 'If your landlord has not provided the proper notice, or you believe that your rent has been raised by an improper amount, you can dispute it at the Landlord and Tenant Board within 12 months after the amount was first charged.'],
      ['Under Ontario Residential Tenancies Act section 116, any rent increase is legally invalid, void, and unenforceable unless the landlord delivers the official Landlord and Tenant Board (LTB) Notice of Rent Increase (Form N1 or N2) to the tenant at least 90 days before the effective date. For residential rental properties first occupied for residential purposes prior to November 15, 2018, rent increases are capped at the provincial annual guideline (2.5% for 2024 and 2025, 2.1% for 2026). If a landlord demands a rent hike without giving 90 days of written notice on Form N1, the tenant has the complete statutory right to ignore the demand and continue paying their existing lawful rent. If the tenant mistakenly pays an unlawful rent increase, they can file LTB Form T1 within 12 months to obtain an order requiring the landlord to refund the overpayment under RTA s. 135.', 'Ontario\'s Residential rent increases page states that the landlord must give the tenant written notice of a rent increase in the proper form at least 90 days before it takes effect, with the proper forms available from the Landlord and Tenant Board. If the landlord has not provided the proper notice, or the tenant believes the rent has been raised by an improper amount, the tenant can dispute it at the Landlord and Tenant Board within 12 months after the amount was first charged. For most tenants, the rent cannot go up by more than the rent increase guideline in a year; the page states that the guideline is the maximum a landlord can increase most tenants\' rent during a year without the approval of the Landlord and Tenant Board. This record does not adjudicate rent disputes or order refunds.'] ] },

  // Same record, generator-file walk: scripts/inject-real-world-and-gap-records.js
  // still holds the pre-1-November summary (the 1 November script corrected the
  // database row but, through a path bug fixed in this script today, never
  // reached the generator copy). seedOnly: the database end state is already
  // present, so this entry only walks the generator copy and planCorrections
  // must not treat its from-string as a missing database correction.
  { id: 'ontario-rta-unlawful-rent-increase-defense-and-form-n1', seedOnly: true, sources: ['https://www.ontario.ca/page/residential-rent-increases'],
    note: 'Generator-file follow-up for the correction above: the generator copy still holds the pre-1-November summary (guideline 2.5% for 2024 through 2026), so the same end-state summary is applied to it directly; the database row needed no change.',
    edits: [
      ['Under Ontario Residential Tenancies Act section 116, any rent increase is legally invalid, void, and unenforceable unless the landlord delivers the official Landlord and Tenant Board (LTB) Notice of Rent Increase (Form N1 or N2) to the tenant at least 90 days before the effective date. For residential rental properties first occupied for residential purposes prior to November 15, 2018, rent increases are capped at the provincial annual guideline (2.5% for 2024 through 2026). If a landlord demands a rent hike without giving 90 days of written notice on Form N1, the tenant has the complete statutory right to ignore the demand and continue paying their existing lawful rent. If the tenant mistakenly pays an unlawful rent increase, they can file LTB Form T1 within 12 months to obtain an order requiring the landlord to refund the overpayment under RTA s. 135.', 'Ontario\'s Residential rent increases page states that the landlord must give the tenant written notice of a rent increase in the proper form at least 90 days before it takes effect, with the proper forms available from the Landlord and Tenant Board. If the landlord has not provided the proper notice, or the tenant believes the rent has been raised by an improper amount, the tenant can dispute it at the Landlord and Tenant Board within 12 months after the amount was first charged. For most tenants, the rent cannot go up by more than the rent increase guideline in a year; the page states that the guideline is the maximum a landlord can increase most tenants\' rent during a year without the approval of the Landlord and Tenant Board. This record does not adjudicate rent disputes or order refunds.'] ] }
];

function applyEdits(record, edits) {
  const next = { ...record }; const missing = []; let changed = 0;
  const touched = new Set();
  const parsed = edits.map(e => typeof e[0] === 'object' ? [e[0].field, e[1], e[2]] : ['summary', e[0], e[1]]);
  parsed.forEach(([field, from, to]) => {
    const text = next[field] ?? '';
    // Already applied: the replacement is present.
    if (text.includes(to)) { touched.add(field); return; }
    if (text.includes(from)) { next[field] = text.replace(from, to).replace(/\s{2,}/g, ' ').trim(); touched.add(field); changed++; return; }
    missing.push(`${field}: ${from.slice(0, 70)}`);
  });
  // A field may list several from-paths to the same end state (a record caught
  // mid-history carries intermediate text); a from-row that misses is only a
  // problem when no row for that field matched anything.
  const open = missing.filter(m => !touched.has(m.slice(0, m.indexOf(':'))));
  return { next, missing: open, changed };
}

export function planCorrections(rows) {
  const byId = new Map(rows.map(r => [r.id, r]));
  const plan = []; const problems = [];
  for (const c of CORRECTIONS) {
    // seedOnly entries exist to walk seed/generator copies whose database row
    // is already at the end state; their from-strings are not database text.
    if (c.seedOnly) continue;
    const old = byId.get(c.id);
    if (!old) { problems.push(`${c.id}: not in database`); continue; }
    const { next, missing, changed } = applyEdits(old, c.edits);
    if (missing.length) problems.push(`${c.id}: text not found -> ${missing.join(' | ')}`);
    const basis = `Corrected in the ${AUDIT_ID}: ${c.note} Checked against ${c.sources.join(', ')}. Not yet editorially reviewed.`;
    if (changed) plan.push({ id: c.id, old, next: { ...next, checkedAt: CHECKED_AT, reviewBasis: basis }, note: `${c.note} Sources: ${c.sources.join(', ')}`, kind: 'correct', edits: c.edits });
  }
  return { plan, problems };
}

// Sync corrections into seed/generator files that define a record, so a rebuilt
// database does not bring the old text back. Seed file names are joined under src/.
export function applyToSeedFiles(entries, write) {
  const report = [];
  for (const file of [...SEED_FILES, ...GENERATOR_FILES]) {
    const path = file.startsWith('scripts/') ? join(root, file) : join(root, 'src', file);
    if (!existsSync(path)) continue;
    let text = readFileSync(path, 'utf8'); let count = 0;
    for (const p of entries) {
      if (!text.includes(`'${p.id}'`) && !text.includes(`"${p.id}"`)) continue;
      for (const e of p.edits) {
        const [from, to] = typeof e[0] === 'object' ? [e[1], e[2]] : e;
        const variants = [[from, to], [from.replaceAll("'", "\\'"), to.replaceAll("'", "\\'")], [from.replaceAll('"', '\\"'), to.replaceAll('"', '\\"')]];
        if (variants.some(([f, t]) => text.includes(t))) continue;
        const hit = variants.find(([f]) => text.includes(f));
        if (hit) {
          const at = text.indexOf(hit[0]), line = text.slice(text.lastIndexOf('\n', at) + 1, at);
          const quote = line.match(/^\s*\w+:*\s*(['"])/)?.[1];
          const insert = quote ? to.replaceAll('\\', '\\\\').replaceAll(quote, `\\${quote}`) : hit[1];
          text = text.replace(hit[0], insert); count++;
        } else report.push(`${file} ${p.id}: seed text not found (${from.slice(0, 50)})`);
      }
    }
    if (count && write) writeFileSync(path, text);
    if (count) report.push(`${file}: ${count} edit(s)${write ? '' : ' (dry run)'}`);
  }
  return report;
}

const seedEntries = CORRECTIONS.map(c => ({ id: c.id, edits: c.edits }));

// This batch is the first to relocate records to NEW official URLs, and the
// publish queue only fetches sources whose access policy has been reviewed
// (src/publish-queue.js). Scripts must not set that policy with raw SQL -
// test/script-provenance.test.js rejects exactly that - so the registrations
// go through the store's own reviewed registration API (registerSource /
// permitSource), which writes a source_policy_reviews row per change. Tier A
// mirrors what the same authorities already hold: bmj.de was registered as
// tier A, and every other rtb.ie source is tier A.
export const SOURCE_REGISTRATIONS = [
  { id: 'source-de-mietrecht-kaution-schufa-housing-kyc', op: 'register', tier: 'A',
    url: 'https://www.bmjv.de/DE/themen/kaufen_reisen_wohnen/mietrecht/mietrecht_node.html', owner: 'www.bmjv.de',
    reviewer: REVIEWER,
    note: 'Registered for relocating record de-mietrecht-kaution-schufa-housing-kyc: the Federal Ministry of Justice moved bmj.de to bmjv.de and the Mietrecht overview now lives under DE/themen/kaufen_reisen_wohnen/. Same statutory authority as the previously registered bmj.de source (tier A); the page was fetched and checked during the automated correction. Automated correction, not an editorial content review.' },
  { id: 'seed-ie-rtb-rpz-2-percent-rent-cap', op: 'permit', tier: 'A',
    url: 'https://rtb.ie/renting/setting-and-reviewing-private-rents/', owner: 'rtb.ie',
    reviewer: REVIEWER,
    note: 'Policy review for relocating record ie-rtb-rpz-2-percent-rent-cap: rtb.ie restructured all tenant-facing pages under /renting/ and the rent-cap substance lives on the new setting-and-reviewing-private-rents page. Same statutory board as the other registered rtb.ie sources (tier A); the page was fetched and checked during the automated correction. Automated correction, not an editorial content review.' },
  { id: 'source-ie-rtb-security-deposit-and-rpz-protection-kyc', op: 'register', tier: 'A',
    url: 'https://rtb.ie/renting/rights-responsibilities/security-deposits/', owner: 'rtb.ie',
    reviewer: REVIEWER,
    note: 'Registered for relocating record ie-rtb-security-deposit-and-rpz-protection-kyc: rtb.ie restructured all tenant-facing pages under /renting/ and the deposit substance lives on the new rights-responsibilities/security-deposits page. Same statutory board as the other registered rtb.ie sources (tier A); the page was fetched and checked during the automated correction. Automated correction, not an editorial content review.' }
];

// Read-only: what the source registrations would do right now.
export function planSourceOps(db) {
  const ops = [];
  for (const s of SOURCE_REGISTRATIONS) {
    const row = db.prepare('SELECT tier, policy FROM sources WHERE id = ?').get(s.id);
    if (row && row.policy === 'manual_permitted' && row.tier === s.tier) continue;
    const byUrl = db.prepare('SELECT id FROM sources WHERE url = ?').get(s.url);
    if (!row && byUrl) { ops.push({ id: s.id, op: 'blocked', detail: `url already registered as ${byUrl.id}` }); continue; }
    ops.push({ id: s.id, op: row ? 'permit' : 'register', tier: s.tier });
  }
  return ops;
}

function applySourceOps(db, ops) {
  configureIngestion(db);
  const ingestion = ingestionStore(db);
  const done = [];
  for (const op of ops) {
    const s = SOURCE_REGISTRATIONS.find(x => x.id === op.id);
    if (!s || op.op === 'blocked') continue;
    if (op.op === 'register') ingestion.registerSource({ id: s.id, url: s.url, owner: s.owner, tier: s.tier, language: 'en', reviewer: s.reviewer, note: s.note });
    else ingestion.permitSource(s.id, { tier: s.tier, reviewer: s.reviewer, note: s.note });
    done.push(`${op.op}:${s.id}`);
  }
  return done;
}

export function run({ dbPath = join(root, 'data', 'settlement.sqlite'), apply = false, seedFiles = true } = {}) {
  const db = new DatabaseSync(dbPath, { readOnly: !apply });
  const rows = db.prepare('SELECT body FROM records').all().map(r => JSON.parse(r.body));
  const { plan, problems } = planCorrections(rows);
  const sourceOps = planSourceOps(db);
  const summary = { corrections: plan.length, sourceOps, problems };
  if (!apply) { db.close(); return { ...summary, seed: seedFiles ? applyToSeedFiles(seedEntries, false) : [], applied: false, backup: null }; }
  if (problems.length) { db.close(); throw new Error(`Refusing to apply: ${problems.join('; ')}`); }
  if (!plan.length && !sourceOps.length) {
    db.close();
    return { ...summary, seed: seedFiles ? applyToSeedFiles(seedEntries, true) : [], applied: true, backup: null, noted: 'nothing to change in the database (already applied); seed files synced' };
  }

  const backupDir = join(dirname(dbPath), 'backups'); mkdirSync(backupDir, { recursive: true });
  let backup = join(backupDir, `settlement-before-${AUDIT_ID}.sqlite`);
  if (existsSync(backup)) backup = join(backupDir, `settlement-before-${AUDIT_ID}-${Date.now()}.sqlite`);
  db.exec(`VACUUM INTO '${backup.replaceAll("'", "''")}'`);
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
  // Source registrations run after the record transaction; each opens its own
  // transaction inside the ingestion API and appends a source_policy_reviews row.
  let sourcesApplied = [];
  if (sourceOps.some(op => op.op !== 'blocked')) sourcesApplied = applySourceOps(db, sourceOps);
  db.close();
  return { ...summary, seed: seedFiles ? applyToSeedFiles(seedEntries, true) : [], sourcesApplied, applied: true, backup };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = run({ apply: process.argv.includes('--apply') });
  console.log(JSON.stringify(result, null, 2));
  if (result.problems.length) process.exitCode = 1;
}
