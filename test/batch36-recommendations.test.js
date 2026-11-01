import test from 'node:test';
import assert from 'node:assert/strict';

// Sweep 43 (Recommendations 606-620) Modules
import { evaluateExpressEntryTieBreak, EXPRESS_ENTRY_RULES } from '../src/express-entry-tie-breaking-navigator.js';
import { evaluateFamilyLawAndSupport, calculateChildSupportTableAmount, FAMILY_LAW_CONSTANTS } from '../src/family-law-navigator.js';
import { evaluateFamilyReunification, LICO_2025_TABLE } from '../src/family-reunification-navigator.js';
import { evaluateFcrMicroLoans, evaluateIenSpepEligibility, evaluateImgPracticeReadyAssessment, FCR_BRIDGING_CONSTANTS } from '../src/fcr-healthcare-bridge-navigator.js';
import { evaluateFederalBridgingOpenWorkPermit, FEDERAL_BOWP_CONSTANTS } from '../src/federal-bridging-open-work-permit-pr-acknowledgement-navigator.js';
import { evaluateFederalC10SignificantBenefit, FEDERAL_C10_CONSTANTS } from '../src/federal-c10-significant-benefit-work-permit-navigator.js';
import { evaluateFederalC11EntrepreneurWorkPermit, FEDERAL_C11_CONSTANTS } from '../src/federal-c11-entrepreneur-self-employed-work-permit-navigator.js';
import { evaluateFederalFtaProfessionalWorkPermit, FEDERAL_FTA_CONSTANTS } from '../src/federal-c12-gats-professional-fta-navigator.js';
import { evaluateFederalIntraCompanyTransferee, FEDERAL_ICT_CONSTANTS } from '../src/federal-c14-intra-company-transferee-navigator.js';
import { evaluateFederalReciprocalEmployment, FEDERAL_C20_CONSTANTS } from '../src/federal-c20-reciprocal-employment-work-permit-navigator.js';
import { evaluateCaregiverDirectToPr, CAREGIVER_ELIGIBLE_NOCS, CAREGIVER_MINIMUM_CLB } from '../src/federal-caregiver-direct-to-pr-pilot-navigator.js';
import { evaluateFederalCaregiverPrPathway, FEDERAL_CAREGIVER_CONSTANTS } from '../src/federal-caregiver-pr-pathway-experience-navigator.js';
import { auditCitizenshipPhysicalPresence, CITIZENSHIP_PRESENCE_REQUIREMENTS } from '../src/federal-citizenship-residence-calculator-audit-navigator.js';
import { evaluateCitizenshipRevocationDefense, CITIZENSHIP_REVOCATION_NOTICE_RESPONSE_WINDOW_DAYS } from '../src/federal-citizenship-revocation-defense-navigator.js';
import { evaluateFrancophoneCommunityPilot, calculateFcipSettlementFunds, FCIP_PARTICIPATING_COMMUNITIES } from '../src/federal-francophone-community-pilot-navigator.js';

// Rec 606: Express Entry Tie-Breaking Navigator
test('Rec 606: evaluateExpressEntryTieBreak handles null, tie-breaker timestamps and PNP boost', () => {
  const nullSafe = evaluateExpressEntryTieBreak(null);
  assert.equal(nullSafe.candidateName, 'Candidate');
  assert.equal(typeof nullSafe.currentScore, 'number');

  // Candidate with score matching cutoff and submitted before tie-break timestamp wins
  const winner = evaluateExpressEntryTieBreak({
    candidateCrs: 490,
    simulatedRoundCutoff: 490,
    profileSubmissionUtc: '2026-04-01T10:00:00Z',
    simulatedTieBreakUtc: '2026-04-05T00:00:00Z'
  });
  assert.equal(winner.simulatedRound.receivesIta, true);
  assert.equal(winner.simulatedRound.tieBreakStatus, 'WON_TIE_BREAKER');

  // Candidate with score matching cutoff but submitted after tie-break timestamp loses
  const loser = evaluateExpressEntryTieBreak({
    candidateCrs: 490,
    simulatedRoundCutoff: 490,
    profileSubmissionUtc: '2026-04-10T12:00:00Z',
    simulatedTieBreakUtc: '2026-04-05T00:00:00Z'
  });
  assert.equal(loser.simulatedRound.receivesIta, false);
  assert.equal(loser.simulatedRound.tieBreakStatus, 'LOST_TIE_BREAKER');

  // PNP adds 600 points
  const pnpCandidate = evaluateExpressEntryTieBreak({
    candidateCrs: 350,
    hasProvincialNomination: true
  });
  assert.equal(pnpCandidate.currentScore, 950);
});

// Rec 607: Family Law & Support Navigator
test('Rec 607: evaluateFamilyLawAndSupport handles null, CSG child support and SSAG spousal support', () => {
  const nullSafe = evaluateFamilyLawAndSupport(null);
  assert.equal(nullSafe.clientName, 'Client');
  assert.ok(nullSafe.childSupport.monthlyTableAmountCad > 0);

  // Table amount test
  const tableAmt = calculateChildSupportTableAmount(95000, 2);
  assert.ok(tableAmt > 1000);

  // Shared custody set-off test
  const shared = evaluateFamilyLawAndSupport({
    payerGrossAnnualIncomeCad: 100000,
    recipientGrossAnnualIncomeCad: 50000,
    numberOfChildren: 2,
    parentingArrangement: 'shared_custody',
    hasActiveSponsorshipUndertaking: true
  });
  assert.ok(shared.childSupport.monthlyTableAmountCad > 0);
  assert.ok(shared.childSupport.statutoryBasis.includes('Shared Custody Set-Off'));
  assert.equal(shared.newcomerSpecificAudits.hasActiveSponsorshipUndertaking, true);
});

// Rec 608: Family Reunification Navigator
test('Rec 608: evaluateFamilyReunification handles null, March 2024 SOWP rules, Super Visa MNI and dependent age 22', () => {
  const nullSafe = evaluateFamilyReunification(null);
  assert.equal(nullSafe.applicantName, 'Applicant');
  assert.equal(nullSafe.category, 'SPOUSAL_OPEN_WORK_PERMIT');

  // Master's degree spouse is SOWP eligible
  const mastersSpouse = evaluateFamilyReunification({
    category: 'sowp',
    sponsorStatus: 'study_permit',
    studentProgramType: 'masters'
  });
  assert.equal(mastersSpouse.eligible, true);
  assert.equal(mastersSpouse.verdict, 'ELIGIBLE_FOR_SOWP');

  // Undergraduate degree spouse is ineligible under March 19, 2024 policy
  const undergradSpouse = evaluateFamilyReunification({
    category: 'sowp',
    sponsorStatus: 'study_permit',
    studentProgramType: 'undergraduate'
  });
  assert.equal(undergradSpouse.eligible, false);
  assert.equal(undergradSpouse.refusalHazard, true);

  // Super Visa MNI test
  const superVisa = evaluateFamilyReunification({
    category: 'super_visa',
    householdSize: 3,
    sponsorAnnualIncomeCad: 70000,
    hasApprovedPrivateMedicalInsurance: true
  });
  assert.equal(superVisa.eligible, true);
  assert.equal(superVisa.financialAudit.meetsIncomeThreshold, true);

  // Dependent child age 22 cutoff
  const childOver22 = evaluateFamilyReunification({
    category: 'dependent_child',
    childAge: 23,
    hasPhysicalOrMentalDisability: false
  });
  assert.equal(childOver22.eligible, false);
  assert.equal(childOver22.verdict, 'AGED_OUT_OR_INELIGIBLE');
});

// Rec 609: FCR & Healthcare Bridging Navigator
test('Rec 609: evaluateFcrMicroLoans, SPEP and PRA handle null and assess bridging eligibility', () => {
  const nullSafeLoans = evaluateFcrMicroLoans(null);
  assert.equal(nullSafeLoans.candidateName, 'Candidate');
  assert.equal(nullSafeLoans.isEligibleForFcrLoans, true);

  // Windmill Microlending eligibility
  const windmill = evaluateFcrMicroLoans({
    immigrationStatus: 'permanent_resident',
    fundingRequiredCad: 10000
  });
  assert.equal(windmill.isEligibleForFcrLoans, true);
  assert.ok(windmill.availableLoanPrograms.some(p => p.provider.includes('Windmill')));

  // IEN SPEP CNO placement
  const spep = evaluateIenSpepEligibility(null);
  assert.equal(spep.candidateName, 'Candidate');
  assert.equal(spep.isEligibleForSpep, true);
  assert.equal(spep.programDetails.minPracticeHoursRequired, 140);

  // IMG Practice Ready Assessment
  const pra = evaluateImgPracticeReadyAssessment({
    completedResidencyOutsideCanada: true,
    residencyDurationYears: 3,
    clinicalPracticeYearsWithinLast5Years: 3,
    passedMccqe1: true,
    passedNacOsce: true
  });
  assert.equal(pra.isEligibleForPra, true);
});

// Rec 610: Federal BOWP Navigator
test('Rec 610: evaluateFederalBridgingOpenWorkPermit handles null, 120-day window and Section 10 AOR', () => {
  const nullSafe = evaluateFederalBridgingOpenWorkPermit(null);
  assert.equal(nullSafe.applicantName, 'Applicant');
  assert.equal(nullSafe.isEligible, true);

  // Premature application (>120 days until expiry)
  const premature = evaluateFederalBridgingOpenWorkPermit({
    daysUntilCurrentPermitExpires: 180
  });
  assert.equal(premature.isEligible, false);
  assert.ok(premature.statutoryViolations.some(v => v.rule.includes('PREMATURE')));

  // Missing Section 10 completeness AOR
  const noAor = evaluateFederalBridgingOpenWorkPermit({
    hasReceivedOfficialAor: false
  });
  assert.equal(noAor.isEligible, false);
  assert.ok(noAor.statutoryViolations.some(v => v.rule.includes('MISSING_SECTION_10_COMPLETENESS_AOR')));
});

// Rec 611: Federal C10 Significant Benefit Navigator
test('Rec 611: evaluateFederalC10SignificantBenefit handles null, distinguished achievement and economic benefit', () => {
  const nullSafe = evaluateFederalC10SignificantBenefit(null);
  assert.equal(nullSafe.applicantName, 'Applicant');
  assert.equal(nullSafe.isEligible, true);

  // Lack of business plan and achievements
  const weakCase = evaluateFederalC10SignificantBenefit({
    hasDocumentedRecordOfDistinguishedAchievement: false,
    hasOfficialSupportFromCanadianGovernmentOrBody: false,
    hasDetailedCanadianBusinessOrWorkPlan: false,
    independentExpertTestimonialLettersCount: 0
  });
  assert.equal(weakCase.isEligible, false);
  assert.ok(weakCase.statutoryViolations.length > 0 || weakCase.evidentiaryGaps.length > 0);
});

// Rec 612: Federal C11 Entrepreneur Work Permit
test('Rec 612: evaluateFederalC11EntrepreneurWorkPermit handles null, 50%+ ownership and job creation', () => {
  const nullSafe = evaluateFederalC11EntrepreneurWorkPermit(null);
  assert.equal(nullSafe.applicantName, 'Entrepreneur');
  assert.equal(nullSafe.isEligible, true);

  // Insufficient ownership (<50% without controlling interest)
  const lowOwnership = evaluateFederalC11EntrepreneurWorkPermit({
    businessOwnershipPercentage: 30,
    hasControllingInterest: false
  });
  assert.equal(lowOwnership.isEligible, false);
  assert.ok(lowOwnership.statutoryViolations.some(v => v.rule.includes('INSUFFICIENT_BUSINESS_OWNERSHIP')));
});

// Rec 613: Federal FTA Professional Work Permit
test('Rec 613: evaluateFederalFtaProfessionalWorkPermit handles null, CUSMA/CETA treaties and degree requirements', () => {
  const nullSafe = evaluateFederalFtaProfessionalWorkPermit(null);
  assert.equal(nullSafe.applicantName, 'Professional');
  assert.equal(nullSafe.isEligible, true);

  // Supported treaties check
  assert.ok(FEDERAL_FTA_CONSTANTS.SUPPORTED_TREATIES.CUSMA);
  assert.ok(FEDERAL_FTA_CONSTANTS.SUPPORTED_TREATIES.CETA);
  assert.ok(FEDERAL_FTA_CONSTANTS.SUPPORTED_TREATIES.CPTPP);

  // Missing signed contract
  const noContract = evaluateFederalFtaProfessionalWorkPermit({
    hasSignedServiceContractOrJobOffer: false
  });
  assert.equal(noContract.isEligible, false);
  assert.ok(noContract.statutoryViolations.some(v => v.rule.includes('MISSING_PREARRANGED_CONTRACT')));
});

// Rec 614: Federal ICT C14 Work Permit
test('Rec 614: evaluateFederalIntraCompanyTransferee handles null, corporate links and 7-year/5-year duration caps', () => {
  const nullSafe = evaluateFederalIntraCompanyTransferee(null);
  assert.equal(nullSafe.transfereeName, 'Transferee');
  assert.equal(nullSafe.isEligible, true);

  // Insufficient foreign tenure (<12 months)
  const shortTenure = evaluateFederalIntraCompanyTransferee({
    continuousForeignEmploymentMonths: 6
  });
  assert.equal(shortTenure.isEligible, false);
  assert.ok(shortTenure.statutoryViolations.some(v => v.rule.includes('INSUFFICIENT_CONTINUOUS_FOREIGN_EMPLOYMENT')));

  // Executive statutory cap reached (7 years)
  const capReached = evaluateFederalIntraCompanyTransferee({
    transfereeRole: 'EXECUTIVE_OR_SENIOR_MANAGER',
    accumulatedYearsOnIctPermitInCanada: 7
  });
  assert.equal(capReached.isEligible, false);
  assert.ok(capReached.statutoryViolations.some(v => v.rule.includes('STATUTORY_ICT_CUMULATIVE_CAP_REACHED')));
});

// Rec 615: Federal C20 Reciprocal Employment
test('Rec 615: evaluateFederalReciprocalEmployment handles null, bilateral MOUs and exchange parity', () => {
  const nullSafe = evaluateFederalReciprocalEmployment(null);
  assert.equal(nullSafe.workerName, 'Exchange Worker');
  assert.equal(nullSafe.isEligible, true);

  // Missing bilateral agreement
  const noMou = evaluateFederalReciprocalEmployment({
    hasFormalWrittenReciprocalAgreement: false
  });
  assert.equal(noMou.isEligible, false);
  assert.equal(noMou.eligibilityVerdict, 'INELIGIBLE_NO_RECIPROCAL_AGREEMENT');
});

// Rec 616: Federal Caregiver Direct-to-PR Pilot
test('Rec 616: evaluateCaregiverDirectToPr handles null, NOC 44100/44101 and private household mandate', () => {
  const nullSafe = evaluateCaregiverDirectToPr(null);
  assert.equal(nullSafe.applicantName, 'Applicant');
  assert.equal(nullSafe.isEligible, true);

  // Commercial day care employer is prohibited
  const commercial = evaluateCaregiverDirectToPr({
    employerType: 'COMMERCIAL_FACILITY'
  });
  assert.equal(commercial.isEligible, false);
  assert.ok(commercial.disqualifications.some(d => d.criterion.includes('COMMERCIAL_EMPLOYER_PROHIBITION')));

  // Quebec job offer is excluded
  const quebec = evaluateCaregiverDirectToPr({
    jobOfferOutsideQuebec: false
  });
  assert.equal(quebec.isEligible, false);
  assert.ok(quebec.disqualifications.some(d => d.criterion.includes('QUEBEC_JURISDICTION_EXCLUSION')));
});

// Rec 617: Federal Caregiver PR Pathway Experience
test('Rec 617: evaluateFederalCaregiverPrPathway handles null, 12-month experience rule and CLB 5 benchmark', () => {
  const nullSafe = evaluateFederalCaregiverPrPathway(null);
  assert.equal(nullSafe.caregiverName, 'Caregiver');
  assert.equal(nullSafe.isEligible, true);

  // Insufficient experience (<12 months)
  const shortExp = evaluateFederalCaregiverPrPathway({
    completedCanadianExperienceMonths: 8
  });
  assert.equal(shortExp.isEligible, false);
  assert.ok(shortExp.statutoryViolations.some(v => v.rule.includes('INSUFFICIENT_QUALIFYING_CANADIAN_WORK_EXPERIENCE')));

  // Language below CLB 5
  const lowClb = evaluateFederalCaregiverPrPathway({
    clbSpeaking: 4
  });
  assert.equal(lowClb.isEligible, false);
  assert.ok(lowClb.statutoryViolations.some(v => v.rule.includes('BELOW_MINIMUM_CLB_5_BENCHMARK')));
});

// Rec 618: Federal Citizenship Physical Presence
test('Rec 618: auditCitizenshipPhysicalPresence handles null, 1095-day rule and pre-PR half-day credit', () => {
  const nullSafe = auditCitizenshipPhysicalPresence(null);
  assert.equal(nullSafe.applicantName, 'Applicant');
  assert.equal(nullSafe.presenceSummary.daysRequired, 1095);

  // 1,095 PR days meets physical presence
  const eligiblePr = auditCitizenshipPhysicalPresence({
    daysPresentAsPermanentResident: 1100,
    hasIncomeTaxFilingCompliance: true,
    meetsLanguageAndKnowledgeCriteria: true,
    applicantAge: 30
  });
  assert.equal(eligiblePr.isEligible, true);
  assert.equal(eligiblePr.presenceSummary.meetsPhysicalPresenceThreshold, true);

  // Pre-PR temporary resident days credited at 0.5x up to 365 days
  const trCredit = auditCitizenshipPhysicalPresence({
    daysPresentAsPermanentResident: 800,
    daysPresentAsTemporaryResident: 600, // 600 * 0.5 = 300 days
    hasIncomeTaxFilingCompliance: true
  });
  assert.equal(trCredit.presenceSummary.creditedDaysFromTemporaryResidence, 300);
  assert.equal(trCredit.presenceSummary.netQualifyingPresenceDays, 1100);
  assert.equal(trCredit.isEligible, true);
});

// Rec 619: Federal Citizenship Revocation Defense
test('Rec 619: evaluateCitizenshipRevocationDefense handles null, 30-day notice window and statelessness defense', () => {
  const nullSafe = evaluateCitizenshipRevocationDefense(null);
  assert.equal(nullSafe.applicantName, 'Citizen');
  assert.equal(nullSafe.proceduralAudit.isWithinStatutoryThirtyDayWindow, true);

  // Notice expired (>30 days elapsed)
  const expired = evaluateCitizenshipRevocationDefense({
    noticeOfIntentDate: '2026-09-01',
    currentDate: '2026-10-25'
  });
  assert.equal(expired.proceduralAudit.isWithinStatutoryThirtyDayWindow, false);
  assert.ok(expired.riskWarnings.some(w => w.warning.includes('DEFAULT_REVOCATION')));

  // Statelessness defense
  const stateless = evaluateCitizenshipRevocationDefense({
    wouldBeRenderedStateless: true
  });
  assert.ok(stateless.legalDefenses.some(d => d.defense.includes('STATELESSNESS')));
});

// Rec 620: Federal Francophone Community Pilot
test('Rec 620: evaluateFrancophoneCommunityPilot and calculateFcipSettlementFunds handle null and community criteria', () => {
  const nullSafe = evaluateFrancophoneCommunityPilot(null);
  assert.equal(nullSafe.candidateName, 'Candidate');
  assert.equal(nullSafe.isEligible, true);

  // Settlement funds table calculation (50% of LICO)
  assert.equal(calculateFcipSettlementFunds(1), 7345);
  assert.equal(calculateFcipSettlementFunds(2), 9144);
  assert.ok(calculateFcipSettlementFunds(6) > calculateFcipSettlementFunds(5));

  // Participating community Sudbury (ON)
  const sudbury = evaluateFrancophoneCommunityPilot({
    communityName: 'Sudbury',
    hasCommunityRecommendationLetter: true,
    targetNocTeer: 2,
    frenchNclcSpeaking: 5,
    frenchNclcListening: 5,
    frenchNclcReading: 5,
    frenchNclcWriting: 5
  });
  assert.equal(sudbury.isEligible, true);

  // Non-participating community rejected
  const nonParticipating = evaluateFrancophoneCommunityPilot({
    communityName: 'NonExistentCommunity'
  });
  assert.equal(nonParticipating.isEligible, false);
  assert.ok(nonParticipating.disqualifications.some(d => d.criterion.includes('NON_PARTICIPATING_COMMUNITY')));
});
