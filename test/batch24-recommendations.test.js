import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateBcChildYouthEmployment, BC_LIGHT_WORK_ACTIVITIES } from '../src/british-columbia-employment-child-youth-employment-navigator.js';
import { evaluateBcIllnessInjuryLeave, BC_SICK_LEAVE_CONSTANTS } from '../src/british-columbia-employment-illness-injury-leave-navigator.js';
import { evaluateBcOvertimeBanking, BC_OVERTIME_CONSTANTS } from '../src/british-columbia-employment-overtime-banking-navigator.js';
import { evaluateBcGroupTerminationNotice, calculateBcIndividualNoticeWeeks } from '../src/british-columbia-employment-severance-group-termination-navigator.js';
import { auditBcEmploymentUniformAndDeductions, BC_UNIFORM_DEDUCTION_CONSTANTS } from '../src/british-columbia-employment-uniform-equipment-deduction-navigator.js';
import { evaluateBcRtbDisputeTrack, BC_RTB_EXPEDITED_CONSTANTS } from '../src/british-columbia-residential-tenancy-dispute-resolution-urgency-navigator.js';
import { evaluateBcLandlordUseEviction, BC_LANDLORD_USE_CONSTANTS } from '../src/british-columbia-residential-tenancy-landlord-use-eviction-navigator.js';
import { evaluateBcSecurityDepositDoublePenalty, BC_DEPOSIT_PENALTY_CONSTANTS } from '../src/british-columbia-residential-tenancy-security-deposit-double-penalty-navigator.js';
import { evaluateBcStrataEvCharging, BC_STRATA_EV_RULES } from '../src/british-columbia-strata-ev-charging-navigator.js';
import { evaluateBcRoommateAndSharedKitchen } from '../src/british-columbia-tenancy-roommate-shared-kitchen-navigator.js';
import { auditCalgarySecondarySuite, CALGARY_SUITE_RULES } from '../src/calgary-secondary-suite-amnesty-navigator.js';
import { evaluateManitobaEmploymentLeave, MANITOBA_SERVICE_REQUIREMENTS, MANITOBA_MAX_LEAVE_WEEKS } from '../src/manitoba-employment-leave-job-protection-navigator.js';
import { evaluateManitobaGeneralHolidayPay, MANITOBA_HOLIDAY_CONSTANTS } from '../src/manitoba-employment-statutory-holiday-pay-navigator.js';
import { evaluateManitobaPnpSkilledWorker, MPNP_CONSTANTS } from '../src/manitoba-pnp-skilled-worker-navigator.js';
import { evaluateManitobaRentIncrease, MANITOBA_RENT_CONSTANTS } from '../src/manitoba-residential-tenancy-rent-increase-guideline-navigator.js';

test('Rec 426: evaluateBcChildYouthEmployment sanitizes inputs, bounds text/dates, and audits light work and hazardous restrictions under BC ESA ss. 9, 9.1', () => {
  const res = evaluateBcChildYouthEmployment({
    childName: 'Alex\u0000 River',
    employerName: 'Retail Corp\nInc.',
    assessmentDate: '2026-10-31',
    childAge: 13,
    proposedOccupationActivity: 'RETAIL_CASHIER_OR_STOCKING',
    hasParentalConsentInWriting: true,
    dailyHoursOnSchoolDay: 3,
    dailyHoursOnNonSchoolDay: 6,
    weeklyHoursDuringSchoolWeek: 15,
    hasAdultSupervisionOnSite: true
  });

  assert.equal(res.childName, 'Alex River');
  assert.equal(res.employerName, 'Retail Corp Inc.');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.jurisdiction, 'BRITISH_COLUMBIA');
  assert.equal(res.isCompliant, true);
  assert.equal(res.legalVerdict, 'STATUTORILY_AUTHORIZED_CHILD_EMPLOYMENT');
  assert.equal(res.hoursAudit.dailyHoursOnSchoolDay, 3);
  assert.equal(res.hoursAudit.maxSchoolDayHoursPermitted, 4);

  // Test child under 12 without permit
  const resUnder12 = evaluateBcChildYouthEmployment({
    childAge: 11,
    hasDirectorChildEmploymentPermit: false
  });
  assert.equal(resUnder12.isCompliant, false);
  assert.ok(resUnder12.statutoryViolations.some(v => v.violation === 'UNLAWFUL_EMPLOYMENT_CHILD_UNDER_12'));
});

test('Rec 427: evaluateBcIllnessInjuryLeave audits 90-day qualification, 5 paid sick days, average day pay, and anti-reprisal under BC ESA ss. 49.1 & 83', () => {
  const res = evaluateBcIllnessInjuryLeave({
    employeeName: 'Jordan\u0000 Lee',
    employerName: 'Tech Services\tLtd',
    assessmentDate: '2026-10-31',
    consecutiveDaysEmployed: 120,
    paidSickDaysTakenThisYear: 1,
    paidSickDaysRequested: 2,
    wagesEarnedInPast30DaysCad: 4000,
    daysWorkedInPast30Days: 20,
    employerRefusedPaidSickDays: false,
    employerDisciplinedOrDismissedForLeave: false
  });

  assert.equal(res.employeeName, 'Jordan Lee');
  assert.equal(res.employerName, 'Tech Services Ltd');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.meets90DayThreshold, true);
  assert.equal(res.leaveSummary.averageDailyWageCad, 200.0);
  assert.equal(res.leaveSummary.statutoryPaidDaysApproved, 2);
  assert.equal(res.leaveSummary.totalPaidSickPayOwedCad, 400.0);
  assert.equal(res.complianceStatus, 'COMPLIANT_STATUTORY_SICK_LEAVE');

  // Test employer refusal triggers wage violation
  const resBreach = evaluateBcIllnessInjuryLeave({
    consecutiveDaysEmployed: 100,
    paidSickDaysRequested: 1,
    wagesEarnedInPast30DaysCad: 3000,
    daysWorkedInPast30Days: 20,
    employerRefusedPaidSickDays: true
  });
  assert.equal(resBreach.complianceStatus, 'EMPLOYER_STATUTORY_VIOLATION_DETECTED');
  assert.ok(resBreach.statutoryViolations.some(v => v.rule === 'UNLAWFUL_WITHHOLDING_OF_PAID_SICK_LEAVE'));
});

test('Rec 428: evaluateBcOvertimeBanking audits daily 1.5x/2.0x, weekly 40h overtime, written time banking, and mandatory payout under BC ESA ss. 35, 40, 42', () => {
  const res = evaluateBcOvertimeBanking({
    employeeName: 'Taylor\u0000 Morgan',
    employerName: 'Logistics\nCorp',
    assessmentDate: '2026-10-31',
    regularHourlyWageCad: 30,
    dailyHoursWorkedOver8: 2,
    dailyHoursWorkedOver12: 1,
    weeklyHoursWorkedOver40: 0,
    employeeRequestedTimeBankInWriting: true,
    wantsPaidTimeOffInsteadOfPay: true,
    bankedHoursAlreadyAccumulated: 10
  });

  assert.equal(res.employeeName, 'Taylor Morgan');
  assert.equal(res.employerName, 'Logistics Corp');
  assert.equal(res.assessmentDate, '2026-10-31');
  // 2h at 1.5x = 3.0 equivalent hours, 1h at 2.0x = 2.0 equivalent hours -> 5.0 new banked hours
  assert.equal(res.overtimeCalculation.newBankedEquivalentHours, 5.0);
  assert.equal(res.overtimeCalculation.totalBankedHours, 15.0);
  assert.equal(res.overtimeCalculation.totalBankedValueCad, 450.0);

  // Test termination triggers mandatory cash payout of all banked hours
  const resTerm = evaluateBcOvertimeBanking({
    regularHourlyWageCad: 40,
    dailyHoursWorkedOver8: 0,
    bankedHoursAlreadyAccumulated: 10,
    employmentTerminated: true,
    overtimePaidActuallyCad: 0
  });
  assert.equal(resTerm.overtimeCalculation.totalCashOwedImmediatelyCad, 400.0);
  assert.equal(resTerm.overtimeCalculation.unpaidOvertimeDeficitCad, 400.0);
  assert.ok(resTerm.statutoryViolations.some(v => v.rule === 'UNLAWFUL_WITHHOLDING_OF_OVERTIME_WAGES'));
});

test('Rec 429: evaluateBcGroupTerminationNotice audits Section 64 50+ employee threshold, Section 64(4) stacking doctrine, and Section 65 exemptions under BC ESA', () => {
  const res = evaluateBcGroupTerminationNotice({
    employeeName: 'Morgan\u0000 Casey',
    employerName: 'Manufacturing\tLLC',
    assessmentDate: '2026-10-31',
    affectedEmployeesCount: 150,
    twoMonthWindow: true,
    singleLocation: true,
    groupNoticeWeeksGiven: 0,
    individualTenureMonths: 48, // 4 years -> 4 weeks individual notice
    regularWeeklyWageCad: 1000,
    ministerNotified: true
  });

  assert.equal(res.employeeName, 'Morgan Casey');
  assert.equal(res.employerName, 'Manufacturing LLC');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isSection64GroupTermination, true);
  // 100-299 employees requires 12 weeks group notice
  assert.equal(res.groupTerminationDetails.requiredNoticeWeeks, 12);
  assert.equal(res.individualNoticeDetails.statutorySection63Weeks, 4);
  // Section 64(4) stacking: 12 + 4 = 16 combined statutory notice weeks
  assert.equal(res.totalLiabilityAssessment.stackedNoticeWeeks, 16);
  assert.equal(res.totalLiabilityAssessment.totalStatutoryPayInLieuCad, 16000);

  // Section 65 just cause exemption
  const resJustCause = evaluateBcGroupTerminationNotice({ isJustCauseTermination: true });
  assert.equal(resJustCause.isExemptUnderSection65, true);
  assert.equal(resJustCause.complianceStatus, 'EXEMPT_JUST_CAUSE');
});

test('Rec 430: auditBcEmploymentUniformAndDeductions audits s. 25 free uniform rule and s. 21 cash shortage/dine-and-dash/breakage deduction bans', () => {
  const res = auditBcEmploymentUniformAndDeductions({
    employeeName: 'Casey\u0000 Blair',
    employerName: 'Restaurant\nGroup',
    assessmentDate: '2026-10-31',
    requiresSpecialClothingOrUniform: true,
    employerProvidedUniformFreeOfCharge: false,
    uniformCostOrDepositChargedCad: 75,
    deductedForTillShortage: true,
    tillShortageDeductionCad: 25,
    deductedForCustomerDineAndDash: true,
    dineAndDashDeductionCad: 60,
    deductedForEquipmentBreakage: true,
    equipmentBreakageDeductionCad: 40
  });

  assert.equal(res.employeeName, 'Casey Blair');
  assert.equal(res.employerName, 'Restaurant Group');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.totalUnlawfulDeductionsCad, 200); // 75 + 25 + 60 + 40
  assert.equal(res.complianceStatus, 'UNLAWFUL_WAGE_DEDUCTIONS_OR_UNIFORM_BREACH');
  assert.ok(res.statutoryViolations.some(v => v.rule === 'ILLEGAL_UNIFORM_CHARGE_OR_DEPOSIT'));
  assert.ok(res.statutoryViolations.some(v => v.rule === 'PROHIBITED_CASH_SHORTAGE_DEDUCTION'));
  assert.ok(res.statutoryViolations.some(v => v.rule === 'PROHIBITED_DINE_AND_DASH_DEDUCTION'));
  assert.ok(res.statutoryViolations.some(v => v.rule === 'PROHIBITED_BREAKAGE_PROPERTY_DAMAGE_DEDUCTION'));
});

test('Rec 431: evaluateBcRtbDisputeTrack audits qualifying grounds for RTB Rule 10 Expedited Hearings and 1-day evidence service', () => {
  const res = evaluateBcRtbDisputeTrack({
    tenantName: 'Sam\u0000 Tenant',
    landlordName: 'Apex\tProperties',
    rentalAddress: '100 Main St, Vancouver, BC',
    assessmentDate: '2026-10-31',
    disputeCategory: 'TENANT_UNLAWFUL_LOCKOUT_ORDER_OF_POSSESSION',
    locksChangedWithoutOrder: true,
    readyToServeEvidenceWithinOneDay: true
  });

  assert.equal(res.tenantName, 'Sam Tenant');
  assert.equal(res.landlordName, 'Apex Properties');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.qualifiesForExpeditedTrack, true);
  assert.equal(res.hearingTrack, 'EXPEDITED_HEARING_TRACK');
  assert.equal(res.estimatedWaitDays, 14);
  assert.equal(res.proceduralRoadmap.evidenceServiceDeadlineDays, 1);

  // Pure monetary claim cannot use expedited track
  const resMoney = evaluateBcRtbDisputeTrack({
    isMonetaryClaimOnly: true
  });
  assert.equal(resMoney.qualifiesForExpeditedTrack, false);
  assert.equal(resMoney.hearingTrack, 'STANDARD_DISPUTE_TRACK');
});

test('Rec 432: evaluateBcLandlordUseEviction audits Bill 14 4-month notice, 30-day dispute window, web portal requirement, and 12-month bad faith penalty', () => {
  const res = evaluateBcLandlordUseEviction({
    tenantName: 'Riley\u0000 Green',
    landlordName: 'Investor\nCo',
    assessmentDate: '2026-10-31',
    monthlyRentCad: 2500,
    noticeMonthsGiven: 4,
    daysElapsedSinceNoticeServed: 12,
    generatedThroughOfficialWebPortal: true,
    intendedOccupantRelationship: 'LANDLORD_OR_SPOUSE',
    oneMonthFreeRentProvided: true
  });

  assert.equal(res.tenantName, 'Riley Green');
  assert.equal(res.landlordName, 'Investor Co');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.complianceStatus, 'COMPLIANT_NOTICE_AND_COMPENSATION');
  assert.equal(res.isWithin30DayDisputeWindow, true);
  assert.equal(res.daysRemainingToDispute, 18);
  assert.equal(res.compensationSummary.mandatoryOneMonthFreeRentCad, 2500);

  // Bad faith eviction triggers 12 months rent penalty ($30,000)
  const resBadFaith = evaluateBcLandlordUseEviction({
    monthlyRentCad: 2500,
    landlordFailedToOccupyFor12Months: true,
    extenuatingCircumstancesExist: false
  });
  assert.equal(resBadFaith.isBadFaithPenaltyPayable, true);
  assert.equal(resBadFaith.compensationSummary.badFaith12MonthPenaltyCad, 30000);
  assert.equal(resBadFaith.complianceStatus, 'BAD_FAITH_EVICTION_12_MONTH_PENALTY_OWED');
});

test('Rec 433: evaluateBcSecurityDepositDoublePenalty audits 15-day return rule and mandatory 2x deposit penalty under BC RTA s. 38(6)', () => {
  const res = evaluateBcSecurityDepositDoublePenalty({
    tenantName: 'Devon\u0000 Scott',
    landlordName: 'Rental\tHoldings',
    rentalAddress: '550 Burrard St, Vancouver, BC',
    assessmentDate: '2026-10-31',
    securityDepositPaidCad: 1200,
    petDepositPaidCad: 600,
    tenancyHasEnded: true,
    forwardingAddressProvidedInWriting: true,
    daysSinceForwardingAddressReceived: 20,
    landlordFiledRtbClaimWithin15Days: false,
    landlordRefundedAmountCad: 0
  });

  assert.equal(res.tenantName, 'Devon Scott');
  assert.equal(res.landlordName, 'Rental Holdings');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.is15DaysExpired, true);
  assert.equal(res.isDoublePenaltyMandatory, true);
  assert.equal(res.complianceStatus, 'MANDATORY_STATUTORY_DOUBLE_PENALTY_TRIGGERED');
  // (1200 + 600) * 2 = $3,600 gross penalty award
  assert.equal(res.financialSummary.grossPenaltyOwedCad, 3600);
  assert.equal(res.financialSummary.netMonetaryAwardOwedCad, 3600);
});

test('Rec 434: evaluateBcStrataEvCharging audits 3-month statutory response window, unreasonable refusal, and electrical planning report rules under SPA ss. 90.1–90.3', () => {
  const res = evaluateBcStrataEvCharging({
    ownerName: 'Jamie\u0000 Patel',
    strataPlanNumber: 'VR-9876\t',
    requestDate: '2026-07-01',
    currentDate: '2026-10-31',
    hasStrataCouncilResponded: false,
    hasOwnerAgreedToPayAllCostsAndInsurance: true
  });

  assert.equal(res.ownerName, 'Jamie Patel');
  assert.equal(res.strataPlanNumber, 'VR-9876');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.requestDate, '2026-07-01');
  assert.equal(res.isPastThreeMonthDeadline, true);
  assert.equal(res.legalVerdict, 'STATUTORY_DEADLINE_BREACHED_CRT_ACTIONABLE');

  // Unreasonable aesthetic refusal
  const resRefusal = evaluateBcStrataEvCharging({
    hasStrataCouncilResponded: true,
    councilDecision: 'refused',
    refusalReasonCategory: 'aesthetic_dislike'
  });
  assert.equal(resRefusal.isUnreasonableRefusal, true);
  assert.equal(resRefusal.legalVerdict, 'UNREASONABLE_REFUSAL_CRT_ACTIONABLE');
});

test('Rec 435: evaluateBcRoommateAndSharedKitchen audits Section 4(c) owner exemption, co-tenancy vs occupant status, and guest fee rules under BC RTA', () => {
  // Shared kitchen with owner -> Section 4(c) exemption
  const resExempt = evaluateBcRoommateAndSharedKitchen({
    tenantName: 'Robin\u0000 Hood',
    roommateName: 'Little\tJohn',
    assessmentDate: '2026-10-31',
    sharesKitchenOrBathroomWithOwner: true
  });

  assert.equal(resExempt.tenantName, 'Robin Hood');
  assert.equal(resExempt.roommateName, 'Little John');
  assert.equal(resExempt.assessmentDate, '2026-10-31');
  assert.equal(resExempt.isRtaCovered, false);
  assert.equal(resExempt.statutoryExemption, 'BC_RTA_SECTION_4_C_SHARED_FACILITY');

  // Tenant-roommate dispute without owner sharing -> occupant status, CRT jurisdiction
  const resRoommate = evaluateBcRoommateAndSharedKitchen({
    sharesKitchenOrBathroomWithOwner: false,
    isNamedOnTenancyAgreement: false,
    disputeType: 'TENANT_ROOMMATE_DISPUTE'
  });
  assert.equal(resRoommate.isRtaCovered, true);
  assert.equal(resRoommate.statusAssessment.isCoTenant, false);
  assert.equal(resRoommate.statusAssessment.rtbJurisdictionApplies, false);
  assert.equal(resRoommate.disputeForum, 'BC Civil Resolution Tribunal (CRT) / Small Claims Court');
});

test('Rec 436: auditCalgarySecondarySuite audits Land Use Bylaws 1P2007/28P2024 and NBC-AE Part 9 life-safety standards', () => {
  const res = auditCalgarySecondarySuite({
    ownerName: 'Morgan\u0000 Reed',
    propertyAddress: '456 Bow Trail\tCalgary, AB',
    assessmentDate: '2026-10-31',
    suiteType: 'basement_suite',
    hasInterconnectedSmokeAlarms: true,
    hasCarbonMonoxideAlarm: true,
    bedroomWindowOpeningAreaSqM: 0.40,
    bedroomWindowMinDimensionMm: 420,
    windowWellClearanceMm: 800,
    ceilingHeightMetres: 2.10,
    hasDrywallFireSeparation: true,
    hasCompliantHvacSystem: true,
    hasDirectExteriorExit: true,
    isRegisteredOnCalgaryRegistry: true
  });

  assert.equal(res.ownerName, 'Morgan Reed');
  assert.equal(res.propertyAddress, '456 Bow Trail Calgary, AB');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.suiteType, 'basement_suite');
  assert.equal(res.isCodeCompliant, true);
  assert.equal(res.registryReadinessStatus, 'READY_FOR_REGISTRY_STICKER');

  // Deficient window and smoke alarms
  const resDeficient = auditCalgarySecondarySuite({
    hasInterconnectedSmokeAlarms: false,
    bedroomWindowOpeningAreaSqM: 0.25 // below 0.35 m^2
  });
  assert.equal(resDeficient.isCodeCompliant, false);
  assert.equal(resDeficient.registryReadinessStatus, 'REMEDIATION_REQUIRED');
  assert.ok(resDeficient.safetyDeficiencies.some(d => d.item === 'Interconnected Smoke Alarms'));
  assert.ok(resDeficient.safetyDeficiencies.some(d => d.item === 'Bedroom Egress Window Area'));
});

test('Rec 437: evaluateManitobaEmploymentLeave audits statutory leave durations, 5 paid days interpersonal violence, and s. 60 job protections', () => {
  const res = evaluateManitobaEmploymentLeave({
    employeeName: 'Avery\u0000 Stone',
    employerName: 'Prairie\nIndustries',
    assessmentDate: '2026-10-31',
    leaveType: 'INTERPERSONAL_VIOLENCE',
    daysOfContinuousService: 120,
    interpersonalViolenceDaysRequested: 5,
    regularHourlyWageCad: 25,
    regularWeeklyHours: 40
  });

  assert.equal(res.employeeName, 'Avery Stone');
  assert.equal(res.employerName, 'Prairie Industries');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligibleForLeave, true);
  assert.equal(res.leaveAudit.paidDaysEntitlement, 5);
  // 5 days * 8h/day * $25/h = $1,000 paid leave compensation
  assert.equal(res.leaveAudit.statutoryPaidLeaveCompensationCad, 1000);
  assert.equal(res.complianceStatus, 'STATUTORILY_COMPLIANT');

  // Employer reprisal violation
  const resReprisal = evaluateManitobaEmploymentLeave({
    leaveType: 'MATERNITY',
    monthsOfContinuousService: 9,
    employerDismissedOrDisciplinedEmployee: true
  });
  assert.equal(resReprisal.complianceStatus, 'STATUTORY_DEFICIENCY_DETECTED');
  assert.ok(resReprisal.statutoryViolations.some(v => v.violation === 'STATUTORY_REPRISAL_AND_UNLAWFUL_TERMINATION'));
});

test('Rec 438: evaluateManitobaGeneralHolidayPay audits 9 general holidays, 5% four-week lookback formula, and 1.5x holiday premium under MB ESC ss. 21–28', () => {
  const res = evaluateManitobaGeneralHolidayPay({
    employeeName: 'Ellis\u0000 Bell',
    assessmentDate: '2026-10-31',
    holidayName: 'LOUIS_RIEL_DAY',
    grossWagesInPast4WeeksCad: 4000,
    workedOnHoliday: true,
    hoursWorkedOnHoliday: 8,
    regularHourlyWageCad: 25,
    holidayPayActuallyPaidCad: 0
  });

  assert.equal(res.employeeName, 'Ellis Bell');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.holidayName, 'LOUIS_RIEL_DAY');
  // 5% of $4,000 = $200 holiday pay
  assert.equal(res.holidayPayDetails.statutoryGeneralHolidayPayCad, 200);
  // 8h * $25/h * 1.5x = $300 premium hours pay
  assert.equal(res.holidayPayDetails.premiumHoursPayCad, 300);
  // Total entitlement = $500
  assert.equal(res.holidayPayDetails.totalStatutoryEntitlementCad, 500);
  assert.equal(res.holidayPayDetails.wageDeficitCad, 500);
  assert.equal(res.complianceStatus, 'MANITOBA_HOLIDAY_WAGE_STANDARDS_BREACH');
});

test('Rec 439: evaluateManitobaPnpSkilledWorker computes 1,000-point EOI score, out-of-province grad rules, and regional bonuses under MPNP criteria', () => {
  const res = evaluateManitobaPnpSkilledWorker({
    candidateName: 'Priya\u0000 Sharma',
    assessmentDate: '2026-10-31',
    monthsWorkedInManitoba: 8,
    isOutOfProvinceGraduate: false,
    hasPermanentManitobaJobOffer: true,
    firstLanguageClb: 8, // 125 pts
    candidateAge: 28, // 75 pts
    totalYearsOfWorkExperience: 4, // 75 pts + 100 bonus pts for MB work >= 6 mo = 175 pts
    highestEducationLevel: 'masters_phd', // 125 pts
    isJobLocatedOutsideWinnipeg: true // 500 adaptability + 50 regional = 550 pts
  });

  assert.equal(res.candidateName, 'Priya Sharma');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isStreamEligible, true);
  assert.equal(res.streamVerdict, 'QUALIFIES_FOR_SKILLED_WORKER_IN_MANITOBA');
  // 125 + 75 + 175 + 125 + 550 = 1050 pts
  assert.equal(res.eoiScoreSummary.totalEoiPoints, 1050);

  // Out of province graduate with only 8 months experience (requires 12 months)
  const resOop = evaluateManitobaPnpSkilledWorker({
    monthsWorkedInManitoba: 8,
    isOutOfProvinceGraduate: true
  });
  assert.equal(resOop.isStreamEligible, false);
  assert.equal(resOop.streamVerdict, 'INELIGIBLE_UNDER_CURRENT_RULES');
});

test('Rec 440: evaluateManitobaRentIncrease audits annual 3.0% guideline, 3-month Form 2 notice, $1,615+ high rent exemption, and AGI under MB RTA', () => {
  const res = evaluateManitobaRentIncrease({
    tenantName: 'Chris\u0000 Evans',
    landlordName: 'Manitoba\nProperties',
    assessmentDate: '2026-10-31',
    currentMonthlyRentCad: 1000,
    proposedMonthlyRentCad: 1030, // exactly 3.0%
    noticeMonthsGiven: 3,
    monthsSinceLastRentIncrease: 12,
    usedPrescribedForm2: true
  });

  assert.equal(res.tenantName, 'Chris Evans');
  assert.equal(res.landlordName, 'Manitoba Properties');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.percentageIncrease, 3.0);
  assert.equal(res.complianceStatus, 'COMPLIANT_RENT_INCREASE');

  // Above guideline increase (7.0%) without approved AGI
  const resIllegal = evaluateManitobaRentIncrease({
    currentMonthlyRentCad: 1000,
    proposedMonthlyRentCad: 1070,
    hasApprovedAgiOrderFromRtb: false
  });
  assert.equal(resIllegal.complianceStatus, 'UNLAWFUL_RENT_INCREASE');
  assert.ok(resIllegal.statutoryViolations.some(v => v.rule === 'UNAUTHORIZED_ABOVE_GUIDELINE_INCREASE'));

  // High rent exemption ($1,615+)
  const resHighRent = evaluateManitobaRentIncrease({
    currentMonthlyRentCad: 1800,
    proposedMonthlyRentCad: 1900
  });
  assert.equal(resHighRent.isHighRentExempt, true);
  assert.equal(resHighRent.isExemptFromGuideline, true);
});
