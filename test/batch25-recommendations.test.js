import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateAlbertaOpportunityStream } from '../src/alberta-opportunity-stream-navigator.js';
import { evaluateAtlanticImmigrationEligibility } from '../src/atlantic-immigration-navigator.js';
import { evaluateCriminalInadmissibilityAndRehab, REHAB_CONSTANTS } from '../src/criminal-rehabilitation-navigator.js';
import { evaluateEiRegularBenefits } from '../src/ei-benefits-navigator.js';
import { evaluateFamilyLawAndSupport } from '../src/family-law-navigator.js';
import { evaluateFamilyReunification } from '../src/family-reunification-navigator.js';
import { evaluateFcrMicroLoans } from '../src/fcr-healthcare-bridge-navigator.js';
import { evaluateFederalBridgingOpenWorkPermit, FEDERAL_BOWP_CONSTANTS } from '../src/federal-bridging-open-work-permit-pr-acknowledgement-navigator.js';
import { evaluateFederalC10SignificantBenefit, FEDERAL_C10_CONSTANTS } from '../src/federal-c10-significant-benefit-work-permit-navigator.js';
import { evaluateFederalC11EntrepreneurWorkPermit, FEDERAL_C11_CONSTANTS } from '../src/federal-c11-entrepreneur-self-employed-work-permit-navigator.js';
import { evaluateFederalFtaProfessionalWorkPermit, FEDERAL_FTA_CONSTANTS } from '../src/federal-c12-gats-professional-fta-navigator.js';
import { evaluateFederalIntraCompanyTransferee, FEDERAL_ICT_CONSTANTS } from '../src/federal-c14-intra-company-transferee-navigator.js';
import { evaluateFederalReciprocalEmployment, FEDERAL_C20_CONSTANTS } from '../src/federal-c20-reciprocal-employment-work-permit-navigator.js';
import { evaluateFederalCaregiverPrPathway } from '../src/federal-caregiver-pr-pathway-experience-navigator.js';
import { auditCitizenshipPhysicalPresence } from '../src/federal-citizenship-residence-calculator-audit-navigator.js';

test('Rec 441: evaluateAlbertaOpportunityStream sanitizes inputs, bounds text/dates, and audits AAIP AOS and THS eligibility', () => {
  const res = evaluateAlbertaOpportunityStream({
    candidateName: 'Maria\u0000 Santos',
    assessmentDate: '2026-10-31',
    workPermitType: 'lmia_based',
    albertaWorkExperienceMonths: 14,
    teerCategory: 2,
    nocCode: '21231',
    languageClbLevel: 6,
    hasCanadianHighSchoolOrEca: true,
    hasPermanentJobOfferInAlberta: true
  });

  assert.equal(res.candidateName, 'Maria Santos');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.overallVerdict, 'ELIGIBLE_FOR_AAIP_NOMINATION');
  assert.equal(res.isAosEligible, true);
  assert.equal(res.violationsAndBars.length, 0);

  // Ineligible with insufficient experience
  const resIneligible = evaluateAlbertaOpportunityStream({
    albertaWorkExperienceMonths: 6,
    workPermitType: 'lmia_based'
  });
  assert.equal(resIneligible.isAosEligible, false);
  assert.ok(resIneligible.violationsAndBars.length > 0);
});

test('Rec 442: evaluateAtlanticImmigrationEligibility sanitizes inputs, bounds dates, and audits AIP streams, employers, and funds', () => {
  const res = evaluateAtlanticImmigrationEligibility({
    candidateName: 'Liam\u0000 O\'Connor',
    assessmentDate: '2026-10-31',
    province: 'NS',
    stream: 'international_graduate',
    nocTeer: 1,
    clbLevel: 5,
    hasDesignatedEmployerJobOffer: true,
    isJobOfferFullTimeNonSeasonal: true,
    jobOfferDurationMonths: 24,
    hasAtlanticTwoYearCredential: true,
    monthsResidedInAtlanticDuringStudy: 16,
    settlementFundsCad: 5000
  });

  assert.equal(res.candidateName, 'Liam O\'Connor');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.overallEligible, true);
  assert.equal(res.province, 'NS');
  assert.equal(res.stream, 'international_graduate');

  // Ineligible if employer not designated
  const resUndesignated = evaluateAtlanticImmigrationEligibility({
    province: 'NB',
    hasDesignatedEmployerJobOffer: false
  });
  assert.equal(resUndesignated.overallEligible, false);
  assert.ok(resUndesignated.deficiencies.length > 0);
});

test('Rec 443: evaluateCriminalInadmissibilityAndRehab sanitizes dates, bounds text, and audits IRPA s. 36 rehabilitation vs TRP', () => {
  const res = evaluateCriminalInadmissibilityAndRehab({
    applicantName: 'David\u0000 Miller',
    assessmentDate: '2026-10-31',
    offenseType: 'theft_under_5000',
    sentenceCompletionDate: '2014-01-01',
    foreignCountry: 'US',
    convictionCount: 1
  });

  assert.equal(res.applicantName, 'David Miller');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.sentenceCompletionDate, '2014-01-01');
  assert.equal(res.rehabPathways.isDeemedRehabilitated, true);
  assert.equal(res.rehabPathways.governmentRehabFeeCad, REHAB_CONSTANTS.FEE_NON_SERIOUS_REHAB_CAD);

  // DUI after Bill C-46 is serious criminality and cannot be deemed rehabilitated
  const resDui = evaluateCriminalInadmissibilityAndRehab({
    offenseType: 'impaired_driving_dui',
    sentenceCompletionDate: '2010-01-01'
  });
  assert.ok(resDui.severityCategory.includes('Serious Criminality'));
  assert.equal(resDui.rehabPathways.isDeemedRehabilitated, false);
});

test('Rec 444: evaluateEiRegularBenefits sanitizes applicant names and dates, bounds inputs, and evaluates hours against regional unemployment', () => {
  const res = evaluateEiRegularBenefits({
    applicantName: 'Emma\u0000 Stone',
    assessmentDate: '2026-10-31',
    insurableHoursAccrued: 720,
    regionalUnemploymentRatePercent: 7.5,
    averageWeeklyInsurableEarningsCad: 1100,
    reasonForSeparation: 'layoff_shortage_of_work'
  });

  assert.equal(res.applicantName, 'Emma Stone');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.insurableHoursAccrued, 720);
  assert.equal(res.requiredHoursThreshold, 630);
  assert.equal(res.estimatedWeeklyBenefitCad, 605);

  // Ineligible with insufficient hours
  const resLowHours = evaluateEiRegularBenefits({
    insurableHoursAccrued: 400,
    regionalUnemploymentRatePercent: 7.5
  });
  assert.equal(resLowHours.isEligible, false);
  assert.ok(resLowHours.disqualifications.length > 0);
});

test('Rec 445: evaluateFamilyLawAndSupport sanitizes client name and date, bounds assets, and calculates child support and spousal advisory guidelines', () => {
  const res = evaluateFamilyLawAndSupport({
    clientName: 'Sarah\u0000 Jenkins',
    assessmentDate: '2026-10-31',
    province: 'ON',
    maritalStatus: 'married',
    cohabitationYears: 8.0,
    numberOfChildren: 2,
    payerGrossAnnualIncomeCad: 95000,
    recipientGrossAnnualIncomeCad: 45000,
    payerValuationDateAssetsCad: 350000,
    payerDateOfMarriageDeductionsCad: 50000,
    payerDebtsValuationDateCad: 40000,
    recipientValuationDateAssetsCad: 120000,
    recipientDateOfMarriageDeductionsCad: 20000,
    recipientDebtsValuationDateCad: 15000
  });

  assert.equal(res.clientName, 'Sarah Jenkins');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.province, 'ON');
  assert.ok(res.childSupport.monthlyTableAmountCad > 0);
  assert.ok(res.propertyEqualization.equalizationPaymentCad > 0);
  assert.equal(res.propertyEqualization.payingParty, 'Payer to Recipient');
});

test('Rec 446: evaluateFamilyReunification sanitizes applicant name and date, bounds inputs, and enforces 2024 university degree & TEER thresholds', () => {
  const resMasterStudent = evaluateFamilyReunification({
    applicantName: 'Carlos\u0000 Mendez',
    assessmentDate: '2026-10-31',
    category: 'spousal_open_work_permit',
    sponsorStatus: 'study_permit',
    studentProgramType: 'masters'
  });

  assert.equal(resMasterStudent.applicantName, 'Carlos Mendez');
  assert.equal(resMasterStudent.assessmentDate, '2026-10-31');
  assert.equal(resMasterStudent.eligible, true);
  assert.equal(resMasterStudent.verdict, 'ELIGIBLE_FOR_SOWP');

  // College diploma student spouse is ineligible under 2024 policy
  const resCollegeStudent = evaluateFamilyReunification({
    category: 'spousal_open_work_permit',
    sponsorStatus: 'study_permit',
    studentProgramType: 'undergraduate'
  });
  assert.equal(resCollegeStudent.eligible, false);
  assert.equal(resCollegeStudent.refusalHazard, true);
});

test('Rec 447: evaluateFcrMicroLoans sanitizes candidate name and date, bounds loans, and assesses healthcare bridge micro-lending programs', () => {
  const res = evaluateFcrMicroLoans({
    candidateName: 'Priya\u0000 Patel',
    assessmentDate: '2026-10-31',
    immigrationStatus: 'permanent_resident',
    targetProfession: 'nurse',
    fundingRequiredCad: 12000
  });

  assert.equal(res.candidateName, 'Priya Patel');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligibleForFcrLoans, true);
  assert.ok(res.availableLoanPrograms.some(p => p.provider === 'Windmill Microlending' && p.isEligible));

  // Ineligible status (e.g. visitor)
  const resVisitor = evaluateFcrMicroLoans({
    immigrationStatus: 'visitor'
  });
  assert.equal(resVisitor.isEligibleForFcrLoans, false);
});

test('Rec 448: evaluateFederalBridgingOpenWorkPermit sanitizes applicant name and date, bounds expiry days, and audits IRPR s. 207 BOWP rules', () => {
  const res = evaluateFederalBridgingOpenWorkPermit({
    applicantName: 'Jean\u0000 Dupont',
    assessmentDate: '2026-10-31',
    isCurrentlyInCanada: true,
    hasValidWorkAuthorization: true,
    daysUntilCurrentPermitExpires: 60,
    prApplicationStream: 'EXPRESS_ENTRY_CEC',
    hasReceivedOfficialAor: true
  });

  assert.equal(res.applicantName, 'Jean Dupont');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.eligibilityVerdict, 'ELIGIBLE_FOR_BRIDGING_OPEN_WORK_PERMIT');
  assert.equal(res.exemptionCode, FEDERAL_BOWP_CONSTANTS.EXEMPTION_CODE);

  // Ineligible outside Canada
  const resOutside = evaluateFederalBridgingOpenWorkPermit({
    isCurrentlyInCanada: false
  });
  assert.equal(resOutside.isEligible, false);
  assert.ok(resOutside.statutoryViolations.some(v => v.rule === 'MUST_BE_PHYSICALLY_PRESENT_IN_CANADA'));
});

test('Rec 449: evaluateFederalC10SignificantBenefit sanitizes names and date, bounds job counts, and evaluates IRPR s. 205(a) C10 economic benefit', () => {
  const res = evaluateFederalC10SignificantBenefit({
    applicantName: 'Elena\u0000 Rostova',
    employerName: 'Quantum Tech\nCanada',
    assessmentDate: '2026-10-31',
    benefitCategory: 'ECONOMIC',
    createsDirectJobsForCanadiansOrPrs: true,
    projectedCanadianJobsCreatedCount: 5,
    hasOfficialSupportFromCanadianGovernmentOrBody: true,
    independentExpertTestimonialLettersCount: 3,
    hasDocumentedRecordOfDistinguishedAchievement: true,
    hasDetailedCanadianBusinessOrWorkPlan: true,
    employerComplianceFeePaid: true
  });

  assert.equal(res.applicantName, 'Elena Rostova');
  assert.equal(res.employerName, 'Quantum Tech Canada');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.eligibilityVerdict, 'HIGH_EVIDENTIARY_BENEFIT_ESTABLISHED');
  assert.equal(res.lmiaExemptionCode, FEDERAL_C10_CONSTANTS.EXEMPTION_CODE);

  // Ineligible if unpaid employer compliance fee
  const resUnpaid = evaluateFederalC10SignificantBenefit({
    employerComplianceFeePaid: false
  });
  assert.equal(resUnpaid.isEligible, false);
  assert.ok(resUnpaid.statutoryViolations.some(v => v.rule === 'EMPLOYER_COMPLIANCE_FEE_OUTSTANDING'));
});

test('Rec 450: evaluateFederalC11EntrepreneurWorkPermit sanitizes applicant name and date, bounds equity %, and evaluates IRPR s. 205(a) C11 entrepreneurship', () => {
  const res = evaluateFederalC11EntrepreneurWorkPermit({
    applicantName: 'Kenji\u0000 Sato',
    assessmentDate: '2026-10-31',
    businessOwnershipPercentage: 60,
    hasControllingInterest: true,
    capitalInvestedCad: 200000,
    hasComprehensiveBusinessPlan: true,
    createsJobsForCanadiansOrPrs: true,
    projectedCanadianStaffHired: 3,
    hasRelevantEntrepreneurialBackground: true,
    hasSecuredPhysicalPremisesOrLease: true,
    employerComplianceFeePaid: true
  });

  assert.equal(res.applicantName, 'Kenji Sato');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.eligibilityVerdict, 'ELIGIBLE_FOR_C11_WORK_PERMIT');
  assert.equal(res.lmiaExemptionCode, FEDERAL_C11_CONSTANTS.EXEMPTION_CODE);

  // Ineligible minority shareholder
  const resMinority = evaluateFederalC11EntrepreneurWorkPermit({
    businessOwnershipPercentage: 20,
    hasControllingInterest: false
  });
  assert.equal(resMinority.isEligible, false);
  assert.ok(resMinority.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_BUSINESS_OWNERSHIP_OR_CONTROL'));
});

test('Rec 451: evaluateFederalFtaProfessionalWorkPermit sanitizes applicant name and date, bounds treaty keys, and audits IRPR s. 204(a) international agreements', () => {
  const res = evaluateFederalFtaProfessionalWorkPermit({
    applicantName: 'Michael\u0000 Ross',
    assessmentDate: '2026-10-31',
    treaty: 'CUSMA',
    applicantCitizenshipCountry: 'USA',
    hasSignedServiceContractOrJobOffer: true,
    hasRequiredDegreeOrLicence: true,
    yearsOfProfessionalExperience: 5,
    employerComplianceFeePaid: true
  });

  assert.equal(res.applicantName, 'Michael Ross');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.treaty, 'CUSMA');
  assert.equal(res.exemptionCode, FEDERAL_FTA_CONSTANTS.SUPPORTED_TREATIES.CUSMA.code);

  // Ineligible without pre-arranged contract
  const resNoContract = evaluateFederalFtaProfessionalWorkPermit({
    hasSignedServiceContractOrJobOffer: false
  });
  assert.equal(resNoContract.isEligible, false);
  assert.ok(resNoContract.statutoryViolations.some(v => v.rule === 'MISSING_PREARRANGED_CONTRACT_OR_OFFER'));
});

test('Rec 452: evaluateFederalIntraCompanyTransferee sanitizes transferee and employer names, bounds duration, and evaluates IRPR s. 205(a) C12/C14 ICT caps', () => {
  const res = evaluateFederalIntraCompanyTransferee({
    transfereeName: 'Sophie\u0000 Laurent',
    employerName: 'Multinational Corp\nCanada',
    assessmentDate: '2026-10-31',
    qualifyingCorporateRelationship: 'SUBSIDIARY',
    transfereeRole: 'EXECUTIVE_OR_SENIOR_MANAGER',
    continuousForeignEmploymentMonths: 24,
    isNewOfficeStartUp: false,
    hasSecuredPhysicalPremises: true,
    accumulatedYearsOnIctPermitInCanada: 2,
    employerComplianceFeePaid: true
  });

  assert.equal(res.transfereeName, 'Sophie Laurent');
  assert.equal(res.employerName, 'Multinational Corp Canada');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.eligibilityVerdict, 'ELIGIBLE_FOR_ICT_WORK_PERMIT');
  assert.equal(res.durationAssessment.initialAuthorizedDurationYears, FEDERAL_ICT_CONSTANTS.INITIAL_DURATION_ESTABLISHED_BUSINESS_YEARS);

  // Ineligible when statutory 7-year cap reached
  const resCapReached = evaluateFederalIntraCompanyTransferee({
    transfereeRole: 'EXECUTIVE_OR_SENIOR_MANAGER',
    accumulatedYearsOnIctPermitInCanada: 7
  });
  assert.equal(resCapReached.isEligible, false);
  assert.ok(resCapReached.statutoryViolations.some(v => v.rule === 'STATUTORY_ICT_CUMULATIVE_CAP_REACHED'));
});

test('Rec 453: evaluateFederalReciprocalEmployment sanitizes names and date, bounds exchange parity, and audits IRPR s. 205(b) C20 reciprocity', () => {
  const res = evaluateFederalReciprocalEmployment({
    workerName: 'Hans\u0000 Gruber',
    employerName: 'Toronto Symphony\nOrchestra',
    assessmentDate: '2026-10-31',
    exchangeCategory: 'CULTURAL_YOUTH_EXCHANGE',
    hasFormalWrittenReciprocalAgreement: true,
    canadiansEnjoySimilarOpportunitiesAbroad: true,
    canadiansExchangedOutCount: 3,
    foreignWorkersIncomingCount: 3,
    isExchangeGeneralParityMaintained: true,
    isJobOfferFullTime: true,
    employerComplianceFeePaid: true
  });

  assert.equal(res.workerName, 'Hans Gruber');
  assert.equal(res.employerName, 'Toronto Symphony Orchestra');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.eligibilityVerdict, 'ELIGIBLE_FOR_C20_RECIPROCAL_WORK_PERMIT');
  assert.equal(res.lmiaExemptionCode, FEDERAL_C20_CONSTANTS.EXEMPTION_CODE);

  // Ineligible if Canadians lack reciprocal foreign opportunities
  const resNoReciprocity = evaluateFederalReciprocalEmployment({
    canadiansEnjoySimilarOpportunitiesAbroad: false
  });
  assert.equal(resNoReciprocity.isEligible, false);
  assert.ok(resNoReciprocity.statutoryViolations.some(v => v.rule === 'ABSENCE_OF_SIMILAR_OPPORTUNITIES_FOR_CANADIANS'));
});

test('Rec 454: evaluateFederalCaregiverPrPathway sanitizes caregiver name and date, bounds hours/CLB, and audits 12-month experience standard under IRPA s. 14.1', () => {
  const res = evaluateFederalCaregiverPrPathway({
    caregiverName: 'Ananya\u0000 Sharma',
    assessmentDate: '2026-10-31',
    nocCode: '44100',
    completedCanadianExperienceMonths: 14,
    averageWeeklyHours: 35,
    experienceInPrivateHousehold: true,
    clbReading: 5,
    clbWriting: 5,
    clbListening: 6,
    clbSpeaking: 6,
    hasOneYearPostSecondaryOrEca: true,
    hasValidCanadianWorkPermitOrStatus: true
  });

  assert.equal(res.caregiverName, 'Ananya Sharma');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.eligibilityVerdict, 'ELIGIBLE_FOR_CAREGIVER_DIRECT_PR');
  assert.equal(res.qualificationSummary.meets12MonthExperienceThreshold, true);

  // Ineligible with deficient experience
  const resDeficit = evaluateFederalCaregiverPrPathway({
    completedCanadianExperienceMonths: 8
  });
  assert.equal(resDeficit.isEligible, false);
  assert.ok(resDeficit.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_QUALIFYING_CANADIAN_WORK_EXPERIENCE'));
});

test('Rec 455: auditCitizenshipPhysicalPresence sanitizes applicant name and dates, bounds credit calculations, and audits 1,095-day requirement under Citizenship Act s. 5(1)(c)', () => {
  const res = auditCitizenshipPhysicalPresence({
    applicantName: 'Tariq\u0000 Mansour',
    assessmentDate: '2026-10-31',
    applicationTargetDate: '2026-10-31',
    daysPresentAsPermanentResident: 1100,
    daysPresentAsTemporaryResident: 200,
    applicantAge: 35,
    hasIncomeTaxFilingCompliance: true,
    meetsLanguageAndKnowledgeCriteria: true
  });

  assert.equal(res.applicantName, 'Tariq Mansour');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.applicationTargetDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.eligibilityVerdict, 'ELIGIBLE_FOR_CITIZENSHIP');
  assert.equal(res.presenceSummary.daysCreditedFromPermanentResidence, 1100);
  assert.equal(res.presenceSummary.creditedDaysFromTemporaryResidence, 100); // 200 * 0.5
  assert.equal(res.presenceSummary.netQualifyingPresenceDays, 1200);
  assert.equal(res.presenceSummary.surplusOrDeficitDays, 105);

  // Ineligible with insufficient days
  const resDeficit = auditCitizenshipPhysicalPresence({
    daysPresentAsPermanentResident: 800,
    daysPresentAsTemporaryResident: 0
  });
  assert.equal(resDeficit.isEligible, false);
  assert.ok(resDeficit.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_PHYSICAL_PRESENCE'));
});
