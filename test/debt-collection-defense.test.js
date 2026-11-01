import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEBT_DEFENSE_CONSTANTS,
  calculateYearsElapsed,
  evaluateDebtCollectionDefense
} from '../src/debt-collection-defense.js';

test('Debt Collection Defense Engine - Constants & Authorities', () => {
  assert.ok(DEBT_DEFENSE_CONSTANTS.STATUTES.ONTARIO_CDSSA.includes('CDSSA'));
  assert.ok(DEBT_DEFENSE_CONSTANTS.STATUTES.ONTARIO_LIMITATIONS.includes('2-Year'));
  assert.ok(DEBT_DEFENSE_CONSTANTS.STATUTES.FEDERAL_EXTORTION.includes('s. 346'));
  assert.equal(DEBT_DEFENSE_CONSTANTS.LIMITATION_PERIOD_YEARS, 2);
  assert.equal(DEBT_DEFENSE_CONSTANTS.CREDIT_BUREAU_PURGE_YEARS, 6);
  assert.equal(DEBT_DEFENSE_CONSTANTS.MAX_WEEKLY_CALL_LIMIT, 3);
});

test('calculateYearsElapsed measures elapsed time accurately', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');
  assert.ok(calculateYearsElapsed('2024-10-31', refDate) >= 2.0);
  assert.ok(calculateYearsElapsed('2020-10-31', refDate) >= 6.0);
  assert.ok(calculateYearsElapsed('2026-04-30', refDate) < 1.0);
});

test('evaluateDebtCollectionDefense identifies statute-barred debt past 2-year limitation', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');
  const result = evaluateDebtCollectionDefense({
    province: 'ON',
    debtType: 'telecom',
    lastPaymentOrDefaultDate: '2023-01-15', // ~3.8 years ago
    allegedDebtAmountCad: 850,
    collectionAgencyName: 'Apex Receivables',
    receivedWrittenNoticeOfCollection: true,
    callsInPastWeek: 1
  }, refDate);

  assert.equal(result.province, 'ON');
  assert.equal(result.isStatuteBarred, true);
  assert.equal(result.resolutionVerdict, 'STATUTE_BARRED_TIME_EXPIRED');
  assert.ok(result.legalProtections.some(p => p.shield === 'STATUTE_BARRED_DEBT'));
  assert.ok(result.ceaseAndDesistNotice.includes('STATUTE-BARRED NOTICE'));
  assert.ok(result.ceaseAndDesistNotice.includes('Apex Receivables'));
});

test('evaluateDebtCollectionDefense identifies 6-year credit bureau purge mandate', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');
  const result = evaluateDebtCollectionDefense({
    province: 'ON',
    debtType: 'credit_card',
    lastPaymentOrDefaultDate: '2019-05-01', // ~7.5 years ago
    allegedDebtAmountCad: 2500,
    receivedWrittenNoticeOfCollection: true
  }, refDate);

  assert.equal(result.isStatuteBarred, true);
  assert.equal(result.isCreditBureauPurgeEligible, true);
  assert.ok(result.legalProtections.some(p => p.shield === 'CREDIT_BUREAU_PURGE_MANDATE'));
});

test('evaluateDebtCollectionDefense strictly flags deportation & immigration threats as criminal extortion', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');
  const result = evaluateDebtCollectionDefense({
    province: 'ON',
    debtType: 'telecom',
    lastPaymentOrDefaultDate: '2026-01-01',
    allegedDebtAmountCad: 600,
    threatenedImmigrationOrDeportation: true, // Criminal violation
    threatenedImmediateArrestOrLawsuit: true
  }, refDate);

  assert.equal(result.resolutionVerdict, 'CRIMINAL_EXTORTION_REPORT_MANDATED');
  assert.ok(result.statutoryViolations.some(v => v.violationCode === 'IMMIGRATION_COERCION_EXTORTION'));
  assert.ok(result.statutoryViolations.some(v => v.severity === 'CRITICAL_CRIMINAL_VIOLATION'));
  assert.ok(result.ceaseAndDesistNotice.includes('EXTORTION & MISCONDUCT WARNING'));
  assert.ok(result.ceaseAndDesistNotice.includes('Criminal Code s. 346'));
});

test('evaluateDebtCollectionDefense catches workplace calls, family calls, and excessive call frequency', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');
  const result = evaluateDebtCollectionDefense({
    province: 'BC',
    debtType: 'utility',
    lastPaymentOrDefaultDate: '2026-02-01',
    allegedDebtAmountCad: 400,
    receivedWrittenNoticeOfCollection: false,
    callsInPastWeek: 5, // > 3 limit
    calledEmployer: true,
    calledFamilyOrFriends: true,
    calledOutsidePermittedHours: true
  }, refDate);

  assert.equal(result.hasViolations, true);
  assert.equal(result.violationCount, 5);
  assert.ok(result.statutoryViolations.some(v => v.violationCode === 'UNLAWFUL_EMPLOYER_CONTACT'));
  assert.ok(result.statutoryViolations.some(v => v.violationCode === 'UNLAWFUL_THIRD_PARTY_HARASSMENT'));
  assert.ok(result.statutoryViolations.some(v => v.violationCode === 'EXCESSIVE_CALL_FREQUENCY'));
  assert.ok(result.statutoryViolations.some(v => v.violationCode === 'PREMATURE_CONTACT_NO_WRITTEN_NOTICE'));
  assert.ok(result.statutoryViolations.some(v => v.violationCode === 'OUTSIDE_PERMITTED_HOURS'));
  assert.ok(result.regulatoryFilingGuide.agency.includes('Consumer Protection BC'));
});
