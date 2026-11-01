// test/batch30-recommendations.test.js
// Verification suite for Sweep 37 (Recommendations 516–530).

import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateYukonCriticalImpactWorker } from '../src/yukon-nominee-critical-impact-worker-navigator.js';
import { clusterZeroResultQueries, generateEditorialMarkdownReport } from '../src/zero-result-clusterer.js';
import { evaluateAlbertaRuralEntrepreneur } from '../src/alberta-alep-rural-entrepreneur-stream-navigator.js';
import { auditAlbertaCommercialDistress } from '../src/alberta-commercial-tenant-distress-navigator.js';
import { evaluateAlbertaConstructiveDismissal } from '../src/alberta-employment-constructive-dismissal-salary-reduction-navigator.js';
import { evaluateAlbertaGeneralHolidayPay } from '../src/alberta-employment-general-holiday-pay-navigator.js';
import { evaluateAlbertaMaternityParentalLeave } from '../src/alberta-employment-maternity-parental-leave-navigator.js';
import { calculateAlbertaOvertimeHours, evaluateAlbertaOvertimeBanking } from '../src/alberta-employment-overtime-banking-navigator.js';
import { auditAlbertaEmploymentRestPeriods } from '../src/alberta-employment-rest-periods-shift-limits-navigator.js';
import { auditAlbertaTerminationJustCause } from '../src/alberta-employment-termination-just-cause-audit-navigator.js';
import { evaluateAlbertaYouthEmploymentRules } from '../src/alberta-employment-youth-employment-rules-navigator.js';
import { evaluateAlbertaOpportunityStream } from '../src/alberta-opportunity-stream-navigator.js';
import { evaluateAlbertaAbandonedGoods } from '../src/alberta-residential-tenancy-abandoned-goods-distress-navigator.js';
import { evaluateAlbertaLandlordEntry } from '../src/alberta-residential-tenancy-landlord-entry-notice-navigator.js';
import { evaluateAlbertaPeriodicTenancyNotice } from '../src/alberta-residential-tenancy-periodic-tenancy-termination-navigator.js';

test('Rec 516: evaluateYukonCriticalImpactWorker audits YNP Critical Impact Stream and sanitizes inputs', () => {
  const res = evaluateYukonCriticalImpactWorker({
    candidateName: 'Dmitri Volkov\u0000',
    targetNocTeer: 4,
    nocCode: '65201',
    monthsOfRelatedExperience: 8,
    hasPermanentFullTimeOffer: true,
    weeklyOfferedHours: 35,
    hourlyWageCad: 19.5,
    employerOperatingYearsInYukon: 2,
    employerRecruitmentAdvertisedWeeks: 4,
    languageClbScore: 4,
    hasHighSchoolOrEca: true,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.candidateName, 'Dmitri Volkov');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.eligibilityStatus, 'ELIGIBLE_FOR_YUKON_CRITICAL_IMPACT_NOMINATION');
});

test('Rec 517: clusterZeroResultQueries groups missing evidence queries and emits editorial reports', () => {
  const queryLogs = [
    'How do I replace lost PR card in Calgary?',
    'Lost PR card replacement documents Calgary',
    'Where to renew health card in Red Deer?'
  ];
  const res = clusterZeroResultQueries(queryLogs, { assessmentDate: '2026-10-31' });
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.ok(res.uniqueClusters >= 1);
  const md = generateEditorialMarkdownReport(res);
  assert.ok(md.includes('# Zero-Result Query Cluster Report'));
});

test('Rec 518: evaluateAlbertaRuralEntrepreneur audits AAIP Rural Entrepreneur endorsement and net worth', () => {
  const res = evaluateAlbertaRuralEntrepreneur({
    candidateName: 'Liam Chen',
    communityName: 'Brooks',
    isDesignatedRuralCommunity: true,
    hasCommunityEndorsementLetter: true,
    hasCompletedExploratoryVisit: true,
    netWorthCad: 350000,
    plannedInvestmentCad: 150000,
    plannedOwnershipPercentage: 60,
    fullTimeJobsCreatedForCanadians: 1,
    yearsOfBusinessOwnershipOrSeniorManagement: 3,
    clbScore: 5,
    hasHighSchoolDiplomaOrEca: true,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.candidateName, 'Liam Chen');
  assert.equal(res.communityName, 'Brooks');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
});

test('Rec 519: auditAlbertaCommercialDistress audits Civil Enforcement Act s. 33-42 and 14-day objection window', () => {
  const res = auditAlbertaCommercialDistress({
    tenantBusinessName: 'Prairie Bakery Ltd',
    rentArrearsClaimedCad: 12000,
    goodsEstimatedValueCad: 40000,
    isSeizureExecutedByLicensedAgency: true,
    hasLandlordChangedLocksOrTerminatedLease: false,
    daysElapsedSinceSeizure: 4,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.tenantBusinessName, 'Prairie Bakery Ltd');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.legalVerdict, 'LAWFUL_PENDING_DISTRESS');
  assert.equal(res.isWithinObjectionWindow, true);
});

test('Rec 520: evaluateAlbertaConstructiveDismissal audits Farber/Potter doctrine and 10% pay cut threshold', () => {
  const res = evaluateAlbertaConstructiveDismissal({
    employeeName: 'Sarah Jenkins',
    employerName: 'Prairie Tech Corp',
    previousAnnualSalaryCad: 90000,
    newAnnualSalaryCad: 70000, // >22% reduction
    yearsOfContinuousService: 5,
    employeeAgreedToReduction: false,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.employeeName, 'Sarah Jenkins');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isConstructiveDismissal, true);
  assert.equal(res.severanceCalculation.statutoryNoticeWeeks, 4);
});

test('Rec 521: evaluateAlbertaGeneralHolidayPay audits 9 statutory holidays and 5% lookback average daily wage', () => {
  const res = evaluateAlbertaGeneralHolidayPay({
    holidayName: 'CANADA_DAY',
    workDaysInPast12Months: 60,
    isRegularDayOfWork: true,
    workedOnHoliday: false,
    regularHourlyWageCad: 25,
    wagesEarnedInPast4WeeksCad: 4000,
    holidayPayActuallyPaidCad: 200,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.isEligibleForHolidayPay, true);
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.calculationDetails.averageDailyWageCad, 200);
});

test('Rec 522: evaluateAlbertaMaternityParentalLeave audits 90-day service, 16w maternity, and 62w parental leaves', () => {
  const res = evaluateAlbertaMaternityParentalLeave({
    employeeName: 'Emma Watson',
    leaveType: 'COMBINED_MATERNITY_PARENTAL',
    consecutiveDaysOfEmployment: 180,
    maternityWeeksRequested: 16,
    parentalWeeksRequested: 62,
    noticeWeeksProvidedBeforeLeave: 6,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.employeeName, 'Emma Watson');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.leaveEntitlementSummary.isReinstatementMandatory, true);
});

test('Rec 523: calculateAlbertaOvertimeHours & evaluateAlbertaOvertimeBanking audit 8/44 rule and banking agreements', () => {
  const hours = calculateAlbertaOvertimeHours([10, 10, 8, 8, 8]); // 44 total, but 2 daily overtimes each on days 1 & 2 = 4 daily excess
  assert.equal(hours.statutoryOvertimeHours, 4);

  const res = evaluateAlbertaOvertimeBanking({
    regularHourlyWageCad: 30,
    dailyHoursWorked: [10, 10, 8, 8, 8],
    hasWrittenOvertimeAgreement: true,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.hoursAudit.governingStatutoryOvertimeHours, 4);
});

test('Rec 524: auditAlbertaEmploymentRestPeriods audits 30-min break per 5h and 8h inter-shift rest', () => {
  const res = auditAlbertaEmploymentRestPeriods({
    employeeName: 'Noah Patel',
    shiftDurationHours: 8,
    restBreakMinutesProvided: 30,
    hoursBetweenConsecutiveShifts: 12,
    consecutiveWorkDaysWorked: 5,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.employeeName, 'Noah Patel');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.complianceStatus, 'COMPLIANT_WITH_ALBERTA_REST_STANDARDS');
  assert.equal(res.shiftAudit.hasCompliantIntraShiftBreak, true);
});

test('Rec 525: auditAlbertaTerminationJustCause audits McKinley v. BC Tel progressive discipline requirements', () => {
  const res = auditAlbertaTerminationJustCause({
    employeeName: 'Olivia Taylor',
    allegedMisconductCategory: 'PERFORMANCE_ISSUES',
    employerIssuedPriorWrittenWarnings: false,
    employeeGivenOpportunityToImprove: false,
    yearsOfContinuousService: 5,
    regularWeeklyWageCad: 1100,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.employeeName, 'Olivia Taylor');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isJustCauseEstablished, false);
  assert.equal(res.statutoryNoticeScale.noticeShortfallWeeks, 4);
});

test('Rec 526: evaluateAlbertaYouthEmploymentRules audits adolescent age 13-14 school day 2-hour limits and parental consent', () => {
  const res = evaluateAlbertaYouthEmploymentRules({
    employeeName: 'Lucas Brown',
    employeeAge: 14,
    jobCategory: 'RETAIL_CLERK',
    hasWrittenParentalConsent: true,
    isSchoolDay: true,
    scheduledShiftHours: 2,
    shiftStartHour: 16,
    shiftEndHour: 18,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.employeeName, 'Lucas Brown');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isCompliant, true);
  assert.equal(res.complianceStatus, 'COMPLIANT_YOUTH_EMPLOYMENT');
});

test('Rec 527: evaluateAlbertaOpportunityStream audits AAIP AOS experience window and CLB thresholds', () => {
  const res = evaluateAlbertaOpportunityStream({
    candidateName: 'Hassan Mahmoud',
    workPermitType: 'lmia_based',
    albertaWorkExperienceMonths: 14,
    teerCategory: 2,
    nocCode: '21231',
    languageClbLevel: 6,
    hasCanadianHighSchoolOrEca: true,
    hasPermanentJobOfferInAlberta: true,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.candidateName, 'Hassan Mahmoud');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isAosEligible, true);
  assert.equal(res.overallVerdict, 'ELIGIBLE_FOR_AAIP_NOMINATION');
});

test('Rec 528: evaluateAlbertaAbandonedGoods audits $2,000 threshold and mandatory 30-day storage period', () => {
  const res = evaluateAlbertaAbandonedGoods({
    tenantName: 'Chloe Bennett',
    estimatedMarketValueCad: 3000,
    daysSinceLandlordTookPossession: 15,
    hasPreparedItemizedInventory: true,
    landlordDisposedBefore30Days: false,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.tenantName, 'Chloe Bennett');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isAbove2000Threshold, true);
  assert.equal(res.isWithin30DayStorageWindow, true);
});

test('Rec 529: evaluateAlbertaLandlordEntry audits 24-hour notice, 8 AM to 8 PM window, and quiet enjoyment', () => {
  const res = evaluateAlbertaLandlordEntry({
    tenantName: 'Ethan Clark',
    noticeHoursGiven: 24,
    entryScheduledHour: 14,
    entryDayOfWeek: 'Tuesday',
    noticeSpecifiedDateAndTime: true,
    noticeSignedByLandlord: true,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.tenantName, 'Ethan Clark');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEntryPermitted, true);
  assert.equal(res.complianceStatus, 'COMPLIANT_24H_ENTRY_NOTICE');
});

test('Rec 530: evaluateAlbertaPeriodicTenancyNotice audits 3-month landlord notice and prescribed grounds', () => {
  const res = evaluateAlbertaPeriodicTenancyNotice({
    tenantName: 'Grace Lee',
    landlordName: 'Apex Properties',
    partyGivingNotice: 'LANDLORD',
    tenancyType: 'MONTH_TO_MONTH',
    fullTenancyMonthsNoticeGiven: 3,
    landlordStatedReason: 'LANDLORD_OR_RELATIVE_OCCUPANCY',
    noticeInWritingAndSigned: true,
    assessmentDate: '2026-10-31'
  });
  assert.equal(res.tenantName, 'Grace Lee');
  assert.equal(res.landlordName, 'Apex Properties');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isValidNotice, true);
  assert.equal(res.complianceStatus, 'COMPLIANT_PERIODIC_NOTICE');
});
