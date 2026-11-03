// Verified deterministic calculation engines for newcomer settlement modules:
// Banking & Credit (#banking), Foreign Driving Licence Fast-Track (#driving),
// Child Schooling & Catchment (#schools), Layoff Severance & EI Runway (#paycheck),
// Tenancy Evidence Vault (#tenancy), and Document Expiry Watchdog (#binder).

import { ValidationError } from './api-errors.js';
import {calculatorNumber} from './calculator-input.js';
import { assertCalendarDate } from './evidence-policy.js';

export const RECIPROCAL_DRIVING_COUNTRIES = new Set([
  'United States', 'Australia', 'Austria', 'Belgium', 'France', 'Germany',
  'United Kingdom', 'Ireland', 'Japan', 'South Korea', 'New Zealand',
  'Switzerland', 'Taiwan'
]);

export const JURISDICTION_RECIPROCAL = {
  ON: RECIPROCAL_DRIVING_COUNTRIES,
  BC: new Set([
    'United States', 'Australia', 'Austria', 'France', 'Germany', 'Guernsey',
    'Ireland', 'Isle of Man', 'Jersey', 'Japan', 'Netherlands', 'New Zealand',
    'South Korea', 'Switzerland', 'Taiwan', 'United Kingdom'
  ]),
  AB: new Set([
    'United States', 'Australia', 'Austria', 'Belgium', 'France', 'Germany',
    'Isle of Man', 'Japan', 'South Korea', 'Switzerland', 'Taiwan', 'United Kingdom'
  ]),
  UK: new Set([
    'Australia', 'Austria', 'Belgium', 'Canada', 'France', 'Germany', 'Ireland',
    'Japan', 'New Zealand', 'South Korea', 'Switzerland', 'United Arab Emirates',
    'Singapore', 'Spain', 'Netherlands', 'Sweden', 'Hong Kong', 'South Africa'
  ]),
  AU: new Set([
    'United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Ireland',
    'Japan', 'New Zealand', 'Singapore', 'Austria', 'Belgium', 'Netherlands',
    'Sweden', 'Spain', 'Switzerland', 'South Korea'
  ]),
  AU_NSW: new Set([
    'United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Ireland',
    'Japan', 'New Zealand', 'Singapore', 'Austria', 'Belgium', 'Netherlands',
    'Sweden', 'Spain', 'Switzerland', 'South Korea'
  ]),
  US_CA: new Set([]),
  US: new Set([]),
  US_NY: new Set(['Canada']),
  DE: new Set([
    'Canada', 'Australia', 'Japan', 'New Zealand', 'Switzerland', 'United Kingdom',
    'United States', 'France', 'Spain', 'Netherlands', 'Sweden', 'Ireland', 'Austria', 'Belgium'
  ]),
  AE: new Set([
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France',
    'Japan', 'Ireland', 'Italy', 'Spain', 'Switzerland', 'New Zealand', 'Singapore',
    'Netherlands', 'Sweden', 'Austria', 'Belgium', 'Saudi Arabia'
  ])
};

/**
 * Illustrative nine-month credit scenario using local heuristics, not a bureau scoring model.
 */
export function calculateCreditTrajectory(input = {}) {
  if(!input||typeof input!=='object'||Array.isArray(input))throw new ValidationError('Credit scenario must be an object');
  const {limit=2000,spend=450,strategy='full_on_time',inquiries=1}=input;
  const safeLimit=calculatorNumber(limit,'Credit limit',{min:1,max:10000000});
  const safeSpend=calculatorNumber(spend,'Spending',{max:10000000});
  const safeInquiries=calculatorNumber(inquiries,'Inquiries',{max:10,integer:true});
  if(!['full_on_time','multiple_payments','minimum_only'].includes(strategy))throw new ValidationError('Unsupported payment strategy');

  const utilRatio = Math.min(100, Math.round((safeSpend / safeLimit) * 100));
  let utilGrade = 'Optimal (< 30%)';
  let utilClass = 'tier-prime';
  let monthlyPointsDelta = 18;

  if (utilRatio > 70) {
    utilGrade = 'High Risk (> 70% Penalty)';
    utilClass = 'tier-fair';
    monthlyPointsDelta = -10;
  } else if (utilRatio > 30) {
    utilGrade = 'Moderate (30% - 70%)';
    utilClass = 'tier-good';
    monthlyPointsDelta = 8;
  }

  if (strategy === 'multiple_payments') {
    monthlyPointsDelta += 6;
  } else if (strategy === 'minimum_only') {
    monthlyPointsDelta = Math.min(4, monthlyPointsDelta - 8);
  }

  const inquiryPenalty = safeInquiries === 0 ? 0 : safeInquiries >= 4 ? -35 : (safeInquiries === 2 ? -8 : (safeInquiries === 3 ? -18 : -2));
  const baseScore = 580;
  const m1Score = Math.max(500, Math.min(850, baseScore + inquiryPenalty + Math.round(monthlyPointsDelta * 0.5)));
  const m3Score = Math.max(500, Math.min(850, m1Score + (monthlyPointsDelta * 2)));
  const m6Score = Math.max(500, Math.min(850, m3Score + (monthlyPointsDelta * 3)));
  const m9Score = Math.max(500, Math.min(850, m6Score + (monthlyPointsDelta * 3)));

  const getTier = (s) => {
    if (s >= 720) return { label: 'Prime / Excellent (720+)', cls: 'tier-prime' };
    if (s >= 660) return { label: 'Good (660-719)', cls: 'tier-good' };
    if (s >= 600) return { label: 'Fair (600-659)', cls: 'tier-fair' };
    return { label: 'Starter / Building (<600)', cls: 'tier-starter' };
  };

  return {
    utilRatio,
    utilGrade,
    utilClass,
    inquiryPenalty,
    monthlyPointsDelta,
    m1Score,
    m3Score,
    m6Score,
    m9Score,
    m1Tier: getTier(m1Score),
    m9Tier: getTier(m9Score)
  };
}

/**
 * Evaluates foreign driver's licence exchange eligibility under statutory rules across jurisdictions.
 */
export function evaluateLicenceExchange({ origin = 'India', destination = 'ON', years = '2plus', docs = 'extract' } = {}) {
  const normDest = (destination || 'ON').toUpperCase();
  const reciprocalSet = JURISDICTION_RECIPROCAL[normDest] || RECIPROCAL_DRIVING_COUNTRIES;
  const isReciprocal = reciprocalSet.has(origin);

  let title = '';
  let badgeClass = '';
  let badgeText = '';
  let statutoryRule = '';
  let feeEstimate = 90.00;
  let roadTestRequired = false;
  let waitPeriodSkipped = false;

  if (normDest === 'BC') {
    if (isReciprocal) {
      title = `Direct Reciprocal 1:1 Exchange: ${origin} to British Columbia (ICBC)`;
      badgeClass = 'badge-direct';
      badgeText = 'Direct Class 5 Exchange (No Test)';
      statutoryRule = 'Under the BC Motor Vehicle Act and ICBC reciprocal agreements, valid full licences from recognized jurisdictions are exchanged directly for a BC Class 5 licence without taking knowledge or road tests.';
      feeEstimate = 31.00;
      roadTestRequired = false;
      waitPeriodSkipped = true;
    } else if (years === '2plus') {
      title = `Full Experience Credit: ${origin} to BC Class 5 Road Test`;
      badgeClass = 'badge-credit';
      badgeText = 'Skip GLP Wait (Take Class 5 Road Test)';
      statutoryRule = 'With 2+ years of verified driving experience, ICBC exempts you from the Graduated Licensing Program (GLP). You pass the computer knowledge test, then immediately book the Class 5 road test without waiting.';
      feeEstimate = 96.00;
      roadTestRequired = true;
      waitPeriodSkipped = true;
    } else {
      title = `Graduated Licensing: ${origin} (BC Class 7 Novice)`;
      badgeClass = 'badge-novice';
      badgeText = 'GLP Class 7 Novice Stage';
      statutoryRule = 'With under 2 years of driving experience, ICBC places you in the Graduated Licensing Program at the Class 7 Novice level.';
      feeEstimate = 96.00;
      roadTestRequired = true;
      waitPeriodSkipped = false;
    }
  } else if (normDest === 'AB') {
    if (isReciprocal) {
      title = `Direct Reciprocal 1:1 Exchange: ${origin} to Alberta (Class 5)`;
      badgeClass = 'badge-direct';
      badgeText = 'Direct Class 5 Exchange (No Test)';
      statutoryRule = 'Alberta Transportation exchanges valid full licences from reciprocal countries directly for an Alberta Class 5 licence without testing.';
      feeEstimate = 93.00;
      roadTestRequired = false;
      waitPeriodSkipped = true;
    } else if (years === '2plus') {
      title = `GDL Exemption Program: ${origin} to Alberta Class 5 Test`;
      badgeClass = 'badge-credit';
      badgeText = 'Skip GDL Wait (Direct Class 5 Road Test)';
      statutoryRule = 'Under the Alberta Graduated Driver Licensing Exemption (GDLE) program, applicants with 2+ years verified foreign experience can skip the Class 7 learner wait and challenge the Class 5 road test directly.';
      feeEstimate = 145.00;
      roadTestRequired = true;
      waitPeriodSkipped = true;
    } else {
      title = `Standard GDL Pathway: ${origin} (Alberta Class 7)`;
      badgeClass = 'badge-novice';
      badgeText = 'GDL Class 7 Learner Stage';
      statutoryRule = 'Applicants with under 2 years experience enter the Alberta GDL program at the Class 7 learner stage.';
      feeEstimate = 93.00;
      roadTestRequired = true;
      waitPeriodSkipped = false;
    }
  } else if (normDest === 'UK') {
    if (isReciprocal) {
      title = `Direct Designated Country Exchange: ${origin} to Great Britain (DVLA)`;
      badgeClass = 'badge-direct';
      badgeText = 'Direct DVLA Exchange (No Test)';
      statutoryRule = 'Under the Road Traffic Act 1988, licences from designated countries can be exchanged for a Full Great Britain licence within 5 years of becoming resident without taking a driving test.';
      feeEstimate = 43.00;
      roadTestRequired = false;
      waitPeriodSkipped = true;
    } else {
      title = `12-Month Grace Period to DVLA Theory & Practical Tests: ${origin}`;
      badgeClass = 'badge-credit';
      badgeText = 'Drive 12 Months, Then DVLA Practical Test';
      statutoryRule = 'Under UK DVLA rules, you can drive in Great Britain on your valid foreign licence for up to 12 months from becoming resident. To continue driving thereafter, you must pass the DVLA theory test and practical driving test.';
      feeEstimate = 105.00;
      roadTestRequired = true;
      waitPeriodSkipped = true;
    }
  } else if (normDest === 'AU' || normDest === 'AU_NSW') {
    if (isReciprocal) {
      title = `Direct Recognised Country Exchange: ${origin} to Australia (Class C)`;
      badgeClass = 'badge-direct';
      badgeText = 'Direct Licence Conversion (No Test)';
      statutoryRule = 'Holders of a full licence from recognised countries can convert directly to an Australian Car (Class C) driver licence without taking knowledge or practical driving tests.';
      feeEstimate = 66.00;
      roadTestRequired = false;
      waitPeriodSkipped = true;
    } else {
      title = `Licence Conversion Testing Path: ${origin} to Australia`;
      badgeClass = 'badge-credit';
      badgeText = 'Knowledge Test + Driving Test Required';
      statutoryRule = 'Licence holders from non-recognised countries must pass the Driver Knowledge Test (DKT), Hazard Perception Test (HPT), and the practical driving test to receive an Australian driver licence.';
      feeEstimate = 185.00;
      roadTestRequired = true;
      waitPeriodSkipped = true;
    }
  } else if (normDest === 'US' || normDest === 'US_CA') {
    title = `California DMV Licensing: ${origin} to California Driver License`;
    badgeClass = 'badge-credit';
    badgeText = 'Written Exam & Behind-The-Wheel Drive Test';
    statutoryRule = 'Under California Vehicle Code § 12505, California does not have reciprocal driver licence exchange agreements with foreign countries. All adult newcomers establishing residency must pass the vision exam, knowledge test, and behind-the-wheel driving test.';
    feeEstimate = 45.00;
    roadTestRequired = true;
    waitPeriodSkipped = true;
  } else if (normDest === 'US_NY') {
    if (origin === 'Canada') {
      title = `Direct Reciprocal Exchange: Canada to New York State (NY DMV)`;
      badgeClass = 'badge-direct';
      badgeText = 'Direct NY DMV Exchange (No Test)';
      statutoryRule = 'New York DMV exchanges valid Canadian driver licences directly for a New York State driver license without testing.';
      feeEstimate = 65.00;
      roadTestRequired = false;
      waitPeriodSkipped = true;
    } else {
      title = `New York State Licensing: ${origin} to NY Driver License`;
      badgeClass = 'badge-credit';
      badgeText = '5-Hour Pre-Licensing + Road Test Required';
      statutoryRule = 'NY DMV does not exchange non-Canadian foreign licences. Newcomers must complete an approved 5-hour pre-licensing course, pass the written permit test, and pass the road test.';
      feeEstimate = 75.00;
      roadTestRequired = true;
      waitPeriodSkipped = true;
    }
  } else if (normDest === 'DE') {
    if (isReciprocal) {
      title = `Annex 11 Reciprocal Conversion: ${origin} to German Führerschein`;
      badgeClass = 'badge-direct';
      badgeText = 'Direct German Exchange (FeV Anlage 11)';
      statutoryRule = 'Under § 31 FeV (Fahrerlaubnis-Verordnung), full licences from Annex 11 countries/states are converted directly to a German Class B driving licence without practical driving tests.';
      feeEstimate = 45.00;
      roadTestRequired = false;
      waitPeriodSkipped = true;
    } else {
      title = `6-Month Validity to German Theory & Practical Exam: ${origin}`;
      badgeClass = 'badge-credit';
      badgeText = 'Foreign Theory + Practical (Mandatory Lessons Waived)';
      statutoryRule = 'Under § 29 FeV, a foreign driving licence is valid for 6 months after registering your German address (Anmeldung). To convert thereafter, you must pass the theory exam and practical driving test at a Fahrschule; statutory minimum special driving hours (Sonderfahrten) are waived.';
      feeEstimate = 320.00;
      roadTestRequired = true;
      waitPeriodSkipped = true;
    }
  } else if (normDest === 'AE') {
    if (isReciprocal) {
      title = `Direct RTA Recognition: ${origin} to UAE / Dubai Driving Licence`;
      badgeClass = 'badge-direct';
      badgeText = 'Direct Exchange (No Classes or Test)';
      statutoryRule = 'Citizens and residents holding a valid full licence from 32 recognized countries can exchange directly for a UAE driving licence at RTA Dubai without mandatory lessons or tests.';
      feeEstimate = 235.00;
      roadTestRequired = false;
      waitPeriodSkipped = true;
    } else {
      title = `RTA "Golden Chance" One-Time Road Test: ${origin}`;
      badgeClass = 'badge-credit';
      badgeText = 'Golden Chance Direct Test (Skip 20 Classes)';
      statutoryRule = 'Under Dubai RTA regulations, non-exempt foreign licence holders can apply for the "Golden Chance" initiative: taking the knowledge test and a one-time direct road test without enrolling in mandatory driving school classes.';
      feeEstimate = 580.00;
      roadTestRequired = true;
      waitPeriodSkipped = true;
    }
  } else {
    // Default Ontario (HTA Reg 340/94)
    if (isReciprocal) {
      title = `Direct Reciprocal 1:1 Exchange: ${origin} to Ontario / Canada`;
      badgeClass = 'badge-direct';
      badgeText = 'Direct Exchange (No Test)';
      statutoryRule = 'Under the Ontario Highway Traffic Act reciprocal exchange agreements, valid licences from recognized countries are exchanged 1-for-1 without taking any knowledge or road test.';
      roadTestRequired = false;
      waitPeriodSkipped = true;
    } else if (years === '2plus' && docs === 'extract') {
      title = `Full Experience Credit: ${origin} Fast-Track to G Road Test`;
      badgeClass = 'badge-credit';
      badgeText = 'Skip 12-Mo Wait (Direct Full G Test)';
      statutoryRule = 'Under Ontario Regulation 340/94 s.14, applicants presenting an authenticated Driving History Extract showing 2+ years of valid experience can bypass the mandatory 12-month G1 wait time and immediately attempt the Full G road test.';
      roadTestRequired = true;
      waitPeriodSkipped = true;
      feeEstimate = 160.00;
    } else if (years === '1to2' || (years === '2plus' && docs !== 'extract')) {
      title = `Partial Experience Credit: ${origin} Skip G1 Wait to G2 Test`;
      badgeClass = 'badge-partial';
      badgeText = 'Skip 12-Mo Wait (Take G2 Test)';
      statutoryRule = 'Without an authenticated consular extract, Ontario grants credit for up to 12 months experience based on the foreign plastic card alone. You bypass the 12-month wait and can book the G2 road test immediately.';
      roadTestRequired = true;
      waitPeriodSkipped = true;
      feeEstimate = 160.00;
    } else {
      title = `Standard Graduated Licensing Path: ${origin} (G1 Learner)`;
      badgeClass = 'badge-novice';
      badgeText = 'Standard Graduated Licensing (G1 -> G2 -> G)';
      statutoryRule = 'With under 1 year of driving experience, newcomers enter Ontario graduated licensing at the G1 learner level. You must hold a G1 for 12 months (or 8 months if completing a Ministry-approved BDE course) before taking the G2 road test.';
      roadTestRequired = true;
      waitPeriodSkipped = false;
      feeEstimate = 160.00;
    }
  }

  return {
    origin,
    destination,
    isReciprocal,
    title,
    badgeClass,
    badgeText,
    statutoryRule,
    feeEstimate,
    roadTestRequired,
    waitPeriodSkipped
  };
}

/**
 * Calculates statutory age-to-grade placement under the Ontario Education Act.
 */
export function calculateGradePlacement({ birthYear = 2020, referenceYear = 2026, board = 'tdsb', status = 'work_permit', lang = 'non_english' } = {}) {
  const age = Number(referenceYear) - Number(birthYear);
  let grade = '';
  let level = '';

  if (age === 4) { grade = 'Junior Kindergarten (JK)'; level = 'Kindergarten'; }
  else if (age === 5) { grade = 'Senior Kindergarten (SK)'; level = 'Kindergarten'; }
  else if (age === 6) { grade = 'Grade 1'; level = 'Primary Elementary'; }
  else if (age === 7) { grade = 'Grade 2'; level = 'Primary Elementary'; }
  else if (age === 8) { grade = 'Grade 3'; level = 'Primary Elementary'; }
  else if (age === 9) { grade = 'Grade 4'; level = 'Junior Elementary'; }
  else if (age === 10) { grade = 'Grade 5'; level = 'Junior Elementary'; }
  else if (age === 11) { grade = 'Grade 6'; level = 'Junior Elementary'; }
  else if (age === 12) { grade = 'Grade 7'; level = 'Senior Elementary / Middle School'; }
  else if (age === 13) { grade = 'Grade 8'; level = 'Senior Elementary / Middle School'; }
  else if (age === 14) { grade = 'Grade 9'; level = 'Secondary / High School'; }
  else if (age === 15) { grade = 'Grade 10'; level = 'Secondary / High School'; }
  else if (age === 16) { grade = 'Grade 11'; level = 'Secondary / High School'; }
  else if (age === 17) { grade = 'Grade 12'; level = 'Secondary / High School'; }
  else if (age < 4) { grade = 'Infant / Toddler (Licensed Childcare)'; level = 'Preschool'; }
  else { grade = 'Adult Education / Post-Secondary'; level = 'Adult'; }

  const tuitionExempt = ['work_permit', 'pr', 'study_permit', 'refugee', 'undocumented'].includes(status);
  const eslAssessmentRequired = lang === 'non_english' && age >= 4 && age <= 17;

  return {
    age,
    birthYear,
    grade,
    level,
    tuitionExempt,
    eslAssessmentRequired,
    statutoryGuarantee: 'Under Ontario Education Act Section 49.2, school boards are statutorily prohibited from denying admission to a child who is ordinarily resident in Ontario based on immigration status.'
  };
}

/**
 * Calculates statutory layoff notice, ESA severance pay, and Employment Insurance runway.
 */
export function calculateSeveranceAndEi({ years = 3, isLargePayroll = true, grossSalary = 85000, monthlyNetBurn = 3500 } = {}) {
  const safeYears = Math.max(0.5, Number(years) || 1);
  const safeGross = Math.max(10000, Number(grossSalary) || 85000);
  const safeBurn = Math.max(500, Number(monthlyNetBurn) || 3500);

  const weeklySalary = safeGross / 52;
  const noticeWeeks = Math.min(Math.floor(safeYears), 8);
  const terminationPay = noticeWeeks * weeklySalary;

  let severanceWeeks = 0;
  if (isLargePayroll && safeYears >= 5) {
    severanceWeeks = Math.min(safeYears, 26);
  }
  const severancePay = severanceWeeks * weeklySalary;

  const eiWeeklyMax = 668.00;
  const eiWeekly = Math.min(weeklySalary * 0.55, eiWeeklyMax);
  const eiWeeks = 36;
  const totalEi = eiWeekly * eiWeeks;

  const totalStatutoryRunway = terminationPay + severancePay + totalEi;
  const runwayMonths = Number((totalStatutoryRunway / safeBurn).toFixed(1));

  return {
    weeklySalary,
    noticeWeeks,
    terminationPay,
    severanceWeeks,
    severancePay,
    eiWeekly,
    eiWeeks,
    totalEi,
    totalStatutoryRunway,
    monthlyNetBurn: safeBurn,
    runwayMonths
  };
}

/**
 * Calculates statutory damages for Ontario Landlord and Tenant Board (LTB Form T2 / RTA s.31).
 */
export function calculateTenancyDamages({ months = 3, monthlyRent = 2200, expenses = 750, remedy = 'full_package' } = {}) {
  const safeMonths = Math.max(1, Math.min(24, Number(months) || 1));
  const safeRent = Math.max(100, Number(monthlyRent) || 2200);
  const safeExpenses = Math.max(0, Number(expenses) || 0);

  let abatementPct = 0.30;
  if (remedy === 'abatement_only') abatementPct = 1.0;
  else if (remedy === 'moving_costs') abatementPct = 0.15;

  const rentAbatement = safeMonths * safeRent * abatementPct;
  const adminFineRecommended = (remedy === 'full_package') ? 2500 : 0;
  const totalClaim = Math.round(rentAbatement + safeExpenses + adminFineRecommended);
  const maxLtbJurisdiction = 35000;
  const isWithinJurisdiction = totalClaim <= maxLtbJurisdiction;

  return {
    months: safeMonths,
    monthlyRent: safeRent,
    abatementPct,
    rentAbatement,
    expenses: safeExpenses,
    adminFineRecommended,
    totalClaim,
    maxLtbJurisdiction,
    isWithinJurisdiction
  };
}

/**
 * Evaluates document expiry runway and maintained status protection under IRPR 186(u).
 */
export function calculateDocumentExpiryRunway({ docType = 'work_permit', expiryDateStr, referenceDate = new Date() } = {}) {
  assertCalendarDate(expiryDateStr, 'Expiry date');
  if (!(referenceDate instanceof Date) && typeof referenceDate !== 'string') throw new ValidationError('Invalid reference date');
  const expiryDate = new Date(expiryDateStr);
  const refDate = new Date(referenceDate);
  if (!Number.isFinite(refDate.getTime())) throw new ValidationError('Invalid reference date');
  const diffTime = expiryDate.getTime() - refDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status = 'safe';
  let isExpired = false;
  let isUrgent = false;
  let maintainedStatusProtected = false;
  let advice = '';

  if (diffDays <= 0) {
    status = 'expired';
    isExpired = true;
    advice = 'Under IRPA Section 182, you have a strict 90-day restoration window to apply for status restoration and pay the $229 restoration fee. You CANNOT work or study during restoration.';
  } else if (diffDays <= 90) {
    status = 'urgent';
    isUrgent = true;
    maintainedStatusProtected = true;
    advice = 'Under IRPR Section 186(u), as long as your extension application is submitted BEFORE 11:59 PM on the expiry date, you benefit from maintained status and can legally continue working/studying while waiting for IRCC decision.';
  } else if (diffDays <= 180) {
    status = 'warning';
    advice = 'Request your employer support letter or gather institution enrolment records. Processing times frequently exceed 90 days.';
  } else {
    status = 'safe';
    advice = 'Your status is currently secure. Set a calendar reminder at 180 days before expiry.';
  }

  return {
    docType,
    expiryDateStr,
    diffDays,
    status,
    isExpired,
    isUrgent,
    maintainedStatusProtected,
    advice
  };
}

export const EXCESSIVE_DEMAND_ANNUAL_THRESHOLD_CAD = 26220; // 3x Canadian per capita average
export const EXCESSIVE_DEMAND_5_YEAR_THRESHOLD_CAD = 131100;

/**
 * Evaluates immigration medical admissibility under IRPA s. 38(1)(c) and s. 38(2) exemptions.
 */
export function evaluateExcessiveDemandMedical({
  annualHealthCost = 0,
  annualSocialCost = 0,
  durationYears = 5,
  isExemptCategory = false,
  category = 'express_entry'
} = {}) {
  const safeHealth = Math.max(0, Number(annualHealthCost) || 0);
  const safeSocial = Math.max(0, Number(annualSocialCost) || 0);
  const safeYears = Math.min(10, Math.max(1, Number(durationYears) || 5));

  const totalAnnualCost = safeHealth + safeSocial;
  const projectedTotalCost = totalAnnualCost * safeYears;
  const annualThreshold = EXCESSIVE_DEMAND_ANNUAL_THRESHOLD_CAD;
  const periodThreshold = annualThreshold * safeYears;

  const exemptCategories = new Set(['family_spouse', 'dependent_child', 'refugee', 'protected_person']);
  const isExempt = Boolean(isExemptCategory || exemptCategories.has(category));

  const exceedsThreshold = projectedTotalCost > periodThreshold;
  const isAdmissible = isExempt || !exceedsThreshold;
  const proceduralFairnessRisk = !isExempt && exceedsThreshold;
  const mitigationPlanRequired = proceduralFairnessRisk;

  let assessment = 'admissible';
  let guidance = '';

  if (isExempt) {
    assessment = 'exempt_admissible';
    guidance = 'Exempt from excessive demand assessment under IRPA s. 38(2). Sponsored spouses, dependent children, and protected persons cannot be refused on health or social services grounds.';
  } else if (!exceedsThreshold) {
    assessment = 'admissible';
    guidance = `Projected costs ($${projectedTotalCost.toLocaleString()} CAD over ${safeYears} years) are within the statutory threshold of $${periodThreshold.toLocaleString()} CAD ($${annualThreshold.toLocaleString()}/yr). Admissible under IRPA s. 38(1)(c).`;
  } else {
    assessment = 'excessive_demand_risk';
    guidance = `Projected costs ($${projectedTotalCost.toLocaleString()} CAD) exceed the statutory threshold of $${periodThreshold.toLocaleString()} CAD ($${annualThreshold.toLocaleString()}/yr). IRCC will issue a Procedural Fairness Letter (PFL). You have 60–90 days to submit a formal Mitigation Plan demonstrating private payment or alternative coverage.`;
  }

  return {
    annualHealthCost: safeHealth,
    annualSocialCost: safeSocial,
    totalAnnualCost,
    durationYears: safeYears,
    projectedTotalCost,
    annualThreshold,
    periodThreshold,
    isExempt,
    isAdmissible,
    proceduralFairnessRisk,
    mitigationPlanRequired,
    assessment,
    guidance
  };
}
