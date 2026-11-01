// src/pr-residency-navigator.js
// Canadian PR Card Renewal & IRPA Section 28 Residency Obligation Diagnostic Engine.
// Audits compliance with the 730-day statutory presence requirement within the 5-year rolling window
// under the Immigration and Refugee Protection Act (S.C. 2001, c. 27, s. 28),
// computes overseas statutory exemptions (accompanying Canadian citizen spouse under s. 28(2)(a)(ii),
// Canadian business overseas assignment under s. 28(2)(a)(iii)), audits urgent processing eligibility,
// and evaluates PR Travel Document (PRTD) criteria.
// Pure ES module with zero npm dependencies.

import { boundedText, safeIsoDate } from './text-input.js';

export const STATUTORY_RESIDENCY_REQUIREMENT_DAYS = 730; // 2 years out of 5
export const FIVE_YEAR_WINDOW_DAYS = 1825;

export const OVERSEAS_EXEMPTION_TYPES = {
  NONE: 'none',
  ACCOMPANYING_CITIZEN_SPOUSE: 'accompanying_citizen_spouse', // IRPA s. 28(2)(a)(ii)
  CANADIAN_BUSINESS_EMPLOYMENT: 'canadian_business_employment', // IRPA s. 28(2)(a)(iii)
  ACCOMPANYING_PR_EMPLOYED_ABROAD: 'accompanying_pr_employed_abroad' // IRPA s. 28(2)(a)(iv)
};

export function evaluatePrResidencyObligation({
  assessmentDate = null,
  prLandingDate = '2022-01-01',
  prCardExpiryDate = '2027-01-01',
  physicalDaysInsideCanada = 600,
  overseasDaysWithCitizenSpouse = 0,
  overseasDaysCanadianBusinessEmployment = 0,
  overseasDaysAccompanyingPrEmployedAbroad = 0,
  isCurrentlyInsideCanada = true,
  hasUrgentTravelBooked = false,
  urgentTravelDate = null,
  urgentTravelReason = 'none', // 'employment', 'family_illness_or_death', 'none'
  applicantName = 'Permanent Resident'
} = {}) {
  const safeAsOfStr = safeIsoDate(assessmentDate);
  const asOfDate = new Date(safeAsOfStr);
  const safeLandingStr = safeIsoDate(prLandingDate || '2022-01-01');
  const landingDate = new Date(safeLandingStr);
  const safeExpiryStr = safeIsoDate(prCardExpiryDate || '2027-01-01');
  const expiryDate = new Date(safeExpiryStr);
  const msPerDay = 1000 * 60 * 60 * 24;

  const safeApplicantName = boundedText(applicantName, 120) || 'Permanent Resident';
  const safeTravelReason = boundedText(urgentTravelReason, 50) || 'none';
  const insideCanada = Boolean(isCurrentlyInsideCanada);
  const urgentTravel = Boolean(hasUrgentTravelBooked);

  const daysSinceLanding = Math.max(0, Math.floor((asOfDate.getTime() - landingDate.getTime()) / msPerDay));
  const isWithinFirstFiveYearsOfPr = daysSinceLanding < FIVE_YEAR_WINDOW_DAYS;

  // Actual days inside Canada
  const actualDaysInside = Number.isFinite(Number(physicalDaysInsideCanada)) ? Math.max(0, Math.min(1825, Math.floor(Number(physicalDaysInsideCanada)))) : 0;

  // Overseas exempted days under IRPA s. 28(2)(a)
  const spouseDays = Number.isFinite(Number(overseasDaysWithCitizenSpouse)) ? Math.max(0, Math.min(1825, Math.floor(Number(overseasDaysWithCitizenSpouse)))) : 0;
  const businessDays = Number.isFinite(Number(overseasDaysCanadianBusinessEmployment)) ? Math.max(0, Math.min(1825, Math.floor(Number(overseasDaysCanadianBusinessEmployment)))) : 0;
  const prOverseasDays = Number.isFinite(Number(overseasDaysAccompanyingPrEmployedAbroad)) ? Math.max(0, Math.min(1825, Math.floor(Number(overseasDaysAccompanyingPrEmployedAbroad)))) : 0;

  const totalOverseasExemptedDays = spouseDays + businessDays + prOverseasDays;
  const totalCreditedResidencyDays = actualDaysInside + totalOverseasExemptedDays;

  const surplusOrDeficitDays = totalCreditedResidencyDays - STATUTORY_RESIDENCY_REQUIREMENT_DAYS;
  const hasMet730DaysObligation = totalCreditedResidencyDays >= STATUTORY_RESIDENCY_REQUIREMENT_DAYS;

  // If newcomer landed less than 5 years ago, can they still realistically accumulate 730 days?
  let canStillComplyWithinFirst5Years = true;
  let remainingDaysIn5YearWindow = 0;
  if (isWithinFirstFiveYearsOfPr) {
    remainingDaysIn5YearWindow = Math.max(0, FIVE_YEAR_WINDOW_DAYS - daysSinceLanding);
    const maximumPossibleDaysAt5YearMark = totalCreditedResidencyDays + remainingDaysIn5YearWindow;
    if (maximumPossibleDaysAt5YearMark < STATUTORY_RESIDENCY_REQUIREMENT_DAYS) {
      canStillComplyWithinFirst5Years = false;
    }
  }

  // Renewal eligibility status
  let complianceStatus = 'COMPLIANT';
  let summaryHeadline = '';

  if (hasMet730DaysObligation) {
    complianceStatus = 'FULLY_COMPLIANT';
    summaryHeadline = `Residency obligation met with ${totalCreditedResidencyDays} credited days (${surplusOrDeficitDays} days surplus). Eligible for standard 5-year PR Card renewal.`;
  } else if (isWithinFirstFiveYearsOfPr && canStillComplyWithinFirst5Years) {
    complianceStatus = 'IN_PROGRESS_ON_TRACK';
    summaryHeadline = `PR status safe under 5-year rule. You have ${totalCreditedResidencyDays} credited days, and have ${remainingDaysIn5YearWindow} days remaining in your first 5-year window to accumulate the needed ${Math.abs(surplusOrDeficitDays)} days.`;
  } else {
    complianceStatus = 'IN_BREACH_AT_RISK';
    summaryHeadline = `Critical: Deficit of ${Math.abs(surplusOrDeficitDays)} days below IRPA s.28 statutory floor. High risk of Section 44(1) inadmissibility report and PR status revocation if audited at POE or during renewal.`;
  }

  // Card Expiry Status
  const daysUntilExpiry = Math.round((expiryDate.getTime() - asOfDate.getTime()) / msPerDay);
  const isCardExpired = daysUntilExpiry < 0;
  const isEligibleForRenewal = (hasMet730DaysObligation || (isWithinFirstFiveYearsOfPr && canStillComplyWithinFirst5Years)) && daysUntilExpiry <= 270;

  // Urgent Processing Assessment (IMM 5444 Urgent Criteria)
  let urgentProcessingEligible = false;
  const urgentReasonsList = [];
  if (urgentTravel && urgentTravelDate) {
    const travelDateStr = safeIsoDate(urgentTravelDate);
    const travelDateObj = new Date(travelDateStr);
    const daysUntilTravel = Math.round((travelDateObj.getTime() - asOfDate.getTime()) / msPerDay);
    if (daysUntilTravel > 0 && daysUntilTravel <= 90) {
      if (safeTravelReason === 'employment') {
        urgentProcessingEligible = true;
        urgentReasonsList.push('Urgent travel for verified employment or business opportunity (requires official letter from employer).');
      } else if (safeTravelReason === 'family_illness_or_death') {
        urgentProcessingEligible = true;
        urgentReasonsList.push('Urgent travel due to serious illness or death of an immediate family member (requires medical note / death certificate).');
      }
    }
  }

  // PR Travel Document (PRTD) Assessment if outside Canada
  const prtdAssessment = {
    isNeeded: !insideCanada && (isCardExpired || daysUntilExpiry < 30),
    eligibleForPrtd: hasMet730DaysObligation || (isWithinFirstFiveYearsOfPr && canStillComplyWithinFirst5Years),
    processingPlatform: 'IRCC Permanent Residence Portal (Online)',
    feeCad: 50,
    statutoryBasis: 'IRPA s. 31(3)'
  };

  const statutoryAdvisories = [
    '730-Day Rolling Window (IRPA s. 28): For PRs who landed more than 5 years ago, IRCC examines strictly the 5-year window immediately preceding the date of application. For PRs who landed less than 5 years ago, IRCC checks whether you can still meet 730 days by your 5th anniversary.',
    'Spousal Companion Exemption (IRPA s. 28(2)(a)(ii)): Every single day spent living outside Canada with your legally married spouse or common-law partner who is a Canadian citizen is fully credited as physical presence inside Canada. Marriage certificate and cohabitation evidence are required.',
    'Canadian Business Assignment (IRPA s. 28(2)(a)(iii)): Days assigned abroad by a federally or provincially incorporated Canadian business count as physical presence, provided you remain on Canadian payroll and will return to Canada upon completion.',
    'PR Status Does Not Expire with the Card: An expired PR Card does NOT mean you have lost PR status. Only an official Section 44(1) departure order or voluntary renunciation terminates Canadian permanent residency.',
    'Entering Canada by Private Vehicle via US Land Border: A PR with an expired card has a statutory Charter Section 6 right to enter Canada at any land border crossing (e.g. Peace Bridge, Rainbow Bridge, Pacific Highway) in a private vehicle with their COPR and expired card.'
  ];

  return {
    asOf: safeAsOfStr,
    applicantName: safeApplicantName,
    prLandingDate: safeLandingStr,
    prCardExpiryDate: safeExpiryStr,
    daysSinceLanding,
    isWithinFirstFiveYearsOfPr,
    daysUntilExpiry,
    isCardExpired,
    complianceStatus,
    summaryHeadline,
    residencyDayAudit: {
      actualDaysInsideCanada: actualDaysInside,
      overseasExemptedDays: {
        accompanyingCitizenSpouseDays: spouseDays,
        canadianBusinessEmploymentDays: businessDays,
        accompanyingPrEmployedAbroadDays: prOverseasDays,
        totalOverseasCreditedDays: totalOverseasExemptedDays
      },
      totalCreditedResidencyDays,
      statutoryMinimumDaysRequired: STATUTORY_RESIDENCY_REQUIREMENT_DAYS,
      surplusOrDeficitDays,
      hasMet730DaysObligation
    },
    renewalEligibility: {
      isEligibleToApplyForRenewal: isEligibleForRenewal,
      recommendedApplicationWindow: 'Within 9 months (270 days) of card expiry, or immediately if already expired.',
      irccProcessingFeeCad: 50
    },
    urgentProcessingAssessment: {
      isEligibleForUrgentProcessing: urgentProcessingEligible,
      qualifyingCriteria: urgentReasonsList,
      requiredProof: [
        'Proof of travel (copy of paid airline ticket or travel itinerary showing travel dates and destination within 90 days)',
        'Proof of full payment for travel',
        'Employer letter on official letterhead detailing urgent business necessity, OR medical certificate / death certificate for immediate family member'
      ]
    },
    prTravelDocumentAssessment: prtdAssessment,
    statutoryAdvisories,
    statutoryAuthority: 'Immigration and Refugee Protection Act (S.C. 2001, c. 27, s. 28, s. 31)'
  };
}
