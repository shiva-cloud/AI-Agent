// test/employment-standards.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  auditWorkerClassificationAndWageTheft,
  PROVINCIAL_OVERTIME_THRESHOLDS,
  STATUTORY_VACATION_PAY_RATE
} from '../src/employment-standards.js';

describe('Canadian Employment Standards & Worker Misclassification Engine', () => {
  it('provincial overtime thresholds are defined correctly', () => {
    assert.equal(PROVINCIAL_OVERTIME_THRESHOLDS.ON.weeklyHoursThreshold, 44);
    assert.equal(PROVINCIAL_OVERTIME_THRESHOLDS.BC.weeklyHoursThreshold, 40);
    assert.equal(STATUTORY_VACATION_PAY_RATE, 0.04);
  });

  it('detects unlawful employee misclassification under Sagaz Industries & Ontario ESA s. 5.3', () => {
    const res = auditWorkerClassificationAndWageTheft({
      province: 'ON',
      jobTitle: 'IT Support Specialist',
      hourlyRateCad: 30,
      averageWeeklyHoursWorked: 50, // 6 hrs overtime above 44 threshold
      weeksWorkedTotal: 52,
      contractLabelsWorkerAs: 'independent_contractor',
      employerSetsScheduleAndLocation: true,
      employerProvidesToolsAndLaptop: true,
      workerCannotHireSubcontractors: true,
      workerHasNoRiskOfFinancialLoss: true,
      workerWorksExclusivelyForEmployer: true,
      wasVacationPayPaid: false,
      wasOvertimePayPaid: false,
      publicHolidaysWorkedCount: 5
    });

    assert.equal(res.classificationVerdict, 'UNLAWFUL_EMPLOYEE_MISCLASSIFICATION');
    assert.equal(res.isMisclassifiedEmployee, true);
    assert.equal(res.hoursSummary.overtimeHoursPerWeek, 6);
    // Overtime: 6 hrs * 52 wks * $30 * 0.5 = $4,680
    assert.equal(res.wageTheftAudit.unpaidOvertimeCad, 4680);
    // Gross: 50 * 52 * 30 = 78,000. Vacation: 78,000 * 0.04 = 3,120
    assert.equal(res.wageTheftAudit.unpaidVacationPayCad, 3120);
    assert.ok(res.wageTheftAudit.totalDirectWageTheftCad > 7800);
    assert.ok(res.wageTheftAudit.employerCppLiabilityCad > 3000);
    assert.ok(res.officialDemandLetter.includes('Sagaz Industries'));
    assert.ok(res.officialDemandLetter.includes('Section 5.3'));
  });

  it('validates a legitimate independent contractor relationship', () => {
    const res = auditWorkerClassificationAndWageTheft({
      province: 'ON',
      jobTitle: 'Independent Software Architect',
      hourlyRateCad: 90,
      averageWeeklyHoursWorked: 35,
      contractLabelsWorkerAs: 'independent_contractor',
      employerSetsScheduleAndLocation: false,
      employerProvidesToolsAndLaptop: false,
      workerCannotHireSubcontractors: false,
      workerHasNoRiskOfFinancialLoss: false,
      workerWorksExclusivelyForEmployer: false
    });

    assert.equal(res.classificationVerdict, 'LEGITIMATE_INDEPENDENT_CONTRACTOR');
    assert.equal(res.isMisclassifiedEmployee, false);
    assert.equal(res.commonLawFactors.contractorIndicators.length, 5);
  });

  it('applies British Columbia 40-hour overtime threshold under BC ESA', () => {
    const res = auditWorkerClassificationAndWageTheft({
      province: 'BC',
      jobTitle: 'Logistics Coordinator',
      hourlyRateCad: 25,
      averageWeeklyHoursWorked: 48, // 8 hrs overtime above 40 threshold
      weeksWorkedTotal: 40,
      wasOvertimePayPaid: false
    });

    assert.equal(res.province, 'BC');
    assert.equal(res.hoursSummary.statutoryOvertimeThreshold, 40);
    assert.equal(res.hoursSummary.overtimeHoursPerWeek, 8);
    // Overtime: 8 hrs * 40 wks * 25 * 0.5 = 4000
    assert.equal(res.wageTheftAudit.unpaidOvertimeCad, 4000);
  });

  it('recognizes already compliant properly classified employees', () => {
    const res = auditWorkerClassificationAndWageTheft({
      province: 'ON',
      contractLabelsWorkerAs: 'employee',
      wasVacationPayPaid: true,
      wasOvertimePayPaid: true
    });

    assert.equal(res.classificationVerdict, 'PROPERLY_CLASSIFIED_EMPLOYEE');
    assert.equal(res.wageTheftAudit.unpaidOvertimeCad, 0);
    assert.equal(res.wageTheftAudit.unpaidVacationPayCad, 0);
  });
});
