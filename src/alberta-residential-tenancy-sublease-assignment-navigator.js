/**
 * Alberta Residential Tenancies Act (RTA) Sublease & Assignment Navigator
 *
 * Implements statutory assessment rules under:
 * - Residential Tenancies Act, SA 2004, c. R-17.1:
 *   - Section 22: Assignment and subleasing (Written consent, 14-day rule, deemed consent, fee prohibition)
 *   - Section 23: Refusal of consent (Reasonableness standard, legitimate grounds)
 *   - Section 24: Tenant's remedies (RTDRS application to authorize or terminate)
 * - Residential Tenancy Dispute Resolution Service (RTDRS) Rules of Practice and Procedure
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ALBERTA_LANDLORD_RESPONSE_WINDOW_DAYS = 14;

export const REASONABLE_REFUSAL_GROUNDS = Object.freeze([
  'INSUFFICIENT_FINANCIAL_ABILITY_OR_POOR_CREDIT',
  'OCCUPANCY_EXCEEDS_MUNICIPAL_OR_SAFETY_BYLAWS',
  'DOCUMENTED_HISTORY_OF_SEVERE_PROPERTY_DAMAGE',
  'REFUSAL_TO_PROVIDE_REASONABLE_VERIFICATION_DOCUMENTS'
]);

export function evaluateAlbertaTenancySubleaseAssignment(params = {}) {
  const {
    transactionType = 'ASSIGNMENT', // 'ASSIGNMENT' or 'SUBLEASE'
    requestDeliveredDate = '2026-10-01',
    currentDate = todayIso(),
    landlordResponseStatus = 'NO_RESPONSE', // 'CONSENTED', 'REFUSED_WITH_REASONS', 'REFUSED_WITHOUT_REASONS', 'NO_RESPONSE'
    refusalReasonCategory = '', // from REASONABLE_REFUSAL_GROUNDS or arbitrary
    refusalReasonExplanation = '',
    feeChargedForConsentCad = 0,
    tenantName = 'Tenant',
    landlordName = 'Landlord',
    assessmentDate = todayIso()
  } = params;

  const cleanTransactionType = boundedText(transactionType, 'ASSIGNMENT', 30);
  const cleanRefusalCategory = boundedText(refusalReasonCategory, '', 100);
  const cleanRefusalExplanation = boundedText(refusalReasonExplanation, '', 200);
  const cleanTenant = boundedText(tenantName, 'Tenant', 120);
  const cleanLandlord = boundedText(landlordName, 'Landlord', 120);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const isValidIso = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.trim()) && !Number.isNaN(Date.parse(d.trim()));
  const hasValidReq = isValidIso(requestDeliveredDate);
  const hasValidCurr = isValidIso(currentDate);

  const safeReqDate = hasValidReq ? requestDeliveredDate.trim() : '2026-10-01';
  const safeCurrDate = hasValidCurr ? currentDate.trim() : cleanAssessmentDate;

  const tReq = Date.parse(safeReqDate);
  const tCurr = Date.parse(safeCurrDate);
  const daysElapsed = (hasValidReq && hasValidCurr && !Number.isNaN(tReq) && !Number.isNaN(tCurr))
    ? Math.max(0, Math.floor((tCurr - tReq) / (1000 * 60 * 60 * 24)))
    : 0;

  const is14DayDeadlinePassed = daysElapsed > ALBERTA_LANDLORD_RESPONSE_WINDOW_DAYS;
  const daysRemainingInWindow = Math.max(0, ALBERTA_LANDLORD_RESPONSE_WINDOW_DAYS - daysElapsed);
  const fee = Number.isFinite(Number(feeChargedForConsentCad))
    ? Math.max(0, Math.min(100000, Number(feeChargedForConsentCad)))
    : 0;

  const statutoryFindings = [];
  const statutoryViolations = [];
  const actionableRemedies = [];

  let isStatutorilyDeemedConsented = false;
  let isUnreasonableRefusal = false;
  let hasIllegalConsentFee = false;

  // 1. Fee Prohibition Audit (Alberta RTA s. 22(6))
  if (fee > 0) {
    hasIllegalConsentFee = true;
    statutoryViolations.push({
      violation: 'PROHIBITED_CONSENT_FEE_SURCHARGE',
      section: 'Alberta RTA s. 22(6)',
      details: `Landlord charged $${fee} CAD for consent. Section 22(6) strictly prohibits landlords from charging any fee for giving consent to an assignment or sublease.`
    });
    actionableRemedies.push(`Demand immediate refund of the $${fee} CAD unlawful consent fee or deduct from next rental payment with RTDRS confirmation.`);
  }

  // 2. Fourteen-Day Deemed Consent Rule (Alberta RTA s. 22(3) & s. 22(4))
  if (landlordResponseStatus === 'NO_RESPONSE') {
    if (is14DayDeadlinePassed) {
      isStatutorilyDeemedConsented = true;
      statutoryFindings.push({
        finding: 'STATUTORILY_DEEMED_CONSENT',
        section: 'Alberta RTA s. 22(4)',
        details: `Landlord failed to deliver written notice of decision within 14 calendar days (${daysElapsed} days elapsed). Under s. 22(4), the landlord is DEEMED to have given consent.`
      });
      actionableRemedies.push(
        'Tenant and proposed assignee/subtenant may proceed immediately with the transfer of occupancy.',
        'Landlord cannot evict assignee or claim breach of lease for unauthorized transfer.'
      );
    } else {
      statutoryFindings.push({
        finding: 'PENDING_WITHIN_STATUTORY_WINDOW',
        section: 'Alberta RTA s. 22(3)',
        details: `Request is in progress. ${daysRemainingInWindow} day(s) remain for landlord to deliver written decision.`
      });
    }
  } else if (landlordResponseStatus === 'CONSENTED') {
    statutoryFindings.push({
      finding: 'FORMAL_CONSENT_GRANTED',
      section: 'Alberta RTA s. 22(1)',
      details: 'Landlord provided written consent. Proceed with formal assignment or sublease agreement.'
    });
  } else if (landlordResponseStatus === 'REFUSED_WITHOUT_REASONS' || landlordResponseStatus === 'REFUSED_WITH_REASONS') {
    // 3. Reasonableness of Refusal (Alberta RTA s. 22(2) & s. 23)
    const isGroundRecognized = REASONABLE_REFUSAL_GROUNDS.includes(cleanRefusalCategory);

    if (landlordResponseStatus === 'REFUSED_WITHOUT_REASONS') {
      isUnreasonableRefusal = true;
      statutoryViolations.push({
        violation: 'REFUSAL_WITHOUT_REASONS',
        section: 'Alberta RTA s. 22(2) & s. 23',
        details: 'Landlord refused consent without stating reasonable grounds, violating the reasonableness standard of Section 22(2).'
      });
    } else if (!isGroundRecognized) {
      isUnreasonableRefusal = true;
      statutoryViolations.push({
        violation: 'ARBITRARY_OR_UNREASONABLE_REFUSAL',
        section: 'Alberta RTA s. 22(2)',
        details: `Stated refusal reason ('${cleanRefusalExplanation || cleanRefusalCategory}') does not constitute reasonable grounds under Section 23.`
      });
    } else {
      statutoryFindings.push({
        finding: 'COMMERCIALLY_REASONABLE_REFUSAL',
        section: 'Alberta RTA s. 23',
        details: `Refusal is supported by recognized statutory ground: ${cleanRefusalCategory}.`
      });
    }

    if (isUnreasonableRefusal) {
      actionableRemedies.push(
        'File an application with the Residential Tenancy Dispute Resolution Service (RTDRS) under Section 24.',
        'RTDRS remedies include: an order authorizing the assignment/sublease, an order terminating the tenancy agreement, or damages.'
      );
    }
  }

  const legalVerdict = isStatutorilyDeemedConsented
    ? 'DEEMED_STATUTORY_CONSENT_ESTABLISHED'
    : (isUnreasonableRefusal ? 'ACTIONABLE_UNREASONABLE_REFUSAL_RTDRS' : (landlordResponseStatus === 'CONSENTED' ? 'CONSENT_GRANTED' : 'IN_PROGRESS_AWAITING_REPLY'));

  return {
    assessmentDate: cleanAssessmentDate,
    jurisdiction: 'ALBERTA',
    tenantName: cleanTenant,
    landlordName: cleanLandlord,
    requestDeliveredDate: safeReqDate,
    currentDate: safeCurrDate,
    transactionType: cleanTransactionType,
    legalVerdict,
    rightsAssessment: {
      is14DayDeadlinePassed,
      daysElapsedSinceRequest: daysElapsed,
      daysRemainingInWindow,
      isStatutorilyDeemedConsented,
      isUnreasonableRefusal,
      hasIllegalConsentFee,
      unlawfulFeeAmountCad: fee
    },
    statutoryFindings,
    statutoryViolations,
    actionableRemedies,
    statutoryCitations: [
      'Residential Tenancies Act, SA 2004, c. R-17.1, ss. 22, 23, 24',
      'Residential Tenancy Dispute Resolution Service (RTDRS) Rules of Practice and Procedure'
    ]
  };
}
