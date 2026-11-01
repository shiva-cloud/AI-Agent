/**
 * BC Strata Property Bylaw Defense & Bill 44 Rental Restriction Repeal Engine
 *
 * Implements statutory assessment under:
 * - British Columbia Strata Property Act (SBC 1998 c. 43)
 * - Bill 44: Building and Strata Statutes Amendment Act, 2022 (SBC 2022 c. 41)
 * - BC Guide Dog and Service Dog Act (RSBC 1996 c. 177)
 * - Strata Property Regulation (B.C. Reg. 43/2000) ss. 7.1–7.2 (Fine limits)
 * - Civil Resolution Tribunal Act (SBC 2012 c. 25) (Strata property dispute jurisdiction)
 *
 * Key Statutory Rules:
 * - Rental Restriction Ban (Bill 44, s. 141): All residential strata rental restriction bylaws,
 *   rental limits, tenant screening requirements, and rental waitlists are void and unenforceable.
 *   (Short-term vacation rentals < 90 days may still be restricted).
 * - Age Restriction Ban (Bill 44, s. 123.1): Age restriction bylaws (e.g. 19+, 40+) are repealed;
 *   the only permitted age restriction is 55+ seniors housing. Spouses and caregivers are exempt.
 * - Pet Restrictions & Service Animals: Certified service/guide dogs are statutorily exempt from
 *   any pet bylaw limits (Guide Dog and Service Dog Act s. 3).
 * - Fine Maximums: Standard bylaw violation fines are capped at $200 (Strata Regulation s. 7.1).
 *   Any fine issued under an illegal rental bylaw is void ab initio.
 * - CRT Relief: Strata lot owners and tenants can apply to the Civil Resolution Tribunal for
 *   binding orders quashing unlawful bylaws or penalties.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const STRATA_CONSTANTS = Object.freeze({
  STANDARD_BYLAW_FINE_CAP_CAD: 200.0,
  CONTINUING_CONTRAVENTION_FREQUENCY_DAYS: 7,
  ONLY_PERMITTED_AGE_MINIMUM_YEARS: 55,
  CRT_ONLINE_FILING_FEE_CAD: 125.0,
  BILL_44_EFFECTIVE_DATE: '2022-11-24'
});

/**
 * Evaluates the statutory validity of strata bylaws, fines, and tenant restrictions in BC.
 *
 * @param {Object} options
 * @param {string} [options.disputeType='rental_restriction'] - 'rental_restriction', 'age_restriction', 'pet_bylaw', 'ev_charging', 'unlawful_fine'
 * @param {boolean} [options.isLongTermRental=true] - True for tenancy >= 90 days (vs short-term Airbnb)
 * @param {number} [options.rentalTermMonths=12] - Duration of proposed lease
 * @param {number} [options.strataAgeMinimum=19] - Bylaw minimum age (e.g. 19, 45, 55)
 * @param {boolean} [options.isCertifiedServiceDog=false] - Guide Dog and Service Dog Act certified
 * @param {number} [options.fineAmountLeviedCad=0] - Fines demanded by strata council
 * @param {boolean} [options.strataDemandedTenantScreening=false] - Strata demanded interview or fee
 * @param {boolean} [options.strataRefusedEvRequest=false] - Strata refused EV charger without reason
 * @param {string} [options.strataPlanNumber='EPS 1234'] - Strata plan number
 * @param {string} [options.unitNumber='304'] - Strata lot / unit number
 * @param {string} [options.ownerOrTenantName='Strata Resident'] - Name of applicant
 * @param {string} [options.assessmentDate='2026-10-31'] - Date of assessment
 * @returns {Object} Comprehensive BC Strata bylaw diagnostic
 */
export function evaluateBcStrataBylawDefense(options = {}) {
  const dispute = boundedText(options.disputeType, 'rental_restriction', 50).toLowerCase();
  const isLongTerm = options.isLongTermRental !== false;
  const termMonths = Number.isFinite(Number(options.rentalTermMonths))
    ? Math.max(1, Math.min(120, Math.floor(Number(options.rentalTermMonths))))
    : 12;
  const ageMin = Number.isFinite(Number(options.strataAgeMinimum))
    ? Math.max(0, Math.min(120, Math.floor(Number(options.strataAgeMinimum))))
    : 19;
  const serviceDog = Boolean(options.isCertifiedServiceDog);
  const fineCad = Number.isFinite(Number(options.fineAmountLeviedCad))
    ? Math.max(0, Math.min(100000, Number(options.fineAmountLeviedCad)))
    : 0;
  const demandedScreening = Boolean(options.strataDemandedTenantScreening);
  const refusedEv = Boolean(options.strataRefusedEvRequest);
  const strataPlan = boundedText(options.strataPlanNumber, 'EPS 1234', 50);
  const unitNum = boundedText(options.unitNumber, 'Unit', 20);
  const residentName = boundedText(options.ownerOrTenantName, 'Strata Resident', 100);
  const assessDate = safeIsoDate(options.assessmentDate, '2026-10-31');

  const violations = [];
  const statutoryProtections = [];
  const actionPlan = [];
  const riskWarnings = [];
  let isBylawEnforceable = true;
  let unlawfulFineRefundCad = 0;

  // 1. Rental Restriction Audit under Bill 44
  if (dispute === 'rental_restriction' || demandedScreening) {
    if (isLongTerm) {
      isBylawEnforceable = false;
      violations.push('Void residential rental restriction: Strata Property Act s. 141 (amended by Bill 44) completely invalidates residential rental restrictions, rental caps, and landlord waitlists.');
      statutoryProtections.push('Bill 44 (Nov 24, 2022): All rental restriction bylaws in residential strata corporations are statutorily repealed and unenforceable as a matter of provincial law.');
      if (demandedScreening) {
        violations.push('Unlawful tenant screening or approval: Strata corporations have no legal authority under the Strata Property Act to screen, approve, or interview prospective tenants.');
      }
      if (fineCad > 0) {
        unlawfulFineRefundCad += fineCad;
        violations.push(`Unlawful rental fine: $${fineCad.toFixed(2)} CAD fine levied for renting a unit is void ab initio.`);
      }
      actionPlan.push('Send formal notice to Strata Council citing Strata Property Act s. 141 (Bill 44) demanding immediate cancellation of rental restrictions.');
      actionPlan.push('Only Form K (Notice of Tenant\'s Responsibilities) must be submitted within 2 weeks of tenancy start under s. 146.');
    } else {
      // Short-term rental (< 90 days / Airbnb)
      isBylawEnforceable = true;
      riskWarnings.push('SHORT-TERM RENTAL EXCEPTION: Strata corporations retain full legal power under Bill 44 to restrict or prohibit short-term vacation rentals (under 90 days) such as Airbnb or VRBO.');
      statutoryProtections.push('BC Short-Term Rental Accommodations Act: Municipalities and stratas can enforce strict bans against vacation rentals.');
    }
  }

  // 2. Age Restriction Audit under Bill 44
  if (dispute === 'age_restriction') {
    if (ageMin === STRATA_CONSTANTS.ONLY_PERMITTED_AGE_MINIMUM_YEARS) {
      isBylawEnforceable = true;
      statutoryProtections.push('Strata Property Act s. 123.1(2): 55+ age restriction bylaws are permitted seniors housing.');
      statutoryProtections.push('Statutory Exemption for Families: Spouses, adult children, or caregivers of a 55+ resident are legally exempt and permitted to reside in the unit.');
    } else {
      isBylawEnforceable = false;
      violations.push(`Unlawful age bylaw (${ageMin}+): Bill 44 repealed all age-restriction bylaws other than 55+. Any bylaw restricting residence to 19+, 21+, 40+, or 45+ is statutorily void.`);
      statutoryProtections.push('Bill 44 s. 123.1: Stratas cannot prevent families with children, babies, or young adults from living in the building.');
      actionPlan.push(`Advise Strata Council that the ${ageMin}+ bylaw is nullified under provincial law.`);
    }
  }

  // 3. Pet Restriction & Service Animals
  if (dispute === 'pet_bylaw') {
    if (serviceDog) {
      isBylawEnforceable = false;
      violations.push('Unlawful pet restriction against certified service dog: Certified guide and service dogs are legally exempt from all strata pet bylaws.');
      statutoryProtections.push('Guide Dog and Service Dog Act (RSBC 1996 c. 177) s. 3: A strata bylaw that restricts the keeping of dogs does not apply to a certified guide dog or service dog team.');
      actionPlan.push('Provide copy of BC Guide Dog or Service Dog Certificate to Strata Council.');
    } else {
      isBylawEnforceable = true;
      statutoryProtections.push('Strata Property Act s. 121: Standard pet restriction bylaws (e.g. 1 dog or 1 cat, weight rules) remain legally enforceable if passed by 3/4 vote.');
      riskWarnings.push('GRANDFATHERING RULE: Pets living in the strata lot prior to the passing of a new pet restriction bylaw are statutorily grandfathered for their natural lifespan (s. 123).');
    }
  }

  // 4. EV Charging Request Audit (Bill 22)
  if (dispute === 'ev_charging' || refusedEv) {
    if (refusedEv) {
      violations.push('Unreasonable refusal of EV charging station: Strata Property Act s. 90.1 prohibits stratas from unreasonably refusing an owner\'s request to install EV supply equipment.');
      statutoryProtections.push('Bill 22 (2023) / Strata Property Act s. 90.1: Strata councils must follow statutory criteria and cannot unreasonably deny EV charging installations.');
      actionPlan.push('Submit structured EV request under Strata Property Act s. 90.1 offering to cover professional installation and electrical metering.');
    }
  }

  // 5. Fine Limits Audit
  if (fineCad > STRATA_CONSTANTS.STANDARD_BYLAW_FINE_CAP_CAD && !isLongTerm) {
    violations.push(`Excessive bylaw fine: Fine of $${fineCad.toFixed(2)} CAD exceeds statutory cap of $${STRATA_CONSTANTS.STANDARD_BYLAW_FINE_CAP_CAD.toFixed(2)} CAD under Strata Property Regulation s. 7.1.`);
    statutoryProtections.push(`Strata Regulation s. 7.1: The maximum fine a strata corporation may impose for contravention of a standard bylaw is $200 CAD.`);
  }

  // CRT Escalation
  actionPlan.push(`If dispute is unresolved within 14 days, file online claim with the BC Civil Resolution Tribunal (CRT) for $${STRATA_CONSTANTS.CRT_ONLINE_FILING_FEE_CAD} CAD fee.`);

  let summaryTitle = '';
  if (violations.length === 0) {
    summaryTitle = 'Strata Bylaw Valid & Enforceable under Strata Property Act';
  } else {
    summaryTitle = `${violations.length} Statutory Violations Identified (Bylaw / Fine Unenforceable under Bill 44)`;
  }

  return {
    residentName,
    strataPlanNumber: strataPlan,
    unitNumber: unitNum,
    disputeType: dispute,
    assessmentDate: assessDate,
    summaryTitle,
    isBylawEnforceable,
    unlawfulFineRefundCad,
    violations,
    statutoryProtections,
    riskWarnings,
    actionPlan,
    statutoryBasis: 'BC Strata Property Act (SBC 1998 c. 43), Bill 44 (2022), & Guide Dog and Service Dog Act'
  };
}
