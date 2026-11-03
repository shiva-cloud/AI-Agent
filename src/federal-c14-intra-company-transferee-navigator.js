/**
 * Federal Intra-Company Transferee (ICT) C12/C14 Exemption Navigator
 *
 * Evaluates LMIA-exempt work permit eligibility for Intra-Company Transferees
 * under Canada's Immigration and Refugee Protection Regulations (IRPR),
 * s. 205(a), LMIA Exemption Codes C12 (GATS/FTA) & C14 (General ICT).
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const FEDERAL_ICT_CONSTANTS = Object.freeze({
  MIN_CONTINUOUS_FOREIGN_EMPLOYMENT_MONTHS: 12, // 1 continuous year in preceding 3 years
  LOOKBACK_WINDOW_YEARS: 3,
  MAX_CUMULATIVE_DURATION_EXECUTIVE_MANAGER_YEARS: 7, // 7-year statutory cap
  MAX_CUMULATIVE_DURATION_SPECIALIZED_KNOWLEDGE_YEARS: 5, // 5-year statutory cap
  INITIAL_DURATION_ESTABLISHED_BUSINESS_YEARS: 3,
  INITIAL_DURATION_START_UP_NEW_OFFICE_YEARS: 1,
  EMPLOYER_COMPLIANCE_FEE_CAD: 230,
  WORK_PERMIT_PROCESSING_FEE_CAD: 155,
  STATUTORY_AUTHORITY: 'IRPR s. 205(a), Exemption Codes C12 & C14'
});

/**
 * Audits intra-company transferee eligibility, corporate relationships, role specialization, and caps.
 *
 * @param {Object} params
 * @param {string} [params.qualifyingCorporateRelationship='SUBSIDIARY'] - Relationship: 'PARENT', 'SUBSIDIARY', 'BRANCH', 'AFFILIATE', 'UNRELATED'
 * @param {string} [params.transfereeRole='EXECUTIVE_OR_SENIOR_MANAGER'] - Role: 'EXECUTIVE_OR_SENIOR_MANAGER', 'SPECIALIZED_KNOWLEDGE', 'GENERAL_WORKER'
 * @param {number} [params.continuousForeignEmploymentMonths=24] - Full months of continuous full-time employment with foreign entity in past 3 yrs
 * @param {boolean} [params.isNewOfficeStartUp=false] - Whether Canadian enterprise is a new office (<1 yr operations)
 * @param {boolean} [params.hasSecuredPhysicalPremises=true] - Physical location leased/acquired in Canada (critical for start-ups)
 * @param {number} [params.accumulatedYearsOnIctPermitInCanada=0] - Years already spent in Canada on an ICT work permit
 * @param {boolean} [params.employerComplianceFeePaid=true] - $230 fee paid via Employer Portal with offer of employment submitted
 * @param {boolean} [params.meetsProprietarySpecializedKnowledgeStandard=true] - Advanced level of expertise and proprietary knowledge of company's product/service
 * @returns {Object} Comprehensive ICT eligibility and statutory cap evaluation
 */
export function evaluateFederalIntraCompanyTransferee(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    transfereeName = 'Transferee',
    employerName = 'Employer',
    assessmentDate = todayIso(),
    qualifyingCorporateRelationship = 'SUBSIDIARY',
    transfereeRole = 'EXECUTIVE_OR_SENIOR_MANAGER',
    continuousForeignEmploymentMonths = 24,
    isNewOfficeStartUp = false,
    hasSecuredPhysicalPremises = true,
    accumulatedYearsOnIctPermitInCanada = 0,
    employerComplianceFeePaid = true,
    meetsProprietarySpecializedKnowledgeStandard = true
  } = safeParams;
  const cleanTransfereeName = boundedText(transfereeName, 'Transferee', 100);
  const cleanEmployerName = boundedText(employerName, 'Employer', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const cleanRole = boundedText(transfereeRole, 'EXECUTIVE_OR_SENIOR_MANAGER', 40).toUpperCase();
  const cleanRelationship = boundedText(qualifyingCorporateRelationship, 'SUBSIDIARY', 40).toUpperCase();
  const foreignExpMonths = Math.max(0, Math.min(360, Number.isFinite(Number(continuousForeignEmploymentMonths)) ? Number(continuousForeignEmploymentMonths) : 0));
  const yearsSpent = Math.max(0, Math.min(50, Number.isFinite(Number(accumulatedYearsOnIctPermitInCanada)) ? Number(accumulatedYearsOnIctPermitInCanada) : 0));

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Corporate Relationship Audit (Parent, Subsidiary, Affiliate, Branch)
  const isEligibleCorporateLink = ['PARENT', 'SUBSIDIARY', 'BRANCH', 'AFFILIATE'].includes(cleanRelationship);
  if (!isEligibleCorporateLink) {
    statutoryViolations.push({
      rule: 'NO_QUALIFYING_CORPORATE_RELATIONSHIP',
      statute: 'IRPR s. 205(a) - ICT Guidelines',
      finding: `Corporate relationship "${cleanRelationship}" does not constitute an eligible parent, subsidiary, branch, or affiliate relationship.`
    });
    actionableRemedies.push({
      action: 'ESTABLISH_CORPORATE_AFFILIATION_OR_LMIA',
      remedyDescription: 'Demonstrate common ownership and control (50%+ voting shares or 50/50 joint venture) or apply through standard LMIA stream.'
    });
  }

  // 2. Foreign Employment Duration Audit (12 continuous months in past 3 years)
  if (foreignExpMonths < FEDERAL_ICT_CONSTANTS.MIN_CONTINUOUS_FOREIGN_EMPLOYMENT_MONTHS) {
    const deficit = FEDERAL_ICT_CONSTANTS.MIN_CONTINUOUS_FOREIGN_EMPLOYMENT_MONTHS - foreignExpMonths;
    statutoryViolations.push({
      rule: 'INSUFFICIENT_CONTINUOUS_FOREIGN_EMPLOYMENT',
      statute: 'IRPR s. 205(a)',
      finding: `Candidate has ${foreignExpMonths} continuous months of employment with foreign enterprise. Minimum 12 continuous full-time months required.`
    });
    actionableRemedies.push({
      action: 'COMPLETE_12_MONTHS_FOREIGN_EMPLOYMENT',
      remedyDescription: `Remain employed with the foreign enterprise for ${deficit} additional month${deficit === 1 ? '' : 's'} prior to submitting work permit application.`
    });
  }

  // 3. Role Eligibility Audit
  const isExecutiveOrManager = cleanRole === 'EXECUTIVE_OR_SENIOR_MANAGER';
  const isSpecializedKnowledge = cleanRole === 'SPECIALIZED_KNOWLEDGE';

  if (!isExecutiveOrManager && !isSpecializedKnowledge) {
    statutoryViolations.push({
      rule: 'INELIGIBLE_ICT_POSITION',
      statute: 'IRPR s. 205(a)',
      finding: `Role "${cleanRole}" is not recognized under the ICT LMIA exemption. Only executive/senior managerial or specialized knowledge personnel qualify.`
    });
    actionableRemedies.push({
      action: 'PURSUE_LMIA_OR_OTHER_EXEMPTIONS',
      remedyDescription: 'Employer must apply for an ESDC Labour Market Impact Assessment (LMIA) or assess other International Mobility Program streams.'
    });
  }

  if (isSpecializedKnowledge && !meetsProprietarySpecializedKnowledgeStandard) {
    statutoryViolations.push({
      rule: 'SPECIALIZED_KNOWLEDGE_THRESHOLD_NOT_MET',
      statute: 'IRPR s. 205(a) - Operational Instructions',
      finding: 'Applicant does not demonstrate an advanced level of expertise combined with proprietary company knowledge uncommon in the Canadian labour market.'
    });
    actionableRemedies.push({
      action: 'PROVIDE_PROPRIETARY_KNOWLEDGE_DOCUMENTATION',
      remedyDescription: 'Provide detailed evidence of proprietary patents, company-specific technologies, internal training records, and non-disclosure agreements.'
    });
  }

  // 4. Start-Up / New Office Requirements
  if (isNewOfficeStartUp && !hasSecuredPhysicalPremises) {
    statutoryViolations.push({
      rule: 'NO_PHYSICAL_PREMISES_SECURED_STARTUP',
      statute: 'IRPR s. 205(a) - New Office Guidelines',
      finding: 'New office start-ups in Canada must provide proof that physical commercial premises have been leased or acquired.'
    });
    actionableRemedies.push({
      action: 'EXECUTE_COMMERCIAL_LEASE',
      remedyDescription: 'Secure and execute a commercial lease agreement for Canadian business operations prior to filing.'
    });
  }

  // 5. Statutory Cumulative Duration Caps
  const maxCapYears = isExecutiveOrManager
    ? FEDERAL_ICT_CONSTANTS.MAX_CUMULATIVE_DURATION_EXECUTIVE_MANAGER_YEARS
    : FEDERAL_ICT_CONSTANTS.MAX_CUMULATIVE_DURATION_SPECIALIZED_KNOWLEDGE_YEARS;

  const hasExceededStatutoryCap = yearsSpent >= maxCapYears;
  if (hasExceededStatutoryCap) {
    statutoryViolations.push({
      rule: 'STATUTORY_ICT_CUMULATIVE_CAP_REACHED',
      statute: 'IRPR s. 205(a) - Duration Limits',
      finding: `Applicant has reached the statutory cap of ${maxCapYears} years for ${isExecutiveOrManager ? 'executives/managers' : 'specialized knowledge workers'} on ICT permits in Canada.`
    });
    actionableRemedies.push({
      action: 'TRANSITION_TO_PERMANENT_RESIDENCE_OR_RESET_CAP',
      remedyDescription: 'Transition to Permanent Residence (Express Entry / CEC) or complete 1 continuous full year of employment outside Canada to reset ICT cap clock.'
    });
  }

  // 6. Employer Compliance Fee
  if (!employerComplianceFeePaid) {
    statutoryViolations.push({
      rule: 'EMPLOYER_COMPLIANCE_FEE_UNPAID',
      statute: 'IRPR ss. 209.11, 303.1',
      finding: 'The $230 employer compliance fee has not been paid through the IRCC Employer Portal.'
    });
    actionableRemedies.push({
      action: 'SUBMIT_PORTAL_OFFER_AND_PAY_FEE',
      remedyDescription: 'Submit offer of employment in IRCC Employer Portal and remit $230 compliance fee to generate valid ' + 'offer letter.'
    });
  }

  // Max authorized initial duration
  const allowableInitialDurationYears = isNewOfficeStartUp
    ? FEDERAL_ICT_CONSTANTS.INITIAL_DURATION_START_UP_NEW_OFFICE_YEARS
    : FEDERAL_ICT_CONSTANTS.INITIAL_DURATION_ESTABLISHED_BUSINESS_YEARS;

  let eligibilityVerdict = 'ELIGIBLE_FOR_ICT_WORK_PERMIT';
  let isEligible = true;

  if (statutoryViolations.length > 0) {
    isEligible = false;
    if (!isEligibleCorporateLink) {
      eligibilityVerdict = 'INELIGIBLE_NO_CORPORATE_LINK';
    } else if (foreignExpMonths < FEDERAL_ICT_CONSTANTS.MIN_CONTINUOUS_FOREIGN_EMPLOYMENT_MONTHS) {
      eligibilityVerdict = 'INELIGIBLE_INSUFFICIENT_FOREIGN_EMPLOYMENT';
    } else if (hasExceededStatutoryCap) {
      eligibilityVerdict = 'INELIGIBLE_STATUTORY_CAP_REACHED';
    } else {
      eligibilityVerdict = 'INELIGIBLE_STATUTORY_REQUIREMENTS_NOT_MET';
    }
  }

  return {
    transfereeName: cleanTransfereeName,
    employerName: cleanEmployerName,
    assessmentDate: cleanAssessmentDate,
    jurisdiction: 'FEDERAL_CANADA',
    lmiaExemptionCode: 'C14_GENERAL_ICT',
    transfereeRole: cleanRole,
    qualifyingCorporateRelationship: cleanRelationship,
    isNewOfficeStartUp,
    isEligible,
    eligibilityVerdict,
    durationAssessment: {
      initialAuthorizedDurationYears: isEligible ? allowableInitialDurationYears : 0,
      cumulativeStatutoryCapYears: maxCapYears,
      yearsRemainingUnderCap: Math.max(0, maxCapYears - yearsSpent),
      hasReachedCap: hasExceededStatutoryCap
    },
    statutoryFees: {
      employerComplianceFeeCad: FEDERAL_ICT_CONSTANTS.EMPLOYER_COMPLIANCE_FEE_CAD,
      workPermitProcessingFeeCad: FEDERAL_ICT_CONSTANTS.WORK_PERMIT_PROCESSING_FEE_CAD
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Immigration and Refugee Protection Regulations, SOR/2002-227, ss. 205(a), 209.11, 303.1',
      'IRCC Operational Instructions: Intra-Company Transferees (C12 / C14)',
      'General Agreement on Trade in Services (GATS), Article II'
    ]
  };
}
