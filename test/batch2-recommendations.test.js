import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateGlobalVisaPathways } from '../src/global-visa-matrix.js';
import { calculateMovingTaxDeduction } from '../src/moving-tax-calculator.js';
import { calculateSeveranceAndNotice } from '../src/severance-bardal-calculator.js';
import { lookupStatutoryTerm, listAllGlossaryTerms } from '../src/statutory-glossary.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('Global Visa Matrix: evaluates multi-country eligibility across CA, US, UK, AU, DE, and UAE', () => {
  const masterStemCandidate = evaluateGlobalVisaPathways({
    preferredCountries: ['CA', 'US', 'UK', 'AU', 'DE', 'UAE'],
    educationLevel: 'masters',
    yearsExperience: 4,
    fieldOfStudy: 'stem',
    hasJobOffer: false,
    applicantAge: 28
  });

  assert.ok(masterStemCandidate.eligiblePathwaysCount >= 3);
  assert.ok(masterStemCandidate.eligiblePathways.some(p => p.pathwayId === 'express_entry_fsw'));
  assert.ok(masterStemCandidate.eligiblePathways.some(p => p.pathwayId === 'eb2_niw')); // No job offer required
  assert.ok(masterStemCandidate.eligiblePathways.some(p => p.pathwayId === 'chancenkarte')); // Germany job search

  // H-1B and UK Skilled Worker should be restricted due to no job offer
  assert.ok(masterStemCandidate.restrictedPathways.some(p => p.pathwayId === 'h1b_specialty'));
  assert.ok(masterStemCandidate.restrictedPathways.some(p => p.pathwayId === 'skilled_worker'));

  // Test age restriction in Australia
  const olderCandidate = evaluateGlobalVisaPathways({
    preferredCountries: ['AU'],
    applicantAge: 47
  });
  assert.ok(olderCandidate.restrictedPathways.some(p => p.statutoryConditions[0].includes('exceeds Australia GSM')));
});

test('CRA Moving Tax Deduction: verifies 40-km eligibility, simplified meals & mileage rates, and 15-day temporary living cap', () => {
  const eligibleMove = calculateMovingTaxDeduction({
    distanceOldHomeToNewWorkKm: 120,
    distanceNewHomeToNewWorkKm: 20, // 100 km closer >= 40 km
    transportAndStorageCostsCad: 3500,
    travelDays: 3,
    travelDistanceKm: 600,
    province: 'ON',
    temporaryLivingDays: 20, // Should be capped at 15 days under ITA s. 62(3)(b)
    temporaryLivingLodgingCad: 2000,
    temporaryLivingMealsCad: 1000,
    employmentIncomeEarnedAtNewLocationCad: 60000,
    employerReimbursementCad: 500
  });

  assert.equal(eligibleMove.eligibilityCheck.isEligible, true);
  assert.equal(eligibleMove.eligibilityCheck.distanceCloserKm, 100);
  assert.equal(eligibleMove.expenseBreakdown.temporaryLiving.isCapped, true);
  assert.equal(eligibleMove.expenseBreakdown.temporaryLiving.statutoryCappedDays, 15);
  assert.ok(eligibleMove.taxOptimization.allowableDeductionCurrentYearCad > 0);

  // Ineligible move (< 40km)
  const ineligibleMove = calculateMovingTaxDeduction({
    distanceOldHomeToNewWorkKm: 50,
    distanceNewHomeToNewWorkKm: 30 // 20 km closer < 40 km
  });
  assert.equal(ineligibleMove.eligibilityCheck.isEligible, false);
  assert.equal(ineligibleMove.taxOptimization.allowableDeductionCurrentYearCad, 0);
});

test('Severance Bardal Estimator: calculates statutory ESA floor vs common law notice and flags release traps', () => {
  const seniorManager = calculateSeveranceAndNotice({
    employeeAge: 52,
    yearsOfService: 8,
    annualSalaryCad: 120000,
    employmentRole: 'executive',
    employerPayrollOver2Point5Million: true,
    hasSignedEnforceableEsaOnlyClause: false,
    availabilityOfSimilarJobs: 'scarce'
  });

  // Statutory: 8 wks notice + 8 wks severance = 16 wks
  assert.equal(seniorManager.statutoryMinimumEntitlement.noticePeriodWeeks, 8);
  assert.equal(seniorManager.statutoryMinimumEntitlement.severancePayWeeks, 8);
  assert.equal(seniorManager.statutoryMinimumEntitlement.isSeveranceTriggered, true);

  // Common Law: Bardal factors should award substantial notice (~14-20 months)
  assert.ok(seniorManager.commonLawEntitlement.estimatedNoticePeriodMonths >= 12);
  assert.ok(seniorManager.commonLawEntitlement.potentialSeveranceGainDeltaCad > 50000);
  assert.ok(seniorManager.severanceReleaseTrapWarnings.length >= 4);
});

test('Statutory Glossary: resolves plain-English definitions and searches by keyword/category', () => {
  const maintainedStatus = lookupStatutoryTerm('maintained_status');
  assert.ok(maintainedStatus !== null);
  assert.ok(maintainedStatus.legalCitation.includes('IRPR s. 183(5)'));

  const capGap = lookupStatutoryTerm('cap_gap');
  assert.ok(capGap !== null);
  assert.equal(capGap.country, 'US');

  const immigrationTerms = listAllGlossaryTerms({ category: 'immigration' });
  assert.ok(immigrationTerms.length >= 4);

  const searchResults = listAllGlossaryTerms({ search: 'severance' });
  assert.ok(searchResults.some(t => t.id === 'bardal_factors'));
});

test('HTTP API Batch 2: verifies endpoints for global visa, moving tax, severance, glossary, and feed.xml', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'test-admin-token-at-least-24-chars-long');
  await new Promise(res => server.listen(0, '127.0.0.1', res));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    // 1. Global Visa Matrix (GET & POST)
    const resGetVisa = await fetch(`${baseUrl}/v1/tools/global-visa-matrix?education=masters&experience=5`);
    assert.equal(resGetVisa.status, 200);
    const bodyGetVisa = await resGetVisa.json();
    assert.ok(bodyGetVisa.eligiblePathways.length > 0);

    const resPostVisa = await fetch(`${baseUrl}/v1/tools/global-visa-matrix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ educationLevel: 'phd', yearsExperience: 6 })
    });
    assert.equal(resPostVisa.status, 200);
    const bodyPostVisa = await resPostVisa.json();
    assert.ok(bodyPostVisa.eligiblePathwaysCount > 0);

    // 2. Moving Tax Calc (GET & POST)
    const resGetMove = await fetch(`${baseUrl}/v1/tools/moving-tax-calc?oldToNewKm=150&newToNewKm=20`);
    assert.equal(resGetMove.status, 200);
    const bodyGetMove = await resGetMove.json();
    assert.equal(bodyGetMove.eligibilityCheck.isEligible, true);

    const resPostMove = await fetch(`${baseUrl}/v1/tools/moving-tax-calc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distanceOldHomeToNewWorkKm: 100, distanceNewHomeToNewWorkKm: 10 })
    });
    assert.equal(resPostMove.status, 200);
    const bodyPostMove = await resPostMove.json();
    assert.equal(bodyPostMove.eligibilityCheck.isEligible, true);

    // 3. Severance Bardal (GET & POST)
    const resGetSev = await fetch(`${baseUrl}/v1/tools/severance-bardal?service=8&age=50&salary=100000`);
    assert.equal(resGetSev.status, 200);
    const bodyGetSev = await resGetSev.json();
    assert.ok(bodyGetSev.commonLawEntitlement.estimatedNoticePeriodMonths > 0);

    const resPostSev = await fetch(`${baseUrl}/v1/tools/severance-bardal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ yearsOfService: 5, employeeAge: 45, annualSalaryCad: 80000 })
    });
    assert.equal(resPostSev.status, 200);
    const bodyPostSev = await resPostSev.json();
    assert.ok(bodyPostSev.statutoryMinimumEntitlement.noticePeriodWeeks > 0);

    // 4. Statutory Glossary (GET)
    const resGlossary = await fetch(`${baseUrl}/v1/glossary?q=status`);
    assert.equal(resGlossary.status, 200);
    const bodyGlossary = await resGlossary.json();
    assert.ok(bodyGlossary.totalTerms > 0);

    const resTerm = await fetch(`${baseUrl}/v1/glossary?term=dual_intent`);
    assert.equal(resTerm.status, 200);
    const bodyTerm = await resTerm.json();
    assert.equal(bodyTerm.term.id, 'dual_intent');

    // 5. Realtime Atom Feed XML (GET)
    const resFeed = await fetch(`${baseUrl}/v1/realtime/feed.xml`);
    assert.equal(resFeed.status, 200);
    assert.ok(resFeed.headers.get('content-type').includes('application/atom+xml'));
    const xml = await resFeed.text();
    assert.ok(xml.includes('<feed xmlns="http://www.w3.org/2005/Atom">'));
    assert.ok(xml.includes('Northstar Real-Time Policy &amp; Settlement Alerts'));

  } finally {
    await new Promise(res => server.close(res));
  }
});
