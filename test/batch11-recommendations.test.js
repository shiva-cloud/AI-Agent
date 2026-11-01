import test from 'node:test';
import assert from 'node:assert/strict';

import {
  evaluateOntarioIllegalEntryT2,
  ONTARIO_T2_ENTRY_CONSTANTS
} from '../src/ontario-residential-tenancy-illegal-entry-t2-navigator.js';

import {
  evaluateOntarioRentDepositInterest,
  ONTARIO_RENT_DEPOSIT_CONSTANTS
} from '../src/ontario-residential-tenancy-rent-deposit-interest-navigator.js';

import {
  evaluateOntarioRoommateAndOccupantRights
} from '../src/ontario-residential-tenancy-roommate-subtenant-eviction-navigator.js';

import {
  evaluateOntarioTenancyAssignmentSublet,
  RTA_STATUTORY_TIMELINES
} from '../src/ontario-residential-tenancy-sublet-assignment-refusal-navigator.js';

import {
  evaluateEsaConstructiveDismissalLayoff
} from '../src/ontario-employment-constructive-dismissal-layoff-navigator.js';

import {
  auditOntarioPayTransparencyAndPosting
} from '../src/ontario-employment-pay-equity-transparency-navigator.js';

import {
  evaluateSaskatchewanLayoffNotice,
  SASKATCHEWAN_LAYOFF_CONSTANTS
} from '../src/saskatchewan-employment-layoff-notice-severance-navigator.js';

import {
  auditBcEmploymentUniformAndDeductions
} from '../src/british-columbia-employment-uniform-equipment-deduction-navigator.js';

import {
  calculateBcIndividualNoticeWeeks,
  evaluateBcGroupTerminationNotice
} from '../src/british-columbia-employment-severance-group-termination-navigator.js';

import {
  evaluateBcSecurityDepositDoublePenalty,
  BC_DEPOSIT_PENALTY_CONSTANTS
} from '../src/british-columbia-residential-tenancy-security-deposit-double-penalty-navigator.js';

import {
  auditAlbertaTerminationJustCause
} from '../src/alberta-employment-termination-just-cause-audit-navigator.js';

import {
  evaluateAlbertaAbandonedGoods,
  ALBERTA_ABANDONED_GOODS_CONSTANTS
} from '../src/alberta-residential-tenancy-abandoned-goods-distress-navigator.js';

import {
  auditCalgarySecondarySuite,
  CALGARY_SUITE_RULES
} from '../src/calgary-secondary-suite-amnesty-navigator.js';

import {
  evaluateBcStrataEvCharging,
  BC_STRATA_EV_RULES
} from '../src/british-columbia-strata-ev-charging-navigator.js';

test('Rec 231: Ontario Illegal Landlord Entry T2 — Preserves midnight entry hour and calculates abatement', () => {
  // Test midnight entry (hour 0) - should NOT default to noon 12:00
  const midnightResult = evaluateOntarioIllegalEntryT2({
    writtenNoticeGiven: true,
    noticeHoursGiven: 24,
    entryScheduledHour: 0,
    monthlyRentCad: 2000
  });
  assert.equal(midnightResult.entryScheduledHour, 0);
  assert.equal(midnightResult.isUnlawfulEntry, true);
  assert.ok(midnightResult.statutoryViolations.some(v => v.rule === 'ENTRY_OUTSIDE_STATUTORY_HOURS'));
  assert.equal(midnightResult.remedySummary.estimatedAbatementCad, 300); // 15% of $2000

  // Test emergency entry exemption
  const emergencyResult = evaluateOntarioIllegalEntryT2({
    writtenNoticeGiven: false,
    noticeHoursGiven: 0,
    entryScheduledHour: 2,
    isEmergencyEntry: true
  });
  assert.equal(emergencyResult.isUnlawfulEntry, false);
  assert.equal(emergencyResult.complianceStatus, 'COMPLIANT_LANDLORD_ENTRY');
});

test('Rec 232: Ontario Rent Deposit Interest — Respects statutory 0.0% rate and calculates remedies', () => {
  // Test 0.0% guideline interest rate (Ontario 2021 rent freeze) - must not default to 2.5%
  const freezeResult = evaluateOntarioRentDepositInterest({
    initialDepositAmountCad: 2400,
    tenancyDurationYears: 1,
    guidelineInterestRatePercent: 0.0,
    landlordPaidAnnualInterest: false,
    depositAppliedToLastMonthRentIncrease: false
  });
  assert.equal(freezeResult.guidelineInterestRatePercent, 0.0);
  assert.equal(freezeResult.interestAudit.totalInterestAccruedCad, 0);

  // Test unpaid interest over 2 years at 2.5%
  const normalResult = evaluateOntarioRentDepositInterest({
    initialDepositAmountCad: 2000,
    currentMonthlyRentCad: 2100,
    tenancyDurationYears: 2,
    guidelineInterestRatePercent: 2.5,
    landlordPaidAnnualInterest: false,
    depositAppliedToLastMonthRentIncrease: false,
    extraDepositPaidCad: 500
  });
  assert.equal(normalResult.interestAudit.annualInterestCad, 50);
  assert.equal(normalResult.interestAudit.totalInterestAccruedCad, 100);
  assert.equal(normalResult.interestAudit.totalAmountOwedToTenantCad, 600); // 100 interest + 500 illegal deposit
  assert.ok(normalResult.statutoryViolations.some(v => v.rule === 'PROHIBITED_SECURITY_OR_DAMAGE_DEPOSIT'));
  assert.ok(normalResult.statutoryViolations.some(v => v.rule === 'UNPAID_ANNUAL_RENT_DEPOSIT_INTEREST'));
});

test('Rec 233: Ontario Roommate & Occupant Rights — Evaluates s. 5(i) exemption, void guest clauses & 60-day deeming', () => {
  // Section 5(i) shared kitchen/bathroom with owner
  const exempt = evaluateOntarioRoommateAndOccupantRights({
    sharesKitchenOrBathWithOwnerOrFamily: true
  });
  assert.equal(exempt.isRtaCovered, false);
  assert.equal(exempt.statutoryExemption, 'RTA_SECTION_5_I_SHARED_FACILITY');

  // Void guest clause & illegal guest fee
  const guestFeeResult = evaluateOntarioRoommateAndOccupantRights({
    leaseContainsNoGuestOrRoommateClause: true,
    landlordChargesGuestOrRoommateFee: true,
    guestFeeAmountMonthlyCad: 150
  });
  assert.equal(guestFeeResult.isRtaCovered, true);
  assert.ok(guestFeeResult.statutoryFindings.some(f => f.finding === 'RESTRICTIVE_GUEST_CLAUSE_VOID'));
  assert.ok(guestFeeResult.statutoryFindings.some(f => f.finding === 'ILLEGAL_GUEST_FEE_SURCHARGE'));

  // 60-day unauthorized occupant deeming rule (s. 100)
  const deemed = evaluateOntarioRoommateAndOccupantRights({
    tenantHasVacatedPermanently: true,
    isNamedOnTenancyAgreement: false,
    daysSinceLandlordDiscoveredOccupancy: 75
  });
  assert.equal(deemed.legalVerdict, 'DEEMED_STATUTORY_TENANT_UNDER_SECTION_100');
  assert.ok(deemed.statutoryFindings.some(f => f.finding === 'DEEMED_ASSIGNMENT_UNDER_SECTION_100'));
});

test('Rec 234: Ontario Tenancy Assignment & Sublet — 7-day rule, N9 30-day election & fee recovery', () => {
  // 7-day failure to respond to general assignment gives 30-day Form N9 termination right
  const generalRefusal = evaluateOntarioTenancyAssignmentSublet({
    requestType: 'ASSIGNMENT',
    isGeneralRequest: true,
    daysSinceRequestMade: 10,
    landlordResponse: 'NO_RESPONSE',
    outOfPocketFeeChargedCad: 350,
    actualDirectExpenseIncurredCad: 50
  });
  assert.equal(generalRefusal.rightsAssessment.is7DayDeadlineBreached, true);
  assert.equal(generalRefusal.rightsAssessment.canTenantGive30DayN9, true);
  assert.equal(generalRefusal.rightsAssessment.hasIllegalAdministrativeCharge, true);
  assert.equal(generalRefusal.rightsAssessment.illegalChargeAmountCad, 300);
  assert.equal(generalRefusal.legalVerdict, 'ELIGIBLE_FOR_IMMEDIATE_30_DAY_N9_TERMINATION');
});

test('Rec 235: Ontario Constructive Dismissal & Layoff — Unilateral wage cut and common law unauthorized layoff', () => {
  // Layoff without contractual term -> common law constructive dismissal (Elsegood)
  const layoff = evaluateEsaConstructiveDismissalLayoff({
    yearsOfService: 4,
    employeeAge: 42,
    annualSalaryCad: 80000,
    weeksOnLayoff: 6,
    hasContractualLayoffClause: false,
    salaryReductionPct: 0
  });
  assert.equal(layoff.isCommonLawConstructiveDismissal, true);
  assert.ok(layoff.constructiveDismissalGrounds.includes('UNAUTHORIZED_COMMON_LAW_LAYOFF'));
  assert.equal(layoff.esaStatutoryEntitlements.noticeWeeks, 4);

  // 25% salary cut -> constructive dismissal (Potter)
  const wageCut = evaluateEsaConstructiveDismissalLayoff({
    yearsOfService: 5,
    employeeAge: 40,
    annualSalaryCad: 60000,
    weeksOnLayoff: 0,
    salaryReductionPct: 25
  });
  assert.equal(wageCut.isCommonLawConstructiveDismissal, true);
  assert.ok(wageCut.constructiveDismissalGrounds.includes('SUBSTANTIAL_WAGE_REDUCTION'));
});

test('Rec 236: Ontario Pay Equity & Transparency — Mandatory salary ranges, AI disclosure & Canadian experience ban', () => {
  // Posting missing salary range and omitting AI disclosure
  const nonCompliant = auditOntarioPayTransparencyAndPosting({
    isPubliclyAdvertisedJobPosting: true,
    includesExpectedCompensationOrRange: false,
    salaryRangeMinCad: 0,
    salaryRangeMaxCad: 0,
    usesAiToScreenApplicants: true,
    disclosesAiUsageInPosting: false,
    requiresCanadianWorkExperience: true
  });
  assert.equal(nonCompliant.legalVerdict, 'NON_COMPLIANT_STATUTORY_BREACH');
  assert.ok(nonCompliant.statutoryViolations.includes('MISSING_COMPENSATION_RANGE'));
  assert.ok(nonCompliant.statutoryViolations.includes('UNDISCLOSED_AI_CANDIDATE_SCREENING'));
  assert.ok(nonCompliant.statutoryViolations.includes('PROHIBITED_CANADIAN_EXPERIENCE_REQUIREMENT'));

  // Inverted salary range normalization
  const inverted = auditOntarioPayTransparencyAndPosting({
    isPubliclyAdvertisedJobPosting: true,
    includesExpectedCompensationOrRange: true,
    salaryRangeMinCad: 90000,
    salaryRangeMaxCad: 70000,
    usesAiToScreenApplicants: false,
    requiresCanadianWorkExperience: false
  });
  assert.equal(inverted.salaryRange.minCad, 70000);
  assert.equal(inverted.salaryRange.maxCad, 90000);
  assert.equal(inverted.salaryRange.spreadPct, 29);
});

test('Rec 237: Saskatchewan Employment Layoff Notice — Individual scale and group termination threshold', () => {
  // Individual tenure 4 years = 4 weeks notice under s. 2-60(1)
  const individual = evaluateSaskatchewanLayoffNotice({
    yearsOfContinuousService: 4,
    regularWeeklyWageCad: 1000,
    employeesTerminatedIn4WeekWindow: 1,
    actualNoticeWeeksGiven: 1
  });
  assert.equal(individual.noticeCalculation.statutoryNoticeWeeksEntitled, 4);
  assert.equal(individual.noticeCalculation.noticeShortfallWeeks, 3);
  assert.equal(individual.noticeCalculation.statutoryPayInLieuEntitledCad, 3000);

  // Group termination of 60 employees = 8 weeks group notice under s. 2-62
  const group = evaluateSaskatchewanLayoffNotice({
    yearsOfContinuousService: 2, // Individual would only get 2 weeks
    regularWeeklyWageCad: 1200,
    employeesTerminatedIn4WeekWindow: 60,
    ministerNotifiedInWriting: false,
    actualNoticeWeeksGiven: 0
  });
  assert.equal(group.isGroupTerminationApplicable, true);
  assert.equal(group.noticeCalculation.statutoryNoticeWeeksEntitled, 8); // Greater of individual (2) vs group (8)
  assert.equal(group.noticeCalculation.statutoryPayInLieuEntitledCad, 9600);
  assert.ok(group.statutoryViolations.some(v => v.rule === 'FAILURE_TO_NOTIFY_MINISTER_OF_GROUP_TERMINATION'));
});

test('Rec 238: British Columbia Employment Uniforms & Deductions — Prohibited till & dine-and-dash deductions', () => {
  const audit = auditBcEmploymentUniformAndDeductions({
    requiresSpecialClothingOrUniform: true,
    employerProvidedUniformFreeOfCharge: false,
    uniformCostOrDepositChargedCad: 120,
    deductedForTillShortage: true,
    tillShortageDeductionCad: 45,
    deductedForCustomerDineAndDash: true,
    dineAndDashDeductionCad: 85
  });
  assert.equal(audit.totalUnlawfulDeductionsCad, 250);
  assert.equal(audit.complianceStatus, 'UNLAWFUL_WAGE_DEDUCTIONS_OR_UNIFORM_BREACH');
  assert.ok(audit.statutoryViolations.some(v => v.rule === 'ILLEGAL_UNIFORM_CHARGE_OR_DEPOSIT'));
  assert.ok(audit.statutoryViolations.some(v => v.rule === 'PROHIBITED_CASH_SHORTAGE_DEDUCTION'));
  assert.ok(audit.statutoryViolations.some(v => v.rule === 'PROHIBITED_DINE_AND_DASH_DEDUCTION'));
});

test('Rec 239: British Columbia Employment Severance & Group Termination — Section 64 stacking doctrine', () => {
  // Test calculateBcIndividualNoticeWeeks
  assert.equal(calculateBcIndividualNoticeWeeks(2), 0); // under 3 months
  assert.equal(calculateBcIndividualNoticeWeeks(6), 1); // 3 mos to 1 yr
  assert.equal(calculateBcIndividualNoticeWeeks(24), 2); // 2 yrs
  assert.equal(calculateBcIndividualNoticeWeeks(48), 4); // 4 yrs

  // Group termination of 150 employees (12 weeks) + individual tenure 36 months (3 weeks)
  const group = evaluateBcGroupTerminationNotice({
    affectedEmployeesCount: 150,
    individualTenureMonths: 36,
    regularWeeklyWageCad: 1000,
    groupNoticeWeeksGiven: 4,
    ministerNotified: false
  });
  assert.equal(group.isSection64GroupTermination, true);
  assert.equal(group.groupTerminationDetails.requiredNoticeWeeks, 12);
  assert.equal(group.groupTerminationDetails.shortfallWeeks, 8);
  assert.equal(group.individualNoticeDetails.statutorySection63Weeks, 3);
  // Stacking: 8 weeks group shortfall + 3 weeks individual = 11 stacked weeks
  assert.equal(group.totalLiabilityAssessment.stackedNoticeWeeks, 11);
  assert.equal(group.totalLiabilityAssessment.totalStatutoryPayInLieuCad, 11000);
});

test('Rec 240: British Columbia Tenancy Deposit Double Penalty — 15-day rule and mandatory doubling under s. 38(6)', () => {
  const doublePenalty = evaluateBcSecurityDepositDoublePenalty({
    securityDepositPaidCad: 1200,
    petDepositPaidCad: 600,
    tenancyHasEnded: true,
    forwardingAddressProvidedInWriting: true,
    daysSinceForwardingAddressReceived: 20,
    landlordFiledRtbClaimWithin15Days: false,
    landlordRefundedAmountCad: 0
  });
  assert.equal(doublePenalty.isDoublePenaltyMandatory, true);
  assert.equal(doublePenalty.complianceStatus, 'MANDATORY_STATUTORY_DOUBLE_PENALTY_TRIGGERED');
  assert.equal(doublePenalty.financialSummary.totalDepositsPaidCad, 1800);
  assert.equal(doublePenalty.financialSummary.grossPenaltyOwedCad, 3600); // 2x $1800
  assert.equal(doublePenalty.financialSummary.netMonetaryAwardOwedCad, 3600);
});

test('Rec 241: Alberta Employment Termination Just Cause — McKinley proportionality doctrine and progressive discipline', () => {
  // Attendance issue without prior progressive warnings fails cause test
  const causeAudit = auditAlbertaTerminationJustCause({
    allegedMisconductCategory: 'ATTENDANCE_LATENESS',
    employerIssuedPriorWrittenWarnings: false,
    employeeGivenOpportunityToImprove: false,
    yearsOfContinuousService: 4,
    regularWeeklyWageCad: 1200,
    actualTerminationNoticeWeeksGiven: 0
  });
  assert.equal(causeAudit.isJustCauseEstablished, false);
  assert.equal(causeAudit.causeDefensibilityVerdict, 'UNSUSTAINABLE_CAUSE_LACKS_PROGRESSIVE_DISCIPLINE');
  assert.equal(causeAudit.statutoryNoticeScale.statutoryNoticeWeeks, 4);
  assert.equal(causeAudit.statutoryNoticeScale.statutoryTerminationPayEntitledCad, 4800);
});

test('Rec 242: Alberta Tenancy Abandoned Goods — Mandatory 30-day storage and prohibition of rent arrears lien', () => {
  // Goods valued at $3,500 disposed of at day 10
  const disposal = evaluateAlbertaAbandonedGoods({
    estimatedMarketValueCad: 3500,
    daysSinceLandlordTookPossession: 10,
    landlordDisposedBefore30Days: true,
    landlordRefusedReleaseWithoutRentArrears: true,
    accruedStorageAndMovingCostsCad: 150,
    unpaidRentArrearsCad: 1800
  });
  assert.equal(disposal.isAbove2000Threshold, true);
  assert.ok(disposal.statutoryViolations.some(v => v.rule === 'UNLAWFUL_PREMATURE_DISPOSAL_OF_ABANDONED_GOODS'));
  assert.ok(disposal.statutoryViolations.some(v => v.rule === 'UNLAWFUL_WITHHOLDING_OF_TENANT_PROPERTY'));
});

test('Rec 243: Calgary Secondary Suite Registration — Egress window dimensions, ceiling height & smoke alarms', () => {
  const audit = auditCalgarySecondarySuite({
    suiteType: 'basement_suite',
    hasInterconnectedSmokeAlarms: false,
    hasCarbonMonoxideAlarm: true,
    bedroomWindowOpeningAreaSqM: 0.30, // below 0.35
    bedroomWindowMinDimensionMm: 350, // below 380
    ceilingHeightMetres: 1.90 // below 1.95
  });
  assert.equal(audit.isCodeCompliant, false);
  assert.equal(audit.registryReadinessStatus, 'REMEDIATION_REQUIRED');
  assert.ok(audit.safetyDeficiencies.some(d => d.item === 'Interconnected Smoke Alarms'));
  assert.ok(audit.safetyDeficiencies.some(d => d.item === 'Bedroom Egress Window Area'));
  assert.ok(audit.safetyDeficiencies.some(d => d.item === 'Minimum Ceiling Clearance'));
});

test('Rec 244: British Columbia Strata EV Charging — 3-month statutory response window and CRT remedy', () => {
  // Council failed to respond after 100 days (exceeds 92-day statutory window)
  const evAudit = evaluateBcStrataEvCharging({
    requestDate: '2026-06-01',
    currentDate: '2026-10-01',
    hasStrataCouncilResponded: false,
    strataLotCount: 60
  });
  assert.equal(evAudit.isPastThreeMonthDeadline, true);
  assert.equal(evAudit.legalVerdict, 'STATUTORY_DEADLINE_BREACHED_CRT_ACTIONABLE');
  assert.ok(evAudit.statutoryRemedies.some(r => r.action.includes('Civil Resolution Tribunal (CRT)')));
});
