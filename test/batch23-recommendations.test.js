import test from 'node:test';
import assert from 'node:assert/strict';

import { auditAlbertaCommercialDistress } from '../src/alberta-commercial-tenant-distress-navigator.js';
import { evaluateAlbertaConstructiveDismissal } from '../src/alberta-employment-constructive-dismissal-salary-reduction-navigator.js';
import { evaluateAlbertaGeneralHolidayPay } from '../src/alberta-employment-general-holiday-pay-navigator.js';
import { evaluateAlbertaMaternityParentalLeave } from '../src/alberta-employment-maternity-parental-leave-navigator.js';
import { calculateAlbertaOvertimeHours, evaluateAlbertaOvertimeBanking } from '../src/alberta-employment-overtime-banking-navigator.js';
import { auditAlbertaEmploymentRestPeriods } from '../src/alberta-employment-rest-periods-shift-limits-navigator.js';
import { auditAlbertaTerminationJustCause } from '../src/alberta-employment-termination-just-cause-audit-navigator.js';
import { evaluateAlbertaYouthEmploymentRules } from '../src/alberta-employment-youth-employment-rules-navigator.js';
import { evaluateAlbertaAbandonedGoods } from '../src/alberta-residential-tenancy-abandoned-goods-distress-navigator.js';
import { evaluateAlbertaLandlordEntry } from '../src/alberta-residential-tenancy-landlord-entry-notice-navigator.js';
import { evaluateAlbertaPeriodicTenancyNotice } from '../src/alberta-residential-tenancy-periodic-tenancy-termination-navigator.js';
import { evaluateAlbertaTenancySubleaseAssignment } from '../src/alberta-residential-tenancy-sublease-assignment-navigator.js';
import { evaluateAlbertaSecurityDeposit } from '../src/alberta-tenancy-security-deposit-navigator.js';
import { evaluateBankingAndCreditStrategy } from '../src/banking-navigator.js';
import { evaluateFlagpolingFeasibility } from '../src/border-flagpoling-navigator.js';
import { todayIso } from '../src/text-input.js';

test('Batch 23 Recommendations (Sweep 30: Recs 411–425)', async (t) => {
  await t.test('Rec 411: auditAlbertaCommercialDistress sanitizes date, clamps values, and audits mutual exclusivity', () => {
    const res = auditAlbertaCommercialDistress({
      rentArrearsClaimedCad: 25000,
      goodsEstimatedValueCad: 60000,
      isSeizureExecutedByLicensedAgency: true,
      hasLandlordChangedLocksOrTerminatedLease: false,
      daysElapsedSinceSeizure: 5,
      tenantFiledNoticeOfObjection: false,
      tenantBusinessName: '  Calgary Tech Hub Inc.  ',
      assessmentDate: 'invalid-date'
    });

    assert.equal(res.assessmentDate, todayIso());
    assert.equal(res.tenantBusinessName, 'Calgary Tech Hub Inc.');
    assert.equal(res.jurisdiction, 'AB');
    assert.equal(res.rentArrearsClaimedCad, 25000);
    assert.equal(res.goodsEstimatedValueCad, 60000);
    assert.equal(res.daysElapsedSinceSeizure, 5);
    assert.equal(res.daysRemainingToServeObjection, 9);
    assert.equal(res.isWithinObjectionWindow, true);
    assert.equal(res.legalVerdict, 'LAWFUL_PENDING_DISTRESS');
    assert.ok(typeof res.summary === 'string' && res.summary.includes('compliant'));

    // Breach test: changing locks forfeits distress
    const breachRes = auditAlbertaCommercialDistress({
      hasLandlordChangedLocksOrTerminatedLease: true,
      isSeizureExecutedByLicensedAgency: false
    });
    assert.equal(breachRes.legalVerdict, 'UNLAWFUL_DISTRESS_OR_CONVERSION');
    assert.ok(breachRes.civilViolations.includes('MUTUAL_EXCLUSIVITY_BREACH_FORFEITURE'));
    assert.ok(breachRes.civilViolations.includes('UNLICENSED_SELF_HELP_SEIZURE'));
  });

  await t.test('Rec 412: evaluateAlbertaConstructiveDismissal audits 20% cut under Farber doctrine with sanitized dates', () => {
    const res = evaluateAlbertaConstructiveDismissal({
      previousAnnualSalaryCad: 90000,
      newAnnualSalaryCad: 72000,
      yearsOfContinuousService: 6,
      employeeAgreedToReduction: false,
      employeeName: '  Alice Smith  ',
      employerName: '  North Corp  ',
      assessmentDate: 'bad-date'
    });

    assert.equal(res.assessmentDate, todayIso());
    assert.equal(res.employeeName, 'Alice Smith');
    assert.equal(res.employerName, 'North Corp');
    assert.equal(res.percentageReduction, 20);
    assert.equal(res.isSubstantialReduction, true);
    assert.equal(res.isConstructiveDismissal, true);
    assert.equal(res.severanceCalculation.statutoryNoticeWeeks, 5);
    assert.ok(res.severanceCalculation.statutoryTerminationPayCad > 0);
    assert.equal(res.complianceStatus, 'CONSTRUCTIVE_DISMISSAL_CONFIRMED');
  });

  await t.test('Rec 413: evaluateAlbertaGeneralHolidayPay audits average daily wage & 1.5x premium pay', () => {
    const res = evaluateAlbertaGeneralHolidayPay({
      holidayName: '  LABOUR_DAY  ',
      workDaysInPast12Months: 75,
      isRegularDayOfWork: true,
      workedOnHoliday: true,
      hoursWorkedOnHoliday: 8,
      regularHourlyWageCad: 30,
      wagesEarnedInPast4WeeksCad: 4800,
      holidayPayActuallyPaidCad: 300,
      employeeName: '  David Miller  ',
      assessmentDate: '2026-09-01'
    });

    assert.equal(res.assessmentDate, '2026-09-01');
    assert.equal(res.employeeName, 'David Miller');
    assert.equal(res.holidayName, 'LABOUR_DAY');
    assert.equal(res.isEligibleForHolidayPay, true);
    // 5% of 4800 = 240 average daily wage
    assert.equal(res.calculationDetails.averageDailyWageCad, 240);
    // 8h * $30 * 1.5 = 360 premium hours + 240 ADW = $600 statutory entitlement
    assert.equal(res.calculationDetails.statutoryHolidayPayOwedCad, 600);
    assert.equal(res.calculationDetails.wageDeficitCad, 300);
    assert.equal(res.complianceStatus, 'UNLAWFUL_HOLIDAY_PAY_UNDERPAYMENT');
  });

  await t.test('Rec 414: evaluateAlbertaMaternityParentalLeave audits 78-week combined cap and job protection', () => {
    const res = evaluateAlbertaMaternityParentalLeave({
      leaveType: 'COMBINED_MATERNITY_PARENTAL',
      consecutiveDaysOfEmployment: 120,
      maternityWeeksRequested: 16,
      parentalWeeksRequested: 62,
      noticeWeeksProvidedBeforeLeave: 6,
      noticeWeeksProvidedBeforeReturn: 4,
      employerRefusesReinstatement: false,
      employeeName: '  Sarah Jenkins  ',
      assessmentDate: '2026-06-15'
    });

    assert.equal(res.assessmentDate, '2026-06-15');
    assert.equal(res.employeeName, 'Sarah Jenkins');
    assert.equal(res.meets90DayThreshold, true);
    assert.equal(res.totalWeeksRequested, 78);
    assert.equal(res.isEligible, true);
    assert.equal(res.complianceStatus, 'COMPLIANT_LEAVE_AND_JOB_PROTECTION');

    // Refusal of reinstatement violation test
    const refusalRes = evaluateAlbertaMaternityParentalLeave({
      consecutiveDaysOfEmployment: 200,
      employerRefusesReinstatement: true
    });
    assert.equal(refusalRes.complianceStatus, 'UNLAWFUL_EMPLOYER_LEAVE_OR_REINSTATEMENT_BREACH');
    assert.ok(refusalRes.statutoryViolations.some(v => v.rule === 'UNLAWFUL_DENIAL_OF_JOB_REINSTATEMENT'));
  });

  await t.test('Rec 415: evaluateAlbertaOvertimeBanking calculates 8/44 rule and handles 6-month expiry payout', () => {
    // 8/44 rule unit check
    const otHours = calculateAlbertaOvertimeHours([9, 9, 8, 8, 8]); // 42 hrs total: daily excess = 2, weekly excess = 0 => 2 ot
    assert.equal(otHours.statutoryOvertimeHours, 2);
    assert.equal(otHours.regularHours, 40);

    const res = evaluateAlbertaOvertimeBanking({
      regularHourlyWageCad: 32,
      dailyHoursWorked: [10, 10, 8, 8, 8], // 44 hrs total: daily excess = 4
      hasWrittenOvertimeAgreement: true,
      existingBankedHours: 10,
      monthsElapsedSinceBanked: 7, // expired!
      employeeName: '  Mark Vance  ',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.employeeName, 'Mark Vance');
    assert.equal(res.jurisdiction, 'ALBERTA');
    assert.equal(res.bankingAudit.isExpiredPast6Months, true);
    assert.ok(res.financialLiability.bankedHoursPayoutCad > 0);
    assert.ok(res.statutoryViolations.some(v => v.violation === 'BANKED_HOURS_EXPIRED_UNPAID'));
  });

  await t.test('Rec 416: auditAlbertaEmploymentRestPeriods audits 30-min break per 5h and 8h inter-shift rest', () => {
    const res = auditAlbertaEmploymentRestPeriods({
      shiftDurationHours: 10,
      restBreakMinutesProvided: 15, // deficit: needs 30
      hoursBetweenConsecutiveShifts: 6, // deficit: needs 8
      consecutiveWorkDaysWorked: 25, // deficit: max 24
      employeeName: '  Tom Baker  ',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.employeeName, 'Tom Baker');
    assert.equal(res.complianceStatus, 'NON_COMPLIANT_REST_STANDARDS_BREACHED');
    assert.equal(res.statutoryViolations.length, 3);
    assert.ok(res.statutoryViolations.some(v => v.rule === 'FAILURE_TO_PROVIDE_30_MINUTE_REST_PERIOD'));
    assert.ok(res.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_REST_BETWEEN_SHIFTS'));
    assert.ok(res.statutoryViolations.some(v => v.rule === 'EXCEEDED_24_CONSECUTIVE_WORK_DAYS'));

    // Managerial exemption
    const mgrRes = auditAlbertaEmploymentRestPeriods({ isManagerOrSupervisor: true, employeeName: 'Boss' });
    assert.equal(mgrRes.isManagerOrSupervisor, true);
    assert.equal(mgrRes.complianceStatus, 'EXEMPT_MANAGERIAL_SUPERVISORY');
  });

  await t.test('Rec 417: auditAlbertaTerminationJustCause evaluates McKinley proportionality and statutory notice scale', () => {
    const res = auditAlbertaTerminationJustCause({
      allegedMisconductCategory: 'PERFORMANCE_ISSUES',
      employerIssuedPriorWrittenWarnings: false,
      employeeGivenOpportunityToImprove: false,
      yearsOfContinuousService: 5,
      regularWeeklyWageCad: 1200,
      actualTerminationNoticeWeeksGiven: 0,
      employeeName: '  John Smith  ',
      employerName: '  Acme Energy  ',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.employeeName, 'John Smith');
    assert.equal(res.employerName, 'Acme Energy');
    assert.equal(res.isJustCauseEstablished, false);
    assert.equal(res.statutoryNoticeScale.statutoryNoticeWeeks, 4);
    assert.equal(res.statutoryNoticeScale.statutoryTerminationPayEntitledCad, 4800);
    assert.ok(res.legalVerdict.includes('defective under McKinley proportionality'));

    // Severe misconduct sets cause
    const severeRes = auditAlbertaTerminationJustCause({ allegedMisconductCategory: 'CRIMINAL_THEFT_FRAUD' });
    assert.equal(severeRes.isJustCauseEstablished, true);
  });

  await t.test('Rec 418: evaluateAlbertaYouthEmploymentRules enforces adolescent 2h school day cap and night work prohibition', () => {
    const res = evaluateAlbertaYouthEmploymentRules({
      employeeAge: 14,
      jobCategory: 'RETAIL_CLERK',
      hasWrittenParentalConsent: false,
      isSchoolDay: true,
      scheduledShiftHours: 3, // exceeds 2h cap
      shiftStartHour: 18,
      shiftEndHour: 22, // exceeds 9:00 PM prohibition
      employeeName: '  Young Worker  ',
      assessmentDate: 'invalid-date'
    });

    assert.equal(res.assessmentDate, todayIso());
    assert.equal(res.employeeName, 'Young Worker');
    assert.equal(res.isCompliant, false);
    assert.ok(res.statutoryViolations.some(v => v.rule === 'MISSING_WRITTEN_PARENTAL_CONSENT'));
    assert.ok(res.statutoryViolations.some(v => v.rule === 'EXCEEDED_MAXIMUM_ADOLESCENT_SHIFT_HOURS'));
    assert.ok(res.statutoryViolations.some(v => v.rule === 'PROHIBITED_ADOLESCENT_NIGHT_WORK'));

    // Under 13 ban
    const childRes = evaluateAlbertaYouthEmploymentRules({ employeeAge: 12 });
    assert.ok(childRes.statutoryViolations.some(v => v.rule === 'CHILD_UNDER_13_EMPLOYMENT_PROHIBITED'));
  });

  await t.test('Rec 419: evaluateAlbertaAbandonedGoods evaluates $2,000 threshold, 30-day storage, and rent arrears bar', () => {
    const res = evaluateAlbertaAbandonedGoods({
      actorRole: 'TENANT',
      estimatedMarketValueCad: 3500,
      daysSinceLandlordTookPossession: 10,
      landlordDisposedBefore30Days: true,
      landlordRefusedReleaseWithoutRentArrears: true,
      accruedStorageAndMovingCostsCad: 300,
      unpaidRentArrearsCad: 2000,
      tenantName: '  Alex Rivera  ',
      landlordName: '  Edmonton Properties  ',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.tenantName, 'Alex Rivera');
    assert.equal(res.landlordName, 'Edmonton Properties');
    assert.equal(res.isAbove2000Threshold, true);
    assert.equal(res.complianceStatus, 'UNLAWFUL_ABANDONED_GOODS_PRACTICE');
    assert.ok(res.statutoryViolations.some(v => v.rule === 'UNLAWFUL_PREMATURE_DISPOSAL_OF_ABANDONED_GOODS'));
    assert.ok(res.statutoryViolations.some(v => v.rule === 'UNLAWFUL_WITHHOLDING_OF_TENANT_PROPERTY'));
  });

  await t.test('Rec 420: evaluateAlbertaLandlordEntry audits 24h notice, 8am-8pm window, and Sunday prohibition', () => {
    const res = evaluateAlbertaLandlordEntry({
      noticeHoursGiven: 12, // violation: needs 24h
      entryPurpose: 'REPAIRS_OR_MAINTENANCE',
      entryDayOfWeek: 'Sunday', // violation: Sunday entry prohibited
      entryScheduledHour: 21, // violation: outside 8am-8pm
      tenantName: '  Tenant One  ',
      landlordName: '  Landlord Two  '
    });

    assert.equal(res.assessmentDate, todayIso());
    assert.equal(res.tenantName, 'Tenant One');
    assert.throws(() => evaluateAlbertaLandlordEntry({assessmentDate: 'invalid-date'}), /valid ISO calendar date/);
    assert.equal(res.landlordName, 'Landlord Two');
    assert.equal(res.isEntryPermitted, false);
    assert.equal(res.complianceStatus, 'UNLAWFUL_ENTRY_BREACH_OF_QUIET_ENJOYMENT');
    assert.ok(res.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_NOTICE_UNDER_24_HOURS'));
    assert.ok(res.statutoryViolations.some(v => v.rule === 'ENTRY_SCHEDULED_OUTSIDE_STATUTORY_HOURS'));
    assert.ok(res.statutoryViolations.some(v => v.rule === 'ENTRY_SCHEDULED_ON_SUNDAY'));

    // Emergency entry permitted immediately
    const emRes = evaluateAlbertaLandlordEntry({ entryPurpose: 'EMERGENCY' });
    assert.equal(emRes.isEntryPermitted, true);
    assert.equal(emRes.complianceStatus, 'ENTRY_STATUTORILY_PERMITTED');
  });

  await t.test('Rec 421: evaluateAlbertaPeriodicTenancyNotice audits 1-month tenant vs 3-month landlord notice', () => {
    const res = evaluateAlbertaPeriodicTenancyNotice({
      partyGivingNotice: 'LANDLORD',
      tenancyType: 'MONTH_TO_MONTH',
      fullTenancyMonthsNoticeGiven: 2, // violation: landlord needs 3
      landlordStatedReason: 'PERSONAL_DISLIKE', // violation: not prescribed
      tenantName: '  Tenant Resident  ',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.tenantName, 'Tenant Resident');
    assert.equal(res.isValidNotice, false);
    assert.equal(res.complianceStatus, 'DEFECTIVE_STATUTORY_TERMINATION_NOTICE');
    assert.ok(res.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_LANDLORD_NOTICE_PERIOD'));
    assert.ok(res.statutoryViolations.some(v => v.rule === 'UNAUTHORIZED_LANDLORD_TERMINATION_REASON'));

    // Valid tenant 1-month notice
    const tenantRes = evaluateAlbertaPeriodicTenancyNotice({
      partyGivingNotice: 'TENANT',
      fullTenancyMonthsNoticeGiven: 1
    });
    assert.equal(tenantRes.isValidNotice, true);
    assert.equal(tenantRes.complianceStatus, 'COMPLIANT_PERIODIC_NOTICE');
  });

  await t.test('Rec 422: evaluateAlbertaTenancySubleaseAssignment audits 14-day deemed consent and fee prohibition', () => {
    const res = evaluateAlbertaTenancySubleaseAssignment({
      transactionType: 'SUBLEASE',
      requestDeliveredDate: '2026-10-01',
      currentDate: '2026-10-20', // 19 days elapsed > 14
      landlordResponseStatus: 'NO_RESPONSE',
      feeChargedForConsentCad: 200, // illegal fee
      tenantName: '  Sublessor Tenant  ',
      landlordName: '  Landlord Corp  ',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.tenantName, 'Sublessor Tenant');
    assert.equal(res.landlordName, 'Landlord Corp');
    assert.equal(res.rightsAssessment.isStatutorilyDeemedConsented, true);
    assert.equal(res.rightsAssessment.hasIllegalConsentFee, true);
    assert.equal(res.rightsAssessment.unlawfulFeeAmountCad, 200);
    assert.equal(res.legalVerdict, 'DEEMED_STATUTORY_CONSENT_ESTABLISHED');
    assert.ok(res.statutoryViolations.some(v => v.violation === 'PROHIBITED_CONSENT_FEE_SURCHARGE'));
  });

  await t.test('Rec 423: evaluateAlbertaSecurityDeposit audits 1-month cap, inspection forfeiture, and 10-day refund window', () => {
    const res = evaluateAlbertaSecurityDeposit({
      monthlyRentCad: 2000,
      securityDepositPaidCad: 2000,
      additionalNonRefundableFeesCad: 300, // overcharged by $300
      landlordConductedMoveInInspection: false, // statutory deduction forfeiture!
      daysSinceTenancyEnded: 15, // overdue past 10 days
      deductionsClaimedCad: 400,
      deductionsReason: 'normal wear and tear painting',
      tenantName: '  Alberta Tenant  ',
      landlordName: '  Landlord Corp  ',
      assessmentDate: 'invalid-date'
    });

    assert.equal(res.assessmentDate, todayIso());
    assert.equal(res.tenantName, 'Alberta Tenant');
    assert.equal(res.landlordName, 'Landlord Corp');
    assert.equal(res.depositAudit.isDepositOvercharged, true);
    assert.equal(res.depositAudit.overchargedDepositCad, 300);
    assert.equal(res.inspectionCompliance.landlordForfeitedDeductionRights, true);
    assert.equal(res.refundAssessment.isRefundOverdue, true);
    assert.equal(res.refundAssessment.illegalDeductionsCad, 400);
    // Landlord forfeited deductions, so full $2000 deposit + $300 fee is owed back ($2300)
    assert.equal(res.refundAssessment.totalRefundOwedToTenantCad, 2300);
  });

  await t.test('Rec 424: evaluateBankingAndCreditStrategy compares Big 5 packages and incorporates CDIC insurance', () => {
    const res = evaluateBankingAndCreditStrategy({
      selectedBank: 'all',
      monthlySpendingCad: 800,
      targetCreditScore: 750,
      hasPostpaidPhonePlan: true,
      clientName: '  Newcomer Student  ',
      assessmentDate: 'invalid-date'
    });

    assert.equal(res.asOf, todayIso());
    assert.equal(res.assessmentDate, todayIso());
    assert.equal(res.clientName, 'Newcomer Student');
    assert.equal(res.packagesComparison.length, 5);
    assert.ok(res.bankActStatutoryRights.statute.includes('Section 627.17'));
    assert.ok(res.statutoryAdvisories.some(a => a.includes('CDIC Deposit Insurance') && a.includes('$100,000 CAD')));
    assert.equal(res.twelveMonthRoadmap.length, 5);
    // Verify wording guard: no "100% guarantee"
    assert.ok(!res.twelveMonthRoadmap.some(m => m.actions.some(a => a.includes('100%') || a.includes('guarantee'))));
  });

  await t.test('Rec 425: evaluateFlagpolingFeasibility audits PGWP border ban, maintained status extinction, and CBP Form I-160A', () => {
    // 1. PGWP border ban test
    const pgwpRes = evaluateFlagpolingFeasibility({
      permitCategory: 'pgwp',
      applicantName: '  PGWP Candidate  ',
      assessmentDate: 'invalid-date'
    });

    assert.equal(pgwpRes.asOf, todayIso());
    assert.equal(pgwpRes.assessmentDate, todayIso());
    assert.equal(pgwpRes.applicantName, 'PGWP Candidate');
    assert.equal(pgwpRes.determination, 'STRICTLY_BARRED');
    assert.equal(pgwpRes.pgwpBorderBanApplied, true);

    // 2. Maintained status risk test
    const msRes = evaluateFlagpolingFeasibility({
      permitCategory: 'lmia_exempt_work_permit',
      currentStatusInCanada: 'maintained_status',
      countryOfCitizenship: 'US',
      isLmiaExempt: true,
      portOfEntry: 'rainbow_bridge',
      dayOfWeek: 'Wednesday'
    });
    assert.equal(msRes.maintainedStatusAtRisk, true);
    assert.equal(msRes.determination, 'HIGH_RISK_NOT_RECOMMENDED');
    assert.ok(msRes.usAdministrativeRefusalImpact.formName.includes('CBP Form I-160A'));
  });
});
