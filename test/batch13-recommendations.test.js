import test from 'node:test';
import assert from 'node:assert/strict';

import {
  evaluateBcSpeculationTaxDeclaration
} from '../src/bc-speculation-tax-declaration-navigator.js';

import {
  evaluateBcStrataBylawDefense
} from '../src/bc-strata-bylaw-navigator.js';

import {
  evaluateBcTechPilotEligibility
} from '../src/british-columbia-pnp-skills-immigration-tech-navigator.js';

import {
  auditBcSvtNoticeOfObjection
} from '../src/british-columbia-speculation-tax-audit-appeal-navigator.js';

import {
  evaluateBcStrataDepreciationReport
} from '../src/british-columbia-strata-depreciation-report-reserve-fund-navigator.js';

import {
  auditBcStrataShortTermRental
} from '../src/british-columbia-strata-short-term-rental-bylaw-navigator.js';

import {
  evaluateChildDisabilityBenefit,
  DISABILITY_BENEFIT_CONSTANTS
} from '../src/child-disability-benefit-navigator.js';

import {
  evaluateChildWelfareAndGuardianship
} from '../src/child-welfare-guardianship-navigator.js';

import {
  evaluateChildCareSubsidy
} from '../src/childcare-subsidy-navigator.js';

import {

  evaluateNewcomerWealthPlan
} from '../src/cra-newcomer-wealth-navigator.js';

import {
  evaluateCrossBorderTaxObligations
} from '../src/cross-border-tax-navigator.js';

import {
  evaluatePlatformWorkerRights
} from '../src/digital-platform-worker-navigator.js';

import {
  evaluateEiDisqualificationAndAllocation
} from '../src/ei-disqualification-navigator.js';

import {
  evaluateEstatePlanProfile
} from '../src/estate-planning-navigator.js';

import {
  evaluateExcessiveDemandMitigation
} from '../src/excessive-demand-mitigation-navigator.js';

// Recommendation 261
test('Rec 261: BC Speculation Tax Declaration — String numeric coercion, bounded text, and principal residence exemption', () => {
  const result = evaluateBcSpeculationTaxDeclaration({
    assessedPropertyValueCad: '1500000',
    monthsOccupiedInYear: '8',
    ownerName: 'Jane Doe\u0000',
    propertyRegion: 'Metro Vancouver',
    ownerCitizenshipStatus: 'canadian_citizen_or_pr',
    propertyUseCategory: 'principal_residence',
    calendarTaxYear: '2025'
  });
  assert.equal(result.assessedPropertyValueCad, 1500000);
  assert.equal(result.ownerName, 'Jane Doe');
  assert.equal(result.isExemptFromSvt, true);
  assert.equal(result.estimatedTaxLiabilityCad, 0);
  assert.ok(result.statutoryAuthority.includes('s. 37'));
});

// Recommendation 262
test('Rec 262: BC Strata Bylaw Defense — Bill 44 rental restrictions and bounded names', () => {
  const result = evaluateBcStrataBylawDefense({
    disputeType: 'rental_restriction',
    isLongTermRental: true,
    rentalTermMonths: '12',
    strataPlanNumber: 'LMS 4321\u0000',
    unitNumber: '502',
    ownerOrTenantName: 'John Smith',
    fineAmountLeviedCad: '400'
  });
  assert.equal(result.strataPlanNumber, 'LMS 4321');
  assert.equal(result.unitNumber, '502');
  assert.equal(result.residentName, 'John Smith');
  assert.equal(result.isBylawEnforceable, false);
  assert.ok(result.statutoryProtections.some(p => p.includes('Bill 44')));
});

// Recommendation 263
test('Rec 263: BC PNP Tech Stream — String numerics, NOC list audit, and SIRS points', () => {
  const result = evaluateBcTechPilotEligibility({
    nocCode: '21231',
    hourlyWageCad: '48.50',
    regionalMedianHourlyWageCad: '42.00',
    jobOfferDurationDays: '365',
    employerFullTimeEmployeesCount: '10',
    yearsOfDirectTechExperience: '4',
    languageClbLevel: '8',
    highestEducationLevel: 'bachelors_degree',
    jobLocationRegion: 'METRO_VANCOUVER'
  });
  assert.equal(result.isNocInTechList, true);
  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_BC_PNP_TECH_DRAW');
  assert.equal(result.criteriaSummary.offeredHourlyWageCad, 48.50);
  assert.equal(result.criteriaSummary.regionalMedianHourlyWageCad, 42.00);
  assert.equal(result.criteriaSummary.employerFullTimeStaffCount, 10);
  assert.ok(result.criteriaSummary.estimatedSirsScore > 50);
});

// Recommendation 264
test('Rec 264: BC SVT Notice of Objection — Safe date parsing, limitation tracking, and evidence checklist', () => {
  const result = auditBcSvtNoticeOfObjection({
    assessmentNoticeDate: '2026-09-01',
    currentDate: '2026-10-15',
    assessedAmountCad: '30000',
    objectionGround: 'arm_length_tenancy_occupied',
    hasTenancyAgreementOrProof: true,
    isStayOfCollectionRequested: true,
    ownerName: 'Robert Langdon',
    propertyRollNumber: 'ROLL-1234-5678'
  });
  assert.equal(result.isWithin90Days, true);
  assert.equal(result.daysElapsed, 44);
  assert.equal(result.daysRemaining, 46);
  assert.equal(result.objectionStatus, 'TIMELY');
  assert.equal(result.assessedAmountCad, 30000);
  assert.equal(result.ownerName, 'Robert Langdon');
  assert.ok(result.requiredEvidence.length >= 3);
});

// Recommendation 265
test('Rec 265: BC Strata Depreciation Report & CRF — Mandatory 5-year cycle, 2024 waiver repeal, and 10% CRF contribution', () => {
  const result = evaluateBcStrataDepreciationReport({
    strataLotsCount: '30',
    yearsSinceLastDepreciationReport: '7',
    reportAuthorCredential: 'CERTIFIED_RESERVE_PLANNER_CRP',
    annualOperatingBudgetCad: '150000',
    annualCrfContributionCad: '10000',
    strataAttemptedAnnualWaiverVote: true,
    strataPlanNumber: 'BCS 9999',
    strataCorporationName: 'The Owners, Strata Plan BCS 9999'
  });
  assert.equal(result.strataLotsCount, 30);
  assert.equal(result.isMandatoryReportStrata, true);
  assert.equal(result.complianceStatus, 'STATUTORY_STRATA_GOVERNANCE_BREACH');
  assert.equal(result.crfContributionAudit.statutoryMinimumCrfContributionCad, 15000);
  assert.equal(result.crfContributionAudit.crfContributionDeficitCad, 5000);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'OVERDUE_DEPRECIATION_REPORT'));
  assert.ok(result.statutoryViolations.some(v => v.rule === 'ILLEGAL_DEPRECIATION_REPORT_WAIVER_ATTEMPT'));
});

// Recommendation 266
test('Rec 266: BC Strata Short-Term Rental — Fining limits and Section 135 procedural due process', () => {
  const result = auditBcStrataShortTermRental({
    rentalStayDays: '4',
    communityPopulation: '50000',
    fineAmountPerDayCad: '1200',
    totalDaysFined: '2',
    hasRegisteredStrBylawProhibition: true,
    isPrincipalResidence: false,
    receivedWrittenNoticeOfComplaint: false,
    providedOpportunityToBeHeard: false
  });
  assert.equal(result.stayDurationDays, 4);
  assert.equal(result.isShortTermRental, true);
  assert.equal(result.areFinesLegallyEnforceable, false);
  assert.equal(result.complianceStatus, 'STRATA_FINES_DEFECTIVE_PROCEDURAL_BREACH');
  assert.ok(result.fineAudit.fineDefects.some(d => d.defectType === 'EXCESSIVE_FINE_ABOVE_STATUTORY_CEILING'));
  assert.ok(result.fineAudit.fineDefects.some(d => d.defectType === 'NO_WRITTEN_NOTICE_OF_COMPLAINT'));
  assert.ok(result.fineAudit.fineDefects.some(d => d.defectType === 'DENIAL_OF_OPPORTUNITY_TO_BE_HEARD'));
});

// Recommendation 267
test('Rec 267: Child Disability Benefit & RDSP — Phase-out calculation, grant matching, and carry-forward', () => {
  const result = evaluateChildDisabilityBenefit({
    childAgeYears: '9',
    hasApprovedDtcT2201: true,
    familyNetIncomeCad: '65000',
    annualRdspContributionCad: '1500',
    unclaimedPastYears: '2',
    childName: 'Alex Mercer',
    parentName: 'Sam Mercer'
  });
  assert.equal(result.childDisabilityBenefit.childAgeYears, 9);
  assert.equal(result.childDisabilityBenefit.isEligible, true);
  assert.equal(result.childDisabilityBenefit.annualBenefitCad, DISABILITY_BENEFIT_CONSTANTS.ANNUAL_CDB_MAX_AMOUNT_CAD);
  assert.equal(result.rdspEntitlements.proposedAnnualContributionCad, 1500);
  assert.equal(result.rdspEntitlements.estimatedAnnualGrantCad, 3500);
  assert.equal(result.rdspEntitlements.retroactiveCatchUpPotentialCad, 7000);
  assert.equal(result.beneficiaryName, 'Alex Mercer');
});

// Recommendation 268
test('Rec 268: Child Welfare & Guardianship — Infant age 0 bugfix and VYSA rights', () => {
  const infantResult = evaluateChildWelfareAndGuardianship({
    youthAgeYears: 0,
    pathway: 'kinship_guardianship',
    hasSafeExtendedFamily: true,
    kinshipRelationship: 'grandparent',
    youthName: 'Baby Doe'
  });
  assert.equal(infantResult.pathway, 'kinship_guardianship');
  assert.equal(infantResult.isKinshipPriority, true);
  assert.equal(infantResult.youthName, 'Baby Doe');
  assert.ok(infantResult.compliancePoints.some(p => p.includes('grandparent')));

  const vysaResult = evaluateChildWelfareAndGuardianship({
    youthAgeYears: '16',
    pathway: 'vysa_youth_services',
    youthName: 'Taylor Morgan'
  });
  assert.equal(vysaResult.isVysaEligible, true);
  assert.ok(vysaResult.statutoryProtections.some(p => p.includes('INDEPENDENT YOUTH CONSENT')));
  assert.ok(vysaResult.statutoryProtections.some(p => p.includes('Office of the Children\'s Lawyer')));
});

// Recommendation 269
test('Rec 269: Child Care Subsidy & CWELCC — Fee caps, municipal subsidy, and strict wording guard', () => {
  const result = evaluateChildCareSubsidy({
    province: 'ON',
    municipality: 'Toronto',
    adjustedFamilyNetIncomeCad: '18000',
    baselineMonthlyFeePerChildCad: '1400',
    children: [{ ageYears: 2, hasDisability: false }],
    isEnrolledInCwelccLicensedCentre: true,
    applicantName: 'Elena Rostova'
  });
  assert.equal(result.applicantName, 'Elena Rostova');
  assert.equal(result.municipality, 'Toronto');
  assert.equal(result.subsidyCalculation.annualParentalContributionCad, 0);
  assert.equal(result.childAudits[0].isCwelccEligible, true);
  assert.ok(result.compliancePoints.some(p => p.includes('100% full fee subsidy')));
});

// Recommendation 270
test('Rec 270: CRA Newcomer Wealth & First Home — FHSA, HBP, TFSA penalty, landing step-up, and AML gift proof', () => {
  const master = evaluateNewcomerWealthPlan({
    fhsa: {
      age: '30',
      isCanadianResidentForTax: true,
      hasOwnedHomeInPreceding4Years: false,
      plannedContributionCad: '8000',
      unusedCarryforwardFromPriorYearsCad: '4000'
    },
    hbp: {
      rrspBalanceCad: '70000',
      requestedWithdrawalCad: '60000',
      withdrawalDate: '2024-05-15'
    },
    tfsa: {
      isCanadianTaxResident: false,
      contributionAmountCad: '6000',
      monthsMaintainedWhileNonResident: '4'
    },
    foreignProperty: {
      landingDate: '2025-06-01',
      foreignPropertyOriginalCostCad: '200000',
      foreignPropertyFmvAtLandingCad: '350000',
      taxYearToAssess: '2025'
    },
    gift: {
      giftAmountCad: '95000',
      relationshipToDonor: 'parent',
      hasSignedDeedOfGift: true,
      hasBankConfirmationWireSlip: true
    }
  });

  assert.equal(master.firstHomeStrategies.fhsa.isEligible, true);
  assert.equal(master.firstHomeStrategies.fhsa.maxAllowableContributionThisYearCad, 12000);
  assert.equal(master.firstHomeStrategies.hbp.isEligible, true);
  assert.equal(master.firstHomeStrategies.hbp.maxAllowableWithdrawalCad, 60000);
  assert.equal(master.taxCompliance.tfsaPenalty.isPenaltyApplicable, true);
  assert.equal(master.taxCompliance.tfsaPenalty.penaltyTaxOwedCad, 240);
  assert.equal(master.taxCompliance.foreignProp.t1135ReportingAudit.isFirstYearExemptionApplicable, true);
  assert.equal(master.taxCompliance.giftAml.fintracAmlAudit.isAuditReady, true);
});

// Recommendation 271
test('Rec 271: Cross-Border Tax Obligations — CRA T1135, US FBAR, and PFIC exposure', () => {
  const result = evaluateCrossBorderTaxObligations({
    isCanadianTaxResident: true,
    taxYear: '2026',
    isFirstYearCanadianResident: false,
    foreignPropertyCostAmountCad: '280000',
    isUsPerson: true,
    usFilingStatus: 'single',
    peakForeignAccountsUsd: '25000',
    yearEndForeignAccountsUsd: '18000',
    holdsCanadianMutualFundsOrEtfs: true,
    clientName: 'Sarah Jenkins'
  });
  assert.equal(result.clientName, 'Sarah Jenkins');
  assert.equal(result.craAudit.t1135Required, true);
  assert.equal(result.craAudit.t1135Tier, 'detailed_part_b');
  assert.equal(result.irsAudit.fbarFinCen114Required, true);
  assert.equal(result.irsAudit.pficExposureWarning, true);
  assert.ok(result.riskFlags.some(f => f.includes('PFIC EXPOSURE')));
});

// Recommendation 272
test('Rec 272: Digital Platform Workers Rights — Engaged minimum wage and de-platforming notice', () => {
  const result = evaluatePlatformWorkerRights({
    province: 'ON',
    platformName: 'SwiftDrop Deliveries',
    workerType: 'food_delivery',
    engagedHoursInPeriod: '35',
    actualBasePayReceivedCad: '400',
    tipsReceivedCad: '90',
    tipsWithheldOrSubsidized: true,
    hasDeplatformingAction: true,
    noticeDaysGivenBeforeDeplatform: '3',
    providedWrittenReason: false,
    workerName: 'Tariq Al-Mansoor'
  });
  assert.equal(result.workerName, 'Tariq Al-Mansoor');
  assert.equal(result.platformName, 'SwiftDrop Deliveries');
  assert.equal(result.wageAudit.hasWageTheft, true);
  assert.equal(result.deplatformingAudit.isUnlawfulDeplatforming, true);
  assert.ok(result.violations.some(v => v.includes('Unlawful tip retention')));
  assert.ok(result.violations.some(v => v.includes('Unlawful account deactivation')));
});

// Recommendation 273
test('Rec 273: EI Disqualification & Separation Monies — Brissette misconduct doctrine and special benefits wording', () => {
  const result = evaluateEiDisqualificationAndAllocation({
    separationType: 'employer_dismissal',
    employerAllegedMisconduct: true,
    allegedMisconductType: 'incompetence_performance',
    normalWeeklyGrossEarningsCad: '1000',
    severancePayReceivedCad: '5000',
    vacationPayPaidOutCad: '1000',
    payInLieuOfNoticeCad: '2000',
    isClaimingSpecialBenefits: true,
    insurableHoursAccumulated: '800',
    applicantName: 'David Chen',
    employerName: 'Apex Logistics Corp.'
  });
  assert.equal(result.applicantName, 'David Chen');
  assert.equal(result.employerName, 'Apex Logistics Corp.');
  assert.equal(result.misconductAudit.misconductAuditResult, 'incompetence_not_misconduct');
  assert.equal(result.regularBenefits.isDisqualifiedFromRegularBenefits, false);
  assert.equal(result.separationMoniesAllocation.totalSeparationMoniesCad, 8000);
  assert.equal(result.separationMoniesAllocation.estimatedAllocationDelayWeeks, 8);
  assert.equal(result.specialBenefitsOverride.specialBenefitsAvailable, true);
  assert.ok(result.statutoryNotes.some(n => n.includes('remain fully payable')));
  assert.ok(!JSON.stringify(result).includes('remain 100% payable'));
});

// Recommendation 274
test('Rec 274: Estate Planning & Wills — Joint tenancy probate bypass, foreign will revocation trap, and intestacy', () => {
  const result = evaluateEstatePlanProfile({
    province: 'ON',
    maritalStatus: 'common_law',
    hasChildren: true,
    childrenCount: '2',
    canadianRealEstateCad: '900000',
    realEstateOwnershipStructure: 'joint_tenancy',
    canadianRegisteredAccountsCad: '150000',
    hasDesignatedBeneficiariesOnRegisteredAccounts: true,
    canadianBankAccountsAndLiquidCad: '60000',
    hasForeignRealEstateOrAssets: true,
    foreignCountry: 'United Kingdom',
    hasExistingForeignWill: true,
    hasCanadianWill: false,
    namedExecutorLocation: 'abroad'
  });
  assert.equal(result.probateTaxAnalysis.bypassedEstateValueCad, 1050000);
  assert.equal(result.probateTaxAnalysis.probateSubjectEstateValueCad, 60000);
  assert.equal(result.probateTaxAnalysis.estimatedProbateTaxCad, 150); // ($60k - $50k) * 0.015 = $150
  assert.equal(result.foreignAssetsStrategy.recommendedWillStructure, 'MULTIPLE_CONCURRENT_WILLS');
  assert.equal(result.intestacyRiskAudit.commonLawSpouseDisinheritanceRisk, true);
  assert.equal(result.powerOfAttorneyAudit.nonResidentExecutorRisk.isHighRisk, true);
});

// Recommendation 275
test('Rec 275: Excessive Demand Mitigation — Sapru medication mitigation, Colaco hospitalization rule, and PFL response', () => {
  const result = evaluateExcessiveDemandMitigation({
    immigrationStream: 'economic_express_entry',
    diagnosedCondition: 'Rheumatoid Arthritis',
    estimatedAnnualMedicationCostCad: '25000',
    estimatedAnnualHospitalCostCad: '3000',
    estimatedAnnualSocialServicesCostCad: '1000',
    hasPrivateInsuranceDrugCoverage: true,
    privateInsuranceDrugLimitAnnualCad: '25000',
    liquidFundsAvailableForCareCad: '50000',
    receivedProceduralFairnessLetter: true,
    pflReceivedDate: '2026-10-10',
    assessmentDate: '2026-10-25',
    applicantName: 'Vikram Malhotra'
  });
  assert.equal(result.applicantName, 'Vikram Malhotra');
  assert.equal(result.diagnosedCondition, 'Rheumatoid Arthritis');
  assert.equal(result.admissibilityStatus, 'admissible_with_mitigation');
  assert.equal(result.costAssessment.drugInsuranceOffsetAnnualCad, 25000);
  assert.equal(result.costAssessment.netAnnualPublicCostCad, 3000); // 0 meds + 0 social (covered by 10k/yr liquid) + 3000 hosp
  assert.equal(result.pflAudit.hasReceivedPfl, true);
  assert.equal(result.pflAudit.daysRemainingToRespond, 45); // 60 - 15 = 45
  assert.equal(result.mitigationViability.hospitalCareMitigable, false);
});
