/**
 * Test Suite: Batch 17 Platform Recommendations (Recs 321–335)
 *
 * Validates hardening, input boundary sanitization, resilient date parsing,
 * strict wording guard compliance, and statutory accuracy across Sweep 24 modules.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { evaluateQuebecCsqSkilledWorker } from '../src/quebec-csq-skilled-worker-arrima-navigator.js';
import { evaluateQuebecPeqTemporaryWorker, auditQuebecFrenchProficiency } from '../src/quebec-peq-temporary-worker-navigator.js';
import { evaluateSinpTechTalent } from '../src/saskatchewan-immigrant-nominee-tech-talent-navigator.js';
import { evaluateSinpHardToFillSkills } from '../src/saskatchewan-sinp-hard-to-fill-navigator.js';
import { evaluateSaskatchewanLayoffNotice } from '../src/saskatchewan-employment-layoff-notice-severance-navigator.js';
import { evaluateCaregiverDirectToPr } from '../src/federal-caregiver-direct-to-pr-pilot-navigator.js';
import { evaluateFederalFrancophoneMobilityC16 } from '../src/federal-francophone-mobility-c16-expansion-navigator.js';
import { evaluateFederalStudentOffCampusWork } from '../src/federal-study-permit-off-campus-work-hours-navigator.js';
import { evaluateForeignWorkerTransition } from '../src/foreign-worker-transition-navigator.js';
import { evaluateFrancophoneMobility } from '../src/francophone-mobility-navigator.js';
import { analyzeGcmsRefusalNotes } from '../src/gcms-refusal-analyzer.js';
import { evaluatePrResidencyObligation } from '../src/pr-residency-navigator.js';
import { evaluatePrtdHumanitarian } from '../src/pr-travel-document-humanitarian-navigator.js';
import { evaluateTfwEmployerCompliance, generateTfwComplianceDemandLetter } from '../src/tfw-compliance-navigator.js';
import { evaluateVulnerableWorkerProtection } from '../src/vulnerable-worker-defense.js';

describe('Batch 17 Recommendations (Sweep 24: Recs 321–335)', () => {
  // Rec 321: Quebec CSQ Skilled Worker (Arrima / PSTQ)
  it('Rec 321: evaluateQuebecCsqSkilledWorker audits points grid, Niveau 7 French, and financial autonomy', () => {
    const qualified = evaluateQuebecCsqSkilledWorker({
      applicantAge: 29,
      educationLevel: 'bachelor_3_years',
      areaOfTrainingSection: 'SECTION_B',
      monthsOfQualifiedExperience: 36,
      frenchOralListeningNiveau: 7,
      frenchOralSpeakingNiveau: 8,
      englishListeningClb: 6,
      englishSpeakingClb: 6,
      hasQuebecStudyOrWorkStay: true,
      hasValidatedJobOffer: true,
      isJobOfferOutsideMontrealCmm: true,
      signedFinancialAutonomyContract: true,
      candidateName: 'Camille Laurent',
      assessmentDate: '2026-11-01'
    });

    assert.equal(qualified.jurisdiction, 'QUEBEC_CANADA');
    assert.equal(qualified.isEligible, true);
    assert.equal(qualified.candidateName, 'Camille Laurent');
    assert.equal(qualified.assessmentDate, '2026-11-01');
    assert.ok(qualified.totalScore >= qualified.passMarkRequired);
    assert.equal(qualified.meetsMandatoryFrenchOralThreshold, true);

    // Below Niveau 7 French
    const lowFrench = evaluateQuebecCsqSkilledWorker({
      frenchOralListeningNiveau: 5,
      frenchOralSpeakingNiveau: 6
    });
    assert.equal(lowFrench.isEligible, false);
    assert.equal(lowFrench.meetsMandatoryFrenchOralThreshold, false);
    assert.equal(lowFrench.eligibilityVerdict, 'INELIGIBLE_MANDATORY_FRENCH_NOT_MET');
  });

  // Rec 322: Quebec PEQ Temporary Foreign Worker Stream
  it('Rec 322: evaluateQuebecPeqTemporaryWorker audits 24-month tenure, oral French, and values attestation', () => {
    const res = evaluateQuebecPeqTemporaryWorker({
      monthsWorkedInQuebec: 28,
      weeklyHoursWorked: 37.5,
      jobTeerLevel: 1,
      isCurrentlyEmployedInQuebec: true,
      hasValidWorkPermitStatus: true,
      principalOralFrenchLevel: 7,
      hasCompletedValuesAttestation: true,
      hasAccompanyingSpouse: false,
      applicantName: 'Jean Dupont',
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.isEligible, true);
    assert.equal(res.eligibilityStatus, 'ELIGIBLE_FOR_PEQ_CSQ');
    assert.equal(res.applicantName, 'Jean Dupont');
    assert.equal(res.assessmentDate, '2026-11-01');
    assert.equal(res.deficiencies.length, 0);

    // Ineligible due to insufficient work months & missing values attestation
    const ineligible = evaluateQuebecPeqTemporaryWorker({
      monthsWorkedInQuebec: 18,
      hasCompletedValuesAttestation: false
    });
    assert.equal(ineligible.isEligible, false);
    assert.ok(ineligible.deficiencies.length >= 2);
  });

  // Rec 323: Saskatchewan Immigrant Nominee Program (SINP) Tech Talent Pathway
  it('Rec 323: evaluateSinpTechTalent validates tech NOC, JAL, and Express Entry 600 bonus points', () => {
    const res = evaluateSinpTechTalent({
      nocCode: '21232', // Software developers and programmers
      hasSinpJobApprovalLetter: true,
      isPermanentFullTimeOffer: true,
      isCurrentlyWorkingInSaskatchewan: false,
      monthsOfRelatedExperiencePastFiveYears: 24,
      clbScore: 7,
      isExpressEntryStream: true,
      hasActiveExpressEntryProfile: true,
      hasPostSecondaryTechEducation: true,
      intendsToResideInSaskatchewan: true,
      candidateName: 'Aarav Patel',
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.isEligible, true);
    assert.equal(res.candidateName, 'Aarav Patel');
    assert.equal(res.assessmentDate, '2026-11-01');
    assert.equal(res.expressEntryBonusPoints, 600);
    assert.equal(res.eligibilityVerdict, 'ELIGIBLE_FOR_SINP_TECH_TALENT_NOMINATION');

    // Missing APEGS licensure for regulated engineering NOC 21310
    const eng = evaluateSinpTechTalent({
      nocCode: '21310',
      hasApegsLicensureOrEligibilityLetter: false
    });
    assert.equal(eng.isEligible, false);
    assert.ok(eng.disqualifications.some(d => d.criterion === 'APEGS_LICENSURE_MISSING'));
  });

  // Rec 324: Saskatchewan SINP Hard-To-Fill Skills Pilot
  it('Rec 324: evaluateSinpHardToFillSkills audits entry-level targeted NOCs and 6-month continuous work', () => {
    const qualified = evaluateSinpHardToFillSkills({
      nocCode: '65200', // Food counter attendants
      workExperienceMonthsInSaskatchewan: 8,
      languageClbLevel: 5,
      hasSaskatchewanJobApprovalLetter: true,
      hasPermanentFullTimeOffer: true,
      highestEducation: 'secondary_school',
      hasEducationalCredentialAssessment: true,
      teerLevel: 5,
      isValidWorkPermitHeld: true,
      applicantName: 'Carlos Gomez',
      assessmentDate: '2026-11-01'
    });

    assert.equal(qualified.isEligible, true);
    assert.equal(qualified.applicantName, 'Carlos Gomez');
    assert.equal(qualified.assessmentDate, '2026-11-01');
    assert.equal(qualified.eligibilityStatus, 'QUALIFIED_FOR_SINP_NOMINATION');

    // Missing JAL and less than 6 months work experience
    const missingJal = evaluateSinpHardToFillSkills({
      hasSaskatchewanJobApprovalLetter: false,
      workExperienceMonthsInSaskatchewan: 3
    });
    assert.equal(missingJal.isEligible, false);
    assert.ok(missingJal.deficiencies.some(d => d.rule === 'SINP Job Approval Letter (JAL)'));
  });

  // Rec 325: Saskatchewan Employment Act Layoff Notice & Group Termination
  it('Rec 325: evaluateSaskatchewanLayoffNotice computes individual vs group notice under s. 2-60 and s. 2-62', () => {
    // 4 years service individual = 4 weeks; group of 60 employees = 8 weeks; 2 weeks actual notice = 6 weeks shortfall
    const res = evaluateSaskatchewanLayoffNotice({
      yearsOfContinuousService: 4,
      regularWeeklyWageCad: 1000,
      employeesTerminatedIn4WeekWindow: 60,
      isTerminatedForJustCause: false,
      ministerNotifiedInWriting: true,
      actualNoticeWeeksGiven: 2,
      employeeName: 'David Miller',
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.jurisdiction, 'SASKATCHEWAN_CANADA');
    assert.equal(res.employeeName, 'David Miller');
    assert.equal(res.assessmentDate, '2026-11-01');
    assert.equal(res.isGroupTerminationApplicable, true);
    assert.equal(res.noticeCalculation.statutoryNoticeWeeksEntitled, 8);
    assert.equal(res.noticeCalculation.noticeShortfallWeeks, 6);
    assert.equal(res.noticeCalculation.statutoryPayInLieuEntitledCad, 6000);

    // Just cause termination under s. 2-60(3)
    const justCause = evaluateSaskatchewanLayoffNotice({
      isTerminatedForJustCause: true
    });
    assert.equal(justCause.statutoryNoticeWeeksEntitled, 0);
    assert.equal(justCause.statutoryPayInLieuEntitledCad, 0);
  });

  // Rec 326: Federal Caregiver Direct-to-PR Pilot
  it('Rec 326: evaluateCaregiverDirectToPr enforces private household employer and CLB 4 threshold', () => {
    const res = evaluateCaregiverDirectToPr({
      nocCode: '44100', // Home child care
      careRecipientType: 'CHILDREN_UNDER_18',
      employerType: 'PRIVATE_HOUSEHOLD',
      employerMeetsLicoIncomeTest: true,
      jobOfferFullTime: true,
      jobOfferNonSeasonal: true,
      jobOfferOutsideQuebec: true,
      clbSpeaking: 5,
      clbListening: 5,
      clbReading: 5,
      clbWriting: 4,
      hasHighSchoolDiplomaOrEca: true,
      applicantName: 'Maria Santos',
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.isEligible, true);
    assert.equal(res.applicantName, 'Maria Santos');
    assert.equal(res.assessmentDate, '2026-11-01');
    assert.equal(res.eligibilityVerdict, 'ELIGIBLE_FOR_CAREGIVER_DIRECT_TO_PR');

    // Commercial employer prohibited
    const comm = evaluateCaregiverDirectToPr({
      employerType: 'COMMERCIAL_FACILITY',
      jobRequiresMandatoryLiveIn: true
    });
    assert.equal(comm.isEligible, false);
    assert.ok(comm.disqualifications.some(d => d.criterion === 'COMMERCIAL_EMPLOYER_PROHIBITION'));
    assert.ok(comm.riskWarnings.some(w => w.warning === 'PROHIBITED_MANDATORY_LIVE_IN_CONDITION'));
  });

  // Rec 327: Federal Francophone Mobility C16 Expansion
  it('Rec 327: evaluateFederalFrancophoneMobilityC16 audits TEER 0-5 LMIA exemption outside Quebec', () => {
    const res = evaluateFederalFrancophoneMobilityC16({
      frenchOralNclcLevel: 6,
      destinationProvince: 'ON',
      teerCategory: 3,
      isPrimaryAgricultureNoc: false,
      hasValidJobOffer: true,
      hasApprovedFrenchTest: true,
      employerComplianceFeePaid: true,
      candidateName: 'Etienne Beauchamp',
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.isEligible, true);
    assert.equal(res.candidateName, 'Etienne Beauchamp');
    assert.equal(res.assessmentDate, '2026-11-01');
    assert.equal(res.exemptionCode, 'C16');
    assert.equal(res.workPermitDetails.lmiaRequired, false);

    // Quebec destination is statutorily excluded
    const qc = evaluateFederalFrancophoneMobilityC16({
      destinationProvince: 'QC'
    });
    assert.equal(qc.isEligible, false);
    assert.ok(qc.statutoryViolations.some(v => v.rule === 'INELIGIBLE_DESTINATION_QUEBEC'));
  });

  // Rec 328: Federal International Student Off-Campus Work 24-Hour Cap
  it('Rec 328: evaluateFederalStudentOffCampusWork audits Fall 2024 24-hr cap and PGWP impact', () => {
    const compliant = evaluateFederalStudentOffCampusWork({
      hasValidStudyPermit: true,
      enrolledFullTimeAtDli: true,
      isInRegularAcademicSession: true,
      isOnRegularlyScheduledBreak: false,
      weeklyHoursWorkedOffCampus: 24,
      hasValidSocialInsuranceNumber: true,
      programLengthMonths: 24,
      studentName: 'Rahul Verma',
      assessmentDate: '2026-11-01'
    });

    assert.equal(compliant.isCompliant, true);
    assert.equal(compliant.studentName, 'Rahul Verma');
    assert.equal(compliant.assessmentDate, '2026-11-01');
    assert.equal(compliant.pgwpImpact.pgwpAtRisk, false);

    // Exceeding 24 hours triggers non-compliance and PGWP risk under IRPR s. 200(3)(e)
    const excess = evaluateFederalStudentOffCampusWork({
      weeklyHoursWorkedOffCampus: 28,
      isInRegularAcademicSession: true,
      isOnRegularlyScheduledBreak: false
    });
    assert.equal(excess.isCompliant, false);
    assert.equal(excess.pgwpImpact.pgwpAtRisk, true);
    assert.ok(excess.statutoryViolations.some(v => v.rule === 'EXCEEDED_24_HOUR_WEEKLY_OFF_CAMPUS_CAP'));
  });

  // Rec 329: Temporary Foreign Worker Transition & LMIA Cap Engine
  it('Rec 329: evaluateForeignWorkerTransition audits CMA refusal freeze, 10% employer cap, and runway', () => {
    const lowWageInFreeze = evaluateForeignWorkerTransition({
      wagePerHour: 18.00,
      provincialMedianWage: 28.39,
      employerLocationCma: 'Toronto',
      cmaUnemploymentRate: 6.8,
      sector: 'hospitality',
      currentWorkPermitExpiryDays: 25,
      hasFrenchProficiencyNclc5: true,
      workerName: 'Liam O’Connor',
      assessmentDate: '2026-11-01'
    });

    assert.equal(lowWageInFreeze.streamClassification.stream, 'LOW_WAGE_STREAM');
    assert.equal(lowWageInFreeze.lmiaAudit.isSubjectToCmaFreeze, true);
    assert.equal(lowWageInFreeze.currentPermitRunway.status, 'CRITICAL_URGENCY');
    assert.equal(lowWageInFreeze.workerName, 'Liam O’Connor');
    assert.ok(lowWageInFreeze.viablePathways.some(p => p.pathwayName.includes('Francophone Mobility')));

    // High wage is exempt from CMA freeze
    const highWage = evaluateForeignWorkerTransition({
      wagePerHour: 35.00,
      provincialMedianWage: 28.39,
      cmaUnemploymentRate: 7.2
    });
    assert.equal(highWage.streamClassification.isHighWage, true);
    assert.equal(highWage.lmiaAudit.isSubjectToCmaFreeze, false);
  });

  // Rec 330: Francophone Mobility Program (C16) Navigator
  it('Rec 330: evaluateFrancophoneMobility validates NCLC 5 oral test, expiry dates, and employer compliance', () => {
    const res = evaluateFrancophoneMobility({
      province: 'ON',
      frenchTestType: 'tef_canada',
      nclcSpeaking: 6,
      nclcListening: 7,
      testDate: '2025-06-01',
      nocCode: '21232',
      nocTeer: 1,
      isPrimaryAgriculture: false,
      hasGenuineJobOffer: true,
      employerPaidComplianceFee: true,
      applicantName: 'Chloe Dubois',
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.overallEligible, true);
    assert.equal(res.applicantName, 'Chloe Dubois');
    assert.equal(res.lmiaExemptionCode, 'C16');
    assert.equal(res.languageAudit.meetsOralThreshold, true);

    // Test expired test (> 2 years)
    const expired = evaluateFrancophoneMobility({
      testDate: '2023-01-01',
      assessmentDate: '2026-11-01'
    });
    assert.equal(expired.languageAudit.testExpired, true);
    assert.equal(expired.overallEligible, false);
  });

  // Rec 331: GCMS Refusal Notes Analyzer
  it('Rec 331: analyzeGcmsRefusalNotes identifies s. 179(b) grounds, Vavilov standard, and 60-day JR window', () => {
    const analysis = analyzeGcmsRefusalNotes({
      refusalCodes: [],
      rawOfficerNotesText: 'I am not satisfied applicant has sufficient funds. Also family ties in Canada make departure unlikely.',
      daysSinceRefusal: 20,
      applicantName: 'Amara Nwosu',
      assessmentDate: '2026-11-01'
    });

    assert.equal(analysis.applicantName, 'Amara Nwosu');
    assert.equal(analysis.groundsIdentifiedCount, 2);
    assert.ok(analysis.refusalFindings.some(f => f.refusalGround === 'R179b_ASSETS_FUNDS'));
    assert.ok(analysis.refusalFindings.some(f => f.refusalGround === 'R179b_FAMILY_TIES'));
    assert.equal(analysis.proceduralRemedy.isWithinFederalCourtWindow, true);
  });

  // Rec 332: Canadian PR Residency Obligation & Card Renewal
  it('Rec 332: evaluatePrResidencyObligation calculates citizen spouse exemption and eliminates wording promises', () => {
    const res = evaluatePrResidencyObligation({
      physicalDaysInsideCanada: 600,
      overseasDaysWithCitizenSpouse: 200,
      isCurrentlyInsideCanada: true,
      hasUrgentTravelBooked: true,
      urgentTravelDate: '2026-12-15',
      urgentTravelReason: 'employment',
      applicantName: 'Sofia Rossi',
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.applicantName, 'Sofia Rossi');
    assert.equal(res.residencyDayAudit.totalCreditedResidencyDays, 800);
    assert.equal(res.residencyDayAudit.hasMet730DaysObligation, true);
    assert.equal(res.urgentProcessingAssessment.isEligibleForUrgentProcessing, true);

    // Check wording in advisories has no absolute promises
    const advisoryText = res.statutoryAdvisories.join(' ');
    assert.equal(advisoryText.includes('100% as a day inside Canada'), false);
    assert.ok(advisoryText.includes('fully credited as physical presence inside Canada'));
  });

  // Rec 333: PR Travel Document (PRTD) Humanitarian & Compassionate Engine
  it('Rec 333: evaluatePrtdHumanitarian audits BIOC, establishment, and s. 31(3)(c) mandatory travel document', () => {
    const res = evaluatePrtdHumanitarian({
      daysPhysicallyInCanadaLast5Years: 420,
      reasonForAbsenceCategory: 'care_for_critically_ill_family',
      hasDocumentaryProofOfCompellingCircumstance: true,
      yearsResidedInCanadaPriorToAbsence: 5,
      filedCanadianTaxesConsecutively: true,
      ownsResidentialHomeOrAssetsInCanada: true,
      hasMinorCanadianChildrenAffected: true,
      hasCanadianCitizenSpouseInCanada: false,
      applicantName: 'Tariq Al-Mansoor',
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.applicantName, 'Tariq Al-Mansoor');
    assert.equal(res.humanitarianAssessment.overallHcStrength, 'STRONG');
    assert.equal(res.humanitarianAssessment.bestInterestsOfChildEngaged, true);
    assert.equal(res.appealRights.qualifiesForMandatoryInPersonTravelDocument, true); // >= 365 days
  });

  // Rec 334: Temporary Foreign Worker Compliance & Restitution Demand Engine
  it('Rec 334: evaluateTfwEmployerCompliance audits wage shortfalls, illegal fees, and generates demand letter', () => {
    const audit = evaluateTfwEmployerCompliance({
      stream: 'low_wage',
      lmiaStipulatedHourlyWageCad: 24.50,
      actualPaidHourlyWageCad: 18.00,
      weeklyHoursContracted: 40,
      actualWeeklyHoursOffered: 40,
      prohibitedDeductionsChargedCad: 2000,
      recruiterFeeChargedCad: 3000,
      employerRetainedPassportOrPermit: true,
      weeksWorked: 10,
      workerName: 'Guillermo Cruz',
      employerName: 'Valley Produce Inc.',
      assessmentDate: '2026-11-01'
    });

    assert.equal(audit.workerName, 'Guillermo Cruz');
    assert.equal(audit.wageAudit.hourlyUnderpaymentCad, 6.50);
    assert.equal(audit.wageAudit.totalWageShortfallCad, 2600); // 6.50 * 40 * 10
    assert.equal(audit.unlawfulDeductionsAudit.totalIllegalDeductionsCad, 5000);
    assert.equal(audit.totalFinancialRestitutionDueCad, 7600);
    assert.equal(audit.vwowpAssessment.eligibleForVwowp, true);

    const letter = generateTfwComplianceDemandLetter({
      workerName: 'Guillermo Cruz',
      employerName: 'Valley Produce Inc.',
      wageShortfallCad: 2600,
      illegalDeductionsCad: 5000,
      hasPassportRetained: true,
      demandDate: '2026-11-01'
    });

    assert.ok(letter.includes('$7600 CAD'));
    assert.ok(letter.includes('Valley Produce Inc.'));
    assert.ok(letter.includes('Guillermo Cruz'));
  });

  // Rec 335: Vulnerable Worker Open Work Permit (VWOWP) Defense
  it('Rec 335: evaluateVulnerableWorkerProtection assesses abuse grounds and verifies fee-exempt wording', () => {
    const res = evaluateVulnerableWorkerProtection({
      currentPermitType: 'closed_employer_specific_work_permit',
      abuseGrounds: ['illegal_recruitment_fees', 'document_confiscation', 'wage_theft_kickbacks'],
      recruitmentFeesPaidCad: 6000,
      unpaidWagesOrKickbacksCad: 2500,
      hasEvidenceDocs: true,
      evidenceTypesHeld: ['text_messages_whatsapp', 'audio_recordings'],
      workProvince: 'ON',
      workerName: 'Sunita Sharma',
      assessmentDate: '2026-11-01'
    });

    assert.equal(res.workerName, 'Sunita Sharma');
    assert.equal(res.assessmentDate, '2026-11-01');
    assert.equal(res.isVwowpEligible, true);
    assert.equal(res.eligibilityVerdict, 'STATUTORILY_ELIGIBLE_FOR_VWOWP');
    assert.equal(res.totalFinancialLossCad, 8500);
    assert.equal(res.evidenceAudit.evidenceConfidence, 'STRONG');

    // Strict wording guard: verify that step 1 does NOT contain "100% free"
    const step1 = res.vwowpRoadmap.find(s => s.step === 1);
    assert.ok(step1);
    assert.equal(step1.action.includes('100% free'), false);
    assert.ok(step1.action.includes('fee-exempt / no fee required'));
  });
});
