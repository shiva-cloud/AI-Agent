import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluatePgwpEligibility, generatePgwpDocumentRoadmap } from '../src/pgwp-eligibility-navigator.js';
import { evaluatePrCardRenewalUrgent } from '../src/pr-card-renewal-urgent-navigator.js';
import { evaluatePrMatrix } from '../src/pr-matrix-simulator.js';
import { evaluatePrResidencyObligation } from '../src/pr-residency-navigator.js';
import { evaluatePrtdHumanitarian } from '../src/pr-travel-document-humanitarian-navigator.js';
import { evaluateQuebecCsqSkilledWorker, QUEBEC_CSQ_GRID_CONSTANTS } from '../src/quebec-csq-skilled-worker-arrima-navigator.js';
import { evaluateQuebecPeqTemporaryWorker } from '../src/quebec-peq-temporary-worker-navigator.js';
import { evaluateRuralRenewalEligibility } from '../src/rural-renewal-navigator.js';
import { evaluateSaskatchewanLayoffNotice } from '../src/saskatchewan-employment-layoff-notice-severance-navigator.js';
import { evaluateSinpTechTalent } from '../src/saskatchewan-immigrant-nominee-tech-talent-navigator.js';
import { evaluateSaskatchewanSecurityDepositReturn } from '../src/saskatchewan-residential-tenancy-security-deposit-return-navigator.js';
import { evaluateSinpHardToFillSkills } from '../src/saskatchewan-sinp-hard-to-fill-navigator.js';
import { calculateSchengenStay } from '../src/schengen-calculator.js';
import { generateSettlementJourney } from '../src/settlement-journey.js';
import { calculateSeveranceAndNotice } from '../src/severance-bardal-calculator.js';

// Rec 471: PGWP Eligibility Navigator
test('Rec 471: evaluatePgwpEligibility enforces field alignment, language thresholds and 180-day deadline', () => {
  const uni = evaluatePgwpEligibility({
    credentialLevel: 'bachelor_degree',
    programLengthMonths: 36,
    clbLevel: 7,
    studyPermitApplicationDate: '2025-01-15',
    fieldOfStudyCategory: 'business',
    applicantName: 'Elena Rostova',
    institutionName: 'University of Toronto'
  });
  assert.equal(uni.eligibleForPgwp, true);
  assert.equal(uni.estimatedPgwpDurationMonths, 36);
  assert.equal(uni.applicantName, 'Elena Rostova');
  assert.equal(uni.fieldOfStudyAudit.fieldRequirementApplies, false);

  const diploma = evaluatePgwpEligibility({
    credentialLevel: 'college_diploma',
    programLengthMonths: 24,
    clbLevel: 6,
    studyPermitApplicationDate: '2025-02-01',
    fieldOfStudyCategory: 'business',
    applicantName: 'Carlos Silva'
  });
  assert.equal(diploma.eligibleForPgwp, false);
  assert.ok(diploma.rejectionRisks.some(r => r.includes('national shortage category')));

  const roadmap = generatePgwpDocumentRoadmap({ applicantName: 'Elena Rostova', estimatedMonths: 36 });
  assert.ok(roadmap.includes('Elena Rostova'));
  assert.ok(roadmap.includes('36 Months'));
});

// Rec 472: PR Card Renewal Urgent Navigator
test('Rec 472: evaluatePrCardRenewalUrgent evaluates physical presence, foreign spousal credit and urgent travel', () => {
  const res = evaluatePrCardRenewalUrgent({
    daysInCanadaLast5Years: 500,
    daysAbroadAccompanyingCitizenSpouse: 250,
    hasUrgentTravelNeed: true,
    travelDepartureDaysFromNow: 45,
    urgentReasonCategory: 'urgent_employment',
    hasProofOfTravel: true,
    hasSupportingUrgentProof: true,
    isCurrentlyInsideCanada: true,
    applicantName: 'Tariq Mansour'
  });
  assert.equal(res.applicantName, 'Tariq Mansour');
  assert.equal(res.residencyAssessment.residencyObligationMet, true);
  assert.equal(res.residencyAssessment.totalCreditedDays, 750);
  assert.equal(res.urgentProcessing.qualifiesForUrgentProcessing, true);
  assert.equal(res.applicationPathway.recommendedForm, 'IMM 5444');
});

// Rec 473: PR Matrix Simulator
test('Rec 473: evaluatePrMatrix resiliently handles inputs and generates comparative country scores', () => {
  const nullRes = evaluatePrMatrix(null);
  assert.ok(nullRes.applicantProfile);
  assert.ok(nullRes.evaluations.length >= 1);
  assert.ok(nullRes.topRecommendedCorridor);

  const custom = evaluatePrMatrix({
    applicantName: 'Priya Patel',
    age: 29,
    educationLevel: 'masters',
    yearsExperience: 5,
    clbScore: 9,
    hasJobOffer: false,
    hasSecondaryLanguage: true,
    targetCorridors: ['CA', 'AU', 'DE']
  });
  assert.equal(custom.applicantName, 'Priya Patel');
  assert.equal(custom.evaluations.length, 3);
  const ca = custom.evaluations.find(e => e.corridor === 'CA');
  assert.ok(ca);
  assert.equal(ca.competitivenessTier, 'HIGH_COMPETITIVENESS');
});

// Rec 474: PR Residency Navigator
test('Rec 474: evaluatePrResidencyObligation audits Section 28 compliance and overseas exemptions', () => {
  const res = evaluatePrResidencyObligation({
    prLandingDate: '2021-06-01',
    prCardExpiryDate: '2026-06-01',
    assessmentDate: '2025-06-01',
    physicalDaysInsideCanada: 600,
    overseasDaysWithCitizenSpouse: 150,
    applicantName: 'Sora Tanaka'
  });
  assert.equal(res.applicantName, 'Sora Tanaka');
  assert.equal(res.residencyDayAudit.hasMet730DaysObligation, true);
  assert.equal(res.residencyDayAudit.totalCreditedResidencyDays, 750);
  assert.equal(res.complianceStatus, 'FULLY_COMPLIANT');
  assert.ok(res.statutoryAuthority.includes('Immigration and Refugee Protection Act'));
});

// Rec 475: PR Travel Document Humanitarian Navigator
test('Rec 475: evaluatePrtdHumanitarian calculates H&C merits and 365-day in-person appeal travel document right', () => {
  const res = evaluatePrtdHumanitarian({
    daysPhysicallyInCanadaLast5Years: 400,
    reasonForAbsenceCategory: 'care_for_critically_ill_family',
    hasDocumentaryProofOfCompellingCircumstance: true,
    yearsResidedInCanadaPriorToAbsence: 5,
    filedCanadianTaxesConsecutively: true,
    hasMinorCanadianChildrenAffected: true,
    applicantName: 'Amara Okafor'
  });
  assert.equal(res.applicantName, 'Amara Okafor');
  assert.equal(res.appealRights.qualifiesForMandatoryInPersonTravelDocument, true);
  assert.ok(res.humanitarianAssessment.hcScore >= 60);
  assert.ok(res.appealRights.statutoryAppealRight.includes('60 calendar days'));
});

// Rec 476: Quebec CSQ Skilled Worker Arrima Navigator
test('Rec 476: evaluateQuebecCsqSkilledWorker scores selection grid and audits Niveau 7 oral French pass mark', () => {
  const eligible = evaluateQuebecCsqSkilledWorker({
    applicantAge: 29,
    educationLevel: 'master_degree',
    monthsOfQualifiedExperience: 36,
    frenchOralListeningNiveau: 8,
    frenchOralSpeakingNiveau: 8,
    hasQuebecStudyOrWorkStay: true,
    signedFinancialAutonomyContract: true,
    candidateName: 'Mathieu Tremblay'
  });
  assert.equal(eligible.candidateName, 'Mathieu Tremblay');
  assert.equal(eligible.meetsMandatoryFrenchOralThreshold, true);
  assert.equal(eligible.meetsPointsThreshold, true);
  assert.equal(eligible.isEligible, true);
  assert.ok(eligible.totalScore >= QUEBEC_CSQ_GRID_CONSTANTS.PASS_MARK_SINGLE_APPLICANT);

  const lowFrench = evaluateQuebecCsqSkilledWorker({
    frenchOralListeningNiveau: 5,
    frenchOralSpeakingNiveau: 5
  });
  assert.equal(lowFrench.meetsMandatoryFrenchOralThreshold, false);
  assert.equal(lowFrench.isEligible, false);
});

// Rec 477: Quebec PEQ Temporary Worker Navigator
test('Rec 477: evaluateQuebecPeqTemporaryWorker audits 24-month work requirement and Niveau 7 French', () => {
  const eligible = evaluateQuebecPeqTemporaryWorker({
    monthsWorkedInQuebec: 28,
    weeklyHoursWorked: 37.5,
    jobTeerLevel: 1,
    isCurrentlyEmployedInQuebec: true,
    hasValidWorkPermitStatus: true,
    principalOralFrenchLevel: 7,
    hasCompletedValuesAttestation: true,
    applicantName: 'Chloe Dubois'
  });
  assert.equal(eligible.applicantName, 'Chloe Dubois');
  assert.equal(eligible.isEligible, true);
  assert.equal(eligible.principalFrenchOral.isCompliant, true);

  const ineligible = evaluateQuebecPeqTemporaryWorker({
    monthsWorkedInQuebec: 18,
    principalOralFrenchLevel: 6
  });
  assert.equal(ineligible.isEligible, false);
  assert.ok(ineligible.deficiencies.length >= 2);
});

// Rec 478: Rural Renewal Navigator
test('Rec 478: evaluateRuralRenewalEligibility validates community endorsement and entrepreneur net worth benchmarks', () => {
  const worker = evaluateRuralRenewalEligibility({
    streamType: 'rural_renewal',
    selectedCommunity: 'brooks',
    hasCommunityEndorsementLetter: true,
    hasGenuineJobOffer: true,
    jobNocTeer: 2,
    clbLevel: 5,
    hasHighSchoolOrEca: true,
    monthsWorkExperiencePast18Months: 15,
    liquidSettlementFundsCad: 25000,
    applicantName: 'Vikram Singh'
  });
  assert.equal(worker.applicantName, 'Vikram Singh');
  assert.equal(worker.overallEligible, true);
  assert.ok(worker.compliancePoints.some(p => p.includes('Brooks')));

  const entrepreneur = evaluateRuralRenewalEligibility({
    streamType: 'rural_entrepreneur',
    selectedCommunity: 'taber',
    hasCommunityEndorsementLetter: true,
    hasCompletedCommunityExploratoryVisit: true,
    netWorthCad: 400000,
    plannedInvestmentCad: 150000,
    plannedOwnershipPercent: 60,
    jobsCreatedCount: 2,
    applicantName: 'Hans Mueller'
  });
  assert.equal(entrepreneur.overallEligible, true);
  assert.ok(entrepreneur.compliancePoints.some(p => p.includes('300k') || p.includes('Net worth')));
});

// Rec 479: Saskatchewan Employment Layoff Notice & Severance Navigator
test('Rec 479: evaluateSaskatchewanLayoffNotice enforces s. 2-60 individual notice and s. 2-62 group termination', () => {
  const individual = evaluateSaskatchewanLayoffNotice({
    yearsOfContinuousService: 6,
    regularWeeklyWageCad: 1000,
    actualNoticeWeeksGiven: 2,
    employeeName: 'Sarah Jenkins'
  });
  assert.equal(individual.employeeName, 'Sarah Jenkins');
  assert.equal(individual.noticeCalculation.statutoryNoticeWeeksEntitled, 6);
  assert.equal(individual.noticeCalculation.statutoryPayInLieuEntitledCad, 4000);

  const group = evaluateSaskatchewanLayoffNotice({
    yearsOfContinuousService: 3,
    regularWeeklyWageCad: 1200,
    employeesTerminatedIn4WeekWindow: 65,
    actualNoticeWeeksGiven: 0
  });
  assert.equal(group.isGroupTerminationApplicable, true);
  assert.equal(group.noticeCalculation.statutoryNoticeWeeksEntitled, 8);
  assert.equal(group.noticeCalculation.statutoryPayInLieuEntitledCad, 9600);
});

// Rec 480: Saskatchewan SINP Tech Talent Navigator
test('Rec 480: evaluateSinpTechTalent checks authorized NOCs, Job Approval Letter and APEGS requirements', () => {
  const dev = evaluateSinpTechTalent({
    nocCode: '21232',
    hasSinpJobApprovalLetter: true,
    isPermanentFullTimeOffer: true,
    isCurrentlyWorkingInSaskatchewan: true,
    monthsWorkedInSaskWithEmployer: 6,
    clbScore: 7,
    candidateName: 'Aarav Sharma'
  });
  assert.equal(dev.candidateName, 'Aarav Sharma');
  assert.equal(dev.isEligible, true);
  assert.equal(dev.criteriaEvaluated.length >= 3, true);

  const engineer = evaluateSinpTechTalent({
    nocCode: '21310',
    hasSinpJobApprovalLetter: true,
    hasApegsLicensureOrEligibilityLetter: false
  });
  assert.equal(engineer.isEligible, false);
  assert.ok(engineer.disqualifications.some(d => d.criterion === 'APEGS_LICENSURE_MISSING'));
});

// Rec 481: Saskatchewan Residential Tenancy Security Deposit Return Navigator
test('Rec 481: evaluateSaskatchewanSecurityDepositReturn enforces 1-month deposit cap and 7-day forfeiture', () => {
  const overcharge = evaluateSaskatchewanSecurityDepositReturn({
    monthlyRentCad: 1200,
    securityDepositPaidCad: 1500,
    tenancyEnded: false,
    tenantName: 'David Lee'
  });
  assert.equal(overcharge.tenantName, 'David Lee');
  assert.equal(overcharge.financialSummary.excessDepositPaidCad, 300);
  assert.ok(overcharge.statutoryViolations.some(v => v.rule === 'SECURITY_DEPOSIT_EXCEEDS_ONE_MONTH_RENT'));

  const forfeiture = evaluateSaskatchewanSecurityDepositReturn({
    monthlyRentCad: 1400,
    securityDepositPaidCad: 1400,
    tenancyEnded: true,
    businessDaysSinceTenancyEnded: 10,
    landlordServedPrescribedForm13: false
  });
  assert.equal(forfeiture.landlordForfeitedRightToClaim, true);
  assert.equal(forfeiture.financialSummary.balanceOwedToTenantCad, 1400);
  assert.ok(forfeiture.legalVerdict.includes('All claim rights forfeited'));
});

// Rec 482: Saskatchewan SINP Hard-to-Fill Skills Navigator
test('Rec 482: evaluateSinpHardToFillSkills audits 6-month continuous employment and designated TEER 4/5 NOCs', () => {
  const valid = evaluateSinpHardToFillSkills({
    nocCode: '65200',
    workExperienceMonthsInSaskatchewan: 8,
    languageClbLevel: 4,
    hasSaskatchewanJobApprovalLetter: true,
    hasPermanentFullTimeOffer: true,
    highestEducation: 'secondary_school',
    hasEducationalCredentialAssessment: true,
    teerLevel: 5,
    isValidWorkPermitHeld: true,
    applicantName: 'Gurpreet Kaur'
  });
  assert.equal(valid.applicantName, 'Gurpreet Kaur');
  assert.equal(valid.isEligible, true);
  assert.equal(valid.deficiencies.length, 0);

  const missingJal = evaluateSinpHardToFillSkills({
    nocCode: '65200',
    hasSaskatchewanJobApprovalLetter: false
  });
  assert.equal(missingJal.isEligible, false);
  assert.ok(missingJal.deficiencies.some(d => d.rule.includes('Job Approval Letter')));
});

// Rec 483: Schengen 90/180-Day Calculator
test('Rec 483: calculateSchengenStay enforces Regulation (EU) 2016/399 90/180 rolling window and overstay alerts', () => {
  const compliant = calculateSchengenStay({
    travelerName: 'Kenji Sato',
    checkDate: '2026-07-01',
    stays: [
      { entryDate: '2026-02-01', exitDate: '2026-02-28' }, // 28 days
      { entryDate: '2026-04-01', exitDate: '2026-04-30' }  // 30 days
    ],
    plannedStayDays: 15
  });
  assert.equal(compliant.travelerName, 'Kenji Sato');
  assert.equal(compliant.daysSpentInWindow, 58);
  assert.equal(compliant.daysRemaining, 32);
  assert.equal(compliant.isOverstay, false);
  assert.equal(compliant.canStayForPlannedDays, true);

  const overstay = calculateSchengenStay({
    checkDate: '2026-05-31',
    stays: [
      { entryDate: '2026-01-01', exitDate: '2026-04-05' } // 95 days
    ]
  });
  assert.equal(overstay.isOverstay, true);
  assert.ok(overstay.overstayDays > 0);
  assert.equal(overstay.status, 'overstay');
});

// Rec 484: Settlement Journey Roadmap Generator
test('Rec 484: generateSettlementJourney computes chronological phases and statutory newcomer milestones', () => {
  const journey = generateSettlementJourney('pr_express_entry', 'Vancouver', '2026-09-01', 'Fatima Al-Hassan');
  assert.equal(journey.newcomerName, 'Fatima Al-Hassan');
  assert.equal(journey.city, 'Vancouver');
  assert.equal(journey.landingDate, '2026-09-01');
  assert.ok(journey.phases.length >= 5);

  const arrivalPhase = journey.phases.find(p => p.id === 'arrival_day');
  assert.ok(arrivalPhase);
  assert.ok(arrivalPhase.items.some(i => i.authority.includes('PCMLTFA')));

  const firstWeek = journey.phases.find(p => p.id === 'first_week');
  assert.ok(firstWeek);
  assert.ok(firstWeek.items.some(i => i.authority.includes('Bank Act')));
});

// Rec 485: Severance & Bardal Calculator
test('Rec 485: calculateSeveranceAndNotice calculates ESA minimums and common law Bardal notice', () => {
  const seniorExec = calculateSeveranceAndNotice({
    employeeAge: 52,
    yearsOfService: 10,
    annualSalaryCad: 140000,
    employmentRole: 'executive',
    employerPayrollOver2Point5Million: true,
    hasSignedEnforceableEsaOnlyClause: false,
    availabilityOfSimilarJobs: 'scarce',
    applicantName: 'Robert Vance'
  });
  assert.equal(seniorExec.applicantName, 'Robert Vance');
  assert.equal(seniorExec.statutoryMinimumEntitlement.noticePeriodWeeks, 8);
  assert.equal(seniorExec.statutoryMinimumEntitlement.severancePayWeeks, 10);
  assert.ok(seniorExec.commonLawEntitlement.estimatedNoticePeriodMonths >= 12);
  assert.ok(seniorExec.commonLawEntitlement.potentialSeveranceGainDeltaCad > 0);

  const juniorShortService = calculateSeveranceAndNotice({
    employeeAge: 25,
    yearsOfService: 2,
    annualSalaryCad: 50000,
    employerPayrollOver2Point5Million: false
  });
  assert.equal(juniorShortService.statutoryMinimumEntitlement.noticePeriodWeeks, 2);
  assert.equal(juniorShortService.statutoryMinimumEntitlement.severancePayWeeks, 0);
});
