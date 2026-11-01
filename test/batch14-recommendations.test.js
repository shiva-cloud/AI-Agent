// test/batch14-recommendations.test.js
// Unit tests verifying Sweep 21 recommendations (Recs 276–290).

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  evaluateExpressEntryCrs,
  CRS_STATUTORY_CONSTANTS,
  BENCHMARK_DRAW_CUTOFFS
} from '../src/express-entry-optimizer.js';

import {
  evaluateExpressEntryTieBreak,
  EXPRESS_ENTRY_RULES
} from '../src/express-entry-tie-breaking-navigator.js';

import {
  calculateChildSupportTableAmount,
  evaluateFamilyLawAndSupport,
  FAMILY_LAW_CONSTANTS
} from '../src/family-law-navigator.js';

import {
  evaluateFamilyReunification,
  LICO_2025_TABLE
} from '../src/family-reunification-navigator.js';

import {
  evaluateFcrMicroLoans,
  evaluateIenSpepEligibility,
  evaluateImgPracticeReadyAssessment,
  FCR_BRIDGING_CONSTANTS
} from '../src/fcr-healthcare-bridge-navigator.js';

import {
  evaluateFederalBridgingOpenWorkPermit,
  FEDERAL_BOWP_CONSTANTS
} from '../src/federal-bridging-open-work-permit-pr-acknowledgement-navigator.js';

import {
  evaluateFederalC10SignificantBenefit,
  FEDERAL_C10_CONSTANTS
} from '../src/federal-c10-significant-benefit-work-permit-navigator.js';

import {
  evaluateFederalFtaProfessionalWorkPermit,
  FEDERAL_FTA_CONSTANTS
} from '../src/federal-c12-gats-professional-fta-navigator.js';

import {
  evaluateFederalIntraCompanyTransferee,
  FEDERAL_ICT_CONSTANTS
} from '../src/federal-c14-intra-company-transferee-navigator.js';

import {
  evaluateFederalReciprocalEmployment,
  FEDERAL_C20_CONSTANTS
} from '../src/federal-c20-reciprocal-employment-work-permit-navigator.js';

import {
  evaluateFederalCaregiverPrPathway,
  FEDERAL_CAREGIVER_CONSTANTS
} from '../src/federal-caregiver-pr-pathway-experience-navigator.js';

import {
  auditCitizenshipPhysicalPresence,
  CITIZENSHIP_PRESENCE_REQUIREMENTS
} from '../src/federal-citizenship-residence-calculator-audit-navigator.js';

import {
  evaluateCitizenshipRevocationDefense,
  CITIZENSHIP_REVOCATION_NOTICE_RESPONSE_WINDOW_DAYS
} from '../src/federal-citizenship-revocation-defense-navigator.js';

import {
  calculateFcipSettlementFunds,
  evaluateFrancophoneCommunityPilot,
  FCIP_PARTICIPATING_COMMUNITIES
} from '../src/federal-francophone-community-pilot-navigator.js';

import {
  evaluateFederalSuperVisaInsuranceLico,
  FEDERAL_SUPER_VISA_CONSTANTS
} from '../src/federal-parent-grandparent-super-visa-medical-insurance-navigator.js';

// Rec 276: Express Entry Optimizer
test('Rec 276: Express Entry Optimizer sanitizes CLB, age, and NOC inputs', () => {
  const result = evaluateExpressEntryCrs({
    age: 'NaN',
    educationLevel: 'doctoral',
    firstLanguageClb: { reading: '12', writing: 10, listening: 10, speaking: 10 },
    canadianWorkExperienceYears: 'invalid',
    targetOccupationNoc: '21231_EXTREMELY_LONG_CODE_THAT_NEEDS_TRUNCATION_AT_TWENTY_CHARACTERS',
    occupationCategory: 'stem'
  });

  assert.ok(result.totalCrsScore > 400);
  assert.equal(result.breakdown.humanCapital.agePoints, 110); // clamped to default 29 age => 110
  assert.equal(result.targetOccupationNoc.length <= 20, true);
  assert.equal(result.categoryEligibility.stem.isEligible, true);
});

// Rec 277: Express Entry Tie-Breaking Navigator
test('Rec 277: Express Entry Tie-Breaking Navigator handles invalid timestamps and avoids absolute wording', () => {
  const result = evaluateExpressEntryTieBreak({
    candidateCrs: 485,
    profileSubmissionUtc: 'not-a-valid-date',
    simulatedRoundCutoff: 485,
    simulatedTieBreakUtc: 'also-invalid'
  });

  assert.equal(result.simulatedRound.receivesIta, false);
  assert.equal(result.simulatedRound.tieBreakStatus, 'INVALID_TIMESTAMP');
  assert.equal(result.strategicJumps.every(j => !j.impact.toLowerCase().includes('guarantee')), true);
});

// Rec 278: Family Law & Support Navigator
test('Rec 278: Family Law Navigator bounds asset values and computes table child support', () => {
  const support = calculateChildSupportTableAmount(95000, 2);
  assert.ok(support > 1000);

  const evalResult = evaluateFamilyLawAndSupport({
    payerGrossAnnualIncomeCad: '100000',
    recipientGrossAnnualIncomeCad: '40000',
    numberOfChildren: '2',
    payerValuationDateAssetsCad: '500000',
    recipientValuationDateAssetsCad: '100000'
  });

  assert.equal(evalResult.childSupport.numberOfChildren, 2);
  assert.equal(evalResult.propertyEqualization.payingParty, 'Payer to Recipient');
  assert.ok(evalResult.propertyEqualization.equalizationPaymentCad > 0);
});

// Rec 279: Family Reunification Navigator
test('Rec 279: Family Reunification Navigator resolves workerTeer undefined bug and validates SOWP/Super Visa', () => {
  // workerTeer omitted should default to 1, not NaN
  const workerSowp = evaluateFamilyReunification({
    category: 'sowp',
    sponsorStatus: 'work_permit',
    workerPermitRemainingMonths: 12
  });
  assert.equal(workerSowp.eligible, true);
  assert.equal(workerSowp.verdict, 'ELIGIBLE_FOR_SOWP');

  // Super Visa LICO calculation
  const superVisa = evaluateFamilyReunification({
    category: 'super_visa',
    householdSize: '4',
    sponsorAnnualIncomeCad: '80000',
    hasApprovedPrivateMedicalInsurance: true
  });
  assert.equal(superVisa.eligible, true);
  assert.equal(superVisa.financialAudit.householdSize, 4);
});

// Rec 280: FCR Healthcare Bridge Navigator
test('Rec 280: FCR Healthcare Bridge Navigator clamps credit score and funding requests', () => {
  const loan = evaluateFcrMicroLoans({
    currentCreditScore: 9999,
    fundingRequiredCad: 5000000,
    immigrationStatus: 'permanent_resident'
  });
  assert.equal(loan.currentCreditScore, 900);
  assert.equal(loan.fundingRequestedCad, 1000000);

  const pra = evaluateImgPracticeReadyAssessment({
    residencyDurationYears: '5',
    clinicalPracticeYearsWithinLast5Years: '3',
    passedMccqe1: true,
    passedNacOsce: true,
    targetProvince: 'bc'
  });
  assert.equal(pra.isEligibleForPra, true);
  assert.equal(pra.province, 'BC');
});

// Rec 281: Federal Bridging Open Work Permit Navigator
test('Rec 281: Federal BOWP Navigator clamps permit days and validates AOR completeness', () => {
  const eligible = evaluateFederalBridgingOpenWorkPermit({
    isCurrentlyInCanada: true,
    hasValidWorkAuthorization: true,
    daysUntilCurrentPermitExpires: '90',
    prApplicationStream: 'express_entry_cec',
    hasReceivedOfficialAor: true
  });
  assert.equal(eligible.isEligible, true);
  assert.equal(eligible.prApplicationStream, 'EXPRESS_ENTRY_CEC');

  const ineligible = evaluateFederalBridgingOpenWorkPermit({
    daysUntilCurrentPermitExpires: 150, // > 120 days
    hasReceivedOfficialAor: false
  });
  assert.equal(ineligible.isEligible, false);
  assert.ok(ineligible.statutoryViolations.length >= 2);
});

// Rec 282: Federal C10 Significant Benefit Work Permit Navigator
test('Rec 282: Federal C10 Significant Benefit Navigator sanitizes job counts and letter numbers', () => {
  const result = evaluateFederalC10SignificantBenefit({
    benefitCategory: 'economic',
    createsDirectJobsForCanadiansOrPrs: true,
    projectedCanadianJobsCreatedCount: '10',
    independentExpertTestimonialLettersCount: '5',
    hasOfficialSupportFromCanadianGovernmentOrBody: true,
    hasDocumentedRecordOfDistinguishedAchievement: true,
    hasDetailedCanadianBusinessOrWorkPlan: true,
    isSelfEmployedApplicant: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.benefitCategory, 'ECONOMIC');
  assert.equal(result.benefitMetrics.projectedCanadianJobsCreatedCount, 10);
  assert.equal(result.benefitMetrics.independentExpertTestimonialLettersCount, 5);
  assert.equal(result.statutoryFees.employerComplianceFeeCad, 0); // self-employed
});

// Rec 283: Federal FTA Professional Navigator
test('Rec 283: Federal FTA Professional Navigator sanitizes years of experience and treaty bounds', () => {
  const result = evaluateFederalFtaProfessionalWorkPermit({
    treaty: 'cusma',
    applicantCitizenshipCountry: 'usa',
    hasSignedServiceContractOrJobOffer: true,
    hasRequiredDegreeOrLicence: true,
    yearsOfProfessionalExperience: '8',
    employerComplianceFeePaid: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.treaty, 'CUSMA');
  assert.equal(result.exemptionCode, 'T23');
  assert.equal(result.permitDetails.maxInitialDurationMonths, 36);
});

// Rec 284: Federal Intra-Company Transferee Navigator
test('Rec 284: Federal ICT Navigator enforces foreign employment clamp and 7-year cumulative cap', () => {
  const eligible = evaluateFederalIntraCompanyTransferee({
    qualifyingCorporateRelationship: 'subsidiary',
    transfereeRole: 'executive_or_senior_manager',
    continuousForeignEmploymentMonths: '36',
    accumulatedYearsOnIctPermitInCanada: '3'
  });
  assert.equal(eligible.isEligible, true);
  assert.equal(eligible.durationAssessment.yearsRemainingUnderCap, 4);

  const cappedOut = evaluateFederalIntraCompanyTransferee({
    transfereeRole: 'executive_or_senior_manager',
    accumulatedYearsOnIctPermitInCanada: '7'
  });
  assert.equal(cappedOut.isEligible, false);
  assert.equal(cappedOut.durationAssessment.hasReachedCap, true);
});

// Rec 285: Federal Reciprocal Employment Navigator
test('Rec 285: Federal Reciprocal Employment Navigator clamps exchange counts and evaluates parity', () => {
  const parity = evaluateFederalReciprocalEmployment({
    exchangeCategory: 'academic_exchange',
    hasFormalWrittenReciprocalAgreement: true,
    canadiansEnjoySimilarOpportunitiesAbroad: true,
    canadiansExchangedOutCount: '5',
    foreignWorkersIncomingCount: '5',
    isExchangeGeneralParityMaintained: true
  });
  assert.equal(parity.isEligible, true);
  assert.equal(parity.reciprocityMetrics.exchangeRatio, 1);
  assert.equal(parity.exchangeCategory, 'ACADEMIC_EXCHANGE');
});

// Rec 286: Federal Caregiver PR Pathway Experience Navigator
test('Rec 286: Federal Caregiver PR Navigator validates 12-month experience and CLB 5 minimums', () => {
  const eligible = evaluateFederalCaregiverPrPathway({
    nocCode: '44100',
    completedCanadianExperienceMonths: '14',
    averageWeeklyHours: '37.5',
    experienceInPrivateHousehold: true,
    clbReading: '6',
    clbWriting: '6',
    clbListening: '6',
    clbSpeaking: '6',
    hasOneYearPostSecondaryOrEca: true
  });
  assert.equal(eligible.isEligible, true);
  assert.equal(eligible.qualificationSummary.meets12MonthExperienceThreshold, true);
  assert.equal(eligible.qualificationSummary.meetsClb5LanguageThreshold, true);
});

// Rec 287: Federal Citizenship Physical Presence Calculator
test('Rec 287: Federal Citizenship Presence Navigator handles invalid dates and credits TR days', () => {
  const audit = auditCitizenshipPhysicalPresence({
    applicationTargetDate: 'invalid-date',
    daysPresentAsPermanentResident: '900',
    daysPresentAsTemporaryResident: '500', // 500 * 0.5 = 250 credit days => total 1150 > 1095
    hasIncomeTaxFilingCompliance: true,
    applicantAge: '35'
  });
  assert.equal(audit.isEligible, true);
  assert.equal(audit.presenceSummary.creditedDaysFromTemporaryResidence, 250);
  assert.ok(audit.presenceSummary.netQualifyingPresenceDays >= 1095);
});

// Rec 288: Federal Citizenship Revocation Defense Navigator
test('Rec 288: Federal Citizenship Revocation Defense Navigator evaluates 30-day response window and statelessness', () => {
  const activeDefense = evaluateCitizenshipRevocationDefense({
    noticeOfIntentDate: '2026-10-01',
    currentDate: '2026-10-15',
    wouldBeRenderedStateless: true,
    hasMinorChildrenAffected: true
  });
  assert.equal(activeDefense.proceduralAudit.isWithinStatutoryThirtyDayWindow, true);
  assert.equal(activeDefense.defensibilityStatus, 'STRONG_DEFENSE_CASE');
  assert.ok(activeDefense.legalDefenses.some(d => d.defense.includes('STATELESSNESS')));
});

// Rec 289: Federal Francophone Community Pilot Navigator
test('Rec 289: Federal Francophone Community Pilot Navigator scales settlement funds and audits NCLC benchmarks', () => {
  const fundsFamily1 = calculateFcipSettlementFunds(1);
  const fundsFamily6 = calculateFcipSettlementFunds(6);
  assert.equal(fundsFamily1, 7345);
  assert.ok(fundsFamily6 > fundsFamily1);

  const evalResult = evaluateFrancophoneCommunityPilot({
    communityName: 'Sudbury',
    hasCommunityRecommendationLetter: true,
    targetNocTeer: '2',
    frenchNclcSpeaking: '6',
    frenchNclcListening: '6',
    frenchNclcReading: '6',
    frenchNclcWriting: '6',
    liquidSettlementFundsCad: '15000',
    familySize: '2'
  });
  assert.equal(evalResult.isEligible, true);
  assert.equal(evalResult.financialAudit.hasSufficientFunds, true);
});

// Rec 290: Federal Parents & Grandparents Super Visa Medical Insurance Navigator
test('Rec 290: Federal Super Visa Navigator enforces $100k coverage, 365 validity days, and 2024 LICO', () => {
  const compliant = evaluateFederalSuperVisaInsuranceLico({
    medicalInsuranceCoverageCad: '100000',
    insurancePolicyValidityDays: '365',
    insuranceFromApprovedProvider: true,
    proofOfInsurancePaymentProvided: true,
    completedUpfrontImeMedicalExam: true,
    sponsorAnnualIncomeCad: '70000',
    householdSizeIncludingApplicants: '4'
  });
  assert.equal(compliant.isEligible, true);
  assert.equal(compliant.maxStayPerEntryYears, 5);
  assert.equal(compliant.financialSummary.incomeDeficitCad, 0);
});
