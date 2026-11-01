import test from 'node:test';
import assert from 'node:assert/strict';

import {
  auditAlbertaCommercialDistress,
  ALBERTA_DISTRESS_RULES
} from '../src/alberta-commercial-tenant-distress-navigator.js';

import {
  evaluateAlbertaConstructiveDismissal,
  ALBERTA_CONSTRUCTIVE_DISMISSAL_CONSTANTS
} from '../src/alberta-employment-constructive-dismissal-salary-reduction-navigator.js';

import {
  evaluateAlbertaGeneralHolidayPay,
  ALBERTA_HOLIDAY_CONSTANTS
} from '../src/alberta-employment-general-holiday-pay-navigator.js';

import {
  evaluateAlbertaMaternityParentalLeave,
  ALBERTA_MATERNITY_PARENTAL_CONSTANTS
} from '../src/alberta-employment-maternity-parental-leave-navigator.js';

import {
  auditAlbertaEmploymentRestPeriods,
  ALBERTA_REST_PERIOD_CONSTANTS
} from '../src/alberta-employment-rest-periods-shift-limits-navigator.js';

import {
  evaluateAlbertaYouthEmploymentRules,
  ALBERTA_YOUTH_CONSTANTS
} from '../src/alberta-employment-youth-employment-rules-navigator.js';

import {
  evaluateAlbertaOpportunityStream,
  AAIP_AOS_CONSTANTS
} from '../src/alberta-opportunity-stream-navigator.js';

import {
  evaluateAlbertaLandlordEntry,
  ALBERTA_ENTRY_NOTICE_CONSTANTS
} from '../src/alberta-residential-tenancy-landlord-entry-notice-navigator.js';

import {
  evaluateAlbertaTenancySubleaseAssignment,
  ALBERTA_LANDLORD_RESPONSE_WINDOW_DAYS
} from '../src/alberta-residential-tenancy-sublease-assignment-navigator.js';

import {
  evaluateBcChildYouthEmployment,
  BC_LIGHT_WORK_ACTIVITIES,
  BC_HAZARDOUS_WORK_ACTIVITIES
} from '../src/british-columbia-employment-child-youth-employment-navigator.js';

import {
  evaluateBcIllnessInjuryLeave,
  BC_SICK_LEAVE_CONSTANTS
} from '../src/british-columbia-employment-illness-injury-leave-navigator.js';

import {
  evaluateBcOvertimeBanking,
  BC_OVERTIME_CONSTANTS
} from '../src/british-columbia-employment-overtime-banking-navigator.js';

import {
  evaluateBcRtbDisputeTrack,
  BC_RTB_EXPEDITED_CONSTANTS
} from '../src/british-columbia-residential-tenancy-dispute-resolution-urgency-navigator.js';

import {
  evaluateBcLandlordUseEviction,
  BC_LANDLORD_USE_CONSTANTS
} from '../src/british-columbia-residential-tenancy-landlord-use-eviction-navigator.js';

import {
  evaluateBcRoommateAndSharedKitchen
} from '../src/british-columbia-tenancy-roommate-shared-kitchen-navigator.js';

// Recommendation 246
test('Rec 246: Alberta Commercial Distress — Bounded names, arrears and value bounds', () => {
  const r = auditAlbertaCommercialDistress({
    tenantBusinessName: 'A'.repeat(300),
    rentArrearsClaimedCad: '25000',
    goodsEstimatedValueCad: '75000',
    daysElapsedSinceSeizure: '6',
    isSeizureExecutedByLicensedAgency: true
  });
  assert.equal(r.tenantBusinessName.length, 120);
  assert.equal(r.rentArrearsClaimedCad, 25000);
  assert.equal(r.goodsEstimatedValueCad, 75000);
  assert.equal(r.daysElapsedSinceSeizure, 6);
  assert.equal(r.legalVerdict, 'LAWFUL_PENDING_DISTRESS');
});

// Recommendation 247
test('Rec 247: Alberta Constructive Dismissal — Salary reduction numeric bounds and condonation audit', () => {
  const r = evaluateAlbertaConstructiveDismissal({
    previousAnnualSalaryCad: '100000',
    newAnnualSalaryCad: '75000',
    yearsOfContinuousService: '5',
    daysSinceReductionImposed: '75'
  });
  assert.equal(r.previousAnnualSalaryCad, 100000);
  assert.equal(r.newAnnualSalaryCad, 75000);
  assert.equal(r.percentageReduction, 25);
  assert.equal(r.isConstructiveDismissal, true);
  assert.equal(r.complianceStatus, 'CONSTRUCTIVE_DISMISSAL_CONFIRMED');
  assert.ok(r.riskWarnings.some(w => w.warningType === 'HIGH_RISK_OF_LEGAL_CONDONATION'));
});

// Recommendation 248
test('Rec 248: Alberta General Holiday Pay — Lookback, premium pay, and bounded inputs', () => {
  const r = evaluateAlbertaGeneralHolidayPay({
    holidayName: 'ALBERTA_FAMILY_DAY\u0000',
    workDaysInPast12Months: '45',
    regularHourlyWageCad: '30',
    wagesEarnedInPast4WeeksCad: '4800',
    isRegularDayOfWork: true,
    workedOnHoliday: true,
    hoursWorkedOnHoliday: '8',
    holidayPayActuallyPaidCad: '0'
  });
  assert.equal(r.holidayName, 'ALBERTA_FAMILY_DAY');
  assert.equal(r.meets30DayThreshold, true);
  assert.equal(r.calculationDetails.averageDailyWageCad, 240); // 5% of 4800
  // 1.5x of 8 * 30 = 360 + 240 = 600
  assert.equal(r.calculationDetails.statutoryHolidayPayOwedCad, 600);
  assert.equal(r.calculationDetails.wageDeficitCad, 600);
  assert.equal(r.complianceStatus, 'UNLAWFUL_HOLIDAY_PAY_UNDERPAYMENT');
});

// Recommendation 249
test('Rec 249: Alberta Maternity & Parental Leave — Service bounds, duration caps, and protected status', () => {
  const r = evaluateAlbertaMaternityParentalLeave({
    consecutiveDaysOfEmployment: '120',
    maternityWeeksRequested: '16',
    parentalWeeksRequested: '62',
    noticeWeeksProvidedBeforeLeave: '6',
    noticeWeeksProvidedBeforeReturn: '4',
    leaveType: 'COMBINED_MATERNITY_PARENTAL\u0007'
  });
  assert.equal(r.meets90DayThreshold, true);
  assert.equal(r.totalWeeksRequested, 78);
  assert.equal(r.complianceStatus, 'COMPLIANT_LEAVE_AND_JOB_PROTECTION');
  assert.equal(r.leaveType, 'COMBINED_MATERNITY_PARENTAL');
  assert.ok(r.legalVerdict.includes('statutorily protected'));
});

// Recommendation 250
test('Rec 250: Alberta Rest Periods & Shift Limits — Intra-shift, inter-shift, and 24-day cap', () => {
  const r = auditAlbertaEmploymentRestPeriods({
    shiftDurationHours: '10',
    restBreakMinutesProvided: '15', // deficit: requires 30m
    hoursBetweenConsecutiveShifts: '6', // deficit: requires 8h
    consecutiveWorkDaysWorked: '25' // deficit: max 24 days
  });
  assert.equal(r.complianceStatus, 'NON_COMPLIANT_REST_STANDARDS_BREACHED');
  assert.ok(r.statutoryViolations.some(v => v.rule === 'FAILURE_TO_PROVIDE_30_MINUTE_REST_PERIOD'));
  assert.ok(r.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_REST_BETWEEN_SHIFTS'));
  assert.ok(r.statutoryViolations.some(v => v.rule === 'EXCEEDED_24_CONSECUTIVE_WORK_DAYS'));
});

// Recommendation 251
test('Rec 251: Alberta Youth Employment — Age clamping, school day shift hours, and parental consent', () => {
  const r = evaluateAlbertaYouthEmploymentRules({
    employeeAge: '14',
    jobCategory: 'RETAIL_CLERK',
    hasWrittenParentalConsent: false,
    isSchoolDay: true,
    scheduledShiftHours: '4', // max 2 hours on school day
    shiftStartHour: '17',
    shiftEndHour: '21'
  });
  assert.equal(r.isCompliant, false);
  assert.ok(r.statutoryViolations.some(v => v.rule === 'MISSING_WRITTEN_PARENTAL_CONSENT'));
  assert.ok(r.statutoryViolations.some(v => v.rule === 'EXCEEDED_MAXIMUM_ADOLESCENT_SHIFT_HOURS'));
});

// Recommendation 252
test('Rec 252: Alberta Opportunity Stream — String numeric coercion fix and bounded candidate name', () => {
  const r = evaluateAlbertaOpportunityStream({
    workPermitType: 'lmia_based',
    albertaWorkExperienceMonths: '14', // string input must not revert to fallback
    nonAlbertaWorkExperienceMonths: '0',
    teerCategory: '2',
    nocCode: '21231\u0000',
    languageClbLevel: '6',
    candidateName: 'John Doe\u0000'
  });
  assert.equal(r.candidateName, 'John Doe');
  assert.equal(r.workExperienceAudit.albertaMonths, 14);
  assert.equal(r.languageAudit.candidateClb, 6);
  assert.equal(r.isAosEligible, true);
  assert.equal(r.overallVerdict, 'ELIGIBLE_FOR_AAIP_NOMINATION');
});

// Recommendation 253
test('Rec 253: Alberta Landlord Entry — Midnight entry (hour 0) falsy bug fix and notice hours bounds', () => {
  // Midnight (0:00) landlord entry is outside permitted 8am-8pm window
  const r = evaluateAlbertaLandlordEntry({
    noticeHoursGiven: '24',
    entryScheduledHour: 0, // must not coerce to 12 (noon)
    entryDayOfWeek: 'Wednesday',
    entryPurpose: 'INSPECTION'
  });
  assert.equal(r.entryScheduledHour, 0);
  assert.equal(r.isEntryPermitted, false);
  assert.ok(r.statutoryViolations.some(v => v.rule === 'ENTRY_SCHEDULED_OUTSIDE_STATUTORY_HOURS'));
});

// Recommendation 254
test('Rec 254: Alberta Sublease & Assignment — Template string fee refund fix and date parse resiliency', () => {
  const r = evaluateAlbertaTenancySubleaseAssignment({
    transactionType: 'ASSIGNMENT',
    requestDeliveredDate: '2026-10-01',
    currentDate: '2026-10-20', // 19 days elapsed -> deemed consent
    landlordResponseStatus: 'NO_RESPONSE',
    feeChargedForConsentCad: '250'
  });
  assert.equal(r.rightsAssessment.isStatutorilyDeemedConsented, true);
  assert.equal(r.rightsAssessment.unlawfulFeeAmountCad, 250);
  // Verify template string interpolation: must contain "$250 CAD", not literal "$${fee}"
  assert.ok(r.actionableRemedies.some(a => a.includes('$250 CAD')));
  assert.ok(!r.actionableRemedies.some(a => a.includes('$${fee}')));

  // Date resiliency with malformed dates
  const r2 = evaluateAlbertaTenancySubleaseAssignment({
    requestDeliveredDate: 'invalid-date',
    currentDate: 'not-a-date'
  });
  assert.equal(r2.rightsAssessment.daysElapsedSinceRequest, 0);
  assert.equal(Number.isFinite(r2.rightsAssessment.daysElapsedSinceRequest), true);
});

// Recommendation 255
test('Rec 255: BC Child & Youth Employment — Age clamping, hazardous restrictions, and school hours', () => {
  const r = evaluateBcChildYouthEmployment({
    childAge: '13',
    proposedOccupationActivity: 'RETAIL_CASHIER_OR_STOCKING\u0000',
    hasParentalConsentInWriting: true,
    dailyHoursOnSchoolDay: '5', // max 4h permitted
    dailyHoursOnNonSchoolDay: '6',
    weeklyHoursDuringSchoolWeek: '15',
    hasAdultSupervisionOnSite: true
  });
  assert.equal(r.proposedActivity, 'RETAIL_CASHIER_OR_STOCKING');
  assert.equal(r.childAge, 13);
  assert.equal(r.isCompliant, false);
  assert.ok(r.statutoryViolations.some(v => v.violation === 'EXCEEDED_SCHOOL_DAY_MAX_HOURS'));
});

// Recommendation 256
test('Rec 256: BC Illness or Injury Leave — 5-day paid quota, average daily wage, and anti-reprisal', () => {
  const r = evaluateBcIllnessInjuryLeave({
    consecutiveDaysEmployed: '100', // >= 90 days qualifies
    paidSickDaysTakenThisYear: '2',
    paidSickDaysRequested: '3', // fits within 5-day cap (2 + 3 = 5)
    wagesEarnedInPast30DaysCad: '4000',
    daysWorkedInPast30Days: '20',
    employerRefusedPaidSickDays: true
  });
  assert.equal(r.meets90DayThreshold, true);
  assert.equal(r.leaveSummary.averageDailyWageCad, 200); // 4000 / 20
  assert.equal(r.leaveSummary.totalPaidSickPayOwedCad, 600); // 200 * 3
  assert.equal(r.complianceStatus, 'EMPLOYER_STATUTORY_VIOLATION_DETECTED');
  assert.ok(r.statutoryViolations.some(v => v.rule === 'UNLAWFUL_WITHHOLDING_OF_PAID_SICK_LEAVE'));
});

// Recommendation 257
test('Rec 257: BC Overtime Banking — Daily 1.5x/2.0x rates, mandatory payout on termination, and neutral wording', () => {
  const r = evaluateBcOvertimeBanking({
    regularHourlyWageCad: '40',
    dailyHoursWorkedOver8: '2', // 2h at 1.5x = 3 banked hours or $120
    dailyHoursWorkedOver12: '1', // 1h at 2.0x = 2 banked hours or $80
    bankedHoursAlreadyAccumulated: '10',
    employmentTerminated: true,
    overtimePaidActuallyCad: '0'
  });
  assert.equal(r.regularHourlyWageCad, 40);
  assert.equal(r.overtimeCalculation.newOvertimeEarnedCad, 200);
  // Total banked value: 10 existing * 40 = 400 + 200 new = 600 total cash owed immediately
  assert.equal(r.overtimeCalculation.totalCashOwedImmediatelyCad, 600);
  assert.equal(r.overtimeCalculation.unpaidOvertimeDeficitCad, 600);
  assert.equal(r.complianceStatus, 'OVERTIME_WAGE_STANDARDS_BREACH');
  assert.ok(r.legalVerdict.includes('comply with the BC Employment Standards Act') || r.legalVerdict.includes('Employer breached'));
});

// Recommendation 258
test('Rec 258: BC RTB Dispute Urgency — Expedited track qualification, 1-day evidence service, and bounded inputs', () => {
  const r = evaluateBcRtbDisputeTrack({
    disputeCategory: 'TENANT_UNLAWFUL_LOCKOUT_ORDER_OF_POSSESSION\u0000',
    locksChangedWithoutOrder: true,
    readyToServeEvidenceWithinOneDay: true,
    landlordName: 'Evil Landlord\u0000',
    rentalAddress: '123 Main St\u0000'
  });
  assert.equal(r.qualifiesForExpeditedTrack, true);
  assert.equal(r.hearingTrack, 'EXPEDITED_HEARING_TRACK');
  assert.equal(r.estimatedWaitDays, 14);
  assert.equal(r.landlordName, 'Evil Landlord');
  assert.equal(r.rentalAddress, '123 Main St');
});

// Recommendation 259
test('Rec 259: BC Landlord Use Eviction — Bill 14 4-month notice, 30-day dispute window, and 12-month bad-faith penalty', () => {
  const r = evaluateBcLandlordUseEviction({
    monthlyRentCad: '2500',
    noticeMonthsGiven: '2', // Bill 14 requires 4 months
    daysElapsedSinceNoticeServed: '15',
    intendedOccupantRelationship: 'SIBLING_OR_OTHER', // illegal: must be close family member
    landlordFailedToOccupyFor12Months: true,
    extenuatingCircumstancesExist: false
  });
  assert.equal(r.monthlyRentCad, 2500);
  assert.equal(r.isBadFaithPenaltyPayable, true);
  assert.equal(r.compensationSummary.badFaith12MonthPenaltyCad, 30000); // 12 * 2500
  assert.equal(r.complianceStatus, 'BAD_FAITH_EVICTION_12_MONTH_PENALTY_OWED');
  assert.ok(r.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_NOTICE_PERIOD_UNDER_4_MONTHS'));
  assert.ok(r.statutoryViolations.some(v => v.rule === 'INELIGIBLE_OCCUPANT_NOT_CLOSE_FAMILY_MEMBER'));
});

// Recommendation 260
test('Rec 260: BC Roommate & Shared Kitchen — Section 4(c) owner exemption, co-tenancy vs occupant, and guest fee audit', () => {
  // Scenario 1: Shared kitchen with owner -> exempt from BC RTA
  const rExempt = evaluateBcRoommateAndSharedKitchen({
    sharesKitchenOrBathroomWithOwner: true
  });
  assert.equal(rExempt.isRtaCovered, false);
  assert.equal(rExempt.legalStatusVerdict, 'EXEMPT_FROM_BC_RTA_UNDER_SECTION_4_C');
  assert.equal(rExempt.statutoryExemption, 'BC_RTA_SECTION_4_C_SHARED_FACILITY');

  // Scenario 2: Unlawful guest fee surcharge
  const rGuest = evaluateBcRoommateAndSharedKitchen({
    sharesKitchenOrBathroomWithOwner: false,
    isNamedOnTenancyAgreement: true,
    disputeType: 'LANDLORD_RESTRICTING_GUEST',
    landlordChargesGuestOrOccupantFee: true,
    monthlyGuestFeeCad: '150',
    tenancyAgreementLimitsOccupants: false
  });
  assert.equal(rGuest.isRtaCovered, true);
  assert.equal(rGuest.legalVerdict, 'TENANT_PROTECTED_UNDER_SECTION_28');
  assert.ok(rGuest.statutoryFindings.some(f => f.finding === 'UNLAWFUL_GUEST_FEE_SURCHARGE'));
});
