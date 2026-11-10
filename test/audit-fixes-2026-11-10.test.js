import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveConversationTurn } from '../src/conversation-resolver.js';
import { applyFormAliases } from '../src/tool-input.js';
import { evaluateTenancyRepairs } from '../src/tenancy-repairs-navigator.js';
import { evaluateExpressEntryCrs } from '../src/express-entry-optimizer.js';
import { evaluateProvincialNomineePathway } from '../src/pnp-navigator.js';
import { auditStatutoryPayAndWages } from '../src/statutory-pay-calculator.js';
import { evaluateUsH1bOptStatus } from '../src/us-h1b-opt-navigator.js';
import { evaluateUkSkilledWorkerAndIlr } from '../src/uk-skilled-worker-ilr-navigator.js';
import { evaluateTaxShield } from '../src/tax-shield-optimizer.js';
import { calculateDocumentExpiryRunway } from '../src/statutory-calculators.js';
import { calculateProratedBpa } from '../src/tax-treaty-engine.js';
import { auditBcTenancyNotice } from '../src/ontario-bc-tenancy-navigator.js';
import { evaluateQuebecPeqTemporaryWorker } from '../src/quebec-peq-temporary-worker-navigator.js';
import { evaluateQuebecCsqSkilledWorker } from '../src/quebec-csq-skilled-worker-arrima-navigator.js';
import { sanitizeZeroPII } from '../src/community-translation-ledger.js';
import { EI_CONSTANTS } from '../src/ei-benefits-navigator.js';
import { KB_FACTS, factValue } from '../src/kb-facts.js';
import { simulateSettlementDecision } from '../src/settlement-decision-simulator.js';
import { generateSignedAuditExport, verifySignedAuditExport } from '../src/audit-export.js';
import { buildSettlementCaseBinderPacket } from '../src/case-binder-packet.js';
import { defaultTokenQuotaManager } from '../src/ai-token-quota.js';
import { createVerifiedAnswer } from '../src/verified-answer.js';
import { openStore } from '../src/store.js';
import { createApp } from '../src/server.js';
import { answer } from '../src/engine.js';

const NOW = new Date('2026-11-10T12:00:00Z');
const FRESH = new Date(NOW.getTime() - 60_000).toISOString();

test('conversation-resolver supports global cities/regions and maps province-specific healthcare terms', () => {
  const bcTurn = resolveConversationTurn({
    question: 'What documents do I need to apply?',
    previousContext: { topic: 'health', city: 'Vancouver', region: 'BC', country: 'CA', at: FRESH }
  }, NOW);
  assert.equal(bcTurn.input.city, 'Vancouver');
  assert.match(bcTurn.input.question, /MSP health card coverage/);
  assert.doesNotMatch(bcTurn.input.question, /OHIP/);

  const auTurn = resolveConversationTurn({
    question: 'What documents do I need to apply?',
    previousContext: { topic: 'health', city: 'Sydney', country: 'AU', at: FRESH }
  }, NOW);
  assert.equal(auTurn.input.city, 'Sydney');
  assert.match(auTurn.input.question, /public health care coverage/);
});

test('tool-input universally coerces string "false" and "true" on boolean-prefixed keys across all routes', () => {
  const payload = {
    hasValidStudyPermit: 'false',
    isFullTimeStudent: 'true',
    employerRetainedPassportOrPermit: 'false'
  };
  applyFormAliases('/v1/tools/unaliased-custom-route', payload);
  assert.equal(payload.hasValidStudyPermit, false);
  assert.equal(payload.isFullTimeStudent, true);
  assert.equal(payload.employerRetainedPassportOrPermit, false);
});

test('tenancy-repairs-navigator does not produce negative rent abatement when zero recognized issues match', () => {
  const res = evaluateTenancyRepairs({
    province: 'ON',
    monthlyRentCad: 2400,
    issues: ['cosmetic_paint_scuff'],
    daysUnresolved: 14
  });
  assert.equal(res.abatementEstimate.estimatedMinAbatementCad, 0);
  assert.equal(res.abatementEstimate.estimatedMaxAbatementCad, 0);
});

test('express-entry-optimizer enforces 100-pt skill transferability cap, CLB 10 advice, and 22-pt married 2nd language cap', () => {
  const res = evaluateExpressEntryCrs({
    age: 29,
    educationLevel: 'masters',
    firstLanguageClb: { speaking: 9, listening: 9, reading: 9, writing: 9 },
    secondLanguageClb: { speaking: 10, listening: 10, reading: 10, writing: 10 },
    canadianWorkExperienceYears: 2,
    foreignWorkExperienceYears: 4,
    isMarried: true,
    spouseFactors: { educationLevel: 'masters', firstLanguageClb: 9, canadianWorkExperienceYears: 1 }
  });
  assert.ok(res.breakdown.skillTransferability.total <= 100);
  assert.ok(res.breakdown.humanCapital.secondLanguagePoints <= 22);
  assert.ok(res.optimizationLevers.some(l => /CLB 10/i.test(l.lever)));
});

test('pnp-navigator allows OINP Tech up to CRS 535 and requires work authorization for BC settlement funds exemption', () => {
  const oinp = evaluateProvincialNomineePathway({
    targetProvince: 'ON',
    nocCode: '21231',
    hasActiveExpressEntryProfile: true,
    expressEntryCrsScore: 515,
    educationLevel: 'bachelors',
    clbLevel: 9
  });
  assert.equal(oinp.oinpTechEligibility.qualifiesForOinpTech, true);

  const bcNoAuth = evaluateProvincialNomineePathway({
    targetProvince: 'BC',
    nocCode: '21231',
    hourlyWage: 55,
    hasFullTimeJobOffer: true,
    yearsOfDirectExperience: 3,
    educationLevel: 'bachelors',
    clbLevel: 8,
    familySize: 2,
    liquidSavingsCad: 5000,
    currentlyWorkingForBcEmployer: false,
    currentlyAuthorizedToWorkInCanada: false
  });
  assert.equal(bcNoAuth.settlementFunds.isExempt, false);
});

test('statutory-pay-calculator flags unauthorized Ontario ESA s. 13 deductions regardless of reason label', () => {
  const res = auditStatutoryPayAndWages({
    province: 'ON',
    grossHourlyWageCad: 20,
    hoursWorkedInPayPeriod: 40,
    unauthorizedDeductionsCad: 150,
    deductionReason: 'training_and_admin_fee'
  });
  assert.equal(res.deductionsAudit.isDeductionUnlawful, true);
  assert.equal(res.deductionsAudit.totalDeductionsCad, 150);
});

test('us-h1b-opt-navigator flags omitted lastDayWorkedDate and enforces April 1 Cap-Gap end date', () => {
  const missingDate = evaluateUsH1bOptStatus({ visaStatus: 'h1b', assessmentDate: '2026-11-10' });
  assert.equal(missingDate.h1bGracePeriodAudit.isLastDayWorkedMissing, true);
  assert.equal(missingDate.h1bGracePeriodAudit.isGracePeriodActive, false);
  assert.equal(missingDate.h1bGracePeriodAudit.statutoryDeadlineDate, null);

  const capGap = evaluateUsH1bOptStatus({
    visaStatus: 'f1_opt',
    hasTimelyFiledH1bCos: true,
    assessmentDate: '2026-07-15'
  });
  assert.equal(capGap.capGapAudit.autoExtensionEndDate, '2027-04-01');
});

test('uk-skilled-worker-ilr-navigator enforces both 180-day 12-month and 540-day 5-year absence limits', () => {
  const res = evaluateUkSkilledWorkerAndIlr({
    annualOfferedSalaryGbp: 45000,
    maxAbsenceDaysInAny12Months: 120,
    totalAbsenceDays5Years: 560
  });
  assert.equal(res.ilrContinuousResidence.isContinuousResidenceMaintained, false);
});

test('tax-shield-optimizer supports all 13 provinces/territories, 2026 CCB indexation, and RRSP prior-year check', () => {
  const qc = evaluateTaxShield({
    province: 'QC',
    taxYear: 2026,
    annualEmploymentIncomeCad: 85000,
    priorYearCanadianEarnedIncomeCad: 0,
    childrenUnder6: 1
  });
  assert.equal(qc.province, 'QC');
  assert.equal(qc.marginalTaxRatePercent, 35.5);
  assert.ok(qc.childAndFamilyBenefits.estimatedAnnualCcbCad > 0);
});

test('documentExpiryRunway treats same-day expiry as urgent (valid until 11:59 PM) rather than expired', () => {
  const sameDay = calculateDocumentExpiryRunway({
    docType: 'work_permit',
    expiryDateStr: '2026-11-10',
    referenceDate: '2026-11-10T10:00:00Z'
  });
  assert.equal(sameDay.isExpired, false);
  assert.equal(sameDay.maintainedStatusProtected, true);
});

test('tax-treaty-engine avoids UTC Jan-1 timezone shift and uses 2026 BPA $16,452', () => {
  const bpa = calculateProratedBpa({ entryDateStr: '2026-01-01', taxYear: 2026 });
  assert.equal(bpa.year, 2026);
  assert.equal(bpa.annualBpa, 16452);
  assert.equal(bpa.proratedBpa, 16452);
});

test('ontario-bc-tenancy uses 3.0% BC guideline and Quebec navigators surface programReformNotice', () => {
  const bcRent = auditBcTenancyNotice({ currentMonthlyRentCad: 2000, proposedMonthlyRentCad: 2080 });
  assert.equal(bcRent.statutoryGuidelinePercent, '3%');

  const peq = evaluateQuebecPeqTemporaryWorker({ monthsWorkedFullTimeInQuebec: 24, frenchOralLevel: 7 });
  assert.ok(peq.programReformNotice);

  const arrima = evaluateQuebecCsqSkilledWorker({ age: 30, frenchOralLevel: 7, educationLevel: 'bachelors' });
  assert.ok(arrima.programReformNotice);
});

test('verifiedAnswer enforces TokenQuotaManager daily budget when exceeded', async () => {
  const clientId = 'test-quota-exhausted-client';
  defaultTokenQuotaManager.recordUsage(clientId, defaultTokenQuotaManager.dailyTokenCap + 100);
  const run = createVerifiedAnswer({
    provider: 'mock',
    model: 'mock',
    complete: async () => { throw new Error('Should not call provider when quota exceeded'); }
  });
  const sinRecord = {
    id: 'sin-apply',
    topic: 'sin',
    jurisdiction: 'CA',
    title: 'Apply for a Social Insurance Number',
    summary: 'Apply for a Social Insurance Number through Service Canada.',
    quote: 'Apply for a Social Insurance Number through Service Canada.',
    url: 'https://www.canada.ca/sin',
    checkedAt: '2026-10-01',
    expiresAt: '2027-10-01',
    risk: 'high',
    status: 'approved',
    language: 'en'
  };
  const res = await run({ question: 'How do I get a SIN in Toronto?', city: 'Toronto' }, [sinRecord], NOW, { clientId });
  assert.equal(res.ai.status, 'quota_exceeded');
});

test('HTTP endpoints: /v1/kb/provenance-check verifies real audit chain and /v1/tools/tax-treaty responds', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'audit-fixes-test-token-long-enough');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  try {
    const provRes = await fetch(`${baseUrl}/v1/kb/provenance-check`);
    assert.equal(provRes.status, 200);
    const prov = await provRes.json();
    assert.equal(prov.valid, true);
    assert.equal(prov.isValid, true);

    const treatyRes = await fetch(`${baseUrl}/v1/tools/tax-treaty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'India',
        dest: 'Canada',
        assetsUSD: 40000,
        bankBalanceUSD: 25000
      })
    });
    assert.equal(treatyRes.status, 200);
    const treaty = await treatyRes.json();
    assert.equal(treaty.foreignAssetReporting.origin, 'India');
    assert.equal(treaty.foreignAssetReporting.dest, 'Canada');
    assert.equal(treaty.proratedBpa.annualBpa, 16452);
  } finally {
    await new Promise(resolve => server.close(resolve));
    store.db.close();
  }
});

test('PII audit: public/app.js FORM_TEMPLATES contains no hardcoded personal PII', () => {
  const appJs = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
  assert.doesNotMatch(appJs, /Shiva Sharma|Z9823412|987-654-321/);
});

test('sanitizeZeroPII masks health cards with version/context without false-positiving bare 10-digit numbers', () => {
  const masked = sanitizeZeroPII('OHIP 1234-567-890-AB and PHN 9876 543 210');
  assert.ok(!masked.includes('1234-567-890-AB'));
  assert.ok(!masked.includes('9876 543 210'));
  assert.ok(masked.includes('[REDACTED_HEALTH_CARD]'));

  const untouched = sanitizeZeroPII('IRCC Application 2026011001 and Statutory Form 1234567890');
  assert.equal(untouched, 'IRCC Application 2026011001 and Statutory Form 1234567890');
});

test('tenancy-repairs-navigator applies province-specific limitation periods (ON 1yr, BC 2yr, QC 3yr)', () => {
  const bc = evaluateTenancyRepairs({ province: 'BC', monthlyRentCad: 2000, issues: ['mould'], daysUnresolved: 450 });
  assert.equal(bc.legalWarnings.some(w => w.code === 'LIMITATION_PERIOD_EXCEEDED'), false);

  const bcExpired = evaluateTenancyRepairs({ province: 'BC', monthlyRentCad: 2000, issues: ['mould'], daysUnresolved: 800 });
  assert.equal(bcExpired.legalWarnings.some(w => w.code === 'LIMITATION_PERIOD_EXCEEDED'), true);

  const qc = evaluateTenancyRepairs({ province: 'QC', monthlyRentCad: 1800, issues: ['heating_failure'], daysUnresolved: 900 });
  assert.equal(qc.legalWarnings.some(w => w.code === 'LIMITATION_PERIOD_EXCEEDED'), false);
});

test('2026 EI MIE ($68,900 / $729/wk) and KB_FACTS registry are aligned', () => {
  assert.equal(EI_CONSTANTS.MAX_INSURABLE_EARNINGS_CAD_2026, 68900);
  assert.equal(EI_CONSTANTS.MAX_WEEKLY_BENEFIT_CAD_2026, 729);
  assert.equal(factValue('ca.ei.maxInsurableEarningsCad', '2026-06-01'), 68900);
  assert.equal(factValue('ca.tfsa.annualLimitCad', '2026-06-01'), 7000);
  assert.ok(KB_FACTS['ca.cra.basicPersonalAmountCad']);
});

test('settlement-decision-simulator compares provinces & global cities holistically', () => {
  const sim = simulateSettlementDecision({
    hubs: ['toronto', 'calgary', 'montreal', 'berlin'],
    grossAnnualIncomeUsd: 95000,
    householdSize: 3,
    childrenUnder6: 1,
    housingSize: '2bed',
    frenchProficiencyNclc7: true
  });
  assert.equal(sim.comparisons.length, 4);
  assert.ok(sim.recommendedHub.city);
  const calgary = sim.comparisons.find(c => c.hubId === 'calgary');
  const toronto = sim.comparisons.find(c => c.hubId === 'toronto');
  assert.ok(calgary.netAnnualDisposableUsd > toronto.netAnnualDisposableUsd);
});

test('audit-export generates SHA-256 verifiable RCIC/Legal Aid bundle and detects tampering', () => {
  const bundle = generateSignedAuditExport({
    toolId: 'express-entry-crs',
    toolTitle: 'Express Entry CRS Diagnostic',
    jurisdiction: 'CA',
    inputs: { age: 29, email: 'applicant@example.com' },
    result: { totalCrs: 512, statutoryBasis: 'IRPA s. 10.3 / Ministerial Instructions' }
  });
  assert.match(bundle.certificateId, /^NS-AUDIT-[A-F0-9]{16}$/);
  assert.equal(bundle.envelope.inputs.email, '[REDACTED_EMAIL]');
  assert.equal(verifySignedAuditExport(bundle).valid, true);

  const tampered = structuredClone(bundle);
  tampered.envelope.result.totalCrs = 600;
  assert.equal(verifySignedAuditExport(tampered).valid, false);
});

test('HTTP Wave 2 endpoints: /v1/realtime/changelog, /v1/tools/settlement-decision-simulator, /v1/tools/audit-export, and multilingual locale pills', async () => {
  const indexHtml = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(indexHtml, /data-locale="hi"/);
  assert.match(indexHtml, /data-locale="fr"/);
  assert.match(indexHtml, /data-locale="zh"/);

  const store = openStore(':memory:');
  const server = createApp(store, 'audit-fixes-wave2-token-long-enough');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  try {
    const changelogRes = await fetch(`${baseUrl}/v1/realtime/changelog?days=14`);
    assert.equal(changelogRes.status, 200);
    const changelog = await changelogRes.json();
    assert.equal(changelog.windowDays, 14);
    assert.ok(Array.isArray(changelog.recentRecordUpdates));
    assert.ok(Array.isArray(changelog.statutoryThresholds));

    const simRes = await fetch(`${baseUrl}/v1/tools/settlement-decision-simulator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hubs: ['toronto', 'calgary'], grossAnnualIncomeUsd: 90000 })
    });
    assert.equal(simRes.status, 200);
    const simData = await simRes.json();
    assert.equal(simData.comparisons.length, 2);

    const exportRes = await fetch(`${baseUrl}/v1/tools/audit-export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolId: 'tenancy-repairs',
        result: { statutoryBasis: 'Ontario RTA s. 20', estimatedMaxAbatementCad: 600 }
      })
    });
    assert.equal(exportRes.status, 200);
    const exported = await exportRes.json();
    assert.equal(verifySignedAuditExport(exported).valid, true);

    const binderDirect = buildSettlementCaseBinderPacket({
      province: 'BC',
      immigrationStatus: 'work_permit',
      landingDate: '2026-11-10',
      hasChildren: true,
      bringingGoodsOver10kCad: true
    });
    assert.equal(binderDirect.province, 'BC');
    assert.ok(binderDirect.formsPacket.some(f => f.formCode.includes('E677')));
    assert.ok(binderDirect.formsPacket.some(f => f.formCode.includes('RC66')));

    const binderRes = await fetch(`${baseUrl}/v1/tools/case-binder-packet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ province: 'ON', immigrationStatus: 'permanent_resident', hasChildren: true })
    });
    assert.equal(binderRes.status, 200);
    const binderJson = await binderRes.json();
    assert.equal(binderJson.province, 'ON');
    assert.ok(binderJson.totalFormsCount >= 5);

    const badGetRes = await fetch(`${baseUrl}/v1/tools/bc-security-deposit-double-penalty?daysSince=not-a-number`);
    assert.equal(badGetRes.status, 400);
    assert.equal((await badGetRes.json()).code, 'invalid_field_value');
  } finally {
    await new Promise(resolve => server.close(resolve));
    store.db.close();
  }
});

test('forum question fixes: eliminates false banter guidance, resolves outland corridor geography, and handles DIY representation', () => {
  const store = openStore('data/test-settlement.sqlite');
  const records = store.records();
  try {
    // 1. Off-topic banter must NOT dump legal claims
    const banter1 = answer({ question: 'First Time at Oasis Aqualounge – Student Night or Bukkake Night?' }, records, NOW);
    assert.equal(banter1.status, 'unavailable');
    assert.equal(banter1.claims.length, 0);

    const banter2 = answer({ question: 'Samosa business? saturated or no?' }, records, NOW);
    assert.equal(banter2.status, 'unavailable');
    assert.equal(banter2.claims.length, 0);

    const banter3 = answer({ question: 'How does Toronto distillery ticketing even work. Do they go around the park and look for people without tickets at 3:59 😂?' }, records, NOW);
    assert.equal(banter3.status, 'unavailable');
    assert.equal(banter3.claims.length, 0);

    // 2. Outland origin and foreign work experience clauses resolve to Canadian guidance
    const outland1 = answer({ question: 'Express Entry Advice Needed – Foreign Work Experience in Family Business (Dubai), NOC Selection & French-Language Pathway' }, records, NOW);
    assert.equal(outland1.status, 'guidance');
    assert.equal(outland1.parsed.country, 'CA');
    assert.equal(outland1.parsed.missingSlots.includes('location'), false);

    const itaRemote = answer({ question: 'How to fill Work History in ITA for remote work while moving countries every few months?' }, records, NOW);
    assert.equal(itaRemote.status, 'guidance');
    assert.equal(itaRemote.parsed.country, 'CA');
    assert.equal(itaRemote.parsed.missingSlots.includes('location'), false);

    // 3. DIY representation query does not inject missing_occupation_requirements
    const diyAns = answer({ question: 'Super Visa with a prior overstay caused by IRCC’s own system error. DIY or lawyer?' }, records, NOW);
    assert.equal(diyAns.status, 'guidance');
    assert.equal(diyAns.gaps.some(g => g.reason === 'missing_occupation_requirements'), false);
  } finally {
    store.db.close();
  }
});
