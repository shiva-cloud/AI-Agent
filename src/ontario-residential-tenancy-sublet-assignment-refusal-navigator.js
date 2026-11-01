/**
 * Ontario Residential Tenancies Act (RTA) Sublet & Assignment Refusal Navigator
 *
 * Implements statutory assessment rules under:
 * - Residential Tenancies Act, 2006, S.O. 2006, c. 17:
 *   - Section 95: Assignment of tenancy (General vs Specific requests, 7-day rule, 30-day N9 right)
 *   - Section 97: Subletting rental unit (Mandatory consent, unreasonable refusal prohibition)
 *   - Section 98: Tenant's application to Board (Form A2 remedies)
 *   - Section 134: Illegal additional charges prohibition (reimbursement limited to reasonable out-of-pocket expenses)
 * - Landlord and Tenant Board (LTB) Interpretation Guideline 21: Landlords, Tenants, Occupants and Residential Tenancies
 */

import { boundedText } from './text-input.js';

export const RTA_STATUTORY_TIMELINES = Object.freeze({
  LANDLORD_RESPONSE_DEADLINE_DAYS: 7,
  TENANT_N9_ELECTION_WINDOW_DAYS: 30,
  TENANT_TERMINATION_NOTICE_DAYS: 30,
  LTB_APPLICATION_LIMITATION_YEARS: 1
});

export function evaluateOntarioTenancyAssignmentSublet(params = {}) {
  const {
    requestType = 'ASSIGNMENT', // 'ASSIGNMENT' or 'SUBLET'
    isGeneralRequest = true, // for assignment: general permission vs specific candidate
    daysSinceRequestMade = 8,
    landlordResponse = 'NO_RESPONSE', // 'CONSENTED', 'REFUSED_GENERALLY', 'REFUSED_SPECIFICALLY', 'NO_RESPONSE'
    refusalReason = '',
    outOfPocketFeeChargedCad = 0,
    actualDirectExpenseIncurredCad = 0,
    tenantWishesToTerminate = true
  } = params;

  const normalizedType = String(requestType).trim().toUpperCase();
  const isAssignment = normalizedType === 'ASSIGNMENT';
  const isSublet = normalizedType === 'SUBLET';

  const cleanRefusalReason = boundedText(refusalReason, '');
  const daysPassed = Number.isFinite(Number(daysSinceRequestMade)) ? Math.max(0, Math.min(365, Math.floor(Number(daysSinceRequestMade)))) : 8;
  const outOfPocketFee = Number.isFinite(Number(outOfPocketFeeChargedCad)) ? Math.max(0, Math.min(10000, Number(outOfPocketFeeChargedCad))) : 0;
  const actualExpense = Number.isFinite(Number(actualDirectExpenseIncurredCad)) ? Math.max(0, Math.min(10000, Number(actualDirectExpenseIncurredCad))) : 0;

  const statutoryFindings = [];
  const actionableRemedies = [];
  const riskWarnings = [];

  let is7DayDeadlineBreached = false;
  let canTenantGive30DayN9 = false;
  let isArbitraryOrUnreasonableRefusal = false;
  let hasIllegalAdministrativeCharge = false;
  let illegalChargeAmountCad = 0;

  // Fee audit (s. 95(7) / s. 134)
  if (outOfPocketFee > actualExpense) {
    hasIllegalAdministrativeCharge = true;
    illegalChargeAmountCad = outOfPocketFee - actualExpense;
    statutoryFindings.push({
      finding: 'ILLEGAL_ADMINISTRATIVE_FEE',
      section: 'RTA s. 95(7) & s. 134',
      details: `Landlord charged $${outOfPocketFee} CAD but actual direct out-of-pocket costs were $${actualExpense} CAD. The excess $${illegalChargeAmountCad} CAD constitutes an illegal charge recoverable via LTB Form T1.`
    });
    actionableRemedies.push('File LTB Form T1 (Tenant Application for a Rebate of Money the Landlord Owes) for refund of illegal assignment/sublet fee.');
  }

  if (isAssignment) {
    if (landlordResponse === 'CONSENTED') {
      statutoryFindings.push({
        finding: 'LANDLORD_CONSENT_GRANTED',
        section: 'RTA s. 95(1)',
        details: 'Landlord consented to assignment. Proceed with assignment agreement.'
      });
    } else if (isGeneralRequest) {
      // General assignment request under s. 95(2) and s. 95(3)
      if (landlordResponse === 'REFUSED_GENERALLY' || (landlordResponse === 'NO_RESPONSE' && daysPassed > RTA_STATUTORY_TIMELINES.LANDLORD_RESPONSE_DEADLINE_DAYS)) {
        if (landlordResponse === 'NO_RESPONSE' && daysPassed > RTA_STATUTORY_TIMELINES.LANDLORD_RESPONSE_DEADLINE_DAYS) {
          is7DayDeadlineBreached = true;
          statutoryFindings.push({
            finding: 'STATUTORY_SEVEN_DAY_BREACH',
            section: 'RTA s. 95(4)(a)',
            details: `Landlord failed to respond within ${RTA_STATUTORY_TIMELINES.LANDLORD_RESPONSE_DEADLINE_DAYS} calendar days after general assignment request.`
          });
        } else {
          statutoryFindings.push({
            finding: 'GENERAL_ASSIGNMENT_REFUSAL',
            section: 'RTA s. 95(4)(a)',
            details: 'Landlord refused general permission to assign the tenancy.'
          });
        }

        canTenantGive30DayN9 = true;
        actionableRemedies.push(
          'Tenant has the statutory right under RTA s. 95(4) to serve Form N9 (Tenant\'s Notice to End the Tenancy) with a minimum of 30 days\' notice.',
          'Notice MUST be delivered within 30 days after the date the request was made.',
          'The termination date DOES NOT have to be the end of the term or the rental period (RTA s. 95(4) statutory exemption).'
        );
      }
    } else {
      // Specific assignment request (s. 95(4)(b) & s. 95(5))
      if (landlordResponse === 'NO_RESPONSE' && daysPassed > RTA_STATUTORY_TIMELINES.LANDLORD_RESPONSE_DEADLINE_DAYS) {
        is7DayDeadlineBreached = true;
        canTenantGive30DayN9 = true;
        statutoryFindings.push({
          finding: 'FAILURE_TO_RESPOND_TO_CANDIDATE',
          section: 'RTA s. 95(4)(b)',
          details: 'Landlord failed to reply to specific candidate within 7 calendar days.'
        });
        actionableRemedies.push('Tenant may serve Form N9 with 30 days notice under s. 95(4).');
      } else if (landlordResponse === 'REFUSED_SPECIFICALLY') {
        const arbitraryPatterns = /no pets|arbitrary|personal dislike|blanket policy|student|single parent|race|religion/i;
        if (!cleanRefusalReason || arbitraryPatterns.test(cleanRefusalReason)) {
          isArbitraryOrUnreasonableRefusal = true;
          statutoryFindings.push({
            finding: 'ARBITRARY_OR_UNREASONABLE_REFUSAL',
            section: 'RTA s. 95(5) & s. 98',
            details: `Refusal reason ('${cleanRefusalReason || 'None provided'}') appears arbitrary or discriminatory under the Ontario Human Rights Code and RTA s. 95(5).`
          });
        }

        canTenantGive30DayN9 = true;
        actionableRemedies.push(
          'Option A: Tenant may terminate the tenancy on 30 days\' notice using Form N9 under s. 95(4).',
          'Option B: If tenant prefers to remain and enforce the assignment, tenant may file LTB Form A2 under RTA s. 98 for an order authorizing the assignment or damages.'
        );
      }
    }
  } else if (isSublet) {
    // Subletting under Section 97
    if (landlordResponse === 'CONSENTED') {
      statutoryFindings.push({
        finding: 'SUBLET_CONSENT_GRANTED',
        section: 'RTA s. 97(1)',
        details: 'Landlord consented to sublet. Subtenant may occupy for agreed term.'
      });
    } else if (landlordResponse === 'REFUSED_SPECIFICALLY' || landlordResponse === 'REFUSED_GENERALLY' || (landlordResponse === 'NO_RESPONSE' && daysPassed > RTA_STATUTORY_TIMELINES.LANDLORD_RESPONSE_DEADLINE_DAYS)) {
      const arbitraryPatterns = /no pets|arbitrary|personal dislike|blanket policy|student|single parent|race|religion/i;
      if (!cleanRefusalReason || arbitraryPatterns.test(cleanRefusalReason) || landlordResponse === 'NO_RESPONSE') {
        isArbitraryOrUnreasonableRefusal = true;
        statutoryFindings.push({
          finding: 'UNREASONABLE_SUBLET_REFUSAL',
          section: 'RTA s. 97(2)',
          details: 'Landlord may not arbitrarily or unreasonably withhold consent to a sublet under RTA s. 97(2).'
        });
      }

      actionableRemedies.push(
        'Tenant may file Form A2 (Application about Subletting or Assigning) at the Landlord and Tenant Board under RTA s. 98.',
        'LTB remedies under s. 98 include: authorizing the sublet, terminating the tenancy, or ordering rent abatement compensation.'
      );

      riskWarnings.push({
        warning: 'SUBLET_N9_LIMITATION',
        details: 'Unlike assignment under s. 95(4), the RTA does not explicitly guarantee an automatic 30-day Form N9 termination right for sublet refusals; tenant must seek an order terminating the tenancy via LTB Form A2 unless landlord mutually agrees.'
      });
    }
  }

  const legalVerdict = canTenantGive30DayN9
    ? 'ELIGIBLE_FOR_IMMEDIATE_30_DAY_N9_TERMINATION'
    : isArbitraryOrUnreasonableRefusal
      ? 'ACTIONABLE_LTB_FORM_A2_UNREASONABLE_REFUSAL'
      : (landlordResponse === 'CONSENTED' ? 'CONSENT_GRANTED' : 'IN_PROGRESS_WITHIN_DEADLINE');

  return {
    requestType: normalizedType,
    legalVerdict,
    rightsAssessment: {
      is7DayDeadlineBreached,
      canTenantGive30DayN9,
      isArbitraryOrUnreasonableRefusal,
      hasIllegalAdministrativeCharge,
      illegalChargeAmountCad
    },
    statutoryFindings,
    actionableRemedies,
    riskWarnings,
    proceduralTimelines: {
      daysSinceRequest: daysPassed,
      statutoryDeadlineDays: RTA_STATUTORY_TIMELINES.LANDLORD_RESPONSE_DEADLINE_DAYS,
      n9NoticePeriodDays: RTA_STATUTORY_TIMELINES.TENANT_TERMINATION_NOTICE_DAYS,
      n9ElectionWindowDays: RTA_STATUTORY_TIMELINES.TENANT_N9_ELECTION_WINDOW_DAYS
    },
    statutoryCitations: [
      'Residential Tenancies Act, 2006, S.O. 2006, c. 17, ss. 95, 97, 98, 134',
      'LTB Interpretation Guideline 21: Landlords, Tenants, Occupants and Residential Tenancies'
    ]
  };
}
