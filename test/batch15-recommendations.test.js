// test/batch15-recommendations.test.js
// Unit tests verifying Sweep 22 recommendations (Recs 291–305).

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  evaluateAtlanticImmigrationEligibility,
  AIP_CONSTANTS,
  ATLANTIC_PROVINCE_NAMES
} from '../src/atlantic-immigration-navigator.js';

import {
  evaluateFlagpolingFeasibility,
  CBSA_PORTS
} from '../src/border-flagpoling-navigator.js';

import {
  evaluateCriminalInadmissibilityAndRehab,
  generateRehabilitationActionPlan,
  REHAB_CONSTANTS,
  OFFENSE_EQUIVALENCY_TAXONOMY
} from '../src/criminal-rehabilitation-navigator.js';

import {
  evaluateRefugeeCessationRisk
} from '../src/federal-refugee-cessation-citizenship-audit-navigator.js';

import {
  evaluateSelfEmployedProgram,
  SELF_EMPLOYED_PASS_MARK_POINTS
} from '../src/federal-self-employed-persons-program-navigator.js';

import {
  evaluateFederalSkilledTradesProgram,
  isNocEligibleForSkilledTrades,
  FSTP_STATUTORY_RULES
} from '../src/federal-skilled-trades-navigator.js';

import {
  evaluateStartUpVisaEligibility,
  calculateSuvSettlementFunds,
  SUV_DESIGNATED_ENTITY_TYPES
} from '../src/federal-start-up-visa-designated-organization-navigator.js';

import {
  evaluateFederalVisitorExtensionAndRestoration,
  FEDERAL_VISITOR_STATUS_CONSTANTS
} from '../src/federal-visitor-record-extension-status-restoration-navigator.js';

import {
  evaluateDualIntentCompliance,
  DUAL_INTENT_CONSTANTS
} from '../src/federal-work-permit-dual-intent-assessment-navigator.js';

import {
  evaluateForeignWorkerPermitTransition,
  TFW_TRANSITION_RULES
} from '../src/foreign-worker-closed-permit-transition-navigator.js';

import {
  evaluateFranchiseDisclosure,
  generateFranchiseRescissionNotice,
  FRANCHISE_ACT_CONSTANTS,
  PROVINCIAL_FRANCHISE_ACTS
} from '../src/franchise-disclosure-navigator.js';

import {
  evaluateInternationallyTrainedNurse,
  IEN_CONSTANTS
} from '../src/internationally-trained-nurse-navigator.js';

import {
  evaluateManitobaEmploymentLeave,
  MANITOBA_SERVICE_REQUIREMENTS,
  MANITOBA_MAX_LEAVE_WEEKS
} from '../src/manitoba-employment-leave-job-protection-navigator.js';

import {
  evaluateManitobaPnpSkilledWorker,
  MPNP_CONSTANTS
} from '../src/manitoba-pnp-skilled-worker-navigator.js';

import {
  evaluateManitobaRentIncrease,
  MANITOBA_RENT_CONSTANTS
} from '../src/manitoba-residential-tenancy-rent-increase-guideline-navigator.js';

test('Rec 291: evaluateAtlanticImmigrationEligibility audits international graduates and skilled workers with input bounding', () => {
  const gradResult = evaluateAtlanticImmigrationEligibility({
    province: 'NS',
    stream: 'international_graduate',
    nocTeer: 1,
    clbLevel: 6,
    hasDesignatedEmployerJobOffer: true,
    isJobOfferFullTimeNonSeasonal: true,
    jobOfferDurationMonths: 24,
    hasAtlanticTwoYearCredential: true,
    monthsResidedInAtlanticDuringStudy: 18,
    familySize: 1,
    settlementFundsCad: 6000,
    candidateName: 'Maria Santos',
    assessmentDate: '2026-10-31'
  });

  assert.equal(gradResult.overallEligible, true);
  assert.equal(gradResult.province, 'NS');
  assert.equal(gradResult.candidateName, 'Maria Santos');
  assert.equal(gradResult.nocTeer, 1);
  assert.ok(gradResult.summaryTitle.includes('Nova Scotia'));
  assert.ok(gradResult.compliancePoints.some(p => p.includes('EXEMPT from prior work experience')));

  // Ineligible outside Atlantic provinces or insufficient language
  const ineligible = evaluateAtlanticImmigrationEligibility({
    province: 'ON',
    clbLevel: 3,
    nocTeer: 4,
    isPermanentJobOffer: false
  });
  assert.equal(ineligible.overallEligible, false);
  assert.ok(ineligible.deficiencies.length >= 2);
});

test('Rec 292: evaluateFlagpolingFeasibility audits PGWP border ban and maintained status risks', () => {
  // PGWP Flagpoling strictly barred under June 2024 policy
  const pgwpResult = evaluateFlagpolingFeasibility({
    permitCategory: 'pgwp',
    countryOfCitizenship: 'IN',
    portOfEntry: 'rainbow_bridge',
    dayOfWeek: 'Wednesday'
  });

  assert.equal(pgwpResult.determination, 'STRICTLY_BARRED');
  assert.equal(pgwpResult.pgwpBorderBanApplied, true);
  assert.ok(pgwpResult.legalBarriers.some(b => b.severity === 'STRICT_BAR'));

  // Maintained status extinguished upon border departure
  const maintainedResult = evaluateFlagpolingFeasibility({
    permitCategory: 'closed_work_permit',
    currentStatusInCanada: 'maintained_status',
    portOfEntry: 'peace_bridge',
    dayOfWeek: 'Wednesday',
    hasApprovedLmia: true,
    countryOfCitizenship: 'US'
  });

  assert.equal(maintainedResult.determination, 'HIGH_RISK_NOT_RECOMMENDED');
  assert.equal(maintainedResult.maintainedStatusAtRisk, true);
  assert.ok(maintainedResult.warnings.some(w => w.statute.includes('183(5)')));

  // Operating day check
  const wrongDayResult = evaluateFlagpolingFeasibility({
    permitCategory: 'closed_work_permit',
    currentStatusInCanada: 'valid_work_permit',
    portOfEntry: 'rainbow_bridge',
    dayOfWeek: 'Sunday',
    hasApprovedLmia: true,
    countryOfCitizenship: 'US'
  });
  assert.equal(wrongDayResult.determination, 'TEMPORARILY_BLOCKED');
});

test('Rec 293: evaluateCriminalInadmissibilityAndRehab audits Bill C-46 DUI serious criminality and deemed rehabilitation', () => {
  // Impaired driving (DUI) reclassified as serious criminality: deemed rehab statutorily barred
  const duiResult = evaluateCriminalInadmissibilityAndRehab({
    offenseType: 'impaired_driving_dui',
    sentenceCompletionDate: '2014-01-01',
    foreignCountry: 'US',
    convictionCount: 1,
    assessmentDate: '2026-10-31'
  });

  assert.equal(duiResult.rehabPathways.isDeemedRehabilitated, false);
  assert.equal(duiResult.rehabPathways.isEligibleForIndividualRehabilitation, true);
  assert.equal(duiResult.rehabPathways.governmentRehabFeeCad, REHAB_CONSTANTS.FEE_SERIOUS_REHAB_CAD);
  assert.ok(duiResult.riskWarnings.some(w => w.includes('DEEMED REHABILITATION BARRED')));

  // Non-serious offense > 10 years qualifies for Deemed Rehabilitation
  const theftResult = evaluateCriminalInadmissibilityAndRehab({
    offenseType: 'theft_under_5000',
    sentenceCompletionDate: '2012-05-01',
    convictionCount: 1,
    assessmentDate: '2026-10-31'
  });
  assert.equal(theftResult.rehabPathways.isDeemedRehabilitated, true);

  const plan = generateRehabilitationActionPlan({
    applicantName: 'John Doe',
    offenseName: 'Theft Under $5000',
    isDeemedRehabilitated: true
  });
  assert.ok(plan.includes('DEEMED REHABILITATED'));
});

test('Rec 294: evaluateRefugeeCessationRisk audits citizen shield, passport presumption, and PR loss under IRPA s. 46(1)(c.1)', () => {
  // Citizen Shield: Canadian citizens are immune from IRPA s. 108 cessation
  const citizenResult = evaluateRefugeeCessationRisk({
    hasAcquiredCanadianCitizenship: true,
    currentStatusInCanada: 'CANADIAN_CITIZEN'
  });
  assert.equal(citizenResult.isExemptFromIrpaCessation, true);
  assert.equal(citizenResult.legalStatusVerdict, 'CITIZEN_SHIELD_IMMUNE_FROM_IRPA_108');

  // PR who renewed home country passport triggers presumption of re-availment
  const riskResult = evaluateRefugeeCessationRisk({
    currentStatusInCanada: 'PERMANENT_RESIDENT',
    hasAcquiredCanadianCitizenship: false,
    hasAppliedForOrRenewedNationalPassport: true,
    traveledBackToCountryOfPersecution: true,
    numberOfTripsToCountryOfPersecution: 2,
    cumulativeDaysInCountryOfPersecution: 45,
    purposeOfTravel: 'LEISURE_VACATION',
    ministerHasFiledCessationApplication: true
  });

  assert.equal(riskResult.isExemptFromIrpaCessation, false);
  assert.equal(riskResult.cessationRiskLevel, 'CRITICAL');
  assert.equal(riskResult.legalVerdict, 'ACTIVE_MINISTERIAL_CESSATION_HEARING_DEFENSE_REQUIRED');
  assert.ok(riskResult.riskFactors.some(f => f.risk === 'PRESUMPTION_OF_REAVAILMENT_NATIONAL_PASSPORT'));
  assert.ok(riskResult.statutoryFindings.some(f => f.section.includes('46(1)(c.1)')));
});

test('Rec 295: evaluateSelfEmployedProgram audits 35-point pass mark, relevant experience, and ministerial pause', () => {
  const result = evaluateSelfEmployedProgram({
    activityType: 'CULTURAL_ACTIVITIES',
    yearsOfSelfEmployedExperience: 5,
    yearsOfWorldClassParticipation: 0,
    educationLevel: 'BACHELORS',
    applicantAge: 30,
    firstOfficialLanguageClb: 8,
    intendsAndAbleToBeSelfEmployed: true,
    willMakeSignificantContributionToCanada: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.pointsSummary.isPassMarkSatisfied, true);
  assert.ok(result.pointsSummary.totalPoints >= SELF_EMPLOYED_PASS_MARK_POINTS);
  assert.ok(result.riskWarnings.some(w => w.warning === 'MINISTERIAL_INSTRUCTIONS_INTAKE_PAUSE'));

  // Ineligible case: zero experience
  const failResult = evaluateSelfEmployedProgram({
    yearsOfSelfEmployedExperience: 0,
    yearsOfWorldClassParticipation: 0
  });
  assert.equal(failResult.isEligible, false);
  assert.ok(failResult.disqualifications.some(d => d.criterion === 'RELEVANT_EXPERIENCE_SHORTFALL'));
});

test('Rec 296: evaluateFederalSkilledTradesProgram audits trade NOCs, experience, Red Seal / job offer, and CLB benchmarks', () => {
  assert.equal(isNocEligibleForSkilledTrades('72410'), true);
  assert.equal(isNocEligibleForSkilledTrades('63200'), true);
  assert.equal(isNocEligibleForSkilledTrades('21231'), false); // Software engineer is not trade

  const result = evaluateFederalSkilledTradesProgram({
    nocCode: '72410',
    yearsOfTradesExperience: 3,
    hoursOfTradesExperience: 4500,
    hasCanadianCertificateOfQualification: true,
    certifyingProvince: 'ON',
    clbSpeaking: 5,
    clbListening: 5,
    clbReading: 4,
    clbWriting: 4,
    hasActiveExpressEntryProfile: true,
    candidateName: 'Alex Carpenter'
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityStatus, 'ELIGIBLE_FOR_FSTP');
  assert.equal(result.languageScores.isLanguageCompliant, true);
  assert.ok(result.compliancePoints.some(p => p.includes('Certificate of Qualification')));

  // Fails language benchmark (CLB Speaking < 5)
  const langFail = evaluateFederalSkilledTradesProgram({
    nocCode: '72410',
    yearsOfTradesExperience: 3,
    hoursOfTradesExperience: 4500,
    hasCanadianCertificateOfQualification: true,
    clbSpeaking: 4, // Below minimum 5
    clbListening: 5,
    clbReading: 4,
    clbWriting: 4,
    hasActiveExpressEntryProfile: true
  });
  assert.equal(langFail.isEligible, false);
  assert.ok(langFail.deficiencies.some(d => d.includes('Language benchmark shortfall')));
});

test('Rec 297: evaluateStartUpVisaEligibility audits designated entities, capital thresholds, 5-owner limit, and settlement funds', () => {
  assert.equal(calculateSuvSettlementFunds(1), 15263);
  assert.equal(calculateSuvSettlementFunds(2), 19001);
  assert.equal(calculateSuvSettlementFunds(8), 40392 + 4112);

  const suvResult = evaluateStartUpVisaEligibility({
    entityType: 'VENTURE_CAPITAL_FUND',
    hasCommitmentCertificate: true,
    hasLetterOfSupport: true,
    investmentAmountCad: 250000,
    numberOfCoOwnersApplying: 2,
    applicantVotingRightsPercentage: 25,
    jointVotingRightsPercentage: 65,
    clbSpeaking: 6,
    clbListening: 6,
    clbReading: 6,
    clbWriting: 6,
    availableSettlementFundsCad: 30000,
    familySize: 1,
    canadianIncorporationPlannedOrCompleted: true,
    activeOngoingManagementInCanada: true
  });

  assert.equal(suvResult.isEligible, true);
  assert.equal(suvResult.eligibilityVerdict, 'ELIGIBLE_FOR_START_UP_VISA_PERMANENT_RESIDENCE');
  assert.equal(suvResult.settlementFundsAudit.hasSufficientFunds, true);

  // Capital shortfall under VC fund (< $200k)
  const capitalFail = evaluateStartUpVisaEligibility({
    entityType: 'VENTURE_CAPITAL_FUND',
    hasCommitmentCertificate: true,
    hasLetterOfSupport: true,
    investmentAmountCad: 150000
  });
  assert.equal(capitalFail.isEligible, false);
  assert.ok(capitalFail.disqualifications.some(d => d.criterion === 'CAPITAL_SHORTFALL'));
});

test('Rec 298: evaluateFederalVisitorExtensionAndRestoration audits in-time extensions and 90-day restoration window', () => {
  // In-time extension provides maintained status under IRPR s. 183(5)
  const inTime = evaluateFederalVisitorExtensionAndRestoration({
    statusExpiryDate: '2026-12-01',
    applicationSubmissionDate: '2026-11-15',
    hasMetInitialStayConditions: true
  });
  assert.equal(inTime.isInTimeExtension, true);
  assert.equal(inTime.statusClassification, 'IN_TIME_EXTENSION_MAINTAINED_STATUS');
  assert.equal(inTime.isEligible, true);
  assert.equal(inTime.feeSchedule.totalFeesPayableCad, 100);

  // Expired 30 days ago: within 90-day restoration window
  const restoreResult = evaluateFederalVisitorExtensionAndRestoration({
    statusExpiryDate: '2026-10-01',
    applicationSubmissionDate: '2026-10-31',
    hasMetInitialStayConditions: true
  });
  assert.equal(restoreResult.isInTimeExtension, false);
  assert.equal(restoreResult.isWithin90DayRestorationWindow, true);
  assert.equal(restoreResult.statusClassification, 'ELIGIBLE_FOR_90_DAY_RESTORATION');
  assert.equal(restoreResult.feeSchedule.totalFeesPayableCad, 329); // 100 + 229

  // Expired 120 days ago: statutorily barred from restoration
  const barredResult = evaluateFederalVisitorExtensionAndRestoration({
    statusExpiryDate: '2026-06-01',
    applicationSubmissionDate: '2026-10-31'
  });
  assert.equal(barredResult.isPast90DayRestorationDeadline, true);
  assert.equal(barredResult.statusClassification, 'STATUTORILY_BARRED_FROM_RESTORATION');
  assert.equal(barredResult.isEligible, false);
});

test('Rec 299: evaluateDualIntentCompliance audits IRPA s. 22(2) legitimacy, home ties, and unlawful fettering', () => {
  // Compliant dual intent profile
  const result = evaluateDualIntentCompliance({
    temporaryApplicationType: 'WORK_PERMIT',
    hasActivePrApplicationOrProfile: true,
    prApplicationStream: 'EXPRESS_ENTRY_CEC',
    demonstratedIntentToRespectStayExpiry: true,
    hasTiesToCountryOfCitizenshipOrResidence: true,
    hasPreviousImmigrationComplianceRecord: true,
    hasSufficientSettlementFunds: true,
    officerRefusalBasedSolelyOnPrIntent: false
  });

  assert.equal(result.isDualIntentStatutorilyProtected, true);
  assert.equal(result.riskTier, 'LOW_REFUSAL_RISK');
  assert.equal(result.complianceStatus, 'COMPLIANT_DUAL_INTENT_STRUCTURE');

  // Officer refusal based solely on immigrant intent is unlawful under s. 22(2)
  const unlawfulResult = evaluateDualIntentCompliance({
    officerRefusalBasedSolelyOnPrIntent: true
  });
  assert.equal(unlawfulResult.complianceStatus, 'UNLAWFUL_REFUSAL_CONTRARY_TO_SECTION_22');
  assert.ok(unlawfulResult.actionableRemedies.some(r => r.action === 'FILE_FEDERAL_COURT_LEAVE_APPLICATION'));
});

test('Rec 300: evaluateForeignWorkerPermitTransition audits maintained status, interim work authorization, and unauthorized work', () => {
  // Transition in progress with interim authorization email received
  const approvedInterim = evaluateForeignWorkerPermitTransition({
    currentWorkPermitExpiryDate: '2026-11-30',
    currentDate: '2026-10-31',
    hasSubmittedNewWorkPermitApplication: true,
    hasPositiveLmiaOrExemption: true,
    hasReceivedIrccInterimAuthorizationEmail: true,
    newEmployerName: 'Apex Logistics Corp.'
  });

  assert.equal(approvedInterim.canLegallyWorkForNewEmployer, true);
  assert.equal(approvedInterim.legalVerdict, 'FULLY_AUTHORIZED_FOR_NEW_EMPLOYER');
  assert.equal(approvedInterim.newEmployerName, 'Apex Logistics Corp.');

  // Prematurely working for new employer before interim authorization is unauthorized work under s. 30
  const unauthorizedWork = evaluateForeignWorkerPermitTransition({
    currentWorkPermitExpiryDate: '2026-11-30',
    currentDate: '2026-10-31',
    hasSubmittedNewWorkPermitApplication: true,
    hasReceivedIrccInterimAuthorizationEmail: false,
    hasStartedWorkingForNewEmployer: true,
    currentEmployerName: 'Old Firm Inc.',
    newEmployerName: 'New Start Ltd.'
  });

  assert.equal(unauthorizedWork.canLegallyWorkForNewEmployer, false);
  assert.ok(unauthorizedWork.complianceViolations.includes('UNAUTHORIZED_WORK_UNDER_IRPA_30'));
  assert.equal(unauthorizedWork.legalVerdict, 'UNAUTHORIZED_WORK_VIOLATION_ACTION_REQUIRED');
});

test('Rec 301: evaluateFranchiseDisclosure audits Arthur Wishart Act fatal defects, 2-year absolute rescission, and damages', () => {
  // Fatal deficiency (missing franchisor certificate and missing audited financials): triggers 2-year absolute rescission
  const rescissionResult = evaluateFranchiseDisclosure({
    province: 'ON',
    agreementSignedDate: '2025-10-01',
    fddDeliveredDate: '2025-09-25',
    hasAuditedFinancialStatements: false,
    hasSignedFranchisorCertificate: false,
    initialFranchiseFeePaidCad: 45000,
    equipmentAndBuildoutCostCad: 150000,
    inventoryPurchasedAtCostCad: 20000,
    cumulativeOperatingLossesCad: 35000,
    franchiseeName: 'Maple Donuts Inc.',
    assessmentDate: '2026-10-31'
  });

  assert.equal(rescissionResult.disclosureAudit.isFatallyDefective, true);
  assert.equal(rescissionResult.rescissionAnalysis.canRescindNow, true);
  assert.equal(rescissionResult.rescissionAnalysis.rescissionVerdict, 'TWO_YEAR_ABSOLUTE_RESCISSION_ACTIVE');
  assert.equal(rescissionResult.statutoryDamagesEstimate.totalRestitutionOwedCad, 250000); // 45k + 150k + 20k + 35k

  const notice = generateFranchiseRescissionNotice({
    franchiseeName: 'Maple Donuts Inc.',
    franchisorName: 'Global Donut Corp.',
    totalRestitutionCad: 250000
  });
  assert.ok(notice.includes('ARTHUR WISHART ACT s. 6'));
  assert.ok(notice.includes('$250000 CAD'));
});

test('Rec 302: evaluateInternationallyTrainedNurse audits NNAS expedited countries, currency of practice, and FARPACTA Canadian experience ban', () => {
  // Nurse from expedited country (Philippines) with currency and English proficiency
  const result = evaluateInternationallyTrainedNurse({
    countryOfEducation: 'Philippines',
    nursingDesignation: 'rn',
    yearsOfClinicalExperience: 6,
    yearsSinceLastClinicalPractice: 1,
    languageProficiencyRoute: 'ielts_academic',
    ieltsOverallScore: 7.5,
    targetProvince: 'ON',
    nurseName: 'Elena Cruz',
    interestedInSpepSupervisedPractice: true
  });

  assert.equal(result.nnasEvaluation.isExpeditedCountry, true);
  assert.ok(result.nnasEvaluation.estimatedTimeline.includes('5 business days'));
  assert.equal(result.regulatoryRequirements.isCurrencyOfPracticeMet, true);
  assert.equal(result.regulatoryRequirements.isLanguageProficiencyMet, true);
  assert.equal(result.regulatoryRequirements.qualifiesForTemporaryClass, true);
  assert.ok(result.statutoryProtections.some(p => p.includes('FARPACTA s. 10.2')));

  // Currency gap (> 3 years) triggers SPEP/bridging warning
  const gapResult = evaluateInternationallyTrainedNurse({
    countryOfEducation: 'India',
    yearsSinceLastClinicalPractice: 5
  });
  assert.equal(gapResult.regulatoryRequirements.isCurrencyOfPracticeMet, false);
  assert.ok(gapResult.riskWarnings.some(w => w.includes('CURRENCY OF PRACTICE GAP')));
});

test('Rec 303: evaluateManitobaEmploymentLeave audits statutory leave durations, paid interpersonal violence leave, and reprisal protections', () => {
  // Maternity leave: 7 months service requirement, up to 17 weeks
  const matResult = evaluateManitobaEmploymentLeave({
    leaveType: 'MATERNITY',
    monthsOfContinuousService: 9,
    weeksRequested: 17,
    hasMedicalCertificateProvided: true
  });

  assert.equal(matResult.isEligibleForLeave, true);
  assert.equal(matResult.complianceStatus, 'STATUTORILY_COMPLIANT');

  // Interpersonal Violence Leave: 5 paid days funded by employer
  const violenceResult = evaluateManitobaEmploymentLeave({
    leaveType: 'INTERPERSONAL_VIOLENCE',
    daysOfContinuousService: 120,
    interpersonalViolenceDaysRequested: 5,
    regularHourlyWageCad: 25,
    regularWeeklyHours: 40
  });

  assert.equal(violenceResult.isEligibleForLeave, true);
  assert.equal(violenceResult.leaveAudit.paidDaysEntitlement, 5);
  assert.equal(violenceResult.leaveAudit.statutoryPaidLeaveCompensationCad, 1000); // 5 days * 8 hrs * $25

  // Reprisal / unlawful termination under s. 60(2)
  const reprisalResult = evaluateManitobaEmploymentLeave({
    leaveType: 'MATERNITY',
    monthsOfContinuousService: 8,
    employerDismissedOrDisciplinedEmployee: true
  });
  assert.equal(reprisalResult.complianceStatus, 'STATUTORY_DEFICIENCY_DETECTED');
  assert.ok(reprisalResult.statutoryViolations.some(v => v.violation === 'STATUTORY_REPRISAL_AND_UNLAWFUL_TERMINATION'));
});

test('Rec 304: evaluateManitobaPnpSkilledWorker computes 1,000-point EOI score, out-of-province grad rules, and regional bonuses', () => {
  const result = evaluateManitobaPnpSkilledWorker({
    monthsWorkedInManitoba: 8,
    isOutOfProvinceGraduate: false,
    hasPermanentManitobaJobOffer: true,
    firstLanguageClb: 8,
    candidateAge: 30,
    totalYearsOfWorkExperience: 4,
    highestEducationLevel: 'bachelors_degree',
    isJobLocatedOutsideWinnipeg: true,
    hasPastStudyInAnotherProvince: false,
    hasPastWorkInAnotherProvince: false,
    candidateName: 'Vikram Singh'
  });

  assert.equal(result.isStreamEligible, true);
  assert.equal(result.streamVerdict, 'QUALIFIES_FOR_SKILLED_WORKER_IN_MANITOBA');
  assert.ok(result.eoiScoreSummary.totalEoiPoints > 700);
  assert.equal(result.eoiScoreSummary.pointsAdaptability, 550); // 500 MB work + 50 regional

  // Out of province graduate requires 12 months (has 8 -> fails baseline duration)
  const oopResult = evaluateManitobaPnpSkilledWorker({
    monthsWorkedInManitoba: 8,
    isOutOfProvinceGraduate: true,
    hasPermanentManitobaJobOffer: true,
    hasPastStudyInAnotherProvince: true
  });
  assert.equal(oopResult.isStreamEligible, false);
  assert.equal(oopResult.employmentAudit.requiredMonths, 12);
  assert.equal(oopResult.eoiScoreSummary.riskDeductions, -100);
});

test('Rec 305: evaluateManitobaRentIncrease audits annual guideline percentage, 3-month notice, Form 2, and high-rent exemption', () => {
  // Compliant 3.0% rent increase with Form 2 and 3 months notice
  const compliant = evaluateManitobaRentIncrease({
    currentMonthlyRentCad: 1200,
    proposedMonthlyRentCad: 1236, // 3.0% increase ($36)
    noticeMonthsGiven: 3,
    monthsSinceLastRentIncrease: 12,
    usedPrescribedForm2: true,
    hasApprovedAgiOrderFromRtb: false,
    buildingFirstOccupiedYear: 1995
  });

  assert.equal(compliant.complianceStatus, 'COMPLIANT_RENT_INCREASE');
  assert.equal(compliant.percentageIncrease, 3.0);
  assert.equal(compliant.statutoryViolations.length, 0);

  // Unlawful: 8.33% increase ($100 on $1200) without approved AGI, only 1 month notice, no Form 2
  const illegal = evaluateManitobaRentIncrease({
    currentMonthlyRentCad: 1200,
    proposedMonthlyRentCad: 1300,
    noticeMonthsGiven: 1, // Short notice
    monthsSinceLastRentIncrease: 6, // Under 12 months
    usedPrescribedForm2: false, // Informal note
    hasApprovedAgiOrderFromRtb: false
  });

  assert.equal(illegal.complianceStatus, 'UNLAWFUL_RENT_INCREASE');
  assert.ok(illegal.statutoryViolations.length >= 3);
  assert.ok(illegal.statutoryViolations.some(v => v.rule === 'UNAUTHORIZED_ABOVE_GUIDELINE_INCREASE'));
  assert.ok(illegal.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_NOTICE_PERIOD_UNDER_3_MONTHS'));

  // High-rent exemption: units >= $1,615/mo are exempt from annual guideline
  const highRentExempt = evaluateManitobaRentIncrease({
    currentMonthlyRentCad: 1800,
    proposedMonthlyRentCad: 1950,
    noticeMonthsGiven: 3,
    monthsSinceLastRentIncrease: 12,
    usedPrescribedForm2: true
  });
  assert.equal(highRentExempt.isHighRentExempt, true);
  assert.equal(highRentExempt.isExemptFromGuideline, true);
  assert.equal(highRentExempt.complianceStatus, 'COMPLIANT_RENT_INCREASE');
});
