/**
 * Federal C10 Significant Benefit LMIA-Exempt Work Permit Navigator
 *
 * Evaluates significant economic, social, or cultural benefit eligibility
 * under Canada's Immigration and Refugee Protection Regulations (IRPR),
 * s. 205(a), LMIA Exemption Code C10.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const FEDERAL_C10_CONSTANTS = Object.freeze({
  EXEMPTION_CODE: 'C10',
  EMPLOYER_COMPLIANCE_FEE_CAD: 230,
  WORK_PERMIT_FEE_CAD: 155,
  MIN_TESTIMONIAL_LETTERS_RECOMMENDED: 3,
  STATUTORY_AUTHORITY: 'IRPR s. 205(a) - Exemption Code C10'
});

/**
 * Audits C10 significant benefit work permit eligibility, evidentiary thresholds, and benefit category metrics.
 *
 * @param {Object} params
 * @param {string} [params.benefitCategory='ECONOMIC'] - 'ECONOMIC', 'SOCIAL', 'CULTURAL'
 * @param {boolean} [params.createsDirectJobsForCanadiansOrPrs=true] - Proposed activity directly creates/maintains employment for Canadians/PRs
 * @param {number} [params.projectedCanadianJobsCreatedCount=3] - Number of full-time jobs created for Canadians
 * @param {boolean} [params.hasOfficialSupportFromCanadianGovernmentOrBody=true] - Endorsement letters from federal/provincial ministries or economic agencies
 * @param {number} [params.independentExpertTestimonialLettersCount=3] - Third-party expert testimonial letters
 * @param {boolean} [params.hasDocumentedRecordOfDistinguishedAchievement=true] - Internationally recognized awards, patents, citations, or venture capital
 * @param {boolean} [params.hasDetailedCanadianBusinessOrWorkPlan=true] - Viable commercial business plan or project execution schedule
 * @param {boolean} [params.isSelfEmployedApplicant=false] - Whether applicant is self-employed vs corporate employee
 * @param {boolean} [params.employerComplianceFeePaid=true] - $230 fee remitted in Employer Portal (exempt if self-employed non-employer)
 * @returns {Object} Comprehensive C10 significant benefit audit and probability score
 */
export function evaluateFederalC10SignificantBenefit(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicantName = 'Applicant',
    employerName = 'Employer',
    assessmentDate = '2026-10-31',
    benefitCategory = 'ECONOMIC',
    createsDirectJobsForCanadiansOrPrs = true,
    projectedCanadianJobsCreatedCount = 3,
    hasOfficialSupportFromCanadianGovernmentOrBody = true,
    independentExpertTestimonialLettersCount = 3,
    hasDocumentedRecordOfDistinguishedAchievement = true,
    hasDetailedCanadianBusinessOrWorkPlan = true,
    isSelfEmployedApplicant = false,
    employerComplianceFeePaid = true
  } = safeParams;

  const cleanApplicantName = boundedText(applicantName, 'Applicant', 100);
  const cleanEmployerName = boundedText(employerName, 'Employer', 120);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const cleanBenefitCategory = boundedText(benefitCategory, 'ECONOMIC', 40).toUpperCase();
  const lettersCount = Math.max(0, Math.min(100, Number.isFinite(Number(independentExpertTestimonialLettersCount)) ? Math.round(Number(independentExpertTestimonialLettersCount)) : 0));
  const jobsCreated = Math.max(0, Math.min(100000, Number.isFinite(Number(projectedCanadianJobsCreatedCount)) ? Math.round(Number(projectedCanadianJobsCreatedCount)) : 0));

  const statutoryViolations = [];
  const evidentiaryGaps = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Core Benefit Evidence Audit
  if (!hasDocumentedRecordOfDistinguishedAchievement) {
    evidentiaryGaps.push({
      gapType: 'LACK_OF_DISTINGUISHED_ACHIEVEMENT_EVIDENCE',
      description: 'C10 operational guidelines require objective third-party proof of distinguished past achievement (e.g. peer-reviewed publications, patents, notable awards).'
    });
    actionableRemedies.push({
      action: 'COMPILE_EVIDENCE_OF_PROMINENCE',
      remedyDescription: 'Assemble copies of international awards, major media features, patents, or venture capital investment documentation.'
    });
  }

  // 2. Government / Institutional Endorsement
  if (!hasOfficialSupportFromCanadianGovernmentOrBody) {
    evidentiaryGaps.push({
      gapType: 'NO_CANADIAN_INSTITUTIONAL_ENDORSEMENT',
      description: 'Lack of formal support letters from Canadian federal/provincial departments, universities, or recognized industry associations severely weakens C10 claims.'
    });
    actionableRemedies.push({
      action: 'SOLICIT_CANADIAN_STAKEHOLDER_LETTERS',
      remedyDescription: 'Obtain letters of support from Canadian economic development agencies, trade commissioners, or research institutes.'
    });
  }

  // 3. Testimonial letters volume
  if (lettersCount < FEDERAL_C10_CONSTANTS.MIN_TESTIMONIAL_LETTERS_RECOMMENDED) {
    riskWarnings.push({
      warningType: 'LIMITED_EXPERT_TESTIMONIAL_CORPUS',
      description: `Only ${lettersCount} expert testimonial letter${lettersCount === 1 ? '' : 's'} provided. IRCC officers typically expect at least 3 authoritative independent references.`
    });
  }

  // 4. Job Creation / Business Plan
  if (cleanBenefitCategory === 'ECONOMIC' && (!createsDirectJobsForCanadiansOrPrs || jobsCreated < 1)) {
    evidentiaryGaps.push({
      gapType: 'NO_MEASURABLE_CANADIAN_JOB_CREATION',
      description: 'For economic benefit claims, failure to establish direct job creation or retention for Canadian citizens/PRs often results in refusal.'
    });
  }

  if (!hasDetailedCanadianBusinessOrWorkPlan) {
    statutoryViolations.push({
      rule: 'NO_VIABLE_BUSINESS_OR_WORK_PLAN',
      statute: 'IRPR s. 205(a) - Operational Instructions',
      finding: 'Application lacks a detailed Canadian business plan or statement of work demonstrating how the significant benefit will materialize.'
    });
    actionableRemedies.push({
      action: 'COMMISSION_FORMAL_CANADIAN_BUSINESS_PLAN',
      remedyDescription: 'Draft a comprehensive 3-5 year business plan with financial projections, market analysis, and Canadian hiring timeline.'
    });
  }

  // 5. Employer Portal Fee (if not purely self-employed)
  if (!isSelfEmployedApplicant && !employerComplianceFeePaid) {
    statutoryViolations.push({
      rule: 'EMPLOYER_COMPLIANCE_FEE_OUTSTANDING',
      statute: 'IRPR ss. 209.11, 303.1',
      finding: 'Employer has not paid the mandatory $230 compliance fee via the IRCC Employer Portal.'
    });
    actionableRemedies.push({
      action: 'SUBMIT_PORTAL_OFFER_AND_PAY_230',
      remedyDescription: 'Employer must submit offer of employment and remit $230 fee.'
    });
  }

  // Adjudication strength scoring
  let strengthScoreOutOf100 = 0;
  if (hasDocumentedRecordOfDistinguishedAchievement) strengthScoreOutOf100 += 25;
  if (hasOfficialSupportFromCanadianGovernmentOrBody) strengthScoreOutOf100 += 25;
  if (lettersCount >= 3) strengthScoreOutOf100 += 20;
  else strengthScoreOutOf100 += lettersCount * 6;
  if (hasDetailedCanadianBusinessOrWorkPlan) strengthScoreOutOf100 += 15;
  if (createsDirectJobsForCanadiansOrPrs && jobsCreated >= 1) strengthScoreOutOf100 += 15;

  let eligibilityVerdict = 'HIGH_EVIDENTIARY_BENEFIT_ESTABLISHED';
  let isEligible = true;

  if (statutoryViolations.length > 0 || evidentiaryGaps.length >= 2 || strengthScoreOutOf100 < 60) {
    isEligible = false;
    if (statutoryViolations.length > 0) {
      eligibilityVerdict = 'INELIGIBLE_STATUTORY_REQUIREMENTS_NOT_MET';
    } else {
      eligibilityVerdict = 'INSUFFICIENT_EVIDENCE_OF_SIGNIFICANT_BENEFIT';
    }
  }

  return {
    jurisdiction: 'FEDERAL_CANADA',
    applicantName: cleanApplicantName,
    employerName: cleanEmployerName,
    assessmentDate: cleanAssessmentDate,
    lmiaExemptionCode: FEDERAL_C10_CONSTANTS.EXEMPTION_CODE,
    benefitCategory: cleanBenefitCategory,
    isSelfEmployedApplicant,
    strengthScoreOutOf100,
    isEligible,
    eligibilityVerdict,
    benefitMetrics: {
      projectedCanadianJobsCreatedCount: jobsCreated,
      independentExpertTestimonialLettersCount: lettersCount,
      hasOfficialInstitutionalEndorsement: hasOfficialSupportFromCanadianGovernmentOrBody,
      hasDistinguishedAchievementRecord: hasDocumentedRecordOfDistinguishedAchievement
    },
    statutoryFees: {
      employerComplianceFeeCad: isSelfEmployedApplicant ? 0 : FEDERAL_C10_CONSTANTS.EMPLOYER_COMPLIANCE_FEE_CAD,
      workPermitFeeCad: FEDERAL_C10_CONSTANTS.WORK_PERMIT_FEE_CAD
    },
    evidentiaryGaps,
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Immigration and Refugee Protection Regulations, SOR/2002-227, s. 205(a)',
      'IRCC Operational Instructions: Significant Benefit - General [C10]',
      'Federal Court Precedent: Saini v. Canada (MCI), 2019 FC 102'
    ]
  };
}
