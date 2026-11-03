/**
 * Ontario Temporary Help Agency & Recruiter Licensing Navigator
 *
 * Audits mandatory THA and recruiter licensing, client employer liability,
 * illegal worker fee prohibitions, and joint and several wage liability
 * under the Employment Standards Act, 2000, S.O. 2000, c. 41, Part XXIV.1
 * (ss. 74.1.1–74.1.4, 74.4) and O. Reg. 99/23.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ONTARIO_THA_LICENSING_CONSTANTS = Object.freeze({
  MANDATORY_LICENSING_EFFECTIVE_DATE: '2024-07-01',
  ADMIN_PENALTY_FIRST_CONTRAVENTION_CAD: 15000, // O. Reg. 289/01 s. 4.1
  ADMIN_PENALTY_SECOND_CONTRAVENTION_CAD: 25000,
  ADMIN_PENALTY_THIRD_CONTRAVENTION_CAD: 50000,
  IRREVOCABLE_LETTER_OF_CREDIT_AMOUNT_CAD: 25000, // Security bond required for THA licence
  STATUTORY_AUTHORITY: 'Employment Standards Act, 2000, Part XXIV.1 ss. 74.1.1-74.1.4'
});

/**
 * Audits temporary help agency licensing status, client business liability, and assignment worker protections.
 *
 * @param {Object} params
 * @param {string} [params.entityRole='CLIENT_EMPLOYER'] - Role: 'CLIENT_EMPLOYER', 'ASSIGNMENT_WORKER', 'THA_OPERATOR'
 * @param {boolean} [params.isAgencyLicensedByMlitst=false] - Agency holds active licence from Director of Employment Standards
 * @param {boolean} [params.hasApplicationInProcessWithTransitionStatus=false] - Applied before statutory deadline and operating under transition rules
 * @param {boolean} [params.didAgencyChargeFeesToWorker=false] - Agency charged worker fees for placement, job search, or resume
 * @param {number} [params.feeAmountChargedToWorkerCad=0] - Total illegal fees charged to assignment worker
 * @param {boolean} [params.hasUnpaidWagesOrOvertime=false] - Worker has unpaid regular wages, overtime, or public holiday pay
 * @param {number} [params.unpaidWagesAmountCad=0] - Dollar amount of unpaid wages owed
 * @param {number} [params.priorContraventionsInPast3Years=0] - Count of prior licensing infractions in past 36 months
 * @param {string} [params.workerName='Worker']
 * @param {string} [params.agencyName='Agency']
 * @param {string} [params.clientName='Client Employer']
 * @param {string} [params.assessmentDate=todayIso()]
 * @returns {Object} Licensing compliance audit, joint liability analysis, and actionable remedies
 */
export function auditOntarioThaLicensing({
  entityRole = 'CLIENT_EMPLOYER',
  isAgencyLicensedByMlitst = false,
  hasApplicationInProcessWithTransitionStatus = false,
  didAgencyChargeFeesToWorker = false,
  feeAmountChargedToWorkerCad = 0,
  hasUnpaidWagesOrOvertime = false,
  unpaidWagesAmountCad = 0,
  priorContraventionsInPast3Years = 0,
  workerName = 'Worker',
  agencyName = 'Agency',
  clientName = 'Client Employer',
  assessmentDate = todayIso()
} = {}) {
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const cleanRole = boundedText(entityRole, 'CLIENT_EMPLOYER', 50);
  const cleanWorker = boundedText(workerName, 'Worker', 100);
  const cleanAgency = boundedText(agencyName, 'Agency', 120);
  const cleanClient = boundedText(clientName, 'Client Employer', 120);
  const isLicensed = Boolean(isAgencyLicensedByMlitst);
  const hasTransition = Boolean(hasApplicationInProcessWithTransitionStatus);
  const feesCharged = Boolean(didAgencyChargeFeesToWorker);
  const unpaidWagesFlag = Boolean(hasUnpaidWagesOrOvertime);

  const illegalFees = Math.max(0, Math.min(10000000, Number(feeAmountChargedToWorkerCad) || 0));
  const unpaidWages = Math.max(0, Math.min(10000000, Number(unpaidWagesAmountCad) || 0));
  const priorInfractions = Math.max(0, Math.min(1000, Math.floor(Number(priorContraventionsInPast3Years) || 0)));

  const isLicensingLawful = isLicensed || hasTransition;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Mandatory Licensing Audit (s. 74.1.1, 74.1.3)
  if (!isLicensingLawful) {
    if (cleanRole === 'CLIENT_EMPLOYER') {
      statutoryViolations.push({
        rule: 'CLIENT_ENGAGING_UNLICENSED_THA',
        statute: 'Employment Standards Act, 2000, s. 74.1.3(1)',
        finding: 'Client business is knowingly using or engaging the services of an unlicensed temporary help agency or recruiter.'
      });
      actionableRemedies.push({
        action: 'TERMINATE_OR_VERIFY_THA_CONTRACT',
        remedyDescription: 'Immediately verify THA status on the Ministry Public Registry of Licensed Agencies. Cease assigning workers through unlicensed entities.'
      });
    } else if (cleanRole === 'THA_OPERATOR') {
      statutoryViolations.push({
        rule: 'OPERATING_UNLICENSED_THA_OR_RECRUITER',
        statute: 'Employment Standards Act, 2000, s. 74.1.1(1)',
        finding: 'Operating as a temporary help agency or recruiter in Ontario without a valid licence issued by the Director of Employment Standards.'
      });
      actionableRemedies.push({
        action: 'SUBMIT_DIRECTOR_LICENCE_APPLICATION',
        remedyDescription: 'Submit application for THA licence including $25,000 letter of credit and tax compliance clearance.'
      });
    } else {
      statutoryViolations.push({
        rule: 'ASSIGNED_BY_UNLICENSED_THA',
        statute: 'Employment Standards Act, 2000, s. 74.1.1',
        finding: 'Worker has been assigned by an entity operating unlawfully without a Ministry THA licence.'
      });
    }
  }

  // 2. Worker Fee Prohibition Audit (s. 74.4)
  if (feesCharged || illegalFees > 0) {
    statutoryViolations.push({
      rule: 'ILLEGAL_FEE_CHARGED_TO_ASSIGNMENT_WORKER',
      statute: 'Employment Standards Act, 2000, s. 74.4',
      finding: `Temporary help agency unlawfully charged $${illegalFees} in recruitment, placement, or assignment fees to the worker.`
    });
    actionableRemedies.push({
      action: 'FILE_ESA_CLAIM_FEE_REPAYMENT',
      remedyDescription: 'File an Employment Standards claim to recover illegal recruitment fees under ESA s. 74.4; Director may order full refund plus interest.'
    });
  }

  // 3. Joint and Several Liability for Wages (Part VII.2)
  if (unpaidWagesFlag || unpaidWages > 0) {
    statutoryViolations.push({
      rule: 'UNPAID_ASSIGNMENT_WAGES_JOINT_LIABILITY',
      statute: 'Employment Standards Act, 2000, Part VII.2 & s. 74.18',
      finding: `Worker is owed $${unpaidWages} in unpaid wages/overtime. Client business and THA are jointly and severally liable for full payment.`
    });
    actionableRemedies.push({
      action: 'ENFORCE_JOINT_LIABILITY_AGAINST_CLIENT',
      remedyDescription: 'Issue demand for unpaid wages jointly to both the client business and the THA under ESA s. 74.18.'
    });
  }

  // 4. Administrative Monetary Penalty Calculation
  let estimatedAdminPenaltyCad = 0;
  if (!isLicensingLawful) {
    if (priorInfractions === 0) {
      estimatedAdminPenaltyCad = ONTARIO_THA_LICENSING_CONSTANTS.ADMIN_PENALTY_FIRST_CONTRAVENTION_CAD;
    } else if (priorInfractions === 1) {
      estimatedAdminPenaltyCad = ONTARIO_THA_LICENSING_CONSTANTS.ADMIN_PENALTY_SECOND_CONTRAVENTION_CAD;
    } else {
      estimatedAdminPenaltyCad = ONTARIO_THA_LICENSING_CONSTANTS.ADMIN_PENALTY_THIRD_CONTRAVENTION_CAD;
    }
  }

  if (hasApplicationInProcessWithTransitionStatus && !isAgencyLicensedByMlitst) {
    riskWarnings.push({
      warningType: 'TRANSITIONAL_STATUS_PENDING',
      description: 'Agency is operating under transitional status having applied before statutory cutoff. Final licence approval remains subject to Director review.'
    });
  }

  let complianceStatus = 'COMPLIANT_LICENSED_OPERATION';
  let legalVerdict = 'Temporary help agency and client business operations comply with Ontario ESA Part XXIV.1 licensing and fee prohibitions.';

  if (statutoryViolations.length > 0) {
    complianceStatus = 'UNLAWFUL_NON_COMPLIANT_THA_OPERATION';
    legalVerdict = `Breach of Ontario ESA temporary help agency provisions detected (${statutoryViolations.length} infraction${statutoryViolations.length === 1 ? '' : 's'}). Administrative monetary penalties up to $${estimatedAdminPenaltyCad} apply.`;
  }

  return {
    assessmentDate: safeAssessmentDate,
    jurisdiction: 'ONTARIO_CANADA',
    entityRole: cleanRole,
    workerName: cleanWorker,
    agencyName: cleanAgency,
    clientName: cleanClient,
    isLicensingLawful,
    isAgencyLicensedByMlitst: isLicensed,
    hasApplicationInProcessWithTransitionStatus: hasTransition,
    complianceStatus,
    legalVerdict,
    penaltyAudit: {
      priorInfractionsCount: priorInfractions,
      estimatedAdminPenaltyCad,
      isJointAndSeveralWageLiabilityApplicable: unpaidWagesFlag || unpaidWages > 0,
      unpaidWagesOwedCad: unpaidWages,
      illegalFeesCollectedCad: illegalFees
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Employment Standards Act, 2000, S.O. 2000, c. 41, Part XXIV.1 ss. 74.1.1-74.1.4, 74.4, 74.18',
      'O. Reg. 99/23 (Licensing - Temporary Help Agencies and Recruiters)',
      'O. Reg. 289/01 (Penalties and Reciprocal Enforcement)'
    ]
  };
}
