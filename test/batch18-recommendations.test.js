import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateAutoInsuranceProfile, AUTO_INSURANCE_CONSTANTS } from '../src/auto-insurance-navigator.js';
import { evaluateBowpPathway, calculateDaysToExpiry, evaluateSpousalSowp, BOWP_CONSTANTS } from '../src/bowp-navigator.js';
import { evaluateCommercialLease, COMMERCIAL_LEASE_CONSTANTS, COMMERCIAL_LEASE_TYPES } from '../src/commercial-lease-navigator.js';
import { evaluateConsumerContract, CONSUMER_PROTECTION_CONSTANTS } from '../src/consumer-protection-navigator.js';
import { evaluateVoluntaryDisclosure, CRA_VDP_CONSTANTS } from '../src/cra-voluntary-disclosure.js';
import { evaluateCredentialPathway, ECA_ORGANIZATIONS, REGULATED_PROFESSIONS } from '../src/credential-navigator.js';
import { evaluateCurrencyExchange, FINTRAC_STATUTORY_CONSTANTS, MID_MARKET_BENCHMARK_RATES } from '../src/currency-exchange-navigator.js';
import { evaluateDebtCollectionDefense, calculateYearsElapsed, DEBT_DEFENSE_CONSTANTS } from '../src/debt-collection-defense.js';
import { auditEmploymentReferenceLetter, REFERENCE_AUDIT_CONSTANTS } from '../src/employment-reference-audit.js';
import { auditEvictionNotice, EVICTION_FORM_RULES } from '../src/eviction-defense.js';
import { evaluateLmiaReadiness, PROVINCIAL_MEDIAN_WAGES_2025_2026, LMIA_EXEMPTION_CODES } from '../src/lmia-readiness-navigator.js';
import { evaluateMedicalAdmissibility, ANNUAL_EXCESSIVE_DEMAND_THRESHOLD_CAD, FIVE_YEAR_EXCESSIVE_DEMAND_THRESHOLD_CAD } from '../src/medical-admissibility.js';
import { evaluateNbpnpSkilledWorker, calculateNbpnpSettlementFunds, NBPNP_PASS_MARK_POINTS } from '../src/new-brunswick-provincial-nominee-skilled-worker-navigator.js';
import { evaluateOasGisEligibility, generateSeniorBenefitRoadmap, OAS_GIS_CONSTANTS, TOTALIZATION_PARTNER_COUNTRIES } from '../src/oas-gis-navigator.js';
import { evaluatePetImportation, CFIA_FIRST_ANIMAL_INSPECTION_FEE_CAD, BANNED_ONTARIO_BSL_BREEDS } from '../src/pet-importation.js';

test('Batch 18 Recommendations (Sweep 25: Recs 336–350)', async (t) => {
  await t.test('Rec 336: evaluateAutoInsuranceProfile audits GTA FSA rating, foreign letter discount, SABS IRB, and Take-All-Comers rule', () => {
    const res = evaluateAutoInsuranceProfile({
      province: 'ON',
      postalCode: 'L6Y 1A1', // Brampton high risk FSA
      annualGrossIncomeCad: 78000,
      employmentStatus: 'employed',
      weeksEmployedPast52: 52,
      foreignDrivingYears: 6,
      hasForeignExperienceLetter: true,
      canadianLicenceClass: 'G',
      optionalIrbEndorsementWeeklyCad: 400,
      experiencedRefusalOrUnreasonableDelay: true,
      driverName: 'Priya Sharma',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.driverName, 'Priya Sharma');
    assert.equal(res.province, 'ON');
    assert.equal(res.ratingTerritoryAnalysis.isHighPremiumZone, true);
    assert.equal(res.ratingTerritoryAnalysis.territoryTier, 'HIGH_RISK_PREMIUM_ZONE');
    assert.equal(res.experienceLetterAudit.isLetterValid, true);
    assert.equal(res.experienceLetterAudit.eligibleDrivingYearsRecognized, 6);
    assert.equal(res.ratingTerritoryAnalysis.savingsPercent, 55);
    assert.equal(res.sabsAccidentBenefits.eligibleBenefitType, 'INCOME_REPLACEMENT_BENEFIT');
    assert.equal(res.sabsAccidentBenefits.weeklyIncomeReplacementCad, 400); // capped at standard $400
    assert.equal(res.takeAllComersAudit.isViolationSuspected, true);
    assert.match(res.takeAllComersAudit.complaintAuthority, /FSRA/);
  });

  await t.test('Rec 337: evaluateBowpPathway validates Code A75 open work permit, e-AOR, restricted PNP bar, and Maintained Status', () => {
    // 1. Eligible Express Entry CEC with e-AOR
    const eligibleRes = evaluateBowpPathway({
      applicantName: 'David Chen',
      currentPermitType: 'pgwp',
      permitExpiryDate: '2026-12-31',
      isPhysicallyInCanada: true,
      prProgramApplied: 'express_entry_cec',
      hasOfficialAor: true,
      assessmentDate: '2026-10-31'
    }, new Date('2026-10-31T00:00:00Z'));

    assert.equal(eligibleRes.applicantName, 'David Chen');
    assert.equal(eligibleRes.isEligibleForBowp, true);
    assert.equal(eligibleRes.exemptionCode, 'A75');
    assert.equal(eligibleRes.resolutionVerdict, 'ELIGIBLE_FOR_BOWP');
    assert.equal(eligibleRes.totalFeeCad, 255);
    assert.equal(eligibleRes.maintainedStatus.hasMaintainedStatusRight, true);

    // 2. Restricted PNP bar
    const pnpRes = evaluateBowpPathway({
      currentPermitType: 'closed_work_permit',
      permitExpiryDate: '2026-12-31',
      isPhysicallyInCanada: true,
      prProgramApplied: 'express_entry_pnp',
      hasOfficialAor: true,
      pnpNominationHasEmployerRestrictions: true,
      pnpProvince: 'ON'
    }, new Date('2026-10-31T00:00:00Z'));

    assert.equal(pnpRes.isEligibleForBowp, false);
    assert.equal(pnpRes.resolutionVerdict, 'RESTRICTED_PNP_REQUIRES_CODE_T13');
    assert.equal(pnpRes.alternativePermitRecommendation.exemptionCode, 'T13');
  });

  await t.test('Rec 338: evaluateCommercialLease enforces Ontario CTA s. 18 15-day lockout and mutual exclusivity rule', () => {
    const res = evaluateCommercialLease({
      province: 'ON',
      baseRentMonthlyCad: 4000,
      additionalRentMonthlyCad: 1500,
      squareFootage: 1500,
      leaseType: 'triple_net_nnn',
      leaseTermYears: 5,
      yearsRemaining: 3,
      hasPersonalGuarantee: true,
      isRentOverdue: true,
      daysRentOverdue: 16, // > 15 days triggers s. 18 lockout
      landlordLockoutThreat: true,
      disputedTmiChargesCad: 4500,
      tenantBusinessName: 'Aura Artisan Bakery Ltd.',
      landlordName: 'Metro Properties Holdings Inc.',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.tenantBusinessName, 'Aura Artisan Bakery Ltd.');
    assert.equal(res.lockoutRiskLevel, 'imminent');
    assert.ok(res.statutoryRisks.some(r => r.code === 'IMMINENT_CTA_SECTION_18_LOCKOUT'));
    assert.equal(res.personalGuaranteeLiability.hasPersonalGuarantee, true);
    assert.equal(res.personalGuaranteeLiability.personalGuaranteeExposureCad, 5500 * 36);
    assert.match(res.distraintDoctrine.criticalRule, /Mutual Exclusivity Rule/);
    assert.match(res.commercialDemandLetter, /DEMAND FOR TMI OPERATING AUDIT/);
  });

  await t.test('Rec 339: evaluateConsumerContract enforces Ontario CPA Part IV.1 void ab initio door-to-door appliance ban', () => {
    // 1. Unsolicited water heater door-to-door sale
    const voidRes = evaluateConsumerContract({
      province: 'ON',
      contractType: 'water_heater_rental',
      contractDate: '2026-10-20',
      contractValueCad: 5200,
      wasUnsolicitedInHomeVisit: true,
      prescribedBannedProduct: true,
      consumerName: 'Elena Rostova',
      assessmentDate: '2026-10-31'
    });

    assert.equal(voidRes.consumerName, 'Elena Rostova');
    assert.equal(voidRes.doorToDoorBanAudit.isContractVoidAbInitio, true);
    assert.equal(voidRes.cancellationRights.canCancelWithoutPenalty, true);
    assert.match(voidRes.doorToDoorBanAudit.violationDetail, /void from the outset/);

    // 2. Standard 10-day cooling-off period
    const coolingRes = evaluateConsumerContract({
      province: 'ON',
      contractType: 'gym_membership',
      contractDate: '2026-10-25',
      wasUnsolicitedInHomeVisit: false,
      prescribedBannedProduct: false,
      assessmentDate: '2026-10-31'
    });

    assert.equal(coolingRes.cancellationRights.canCancelWithoutPenalty, true);
    assert.equal(coolingRes.cancellationRights.cancellationWindowRemainingDays, 4); // 10 - 6
  });

  await t.test('Rec 340: evaluateVoluntaryDisclosure audits CRA VDP 5 conditions, first-year T1135 exemption, and penalty relief', () => {
    const res = evaluateVoluntaryDisclosure({
      landingYear: 2024,
      taxYearsOmitted: [2024, 2025],
      maxForeignCostAmountCad: 250000,
      foreignIncomeAnnualCad: 12000,
      hasCraContactedOrAudited: false,
      hasActiveOffshoreEntitiesOrShellCompanies: false,
      hasT1135BeenFiled: false,
      taxpayerName: 'Karthik Raman',
      assessmentYear: 2026,
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.taxpayerName, 'Karthik Raman');
    assert.equal(res.eligibility.isEligible, true);
    assert.equal(res.eligibility.programTrack, 'General Program');
    assert.equal(res.reliefScope.criminalImmunityGranted, true);
    // Landing year 2024 has newcomer T1135 exemption
    const y2024 = res.t1135Audit.yearlyAudit.find(y => y.taxYear === 2024);
    assert.equal(y2024.isLandingYear, true);
    assert.match(y2024.exemptionReason, /First-year resident exemption/);
    assert.equal(y2024.potentialPenaltyCad, 0);
  });

  await t.test('Rec 341: evaluateCredentialPathway verifies FARPAA Canadian experience ban and strictly adheres to wording guard', () => {
    const res = evaluateCredentialPathway({
      profession: 'engineering',
      targetProvince: 'ON',
      originCountry: 'India',
      currentDegree: 'Bachelors',
      candidateName: 'Sunita Rao',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.candidateName, 'Sunita Rao');
    assert.equal(res.targetProvince, 'ON');
    assert.equal(res.regulatoryBody, 'Professional Engineers Ontario (PEO)');
    assert.equal(res.canadianExperiencePolicy.mandatoryCanadianExperienceRequired, false);
    assert.match(res.canadianExperiencePolicy.advisory, /fully credited toward licensing competencies/);
    assert.doesNotMatch(res.canadianExperiencePolicy.advisory, /100%/);
    assert.match(res.financialAssistance.taxDeductibility, /qualify as eligible tuition tax credits/);
    assert.doesNotMatch(res.financialAssistance.taxDeductibility, /100% tax-deductible/);
  });

  await t.test('Rec 342: evaluateCurrencyExchange audits FINTRAC $10,000 threshold, anti-structuring s. 75, and Norbert’s Gambit', () => {
    const res = evaluateCurrencyExchange({
      amount: 25000,
      fromCurrency: 'USD',
      toCurrency: 'CAD',
      sourceOfFunds: 'savings_income',
      isSplitIntoMultipleTranches: false,
      brokeragePlatform: 'questrade',
      hasCrossBorderAccount: true,
      clientName: 'Alexander Hayes',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.clientName, 'Alexander Hayes');
    assert.equal(res.corridor, 'USD to CAD');
    assert.equal(res.fintracCompliance.isReportableFintrac, true);
    assert.equal(res.fintracCompliance.structuringRisk.hasStructuringRisk, false);
    assert.match(res.bestOption.providerName, /Norbert's Gambit/);
    assert.ok(res.savingsVersusBig5Cad > 500);
  });

  await t.test('Rec 343: evaluateDebtCollectionDefense enforces 2-year limitation period and Criminal Code s. 346 extortion defense', () => {
    const res = evaluateDebtCollectionDefense({
      province: 'ON',
      debtType: 'telecom',
      lastPaymentOrDefaultDate: '2023-01-15',
      allegedDebtAmountCad: 1850,
      collectionAgencyName: 'Alpha Debt Recovery Services',
      receivedWrittenNoticeOfCollection: false,
      callsInPastWeek: 5,
      calledEmployer: true,
      threatenedImmigrationOrDeportation: true,
      debtorName: 'Fatima Al-Mansoor',
      assessmentDate: '2026-10-31'
    }, new Date('2026-10-31T00:00:00Z'));

    assert.equal(res.debtorName, 'Fatima Al-Mansoor');
    assert.equal(res.isStatuteBarred, true);
    assert.equal(res.resolutionVerdict, 'CRIMINAL_EXTORTION_REPORT_MANDATED');
    assert.ok(res.statutoryViolations.some(v => v.violationCode === 'IMMIGRATION_COERCION_EXTORTION'));
    assert.ok(res.statutoryViolations.some(v => v.violationCode === 'EXCESSIVE_CALL_FREQUENCY'));
    assert.ok(res.statutoryViolations.some(v => v.violationCode === 'UNLAWFUL_EMPLOYER_CONTACT'));
    assert.match(res.ceaseAndDesistNotice, /EXTORTION & MISCONDUCT WARNING/);
  });

  await t.test('Rec 344: auditEmploymentReferenceLetter verifies 7-point IRCC standard, NOC duty match, and corroboration', () => {
    const res = auditEmploymentReferenceLetter({
      program: 'express_entry_fsw',
      nocCode: '21231',
      nocTitle: 'Software Engineer and Designer',
      isFullTime: true,
      hoursPerWeek: 40,
      hasLetterhead: true,
      hasExactStartEndDates: true,
      hasJobTitle: true,
      hasAnnualSalaryAndBenefits: true,
      hasDetailedDutiesList: true,
      dutiesCopiedFromNocWordForWord: false,
      dutiesSubstantiallyMatchLeadStatement: true,
      hasSupervisorSignature: true,
      hasPayStubs: true,
      hasTaxDocuments: true,
      hasBankStatements: true,
      applicantName: 'Vikram Joshi',
      employerName: 'Global Cloud Systems Inc.',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.applicantName, 'Vikram Joshi');
    assert.equal(res.mandatoryElementsAudit.satisfiedCount, 7);
    assert.equal(res.mandatoryElementsAudit.missingElements.length, 0);
    assert.match(res.corroborationAudit.corroborationTier, /Tier 1/);
    assert.equal(res.complianceVerdict, 'COMPLIANT_READY_FOR_SUBMISSION');
    assert.match(res.standardCompliantLetterTemplate, /Global Cloud Systems Inc/);
  });

  await t.test('Rec 345: auditEvictionNotice enforces Form N12 mandatory compensation on or before termination date and corporate ban', () => {
    // 1. Corporate landlord violation
    const corpRes = auditEvictionNotice({
      noticeFormType: 'N12',
      monthlyRentCad: 2400,
      noticeServedDate: '2026-05-01',
      terminationDate: '2026-06-30',
      wasStatutoryCompensationPaid: false,
      isLandlordACorporation: true,
      tenantName: 'Jean Tremblay',
      assessmentDate: '2026-10-31'
    });

    assert.equal(corpRes.tenantName, 'Jean Tremblay');
    assert.equal(corpRes.isNoticeStatutorilyVoid, true);
    assert.ok(corpRes.statutoryDefects.some(d => d.defect.includes('Corporate Landlord Prohibition')));
    assert.ok(corpRes.statutoryDefects.some(d => d.defect.includes('Unpaid Statutory Compensation')));

    // 2. Bad faith damages calculation up to $35k
    assert.equal(corpRes.potentialTenantDamages.statutoryGeneralDamages12MonthsRentCad, 28800);
    assert.ok(corpRes.potentialTenantDamages.totalClaimableDamagesCad <= 35000);
  });

  await t.test('Rec 346: evaluateLmiaReadiness differentiates high vs low wage streams, C16 Francophone Mobility, and CMA freeze', () => {
    // 1. High-wage C16 Francophone mobility outside Quebec
    const c16Res = evaluateLmiaReadiness({
      employerName: 'Montréal AI Labs ON Branch',
      province: 'ON',
      offeredHourlyWageCad: 42.00,
      nocCode: '21231',
      teerCategory: 1,
      isExemptionClaimed: true,
      exemptionCode: 'C16',
      frenchProficiencyNclc: 7,
      assessmentDate: '2026-10-31'
    });

    assert.equal(c16Res.employerName, 'Montréal AI Labs ON Branch');
    assert.equal(c16Res.wageAnalysis.stream, 'HIGH_WAGE_STREAM');
    assert.equal(c16Res.exemptionAudit.isEligible, true);
    assert.match(c16Res.exemptionAudit.reason, /Francophone Mobility/);

    // 2. Low-wage with CMA unemployment freeze
    const lowWageRes = evaluateLmiaReadiness({
      employerName: 'Retail Services Inc.',
      province: 'ON',
      offeredHourlyWageCad: 20.00,
      teerCategory: 4,
      isExemptionClaimed: false,
      cmaUnemploymentOver6Percent: true,
      currentTfwProportionPercent: 12
    });

    assert.equal(lowWageRes.wageAnalysis.stream, 'LOW_WAGE_STREAM');
    assert.ok(lowWageRes.riskWarnings.some(w => w.includes('ESDC REFUSAL-TO-PROCESS RISK')));
    assert.ok(lowWageRes.riskWarnings.some(w => w.includes('ESDC CAP BREACH')));
  });

  await t.test('Rec 347: evaluateMedicalAdmissibility audits IRPA s. 38(1)(c) excessive demand, Hilewitz IMP, and 90-day PFL window', () => {
    // 1. Excessive demand with private insurance mitigation
    const res = evaluateMedicalAdmissibility({
      immigrationStream: 'express_entry',
      conditionName: 'Type 1 Diabetes',
      estimatedAnnualMedicationCostCad: 28000,
      hasPrivateInsuranceCoverage: true,
      privateInsuranceAnnualCoverageCad: 15000, // brings net to $13,000 <= $26,304
      receivedProceduralFairnessLetter: true,
      pflDateReceived: '2026-10-01',
      applicantName: 'Tariq Mansour',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.applicantName, 'Tariq Mansour');
    assert.equal(res.statutoryCostAudit.exceedsStatutoryThreshold, true);
    assert.equal(res.mitigationFeasibility.canMitigateExcessDemand, true);
    assert.equal(res.determination, 'PFL_RESPONSE_MITIGATION_REQUIRED');
    assert.equal(res.proceduralFairnessClock.receivedPfl, true);
    assert.equal(res.proceduralFairnessClock.daysRemainingToRespond, 60); // 90 - 30 days
  });

  await t.test('Rec 348: evaluateNbpnpSkilledWorker calculates 60-point pass mark, age bands, and settlement funds scaling', () => {
    const res = evaluateNbpnpSkilledWorker({
      applicantAge: 29, // 10 pts
      targetNocTeer: 1, // min CLB 5
      firstLanguageClb: 8, // 20 pts
      educationLevel: 'BACHELORS', // 18 pts
      yearsOfRelatedExperience: 4, // 16 pts
      hasPermanentFullTimeJobOfferInNb: true, // 10 pts
      employerOperatedTwoYearsInNb: true,
      jobOfferWageMeetsMedian: true,
      currentlyWorkingInNb: false,
      liquidFundsCad: 20000,
      familySize: 2,
      candidateName: 'Beatrice Osei',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.candidateName, 'Beatrice Osei');
    assert.equal(res.pointsSummary.totalPoints, 74);
    assert.equal(res.pointsSummary.isPassMarkSatisfied, true);
    assert.equal(res.isEligible, true);
    assert.equal(res.settlementFundsAudit.hasSufficientFunds, true);
    assert.equal(calculateNbpnpSettlementFunds(1), 15263);
  });

  await t.test('Rec 349: evaluateOasGisEligibility audits Old Age Security 40ths proration, totalization agreements, and sponsorship bar', () => {
    // 1. Partial OAS with totalization
    const res = evaluateOasGisEligibility({
      ageYears: 67,
      yearsResidedInCanadaAfter18: 12,
      countryOfOrigin: 'IN', // India has bilateral social security totalization
      yearsContributedToOriginSocialSecurity: 15,
      isCanadianCitizenOrLegalResident: true,
      livesInCanada: true,
      isUnderFamilyClassSponsorship: true,
      sponsorshipYearsRemaining: 8,
      annualNetWorldIncomeCad: 14000,
      applicantName: 'Harpreet Singh',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.applicantName, 'Harpreet Singh');
    assert.equal(res.oasAudit.eligibleForOas, true);
    assert.equal(res.oasAudit.fractionOfFullPension, '12/40');
    assert.equal(res.oasAudit.totalizationApplied, true);
    assert.equal(res.gisAudit.gisBarredBySponsorship, true); // Family Class sponsorship undertaking bar
    assert.match(res.gisAudit.statusMessage, /sponsorship undertaking/);

    const roadmap = generateSeniorBenefitRoadmap({
      applicantName: 'Harpreet Singh',
      monthlyOasCad: 218.30,
      monthlyGisCad: 0,
      isBarredGis: true,
      sponsorshipYearsRemaining: 8
    });
    assert.match(roadmap, /SENIOR NEWCOMER OAS & GIS BENEFIT ROADMAP/);
  });

  await t.test('Rec 350: evaluatePetImportation audits CFIA border inspection fee, rabies age, and Ontario pit bull ban', () => {
    // 1. Compliant Golden Retriever
    const okRes = evaluatePetImportation({
      animalType: 'dog',
      animalAgeMonths: 24,
      countryOfOrigin: 'US',
      destinationProvince: 'ON',
      dogBreed: 'golden_retriever',
      microchipStatus: 'iso_15_digit_implanted_before_rabies',
      isVaccinatedForRabies: true,
      vaccinationDateDaysAgo: 120,
      hasOfficialRabiesCertificate: true,
      petName: 'Bella',
      assessmentDate: '2026-10-31'
    });

    assert.equal(okRes.petName, 'Bella');
    assert.equal(okRes.isImportAdmissible, true);
    assert.equal(okRes.borderFinancials.cfiaInspectionFeeCad, CFIA_FIRST_ANIMAL_INSPECTION_FEE_CAD);

    // 2. Banned Pit Bull in Ontario
    const bannedRes = evaluatePetImportation({
      animalType: 'dog',
      animalAgeMonths: 24,
      destinationProvince: 'ON',
      dogBreed: 'pit_bull_terrier',
      petName: 'Rocky'
    });

    assert.equal(bannedRes.isImportAdmissible, false);
    assert.equal(bannedRes.admissibilityVerdict, 'STATUTORILY_INADMISSIBLE');
    assert.ok(bannedRes.statutoryViolations.some(v => v.rule.includes('Ontario Statutory Pit Bull Ban')));
  });
});
