/**
 * Spousal Open Work Permit (SOWP) Modernized Eligibility & TEER Alignment Engine
 * 
 * Statutory & Policy Authorities:
 * - Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227:
 *   - s. 205(c)(ii) (Public interest employment authorization - LMIA Exemption Codes C41 & C42)
 *   - s. 4 (Anti-bad faith marriage test / genuine relationship criteria)
 *   - s. 1(1) (Definition of common-law partner: continuous cohabitation of at least 1 year)
 * - IRCC Program Delivery Instructions (Spouses or Common-Law Partners of Temporary Residents):
 *   - Modernized Policy Overhaul (Effective March 19, 2024):
 *     1. Student Spouses (C42): SOWP strictly restricted to spouses of students enrolled in Master's,
 *        Doctoral, or professional degree programs (Medicine, Dentistry, Law, Optometry, Pharmacy,
 *        Veterinary, Nursing, Engineering, Education). Spouses of undergraduate bachelor's and college
 *        diploma students are NO LONGER ELIGIBLE.
 *     2. Worker Spouses (C41): Principal worker must have a valid work permit of >= 6 months, and be
 *        employed in TEER 0, 1, 2, or 3 (or qualifying TEER 4/5 under public policy phase 2).
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const SOWP_CONSTANTS = Object.freeze({
  POLICY_OVERHAUL_DATE: '2024-03-19',
  MIN_WORK_PERMIT_MONTHS: 6,
  MIN_COMMON_LAW_MONTHS: 12
});

export const ELIGIBLE_PROFESSIONAL_DEGREE_PROGRAMS = Object.freeze([
  'Doctor of Dental Surgery (DDS, DMD)',
  'Doctor of Medicine (MD)',
  'Juris Doctor (JD, LLB)',
  'Doctor of Optometry (OD)',
  'Pharmacy (PharmD, BS, BSc, BPharm)',
  'Doctor of Veterinary Medicine (DVM)',
  'Bachelor of Science in Nursing (BScN, BSN, BNurs)',
  'Bachelor of Education (B.Ed.)',
  'Bachelor of Engineering (B.Eng., BE, BASc)'
]);

/**
 * Diagnostic assessment of Spousal Open Work Permit (SOWP) eligibility under IRPR s. 205(c)(ii)
 * and the March 19, 2024 post-secondary program restrictions.
 */
export function evaluateSowpEligibility({
  sponsorType = 'international_student', // 'international_student' | 'foreign_worker'
  studentProgramLevel = 'masters', // 'masters' | 'doctoral' | 'professional_degree' | 'bachelors_undergrad' | 'college_diploma'
  professionalDegreeSpecialty = null,
  workerNocTeer = 1, // 0, 1, 2, 3, 4, 5
  workerPermitDurationMonths = 12,
  workerHasQualifyingJobOfferOrPaystubs = true,
  relationshipType = 'married', // 'married' | 'common_law' | 'dating_unmarried'
  monthsCohabiting = 18,
  hasJointFinancialEvidence = true,
  applicantName = 'Spouse Applicant',
  principalName = 'Principal Temporary Resident',
  assessmentDate = todayIso()
} = {}) {
  const type = boundedText(sponsorType, 'international_student', 40).toLowerCase();
  const progLevel = boundedText(studentProgramLevel, 'masters', 40).toLowerCase();
  const profSpecialty = professionalDegreeSpecialty ? boundedText(professionalDegreeSpecialty, '', 100) : null;
  const teer = Math.max(0, Math.min(5, Math.floor(Number(workerNocTeer) || 0)));
  const wpMonths = Math.max(0, Math.min(120, Math.floor(Number(workerPermitDurationMonths) || 0)));
  const workerEmployed = Boolean(workerHasQualifyingJobOfferOrPaystubs);
  const relType = boundedText(relationshipType, 'married', 30).toLowerCase();
  const cohabitMonths = Math.max(0, Math.min(600, Math.floor(Number(monthsCohabiting) || 0)));
  const jointEvidence = Boolean(hasJointFinancialEvidence);

  const safeApplicant = boundedText(applicantName, 'Spouse Applicant', 120);
  const safePrincipal = boundedText(principalName, 'Principal Applicant', 120);
  const assessDate = safeIsoDate(assessmentDate, todayIso());

  const rejectionRisks = [];
  const complianceNotes = [];
  const actionChecklist = [];

  // 1. Relationship Validity Audit (IRPR s. 1 & s. 4)
  let relationshipValid = false;
  let relationshipSummary = '';

  if (relType === 'married') {
    relationshipValid = true;
    relationshipSummary = 'Legally Married (Marriage Certificate recognized in jurisdiction of celebration and in Canada).';
    actionChecklist.push('Provide certified Marriage Certificate with English translation if applicable.');
  } else if (relType === 'common_law') {
    if (cohabitMonths >= SOWP_CONSTANTS.MIN_COMMON_LAW_MONTHS) {
      relationshipValid = true;
      relationshipSummary = `Common-Law Partnership verified: ${cohabitMonths} continuous months of cohabitation (meets 12-month statutory benchmark).`;
      actionChecklist.push('Complete and notarize Form IMM 5409 (Statutory Declaration of Common-Law Union).');
    } else {
      relationshipValid = false;
      relationshipSummary = `Insufficient cohabitation: Only ${cohabitMonths} months documented (strictly requires 12 continuous months under IRPR s. 1(1)).`;
      rejectionRisks.push(`RELATIONSHIP DEFECT: Common-law partnership requires at least 12 continuous months of cohabitation. ${cohabitMonths} months is statutorily insufficient.`);
    }
  } else {
    relationshipValid = false;
    relationshipSummary = 'Unmarried / Dating: Not recognized as an eligible spousal relationship under Canadian immigration law.';
    rejectionRisks.push('CRITICAL DISQUALIFIER: Boyfriends, girlfriends, fiancés, and dating partners are not eligible for spousal work permits. Must be legally married or qualify as common-law partners.');
  }

  if (relationshipValid && !jointEvidence) {
    rejectionRisks.push('WARNING ON GENUINENESS (IRPR s. 4): Lack of joint financial evidence (joint bank accounts, shared lease, utility bills) creates high risk of Procedural Fairness Letter (PFL) questioning marriage genuineness.');
  }

  // 2. Program Level Audit (Students - Code C42) vs TEER Audit (Workers - Code C41)
  let pathwayEligible = false;
  let lmiaExemptionCode = 'NONE';

  if (type === 'international_student') {
    lmiaExemptionCode = 'C42';
    if (progLevel === 'masters') {
      pathwayEligible = true;
      complianceNotes.push("ELIGIBLE DEGREE LEVEL: Principal student is enrolled in a Master's degree program at a Designated Learning Institution (DLI). Qualifies under March 19, 2024 policy overhaul.");
    } else if (progLevel === 'doctoral') {
      pathwayEligible = true;
      complianceNotes.push("ELIGIBLE DEGREE LEVEL: Principal student is enrolled in a Doctoral (Ph.D.) program at a DLI. Qualifies under March 19, 2024 policy overhaul.");
    } else if (progLevel === 'professional_degree') {
      pathwayEligible = true;
      complianceNotes.push(`ELIGIBLE PROFESSIONAL DEGREE: Principal student is enrolled in an approved professional degree program (${profSpecialty || 'Designated Professional Degree'}).`);
    } else {
      pathwayEligible = false;
      rejectionRisks.push(`POLICY DISQUALIFIER (March 19, 2024 Rule): Spouses of international students in undergraduate bachelor's degree programs, college diploma programs, or certificate programs are STRICTLY INELIGIBLE for a Spousal Open Work Permit (C42).`);
      complianceNotes.push("Ineligible post-secondary credential level under current IRCC policy.");
    }
  } else if (type === 'foreign_worker') {
    lmiaExemptionCode = 'C41';
    if (wpMonths < SOWP_CONSTANTS.MIN_WORK_PERMIT_MONTHS) {
      pathwayEligible = false;
      rejectionRisks.push(`WORK PERMIT DURATION DEFECT: Principal worker's work permit duration (${wpMonths} months) is below the statutory 6-month minimum required for spousal eligibility.`);
    } else if (!workerEmployed) {
      pathwayEligible = false;
      rejectionRisks.push('EMPLOYMENT EVIDENCE MISSING: Principal worker must prove active employment in Canada with recent pay stubs or a formal job offer letter.');
    } else if (teer <= 3) {
      pathwayEligible = true;
      complianceNotes.push(`HIGH-SKILLED OCCUPATION (TEER ${teer}): Principal worker is employed in a high-skilled occupation (TEER 0, 1, 2, or 3). SOWP is fully authorized under Code C41.`);
    } else {
      // TEER 4 or 5
      pathwayEligible = true;
      complianceNotes.push(`INTERMEDIATE/LOW-SKILLED OCCUPATION (TEER ${teer}): Covered under Phase 2 temporary public policy expansion for families of foreign workers.`);
    }
  }

  const overallEligible = relationshipValid && pathwayEligible;

  if (overallEligible) {
    complianceNotes.push(`Eligible for an Open Work Permit under LMIA Exemption Code ${lmiaExemptionCode}. Validity will match the principal applicant’s permit expiry.`);
  }

  actionChecklist.push('Copy of Principal Applicant’s valid Study Permit or Work Permit.');
  actionChecklist.push('Letter of Enrollment / Confirmation of Degree Level from Registrar (if Student) or 3 recent Canadian pay stubs and job offer (if Worker).');
  actionChecklist.push('Joint cohabitation proof: Residential lease, joint bank statements, utility accounts, driver’s licences showing matching address.');

  return {
    applicantName: safeApplicant,
    principalName: safePrincipal,
    assessmentDate: assessDate,
    sponsorCategory: type,
    overallEligible,
    lmiaExemptionCode,
    relationshipAudit: {
      relationshipType: relType,
      isLegallyRecognized: relationshipValid,
      cohabitationMonths: cohabitMonths,
      hasJointFinancialEvidence: jointEvidence,
      summary: relationshipSummary
    },
    pathwayAudit: {
      isPathwayEligible: pathwayEligible,
      studentProgramLevel: type === 'international_student' ? progLevel : null,
      workerNocTeer: type === 'foreign_worker' ? teer : null,
      workerPermitMonths: type === 'foreign_worker' ? wpMonths : null
    },
    complianceNotes,
    rejectionRisks,
    actionChecklist
  };
}

/**
 * Generates an executive Spousal Open Work Permit (SOWP) Document & Submission Dossier.
 */
export function generateSowpApplicationChecklist({
  applicantName = 'Spouse Applicant',
  sponsorType = 'international_student',
  lmiaCode = 'C42',
  isEligible = true
} = {}) {
  const name = boundedText(applicantName, 'Spouse Applicant', 120);
  const type = boundedText(sponsorType, 'international_student', 50);
  const code = boundedText(lmiaCode, 'C42', 20);

  return [
    '================================================================================',
    'SPOUSAL OPEN WORK PERMIT (SOWP) SUBMISSION DOSSIER (IRPR s. 205(c)(ii))',
    `Applicant: ${name} | Category: ${type} | LMIA Exemption Code: ${code}`,
    '================================================================================',
    '',
    '1. ELIGIBILITY DETERMINATION:',
    isEligible
      ? `   [CONFIRMED ELIGIBLE] Profile meets modernized criteria under Exemption Code ${code}.`
      : '   [DISQUALIFIED / ACTION REQUIRED] Profile does not meet degree level or cohabitation criteria.',
    '',
    '2. MANDATORY PRIMARY DOCUMENTATION:',
    '   [ ] Copy of Principal Applicant’s valid Study Permit or Work Permit.',
    '   [ ] Marriage Certificate OR Form IMM 5409 Statutory Declaration of Common-Law Union.',
    '   [ ] Official University Letter confirming Master’s, Ph.D. or Professional Degree enrollment (if student).',
    '   [ ] Employment verification: Job offer, 3 consecutive pay stubs, T4 (if foreign worker).',
    '',
    '3. RELATIONSHIP GENUINENESS EVIDENCE (IRPR s. 4):',
    '   [ ] Joint residential lease agreement or proof of shared homeownership.',
    '   [ ] Joint Canadian bank account statements and credit card accounts.',
    '   [ ] Government IDs (driver’s licences/provincial photo cards) showing identical residential address.',
    '   [ ] Photos together spanning the duration of the relationship.',
    '================================================================================'
  ].join('\n');
}
