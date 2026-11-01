/**
 * Test Suite: Batch 16 Platform Recommendations (Recs 306–320)
 *
 * Validates hardening, input boundary sanitization, resilient date parsing,
 * and statutory compliance audits across Sweep 23 modules.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { evaluateNbpnpSkilledWorker, calculateNbpnpSettlementFunds } from '../src/new-brunswick-provincial-nominee-skilled-worker-navigator.js';
import { evaluateNovaScotiaExperienceStream } from '../src/nova-scotia-experience-stream-navigator.js';
import { evaluateOasGisEligibility } from '../src/oas-gis-navigator.js';
import { evaluateEsaConstructiveDismissalLayoff } from '../src/ontario-employment-constructive-dismissal-layoff-navigator.js';
import { auditOntarioPayTransparencyAndPosting } from '../src/ontario-employment-pay-equity-transparency-navigator.js';
import { evaluateOntarioPublicHolidayPay } from '../src/ontario-employment-public-holiday-pay-calculation-navigator.js';
import { evaluateOntarioRemoteWorkJurisdiction } from '../src/ontario-employment-remote-telework-jurisdiction-navigator.js';
import { evaluateOntarioEmploymentReprisal } from '../src/ontario-employment-reprisal-complaint-navigator.js';
import { calculateOntarioStatutorySeverance } from '../src/ontario-employment-severance-payroll-calculation-navigator.js';
import { auditOntarioThaLicensing } from '../src/ontario-employment-temp-help-agency-licensing-navigator.js';
import { auditOntarioTemporaryLayoff } from '../src/ontario-employment-temp-layoff-constructive-dismissal-navigator.js';
import { evaluateOntarioHousingCreedAccommodation } from '../src/ontario-human-rights-housing-creed-navigator.js';
import { evaluatePeiOccupationsInDemand } from '../src/pei-provincial-nominee-occupations-in-demand-navigator.js';
import { evaluatePetImportation } from '../src/pet-importation.js';
import { evaluatePrCardRenewalUrgent } from '../src/pr-card-renewal-urgent-navigator.js';

describe('Batch 16 Recommendations (Sweep 23: Recs 306–320)', () => {
  // Rec 306: NBPNP Skilled Worker Stream
  it('Rec 306: evaluateNbpnpSkilledWorker sanitizes inputs, points grid, and settlement funds', () => {
    const res = evaluateNbpnpSkilledWorker({
      applicantAge: 32,
      targetNocTeer: 2,
      firstLanguageClb: 8,
      educationLevel: 'BACHELORS',
      yearsOfRelatedExperience: 5,
      hasPermanentFullTimeJobOfferInNb: true,
      employerOperatedTwoYearsInNb: true,
      jobOfferWageMeetsMedian: true,
      currentlyWorkingInNb: false,
      liquidFundsCad: 20000,
      familySize: 2,
      candidateName: 'Jane Doe',
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.stream, 'NBPNP_SKILLED_WORKER');
    assert.equal(res.isEligible, true);
    assert.equal(res.candidateName, 'Jane Doe');
    assert.equal(res.assessmentDate, '2026-11-01');
    assert.ok(res.pointsSummary.totalPoints >= 60);
    assert.equal(calculateNbpnpSettlementFunds(1), 15263);
  });

  // Rec 307: Nova Scotia Experience Stream
  it('Rec 307: evaluateNovaScotiaExperienceStream validates physician & express entry tracks', () => {
    const res = evaluateNovaScotiaExperienceStream({
      stream: 'physician_stream',
      candidateAge: 35,
      nocCode: '31100',
      hasSignedReturnOfServiceWithNshOrIwk: true,
      hasCpsnsLicensureOrAssessment: true,
      hasIntentToResideInNovaScotia: true,
      candidateName: 'Dr. Smith',
      assessmentDate: 'invalid-date'
    });

    assert.equal(res.stream, 'physician_stream');
    assert.equal(res.isEligible, true);
    assert.equal(res.candidateName, 'Dr. Smith');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.jurisdiction, 'NS');
  });

  // Rec 308: OAS/GIS Navigator
  it('Rec 308: evaluateOasGisEligibility audits 40ths proration and totalization agreement', () => {
    const res = evaluateOasGisEligibility({
      ageYears: 68,
      yearsResidedInCanadaAfter18: 15,
      countryOfOrigin: 'US',
      yearsContributedToOriginSocialSecurity: 10,
      isCanadianCitizenOrLegalResident: true,
      livesInCanada: true,
      annualNetWorldIncomeCad: 15000,
      applicantName: 'Robert Vance'
    });

    assert.equal(res.oasAudit.eligibleForOas, true);
    assert.equal(res.oasAudit.totalizationApplied, true);
    assert.equal(res.oasAudit.fractionOfFullPension, '15/40');
    assert.equal(res.applicantName, 'Robert Vance');
    assert.ok(res.totalMonthlyBenefitCad > 0);
  });

  // Rec 309: Ontario Constructive Dismissal & Layoff
  it('Rec 309: evaluateEsaConstructiveDismissalLayoff identifies common law breach without contractual clause', () => {
    const res = evaluateEsaConstructiveDismissalLayoff({
      yearsOfService: 5,
      employeeAge: 40,
      annualSalaryCad: 70000,
      weeksOnLayoff: 12,
      hasContractualLayoffClause: false,
      employeeName: 'Sarah Jenkins',
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.isCommonLawConstructiveDismissal, true);
    assert.equal(res.employeeName, 'Sarah Jenkins');
    assert.equal(res.assessmentDate, '2026-11-01');
    assert.ok(res.commonLawNoticeEstimate.estimatedNoticeMonths >= 5);
  });

  // Rec 310: Ontario Pay Transparency & Posting Audit
  it('Rec 310: auditOntarioPayTransparencyAndPosting flags missing salary range and AI screening', () => {
    const res = auditOntarioPayTransparencyAndPosting({
      isPubliclyAdvertisedJobPosting: true,
      includesExpectedCompensationOrRange: false,
      usesAiToScreenApplicants: true,
      disclosesAiUsageInPosting: false,
      requiresCanadianWorkExperience: true,
      employerName: 'Acme Corp',
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.legalVerdict, 'NON_COMPLIANT_STATUTORY_BREACH');
    assert.ok(res.statutoryViolations.includes('MISSING_COMPENSATION_RANGE'));
    assert.ok(res.statutoryViolations.includes('UNDISCLOSED_AI_CANDIDATE_SCREENING'));
    assert.ok(res.statutoryViolations.includes('PROHIBITED_CANADIAN_EXPERIENCE_REQUIREMENT'));
    assert.equal(res.assessmentDate, '2026-11-01');
  });

  // Rec 311: Ontario Public Holiday Pay
  it('Rec 311: evaluateOntarioPublicHolidayPay computes 4-week lookback formula and premium hours', () => {
    const res = evaluateOntarioPublicHolidayPay({
      holidayName: 'GOOD_FRIDAY',
      regularWagesInPast4WeeksCad: 4000,
      vacationPayPayableInPast4WeeksCad: 160,
      workedShiftBeforeAndAfterHoliday: true,
      workedOnPublicHoliday: true,
      hoursWorkedOnHoliday: 8,
      regularHourlyWageCad: 25,
      holidayPayActuallyPaidCad: 100,
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.holidayName, 'GOOD_FRIDAY');
    assert.equal(res.isQualified, true);
    assert.equal(res.calculationSummary.statutoryPublicHolidayPayCad, 208); // (4000+160)/20 = 208
    assert.equal(res.calculationSummary.premiumHoursPayCad, 300); // 8 * 25 * 1.5 = 300
    assert.equal(res.calculationSummary.totalStatutoryEntitlementCad, 508);
    assert.equal(res.calculationSummary.wageDeficitCad, 408);
    assert.equal(res.assessmentDate, '2026-11-01');
  });

  // Rec 312: Ontario Remote Work Jurisdiction
  it('Rec 312: evaluateOntarioRemoteWorkJurisdiction applies s. 3(1) and Bill 79 remote headcount', () => {
    const res = evaluateOntarioRemoteWorkJurisdiction({
      employeePhysicalWorkLocation: 'ONTARIO',
      employerHeadquartersLocation: 'ALBERTA',
      worksExclusivelyFromHome: true,
      employerTotalOntarioHeadcount: 35,
      hasWrittenDisconnectingFromWorkPolicy: true,
      hasNonCompeteClauseInContract: false,
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.hasOntarioEsaJurisdiction, true);
    assert.equal(res.legalVerdict, 'ONTARIO_ESA_FULLY_APPLICABLE_AND_COMPLIANT');
    assert.equal(res.assessmentDate, '2026-11-01');
  });

  // Rec 313: Ontario Reprisal Complaint
  it('Rec 313: evaluateOntarioEmploymentReprisal enforces reverse onus under s. 74(2)', () => {
    const res = evaluateOntarioEmploymentReprisal({
      protectedActionTaken: 'INQUIRED_ABOUT_STATUTORY_RIGHTS',
      employerAdverseAction: 'TERMINATED_EMPLOYMENT',
      daysBetweenActionAndReprisal: 5,
      regularWeeklyWageCad: 1200,
      weeksOfLostIncome: 6,
      seeksJobReinstatement: true,
      employerName: 'Retail Services Inc',
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.complianceStatus, 'STATUTORY_REPRISAL_VIOLATION_CONFIRMED');
    assert.equal(res.isCloseTemporalProximity, true);
    assert.equal(res.remedySummary.lostWagesCad, 7200);
    assert.equal(res.remedySummary.totalMonetaryRemedyCad, 9200); // 7200 + 2000 distress
    assert.equal(res.remedySummary.reinstatementAvailable, true);
    assert.equal(res.assessmentDate, '2026-11-01');
  });

  // Rec 314: Ontario Statutory Severance Pay
  it('Rec 314: calculateOntarioStatutorySeverance audits 5-year tenure and $2.5M payroll threshold', () => {
    const res = calculateOntarioStatutorySeverance({
      completedYearsOfService: 7,
      additionalCompletedMonthsOfService: 6,
      regularWeeklyWageCad: 1000,
      employerOntarioAnnualPayrollCad: 3000000,
      isTerminatedForWilfulMisconduct: false,
      statutorySeveranceAlreadyPaidCad: 0,
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.isEligibleForSeverance, true);
    assert.equal(res.totalExactYearsOfService, 7.5);
    assert.equal(res.severanceCalculation.cappedSeveranceWeeks, 7.5);
    assert.equal(res.severanceCalculation.totalSeverancePayEntitledCad, 7500);
    assert.equal(res.assessmentDate, '2026-11-01');
  });

  // Rec 315: Ontario THA Licensing
  it('Rec 315: auditOntarioThaLicensing enforces joint liability and worker fee ban', () => {
    const res = auditOntarioThaLicensing({
      entityRole: 'CLIENT_EMPLOYER',
      isAgencyLicensedByMlitst: false,
      hasApplicationInProcessWithTransitionStatus: false,
      didAgencyChargeFeesToWorker: true,
      feeAmountChargedToWorkerCad: 500,
      hasUnpaidWagesOrOvertime: true,
      unpaidWagesAmountCad: 1500,
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.isLicensingLawful, false);
    assert.equal(res.complianceStatus, 'UNLAWFUL_NON_COMPLIANT_THA_OPERATION');
    assert.equal(res.penaltyAudit.isJointAndSeveralWageLiabilityApplicable, true);
    assert.equal(res.penaltyAudit.unpaidWagesOwedCad, 1500);
    assert.equal(res.penaltyAudit.illegalFeesCollectedCad, 500);
    assert.equal(res.assessmentDate, '2026-11-01');
  });

  // Rec 316: Ontario Temporary Layoff & Deemed Termination
  it('Rec 316: auditOntarioTemporaryLayoff triggers deemed termination at 14 weeks without benefits', () => {
    const res = auditOntarioTemporaryLayoff({
      layoffDurationWeeks: 14,
      employerContinuedHealthBenefits: false,
      hasValidWrittenLayoffClauseInContract: false,
      yearsOfService: 4,
      regularWeeklyWageCad: 1100,
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.isDeemedTerminatedUnderEsa, true);
    assert.equal(res.deemedTerminationGround, 'EXCEEDED_13_WEEKS_WITHOUT_BENEFIT_CONTINUATION');
    assert.equal(res.financialEntitlements.statutoryNoticeWeeks, 4);
    assert.equal(res.financialEntitlements.totalStatutoryPayOwingCad, 4400);
    assert.equal(res.assessmentDate, '2026-11-01');
  });

  // Rec 317: Ontario Human Rights Housing & Creed
  it('Rec 317: evaluateOntarioHousingCreedAccommodation audits balcony Sukkah religious protection', () => {
    const res = evaluateOntarioHousingCreedAccommodation({
      creedPracticeCategory: 'SUKKAH_STRUCTURE_ON_BALCONY',
      isSincerelyHeldBelief: true,
      landlordRefusedAccommodation: true,
      landlordRefusalGround: 'BUILDING_AESTHETICS',
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.isHumanRightsBreachDetected, true);
    assert.equal(res.legalVerdict, 'ACTIONABLE_CREED_DISCRIMINATION_HRTO');
    assert.equal(res.assessmentDate, '2026-11-01');
    assert.ok(res.actionableRemedies.length > 0);
  });

  // Rec 318: PEI Occupations in Demand Stream
  it('Rec 318: evaluatePeiOccupationsInDemand audits eligible NOCs, experience, and settlement funds', () => {
    const res = evaluatePeiOccupationsInDemand({
      nocCode: '33102',
      jobOfferFullTime: true,
      jobOfferPermanentOrTwoYears: true,
      employerOperatedTwoYearsInPei: true,
      hasValidWorkPermitOrAuthorization: true,
      monthsOfDirectExperienceInLastFiveYears: 18,
      applicantAge: 28,
      clbScore: 5,
      hasHighSchoolDiplomaOrEca: true,
      liquidFundsCad: 12000,
      familySize: 1,
      intendsToResideInPei: true,
      candidateName: 'Maria Garcia',
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.isEligible, true);
    assert.equal(res.eligibilityVerdict, 'ELIGIBLE_FOR_PEI_OCCUPATIONS_IN_DEMAND_NOMINATION');
    assert.equal(res.candidateName, 'Maria Garcia');
    assert.equal(res.assessmentDate, '2026-11-01');
  });

  // Rec 319: Pet Importation Engine
  it('Rec 319: evaluatePetImportation enforces Ontario pit bull ban and CFIA rabies rules', () => {
    // Dog entering Ontario with banned pit bull breed
    const bslRes = evaluatePetImportation({
      animalType: 'dog',
      destinationProvince: 'ON',
      dogBreed: 'pit_bull_terrier',
      petName: 'Rocky'
    });
    assert.equal(bslRes.isImportAdmissible, false);
    assert.equal(bslRes.admissibilityVerdict, 'STATUTORILY_INADMISSIBLE');
    assert.equal(bslRes.complianceChecklist.isOntarioBslCompliant, false);

    // Compliant Golden Retriever
    const validRes = evaluatePetImportation({
      animalType: 'dog',
      animalAgeMonths: 24,
      countryOfOrigin: 'US',
      destinationProvince: 'BC',
      dogBreed: 'golden_retriever',
      isVaccinatedForRabies: true,
      vaccinationDateDaysAgo: 100,
      hasOfficialRabiesCertificate: true,
      petName: 'Buddy',
      assessmentDate: '2026-11-01'
    });
    assert.equal(validRes.isImportAdmissible, true);
    assert.equal(validRes.admissibilityVerdict, 'STATUTORILY_ADMISSIBLE');
    assert.equal(validRes.petName, 'Buddy');
    assert.equal(validRes.asOf, '2026-11-01');
  });

  // Rec 320: PR Card Renewal Urgent Navigator
  it('Rec 320: evaluatePrCardRenewalUrgent audits 730-day presence and 90-day urgent threshold', () => {
    const res = evaluatePrCardRenewalUrgent({
      daysInCanadaLast5Years: 800,
      hasUrgentTravelNeed: true,
      travelDepartureDaysFromNow: 30,
      urgentReasonCategory: 'urgent_employment',
      hasProofOfTravel: true,
      hasSupportingUrgentProof: true,
      isCurrentlyInsideCanada: true,
      applicantName: 'Ahmed Khan',
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.residencyAssessment.residencyObligationMet, true);
    assert.equal(res.urgentProcessing.qualifiesForUrgentProcessing, true);
    assert.equal(res.applicationPathway.recommendedForm, 'IMM 5444');
    assert.equal(res.applicantName, 'Ahmed Khan');
    assert.equal(res.assessmentDate, '2026-11-01');
  });
});
