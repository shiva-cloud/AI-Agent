/**
 * Commercial Lease Review & Newcomer Small Business Tenancy Defense Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Ontario Commercial Tenancies Act, R.S.O. 1990, c. C.19:
 *   - s. 18(1) (15-day statutory right of re-entry and lockout for unpaid rent)
 *   - s. 19(2) (Mandatory notice before re-entry or forfeiture for non-rent breach)
 *   - ss. 39-53 (Distress for rent: seizure of commercial goods, appraisal, and 5-day sale)
 *   - s. 23 (Landlord's covenant not to unreasonably withhold consent to assignment)
 * - British Columbia Commercial Tenancy Act, [RSBC 1996] c. 57:
 *   - Distress, landlord remedies, and recovery of premises
 * - Common Law & Contractual Doctrines:
 *   - Highway Properties Ltd. v. Kelly, Douglas & Co. Ltd. [1971] S.C.R. 562 (Landlord remedies on repudiation)
 *   - Personal Guarantee & Indemnity liability bounds
 *   - Absence of statutory rent control in Canadian commercial tenancies
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const COMMERCIAL_LEASE_CONSTANTS = Object.freeze({
  ONTARIO_CTA_DEFAULT_REENTRY_DAYS: 15,
  ONTARIO_DISTRAINT_HOLD_DAYS: 5,
  BASIC_LIMITATION_YEARS: 2
});

export const COMMERCIAL_LEASE_TYPES = Object.freeze({
  triple_net_nnn: {
    label: 'Triple Net (NNN) Lease',
    description: 'Tenant pays base rent plus all proportional TMI (Property Taxes, Building Insurance, and Common Area Maintenance/CAM).'
  },
  gross_lease: {
    label: 'Gross (Full Service) Lease',
    description: 'Tenant pays a flat monthly rent; landlord pays all operating costs, taxes, and maintenance from the rent collected.'
  },
  modified_gross: {
    label: 'Modified Gross / Semi-Gross Lease',
    description: 'Tenant pays base rent plus designated utilities or increases over a base year expense threshold.'
  }
});

/**
 * Diagnostic evaluation of commercial tenancy contracts, 15-day lockout rights,
 * distraint / distress for rent, personal guarantee liability, and TMI operating cost audits.
 */
export function evaluateCommercialLease(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    province = 'ON',
    baseRentMonthlyCad = 3500,
    additionalRentMonthlyCad = 1500,
    squareFootage = 1200,
    leaseTermYears = 5,
    yearsRemaining = 3.5,
    hasPersonalGuarantee = true,
    isRentOverdue = false,
    daysRentOverdue = 0,
    landlordLockoutThreat = false,
    disputedTmiChargesCad = 3600,
    landlordRefusedAssignment = false,
    tenantBusinessName = 'Newcomer Cafe & Bakery Ltd.',
    landlordName = 'Commercial Property Holdings Inc.',
    premisesAddress = '450 Queen St W, Unit 102, Toronto, ON',
    assessmentDate = todayIso()
  } = safeParams;
  const prov = boundedText(province, 'ON', 10).toUpperCase();
  const baseRent = Number.isFinite(Number(baseRentMonthlyCad)) ? Math.max(0, Math.min(10000000, Number(baseRentMonthlyCad))) : 0;
  const addlRent = Number.isFinite(Number(additionalRentMonthlyCad)) ? Math.max(0, Math.min(10000000, Number(additionalRentMonthlyCad))) : 0;
  const sqft = Number.isFinite(Number(squareFootage)) ? Math.max(1, Math.min(10000000, Number(squareFootage))) : 1;
  const termYrs = Number.isFinite(Number(leaseTermYears)) ? Math.max(0.1, Math.min(99, Number(leaseTermYears))) : 1;
  const remYrs = Number.isFinite(Number(yearsRemaining)) ? Math.max(0, Math.min(termYrs, Number(yearsRemaining))) : 0;
  const personalGuarantee = Boolean(hasPersonalGuarantee);
  const overdue = Boolean(isRentOverdue);
  const overdueDays = Number.isFinite(Number(daysRentOverdue)) ? Math.max(0, Math.min(36500, Math.floor(Number(daysRentOverdue)))) : 0;
  const lockoutThreat = Boolean(landlordLockoutThreat);
  const disputedTmi = Number.isFinite(Number(disputedTmiChargesCad)) ? Math.max(0, Math.min(100000000, Number(disputedTmiChargesCad))) : 0;
  const refusedAssign = Boolean(landlordRefusedAssignment);

  // Safe text bounds
  const bizName = boundedText(tenantBusinessName, 'Commercial Tenant', 120);
  const lName = boundedText(landlordName, 'Commercial Landlord', 120);
  const address = boundedText(premisesAddress, 'Commercial Unit', 150);
  const assessDate = safeIsoDate(assessmentDate, todayIso());

  // Financial calculations
  const grossMonthlyRentCad = baseRent + addlRent;
  const annualGrossRentCad = grossMonthlyRentCad * 12;
  const grossRentPerSqFtCad = Math.round((annualGrossRentCad / sqft) * 100) / 100;
  const remainingMonths = Math.round(remYrs * 12);
  const totalRemainingLeaseCommitmentCad = grossMonthlyRentCad * remainingMonths;

  // Personal Guarantee Exposure
  const personalGuaranteeExposureCad = personalGuarantee ? totalRemainingLeaseCommitmentCad : 0;

  // Lockout & Re-entry Risk Audit (Ontario CTA s. 18)
  let lockoutRiskLevel = 'none';
  const statutoryRisks = [];

  if (prov === 'ON') {
    if (overdue && overdueDays >= COMMERCIAL_LEASE_CONSTANTS.ONTARIO_CTA_DEFAULT_REENTRY_DAYS) {
      lockoutRiskLevel = 'imminent';
      statutoryRisks.push({
        code: 'IMMINENT_CTA_SECTION_18_LOCKOUT',
        severity: 'CRITICAL',
        title: 'Statutory Right of Re-entry & Lockout Triggered',
        message: `Rent is ${overdueDays} days overdue. Under Ontario Commercial Tenancies Act s. 18(1), when rent is unpaid for 15 days, the landlord has the statutory right to re-enter, change locks, and forfeit the lease WITHOUT A COURT ORDER. Residential RTA protections DO NOT apply.`
      });
    } else if (overdue && overdueDays > 0) {
      lockoutRiskLevel = 'high';
      const daysUntilLockout = Math.max(0, COMMERCIAL_LEASE_CONSTANTS.ONTARIO_CTA_DEFAULT_REENTRY_DAYS - overdueDays);
      statutoryRisks.push({
        code: 'COUNTDOWN_TO_REENTRY',
        severity: 'HIGH',
        title: `Grace Period Expiring: ${daysUntilLockout} Days Until Statutory Lockout`,
        message: `Under Ontario CTA s. 18(1), the landlord can lock you out on day 15 of rent arrears. You have approximately ${daysUntilLockout} days to cure the default.`
      });
    } else if (lockoutThreat) {
      lockoutRiskLevel = 'moderate';
      statutoryRisks.push({
        code: 'UNLAWFUL_LOCKOUT_THREAT',
        severity: 'MODERATE',
        title: 'Lockout Threat Audit',
        message: 'A commercial landlord cannot re-enter or change locks if rent is paid in full, unless there is a material breach and formal written notice with reasonable time to cure was provided under CTA s. 19(2).'
      });
    }
  }

  // Distress / Seizure of Goods (CTA ss. 39-53)
  const distraintDoctrine = {
    isAvailableToLandlord: overdue && overdueDays > 0,
    statutoryBasis: prov === 'ON' ? 'Ontario Commercial Tenancies Act, R.S.O. 1990, c. C.19, ss. 39–53' : 'Commercial Tenancy Legislation',
    criticalRule: 'Mutual Exclusivity Rule: A landlord cannot both terminate/forfeit the lease AND distrain for rent. If the landlord changes locks to terminate, the right to seize commercial goods ceases immediately.',
    tenantGoodsRights: 'Seized goods must be held for 5 days before appraisal and public sale. The landlord must account for surplus proceeds.'
  };

  if (overdue && overdueDays > 0) {
    statutoryRisks.push({
      code: 'DISTRAINT_INVENTORY_SEIZURE_RISK',
      severity: 'HIGH',
      title: 'Risk of Commercial Distress (Inventory & Equipment Seizure)',
      message: 'The landlord may enter the premises to seize equipment, inventory, and fixtures to satisfy rent arrears under CTA s. 39. Ensure you do not leave critical off-balance-sheet or leased third-party assets undocumented.'
    });
  }

  // Personal Guarantee Warnings
  if (personalGuarantee) {
    statutoryRisks.push({
      code: 'PERSONAL_GUARANTEE_EXPOSURE',
      severity: 'HIGH',
      title: 'Personal Liability Exposes Personal Assets & Savings',
      message: `You signed a personal guarantee/indemnity for $${personalGuaranteeExposureCad.toLocaleString()} CAD across the remaining ${remainingMonths} months. Incorporating a corporation does NOT shield you from this personal covenant.`
    });
  }

  // No Rent Control Warning
  statutoryRisks.push({
    code: 'NO_COMMERCIAL_RENT_CONTROL',
    severity: 'INFO',
    title: 'Absence of Commercial Rent Control',
    message: 'Unlike residential tenancies, there is NO statutory rent increase cap in Ontario or British Columbia for commercial leases. At renewal, the landlord can demand any market rent unless an explicit renewal formula (e.g., Fair Market Value arbitration) is drafted into the contract.'
  });

  // TMI Operating Cost Audit Rights
  const tmiAuditStrategy = {
    disputedAmountCad: disputedTmi,
    recommendedActions: [
      'Demand an itemized, audited statement of operating costs and actual invoices for CAM, property tax assessments, and insurance under the lease audit covenant.',
      'Audit whether the landlord included structural capital expenditures (roof replacements, HVAC replacement) which are landlord capital obligations, not recurring CAM operating expenses.',
      'Check whether administration/management fees exceed the standard 5% to 15% contractual markup ceiling.',
      'Verify that vacant unit operating expenses are not being apportioned to occupied tenants.'
    ]
  };

  // Assignment / Sublet Rights (CTA s. 23)
  const assignmentRights = {
    landlordRefused: refusedAssign,
    statutoryGuidance: prov === 'ON'
      ? 'Under Ontario CTA s. 23(1), in every lease containing a covenant against assigning or subletting without consent, there is a statutory deemed condition that consent shall not be unreasonably withheld, unless the lease expressly provides otherwise.'
      : 'Review assignment terms for reasonableness standards.',
    courtRemedy: 'If the landlord unreasonably refuses an assignment to a creditworthy newcomer buyer, the tenant can apply to the Ontario Superior Court of Justice under CTA s. 23(2) for an order approving the assignment without landlord consent.'
  };

  // Formal Pre-Litigation Commercial Dispute & TMI Audit Letter
  const commercialDemandLetter = `FORMAL NOTICE OF COMMERCIAL DISPUTE & DEMAND FOR TMI OPERATING AUDIT
Date: ${assessDate}
To: ${lName} (Landlord)
Premises: ${address}
From: ${bizName} (Tenant)

Re: Commercial Lease Agreement — Notice of Dispute and Statutory Reservation of Rights

Please be advised that ${bizName} hereby formally raises the following commercial tenancy matters regarding the above-referenced premises:

1. OPERATING COST (TMI/CAM) AUDIT DEMAND:
The tenant formally disputes the additional rent and CAM reconciliations totaling $${disputedTmi.toFixed(2)} CAD.
Pursuant to the lease agreement and commercial accounting covenants, demand is hereby made for complete, itemized copies of:
a) Municipal property tax assessments and final billing statements for the period;
b) Building insurance policies, endorsements, and actual premium invoices;
c) Itemized contractor receipts and invoices for common area maintenance;
d) Confirmation that no capital structural improvements or vacant unit shares have been allocated to the tenant.

${lockoutThreat || overdue ? `2. NOTICE REGARDING STATUTORY RE-ENTRY & DISTRAINT LIMITATIONS:
Take note that under the Ontario Commercial Tenancies Act (R.S.O. 1990, c. C.19):
- Statutory re-entry for non-payment of rent is strictly subject to the s. 18 15-day period;
- Any re-entry or forfeiture for non-rent defaults is void without prior formal written notice specifying the breach and giving reasonable time to remedy pursuant to CTA s. 19(2);
- The common-law and statutory doctrine of mutual exclusivity prohibits terminating the tenancy while simultaneously distraining goods on the premises.` : ''}

${refusedAssign ? `3. FORMAL NOTICE UNDER CTA SECTION 23 (UNREASONABLE REFUSAL OF ASSIGNMENT):
Demand is made that you provide written, reasonable grounds for refusing consent to assign or sublet the lease. Take notice that under CTA s. 23, withholding consent arbitrarily or unreasonably entitles the tenant to seek an immediate order from the Ontario Superior Court of Justice dispensing with your consent and awarding damages.` : ''}

RESERVATION OF RIGHTS:
The tenant pays all undisputed amounts under strict protest, reserving all rights, claims, and remedies at law and in equity.

Sincerely,

Authorized Representative
${bizName}`;

  return {
    asOf: assessDate,
    assessmentDate: assessDate,
    province: prov,
    tenantBusinessName: bizName,
    landlordName: lName,
    premisesAddress: address,
    squareFootage: sqft,
    grossRentPerSqFtCad,
    financialOverview: {
      baseRentMonthlyCad: baseRent,
      additionalRentMonthlyCad: addlRent,
      grossMonthlyRentCad,
      annualGrossRentCad,
      totalRemainingLeaseCommitmentCad
    },
    personalGuaranteeLiability: {
      hasPersonalGuarantee: personalGuarantee,
      personalGuaranteeExposureCad,
      remainingMonths
    },
    statutoryRisks,
    lockoutRiskLevel,
    distraintDoctrine,
    tmiAuditStrategy,
    assignmentRights,
    commercialDemandLetter
  };
}
