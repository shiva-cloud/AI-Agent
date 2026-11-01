import test from 'node:test';
import assert from 'node:assert/strict';

import { auditOntarioThaLicensing } from '../src/ontario-employment-temp-help-agency-licensing-navigator.js';
import { auditOntarioTemporaryLayoff } from '../src/ontario-employment-temp-layoff-constructive-dismissal-navigator.js';
import { evaluateOntarioHousingCreedAccommodation } from '../src/ontario-human-rights-housing-creed-navigator.js';
import { calculateOntarioStatutorySeverance } from '../src/ontario-employment-severance-payroll-calculation-navigator.js';
import { evaluateSpeculationTaxAndRebates } from '../src/speculation-tax-rebate-navigator.js';
import { evaluateStatutorySeveranceNotice } from '../src/statutory-severance-notice-navigator.js';
import { evaluateGovernmentEnrollment } from '../src/sin-healthcare-navigator.js';
import { resolveSocialCrisisGuidance, detectSocialCrisisScenario } from '../src/social-qa-crisis-navigator.js';
import { evaluatePortOfEntryRights } from '../src/poe-rights-navigator.js';
import { calculateSchoolPlacement, auditIspaCompliance } from '../src/schooling-catchment.js';
import { evaluateStatutoryTimeline, generateIcsCalendar } from '../src/timeline-calendar-sync.js';
import { evaluateSuperVisaAndFamilySponsorship, getStatutoryLicoThreshold } from '../src/super-visa-sponsor.js';
import { evaluateTaxShield } from '../src/tax-shield-optimizer.js';
import { evaluateYukonCriticalImpactWorker } from '../src/yukon-nominee-critical-impact-worker-navigator.js';
import { evaluateRealEstateAssignment, generateAssignmentStatement } from '../src/real-estate-assignment-navigator.js';

test('Batch 21 Recommendations (Sweep 28: Recs 381–395)', async (t) => {
  await t.test('Rec 381: auditOntarioThaLicensing audits licensing status, joint liability, and bounds inputs', () => {
    const unlic = auditOntarioThaLicensing({
      entityRole: 'CLIENT_EMPLOYER',
      isAgencyLicensedByMlitst: false,
      hasApplicationInProcessWithTransitionStatus: false,
      didAgencyChargeFeesToWorker: true,
      feeAmountChargedToWorkerCad: 1500,
      hasUnpaidWagesOrOvertime: true,
      unpaidWagesAmountCad: 3200,
      workerName: '  John Doe <script>alert(1)</script>  ',
      agencyName: 'Staffing Express Inc.',
      clientName: 'Ontario Logistics Hub',
      assessmentDate: 'invalid-date'
    });

    assert.equal(unlic.isLicensingLawful, false);
    assert.equal(unlic.workerName, 'John Doe <script>alert(1)</script>');
    assert.equal(unlic.agencyName, 'Staffing Express Inc.');
    assert.equal(unlic.clientName, 'Ontario Logistics Hub');
    assert.equal(unlic.assessmentDate, '2026-10-31');
    assert.equal(unlic.penaltyAudit.isJointAndSeveralWageLiabilityApplicable, true);
    assert.equal(unlic.penaltyAudit.unpaidWagesOwedCad, 3200);
    assert.equal(unlic.penaltyAudit.illegalFeesCollectedCad, 1500);
    assert.equal(unlic.penaltyAudit.estimatedAdminPenaltyCad, 15000);
    assert.ok(unlic.statutoryViolations.some(v => v.rule === 'CLIENT_ENGAGING_UNLICENSED_THA'));
    assert.ok(unlic.statutoryViolations.some(v => v.rule === 'ILLEGAL_FEE_CHARGED_TO_ASSIGNMENT_WORKER'));
    assert.ok(unlic.statutoryViolations.some(v => v.rule === 'UNPAID_ASSIGNMENT_WAGES_JOINT_LIABILITY'));

    const lic = auditOntarioThaLicensing({
      isAgencyLicensedByMlitst: true,
      assessmentDate: '2026-11-01'
    });
    assert.equal(lic.isLicensingLawful, true);
    assert.equal(lic.complianceStatus, 'COMPLIANT_LICENSED_OPERATION');
  });

  await t.test('Rec 382: auditOntarioTemporaryLayoff audits 13/35-week caps, deemed termination, and Elsegood doctrine', () => {
    const res = auditOntarioTemporaryLayoff({
      layoffDurationWeeks: 14,
      employerContinuedHealthBenefits: false,
      hasValidWrittenLayoffClauseInContract: false,
      yearsOfService: 6,
      regularWeeklyWageCad: 1200,
      employerOntarioPayrollOver2_5Million: true,
      employeeName: 'Jane Smith',
      employerName: 'Auto Parts Ltd',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.employeeName, 'Jane Smith');
    assert.equal(res.employerName, 'Auto Parts Ltd');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.isDeemedTerminatedUnderEsa, true);
    assert.equal(res.deemedTerminationGround, 'EXCEEDED_13_WEEKS_WITHOUT_BENEFIT_CONTINUATION');
    assert.equal(res.isCommonLawConstructiveDismissal, true);
    assert.equal(res.financialEntitlements.statutoryNoticeWeeks, 6);
    assert.equal(res.financialEntitlements.statutoryNoticePayCad, 7200);
    assert.equal(res.financialEntitlements.statutorySeveranceWeeks, 6);
    assert.equal(res.financialEntitlements.statutorySeverancePayCad, 7200);
    assert.equal(res.financialEntitlements.totalStatutoryPayOwingCad, 14400);

    const ext = auditOntarioTemporaryLayoff({
      layoffDurationWeeks: 20,
      employerContinuedHealthBenefits: true
    });
    assert.equal(ext.isDeemedTerminatedUnderEsa, false);
    assert.ok(ext.riskWarnings.some(w => w.warningType === 'EXTENDED_LAYOFF_ACTIVE'));
  });

  await t.test('Rec 383: evaluateOntarioHousingCreedAccommodation audits Amselem doctrine and constructive discrimination', () => {
    const res = evaluateOntarioHousingCreedAccommodation({
      tenantName: 'David Ben-Ami',
      landlordName: 'Metro Highrise Condos',
      creedPracticeCategory: 'SUKKAH_STRUCTURE_ON_BALCONY',
      landlordRefusalGround: 'BUILDING_AESTHETICS',
      assessmentDate: 'invalid-date'
    });

    assert.equal(res.tenantName, 'David Ben-Ami');
    assert.equal(res.landlordName, 'Metro Highrise Condos');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.isHumanRightsBreachDetected, true);
    assert.equal(res.legalVerdict, 'ACTIONABLE_CREED_DISCRIMINATION_HRTO');
    assert.ok(res.legalProtections.some(p => p.precedent.includes('Amselem')));
    assert.ok(res.statutoryViolations.some(v => v.violation === 'CONSTRUCTIVE_DISCRIMINATION_BASED_ON_CREED'));

    const clean = evaluateOntarioHousingCreedAccommodation({
      landlordRefusedAccommodation: false
    });
    assert.equal(clean.isHumanRightsBreachDetected, false);
    assert.equal(clean.legalVerdict, 'REASONABLY_ACCOMMODATED_OR_NO_BREACH');
  });

  await t.test('Rec 384: calculateOntarioStatutorySeverance computes partial months, $2.5M threshold, and bounds inputs', () => {
    const res = calculateOntarioStatutorySeverance({
      completedYearsOfService: 6,
      additionalCompletedMonthsOfService: 6,
      regularWeeklyWageCad: 1000,
      employerOntarioAnnualPayrollCad: 3000000,
      employeeName: 'Sarah Conner',
      employerName: 'Cyberdyne Systems',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.employeeName, 'Sarah Conner');
    assert.equal(res.employerName, 'Cyberdyne Systems');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.isEligibleForSeverance, true);
    assert.equal(res.totalExactYearsOfService, 6.5);
    assert.equal(res.severanceCalculation.cappedSeveranceWeeks, 6.5);
    assert.equal(res.severanceCalculation.totalSeverancePayEntitledCad, 6500);

    const capped = calculateOntarioStatutorySeverance({
      completedYearsOfService: 30,
      regularWeeklyWageCad: 1000,
      employerOntarioAnnualPayrollCad: 5000000
    });
    assert.equal(capped.severanceCalculation.cappedSeveranceWeeks, 26);
    assert.equal(capped.severanceCalculation.isSubjectTo26WeekCap, true);

    const misconduct = calculateOntarioStatutorySeverance({
      isTerminatedForWilfulMisconduct: true
    });
    assert.equal(misconduct.isEligibleForSeverance, false);
    assert.equal(misconduct.severanceWeeksEntitled, 0);
  });

  await t.test('Rec 385: evaluateSpeculationTaxAndRebates audits BC SVT exemptions and Ontario NRST 25% PR rebate', () => {
    const bcSvt = evaluateSpeculationTaxAndRebates({
      province: 'BC',
      propertyAssessedValueCad: 1500000,
      isCanadianCitizenOrPr: false,
      isPrincipalResidenceOccupied6Months: false,
      rentalDaysInYear: 180,
      ownerName: 'Chen Wei',
      propertyAddress: '555 Burrard St, Vancouver, BC',
      assessmentDate: '2026-10-31'
    });
    assert.equal(bcSvt.ownerName, 'Chen Wei');
    assert.equal(bcSvt.isTaxExempt, true);
    assert.ok(bcSvt.applicableExemption.includes('Arm\'s-Length Tenancy Exemption'));
    assert.equal(bcSvt.netTaxPayableCad, 0);

    const onNrst = evaluateSpeculationTaxAndRebates({
      province: 'ON',
      purchasePriceCad: 800000,
      isCanadianCitizenOrPr: false,
      purchaseClosingDate: '2026-01-15',
      prStatusAcquiredDate: '2026-03-01',
      rebateApplicationDate: '2026-04-15',
      occupiedAsPrincipalResidenceWithin60Days: true,
      heldSolelyWithSpouse: true,
      assessmentDate: '2026-10-31'
    });
    assert.equal(onNrst.province, 'ON');
    assert.equal(onNrst.ontarioNrstRebate.isNrstRebateEligible, true);
    assert.equal(onNrst.ontarioNrstRebate.nrstPaidCad, 200000);
    assert.equal(onNrst.ontarioNrstRebate.nrstRebateAmountCad, 200000);
  });

  await t.test('Rec 386: evaluateStatutorySeveranceNotice evaluates ESA notice scale, Bardal factors, and Waksdale voidness', () => {
    const res = evaluateStatutorySeveranceNotice({
      yearsOfService: 7,
      employeeAgeYears: 50,
      annualSalaryCad: 104000,
      roleSeniority: 'managerial_professional',
      province: 'ON',
      employerPayrollExceeds2_5Million: true,
      hasSignedTerminationClause: true,
      terminationClauseViolatesEsa: true,
      employeeName: 'Robert Vance',
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.employeeName, 'Robert Vance');
    assert.equal(res.assessmentDate, '2026-10-31');
    assert.equal(res.statutoryEsaAudit.statutoryNoticeWeeks, 7);
    assert.equal(res.statutoryEsaAudit.statutoryNoticePayCad, 14000);
    assert.equal(res.statutoryEsaAudit.statutorySeveranceWeeks, 7);
    assert.equal(res.statutoryEsaAudit.statutorySeverancePayCad, 14000);
    assert.equal(res.statutoryEsaAudit.totalStatutoryMinimumCad, 28000);
    assert.equal(res.enforceabilityAudit.isClauseEnforceable, false);
    assert.equal(res.enforceabilityAudit.recommendedLegalClaim, 'COMMON_LAW_NOTICE');
    assert.ok(res.commonLawAssessment.estimatedNoticeMonths >= 9.9);
  });

  await t.test('Rec 387: evaluateGovernmentEnrollment evaluates SIN series, OHIP waiting period repeal, and provincial ID', () => {
    const onPr = evaluateGovernmentEnrollment({
      applicantName: 'Carlos Gomez',
      statusInCanada: 'pr_copr',
      province: 'ON',
      assessmentDate: '2026-10-31'
    });

    assert.equal(onPr.applicantName, 'Carlos Gomez');
    assert.equal(onPr.assessmentDate, '2026-10-31');
    assert.equal(onPr.sinEvaluation.eligible, true);
    assert.equal(onPr.healthcareEvaluation.eligible, true);
    assert.equal(onPr.healthcareEvaluation.waitingPeriodDays, 0);
    assert.ok(onPr.healthcareEvaluation.notes.includes('permanently eliminated in Ontario'));

    const bcWp = evaluateGovernmentEnrollment({
      statusInCanada: 'work_permit',
      province: 'BC',
      workPermitMinDurationMonths: 12
    });
    assert.equal(bcWp.sinEvaluation.sinType, 'temporary_9_series');
    assert.equal(bcWp.healthcareEvaluation.eligible, true);
    assert.equal(bcWp.healthcareEvaluation.waitingPeriodDays, 60);
  });

  await t.test('Rec 388: resolveSocialCrisisGuidance provides statutory defense for passport retention, cash rent, and ghosting', () => {
    const passportCrisis = resolveSocialCrisisGuidance('My employer kept my passport and refuses to return it', { country: 'CA' });
    assert.ok(passportCrisis);
    assert.equal(passportCrisis.type, 'passport_retention');
    assert.ok(passportCrisis.authority.includes('EPFNA'));
    assert.ok(passportCrisis.actionableRecourse.some(r => r.includes('Vulnerable Worker Open Work Permit')));

    const cashRentCrisis = resolveSocialCrisisGuidance('Landlord is demanding cash rent without a receipt', { country: 'CA' });
    assert.ok(cashRentCrisis);
    assert.equal(cashRentCrisis.type, 'cash_without_receipt');
    assert.ok(cashRentCrisis.statutoryRule.includes('Ontario RTA s. 109'));

    const ghostCrisis = resolveSocialCrisisGuidance('My immigration consultant has stopped responding and ghosted me', { country: 'CA' });
    assert.ok(ghostCrisis);
    assert.equal(ghostCrisis.type, 'agent_ghosting');
    assert.ok(ghostCrisis.actionableRecourse.some(r => r.includes('IMM 5476')));

    const statusCrisis = resolveSocialCrisisGuidance('My work permit expires soon while appeal pending', { country: 'CA' });
    assert.ok(statusCrisis);
    assert.equal(statusCrisis.type, 'maintained_status_protection');
    assert.ok(statusCrisis.actionableRecourse.some(r => r.includes('interim work authorization letter')));
  });

  await t.test('Rec 389: evaluatePortOfEntryRights audits CBSA/CBP device privacy, right to counsel, and voluntary withdrawal', () => {
    const cbsa = evaluatePortOfEntryRights({
      country: 'CA',
      travelerName: 'Priya Sharma',
      isInSecondaryInspection: true,
      hasDigitalDeviceSearchConcern: true,
      facingRefusalRisk: true,
      assessmentDate: '2026-10-31'
    });

    assert.equal(cbsa.travelerName, 'Priya Sharma');
    assert.equal(cbsa.assessmentDate, '2026-10-31');
    assert.equal(cbsa.country, 'CA');
    assert.ok(cbsa.statutoryRights.digitalDeviceSearchPolicy.includes('Searching cloud storage or remote data is strictly prohibited'));
    assert.ok(cbsa.statutoryRights.legalCounselAccess.includes('Charter s. 10(b)'));
    assert.ok(cbsa.statutoryRights.voluntaryWithdrawalRemedy.includes('Allowed to Leave Canada (Form IMM 1282 / IRPR s. 42)'));

    const cbp = evaluatePortOfEntryRights({ country: 'US', facingRefusalRisk: true });
    assert.equal(cbp.country, 'US');
    assert.ok(cbp.statutoryRights.voluntaryWithdrawalRemedy.includes('INA § 235(a)(4)'));
  });

  await t.test('Rec 390: calculateSchoolPlacement & auditIspaCompliance evaluate tuition exemption and immunization rules', () => {
    const school = calculateSchoolPlacement({
      childName: 'Liam Chen',
      birthYear: 2018,
      currentYear: 2026,
      status: 'work_permit',
      lang: 'non_english',
      assessmentDate: '2026-10-31'
    });

    assert.equal(school.childName, 'Liam Chen');
    assert.equal(school.assessmentDate, '2026-10-31');
    assert.equal(school.age, 8);
    assert.equal(school.grade, 'Grade 3');
    assert.equal(school.tuitionExempt, true);
    assert.ok(school.statutoryTuitionRight.includes('Section 49.2'));
    assert.equal(school.eslAssessmentRequired, true);

    const ispa = auditIspaCompliance({
      childName: 'Liam Chen',
      completedVaccines: ['dtp', 'mmr', 'meningococcal', 'varicella'],
      assessmentDate: '2026-10-31'
    });
    assert.equal(ispa.childName, 'Liam Chen');
    assert.equal(ispa.isCompliant, true);
    assert.equal(ispa.missingCount, 0);

    const nonCompliant = auditIspaCompliance({
      completedVaccines: ['dtp']
    });
    assert.equal(nonCompliant.isCompliant, false);
    assert.equal(nonCompliant.missingCount, 3);
    assert.ok(nonCompliant.suspensionRisk.includes('High Suspension Risk'));
  });

  await t.test('Rec 391: evaluateStatutoryTimeline & generateIcsCalendar produce statutory milestones and valid iCal format', () => {
    const timeline = evaluateStatutoryTimeline({
      milestoneType: 'work_permit_expiry',
      anchorDate: '2026-12-31',
      applicantName: 'Vikram Patel',
      assessmentDate: '2026-10-31'
    });

    assert.equal(timeline.applicantName, 'Vikram Patel');
    assert.equal(timeline.assessmentDate, '2026-10-31');
    assert.equal(timeline.milestoneType, 'work_permit_expiry');
    assert.equal(timeline.totalEventsGenerated, 5);
    assert.ok(timeline.icsContent.includes('BEGIN:VCALENDAR'));
    assert.ok(timeline.icsContent.includes('END:VCALENDAR'));
    assert.ok(timeline.icsContent.includes('UID:northstar-'));
    assert.ok(timeline.events.some(e => e.title.includes('180 Days to Expiry')));
    assert.ok(timeline.events.some(e => e.title.includes('90-Day Restoration Window Closes')));

    // Test resilient date parsing against malformed dates
    const badDateTimeline = evaluateStatutoryTimeline({
      anchorDate: 'not-a-date'
    });
    assert.equal(badDateTimeline.anchorDate, '2026-10-31');
  });

  await t.test('Rec 392: evaluateSuperVisaAndFamilySponsorship audits Super Visa LICO, $100k insurance, and PGP undertaking', () => {
    const superVisa = evaluateSuperVisaAndFamilySponsorship({
      sponsorName: 'Rahul Verma',
      applicantName: 'Sunita Verma',
      pathway: 'super_visa',
      sponsorStatus: 'canadian_citizen',
      sponsorFamilySize: 2,
      invitedParentsCount: 2,
      sponsorLine15000IncomeYear1: 65000,
      medicalInsurance: {
        hasMedicalInsuranceQuote: true,
        coverageAmountCad: 100000,
        durationDays: 365,
        isCanadianOrApprovedForeignProvider: true,
        hasPreExistingCoverage: true,
        isRefundableIfDenied: true
      },
      assessmentDate: '2026-10-31'
    });

    assert.equal(superVisa.sponsorName, 'Rahul Verma');
    assert.equal(superVisa.applicantName, 'Sunita Verma');
    assert.equal(superVisa.assessmentDate, '2026-10-31');
    assert.equal(superVisa.isStatutorilyEligible, true);
    assert.equal(superVisa.eligibilityVerdict, 'STATUTORILY_ELIGIBLE');
    assert.equal(superVisa.totalFamilyUnitSize, 4);
    assert.equal(superVisa.insuranceAudit.isInsuranceCompliant, true);

    // Verify absence of wording guard violations
    const textOutput = JSON.stringify(superVisa);
    assert.equal(textOutput.includes('100% LICO'), false);
    assert.equal(textOutput.includes('100% refund'), false);
    assert.equal(textOutput.includes('Undertaking Guarantee'), false);
  });

  await t.test('Rec 393: evaluateTaxShield audits FHSA $8k deduction, TFSA non-resident penalty, and CCB estimation', () => {
    const shield = evaluateTaxShield({
      taxpayerName: 'Alexandre Moreau',
      annualEmploymentIncomeCad: 80000,
      province: 'ON',
      childrenUnder6: 1,
      children6to17: 1,
      isTaxResident: true,
      planToBuyFirstHome: true,
      fhsaContributionCad: 8000,
      tfsaContributionCad: 7000,
      assessmentDate: '2026-10-31'
    });

    assert.equal(shield.taxpayerName, 'Alexandre Moreau');
    assert.equal(shield.assessmentDate, '2026-10-31');
    assert.equal(shield.province, 'ON');
    assert.equal(shield.fhsaShield.contributionCad, 8000);
    assert.equal(shield.fhsaShield.estimatedIncomeTaxDeductionCad, Math.round(8000 * 0.2965));
    assert.equal(shield.tfsaShield.penaltyWarning, null);
    assert.ok(shield.childAndFamilyBenefits.estimatedAnnualCcbCad > 0);
    assert.ok(shield.totalFirstYearFinancialShieldCad > 0);

    const nonRes = evaluateTaxShield({
      isTaxResident: false,
      tfsaContributionCad: 5000
    });
    assert.ok(nonRes.tfsaShield.penaltyWarning);
    assert.equal(nonRes.tfsaShield.penaltyWarning.isLiableForPenalty, true);
    assert.equal(nonRes.tfsaShield.penaltyWarning.monthlyPenaltyCad, 50);
  });

  await t.test('Rec 394: evaluateYukonCriticalImpactWorker audits TEER 4-5 semi-skilled occupations and Yukon Community Pilot', () => {
    const ycp = evaluateYukonCriticalImpactWorker({
      targetNocTeer: 4,
      nocCode: '65201',
      monthsOfRelatedExperience: 8,
      hasPermanentFullTimeOffer: true,
      weeklyOfferedHours: 35,
      hourlyWageCad: 20,
      employerOperatingYearsInYukon: 2,
      employerRecruitmentAdvertisedWeeks: 4,
      languageClbScore: 4,
      hasHighSchoolOrEca: true,
      currentStatusInCanada: 'work_permit',
      targetCommunity: 'dawson_city',
      isApplyingForCommunityPilot: true,
      candidateName: 'Maria Santos',
      assessmentDate: '2026-10-31'
    });

    assert.equal(ycp.candidateName, 'Maria Santos');
    assert.equal(ycp.assessmentDate, '2026-10-31');
    assert.equal(ycp.isEligible, true);
    assert.equal(ycp.isCommunityPilotEndorsed, true);
    assert.equal(ycp.eligibilityStatus, 'ELIGIBLE_FOR_YUKON_CRITICAL_IMPACT_NOMINATION');
    assert.ok(ycp.statutoryRemedies.some(r => r.action.includes('LMIA Exemption A75')));

    const ineligibleTeer = evaluateYukonCriticalImpactWorker({
      targetNocTeer: 1 // High-skilled belongs to Skilled Worker stream
    });
    assert.equal(ineligibleTeer.isEligible, false);
    assert.ok(ineligibleTeer.deficiencies.some(d => d.includes('strictly targets entry-level and semi-skilled occupations in TEER 4 or 5')));
  });

  await t.test('Rec 395: evaluateRealEstateAssignment & generateAssignmentStatement audit anti-flipping and GST/HST rules', () => {
    const flipped = evaluateRealEstateAssignment({
      province: 'ON',
      originalPurchasePriceCad: 500000,
      assignmentSalePriceCad: 620000,
      depositPaidToBuilderCad: 100000,
      agreementDate: '2025-10-01',
      assignmentDate: '2026-03-01', // Held < 365 days
      hasPrescribedLifeEvent: false,
      builderConsentFeeCad: 5000,
      legalFeesCad: 2000,
      realtorCommissionCad: 10000,
      assignorName: 'Marcus Bell',
      assigneeName: 'Elena Rostova',
      propertyAddress: 'Unit 808 - 180 University Ave, Toronto, ON',
      assessmentDate: '2026-10-31'
    });

    assert.equal(flipped.assignorName, 'Marcus Bell');
    assert.equal(flipped.assigneeName, 'Elena Rostova');
    assert.equal(flipped.assessmentDate, '2026-10-31');
    assert.equal(flipped.antiFlippingAudit.antiFlippingApplies, true);
    assert.equal(flipped.antiFlippingAudit.taxableInclusionPercentage, 100);
    assert.equal(flipped.taxLiabilityEstimate.gstHstRatePercent, 13);
    assert.equal(flipped.taxLiabilityEstimate.estimatedGstHstOnLiftCad, 120000 * 0.13);

    // Verify absence of wording violations
    const statement = generateAssignmentStatement({
      assignorName: flipped.assignorName,
      assigneeName: flipped.assigneeName,
      propertyAddress: flipped.propertyAddress,
      netProfitCad: flipped.financialSummary.netAssignmentProfitCad,
      gstHstCad: flipped.taxLiabilityEstimate.estimatedGstHstOnLiftCad,
      antiFlippingApplies: true
    });
    assert.ok(statement.includes('Full Amount Deemed Business Income'));
    assert.equal(statement.includes('100% Deemed Business Income'), false);

    // Exempt via 40km employment relocation
    const relocExempt = evaluateRealEstateAssignment({
      agreementDate: '2025-10-01',
      assignmentDate: '2026-03-01',
      hasPrescribedLifeEvent: true,
      lifeEventCategory: 'employment_relocation',
      relocationDistanceKm: 65
    });
    assert.equal(relocExempt.antiFlippingAudit.antiFlippingApplies, false);
    assert.equal(relocExempt.antiFlippingAudit.taxableInclusionPercentage, 50);
  });
});
