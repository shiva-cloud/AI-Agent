import test from 'node:test';
import assert from 'node:assert/strict';
import { insiderImmigrationRecords, insiderSources } from '../src/insider-immigration-records.js';
import { assertEnglishRecord } from '../src/language.js';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

test('all 54 insider immigration records are valid approved English records', () => {
  assert.equal(insiderImmigrationRecords.length, 54);
  const ids = new Set();
  for (const r of insiderImmigrationRecords) {
    assert.doesNotThrow(() => assertEnglishRecord(r), `Validation failed for ${r.id}`);
    assert.equal(r.status, 'approved');
    assert.ok(!ids.has(r.id), `Duplicate ID: ${r.id}`);
    ids.add(r.id);
  }
});

test('all 51 insider sources are properly defined with authoritative tiers', () => {
  assert.equal(insiderSources.length, 51);
  for (const s of insiderSources) {
    assert.ok(s.id);
    assert.ok(s.url.startsWith('https://'));
    assert.equal(s.tier, 'A');
    assert.equal(s.policy, 'manual_permitted');
  }
});

test('all 54 insider records round-trip through an isolated SQLite fixture', t => {
  const store = openStore(':memory:');
  for(const record of insiderImmigrationRecords)store.db.prepare('INSERT OR REPLACE INTO records(id,body) VALUES (?,?)').run(record.id,JSON.stringify({...record,status:'pending'}));
  const db = store.db;
  const selectStmt = db.prepare('SELECT body FROM records WHERE id = ?');

  for (const r of insiderImmigrationRecords) {
    const row = selectStmt.get(r.id);
    assert.ok(row, `Record missing from database: ${r.id}`);
    const parsed = JSON.parse(row.body);
    assert.equal(parsed.id, r.id);
    assert.equal(parsed.status, 'pending');
  }
  store.db.close();
});

test('engine correctly retrieves domestic and international insider records for real-world settlement questions', () => {
  const records = insiderImmigrationRecords;
  const now = new Date('2026-10-31T12:00:00Z');

  const testCases = [
    // ── 1. Canada Domestic Insider Queries ──────────────────────────────────────
    {
      name: 'Maintained Status Travel',
      input: { question: 'Can I travel outside Canada while on maintained status PGWP in Toronto?', city: 'Toronto' },
      expectedRecord: 'ircc-maintained-status-travel-trap'
    },
    {
      name: 'Remote Work Visitor',
      input: { question: 'Can I work remotely for a foreign employer on a visitor visa in Toronto?', city: 'Toronto' },
      expectedRecord: 'ircc-remote-work-visitor-status'
    },
    {
      name: 'Expired PR Card Land Border',
      input: { question: 'Can I enter Canada at land border with expired PR card in private vehicle in Toronto?', city: 'Toronto' },
      expectedRecord: 'cbsa-expired-pr-card-land-border-entry'
    },
    {
      name: 'Flagpoling Restrictions',
      input: { question: 'Can I flagpole at Rainbow Bridge for PGWP work permit at border in Toronto?', city: 'Toronto' },
      expectedRecord: 'cbsa-flagpoling-restrictions-and-pgwp-ban'
    },
    {
      name: 'Section 117(9)(d) Exclusion',
      input: { question: 'What happens if a dependent child was non-accompanying and unexamined section 117(9)(d) in Toronto?', city: 'Toronto' },
      expectedRecord: 'ircc-family-class-exclusion-117-9-d'
    },
    {
      name: 'RTA Section 5(i) Shared Kitchen',
      input: { question: 'Does RTA apply if I share kitchen or bathroom with the landlord owner in Ontario?', city: 'Toronto' },
      expectedRecord: 'ontario-rta-section-5-shared-kitchen-exemption'
    },
    {
      name: 'Post-2018 Rent Control',
      input: { question: 'How to verify rent control exemption for building first occupied after November 15 2018 in Toronto?', city: 'Toronto' },
      expectedRecord: 'ontario-post-2018-rent-control-verification'
    },
    {
      name: 'TFSA Non-Resident Penalty',
      input: { question: 'What is the CRA penalty for contributing to TFSA as a non-resident 1% tax in Toronto?', city: 'Toronto' },
      expectedRecord: 'cra-tfsa-non-resident-contribution-penalty'
    },
    {
      name: 'Cost Base Step-Up FMV',
      input: { question: 'Does Canada tax foreign capital gains prior to landing fair market value cost base step-up in Toronto?', city: 'Toronto' },
      expectedRecord: 'cra-cost-base-step-up-landing-fmv'
    },
    {
      name: 'Parental Gift Deed',
      input: { question: 'Is wire transfer gift from parents taxable in Canada Deed of Gift FINTRAC in Toronto?', city: 'Toronto' },
      expectedRecord: 'fintrac-overseas-parental-gift-deed'
    },
    {
      name: 'Auto Insurance Experience Letter',
      input: { question: 'How to get auto insurance discount with foreign Claims-Free Letter of Experience in Ontario FSRA?', city: 'Toronto' },
      expectedRecord: 'fsra-auto-insurance-foreign-experience-letter'
    },
    {
      name: 'Self-Employed CEC Exclusion',
      input: { question: 'Does self-employed contract work in Toronto count for Canadian Experience Class CEC section 87.1(3)(b)?', city: 'Toronto' },
      expectedRecord: 'ircc-self-employed-work-cec-exclusion'
    },
    {
      name: 'Dual Intent IRPA 22(2)',
      input: { question: 'Can I enter Canada on visitor visa if I have pending Express Entry PR dual intent in Toronto?', city: 'Toronto' },
      expectedRecord: 'ircc-dual-intent-temporary-residence'
    },
    {
      name: 'CBSA Digital Device Search Limits',
      input: { question: 'Can CBSA border officers search my digital device phone search passcode at airport in Toronto?', city: 'Toronto' },
      expectedRecord: 'cbsa-digital-device-search-limits'
    },
    {
      name: 'Lease Assignment 30-Day Exit',
      input: { question: 'Can I terminate early with 30 days notice if landlord refuses lease assignment in Toronto?', city: 'Toronto' },
      expectedRecord: 'ontario-rta-lease-assignment-30-day-exit'
    },
    {
      name: 'Form N12 Compensation Timing Void',
      input: { question: 'Is N12 eviction notice void if landlord fails to pay one month compensation before termination date in Toronto?', city: 'Toronto' },
      expectedRecord: 'ontario-rta-n12-compensation-timing-void'
    },
    {
      name: 'CRA T1135 Personal-Use Property',
      input: { question: 'Do I need to report family home abroad on CRA form T1135 personal-use property in Toronto?', city: 'Toronto' },
      expectedRecord: 'cra-t1135-personal-use-property-exemption'
    },
    {
      name: 'Foreign Licence Driving Extract Credit',
      input: { question: 'How to bypass 12 month G1 wait with official driving extract experience credit in Toronto?', city: 'Toronto' },
      expectedRecord: 'mto-foreign-licence-driving-extract-credit'
    },

    // ── 2. International Destination Insider Queries ────────────────────────────
    {
      name: 'US H-1B 60-Day Grace Period Severance',
      input: { question: 'When does the 60-day grace period start after layoff severance for H-1B in the United States?', country: 'United States' },
      expectedRecord: 'us-uscis-h1b-60-day-grace-period-severance'
    },
    {
      name: 'US F-1 OPT Cap-Gap Extension',
      input: { question: 'How does F-1 OPT Cap-Gap work authorization extension work in the United States?', country: 'United States' },
      expectedRecord: 'us-uscis-f1-opt-cap-gap-extension'
    },
    {
      name: 'UK ILR 180-Day Rolling Absence Rule',
      input: { question: 'What is the 180-day continuous residence rolling absence limit for ILR in the UK?', country: 'United Kingdom' },
      expectedRecord: 'uk-home-office-ilr-180-day-rolling-absence'
    },
    {
      name: 'UK Section 21 Eviction Gas Safety Invalidation',
      input: { question: 'Is Section 21 eviction notice void if landlord failed to provide Gas Safety Certificate in the UK?', country: 'United Kingdom' },
      expectedRecord: 'uk-tenancy-section-21-gas-safety-invalidation'
    },
    {
      name: 'AU Subclass 482 180-Day Cessation Transfer',
      input: { question: 'How many days do subclass 482 visa holders have to find a new sponsor under condition 8607 in Australia?', country: 'Australia' },
      expectedRecord: 'au-home-affairs-482-180-day-cessation-transfer'
    },
    {
      name: 'AU Medicare Levy Exemption MES',
      input: { question: 'How to claim Medicare Levy exemption with Medicare Entitlement Statement MES in Australia?', country: 'Australia' },
      expectedRecord: 'au-services-australia-medicare-levy-exemption-mes'
    },
    {
      name: 'Germany Nebenkosten 12-Month Preclusion',
      input: { question: 'What is the landlord 12-month preclusion rule on annual utility bills Nebenkosten in Germany?', country: 'Germany' },
      expectedRecord: 'de-bgb-nebenkosten-12-month-preclusion'
    },
    {
      name: 'Germany Rundfunkbeitrag Shared Flat Exemption',
      input: { question: 'Does each flatmate have to pay Rundfunkbeitrag TV tax or is it one fee per apartment in Germany?', country: 'Germany' },
      expectedRecord: 'de-rundfunkbeitrag-single-household-exemption'
    },
    {
      name: 'UAE WPS Gratuity Deduction Ban',
      input: { question: 'Can an employer deduct visa or recruitment fees from gratuity under WPS in the UAE?', country: 'United Arab Emirates' },
      expectedRecord: 'uae-mohre-wps-gratuity-deduction-ban'
    },
    {
      name: 'UAE RERA 12-Month Notary Eviction',
      input: { question: 'Can my landlord evict me in Dubai with WhatsApp notice or do they need 12 months notary public notice under RERA?', country: 'United Arab Emirates' },
      expectedRecord: 'uae-rera-12-month-eviction-notary-notice'
    },
    {
      name: 'Ireland RPZ 2% Rent Cap',
      input: { question: 'What is the maximum rent increase in a Rent Pressure Zone RPZ in Ireland?', country: 'Ireland' },
      expectedRecord: 'ie-rtb-rpz-2-percent-rent-cap'
    },
    {
      name: 'Ireland CSEP Stamp 4 Fast-Track',
      input: { question: 'When can a Critical Skills Employment Permit CSEP holder transition to Stamp 4 in Ireland?', country: 'Ireland' },
      expectedRecord: 'ie-isd-csep-21-month-stamp-4-fast-track'
    },
    {
      name: 'New Zealand AEWV 90-Day Redundancy',
      input: { question: 'How many days do I have after redundancy to find an accredited employer and apply for variation of conditions AEWV in New Zealand?', country: 'New Zealand' },
      expectedRecord: 'nz-inz-aewv-90-day-redundancy-cushion'
    },
    {
      name: 'New Zealand 23-Day Bond Lodgement',
      input: { question: 'Can a landlord hold bond in private account or must they lodge with Tenancy Services within 23 days in New Zealand?', country: 'New Zealand' },
      expectedRecord: 'nz-tenancy-services-bond-lodgement-23-days'
    },
    {
      name: 'US 90-Day Misrepresentation Rule',
      input: { question: 'What is the 90-day rule for willful misrepresentation when filing adjustment of status or green card in the United States?', country: 'United States' },
      expectedRecord: 'us-dos-90-day-rule-misrepresentation-presumption'
    },
    {
      name: 'UK Tenant Fees Act Prohibited Payments',
      input: { question: 'Can letting agents charge admin fees or holding deposit beyond limits under Tenant Fees Act in the UK?', country: 'United Kingdom' },
      expectedRecord: 'uk-tenant-fees-act-prohibited-payments-ban'
    },
    {
      name: 'Ontario OHIP Waiting Period Removal',
      input: { question: 'Is there still a three-month waiting period for OHIP health insurance coverage in Ontario?', city: 'Toronto' },
      expectedRecord: 'ontario-health-ohip-wait-elimination'
    },
    {
      name: 'IRCC Express Entry 52 Weeks Rule',
      input: { question: 'Can I qualify for Canadian Experience Class CEC in 6 months with 1560 hours or does it require 52 continuous weeks?', city: 'Toronto' },
      expectedRecord: 'ircc-express-entry-continuous-work-52-weeks'
    },
    {
      name: 'US F-1 OPT FICA Tax Exemption',
      input: { question: 'Are F-1 students on OPT exempt from Social Security and Medicare FICA taxes in the United States?', country: 'United States' },
      expectedRecord: 'us-irs-f1-opt-fica-tax-exemption'
    },
    {
      name: 'US USCIS 540-Day EAD Extension',
      input: { question: 'Does a timely filed I-765 renewal qualify for a 540-day automatic extension of EAD work authorization in the United States?', country: 'United States' },
      expectedRecord: 'us-uscis-540-day-ead-automatic-extension'
    },
    {
      name: 'Australia Fair Work Regional Farm Work Protections',
      input: { question: 'What are the award wage and piece rate protections for Working Holiday 88 days regional work under Fair Work in Australia?', country: 'Australia' },
      expectedRecord: 'au-fair-work-working-holiday-award-wage-floor'
    },
    {
      name: 'Germany Employment Notice Periods BGB 622',
      input: { question: 'What is the statutory notice period for resignation or dismissal under BGB 622 during probation in Germany?', country: 'Germany' },
      expectedRecord: 'de-bgb-kuendigungsfrist-notice-periods'
    },
    {
      name: 'Canada PNP Intent to Reside',
      input: { question: 'Can a provincial nominee PNP move to another province before landing or does IRPA require intent to reside in Toronto?', city: 'Toronto' },
      expectedRecord: 'canada-pnp-intent-to-reside-charter-s6'
    },
    {
      name: 'Canada CRA FHSA for Newcomers',
      input: { question: 'Can a newcomer open a First Home Savings Account FHSA in their first year of arrival in Canada in Toronto?', city: 'Toronto' },
      expectedRecord: 'cra-fhsa-newcomer-immediate-eligibility'
    },
    {
      name: 'Ontario ESA Termination Notice vs Severance',
      input: { question: 'What is the difference between notice of termination and severance pay under Ontario ESA 2.5 million payroll in Toronto?', city: 'Toronto' },
      expectedRecord: 'ontario-esa-notice-vs-severance-distinction'
    },
    {
      name: 'US CBP Electronic I-94 Form Expiry',
      input: { question: 'Does electronic Form I-94 determine authorized stay and override passport visa foil expiration in the United States?', country: 'United States' },
      expectedRecord: 'us-cbp-electronic-i-94-controls-stay'
    },
    {
      name: 'US IRS Dual-Status Alien Election',
      input: { question: 'Can a married dual-status alien make a 6013(g) election to file married filing jointly in the United States?', country: 'United States' },
      expectedRecord: 'us-irs-dual-status-first-year-choice'
    },
    {
      name: 'UK Skilled Worker Salary Grandfathering',
      input: { question: 'What is the grandfathered salary threshold for pre-April 2024 Skilled Worker visa holders in the United Kingdom?', country: 'United Kingdom' },
      expectedRecord: 'uk-home-office-skilled-worker-salary-grandfathering'
    },
    {
      name: 'Australia Temporary Resident Foreign CGT Exemption',
      input: { question: 'Are temporary residents exempt from capital gains tax CGT on foreign assets under Subdivision 768-R in Australia?', country: 'Australia' },
      expectedRecord: 'au-ato-temporary-resident-cgt-foreign-assets-exemption'
    },
    {
      name: 'Germany Chancenkarte 20-Hour Work Rights',
      input: { question: 'Can Opportunity Card Chancenkarte holders work 20 hours per week or do trial work Probearbeit in Germany?', country: 'Germany' },
      expectedRecord: 'de-aufenthg-chancenkarte-secondary-work-rights'
    },
    {
      name: 'Canada CRA Moving Expense Deduction',
      input: { question: 'Can I deduct moving expenses on form T1-M if I moved 40 kilometres for work in Canada in Toronto?', city: 'Toronto' },
      expectedRecord: 'cra-moving-expenses-relocation-deduction'
    },
    {
      name: 'Ontario Human Rights Rental Credit Discrimination',
      input: { question: 'Can a landlord refuse to rent to a newcomer because they have no Canadian credit history under the Human Rights Code in Toronto?', city: 'Toronto' },
      expectedRecord: 'ontario-ohrc-no-credit-history-discrimination-ban'
    },
    {
      name: 'US USCIS 245(k) Work Violation Exemption',
      input: { question: 'Can employment-based green card applicants forgive up to 180 days of unauthorized work under 245(k) in the United States?', country: 'United States' },
      expectedRecord: 'us-uscis-245k-status-violation-exemption'
    },
    {
      name: 'UK Right to Rent Statutory Excuse & LCS',
      input: { question: 'Does a landlord have a 28-day statutory excuse via Landlord Checking Service during in-time visa extension Right to Rent in the United Kingdom?', country: 'United Kingdom' },
      expectedRecord: 'uk-home-office-right-to-rent-statutory-excuse'
    },
    {
      name: 'Australia RHCA Reciprocal Medicare Enrolment',
      input: { question: 'Can visitors from Reciprocal Health Care Agreement RHCA countries enroll in Medicare in Australia?', country: 'Australia' },
      expectedRecord: 'au-services-australia-rhca-medicare-enrolment'
    },
    {
      name: 'Germany Mietpreisbremse Prior Rent Disclosure',
      input: { question: 'Must a landlord disclose the previous rent Vormiete in writing under the Mietpreisbremse rent brake in Germany?', country: 'Germany' },
      expectedRecord: 'de-bgb-mietpreisbremse-prior-rent-disclosure'
    }
  ];

  for (const tc of testCases) {
    const ans = answer(tc.input, records, now);
    const matchedIds = ans.claims.map(c => c.evidenceId);
    assert.ok(
      matchedIds.includes(tc.expectedRecord),
      `Expected ${tc.name} to match ${tc.expectedRecord}, but got: ${JSON.stringify(matchedIds)}`
    );
  }


});
