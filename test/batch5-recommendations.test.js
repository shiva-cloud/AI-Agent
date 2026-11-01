import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOntarioOvertimePay,
  calculateVacationPayStepUp,
  calculatePublicHolidayPay,
  evaluateEsaStatutorySeverance,
  auditContractorMisclassification,
  auditEqualPayForEqualWork,
  ESA_CONSTANTS
} from '../src/esa-wage-theft-navigator.js';
import {
  auditConstructiveDismissal,
  auditCanadianExperienceBarriers,
  auditOhsaWorkRefusalAndReprisal,
  auditWsibInjuryClaimDeadline,
  WORKPLACE_RIGHTS_CONSTANTS
} from '../src/workplace-rights-defense-navigator.js';
import {
  evaluateEiRegularBenefits,
  auditEiVoluntaryQuitJustCause,
  evaluateEiParentalAndSicknessBenefits,
  EI_CONSTANTS
} from '../src/ei-benefits-navigator.js';
import {
  evaluateFcrMicroLoans,
  evaluateIenSpepEligibility,
  evaluateImgPracticeReadyAssessment,
  FCR_BRIDGING_CONSTANTS
} from '../src/fcr-healthcare-bridge-navigator.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('ESA Wage Theft Navigator: audits 44h overtime, 6% vacation step-up, holiday pay, $2.5M severance, misclassification & equal pay', () => {
  // 1. Overtime Pay Calculation & Thresholds (ESA s. 22)
  const otNormal = calculateOntarioOvertimePay({
    hourlyRateCad: 25,
    weeklyHoursWorked: 50
  });
  assert.equal(otNormal.regularHours, 44);
  assert.equal(otNormal.overtimeHours, 6);
  assert.equal(otNormal.overtimeRateCad, 37.5);
  assert.equal(otNormal.regularPayCad, 1100);
  assert.equal(otNormal.overtimePayCad, 225);
  assert.equal(otNormal.totalWeeklyPayCad, 1325);

  // Minimum wage floor enforcement
  const otBelowMin = calculateOntarioOvertimePay({
    hourlyRateCad: 15.00,
    weeklyHoursWorked: 45
  });
  assert.equal(otBelowMin.hourlyRateCad, ESA_CONSTANTS.ONTARIO_GENERAL_MINIMUM_WAGE_HOURLY);
  assert.ok(otBelowMin.warnings.some(w => w.includes('below Ontario minimum wage')));

  // Averaging agreement (2 weeks)
  const otAveraged = calculateOntarioOvertimePay({
    hourlyRateCad: 20,
    weeklyHoursWorked: 50,
    hasAveragingAgreement: true,
    averagingPeriodWeeks: 2
  });
  assert.equal(otAveraged.overtimeHours, 6);

  // 2. Vacation Pay Step-Up (ESA s. 35.1)
  const vacUnder5 = calculateVacationPayStepUp({
    grossEarningsCad: 50000,
    yearsOfService: 3.5
  });
  assert.equal(vacUnder5.applicableRatePercent, '4%');
  assert.equal(vacUnder5.entitlementWeeks, 2);
  assert.equal(vacUnder5.statutoryVacationPayCad, 2000);
  assert.equal(vacUnder5.stepUpDeltaCad, 0);

  const vacOver5 = calculateVacationPayStepUp({
    grossEarningsCad: 60000,
    yearsOfService: 5.5
  });
  assert.equal(vacOver5.applicableRatePercent, '6%');
  assert.equal(vacOver5.entitlementWeeks, 3);
  assert.equal(vacOver5.statutoryVacationPayCad, 3600);
  assert.equal(vacOver5.stepUpDeltaCad, 1200); // 60,000 * 2%

  // 3. Public Holiday Pay Formula (ESA s. 24: prior 4 weeks / 20)
  const holidayPay = calculatePublicHolidayPay({
    wagesEarnedInPrior4WeeksCad: 3600,
    vacationPayPayableInPrior4WeeksCad: 0
  });
  assert.equal(holidayPay.statutoryHolidayPayCad, 180);

  // 4. Statutory Severance Pay (ESA s. 64: $2.5M payroll, 5+ yrs)
  const sevQualified = evaluateEsaStatutorySeverance({
    yearsOfContinuousService: 6,
    regularWeeklyWagesCad: 1200,
    employerOntarioPayrollCad: 3000000
  });
  assert.equal(sevQualified.qualifiesForSeverance, true);
  assert.equal(sevQualified.severanceWeeks, 6);
  assert.equal(sevQualified.statutorySeverancePayCad, 7200);

  const sevSmallPayroll = evaluateEsaStatutorySeverance({
    yearsOfContinuousService: 7,
    regularWeeklyWagesCad: 1000,
    employerOntarioPayrollCad: 1500000,
    permanentLayoffCountIn6Months: 5
  });
  assert.equal(sevSmallPayroll.qualifiesForSeverance, false);
  assert.equal(sevSmallPayroll.statutorySeverancePayCad, 0);

  // 5. Contractor vs Employee Misclassification (ESA s. 5.1 & Sagaz)
  const misclassified = auditContractorMisclassification({
    hasControlOverSchedule: false,
    ownsToolsAndEquipment: false,
    hasSubcontractingRights: false,
    bearsFinancialRiskOfLoss: false,
    isIntegratedIntoBusiness: true
  });
  assert.equal(misclassified.isMisclassified, true);
  assert.ok(misclassified.misclassificationScoreOutOf100 >= 50);
  assert.ok(misclassified.reverseBurdenOfProof.includes('BURDEN OF PROOF RESTS ON THE EMPLOYER'));

  // 6. Equal Pay for Equal Work (ESA s. 42.1)
  const equalPayViolation = auditEqualPayForEqualWork({
    temporaryAgencyHourlyRateCad: 18.50,
    permanentEmployeeHourlyRateCad: 24.00,
    substantiallySameWork: true,
    justifiedBySeniorityOrMerit: false
  });
  assert.equal(equalPayViolation.isEqualPayViolation, true);
  assert.equal(equalPayViolation.hourlyDisparityCad, 5.50);
});

test('Workplace Rights Defense Navigator: audits Potter constructive dismissal, Canadian experience ban, OHSA refusal & WSIB deadlines', () => {
  // 1. Constructive Dismissal (Potter v NB Legal Aid [2015 SCC 10])
  const cdSalaryCut = auditConstructiveDismissal({
    unilateralWageReductionPercent: 15,
    hasDemotionInStatusOrRank: false,
    forcedGeographicRelocation: false,
    toxicWorkEnvironmentHarassment: false,
    weeksElapsedSinceEmployerChange: 2,
    lodgedFormalWrittenProtest: true
  });
  assert.equal(cdSalaryCut.isConstructiveDismissal, true);
  assert.equal(cdSalaryCut.condonationAudit.isCondonationRiskHigh, false);

  // Condonation risk test (Wronko v Western Inventory Service)
  const cdCondoned = auditConstructiveDismissal({
    unilateralWageReductionPercent: 12,
    weeksElapsedSinceEmployerChange: 8,
    lodgedFormalWrittenProtest: false
  });
  assert.equal(cdCondoned.isConstructiveDismissal, true);
  assert.equal(cdCondoned.condonationAudit.isCondonationRiskHigh, true);

  // 2. Canadian Experience Barriers (OHRC & FARPACTA s. 10.2)
  const farpactaCheck = auditCanadianExperienceBarriers({
    type: 'professional_licensure',
    regulatedProfessionName: 'Professional Engineers Ontario',
    employerDemandedCanadianExperience: true
  });
  assert.equal(farpactaCheck.isViolation, true);
  assert.ok(farpactaCheck.legalRule.includes('FARPACTA s. 10.2'));

  const ohrcCheck = auditCanadianExperienceBarriers({
    type: 'employment_hiring',
    employerDemandedCanadianExperience: true,
    hasBonaFideOccupationalRequirement: false
  });
  assert.equal(ohrcCheck.isPrimaFacieDiscrimination, true);

  // 3. OHSA Unsafe Work Refusal & Anti-Reprisal (OHSA s. 43, 50)
  const ohsaRefusal = auditOhsaWorkRefusalAndReprisal({
    reportedToSupervisor: true,
    employerCompletedStage1Investigation: false,
    employerDisciplinedOrFiredWorker: true
  });
  assert.equal(ohsaRefusal.isWorkRefusalLawful, true);
  assert.equal(ohsaRefusal.currentStage, 'STAGE_1_INVESTIGATION');
  assert.equal(ohsaRefusal.reprisalAudit.hasUnlawfulReprisalOccurred, true);
  assert.ok(ohsaRefusal.reprisalAudit.reverseBurdenOfProof.includes('REVERSE ONUS'));

  // 4. WSIB 6-Month Statutory Window (WSIA s. 22)
  const wsibActive = auditWsibInjuryClaimDeadline({
    dateOfAccident: '2026-08-01',
    assessmentDate: '2026-10-31'
  });
  assert.equal(wsibActive.isWithinClaimDeadline, true);
  assert.ok(wsibActive.monthsRemainingToClaim > 0);

  const wsibExpired = auditWsibInjuryClaimDeadline({
    dateOfAccident: '2026-01-01',
    assessmentDate: '2026-10-31'
  });
  assert.equal(wsibExpired.isWithinClaimDeadline, false);
  assert.equal(wsibExpired.monthsRemainingToClaim, 0);
});

test('Employment Insurance & Parental Benefits Navigator: audits regular hours grid, voluntary quit just cause, 26-wk sickness, and parental options', () => {
  // 1. Regular Benefits Hours Grid & Separation
  const eiQualified = evaluateEiRegularBenefits({
    insurableHoursAccrued: 650,
    regionalUnemploymentRatePercent: 7.5,
    averageWeeklyInsurableEarningsCad: 1200,
    reasonForSeparation: 'layoff_shortage_of_work'
  });
  assert.equal(eiQualified.isEligible, true);
  assert.equal(eiQualified.requiredHoursThreshold, 630);
  assert.equal(eiQualified.estimatedWeeklyBenefitCad, 660); // 1200 * 0.55 = 660

  // Hits the max cap
  const eiMaxCap = evaluateEiRegularBenefits({
    insurableHoursAccrued: 700,
    regionalUnemploymentRatePercent: 7.5,
    averageWeeklyInsurableEarningsCad: 1500,
    reasonForSeparation: 'layoff_shortage_of_work'
  });
  assert.equal(eiMaxCap.estimatedWeeklyBenefitCad, EI_CONSTANTS.MAX_WEEKLY_BENEFIT_CAD_2024);

  const eiShortHours = evaluateEiRegularBenefits({
    insurableHoursAccrued: 500,
    regionalUnemploymentRatePercent: 7.5,
    reasonForSeparation: 'layoff_shortage_of_work'
  });
  assert.equal(eiShortHours.isEligible, false);

  // 2. Just Cause Voluntary Quit (EI Act s. 29(c))
  const justCauseSpouse = auditEiVoluntaryQuitJustCause({
    quitReasonCategory: 'spouse_relocation',
    hasProofDocumentation: true
  });
  assert.equal(justCauseSpouse.isJustCauseEstablished, true);

  const justCauseMissingProof = auditEiVoluntaryQuitJustCause({
    quitReasonCategory: 'spouse_relocation',
    hasProofDocumentation: false
  });
  assert.equal(justCauseMissingProof.isJustCauseEstablished, false);

  // 3. Sickness Benefits (26 Weeks Max)
  const sicknessBenefit = evaluateEiParentalAndSicknessBenefits({
    benefitType: 'sickness',
    insurableHoursAccrued: 600,
    averageWeeklyEarningsCad: 1000,
    hasMedicalCertificate: true
  });
  assert.equal(sicknessBenefit.isEligible, true);
  assert.equal(sicknessBenefit.maxDurationWeeks, EI_CONSTANTS.SICKNESS_MAX_WEEKS);
  assert.equal(sicknessBenefit.weeklyRateCad, 550);

  // 4. Standard vs Extended Parental Leave
  const standardParental = evaluateEiParentalAndSicknessBenefits({
    benefitType: 'parental_standard',
    insurableHoursAccrued: 650,
    averageWeeklyEarningsCad: 1000
  });
  assert.equal(standardParental.durationWeeks.maxSingleParentWeeks, 35);
  assert.equal(standardParental.durationWeeks.maxSharedWeeks, 40);
  assert.equal(standardParental.weeklyBenefitRateCad, 550);

  const extendedParental = evaluateEiParentalAndSicknessBenefits({
    benefitType: 'parental_extended',
    insurableHoursAccrued: 650,
    averageWeeklyEarningsCad: 1000
  });
  assert.equal(extendedParental.durationWeeks.maxSingleParentWeeks, 61);
  assert.equal(extendedParental.durationWeeks.maxSharedWeeks, 69);
  assert.equal(extendedParental.weeklyBenefitRateCad, 330);
  assert.ok(extendedParental.irrevocabilityWarning.includes('IRREVOCABLE'));

  // 5. Quebec QPIP Dedicated Paternity Leave
  const qpip = evaluateEiParentalAndSicknessBenefits({
    provinceOfResidence: 'QC'
  });
  assert.equal(qpip.maxDurationWeeks, 5);
  assert.equal(qpip.benefitRatePercent, '70% of average weekly earnings');
});

test('Foreign Credential Recognition & Healthcare Bridging: audits FCR loans, IEN SPEP nursing & IMG PRA pathways', () => {
  // 1. FCR Micro-loans ($15,000 Windmill & Achēv)
  const fcrEligible = evaluateFcrMicroLoans({
    immigrationStatus: 'permanent_resident',
    fundingRequiredCad: 12000
  });
  assert.equal(fcrEligible.isEligibleForFcrLoans, true);
  assert.ok(fcrEligible.availableLoanPrograms.length >= 2);

  const fcrIneligible = evaluateFcrMicroLoans({
    immigrationStatus: 'visitor',
    fundingRequiredCad: 12000
  });
  assert.equal(fcrIneligible.isEligibleForFcrLoans, false);

  // 2. IEN Supervised Practice Experience Partnership (SPEP - CNO)
  const spepEligible = evaluateIenSpepEligibility({
    hasNnasAdvisoryReport: true,
    outstandingRequirements: ['evidence_of_practice', 'language_proficiency']
  });
  assert.equal(spepEligible.isEligibleForSpep, true);
  assert.equal(spepEligible.programDetails.minPracticeHoursRequired, FCR_BRIDGING_CONSTANTS.SPEP_MIN_SUPERVISED_PRACTICE_HOURS);

  // 3. IMG Practice Ready Assessment (PRA)
  const praEligible = evaluateImgPracticeReadyAssessment({
    targetProvince: 'BC',
    completedResidencyOutsideCanada: true,
    residencyDurationYears: 3,
    clinicalPracticeYearsWithinLast5Years: 3,
    passedMccqe1: true,
    passedNacOsce: true
  });
  assert.equal(praEligible.isEligibleForPra, true);
  assert.equal(praEligible.programName, 'PRA-BC (Practice Ready Assessment British Columbia)');
  assert.equal(praEligible.assessmentStructure.clinicalFieldAssessmentDurationWeeks, 12);
  assert.ok(praEligible.majorAdvantage.includes('Bypasses the CaRMS residency match'));
});

test('Batch 5 HTTP Endpoints: GET and POST integration for esa-wage-theft, workplace-rights, ei-benefits, and fcr-bridging', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'test-admin-token-at-least-24-chars-long');
  await new Promise(res => server.listen(0, '127.0.0.1', res));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    // 1. ESA Wage Theft (GET & POST)
    const resGetEsa = await fetch(`${baseUrl}/v1/tools/esa-wage-theft?rate=30&hours=50`);
    assert.equal(resGetEsa.status, 200);
    const bodyGetEsa = await resGetEsa.json();
    assert.equal(bodyGetEsa.overtimeHours, 6);
    assert.equal(bodyGetEsa.overtimePayCad, 270);

    const resPostEsa = await fetch(`${baseUrl}/v1/tools/esa-wage-theft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'vacation',
        grossEarningsCad: 50000,
        yearsOfService: 6
      })
    });
    assert.equal(resPostEsa.status, 200);
    const bodyPostEsa = await resPostEsa.json();
    assert.equal(bodyPostEsa.applicableRatePercent, '6%');

    // 2. Workplace Rights (GET & POST)
    const resGetWp = await fetch(`${baseUrl}/v1/tools/workplace-rights?action=wsib_deadline&accidentDate=2026-08-01`);
    assert.equal(resGetWp.status, 200);
    const bodyGetWp = await resGetWp.json();
    assert.equal(bodyGetWp.isWithinClaimDeadline, true);

    const resPostWp = await fetch(`${baseUrl}/v1/tools/workplace-rights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'canadian_experience',
        type: 'professional_licensure',
        regulatedProfessionName: 'CPA Ontario'
      })
    });
    assert.equal(resPostWp.status, 200);
    const bodyPostWp = await resPostWp.json();
    assert.equal(bodyPostWp.isViolation, true);

    // 3. EI Benefits (GET & POST)
    const resGetEi = await fetch(`${baseUrl}/v1/tools/ei-benefits?action=regular&hours=650&rate=7.5`);
    assert.equal(resGetEi.status, 200);
    const bodyGetEi = await resGetEi.json();
    assert.equal(bodyGetEi.isEligible, true);

    const resPostEi = await fetch(`${baseUrl}/v1/tools/ei-benefits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'parental',
        benefitType: 'parental_standard',
        insurableHoursAccrued: 600,
        averageWeeklyEarningsCad: 1000
      })
    });
    assert.equal(resPostEi.status, 200);
    const bodyPostEi = await resPostEi.json();
    assert.equal(bodyPostEi.isEligible, true);

    // 4. FCR Bridging (GET & POST)
    const resGetFcr = await fetch(`${baseUrl}/v1/tools/fcr-bridging?action=ien_spep&nnas=true`);
    assert.equal(resGetFcr.status, 200);
    const bodyGetFcr = await resGetFcr.json();
    assert.equal(bodyGetFcr.isEligibleForSpep, true);

    const resPostFcr = await fetch(`${baseUrl}/v1/tools/fcr-bridging`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'img_pra',
        targetProvince: 'BC',
        completedResidencyOutsideCanada: true,
        residencyDurationYears: 3,
        clinicalPracticeYearsWithinLast5Years: 3,
        passedMccqe1: true,
        passedNacOsce: true
      })
    });
    assert.equal(resPostFcr.status, 200);
    const bodyPostFcr = await resPostFcr.json();
    assert.equal(bodyPostFcr.isEligibleForPra, true);

  } finally {
    await new Promise((res) => server.close(res));
  }
});
