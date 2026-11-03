// Single source of truth for settlement figures that change on a schedule
// (thresholds, fees, caps). Tools import values from here instead of
// hard-coding them, so a yearly change is one edit in one place.
//
// Each fact records where the value comes from, when it took effect and when
// it must be checked again (`reviewBy`, usually the next scheduled change).
// `npm run kb:health` lists facts whose review date has passed; update the
// value, effectiveFrom, checkedAt and reviewBy together.

import {ValidationError, PolicyReviewRequiredError} from './api-errors.js';
import {assertCalendarDate} from './evidence-policy.js';

export const KB_FACTS = Object.freeze({
  'uk.skilledWorker.generalThresholdGbp': {
    value: 41700, effectiveFrom: '2025-07-22', checkedAt: '2026-11-01', reviewBy: '2027-04-06',
    source: 'https://www.gov.uk/skilled-worker-visa',
    note: 'General Skilled Worker salary threshold (or the going rate if higher).'
  },
  'uk.skilledWorker.newEntrantGbp': {
    value: 33400, effectiveFrom: '2025-07-22', checkedAt: '2026-11-01', reviewBy: '2027-04-06',
    source: 'https://www.gov.uk/skilled-worker-visa',
    note: 'New entrant rate (under 26, recent graduates).'
  },
  'uk.skilledWorker.transitionalGbp': {
    value: 31300, effectiveFrom: '2025-07-22', checkedAt: '2026-11-01', reviewBy: '2027-04-06',
    source: 'https://www.gov.uk/skilled-worker-visa',
    note: 'Transitional rate for Skilled Worker visas first granted before 4 April 2024.'
  },
  'uk.skilledWorker.healthCarePayScaleGbp': {
    value: 25000, effectiveFrom: '2025-07-22', checkedAt: '2026-11-01', reviewBy: '2027-04-06',
    source: 'https://www.nhsemployers.org/news/health-and-care-worker-visa-salary-threshold',
    note: 'Health and care roles on national pay scales.'
  },
  'ca.expressEntry.settlementFundsCad': {
    value: Object.freeze({ 1: 15263, 2: 19001, 3: 23360, 4: 28362, 5: 32168, 6: 36280, 7: 40392, additionalPerPerson: 4112 }),
    effectiveFrom: '2025-07-07', checkedAt: '2026-11-01', reviewBy: '2027-07-31',
    source: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html',
    note: 'Express Entry (FSW/FST) proof of funds by family size; IRCC usually updates it in the summer. No 2026 update was found on 2026-11-01.'
  },
  'au.coreSkillsIncomeThresholdAud': {
    value: 79499, effectiveFrom: '2026-07-01', checkedAt: '2026-11-01', reviewBy: '2027-07-01',
    source: 'https://www.bdo.com.au/en-au/insights/migration-services/updated-income-thresholds-for-skilled-visas-what-employers-need-to-know',
    note: 'Core Skills Income Threshold (replaced TSMIT); indexed every 1 July (A$76,515 from 1 July 2025).'
  },
  'au.superGuaranteePercent': {
    value: 12, effectiveFrom: '2025-07-01', checkedAt: '2026-11-01', reviewBy: '2027-07-01',
    source: 'https://www.ato.gov.au/',
    note: 'Superannuation guarantee rate; no further legislated increase.'
  },
  'ca.lmia.lowWageCapPercent': {
    value: 10, effectiveFrom: '2024-09-26', checkedAt: '2026-11-01', reviewBy: '2027-03-31',
    source: 'https://gowlingwlg.com/en/insights-resources/articles/2024/canada-overhauls-low-wage-lmia-stream',
    note: 'Low-wage LMIA cap per work location.'
  },
  'ca.lmia.lowWageCapConstructionHealthcarePercent': {
    value: 20, effectiveFrom: '2024-09-26', checkedAt: '2026-11-01', reviewBy: '2027-03-31',
    source: 'https://gowlingwlg.com/en/insights-resources/articles/2024/canada-overhauls-low-wage-lmia-stream',
    note: 'Low-wage LMIA cap in construction and healthcare.'
  },
  'ca.ontario.rentIncreaseGuidelinePercent': {
    value: 2.1, effectiveFrom: '2026-01-01', checkedAt: '2026-11-01', reviewBy: '2026-12-31',
    source: 'https://www.ontario.ca/page/residential-rent-increases',
    note: 'Ontario rent increase guideline for 2026; the 2027 guideline is announced in the summer before.'
  },
  'ca.ontario.generalMinimumWageCad': {
    value: 17.95, effectiveFrom: '2026-10-01', checkedAt: '2026-11-03', reviewBy: '2027-10-01',
    source: 'https://www.ontario.ca/document/your-guide-employment-standards-act-0/minimum-wage',
    note: 'Ontario general minimum wage per hour; indexed to Ontario CPI every 1 October (C$17.60 from 1 October 2025).'
  }
});

/** Returns the current value of a fact, or throws for an unknown key. */
export function factValue(key, date = new Date().toISOString().slice(0, 10)) {
  const fact = Object.hasOwn(KB_FACTS,key) ? KB_FACTS[key] : null;
  if (!fact) throw new Error(`Unknown KB fact: ${key}`);
  assertCalendarDate(date,'Fact assessment date');
  if(date < fact.effectiveFrom || date >= fact.reviewBy)throw new PolicyReviewRequiredError(key,date);
  return fact.value;
}

// Preserve named table exports while checking currency on every read, including JSON serialization.
// Constructing the view does not consume a dated value or prevent the service from booting.
export function factTable(key) {
  const fact=Object.hasOwn(KB_FACTS,key) ? KB_FACTS[key] : null;
  if(!fact || !fact.value || typeof fact.value!=='object' || Array.isArray(fact.value))throw new ValidationError('Expected an object-valued KB fact');
  return Object.freeze(Object.defineProperties({},Object.fromEntries(Object.keys(fact.value).map(field=>[field,{enumerable:true,get:()=>factValue(key)[field]}]))));
}

/** Facts whose review date has passed on `date` (YYYY-MM-DD). */
export function factsDueForReview(date = new Date().toISOString().slice(0, 10)) {
  const checkDate = (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) ? date : new Date().toISOString().slice(0, 10);
  return Object.entries(KB_FACTS)
    .filter(([, f]) => f.reviewBy <= checkDate)
    .map(([key, f]) => ({ key, value: f.value, reviewBy: f.reviewBy, source: f.source }));
}
