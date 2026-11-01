import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateBcSpeculationTaxDeclaration } from '../src/bc-speculation-tax-declaration-navigator.js';
import { evaluateBcStrataBylawDefense } from '../src/bc-strata-bylaw-navigator.js';
import { evaluateBcTechPilotEligibility } from '../src/british-columbia-pnp-skills-immigration-tech-navigator.js';
import { auditBcSvtNoticeOfObjection } from '../src/british-columbia-speculation-tax-audit-appeal-navigator.js';
import { evaluateBcStrataDepreciationReport } from '../src/british-columbia-strata-depreciation-report-reserve-fund-navigator.js';
import { auditBcStrataShortTermRental } from '../src/british-columbia-strata-short-term-rental-bylaw-navigator.js';
import { evaluateChildDisabilityBenefit } from '../src/child-disability-benefit-navigator.js';
import { evaluateChildWelfareAndGuardianship } from '../src/child-welfare-guardianship-navigator.js';
import { evaluateChildCareSubsidy } from '../src/childcare-subsidy-navigator.js';
import {
  evaluateFhsaEligibility,
  evaluateHbpWithdrawal,
  evaluateForeignPropertyAndLandingStepUp,
  evaluateNewcomerWealthPlan
} from '../src/cra-newcomer-wealth-navigator.js';
import {
  evaluateCrossBorderTaxObligations,
  generateCrossBorderMemorandum
} from '../src/cross-border-tax-navigator.js';
import { evaluatePlatformWorkerRights } from '../src/digital-platform-worker-navigator.js';
import { evaluateEiDisqualificationAndAllocation } from '../src/ei-disqualification-navigator.js';
import { evaluateEstatePlanProfile } from '../src/estate-planning-navigator.js';
import { evaluateExcessiveDemandMitigation } from '../src/excessive-demand-mitigation-navigator.js';

test('Batch 22 Recommendations (Sweep 29: Recs 396–410)', async (t) => {
  await t.test('Rec 396: evaluateBcSpeculationTaxDeclaration sanitizes dates and audits satellite family exclusion', () => {
    const res = evaluateBcSpeculationTaxDeclaration({
      propertyRegion: 'Metro Vancouver',
      assessedPropertyValueCad: 1500000,
      ownerCitizenshipStatus: 'canadian_citizen_or_pr',
      isSatelliteFamily: true,
      propertyUseCategory: 'principal_residence',
      monthsOccupiedInYear: 12,
      ownerName: '  Jane Doe  ',
      calendarTaxYear: '2025',
      assessmentDate: 'invalid-date'
    });

    assert.equal(res.ownerName, 'Jane Doe');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.isTaxableRegion, true);
    assert.equal(res.isExemptFromSvt, false);
    assert.equal(res.applicableTaxRatePercent, 2.0);
    assert.equal(res.estimatedTaxLiabilityCad, 30000);
    assert.ok(res.riskWarnings.some(w => w.includes('SATELLITE FAMILY BAR')));

    const exemptRes = evaluateBcSpeculationTaxDeclaration({
      propertyRegion: 'Metro Vancouver',
      assessedPropertyValueCad: 1500000,
      ownerCitizenshipStatus: 'canadian_citizen_or_pr',
      isSatelliteFamily: false,
      propertyUseCategory: 'principal_residence',
      monthsOccupiedInYear: 12,
      assessmentDate: '2026-11-01'
    });
    assert.equal(exemptRes.isExemptFromSvt, true);
    assert.equal(exemptRes.estimatedTaxLiabilityCad, 0);
    assert.equal(exemptRes.assessmentDate, '2026-11-01');
  });

  await t.test('Rec 397: evaluateBcStrataBylawDefense audits Bill 44 rental repeal and bounds resident inputs', () => {
    const res = evaluateBcStrataBylawDefense({
      disputeType: 'rental_restriction',
      isLongTermRental: true,
      rentalTermMonths: 12,
      fineAmountLeviedCad: 600,
      strataDemandedTenantScreening: true,
      ownerOrTenantName: '  Alice Smith  ',
      strataPlanNumber: '  LMS 4567  ',
      unitNumber: '  402  ',
      assessmentDate: 'malformed-date'
    });

    assert.equal(res.residentName, 'Alice Smith');
    assert.equal(res.strataPlanNumber, 'LMS 4567');
    assert.equal(res.unitNumber, '402');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.isBylawEnforceable, false);
    assert.equal(res.unlawfulFineRefundCad, 600);
    assert.ok(res.violations.some(v => v.includes('Void residential rental restriction')));
    assert.ok(res.violations.some(v => v.includes('Unlawful tenant screening')));
    assert.ok(res.statutoryProtections.some(p => p.includes('Bill 44')));

    // Service dog test
    const petRes = evaluateBcStrataBylawDefense({
      disputeType: 'pet_bylaw',
      isCertifiedServiceDog: true
    });
    assert.equal(petRes.isBylawEnforceable, false);
    assert.ok(petRes.violations.some(v => v.includes('certified service dog')));
  });

  await t.test('Rec 398: evaluateBcTechPilotEligibility audits 35 tech NOCs and bounds candidate credentials', () => {
    const techRes = evaluateBcTechPilotEligibility({
      nocCode: '21231',
      jobOfferDurationDays: 365,
      isJobOfferFullTime: true,
      hourlyWageCad: 52.00,
      regionalMedianHourlyWageCad: 42.00,
      jobLocationRegion: 'METRO_VANCOUVER',
      employerFullTimeEmployeesCount: 10,
      yearsOfDirectTechExperience: 4,
      languageClbLevel: 8,
      highestEducationLevel: 'bachelors_degree',
      candidateName: '  Dev Engineer  ',
      employerName: '  BC Cloud Solutions Ltd.  ',
      assessmentDate: 'not-a-date'
    });

    assert.equal(techRes.candidateName, 'Dev Engineer');
    assert.equal(techRes.employerName, 'BC Cloud Solutions Ltd.');
    assert.equal(techRes.assessmentDate, '2026-10-31');
    assert.equal(techRes.isNocInTechList, true);
    assert.equal(techRes.isEligible, true);
    assert.equal(techRes.eligibilityVerdict, 'ELIGIBLE_FOR_BC_PNP_TECH_DRAW');
    assert.ok(techRes.criteriaSummary.estimatedSirsScore > 90);

    const nonTechRes = evaluateBcTechPilotEligibility({
      nocCode: '65100', // Cashier (non-tech)
      jobOfferDurationDays: 180
    });
    assert.equal(nonTechRes.isNocInTechList, false);
    assert.equal(nonTechRes.isEligible, false);
    assert.equal(nonTechRes.eligibilityVerdict, 'INELIGIBLE_NON_TECH_NOC');
  });

  await t.test('Rec 399: auditBcSvtNoticeOfObjection tracks 90-day strict objection window safely', () => {
    const res = auditBcSvtNoticeOfObjection({
      assessmentNoticeDate: '2026-09-01',
      currentDate: '2026-10-01',
      assessedAmountCad: 18000,
      objectionGround: 'arm_length_tenancy_occupied',
      hasTenancyAgreementOrProof: true,
      isStayOfCollectionRequested: true,
      ownerName: '  Robert Taylor  ',
      propertyRollNumber: '  ROLL-9999-1111  '
    });

    assert.equal(res.ownerName, 'Robert Taylor');
    assert.equal(res.propertyRollNumber, 'ROLL-9999-1111');
    assert.equal(res.isWithin90Days, true);
    assert.equal(res.daysElapsed, 30);
    assert.equal(res.daysRemaining, 60);
    assert.equal(res.objectionStatus, 'TIMELY');
    assert.equal(res.deficiencies.length, 0);

    // Lapsed 90-day limitation test
    const lapsedRes = auditBcSvtNoticeOfObjection({
      assessmentNoticeDate: '2026-05-01',
      currentDate: '2026-10-01'
    });
    assert.equal(lapsedRes.isWithin90Days, false);
    assert.equal(lapsedRes.objectionStatus, 'BARRED_BY_LIMITATION');
    assert.ok(lapsedRes.deficiencies.some(d => d.rule.includes('Expired')));
  });

  await t.test('Rec 400: evaluateBcStrataDepreciationReport enforces 2024 waiver repeal and 10% CRF reserve', () => {
    const res = evaluateBcStrataDepreciationReport({
      strataLotsCount: 30,
      yearsSinceLastDepreciationReport: 7,
      annualOperatingBudgetCad: 120000,
      annualCrfContributionCad: 6000, // Deficit: 10% is $12,000
      strataAttemptedAnnualWaiverVote: true,
      reportAuthorCredential: 'CERTIFIED_RESERVE_PLANNER_CRP',
      strataPlanNumber: '  EPS 8888  ',
      strataCorporationName: '  The Owners, Strata Plan EPS 8888  ',
      assessmentDate: 'bad-date'
    });

    assert.equal(res.strataPlanNumber, 'EPS 8888');
    assert.equal(res.strataCorporationName, 'The Owners, Strata Plan EPS 8888');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.isMandatoryReportStrata, true);
    assert.equal(res.complianceStatus, 'STATUTORY_STRATA_GOVERNANCE_BREACH');
    assert.equal(res.crfContributionAudit.crfContributionDeficitCad, 6000);
    assert.ok(res.statutoryViolations.some(v => v.rule === 'OVERDUE_DEPRECIATION_REPORT'));
    assert.ok(res.statutoryViolations.some(v => v.rule === 'ILLEGAL_DEPRECIATION_REPORT_WAIVER_ATTEMPT'));
    assert.ok(res.statutoryViolations.some(v => v.rule === 'SUBSTANDARD_ANNUAL_CRF_CONTRIBUTION'));
  });

  await t.test('Rec 401: auditBcStrataShortTermRental audits STRAA 2023 principal residence and SPA s. 135 defense', () => {
    const res = auditBcStrataShortTermRental({
      hasRegisteredStrBylawProhibition: true,
      isPrincipalResidence: false,
      rentalStayDays: 4,
      communityPopulation: 35000,
      fineAmountPerDayCad: 1000,
      totalDaysFined: 3,
      receivedWrittenNoticeOfComplaint: false, // Breach of s. 135(1)(a)
      providedOpportunityToBeHeard: false, // Breach of s. 135(1)(b)
      hostName: '  Host Bob  ',
      strataPlanNumber: '  VR 1001  ',
      unitNumber: '  505  ',
      assessmentDate: 'malformed-date'
    });

    assert.equal(res.hostName, 'Host Bob');
    assert.equal(res.strataPlanNumber, 'VR 1001');
    assert.equal(res.unitNumber, '505');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.isShortTermRental, true);
    assert.equal(res.isSubjectToProvincialPrincipalResidenceRule, true);
    assert.equal(res.totalAssessedFinesCad, 3000);
    assert.equal(res.areFinesLegallyEnforceable, false);
    assert.equal(res.complianceStatus, 'STRATA_FINES_DEFECTIVE_PROCEDURAL_BREACH');
    assert.ok(res.fineAudit.fineDefects.some(d => d.defectType === 'NO_WRITTEN_NOTICE_OF_COMPLAINT'));
    assert.ok(res.fineAudit.fineDefects.some(d => d.defectType === 'DENIAL_OF_OPPORTUNITY_TO_BE_HEARD'));
  });

  await t.test('Rec 402: evaluateChildDisabilityBenefit calculates CDB phase-out and RDSP grant matching', () => {
    const res = evaluateChildDisabilityBenefit({
      childAgeYears: 7,
      hasApprovedDtcT2201: true,
      dtcConditionIsProlonged: true,
      familyNetIncomeCad: 60000,
      annualRdspContributionCad: 1500,
      unclaimedPastYears: 2,
      childName: '  Leo Brown  ',
      parentName: '  Sarah Brown  ',
      assessmentDate: 'invalid-date'
    });

    assert.equal(res.beneficiaryName, 'Leo Brown');
    assert.equal(res.parentName, 'Sarah Brown');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.dtcStatus.isDtcPrerequisiteSatisfied, true);
    assert.equal(res.childDisabilityBenefit.isEligible, true);
    assert.equal(res.childDisabilityBenefit.annualBenefitCad, 3173.0);
    assert.equal(res.rdspEntitlements.estimatedAnnualGrantCad, 3500.0);
    assert.equal(res.rdspEntitlements.retroactiveCatchUpPotentialCad, 7000.0);
  });

  await t.test('Rec 403: evaluateChildWelfareAndGuardianship audits VYSA rights and direct citizenship', () => {
    const vysaRes = evaluateChildWelfareAndGuardianship({
      pathway: 'vysa_youth_services',
      youthAgeYears: 16,
      protectionGrounds: ['abandonment_forced_homelessness'],
      youthName: '  Youth Alex  ',
      assessmentDate: 'invalid-date'
    });

    assert.equal(vysaRes.youthName, 'Youth Alex');
    assert.equal(vysaRes.assessmentDate, '2026-10-31');
    assert.equal(vysaRes.isVysaEligible, true);
    assert.ok(vysaRes.statutoryProtections.some(p => p.includes('INDEPENDENT YOUTH CONSENT')));
    assert.ok(vysaRes.statutoryProtections.some(p => p.includes('LEGAL REPRESENTATION')));

    // Intercountry adoption direct citizenship grant
    const adoptRes = evaluateChildWelfareAndGuardianship({
      pathway: 'intercountry_adoption',
      isCanadianCitizenParentForAdoption: true,
      adoptionLegallyFinalizedAbroad: true,
      preAdoptionTiesSevered: true,
      isHagueConventionCountry: true
    });
    assert.equal(adoptRes.isDirectCitizenshipGrantEligible, true);
    assert.ok(adoptRes.statutoryProtections.some(p => p.includes('DIRECT CITIZENSHIP GRANT')));
  });

  await t.test('Rec 404: evaluateChildCareSubsidy calculates Ontario O. Reg. 138/15 and CWELCC discounts', () => {
    const res = evaluateChildCareSubsidy({
      province: 'ON',
      municipality: 'Toronto',
      adjustedFamilyNetIncomeCad: 18000,
      children: [{ ageYears: 3, hasDisability: false }],
      baselineMonthlyFeePerChildCad: 1200,
      isEnrolledInCwelccLicensedCentre: true,
      applicantName: '  Parent Maria  ',
      assessmentDate: 'bad-date'
    });

    assert.equal(res.applicantName, 'Parent Maria');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.subsidyCalculation.annualParentalContributionCad, 0);
    assert.equal(res.subsidyCalculation.actualMonthlyParentPaymentWithSubsidyCad, 0);
    assert.ok(res.compliancePoints.some(p => p.includes('100% full fee subsidy')));
    assert.equal(res.childAudits[0].isCwelccEligible, true);
    assert.equal(res.childAudits[0].cwelccDiscountedMonthlyFeeCad, 567.0);
  });

  await t.test('Rec 405: evaluateNewcomerWealthPlan evaluates FHSA, HBP, TFSA penalty, and landing step-up', () => {
    const plan = evaluateNewcomerWealthPlan({
      applicantName: '  Newcomer Dave  ',
      assessmentDate: 'invalid-date',
      fhsa: {
        isCanadianResidentForTax: true,
        age: 30,
        hasOwnedHomeInPreceding4Years: false,
        plannedContributionCad: 8000,
        marginalTaxRatePercent: 30
      },
      hbp: {
        rrspBalanceCad: 60000,
        requestedWithdrawalCad: 60000,
        withdrawalDate: '2024-05-01',
        isFirstTimeHomeBuyer: true,
        fundsInRrspForAtLeast90Days: true
      },
      tfsa: {
        isCanadianTaxResident: false,
        contributionAmountCad: 5000,
        monthsMaintainedWhileNonResident: 6
      },
      foreignProperty: {
        landingDate: '2025-06-15',
        foreignPropertyOriginalCostCad: 200000,
        foreignPropertyFmvAtLandingCad: 350000,
        taxYearToAssess: 2025
      }
    });

    assert.equal(plan.applicantName, 'Newcomer Dave');
    assert.equal(plan.assessmentDate, '2026-10-31');
    assert.equal(plan.firstHomeStrategies.fhsa.isEligible, true);
    assert.equal(plan.firstHomeStrategies.fhsa.actualDeductibleContributionCad, 8000);
    assert.equal(plan.firstHomeStrategies.hbp.isEligible, true);
    assert.equal(plan.firstHomeStrategies.hbp.maxAllowableWithdrawalCad, 60000);
    assert.equal(plan.firstHomeStrategies.combinedPurchasingPowerCad, 68000);
    assert.equal(plan.taxCompliance.tfsaPenalty.isPenaltyApplicable, true);
    assert.equal(plan.taxCompliance.tfsaPenalty.penaltyTaxOwedCad, 300);
    assert.equal(plan.taxCompliance.foreignProp.landingCostBaseStepUp.preLandingAccruedGainsShelteredCad, 150000);
    assert.equal(plan.taxCompliance.foreignProp.t1135ReportingAudit.isFirstYearExemptionApplicable, true);
  });

  await t.test('Rec 406: evaluateCrossBorderTaxObligations audits CRA T1135 and US FBAR thresholds', () => {
    const res = evaluateCrossBorderTaxObligations({
      isCanadianTaxResident: true,
      taxYear: 2026,
      isFirstYearCanadianResident: false,
      foreignPropertyCostAmountCad: 150000,
      isUsPerson: true,
      usFilingStatus: 'single',
      peakForeignAccountsUsd: 25000,
      yearEndForeignAccountsUsd: 15000,
      holdsCanadianMutualFundsOrEtfs: true,
      hasCanadianTfsa: true,
      clientName: '  Cross-Border Dan  ',
      assessmentDate: 'invalid-date'
    });

    assert.equal(res.clientName, 'Cross-Border Dan');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.craAudit.t1135Required, true);
    assert.equal(res.craAudit.t1135Tier, 'simplified_part_a');
    assert.equal(res.irsAudit.fbarFinCen114Required, true);
    assert.equal(res.irsAudit.pficExposureWarning, true);
    assert.equal(res.irsAudit.foreignTrustWarning, true);
    assert.ok(res.riskFlags.some(f => f.includes('PFIC EXPOSURE')));

    const memo = generateCrossBorderMemorandum({
      clientName: '  Cross-Border Dan  ',
      taxYear: 2026,
      craT1135Required: true,
      fbarRequired: true,
      assessmentDate: '2026-11-01'
    });
    assert.ok(memo.includes('Cross-Border Dan'));
    assert.ok(memo.includes('Date: 2026-11-01'));
  });

  await t.test('Rec 407: evaluatePlatformWorkerRights audits engaged minimum wage and de-platforming notice', () => {
    const onRes = evaluatePlatformWorkerRights({
      province: 'ON',
      engagedHoursInPeriod: 40,
      actualBasePayReceivedCad: 500, // Shortfall: 40 * $17.20 = $688.00
      tipsWithheldOrSubsidized: true,
      tipsReceivedCad: 100,
      hasDeplatformingAction: true,
      noticeDaysGivenBeforeDeplatform: 0,
      providedWrittenReason: false,
      workerName: '  Courier Sam  ',
      assessmentDate: 'malformed-date'
    });

    assert.equal(onRes.workerName, 'Courier Sam');
    assert.equal(onRes.assessmentDate, '2026-10-31');
    assert.equal(onRes.wageAudit.hasWageTheft, true);
    assert.equal(onRes.wageAudit.wageShortfallCad, 188.0);
    assert.equal(onRes.restitutionSummary.totalOwedCad, 288.0);
    assert.equal(onRes.deplatformingAudit.isUnlawfulDeplatforming, true);
    assert.ok(onRes.violations.some(v => v.includes('Sub-minimum wage')));
    assert.ok(onRes.violations.some(v => v.includes('Unlawful tip retention')));

    // BC rate test
    const bcRes = evaluatePlatformWorkerRights({
      province: 'BC',
      engagedHoursInPeriod: 10,
      actualBasePayReceivedCad: 208.80
    });
    assert.equal(bcRes.wageAudit.statutoryEngagedHourlyRateCad, 20.88);
    assert.equal(bcRes.wageAudit.hasWageTheft, false);
  });

  await t.test('Rec 408: evaluateEiDisqualificationAndAllocation applies Brissette doctrine and s. 33 override', () => {
    const perfRes = evaluateEiDisqualificationAndAllocation({
      separationType: 'employer_dismissal',
      employerAllegedMisconduct: true,
      allegedMisconductType: 'incompetence_performance',
      normalWeeklyGrossEarningsCad: 1200,
      severancePayReceivedCad: 4800,
      insurableHoursAccumulated: 800,
      isClaimingSpecialBenefits: true,
      applicantName: '  Worker Emma  ',
      employerName: '  Acme Corp  ',
      assessmentDate: 'invalid-date'
    });

    assert.equal(perfRes.applicantName, 'Worker Emma');
    assert.equal(perfRes.employerName, 'Acme Corp');
    assert.equal(perfRes.assessmentDate, '2026-10-31');
    assert.equal(perfRes.regularBenefits.isDisqualifiedFromRegularBenefits, false);
    assert.equal(perfRes.misconductAudit.misconductAuditResult, 'incompetence_not_misconduct');
    assert.equal(perfRes.specialBenefitsOverride.specialBenefitsAvailable, true);
    assert.equal(perfRes.separationMoniesAllocation.estimatedAllocationDelayWeeks, 8);
    assert.ok(perfRes.defenseArguments.some(d => d.includes('Brissette')));

    // Resignation with just cause test
    const justCauseRes = evaluateEiDisqualificationAndAllocation({
      separationType: 'voluntary_quit',
      justCauseReason: 'harassment',
      triedReasonableAlternatives: true
    });
    assert.equal(justCauseRes.regularBenefits.isDisqualifiedFromRegularBenefits, false);
    assert.equal(justCauseRes.justCauseAudit.justCauseEstablished, true);
  });

  await t.test('Rec 409: evaluateEstatePlanProfile audits probate bypass and multijurisdictional wills', () => {
    const res = evaluateEstatePlanProfile({
      province: 'ON',
      maritalStatus: 'common_law',
      hasChildren: true,
      canadianRealEstateCad: 900000,
      realEstateOwnershipStructure: 'joint_tenancy',
      canadianRegisteredAccountsCad: 150000,
      hasDesignatedBeneficiariesOnRegisteredAccounts: true,
      canadianBankAccountsAndLiquidCad: 80000,
      hasForeignRealEstateOrAssets: true,
      foreignCountry: 'United Kingdom',
      hasCanadianWill: false,
      clientName: '  Estate Client George  ',
      asOf: 'bad-date'
    });

    assert.equal(res.clientName, 'Estate Client George');
    assert.equal(res.asOf, '2026-10-31');
    assert.equal(res.probateTaxAnalysis.bypassedEstateValueCad, 1050000); // 900k + 150k
    assert.equal(res.probateTaxAnalysis.probateSubjectEstateValueCad, 80000);
    assert.equal(res.foreignAssetsStrategy.recommendedWillStructure, 'MULTIPLE_CONCURRENT_WILLS');
    assert.equal(res.intestacyRiskAudit.commonLawSpouseDisinheritanceRisk, true);
    assert.ok(res.intestacyRiskAudit.statutoryDistributionSummary.includes('ZERO statutory inheritance rights'));
    assert.ok(res.foreignAssetsStrategy.generalRevocationClauseTrap.includes('Crucial Trap'));
  });

  await t.test('Rec 410: evaluateExcessiveDemandMitigation audits Sapru medication mitigation vs Colaco preclusion', () => {
    const res = evaluateExcessiveDemandMitigation({
      immigrationStream: 'economic_express_entry',
      diagnosedCondition: 'Multiple Sclerosis',
      estimatedAnnualMedicationCostCad: 30000,
      estimatedAnnualHospitalCostCad: 2000,
      estimatedAnnualSocialServicesCostCad: 1000,
      hasPrivateInsuranceDrugCoverage: true,
      privateInsuranceDrugLimitAnnualCad: 25000,
      liquidFundsAvailableForCareCad: 50000,
      receivedProceduralFairnessLetter: true,
      pflReceivedDate: '2026-09-15',
      assessmentDate: '2026-10-15',
      applicantName: '  Applicant Chloe  '
    });

    assert.equal(res.applicantName, 'Applicant Chloe');
    assert.equal(res.assessmentDate, '2026-10-15');
    assert.equal(res.admissibilityStatus, 'admissible_with_mitigation');
    assert.equal(res.costAssessment.grossAnnualCostCad, 33000);
    assert.equal(res.costAssessment.netAnnualPublicCostCad, 7000); // 30k - 25k (meds) = 5k + 2k (hospital) + 0 (social fully offset by liquid funds)
    assert.equal(res.pflAudit.daysRemainingToRespond, 30);
    assert.ok(res.statutoryNotes.some(n => n.includes('Individualized Mitigation Plan')));

    // Colaco inpatient preclusion test
    const colacoRes = evaluateExcessiveDemandMitigation({
      immigrationStream: 'economic_express_entry',
      estimatedAnnualHospitalCostCad: 35000, // Exceeds $26,364 threshold on inpatient care alone
      hasPrivateInsuranceDrugCoverage: true
    });
    assert.equal(colacoRes.admissibilityStatus, 'inadmissible_excessive_demand');
    assert.ok(colacoRes.riskWarnings.some(w => w.includes('COLACO HOSPITALIZATION PRECLUSION')));
  });
});
