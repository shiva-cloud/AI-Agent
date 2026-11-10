import test from 'node:test';
import assert from 'node:assert/strict';
import { studyFinancialPolicy } from '../src/study-financial-policy.js';
import { evaluateStudyPermitCapAndPal } from '../src/study-permit-cap-pal-navigator.js';
import { auditStudyPermitAndPal } from '../src/study-permit-pal-navigator.js';
import { graduatePalRequirement } from '../src/study-graduate-pal-policy.js';

test('graduate PAL exemption requires public DLI and reviewed 2026 application date', () => {
  assert.equal(graduatePalRequirement('2026-01-01', true), false);
  assert.equal(graduatePalRequirement('2026-11-06', false), true);
  assert.equal(graduatePalRequirement('2026-11-06', undefined), null);
  assert.equal(graduatePalRequirement('2025-12-31', true), null);
  assert.equal(graduatePalRequirement('2027-01-01', true), null);
  assert.throws(() => graduatePalRequirement('2026-11-06', 'yes'));
  assert.equal(auditStudyPermitAndPal({ programLevel: 'masters_degree', applicationDate: '2026-11-06' }).palAssessment.isPalRequired, null);
  assert.equal(auditStudyPermitAndPal({ programLevel: 'masters_degree', institutionType: 'public_university', applicationDate: '2026-11-06' }).palAssessment.isPalRequired, false);
});

test('legacy study engine rejects invalid inputs and does not invent missing tuition', () => {
  const base = { programLevel: 'undergraduate_degree' };
  assert.equal(auditStudyPermitAndPal(base).financialProof.totalProofRequiredCad, null);
  for (const input of [{ firstYearTuition: -1 }, { accompanyingDependents: 1.5 }, { accompanyingDependents: true },
    { inStudySession: 'yes' }, { isExtensionWithinCanada: {} }, { institutionType: 'fake' }, { assessmentDate: '2026-02-30' }]) {
    assert.throws(() => auditStudyPermitAndPal({ ...base, ...input }));
  }
  assert.equal(auditStudyPermitAndPal({ ...base, inStudySession: 'false' }).offCampusWork.currentAllowedHours, 'unlimited');
});

test('reviewed study finance table uses effective dates, household size and jurisdiction', () => {
  const get = (applicationDate, dependents = 0, province = 'ON') => studyFinancialPolicy({ applicationDate, dependents, province });
  assert.equal(get('2026-08-31').livingCostsCad, 22895);
  assert.equal(get('2026-09-01').livingCostsCad, 23448);
  assert.equal(get('2026-11-06', 2).livingCostsCad, 35888);
  assert.equal(get('2026-11-06', 7).livingCostsCad, 68372);
  for (const args of [['2024-12-31'], ['2026-11-09'], ['2026-11-08', 0, 'QC']]) {
    assert.equal(get(...args).status, 'POLICY_REVIEW_REQUIRED');
    assert.equal(get(...args).livingCostsCad, null);
  }
  assert.throws(() => get('2026-02-30'));
  assert.throws(() => get('2026-11-06', 1.5));
  assert.throws(() => get('2026-11-06', 0, 'INVALID'));
});

test('both study engines share financial totals and abstain outside reviewed coverage', () => {
  for (const province of ['ON', 'QC']) for (const applicationDate of ['2026-08-31','2026-09-01','2027-01-01']) {
    const cap = evaluateStudyPermitCapAndPal({ applicationDate, province, tuitionFeeFirstYearCad: 20000, liquidFundsAvailableCad: 90000, familyMembersAccompanying: 2 });
    const pal = auditStudyPermitAndPal({ applicationDate, targetProvince: province, programLevel: 'undergraduate_degree', firstYearTuition: 20000, accompanyingDependents: 2 });
    assert.equal(cap.financialAudit.requiredLivingFundsCad, pal.financialProof.costOfLivingRequired);
    assert.equal(cap.financialAudit.travelAllowanceCad, pal.financialProof.estimatedTravel);
    assert.equal(cap.financialAudit.totalStatutoryProofRequiredCad, pal.financialProof.totalProofRequiredCad);
    assert.equal(cap.financialAudit.policy.sourceUrl, pal.financialProof.policy.sourceUrl);
    if (province === 'QC' || applicationDate === '2027-01-01') {
      assert.equal(cap.financialAudit.status, 'NOT_DETERMINED');
      assert.equal(cap.financialAudit.isFinanciallySufficient, null);
    }
  }
});
