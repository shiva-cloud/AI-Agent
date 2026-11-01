import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALBERTA_PERIODIC_TENANCY_CONSTANTS,
  evaluateAlbertaPeriodicTenancyNotice
} from '../src/alberta-residential-tenancy-periodic-tenancy-termination-navigator.js';

test('Alberta Periodic Tenancy - Constants reflect RTA ss. 5-12', () => {
  assert.equal(ALBERTA_PERIODIC_TENANCY_CONSTANTS.TENANT_MONTH_TO_MONTH_NOTICE_MONTHS, 1);
  assert.equal(ALBERTA_PERIODIC_TENANCY_CONSTANTS.LANDLORD_MONTH_TO_MONTH_NOTICE_MONTHS, 3);
  assert.ok(ALBERTA_PERIODIC_TENANCY_CONSTANTS.PRESCRIBED_LANDLORD_REASONS.includes('LANDLORD_OR_RELATIVE_OCCUPANCY'));
});

test('Alberta Periodic Tenancy - Valid landlord notice with 3 full months for relative occupancy', () => {
  const result = evaluateAlbertaPeriodicTenancyNotice({
    partyGivingNotice: 'LANDLORD',
    tenancyType: 'MONTH_TO_MONTH',
    fullTenancyMonthsNoticeGiven: 3,
    landlordStatedReason: 'LANDLORD_OR_RELATIVE_OCCUPANCY',
    noticeInWritingAndSigned: true
  });

  assert.equal(result.isValidNotice, true);
  assert.equal(result.complianceStatus, 'COMPLIANT_PERIODIC_NOTICE');
  assert.equal(result.statutoryViolations.length, 0);
});

test('Alberta Periodic Tenancy - Defective landlord notice with only 1 month notice', () => {
  const result = evaluateAlbertaPeriodicTenancyNotice({
    partyGivingNotice: 'LANDLORD',
    fullTenancyMonthsNoticeGiven: 1,
    landlordStatedReason: 'LANDLORD_OR_RELATIVE_OCCUPANCY'
  });

  assert.equal(result.isValidNotice, false);
  assert.equal(result.complianceStatus, 'DEFECTIVE_STATUTORY_TERMINATION_NOTICE');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_LANDLORD_NOTICE_PERIOD'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'CHALLENGE_DEFECTIVE_NOTICE_AT_RTDRS'));
});

test('Alberta Periodic Tenancy - Defective landlord notice with unprescribed arbitrary reason', () => {
  const result = evaluateAlbertaPeriodicTenancyNotice({
    partyGivingNotice: 'LANDLORD',
    fullTenancyMonthsNoticeGiven: 3,
    landlordStatedReason: 'WANT_TO_CHARGE_HIGHER_RENT'
  });

  assert.equal(result.isValidNotice, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNAUTHORIZED_LANDLORD_TERMINATION_REASON'));
});

test('Alberta Periodic Tenancy - Valid tenant 1-month notice to terminate', () => {
  const result = evaluateAlbertaPeriodicTenancyNotice({
    partyGivingNotice: 'TENANT',
    fullTenancyMonthsNoticeGiven: 1,
    noticeInWritingAndSigned: true
  });

  assert.equal(result.isValidNotice, true);
  assert.equal(result.complianceStatus, 'COMPLIANT_PERIODIC_NOTICE');
});
