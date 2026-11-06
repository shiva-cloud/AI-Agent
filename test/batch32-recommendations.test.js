import test from 'node:test';
import assert from 'node:assert/strict';

// Rec 546
import {
  evaluateBcTechPilotEligibility,
  BC_PNP_TECH_CONSTANTS,
  BC_TECH_QUALIFYING_NOCS
} from '../src/british-columbia-pnp-skills-immigration-tech-navigator.js';

// Rec 547
import {
  evaluateBcRtbDisputeTrack
} from '../src/british-columbia-residential-tenancy-dispute-resolution-urgency-navigator.js';

// Rec 548
import {
  evaluateBcLandlordUseEviction
} from '../src/british-columbia-residential-tenancy-landlord-use-eviction-navigator.js';

// Rec 549
import {
  evaluateBcSecurityDepositDoublePenalty
} from '../src/british-columbia-residential-tenancy-security-deposit-double-penalty-navigator.js';

// Rec 550
import {
  auditBcSvtNoticeOfObjection
} from '../src/british-columbia-speculation-tax-audit-appeal-navigator.js';

// Rec 551
import {
  evaluateBcStrataDepreciationReport
} from '../src/british-columbia-strata-depreciation-report-reserve-fund-navigator.js';

// Rec 552
import {
  evaluateBcStrataEvCharging
} from '../src/british-columbia-strata-ev-charging-navigator.js';

// Rec 553
import {
  auditBcStrataShortTermRental
} from '../src/british-columbia-strata-short-term-rental-bylaw-navigator.js';

// Rec 554
import {
  evaluateBcRoommateAndSharedKitchen
} from '../src/british-columbia-tenancy-roommate-shared-kitchen-navigator.js';

// Rec 555
import {
  evaluateBusinessStructure
} from '../src/business-navigator.js';

// Rec 556
import {
  calculatorNumber
} from '../src/calculator-input.js';

// Rec 557
import {
  auditCalgarySecondarySuite
} from '../src/calgary-secondary-suite-amnesty-navigator.js';

// Rec 558
import {
  evaluateRestorationOfStatus,
  auditFlagpolingEligibility,
  auditDliAuthorizedLeave,
  evaluateCriminalInadmissibility
} from '../src/canada-status-admissibility-guard.js';

// Rec 559
import {
  excerptDifference,
  assessChange
} from '../src/changes.js';

// Rec 560
import {
  evaluateChildDisabilityBenefit,
  DISABILITY_BENEFIT_CONSTANTS
} from '../src/child-disability-benefit-navigator.js';

// --- Test Suite ---

test('Rec 546: evaluateBcTechPilotEligibility audits BC PNP Tech 35 NOCs, 1-yr offer, and SIRS points', () => {
  // Safe handling of null/empty
  const fallback = evaluateBcTechPilotEligibility(null);
  assert.equal(fallback.isEligible, true);
  assert.equal(fallback.stream, 'BC_PNP_SKILLS_IMMIGRATION_TECH');
  assert.equal(BC_TECH_QUALIFYING_NOCS.length, BC_PNP_TECH_CONSTANTS.DESIGNATED_TECH_NOC_COUNT);

  // Eligible tech software developer in Metro Vancouver
  const eligible = evaluateBcTechPilotEligibility({
    nocCode: '21232',
    jobOfferDurationDays: 365,
    isJobOfferFullTime: true,
    hourlyWageCad: 52.00,
    regionalMedianHourlyWageCad: 42.00,
    jobLocationRegion: 'METRO_VANCOUVER',
    employerFullTimeEmployeesCount: 6,
    candidateName: 'Aarav Patel',
    employerName: 'VanTech Inc'
  });
  assert.equal(eligible.isEligible, true);
  assert.equal(eligible.eligibilityVerdict, 'ELIGIBLE_FOR_BC_PNP_TECH_DRAW');
  assert.equal(eligible.statutoryViolations.length, 0);
  assert.ok(eligible.criteriaSummary.estimatedSirsScore > 50);

  // Ineligible: Non-tech NOC and sub-median wage and insufficient employer staff
  const ineligible = evaluateBcTechPilotEligibility({
    nocCode: '65100', // Non-tech
    jobOfferDurationDays: 180,
    isJobOfferFullTime: false,
    hourlyWageCad: 20.00,
    regionalMedianHourlyWageCad: 28.00,
    jobLocationRegion: 'METRO_VANCOUVER',
    employerFullTimeEmployeesCount: 2
  });
  assert.equal(ineligible.isEligible, false);
  assert.equal(ineligible.isNocInTechList, false);
  assert.ok(ineligible.statutoryViolations.some(v => v.rule === 'NON_DESIGNATED_TECH_NOC'));
  assert.ok(ineligible.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_JOB_OFFER_DURATION_OR_HOURS'));
  assert.ok(ineligible.statutoryViolations.some(v => v.rule === 'WAGE_BELOW_REGIONAL_MEDIAN'));
  assert.ok(ineligible.statutoryViolations.some(v => v.rule === 'EMPLOYER_STAFFING_BELOW_MINIMUM'));
});

test('Rec 547: evaluateBcRtbDisputeTrack audits BC RTB expedited hearing track vs standard queue', () => {
  // Null options fallback
  const fallback = evaluateBcRtbDisputeTrack(null);
  assert.equal(fallback.jurisdiction, 'BRITISH_COLUMBIA_CANADA');
  assert.equal(fallback.qualifiesForExpeditedTrack, true); // Lockout is default

  // Tenant unlawful lockout qualifies for expedited track (14 days, 1-day service)
  const lockout = evaluateBcRtbDisputeTrack({
    disputeCategory: 'TENANT_UNLAWFUL_LOCKOUT_ORDER_OF_POSSESSION',
    locksChangedWithoutOrder: true,
    readyToServeEvidenceWithinOneDay: true
  });
  assert.equal(lockout.qualifiesForExpeditedTrack, true);
  assert.equal(lockout.hearingTrack, 'EXPEDITED_HEARING_TRACK');
  assert.equal(lockout.estimatedWaitDays, 14);
  assert.equal(lockout.proceduralRoadmap.evidenceServiceDeadlineDays, 1);
  assert.ok(lockout.actionableRemedies.some(r => r.action === 'FILE_EXPEDITED_FORM_RTB_51_LOCKOUT'));

  // Pure monetary claims ineligible for expedited track
  const monetary = evaluateBcRtbDisputeTrack({
    disputeCategory: 'TENANT_UNLAWFUL_LOCKOUT_ORDER_OF_POSSESSION',
    isMonetaryClaimOnly: true
  });
  assert.equal(monetary.qualifiesForExpeditedTrack, false);
  assert.equal(monetary.hearingTrack, 'STANDARD_DISPUTE_TRACK');
  assert.ok(monetary.riskWarnings.some(w => w.warningType === 'MONETARY_CLAIMS_INELIGIBLE_FOR_EXPEDITED_TRACK'));
});

test('Rec 548: evaluateBcLandlordUseEviction audits Bill 14 4-month notice and 12-month bad-faith penalty', () => {
  // Compliant 4-month personal use notice
  const compliant = evaluateBcLandlordUseEviction({
    monthlyRentCad: 2500,
    noticeMonthsGiven: 4,
    daysElapsedSinceNoticeServed: 12,
    generatedThroughOfficialWebPortal: true,
    intendedOccupantRelationship: 'CHILD_OR_PARENT',
    oneMonthFreeRentProvided: true,
    landlordFailedToOccupyFor12Months: false
  });
  assert.equal(compliant.complianceStatus, 'COMPLIANT_NOTICE_AND_COMPENSATION');
  assert.equal(compliant.isWithin30DayDisputeWindow, true);
  assert.equal(compliant.daysRemainingToDispute, 18);
  assert.equal(compliant.isBadFaithPenaltyPayable, false);

  // Defective: 2 months notice (pre-Bill 14 obsolete length), not generated via portal, sibling occupant
  const defective = evaluateBcLandlordUseEviction({
    monthlyRentCad: 2000,
    noticeMonthsGiven: 2,
    daysElapsedSinceNoticeServed: 35,
    generatedThroughOfficialWebPortal: false,
    intendedOccupantRelationship: 'SIBLING_OR_OTHER',
    oneMonthFreeRentProvided: false
  });
  assert.equal(defective.complianceStatus, 'DEFECTIVE_LANDLORD_USE_NOTICE');
  assert.equal(defective.isWithin30DayDisputeWindow, false);
  assert.ok(defective.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_NOTICE_PERIOD_UNDER_4_MONTHS'));
  assert.ok(defective.statutoryViolations.some(v => v.rule === 'NOTICE_NOT_GENERATED_VIA_WEB_PORTAL'));
  assert.ok(defective.statutoryViolations.some(v => v.rule === 'INELIGIBLE_OCCUPANT_NOT_CLOSE_FAMILY_MEMBER'));
  assert.ok(defective.statutoryViolations.some(v => v.rule === 'FAILURE_TO_PROVIDE_SECTION_51_COMPENSATION'));

  // Bad faith: landlord re-rented unit after 3 months -> 12 months rent penalty
  const badFaith = evaluateBcLandlordUseEviction({
    monthlyRentCad: 2400,
    landlordFailedToOccupyFor12Months: true,
    extenuatingCircumstancesExist: false
  });
  assert.equal(badFaith.isBadFaithPenaltyPayable, true);
  assert.equal(badFaith.complianceStatus, 'BAD_FAITH_EVICTION_12_MONTH_PENALTY_OWED');
  assert.equal(badFaith.compensationSummary.badFaith12MonthPenaltyCad, 2400 * 12);
  assert.ok(badFaith.actionableRemedies.some(r => r.action === 'FILE_RTB_CLAIM_12_MONTHS_RENT_PENALTY'));
});

test('Rec 549: evaluateBcSecurityDepositDoublePenalty audits BC RTA s. 38 15-day return and double penalty', () => {
  // Compliant return within 15 days
  const compliant = evaluateBcSecurityDepositDoublePenalty({
    securityDepositPaidCad: 1200,
    petDepositPaidCad: 600,
    tenancyHasEnded: true,
    forwardingAddressProvidedInWriting: true,
    daysSinceForwardingAddressReceived: 10,
    landlordRefundedAmountCad: 1800
  });
  assert.equal(compliant.isDoublePenaltyMandatory, false);
  assert.equal(compliant.complianceStatus, 'COMPLIANT_DEPOSIT_RETURN');

  // Trigger double penalty: 25 days elapsed, landlord failed to return or file RTB claim
  const penalized = evaluateBcSecurityDepositDoublePenalty({
    securityDepositPaidCad: 1000,
    petDepositPaidCad: 500,
    tenancyHasEnded: true,
    forwardingAddressProvidedInWriting: true,
    daysSinceForwardingAddressReceived: 25,
    landlordRefundedAmountCad: 0,
    landlordFiledRtbClaimWithin15Days: false
  });
  assert.equal(penalized.isDoublePenaltyMandatory, true);
  assert.equal(penalized.complianceStatus, 'MANDATORY_STATUTORY_DOUBLE_PENALTY_TRIGGERED');
  // 2x ($1000 + $500) = $3000
  assert.equal(penalized.financialSummary.grossPenaltyOwedCad, 3000);
  assert.equal(penalized.financialSummary.netMonetaryAwardOwedCad, 3000);
  assert.ok(penalized.statutoryViolations.some(v => v.rule === 'EXCEEDED_15_DAY_RETURN_WINDOW_MANDATORY_DOUBLE_PENALTY'));

  // Missing forwarding address
  const noAddress = evaluateBcSecurityDepositDoublePenalty({
    forwardingAddressProvidedInWriting: false
  });
  assert.equal(noAddress.complianceStatus, 'PENDING_WRITTEN_FORWARDING_ADDRESS');
  assert.equal(noAddress.isDoublePenaltyMandatory, false);
});

test('Rec 550: auditBcSvtNoticeOfObjection tracks BC SVT 90-day limitation and evidence requirements', () => {
  // Timely arm-length tenancy objection
  const timely = auditBcSvtNoticeOfObjection({
    assessmentNoticeDate: '2026-10-01',
    currentDate: '2026-10-25',
    assessedAmountCad: 18000,
    objectionGround: 'arm_length_tenancy_occupied',
    hasTenancyAgreementOrProof: true,
    isStayOfCollectionRequested: true
  });
  assert.equal(timely.isWithin90Days, true);
  assert.equal(timely.objectionStatus, 'TIMELY');
  assert.equal(timely.daysElapsed, 24);
  assert.equal(timely.daysRemaining, 66);
  assert.equal(timely.deficiencies.length, 0);

  // Time-barred: 100 days elapsed (> 90 days statutory bar under s. 94)
  const barred = auditBcSvtNoticeOfObjection({
    assessmentNoticeDate: '2026-06-01',
    currentDate: '2026-10-10',
    assessedAmountCad: 30000,
    objectionGround: 'arm_length_tenancy_occupied',
    hasTenancyAgreementOrProof: false
  });
  assert.equal(barred.isWithin90Days, false);
  assert.equal(barred.objectionStatus, 'BARRED_BY_LIMITATION');
  assert.ok(barred.deficiencies.some(d => d.severity === 'FATAL_BAR'));
  assert.equal(barred.estimatedLatePenaltyCad, 3000); // 10%
});

test('Rec 551: evaluateBcStrataDepreciationReport audits 5-year cycle, 2024 waiver ban, and 10% CRF minimum', () => {
  // Compliant strata (12 units, report done 2 years ago by CRP, 10% CRF contribution)
  const compliant = evaluateBcStrataDepreciationReport({
    strataLotsCount: 12,
    yearsSinceLastDepreciationReport: 2,
    reportAuthorCredential: 'CERTIFIED_RESERVE_PLANNER_CRP',
    annualOperatingBudgetCad: 80000,
    annualCrfContributionCad: 8000,
    strataAttemptedAnnualWaiverVote: false
  });
  assert.equal(compliant.complianceStatus, 'COMPLIANT_STRATA_CRF_AND_REPORT');
  assert.equal(compliant.statutoryViolations.length, 0);
  assert.equal(compliant.crfContributionAudit.crfContributionDeficitCad, 0);

  // Overdue report (7 years ago), illegal 3/4 waiver attempt, substandard CRF contribution ($4k vs $10k min)
  const nonCompliant = evaluateBcStrataDepreciationReport({
    strataLotsCount: 30,
    yearsSinceLastDepreciationReport: 7,
    reportAuthorCredential: 'UNACCREDITED_GENERAL_CONTRACTOR',
    annualOperatingBudgetCad: 100000,
    annualCrfContributionCad: 4000,
    strataAttemptedAnnualWaiverVote: true
  });
  assert.equal(nonCompliant.complianceStatus, 'STATUTORY_STRATA_GOVERNANCE_BREACH');
  assert.ok(nonCompliant.statutoryViolations.some(v => v.rule === 'OVERDUE_DEPRECIATION_REPORT'));
  assert.ok(nonCompliant.statutoryViolations.some(v => v.rule === 'ILLEGAL_DEPRECIATION_REPORT_WAIVER_ATTEMPT'));
  assert.ok(nonCompliant.statutoryViolations.some(v => v.rule === 'UNQUALIFIED_DEPRECIATION_REPORT_AUTHOR'));
  assert.ok(nonCompliant.statutoryViolations.some(v => v.rule === 'SUBSTANDARD_ANNUAL_CRF_CONTRIBUTION'));
  assert.equal(nonCompliant.crfContributionAudit.crfContributionDeficitCad, 6000);
});

test('Rec 552: evaluateBcStrataEvCharging audits SPA ss. 90.1–90.3 3-month timeline and refusal grounds', () => {
  // Approved request within timeline
  const approved = evaluateBcStrataEvCharging({
    requestDate: '2026-09-01',
    currentDate: '2026-10-15',
    hasStrataCouncilResponded: true,
    councilDecision: 'approved',
    hasOwnerAgreedToPayAllCostsAndInsurance: true
  });
  assert.equal(approved.legalVerdict, 'APPROVED_READY_FOR_ALTERATION_AGREEMENT');
  assert.equal(approved.isUnreasonableRefusal, false);

  // Unreasonable refusal (aesthetic dislike) -> CRT actionable
  const refused = evaluateBcStrataEvCharging({
    requestDate: '2026-09-01',
    currentDate: '2026-10-01',
    hasStrataCouncilResponded: true,
    councilDecision: 'refused',
    refusalReasonCategory: 'aesthetic_dislike'
  });
  assert.equal(refused.legalVerdict, 'UNREASONABLE_REFUSAL_CRT_ACTIONABLE');
  assert.equal(refused.isUnreasonableRefusal, true);
  assert.ok(refused.statutoryRemedies.some(r => r.action.includes('CRT Dispute')));

  // Deemed breach: > 92 days without response
  const overdue = evaluateBcStrataEvCharging({
    requestDate: '2026-05-01',
    currentDate: '2026-10-01',
    hasStrataCouncilResponded: false
  });
  assert.equal(overdue.isPastThreeMonthDeadline, true);
  assert.equal(overdue.legalVerdict, 'STATUTORY_DEADLINE_BREACHED_CRT_ACTIONABLE');
});

test('Rec 553: auditBcStrataShortTermRental audits STRAA principal residence rules and $1,000/day strata fines', () => {
  // Compliant STR: Owner principal residence, no strata bylaw ban
  const compliant = auditBcStrataShortTermRental({
    hasRegisteredStrBylawProhibition: false,
    isPrincipalResidence: true,
    rentalStayDays: 4,
    communityPopulation: 35000,
    totalDaysFined: 0
  });
  assert.equal(compliant.complianceStatus, 'COMPLIANT_NO_STRATA_OR_PROVINCIAL_BREACH');
  assert.equal(compliant.statutoryViolations.length, 0);

  // Unlawful non-principal residence STR in Vancouver (pop > 10,000) with valid strata bylaw
  const unlawful = auditBcStrataShortTermRental({
    hasRegisteredStrBylawProhibition: true,
    isPrincipalResidence: false,
    rentalStayDays: 6,
    communityPopulation: 600000,
    fineAmountPerDayCad: 1000,
    totalDaysFined: 4,
    receivedWrittenNoticeOfComplaint: true,
    providedOpportunityToBeHeard: true
  });
  assert.equal(unlawful.complianceStatus, 'UNLAWFUL_SHORT_TERM_RENTAL_ACTIVE');
  assert.equal(unlawful.areFinesLegallyEnforceable, true);
  assert.equal(unlawful.totalAssessedFinesCad, 4000);
  assert.ok(unlawful.statutoryViolations.some(v => v.rule === 'PROVINCIAL_STRAA_PRINCIPAL_RESIDENCE_BREACH'));
  assert.ok(unlawful.statutoryViolations.some(v => v.rule === 'STRATA_STR_BYLAW_CONTRAVENTION'));

  // Defective fine: Excessive fine ($1500/day > $1000 cap) and failure to give written notice
  const defectiveFine = auditBcStrataShortTermRental({
    fineAmountPerDayCad: 1500,
    receivedWrittenNoticeOfComplaint: false,
    providedOpportunityToBeHeard: false
  });
  assert.equal(defectiveFine.complianceStatus, 'STRATA_FINES_DEFECTIVE_PROCEDURAL_BREACH');
  assert.equal(defectiveFine.areFinesLegallyEnforceable, false);
  assert.ok(defectiveFine.fineAudit.fineDefects.some(d => d.defectType === 'EXCESSIVE_FINE_ABOVE_STATUTORY_CEILING'));
  assert.ok(defectiveFine.fineAudit.fineDefects.some(d => d.defectType === 'NO_WRITTEN_NOTICE_OF_COMPLAINT'));
});

test('Rec 554: evaluateBcRoommateAndSharedKitchen audits RTA s. 4(c) owner exclusion and co-tenant vs occupant status', () => {
  // Shared kitchen with registered owner -> Complete statutory exemption from BC RTA under s. 4(c)
  const exempt = evaluateBcRoommateAndSharedKitchen({
    sharesKitchenOrBathroomWithOwner: true,
    tenantName: 'Subtenant Maya',
    roommateName: 'Owner David'
  });
  assert.equal(exempt.isRtaCovered, false);
  assert.equal(exempt.statutoryExemption, 'BC_RTA_SECTION_4_C_SHARED_FACILITY');
  assert.equal(exempt.legalStatusVerdict, 'EXEMPT_FROM_BC_RTA_UNDER_SECTION_4_C');
  assert.ok(exempt.jurisdiction.includes('CRT'));

  // Covered tenant: Landlord attempting to charge illegal guest surcharge under s. 19/28
  const guestSurcharge = evaluateBcRoommateAndSharedKitchen({
    sharesKitchenOrBathroomWithOwner: false,
    disputeType: 'LANDLORD_RESTRICTING_GUEST',
    landlordChargesGuestOrOccupantFee: true,
    monthlyGuestFeeCad: 200,
    tenancyAgreementLimitsOccupants: false
  });
  assert.equal(guestSurcharge.isRtaCovered, true);
  assert.equal(guestSurcharge.legalVerdict, 'TENANT_PROTECTED_UNDER_SECTION_28');
  assert.ok(guestSurcharge.statutoryFindings.some(f => f.finding === 'UNLAWFUL_GUEST_FEE_SURCHARGE'));

  // Roommate dispute where occupant is not on lease -> Occupant status, CRT forum
  const roommateDispute = evaluateBcRoommateAndSharedKitchen({
    sharesKitchenOrBathroomWithOwner: false,
    isNamedOnTenancyAgreement: false,
    disputeType: 'TENANT_ROOMMATE_DISPUTE',
    daysNoticeGivenToRoommate: 14
  });
  assert.equal(roommateDispute.statusAssessment.isCoTenant, false);
  assert.equal(roommateDispute.statusAssessment.rtbJurisdictionApplies, false);
  assert.ok(roommateDispute.disputeForum.includes('Civil Resolution Tribunal'));
  assert.ok(roommateDispute.riskWarnings.some(w => w.warning === 'COMMON_LAW_SHORT_NOTICE_RISK'));
});

test('Rec 555: evaluateBusinessStructure audits closed permit work bans, $30k GST/HST rule, and PSB trap', () => {
  // Closed work permit holder attempting to run business -> IRPR ss. 196/200 violation
  const closedPermit = evaluateBusinessStructure({
    immigrationStatus: 'work_permit_holder',
    workPermitType: 'closed_employer_specific',
    projectedAnnualRevenueCad: 80000
  });
  assert.equal(closedPermit.immigrationCompliance.isLegallyAuthorizedToOperate, false);
  assert.equal(closedPermit.immigrationCompliance.severity, 'STATUTORILY_PROHIBITED');
  assert.ok(closedPermit.statutoryViolations.some(v => v.rule.includes('Closed Work Permit')));

  // High revenue tech consultant with PSB trap (1 client, no subs, no own equipment)
  const psbTrap = evaluateBusinessStructure({
    immigrationStatus: 'permanent_resident',
    province: 'ON',
    projectedAnnualRevenueCad: 150000,
    clientCount: 1,
    subcontractorHiringPermitted: false,
    providesOwnEquipmentAndTools: false,
    hasRiskOfFinancialLoss: false
  });
  assert.equal(psbTrap.gstHstAudit.isRegistrationMandatory, true);
  assert.equal(psbTrap.psbRiskAudit.psbRiskLevel, 'HIGH_RISK_PSB_TRAP');
  assert.equal(psbTrap.psbRiskAudit.effectiveCorporateTaxRate, 44.5);
  assert.ok(psbTrap.statutoryViolations.some(v => v.rule.includes('Personal Services Business')));

  // Legitimate incorporated consultant in BC
  const legitimate = evaluateBusinessStructure({
    immigrationStatus: 'canadian_citizen',
    province: 'BC',
    projectedAnnualRevenueCad: 140000,
    annualBusinessExpensesCad: 20000,
    clientCount: 4,
    subcontractorHiringPermitted: true,
    providesOwnEquipmentAndTools: true
  });
  assert.equal(legitimate.psbRiskAudit.psbRiskLevel, 'LOW');
  assert.equal(legitimate.recommendedStructure, 'INCORPORATION_RECOMMENDED');
  assert.equal(legitimate.corporateDirectorResidency.requiresCanadianResidentDirector, false);
});

test('Rec 556: calculatorNumber validates numbers, integers, minimums, maximums, and string inputs', () => {
  // Valid numeric and string inputs
  assert.equal(calculatorNumber(42, 'Score'), 42);
  assert.equal(calculatorNumber('150.50', 'Amount'), 150.5);
  assert.equal(calculatorNumber(' 1.5e2 ', 'Amount'), 150);
  for (const value of ['0x10', '0b10', '0o10']) {
    assert.throws(() => calculatorNumber(value, 'Amount'), /must be a number/);
  }
  assert.equal(calculatorNumber(0, 'ZeroVal', { min: 0 }), 0);

  // Integer constraint
  assert.equal(calculatorNumber(10, 'Count', { min: 1, integer: true }), 10);
  assert.throws(() => calculatorNumber(10.5, 'Count', { min: 1, integer: true }), /must be a finite integer/);

  // Min and Max constraints
  assert.equal(calculatorNumber(50, 'Percentage', { min: 0, max: 100 }), 50);
  assert.throws(() => calculatorNumber(150, 'Percentage', { min: 0, max: 100 }), /between 0 and 100/);
  assert.throws(() => calculatorNumber(-5, 'PositiveNumber', { min: 0 }), /of at least 0/);

  // Invalid types and blank strings
  assert.throws(() => calculatorNumber(null, 'NullVal'), /must be a number/);
  assert.throws(() => calculatorNumber(true, 'BoolVal'), /must be a number/);
  assert.throws(() => calculatorNumber('   ', 'BlankStr'), /must be a number/);
  assert.throws(() => calculatorNumber(NaN, 'NanVal'), /must be a finite/);
});

test('Rec 557: auditCalgarySecondarySuite audits Land Use Bylaws 1P2007/28P2024 and NBC-AE Part 9 safety codes', () => {
  // Fully compliant basement suite
  const compliant = auditCalgarySecondarySuite({
    suiteType: 'basement_suite',
    hasInterconnectedSmokeAlarms: true,
    hasCarbonMonoxideAlarm: true,
    bedroomWindowOpeningAreaSqM: 0.42,
    bedroomWindowMinDimensionMm: 450,
    windowWellClearanceMm: 850,
    ceilingHeightMetres: 2.10,
    hasDrywallFireSeparation: true,
    hasCompliantHvacSystem: true,
    hasDirectExteriorExit: true,
    isRegisteredOnCalgaryRegistry: true
  });
  assert.equal(compliant.isCodeCompliant, true);
  assert.equal(compliant.registryReadinessStatus, 'READY_FOR_REGISTRY_STICKER');
  assert.equal(compliant.safetyDeficiencies.length, 0);

  // Non-compliant suite with life safety hazards (no alarms, window too small, 600mm well, shared HVAC)
  const hazardous = auditCalgarySecondarySuite({
    hasInterconnectedSmokeAlarms: false,
    hasCarbonMonoxideAlarm: false,
    bedroomWindowOpeningAreaSqM: 0.25, // < 0.35 m²
    bedroomWindowMinDimensionMm: 300, // < 380 mm
    windowWellClearanceMm: 500, // < 760 mm
    ceilingHeightMetres: 1.85, // < 1.95 m
    hasDrywallFireSeparation: false,
    hasCompliantHvacSystem: false,
    hasDirectExteriorExit: false,
    isRegisteredOnCalgaryRegistry: false
  });
  assert.equal(hazardous.isCodeCompliant, false);
  assert.equal(hazardous.registryReadinessStatus, 'REMEDIATION_REQUIRED');
  assert.ok(hazardous.safetyDeficiencies.some(d => d.item === 'Interconnected Smoke Alarms'));
  assert.ok(hazardous.safetyDeficiencies.some(d => d.item === 'Bedroom Egress Window Area'));
  assert.ok(hazardous.safetyDeficiencies.some(d => d.item === 'Window Well Clearance'));
  assert.ok(hazardous.safetyDeficiencies.some(d => d.item === 'Minimum Ceiling Clearance'));
  assert.ok(hazardous.safetyDeficiencies.some(d => d.item === 'Dedicated or Dampered HVAC System'));
});

test('Rec 558: canada-status-admissibility-guard audits restoration, flagpoling ban, DLI leave, and criminal rehab', () => {
  // 1. Restoration under IRPR s. 182
  const restorationOk = evaluateRestorationOfStatus({
    statusExpiredDate: '2026-03-01',
    assessmentDate: '2026-04-10', // 40 days
    remainedInCanada: true
  });
  assert.equal(restorationOk.isEligibleToApply, true);
  assert.equal(restorationOk.daysSinceExpiry, 40);
  assert.equal(restorationOk.daysRemainingToApply, 50);
  assert.equal(restorationOk.statutoryWorkStudyProhibition.canWorkWhilePending, false);

  const restorationLapsed = evaluateRestorationOfStatus({
    statusExpiredDate: '2026-01-01',
    assessmentDate: '2026-05-01' // 120 days (> 90 days)
  });
  assert.equal(restorationLapsed.isEligibleToApply, false);
  assert.ok(restorationLapsed.defects[0].includes('exceeding the strict 90-day'));

  // 2. CBSA Flagpoling & PGWP Border Ban
  const pgwpFlagpole = auditFlagpolingEligibility({
    requestedPermitType: 'pgwp',
    borderPort: 'peace_bridge'
  });
  assert.equal(pgwpFlagpole.isFlagpolingPermitted, false);
  assert.ok(pgwpFlagpole.defects.some(d => d.includes('PGWP BORDER BAN')));

  // 3. DLI Authorized Leave under IRPR s. 220.1
  const dliCompliant = auditDliAuthorizedLeave({
    leaveDurationDays: 120,
    hasOfficialSchoolLeaveApproval: true,
    workedDuringLeave: false
  });
  assert.equal(dliCompliant.isCompliant, true);

  const dliBreached = auditDliAuthorizedLeave({
    leaveDurationDays: 160, // > 150 days
    workedDuringLeave: true
  });
  assert.equal(dliCompliant.isCompliant, true);
  assert.equal(dliBreached.isCompliant, false);
  assert.ok(dliBreached.violations.some(v => v.includes('150 consecutive days')));
  assert.ok(dliBreached.violations.some(v => v.includes('ILLEGAL WORK')));

  // 4. Criminal Inadmissibility under IRPA s. 36
  const deemedRehab = evaluateCriminalInadmissibility({
    offenseClassification: 'non_serious_summary',
    yearsSinceSentenceCompleted: 12,
    numberOfConvictions: 1
  });
  assert.equal(deemedRehab.deemedRehabilitationEligible, true);
  assert.equal(deemedRehab.inadmissibilityStatus, 'DEEMED REHABILITATED BY PASSAGE OF TIME');

  const seriousCrim = evaluateCriminalInadmissibility({
    offenseClassification: 'serious_criminality',
    yearsSinceSentenceCompleted: 15
  });
  assert.equal(seriousCrim.deemedRehabilitationEligible, false);
  assert.equal(seriousCrim.inadmissibilityStatus, 'SERIOUS CRIMINALITY (INADMISSIBLE)');
});

test('Rec 559: excerptDifference and assessChange handle heuristic change detection and edge cases', () => {
  // excerptDifference edge cases
  assert.equal(excerptDifference(null, 'text').available, false);
  assert.equal(excerptDifference(undefined, 'text').available, false);
  assert.equal(excerptDifference('abc', 'abc').changed, false);
  assert.equal(excerptDifference('abc', 'abxc').changed, true);

  // assessChange null/empty safety
  const safeEmpty = assessChange(null);
  assert.equal(safeEmpty.classification, 'new_record');
  assert.equal(safeEmpty.priority, 'normal');

  // assessChange token and qualifier change flags
  const changeRes = assessChange({
    previous: { title: 'Old Title', risk: 'low', summary: 'Apply in 10 days' },
    next: { title: 'New Title', risk: 'high', summary: 'Must not apply within 20 days' },
    previousContent: 'Applicants may apply in 10 days.',
    content: 'Applicants must not apply within 20 days.',
    affectedRecordIds: ['rec-1', 'rec-2', 'rec-1']
  });
  assert.equal(changeRes.classification, 'content_change');
  assert.equal(changeRes.priority, 'high');
  assert.ok(changeRes.flags.includes('numeric_tokens_changed'));
  assert.ok(changeRes.flags.includes('condition_words_changed'));
  assert.deepEqual(changeRes.potentiallyAffectedRecordIds, ['rec-1', 'rec-2']);
});

test('Rec 560: evaluateChildDisabilityBenefit audits CDB payment, DTC requirement, and RDSP grant matching', () => {
  // Eligible child with approved DTC and low family income
  const eligible = evaluateChildDisabilityBenefit({
    childAgeYears: 7,
    hasApprovedDtcT2201: true,
    familyNetIncomeCad: 45000,
    annualRdspContributionCad: 1500,
    unclaimedPastYears: 2
  });
  assert.equal(eligible.dtcStatus.isDtcPrerequisiteSatisfied, true);
  assert.equal(eligible.childDisabilityBenefit.isEligible, true);
  assert.equal(eligible.childDisabilityBenefit.annualBenefitCad, DISABILITY_BENEFIT_CONSTANTS.ANNUAL_CDB_MAX_AMOUNT_CAD);
  // Tier 1 CDSG grant: $500 * 3 + $1000 * 2 = $3,500
  assert.equal(eligible.rdspEntitlements.estimatedAnnualGrantCad, 3500);
  assert.equal(eligible.rdspEntitlements.estimatedAnnualBondCad, 561.17); // Income $45k is between $36,502 and $55,867, pro-rated bond
  assert.ok(eligible.rdspEntitlements.retroactiveCatchUpPotentialCad > 0);

  // High income family ($120,000 > $79k CDB phaseout, > $111,733 RDSP tier 1)
  const highIncome = evaluateChildDisabilityBenefit({
    childAgeYears: 10,
    hasApprovedDtcT2201: true,
    familyNetIncomeCad: 120000,
    annualRdspContributionCad: 1500
  });
  // Phase out reduces CDB
  assert.ok(highIncome.childDisabilityBenefit.annualBenefitCad < DISABILITY_BENEFIT_CONSTANTS.ANNUAL_CDB_MAX_AMOUNT_CAD);
  // Tier 2 CDSG grant: 100% on first $1,000 = $1,000
  assert.equal(highIncome.rdspEntitlements.estimatedAnnualGrantCad, 1000);
  assert.equal(highIncome.rdspEntitlements.estimatedAnnualBondCad, 0);

  // Ineligible: Missing DTC Form T2201
  const missingDtc = evaluateChildDisabilityBenefit({
    hasApprovedDtcT2201: false
  });
  assert.equal(missingDtc.dtcStatus.isDtcPrerequisiteSatisfied, false);
  assert.equal(missingDtc.childDisabilityBenefit.isEligible, false);
  assert.equal(missingDtc.rdspEntitlements.estimatedAnnualGrantCad, 0);
  assert.ok(missingDtc.riskWarnings.some(w => w.includes('DTC CERTIFICATE REQUIRED')));
});
