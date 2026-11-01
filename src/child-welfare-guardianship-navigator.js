/**
 * Child Welfare, Kinship Care, Voluntary Youth Services (VYSA) & Intercountry Adoption Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Ontario Child, Youth and Family Services Act, 2017 (CYFSA), S.O. 2017, c. 14, Sched. 1:
 *   - s. 74 (Child in need of protection criteria)
 *   - ss. 77-84 (Voluntary Youth Services Agreements / VYSA: youth aged 16-17 rights to independent support & housing)
 *   - s. 80 (Mandatory legal representation through Office of the Children's Lawyer / OCL)
 *   - ss. 75, 115 (Kinship service & Customary Care priority over stranger foster care)
 * - Citizenship Act, R.S.C. 1985, c. C-29:
 *   - s. 5.1 (Direct grant of Canadian citizenship for children adopted abroad by Canadian citizen parents)
 *   - The Hague Convention on Intercountry Adoption (Convention on Protection of Children and Co-operation)
 * - Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227:
 *   - Part 8, ss. 117(1)(g), 159-160 (Immigration track adoption when direct citizenship is unavailable)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const CHILD_WELFARE_CONSTANTS = Object.freeze({
  VYSA_MIN_AGE_YEARS: 16,
  VYSA_MAX_AGE_YEARS: 17,
  OCL_LEGAL_REP_AGE_THRESHOLD: 16,
  ADOPTION_CITIZENSHIP_DIRECT_GRANT_SECTION: 'Citizenship Act s. 5.1'
});

export const PROTECTION_GROUNDS_TAXONOMY = Object.freeze({
  physical_harm: {
    label: 'Physical Harm / Severe Corporal Punishment',
    statuteRef: 'CYFSA s. 74(2)(a)',
    isProtectionNeed: true
  },
  emotional_harm: {
    label: 'Severe Emotional Abuse / Rejection',
    statuteRef: 'CYFSA s. 74(2)(f)',
    isProtectionNeed: true
  },
  medical_neglect: {
    label: 'Failure to Provide Essential Medical Care',
    statuteRef: 'CYFSA s. 74(2)(e)',
    isProtectionNeed: true
  },
  abandonment_forced_homelessness: {
    label: 'Abandonment / Kicked Out / Forced Youth Homelessness',
    statuteRef: 'CYFSA s. 74(2)(m)',
    isProtectionNeed: true
  },
  cultural_conflict_unreasonable_restrictions: {
    label: 'Extreme Cultural Restrictions / Coerced Arranged Marriage Threat',
    statuteRef: 'CYFSA s. 74(2)(b)',
    isProtectionNeed: true
  }
});

/**
 * Diagnostic evaluation of child protection circumstances, Ontario VYSA youth rights (ages 16-17),
 * Kinship care priority over foster care, and Intercountry Adoption citizenship vs immigration pathways.
 */
export function evaluateChildWelfareAndGuardianship(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    pathway = 'vysa_youth_services', // 'vysa_youth_services' | 'kinship_guardianship' | 'intercountry_adoption'
    youthAgeYears = 16,
    hasSafeExtendedFamily = true, // Kinship caregiver available
    kinshipRelationship = 'aunt_uncle', // 'grandparent' | 'aunt_uncle' | 'adult_sibling' | 'family_friend'
    isCanadianCitizenParentForAdoption = true,
    isHagueConventionCountry = true,
    adoptionLegallyFinalizedAbroad = true,
    preAdoptionTiesSevered = true,
    youthName = 'Youth',
    assessmentDate = '2026-10-31'
  } = safeParams;
  const path = boundedText(pathway, 'vysa_youth_services', 50).toLowerCase();
  const age = Number.isFinite(Number(youthAgeYears)) ? Math.max(0, Math.min(100, Math.floor(Number(youthAgeYears)))) : 16;
  const safeYouth = boundedText(youthName, 'Youth', 100);
  const safeKinshipRelationship = boundedText(kinshipRelationship, 'aunt_uncle', 50);
  
  const assessDate = safeIsoDate(assessmentDate, '2026-10-31');

  const compliancePoints = [];
  const statutoryProtections = [];
  const riskWarnings = [];
  const actionPlan = [];

  let isVysaEligible = false;
  let isKinshipPriority = false;
  let isDirectCitizenshipGrantEligible = false;
  let summaryTitle = '';

  if (path === 'vysa_youth_services') {
    // Ontario Voluntary Youth Services Agreement (VYSA)
    if (age >= CHILD_WELFARE_CONSTANTS.VYSA_MIN_AGE_YEARS && age <= CHILD_WELFARE_CONSTANTS.VYSA_MAX_AGE_YEARS) {
      isVysaEligible = true;
      compliancePoints.push(`Youth age ${age} satisfies statutory criteria for Voluntary Youth Services Agreement (CYFSA ss. 77-84).`);
      statutoryProtections.push('INDEPENDENT YOUTH CONSENT: Under CYFSA s. 77, youth aged 16-17 can enter into a voluntary agreement directly with Children\'s Aid Society (CAS) WITHOUT parental agreement or consent.');
      statutoryProtections.push('LEGAL REPRESENTATION: Under CYFSA s. 80, the youth is entitled to free, independent legal counsel appointed through the Office of the Children\'s Lawyer (OCL) before and during agreement execution.');
      statutoryProtections.push('NO FOSTER CARE REQUIREMENT: Youth can receive independent living funding, monthly shelter allowance, dental/health coverage, and educational tuition grants while living in self-chosen safe independent accommodation.');

      actionPlan.push('Contact local Children\'s Aid Society (or Dnaagdawenmag Binnoojiiyag / Catholic Children\'s Aid) and request Voluntary Youth Services intake under CYFSA s. 77.');
      actionPlan.push('Request immediate appointment of an independent lawyer from the Office of the Children\'s Lawyer (OCL).');
      actionPlan.push('Coordinate transition to Continued Care and Support for Youth (CCSY) funding after 18th birthday.');
    } else {
      isVysaEligible = false;
      riskWarnings.push(`Age ${age} is outside the statutory 16-17 VYSA bracket. Youth under 16 fall under standard child protection procedures; individuals 18+ qualify for independent adult social assistance.`);
    }

    summaryTitle = isVysaEligible
      ? `Eligible for Ontario Voluntary Youth Services Agreement (VYSA ss. 77-84)`
      : `Ineligible for VYSA (Age ${age} outside 16-17 bracket)`;

  } else if (path === 'kinship_guardianship') {
    // Kinship Care / Customary Care
    const kinship = Boolean(hasSafeExtendedFamily);
    if (kinship) {
      isKinshipPriority = true;
      compliancePoints.push(`Safe extended family caregiver identified (${safeKinshipRelationship}).`);
      statutoryProtections.push('STATUTORY KINSHIP PRIORITY: Under CYFSA ss. 75 and 115, Children\'s Aid Society has a legal duty to explore kinship service and customary care placements with family/community before considering stranger foster care.');
      statutoryProtections.push('FINANCIAL SUPPORT: Kinship service providers are eligible for provincial per diem financial assistance, drug/dental coverage for the child, and transition support.');
      actionPlan.push('Request CAS Kinship Service Assessment for proposed family home.');
      actionPlan.push('Apply for Temporary Care Assistance (TCA) through Ontario Works while formal custody is finalized.');
      actionPlan.push('Seek formal custody order under Children\'s Law Reform Act (CLRA) s. 21.');
    } else {
      isKinshipPriority = false;
      riskWarnings.push('No immediate kinship caregiver available. Protection proceeding may involve CAS temporary foster care placement.');
    }

    summaryTitle = isKinshipPriority
      ? 'Kinship Placement Prioritized under CYFSA s. 75'
      : 'Kinship Care Unavailable / Standard CAS Protection';

  } else {
    // Intercountry Adoption Pathway
    const citizenParent = Boolean(isCanadianCitizenParentForAdoption);
    const finalized = Boolean(adoptionLegallyFinalizedAbroad);
    const severed = Boolean(preAdoptionTiesSevered);
    const hague = Boolean(isHagueConventionCountry);

    if (citizenParent && finalized && severed) {
      isDirectCitizenshipGrantEligible = true;
      compliancePoints.push('Adopting parent is Canadian citizen at time of adoption.');
      compliancePoints.push('Adoption legally severed prior parental rights and created genuine parent-child relationship.');
      statutoryProtections.push('DIRECT CITIZENSHIP GRANT (Citizenship Act s. 5.1): Child qualifies for direct grant of Canadian citizenship, bypassing permanent resident visa application (Form CIT 0014).');
      if (hague) {
        statutoryProtections.push('HAGUE CONVENTION STREAMLINING: Adoption complies with Hague Convention on Intercountry Adoption standards.');
      }
      actionPlan.push('Complete Part 1 (Confirmation of Canadian Citizenship) and Part 2 (Adoption Assessment) of Form CIT 0014.');
      actionPlan.push('Obtain provincial central adoption authority Letter of No Objection.');
      actionPlan.push('Apply for Canadian child citizenship certificate and passport directly at Canadian Embassy/High Commission.');
    } else {
      isDirectCitizenshipGrantEligible = false;
      if (!citizenParent) {
        riskWarnings.push('Parent is Permanent Resident, not Canadian Citizen. Direct citizenship under s. 5.1 is unavailable; must apply through IRPR Part 8 Family Class immigration sponsorship.');
      }
      if (!severed) {
        riskWarnings.push('Customary or simple adoption where legal ties to biological parents were not completely severed is ineligible for s. 5.1 direct citizenship grant.');
      }
      actionPlan.push('Pursue IRPR Part 8 Family Class permanent residency sponsorship for adopted child.');
    }

    summaryTitle = isDirectCitizenshipGrantEligible
      ? 'Eligible for Direct Grant of Canadian Citizenship (s. 5.1)'
      : 'Ineligible for s. 5.1 Direct Grant; Immigration Sponsorship Required';
  }

  return {
    youthName: safeYouth,
    pathway: path,
    assessmentDate: assessDate,
    summaryTitle,
    isVysaEligible,
    isKinshipPriority,
    isDirectCitizenshipGrantEligible,
    compliancePoints,
    statutoryProtections,
    riskWarnings,
    actionPlan,
    statutoryBasis: 'Ontario CYFSA 2017 & Canadian Citizenship Act s. 5.1'
  };
}
