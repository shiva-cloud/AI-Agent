import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateGovernmentEnrollment } from '../src/sin-healthcare-navigator.js';
import { evaluateSmallClaimsDispute, SMALL_CLAIMS_CONSTANTS } from '../src/small-claims-navigator.js';
import { evaluateSocialAssistance, SOCIAL_ASSISTANCE_CONSTANTS } from '../src/social-assistance-navigator.js';
import { resolveSocialCrisisGuidance, SOCIAL_CRISIS_TYPES } from '../src/social-qa-crisis-navigator.js';
import { evaluateSowpEligibility, generateSowpApplicationChecklist, SOWP_CONSTANTS } from '../src/sowp-eligibility-navigator.js';
import { evaluateSpeculationTaxAndRebates, SPECULATION_TAX_CONSTANTS } from '../src/speculation-tax-rebate-navigator.js';
import { auditStatutoryPayAndWages, STATUTORY_PAY_CONSTANTS } from '../src/statutory-pay-calculator.js';
import { evaluateStatutorySeveranceNotice, SEVERANCE_CONSTANTS } from '../src/statutory-severance-notice-navigator.js';
import { evaluateStudentWorkCompliance, STATUTORY_OFF_CAMPUS_WEEKLY_HOUR_CAP } from '../src/student-compliance.js';
import { evaluateStudyPermitCapAndPal, STATUTORY_LIVING_COST_BASE_CAD } from '../src/study-permit-cap-pal-navigator.js';
import { auditStudyPermitAndPal, PROGRAM_LEVELS, INSTITUTION_TYPES } from '../src/study-permit-pal-navigator.js';
import { evaluateStudyToPrPathway } from '../src/study-to-pr-navigator.js';
import { evaluateSuperVisaAndPgp, getRequiredLicoIncome } from '../src/super-visa-lico-navigator.js';
import { evaluateSuperVisaAndFamilySponsorship } from '../src/super-visa-sponsor.js';
import { evaluateTaxShield } from '../src/tax-shield-optimizer.js';

// Rec 486: Government Enrollment & SIN Series Navigator
test('Rec 486: evaluateGovernmentEnrollment audits 900-series temporary SIN, standard permanent SIN, and OHIP waiting repeal', () => {
  const tempWorker = evaluateGovernmentEnrollment({
    statusInCanada: 'work_permit',
    province: 'ON',
    workPermitMinDurationMonths: 12,
    applicantName: 'Sanjay Gupta'
  });
  assert.equal(tempWorker.applicantName, 'Sanjay Gupta');
  assert.equal(tempWorker.sinEvaluation.sinType, 'temporary_9_series');
  assert.equal(tempWorker.sinEvaluation.eligible, true);
  assert.equal(tempWorker.healthcareEvaluation.waitingPeriodDays, 0);
  assert.equal(tempWorker.healthcareEvaluation.planName, 'Ontario Health Insurance Plan (OHIP)');

  const permanentRes = evaluateGovernmentEnrollment({
    statusInCanada: 'pr_copr',
    province: 'BC',
    applicantName: 'Maria Fernandez'
  });
  assert.equal(permanentRes.applicantName, 'Maria Fernandez');
  assert.equal(permanentRes.sinEvaluation.sinType, 'standard_permanent');
  assert.equal(permanentRes.sinEvaluation.eligible, true);
});

// Rec 487: Small Claims Navigator
test('Rec 487: evaluateSmallClaimsDispute evaluates monetary caps, pre-judgment interest, and sanitized parties', () => {
  const claim = evaluateSmallClaimsDispute({
    claimAmountCad: 15000,
    province: 'ON',
    disputeType: 'breach_of_contract',
    prejudgmentInterestRatePercent: 4.5,
    plaintiffName: 'Acme Consulting Ltd.',
    defendantName: 'Nova Enterprises Inc.',
    dateCauseOfActionArose: '2026-01-01',
    assessmentDate: '2026-10-31'
  });
  assert.equal(claim.jurisdictionAudit.isWithinSmallClaimsLimit, true);
  assert.equal(claim.jurisdictionAudit.monetaryLimitCad, SMALL_CLAIMS_CONSTANTS.ONTARIO_SMALL_CLAIMS_MAX_CAD);
  assert.equal(claim.plaintiffName, 'Acme Consulting Ltd.');
  assert.equal(claim.defendantName, 'Nova Enterprises Inc.');
  assert.equal(claim.assessmentDate, '2026-10-31');
  assert.ok(claim.interestAndCostsCalculation.accruedPrejudgmentInterestCad > 0);
  assert.ok(claim.interestAndCostsCalculation.totalClaimableWithInterestCad > 15000);

  const excessiveClaim = evaluateSmallClaimsDispute({
    claimAmountCad: 50000,
    province: 'ON'
  });
  assert.equal(excessiveClaim.jurisdictionAudit.isWithinSmallClaimsLimit, false);
  assert.ok(excessiveClaim.jurisdictionAudit.abandonExcessRecommendation.includes('exceeds'));
});

// Rec 488: Social Assistance Navigator
test('Rec 488: evaluateSocialAssistance audits Ontario Works / ODSP asset limits and emergency assistance', () => {
  const owSingle = evaluateSocialAssistance({
    program: 'ontario_works',
    familyComposition: 'single',
    dependentChildrenCount: 0,
    liquidAssetsCad: 5000,
    grossMonthlyEmploymentIncomeCad: 400,
    immigrationStatus: 'permanent_resident',
    monthlyShelterCostCad: 800,
    applicantName: 'Jordan Lee'
  });
  assert.equal(owSingle.applicantName, 'Jordan Lee');
  assert.equal(owSingle.eligibility.isOverallEligible, true);
  assert.equal(owSingle.assetAudit.liquidAssetsCad, 5000);
  assert.equal(owSingle.assetAudit.statutoryAssetLimitCad, SOCIAL_ASSISTANCE_CONSTANTS.OW_ASSET_LIMIT_SINGLE_CAD);
  assert.ok(owSingle.benefitCalculation.estimatedMonthlyDisbursementCad > 0);

  const overAsset = evaluateSocialAssistance({
    program: 'ontario_works',
    familyComposition: 'single',
    liquidAssetsCad: 15000
  });
  assert.equal(overAsset.eligibility.isOverallEligible, false);
  assert.equal(overAsset.assetAudit.isWithinAssetLimit, false);
});

// Rec 489: Social QA Crisis Navigator
test('Rec 489: resolveSocialCrisisGuidance defends against passport retention, ghosting, cash rent, and returns assessmentDate', () => {
  const passportCrisis = resolveSocialCrisisGuidance('Employer kept my passport and refuses to return it', {
    country: 'CA',
    assessmentDate: '2026-10-31'
  });
  assert.equal(passportCrisis.type, SOCIAL_CRISIS_TYPES.PASSPORT_RETENTION);
  assert.equal(passportCrisis.assessmentDate, '2026-10-31');
  assert.ok(passportCrisis.authority.includes('EPFNA'));

  const rentCrisis = resolveSocialCrisisGuidance('Landlord is demanding cash rent without a receipt', {
    country: 'CA',
    assessmentDate: '2026-10-31'
  });
  assert.equal(rentCrisis.type, SOCIAL_CRISIS_TYPES.CASH_WITHOUT_RECEIPT);
  assert.equal(rentCrisis.assessmentDate, '2026-10-31');
  assert.ok(rentCrisis.authority.includes('Residential Tenancies Act'));

  const maintainedCrisis = resolveSocialCrisisGuidance('My work permit expires while appeal pending with IRCC', {
    country: 'CA',
    assessmentDate: '2026-10-31'
  });
  assert.equal(maintainedCrisis.type, SOCIAL_CRISIS_TYPES.MAINTAINED_STATUS_PROTECTION);
  assert.equal(maintainedCrisis.assessmentDate, '2026-10-31');
  assert.ok(maintainedCrisis.authority.includes('183(5)'));
});

// Rec 490: Spousal Open Work Permit Navigator
test('Rec 490: evaluateSowpEligibility & generateSowpApplicationChecklist enforce March 19 2024 policy overhaul', () => {
  const mastersSpouse = evaluateSowpEligibility({
    sponsorType: 'international_student',
    studentProgramLevel: 'masters',
    relationshipType: 'married',
    applicantName: 'Priya Sharma',
    principalName: 'Rahul Sharma'
  });
  assert.equal(mastersSpouse.overallEligible, true);
  assert.equal(mastersSpouse.lmiaExemptionCode, 'C42');
  assert.equal(mastersSpouse.applicantName, 'Priya Sharma');

  const diplomaSpouse = evaluateSowpEligibility({
    sponsorType: 'international_student',
    studentProgramLevel: 'college_diploma',
    relationshipType: 'married'
  });
  assert.equal(diplomaSpouse.overallEligible, false);
  assert.ok(diplomaSpouse.rejectionRisks.some(r => r.includes('March 19, 2024 Rule')));

  const checklist = generateSowpApplicationChecklist({
    applicantName: 'Priya Sharma',
    sponsorType: 'international_student',
    lmiaCode: 'C42',
    isEligible: true
  });
  assert.ok(checklist.includes('Priya Sharma'));
  assert.ok(checklist.includes('CONFIRMED ELIGIBLE'));
});

// Rec 491: Speculation Tax & Rebate Navigator
test('Rec 491: evaluateSpeculationTaxAndRebates audits BC SVT exemptions and Ontario 25% NRST PR rebate', () => {
  const bcHome = evaluateSpeculationTaxAndRebates({
    province: 'BC',
    isPrincipalResidenceOccupied6Months: true,
    isCanadianCitizenOrPr: true,
    propertyAssessedValueCad: 1500000,
    ownerName: 'Liam Chen'
  });
  assert.equal(bcHome.isTaxExempt, true);
  assert.equal(bcHome.netTaxPayableCad, 0);
  assert.equal(bcHome.ownerName, 'Liam Chen');

  const onRebate = evaluateSpeculationTaxAndRebates({
    province: 'ON',
    purchasePriceCad: 800000,
    purchaseClosingDate: '2026-01-15',
    prStatusAcquiredDate: '2026-03-01',
    rebateApplicationDate: '2026-04-15',
    occupiedAsPrincipalResidenceWithin60Days: true,
    heldSolelyWithSpouse: true,
    ownerName: 'Wei Zhang'
  });
  assert.equal(onRebate.ontarioNrstRebate.isNrstRebateEligible, true);
  assert.equal(onRebate.ontarioNrstRebate.nrstRebateAmountCad, 200000);
  assert.equal(onRebate.ownerName, 'Wei Zhang');
});

// Rec 492: Statutory Pay & Wage Theft Calculator
test('Rec 492: auditStatutoryPayAndWages audits Ontario 44h overtime, vacation pay step-up, and unlawful deductions', () => {
  const payJunior = auditStatutoryPayAndWages({
    province: 'ON',
    grossHourlyWageCad: 25.0,
    hoursWorkedInPayPeriod: 96,
    tenureYears: 2.0,
    payPeriodWeeks: 2,
    statutoryHolidaysInPeriod: 1,
    workedOnStatHoliday: true,
    hoursWorkedOnStatHoliday: 8,
    unauthorizedDeductionsCad: 150,
    deductionReason: 'cash_shortage',
    employeeName: 'David Miller',
    employerName: 'Apex Logistics'
  });
  assert.equal(payJunior.employeeName, 'David Miller');
  assert.equal(payJunior.employerName, 'Apex Logistics');
  assert.equal(payJunior.hoursAudit.weeklyThreshold, STATUTORY_PAY_CONSTANTS.ONTARIO_OVERTIME_WEEKLY_HOURS);
  assert.equal(payJunior.hoursAudit.overtimeHours, 8);
  assert.equal(payJunior.vacationPayAudit.statutoryVacationRatePercent, 4);
  assert.equal(payJunior.deductionsAudit.isDeductionUnlawful, true);
  assert.equal(payJunior.deductionsAudit.recoverableDeductionCad, 150);

  const paySenior = auditStatutoryPayAndWages({
    tenureYears: 6.0
  });
  assert.equal(paySenior.vacationPayAudit.statutoryVacationRatePercent, 6);
});

// Rec 493: Statutory Severance & Common Law Notice Navigator
test('Rec 493: evaluateStatutorySeveranceNotice calculates ESA notice, severance, and Waksdale invalidation', () => {
  const seniorEmp = evaluateStatutorySeveranceNotice({
    yearsOfService: 7.0,
    employeeAgeYears: 52,
    annualSalaryCad: 100000,
    province: 'ON',
    employerPayrollExceeds2_5Million: true,
    terminationClauseViolatesEsa: true,
    employeeName: 'Sarah Jenkins'
  });
  assert.equal(seniorEmp.employeeName, 'Sarah Jenkins');
  assert.equal(seniorEmp.statutoryEsaAudit.statutoryNoticeWeeks, 7);
  assert.equal(seniorEmp.statutoryEsaAudit.qualifiesForStatutorySeverancePay, true);
  assert.equal(seniorEmp.statutoryEsaAudit.statutorySeveranceWeeks, 7);
  assert.equal(seniorEmp.enforceabilityAudit.isClauseEnforceable, false);
  assert.equal(seniorEmp.enforceabilityAudit.recommendedLegalClaim, 'COMMON_LAW_NOTICE');
  assert.ok(seniorEmp.commonLawAssessment.estimatedNoticeMonths >= 8);
});

// Rec 494: Student Work & Study Permit Compliance Engine
test('Rec 494: evaluateStudentWorkCompliance enforces Fall 2024 24h weekly cap and 150-day leave limit', () => {
  const compliant = evaluateStudentWorkCompliance({
    enrollmentStatus: 'full_time',
    weeklyHoursWorked: 20,
    isDliDesignated: true,
    hasSocialInsuranceNumber: true,
    studyPermitConditionAllowsWork: true,
    studentName: 'Kenji Sato'
  });
  assert.equal(compliant.studentName, 'Kenji Sato');
  assert.equal(compliant.complianceVerdict, 'FULLY_COMPLIANT');
  assert.equal(compliant.maxPermittedHoursThisWeek, STATUTORY_OFF_CAMPUS_WEEKLY_HOUR_CAP);

  const excess = evaluateStudentWorkCompliance({
    enrollmentStatus: 'full_time',
    weeklyHoursWorked: 28
  });
  assert.equal(excess.isWorkAuthorized, false);
  assert.ok(excess.statutoryViolations.some(v => v.rule.includes('24-Hour Off-Campus Cap Exceeded')));

  const leave = evaluateStudentWorkCompliance({
    enrollmentStatus: 'authorized_leave',
    leaveDurationDays: 160
  });
  assert.ok(leave.statutoryViolations.some(v => v.rule.includes('Exceeds Statutory 150-Day Limit')));
});

// Rec 495: Study Permit Cap & PAL Navigator
test('Rec 495: evaluateStudyPermitCapAndPal calculates PAL mandates, exemptions, and 75% LICO living costs', () => {
  const undergrad = evaluateStudyPermitCapAndPal({
    studyLevel: 'undergraduate_degree',
    province: 'ON',
    tuitionFeeFirstYearCad: 25000,
    liquidFundsAvailableCad: 50000,
    applicantName: 'Fatima Al-Mansoor'
  });
  assert.equal(undergrad.applicantName, 'Fatima Al-Mansoor');
  assert.equal(undergrad.isPalRequired, true);
  assert.equal(undergrad.financialAudit.requiredLivingFundsCad, STATUTORY_LIVING_COST_BASE_CAD);
  assert.equal(undergrad.financialAudit.isFinanciallySufficient, true);

  const masters = evaluateStudyPermitCapAndPal({
    studyLevel: 'masters',
    isExtensionOfStudyPermit: true
  });
  assert.equal(masters.isPalRequired, false);
  assert.equal(masters.palStatus, 'PAL_EXEMPT');
});

// Rec 496: Study Permit PAL & PGWP 2024/2025 Navigator
test('Rec 496: auditStudyPermitAndPal enforces Nov 1 2024 priority field alignment and CLB 7/5 benchmarks', () => {
  const stemCollege = auditStudyPermitAndPal({
    programLevel: PROGRAM_LEVELS.COLLEGE_DIPLOMA,
    institutionType: INSTITUTION_TYPES.PUBLIC_COLLEGE,
    fieldOfStudy: 'stem_engineering',
    languageScoreClb: 6,
    firstYearTuition: 16000,
    applicantName: 'Arjun Patel',
    targetProvince: 'ON'
  });
  assert.equal(stemCollege.applicantName, 'Arjun Patel');
  assert.equal(stemCollege.pgwpEligibility.isEligible, true);
  assert.equal(stemCollege.pgwpEligibility.requiredClb, 5);
  assert.equal(stemCollege.pgwpEligibility.priorityFieldMatch, true);

  const businessCollege = auditStudyPermitAndPal({
    programLevel: PROGRAM_LEVELS.COLLEGE_DIPLOMA,
    institutionType: INSTITUTION_TYPES.PUBLIC_COLLEGE,
    fieldOfStudy: 'business_marketing',
    languageScoreClb: 6
  });
  assert.equal(businessCollege.pgwpEligibility.isEligible, false);
  assert.ok(businessCollege.pgwpEligibility.riskFlags.some(f => f.includes('Nov 1, 2024 Rule')));
});

// Rec 497: Study-to-PR Pathway & Timeline Optimizer
test('Rec 497: evaluateStudyToPrPathway calculates 3-year Master PGWP, CEC 1560h milestone, and CRS gains', () => {
  const mastersPath = evaluateStudyToPrPathway({
    studyLevel: 'masters',
    province: 'ON',
    fieldOfStudy: 'stem_tech',
    expectedClbLanguage: 9,
    targetNocTeer: 1,
    yearsForeignExperience: 3,
    applicantName: 'Lucas Dubois'
  });
  assert.equal(mastersPath.applicantName, 'Lucas Dubois');
  assert.equal(mastersPath.pgwpEntitlement.durationMonths, 36);
  assert.equal(mastersPath.prPathways.breakdown.canadianStudyBonus, 30);
  assert.equal(mastersPath.prPathways.breakdown.canadianWorkExperienceBonus, 40);
  assert.ok(mastersPath.prPathways.provincialNomineeOptions.some(o => o.includes('OINP Masters Graduate Stream')));
});

// Rec 498: Super Visa & PGP LICO Navigator
test('Rec 498: evaluateSuperVisaAndPgp audits LICO + 30% thresholds, insurance, and 3-year PGP criteria', () => {
  const superVisa = evaluateSuperVisaAndPgp({
    hostFamilyMembersInCanada: 3,
    parentsGrandparentsToSponsor: 2,
    hostAnnualIncomeCad: 80000,
    hasCanadianHealthInsurance: true,
    insuranceCoverageAmountCad: 100000,
    insuranceCoversRepatriation: true,
    hostName: 'Michael Wong'
  });
  assert.equal(superVisa.hostName, 'Michael Wong');
  assert.equal(superVisa.householdAudit.totalFamilyUnitSize, 5);
  assert.equal(superVisa.householdAudit.requiredLicoPlus30IncomeCad, getRequiredLicoIncome(5));
  assert.equal(superVisa.superVisaEvaluation.isIncomeSufficient, true);
  assert.equal(superVisa.superVisaEvaluation.insuranceAudit.isCompliant, true);

  const pgp = evaluateSuperVisaAndPgp({
    hostFamilyMembersInCanada: 2,
    parentsGrandparentsToSponsor: 2,
    applicationType: 'pgp_permanent',
    noaIncomeYear1Cad: 70000,
    noaIncomeYear2Cad: 70000,
    noaIncomeYear3Cad: 70000
  });
  assert.equal(pgp.pgpEvaluation.isEligible3Years, true);
  assert.equal(pgp.pgpEvaluation.undertakingPeriodYears, 20);
});

// Rec 499: Super Visa & Family Sponsorship Diagnostic Engine
test('Rec 499: evaluateSuperVisaAndFamilySponsorship restricts host status and bars non-spouse co-signers', () => {
  const prHost = evaluateSuperVisaAndFamilySponsorship({
    sponsorName: 'Ananya Rao',
    sponsorStatus: 'permanent_resident',
    pathway: 'super_visa',
    sponsorFamilySize: 2,
    invitedParentsCount: 2,
    sponsorLine15000IncomeYear1: 70000
  });
  assert.equal(prHost.sponsorName, 'Ananya Rao');
  assert.equal(prHost.isStatutorilyEligible, true);
  assert.equal(prHost.eligibilityVerdict, 'STATUTORILY_ELIGIBLE');

  const tempResidentHost = evaluateSuperVisaAndFamilySponsorship({
    sponsorStatus: 'work_permit_holder'
  });
  assert.equal(tempResidentHost.isStatutorilyEligible, false);
  assert.ok(tempResidentHost.statutoryViolations.some(v => v.rule.includes('Ineligible Inviter / Sponsor Status')));

  const siblingCoSigner = evaluateSuperVisaAndFamilySponsorship({
    hasCoSigner: true,
    coSignerRelationship: 'sibling_or_parent'
  });
  assert.ok(siblingCoSigner.statutoryViolations.some(v => v.rule.includes('Inadmissible Co-Signer Relationship')));
});

// Rec 500: Tax Shield & Wealth Optimization Navigator
test('Rec 500: evaluateTaxShield computes FHSA $8k deduction, CCB sliding scale, and non-resident TFSA penalty', () => {
  const taxResident = evaluateTaxShield({
    taxpayerName: 'Dmitri Ivanov',
    province: 'ON',
    annualEmploymentIncomeCad: 85000,
    planToBuyFirstHome: true,
    fhsaContributionCad: 8000,
    isTaxResident: true,
    childrenUnder6: 1,
    children6to17: 1
  });
  assert.equal(taxResident.taxpayerName, 'Dmitri Ivanov');
  assert.equal(taxResident.fhsaShield.annualLimitCad, 8000);
  assert.equal(taxResident.fhsaShield.contributionCad, 8000);
  assert.ok(taxResident.fhsaShield.estimatedIncomeTaxDeductionCad > 2000);
  assert.equal(taxResident.tfsaShield.penaltyWarning, null);
  assert.ok(taxResident.childAndFamilyBenefits.estimatedAnnualCcbCad > 0);

  const nonResident = evaluateTaxShield({
    isTaxResident: false,
    tfsaContributionCad: 5000
  });
  assert.ok(nonResident.tfsaShield.penaltyWarning);
  assert.equal(nonResident.tfsaShield.penaltyWarning.monthlyPenaltyCad, 50);
});
