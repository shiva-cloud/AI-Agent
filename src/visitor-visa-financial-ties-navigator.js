// src/visitor-visa-financial-ties-navigator.js
// Statutory TRV Ties & Dual Intent Risk Evaluator
// Based on Immigration and Refugee Protection Act (IRPA) s. 179(b) and s. 22(2).

import { boundedText, safeIsoDate, todayIso, isIsoCalendarDate } from './text-input.js';
import { ToolInputError } from './api-errors.js';

function visitorNumber(value, name, min, max, integer = false) {
  if (value === undefined) return undefined;
  if ((typeof value !== 'number' && typeof value !== 'string') ||
      (typeof value === 'string' && !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()))) {
    throw new ToolInputError(`${name} must be a decimal number.`);
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max || (integer && !Number.isInteger(number))) {
    throw new ToolInputError(`${name} must be ${integer ? 'a whole number' : 'a number'} between ${min} and ${max}.`);
  }
  return number;
}

function visitorBoolean(value, name) {
  if (value === undefined) return undefined;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  throw new ToolInputError(`${name} must be true or false.`);
}

export function evaluateVisitorVisaTies({
  applicantName = 'Visitor Applicant',
  countryOfResidence = 'IN',
  plannedStayDays,
  liquidFundsCad,
  hasApprovedJobLeaveLetter,
  yearsAtCurrentJob,
  monthlyIncomeCad,
  ownsRealEstateProperty,
  hasImmediateFamilyRemainingHome, // Spouse or minor children staying behind
  allImmediateFamilyTravelingTogether,
  hasPriorCompliantTravelG7, // Previous travel to US, UK, Schengen, AU, NZ, CA
  hasPreviousVisaRefusal,
  isDualIntentPrPending,
  hostInCanadaRelationship = 'family_sibling', // 'none_tourist', 'family_sibling', 'friend', 'business_conference'
  assessmentDate = todayIso()
} = {}) {
  hasApprovedJobLeaveLetter = visitorBoolean(hasApprovedJobLeaveLetter, 'Approved leave letter');
  ownsRealEstateProperty = visitorBoolean(ownsRealEstateProperty, 'Property ownership');
  hasImmediateFamilyRemainingHome = visitorBoolean(hasImmediateFamilyRemainingHome, 'Family remaining at home');
  allImmediateFamilyTravelingTogether = visitorBoolean(allImmediateFamilyTravelingTogether, 'Family traveling together');
  hasPriorCompliantTravelG7 = visitorBoolean(hasPriorCompliantTravelG7, 'Prior compliant travel');
  hasPreviousVisaRefusal = visitorBoolean(hasPreviousVisaRefusal, 'Previous visa refusal');
  isDualIntentPrPending = visitorBoolean(isDualIntentPrPending, 'Pending permanent residence application');
  if (!isIsoCalendarDate(assessmentDate)) throw new ToolInputError('Assessment date must be a valid YYYY-MM-DD calendar date.');
  const safeApplicant = boundedText(applicantName, 'Visitor Applicant', 120);
  const safeCountry = boundedText(countryOfResidence, 'IN', 10);
  const safeHostRel = boundedText(hostInCanadaRelationship, 'family_sibling', 40);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const safeStayDays = visitorNumber(plannedStayDays, 'Stay days', 1, 365, true);
  const safeLiquidFunds = visitorNumber(liquidFundsCad, 'Liquid funds', 0, 100000000);
  const safeJobTenure = visitorNumber(yearsAtCurrentJob, 'Job tenure', 0, 60);
  const safeMonthlyIncome = visitorNumber(monthlyIncomeCad, 'Monthly income', 0, 1000000);

  const supplied = { plannedStayDays, liquidFundsCad, hasApprovedJobLeaveLetter, yearsAtCurrentJob, monthlyIncomeCad, ownsRealEstateProperty, hasImmediateFamilyRemainingHome, allImmediateFamilyTravelingTogether, hasPriorCompliantTravelG7, hasPreviousVisaRefusal, isDualIntentPrPending };
  const missingInputs = Object.keys(supplied).filter(key => supplied[key] === undefined);
  if (missingInputs.length) {
    return {
      assessmentDate: safeAssessmentDate, applicantName: safeApplicant, countryOfResidence: safeCountry,
      hostInCanadaRelationship: safeHostRel, plannedStayDays: safeStayDays ?? null,
      riskTier: 'NOT_DETERMINED', tieScoreOutOf100: null, approvalProbability: null, missingInputs,
      financialMetrics: { liquidFundsCad: safeLiquidFunds ?? null, estimatedCostCad: null, fundsSurplusCad: null },
      positiveFactors: [], riskFactors: [],
      mitigationRecommendations: ['Provide the missing trip, financial and ties information before running the assessment.'],
      statutoryCitations: []
    };
  }

  let score = 0;
  const positiveFactors = [];
  const riskFactors = [];
  const mitigationRecommendations = [];

  // 1. Financial Sufficiency ($150 CAD/day baseline + return flight buffer $2,000 CAD)
  const estimatedCostCad = (safeStayDays * 175) + 2000;
  const fundsSurplusCad = safeLiquidFunds - estimatedCostCad;

  if (safeLiquidFunds >= estimatedCostCad * 1.5) {
    score += 25;
    positiveFactors.push(`Robust Liquid Funds: $${safeLiquidFunds.toLocaleString('en-CA')} CAD provides a 150%+ safety buffer over estimated trip costs of $${estimatedCostCad.toLocaleString('en-CA')} CAD.`);
  } else if (safeLiquidFunds >= estimatedCostCad) {
    score += 15;
    positiveFactors.push(`Adequate Funds: $${safeLiquidFunds.toLocaleString('en-CA')} CAD meets estimated trip costs.`);
  } else {
    riskFactors.push(`Insufficient Liquid Funds: Available $${safeLiquidFunds.toLocaleString('en-CA')} CAD falls short of estimated trip cost ($${estimatedCostCad.toLocaleString('en-CA')} CAD). Officer may cite s. 179(b) financial insufficiency.`);
    mitigationRecommendations.push('Increase unencumbered savings balance with seasoned 4–6 month bank statements to demonstrate self-sufficiency.');
  }

  // Funds should be consistent with income: a balance far above a year's income
  // usually prompts an officer to ask where the money came from.
  if (safeMonthlyIncome > 0 && safeLiquidFunds > safeMonthlyIncome * 12) {
    riskFactors.push(`Funds Out of Proportion to Income: Savings of $${safeLiquidFunds.toLocaleString('en-CA')} CAD exceed 12 months of the stated $${safeMonthlyIncome.toLocaleString('en-CA')} CAD monthly income. Officers often ask for the source of large or recent deposits.`);
    mitigationRecommendations.push('Explain the source of the savings (salary history, sale of property, gifts) with documents, and avoid large unexplained deposits shortly before applying.');
  } else if (safeMonthlyIncome > 0) {
    positiveFactors.push(`Consistent Income: A monthly income of $${safeMonthlyIncome.toLocaleString('en-CA')} CAD is consistent with the funds shown.`);
  } else {
    riskFactors.push('No Stated Income: Without regular income, officers may doubt how the trip is funded and whether you have ties to return to.');
  }

  // 2. Employment Ties
  if (hasApprovedJobLeaveLetter && safeJobTenure >= 2) {
    score += 25;
    positiveFactors.push(`Strong Employment Anchor: ${safeJobTenure} years tenure with employer-approved leave letter confirming position and return date.`);
  } else if (hasApprovedJobLeaveLetter) {
    score += 15;
    positiveFactors.push('Verified Employment: Official employer leave letter provided.');
  } else {
    riskFactors.push('Unanchored Employment: Absence of formal employer leave letter or steady employment history.');
    mitigationRecommendations.push('Secure an official letter from employer on corporate letterhead stating role, salary, approved leave dates, and formal confirmation of resumed employment.');
  }

  // 3. Family Ties & Non-Accompanying Dependents
  if (hasImmediateFamilyRemainingHome && !allImmediateFamilyTravelingTogether) {
    score += 20;
    positiveFactors.push('Strong Compassionate Family Ties: Spouse and/or minor children remaining in home country establish a primary incentive to return.');
  } else if (allImmediateFamilyTravelingTogether) {
    riskFactors.push('Family Unit Uprooting Risk: All immediate family members traveling simultaneously creates officer concern regarding intent to permanently relocate.');
    mitigationRecommendations.push('Highlight extended family obligations, elderly parent care, or community roots remaining in home country.');
  } else {
    score += 5;
  }

  // 4. Immovable Assets & Property
  if (ownsRealEstateProperty) {
    score += 15;
    positiveFactors.push('Immovable Property Asset: Real estate ownership deed or registered title proves substantial physical and financial ties.');
  } else {
    mitigationRecommendations.push('Provide residential lease, commercial investments, or ancestral property valuation certificates to substantiate physical ties.');
  }

  // 5. Prior Compliant Travel
  if (hasPriorCompliantTravelG7) {
    score += 15;
    positiveFactors.push('Compliant Travel Track Record: Previous compliant travel to G7/Commonwealth jurisdictions demonstrates respect for immigration exit controls.');
  } else {
    riskFactors.push('First-Time Traveler Profile: Blank passport without prior international travel requires elevated evidence of domestic ties.');
  }

  // 6. Refusal History & Dual Intent
  if (hasPreviousVisaRefusal) {
    score -= 15;
    riskFactors.push('Prior Refusal History: Previous refusal on record triggers heightened scrutiny under IRPA s. 179(b).');
    mitigationRecommendations.push('Submit a point-by-point rebuttal addressing the exact reasons cited in the previous GCMS officer refusal notes.');
  }

  if (isDualIntentPrPending) {
    positiveFactors.push('Dual Intent Recognised: Under IRPA s. 22(2), an active PR application does not bar a temporary resident visa, provided applicant shows commitment to leave if temporary status expires.');
    mitigationRecommendations.push('Explicitly cite IRPA s. 22(2) in the cover letter acknowledging dual intent and affirming commitment to depart pending PR decision.');
  }

  // Internal heuristic grouping; these weights are not a calibrated prediction
  // of an officer's decision or a probability of visa approval.
  let tier = 'LOW_RISK';
  if (score < 45) {
    tier = 'HIGH_RISK';
  } else if (score < 70) {
    tier = 'MODERATE_RISK';
  }

  return {
    assessmentDate: safeAssessmentDate,
    applicantName: safeApplicant,
    countryOfResidence: safeCountry,
    hostInCanadaRelationship: safeHostRel,
    plannedStayDays: safeStayDays,
    tieScoreOutOf100: Math.max(0, Math.min(100, score)),
    riskTier: tier,
    approvalProbability: null,
    assessmentBasis: 'UNVALIDATED_HEURISTIC',
    assessmentNotice: 'This score is an unvalidated planning heuristic, not a visa approval probability or an eligibility decision. The financial estimate is a planning assumption, not an official minimum.',
    financialMetrics: {
      liquidFundsCad: safeLiquidFunds,
      estimatedCostCad,
      fundsSurplusCad
    },
    positiveFactors,
    riskFactors,
    mitigationRecommendations,
    statutoryCitations: [
      'IRPA s. 179(b) - Requirement to establish intention to depart Canada at end of authorized stay.',
      'IRPA s. 22(2) - Dual intent principle confirming lawful compatibility of temporary and permanent residence intentions.'
    ]
  };
}
