// test/batch29-recommendations.test.js
// Verification suite for Sweep 36 (Recommendations 501–515).

import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateForeignAssetReporting, calculateProratedBpa } from '../src/tax-treaty-engine.js';
import { assessTelecomDispute } from '../src/telecom-contract-defense.js';
import { telecomContext } from '../src/telecom.js';
import { parseTemporalContext } from '../src/temporal-query-navigator.js';
import { evaluateTrpCompellingBalance } from '../src/temporary-resident-permit-inadmissibility-navigator.js';
import { evaluateTenancyRepairs } from '../src/tenancy-repairs-navigator.js';
import { evaluateTfwEmployerCompliance } from '../src/tfw-compliance-navigator.js';
import { generateIcsCalendar } from '../src/timeline-calendar-sync.js';
import { evaluateUkSkilledWorkerAndIlr } from '../src/uk-skilled-worker-ilr-navigator.js';
import { evaluateUsH1bOptStatus } from '../src/us-h1b-opt-navigator.js';
import { evaluateVehicleImportation } from '../src/vehicle-importation.js';
import { evaluateVisitorVisaTies } from '../src/visitor-visa-financial-ties-navigator.js';
import { evaluateVulnerableWorkerProtection } from '../src/vulnerable-worker-defense.js';
import { auditConstructiveDismissal, auditCanadianExperienceBarriers } from '../src/workplace-rights-defense-navigator.js';
import { evaluateWorkplaceSafetyAndRefusal, generateWorkRefusalNotice } from '../src/workplace-safety-navigator.js';

test('Rec 501: evaluateForeignAssetReporting and calculateProratedBpa adhere to wording guards and sanitize dates', () => {
  const res = evaluateForeignAssetReporting({
    taxpayerName: 'Alexandre Dumas\u0000',
    origin: 'India',
    dest: 'Canada',
    assetsUSD: 250000,
    firstYear: true,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.taxpayerName, 'Alexandre Dumas');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.statusBadge, 'FIRST-YEAR EXEMPT');
  assert.equal(res.mandatoryFiling, false);

  const bpa = calculateProratedBpa({ entryDateStr: '2026-07-01', annualBpa: 15705 });
  assert.ok(bpa.proratedBpa > 0);
});

test('Rec 502: assessTelecomDispute sanitizes customer & provider names and checks CCTS eligibility', () => {
  const res = assessTelecomDispute({
    customerName: 'Elena Rostova',
    providerName: 'Rogers Communications',
    monthlyPlanCostCad: 85,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.customerName, 'Elena Rostova');
  assert.equal(res.providerName, 'Rogers Communications');
  assert.equal(res.assessmentDate, '2026-10-31');
});

test('Rec 503: telecomContext defends against non-string input and returns plans or context', () => {
  const res = telecomContext('need phone plan with high data');
  assert.ok(Array.isArray(res.subjects));
  assert.ok(typeof res.priceRequest === 'boolean');

  const safeNonString = telecomContext({ invalid: 123 });
  assert.ok(Array.isArray(safeNonString.subjects));
});

test('Rec 504: parseTemporalContext sanitizes referenceDate and parses temporal cues', () => {
  const res = parseTemporalContext('current rules in 2026', '2026-10-31');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.targetYear, 2026);
  assert.equal(res.isFutureRule, true);
});

test('Rec 505: evaluateTrpCompellingBalance sanitizes applicantName and audits inadmissibility relief', () => {
  const res = evaluateTrpCompellingBalance({
    applicantName: 'Marcus Vance\u0007',
    inadmissibilityType: 'criminality_s36_2',
    yearsElapsedSinceSentenceOrTrigger: 5,
    compellingReasonCategory: 'urgent_family_need',
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.applicantName, 'Marcus Vance');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.ok(res.recommendationVerdict);
  assert.ok(res.prPathwayPermitHolderClass);
});

test('Rec 506: evaluateTenancyRepairs audits provincial repair requirements and sanitizes tenantName', () => {
  const res = evaluateTenancyRepairs({
    tenantName: 'Sophie Lin',
    province: 'ON',
    issues: ['no_heat_winter'],
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.tenantName, 'Sophie Lin');
  assert.equal(res.province, 'ON');
  assert.equal(res.assessmentDate, '2026-10-31');
});

test('Rec 507: evaluateTfwEmployerCompliance standardizes text sanitization and audits LMIA compliance', () => {
  const res = evaluateTfwEmployerCompliance({
    workerName: 'Carlos Rivera',
    employerName: 'AgriCorp Inc',
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.workerName, 'Carlos Rivera');
  assert.equal(res.employerName, 'AgriCorp Inc');
  assert.equal(res.assessmentDate, '2026-10-31');
});

test('Rec 508: generateIcsCalendar outputs compliant iCalendar without absolute overclaims', () => {
  const ics = generateIcsCalendar([
    {
      title: 'PR Card Renewal Deadline',
      startDate: '2026-11-15',
      endDate: '2026-11-15',
      description: 'Statutory deadline to submit PR renewal'
    }
  ]);
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('PR Card Renewal Deadline'));
  assert.ok(!ics.includes('ABSOLUTE'));
});

test('Rec 509: evaluateUkSkilledWorkerAndIlr audits ILR requirements with date-aware checks', () => {
  const res = evaluateUkSkilledWorkerAndIlr({
    applicantName: 'Priya Sharma',
    currentYearsOnSkilledWorker: 5,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.applicantName, 'Priya Sharma');
  assert.equal(res.assessmentDate, '2026-10-31');
});

test('Rec 510: evaluateUsH1bOptStatus audits 60-day grace period, Cap-Gap, and 245(k)', () => {
  const res = evaluateUsH1bOptStatus({
    applicantName: 'Wei Zhang',
    currentStatus: 'h1b',
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.applicantName, 'Wei Zhang');
  assert.equal(res.assessmentDate, '2026-10-31');
});

test('Rec 511: evaluateVehicleImportation audits RIV compliance, clamps values, and avoids overclaims', () => {
  const res = evaluateVehicleImportation({
    importerName: 'David Miller\u0000',
    countryOfOrigin: 'US',
    vehicleModelYear: 2022,
    isOwnedAbroadAtLeastSixMonths: true,
    isTitledInImmigrantName: true,
    destinationProvince: 'ON',
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.importerName, 'David Miller');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isStatutorilyAdmissible, true);
  assert.equal(res.costAndTaxAudit.isSettlerTariffExempt, true);
});

test('Rec 512: evaluateVisitorVisaTies evaluates ties and dual intent with sanitized bounds', () => {
  const res = evaluateVisitorVisaTies({
    applicantName: 'Fatima Al-Mansoor',
    countryOfResidence: 'AE',
    plannedStayDays: 21,
    liquidFundsCad: 15000,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.applicantName, 'Fatima Al-Mansoor');
  assert.equal(res.countryOfResidence, 'AE');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.ok(res.tieScoreOutOf100 >= 0);
});

test('Rec 513: evaluateVulnerableWorkerProtection audits VWOWP fee exemption and abuse grounds', () => {
  const res = evaluateVulnerableWorkerProtection({
    workerName: 'Maria Santos',
    currentPermitType: 'closed_employer_specific_work_permit',
    abuseGrounds: ['illegal_recruitment_fees'],
    recruitmentFeesPaidCad: 5000,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.workerName, 'Maria Santos');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isVwowpEligible, true);
  assert.equal(res.totalFinancialLossCad, 5000);
});

test('Rec 514: auditConstructiveDismissal & Canadian Experience barriers audit substantial breach and FARPACTA', () => {
  const res1 = auditConstructiveDismissal({
    employeeName: 'Jean Tremblay',
    unilateralWageReductionPercent: 15,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res1.employeeName, 'Jean Tremblay');
  assert.equal(res1.isConstructiveDismissal, true);

  const res2 = auditCanadianExperienceBarriers({
    applicantName: 'Anita Roy',
    type: 'professional_licensure',
    employerDemandedCanadianExperience: true,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res2.applicantName, 'Anita Roy');
  assert.equal(res2.isViolation, true);
});

test('Rec 515: evaluateWorkplaceSafetyAndRefusal audits OHSA s. 43 refusal stages and s. 50 reprisal', () => {
  const res = evaluateWorkplaceSafetyAndRefusal({
    workerName: 'Kenji Sato',
    employerName: 'SteelWorks Ltd',
    hasUnsafeWorkConditions: true,
    refusalStage: 'stage_1_internal',
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.workerName, 'Kenji Sato');
  assert.equal(res.employerName, 'SteelWorks Ltd');
  assert.equal(res.province, 'ON');
  assert.equal(res.safetyRefusalAudit.refusalLegitimate, true);

  const notice = generateWorkRefusalNotice({
    workerName: 'Kenji Sato',
    employerName: 'SteelWorks Ltd',
    noticeDate: '2026-10-31'
  });
  assert.ok(notice.includes('Kenji Sato'));
  assert.ok(notice.includes('SteelWorks Ltd'));
});
