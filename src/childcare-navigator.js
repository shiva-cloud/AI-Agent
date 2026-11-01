// src/childcare-navigator.js
// Canada-Wide Early Learning and Child Care (CWELCC) & Municipal Fee Subsidy Engine.
// Evaluates childcare costs, statutory CWELCC $22/day fee caps, provincial fee subsidies,
// and newcomer immigration eligibility (Child Care and Early Years Act, 2014).
// Pure ES module with zero npm dependencies.

import { boundedText, safeIsoDate } from './text-input.js';

export const CHILDCARE_AGE_GROUPS = {
  infant: {
    label: 'Infant (0 to 18 months)',
    marketMonthlyAverageCad: 1950,
    cwelccDailyCapCad: 22.00,
    cwelccMonthlyCad: 462 // 21 days * $22
  },
  toddler: {
    label: 'Toddler (18 to 30 months)',
    marketMonthlyAverageCad: 1650,
    cwelccDailyCapCad: 22.00,
    cwelccMonthlyCad: 462
  },
  preschool: {
    label: 'Preschool (30 months to 5 years)',
    marketMonthlyAverageCad: 1350,
    cwelccDailyCapCad: 22.00,
    cwelccMonthlyCad: 462
  },
  kindergarten: {
    label: 'Kindergarten (4 to 6 years, Before/After School)',
    marketMonthlyAverageCad: 650,
    cwelccDailyCapCad: 12.69,
    cwelccMonthlyCad: 266 // 21 days * $12.69
  }
};

export const MUNICIPAL_PORTALS = {
  Toronto: {
    cmsm: 'City of Toronto Children’s Services',
    waitlistPortal: 'MyChildCareAccount (Online Centralized Waitlist)',
    url: 'https://www.toronto.ca/community-people/children-parenting/children-programs-activities/licensed-child-care/mychildcareaccount/',
    subsidyIncomeTest: 'Income Test under Child Care and Early Years Act, 2014 (O. Reg. 138/15)',
    freeSubsidyThreshold: 20000,
    workPermitEligible: true
  },
  Mississauga: {
    cmsm: 'Region of Peel Human Services (Child Care Services)',
    waitlistPortal: 'Peel Centralized Child Care Registry & Subsidy System',
    url: 'https://www.peelregion.ca/childcare-subsidy/',
    subsidyIncomeTest: 'O. Reg. 138/15 Provincial Income Test',
    freeSubsidyThreshold: 20000,
    workPermitEligible: true
  },
  Brampton: {
    cmsm: 'Region of Peel Human Services (Child Care Services)',
    waitlistPortal: 'Peel Centralized Child Care Registry & Subsidy System',
    url: 'https://www.peelregion.ca/childcare-subsidy/',
    subsidyIncomeTest: 'O. Reg. 138/15 Provincial Income Test',
    freeSubsidyThreshold: 20000,
    workPermitEligible: true
  },
  Vancouver: {
    cmsm: 'BC Ministry of Education and Child Care & City of Vancouver',
    waitlistPortal: 'Westcoast Child Care Resource Centre & OneHSN Waitlist',
    url: 'https://www2.gov.bc.ca/gov/content/family-social-supports/caring-for-young-children/child-care-funding/child-care-benefit',
    subsidyIncomeTest: 'BC Affordable Child Care Benefit (ACCB) Income Sliding Scale',
    freeSubsidyThreshold: 45000, // Up to $1,250/mo full benefit
    workPermitEligible: true
  },
  Calgary: {
    cmsm: 'Alberta Children and Family Services',
    waitlistPortal: 'Alberta Child Care Subsidy & Search Tool',
    url: 'https://www.alberta.ca/child-care-subsidy',
    subsidyIncomeTest: 'Alberta Child Care Subsidy ($180,000 family income ceiling)',
    freeSubsidyThreshold: 35000,
    workPermitEligible: true
  }
};

/**
 * Calculates parent fee contribution under Ontario O. Reg. 138/15 Income Test.
 */
export function calculateOntarioSubsidyContribution(annualFamilyIncomeCad = 0) {
  const income = Math.max(0, Math.min(100000000, Number.isFinite(Number(annualFamilyIncomeCad)) ? Number(annualFamilyIncomeCad) : 0));
  if (income <= 20000) return 0; // Full subsidy ($0 parent fee)

  if (income <= 40000) {
    // 10% of income over $20,000
    const annualContribution = (income - 20000) * 0.10;
    return Math.round(annualContribution / 12);
  }

  // Over $40,000: $2,000 + 30% of income over $40,000
  const annualContribution = 2000 + ((income - 40000) * 0.30);
  return Math.round(annualContribution / 12);
}

/**
 * Assesses newcomer childcare fee reduction, subsidy entitlement, and waitlist requirements.
 * 
 * @param {object} params
 * @param {string} [params.city='Toronto'] - Target Canadian city
 * @param {number} [params.annualFamilyIncomeCad=32000] - Estimated net annual household income (CAD)
 * @param {string} [params.immigrationStatus='pr'] - 'pr', 'work_permit', 'study_permit', 'visitor'
 * @param {Array<object>} [params.children=[]] - List of children { ageGroup: 'infant'|'toddler'|'preschool'|'kindergarten' }
 * @returns {object} Comprehensive statutory childcare assessment
 */
export function evaluateChildcareSupport({
  applicantName = 'Parent',
  city = 'Toronto',
  annualFamilyIncomeCad = 32000,
  immigrationStatus = 'pr',
  children = [],
  assessmentDate
} = {}) {
  const cleanApplicantName = boundedText(applicantName, 'Parent', 100);
  const cleanCity = boundedText(city, 'Toronto', 50);
  const safeDate = safeIsoDate(assessmentDate, new Date().toISOString().slice(0, 10));

  const normCity = ['Toronto', 'Mississauga', 'Brampton', 'Vancouver', 'Calgary'].find(
    c => c.toLowerCase() === cleanCity.toLowerCase()
  ) || 'Toronto';

  const portalInfo = MUNICIPAL_PORTALS[normCity] || MUNICIPAL_PORTALS.Toronto;
  const income = Math.max(0, Math.min(100000000, Number.isFinite(Number(annualFamilyIncomeCad)) ? Number(annualFamilyIncomeCad) : 0));
  const status = boundedText(immigrationStatus, 'pr', 40).toLowerCase();

  const childList = Array.isArray(children) && children.length > 0
    ? children.slice(0, 10)
    : [{ ageGroup: 'toddler' }]; // Default sample 1 child (clamped to max 10)

  // Evaluate each child
  let totalMarketCostMonthly = 0;
  let totalCwelccCostMonthly = 0;

  const evaluatedChildren = childList.map((ch, idx) => {
    const ageKey = (ch.ageGroup || 'toddler').toLowerCase();
    const config = CHILDCARE_AGE_GROUPS[ageKey] || CHILDCARE_AGE_GROUPS.toddler;

    totalMarketCostMonthly += config.marketMonthlyAverageCad;
    totalCwelccCostMonthly += config.cwelccMonthlyCad;

    const monthlySavings = config.marketMonthlyAverageCad - config.cwelccMonthlyCad;

    return {
      childIndex: idx + 1,
      ageGroup: config.label,
      marketRateMonthlyCad: config.marketMonthlyAverageCad,
      cwelccCappedMonthlyCad: config.cwelccMonthlyCad,
      cwelccDailyFeeCad: config.cwelccDailyCapCad,
      cwelccMonthlySavingsCad: monthlySavings,
      cwelccEligibilityNote: 'Under Canada-Wide Early Learning & Child Care (CWELCC), fees are statutorily capped at $22/day across 93% of licensed spaces.'
    };
  });

  // Subsidy evaluation
  const isEligibleForSubsidy = ['pr', 'work_permit', 'study_permit', 'refugee'].includes(status);
  let estimatedParentFeeMonthly = totalCwelccCostMonthly;
  let subsidyProgram = portalInfo.subsidyIncomeTest;
  let subsidyStatus = 'ineligible';
  let estimatedMonthlySubsidyCad = 0;

  if (isEligibleForSubsidy) {
    if (normCity === 'Vancouver') {
      // BC ACCB
      if (income <= 45000) {
        subsidyStatus = 'full_subsidy';
        estimatedMonthlySubsidyCad = Math.min(totalCwelccCostMonthly, 1250 * evaluatedChildren.length);
        estimatedParentFeeMonthly = Math.max(0, totalCwelccCostMonthly - estimatedMonthlySubsidyCad);
      } else if (income <= 111000) {
        subsidyStatus = 'partial_subsidy';
        estimatedMonthlySubsidyCad = Math.round(totalCwelccCostMonthly * 0.5);
        estimatedParentFeeMonthly = Math.max(0, totalCwelccCostMonthly - estimatedMonthlySubsidyCad);
      }
    } else {
      // Ontario Income Test
      const parentContribution = calculateOntarioSubsidyContribution(income);
      if (parentContribution === 0) {
        subsidyStatus = 'full_subsidy';
        estimatedMonthlySubsidyCad = totalCwelccCostMonthly;
        estimatedParentFeeMonthly = 0;
      } else if (parentContribution < totalCwelccCostMonthly) {
        subsidyStatus = 'partial_subsidy';
        estimatedMonthlySubsidyCad = totalCwelccCostMonthly - parentContribution;
        estimatedParentFeeMonthly = parentContribution;
      } else {
        subsidyStatus = 'cwelcc_base_only';
        estimatedMonthlySubsidyCad = 0;
        estimatedParentFeeMonthly = totalCwelccCostMonthly;
      }
    }
  }

  const statutoryAdvisories = [
    'Work Permit & Study Permit Statutory Right: Under the Child Care and Early Years Act (CCEYA), temporary residents on valid work permits or enrolled in full-time study at a DLI are legally eligible for municipal fee subsidies.',
    'Pre-Landing Waitlist Application: Because licensed childcare waitlists can span 6 to 18 months, newcomers are legally permitted to register on municipal waitlists (such as Toronto MyChildCareAccount or Peel Centralized Waitlist) prior to physical arrival.',
    'CWELCC Universal Coverage: You do not need to apply for the CWELCC $22/day fee reduction; participating licensed centres automatically apply the statutory fee reduction on your monthly invoice.'
  ];

  return {
    asOf: safeDate,
    assessmentDate: safeDate,
    applicantName: cleanApplicantName,
    city: normCity,
    immigrationStatus: status,
    familyNetIncomeCad: income,
    childrenCount: evaluatedChildren.length,
    monthlyCostSummary: {
      unsubsidizedMarketMonthlyTotalCad: totalMarketCostMonthly,
      cwelccUniversalCapMonthlyTotalCad: totalCwelccCostMonthly,
      estimatedParentFeeAfterSubsidyMonthlyCad: estimatedParentFeeMonthly,
      totalMonthlySavingsCad: totalMarketCostMonthly - estimatedParentFeeMonthly
    },
    subsidyAssessment: {
      programName: subsidyProgram,
      status: subsidyStatus,
      estimatedMonthlySubsidyCad,
      isStatutorilyEligible: isEligibleForSubsidy,
      administeredBy: portalInfo.cmsm
    },
    waitlistPortal: {
      name: portalInfo.waitlistPortal,
      url: portalInfo.url,
      recommendedAction: 'Register immediately on the centralized waitlist across at least 5 licensed centres near your anticipated residence or transit corridor.'
    },
    childrenBreakdown: evaluatedChildren,
    statutoryAdvisories,
    authority: 'Child Care and Early Years Act, 2014 (S.O. 2014, c. 11) & Canada-Wide Early Learning and Child Care Agreement (CWELCC)'
  };
}
