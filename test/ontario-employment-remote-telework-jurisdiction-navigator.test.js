import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateOntarioRemoteWorkJurisdiction,
  ON_DISCONNECTING_POLICY_MIN_EMPLOYEES,
  ON_NON_COMPETE_BAN_DATE
} from '../src/ontario-employment-remote-telework-jurisdiction-navigator.js';

test('Ontario Remote Work - Ontario Home Worker for BC Employer with Bill 79 Group Termination', () => {
  const result = evaluateOntarioRemoteWorkJurisdiction({
    employeePhysicalWorkLocation: 'ONTARIO',
    employerHeadquartersLocation: 'BRITISH_COLUMBIA',
    worksExclusivelyFromHome: true,
    employerTotalOntarioHeadcount: 50,
    hasWrittenDisconnectingFromWorkPolicy: true,
    hasNonCompeteClauseInContract: false,
    isGroupTerminationEvent: true,
    totalRemoteEmployeesTerminated: 30,
    totalInOfficeEmployeesTerminated: 30, // 60 total -> 8 weeks group notice
    employeeTenureMonths: 36, // 3 years -> 3 weeks individual notice
    weeklySalaryCad: 1500
  });

  assert.equal(result.hasOntarioEsaJurisdiction, true);
  assert.equal(result.jurisdictionalAssessment.hasOntarioEsaJurisdiction, true);
  assert.equal(result.remoteWorkerAudit.isCoveredByBill79GroupTermination, true);
  assert.equal(result.remoteWorkerAudit.groupNoticeWeeksEntitlement, 8);
  assert.equal(result.remoteWorkerAudit.individualNoticeWeeksEntitlement, 3);
  assert.equal(result.remoteWorkerAudit.individualNoticePayCad, 4500);
  assert.equal(result.complianceViolations.length, 0);
  assert.equal(result.legalVerdict, 'ONTARIO_ESA_FULLY_APPLICABLE_AND_COMPLIANT');
});

test('Ontario Remote Work - Out-of-province physical location excludes Ontario ESA', () => {
  const result = evaluateOntarioRemoteWorkJurisdiction({
    employeePhysicalWorkLocation: 'ALBERTA', // Physically in AB
    employerHeadquartersLocation: 'ONTARIO'
  });

  assert.equal(result.hasOntarioEsaJurisdiction, false);
  assert.equal(result.legalVerdict, 'OUTSIDE_ONTARIO_ESA_JURISDICTION');
});

test('Ontario Remote Work - Violations: Void Non-compete and Missing Disconnecting Policy', () => {
  const result = evaluateOntarioRemoteWorkJurisdiction({
    employeePhysicalWorkLocation: 'ONTARIO',
    employerHeadquartersLocation: 'UNITED_STATES',
    employerTotalOntarioHeadcount: 40,
    hasWrittenDisconnectingFromWorkPolicy: false, // Breach!
    hasNonCompeteClauseInContract: true, // Signed post-2021 ban!
    contractSignedDate: '2023-05-01',
    isExecutiveOrCSuite: false
  });

  assert.equal(result.hasOntarioEsaJurisdiction, true);
  assert.equal(result.legalVerdict, 'ONTARIO_ESA_STATUTORY_VIOLATION_DETECTED');
  assert.ok(result.complianceViolations.some(v => v.violation === 'MISSING_DISCONNECTING_FROM_WORK_POLICY'));
  assert.ok(result.complianceViolations.some(v => v.violation === 'VOID_NON_COMPETE_AGREEMENT'));
});

test('Ontario Remote Work - Verify Constants', () => {
  assert.equal(ON_DISCONNECTING_POLICY_MIN_EMPLOYEES, 25);
  assert.equal(ON_NON_COMPETE_BAN_DATE, '2021-10-25');
});
