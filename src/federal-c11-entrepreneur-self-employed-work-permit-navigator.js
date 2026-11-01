/**
 * Federal C11 Entrepreneur & Self-Employed Work Permit Navigator
 *
 * Evaluates LMIA-exempt work permit eligibility for business owners and
 * self-employed operators under Canada's Immigration and Refugee Protection
 * Regulations (IRPR), s. 205(a), Exemption Code C11.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const FEDERAL_C11_CONSTANTS = Object.freeze({
  EXEMPTION_CODE: 'C11',
  MIN_BUSINESS_OWNERSHIP_PERCENTAGE: 50, // Controlling interest or 50%+ equity
  INITIAL_WORK_PERMIT_DURATION_YEARS: 2,
  EMPLOYER_COMPLIANCE_FEE_CAD: 230,
  WORK_PERMIT_FEE_CAD: 155,
  STATUTORY_AUTHORITY: 'IRPR s. 205(a) - Exemption Code C11'
});

/**
 * Audits C11 entrepreneur work permit eligibility, ownership control, significant benefit, and commercial viability.
 *
 * @param {Object} params
 * @param {number} [params.businessOwnershipPercentage=51] - Percentage of voting shares or equity owned by applicant
 * @param {boolean} [params.hasControllingInterest=true] - Direct operational and executive control of Canadian business
 * @param {number} [params.capitalInvestedCad=150000] - Capital injected or committed to the Canadian enterprise
 * @param {boolean} [params.hasComprehensiveBusinessPlan=true] - 3-5 year viable commercial plan showing economic benefit
 * @param {boolean} [params.createsJobsForCanadiansOrPrs=true] - Business will employ Canadian citizens or permanent residents
 * @param {number} [params.projectedCanadianStaffHired=2] - Number of full-time Canadians/PRs on payroll within 1-2 years
 * @param {boolean} [params.hasRelevantEntrepreneurialBackground=true] - Documented past business ownership or executive experience
 * @param {boolean} [params.hasSecuredPhysicalPremisesOrLease=true] - Commercial location, office, or storefront secured in Canada
 * @param {boolean} [params.employerComplianceFeePaid=true] - $230 fee paid via Employer Portal (self-employed business portal)
 * @returns {Object} Comprehensive C11 entrepreneur assessment and permit viability
 */
export function evaluateFederalC11EntrepreneurWorkPermit(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicantName = 'Entrepreneur',
    assessmentDate = '2026-10-31',
    businessOwnershipPercentage = 51,
    hasControllingInterest = true,
    capitalInvestedCad = 150000,
    hasComprehensiveBusinessPlan = true,
    createsJobsForCanadiansOrPrs = true,
    projectedCanadianStaffHired = 2,
    hasRelevantEntrepreneurialBackground = true,
    hasSecuredPhysicalPremisesOrLease = true,
    employerComplianceFeePaid = true,
    enterpriseName = 'Canadian Commercial Enterprise',
    operatingLocation = 'Toronto, Ontario'
  } = safeParams;

  const cleanApplicantName = boundedText(applicantName, 'Entrepreneur', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const cleanEnterprise = boundedText(enterpriseName, 'Canadian Commercial Enterprise');
  const cleanLocation = boundedText(operatingLocation, 'Toronto, Ontario');
  const ownership = Number.isFinite(Number(businessOwnershipPercentage)) ? Math.max(0, Math.min(100, Number(businessOwnershipPercentage))) : 0;
  const capital = Number.isFinite(Number(capitalInvestedCad)) ? Math.max(0, Number(capitalInvestedCad)) : 0;
  const staff = Number.isFinite(Number(projectedCanadianStaffHired)) ? Math.max(0, Math.floor(Number(projectedCanadianStaffHired))) : 0;

  const meetsOwnershipThreshold = ownership >= FEDERAL_C11_CONSTANTS.MIN_BUSINESS_OWNERSHIP_PERCENTAGE || hasControllingInterest;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Ownership & Controlling Interest Audit (s. 205(a))
  if (!meetsOwnershipThreshold) {
    statutoryViolations.push({
      rule: 'INSUFFICIENT_BUSINESS_OWNERSHIP_OR_CONTROL',
      statute: 'IRPR s. 205(a) - C11 Guidelines',
      finding: `Applicant owns ${ownership}% of the business without controlling interest. Exemption C11 requires at least 50% ownership or demonstrated controlling equity.`
    });
    actionableRemedies.push({
      action: 'ACQUIRE_CONTROLLING_EQUITY',
      remedyDescription: 'Restructure corporate shareholder agreement to grant applicant at least 50% voting shares or executive control.'
    });
  }

  // 2. Business Plan & Commercial Viability
  if (!hasComprehensiveBusinessPlan) {
    statutoryViolations.push({
      rule: 'NO_COMPREHENSIVE_BUSINESS_PLAN',
      statute: 'IRPR s. 205(a) - Operational Instructions',
      finding: 'C11 applications require a detailed commercial business plan demonstrating financial feasibility and economic benefit.'
    });
    actionableRemedies.push({
      action: 'COMMISSION_COMMERCIAL_BUSINESS_PLAN',
      remedyDescription: 'Retain professional business plan writers to produce a market feasibility and staffing model for Canada.'
    });
  }

  // 3. Significant Economic Benefit / Canadian Job Creation
  if (!createsJobsForCanadiansOrPrs || staff < 1) {
    statutoryViolations.push({
      rule: 'NO_CANADIAN_EMPLOYMENT_CREATION',
      statute: 'IRPR s. 205(a)',
      finding: 'Business does not demonstrate measurable economic stimulus or job creation for Canadian citizens or permanent residents.'
    });
    actionableRemedies.push({
      action: 'INCORPORATE_CANADIAN_HIRING_ROADMAP',
      remedyDescription: 'Commit to hiring at least 1-2 Canadian citizens or permanent residents within the first 12 months of operations.'
    });
  }

  // 4. Physical Premises
  if (!hasSecuredPhysicalPremisesOrLease) {
    riskWarnings.push({
      warningType: 'COMMERCIAL_PREMISES_NOT_SECURED',
      description: 'Lack of a physical commercial lease or operating facility increases officer suspicion of a paper business.'
    });
    actionableRemedies.push({
      action: 'EXECUTE_COMMERCIAL_LEASE_AGREEMENT',
      remedyDescription: 'Secure physical commercial office, industrial, or retail lease prior to filing.'
    });
  }

  // 5. Capital Investment Adequacy
  if (capital < 50000) {
    riskWarnings.push({
      warningType: 'LOW_CAPITAL_INVESTMENT',
      description: `Injected capital of $${capital} is low for Canadian business operations; typical viable thresholds range from $75,000 to $200,000 depending on industry.`
    });
  }

  // 6. Employer Compliance Fee
  if (!employerComplianceFeePaid) {
    statutoryViolations.push({
      rule: 'EMPLOYER_COMPLIANCE_FEE_UNPAID',
      statute: 'IRPR ss. 209.11, 303.1',
      finding: 'The $230 employer compliance fee has not been submitted via the IRCC Employer Portal.'
    });
    actionableRemedies.push({
      action: 'SUBMIT_EMPLOYER_PORTAL_OFFER_SELF_EMPLOYED',
      remedyDescription: 'Create business profile in IRCC Employer Portal and submit offer of employment to self with $230 fee.'
    });
  }

  let eligibilityVerdict = 'ELIGIBLE_FOR_C11_WORK_PERMIT';
  let isEligible = true;

  if (statutoryViolations.length > 0) {
    isEligible = false;
    if (!meetsOwnershipThreshold) {
      eligibilityVerdict = 'INELIGIBLE_INSUFFICIENT_OWNERSHIP';
    } else if (!hasComprehensiveBusinessPlan) {
      eligibilityVerdict = 'INELIGIBLE_MISSING_BUSINESS_PLAN';
    } else {
      eligibilityVerdict = 'INELIGIBLE_STATUTORY_REQUIREMENTS_NOT_MET';
    }
  }

  return {
    applicantName: cleanApplicantName,
    assessmentDate: cleanAssessmentDate,
    jurisdiction: 'FEDERAL_CANADA',
    enterpriseName: cleanEnterprise,
    operatingLocation: cleanLocation,
    lmiaExemptionCode: FEDERAL_C11_CONSTANTS.EXEMPTION_CODE,
    businessOwnershipPercentage: ownership,
    hasControllingInterest,
    isEligible,
    eligibilityVerdict,
    businessViabilityMetrics: {
      capitalInvestedCad: capital,
      projectedCanadianStaffHired: staff,
      hasSecuredCommercialPremises: hasSecuredPhysicalPremisesOrLease,
      hasDocumentedEntrepreneurialBackground: hasRelevantEntrepreneurialBackground
    },
    statutoryFees: {
      employerComplianceFeeCad: FEDERAL_C11_CONSTANTS.EMPLOYER_COMPLIANCE_FEE_CAD,
      workPermitFeeCad: FEDERAL_C11_CONSTANTS.WORK_PERMIT_FEE_CAD
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Immigration and Refugee Protection Regulations, SOR/2002-227, s. 205(a)',
      'IRCC Operational Instructions: Entrepreneurs and Self-Employed Candidates [C11]',
      'Federal Court Jurisprudence: Bhasin v. Canada (MCI), 2018 FC 114'
    ]
  };
}
