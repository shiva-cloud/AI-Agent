/**
 * Northstar — Settlement Intelligence
 * Alberta Commercial Tenancies Distress & Lockout Defense Engine
 *
 * Statutory Authorities:
 * - Civil Enforcement Act, RSA 2000, c. C-15, Part 5 (Distress for Rent) ss. 33–42
 * - Civil Enforcement Regulation, Alta Reg 276/1995 (Forms & Notice periods)
 * - Personal Property Security Act (PPSA), RSA 2000, c. P-7
 * - Alberta Court of Appeal / Court of King's Bench Precedents:
 *   - B & S Holdings Ltd. v. 1083437 Alberta Ltd., 2011 ABQB 652 (Mutual exclusivity of distress and lease forfeiture)
 *   - Delaneys Bistro Ltd. v. K & S Holdings Ltd., 2005 ABQB 271 (Mandatory use of licensed civil enforcement agency)
 *   - 883015 Alberta Ltd. v. Redstone Enterprises Inc., 2007 ABCA 345 (14-day objection bar to sale)
 *
 * Invariants: Pure ES module, 0 npm dependencies, strict statutory accuracy, fail-safe defaults.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ALBERTA_DISTRESS_RULES = Object.freeze({
  OBJECTION_PERIOD_DAYS: 14,
  MINIMUM_HOLDING_BEFORE_SALE_DAYS: 5,
  REQUIRES_LICENSED_BAILIFF: true,
  MUTUALLY_EXCLUSIVE_TERMINATION: true,
  JURISDICTION: 'AB'
});

/**
 * Audits a commercial landlord distress or lockout action in Alberta.
 */
export function auditAlbertaCommercialDistress({
  rentArrearsClaimedCad = 15000,
  goodsEstimatedValueCad = 45000,
  isSeizureExecutedByLicensedAgency = true,
  hasLandlordChangedLocksOrTerminatedLease = false,
  wasDistressWarrantAndNoticeOfSeizureServed = true,
  wasNoticeOfObjectionFormProvided = true,
  daysElapsedSinceSeizure = 4,
  tenantFiledNoticeOfObjection = false,
  thirdPartyLeasedEquipmentIncluded = false,
  landlordThreatensImmediateSaleWithin5Days = false,
  tenantBusinessName = 'Commercial Tenant Ltd.',
  assessmentDate = todayIso()
} = {}) {
  const cleanBusinessName = boundedText(tenantBusinessName, 'Commercial Tenant Ltd.', 120);
  const cleanDate = safeIsoDate(assessmentDate, todayIso());
  const sanitizedArrears = Number.isFinite(Number(rentArrearsClaimedCad))
    ? Math.max(0, Math.min(100_000_000, Number(rentArrearsClaimedCad)))
    : 0;
  const sanitizedValue = Number.isFinite(Number(goodsEstimatedValueCad))
    ? Math.max(0, Math.min(100_000_000, Number(goodsEstimatedValueCad)))
    : 0;
  const sanitizedDays = Number.isFinite(Number(daysElapsedSinceSeizure))
    ? Math.max(0, Math.min(3650, Math.floor(Number(daysElapsedSinceSeizure))))
    : 0;

  const deficiencies = [];
  const compliancePoints = [];
  const statutoryRemedies = [];
  const civilViolations = [];

  // 1. Mandatory Civil Enforcement Agency (CEA s. 34)
  if (!isSeizureExecutedByLicensedAgency) {
    civilViolations.push('UNLICENSED_SELF_HELP_SEIZURE');
    deficiencies.push(
      'Under the Alberta Civil Enforcement Act (RSA 2000, c. C-15, s. 34), a commercial landlord CANNOT personally seize tenant goods. Distress MUST be conducted by a licensed civil enforcement agency (bailiff). Personal seizure by the landlord or property manager constitutes unlawful conversion and civil trespass to chattels (Delaneys Bistro Ltd. v. K & S Holdings Ltd.).'
    );
  } else {
    compliancePoints.push(
      'Seizure was formally executed through an authorized, licensed Alberta civil enforcement agency.'
    );
  }

  // 2. Doctrine of Mutual Exclusivity: Distress vs Lease Termination / Lockout
  if (hasLandlordChangedLocksOrTerminatedLease) {
    civilViolations.push('MUTUAL_EXCLUSIVITY_BREACH_FORFEITURE');
    deficiencies.push(
      'Mutual Exclusivity Doctrine (B & S Holdings Ltd. v. 1083437 Alberta Ltd.): In Alberta commercial tenancy law, distress and lease forfeiture are mutually exclusive remedies. A landlord cannot terminate the lease (e.g., changing locks, issuing notice of termination) AND distrain goods. Changing the locks waives the right of distress, rendering any seizure void ab initio.'
    );
  } else {
    compliancePoints.push(
      'Tenancy remains legally subsisting; landlord has not unlawfully conflated distress with lease termination.'
    );
  }

  // 3. Statutory Forms & 14-Day Objection Period (CEA ss. 37-39)
  if (!wasDistressWarrantAndNoticeOfSeizureServed) {
    civilViolations.push('MISSING_STATUTORY_NOTICE_OF_SEIZURE');
    deficiencies.push(
      'Failure to serve formal Notice of Seizure of Personal Property (Form 3) and inventory of seized items violates Civil Enforcement Regulation s. 14.'
    );
  } else {
    compliancePoints.push('Statutory Notice of Seizure and inventory served on tenant.');
  }

  if (!wasNoticeOfObjectionFormProvided) {
    civilViolations.push('OMISSION_OF_NOTICE_OF_OBJECTION');
    deficiencies.push(
      'The bailiff/agency is statutorily required to serve a blank Notice of Objection to Seizure of Personal Property (Form 4) alongside the seizure notice.'
    );
  } else {
    compliancePoints.push('Statutory Form 4 Notice of Objection provided to tenant.');
  }

  // Objection timeline audit
  const daysRemainingToObject = Math.max(
    0,
    ALBERTA_DISTRESS_RULES.OBJECTION_PERIOD_DAYS - sanitizedDays
  );
  const isWithinObjectionWindow = sanitizedDays <= ALBERTA_DISTRESS_RULES.OBJECTION_PERIOD_DAYS;

  if (tenantFiledNoticeOfObjection) {
    compliancePoints.push(
      'Tenant has served a formal Notice of Objection. Under CEA s. 38, the civil enforcement agency is STATUTORILY BARRED from selling or disposing of the goods without an authorizing Order from the Court of King’s Bench.'
    );
    statutoryRemedies.push({
      action: 'Demand Statutory Stay of Sale',
      authority: 'Civil Enforcement Act, s. 38',
      description:
        'Confirm with the civil enforcement agency in writing that Form 4 Notice of Objection was received. The agency cannot conduct an appraisal or public auction without a King’s Bench order.'
    });
  } else if (isWithinObjectionWindow) {
    statutoryRemedies.push({
      action: 'Serve Form 4 Notice of Objection to Civil Enforcement Agency',
      authority: 'Civil Enforcement Act, s. 37',
      timeline: `Must be served within ${daysRemainingToObject} day(s) (14-day statutory deadline)`,
      description:
        'Deliver Notice of Objection immediately to halt any sale of inventory, equipment, or tools.'
    });
  } else {
    deficiencies.push(
      `The 14-day statutory objection period expired ${
        sanitizedDays - ALBERTA_DISTRESS_RULES.OBJECTION_PERIOD_DAYS
      } day(s) ago. Agency may proceed with appraisal and sale after proper advertisement unless emergency court relief is obtained.`
    );
  }

  // 4. Minimum 5-Day Holding Period Before Sale (CEA s. 40)
  if (landlordThreatensImmediateSaleWithin5Days || sanitizedDays < 5) {
    compliancePoints.push(
      'Under CEA s. 40, distrained property cannot be sold until at least 5 clear days have elapsed following seizure, allowing the tenant the opportunity to redeem goods or serve an objection.'
    );
    if (landlordThreatensImmediateSaleWithin5Days) {
      civilViolations.push('PREMATURE_SALE_THREAT');
      deficiencies.push(
        'Threatening or attempting sale of seized chattels within 5 days of seizure violates Civil Enforcement Act s. 40.'
      );
    }
  }

  // 5. Third-Party Leased Equipment Protection
  if (thirdPartyLeasedEquipmentIncluded) {
    civilViolations.push('SEIZURE_OF_THIRD_PARTY_PROPERTY');
    deficiencies.push(
      'Seizure includes third-party leased or financed equipment. Under CEA s. 36, third-party goods are exempt from commercial landlord distress upon delivery of a statutory declaration of ownership.'
    );
    statutoryRemedies.push({
      action: 'Deliver Statutory Declaration of Third-Party Ownership',
      authority: 'Civil Enforcement Act, s. 36 & PPSA s. 20',
      description:
        'Notify equipment leasing companies and have them serve a Statutory Declaration and PPSA search certificate on the bailiff to secure immediate release of third-party assets.'
    });
  }

  // Overall Verdict
  let legalVerdict = 'LAWFUL_PENDING_DISTRESS';
  if (civilViolations.length > 0) {
    legalVerdict = 'UNLAWFUL_DISTRESS_OR_CONVERSION';
  } else if (tenantFiledNoticeOfObjection) {
    legalVerdict = 'CONTESTED_DISTRESS_STAYED_PENDING_COURT_ORDER';
  }

  const summary =
    legalVerdict === 'LAWFUL_PENDING_DISTRESS'
      ? `Distress procedure is currently compliant with the Alberta Civil Enforcement Act. Tenant has ${daysRemainingToObject} day(s) remaining to serve Form 4 Notice of Objection to freeze sale proceedings.`
      : `Distress action is tainted by ${civilViolations.length} statutory violation(s) (${civilViolations.join(
          ', '
        )}). Tenant has substantial grounds to demand immediate release of chattels and seek civil damages for wrongful distress and trespass.`;

  return {
    assessmentDate: cleanDate,
    tenantBusinessName: cleanBusinessName,
    statutoryAuthority: 'Civil Enforcement Act, RSA 2000, c. C-15, Part 5 (Distress for Rent) & Alberta Common Law',
    legalVerdict,
    summary,
    rentArrearsClaimedCad: sanitizedArrears,
    goodsEstimatedValueCad: sanitizedValue,
    daysElapsedSinceSeizure: sanitizedDays,
    daysRemainingToServeObjection: daysRemainingToObject,
    isWithinObjectionWindow,
    civilViolations,
    deficiencies,
    compliancePoints,
    statutoryRemedies,
    jurisdiction: 'AB'
  };
}
