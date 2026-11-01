import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateUsH1bOptStatus } from '../src/us-h1b-opt-navigator.js';
import { evaluateUkSkilledWorkerAndIlr } from '../src/uk-skilled-worker-ilr-navigator.js';
import { evaluateSuperVisaAndPgp } from '../src/super-visa-lico-navigator.js';
import { evaluateAustraliaReforms, evaluateGermanyChancenkarteAndTenancy } from '../src/australia-germany-global-navigator.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('US H-1B & OPT Navigator: evaluates 60-day grace period, severance exclusion, Cap-Gap extension, and 245(k) forgiveness', () => {
  // Test 1: H-1B 60-day grace period
  const h1bWorker = evaluateUsH1bOptStatus({
    visaStatus: 'h1b',
    lastDayWorkedDate: '2026-10-15',
    i94ExpirationDate: '2027-06-01',
    assessmentDate: '2026-10-31'
  });
  assert.equal(h1bWorker.h1bGracePeriodAudit.isGracePeriodActive, true);
  assert.ok(h1bWorker.h1bGracePeriodAudit.daysRemaining > 0);
  assert.ok(h1bWorker.h1bGracePeriodAudit.severanceWarning.includes('does NOT extend lawful H-1B status'));

  // Test 2: Cap-Gap for F-1 student
  const f1OptStudent = evaluateUsH1bOptStatus({
    visaStatus: 'f1_opt',
    hasTimelyFiledH1bCos: true,
    assessmentDate: '2026-07-15'
  });
  assert.equal(f1OptStudent.capGapAudit.isCapGapEligible, true);
  assert.ok(f1OptStudent.capGapAudit.autoExtensionEndDate.includes('-09-30'));

  // Test 3: INA 245(k) 180-day status forgiveness
  const greenCardApplicant = evaluateUsH1bOptStatus({
    visaStatus: 'h1b',
    hasPendingGreenCardI485: true,
    unauthorizedWorkDaysAccrued: 45
  });
  assert.equal(greenCardApplicant.section245kAudit.isForgivableUnder245k, true);
  assert.equal(greenCardApplicant.section245kAudit.daysBufferRemaining, 180 - 45);
});

test('UK Skilled Worker & ILR: checks £41,700 vs £31,300 transitional salary, ILR 180-day rolling absence, and Section 21 eviction invalidation', () => {
  // Test 1: Transitional rate for visas first granted before April 2024
  const existingWorker = evaluateUkSkilledWorkerAndIlr({
    annualOfferedSalaryGbp: 32000,
    isPreApril2024VisaHolder: true
  });
  assert.equal(existingWorker.salaryCompliance.applicableThresholdGbp, 31300);
  assert.equal(existingWorker.salaryCompliance.isSalaryCompliant, true);

  // Test 2: General rate from 22 July 2025
  const newApplicant = evaluateUkSkilledWorkerAndIlr({
    annualOfferedSalaryGbp: 34000,
    isPreApril2024VisaHolder: false,
    isNewEntrantRecentGraduate: false,
    applicantAge: 30
  });
  assert.equal(newApplicant.salaryCompliance.applicableThresholdGbp, 41700);
  assert.equal(newApplicant.salaryCompliance.isSalaryCompliant, false);
  assert.equal(newApplicant.salaryCompliance.salaryShortfallGbp, 7700);

  // Test 3: ILR continuous residence & Section 21 invalidation (notice served before abolition)
  const ilrTenancyCheck = evaluateUkSkilledWorkerAndIlr({
    maxAbsenceDaysInAny12Months: 110,
    landlordGasSafetyProvided: false, // Invalidates Section 21!
    noticeServedDate: '2026-03-15'
  });
  assert.equal(ilrTenancyCheck.ilrContinuousResidence.isContinuousResidenceMaintained, true);
  assert.equal(ilrTenancyCheck.housingSection21Defense.section21Abolished, false);
  assert.equal(ilrTenancyCheck.housingSection21Defense.isSection21NoticeValid, false);
  assert.ok(ilrTenancyCheck.housingSection21Defense.statutoryDefects[0].includes('Gas Safety Certificate'));

  // Test 4: a notice served after 1 May 2026 has no effect even with no defects
  const lateNotice = evaluateUkSkilledWorkerAndIlr({ noticeServedDate: '2026-06-01' });
  assert.equal(lateNotice.housingSection21Defense.section21Abolished, true);
  assert.equal(lateNotice.housingSection21Defense.isSection21NoticeValid, false);
});

test('Super Visa & PGP: audits LICO + 30% household income threshold, 20-year undertaking, and $100k insurance compliance', () => {
  // 3 host family + 2 visiting parents = 5 people
  // Required 2024 LICO + 30% for 5 people = $75,384 CAD
  const superVisaApplicant = evaluateSuperVisaAndPgp({
    hostFamilyMembersInCanada: 3,
    parentsGrandparentsToSponsor: 2,
    hostAnnualIncomeCad: 82000,
    hasCanadianHealthInsurance: true,
    insuranceCoverageAmountCad: 100000,
    insuranceCoversRepatriation: true,
    applicationType: 'super_visa'
  });

  assert.equal(superVisaApplicant.householdAudit.totalFamilyUnitSize, 5);
  assert.equal(superVisaApplicant.householdAudit.requiredLicoPlus30IncomeCad, 75384);
  assert.equal(superVisaApplicant.superVisaEvaluation.isIncomeSufficient, true);
  assert.equal(superVisaApplicant.superVisaEvaluation.insuranceAudit.isCompliant, true);

  // Insufficient insurance test
  const badInsurance = evaluateSuperVisaAndPgp({
    hostFamilyMembersInCanada: 2,
    parentsGrandparentsToSponsor: 1,
    insuranceCoverageAmountCad: 50000, // less than $100k
    insuranceCoversRepatriation: false
  });
  assert.equal(badInsurance.superVisaEvaluation.insuranceAudit.isCompliant, false);
  assert.ok(badInsurance.superVisaEvaluation.insuranceAudit.issues.length >= 2);
});

test('Australia & Germany: audits Condition 8607 180-day transfer, MES exemption, Chancenkarte points, and Nebenkosten 12-month cutoff', () => {
  // Australia 482 condition 8607
  const auWorker = evaluateAustraliaReforms({
    visaSubclass: '482_tss',
    daysSinceCeasedEmployment: 40,
    annualTaxableIncomeAud: 100000,
    hasMedicareEntitlementStatement: true
  });
  assert.equal(auWorker.condition8607Audit.isCompliant, true);
  assert.equal(auWorker.condition8607Audit.consecutiveDaysRemaining, 140);
  assert.equal(auWorker.medicareLevyExemption.annualPotentialTaxSavingsAud, 2000); // 2% of $100k

  // Germany Chancenkarte & Nebenkosten late bill
  const deMigrant = evaluateGermanyChancenkarteAndTenancy({
    chancenkartePoints: 6,
    secondaryWorkHoursPerWeek: 20,
    nebenkostenInvoiceMonthsAfterPeriod: 15, // > 12 months = Ausschlussfrist!
    nebenkostenArrearsDemandedEur: 750
  });
  assert.equal(deMigrant.chancenkarteAudit.isPointsEligible, true);
  assert.equal(deMigrant.chancenkarteAudit.isWorkHoursCompliant, true);
  assert.equal(deMigrant.nebenkostenTenancyAudit.isBilledWithinDeadline, false);
  assert.equal(deMigrant.nebenkostenTenancyAudit.isTenantObligatedToPay, false);
  assert.ok(deMigrant.nebenkostenTenancyAudit.legalRule.includes('LEGALLY PRECLUDED'));
});

test('HTTP API Batch 3: validates GET & POST endpoints for all 5 new navigators', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'test-admin-token-at-least-24-chars-long');
  await new Promise(res => server.listen(0, '127.0.0.1', res));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    // 1. US H-1B & OPT (GET & POST)
    const resGetUs = await fetch(`${baseUrl}/v1/tools/us-h1b-opt?status=h1b&lastWorked=2026-10-10`);
    assert.equal(resGetUs.status, 200);
    const bodyGetUs = await resGetUs.json();
    assert.ok(bodyGetUs.h1bGracePeriodAudit.daysRemaining !== undefined);

    const resPostUs = await fetch(`${baseUrl}/v1/tools/us-h1b-opt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visaStatus: 'f1_opt', hasTimelyFiledH1bCos: true })
    });
    assert.equal(resPostUs.status, 200);
    const bodyPostUs = await resPostUs.json();
    assert.equal(bodyPostUs.capGapAudit.isCapGapEligible, true);

    // 2. UK Skilled Worker (GET & POST)
    const resGetUk = await fetch(`${baseUrl}/v1/tools/uk-skilled-worker?salary=42000`);
    assert.equal(resGetUk.status, 200);
    const bodyGetUk = await resGetUk.json();
    assert.equal(bodyGetUk.salaryCompliance.isSalaryCompliant, true);

    const resPostUk = await fetch(`${baseUrl}/v1/tools/uk-skilled-worker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ annualOfferedSalaryGbp: 32000, isPreApril2024VisaHolder: true }) // transitional £31,300 since 22 July 2025
    });
    assert.equal(resPostUk.status, 200);
    const bodyPostUk = await resPostUk.json();
    assert.equal(bodyPostUk.salaryCompliance.isSalaryCompliant, true);

    // 3. Super Visa LICO (GET & POST)
    const resGetLico = await fetch(`${baseUrl}/v1/tools/super-visa-lico?hostMembers=2&visitingMembers=2&income=70000`);
    assert.equal(resGetLico.status, 200);
    const bodyGetLico = await resGetLico.json();
    assert.equal(bodyGetLico.householdAudit.totalFamilyUnitSize, 4);

    const resPostLico = await fetch(`${baseUrl}/v1/tools/super-visa-lico`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostFamilyMembersInCanada: 1, parentsGrandparentsToSponsor: 1, hostAnnualIncomeCad: 55000 })
    });
    assert.equal(resPostLico.status, 200);
    const bodyPostLico = await resPostLico.json();
    assert.equal(bodyPostLico.superVisaEvaluation.isIncomeSufficient, true);

    // 4. Australia Reforms (GET & POST)
    const resGetAu = await fetch(`${baseUrl}/v1/tools/australia-reforms?ceasedDays=25&income=80000`);
    assert.equal(resGetAu.status, 200);
    const bodyGetAu = await resGetAu.json();
    assert.equal(bodyGetAu.condition8607Audit.isCompliant, true);

    const resPostAu = await fetch(`${baseUrl}/v1/tools/australia-reforms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daysSinceCeasedEmployment: 50, annualTaxableIncomeAud: 90000 })
    });
    assert.equal(resPostAu.status, 200);
    const bodyPostAu = await resPostAu.json();
    assert.ok(bodyPostAu.medicareLevyExemption.annualPotentialTaxSavingsAud > 0);

    // 5. Germany Chancenkarte (GET & POST)
    const resGetDe = await fetch(`${baseUrl}/v1/tools/germany-chancenkarte?points=7&nebenkostenMonths=10`);
    assert.equal(resGetDe.status, 200);
    const bodyGetDe = await resGetDe.json();
    assert.equal(bodyGetDe.chancenkarteAudit.isPointsEligible, true);
    assert.equal(bodyGetDe.nebenkostenTenancyAudit.isBilledWithinDeadline, true);

    const resPostDe = await fetch(`${baseUrl}/v1/tools/germany-chancenkarte`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chancenkartePoints: 6, nebenkostenInvoiceMonthsAfterPeriod: 16 })
    });
    assert.equal(resPostDe.status, 200);
    const bodyPostDe = await resPostDe.json();
    assert.equal(bodyPostDe.nebenkostenTenancyAudit.isTenantObligatedToPay, false);

  } finally {
    await new Promise(res => server.close(res));
  }
});
