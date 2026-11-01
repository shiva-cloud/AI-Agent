/**
 * Batch 37 Recommendations Test Suite (Recommendations 621–635)
 *
 * Covers:
 * - Rec 621: src/federal-francophone-mobility-c16-expansion-navigator.js
 * - Rec 622: src/federal-parent-grandparent-super-visa-medical-insurance-navigator.js
 * - Rec 623: src/federal-refugee-cessation-citizenship-audit-navigator.js
 * - Rec 624: src/federal-self-employed-persons-program-navigator.js
 * - Rec 625: src/federal-skilled-trades-navigator.js
 * - Rec 626: src/federal-start-up-visa-designated-organization-navigator.js
 * - Rec 627: src/federal-start-up-visa-peer-review-navigator.js
 * - Rec 628: src/federal-study-permit-off-campus-work-hours-navigator.js
 * - Rec 629: src/federal-visitor-record-extension-status-restoration-navigator.js
 * - Rec 630: src/federal-work-permit-dual-intent-assessment-navigator.js
 * - Rec 631: src/finite-input.js
 * - Rec 632: src/foreign-worker-closed-permit-transition-navigator.js
 * - Rec 633: src/foreign-worker-transition-navigator.js
 * - Rec 634: src/franchise-disclosure-navigator.js
 * - Rec 635: src/francophone-mobility-navigator.js
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { evaluateFederalFrancophoneMobilityC16 } from '../src/federal-francophone-mobility-c16-expansion-navigator.js';
import { evaluateFederalSuperVisaInsuranceLico } from '../src/federal-parent-grandparent-super-visa-medical-insurance-navigator.js';
import { evaluateRefugeeCessationRisk } from '../src/federal-refugee-cessation-citizenship-audit-navigator.js';
import { evaluateSelfEmployedProgram, SELF_EMPLOYED_PASS_MARK_POINTS } from '../src/federal-self-employed-persons-program-navigator.js';
import { evaluateFederalSkilledTradesProgram, isNocEligibleForSkilledTrades } from '../src/federal-skilled-trades-navigator.js';
import { evaluateStartUpVisaEligibility, calculateSuvSettlementFunds } from '../src/federal-start-up-visa-designated-organization-navigator.js';
import { evaluateFederalSuvPeerReview } from '../src/federal-start-up-visa-peer-review-navigator.js';
import { evaluateFederalStudentOffCampusWork, FEDERAL_STUDENT_WORK_CONSTANTS } from '../src/federal-study-permit-off-campus-work-hours-navigator.js';
import { evaluateFederalVisitorExtensionAndRestoration } from '../src/federal-visitor-record-extension-status-restoration-navigator.js';
import { evaluateDualIntentCompliance } from '../src/federal-work-permit-dual-intent-assessment-navigator.js';
import { assertFiniteInput } from '../src/finite-input.js';
import { evaluateForeignWorkerPermitTransition } from '../src/foreign-worker-closed-permit-transition-navigator.js';
import { evaluateForeignWorkerTransition, TFW_TRANSITION_CONSTANTS } from '../src/foreign-worker-transition-navigator.js';
import { evaluateFranchiseDisclosure } from '../src/franchise-disclosure-navigator.js';
import { evaluateFrancophoneMobility } from '../src/francophone-mobility-navigator.js';

test('Rec 621: Federal Francophone Mobility C16 Expansion Navigator — IRPR s. 205(a) oral NCLC 5+ & TEER scope', () => {
  // 1. Safe default handling on null
  const nullResult = evaluateFederalFrancophoneMobilityC16(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.exemptionCode, 'C16');
  assert.equal(nullResult.isEligible, true);

  // 2. Fully compliant applicant outside Quebec
  const compliant = evaluateFederalFrancophoneMobilityC16({
    frenchOralNclcLevel: 7,
    destinationProvince: 'ON',
    teerCategory: 2,
    isPrimaryAgricultureNoc: false,
    hasValidJobOffer: true,
    hasApprovedFrenchTest: true,
    employerComplianceFeePaid: true
  });
  assert.equal(compliant.isEligible, true);
  assert.equal(compliant.statutoryViolations.length, 0);
  assert.equal(compliant.destinationProvince, 'ON');

  // 3. Ineligible due to Quebec destination
  const quebecResult = evaluateFederalFrancophoneMobilityC16({
    destinationProvince: 'QC',
    frenchOralNclcLevel: 8
  });
  assert.equal(quebecResult.isEligible, false);
  assert.ok(quebecResult.statutoryViolations.some(v => v.rule === 'INELIGIBLE_DESTINATION_QUEBEC'));

  // 4. Ineligible due to low French oral proficiency (NCLC < 5)
  const lowFrench = evaluateFederalFrancophoneMobilityC16({
    frenchOralNclcLevel: 4
  });
  assert.equal(lowFrench.isEligible, false);
  assert.ok(lowFrench.statutoryViolations.some(v => v.rule === 'BELOW_MINIMUM_FRENCH_ORAL_BENCHMARK'));

  // 5. Primary agriculture exclusion
  const agriResult = evaluateFederalFrancophoneMobilityC16({
    isPrimaryAgricultureNoc: true
  });
  assert.equal(agriResult.isEligible, false);
  assert.ok(agriResult.statutoryViolations.some(v => v.rule === 'EXCLUDED_PRIMARY_AGRICULTURE_OCCUPATION'));
});

test('Rec 622: Federal Super Visa Medical Insurance & LICO Navigator — $100k coverage & income benchmarks', () => {
  // 1. Safe default handling on null
  const nullResult = evaluateFederalSuperVisaInsuranceLico(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.isEligible, true);
  assert.equal(nullResult.financialSummary.insuranceCoverageCad, 100000);

  // 2. Compliant application
  const compliant = evaluateFederalSuperVisaInsuranceLico({
    medicalInsuranceCoverageCad: 150000,
    insurancePolicyValidityDays: 365,
    insuranceFromApprovedProvider: true,
    proofOfInsurancePaymentProvided: true,
    completedUpfrontImeMedicalExam: true,
    sponsorAnnualIncomeCad: 70000,
    householdSizeIncludingApplicants: 4
  });
  assert.equal(compliant.isEligible, true);
  assert.equal(compliant.financialSummary.incomeDeficitCad, 0);
  assert.equal(compliant.statutoryViolations.length, 0);

  // 3. Substandard medical insurance coverage ($50,000 < $100,000)
  const lowCoverage = evaluateFederalSuperVisaInsuranceLico({
    medicalInsuranceCoverageCad: 50000
  });
  assert.equal(lowCoverage.isEligible, false);
  assert.ok(lowCoverage.statutoryViolations.some(v => v.rule === 'SUBSTANDARD_MEDICAL_INSURANCE_COVERAGE'));

  // 4. Insufficient sponsor income below LICO
  const lowIncome = evaluateFederalSuperVisaInsuranceLico({
    sponsorAnnualIncomeCad: 30000,
    householdSizeIncludingApplicants: 4 // LICO is $54,594
  });
  assert.equal(lowIncome.isEligible, false);
  assert.ok(lowIncome.financialSummary.incomeDeficitCad > 0);
  assert.ok(lowIncome.statutoryViolations.some(v => v.rule === 'SPONSOR_INCOME_BELOW_LICO_THRESHOLD'));
});

test('Rec 623: Federal Refugee Cessation & Re-availment Risk Navigator — Citizen shield & three-prong test', () => {
  // 1. Safe default handling on null
  const nullResult = evaluateRefugeeCessationRisk(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.cessationRiskLevel, 'LOW');

  // 2. Canadian Citizen Shield (complete statutory immunity under IRPA s. 108)
  const citizenResult = evaluateRefugeeCessationRisk({
    hasAcquiredCanadianCitizenship: true
  });
  assert.equal(citizenResult.isExemptFromIrpaCessation, true);
  assert.equal(citizenResult.legalStatusVerdict, 'CITIZEN_SHIELD_IMMUNE_FROM_IRPA_108');
  assert.equal(citizenResult.cessationRiskLevel, 'NONE');

  // 3. High Re-availment Risk: PR renewed national passport and returned to home country
  const highRisk = evaluateRefugeeCessationRisk({
    currentStatusInCanada: 'PERMANENT_RESIDENT',
    hasAppliedForOrRenewedNationalPassport: true,
    usedNationalPassportToTravel: true,
    traveledBackToCountryOfPersecution: true,
    numberOfTripsToCountryOfPersecution: 2,
    cumulativeDaysInCountryOfPersecution: 45
  });
  assert.equal(highRisk.isExemptFromIrpaCessation, false);
  assert.ok(highRisk.cessationRiskLevel === 'CRITICAL' || highRisk.cessationRiskLevel === 'HIGH');
  assert.ok(highRisk.riskFactors.some(r => r.risk === 'PRESUMPTION_OF_REAVAILMENT_NATIONAL_PASSPORT'));

  // 4. Mitigating circumstances: Travel strictly on Canadian Refugee Travel Document
  const mitigated = evaluateRefugeeCessationRisk({
    currentStatusInCanada: 'PERMANENT_RESIDENT',
    hasAppliedForOrRenewedNationalPassport: false,
    usedNationalPassportToTravel: false,
    usedCanadianRefugeeTravelDocument: true,
    traveledBackToCountryOfPersecution: false
  });
  assert.equal(mitigated.cessationRiskLevel, 'LOW');
  assert.ok(mitigated.mitigatingFactors.some(m => m.factor === 'USE_OF_CANADIAN_REFUGEE_TRAVEL_DOCUMENT'));
});

test('Rec 624: Federal Self-Employed Persons Program Navigator — IRPR ss. 88(1) & 100 35-point pass mark', () => {
  // 1. Safe default handling on null
  const nullResult = evaluateSelfEmployedProgram(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.pointsSummary.passMark, SELF_EMPLOYED_PASS_MARK_POINTS);

  // 2. Compliant candidate meeting 35-point pass mark
  const compliant = evaluateSelfEmployedProgram({
    activityType: 'CULTURAL_ACTIVITIES',
    yearsOfSelfEmployedExperience: 4,
    educationLevel: 'BACHELORS',
    applicantAge: 30,
    firstOfficialLanguageClb: 8,
    settlementFundsCad: 35000,
    familySize: 2
  });
  assert.equal(compliant.relevantExperienceAudit.satisfiesStatutoryTwoYearThreshold, true);
  assert.ok(compliant.pointsSummary.totalPoints >= SELF_EMPLOYED_PASS_MARK_POINTS);
  assert.equal(compliant.pointsSummary.isPassMarkSatisfied, true);
  assert.equal(compliant.isEligible, true);
  assert.ok(compliant.riskWarnings.some(w => w.warning === 'MINISTERIAL_INSTRUCTIONS_INTAKE_PAUSE'));

  // 3. Disqualification for insufficient experience (< 2 years)
  const lowExp = evaluateSelfEmployedProgram({
    yearsOfSelfEmployedExperience: 1,
    yearsOfWorldClassParticipation: 0
  });
  assert.equal(lowExp.relevantExperienceAudit.satisfiesStatutoryTwoYearThreshold, false);
  assert.equal(lowExp.isEligible, false);
  assert.ok(lowExp.disqualifications.some(d => d.criterion === 'RELEVANT_EXPERIENCE_SHORTFALL'));
});

test('Rec 625: Federal Skilled Trades Navigator — IRPR s. 87.2 trade groups, qualification & language', () => {
  // 1. Helper function for trade NOC eligibility
  assert.equal(isNocEligibleForSkilledTrades('72410'), true); // Major Group 72
  assert.equal(isNocEligibleForSkilledTrades('63200'), true); // Minor Group 63200 (Cooks)
  assert.equal(isNocEligibleForSkilledTrades('21232'), false); // Software developer (not trade)

  // 2. Safe default handling on null
  const nullResult = evaluateFederalSkilledTradesProgram(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.isEligible, true);

  // 3. Disqualification on ineligible NOC
  const badNoc = evaluateFederalSkilledTradesProgram({
    nocCode: '11100' // Financial auditors
  });
  assert.equal(badNoc.isEligible, false);
  assert.equal(badNoc.isTradeNoc, false);
  assert.ok(badNoc.deficiencies.some(d => d.includes('not in an eligible trade group')));

  // 4. Disqualification on low language scores (CLB < 5 in speaking/listening or < 4 in reading/writing)
  const lowLang = evaluateFederalSkilledTradesProgram({
    clbSpeaking: 4,
    clbListening: 5,
    clbReading: 4,
    clbWriting: 4
  });
  assert.equal(lowLang.isEligible, false);
  assert.equal(lowLang.languageScores.isLanguageCompliant, false);
  assert.ok(lowLang.deficiencies.some(d => d.includes('Language benchmark shortfall')));
});

test('Rec 626: Federal Start-Up Visa Designated Organization Navigator — VC, Angel & Incubator thresholds', () => {
  // 1. Settlement funds calculator
  assert.ok(calculateSuvSettlementFunds(1) > 0);
  assert.ok(calculateSuvSettlementFunds(3) > calculateSuvSettlementFunds(1));

  // 2. Safe default handling on null
  const nullResult = evaluateStartUpVisaEligibility(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.stream, 'FEDERAL_START_UP_VISA');

  // 3. Compliant Business Incubator candidate
  const incubatorCandidate = evaluateStartUpVisaEligibility({
    entityType: 'BUSINESS_INCUBATOR',
    hasCommitmentCertificate: true,
    hasLetterOfSupport: true,
    acceptedIntoIncubationProgram: true,
    numberOfCoOwnersApplying: 2,
    applicantVotingRightsPercentage: 25,
    jointVotingRightsPercentage: 55,
    clbSpeaking: 6,
    clbListening: 6,
    clbReading: 6,
    clbWriting: 6,
    availableSettlementFundsCad: 35000,
    familySize: 2
  });
  assert.equal(incubatorCandidate.isEligible, true);
  assert.equal(incubatorCandidate.eligibilityVerdict, 'ELIGIBLE_FOR_START_UP_VISA_PERMANENT_RESIDENCE');

  // 4. Ineligible due to voting rights under 10%
  const lowEquity = evaluateStartUpVisaEligibility({
    entityType: 'BUSINESS_INCUBATOR',
    hasCommitmentCertificate: true,
    hasLetterOfSupport: true,
    acceptedIntoIncubationProgram: true,
    applicantVotingRightsPercentage: 8
  });
  assert.equal(lowEquity.isEligible, false);
  assert.ok(lowEquity.disqualifications.some(d => d.criterion === 'INSUFFICIENT_INDIVIDUAL_OWNERSHIP'));
});

test('Rec 627: Federal Start-Up Visa Peer Review Navigator — Equity thresholds & peer review risk triggers', () => {
  // 1. Safe default handling on null
  const nullResult = evaluateFederalSuvPeerReview(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.isEligible, true);

  // 2. Fully compliant startup founder
  const compliant = evaluateFederalSuvPeerReview({
    applicantVotingRightsPercentage: 20,
    totalFoundersAndEntityVotingPercentage: 65,
    totalFoundersCount: 3,
    hasOfficialLetterOfSupport: true,
    hasActiveOngoingManagementRole: true,
    businessIncorporatedInCanada: true
  });
  assert.equal(compliant.isEligible, true);
  assert.equal(compliant.statutoryViolations.length, 0);

  // 3. Statutory violation: Combined voting rights not exceeding 50%
  const badEquity = evaluateFederalSuvPeerReview({
    applicantVotingRightsPercentage: 15,
    totalFoundersAndEntityVotingPercentage: 45
  });
  assert.equal(badEquity.isEligible, false);
  assert.ok(badEquity.statutoryViolations.some(v => v.rule === 'COMBINED_CONTROL_NOT_EXCEEDING_50_PERCENT'));

  // 4. Peer review requested by officer triggers panel review warning
  const peerReviewFlagged = evaluateFederalSuvPeerReview({
    peerReviewRequestedByOfficer: true
  });
  assert.equal(peerReviewFlagged.dueDiligenceSummary.peerReviewTriggered, true);
  assert.ok(peerReviewFlagged.riskWarnings.some(w => w.warningType === 'PEER_REVIEW_PANEL_TRIGGERED'));
});

test('Rec 628: Federal Study Permit Off-Campus Work Hours Navigator — Fall 2024 24h rule & PGWP bar', () => {
  // 1. Safe default handling on null (previously would crash if destructured in params)
  const nullResult = evaluateFederalStudentOffCampusWork(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.isCompliant, true);
  assert.equal(nullResult.maxPermittedWeeklyHours, FEDERAL_STUDENT_WORK_CONSTANTS.MAX_ACADEMIC_SESSION_WEEKLY_HOURS);

  // 2. Compliant student working 24 hours in academic session
  const compliant = evaluateFederalStudentOffCampusWork({
    hasValidStudyPermit: true,
    enrolledFullTimeAtDli: true,
    isInRegularAcademicSession: true,
    isOnRegularlyScheduledBreak: false,
    weeklyHoursWorkedOffCampus: 24,
    programLengthMonths: 24
  });
  assert.equal(compliant.isCompliant, true);
  assert.equal(compliant.pgwpImpact.pgwpAtRisk, false);

  // 3. Excessive hours during academic session (30 hours > 24 hours statutory standard)
  const excessiveHours = evaluateFederalStudentOffCampusWork({
    weeklyHoursWorkedOffCampus: 30,
    isInRegularAcademicSession: true,
    isOnRegularlyScheduledBreak: false
  });
  assert.equal(excessiveHours.isCompliant, false);
  assert.equal(excessiveHours.pgwpImpact.pgwpAtRisk, true);
  assert.ok(excessiveHours.statutoryViolations.some(v => v.rule === 'EXCEEDED_24_HOUR_WEEKLY_OFF_CAMPUS_CAP'));

  // 4. Unlimited hours during scheduled break
  const breakWork = evaluateFederalStudentOffCampusWork({
    isInRegularAcademicSession: false,
    isOnRegularlyScheduledBreak: true,
    weeklyHoursWorkedOffCampus: 40
  });
  assert.equal(breakWork.isCompliant, true);
  assert.equal(breakWork.maxPermittedWeeklyHours, 'UNLIMITED');
  assert.equal(breakWork.pgwpImpact.pgwpAtRisk, false);
});

test('Rec 629: Federal Visitor Record Extension & Status Restoration Navigator — In-time vs 90-day restoration', () => {
  // 1. Safe default handling on null
  const nullResult = evaluateFederalVisitorExtensionAndRestoration(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.isEligible, true);

  // 2. In-time extension (submission date before expiry) -> Maintained Status
  const inTime = evaluateFederalVisitorExtensionAndRestoration({
    statusExpiryDate: '2026-12-31',
    applicationSubmissionDate: '2026-11-01'
  });
  assert.equal(inTime.statusClassification, 'IN_TIME_EXTENSION_MAINTAINED_STATUS');
  assert.equal(inTime.isEligible, true);
  assert.equal(inTime.feeSchedule.totalFeesPayableCad, 100);

  // 3. Within 90-day restoration window (status expired 20 days ago)
  const restoration = evaluateFederalVisitorExtensionAndRestoration({
    statusExpiryDate: '2026-10-01',
    applicationSubmissionDate: '2026-10-21'
  });
  assert.equal(restoration.statusClassification, 'ELIGIBLE_FOR_90_DAY_RESTORATION');
  assert.equal(restoration.isWithin90DayRestorationWindow, true);
  assert.equal(restoration.feeSchedule.totalFeesPayableCad, 329);
  assert.ok(restoration.actionableRemedies.some(r => r.action === 'SUBMIT_FORM_IMM_5708_WITH_RESTORATION_FEE'));

  // 4. Barred after 90 days
  const barred = evaluateFederalVisitorExtensionAndRestoration({
    statusExpiryDate: '2026-05-01',
    applicationSubmissionDate: '2026-10-31'
  });
  assert.equal(barred.statusClassification, 'STATUTORILY_BARRED_FROM_RESTORATION');
  assert.equal(barred.isEligible, false);
  assert.ok(barred.statutoryViolations.some(v => v.rule === 'RESTORATION_DEADLINE_EXCEEDED_OUT_OF_STATUS'));
});

test('Rec 630: Federal Temporary Residence Dual Intent Navigator — IRPA s. 22(2) & officer fettering remedies', () => {
  // 1. Safe default handling on null
  const nullResult = evaluateDualIntentCompliance(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.isDualIntentStatutorilyProtected, true);

  // 2. Lawful dual intent with strong home ties
  const lawful = evaluateDualIntentCompliance({
    temporaryApplicationType: 'WORK_PERMIT',
    hasActivePrApplicationOrProfile: true,
    prApplicationStream: 'EXPRESS_ENTRY_CEC',
    demonstratedIntentToRespectStayExpiry: true,
    hasTiesToCountryOfCitizenshipOrResidence: true,
    hasPreviousImmigrationComplianceRecord: true
  });
  assert.equal(lawful.isDualIntentStatutorilyProtected, true);
  assert.equal(lawful.riskTier, 'LOW_REFUSAL_RISK');
  assert.equal(lawful.statutoryViolations.length, 0);

  // 3. Unlawful officer refusal based solely on PR intent
  const fetteredRefusal = evaluateDualIntentCompliance({
    officerRefusalBasedSolelyOnPrIntent: true
  });
  assert.equal(fetteredRefusal.complianceStatus, 'UNLAWFUL_REFUSAL_CONTRARY_TO_SECTION_22');
  assert.ok(fetteredRefusal.statutoryViolations.some(v => v.rule === 'UNLAWFUL_OFFICER_FETTERING_ON_DUAL_INTENT'));
  assert.ok(fetteredRefusal.actionableRemedies.some(r => r.action === 'FILE_FEDERAL_COURT_LEAVE_APPLICATION'));
});

test('Rec 631: Finite Input Validation Guard — Prevents Infinity, NaN, and deep nesting overflow', () => {
  // 1. Valid numbers and structures pass cleanly
  assert.doesNotThrow(() => assertFiniteInput(42));
  assert.doesNotThrow(() => assertFiniteInput(0));
  assert.doesNotThrow(() => assertFiniteInput(-100.5));
  assert.doesNotThrow(() => assertFiniteInput('valid text'));
  assert.doesNotThrow(() => assertFiniteInput(null));
  assert.doesNotThrow(() => assertFiniteInput(undefined));
  assert.doesNotThrow(() => assertFiniteInput({ a: 1, b: [2, 3, { c: 4 }] }));

  // 2. Rejects Infinity and -Infinity
  assert.throws(() => assertFiniteInput(Infinity), /Numeric input must be finite/);
  assert.throws(() => assertFiniteInput(-Infinity), /Numeric input must be finite/);
  assert.throws(() => assertFiniteInput(NaN), /Numeric input must be finite/);
  assert.throws(() => assertFiniteInput({ nested: { value: Infinity } }), /Numeric input must be finite/);

  // 3. Rejects deeply nested structures exceeding 32 levels
  let deepObj = {};
  let current = deepObj;
  for (let i = 0; i < 35; i++) {
    current.next = {};
    current = current.next;
  }
  assert.throws(() => assertFiniteInput(deepObj), /Input nesting exceeds 32 levels/);
});

test('Rec 632: Temporary Foreign Worker Closed Permit Transition Engine — Interim authorization & 90-day restoration', () => {
  // 1. Safe default handling on null
  const nullResult = evaluateForeignWorkerPermitTransition(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.statusCategory, 'MAINTAINED_STATUS_IRPR_186_U');

  // 2. Transition with interim authorization email received -> Authorized to work
  const authorized = evaluateForeignWorkerPermitTransition({
    hasSubmittedNewWorkPermitApplication: true,
    hasPositiveLmiaOrExemption: true,
    hasRequestedPublicPolicyInterimAuthorization: true,
    hasReceivedIrccInterimAuthorizationEmail: true,
    hasStartedWorkingForNewEmployer: true
  });
  assert.equal(authorized.canLegallyWorkForNewEmployer, true);
  assert.equal(authorized.complianceViolations.length, 0);

  // 3. Premature start of work without interim email -> Unauthorized work violation
  const premature = evaluateForeignWorkerPermitTransition({
    hasSubmittedNewWorkPermitApplication: true,
    hasReceivedIrccInterimAuthorizationEmail: false,
    hasStartedWorkingForNewEmployer: true
  });
  assert.equal(premature.canLegallyWorkForNewEmployer, false);
  assert.ok(premature.complianceViolations.includes('UNAUTHORIZED_WORK_UNDER_IRPA_30'));

  // 4. Lapsed status within 90-day restoration window
  const outOfStatus = evaluateForeignWorkerPermitTransition({
    currentWorkPermitExpiryDate: '2026-08-01',
    currentDate: '2026-09-01',
    statusAlreadyExpired: true,
    daysElapsedSinceExpiry: 31
  });
  assert.equal(outOfStatus.statusCategory, 'OUT_OF_STATUS_RESTORATION_REQUIRED');
  assert.equal(outOfStatus.isWithinRestorationWindow, true);
  assert.equal(outOfStatus.restorationDaysRemaining, 59);
});

test('Rec 633: Foreign Worker Transition & Policy Engine — High-wage vs low-wage CMA freeze & pathways', () => {
  // 1. Safe default handling on null
  const nullResult = evaluateForeignWorkerTransition(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.streamClassification.stream, 'LOW_WAGE_STREAM');

  // 2. High-Wage Stream: Above provincial median wage ($35 vs $28.39) -> No CMA freeze, up to 3 years
  const highWage = evaluateForeignWorkerTransition({
    wagePerHour: 35.0,
    provincialMedianWage: 28.39,
    cmaUnemploymentRate: 7.2
  });
  assert.equal(highWage.streamClassification.stream, 'HIGH_WAGE_STREAM');
  assert.equal(highWage.lmiaAudit.isSubjectToCmaFreeze, false);
  assert.equal(highWage.lmiaAudit.maxWorkPermitDurationMonths, TFW_TRANSITION_CONSTANTS.HIGH_WAGE_WORK_PERMIT_DURATION_MONTHS);

  // 3. Low-Wage Stream in High Unemployment CMA (>= 6.0%) -> Subject to ESDC processing freeze
  const lowWageFrozen = evaluateForeignWorkerTransition({
    wagePerHour: 20.0,
    provincialMedianWage: 28.39,
    employerLocationCma: 'Calgary',
    cmaUnemploymentRate: 6.8,
    sector: 'hospitality'
  });
  assert.equal(lowWageFrozen.streamClassification.stream, 'LOW_WAGE_STREAM');
  assert.equal(lowWageFrozen.lmiaAudit.isSubjectToCmaFreeze, true);
  assert.ok(lowWageFrozen.lmiaAudit.risksAndBars.some(r => r.includes('ESDC REFUSAL TO PROCESS')));

  // 4. Alternative pathway recommendation for Francophone candidate
  const francophoneCandidate = evaluateForeignWorkerTransition({
    wagePerHour: 20.0,
    hasFrenchProficiencyNclc5: true
  });
  assert.ok(francophoneCandidate.viablePathways.some(p => p.pathwayName.includes('Francophone Mobility')));
});

test('Rec 634: Canadian Franchise Disclosure & Arthur Wishart Act Engine — 2-year rescission & statutory restitution', () => {
  // 1. Safe default handling on null
  const nullResult = evaluateFranchiseDisclosure(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.rescissionAnalysis.canRescindNow, false);

  // 2. Fully compliant disclosure delivered 21 days prior to agreement
  const compliant = evaluateFranchiseDisclosure({
    province: 'ON',
    agreementSignedDate: '2025-10-01',
    fddDeliveredDate: '2025-09-10', // 21 days before signing (>= 14)
    wasFddDeliveredAsSingleDocument: true,
    hasAuditedFinancialStatements: true,
    hasSignedFranchisorCertificate: true
  });
  assert.equal(compliant.rescissionAnalysis.canRescindNow, false);
  assert.equal(compliant.rescissionAnalysis.rescissionVerdict, 'COMPLIANT_DISCLOSURE');
  assert.equal(compliant.statutoryDamagesEstimate.totalRestitutionOwedCad, 0);

  // 3. Fatal defect: Missing franchisor certificate triggers 2-year absolute rescission and full restitution
  const fatalDefect = evaluateFranchiseDisclosure({
    province: 'ON',
    agreementSignedDate: '2025-06-01',
    fddDeliveredDate: '2025-05-15',
    hasSignedFranchisorCertificate: false, // Fatal defect under s. 5(6)
    initialFranchiseFeePaidCad: 50000,
    equipmentAndBuildoutCostCad: 200000,
    inventoryPurchasedAtCostCad: 30000,
    cumulativeOperatingLossesCad: 70000,
    assessmentDate: '2026-06-01' // 1 year later (well within 2-year window)
  });
  assert.equal(fatalDefect.rescissionAnalysis.canRescindNow, true);
  assert.equal(fatalDefect.rescissionAnalysis.rescissionVerdict, 'TWO_YEAR_ABSOLUTE_RESCISSION_ACTIVE');
  assert.equal(fatalDefect.statutoryDamagesEstimate.totalRestitutionOwedCad, 350000); // 50k + 200k + 30k + 70k
  assert.ok(fatalDefect.statutoryProtections.some(p => p.includes('s. 6(2)')));
});

test('Rec 635: Francophone Mobility Program Navigator — C16 geographic restrictions & TEER eligibility', () => {
  // 1. Safe default handling on null
  const nullResult = evaluateFrancophoneMobility(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.overallEligible, true);
  assert.equal(nullResult.lmiaExemptionCode, 'C16');

  // 2. Compliant candidate outside Quebec
  const compliant = evaluateFrancophoneMobility({
    province: 'ON',
    frenchTestType: 'tef_canada',
    nclcSpeaking: 6,
    nclcListening: 6,
    nocCode: '21232',
    nocTeer: 1,
    hasGenuineJobOffer: true,
    employerPaidComplianceFee: true
  });
  assert.equal(compliant.overallEligible, true);
  assert.equal(compliant.deficiencies.length, 0);

  // 3. Ineligible inside Quebec
  const quebec = evaluateFrancophoneMobility({
    province: 'QC'
  });
  assert.equal(quebec.overallEligible, false);
  assert.ok(quebec.deficiencies.some(d => d.includes('Employment destination is in Quebec')));

  // 4. Primary agriculture NOC exclusion
  const agriNoc = evaluateFrancophoneMobility({
    nocCode: '85100' // Livestock workers (primary agriculture)
  });
  assert.equal(agriNoc.overallEligible, false);
  assert.ok(agriNoc.deficiencies.some(d => d.includes('primary agriculture')));
});
