import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateFhsaEligibility,
  evaluateHbpWithdrawal,
  evaluateTfsaNonResidentPenalty,
  evaluateForeignPropertyAndLandingStepUp,
  evaluateOverseasGiftAndAmlProof,
  evaluateNewcomerWealthPlan
} from '../src/cra-newcomer-wealth-navigator.js';
import {
  auditOntarioRentIncrease,
  evaluateOntarioSharedKitchenBathroomJurisdiction,
  auditOntarioFormN12Notice,
  evaluateOntarioT1RefundClaim,
  auditBcTenancyNotice
} from '../src/ontario-bc-tenancy-navigator.js';
import {
  evaluateUaeGratuityAndWps,
  auditDubaiReraEvictionNotice,
  evaluateNewZealandAewvAndTenancy,
  evaluateIrelandCsepAndRpz,
  evaluateSingaporeCompassPass
} from '../src/global-expat-navigator.js';
import {
  evaluateRestorationOfStatus,
  auditFlagpolingEligibility,
  auditDliAuthorizedLeave,
  evaluateCriminalInadmissibility
} from '../src/canada-status-admissibility-guard.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('CRA Newcomer Wealth & First Home Navigator: audits FHSA, HBP $60k, TFSA 1% penalty, FMV step-up, T1135, and Deed of Gift', () => {
  // 1. FHSA Evaluation
  const fhsaEligible = evaluateFhsaEligibility({
    isCanadianResidentForTax: true,
    age: 30,
    hasOwnedHomeInPreceding4Years: false,
    plannedContributionCad: 8000,
    marginalTaxRatePercent: 30
  });
  assert.equal(fhsaEligible.isEligible, true);
  assert.equal(fhsaEligible.actualDeductibleContributionCad, 8000);
  assert.equal(fhsaEligible.estimatedTaxSavingsCad, 2400);

  // 2. HBP Enhanced $60k & 5-year grace period
  const hbpEvaluation = evaluateHbpWithdrawal({
    rrspBalanceCad: 70000,
    requestedWithdrawalCad: 60000,
    withdrawalDate: '2024-06-01'
  });
  assert.equal(hbpEvaluation.isEligible, true);
  assert.equal(hbpEvaluation.maxAllowableWithdrawalCad, 60000);
  assert.equal(hbpEvaluation.repaymentTerms.gracePeriodYears, 5); // 2024 withdrawal gets 5-year grace

  // 3. TFSA 1% Non-resident penalty
  const tfsaPenalty = evaluateTfsaNonResidentPenalty({
    isCanadianTaxResident: false,
    contributionAmountCad: 6000,
    monthsMaintainedWhileNonResident: 4
  });
  assert.equal(tfsaPenalty.isPenaltyApplicable, true);
  assert.equal(tfsaPenalty.penaltyTaxOwedCad, 240); // 6000 * 1% * 4 = $240

  // 4. FMV Step-Up on Landing (ITA 128.1) & T1135 First Year Exemption
  const landingStepUp = evaluateForeignPropertyAndLandingStepUp({
    landingDate: '2025-04-10',
    foreignPropertyOriginalCostCad: 200000,
    foreignPropertyFmvAtLandingCad: 350000,
    taxYearToAssess: 2025
  });
  assert.equal(landingStepUp.landingCostBaseStepUp.deemedCostBaseOnLandingCad, 350000);
  assert.equal(landingStepUp.landingCostBaseStepUp.preLandingAccruedGainsShelteredCad, 150000);
  assert.equal(landingStepUp.t1135ReportingAudit.isFirstYearExemptionApplicable, true);
  assert.equal(landingStepUp.t1135ReportingAudit.isT1135FilingMandatoryThisYear, false);

  // 5. Overseas Gift & AML
  const giftAudit = evaluateOverseasGiftAndAmlProof({
    giftAmountCad: 75000,
    hasSignedDeedOfGift: true,
    hasBankConfirmationWireSlip: true
  });
  assert.equal(giftAudit.isTaxableInCanada, false);
  assert.equal(giftAudit.fintracAmlAudit.isAuditReady, true);
});

test('Ontario & BC Tenancy Navigator: checks 2.5% vs post-2018 exemption, s. 5(i) shared bath, N12 compensation deadline, T1 1-yr limit, and BC 12-month penalty', () => {
  // 1. Rent increase audit: Rent-controlled unit exceeding 2.5%
  const rentControlledAudit = auditOntarioRentIncrease({
    currentMonthlyRentCad: 2000,
    proposedMonthlyRentCad: 2150, // 7.5% increase
    buildingFirstOccupiedDate: '2015-01-01',
    noticeFormUsed: 'N1'
  });
  assert.equal(rentControlledAudit.isRentControlled, true);
  assert.equal(rentControlledAudit.isIncreaseLawful, false);
  assert.ok(rentControlledAudit.defects[0].includes('exceeds the 2.5%'));

  // 2. Post-2018 exempt unit
  const exemptAudit = auditOntarioRentIncrease({
    currentMonthlyRentCad: 2000,
    proposedMonthlyRentCad: 2300,
    buildingFirstOccupiedDate: '2020-05-01',
    noticeFormUsed: 'N2',
    noticeGivenDate: '2026-01-01',
    effectiveDate: '2026-04-01'
  });
  assert.equal(exemptAudit.isRentControlled, false);
  assert.equal(exemptAudit.isIncreaseLawful, true);

  // 3. Shared kitchen/bath with landlord under s. 5(i)
  const sharedBath = evaluateOntarioSharedKitchenBathroomJurisdiction({
    sharesKitchenOrBathroomWithLandlord: true,
    landlordOrFamilyLivesInUnit: true,
    relativeRelationshipToLandlord: 'self'
  });
  assert.equal(sharedBath.isRtaApplicable, false);
  assert.equal(sharedBath.ltbHasJurisdiction, false);

  // 4. Form N12 compensation paid AFTER termination date = VOID
  const lateCompensationN12 = auditOntarioFormN12Notice({
    monthlyRentCad: 2200,
    noticeTerminationDate: '2026-05-31',
    compensationPaidDate: '2026-06-02', // 2 days late!
    noticeServedDate: '2026-03-31'
  });
  assert.equal(lateCompensationN12.isNoticeValid, false);
  assert.ok(lateCompensationN12.defects[0].includes('AFTER the termination date'));

  // 5. Form T1 1-year strict limitation period under s. 135
  const expiredT1Claim = evaluateOntarioT1RefundClaim({
    amountPaidCad: 1000,
    paymentDate: '2024-01-01',
    assessmentDate: '2026-01-01' // 24 months later
  });
  assert.equal(expiredT1Claim.isWithinLimitationPeriod, false);
  assert.ok(expiredT1Claim.remedy.includes('statute-barred'));

  // 6. BC RTB 12-Month Rent Bad Faith Penalty under s. 51(2)
  const bcBadFaith = auditBcTenancyNotice({
    type: 'landlord_use',
    currentRentCad: 2500,
    landlordFailedToOccupyFor6Months: true
  });
  assert.equal(bcBadFaith.isBadFaithPenaltyApplicable, true);
  assert.equal(bcBadFaith.statutoryPenaltyAmountCad, 30000); // 2500 * 12 = $30,000
});

test('Global Expat & Tenancy Navigator: evaluates UAE Gratuity & Art 6 deduction bar, Dubai RERA 12-mo notary notice, NZ AEWV & bond, Ireland CSEP Stamp 4, and Singapore COMPASS', () => {
  // 1. UAE Gratuity & Art 6 recruitment fee deduction bar
  const uaeWorker = evaluateUaeGratuityAndWps({
    monthlyBasicSalaryAed: 15000,
    yearsOfService: 4,
    unlawfulDeductionsClaimedByEmployerAed: 5000 // visa fee
  });
  // 4 years * 21 days * (15000/30 = 500/day) = 4 * 21 * 500 = 42,000 AED
  assert.equal(uaeWorker.accruedGratuityAed, 42000);
  assert.equal(uaeWorker.deductionsAudit.isDeductionLegallyBarred, true);

  // 2. Dubai RERA 12-Month Eviction Notice (Email is VOID!)
  const dubaiNotice = auditDubaiReraEvictionNotice({
    noticeMethod: 'email',
    noticeMonthsGiven: 12
  });
  assert.equal(dubaiNotice.isValidNotice, false);
  assert.ok(dubaiNotice.defects[0].includes('Notary Public'));

  // 3. NZ AEWV & Tenancy Bond 23-day lodgement breach
  const nzWorker = evaluateNewZealandAewvAndTenancy({
    daysSinceJobLoss: 30,
    tenancyBondPaidNzd: 2000,
    bondWorkingDaysSincePayment: 28, // > 23 days
    bondLodgedWithMbie: false
  });
  assert.equal(nzWorker.aewvRedundancyAudit.isCushionActive, true);
  assert.equal(nzWorker.aewvRedundancyAudit.cushionRemainingDays, 60);
  assert.equal(nzWorker.tenancyBondAudit.isLandlordInBreach, true);
  assert.equal(nzWorker.tenancyBondAudit.exemplaryDamagesPayableNzd, 1500);

  // 4. Ireland CSEP Stamp 4 transition & RPZ 2% cap
  const irelandWorker = evaluateIrelandCsepAndRpz({
    monthsWorkedOnCsep: 24, // >= 21 months
    currentAnnualRentEur: 20000,
    proposedAnnualRentEur: 21500, // 7.5% increase in RPZ
    isInRentPressureZone: true
  });
  assert.equal(irelandWorker.csepStamp4Audit.isStamp4Eligible, true);
  assert.equal(irelandWorker.rpzTenancyAudit.isRentIncreaseCompliant, false);
  assert.equal(irelandWorker.rpzTenancyAudit.maxAllowedIncreaseEur, 400); // 2% of 20000

  // 5. Singapore COMPASS Pass
  const singaporeEp = evaluateSingaporeCompassPass({
    salaryPoints: 20,
    qualificationPoints: 20,
    diversityPoints: 10,
    localSupportPoints: 10
  });
  assert.equal(singaporeEp.totalScore, 60);
  assert.equal(singaporeEp.isPassingScore, true);
});

test('Canada Status & Admissibility Guard: audits IRPR s. 182 restoration, CBSA PGWP flagpoling ban, DLI 150-day leave, and s. 36 rehabilitation', () => {
  // 1. Restoration of Status (IRPR s. 182)
  const validRestoration = evaluateRestorationOfStatus({
    statusExpiredDate: '2026-03-01',
    assessmentDate: '2026-04-10', // 40 days
    remainedInCanada: true
  });
  assert.equal(validRestoration.isEligibleToApply, true);
  assert.equal(validRestoration.daysRemainingToApply, 50);
  assert.equal(validRestoration.statutoryWorkStudyProhibition.canWorkWhilePending, false);

  // Late restoration (> 90 days)
  const lateRestoration = evaluateRestorationOfStatus({
    statusExpiredDate: '2025-10-01',
    assessmentDate: '2026-04-10', // ~190 days
    remainedInCanada: true
  });
  assert.equal(lateRestoration.isEligibleToApply, false);

  // 2. CBSA Flagpoling: PGWP Border Ban
  const pgwpBorderAttempt = auditFlagpolingEligibility({
    requestedPermitType: 'pgwp',
    borderPort: 'peace_bridge',
    dayOfWeek: 'wednesday',
    timeOfArrivalHour: 10
  });
  assert.equal(pgwpBorderAttempt.isFlagpolingPermitted, false);
  assert.ok(pgwpBorderAttempt.defects[0].includes('PGWP BORDER BAN'));

  // 3. DLI Compliance: 150-day authorized leave limit & illegal work
  const dliLeaveBreach = auditDliAuthorizedLeave({
    leaveDurationDays: 160, // > 150 days
    hasOfficialSchoolLeaveApproval: true,
    workedDuringLeave: true // illegal under IRPR s. 186(v)
  });
  assert.equal(dliLeaveBreach.isCompliant, false);
  assert.equal(dliLeaveBreach.violations.length, 2);

  // 4. Criminal Inadmissibility: 10-year deemed rehab vs serious criminality
  const deemedRehab = evaluateCriminalInadmissibility({
    offenseClassification: 'non_serious_summary',
    yearsSinceSentenceCompleted: 12,
    numberOfConvictions: 1
  });
  assert.equal(deemedRehab.deemedRehabilitationEligible, true);

  const seriousCrime = evaluateCriminalInadmissibility({
    offenseClassification: 'serious_criminality',
    yearsSinceSentenceCompleted: 15
  });
  assert.equal(seriousCrime.deemedRehabilitationEligible, false); // Serious crime is never deemed rehabilitated!
});

test('HTTP API Batch 4: validates GET & POST endpoints for wealth, tenancy, global expat, and status admissibility', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'test-admin-token-at-least-24-chars-long');
  await new Promise(res => server.listen(0, '127.0.0.1', res));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    // 1. CRA Newcomer Wealth (GET & POST)
    const resGetWealth = await fetch(`${baseUrl}/v1/tools/cra-newcomer-wealth?fhsa=8000&hbp=60000`);
    assert.equal(resGetWealth.status, 200);
    const bodyGetWealth = await resGetWealth.json();
    assert.ok(bodyGetWealth.firstHomeStrategies.combinedPurchasingPowerCad > 0);

    const resPostWealth = await fetch(`${baseUrl}/v1/tools/cra-newcomer-wealth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fhsa: { plannedContributionCad: 8000 },
        hbp: { requestedWithdrawalCad: 50000 }
      })
    });
    assert.equal(resPostWealth.status, 200);
    const bodyPostWealth = await resPostWealth.json();
    assert.equal(bodyPostWealth.firstHomeStrategies.fhsa.actualDeductibleContributionCad, 8000);

    // 2. Ontario & BC Tenancy (GET & POST)
    const resGetTenancy = await fetch(`${baseUrl}/v1/tools/ontario-bc-tenancy?currentRent=2000&proposedRent=2300`);
    assert.equal(resGetTenancy.status, 200);
    const bodyGetTenancy = await resGetTenancy.json();
    assert.equal(bodyGetTenancy.isIncreaseLawful, false);

    const resPostTenancy = await fetch(`${baseUrl}/v1/tools/ontario-bc-tenancy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'BC',
        type: 'bc_tenancy',
        currentRentCad: 2200,
        landlordFailedToOccupyFor6Months: true
      })
    });
    assert.equal(resPostTenancy.status, 200);
    const bodyPostTenancy = await resPostTenancy.json();
    assert.equal(bodyPostTenancy.statutoryPenaltyAmountCad, 2200 * 12);

    // 3. Global Expat (GET & POST)
    const resGetExpat = await fetch(`${baseUrl}/v1/tools/global-expat?country=uae&salary=20000&years=3`);
    assert.equal(resGetExpat.status, 200);
    const bodyGetExpat = await resGetExpat.json();
    assert.ok(bodyGetExpat.accruedGratuityAed > 0);

    const resPostExpat = await fetch(`${baseUrl}/v1/tools/global-expat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        country: 'nz',
        daysSinceJobLoss: 20
      })
    });
    assert.equal(resPostExpat.status, 200);
    const bodyPostExpat = await resPostExpat.json();
    assert.equal(bodyPostExpat.aewvRedundancyAudit.isCushionActive, true);

    // 4. Canada Status Admissibility (GET & POST)
    const resGetAdmissibility = await fetch(`${baseUrl}/v1/tools/canada-status-admissibility?category=flagpoling&permit=pgwp`);
    assert.equal(resGetAdmissibility.status, 200);
    const bodyGetAdmissibility = await resGetAdmissibility.json();
    assert.equal(bodyGetAdmissibility.isFlagpolingPermitted, false);

    const resPostAdmissibility = await fetch(`${baseUrl}/v1/tools/canada-status-admissibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'restoration',
        statusExpiredDate: '2026-03-10',
        assessmentDate: '2026-04-10'
      })
    });
    assert.equal(resPostAdmissibility.status, 200);
    const bodyPostAdmissibility = await resPostAdmissibility.json();
    assert.equal(bodyPostAdmissibility.isEligibleToApply, true);

  } finally {
    await new Promise(res => server.close(res));
  }
});
