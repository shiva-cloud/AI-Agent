import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluatePeiOccupationsInDemand } from '../src/pei-provincial-nominee-occupations-in-demand-navigator.js';
import { evaluatePrCardRenewalUrgent } from '../src/pr-card-renewal-urgent-navigator.js';
import { evaluateRuralRenewalEligibility } from '../src/rural-renewal-navigator.js';
import { evaluateSocialAssistance } from '../src/social-assistance-navigator.js';
import { evaluateSowpEligibility, generateSowpApplicationChecklist } from '../src/sowp-eligibility-navigator.js';
import { assessTelecomDispute } from '../src/telecom-contract-defense.js';
import { evaluateTrpCompellingBalance } from '../src/temporary-resident-permit-inadmissibility-navigator.js';
import { evaluateTenancyRepairs } from '../src/tenancy-repairs-navigator.js';
import { evaluateUkSkilledWorkerAndIlr } from '../src/uk-skilled-worker-ilr-navigator.js';
import { evaluateUsH1bOptStatus } from '../src/us-h1b-opt-navigator.js';
import { evaluateVisitorVisaTies } from '../src/visitor-visa-financial-ties-navigator.js';
import {
  auditConstructiveDismissal,
  auditCanadianExperienceBarriers,
  auditOhsaWorkRefusalAndReprisal,
  auditWsibInjuryClaimDeadline
} from '../src/workplace-rights-defense-navigator.js';
import { evaluateConsumerCreditAgreement } from '../src/high-cost-credit-navigator.js';
import { evaluateHomebuyerTaxIncentives } from '../src/homebuyer-tax-incentives.js';
import { evaluateHealthcarePortabilityAndIfhp, generateHealthcareRegistrationGuide } from '../src/healthcare-portability-navigator.js';

test('Batch 19 Recommendations (Sweep 26: Recs 351–365)', async (t) => {
  await t.test('Rec 351: evaluatePeiOccupationsInDemand verifies target NOCs, employer tenure, CLB 4, and settlement funds', () => {
    // 1. Fully compliant candidate in healthcare NOC 33102
    const res = evaluatePeiOccupationsInDemand({
      nocCode: '33102',
      jobOfferFullTime: true,
      jobOfferPermanentOrTwoYears: true,
      employerOperatedTwoYearsInPei: true,
      hasValidWorkPermitOrAuthorization: true,
      monthsOfDirectExperienceInLastFiveYears: 24,
      applicantAge: 29,
      clbScore: 5,
      hasHighSchoolDiplomaOrEca: true,
      liquidFundsCad: 14000,
      familySize: 2,
      intendsToResideInPei: true,
      candidateName: 'Grace Mbatha',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.candidateName, 'Grace Mbatha');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.isEligible, true);
    assert.equal(res.eligibilityVerdict, 'ELIGIBLE_FOR_PEI_OCCUPATIONS_IN_DEMAND_NOMINATION');
    assert.equal(res.targetNoc.noc, '33102');
    assert.equal(res.financialAssessment.requiredSettlementFundsCad, 12000); // 10k + 2k for 2nd person
    assert.equal(res.financialAssessment.isFundsRequirementSatisfied, true);

    // 2. Disqualified candidate (ineligible NOC)
    const ineligRes = evaluatePeiOccupationsInDemand({
      nocCode: '11100', // Financial auditor - not on in-demand list
      jobOfferFullTime: true,
      candidateName: 'Grace Mbatha'
    });

    assert.equal(ineligRes.isEligible, false);
    assert.ok(ineligRes.disqualifications.some(d => d.criterion === 'INELIGIBLE_NOC_CODE'));
  });

  await t.test('Rec 352: evaluatePrCardRenewalUrgent audits 730-day residency, 90-day urgent window, and private vehicle exception', () => {
    // 1. Inside Canada, qualifies for urgent processing with travel in 45 days
    const urgentRes = evaluatePrCardRenewalUrgent({
      daysInCanadaLast5Years: 800,
      hasUrgentTravelNeed: true,
      travelDepartureDaysFromNow: 45,
      urgentReasonCategory: 'urgent_employment',
      hasProofOfTravel: true,
      hasSupportingUrgentProof: true,
      isCurrentlyInsideCanada: true,
      applicantName: 'Tariq Al-Fassi',
      assessmentDate: '2026-10-31'
    });

    assert.equal(urgentRes.applicantName, 'Tariq Al-Fassi');
    assert.equal(urgentRes.residencyAssessment.residencyObligationMet, true);
    assert.equal(urgentRes.urgentProcessing.qualifiesForUrgentProcessing, true);
    assert.equal(urgentRes.applicationPathway.recommendedForm, 'IMM 5444');
    assert.equal(urgentRes.applicationPathway.statutoryGovernmentFeeCad, 50.0);

    // 2. Outside Canada without PR card -> PRTD IMM 5524 route
    const outsideRes = evaluatePrCardRenewalUrgent({
      daysInCanadaLast5Years: 750,
      isCurrentlyInsideCanada: false,
      applicantName: 'Tariq Al-Fassi'
    });

    assert.equal(outsideRes.applicationPathway.recommendedForm, 'IMM 5524 (PRTD)');
    assert.ok(outsideRes.statutoryProtections.some(p => p.includes('LAND BORDER EXCEPTION')));
  });

  await t.test('Rec 353: evaluateRuralRenewalEligibility validates community endorsement, TEER CLB thresholds, and entrepreneur benchmarks', () => {
    // 1. Rural Renewal worker stream in Brooks
    const workerRes = evaluateRuralRenewalEligibility({
      streamType: 'rural_renewal',
      selectedCommunity: 'brooks',
      hasCommunityEndorsementLetter: true,
      hasGenuineJobOffer: true,
      jobOfferIsFullTimeNonSeasonal: true,
      jobNocTeer: 2,
      clbLevel: 5,
      hasHighSchoolOrEca: true,
      monthsWorkExperiencePast18Months: 14,
      familySize: 1,
      liquidSettlementFundsCad: 16000,
      applicantName: 'David Chen',
      assessmentDate: '2026-10-31'
    });

    assert.equal(workerRes.applicantName, 'David Chen');
    assert.equal(workerRes.overallEligible, true);
    assert.match(workerRes.summaryTitle, /Eligible for AAIP Rural Renewal Stream in Brooks/);

    // 2. Rural Entrepreneur stream
    const bizRes = evaluateRuralRenewalEligibility({
      streamType: 'rural_entrepreneur',
      selectedCommunity: 'whitecourt',
      hasCommunityEndorsementLetter: true,
      netWorthCad: 400000,
      plannedInvestmentCad: 150000,
      plannedOwnershipPercent: 51.0,
      jobsCreatedCount: 2,
      hasCompletedCommunityExploratoryVisit: true,
      applicantName: 'Maria Santos'
    });

    assert.equal(bizRes.overallEligible, true);
    assert.match(bizRes.summaryTitle, /Eligible for AAIP Rural Entrepreneur Stream in Whitecourt/);
  });

  await t.test('Rec 354: evaluateSocialAssistance audits OW/ODSP asset ceilings, earnings clawbacks, and sponsorship Crown debt', () => {
    const res = evaluateSocialAssistance({
      program: 'ontario_works',
      immigrationStatus: 'permanent_resident',
      familyComposition: 'single',
      liquidAssetsCad: 4500,
      primaryVehicleValueCad: 8000,
      grossMonthlyEmploymentIncomeCad: 400,
      isSponsoredImmigrant: true,
      sponsorshipYearsRemaining: 2,
      applicantName: 'Amina Nour',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.applicantName, 'Amina Nour');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.eligibility.isOverallEligible, true);
    assert.equal(res.assetAudit.isWithinAssetLimit, true);
    assert.equal(res.assetAudit.primaryVehicle.isExempt, true);
    assert.equal(res.benefitCalculation.flatEarningsExemptionCad, 200);
    // (400 - 200) * 0.50 = 100 deduction
    assert.equal(res.benefitCalculation.netMonthlyDeductionCad, 100);
    assert.equal(res.sponsorshipUndertakingImpact.isDefaultTriggered, true);
    assert.match(res.sponsorshipUndertakingImpact.legalImpact, /CRITICAL STATUTORY DEFAULT/);
    assert.doesNotMatch(res.sponsorshipUndertakingImpact.legalImpact, /100%/);
  });

  await t.test('Rec 355: evaluateSowpEligibility enforces March 19, 2024 student spousal exclusion and worker TEER 0-3 rules', () => {
    // 1. Master's degree student spouse -> Eligible C42
    const mastersRes = evaluateSowpEligibility({
      sponsorType: 'international_student',
      studentProgramLevel: 'masters',
      relationshipType: 'married',
      applicantName: 'Ananya Roy',
      principalName: 'Rohan Roy',
      assessmentDate: '2026-10-31'
    });

    assert.equal(mastersRes.applicantName, 'Ananya Roy');
    assert.equal(mastersRes.overallEligible, true);
    assert.equal(mastersRes.lmiaExemptionCode, 'C42');

    // 2. Bachelor's undergrad student spouse -> STRICTLY DISQUALIFIED under March 19, 2024 overhaul
    const bachelorsRes = evaluateSowpEligibility({
      sponsorType: 'international_student',
      studentProgramLevel: 'bachelors_undergrad',
      relationshipType: 'married'
    });

    assert.equal(bachelorsRes.overallEligible, false);
    assert.ok(bachelorsRes.rejectionRisks.some(r => r.includes('March 19, 2024 Rule')));

    // 3. Document dossier generation
    const dossier = generateSowpApplicationChecklist({
      applicantName: 'Ananya Roy',
      sponsorType: 'international_student',
      lmiaCode: 'C42',
      isEligible: true
    });
    assert.match(dossier, /SPOUSAL OPEN WORK PERMIT/);
    assert.match(dossier, /IRPR s\. 205\(c\)\(ii\)/);
  });

  await t.test('Rec 356: assessTelecomDispute enforces 15-day trial, $50 data overage cap, and CCTS escalation', () => {
    const res = assessTelecomDispute({
      providerName: 'Rogers',
      serviceType: 'mobile',
      contractType: 'postpaid_device_financing',
      daysSinceContractStart: 8,
      dataOverageChargedCad: 95.00, // over $50 cap
      roamingChargedCad: 140.00, // over $100 cap
      unlockedDeviceFeeChargedCad: 50.00, // illegal $50 unlock fee
      disputedChargesTotalCad: 285.00,
      customerName: 'Marcus Vance',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.customerName, 'Marcus Vance');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.isWithinTrialPeriod, true);
    assert.equal(res.trialCancellationStatus, 'ABSOLUTE_RIGHT_TO_CANCEL_WITHOUT_PENALTY');
    assert.equal(res.hasStatutoryViolations, true);
    assert.ok(res.statutoryViolations.some(v => v.violationCode === 'DATA_OVERAGE_CAP_BREACH'));
    assert.ok(res.statutoryViolations.some(v => v.violationCode === 'ROAMING_CAP_BREACH'));
    assert.ok(res.statutoryViolations.some(v => v.violationCode === 'ILLEGAL_DEVICE_UNLOCKING_FEE'));
    assert.match(res.formalDisputeNotice, /CCTS ESCALATION WARNING/);
    assert.match(res.formalDisputeNotice, /Marcus Vance/);
  });

  await t.test('Rec 357: evaluateTrpCompellingBalance applies Farhat balancing test and Permit Holder Class PR transition', () => {
    const res = evaluateTrpCompellingBalance({
      inadmissibilityType: 'criminality_s36_2',
      yearsElapsedSinceSentenceOrTrigger: 5,
      compellingReasonCategory: 'significant_economic_benefit',
      hasDocumentaryProofOfCompellingNeed: true,
      hasCleanSubsequentRecord: true,
      hasCompletedAllSentencesAndFines: true,
      hasSevereViolenceOrWeapons: false,
      applicantLocation: 'inside_canada',
      applicantName: 'Arthur Dent',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.applicantName, 'Arthur Dent');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.isBalanceFavourable, true);
    assert.equal(res.recommendationVerdict, 'RECOMMEND_TRP_SUBMISSION');
    assert.equal(res.riskLevel, 'LOW');
    assert.equal(res.compellingStrength, 'STRONG_ECONOMIC_BENEFIT');
    assert.equal(res.prPathwayPermitHolderClass.continuousYearsRequired, 5); // 5 years for criminality
    assert.equal(res.prPathwayPermitHolderClass.governingStatute, 'IRPR s. 65');
  });

  await t.test('Rec 358: evaluateTenancyRepairs calculates rent abatement, warns against rent withholding, and builds formal notice', () => {
    const res = evaluateTenancyRepairs({
      province: 'ON',
      monthlyRentCad: 2200,
      issues: ['no_heat_winter', 'water_leak_mold'],
      daysUnresolved: 20,
      outOfPocketExpensesCad: 150,
      hasWithheldRent: true,
      withheldAmountCad: 1100,
      hasNotifiedLandlordInWriting: true,
      tenantName: 'Sophie Leblanc',
      landlordName: 'Metro Rental Holdings Inc.',
      rentalAddress: '450 University Ave, Toronto, ON',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.tenantName, 'Sophie Leblanc');
    assert.equal(res.landlordName, 'Metro Rental Holdings Inc.');
    assert.equal(res.rentalAddress, '450 University Ave, Toronto, ON');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.hasVitalServiceBreach, true);
    assert.equal(res.rentWithholdingRisk, 'severe');
    assert.ok(res.legalWarnings.some(w => w.code === 'ILLEGAL_RENT_WITHHOLDING'));
    assert.ok(res.abatementEstimate.estimatedMinAbatementCad > 500);
    assert.match(res.noticeOfDisrepairDocument, /FORMAL NOTICE OF DISREPAIR/);
    assert.match(res.noticeOfDisrepairDocument, /Metro Rental Holdings Inc\./);
  });

  await t.test('Rec 359: evaluateUkSkilledWorkerAndIlr verifies HC 997 salary thresholds, ILR 180-day rule, and Section 21 abolition', () => {
    const res = evaluateUkSkilledWorkerAndIlr({
      annualOfferedSalaryGbp: 42500,
      socCode: '2136',
      maxAbsenceDaysInAny12Months: 110,
      totalAbsenceDays5Years: 320,
      applicantAge: 30,
      landlordGasSafetyProvided: true,
      landlordEpcProvided: true,
      landlordHowToRentProvided: true,
      depositProtectedWithin30Days: true,
      noticeServedDate: '2026-06-01',
      applicantName: 'Liam O’Connor',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.applicantName, 'Liam O’Connor');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.salaryCompliance.isSalaryCompliant, true);
    assert.equal(res.salaryCompliance.applicableThresholdGbp, 41700);
    assert.equal(res.ilrContinuousResidence.isContinuousResidenceMaintained, true);
    assert.equal(res.housingSection21Defense.section21Abolished, true);
    assert.match(res.housingSection21Defense.remedyAdvice, /Renters' Rights Act 2025/);
  });

  await t.test('Rec 360: evaluateUsH1bOptStatus audits 60-day grace period, I-94 truncation, Cap-Gap, and INA § 245(k)', () => {
    // 1. H-1B 60-day grace period
    const h1bRes = evaluateUsH1bOptStatus({
      visaStatus: 'h1b',
      lastDayWorkedDate: '2026-10-15',
      i94ExpirationDate: '2026-11-20', // Earlier than 60 days!
      applicantName: 'Vikram Patel',
      assessmentDate: '2026-10-31'
    });

    assert.equal(h1bRes.applicantName, 'Vikram Patel');
    assert.equal(h1bRes.assessmentDate, '2026-10-31');
    assert.equal(h1bRes.h1bGracePeriodAudit.isGracePeriodActive, true);
    assert.equal(h1bRes.h1bGracePeriodAudit.isTruncatedByI94, true);
    assert.equal(h1bRes.h1bGracePeriodAudit.statutoryDeadlineDate, '2026-11-20');

    // 2. F-1 STEM OPT Cap-Gap & 245(k) forgiveness
    const optRes = evaluateUsH1bOptStatus({
      visaStatus: 'f1_stem_opt',
      hasTimelyFiledH1bCos: true,
      unauthorizedWorkDaysAccrued: 45,
      hasPendingGreenCardI485: true,
      assessmentDate: '2026-10-31'
    });

    assert.equal(optRes.capGapAudit.isCapGapEligible, true);
    assert.equal(optRes.section245kAudit.isForgivableUnder245k, true);
    assert.equal(optRes.section245kAudit.daysBufferRemaining, 135); // 180 - 45
  });

  await t.test('Rec 361: evaluateVisitorVisaTies scores financial sufficiency, employer leave, family anchors, and IRPA s. 22(2) dual intent', () => {
    const res = evaluateVisitorVisaTies({
      applicantName: 'Fatima Zahra',
      countryOfResidence: 'MA',
      plannedStayDays: 20,
      liquidFundsCad: 15000,
      hasApprovedJobLeaveLetter: true,
      yearsAtCurrentJob: 4,
      ownsRealEstateProperty: true,
      hasImmediateFamilyRemainingHome: true,
      allImmediateFamilyTravelingTogether: false,
      hasPriorCompliantTravelG7: true,
      isDualIntentPrPending: true,
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.applicantName, 'Fatima Zahra');
    assert.equal(res.countryOfResidence, 'MA');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.riskTier, 'LOW_RISK');
    assert.equal(res.approvalProbability, 'High');
    assert.ok(res.tieScoreOutOf100 >= 80);
    assert.ok(res.positiveFactors.some(f => f.includes('Dual Intent Recognised')));
  });

  await t.test('Rec 362: auditConstructiveDismissal, FARPACTA, OHSA, and WSIB enforce worker rights without wording violations', () => {
    // 1. Constructive Dismissal
    const cdRes = auditConstructiveDismissal({
      unilateralWageReductionPercent: 20,
      weeksElapsedSinceEmployerChange: 2,
      lodgedFormalWrittenProtest: true,
      employeeName: 'Sarah Jenkins',
      assessmentDate: '2026-10-31'
    });
    assert.equal(cdRes.employeeName, 'Sarah Jenkins');
    assert.equal(cdRes.isConstructiveDismissal, true);
    assert.equal(cdRes.condonationAudit.isCondonationRiskHigh, false);

    // 2. FARPACTA s. 10.2 Canadian experience ban
    const farRes = auditCanadianExperienceBarriers({
      type: 'professional_licensure',
      regulatedProfessionName: 'Professional Engineers Ontario',
      employerDemandedCanadianExperience: true
    });
    assert.equal(farRes.isViolation, true);
    assert.match(farRes.legalRule, /STRICTLY PROHIBITED/);

    // 3. OHSA s. 43/50 Work refusal and reverse onus
    const ohsaRes = auditOhsaWorkRefusalAndReprisal({
      reportedToSupervisor: true,
      employerDisciplinedOrFiredWorker: true
    });
    assert.equal(ohsaRes.reprisalAudit.hasUnlawfulReprisalOccurred, true);
    assert.match(ohsaRes.reprisalAudit.reverseBurdenOfProof, /REVERSE ONUS/);

    // 4. WSIB claim deadline and wording guard compliance
    const wsibRes = auditWsibInjuryClaimDeadline({
      dateOfAccident: '2026-08-01',
      assessmentDate: '2026-10-31',
      workerName: 'Sarah Jenkins'
    });
    assert.equal(wsibRes.workerName, 'Sarah Jenkins');
    assert.equal(wsibRes.isWithinClaimDeadline, true);
    assert.match(wsibRes.wsibBenefitsSummary.healthCareBenefits, /Full coverage/);
    assert.doesNotMatch(wsibRes.wsibBenefitsSummary.healthCareBenefits, /100%/);
  });

  await t.test('Rec 363: evaluateConsumerCreditAgreement enforces Criminal Code 35% APR cap and Payday Loans Act fee ceiling', () => {
    const res = evaluateConsumerCreditAgreement({
      province: 'ON',
      loanType: 'payday_loan',
      principalBorrowedCad: 1000,
      termDays: 14,
      totalFeesChargedCad: 220, // max is $140 ($14/100)
      netMonthlyIncomeCad: 2500,
      isRolloverLoan: true,
      lenderAttemptedWageAssignment: true,
      daysSinceAgreement: 1,
      borrowerName: 'Carlos Gomez',
      lenderName: 'Apex Cash Advance Inc.',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.borrowerName, 'Carlos Gomez');
    assert.equal(res.lenderName, 'Apex Cash Advance Inc.');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.statutoryMaxFeesCad, 140.00);
    assert.equal(res.illegalOverchargeCad, 80.00);
    assert.equal(res.withinCoolingOffPeriod, true);
    assert.equal(res.defenseVerdict, 'STATUTORY_VIOLATIONS_DETECTED_REMEDIES_AVAILABLE');
    assert.ok(res.statutoryViolations.some(v => v.code === 'PAYDAY_FEE_CAP_EXCEEDED'));
    assert.ok(res.statutoryViolations.some(v => v.code === 'ILLEGAL_ROLLOVER_LOAN'));
    assert.ok(res.statutoryViolations.some(v => v.code === 'PROHIBITED_WAGE_ASSIGNMENT'));
    assert.match(res.demandLetter, /Apex Cash Advance Inc\./);
  });

  await t.test('Rec 364: evaluateHomebuyerTaxIncentives calculates FHSA, Budget 2024 $60k HBP, HBTC, and LTT rebates', () => {
    const res = evaluateHomebuyerTaxIncentives({
      province: 'ON',
      city: 'Toronto',
      homePurchasePriceCad: 800000,
      isFirstTimeHomeBuyer: true,
      marginalTaxRatePercent: 40.0,
      applicant1: {
        annualIncomeCad: 90000,
        rrspBalanceCad: 70000,
        fhsaBalanceCad: 24000,
        fhsaYearsActive: 3
      },
      hasSpouseOrPartner: true,
      applicant2: {
        annualIncomeCad: 75000,
        rrspBalanceCad: 50000,
        fhsaBalanceCad: 16000,
        fhsaYearsActive: 2
      },
      plannedPurchaseYear: 2026,
      applicantName: 'Kiran & Pooja',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.applicantName, 'Kiran & Pooja');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.fhsaEvaluation.totalFhsaWithdrawalCad, 40000); // 24k + 16k
    assert.equal(res.hbpEvaluation.totalHbpWithdrawalCad, 110000); // 60k cap + 50k
    assert.equal(res.hbpEvaluation.repaymentStartYear, 2031); // 2026 + 5 grace years
    assert.equal(res.downPaymentUnlocked.totalTaxFreeDownPaymentCad, 150000);
    assert.equal(res.taxCreditsAndRebates.hbtcTaxSavingsCad, 1500); // $10k * 15%
    assert.equal(res.taxCreditsAndRebates.lttRebateCad, 8475); // $4,000 ON + $4,475 Toronto
    assert.ok(res.taxCreditsAndRebates.totalCombinedTaxAdvantageCad > 25000);

    // Check BC wording
    const bcRes = evaluateHomebuyerTaxIncentives({
      province: 'BC',
      homePurchasePriceCad: 700000
    });
    assert.match(bcRes.taxCreditsAndRebates.lttRebateDetails, /Full exemption from BC Property Transfer Tax/);
    assert.doesNotMatch(bcRes.taxCreditsAndRebates.lttRebateDetails, /100% full exemption/);
  });

  await t.test('Rec 365: evaluateHealthcarePortabilityAndIfhp audits Ontario O. Reg. 107/20, BC MSP waiting period, and IFHP', () => {
    // 1. Ontario immediate coverage (waiting period repealed)
    const onRes = evaluateHealthcarePortabilityAndIfhp({
      targetProvince: 'ON',
      immigrationStatus: 'closed_work_permit',
      workPermitDurationMonths: 12,
      hasFullTimeEmployerJobLetter6Months: true,
      applicantName: 'Yuki Takahashi',
      assessmentDate: '2026-10-31'
    });

    assert.equal(onRes.applicantName, 'Yuki Takahashi');
    assert.equal(onRes.assessmentDate, '2026-10-31');
    assert.equal(onRes.eligibleForProvincialHealthcare, true);
    assert.equal(onRes.waitingPeriodDays, 0);
    assert.equal(onRes.needsPrivateBridgingInsurance, false);

    // 2. BC MSP waiting period (remainder of arrival month + 2 calendar months)
    const bcRes = evaluateHealthcarePortabilityAndIfhp({
      targetProvince: 'BC',
      originType: 'outside_canada',
      arrivalDate: '2026-09-15',
      immigrationStatus: 'closed_work_permit',
      workPermitDurationMonths: 12
    });

    assert.equal(bcRes.eligibleForProvincialHealthcare, true);
    assert.equal(bcRes.coverageStartDate, '2026-12-01');
    assert.equal(bcRes.needsPrivateBridgingInsurance, true);

    // 3. IFHP refugee claimant federal coverage
    const ifhpRes = evaluateHealthcarePortabilityAndIfhp({
      targetProvince: 'ON',
      immigrationStatus: 'refugee_claimant',
      isRefugeeClaimantWithIfhpCertificate: true
    });

    assert.equal(ifhpRes.ifhpActive, true);
    assert.match(ifhpRes.coverageType, /Federal Medavie Blue Cross/);
    assert.equal(ifhpRes.needsPrivateBridgingInsurance, false);

    // 4. Healthcare registration guide generator
    const guide = generateHealthcareRegistrationGuide({
      applicantName: 'Yuki Takahashi',
      province: 'ON'
    });
    assert.match(guide, /PROVINCIAL HEALTHCARE REGISTRATION/);
    assert.match(guide, /ServiceOntario/);
  });
});
