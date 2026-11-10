import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateStudyPermitCapAndPal } from '../src/study-permit-cap-pal-navigator.js';
import { evaluateVisitorVisaTies } from '../src/visitor-visa-financial-ties-navigator.js';
import { evaluateLmiaReadiness } from '../src/lmia-readiness-navigator.js';
import { evaluateGovernmentEnrollment } from '../src/sin-healthcare-navigator.js';
import { evaluateStudyToPrPathway } from '../src/study-to-pr-navigator.js';
import { analyzeGcmsRefusalNotes } from '../src/gcms-refusal-analyzer.js';
import { SubscriptionManager } from '../src/realtime-subscriptions.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('Study Permit Cap & PAL: validates PAL exemption for Master’s and financial sufficiency', () => {
  const masters = evaluateStudyPermitCapAndPal({ applicationDate: '2026-11-06',
    studyLevel: 'masters',
    isPublicDli: true,
    tuitionFeeFirstYearCad: 25000,
    liquidFundsAvailableCad: 50000
  });
  assert.equal(masters.isPalRequired, false);
  assert.equal(masters.palStatus, 'PAL_EXEMPT');
  assert.ok(masters.palExemptReasons[0].includes('public DLIs'));
  assert.equal(masters.pgwpPathway.status, 'eligible');
  assert.equal(masters.pgwpPathway.requiredLanguageClb, 7);

  const underTier = evaluateStudyPermitCapAndPal({ applicationDate: '2026-11-06',
    studyLevel: 'undergraduate_degree',
    tuitionFeeFirstYearCad: 22000,
    liquidFundsAvailableCad: 45000,
    familyMembersAccompanying: 0
  });
  assert.equal(underTier.isPalRequired, true);
  assert.equal(underTier.palStatus, 'PAL_MANDATORY');
  assert.equal(underTier.financialAudit.isFinanciallySufficient, false);
  assert.equal(underTier.financialAudit.requiredLivingFundsCad, 23448);
  assert.equal(underTier.financialAudit.totalStatutoryProofRequiredCad, 22000 + 23448 + 1500);

  const collegeNonPriority = evaluateStudyPermitCapAndPal({ applicationDate: '2026-11-06',
    studyLevel: 'college_diploma',
    fieldOfStudyCategory: 'business_general'
  });
  assert.equal(collegeNonPriority.pgwpPathway.status, 'restricted_non_priority');

  const collegePriority = evaluateStudyPermitCapAndPal({ applicationDate: '2026-11-06',
    studyLevel: 'college_diploma',
    fieldOfStudyCategory: 'healthcare'
  });
  assert.equal(collegePriority.pgwpPathway.status, 'eligible_field_aligned');
  assert.equal(collegePriority.pgwpPathway.requiredLanguageClb, 5);
});

test('Visitor Visa Financial Ties (s. 179(b)): evaluates risk tiers and dual intent', () => {
  const strongApplicant = evaluateVisitorVisaTies({
    applicantName: 'Strong Ties Traveler',
    monthlyIncomeCad: 2500,
    plannedStayDays: 14,
    liquidFundsCad: 15000,
    hasApprovedJobLeaveLetter: true,
    yearsAtCurrentJob: 4,
    ownsRealEstateProperty: true,
    hasImmediateFamilyRemainingHome: true,
    allImmediateFamilyTravelingTogether: false,
    hasPriorCompliantTravelG7: true,
    hasPreviousVisaRefusal: false,
    isDualIntentPrPending: true
  });
  assert.equal(strongApplicant.riskTier, 'LOW_RISK');
  assert.ok(strongApplicant.tieScoreOutOf100 >= 70);
  assert.ok(strongApplicant.positiveFactors.some(f => f.includes('Dual Intent')));

  const highRiskApplicant = evaluateVisitorVisaTies({
    applicantName: 'Risk Profile',
    monthlyIncomeCad: 0,
    yearsAtCurrentJob: 0,
    hasImmediateFamilyRemainingHome: false,
    isDualIntentPrPending: false,
    plannedStayDays: 60,
    liquidFundsCad: 2000,
    hasApprovedJobLeaveLetter: false,
    ownsRealEstateProperty: false,
    allImmediateFamilyTravelingTogether: true,
    hasPriorCompliantTravelG7: false,
    hasPreviousVisaRefusal: true
  });
  assert.equal(highRiskApplicant.riskTier, 'HIGH_RISK');
  assert.ok(highRiskApplicant.riskFactors.length >= 3);
  assert.ok(highRiskApplicant.mitigationRecommendations.length >= 2);
});

test('LMIA Readiness & Wage Streams: audits C16 Francophone exemption and ESDC median wage rules', () => {
  const francoExempt = evaluateLmiaReadiness({
    employerName: 'Ottawa Tech Corp',
    province: 'ON',
    offeredHourlyWageCad: 42.00,
    isExemptionClaimed: true,
    exemptionCode: 'C16',
    frenchProficiencyNclc: 7,
    teerCategory: 1
  });
  assert.equal(francoExempt.exemptionAudit.isEligible, true);
  assert.equal(francoExempt.wageAnalysis.stream, 'HIGH_WAGE_STREAM');
  assert.ok(francoExempt.complianceObligations[0].includes('$230 CAD'));

  const lowWageWithRefusalRisk = evaluateLmiaReadiness({
    employerName: 'Retail Services Inc',
    province: 'ON',
    offeredHourlyWageCad: 22.00, // below Ontario median $28.39
    isExemptionClaimed: false,
    cmaUnemploymentOver6Percent: true,
    currentTfwProportionPercent: 22
  });
  assert.equal(lowWageWithRefusalRisk.wageAnalysis.stream, 'LOW_WAGE_STREAM');
  assert.ok(lowWageWithRefusalRisk.riskWarnings.some(w => w.includes('REFUSAL-TO-PROCESS')));
  assert.ok(lowWageWithRefusalRisk.riskWarnings.some(w => w.includes('CAP BREACH')));
});

test('Government Enrollment: audits SIN eligibility, OHIP/MSP waiting periods & photo ID', () => {
  const ontarioWorker = evaluateGovernmentEnrollment({
    statusInCanada: 'work_permit',
    province: 'ON',
    workPermitMinDurationMonths: 12
  });
  assert.equal(ontarioWorker.sinEvaluation.eligible, true);
  assert.equal(ontarioWorker.sinEvaluation.sinType, 'temporary_9_series');
  assert.equal(ontarioWorker.healthcareEvaluation.eligible, true);
  assert.equal(ontarioWorker.healthcareEvaluation.waitingPeriodDays, 0);

  const bcStudent = evaluateGovernmentEnrollment({
    statusInCanada: 'study_permit',
    province: 'BC',
    studyPermitHasWorkCondition: true
  });
  assert.equal(bcStudent.sinEvaluation.eligible, true);
  assert.equal(bcStudent.healthcareEvaluation.waitingPeriodDays, 60);

  const visitor = evaluateGovernmentEnrollment({
    statusInCanada: 'visitor',
    province: 'ON'
  });
  assert.equal(visitor.sinEvaluation.eligible, false);
  assert.equal(visitor.healthcareEvaluation.eligible, false);
});

test('Study-to-PR Pathway: computes PGWP, CEC 52-week milestone, and PNP eligibility', () => {
  const masterPlan = evaluateStudyToPrPathway({
    studyLevel: 'masters',
    isPublicDli: true,
    province: 'ON',
    fieldOfStudy: 'stem_tech',
    expectedClbLanguage: 9
  });
  assert.equal(masterPlan.pgwpEntitlement.durationMonths, 36);
  assert.ok(masterPlan.prPathways.federalCecRequirement.includes('52 weeks'));
  assert.ok(masterPlan.prPathways.federalCecRequirement.includes('1560 hours'));
  assert.ok(masterPlan.prPathways.provincialNomineeOptions.some(p => p.includes('OINP Masters Graduate Stream')));
  assert.equal(masterPlan.prPathways.projectedCrsGain, 120);

  const diplomaPlan = evaluateStudyToPrPathway({
    studyLevel: 'diploma_2yr',
    province: 'BC',
    fieldOfStudy: 'healthcare'
  });
  assert.equal(diplomaPlan.pgwpEntitlement.durationMonths, 36);
  assert.ok(diplomaPlan.prPathways.provincialNomineeOptions.some(p => p.includes('BC PNP Skills Immigration')));
});

test('GCMS Refusal Analyzer: parses officer notes and determines remedies & Federal Court review deadlines', () => {
  const parsed = analyzeGcmsRefusalNotes({
    applicationType: 'visitor_visa',
    rawOfficerNotesText: 'I am not satisfied that applicant has sufficient funds or assets to carry out stated purpose. Also concern with family ties in Canada.',
    daysSinceRefusal: 12
  });
  assert.ok(parsed.groundsIdentifiedCount >= 2);
  assert.ok(parsed.refusalFindings.some(f => f.refusalGround === 'R179b_ASSETS_FUNDS'));
  assert.ok(parsed.refusalFindings.some(f => f.refusalGround === 'R179b_FAMILY_TIES'));
  assert.equal(parsed.proceduralRemedy.isWithinFederalCourtWindow, true);
  assert.ok(parsed.proceduralRemedy.deadlineNotice.includes('60-day deadline'));
  assert.ok(parsed.federalCourtPrecedents.some(p => p.includes('Vavilov')));
});

test('SubscriptionManager: manages alerts subscriptions and geofiltering', () => {
  const store = openStore(':memory:');
  const mgr = new SubscriptionManager(store.db);

  const sub1 = mgr.subscribe({
    subscriberName: 'Counselor Priya',
    contactEndpoint: 'https://webhook.site/test',
    channel: 'webhook',
    country: 'CA',
    city: 'Toronto',
    topic: 'housing'
  });
  assert.ok(sub1.subscriptionId.startsWith('sub_'));
  assert.equal(sub1.status, 'active');

  const activeAll = mgr.listActiveSubscriptions({ country: 'CA' });
  assert.equal(activeAll.length, 1);

  const activeToronto = mgr.listActiveSubscriptions({ country: 'CA', city: 'Toronto' });
  assert.equal(activeToronto.length, 1);

  const activeCalgary = mgr.listActiveSubscriptions({ country: 'CA', city: 'Calgary' });
  assert.equal(activeCalgary.length, 0);

  const cancelled = mgr.cancel(sub1.subscriptionId);
  assert.equal(cancelled, true);

  const activeAfterCancel = mgr.listActiveSubscriptions({ country: 'CA' });
  assert.equal(activeAfterCancel.length, 0);
});

test('HTTP API: verifies GET and POST contracts for 4 new navigators', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'test-admin-token-at-least-24-chars-long');
  await new Promise(res => server.listen(0, '127.0.0.1', res));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    // 1. Study Permit PAL
    const resGetPal = await fetch(`${baseUrl}/v1/tools/study-permit-cap-pal?studyLevel=masters&isPublicDli=true&applicationDate=2026-11-06`);
    assert.equal(resGetPal.status, 200);
    const bodyGetPal = await resGetPal.json();
    assert.equal(bodyGetPal.isPalRequired, false);

    const resPostPal = await fetch(`${baseUrl}/v1/tools/study-permit-cap-pal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studyLevel: 'undergraduate_degree', tuitionFeeFirstYearCad: 20000 })
    });
    assert.equal(resPostPal.status, 200);
    const bodyPostPal = await resPostPal.json();
    assert.equal(bodyPostPal.isPalRequired, true);

    // 2. Visitor Visa Ties
    const resGetTies = await fetch(`${baseUrl}/v1/tools/visitor-visa-financial-ties?days=14&funds=10000`);
    assert.equal(resGetTies.status, 200);
    const bodyGetTies = await resGetTies.json();
    assert.ok(bodyGetTies.tieScoreOutOf100 !== undefined);

    // 3. LMIA Readiness
    const resGetLmia = await fetch(`${baseUrl}/v1/tools/lmia-readiness?province=ON&wage=40`);
    assert.equal(resGetLmia.status, 200);
    const bodyGetLmia = await resGetLmia.json();
    assert.equal(bodyGetLmia.wageAnalysis.stream, 'HIGH_WAGE_STREAM');

    // 4. SIN & Healthcare
    const resGetSin = await fetch(`${baseUrl}/v1/tools/sin-healthcare?status=pr_copr&province=ON`);
    assert.equal(resGetSin.status, 200);
    const bodyGetSin = await resGetSin.json();
    assert.equal(bodyGetSin.sinEvaluation.eligible, true);
    assert.equal(bodyGetSin.healthcareEvaluation.waitingPeriodDays, 0);

    // 5. Study to PR Navigator (GET & POST)
    const resGetStudyPr = await fetch(`${baseUrl}/v1/tools/study-to-pr?studyLevel=masters&province=ON`);
    assert.equal(resGetStudyPr.status, 200);
    const bodyGetStudyPr = await resGetStudyPr.json();
    assert.equal(bodyGetStudyPr.pgwpEntitlement.durationMonths, 36);

    const resPostStudyPr = await fetch(`${baseUrl}/v1/tools/study-to-pr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studyLevel: 'doctoral', province: 'ON' })
    });
    assert.equal(resPostStudyPr.status, 200);
    const bodyPostStudyPr = await resPostStudyPr.json();
    assert.equal(bodyPostStudyPr.pgwpEntitlement.durationMonths, 36);

    // 6. GCMS Refusal Analyzer (GET & POST)
    const resGetGcms = await fetch(`${baseUrl}/v1/tools/gcms-analyzer?type=visitor_visa&days=5`);
    assert.equal(resGetGcms.status, 200);
    const bodyGetGcms = await resGetGcms.json();
    assert.ok(bodyGetGcms.refusalFindings.length > 0);

    const resPostGcms = await fetch(`${baseUrl}/v1/tools/gcms-analyzer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationType: 'study_permit', rawOfficerNotesText: 'applicant insufficient funds' })
    });
    assert.equal(resPostGcms.status, 200);
    const bodyPostGcms = await resPostGcms.json();
    assert.ok(bodyPostGcms.refusalFindings.some(f => f.refusalGround === 'R179b_ASSETS_FUNDS'));

    // 7. Realtime Subscriptions (GET & POST)
    const adminAuthHeader = { Authorization: 'Bearer test-admin-token-at-least-24-chars-long' };
    const resPostSub = await fetch(`${baseUrl}/v1/realtime/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeader },
      body: JSON.stringify({
        subscriberName: 'Test Student',
        contactEndpoint: 'https://example.com/webhook',
        channel: 'webhook',
        country: 'CA',
        city: 'Vancouver'
      })
    });
    assert.equal(resPostSub.status, 200);
    const bodyPostSub = await resPostSub.json();
    assert.equal(bodyPostSub.status, 'active');

    const resGetSub = await fetch(`${baseUrl}/v1/realtime/subscriptions?country=CA&city=Vancouver`, {
      headers: { ...adminAuthHeader }
    });
    assert.equal(resGetSub.status, 200);
    const bodyGetSub = await resGetSub.json();
    assert.ok(bodyGetSub.subscriptions.some(s => s.subscriber_name === 'Test Student'));

    // 8. Prometheus Metrics (/v1/metrics)
    const unauthenticatedMetrics = await fetch(`${baseUrl}/v1/metrics`);
    assert.equal(unauthenticatedMetrics.status, 401);
    await unauthenticatedMetrics.arrayBuffer();
    const resMetrics = await fetch(`${baseUrl}/v1/metrics`, { headers: adminAuthHeader });
    assert.equal(resMetrics.status, 200);
    const bodyMetrics = await resMetrics.json();
    assert.ok(typeof bodyMetrics.prometheus === 'string');
    assert.ok(bodyMetrics.prometheus.includes('northstar_http_requests_total'));

  } finally {
    await new Promise(res => server.close(res));
  }
});
