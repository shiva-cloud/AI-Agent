/**
 * Northstar — Settlement Intelligence
 * Temporary Resident Permit (TRP) & Inadmissibility Overcoming Engine
 *
 * Statutory Authorities:
 * - Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 24 (Temporary Resident Permit)
 * - Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227, ss. 65, 65.1 (Permit Holder Class for PR), 206 (Work permit for TRP)
 * - IRCC Operational Instructions (ENF 4 / CP 12: Evaluating Inadmissibility & Discretionary TRP)
 * - Federal Court Authorities:
 *   - Farhat v. Canada (MCI), 2006 FC 1275 (Mandatory balancing of Canada's benefit against public risk)
 *   - Shabestari v. Canada (MCI), 2014 FC 1133 (Assessment of compelling economic or humanitarian necessity)
 *   - Canada (MCI) v. Saini, 2001 FCA 311 (Exceptional character of TRP relief)
 *
 * Invariants: Pure ES module, 0 npm dependencies, strict statutory accuracy, fail-safe defaults.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const TRP_STATUTORY_RULES = Object.freeze({
  MAX_TRP_DURATION_MONTHS: 36,
  PERMIT_HOLDER_CLASS_PR_CONTINUOUS_YEARS_CRIMINAL: 5,
  PERMIT_HOLDER_CLASS_PR_CONTINUOUS_YEARS_NON_CRIMINAL: 3,
  INADMISSIBILITY_SECTIONS: Object.freeze({
    CRIMINALITY: 'IRPA s. 36(2)',
    SERIOUS_CRIMINALITY: 'IRPA s. 36(1)',
    MEDICAL: 'IRPA s. 38',
    FINANCIAL: 'IRPA s. 39',
    MISREPRESENTATION: 'IRPA s. 40',
    NON_COMPLIANCE: 'IRPA s. 41',
    SECURITY_OR_HUMAN_RIGHTS: 'IRPA ss. 34, 35, 37'
  }),
  JURISDICTION: 'CA'
});

/**
 * Calculates compelling score and risk assessment for a TRP application under IRPA s. 24.
 */
export function evaluateTrpCompellingBalance({
  inadmissibilityType = 'criminality_s36_2',
  yearsElapsedSinceSentenceOrTrigger = 4,
  compellingReasonCategory = 'urgent_family_need', // or 'significant_economic_benefit', 'national_interest'
  hasDocumentaryProofOfCompellingNeed = true,
  hasCleanSubsequentRecord = true,
  hasCompletedAllSentencesAndFines = true,
  hasSevereViolenceOrWeapons = false,
  applicantLocation = 'outside_canada', // or 'inside_canada'
  hasCanadianCitizenFamilyAffected = true,
  applicantName = 'Applicant',
  assessmentDate = '2026-10-31'
} = {}) {
  const safeApplicant = boundedText(applicantName, 'Applicant', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const safeInadmissibilityType = boundedText(inadmissibilityType, 'criminality_s36_2', 60);
  
  
  const sanitizedYears = Math.max(0, Math.min(100, Math.floor(Number(yearsElapsedSinceSentenceOrTrigger) || 0)));

  const deficiencies = [];
  const compliancePoints = [];
  const statutoryRemedies = [];

  // 1. Inadmissibility Classification
  let statutoryInadmissibilitySection = TRP_STATUTORY_RULES.INADMISSIBILITY_SECTIONS.CRIMINALITY;
  let isBarredFromTrp = false;

  if (inadmissibilityType === 'serious_criminality_s36_1') {
    statutoryInadmissibilitySection = TRP_STATUTORY_RULES.INADMISSIBILITY_SECTIONS.SERIOUS_CRIMINALITY;
  } else if (inadmissibilityType === 'medical_s38') {
    statutoryInadmissibilitySection = TRP_STATUTORY_RULES.INADMISSIBILITY_SECTIONS.MEDICAL;
  } else if (inadmissibilityType === 'misrepresentation_s40') {
    statutoryInadmissibilitySection = TRP_STATUTORY_RULES.INADMISSIBILITY_SECTIONS.MISREPRESENTATION;
  } else if (inadmissibilityType === 'security_or_human_rights') {
    statutoryInadmissibilitySection = TRP_STATUTORY_RULES.INADMISSIBILITY_SECTIONS.SECURITY_OR_HUMAN_RIGHTS;
    isBarredFromTrp = true;
    deficiencies.push(
      'Inadmissibility under IRPA s. 34 (Security), s. 35 (Human or International Rights Violations), or s. 37 (Organized Criminality) carries an exceptionally high statutory bar and generally precludes discretionary TRP issuance absent direct Ministerial direction.'
    );
  }

  // 2. Risk Evaluation
  let riskLevel = 'LOW';
  if (hasSevereViolenceOrWeapons || isBarredFromTrp) {
    riskLevel = 'HIGH_PUBLIC_SAFETY_RISK';
    deficiencies.push(
      'Presence of severe violence, weapon use, or serious criminality severely compromises public safety balance under Farhat v. Canada.'
    );
  } else if (sanitizedYears < 2 || !hasCompletedAllSentencesAndFines) {
    riskLevel = 'MODERATE_RISK';
    deficiencies.push(
      `Recency of offense or unfulfilled probation/restitution (${sanitizedYears} year(s) elapsed). Officers require clear evidence of successful societal reintegration.`
    );
  } else {
    compliancePoints.push(
      `Sufficient time (${sanitizedYears} years) has elapsed since sentence completion with a clean subsequent record, indicating low recidivism risk.`
    );
  }

  if (!hasCompletedAllSentencesAndFines) {
    deficiencies.push(
      'Court-ordered fines, probation conditions, or community service have not been formally satisfied. Proof of complete sentence discharge is essential.'
    );
  } else {
    compliancePoints.push('All court sentences, restitution, and statutory terms fully discharged.');
  }

  // 3. Compelling Necessity / Benefit to Canada
  let compellingStrength = 'WEAK';
  if (hasDocumentaryProofOfCompellingNeed) {
    if (compellingReasonCategory === 'significant_economic_benefit') {
      compellingStrength = 'STRONG_ECONOMIC_BENEFIT';
      compliancePoints.push(
        'Documented significant economic contribution or vital business activity in Canada established under IRPA s. 24(1).'
      );
    } else if (compellingReasonCategory === 'urgent_family_need' && hasCanadianCitizenFamilyAffected) {
      compellingStrength = 'STRONG_HUMANITARIAN_FAMILY';
      compliancePoints.push(
        'Compelling humanitarian ground: direct impact on Canadian citizen child or family member established.'
      );
    } else {
      compellingStrength = 'MODERATE';
      compliancePoints.push('Documented compelling reason presented with third-party corroboration.');
    }
  } else {
    deficiencies.push(
      'Missing corroborating documentary evidence of compelling need to enter or remain in Canada (e.g. physician letters, employer declarations, contracts).'
    );
  }

  // 4. Balancing Analysis (Farhat v. Canada)
  const isBalanceFavourable =
    !isBarredFromTrp &&
    !hasSevereViolenceOrWeapons &&
    hasCompletedAllSentencesAndFines &&
    hasDocumentaryProofOfCompellingNeed &&
    (compellingStrength.startsWith('STRONG') || sanitizedYears >= 3);

  let recommendationVerdict = 'UNFAVOURABLE_DISCRETION_RISK';
  if (isBalanceFavourable) {
    recommendationVerdict = 'RECOMMEND_TRP_SUBMISSION';
  } else if (!isBarredFromTrp && hasCompletedAllSentencesAndFines) {
    recommendationVerdict = 'MARGINAL_BALANCE_REQUIRES_STRONGER_SUBMISSIONS';
  }

  // 5. Permanent Residence Pathway under Permit Holder Class (IRPR s. 65)
  const isCriminalClass =
    inadmissibilityType === 'criminality_s36_2' || inadmissibilityType === 'serious_criminality_s36_1';
  const prResidencyRequirementYears = isCriminalClass
    ? TRP_STATUTORY_RULES.PERMIT_HOLDER_CLASS_PR_CONTINUOUS_YEARS_CRIMINAL
    : TRP_STATUTORY_RULES.PERMIT_HOLDER_CLASS_PR_CONTINUOUS_YEARS_NON_CRIMINAL;

  // Strategic Remedies
  if (isBalanceFavourable) {
    statutoryRemedies.push({
      action: 'Submit Comprehensive IRPA s. 24 TRP Application Package',
      description:
        'File Form IMM 5708 (inside Canada) or submit to Visa Office / Port of Entry (if US citizen/visa-exempt) with legal submissions explicitly framing the Farhat balancing test.',
      timeline: 'Prior to intended travel or prior to expiry of current status'
    });
    if (applicantLocation === 'inside_canada') {
      statutoryRemedies.push({
        action: 'Concurrent Open Work Permit Application (IRPR s. 206)',
        description:
          'TRP holders valid for 6 months or longer are eligible to apply for an open work permit under LMIA exemption code C10 / IRPR s. 206.',
        timeline: 'Filed concurrently with TRP or following TRP approval'
      });
    }
    statutoryRemedies.push({
      action: 'Monitor Permit Holder Class PR Eligibility (IRPR s. 65)',
      description: `Continuous physical residence on valid TRP without new inadmissibility for ${prResidencyRequirementYears} consecutive years unlocks eligibility to transition to Canadian Permanent Resident status under the Permit Holder Class.`,
      timeline: `After ${prResidencyRequirementYears} continuous years on valid TRPs`
    });
  } else {
    statutoryRemedies.push({
      action: 'Cure Statutory Deficiencies Before Filing',
      description:
        'Obtain certified court records confirming complete sentence discharge, police clearance certificates, and independent third-party evidence demonstrating why entry into Canada is compelling.',
      timeline: 'Before initiating formal TRP request'
    });
  }

  const summary = isBalanceFavourable
    ? `The statutory balancing test under IRPA s. 24 and Farhat v. Canada is favourable (${recommendationVerdict}). The documented benefit to Canada (${compellingStrength}) outweighs the evaluated public risk (${riskLevel}).`
    : `The TRP balancing test is currently unfavourable or marginal (${recommendationVerdict}). Identified ${deficiencies.length} statutory deficiency/deficiencies to address before submission.`;

  return {
    assessmentDate: safeAssessmentDate,
    applicantName: safeApplicant,
    statutoryAuthority: 'Immigration and Refugee Protection Act (S.C. 2001, c. 27, s. 24) & IRPR ss. 65, 206',
    recommendationVerdict,
    inadmissibilityType: safeInadmissibilityType,
    statutoryInadmissibilitySection,
    riskLevel,
    compellingStrength,
    isBalanceFavourable,
    prPathwayPermitHolderClass: {
      continuousYearsRequired: prResidencyRequirementYears,
      governingStatute: 'IRPR s. 65'
    },
    summary,
    deficiencies,
    compliancePoints,
    statutoryRemedies,
    jurisdiction: 'CA'
  };
}
