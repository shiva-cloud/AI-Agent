/**
 * Canadian Permanent Resident Card Renewal, Urgent Processing & Travel Document (PRTD) Navigator
 *
 * Implements statutory assessment under:
 * - Immigration and Refugee Protection Act (SC 2001 c. 27) ss. 28, 31, 53–59
 * - Immigration and Refugee Protection Regulations (SOR/2002-227) ss. 53–59 (PR Cards)
 * - IRPR ss. 61–62 (Permanent Resident Travel Document / PRTD)
 * - IRCC Operational Instructions on Urgent PR Card and PRTD Applications
 *
 * Key Statutory Rules:
 * - Residency Obligation (IRPA s. 28): Permanent residents must accumulate at least 730 days of
 *   physical presence in Canada during every 5-year period.
 * - Credited Absence Days (IRPA s. 28(2)(a)):
 *   (i) Accompanying outside Canada a Canadian citizen spouse, common-law partner, or parent (if child);
 *   (ii) Employed on a full-time basis by a Canadian business or public service assigned abroad;
 *   (iii) Accompanying outside Canada a PR spouse/partner who is employed by a Canadian business.
 * - Urgent Processing Criteria (IRCC official instructions):
 *   Applicant must demonstrate travel departure within 90 days AND provide documentary proof for:
 *   (1) Serious illness or death of an immediate family member;
 *   (2) Employment, job offer, or business conference requiring international travel;
 *   (3) Own serious medical emergency requiring treatment abroad.
 * - In-Canada vs Outside-Canada Jurisdictional Rules:
 *   - Inside Canada: Submit Form IMM 5444 via the PR Portal.
 *   - Outside Canada without a valid PR card: Cannot apply for PR card renewal; MUST apply for a
 *     Permanent Resident Travel Document (PRTD, Form IMM 5524) via the PR Portal before boarding
 *     a commercial carrier (airline, train, bus, boat) to Canada.
 *   - Private Vehicle Exception: PRs can re-enter Canada at a land port of entry (US-Canada border)
 *     in a private vehicle with Confirmation of Permanent Residence (COPR) or expired card (IRPA s. 31(2)).
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const PR_CARD_CONSTANTS = Object.freeze({
  RESIDENCY_OBLIGATION_DAYS_REQUIRED: 730,
  FIVE_YEAR_WINDOW_DAYS: 1825,
  URGENT_PROCESSING_TRAVEL_WINDOW_DAYS: 90,
  PR_CARD_APPLICATION_FEE_CAD: 50.0,
  PRTD_APPLICATION_FEE_CAD: 50.0,
  STANDARD_PROCESSING_WEEKS_ESTIMATE: 12
});

/**
 * Evaluates PR card renewal compliance, urgent processing eligibility, and travel document requirements.
 *
 * @param {Object} options
 * @param {number} [options.daysInCanadaLast5Years=730] - Physical presence days in Canada within last 5 years
 * @param {number} [options.daysAbroadAccompanyingCitizenSpouse=0] - Days outside Canada accompanying citizen spouse
 * @param {number} [options.daysAbroadEmployedByCanadianBusiness=0] - Days outside Canada on Canadian employer assignment
 * @param {number} [options.daysAbroadAccompanyingPrEmployed=0] - Days outside Canada accompanying PR spouse employed by Canadian firm
 * @param {boolean} [options.hasUrgentTravelNeed=false] - Urgent departure planned
 * @param {number} [options.travelDepartureDaysFromNow=120] - Days until international travel departure
 * @param {string} [options.urgentReasonCategory='none'] - 'death_or_serious_illness', 'urgent_employment', 'own_serious_illness', 'other_humanitarian', 'none'
 * @param {boolean} [options.hasProofOfTravel=false] - Confirmed flight itinerary or tickets with payment
 * @param {boolean} [options.hasSupportingUrgentProof=false] - Doctor note, death certificate, or employer travel letter
 * @param {boolean} [options.isCurrentlyInsideCanada=true] - True if inside Canada, false if currently abroad
 * @param {boolean} [options.hasHandwrittenPrApplication=false] - Legacy paper vs electronic PR Portal
 * @param {string} [options.applicantName='PR Applicant'] - Applicant name
 * @param {string} [options.assessmentDate='2026-10-31'] - Date of assessment
 * @returns {Object} Comprehensive PR card renewal diagnostic
 */
export function evaluatePrCardRenewalUrgent(options = {}) {
  const daysInCanada = Number.isFinite(options.daysInCanadaLast5Years) ? Math.max(0, Math.min(1825, Math.floor(options.daysInCanadaLast5Years))) : 730;
  const daysCitizenSpouse = Number.isFinite(options.daysAbroadAccompanyingCitizenSpouse) ? Math.max(0, Math.min(1825, Math.floor(options.daysAbroadAccompanyingCitizenSpouse))) : 0;
  const daysCanadianJob = Number.isFinite(options.daysAbroadEmployedByCanadianBusiness) ? Math.max(0, Math.min(1825, Math.floor(options.daysAbroadEmployedByCanadianBusiness))) : 0;
  const daysAccompanyingPr = Number.isFinite(options.daysAbroadAccompanyingPrEmployed) ? Math.max(0, Math.min(1825, Math.floor(options.daysAbroadAccompanyingPrEmployed))) : 0;

  const urgentTravel = Boolean(options.hasUrgentTravelNeed);
  const travelDays = Number.isFinite(options.travelDepartureDaysFromNow) ? Math.max(0, Math.min(3650, Math.floor(options.travelDepartureDaysFromNow))) : 120;
  const rawUrgentCategory = boundedText(options.urgentReasonCategory, 'none', 60).toLowerCase();
  const urgentCategory = ['death_or_serious_illness', 'urgent_employment', 'own_serious_illness', 'other_humanitarian'].includes(rawUrgentCategory)
    ? rawUrgentCategory
    : 'none';

  const proofOfTravel = Boolean(options.hasProofOfTravel);
  const supportingProof = Boolean(options.hasSupportingUrgentProof);
  const insideCanada = options.isCurrentlyInsideCanada !== false;
  const applicant = boundedText(options.applicantName, 'PR Applicant', 120);
  const assessDate = safeIsoDate(options.assessmentDate, '2026-10-31');

  // 1. Calculate Statutory Physical Presence & Credit Days
  const totalCreditedDays = Math.min(
    PR_CARD_CONSTANTS.FIVE_YEAR_WINDOW_DAYS,
    daysInCanada + daysCitizenSpouse + daysCanadianJob + daysAccompanyingPr
  );
  const residencyObligationMet = totalCreditedDays >= PR_CARD_CONSTANTS.RESIDENCY_OBLIGATION_DAYS_REQUIRED;
  const daysShortfall = residencyObligationMet ? 0 : PR_CARD_CONSTANTS.RESIDENCY_OBLIGATION_DAYS_REQUIRED - totalCreditedDays;

  // 2. Urgent Processing Audit
  let qualifiesForUrgentProcessing = false;
  const urgentDisqualifiers = [];
  const urgentQualifiers = [];

  if (urgentTravel) {
    if (travelDays <= PR_CARD_CONSTANTS.URGENT_PROCESSING_TRAVEL_WINDOW_DAYS) {
      urgentQualifiers.push(`Travel departure is within ${travelDays} days (meets IRCC 90-day window).`);
    } else {
      urgentDisqualifiers.push(`Departure is in ${travelDays} days (IRCC urgent processing requires travel within 90 days).`);
    }

    if (proofOfTravel) {
      urgentQualifiers.push('Proof of travel (flight ticket, boarding pass, or itinerary with receipt) provided.');
    } else {
      urgentDisqualifiers.push('Missing proof of travel: Flight receipt, bus ticket, or official itinerary is mandatory for urgent review.');
    }

    if (urgentCategory !== 'none') {
      if (supportingProof) {
        urgentQualifiers.push(`Documented urgent rationale: ${urgentCategory.replace(/_/g, ' ')} with third-party corroboration.`);
      } else {
        urgentDisqualifiers.push(`Missing third-party evidence: ${urgentCategory.replace(/_/g, ' ')} requires doctor note, death certificate, or employer letter.`);
      }
    } else {
      urgentDisqualifiers.push('No recognized urgent ground selected (personal vacation or routine visits do not qualify for urgent processing).');
    }

    if (urgentQualifiers.length >= 3 && urgentDisqualifiers.length === 0) {
      qualifiesForUrgentProcessing = true;
    }
  }

  // 3. Document Application Route & Jurisdictional Form
  let applicationForm = 'IMM 5444';
  let portalChannel = 'IRCC PR Portal (Online)';
  let applicationFeeCad = PR_CARD_CONSTANTS.PR_CARD_APPLICATION_FEE_CAD;
  const statutoryProtections = [];
  const riskWarnings = [];
  const actionPlan = [];
  const requiredDocuments = [
    'Copy of primary identity document (valid passport page or previous PR Card)',
    'Proof of residency in Canada: Notice of Assessment (NOA), lease agreements, pay stubs, or utility bills for the past 5 years',
    'Two identical photos meeting IRCC PR card photographic specifications',
    'Official government receipt for $50 CAD processing fee'
  ];

  if (insideCanada) {
    statutoryProtections.push('IRPA s. 31(1): Permanent residents in Canada are entitled to be issued a Permanent Resident Card upon application.');
    if (!residencyObligationMet) {
      riskWarnings.push(`RESIDENCY BREACH RISK: Shortfall of ${daysShortfall} days. Submitting IMM 5444 may trigger a Residency Questionnaire (RQ) or Section 44(1) report leading to loss of PR status under IRPA s. 46.`);
      actionPlan.push('Remain physically present in Canada without leaving until you satisfy the 730-day requirement before applying.');
      actionPlan.push('If humanitarian & compassionate (H&C) factors apply (e.g. best interests of a child), prepare detailed medical and family hardship submissions.');
    } else {
      actionPlan.push('Submit Form IMM 5444 electronically via the IRCC PR Portal.');
      if (qualifiesForUrgentProcessing) {
        actionPlan.push('Upload urgent travel package (Proof of travel + Employer/Medical letter) under "Urgent Processing Request".');
      }
    }
  } else {
    // Outside Canada
    applicationForm = 'IMM 5524 (PRTD)';
    portalChannel = 'Permanent Resident Travel Document Portal';
    applicationFeeCad = PR_CARD_CONSTANTS.PRTD_APPLICATION_FEE_CAD;
    requiredDocuments.push('Form IMM 5524: Application for a Permanent Resident Travel Document');
    requiredDocuments.push('Travel itinerary confirming scheduled return flight to Canada');

    riskWarnings.push('COMMERCIAL BOARDING BAR: Airlines, trains, and maritime carriers cannot legally board a PR returning to Canada without a valid PR card or PRTD (IRPA s. 148(1)).');
    statutoryProtections.push('IRPA s. 31(3): A permanent resident outside Canada who does not hold a valid PR card shall be issued a travel document if residency obligation is satisfied.');
    statutoryProtections.push('LAND BORDER EXCEPTION: A PR may re-enter Canada from the United States at a land border crossing in a private vehicle using a Confirmation of Permanent Residence (COPR) or expired PR card.');

    if (!residencyObligationMet) {
      riskWarnings.push(`PRTD RESIDENCY REFUSAL: Visa office may issue a refusal and 60-day notice of appeal under IRPA s. 63(4). Consider appealing to the Immigration Appeal Division (IAD) within 60 days.`);
    } else {
      actionPlan.push('Submit Form IMM 5524 for an expedited PRTD through the PR Portal to secure commercial boarding rights.');
    }
  }

  return {
    applicantName: applicant,
    assessmentDate: assessDate,
    isCurrentlyInsideCanada: insideCanada,
    residencyAssessment: {
      daysInCanadaPhysical: daysInCanada,
      daysAbroadAccompanyingCitizenSpouse: daysCitizenSpouse,
      daysAbroadEmployedByCanadianBusiness: daysCanadianJob,
      daysAbroadAccompanyingPrEmployed: daysAccompanyingPr,
      totalCreditedDays,
      requiredDays: PR_CARD_CONSTANTS.RESIDENCY_OBLIGATION_DAYS_REQUIRED,
      residencyObligationMet,
      daysShortfall,
      compliancePercentage: Math.min(100, Number(((totalCreditedDays / PR_CARD_CONSTANTS.RESIDENCY_OBLIGATION_DAYS_REQUIRED) * 100).toFixed(1)))
    },
    urgentProcessing: {
      hasUrgentTravelNeed: urgentTravel,
      travelDepartureDaysFromNow: travelDays,
      urgentReasonCategory: urgentCategory,
      qualifiesForUrgentProcessing,
      urgentQualifiers,
      urgentDisqualifiers
    },
    applicationPathway: {
      recommendedForm: applicationForm,
      filingChannel: portalChannel,
      statutoryGovernmentFeeCad: applicationFeeCad,
      estimatedProcessing: qualifiesForUrgentProcessing ? 'Expedited (approx 1–3 weeks)' : 'Standard (approx 8–12 weeks)'
    },
    statutoryProtections,
    riskWarnings,
    requiredDocuments,
    actionPlan
  };
}
