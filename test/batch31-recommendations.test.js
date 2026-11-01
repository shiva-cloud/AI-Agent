import test from 'node:test';
import assert from 'node:assert/strict';

// Rec 531: Alberta RTA Security Deposit & Inspection Bar
import { evaluateAlbertaSecurityDeposit, ALBERTA_RTA_CONSTANTS } from '../src/alberta-tenancy-security-deposit-navigator.js';

// Rec 532: Atlantic Immigration Program (AIP)
import { evaluateAtlanticImmigrationEligibility, AIP_CONSTANTS } from '../src/atlantic-immigration-navigator.js';

// Rec 533: ATS Resume Matcher & Privacy Auditor
import { scoreCvAgainstJd, auditCvPrivacyAndStyle, normalizeAtsText } from '../src/ats-matcher.js';

// Rec 534: Audio Speech Helper & SSML Generator
import { cleanTextForSpeech, chunkTextForTTS, generateSSML, getAvailableSpeechProfiles } from '../src/audio-speech-helper.js';

// Rec 535: Auto Insurance Discrimination & SABS Benefits
import { evaluateAutoInsuranceProfile, AUTO_INSURANCE_CONSTANTS } from '../src/auto-insurance-navigator.js';

// Rec 536: BC Speculation and Vacancy Tax (SVT)
import { evaluateBcSpeculationTaxDeclaration, BC_SVT_CONSTANTS } from '../src/bc-speculation-tax-declaration-navigator.js';

// Rec 537: BC Strata Bylaw Defense & Bill 44
import { evaluateBcStrataBylawDefense, STRATA_CONSTANTS } from '../src/bc-strata-bylaw-navigator.js';

// Rec 538: Bilingual View Helper
import { generateBilingualView } from '../src/bilingual-view-helper.js';

// Rec 539: Border Flagpoling Feasibility Navigator
import { evaluateFlagpolingFeasibility, CBSA_PORTS } from '../src/border-flagpoling-navigator.js';

// Rec 540: BOWP & Maintained Status Navigator
import { evaluateBowpPathway, BOWP_CONSTANTS } from '../src/bowp-navigator.js';

// Rec 541: BC Child & Youth Employment Navigator
import { evaluateBcChildYouthEmployment, BC_LIGHT_WORK_ACTIVITIES, BC_HAZARDOUS_WORK_ACTIVITIES } from '../src/british-columbia-employment-child-youth-employment-navigator.js';

// Rec 542: BC Illness or Injury Leave Navigator
import { evaluateBcIllnessInjuryLeave, BC_SICK_LEAVE_CONSTANTS } from '../src/british-columbia-employment-illness-injury-leave-navigator.js';

// Rec 543: BC Overtime & Time Banking Navigator
import { evaluateBcOvertimeBanking, BC_OVERTIME_CONSTANTS } from '../src/british-columbia-employment-overtime-banking-navigator.js';

// Rec 544: BC Group Termination & Severance Navigator
import { evaluateBcGroupTerminationNotice, calculateBcIndividualNoticeWeeks } from '../src/british-columbia-employment-severance-group-termination-navigator.js';

// Rec 545: BC Uniform & Equipment Deduction Navigator
import { auditBcEmploymentUniformAndDeductions, BC_UNIFORM_DEDUCTION_CONSTANTS } from '../src/british-columbia-employment-uniform-equipment-deduction-navigator.js';

// -----------------------------------------------------------------------------
// Test 1 (Rec 531): Alberta RTA Security Deposit & Inspection Forfeiture
// -----------------------------------------------------------------------------
test('Rec 531: evaluateAlbertaSecurityDeposit audits s. 19 inspection bar and s. 46 caps', () => {
  const result = evaluateAlbertaSecurityDeposit({
    monthlyRentCad: 2000,
    securityDepositPaidCad: 2000,
    additionalNonRefundableFeesCad: 250, // Non-refundable fee exceeds 1 month's rent
    landlordConductedMoveInInspection: false, // Triggers statutory forfeiture under s. 19(4)
    tenantReceivedSignedMoveInReport: false,
    landlordConductedMoveOutInspection: true,
    daysSinceTenancyEnded: 15, // Overdue (>10 days under s. 46(4))
    deductionsClaimedCad: 600,
    deductionsReason: 'normal wear and tear painting scuffs',
    tenantProvidedForwardingAddress: true,
    tenantName: 'Calgary Renter',
    assessmentDate: '2026-10-31'
  });

  assert.equal(result.tenantName, 'Calgary Renter');
  assert.equal(result.assessmentDate, '2026-10-31');
  assert.equal(result.depositAudit.isDepositOvercharged, true);
  assert.equal(result.depositAudit.overchargedDepositCad, 250);
  assert.equal(result.inspectionCompliance.landlordForfeitedDeductionRights, true);
  assert.equal(result.inspectionCompliance.statutoryInspectionBarApplies, true);
  assert.equal(result.refundAssessment.isRefundOverdue, true);
  assert.equal(result.refundAssessment.illegalDeductionsCad, 600);
  assert.equal(result.refundAssessment.totalRefundOwedToTenantCad, 2250); // 2000 deposit + 250 fee, 0 deductions
  assert.ok(result.statutoryViolations.length >= 3);
  assert.ok(result.actionPlan.some(step => step.includes('RTDRS')));
});

// -----------------------------------------------------------------------------
// Test 2 (Rec 532): Atlantic Immigration Program (AIP) Eligibility
// -----------------------------------------------------------------------------
test('Rec 532: evaluateAtlanticImmigrationEligibility audits international graduate stream and funds exemption', () => {
  const result = evaluateAtlanticImmigrationEligibility({
    province: 'NS',
    stream: 'international_graduate',
    nocTeer: 1,
    clbLevel: 6,
    hasDesignatedEmployerJobOffer: true,
    isJobOfferFullTimeNonSeasonal: true,
    jobOfferDurationMonths: 24,
    hasAtlanticTwoYearCredential: true,
    monthsResidedInAtlanticDuringStudy: 18,
    familySize: 2,
    isCurrentlyWorkingInCanadaOnValidPermit: true, // Statutorily exempt from settlement funds
    candidateName: 'Halifax Scholar',
    assessmentDate: '2026-10-31'
  });

  assert.equal(result.candidateName, 'Halifax Scholar');
  assert.equal(result.province, 'NS');
  assert.equal(result.stream, 'international_graduate');
  assert.equal(result.overallEligible, true);
  assert.equal(result.languageAudit.meetsLanguageThreshold, true);
  assert.equal(result.settlementFundsAudit.isStatutorilyExempt, true);
  assert.ok(result.summaryTitle.includes('Eligible for Atlantic Immigration Program'));
  assert.ok(result.compliancePoints.some(p => p.includes('EXEMPT from prior work experience')));
  assert.ok(result.requiredSteps.some(s => s.includes('C18')));
});

// -----------------------------------------------------------------------------
// Test 3 (Rec 533): ATS Resume Matcher & Privacy Auditor
// -----------------------------------------------------------------------------
test('Rec 533: scoreCvAgainstJd audits keyword match, privacy flags, and buzzwords', () => {
  const cvWithPrivacyIssue = `
    Senior Full-Stack Engineer with 8 years experience.
    SIN: 123-456-789. Born on: 1990-05-15. Photo attached.
    Dynamic rockstar ninja team player.
    Proficient in TypeScript, JavaScript, Python, Node.js, SQL, PostgreSQL, Docker, AWS, CI/CD pipelines.
  `;
  const jobDescription = `
    Looking for a Senior Software Engineer with strong TypeScript, Node.js, PostgreSQL, Docker, AWS, and CI/CD experience.
  `;

  const result = scoreCvAgainstJd({
    cvText: cvWithPrivacyIssue,
    jdText: jobDescription,
    assessmentDate: '2026-10-31'
  });

  assert.equal(result.assessmentDate, '2026-10-31');
  assert.ok(result.matchScore >= 80);
  assert.equal(result.recommendationTier, 'critical_fix'); // Privacy flags override score
  assert.ok(result.guidance.includes('CRITICAL: Remove personal privacy identifiers'));
  assert.equal(result.audit.privacyClean, false);
  assert.ok(result.audit.privacyFlags.some(f => f.id === 'sin_ssn'));
  assert.ok(result.audit.privacyFlags.some(f => f.id === 'dob'));
  assert.ok(result.audit.privacyFlags.some(f => f.id === 'photo'));
  assert.ok(result.audit.detectedBuzzwords.includes('rockstar'));
  assert.ok(result.audit.detectedBuzzwords.includes('ninja'));
});

// -----------------------------------------------------------------------------
// Test 4 (Rec 534): Audio Speech Helper & SSML Generator
// -----------------------------------------------------------------------------
test('Rec 534: audio-speech-helper cleans markdown, chunks sentences, and creates SSML', () => {
  const markdownText = '### Overview\nUnder **IRPA s. 205(a)**, workers may bridge their permits [see guide](https://canada.ca). First sentence! Second sentence? Third sentence.';
  const cleaned = cleanTextForSpeech(markdownText);

  assert.ok(!cleaned.includes('###'));
  assert.ok(!cleaned.includes('**'));
  assert.ok(!cleaned.includes('https://canada.ca'));
  assert.ok(cleaned.includes('Under IRPA s. 205(a)'));

  const chunks = chunkTextForTTS(cleaned, 50);
  assert.ok(Array.isArray(chunks));
  assert.ok(chunks.length >= 2);

  const ssml = generateSSML({ text: 'Welcome to Canada.', voice: 'en-CA', rate: 'fast', pitch: 'medium' });
  assert.ok(ssml.includes('<speak version="1.0"'));
  assert.ok(ssml.includes('xml:lang="en-CA"'));
  assert.ok(ssml.includes('rate="fast"'));
  assert.ok(ssml.includes('pitch="medium"'));

  const profiles = getAvailableSpeechProfiles();
  assert.ok(profiles.some(p => p.code === 'en-IN'));
  assert.ok(profiles.some(p => p.code === 'hi-IN'));
  assert.ok(profiles.some(p => p.code === 'pa-IN'));
});

// -----------------------------------------------------------------------------
// Test 5 (Rec 535): Auto Insurance Discrimination & SABS Benefits
// -----------------------------------------------------------------------------
test('Rec 535: evaluateAutoInsuranceProfile audits foreign credit, SABS IRB cap, and Take-All-Comers', () => {
  const result = evaluateAutoInsuranceProfile({
    province: 'ON',
    postalCode: 'L6Y 1A1', // Brampton high risk territory
    annualGrossIncomeCad: 90000,
    employmentStatus: 'employed',
    foreignDrivingYears: 6,
    hasForeignExperienceLetter: true,
    optionalIrbEndorsementWeeklyCad: 400, // Standard cap
    experiencedRefusalOrUnreasonableDelay: true, // Take-all-comers violation
    driverName: 'Toronto Commuter',
    assessmentDate: '2026-10-31'
  });

  assert.equal(result.driverName, 'Toronto Commuter');
  assert.equal(result.province, 'ON');
  assert.equal(result.ratingTerritoryAnalysis.isHighPremiumZone, true);
  assert.equal(result.ratingTerritoryAnalysis.territoryTier, 'HIGH_RISK_PREMIUM_ZONE');
  assert.equal(result.experienceLetterAudit.isLetterValid, true);
  assert.equal(result.ratingTerritoryAnalysis.savingsPercent, 55);
  assert.equal(result.sabsAccidentBenefits.eligibleBenefitType, 'INCOME_REPLACEMENT_BENEFIT');
  assert.equal(result.sabsAccidentBenefits.weeklyIncomeReplacementCad, 400); // Capped at $400 standard
  assert.ok(result.sabsAccidentBenefits.optionalCoverageRecommendation.includes('OPCF 47'));
  assert.equal(result.takeAllComersAudit.isViolationSuspected, true);
  assert.ok(result.takeAllComersAudit.stepsToEnforce.some(s => s.includes('FSRA')));
});

// -----------------------------------------------------------------------------
// Test 6 (Rec 536): BC Speculation and Vacancy Tax (SVT) Declaration
// -----------------------------------------------------------------------------
test('Rec 536: evaluateBcSpeculationTaxDeclaration audits exemptions and satellite family bar', () => {
  // Principal residence eligible
  const eligible = evaluateBcSpeculationTaxDeclaration({
    propertyRegion: 'Metro Vancouver',
    assessedPropertyValueCad: 1500000,
    ownerCitizenshipStatus: 'canadian_citizen_or_pr',
    isSatelliteFamily: false,
    propertyUseCategory: 'principal_residence',
    monthsOccupiedInYear: 12,
    ownerName: 'Vancouver Homeowner',
    calendarTaxYear: '2025',
    assessmentDate: '2026-10-31'
  });

  assert.equal(eligible.isTaxableRegion, true);
  assert.equal(eligible.isExemptFromSvt, true);
  assert.equal(eligible.estimatedTaxLiabilityCad, 0);
  assert.equal(eligible.applicableTaxRatePercent, BC_SVT_CONSTANTS.CANADIAN_RESIDENT_TAX_RATE_PERCENT);

  // Satellite family barred from principal residence exemption
  const satellite = evaluateBcSpeculationTaxDeclaration({
    propertyRegion: 'Victoria',
    assessedPropertyValueCad: 2000000,
    ownerCitizenshipStatus: 'canadian_citizen_or_pr',
    isSatelliteFamily: true,
    propertyUseCategory: 'principal_residence',
    monthsOccupiedInYear: 12,
    ownerName: 'Satellite Owner',
    calendarTaxYear: '2025',
    assessmentDate: '2026-10-31'
  });

  assert.equal(satellite.isExemptFromSvt, false);
  assert.equal(satellite.applicableTaxRatePercent, BC_SVT_CONSTANTS.FOREIGN_AND_SATELLITE_TAX_RATE_PERCENT);
  assert.equal(satellite.estimatedTaxLiabilityCad, 40000); // 2% of 2M
  assert.ok(satellite.riskWarnings.some(w => w.includes('SATELLITE FAMILY BAR')));
});

// -----------------------------------------------------------------------------
// Test 7 (Rec 537): BC Strata Bylaw Defense & Bill 44
// -----------------------------------------------------------------------------
test('Rec 537: evaluateBcStrataBylawDefense audits Bill 44 rental and age restriction invalidations', () => {
  // Unlawful rental restriction and fee
  const rentalDispute = evaluateBcStrataBylawDefense({
    disputeType: 'rental_restriction',
    isLongTermRental: true,
    fineAmountLeviedCad: 400,
    strataDemandedTenantScreening: true,
    strataPlanNumber: 'LMS 4567',
    ownerOrTenantName: 'Burnaby Owner',
    assessmentDate: '2026-10-31'
  });

  assert.equal(rentalDispute.isBylawEnforceable, false);
  assert.equal(rentalDispute.unlawfulFineRefundCad, 400);
  assert.ok(rentalDispute.violations.some(v => v.includes('Bill 44')));
  assert.ok(rentalDispute.violations.some(v => v.includes('tenant screening')));
  assert.ok(rentalDispute.actionPlan.some(p => p.includes('Civil Resolution Tribunal')));

  // Unlawful age restriction (19+ void)
  const ageDispute = evaluateBcStrataBylawDefense({
    disputeType: 'age_restriction',
    strataAgeMinimum: 19,
    ownerOrTenantName: 'Young Family'
  });

  assert.equal(ageDispute.isBylawEnforceable, false);
  assert.ok(ageDispute.violations.some(v => v.includes('Bill 44 repealed all age-restriction bylaws other than 55+')));
});

// -----------------------------------------------------------------------------
// Test 8 (Rec 538): Bilingual View Helper
// -----------------------------------------------------------------------------
test('Rec 538: generateBilingualView creates side-by-side synchronized vernacular output', () => {
  const result = generateBilingualView({
    text: 'The landlord must not demand a security deposit exceeding one month rent and shall provide written notice within 10 days.',
    targetLocale: 'hi',
    sourceId: 'rta_sec_46',
    citationTitle: 'Alberta Residential Tenancies Act s. 46',
    assessmentDate: '2026-10-31'
  });

  assert.equal(result.sourceId, 'rta_sec_46');
  assert.equal(result.citationTitle, 'Alberta Residential Tenancies Act s. 46');
  assert.equal(result.targetLocale, 'hi');
  assert.equal(result.assessmentDate, '2026-10-31');
  assert.equal(result.bilingualLayout.rightColumn.content, 'The landlord must not demand a security deposit exceeding one month rent and shall provide written notice within 10 days.');
  assert.ok(result.bilingualLayout.leftColumn.content.includes('मकान मालिक'));
  assert.ok(result.bilingualLayout.leftColumn.content.includes('नहीं होना चाहिए (अनिवार्य निषेध)'));
  assert.ok(result.statutoryDisclaimer.length > 0);
});

// -----------------------------------------------------------------------------
// Test 9 (Rec 539): Border Flagpoling Feasibility Navigator
// -----------------------------------------------------------------------------
test('Rec 539: evaluateFlagpolingFeasibility audits PGWP ban, maintained status, and CBP I-160A', () => {
  // PGWP ban check
  const pgwpResult = evaluateFlagpolingFeasibility({
    permitCategory: 'pgwp',
    countryOfCitizenship: 'IN',
    currentStatusInCanada: 'maintained_status',
    portOfEntry: 'rainbow_bridge',
    dayOfWeek: 'Wednesday',
    applicantName: 'Recent Graduate',
    assessmentDate: '2026-10-31'
  });

  assert.equal(pgwpResult.determination, 'STRICTLY_BARRED');
  assert.equal(pgwpResult.pgwpBorderBanApplied, true);
  assert.equal(pgwpResult.maintainedStatusAtRisk, true);
  assert.ok(pgwpResult.legalBarriers.some(b => b.rule.includes('June 21, 2024')));
  assert.ok(pgwpResult.warnings.some(w => w.statute.includes('IRPR s. 183(5)')));
  assert.equal(pgwpResult.usAdministrativeRefusalImpact.formName, 'CBP Form I-160A (Notice of Refusal of Admission / Administrative Refusal)');
  assert.ok(pgwpResult.usAdministrativeRefusalImpact.misrepresentationConsequence.includes('IRPA s. 40'));
});

// -----------------------------------------------------------------------------
// Test 10 (Rec 540): BOWP & Maintained Status Navigator
// -----------------------------------------------------------------------------
test('Rec 540: evaluateBowpPathway audits AOR requirement, restricted PNP Code T13, and travel risks', () => {
  // PNP restricted trap
  const pnpRestrictedResult = evaluateBowpPathway({
    applicantName: 'Skilled Tech Worker',
    currentPermitType: 'pgwp',
    permitExpiryDate: '2027-06-15',
    isPhysicallyInCanada: true,
    prProgramApplied: 'express_entry_pnp',
    hasOfficialAor: true,
    pnpNominationHasEmployerRestrictions: true, // Forces employer-specific Code T13
    pnpProvince: 'BC',
    hasSpouse: true,
    principalTeerLevel: 'teer_1',
    principalHasPayStubs: true
  }, new Date('2026-11-01T00:00:00Z'));

  assert.equal(pnpRestrictedResult.resolutionVerdict, 'RESTRICTED_PNP_REQUIRES_CODE_T13');
  assert.equal(pnpRestrictedResult.isEligibleForBowp, false);
  assert.equal(pnpRestrictedResult.exemptionCode, 'T13');
  assert.ok(pnpRestrictedResult.statutoryBlockers.some(b => b.code === 'PNP_EMPLOYER_RESTRICTION_BANS_BOWP'));
  assert.equal(pnpRestrictedResult.totalFeeCad, BOWP_CONSTANTS.FEES_CAD.TOTAL_BOWP_FEE);
  assert.equal(pnpRestrictedResult.maintainedStatus.hasMaintainedStatusRight, true);
  assert.ok(pnpRestrictedResult.maintainedStatus.travelAdvisory.includes('CRITICAL WARNING'));
  assert.equal(pnpRestrictedResult.spousalOpenWorkPermit.eligible, true);
  assert.equal(pnpRestrictedResult.spousalOpenWorkPermit.exemptionCode, 'C41');
});

// -----------------------------------------------------------------------------
// Test 11 (Rec 541): BC Child & Youth Employment Navigator
// -----------------------------------------------------------------------------
test('Rec 541: evaluateBcChildYouthEmployment audits light work, parental consent, and school hours', () => {
  const result = evaluateBcChildYouthEmployment({
    childName: 'Alex Smith',
    employerName: 'Local Market',
    assessmentDate: '2026-10-31',
    childAge: 13,
    proposedOccupationActivity: 'RETAIL_CASHIER_OR_STOCKING',
    hasParentalConsentInWriting: false, // Violation under s. 9(2)(a)
    dailyHoursOnSchoolDay: 5, // Violation: max is 4 under Reg s. 45.3(1)(a)
    dailyHoursOnNonSchoolDay: 6,
    weeklyHoursDuringSchoolWeek: 22, // Violation: max is 20 under Reg s. 45.3(1)(c)
    hasAdultSupervisionOnSite: true
  });

  assert.equal(result.childName, 'Alex Smith');
  assert.equal(result.isCompliant, false);
  assert.equal(result.legalVerdict, 'UNLAWFUL_CHILD_OR_YOUTH_EMPLOYMENT');
  assert.ok(result.statutoryViolations.some(v => v.violation === 'MISSING_PARENTAL_CONSENT'));
  assert.ok(result.statutoryViolations.some(v => v.violation === 'EXCEEDED_SCHOOL_DAY_MAX_HOURS'));
  assert.ok(result.statutoryViolations.some(v => v.violation === 'EXCEEDED_SCHOOL_WEEK_MAX_HOURS'));
  assert.equal(result.hoursAudit.maxSchoolDayHoursPermitted, 4);
  assert.equal(result.hoursAudit.maxSchoolWeekHoursPermitted, 20);
});

// -----------------------------------------------------------------------------
// Test 12 (Rec 542): BC Illness or Injury Leave Navigator
// -----------------------------------------------------------------------------
test('Rec 542: evaluateBcIllnessInjuryLeave audits 90-day qualification, 5-day paid leave, and average day pay', () => {
  const result = evaluateBcIllnessInjuryLeave({
    employeeName: 'Jordan Lee',
    employerName: 'Pacific Logistics',
    assessmentDate: '2026-10-31',
    consecutiveDaysEmployed: 150, // Meets 90-day threshold
    paidSickDaysTakenThisYear: 2,
    paidSickDaysRequested: 2,
    wagesEarnedInPast30DaysCad: 4000,
    daysWorkedInPast30Days: 20,
    employerRefusedPaidSickDays: true, // Wage violation under s. 49.1(2)
    employerDisciplinedOrDismissedForLeave: true // Anti-reprisal violation under s. 83
  });

  assert.equal(result.employeeName, 'Jordan Lee');
  assert.equal(result.meets90DayThreshold, true);
  assert.equal(result.leaveSummary.statutoryPaidDaysApproved, 2);
  assert.equal(result.leaveSummary.averageDailyWageCad, 200); // 4000 / 20
  assert.equal(result.leaveSummary.totalPaidSickPayOwedCad, 400); // 200 * 2
  assert.equal(result.complianceStatus, 'EMPLOYER_STATUTORY_VIOLATION_DETECTED');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNLAWFUL_WITHHOLDING_OF_PAID_SICK_LEAVE'));
  assert.ok(result.statutoryViolations.some(v => v.rule === 'STATUTORY_REPRISAL_SICK_LEAVE'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_REPRISAL_COMPLAINT_REINSTATEMENT_LOST_WAGES'));
});

// -----------------------------------------------------------------------------
// Test 13 (Rec 543): BC Overtime & Time Banking Navigator
// -----------------------------------------------------------------------------
test('Rec 543: evaluateBcOvertimeBanking audits daily/weekly multipliers, written banking request, and payout', () => {
  const result = evaluateBcOvertimeBanking({
    employeeName: 'Taylor Morgan',
    employerName: 'West Coast Mfg',
    assessmentDate: '2026-10-31',
    regularHourlyWageCad: 30,
    dailyHoursWorkedOver8: 4, // 4 hours at 1.5x
    dailyHoursWorkedOver12: 2, // 2 hours at 2.0x
    weeklyHoursWorkedOver40: 0,
    employeeRequestedTimeBankInWriting: false,
    wantsPaidTimeOffInsteadOfPay: true, // Violation: forced banking without written consent
    bankedHoursAlreadyAccumulated: 8,
    employmentTerminated: true, // Triggers immediate mandatory payout under s. 42(4)
    overtimePaidActuallyCad: 0
  });

  assert.equal(result.regularHourlyWageCad, 30);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNAUTHORIZED_MANDATORY_TIME_BANKING'));
  assert.equal(result.overtimeCalculation.newOvertimeEarnedCad, 300); // (4 * 30 * 1.5) + (2 * 30 * 2.0) = 180 + 120 = 300
  assert.equal(result.overtimeCalculation.totalBankedHours, 18); // 8 existing + (4 * 1.5 + 2 * 2.0) = 8 + 10 = 18
  assert.equal(result.overtimeCalculation.totalBankedValueCad, 540); // 18 * 30
  assert.equal(result.overtimeCalculation.totalCashOwedImmediatelyCad, 540);
  assert.equal(result.overtimeCalculation.unpaidOvertimeDeficitCad, 540);
  assert.ok(result.actionableRemedies.some(r => r.action === 'PAY_OUT_ALL_BANKED_OVERTIME_UPON_TERMINATION'));
});

// -----------------------------------------------------------------------------
// Test 14 (Rec 544): BC Group Termination & Severance Navigator
// -----------------------------------------------------------------------------
test('Rec 544: evaluateBcGroupTerminationNotice audits Section 64/63 stacking and Minister notice', () => {
  const result = evaluateBcGroupTerminationNotice({
    employeeName: 'Senior Specialist',
    employerName: 'Tech Enterprise Ltd',
    assessmentDate: '2026-10-31',
    affectedEmployeesCount: 150, // Triggers 12 weeks group notice under s. 64
    twoMonthWindow: true,
    singleLocation: true,
    groupNoticeWeeksGiven: 4, // 8-week shortfall
    individualTenureMonths: 48, // 4 years tenure -> 4 weeks individual notice under s. 63
    regularWeeklyWageCad: 1500,
    ministerNotified: false // Violation under s. 64(2)(a)
  });

  assert.equal(result.isSection64GroupTermination, true);
  assert.equal(result.complianceStatus, 'STATUTORY_DEFICIENCY_DETECTED');
  assert.equal(result.groupTerminationDetails.requiredNoticeWeeks, 12);
  assert.equal(result.groupTerminationDetails.shortfallWeeks, 8);
  assert.equal(result.groupTerminationDetails.statutoryGroupPayInLieuCad, 12000); // 8 * 1500
  assert.equal(result.individualNoticeDetails.statutorySection63Weeks, 4);
  assert.equal(result.individualNoticeDetails.statutoryIndividualPayInLieuCad, 6000); // 4 * 1500
  // Section 64(4) Stacking: Group shortfall (8) + Individual (4) = 12 weeks
  assert.equal(result.totalLiabilityAssessment.stackedNoticeWeeks, 12);
  assert.equal(result.totalLiabilityAssessment.totalStatutoryPayInLieuCad, 18000); // 12000 + 6000
  assert.ok(result.statutoryViolations.some(v => v.violation === 'FAILURE_TO_NOTIFY_MINISTER'));
  assert.ok(result.riskWarnings.some(w => w.warning === 'COMMON_LAW_REASONABLE_NOTICE_EXPOSURE'));
});

// -----------------------------------------------------------------------------
// Test 15 (Rec 545): BC Uniform & Equipment Deduction Navigator
// -----------------------------------------------------------------------------
test('Rec 545: auditBcEmploymentUniformAndDeductions audits s. 25 uniform rule and s. 21 loss shifting ban', () => {
  const result = auditBcEmploymentUniformAndDeductions({
    employeeName: 'Restaurant Server',
    employerName: 'Gastown Bistro',
    assessmentDate: '2026-10-31',
    requiresSpecialClothingOrUniform: true,
    employerProvidedUniformFreeOfCharge: false,
    uniformCostOrDepositChargedCad: 120, // Illegal charge under s. 25(1)
    employerCleansUniformOrPaysAllowance: false, // Violation under s. 25(2)
    deductedForTillShortage: true,
    tillShortageDeductionCad: 45, // Illegal deduction under s. 21(2)(a)
    deductedForCustomerDineAndDash: true,
    dineAndDashDeductionCad: 85, // Illegal deduction under s. 21(2)(b)
    deductedForEquipmentBreakage: true,
    equipmentBreakageDeductionCad: 30 // Illegal deduction under s. 21(2)(c)
  });

  assert.equal(result.employeeName, 'Restaurant Server');
  assert.equal(result.totalUnlawfulDeductionsCad, 280); // 120 + 45 + 85 + 30
  assert.equal(result.complianceStatus, 'UNLAWFUL_WAGE_DEDUCTIONS_OR_UNIFORM_BREACH');
  assert.equal(result.deductionBreakdown.uniformCostOrDepositCad, 120);
  assert.equal(result.deductionBreakdown.tillShortageCad, 45);
  assert.equal(result.deductionBreakdown.dineAndDashCad, 85);
  assert.equal(result.deductionBreakdown.equipmentBreakageCad, 30);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'ILLEGAL_UNIFORM_CHARGE_OR_DEPOSIT'));
  assert.ok(result.statutoryViolations.some(v => v.rule === 'PROHIBITED_CASH_SHORTAGE_DEDUCTION'));
  assert.ok(result.statutoryViolations.some(v => v.rule === 'PROHIBITED_DINE_AND_DASH_DEDUCTION'));
  assert.ok(result.statutoryViolations.some(v => v.rule === 'PROHIBITED_BREAKAGE_PROPERTY_DAMAGE_DEDUCTION'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'RECOVER_DINE_AND_DASH_DEDUCTIONS'));
});
