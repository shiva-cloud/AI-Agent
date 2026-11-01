/**
 * @file bowp-navigator.js
 * @description Bridging Open Work Permit (BOWP) & Maintained Status Diagnostic Engine.
 * 
 * Statutory & Regulatory Authority:
 * - Immigration and Refugee Protection Act (IRPA, SC 2001, c. 27), ss. 20, 22, 30
 * - Immigration and Refugee Protection Regulations (IRPR, SOR/2002-227):
 *   - s. 183(5) & s. 186(u): Maintained Status (implied status) work authorization continuation
 *   - s. 205(a): Exemption Code A75 (Bridging Open Work Permit for economic class PR applicants)
 *   - s. 204(c): Exemption Code T13 (Employer-specific work permit for PNP with employment restrictions)
 *   - s. 205(c)(ii): Exemption Codes C41 / C42 (Spousal Open Work Permit for high-skilled/low-skilled spouses)
 * - IRCC Operational Instructions: Temporary Resident - Bridging open work permits for economic PR applicants
 * 
 * Features:
 * - Diagnoses BOWP eligibility across Express Entry (CEC, FSW, FST), PNP (Enhanced & Base), AIP, RNIP, and QSWP
 * - Audits the critical Provincial Nomination "Employment Restrictions" clause (bans open BOWP if restrictions exist)
 * - Detects premature submissions (applying before receiving official IRCC AOR causes automatic refusal)
 * - Evaluates Maintained Status (IRPR s. 186(u)) and warns against international travel forfeiture
 * - Evaluates Spousal Open Work Permit (SOWP) extension eligibility under Codes C41 / C42
 * - Generates step-by-step application instructions, required IMM 5710 forms, and fee breakdown ($255 CAD)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const BOWP_CONSTANTS = Object.freeze({
  STATUTES: {
    BOWP_AUTHORITY: 'Immigration and Refugee Protection Regulations (SOR/2002-227), s. 205(a) (Code A75)',
    MAINTAINED_STATUS: 'Immigration and Refugee Protection Regulations (SOR/2002-227), ss. 183(5) & s. 186(u)',
    PNP_EMPLOYER_SPECIFIC: 'Immigration and Refugee Protection Regulations (SOR/2002-227), s. 204(c) (Code T13)',
    SOWP_AUTHORITY: 'Immigration and Refugee Protection Regulations (SOR/2002-227), s. 205(c)(ii) (Codes C41/C42)'
  },
  FEES_CAD: Object.freeze({
    WORK_PERMIT_PROCESSING_FEE: 155,
    OPEN_WORK_PERMIT_HOLDER_FEE: 100,
    TOTAL_BOWP_FEE: 255
  }),
  ELIGIBLE_PR_PROGRAMS: Object.freeze([
    'express_entry_cec',
    'express_entry_fswp',
    'express_entry_fstp',
    'express_entry_pnp',
    'non_express_entry_pnp',
    'agri_food_pilot',
    'quebec_skilled_worker'
  ]),
  ELIGIBLE_CURRENT_PERMIT_TYPES: Object.freeze([
    'pgwp',
    'closed_work_permit',
    'spousal_open_work_permit',
    'working_holiday_iec',
    'vulnerable_worker_open_permit'
  ])
});

/**
 * Calculates days between today and the target date string (YYYY-MM-DD).
 * 
 * @param {string} targetDateStr
 * @param {Date} [now=new Date()]
 * @returns {number} Days remaining (positive) or days expired (negative)
 */
export function calculateDaysToExpiry(targetDateStr, now = new Date()) {
  if (!targetDateStr) return 0;
  const target = new Date(String(targetDateStr).includes('T') ? targetDateStr : `${targetDateStr}T00:00:00Z`);
  if (isNaN(target.getTime())) return 0;
  const validNow = now instanceof Date && !isNaN(now.getTime()) ? now : new Date();
  const today = new Date(Date.UTC(validNow.getFullYear(), validNow.getMonth(), validNow.getDate()));
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates Spousal Open Work Permit (SOWP) Extension Eligibility under Codes C41/C42.
 * 
 * @param {Object} input
 * @param {boolean} input.hasSpouse
 * @param {string} input.principalTeerLevel - 'teer_0'|'teer_1'|'teer_2'|'teer_3'|'teer_4'|'teer_5'
 * @param {boolean} input.principalHasPayStubs - Whether principal applicant has 3+ Canadian pay stubs
 * @param {number} input.principalPermitRemainingMonths - Validity left on principal permit or BOWP duration (min 6 mos)
 * @returns {Object} Spousal SOWP evaluation
 */
export function evaluateSpousalSowp(input = {}) {
  const hasSpouse = Boolean(input.hasSpouse);
  if (!hasSpouse) {
    return {
      isApplicable: false,
      eligible: false,
      exemptionCode: null,
      meetsHighSkilledCriteria: false,
      meetsPayStubsRequirement: false,
      meetsDurationRequirement: false,
      advisory: 'No spouse or common-law partner declared.'
    };
  }

  const teer = input.principalTeerLevel || 'teer_1';
  const hasPayStubs = Boolean(input.principalHasPayStubs);
  const remainingMonths = Number.isFinite(Number(input.principalPermitRemainingMonths)) ? Math.max(0, Math.floor(Number(input.principalPermitRemainingMonths))) : 12;

  const isHighSkilled = ['teer_0', 'teer_1', 'teer_2', 'teer_3'].includes(teer);
  const meetsValidity = remainingMonths >= 6;

  const eligible = isHighSkilled && hasPayStubs && meetsValidity;
  const exemptionCode = isHighSkilled ? 'C41' : 'C42';

  let advisory = '';
  if (eligible) {
    advisory = `Spouse is eligible for a concurrent Spousal Open Work Permit under Exemption Code ${exemptionCode}. Principal applicant holds a high-skilled NOC (TEER ${teer.replace('teer_', '')}) with 6+ months validity and valid Canadian pay stubs.`;
  } else if (!isHighSkilled) {
    advisory = `Spouse is currently ineligible: Principal applicant's occupation (TEER ${teer.replace('teer_', '')}) falls under low-skilled categories without a qualifying provincial pilot exemption.`;
  } else if (!hasPayStubs) {
    advisory = 'Spouse is at risk: IRCC operational guidelines require proof of current employment (minimum 3 recent consecutive Canadian pay stubs) to approve an accompanying spouse open work permit.';
  } else {
    advisory = 'Spouse is ineligible: Principal applicant must have at least 6 months of authorized work validity remaining.';
  }

  return {
    isApplicable: true,
    eligible,
    exemptionCode,
    meetsHighSkilledCriteria: isHighSkilled,
    meetsPayStubsRequirement: hasPayStubs,
    meetsDurationRequirement: meetsValidity,
    advisory
  };
}

/**
 * Diagnoses Bridging Open Work Permit (BOWP) and Maintained Status Eligibility.
 * 
 * @param {Object} input
 * @param {string} input.currentPermitType - 'pgwp'|'closed_work_permit'|'spousal_open_work_permit'|'working_holiday_iec'|'visitor'|'study_permit'
 * @param {string} input.permitExpiryDate - 'YYYY-MM-DD'
 * @param {boolean} input.isPhysicallyInCanada - Physical presence in Canada at time of application
 * @param {string} input.prProgramApplied - 'express_entry_cec'|'express_entry_fswp'|'express_entry_fstp'|'express_entry_pnp'|'non_express_entry_pnp'|'agri_food_pilot'|'quebec_skilled_worker'|'none'
 * @param {boolean} input.hasOfficialAor - Official IRCC Acknowledgement of Receipt (e-AOR or formal letter)
 * @param {boolean} [input.pnpNominationHasEmployerRestrictions=false] - Whether PNP certificate states "Employment Restrictions: YES"
 * @param {string} [input.pnpProvince='BC'] - Nominating province
 * @param {boolean} [input.hasSpouse=false] - Spousal evaluation
 * @param {string} [input.principalTeerLevel='teer_1'] - NOC TEER
 * @param {boolean} [input.principalHasPayStubs=true] - 3+ Canadian pay stubs
 * @param {Date} [referenceDate=new Date()]
 * @returns {Object} Comprehensive BOWP and maintained status diagnostic result
 */
export function evaluateBowpPathway(input = {}, referenceDate = new Date()) {
  const safeApplicantName = boundedText(input.applicantName || input.candidateName, 'Applicant', 120);
  const refDate = referenceDate instanceof Date && !Number.isNaN(referenceDate.getTime()) ? referenceDate : new Date();
  const safeAssessmentDate = safeIsoDate(input.assessmentDate, refDate.toISOString().slice(0, 10));
  const permitType = boundedText(input.currentPermitType, 'pgwp', 50);
  const expiryDate = safeIsoDate(input.permitExpiryDate, '2026-12-31');
  const isInsideCanada = Boolean(input.isPhysicallyInCanada);
  const prProgram = boundedText(input.prProgramApplied, 'express_entry_cec', 50);
  const hasAor = Boolean(input.hasOfficialAor);
  const pnpRestricted = Boolean(input.pnpNominationHasEmployerRestrictions);
  const province = boundedText(input.pnpProvince, 'BC', 10).toUpperCase();

  const daysToExpiry = calculateDaysToExpiry(expiryDate, refDate);
  const isExpired = daysToExpiry < 0;

  // 1. Program Validity Checks
  
  const isEligiblePermitType = BOWP_CONSTANTS.ELIGIBLE_CURRENT_PERMIT_TYPES.includes(permitType);

  // 2. Critical Flaw Audits
  const statutoryBlockers = [];
  const statutoryWarnings = [];

  // Physical Presence Rule
  if (!isInsideCanada) {
    statutoryBlockers.push({
      code: 'OUTSIDE_CANADA_INELIGIBLE',
      statute: 'IRPR s. 205(a) & IRCC Operational Guidelines',
      message: 'BOWP requires physical inland presence in Canada at the moment of electronic submission. Overseas applicants are statutorily ineligible.'
    });
  }

  // AOR Prerequisite Rule
  if (!hasAor) {
    statutoryBlockers.push({
      code: 'PREMATURE_SUBMISSION_NO_AOR',
      statute: 'IRPR s. 205(a) Completeness Check',
      message: 'Submitting a BOWP before receiving the official IRCC Acknowledgement of Receipt (e-AOR) results in mandatory administrative refusal. You must wait for the e-AOR PDF letter in your IRCC portal.'
    });
  }

  // Current Permit Validity / Maintained Status
  if (isExpired) {
    statutoryBlockers.push({
      code: 'STATUS_EXPIRED',
      statute: 'IRPA s. 47 & IRPR s. 182',
      message: `Your work permit expired ${Math.abs(daysToExpiry)} days ago. You cannot apply for a BOWP without restoring your temporary resident status within the 90-day restoration window.`
    });
  } else if (!isEligiblePermitType) {
    statutoryBlockers.push({
      code: 'INELIGIBLE_PERMIT_CLASS',
      statute: 'IRPR s. 205(a)',
      message: `Holders of a ${permitType.replace(/_/g, ' ')} cannot bridge directly to a BOWP without first holding a valid work permit.`
    });
  }

  // PNP Employment Restrictions Trap (Crucial edge case)
  const isPnp = prProgram.includes('pnp');
  let alternativePermitRecommendation = null;

  if (isPnp && pnpRestricted) {
    statutoryBlockers.push({
      code: 'PNP_EMPLOYER_RESTRICTION_BANS_BOWP',
      statute: 'IRPR s. 205(a) vs s. 204(c) (Code T13)',
      message: 'Your provincial nomination certificate states "Employment Restrictions: YES". You are statutorily BARRED from an open BOWP (Code A75). Applying for a BOWP will result in automatic refusal and loss of status.'
    });
    alternativePermitRecommendation = {
      recommendedPermit: 'EMPLOYER_SPECIFIC_WORK_PERMIT',
      exemptionCode: 'T13',
      statutoryAuthority: 'IRPR s. 204(c)',
      advisory: `You must apply for an employer-specific work permit supported by your province under Exemption Code T13 (LMIA-exempt), attaching your provincial nomination letter with employer support.`
    };
  }

  // 3. Maintained Status Assessment
  const eligibleForBowp = statutoryBlockers.length === 0;
  const maintainedStatusActive = eligibleForBowp || (daysToExpiry >= 0 && isInsideCanada);

  const maintainedStatusAdvisory = {
    hasMaintainedStatusRight: maintainedStatusActive,
    statutoryAuthority: 'IRPR s. 183(5) & s. 186(u)',
    conditionsPreserved: `Under IRPR s. 186(u), you may continue working under the exact conditions of your existing permit (${permitType.toUpperCase()}) until IRCC renders a final decision on your BOWP application.`,
    travelAdvisory: 'CRITICAL WARNING: If you travel outside Canada while on maintained status, your work authorization under IRPR s. 186(u) expires immediately. Upon re-entry, you will be admitted only as a visitor and cannot work until the physical BOWP is approved.'
  };

  // 4. Filing Window Diagnostics
  let filingWindowStatus = 'OPTIMAL_WINDOW';
  if (daysToExpiry > 120) {
    filingWindowStatus = 'EARLY_SUBMISSION_ACCEPTABLE';
    statutoryWarnings.push('Your permit has more than 4 months of validity remaining. While legally permissible with an AOR, standard IRCC guidance recommends applying within 3 to 4 months of expiry.');
  } else if (daysToExpiry <= 14 && daysToExpiry >= 0) {
    filingWindowStatus = 'URGENT_DEADLINE_APPROACHING';
    statutoryWarnings.push(`Only ${daysToExpiry} days remain before your permit expires. Apply immediately to lock in maintained status under IRPR s. 186(u) before 23:59 UTC on your expiry date.`);
  }

  // 5. Spousal Evaluation
  const spousalAssessment = evaluateSpousalSowp({
    hasSpouse: input.hasSpouse,
    principalTeerLevel: input.principalTeerLevel,
    principalHasPayStubs: input.principalHasPayStubs,
    principalPermitRemainingMonths: eligibleForBowp ? 12 : Math.max(0, Math.floor(daysToExpiry / 30))
  });

  // 6. Verdict and Resolution
  let resolutionVerdict = 'INELIGIBLE_FOR_BOWP';
  if (eligibleForBowp) {
    resolutionVerdict = 'ELIGIBLE_FOR_BOWP';
  } else if (isPnp && pnpRestricted) {
    resolutionVerdict = 'RESTRICTED_PNP_REQUIRES_CODE_T13';
  } else if (!hasAor) {
    resolutionVerdict = 'AWAITING_OFFICIAL_AOR';
  } else if (isExpired) {
    resolutionVerdict = 'REQUIRES_RESTORATION_OF_STATUS';
  }

  // 7. Action Checklist & Form Guidance
  const applicationChecklist = [
    'Obtain e-AOR (Electronic Acknowledgement of Receipt) confirmation PDF from your IRCC PR application.',
    'Log into your IRCC Secure Account and choose "Apply to come to Canada" -> "Worker".',
    'Select "An open work permit" and state you are bridging under Labor Market Exemption Code A75.',
    'Complete Form IMM 5710 (Application to Change Conditions, Extend My Stay or Remain in Canada as a Worker).',
    'Upload your passport biographical pages, current work permit copy, e-AOR letter, and provincial nomination certificate (if applicable).',
    `Pay mandatory government fee of $${BOWP_CONSTANTS.FEES_CAD.TOTAL_BOWP_FEE} CAD ($${BOWP_CONSTANTS.FEES_CAD.WORK_PERMIT_PROCESSING_FEE} processing fee + $${BOWP_CONSTANTS.FEES_CAD.OPEN_WORK_PERMIT_HOLDER_FEE} open permit holder fee).`,
    'Save and download your Submission Confirmation letter immediately as proof of maintained status for your Canadian employer.'
  ];

  return {
    asOf: safeAssessmentDate,
    assessmentDate: safeAssessmentDate,
    applicantName: safeApplicantName,
    resolutionVerdict,
    isEligibleForBowp: eligibleForBowp,
    currentPermitType: permitType,
    daysUntilExpiry: daysToExpiry,
    isExpired,
    filingWindowStatus,
    exemptionCode: eligibleForBowp ? 'A75' : alternativePermitRecommendation?.exemptionCode || null,
    totalFeeCad: BOWP_CONSTANTS.FEES_CAD.TOTAL_BOWP_FEE,
    feeBreakdown: BOWP_CONSTANTS.FEES_CAD,
    prProgramApplied: prProgram,
    hasOfficialAor: hasAor,
    pnpProvince: isPnp ? province : null,
    pnpNominationHasEmployerRestrictions: pnpRestricted,
    alternativePermitRecommendation,
    maintainedStatus: maintainedStatusAdvisory,
    spousalOpenWorkPermit: spousalAssessment,
    statutoryBlockers,
    statutoryWarnings,
    applicationChecklist,
    statutoryAdvisories: [
      'Under IRPR s. 186(u), your right to work continues seamlessly past your permit expiry date as long as your BOWP is submitted before midnight UTC on the expiry date.',
      'Leaving Canada while on maintained status permanently cancels your authorization to work upon return until the paper permit arrives in the mail.',
      'If your PR application is refused while your BOWP is pending, your BOWP application will also be refused and maintained status terminates immediately.'
    ]
  };
}
